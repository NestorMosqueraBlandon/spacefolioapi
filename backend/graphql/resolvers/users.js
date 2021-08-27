import User from '../../models/userModel.js'
import { validateSigninInput, validateSignupInput } from '../../utils/validators.js';
import bcrypt from 'bcrypt';
import { sendConfirmationEmail, sendResetPassword } from '../../services/emailService.js';
import jwt from 'jsonwebtoken';
import config from '../../utils/config.js';

export default {

    Query: {
        async users() {
            const users = await User.find();
            return users;
        },
    },

    Mutation:{
        async signup(_, { signupInput: {email, password}}) {

            // Validate user data
            const {valid, errors} = validateSignupInput(email, password);
            if(!valid){
                throw new Error('Error', {errors});
            }

            // Sure user doesn't already exist
            const user = await User.findOne({email});
            if(user && user.activate){
                throw new Error(104)
            }else if(user && user.activate){
                const otpCode = await sendConfirmationEmail({ email, password});    
                return 200;
            }
            
            // Hast password and create an auth token
            password = bcrypt.hashSync(password, 8);
            const otpCode = await sendConfirmationEmail({ email, password});

            const newUser = new User({email, password, activateCode: otpCode});
            await newUser.save();        

            return 200;
        },

        async emailActivate(_, { otpCode }) {
            try {

                // Validate otp code
                const user = await User.findOne({ activateCode: otpCode });

                // Validate and activate user
                if (user != null) {
                    const userId = user._id;

                    await user.updateOne({activate: true});
                    const token = jwt.sign({ _id: user._id }, config.JWT_SIGNIN_KEY, {});
                    return {userId, token};
                }else{
                    return new Error(603)
                }

            } catch (err) {
                return new Error(err)
            }
        },
        
        
        async signin(_, { email, password }) {

            const {errors, valid} = validateSigninInput(email, password);

            if(!valid){
                throw new Error('Error', {errors})
            }

            const user = await User.findOne({ email });
            
            if(!user){
                errors.general = 105;
                throw new Error('Wrong credentials', {errors});
            }
            
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong credentials';
                throw new Error('Wrong credentials', {errors});
            }

            const token = jwt.sign({ _id: user._id }, config.JWT_SIGNIN_KEY, {});
            
            return{
                token,
                userId: user._id
            }
        },

        async forgotPassword(_, { email }) {
            const user = await User.findOne({email});
            console.log(user);
            if(!user){
                return 106
            }
            else{
                const token  = await sendResetPassword( user );
                await user.updateOne({token: token});
                console.log(token);
                return 200
            }
        },

        async resetPassword(_, {input}){
            const token = input.token;
            const newPassword = bcrypt.hashSync(input.newPassword, 8);

            try
            {
                if(token){
                    const verifyToken = jwt.verify(token, config.JWT_ACC_ACTIVATE);
                    console.log('Verify', verifyToken);
                    
                    const user = await User.findOne({token});
                    console.log('OldUser', user)
                    if(!user){
                        return 107
                    }else{
                        await user.updateOne({password: newPassword});
                        return 200
                    }
                }
            }catch{

                return 108
            }
        },

        async newCode(_, {email}){
            
            const user = await User.findOne({ email });
            const otpCode = await sendConfirmationEmail({ email });

            user.updateOne({activateCode: otpCode});

            return { otpCode, userId: user._id };

        },

    }
}



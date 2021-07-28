import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import lodash from 'lodash';

import { sendConfirmationEmail, sendResetPassword } from '../services/emailService.js';
import config from './config.js';
export const resolvers = {
    Query: {
        async users() {
            const users = await User.find();
            return users;
        },
    },

    Mutation: {
        async signup(_, { input }) {
            const password = bcrypt.hashSync(input.password, 8);
            const email = input.email;
            console.log(email);
            const user = await User.findOne({ email });
            if (user) {
                throw new Error("User this email already exists.");
            }

            const token = await sendConfirmationEmail({ email, password });
            console.log(token);
            return { token, user };
        },

        async emailActivate(_, { token }) {
            try {
                if (token) {
                    const { email, password } = jwt.verify(token, config.JWT_ACC_ACTIVATE);
                    const user = await User.findOne({ email });
                    if (user) {
                        return false
                    }

                    let newUser = new User({ email, password });
                    newUser.save();
                    return true;

                }
            } catch (err) {
                return false
            }
        },

        async signin(_, { input }) {
            const email = input.email;
            const user = await User.findOne({ email });

            if (!user) {
                throw new Error('This user doesnt exist, signup first')
            } else {
                if (!bcrypt.compareSync(input.password, user.password)) {
                    throw new Error("Email or password incorrect")
                }
                else {
                    const token = jwt.sign({ _id: user._id }, config.JWT_SIGNIN_KEY, {});
                    return ({
                        token,
                        user
                    });
                }
            }
        },

        async forgotPassword(_, { email }) {
            const user = await User.findOne({email});
            console.log(user);
            if(!user){
                return "User with this email does not exists."
            }
            else{
                const token  = await sendResetPassword( user );
                await user.updateOne({token: token});
                console.log(token);
                return "Email has been sent, kindly activate follow the instrutions"
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
                        return "User with this token does not exists."
                    }else{
                        await user.updateOne({password: newPassword});
                        return "Your password has been changed"
                    }
                }
            }catch{

                return "Reset password error"
            }
        }
    }

}
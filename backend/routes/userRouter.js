import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import mailgun from 'mailgun-js';
import lodash from 'lodash';
import bcrypt from 'bcrypt';
import config from '../utils/config.js';

//Mailgun configuration
const DOMAIN = 'sandbox3ceb8a67548640459e759b3626d3565a.mailgun.org';
const mg = mailgun({ apiKey: 'a5e2f6a88af9e5de3261717aa90f7df0-e31dc3cc-65a8594d', domain: DOMAIN });

const userRouter = express.Router();

userRouter.post('/seed', expressAsyncHandler(async(req, res) => {
    await User.remove({});
    res.send('Deteled');
}))

userRouter.post('/signup', expressAsyncHandler(async (req, res) => {
    let { email, password } = req.body;
    password = bcrypt.hashSync(password, 8);

    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }
        const token = jwt.sign({ email, password }, config.JWT_ACC_ACTIVATE, { expiresIn: '20m' });
        const data = {
            from: 'noreply@spacefolio.com',
            to: email,
            subject: 'Account Activation Link',
            html: 
            `
                <h2>Please click on given link to activate you account</h2>
                <p>${config.CLIENT_URL}/autentication/activate/${token}</p>
            `
        };
        mg.messages().send(data, function (error, body) {
            if (error) {
                return res.json({
                    message: error.message
                })
            }

            return res.json({ message: 'Email has been sent, kindly activate your account' });
        });
    })
}))

userRouter.post('/email-activate', expressAsyncHandler(async (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(token, config.JWT_ACC_ACTIVATE, (err, decodeedToken) => {
            if (err) {
                return res.status(400).json({ error: 'Incorrect o Expired link' });
            }
            const { email, password } = decodeedToken;

            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    return res.status(400).json({ error: 'User with this email already exists.' });
                }
                let newUser = new User({ email, password });
                newUser.save((err, success) => {
                    if (err) {
                        console.log("Error in signup while account activation: ", err);
                        return res.status(400).json({ error: 'Error activating account' });
                    }
                    res.json({
                        message: 'Sugnup success!',
                    });
                });
            });
        });
    } else {
        return res.json({ error: "Something went wrong!!!" })
    }
}));

userRouter.post('/signin',  expressAsyncHandler(async(req,res) => {
    const {email, password} = req.body;

    User.findOne({email}).exec((err, user) => {
        if(err){
            return res.setMaxListeners(400).json({
                error: "This user doesn't exist, signup first"
            });
        }

        if(!bcrypt.compareSync(password, user.password)){
            return res.status(400).json({
                error: "Email or password incorrect"
            });
        }

        const token = jwt.sign({_id: user._id }, config.JWT_SIGNIN_KEY, {});
        const {_id, email} = user;

        res.json({
            token,
            user:{_id, email}
        });
    });
}));

userRouter.post('/forgot-password', expressAsyncHandler(async(req,res) => {
    const {email} = req.body;

    User.findOne({email}, (err,user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User with this email does not exists.' });
        }

        const token = jwt.sign({ _id: user._id }, config.JWT_ACC_ACTIVATE, { expiresIn: '20m' });
        const data = {
            from: 'noreply@spacefolio.com',
            to: email,
            subject: 'Reset Password Link',
            html: 
            `
                <h2>Please click on given link to reset your password</h2>
                <p>${config.CLIENT_URL}/resetpassword/${token}</p>
            `
        };
        	
        return user.updateOne({resetLink: token}, (err, success) => {
            if (err) {
                return res.status(400).json({ error: 'Reset password link error' });
            }else{
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return res.json({
                            message: error.message
                        });
                    }
                    return res.json({ message: 'Email has been sent, kindly activate follow the instrutions' });
                });
            }
        });
    });
}));

userRouter.post('/reset-password', expressAsyncHandler(async(req,res) => {
    let {resetLink, newPass} = req.body;
    newPass = bcrypt.hashSync(newPass, 8);

    if(resetLink)
    {
        jwt.verify(resetLink, config.RESET_PASSWORD_KEY, (err, decodeedToken) => {
            console.log(err);
            if(err){
                return res.status(401).json({error: "Incorrect token or it is expired"});
            }

            User.findOne({resetLink}, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({ error: 'User with this token does not exists.'});
                }

                const obj = {
                    password: newPass
                }

                user = lodash.extend(user, obj);
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({ error: 'Reset password error' });
                    }else{
                        return res.json({ message: 'Your password has been changed' });
                    }
                });
            });
        });

    }else
    {
        return res.status(400).json({ error: 'Authentication error!' });
    }
}));


export default userRouter;

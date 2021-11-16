import jwt from 'jsonwebtoken';
import mailgun from 'mailgun-js';
import config from '../utils/config.js';
import messagebird from 'messagebird';
import otpGenerator from 'otp-generator';
import { getMultiTokensBalance } from '@tatumio/tatum';

//Mailgun configuration
const DOMAIN = 'sandbox3ceb8a67548640459e759b3626d3565a.mailgun.org';
const mg = mailgun({ apiKey: 'a5e2f6a88af9e5de3261717aa90f7df0-e31dc3cc-65a8594d', domain: DOMAIN });


export const sendConfirmationEmail = async (user) => {
    const email = user.email;
    const password = user.password;

    const otpCode = otpGenerator.generate(6, {alphabets: false, upperCase: false, specialChars: false});
    
    // const token = await jwt.sign({email, password }, config.JWT_ACC_ACTIVATE, { expiresIn: '20m' });
    const token = otpCode;

    const url =  `${config.CLIENT_URL}/autentication/activate/${token}`;

    const data = {
        from: 'noreply@spacefolio.com',
        to: user.email,
        subject: 'Account Activation Code',
        html: 
        `
            <h2>Your activation code is</h2>
            <p>${otpCode}</p>
        `
    };

    mg.messages().send(data, function (error, body) {
        if (error) {
            console.log(error);
        //    throw new Error("Send email error.");
        }

        return otpCode;
    });
    return otpCode;
} 

export const sendResetPassword = async (user) => {
    const _id = user.id;
    const email = user.email;

    const otpCode = otpGenerator.generate(6, {alphabets: false, upperCase: false, specialChars: false});
    // const token = await jwt.sign({_id}, config.JWT_ACC_ACTIVATE, { expiresIn: '20m' });

    const token = otpCode;
    const url =  `${config.CLIENT_URL}/resetpassword/${token}`;

    console.log(email);
    const data = {
        from: 'noreply@spacefolio.com',
        to: email,
        subject: 'Reset Password Link',
        html: 
        `
            <h2>your reset code is</h2>
            <p>${token}</p>
        `
    };

    mg.messages().send(data, function (error, body) {
        if (error) {
            return 'Reset password link error'
        }

        return token;
    });
    return token;
} 
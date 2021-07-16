import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import mailgun from 'mailgun-js';

//Mailgun configuration
const DOMAIN = 'sandbox3ceb8a67548640459e759b3626d3565a.mailgun.org';
const mg = mailgun({ apiKey: 'a5e2f6a88af9e5de3261717aa90f7df0-e31dc3cc-65a8594d', domain: DOMAIN });

const userRouter = express.Router();

userRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    await User.remove({});
    // const createUser = await User.insertMany(data.users);
    // res.send({createUser});
    res.send('Hola');
}));

userRouter.post('/signup', expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        const token = jwt.sign({ email, password }, process.env.JWT_ACC_ACTIVATE, { expiresIn: '20m' });
        const data = {
            from: 'noreply@spacefolio.com',
            to: email,
            subject: 'Account Activation Link',
            html: 
            `
                <h2>Please click on given link to activate you account</h2>
                <p>${process.env.CLIENT_URL}/autentication/activate/${token}</p>
            `
        };
        mg.messages().send(data, function (error, body) {
            if (error) {
                return res.json({
                    message: error.message
                })
            }

            return res.json({ message: 'Email has been sent, kindly activate your account' })
        });
    })
}))

userRouter.post('/email-activate', expressAsyncHandler(async (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function (err, decodeedToken) {
            if (err) {
                return res.status(400).json({ error: 'Incorrect o Expired link' })
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
                    })
                })

            })
        })
    } else {
        return res.json({ error: "Something went wrong!!!" })
    }

}))


export default userRouter;

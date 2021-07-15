import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';

const userRouter = express.Router();

userRouter.get('/seed', expressAsyncHandler (async(req, res) => {
    // await User.remove({});
    const createUser = await User.insertMany(data.users);
    res.send({createUser});
}));

userRouter.post('/signup', expressAsyncHandler(async(req,res) => {
    console.log(req.body);
    const {email, password} = req.body;
    User.findOne({email}).exec((err, user) => {
        if(user){
            return res.status(400).json({error: 'User with this email already exists.'});
        }

        let newUser = new User({email, password});
        newUser.save((err, success) => {
            if(err){
                console.log("Error in signup: ", err);
                return res.status(400).json({error:err});
            }
            res.json({
                message: 'Sugnup success!',
            })
        })
    })
}))

export default userRouter;

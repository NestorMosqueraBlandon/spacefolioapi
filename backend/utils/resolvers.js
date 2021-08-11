import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import CoinGecko from 'coingecko-api';
const CoinGeckoClient = new CoinGecko();

import { sendConfirmationEmail, sendResetPassword } from '../services/emailService.js';
import config from './config.js';

import BuyManualTransaction from '../models/buyManualTransaction.js';
import SellManualTransaction from '../models/sellManualTransaction.js';
import TransferTransaction from '../models/transferTransaction.js';


export const resolvers = {
    Query: {
        async users() {
            const users = await User.find();
            return users;
        },
        
        // TRANSACTION
        async coinList(){
            let data = await CoinGeckoClient.coins.all();
            let e = null;
            for(e in data){
                //
            }
            return data[e];
        },
        async exchangeList(){
            const exchange = await CoinGeckoClient.exchanges.all();
            let e = null;
            for(e in exchange){
                //
            }
            return exchange[e];
        },

        async getSellTransaction(_, {userId}){
            const transaction = await SellManualTransaction.find({userId})
            console.log(transaction)
            return transaction;
        }
    },
    
    Mutation: {
        async signup(_, { input }) {
            const email = input.email;
            const password = bcrypt.hashSync(input.password, 8);
            
            const user = await User.findOne({ email });
            if (user) {
                throw new Error("User this email already exists.");
            }
        
            const token = await sendConfirmationEmail({ email, password });

            let newUser = new User({ email, password,  activateCode: token});
            console.log("newUser", newUser)
            newUser.save();

            return { token };
        },

        async emailActivate(_, { otpCode }) {
            try {
                const activateCode = otpCode;
                const user = await User.findOne({ activateCode });
                const userId = user._id; 
                if (user) {
                    await user.updateOne({activate: true});
                    const token = jwt.sign({ _id: user._id }, config.JWT_SIGNIN_KEY, {});
                    return {userId, token};
                }
            } catch (err) {
                return false
            }
        },
        
        async signin(_, { input }) {
            const email = input.email;
            const user = await User.findOne({ email });
            console.log(user);
            const userId = user._id;
            if (!user ) {
                throw new Error('This user doesnt exist, signup first')
            } else {
                if (!bcrypt.compareSync(input.password, user.password)) {
                    throw new Error("Email or password incorrect")
                }
                else {
                    console.log(user.activete)
                    if(user){   
                        const token = jwt.sign({ _id: user._id }, config.JWT_SIGNIN_KEY, {});
                        return ({
                            token,
                            userId
                        });
                    }else{
                        throw new Error("User don't activate")
                    }
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
        },

        // TRANSACTION
        async addManualTransaction(_, {input}){

            try {
                const {userId, coinId, quantity, buyPrice, type} = input;

                if(type === 'sell'){
                    const newTransaction = new SellManualTransaction({ userId, coinId, quantity, buyPrice, type });
                    await newTransaction.save();
                    return "Sell Transaction add successfully" 
                }else
                {
                    const newTransaction = new BuyManualTransaction({ userId, coinId, quantity, buyPrice, type });
                    await newTransaction.save();
                    return "Buy Transaction add successfully" 
                }
                
            }catch{
                return "Manual Transaction Error"
            }
        },

        async transferTransaction(_, {input}){
            const {userId, from, to, quantity} = input;

            const user = await User.findOne({_id: userId});
            console.log(user)

            if(from === 'myexchange' || from === 'mywallet'){
                const newBalance = user.balence - quantity;
                await user.updateOne({balence: newBalance});
                const transfer = new TransferTransaction({from, to, quantity});
                await transfer.save();
            }else{
                const newBalance = parseFloat(user.balence) + parseFloat(quantity);
                await user.updateOne({balence: parseFloat(newBalance)});
                const transfer = new TransferTransaction({from, to, quantity});
                await transfer.save();
                return "Transfer Transaction successfully"
            }
        }
    }
}
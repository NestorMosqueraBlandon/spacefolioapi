import CoinGecko from "coingecko-api";

import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from "../../utils/checkAuth.js";

const CoinGeckoClient = new CoinGecko();
export default {
    Query:{

        async coinList(){
            try{
                const data = await CoinGeckoClient.coins.all();
                let e = null;
                for(e in data){
                    //
                }
                return data[e];
            }catch(err){
                throw new Error(err);
            }
        },
        
        async exchangeList(){
            try{
                const exchange = await CoinGeckoClient.exchanges.all();
                let e = null;
                for(e in exchange){
                    //
                }
                return exchange[e];
            }catch(err){
                throw new Error(err);
            }
        },

        async getSellTransaction(_, {userId}){
            try{
                const transaction = await SellManualTransaction.find({userId})
                return transaction;
            }catch(err){
                throw new Error(err);
            }
        },

        async getBuyTransaction(_, {userId}){
            try{
                const transaction = await BuyManualTransaction.find({userId})
                return transaction;
            }catch(err){
                throw new Error(err);
            }
        },

        async getTransferTransaction(_, {userId}){
            try{
                const transaction = await TransferTransaction.find({userId})
                return transaction;
            }catch(err){
                throw new Error(err);
            }
        },
    },

    Mutation:{
        async addManualTransaction(_, {input}, context){
            try {
                const user = checkAuth(context);
                const  {coinId, quantity, buyPrice, type} = input;
                console.log(quantity);
                if(type === 'sell'){
                    const newTransaction = new SellManualTransaction({ userId: user.id, coinId, quantity, buyPrice, type });
                    await newTransaction.save();
                    return "Sell Transaction add successfully" 
                }else
                {
                    const newTransaction = new BuyManualTransaction({userId: user.id, coinId, quantity, buyPrice, type });
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
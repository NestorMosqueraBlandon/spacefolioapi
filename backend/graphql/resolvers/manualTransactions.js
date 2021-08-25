import CoinGecko from "coingecko-api";

import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from "../../utils/checkAuth.js";
import User from '../../models/userModel.js'
import Portfolio from "../../models/portfolioModel.js";

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
                console.log(data[e])
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
            const user = checkAuth(context);
            const  {portfolioId, coinId, quantity, buyPrice, model} = input;
            const portfolio = await Portfolio.findById(portfolioId);

            if(portfolio){
                if(model == 0){
                    portfolio.sellTransactions.unshift({
                        coinId, 
                        quantity, 
                        buyPrice, 
                        model, 
                        createdAt: new Date().toISOString()
                    });
                    
                    await portfolio.save();
                    return 200 
                }else{

                    portfolio.buyTransactions.unshift({
                        coinId, 
                        quantity, 
                        buyPrice, 
                        model, 
                        createdAt: new Date().toISOString()
                    });
                    
                    await portfolio.save();
                    return 200
                }
            }else{
                throw new Error(701)
            }
        },

        async transferTransaction(_, {input}, context){
            const user = checkAuth(context);
            const {from, to, quantity, portfolioId} = input;

            const portfolio = await Portfolio.findById(portfolioId);

            if(portfolio){
                if(from === "2" || from === "3"){
                    
                    portfolio.transferTransactions.unshift({
                        from, 
                        to, 
                        quantity,  
                        createdAt: new Date().toISOString()
                    });
                    
                    portfolio.balance = parseInt(portfolio.balance) - parseInt(quantity);
                    
                    await portfolio.save();
                    return 200
                }else{
                    
                    portfolio.transferTransactions.unshift({
                        from, 
                        to, 
                        quantity,  
                        createdAt: new Date().toISOString()
                    });
                    
                    portfolio.balance =  parseInt(portfolio.balance) + parseInt(quantity);
                    await portfolio.save();
                    return 200
                }
            }else{
                throw new Error(701)
            }
        },

        async deleteBuySellTransaction(_, { portfolioId, transactionId }, context) {
            const user = checkAuth(context);
      
            const portfolio = await Portfolio.findById(portfolioId);
      
            if (portfolio) {
              const transactionIndex = portfolio.buyTransactions.findIndex((c) => c.id === transactionId);
      
             
                portfolio.buyTransactions.splice(transactionIndex, 1);
                await portfolio.save();
                return portfolio;
             
            } else {
              throw new Error(701);
            }
          }
        }
    }
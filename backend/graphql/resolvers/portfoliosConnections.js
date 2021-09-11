import Portfolio from "../../models/portfolioModel.js";
import checkAuth from "../../utils/checkAuth.js";
import Tatum from '@tatumio/tatum';

const {btcGetBalance, btcGetTransaction, btcGetTxForAccount} = Tatum;


export default {
  
  Query: {
    async getWalletBalance(_, {address}, context) {
        const user = checkAuth(context);
        const balance = await btcGetBalance(address);
        let e = null;
        for(e in balance){
            //
        }
  
        console.log(balance[e])
        return balance[e];
      },
      
      async getTransaction(_, {address}, context) {
        const user = checkAuth(context);
  
        try{
          const transaction = await btcGetTransaction(address)
          return transaction;
        }
        catch(err){
          console.log(err)
        }
        
      },
      async getTransactions(_, {account}, context) {
        const user = checkAuth(context);
        try{
          const transactions = await btcGetTxForAccount(account);
          return transactions;
  
        }catch(err){
          console.log(err)
        }
       },
     },

  Mutation: {
        async addWalletConnection(_, {name, portfolioId, publicAddress}, context){
            const user = checkAuth(context);
            
            try{
                const portfolio = await Portfolio.findById(portfolioId)
                if(portfolio){
                    await portfolio.wallets.unshift({
                        name, address: publicAddress
                    });

                    await portfolio.save();
                    return 200;
                }else{
                    throw new Error(701)
                }
                
            }catch(err){
                console.log(err)
            }
        }
    }
  }

import Portfolio from "../../models/portfolioModel.js";
import checkAuth from "../../utils/checkAuth.js";
import Tatum from '@tatumio/tatum';
import { btcGetBalance, btcGetTransaction, btcGetTxForAccount } from '@tatumio/tatum';



export default {
  
  Query: {
    async getPortfolios(_, {userId}, context) {
      const user = checkAuth(context);
      try {
        const portfolios = await Portfolio.find({user: userId}).sort({ createdAt: -1});
        return portfolios;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPortfolio(_, { portfolioId, userId }, context) {
      const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          if(userId === portfolio.user){
            return portfolio;
          }else{
            return 105
          }
        } else {
          throw new Error(701);
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    // 1MzxJi4TsiyChnwvSTvWQgS5dyegnKjy9B
    // CONNECTION
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
    async createPortfolio(_, { input: { name, dfCurrency } }, context) {
      const user = checkAuth(context);
      console.log(user)
      try {
        const newPortfolio = new Portfolio({
          name,
          dfCurrency,
          user: user._id
        })

        await newPortfolio.save();

        return 202
      } catch (err) {
        return err
      }
    },

    async deletePortfolio(_, { portfolioId }, context) {
      const user = checkAuth(context);

      try {
        if (user) {
          const portfolio = await Portfolio.findById(portfolioId);
          await portfolio.delete();
          return 202
        }
      }
      catch (err) {
        throw new Error(err);
      }
    },

    // PORTFOLIOS CONNECTION




    

    }
  }

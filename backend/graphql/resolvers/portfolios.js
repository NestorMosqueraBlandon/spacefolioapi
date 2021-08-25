import Portfolio from "../../models/portfolioModel.js";

import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from "../../utils/checkAuth.js";

export default{

    Query:{
        async getPortfolios(){
            try {
                const portfolios = await Portfolio.find().sort({ createdAt: -1 });
                return portfolios;
              } catch (err) {
                throw new Error(err);
              }
        },
        async getPortfolio(_, {portfolioId}) {
            try {
                const portfolio = await Portfolio.findById(portfolioId);
                if (portfolio) {
                  return portfolio;
                } else {
                  throw new Error(701);
                }
              } catch (err) {
                throw new Error(err);
              }
            }
    },

    Mutation:{
        async createPortfolio(_,  {input: {name, dfCurrency}}, context){
            const user = checkAuth(context);
            try{
                const newPortfolio = new Portfolio({
                    name,
                    dfCurrency,
                    user: user.id
                })

                await newPortfolio.save();

                return 202
            }catch(err){
                return err
            }
        },

        async deletePortfolio(_, {portfolioId}, context){
          const user = checkAuth(context);

          try{
            if(user){
              const portfolio = await Portfolio.findById(portfolioId);
              await portfolio.delete();
              return 202
            }
          }
          catch(err){
            throw new Error(err);
          }
        }
    }
}
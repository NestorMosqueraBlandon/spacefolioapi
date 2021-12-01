import checkAuth from '../../utils/checkAuth.js';
import User from "../../models/userModel.js"

export default {
  Query: {
    
    async getPortfolio(_, { portfolioId }, context) {
      const user = checkAuth(context);
      try {
        const userData = await User.findById(user._id)
        if (!userData) {
          throw new Error(105)
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)
 
        const portfolio = userData.portfolios[portfolioIde];
        if (portfolio) {
            return portfolio;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        throw new Error(err);
      }
    },

   
  },

  Mutation: {
    async createPortfolio(
      _,
      { input: { name, dfCurrency, initialValue } },
      context
    ) {
      const user = checkAuth(context);
      try {
        const userData = await User.findById(user._id)  
        console.log(userData)
        
        if(!userData){
          throw new Error(701)
        }

        await userData.portfolios.unshift({
          name,
          dfCurrency,
          balance: initialValue,
          user: user._id,
        });

        const portfolioCreated = await userData.save();

        // return portfolioCreated._id;
      } catch (err) {
        return err;
      }
    },

    async updatePortfolio(_, {portfolioId, name, coinBlacklist}){
      const portfolio = await Portfolio.findById(portfolioId);

      if(portfolio)
        try{
          portfolio.name = name;

          if(coinBlacklist)
          {
            await portfolio.coinBlacklist.unshift({
              coinBlacklist,
            });
          }
          await portfolio.save();
          return 200;
        }catch(err){
          throw new Error(err);
        }
      }
    },

    async deleteCoinBlackList(
      _,
      { portfolioId, coinBlacklistId },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          const coinIndex = portfolio.coinBlacklist.findIndex((w) => w.id === coinBlacklistId);

          portfolio.coinBlacklist.splice(coinIndex, 1)

          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deletePortfolio(_, { portfolioId }, context) {
      const user = checkAuth(context);

      try {
        if (user) {
          const portfolio = await Portfolio.findById(portfolioId);
          await portfolio.delete();
          return 202;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
};

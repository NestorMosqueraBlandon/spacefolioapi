import Portfolio from '../../models/portfolioModel.js';
import checkAuth from '../../utils/checkAuth.js';

export default {
  Query: {
    
    async getPortfolios(_, { userId }, context) {
      const user = checkAuth(context);
      try {
        const portfolios = await Portfolio.find({
          user: userId,
        }).sort({
          createdAt: -1,
        });
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
          if (userId === portfolio.user) {
            return portfolio;
          } else {
            return 105;
          }
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
      // console.log(user);
      try {
        const newPortfolio = new Portfolio({
          name,
          dfCurrency,
          balance: initialValue,
          user: user._id,
        });

        const portfolioCreated = await newPortfolio.save();

        return portfolioCreated._id;
      } catch (err) {
        return err;
      }
    },

    async updatePortfolio(_, {portfolioId, name}){
      const portfolio = await Portfolio.findById(portfolioId);

      if(portfolio)
        try{
          portfolio.name = name;
          await portfolio.save();
          return 200;
        }catch(err){
          throw new Error(err);
        }
      }
    },

    async addCoinBlacklist(_, {portfolioId, coinBlacklist}){
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          await portfolio.coinBlacklist.unshift({
            coinBlacklist,
          });
          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        throw new Error(701);
      }
    },

    async deleteCoinBlackList(
      _,
      { portfolioId, coinBlacklistId },
      context
    ) {
      // const user = checkAuth(context);

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

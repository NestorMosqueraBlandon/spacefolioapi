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
      console.log(user);
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
  },
};

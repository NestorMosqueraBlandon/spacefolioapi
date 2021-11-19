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
      // const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          if (userId == portfolio.user) {
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

    async getExchangeOrWalletData(_, { portfolioId, userId, exchangeOrWalletId, type }, context) {
      // const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {

          if (userId == portfolio.user) {
            if(type == 0){
              const walletIndex = portfolio.wallets.findIndex((w) => w.id === exchangeOrWalletId);
              return portfolio.wallets[walletIndex]              
            }
            if(type == 1){
              const exchangeIndex = portfolio.exchanges.findIndex((w) => w.id === exchangeOrWalletId);
              return portfolio.exchanges[exchangeIndex]
            }
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

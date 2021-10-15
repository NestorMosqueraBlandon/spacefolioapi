import Portfolio from "../../models/portfolioModel.js"
import checkAuth from '../../utils/checkAuth.js';

export default {

  Query: {
    async getWalletsConnection(_, { portfolioId }, context) {
      const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        return portfolio.wallets;
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
    async addWalletConnection(
      _,
      { name, portfolioId, publicAddress },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          await portfolio.wallets.unshift({
            name,
            address: publicAddress,
          });

          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async updateWalletConnection(
      _,
      { name, portfolioId, publicAddress },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          await portfolio.wallets.unshift({
            name,
            address: publicAddress,
          });

          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deleteWalletConnection(
      _,
      { portfolioId, walletId},
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          portfolio.wallets = portfolio.wallets.filter((w) => w.id != walletId);

          console.log(portfolio.wallets)

          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async addExchangeConnection(
      _,
      { input: { name, portfolioId, key, secret } },
      context
    ) {
      console.log('Entro');
      const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          await portfolio.exchanges.unshift({
            name,
            apiKey: key,
            apiSecret: secret,
          });
          await portfolio.save();

          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
        throw new Error(701);
      }
    },
  },
};

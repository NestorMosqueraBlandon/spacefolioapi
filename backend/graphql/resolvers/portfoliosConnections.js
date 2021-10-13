import Portfolio from "../../models/portfolioModel.js"

export default {

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

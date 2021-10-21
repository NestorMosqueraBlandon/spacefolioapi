import CoinGecko from 'coingecko-api';

import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from '../../utils/checkAuth.js';
import User from '../../models/userModel.js';
import Portfolio from '../../models/portfolioModel.js';
import Wallet from '../../models/walletModel.js';

const CoinGeckoClient = new CoinGecko();
export default {
  Query: {
    async coinList() {
      try {
        const data = await CoinGeckoClient.coins.markets();
                  
        const newData = data.data
        console.log(newData)
        return newData

      } catch (err) {
        throw new Error(err);
      }
    },

    async coinMarket(_, {coinId, day}) {
      try {
        
        // id
        // symbol
        // name
        // image
        // currenct print
        // marketcap
        // marketcaprank
        // totalvolume
        // heigth 24h
        // low24h
        // change price
        // changeprice eprcenage
        // meketcap change 24h
        // markecapchange perentage
        const data = await CoinGeckoClient.coins.fetch(coinId, {});

        let dataMarket = await CoinGeckoClient.coins.fetchMarketChart(coinId, day);
        const coinData = data.data

        
        console.log({coin: coinData, market:dataMarket.data})
        return {coin: coinData, market: dataMarket.data}
        // return dataMarket

      } catch (err) {
        throw new Error(err);
      }
    },


    async exchangeList() {
      try {
        const exchange = await CoinGeckoClient.exchanges.all();

        console.log("hola mundo")
        console.log(exchange)
        let e = null;
        for (e in exchange) {
          //
        }
        return exchange[e];
      } catch (err) {
        throw new Error(err);
      }
    },

    async walletsList() {
      try {
        const wallets = await Wallet.find();

        return wallets;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getSellTransaction(_, { userId }) {
      try {
        const transaction = await SellManualTransaction.find({ userId });
        return transaction;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getBuyTransaction(_, { userId }) {
      try {
        const transaction = await BuyManualTransaction.find({ userId });
        return transaction;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getTransferTransaction(_, { userId }) {
      try {
        const transaction = await TransferTransaction.find({ userId });
        return transaction;
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async addManualTransaction(_, { input }, context) {
      const user = checkAuth(context);
      const {
        portfolioId,
        coinId,
        quantity,
        buyPriceValue,
        buyPriceType,
        feeType,
        feeValue,
        model,
      } = input;
      const portfolio = await Portfolio.findById(portfolioId);

      if (portfolio) {
        if (model == 0) {
          portfolio.sellTransactions.unshift({
            coinId,
            quantity,
            buyPrice: { buyPriceType, buyPriceValue },
            feeId: { feeType, feeValue },
            model,
            createdAt: new Date().toISOString(),
          });

          await portfolio.save();
          return 200;
        } else {
          portfolio.buyTransactions.unshift({
            coinId,
            quantity,
            buyPrice: { buyPriceType, buyPriceValue },
            feeId: { feeType, feeValue },
            model,
            createdAt: new Date().toISOString(),
          });

          await portfolio.save();
          return 200;
        }
      } else {
        throw new Error(701);
      }
    },

    async transferTransaction(_, { input }, context) {
      const user = checkAuth(context);
      const { from, to, quantity, portfolioId } = input;

      const portfolio = await Portfolio.findById(portfolioId);

      if (portfolio) {
        if (from === '2' || from === '3') {
          portfolio.transferTransactions.unshift({
            from,
            to,
            quantity,
            createdAt: new Date().toISOString(),
          });

          portfolio.balance = parseInt(portfolio.balance) - parseInt(quantity);

          await portfolio.save();
          return 200;
        } else {
          portfolio.transferTransactions.unshift({
            from,
            to,
            quantity,
            createdAt: new Date().toISOString(),
          });

          portfolio.balance = parseInt(portfolio.balance) + parseInt(quantity);
          await portfolio.save();
          return 200;
        }
      } else {
        throw new Error(701);
      }
    },

    async deleteBuySellTransaction(_, { portfolioId, transactionId }, context) {
      const user = checkAuth(context);

      const portfolio = await Portfolio.findById(portfolioId);

      if (portfolio) {
        const transactionIndex = portfolio.buyTransactions.findIndex(
          (c) => c.id === transactionId
        );

        portfolio.buyTransactions.splice(transactionIndex, 1);
        await portfolio.save();
        return portfolio;
      } else {
        throw new Error(701);
      }
    },
    async createWallet(
      _,
      { input: { name, image } },
    ) {
      try {
        const newWallet = new Wallet({
          name
        });

        const walletCreated = await newWallet.save();

        return 200;
      } catch (err) {
        return err;
      }
    },

  },
};

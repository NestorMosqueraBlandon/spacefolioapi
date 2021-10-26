import CoinGecko from 'coingecko-api';
import CoinGeckoV3 from 'coingecko-api-v3';
import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from '../../utils/checkAuth.js';
import User from '../../models/userModel.js';
import Portfolio from '../../models/portfolioModel.js';
import Wallet from '../../models/walletModel.js';
import * as timeago from "timeago.js"

const Client = CoinGeckoV3.CoinGeckoClient;

const client = new Client({
  timeout: 10000,
  autoRetry: true,
});

const CoinGeckoClient = new CoinGecko();
export default {
  Query: {
    async coinList(_, {page}) {
      try {
        const data = await CoinGeckoClient.coins.markets({page: page? page: 1, per_page: 30});
                  
        const newData = data.data
        console.log(newData)
        return newData

      } catch (err) {
        throw new Error(err);
      }
    },

    async coinMarket(_, {coinId}) {

      console.log(coinId)
      try {
        
        const data = await CoinGeckoClient.coins.fetch( coinId, {});

        let dataMarketall = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: "max"});
        let dataMarket24h = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 1});
        let dataMarket7d = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 7});
        let dataMarket1m = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 30});
        let dataMarket1y = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 365});

        const coinData = data.data
        
        console.log(coinData.market_data)
        return {coin: {...coinData, market_data: {...coinData.market_data, market_cap_change_percentage_24h_in_currency: coinData.market_data.market_cap_change_percentage_24h_in_currency.usd, current_price: coinData.market_data.current_price.usd,  low_price_24h: coinData.market_data.low_24h.usd, high_price_24h: coinData.market_data.high_24h.usd }, image: coinData.image.large  }, 
                marketall: JSON.stringify(dataMarketall.data.prices), 
                market24h: JSON.stringify(dataMarket24h.data.prices),
                market7d: JSON.stringify(dataMarket7d.data.prices),
                market1m: JSON.stringify(dataMarket1m.data.prices),
                market1y: JSON.stringify(dataMarket1y.data.prices),
                marketall: JSON.stringify(dataMarketall.data.prices),
              
              }

      } catch (err) {
        throw new Error(err);
      }
    },


    async exchangeList(_, {page}) {
      try {
        const exchangev3 = await client.exchanges({page:page? page: 1, per_page:30})

        return exchangev3;
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

import CoinGecko from 'coingecko-api';
import CoinGeckoV3 from 'coingecko-api-v3';
import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from '../../utils/checkAuth.js';
import Wallet from '../../models/walletModel.js';
import Exchange from '../../models/exchangeModel.js';
import Enumerable from 'linq'
import rp from "request-promise"

const { from } = Enumerable;

const Client = CoinGeckoV3.CoinGeckoClient;

const client = new Client({
  timeout: 10000,
  autoRetry: true,
});

const CoinGeckoClient = new CoinGecko();

const convertValue = async (amount, symbol) => {

  const requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/tools/price-conversion',
    qs: {
      "amount": amount,
      "symbol": symbol,
      "convert": "USD"
    },
    headers: {
      'X-CMC_PRO_API_KEY': '91f97ef8-bc4e-40f9-9d20-7e7e67af1776'
    },
    json: true,
    gzip: true
  };

  try {
    const { data } = await rp(requestOptions);
    return data.quote["USD"].price
  }
  catch (err) {
    console.log(err)
  }
}

export default {
  Query: {

    async coinGlobal(_, { }) {
      const { data } = await CoinGeckoClient.global()
      const { data: { active_cryptocurrencies, markets, total_market_cap, total_volume, market_cap_change_percentage_24h_usd } } = data

      console.log(data.data)

      return { active_cryptocurrencies, markets, total_market_cap: total_market_cap.usd, total_volume: total_volume.usd, market_cap_change_percentage_24h_usd }
    },

    async coinList(_, { page, search, order }) {
      try {

        if (search != "") {
          const { data } = await CoinGeckoClient.coins.list();

          const newData = await data.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.symbol.toLowerCase().includes(search.toLowerCase()))

          let dataMarket = [];
          if (newData.length > 100) {

            for (let i = 0; i < 100; i++) {
              console.log(i + "-" + newData[i + ((page - 1) * 100)].id)
              dataMarket.push(newData[i + ((page - 1) * 100)].id)
            }
          } else {
            for (let i = 0; i < newData.length; i++) {
              console.log(i + "-" + newData[i + ((page - 1) * 100)].id)
              dataMarket.push(newData[i + ((page - 1) * 100)].id)
            }
          }

          console.log(dataMarket)
          const { data: marketData } = await CoinGeckoClient.coins.markets({ ids: dataMarket, per_page: 100 });
          return marketData
        } else {
          const { data } = await CoinGeckoClient.coins.markets({ page: page ? page : 1, per_page: 50, order: order });
          return data
        }

      } catch (err) {
        throw new Error(err);
      }
    },

    async coinMarket(_, { coinId }) {

      try {

        const data = await CoinGeckoClient.coins.fetch(coinId, {});

        let dataMarketall = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: "max" });
        let dataMarket24h = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 1 });
        let dataMarket7d = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 7 });
        let dataMarket1m = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 30 });
        let dataMarket1y = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 365 });

        const coinData = data.data

        return {
          coin: { ...coinData, market_data: { ...coinData.market_data, market_cap_change_24h_in_currency: coinData.market_data.market_cap_change_24h_in_currency.usd, market_cap_change_percentage_24h_in_currency: coinData.market_data.market_cap_change_percentage_24h_in_currency.usd, current_price: coinData.market_data.current_price.usd, low_price_24h: coinData.market_data.low_24h.usd, high_price_24h: coinData.market_data.high_24h.usd }, image: coinData.image.large },
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

    async exchangeList(_, { page, search }) {
      try {

        if (search != "") {
          const dataList = await client.exchangeList();

          const newData = await dataList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
          let dataMarket = [];

          for (let i = 1; i < Math.round(dataList.length / 250); i++) {
            if (dataMarket.length == newData.length) {
              break;
            }

            const data = await client.exchanges({ page: i, per_page: 249 })
            newData.map((nd) => {
              dataMarket = [...dataMarket, ...data.filter((value) => value.id == nd.id)]
            })
          }

          return dataMarket
        } else {
          const exchangev3 = await client.exchanges({ page: page ? page : 1, per_page: 50 })
          return exchangev3;
        }

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

    async exchangeListAvailable() {
      try {
        const exchanges = await Exchange.find();

        return exchanges;
      } catch (err) {
        throw new Error(err);
      }
    },
  }
};

import CoinGecko from 'coingecko-api';
import CoinGeckoV3 from 'coingecko-api-v3';
import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from '../../utils/checkAuth.js';
import Wallet from '../../models/walletModel.js';
import Exchange from '../../models/exchangeModel.js';

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

        const {data} = await CoinGeckoClient.coins.markets({page: page? page: 1, per_page: 50});       
        return data

      } catch (err) {
        throw new Error(err);
      }
    },

    async coinListSearch(_, {page, search})
    {
      const {data} = await CoinGeckoClient.coins.list();
      const newData = await data.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
      const {data: marketData} = await CoinGeckoClient.coins.markets({ids: newData.map((d) => d.id), page: page? page: 2, per_page: 100});   

      return marketData
    },
    
    async coinMarket(_, {coinId}) {

      try {
        
        const data = await CoinGeckoClient.coins.fetch( coinId, {});

        let dataMarketall = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: "max"});
        let dataMarket24h = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 1});
        let dataMarket7d = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 7});
        let dataMarket1m = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 30});
        let dataMarket1y = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 365});

        const coinData = data.data
        
        return {coin: {...coinData, market_data: {...coinData.market_data, market_cap_change_24h_in_currency: coinData.market_data.market_cap_change_24h_in_currency.usd, market_cap_change_percentage_24h_in_currency: coinData.market_data.market_cap_change_percentage_24h_in_currency.usd, current_price: coinData.market_data.current_price.usd,  low_price_24h: coinData.market_data.low_24h.usd, high_price_24h: coinData.market_data.high_24h.usd }, image: coinData.image.large  }, 
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
        const exchangev3 = await client.exchanges({page:page? page: 1, per_page:50})

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

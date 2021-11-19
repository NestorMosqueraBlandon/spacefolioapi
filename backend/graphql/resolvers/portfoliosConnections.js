import Portfolio from "../../models/portfolioModel.js"
import checkAuth from '../../utils/checkAuth.js';
import rp from "request-promise"
import Binance from 'binance';
import Coinbase from 'coinbase';
import Kucoin from 'kucoin-node-api';
import CoinGecko from 'coingecko-api';
import Enumerable from 'linq'

const { from } = Enumerable;

const { Client } = Coinbase;
const { MainClient } = Binance;

const coinbaseClient = new Coinbase.Client({ accessToken: "638adf181444ba8972ce76b77246b3043891be3008ad8f06558207b0dad75acd" });

const CoinGeckoClient = new CoinGecko();

const quantityMarket = async (value, valueMarket) => {

  const quantity = await valueMarket != null && value != null ? Number(value) / Number(valueMarket) : 0

  return quantity;

}

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

    async getWalletsConnection(_, { portfolioId }, context) {
      const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        return portfolio.wallets;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getExchangesConnection(_, { portfolioId }, context) {
      const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        return portfolio.exchanges;
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

    async portfolioMarket(_, { portfolioId }) {

      try {

        const data = await CoinGeckoClient.coins.fetch(coinId, {});

        const dataMarketall = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: "max" });
        const dataMarket24h = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 1 });
        const dataMarket7d = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 7 });
        const dataMarket1m = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 30 });
        const dataMarket1y = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 365 });

        return {
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



    async getMetadataPortfolio(_, { portfolioId }, context) {

      const portfolio = await Portfolio.findById(portfolioId);

      if (portfolio && (portfolio.wallets.length > 0 || portfolio.exchanges.length > 0)) {

        const coinList = await CoinGeckoClient.coins.list();

        let metadata = {}
        let walletCoins = []
        let walletCoinMarket = []
        let portfolioTokens = []

        portfolio.wallets.map((wallet) => {
          wallet.tokens.forEach((token) => {
            walletCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
          })
        })


        for (let i = 0; i < walletCoins.length; i++) {
          const { data } = await CoinGeckoClient.coins.fetch(walletCoins[i].id)
          const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } } } = data

          walletCoinMarket.push({ symbol, name, large, contract_address, usd })
        }


        portfolio.wallets.map((wallet) => {
          wallet.tokens.forEach((token) => {

            let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...walletCoinMarket.filter((coin) => token.currency.address == coin.contract_address))
            portfolioTokens.push(arrayResult)

          })

        })


        let exchangeCoins = []
        let exchangeCoinMarket = []

        portfolio.exchanges.map((exchange) => {
          exchange.tokens.forEach((token) => {
            exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
          })
        })

        for (let i = 0; i < exchangeCoins.length; i++) {
          const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
          const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank } = data
          exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank })
        }

        let newCoins = [];

        portfolio.exchanges.map((exchange) => {
          exchange.tokens.forEach((token) => {
            newCoins = exchangeCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())


            newCoins.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
            for (let i = 0; i < newCoins.length; i++) {
              let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, newCoins[0])
              portfolioTokens.push(arrayResult)
              break;
            }

          })
        })

        metadata = {
          balance: 0,
          cryptos: []
        }


        metadata.cryptos = from(portfolioTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
          return {
            symbol: key,
            quantity: t.sum(token => token["quantity"] || 0),
            name: t.first().name,
            image: t.first().large,
            valueMarket: t.first().usd,
            value: t.sum(token => token["quantity"]) * t.first().usd
          };
        }).toArray()

        metadata.cryptos = metadata.cryptos.filter((crypto) => crypto.symbol != undefined)
        metadata.balance = metadata.cryptos.reduce((a, c) => a + c.value * 1, 0)
        return metadata
      }

    },
  },

  Mutation: {

    async addWalletConnection(
      _,
      { name, portfolioId, publicAddress, network, image },
      context
    ) {
      // const user = checkAuth(context);

      try {
        const query = `
      query ($network: EthereumNetwork!, $address: String!) {
        ethereum(network: $network) {
          address(address: {is: $address}) {
            balances {
              currency {
                address
                symbol
                tokenType
                name
              }
              value
            }
            balance
          }
        }
      }
      
    `;

        const netw = network
        const adre = publicAddress

        const variables = `
    {
      "network": "${netw}",
      "address": "${adre}"

    }
    
  `;

        const requestOptions = {
          method: 'POST',
          uri: `https://graphql.bitquery.io`,
          headers: {
            "Content-Type": "application/json",
            'X-API-KEY': 'BQYmmb3rW726zLmxE3Fd5aMSyr7AtWT5'
          },
          body: ({
            query,
            variables
          }),
          json: true,
          gzip: true
        };

        const portfolio = await Portfolio.findById(portfolioId);
        const { data } = await rp(requestOptions);
        if (portfolio) {
          if (data.ethereum.address[0].balances) {

            await portfolio.wallets.unshift({
              name,
              address: publicAddress,
              network: network,
              image: image,
              quantity: 100,
              tokens: data.ethereum.address[0].balances.filter((bal) => bal.value > 0)
            });
            portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.wallets[0].quantity);
            await portfolio.save();
          }
          
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
      { name, portfolioId, walletId, publicAddress, active },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {

          const wallet = portfolio.wallets.findIndex(wallet => wallet.id === walletId)

          if (portfolio.wallets[wallet].id === walletId) {
            portfolio.wallets[wallet] = ({
              name: name ? name : portfolio.wallets[wallet].name,
              address: publicAddress ? publicAddress : portfolio.wallets[wallet].address,
              active: active ? active : portfolio.wallets[wallet].active,
              network: portfolio.wallets[wallet].network,
              image: portfolio.wallets[wallet].image,
              quantity: portfolio.wallets[wallet].quantity,
              tokens: portfolio.wallets[wallet].tokens
            })
          }

          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async updateExchangeConnection(
      _,
      { name, portfolioId, exchangeId, key, secret, active },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {

          const exchange = portfolio.exchanges.findIndex(wallet => wallet.id === exchangeId)

          if (portfolio.exchanges[exchange].id === exchangeId) {
            portfolio.exchanges[exchange] = ({
              name: name ? name : portfolio.exchanges[exchange].name,
              key: key ? key : portfolio.exchanges[exchange].key,
              secret: secret ? secret : portfolio.exchanges[exchange].secret,
              active: active ? active : portfolio.exchanges[exchange].active,
              network: portfolio.exchanges[exchange].network,
              image: portfolio.exchanges[exchange].image,
              quantity: portfolio.exchanges[exchange].quantity,
              tokens: portfolio.exchanges[exchange].tokens
            })
          }

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
      { portfolioId, walletId },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          const walletIndex = portfolio.wallets.findIndex((w) => w.id === walletId);

          portfolio.wallets.splice(walletIndex, 1)
          await portfolio.save();
          return 200;
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deleteExchangeConnection(
      _,
      { portfolioId, exchangeId },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          const exchangeIndex = portfolio.exchanges.findIndex((w) => w.id === exchangeId);

          portfolio.exchanges.splice(exchangeIndex, 1)
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
      { input: { name, image, portfolioId, network, key, secret } },
      context
    ) {

      // const user = checkAuth(context);

      const client = new MainClient({
        api_key: key,
        api_secret: secret,
      });

      const myClient = new Client({
        'apiKey': key, 'apiSecret': secret,
        strictSSL: false
      });

      const portfolio = await Portfolio.findById(portfolioId);

      let portfolioTokens = [];
      let newToken = {}

      try {

        if (network == "coinbase") {
          let data = []

          myClient.getAccounts({}, async (err, accounts) => {
            accounts.forEach(async (acct) => {
              if (acct.balance.amount > 0) {
                console.log(acct)
                newToken = {}
                newToken.value = Number(acct.native_balance.amount),
                  newToken.currency = {
                    symbol: acct.currency,
                    name: acct.name,
                    quantity: Number(acct.balance.amount)
                  }

                portfolioTokens.unshift(newToken)
              }
            });
            if (portfolio) {
              const tokensQuantity = portfolioTokens.reduce((a, c) => a + Number(c.value), 0)
              await portfolio.exchanges.unshift({
                name,
                apiKey: key,
                image: image,
                inusd: "ready",
                quantity: tokensQuantity,
                apiSecret: secret,
                tokens: portfolioTokens
              });

              portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.exchanges[0].quantity);


              // await portfolio.save();
            }


          });


        } else if (network == "binance") {

          const data = await client.getBalances();

          const tokens = data.filter((token) => token.free > 0)
          const tokensQuantity = tokens.reduce((a, c) => a + Number(c.free), 0)

          let portfolioTokens = [];
          let newToken = {}

          tokens.map((token) => {
            newToken = {}
            newToken.value = Number(token.free),
              newToken.currency = {
                symbol: token.coin,
                name: token.name
              }

            portfolioTokens.unshift(newToken)
          })

          console.log(portfolioTokens);

          if (portfolio) {
            await portfolio.exchanges.unshift({
              name,
              apiKey: key,
              image: image,
              quantity: tokensQuantity,
              apiSecret: secret,
              tokens: portfolioTokens
            });

            portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.exchanges[0].quantity);
            await portfolio.save();
          }

        } else {
          console.log(err);
          throw new Error(701);
        }
      } catch (err) {
        console.log(err);
        throw new Error(701);
      }

      return 200
    },
  },
};


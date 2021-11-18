import Portfolio from "../../models/portfolioModel.js"
import checkAuth from '../../utils/checkAuth.js';
import rp from "request-promise"
import Binance from 'binance';
import Coinbase from 'coinbase';
import Kucoin from 'kucoin-node-api';
import CoinGecko from 'coingecko-api';
import api from '@marcius-capital/binance-api'

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

      if (portfolio && portfolio.wallets.length > 0 && portfolio.exchanges.length > 0) {
        try {

          const wallets = [];
          let metadata = {}
          let market = []

          const globalData = await CoinGeckoClient.global();

          for (let i = 1; i <= Math.round(globalData.data.data.active_cryptocurrencies / 250); i++) {
            const { data } = await CoinGeckoClient.coins.markets({ page: i, per_page: 250 });
            market = [...market, ...data]
          }

          let walletCryptos = []
          let exchangeCryptos = []


          portfolio.wallets.forEach(function (wallet) {
            if (!wallets[wallet.network]) {
              wallets[wallet.network] = {
                network: wallet.network,
                totalQuantity: 0,
                totalTokens: wallet.tokens
              }
              wallets.push(wallets[wallet.network]);
            };

            const tokens = wallet.tokens.reduce((a, d) => (a[d] ? a[d].value += d.value : a[d] = d, a), {})

            wallets[wallet.network].totalQuantity = parseFloat(wallet.quantity) + parseFloat(wallets[wallet.network].totalQuantity);
            wallets[wallet.network].totalTokens.push(wallet.tokens);

            wallets[wallet.network].tokens = tokens;
          });

          await wallets.map(async (wallet) => {

            metadata = {
              balance: wallet.totalQuantity,
              cryptos: []
            }


            walletCryptos = await [...wallet.totalTokens.map(async (token) => {
              for (let i = 0; i < market.length; i++) {
                if (token.currency.symbol) {

                  if (market[i].symbol == token.currency.symbol.toString().toLowerCase()) {
                    token.image = await market[i].image
                    token.currency.valueMarket = await market[i].current_price != null && token.currency.symbol != null ? market[i].current_price.toFixed(9) : 0
                    if (token.currency.valueMarket) {
                      token.quantity = token.value;

                      // token.value = await convertValue(Number(token.quantity).toFixed(6), token.currency.symbol)
                      if (!token.currency.quantity) {
                        // token.quantity = quantityMarket(token.value, token.currency.valueMarket)
                      }
                    }
                  }
                }
              }
              return token
            })]
          })

          let exchanges = [];

          portfolio.exchanges.forEach(function (exchange) {
            if (!exchanges[exchange.network]) {
              exchanges[exchange.network] = {
                network: exchange.network,
                totalQuantity: 0,
                totalTokens: exchange.tokens
              }
              exchanges.push(exchanges[exchange.network]);

            };

            let tokens = [];
            tokens = [...tokens, exchange.tokens.reduce((a, d) => (a[d] ? a[d].value += d.value : a[d] = d, a), {})]

            exchanges[exchange.network].totalQuantity = parseFloat(exchange.quantity) + parseFloat(exchanges[exchange.network].totalQuantity);
            exchanges[exchange.network].totalTokens.push(exchange.tokens);

            exchanges[exchange.network].tokens = tokens;
          });


          metadata.cryptos = [...exchangeCryptos, ...walletCryptos]

          return metadata;
        }
        catch (err) {
          console.log(err)
        }
      } else {
        return {}
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
        const data = await rp(requestOptions);
        if (portfolio) {

          await portfolio.wallets.unshift({
            name,
            address: publicAddress,
            network: network,
            image: image,
            quantity: 100,
            tokens: data.data.ethereum.address[0].balances ? data.data.ethereum.address[0].balances.filter((bal, index) => bal.value > 0) : []
          });

          portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.wallets[0].quantity);

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

      const user = checkAuth(context);

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

          let tokens =
            myClient.getAccounts({}, async (err, accounts) => {
              accounts.forEach(async (acct) => {
                if (acct.balance.amount > 0) {
                  newToken = {}
                  newToken.value = Number(acct.native_balance.amount),
                    newToken.currency = {
                      symbol: acct.currency,
                      name: acct.name,
                      quantity: Number(acct.balance.amount)
                    }

                  console.log(newToken)
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


                await portfolio.save();
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


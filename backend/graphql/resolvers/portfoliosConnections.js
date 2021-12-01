import Portfolio from "../../models/portfolioModel.js"
import checkAuth from '../../utils/checkAuth.js';
import rp from "request-promise"
import Binance from 'binance';
import Coinbase from 'coinbase';
import Kucoin from 'kucoin-node-api';
import CoinGecko from 'coingecko-api';
import Enumerable from 'linq'
import User from "../../models/userModel.js"

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

let chartData = [[]]
export const portfolioChart = async (balance) => {

  if (chartData[chartData.length - 1].length >= 100) {
    chartData.push([Date.now(), balance])
  } else {
    chartData[chartData.length - 1].push([Date.now(), balance])
  }

  let data24h = [[]]
  let data7d = [[]]
  let data1m = [[]]
  let data1y = [[]]
  let dataAll = chartData

  for (let i = chartData.length; i > 0; i--) {
    for (let j = chartData[i - 1].length; j > 0; j--) {

      if (data24h[0].length < 24) {
        data24h[0].push(chartData[i - 1][j - 1])
      }
      if (data7d[0].length < 168) {
        if (data7d[data7d.length - 1].length >= 100) {
          data7d[0].push(chartData[i - 1][j - 1])
        } else {
          data7d[data7d.length - 1].push(chartData[i - 1][j - 1])
        }
      }
      if (data1m[0].length < 720) {
        if (data1m[data1m.length - 1].length >= 100) {
          data1m[0].push(chartData[i - 1][j - 1])
        } else {
          data1m[data1m.length - 1].push(chartData[i - 1][j - 1])
        }
      }

      if (data1y[data1y.length - 1].length >= 100) {
        data1y[0].push(chartData[i - 1][j - 1])
      } else {
        data1y[data1y.length - 1].push(chartData[i - 1][j - 1])
      }

      if (data1y.length == 8760) {
        break
      }


    }
  }

  return { data24h, data7d, data1m, data1y, dataAll }
}


const userWallets = async (portfolios, _callback) => {

  let walletsItems = {
    tokens: []
  }


  for (let i = 0; i < portfolios.length; i++) {
    for (let j = 0; j < portfolios[i].wallets.length; j++) {
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

      const variables = `
{
 "network": "${portfolios[i].wallets[j].network}",
 "address": "${portfolios[i].wallets[j].address}"
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

      const { data } = await rp(requestOptions);
      if (data.ethereum.address[0].balances) {
        walletsItems.tokens.push(...data.ethereum.address[0].balances.filter((bal) => bal.value > 0))
        console.log("wallets on", walletsItems)

      }


    }
  }
  // await portfolios.map(async (portfolio) => {

  // })

  console.log("wallets off", walletsItems)


  _callback(walletsItems);
}

export default {

  Query: {

    async getWalletsConnection(_, { portfolioId }, context) {
      const user = checkAuth(context);
      try {
        const userData = await User.findById(user._id)
        if (!userData) {
          throw new Error(701)
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

        const portfolio = userData.portfolios[portfolioIde];

        if (!portfolio) {
          throw new Error(701);
        }
        return userData.portfolios[portfolioIde].wallets;
      } catch (err) {
        throw new Error(err);
      }

    },

    async getExchangesConnection(_, { portfolioId }, context) {
      const user = checkAuth(context);
      try {

        const userData = await User.findById(user._id)

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

        const portfolio = userData.portfolios[portfolioIde];

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

    async getExchangeOrWalletData(_, { portfolioId, exchangeOrWalletId, type }, context) {
      const user = checkAuth(context);
      try {

        const userData = await User.findById(user._id)

        if (!userData) {
          throw new Error(105)
        }


        let metadata = {}
        let walletCoins = []
        let walletCoinMarket = []
        let portfolioTokens = []

        let exchanges = []
        let wallets = {
          tokens: []
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

        const portfolio = userData.portfolios[portfolioIde];
        if (portfolio) {
          if (type == 0) {

            const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

            const portfolio = userData.portfolios[portfolioIde];

            const wallet = userData.portfolios[portfolioIde].wallets.findIndex(wallet => wallet.id === exchangeOrWalletId)
            if (wallet >= 0) {
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

              const variables = `
            {
             "network": "${portfolio.wallets[wallet].network}",
             "address": "${portfolio.wallets[wallet].address}"
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

              const { data } = await rp(requestOptions);
              console.log(data)
              if (data && data.ethereum.address[0].balances) {
                wallets.tokens.push(...data.ethereum.address[0].balances.filter((bal) => bal.value > 0))
              }
            }

            // 0x9dF2fe92B91105adE1266f57de548346E9b4009a
            const coinList = await CoinGeckoClient.coins.list();


            wallets.tokens.forEach((token) => {
              walletCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
            })


            for (let i = 0; i < walletCoins.length; i++) {
              const { data } = await CoinGeckoClient.coins.fetch(walletCoins[i].id)
              const { id: coinId, symbol, name, image: { large }, platforms, contract_address, market_data: { current_price: { usd } }, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data

              walletCoinMarket.push({ coinId, symbol, name, large, platforms, contract_address, usd, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
            }


            wallets.tokens.forEach((token) => {
              let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...walletCoinMarket.filter((coin) => token.currency.tokenType == '' && token.currency.symbol.toLowerCase() == coin.symbol ? coin : from(Object.values(coin.platforms)).where(platform => platform == token.currency.address).firstOrDefault()))
              // console.log("arrayresult", arrayResult)
              portfolioTokens.push(arrayResult)
              // newCoinsWallet = walletCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())
            })

            // coin.contract_address == undefined || token.currency.symbol.toLowerCase() === coin.contract_address.toLowerCase()? coin :
            // console.log(portfolioTokens)


            metadata = {
              balance: 0,
              name: portfolio.wallets[wallet].name,
              image: portfolio.wallets[wallet].image,
              tokens: [],

            }


            metadata.tokens = from(portfolioTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
              return {
                symbol: key,
                coinId: t.first().coinId,
                quantity: t.sum(token => token["quantity"] || 0),
                name: t.first().name,
                image: t.first().large,
                valueMarket: t.first().usd,
                value: t.sum(token => token["quantity"]) * t.first().usd,
                value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),
                price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

              };
            }).toArray()

            // console.log(metadata)

            metadata.tokens = metadata.tokens.filter((crypto) => crypto.symbol != undefined)
            metadata.balance = metadata.tokens.reduce((a, c) => a + c.value * 1, 0)


            console.log(metadata)
            return metadata
          }

          if (type == 1) {

            const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

            const portfolio = userData.portfolios[portfolioIde];

            console.log(portfolio)
            const exchange = userData.portfolios[portfolioIde].exchanges.findIndex(exchange => exchange.id === exchangeOrWalletId)
            if (exchange >= 0) {
              const coinList = await CoinGeckoClient.coins.list();

              console.log(portfolio.exchanges[exchange].network)
              if (portfolio.exchanges[exchange].network === "binance") {
                const client = new MainClient({
                  api_key: portfolio.exchanges[exchange].apiKey,
                  api_secret: portfolio.exchanges[exchange].apiSecret,
                });

                const data = await client.getBalances();

                const tokens = data.filter((token) => token.free > 0)

                let portfolioTokens = [];
                let newToken = {}

                tokens.map((token) => {
                  newToken = {}
                  newToken.value = Number(token.free)
                  newToken.currency = {
                    symbol: token.coin,
                    name: token.name
                  }
                  portfolioTokens.unshift(newToken)
                })


                let exchangeCoins = []
                let exchangeCoinMarket = []


                portfolioTokens.forEach((token) => {
                  exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
                })

                for (let i = 0; i < exchangeCoins.length; i++) {
                  const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
                  const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data
                  exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
                }

                let newCoins;
                let newExchangesTokens = [];

                portfolioTokens.forEach((token) => {
                  let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
                  newExchangesTokens.push(arrayResult)
                  // newCoins = exchangeCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())


                  newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
                })



                metadata = {
                  balance: 0,
                  name: portfolio.exchanges[exchange].name,
                  image: portfolio.exchanges[exchange].image,
                  tokens: [],
                  chart: ''
                }

                metadata.tokens = from(newExchangesTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
                  return {
                    symbol: key,
                    coinId: t.first().coinId,
                    quantity: t.sum(token => token["quantity"] || 0),
                    name: t.first().name,
                    image: t.first().large,
                    valueMarket: t.first().usd,
                    value: t.sum(token => token["quantity"]) * t.first().usd,

                    value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

                    value_usd_7d: (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? token["quantity"] * t.first().usd * t.first().price_change_percentage_24h / 100 : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    value_usd_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    value_usd_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

                    price_change_percentage_7d: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) == 0 ? (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d),

                    price_change_percentage_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    price_change_percentage_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,
                  };
                }).toArray()

                metadata.tokens = metadata.tokens.filter((crypto) => crypto.symbol != undefined)
                metadata.balance = metadata.tokens.reduce((a, c) => a + c.value * 1, 0)

                return metadata
              } else if (portfolio.exchanges[exchange].network === "coinbase") {
                const myClient = new Client({
                  'apiKey': portfolio.exchanges[exchange].apiKey,
                  'apiSecret': portfolio.exchanges[exchange].apiSecret,
                  strictSSL: false
                });

                let portfolioTokens = [];
                let newToken = {}

                myClient.getAccounts({}, (err, accounts) => {
                  console.log(accounts)
                })

                myClient.getAccounts({}, async (err, accounts) => {
                  accounts.forEach(async (acct) => {
                    if (acct.balances.amount > 0) {
                      newToken = {}
                      newToken.value = Number(acct.native_balance.amount)
                      newToken.currency = {
                        symbol: acct.currency,
                        name: acct.name,
                        quantity: Number(acct.balance.amount)
                      }
                      portfolioTokens.unshift(newToken)
                    }
                  })
                })

                // myClient.getAccounts({}, async (err, accounts) => {
                //   accounts.forEach(async (acct) => {
                //     if (acct.balance.amount > 0) {
                //       console.log(acct)
                //       newToken = {}
                //       newToken.value = Number(acct.native_balance.amount),
                //         newToken.currency = {
                //           symbol: acct.currency,
                //           name: acct.name,
                //           quantity: Number(acct.balance.amount)
                //         }

                //       portfolioTokens.unshift(newToken)
                //     }
                // });



                let exchangeCoins = []
                let exchangeCoinMarket = []


                portfolioTokens.forEach((token) => {
                  exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
                })

                for (let i = 0; i < exchangeCoins.length; i++) {
                  const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
                  const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data
                  exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
                }

                let newCoins;
                let newExchangesTokens = [];

                portfolioTokens.forEach((token) => {
                  let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
                  newExchangesTokens.push(arrayResult)
                  // newCoins = exchangeCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())


                  newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
                })



                metadata = {
                  balance: 0,
                  name: portfolio.exchanges[exchange].name,
                  image: portfolio.exchanges[exchange].image,
                  tokens: [],
                  chart: ''
                }

                metadata.tokens = from(newExchangesTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
                  return {
                    symbol: key,
                    coinId: t.first().coinId,
                    quantity: t.sum(token => token["quantity"] || 0),
                    name: t.first().name,
                    image: t.first().large,
                    valueMarket: t.first().usd,
                    value: t.sum(token => token["quantity"]) * t.first().usd,

                    value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

                    value_usd_7d: (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? token["quantity"] * t.first().usd * t.first().price_change_percentage_24h / 100 : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    value_usd_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    value_usd_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

                    price_change_percentage_7d: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) == 0 ? (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d),

                    price_change_percentage_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    price_change_percentage_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,
                  };
                }).toArray()

                metadata.tokens = metadata.tokens.filter((crypto) => crypto.symbol != undefined)
                metadata.balance = metadata.tokens.reduce((a, c) => a + c.value * 1, 0)

                return metadata
              }
            }
          }
        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err)
        // throw new Error(err);
      }
    },
    async getPortfolios(_, { getInternalData }, context) {
      const user = checkAuth(context);
      const userData = await User.findById(user._id)
      const portfolios = userData.portfolios;
      try 
      {
        if (!portfolios) 
        {
          throw new Error(701)
        }

        let arrayPortfolios = [];
        let firtsArray = [];
        let totalBalance = 0;
        let totalPercentage = 0;
        let totalValue = 0;

        for (let i = 0; i < portfolios.length; i++) 
        {
          let metadata = {}
          let walletCoins = []
          let walletCoinMarket = []
          let portfolioTokens = []

          let exchanges = []
          let wallets = {
            tokens: []
          }

          if (!portfolios) {
            throw new Error(701)
          }

          const coinList = await CoinGeckoClient.coins.list();
          let query;

          if (portfolios[i].wallets.length > 0 && getInternalData === false)  
          {
            for (let j = 0; j < portfolios[i].wallets.length; j++) 
            {
              if (portfolios[i].wallets[j].network == "cardano") 
              {
                 query = `
                 query {
                  cardano{
                    address(address: {in: 
                      "${portfolios[i].wallets[j].address}",
                      }){
                      balance {
                        currency {
                          name
                          symbol
                          tokenId
                        }
                        value
                      }
                      
                    }
                  }
                }
                
              `
              }
              else 
              {
                query = `
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
              }
              const variables = `
                      {
                      "network": "${portfolios[i].wallets[j].network}",
                      "address": "${portfolios[i].wallets[j].address}"
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

              const { data } = await rp(requestOptions);
              if (portfolios[i].wallets[j].network == "cardano") {
                if (data && data.cardano.address[0].balance) {
                  wallets.tokens.push(...data.cardano.address[0].balance.filter((bal) => bal.value > 0))
                }
              } else {
                if (data && data.ethereum.address[0].balances) {
                  wallets.tokens.push(...data.ethereum.address[0].balances.filter((bal) => bal.value > 0))
                }
              }
            }

            // 0x9dF2fe92B91105adE1266f57de548346E9b4009a


            wallets.tokens.forEach((token) => {
              walletCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
            })


            for (let i = 0; i < walletCoins.length; i++) {
              const { data } = await CoinGeckoClient.coins.fetch(walletCoins[i].id)
              const { id: coinId, symbol, name, image: { large }, platforms, contract_address, market_data: { current_price: { usd } }, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data

              walletCoinMarket.push({ coinId, symbol, name, large, platforms, contract_address, usd, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
            }


            wallets.tokens.forEach((token) => {
              let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...walletCoinMarket.filter((coin) => token.currency.tokenType == '' && token.currency.symbol.toLowerCase() == coin.symbol ? coin : from(Object.values(coin.platforms)).where(platform => platform == token.currency.address).firstOrDefault()))
              // console.log("arrayresult", arrayResult)
              portfolioTokens.push(arrayResult)
              // newCoinsWallet = walletCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())
            })

            // coin.contract_address == undefined || token.currency.symbol.toLowerCase() === coin.contract_address.toLowerCase()? coin :
            // console.log(portfolioTokens)
          }

          if (portfolios[i].exchanges.length > 0 && getInternalData === false) {


            let exchangeCoins = []
            let exchangeCoinMarket = []

            if (portfolios[i].exchanges.length > 0) {

              for (let j = 0; j < portfolios[i].wallets.length; j++) {
                if (portfolios[i].exchanges[j].network === "binance") {
 
                  const client = new MainClient({
                    api_key: portfolios[i].exchanges[j].apiKey,
                    api_secret: portfolios[i].exchanges[j].apiSecret,
                  });

                  const data = await client.getBalances();

                  const tokens = data.filter((token) => token.free > 0)

                  let exchangePortfolioTokens = [];
                  let newToken = {}

                  tokens.map((token) => {
                    newToken = {}
                    newToken.value = Number(token.free)
                    newToken.currency = {
                      symbol: token.coin,
                      name: token.name
                    }
                    exchangePortfolioTokens.unshift(newToken)
                  })


                  let exchangeCoins = []
                  let exchangeCoinMarket = []


                  exchangePortfolioTokens.forEach((token) => {
                    exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
                  })

                  for (let i = 0; i < exchangeCoins.length; i++) {
                    const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
                    const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data
                    exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
                  }

                  let newCoins;
                  let newExchangesTokens = [];

                  exchangePortfolioTokens.forEach((token) => {
                    let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
                    newExchangesTokens.push(arrayResult)
                    // newCoins = exchangeCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())


                    newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)

                    portfolioTokens.push(arrayResult)
                  })



                  portfolioTokens.push(exchangePortfolioTokens)

                }

                if (portfolios[i].exchanges[j].network === "coinbase") {
                  const myClient = new Client({
                    'apiKey': portfolio.exchanges[j].apiKey,
                    'apiSecret': portfolio.exchanges[j].apiSecret,
                    strictSSL: false
                  });

                  let portfolioTokens = [];
                  let newToken = {}

                  myClient.getAccounts({}, (err, accounts) => {
                    console.log(accounts)
                  })

                  myClient.getAccounts({}, async (err, accounts) => {
                    accounts.forEach(async (acct) => {
                      if (acct.balances.amount > 0) {
                        newToken = {}
                        newToken.value = Number(acct.native_balance.amount)
                        newToken.currency = {
                          symbol: acct.currency,
                          name: acct.name,
                          quantity: Number(acct.balance.amount)
                        }
                        portfolioTokens.unshift(newToken)
                      }
                    })
                  })

                  let exchangeCoins = []
                  let exchangeCoinMarket = []


                  portfolioTokens.forEach((token) => {
                    exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
                  })

                  for (let i = 0; i < exchangeCoins.length; i++) {
                    const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
                    const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data
                    exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
                  }

                  let newCoins;
                  let newExchangesTokens = [];

                  portfolioTokens.forEach((token) => {
                    let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
                    newExchangesTokens.push(arrayResult)

                    portfolioTokens.push(arrayResult)

                    newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
                  })

                }


              }

            }

          }

      
                metadata = {
                  balance: 0,
                  percentage: 0,
                  cryptos: [],
                  chart: ''
                }


                metadata.cryptos = from(portfolioTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
                  return {
                    symbol: key,
                    coinId: t.first().coinId,
                    quantity: t.sum(token => token["quantity"] || 0),
                    name: t.first().name,
                    image: t.first().large,
                    valueMarket: t.first().usd,
                    value: t.sum(token => token["quantity"]) * t.first().usd,

                    value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

                    value_usd_7d: (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? token["quantity"] * t.first().usd * t.first().price_change_percentage_24h / 100 : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    value_usd_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    value_usd_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

                    price_change_percentage_7d: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) == 0 ? (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d),

                    price_change_percentage_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

                    price_change_percentage_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,
                  };
                }).toArray()


                metadata.cryptos = metadata.cryptos.filter((crypto) => crypto.symbol != undefined)
                metadata.balance = metadata.cryptos.reduce((a, c) => a + c.value * 1, 0)

                let sumPercentage = metadata.cryptos.reduce((a, c) => a + c.price_change_percentage_30d * 1, 0)
                let sumPercentageUsd = metadata.cryptos.reduce((a, c) => a + c.value_usd_7d * 1, 0)

                let avg = metadata.cryptos.length > 0? sumPercentage / metadata.cryptos.length : 0;
                let avgUsd = metadata.cryptos.length > 0? sumPercentageUsd / metadata.cryptos.length : 0;

    
                

                totalBalance += metadata.balance;
                totalPercentage += avg
                totalValue += avgUsd

                firtsArray.push({ id: portfolios[i].id, name: portfolios[i].name, balance: metadata.balance, price_change_percentage: avg, value_usd: avgUsd })
                // arrayPortfolios.push({ name: portfolios[i].name, balance: metadata.balance })
              }
              if (getInternalData === false) 
              {
  

                for (let k = 0; k < portfolios.length; k++) {
     
                  let percentage = (firtsArray[k].balance / totalBalance) * 100
                  arrayPortfolios.push({ id: firtsArray[k].id, name: firtsArray[k].name, balance: firtsArray[k].balance, price_change_percentage: firtsArray[k].price_change_percentage, percentage, value_usd: firtsArray[k].value_usd })
                }

                let metadataArray = {
                  totalBalance: 0,
                  totalPercetage: 0,
                  totalValue: 0,
                  portfolios: []
                }

                metadataArray = { totalBalance, totalPercentage, totalValue, portfolios: arrayPortfolios }

             
          console.log(metadataArray)
          

                return metadataArray;
            } else 
            {
                  let metadataArray = {
                  totalBalance: 0,
                  portfolios: []
                }

                metadataArray = { portfolios }
                return metadataArray
            }

      } catch (err) {
        console.log(err)
        // throw new Error(err);
      }
    },


    async getMetadataPortfolio(_, { portfolioId, userId, interval = false }, context) {

      const user = checkAuth(context);

      const userData = await User.findById(user._id)

      const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

      const portfolio = userData.portfolios[portfolioIde];

      let metadata = {}
      let walletCoins = []
      let walletCoinMarket = []
      let portfolioTokens = []

      let exchanges = []
      let wallets = {
        tokens: []
      }

      if (!portfolio) {
        throw new Error(701)
      }

      const coinList = await CoinGeckoClient.coins.list();

      let query;
      if (portfolio.wallets.length > 0) {
        for (let j = 0; j < portfolio.wallets.length; j++) {

          if (portfolio.wallets[j].network == "cardano") {
            query = `
            query {
              cardano{
                address(address: {in: 
                  "${portfolio.wallets[j].address}",
                  }){
                  balance {
                    currency {
                      name
                      symbol
                      tokenId
                    }
                    value
                  }
                  
                }
              }
            }
            
        `
          }
          else {

            query = `
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
          }

          const variables = `
    {
     "network": "${portfolio.wallets[j].network}",
     "address": "${portfolio.wallets[j].address}"
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

          const { data } = await rp(requestOptions);
          if (portfolio.wallets[j].network == "cardano") {

            if (data && data.cardano.address[0].balance) {
              wallets.tokens.push(...data.cardano.address[0].balance.filter((bal) => bal.value > 0))
            }
          } else {
            if (data && data.ethereum.address[0].balances) {
              wallets.tokens.push(...data.ethereum.address[0].balances.filter((bal) => bal.value > 0))
            }
          }

        }

        // 0x9dF2fe92B91105adE1266f57de548346E9b4009a

        console.log(wallets)

        wallets.tokens.forEach((token) => {
          walletCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
        })


        for (let i = 0; i < walletCoins.length; i++) {
          const { data } = await CoinGeckoClient.coins.fetch(walletCoins[i].id)
          const { id: coinId, symbol, name, image: { large }, platforms, contract_address, market_data: { current_price: { usd } }, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data

          walletCoinMarket.push({ coinId, symbol, name, large, platforms, contract_address, usd, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
        }

        // console.log(walletCoinMarket)


        wallets.tokens.forEach((token) => {
          let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...walletCoinMarket.filter((coin) => token.currency.tokenType == '' && token.currency.symbol.toLowerCase() == coin.symbol ? coin : from(Object.values(coin.platforms)).where(platform => platform == token.currency.address).firstOrDefault()))
          // console.log("arrayresult", arrayResult)
          portfolioTokens.push(arrayResult)
          // newCoinsWallet = walletCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())
        })

        console.log(portfolioTokens)

        // coin.contract_address == undefined || token.currency.symbol.toLowerCase() === coin.contract_address.toLowerCase()? coin :
        // console.log(portfolioTokens)
      }

      if (portfolio.exchanges.length > 0) {


        let exchangeCoins = []
        let exchangeCoinMarket = []

        if (portfolio.exchanges.length > 0) {

          for (let j = 0; j < portfolio.wallets.length; j++) {
            if (portfolio.exchanges[j].network === "binance") {
              console.log("ENTRO")
              const client = new MainClient({
                api_key: portfolio.exchanges[j].apiKey,
                api_secret: portfolio.exchanges[j].apiSecret,
              });

              const data = await client.getBalances();

              const tokens = data.filter((token) => token.free > 0)

              let exchangePortfolioTokens = [];
              let newToken = {}

              tokens.map((token) => {
                newToken = {}
                newToken.value = Number(token.free)
                newToken.currency = {
                  symbol: token.coin,
                  name: token.name
                }
                exchangePortfolioTokens.unshift(newToken)
              })


              let exchangeCoins = []
              let exchangeCoinMarket = []


              exchangePortfolioTokens.forEach((token) => {
                exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
              })

              for (let i = 0; i < exchangeCoins.length; i++) {
                const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
                const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data
                exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
              }

              let newCoins;
              let newExchangesTokens = [];

              exchangePortfolioTokens.forEach((token) => {
                let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
                newExchangesTokens.push(arrayResult)
                // newCoins = exchangeCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())


                newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)

                portfolioTokens.push(arrayResult)
              })



              portfolioTokens.push(exchangePortfolioTokens)
              // metadata.tokens.push(from(newExchangesTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
              //   return {
              //     symbol: key,
              //     coinId: t.first().coinId,
              //     quantity: t.sum(token => token["quantity"] || 0),
              //     name: t.first().name,
              //     image: t.first().large,
              //     valueMarket: t.first().usd,
              //     value: t.sum(token => token["quantity"]) * t.first().usd,

              //     value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

              //     value_usd_7d: (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? token["quantity"] * t.first().usd * t.first().price_change_percentage_24h / 100 : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

              //     value_usd_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

              //     value_usd_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

              //     price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

              //     price_change_percentage_7d: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) == 0 ? (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d),

              //     price_change_percentage_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

              //     price_change_percentage_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,
              //   };
              // }).toArray())
            }

            if (portfolio.exchanges[j].network === "coinbase") {
              const myClient = new Client({
                'apiKey': portfolio.exchanges[j].apiKey,
                'apiSecret': portfolio.exchanges[j].apiSecret,
                strictSSL: false
              });

              let portfolioTokens = [];
              let newToken = {}

              myClient.getAccounts({}, (err, accounts) => {
                console.log(accounts)
              })

              myClient.getAccounts({}, async (err, accounts) => {
                accounts.forEach(async (acct) => {
                  if (acct.balances.amount > 0) {
                    newToken = {}
                    newToken.value = Number(acct.native_balance.amount)
                    newToken.currency = {
                      symbol: acct.currency,
                      name: acct.name,
                      quantity: Number(acct.balance.amount)
                    }
                    portfolioTokens.unshift(newToken)
                  }
                })
              })

              let exchangeCoins = []
              let exchangeCoinMarket = []


              portfolioTokens.forEach((token) => {
                exchangeCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
              })

              for (let i = 0; i < exchangeCoins.length; i++) {
                const { data } = await CoinGeckoClient.coins.fetch(exchangeCoins[i].id)
                const { symbol, name, image: { large }, contract_address, market_data: { current_price: { usd } }, coingecko_rank, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data
                exchangeCoinMarket.push({ symbol, name, large, contract_address, usd, coingecko_rank, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
              }

              let newCoins;
              let newExchangesTokens = [];

              portfolioTokens.forEach((token) => {
                let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
                newExchangesTokens.push(arrayResult)
                // newCoins = exchangeCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())

                portfolioTokens.push(arrayResult)

                newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
              })

            }


          }
        }
      }

      metadata = {
        balance: 0,
        price_change_percentage_24h: 0,
        price_change_percentage_7d: 0,
        price_change_percentage_30d: 0,
        price_change_percentage_1y: 0,
        value_24h: 0,
        value_7d: 0,
        value_30d: 0,
        value_1y: 0,
        cryptos: [],
        chart: ''
      }


      metadata.cryptos = from(portfolioTokens).groupBy(tokens => tokens.symbol, null, (key, t) => {
        return {
          symbol: key,
          coinId: t.first().coinId,
          quantity: t.sum(token => token["quantity"] || 0),
          name: t.first().name,
          image: t.first().large,
          valueMarket: t.first().usd,
          value: t.sum(token => token["quantity"]) * t.first().usd,

          value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

          value_usd_7d: (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? token["quantity"] * t.first().usd * t.first().price_change_percentage_24h / 100 : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          value_usd_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          value_usd_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

          price_change_percentage_7d: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) == 0 ? (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d),

          price_change_percentage_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          price_change_percentage_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,
        };
      }).toArray()

      // console.log(metadata)

      metadata.cryptos = metadata.cryptos.filter((crypto) => crypto.symbol != undefined)
      metadata.balance = metadata.cryptos.reduce((a, c) => a + c.value * 1, 0)
      metadata.price_change_percentage_24h = metadata.cryptos.reduce((a, c) => a + c.price_change_percentage_24h * 1, 0)
      metadata.price_change_percentage_7d = metadata.cryptos.reduce((a, c) => a + c.price_change_percentage_7d * 1, 0)
      metadata.price_change_percentage_30d = metadata.cryptos.reduce((a, c) => a + c.price_change_percentage_30d * 1, 0)
      metadata.price_change_percentage_1y = metadata.cryptos.reduce((a, c) => a + c.price_change_percentage_1y * 1, 0)
      metadata.value_24h = metadata.cryptos.reduce((a, c) => a + c.value_usd_24h * 1, 0)
      metadata.value_7d = metadata.cryptos.reduce((a, c) => a + c.value_usd_7d * 1, 0)
      metadata.value_30d = metadata.cryptos.reduce((a, c) => a + c.value_usd_30d * 1, 0)
      metadata.value_1y = metadata.cryptos.reduce((a, c) => a + c.value_usd_1y * 1, 0)




      let chart = ""
      if (interval) {
        chart = JSON.stringify(await portfolioChart(metadata.balance, JSON.parse(userData.portfolioGeneralChart)))
        userData.portfolios[portfolioIde].portfolioGeneralChart = chart;
        await userData.save();
        metadata.chart = chart;
      }


      return metadata

    },
  },

  Mutation: {

    async addWalletConnection(
      _,
      { name, portfolioId, publicAddress, network, image },
      context
    ) {


      const user = checkAuth(context);
      try {


        const userData = await User.findById(user._id)

        if (!userData) {
          throw new Error(701)
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

        const portfolio = userData.portfolios[portfolioIde];


        userData.portfolios[portfolioIde].wallets.map((wallet) => {
          console.log((wallet.address == publicAddress && wallet.network == network))

          if (wallet.name == name || (wallet.address == publicAddress && wallet.network == network)) {
            throw new Error(801);
          }

        })

        if (portfolio) {
          await userData.portfolios[portfolioIde].wallets.unshift({
            name,
            address: publicAddress,
            network: network,
            image: image,
          });

          userData.save()

          return 200;

        } else {
          throw new Error(701);
        }
      } catch (err) {
        throw new Error(701);
      }
    },
    async updateWalletConnection(
      _,
      { name, portfolioId, walletId, publicAddress, active },
      context
    ) {
      const user = checkAuth(context);

      try {
        const userData = await User.findById(user._id)

        console.log(userData)

        if (!userData) {
          throw new Error(701)
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

        const portfolio = userData.portfolios[portfolioIde];
        if (portfolio) {

          const wallet = userData.portfolios[portfolioIde].wallets.findIndex(wallet => wallet.id === walletId)

          if (userData.portfolios[portfolioIde].wallets[wallet].id === walletId) {
            userData.portfolios[portfolioIde].wallets[wallet] = ({
              name: name ? name : portfolio.wallets[wallet].name,
              address: publicAddress ? publicAddress : portfolio.wallets[wallet].address,
              active: active ? active : portfolio.wallets[wallet].active,
              network: portfolio.wallets[wallet].network,
              image: portfolio.wallets[wallet].image,
              quantity: portfolio.wallets[wallet].quantity,
              tokens: portfolio.wallets[wallet].tokens
            })
          }

          await userData.save();
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

      console.log(user._)
      try {
        const userData = await User.findById(user._id)

        console.log(userData)

        if (!userData) {
          throw new Error(701)
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

        const portfolio = userData.portfolios[portfolioIde];
        console.log(portfolio)
        if (portfolio) {
          const walletIndex = userData.portfolios[portfolioIde].wallets.findIndex((w) => w.id === walletId);

          userData.portfolios[portfolioIde].wallets.splice(walletIndex, 1)
          await userData.save();
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

      // const client = new MainClient({
      //   api_key: key,
      //   api_secret: secret,
      // });

      // const myClient = new Client({
      //   'apiKey': key, 'apiSecret': secret,
      //   strictSSL: false
      // });

      const userData = await User.findById(user._id)

      if (!userData) {
        throw new Error(701)
      }


      const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

      const portfolio = userData.portfolios[portfolioIde];


      userData.portfolios[portfolioIde].exchanges.map((exchange) => {

        if (exchange.name == name || (exchange.apiKey == key && exchange.network == network)) {
          throw new Error(801);
        }

      })



      let portfolioTokens = [];
      let newToken = {}

      try {

        if (network == "coinbase") {
          let data = []

          // myClient.getAccounts({}, async (err, accounts) => {
          //   accounts.forEach(async (acct) => {
          //     if (acct.balance.amount > 0) {
          //       console.log(acct)
          //       newToken = {}
          //       newToken.value = Number(acct.native_balance.amount),
          //         newToken.currency = {
          //           symbol: acct.currency,
          //           name: acct.name,
          //           quantity: Number(acct.balance.amount)
          //         }

          //       portfolioTokens.unshift(newToken)
          //     }
          //   });
          if (portfolio) {
            // const tokensQuantity = portfolioTokens.reduce((a, c) => a + Number(c.value), 0)
            await userData.portfolios[portfolioIde].exchanges.unshift({
              name,
              apiKey: key,
              image: image,
              network: network,
              inusd: "ready",
              apiSecret: secret,
              tokens: []
            });

            // portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.exchanges[0].quantity);


            await userData.save();
          }


        } else if (network == "binance") {

          // const data = await client.getBalances();

          // const tokens = data.filter((token) => token.free > 0)
          // const tokensQuantity = tokens.reduce((a, c) => a + Number(c.free), 0)

          let portfolioTokens = [];
          let newToken = {}

          // tokens.map((token) => {
          //   newToken = {}
          //   newToken.value = Number(token.free),
          //     newToken.currency = {
          //       symbol: token.coin,
          //       name: token.name
          //     }

          //   portfolioTokens.unshift(newToken)
          // })

          // console.log(portfolioTokens);

          if (portfolio) {
            await userData.portfolios[portfolioIde].exchanges.unshift({
              name,
              apiKey: key,
              image: image,
              network: network,
              apiSecret: secret,
              tokens: []
            });

            // portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.exchanges[0].quantity);
            await userData.save();
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


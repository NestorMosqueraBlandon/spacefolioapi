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

const walletsRequests = async (address, network) => {

  let query;
  let wallets = {
    tokens: []
  };

  switch (network) {
    case "cardano":
      query = `
      query {
       cardano{
         address(address: {in: 
           "${address}",
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
      break;
    case "bitcoin" || "bitcash" || "litecoin" || "dash" || "dogecoin" || "bitcoinsv" || "zcash":
      query = `  
    query ($network: BitcoinNetwork!,) {
        bitcoin(network: $network) {
          coinpath(initialAddress: {in: "${address}"}) {
            currency {
              address
              decimals
              name
              symbol
              tokenId
              tokenType
            }
            amount
            count
          }
        }
      }
      
      `
      break;
    case "bsc" || "ethereum" || "velas" || "matic" || "goerlic":
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
      break;
    case "eos":
      query = `
      query {
        eos(network: eos) {
          coinpath(initialAddress: {in: "${address}"}) {
            currency {
              address
              name
              symbol
              tokenType
            }
            amount
          }
        }
      }`

      break;
    case "tron":
      query = `
      query {
        tron(network: tron) {
          coinpath(initialAddress: {in: "${address}"}) {
            amount
            count
            currency {
              address
              name
              symbol
              tokenId
            }
          }
        }
      }
      `
      break;
    case "algoran":
      query = ` query {
        algorand(network: algorand) {
          coinpath(initialAddress: {in: "${address}"}) {
            currency {
              address
              name
              symbol
              tokenType
            }
            count
            amount
          }
        }
      }
      `
      break;
    case "binance":

      query = `query  {
          binance {
            coinpath(initialAddress: {in: "${address}"}) {
              amount
              count
              currency {
                address
                name
                symbol
                tokenType
              }
            }
          }
        }
        
        `
    case "elrond":
      query = ` query {
            elrond(network: elrond) {
              coinpath(initialAddress: {in: "${address}"}) {
                amount
                currency {
                  address
                  name
                  symbol
                  tokenType
                }
              }
            }
          }
          `

      break;
    default:
      break;
  }

  const variables = `
      {
        "network": "${network}",
        "address": "${address}"
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

  const { data } = await rp(requestOptions)
  if (!data) {
    throw new Error(901)
  }

  switch (network) {
    case "cardano":
      wallets.tokens.push(...data.cardano.address[0].balance.filter((bal) => bal.value > 0))
      break;
    case "bitcoin" || "bitcash" || "litecoin" || "dash" || "dogecoin" || "bitcoinsv" || "zcash":
      wallets.tokens.push(...data.bitcoin.address[0].balance.filter((bal) => bal.value > 0))
      break;
    case "bsc" || "ethereum" || "velas" || "matic" || "goerlic":
      wallets.tokens.push(...data.ethereum.address[0].balances.filter((bal) => bal.value > 0))
      break;
    case "eos":
      wallets.tokens.push(...data.eos.address[0].balance.filter((bal) => bal.value > 0))
      break;
    case "tron":
      wallets.tokens.push(...data.tron.address[0].balance.filter((bal) => bal.value > 0))
      break;
    case "algoran":
      wallets.tokens.push(...data.algoran.address[0].balance.filter((bal) => bal.value > 0))
      break;
    case "binance":
      wallets.tokens.push(...data.binance.address[0].balance.filter((bal) => bal.value > 0))
      break;
    case "elrond":
      wallets.tokens.push(...data.elrond.address[0].balance.filter((bal) => bal.value > 0))
      break;
    default:
      break;
  }

  return wallets

}

const exchangeRequests = async (address, network) => {

}
function getUnique(arr, comp) {

  // store the comparison  values in array
  const unique = arr.map(e => e[comp])

    // store the indexes of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the false indexes & return unique objects
    .filter((e) => arr[e]).map(e => arr[e]);

  return unique;
}



const coingeckoRequests = async (type, cryptos) => {
  const coinList = await CoinGeckoClient.coins.list();

  let cryptosCoins = []
  let cryptosCoinMarket = []
  let portfolioTokens = []
  let newTokens = []

  cryptos.tokens.forEach((token) => {
    cryptosCoins.push(...coinList.data.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol.toLowerCase()))
  })

  for (let i = 0; i < cryptosCoins.length; i++) {
    const { data } = await CoinGeckoClient.coins.fetch(cryptosCoins[i].id)
    const { id: coinId, symbol, name, image: { large }, platforms, contract_address, market_data: { current_price: { usd } }, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data

    cryptosCoinMarket.push({ coinId, symbol, name, large, platforms, contract_address, usd, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
  }

  cryptos.tokens.forEach((token) => {
    if (type == 0) {

      let arrayResult = Object.assign({ quantity: token.value, apiSymbol: token.currency.symbol.toLowerCase() }, ...cryptosCoinMarket.filter((coin) => (token.currency.tokenType == '' || !token.currency.tokenType && token.currency.tokenId == null) && token.currency.symbol.toLowerCase() == coin.symbol ? coin : from(Object.values(coin.platforms)).where(platform => platform == token.currency.address).firstOrDefault()))
      portfolioTokens.push(arrayResult)
    } else {
      let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value, apiSymbol: token.currency.symbol.toLowerCase() }, ...exchangeCoinMarket.filter((coin) => token.currency.symbol.toLowerCase() == coin.symbol))
      newTokens.push(arrayResult)
      newTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
      console.log(arrayResult)
      portfolioTokens.push(arrayResult)
    }
  })

  return portfolioTokens
}

const updateCryptos = async (databaseItems, apiItems, portfolioIde, userData) => {

  let newCryptos = {
    tokens: []
  };
  let walletApiNewCryptosRemoved = [];


  const wallet = databaseItems;


  const walletApi = apiItems;

  const walletDatabase = userData.portfolios[portfolioIde].wallets[wallet];

  walletApi.tokens.pop() //CODIGO A ELIMINAR
  walletApi.tokens.pop() //CODIGO A ELIMINAR
  walletApi.tokens.pop() //CODIGO A ELIMINAR

  console.log(walletApi.tokens)
  console.log(walletApi.tokens.length)

  if (walletApi.length >= userData.portfolios[portfolioIde].wallets[wallet].tokens.length) {
    walletApi.map((walletApiValue) => {
      try {
        from(userData.portfolios[portfolioIde].wallets[wallet].tokens).where((walletDbValue) => walletApiValue.currency.symbol == walletDbValue.symbol).first()
      } catch (err) {
        newCryptos.tokens.push(walletApiValue);
      }
    })


    let marketDataCryptos = await coingeckoRequests(0, newCryptos)

    marketDataCryptos.tokens.pop()
    marketDataCryptos.map((value, index) => {
      walletDatabase.tokens.push({ coinId: value.coinId, quantity: newCryptos.tokens[index].currency.quantity, symbol: newCryptos.tokens[index].currency.symbol });
    })
  }

  if (walletApi.length <= walletDatabase.length) {


    let deleteData = [];
    for (let i = 0; i < walletDatabase.tokens.length; i++) {

      for (let index = 0; index < walletApi.length; index++) {

        if (walletDatabase.tokens[i].coinId === walletApi[index].coinId) {
          deleteData.push(walletDatabase.tokens[i]);
        }
      }
    }
    walletTestDatabase = deleteData
  }


  newCryptos.tokens.map((crypto) => {
    walletApi.map((walletApiValue, index) => {
      if (walletApiValue.coinId !== crypto.coinId) {
        walletApiNewCryptosRemoved.push(walletApi[index]);
      }
    });
  })

  walletApiNewCryptosRemoved.sort();
  walletDatabase.tokens.sort();

  if (walletApiNewCryptosRemoved.length > 0) {
    for (let index = 0; index < walletApiNewCryptosRemoved.length; index++) {
      if (walletApiNewCryptosRemoved[index].currency.quantity != walletTestDatabase[index].quantity) {
        walletDatabase.tokens[index].quantity = walletApiNewCryptosRemoved[index].currency.quantity;
      }

    }
  } else {
    for (let index = 0; index < walletApi.length; index++) {
      if (walletApi[index].currency.quantity != walletDatabase.tokens[index].quantity) {
        walletDatabase.tokens[index].quantity = walletApi[index].currency.quantity;
      }
    }
  }

  // console.log("wallet database", walletDatabase)
  // console.log("wallet api", walletApi)

}

const compare = async (apiObject, databaseObject) => {

  apiObject.map((o) => {
    databaseObject.includes(o)
  })

  return (apiObject === databaseObject)
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
      try {
        if (!portfolios) {
          throw new Error(701)
        }

        let arrayPortfolios = [];
        let firtsArray = [];
        let totalBalance = 0;
        let totalPercentage = 0;
        let totalValue = 0;

        for (let i = 0; i < portfolios.length; i++) {
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

          if (portfolios[i].wallets.length > 0 && getInternalData === false) {
            switch (portfolios[i].wallets[j].network) {
              case "cardano":
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
                break;
              case "bitcoin" || "bitcash" || "litecoin" || "dash" || "dogecoin" || "bitcoinsv" || "zcash":
                query = `  
              query ($network: BitcoinNetwork!,) {
                  bitcoin(network: $network) {
                    coinpath(initialAddress: {in: "${portfolios[i].wallets[j].address}"}) {
                      currency {
                        address
                        decimals
                        name
                        symbol
                        tokenId
                        tokenType
                      }
                      amount
                      count
                    }
                  }
                }
                
                `
                break;
              case "ethereum" || "bsc" || "velas" || "matic" || "goerlic":
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
                break;
              case "eos":
                `
                query {
                  eos(network: eos) {
                    coinpath(initialAddress: {in: "${portfolios[i].wallets[j].address}"}) {
                      currency {
                        address
                        name
                        symbol
                        tokenType
                      }
                      amount
                    }
                  }
                }`

                break;
              case "tron":
                query = `
                query {
                  tron(network: tron) {
                    coinpath(initialAddress: {in: "${portfolios[i].wallets[j].address}"}) {
                      amount
                      count
                      currency {
                        address
                        name
                        symbol
                        tokenId
                      }
                    }
                  }
                }
                `
                break;
              case "algoran":
                `
                query {
                  algorand(network: algorand) {
                    coinpath(initialAddress: {in: "${portfolios[i].wallets[j].address}"}) {
                      currency {
                        address
                        name
                        symbol
                        tokenType
                      }
                      count
                      amount
                    }
                  }
                }
                `
                break;
              case "binance":
                `
                  query  {
                    binance {
                      coinpath(initialAddress: {in: "${portfolios[i].wallets[j].address}"}) {
                        amount
                        count
                        currency {
                          address
                          name
                          symbol
                          tokenType
                        }
                      }
                    }
                  }
                  
                  `
              case "elrond":
                `
                    query {
                      elrond(network: elrond) {
                        coinpath(initialAddress: {in: "${portfolios[i].wallets[j].address}"}) {
                          amount
                          currency {
                            address
                            name
                            symbol
                            tokenType
                          }
                        }
                      }
                    }
                    `

                break;
              default:
                break;
            }
            for (let j = 0; j < portfolios[i].wallets.length; j++) {

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
              console.log("TOKEN", token.currency)
              let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...walletCoinMarket.filter((coin) => (token.currency.tokenType == '' || !token.currency.tokenType && token.currency.tokenId == null) && token.currency.symbol.toLowerCase() == coin.symbol ? coin : from(Object.values(coin.platforms)).where(platform => platform == token.currency.address).firstOrDefault()))
              // console.log("arrayresult", arrayResult)
              portfolioTokens.push(arrayResult)
              // newCoinsWallet = walletCoinMarket.filter((coin) => coin.symbol.toLowerCase() == token.currency.symbol.toLowerCase())
            })

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

          let avg = metadata.cryptos.length > 0 ? sumPercentage / metadata.cryptos.length : 0;
          let avgUsd = metadata.cryptos.length > 0 ? sumPercentageUsd / metadata.cryptos.length : 0;




          totalBalance += metadata.balance;
          totalPercentage += avg
          totalValue += avgUsd

          firtsArray.push({ id: portfolios[i].id, name: portfolios[i].name, balance: metadata.balance, price_change_percentage: avg, value_usd: avgUsd })
          // arrayPortfolios.push({ name: portfolios[i].name, balance: metadata.balance })
        }
        if (getInternalData === false) {


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




          return metadataArray;
        } else {
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

      let wallets = {
        tokens: []
      }

      if (!portfolio) {
        throw new Error(701)
      }

      //   const coinList = await CoinGeckoClient.coins.list();

      //   let query;
      if (portfolio.wallets.length > 0) {
        for (let j = 0; j < portfolio.wallets.length; j++) {
          for (let i = 0; i < portfolio.wallets[j].tokens.length; i++) {
            if (portfolio.wallets[j].tokens[i].coinId) {

              const { data } = await CoinGeckoClient.coins.fetch(portfolio.wallets[j].tokens[i].coinId)
              const { id: coinId, symbol, name, image: { large }, platforms, contract_address, market_data: { current_price: { usd } }, market_data: { price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y } } = data

              walletCoinMarket.push({ coinId, symbol, name, large, platforms, contract_address, usd, price_change_percentage_24h, price_change_percentage_7d, price_change_percentage_30d, price_change_percentage_1y })
            }


            portfolio.wallets[j].tokens.forEach((token) => {
              console.log("TOOKENS", token.coinId)
              let arrayResult = Object.assign({ quantity: token.quantity }, ...walletCoinMarket.filter((coin) => token.coinId == coin.coinId))
              console.log("ARRRAYS", arrayResult)
              portfolioTokens.push(arrayResult)
            })
          }

        }
      }


      const coinList = await CoinGeckoClient.coins.list();

      if (portfolio.exchanges.length > 0) {
        for (let j = 0; j < portfolio.exchanges.length; j++) {
          if (portfolio.exchanges[j].network === "binance") {
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
              let arrayResult = Object.assign({ quantity: token.currency.quantity ? token.currency.quantity : token.value }, ...exchangeCoinMarket.filter((coin) => token.currency.name.toLowerCase() == coin.name.toLowerCase()))
              newExchangesTokens.sort((a, c) => a.coingecko_rank - c.coingecko_rank)
              newExchangesTokens.push(arrayResult)
              portfolioTokens.push(arrayResult)
            })


            portfolioTokens.push(exchangePortfolioTokens)
          }

          if (portfolio.exchanges[j].network === "coinbase") {
            const myClient = new Client({
              'apiKey': portfolio.exchanges[j].apiKey,
              'apiSecret': portfolio.exchanges[j].apiSecret,
              strictSSL: false
            });

            let portfolioTokens = [];
            let newToken = {}
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


      portfolioTokens = portfolioTokens.filter((token) => token.name != null)

      // console.log(portfolioTokens)

      metadata.cryptos = from(portfolioTokens).groupBy(tokens => tokens.name, null, (key, t) => {
        return {
          coinId: key,
          symbol: t.first().symbol,
          quantity: t.first().quantity,
          name: t.first().name,
          image: t.first().large,
          valueMarket: t.first().usd,
          value: t.first().quantity * t.first().usd,

          value_usd_24h: (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

          // value_usd_7d: (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? token["quantity"] * t.first().usd * t.first().price_change_percentage_24h / 100 : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          value_usd_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          value_usd_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          price_change_percentage_24h: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h),

          price_change_percentage_7d: (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) == 0 ? (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (100 / (t.sum(token => token["quantity"]) * t.first().usd)) * (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d),

          price_change_percentage_30d: (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,

          price_change_percentage_1y: (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (t.first().price_change_percentage_7d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 == 0 ? (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_24h) : (((t.sum(token => token["quantity"]) * t.first().usd) / 100) * t.first().price_change_percentage_7d) : (t.first().price_change_percentage_30d * (t.sum(token => token["quantity"]) * t.first().usd)) / 100 : (t.first().price_change_percentage_1y * (t.sum(token => token["quantity"]) * t.first().usd)) / 100,
        };
      }).toArray()

      console.log(metadata.cryptos)

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

    async addWalletConnection(_, { name, portfolioId, publicAddress, network, image }, context) {
      const user = checkAuth(context);


      let walletCoins = []
      let walletCoinMarket = []
      let portfolioTokens = []


      try {

        const userData = await User.findById(user._id)

        if (!userData) {
          throw new Error(701)
        }

        const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)
        const portfolio = userData.portfolios[portfolioIde];

        // userData.portfolios[portfolioIde].wallets.map(async (wallet) => {

        //   if (wallet.name == name || (wallet.address == publicAddress && wallet.network == network)) {
        //     throw new Error(801);
        //   }
        // })

        const wallets = await walletsRequests(publicAddress, network)
        const portfolioTokens = await coingeckoRequests(0, wallets)

        console.log(portfolioTokens)
        if (portfolio) {
          await userData.portfolios[portfolioIde].wallets.unshift({
            name,
            address: publicAddress,
            network: network,
            image: image,
            tokens: portfolioTokens
          });

          userData.save()

          return 200;

        } else {
          throw new Error(701);
        }
      } catch (err) {
        console.log(err)
      }
    },

    async updateDataConection(_, { portfolioId, walletId, exchangeId }, context) {

      // IURpgeQSLGIUMnRilvB62Iev7L2xK8kNUQVoJOb64hR5F6Rh9bA90mBfRDvDl8xc
      // Bq3t3Ik6s1xLyv4o2WDU6cuiUBWa5PKfhA3TuzIJwbMaoswGk9jcwBj0q6eHO3Ud

      const user = checkAuth(context);

      let walletCoins = []
      let walletCoinMarket = []
      let marketDataCryptos = []


      if (walletId == "" && exchangeId == "") {

        try {
          const userData = await User.findById(user._id)

          if (!userData) {
            throw new Error(701)
          }

          const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

          const portfolio = userData.portfolios[portfolioIde];
          if (portfolio) {

            // CONFIRMAR SI HAY WALLETS
            for (let l = 0; l < userData.portfolios[portfolioIde].wallets.length; l++) {

              const wallet = l;
              const walletApi = await walletsRequests(userData.portfolios[portfolioIde].wallets[wallet].address, userData.portfolios[portfolioIde].wallets[wallet].network)

              console.log(walletApi.tokens)
              let newCryptos = {
                tokens: []
              };

              walletApi.tokens.pop();

              let equals = -1;

              for (let index = 0; index < walletApi.tokens.length; index++) {
                for (let j = 0; j < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; j++) {
                  if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].wallets[wallet].tokens[j].apiSymbol) {
                    equals++
                  }
                }
              }

              if (equals != walletApi.tokens.length - 1) {
                let walletRestore = [];
                for (var i = 0; i < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; i++) {
                  for (var j = 0; j < walletApi.tokens.length; j++) {
                    if (userData.portfolios[portfolioIde].wallets[wallet].tokens[i].apiSymbol === walletApi.tokens[j].currency.symbol.toLowerCase()) {
                      walletRestore.push(userData.portfolios[portfolioIde].wallets[wallet].tokens[i]);
                      break;
                    }
                  }
                }

                userData.portfolios[portfolioIde].wallets[wallet].tokens = walletRestore


                walletApi.tokens.map((walletApiValue) => {
                  try {
                    from(userData.portfolios[portfolioIde].wallets[wallet].tokens).where((walletDbValue) => walletApiValue.currency.symbol.toLowerCase() == walletDbValue.apiSymbol).first()
                  } catch (err) {

                    newCryptos.tokens.push(walletApiValue);
                    console.log("ADD", walletApiValue)
                  }
                })

                let marketDataCryptos = await coingeckoRequests(0, newCryptos)
                marketDataCryptos.map((value, index) => {
                  userData.portfolios[portfolioIde].wallets[wallet].tokens.push({ coinId: value.coinId, quantity: newCryptos.tokens[index].value, symbol: newCryptos.tokens[index].currency.symbol });
                })




              }

              for (let index = 0; index < walletApi.tokens.length; index++) {
                for (let j = 0; j < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; j++) {
                  if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].wallets[wallet].tokens[j].apiSymbol && walletApi.tokens[index].value != userData.portfolios[portfolioIde].wallets[wallet].tokens[j].quantity) {
                    userData.portfolios[portfolioIde].wallets[wallet].tokens[j].quantity = walletApi.tokens[index].value;
                  }
                }
              }
            }

            //WALLET UPDATE END


            for (let l = 0; l < userData.portfolios[portfolioIde].exchanges.length; l++) {

              const wallet = l;
              const walletApi = await walletsRequests(userData.portfolios[portfolioIde].exchanges[wallet].address, userData.portfolios[portfolioIde].exchanges[wallet].network)

              console.log(walletApi.tokens)
              let newCryptos = {
                tokens: []
              };

              walletApi.tokens.pop();

              let equals = -1;

              for (let index = 0; index < walletApi.tokens.length; index++) {
                for (let j = 0; j < userData.portfolios[portfolioIde].exchanges[wallet].tokens.length; j++) {
                  if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].apiSymbol) {
                    equals++
                  }
                }
              }

              if (equals != walletApi.tokens.length - 1) {
                let walletRestore = [];
                for (var i = 0; i < userData.portfolios[portfolioIde].exchanges[wallet].tokens.length; i++) {
                  for (var j = 0; j < walletApi.tokens.length; j++) {
                    if (userData.portfolios[portfolioIde].exchanges[wallet].tokens[i].apiSymbol === walletApi.tokens[j].currency.symbol.toLowerCase()) {
                      walletRestore.push(userData.portfolios[portfolioIde].exchanges[wallet].tokens[i]);
                      break;
                    }
                  }
                }

                userData.portfolios[portfolioIde].exchanges[wallet].tokens = walletRestore


                walletApi.tokens.map((walletApiValue) => {
                  try {
                    from(userData.portfolios[portfolioIde].exchanges[wallet].tokens).where((walletDbValue) => walletApiValue.currency.symbol.toLowerCase() == walletDbValue.apiSymbol).first()
                  } catch (err) {

                    newCryptos.tokens.push(walletApiValue);
                    console.log("ADD", walletApiValue)
                  }
                })

                let marketDataCryptos = await coingeckoRequests(0, newCryptos)
                marketDataCryptos.map((value, index) => {
                  userData.portfolios[portfolioIde].exchanges[wallet].tokens.push({ coinId: value.coinId, quantity: newCryptos.tokens[index].value, symbol: newCryptos.tokens[index].currency.symbol });
                })
              }

              for (let index = 0; index < walletApi.tokens.length; index++) {
                for (let j = 0; j < userData.portfolios[portfolioIde].exchanges[wallet].tokens.length; j++) {
                  if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].apiSymbol && walletApi.tokens[index].value != userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].quantity) {
                    userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].quantity = walletApi.tokens[index].value;
                  }
                }
              }
            }

            await userData.save();

            return 200;


          }


        } catch (err) {
          console.log(err);
        }
      }
      else if (walletId != "") {

        try {
          const userData = await User.findById(user._id)

          if (!userData) {
            throw new Error(701)
          }

          const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

          const portfolio = userData.portfolios[portfolioIde];
          if (portfolio) {

            const wallet = userData.portfolios[portfolioIde].wallets.findIndex(wallet => wallet.id === walletId)
            const walletApi = await walletsRequests(userData.portfolios[portfolioIde].wallets[wallet].address, userData.portfolios[portfolioIde].wallets[wallet].network)

            console.log(walletApi.tokens)
            let newCryptos = {
              tokens: []
            };

            walletApi.tokens.pop();

            let equals = -1;

            for (let index = 0; index < walletApi.tokens.length; index++) {
              for (let j = 0; j < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; j++) {
                if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].wallets[wallet].tokens[j].apiSymbol) {
                  equals++
                }
              }
            }

            if (equals != walletApi.tokens.length - 1) {
              let walletRestore = [];
              for (var i = 0; i < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; i++) {
                for (var j = 0; j < walletApi.tokens.length; j++) {
                  if (userData.portfolios[portfolioIde].wallets[wallet].tokens[i].apiSymbol === walletApi.tokens[j].currency.symbol.toLowerCase()) {
                    walletRestore.push(userData.portfolios[portfolioIde].wallets[wallet].tokens[i]);
                    break;
                  }
                }
              }

              userData.portfolios[portfolioIde].wallets[wallet].tokens = walletRestore


              walletApi.tokens.map((walletApiValue) => {
                try {
                  from(userData.portfolios[portfolioIde].wallets[wallet].tokens).where((walletDbValue) => walletApiValue.currency.symbol.toLowerCase() == walletDbValue.apiSymbol).first()
                } catch (err) {

                  newCryptos.tokens.push(walletApiValue);
                  console.log("ADD", walletApiValue)
                }
              })

              let marketDataCryptos = await coingeckoRequests(0, newCryptos)
              marketDataCryptos.map((value, index) => {
                userData.portfolios[portfolioIde].wallets[wallet].tokens.push({ coinId: value.coinId, quantity: newCryptos.tokens[index].value, symbol: newCryptos.tokens[index].currency.symbol });
              })

            }

            for (let index = 0; index < walletApi.tokens.length; index++) {
              for (let j = 0; j < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; j++) {
                if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].wallets[wallet].tokens[j].apiSymbol && walletApi.tokens[index].value != userData.portfolios[portfolioIde].wallets[wallet].tokens[j].quantity) {
                  userData.portfolios[portfolioIde].wallets[wallet].tokens[j].quantity = walletApi.tokens[index].value;
                }
              }
            }

            await userData.save();

            return 200;
          }


        } catch (err) {
          console.log(err);
        }
      } else if (exchangeId != "") {

        try {
          const userData = await User.findById(user._id)

          if (!userData) {
            throw new Error(701)
          }

          const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

          let walletApi = {
            tokens: []
          };

          const portfolio = userData.portfolios[portfolioIde];
          if (portfolio) {

            const wallet = userData.portfolios[portfolioIde].exchanges.findIndex(wallet => wallet.id === exchangeId)

            if (userData.portfolios[portfolioIde].exchanges[wallet].network == "binance") {


              const client = new MainClient({
                api_key: userData.portfolios[portfolioIde].exchanges[wallet].apiKey,
                api_secret: userData.portfolios[portfolioIde].exchanges[wallet].apiSecret,
              });

              const data = await client.getBalances();

              const tokens = data.filter((token) => token.free > 0)
              const tokensQuantity = tokens.reduce((a, c) => a + Number(c.free), 0)

              let newToken = {}

              tokens.map((token) => {
                newToken = {}
                newToken.value = Number(token.free),
                  newToken.currency = {
                    symbol: token.coin,
                    name: token.name
                  }

                walletApi.tokens.unshift(newToken)
              })

            }

            console.log(walletApi)
            let newCryptos = {
              tokens: []
            };

            // walletApi..pop();

            let equals = -1;

            for (let index = 0; index < walletApi.tokens.length; index++) {
              for (let j = 0; j < userData.portfolios[portfolioIde].exchanges[wallet].tokens.length; j++) {
                if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].symbol) {
                  equals++
                }
              }
            }

            if (equals != walletApi.tokens.length - 1) {
              let walletRestore = [];
              for (var i = 0; i < userData.portfolios[portfolioIde].exchanges[wallet].tokens.length; i++) {
                for (var j = 0; j < walletApi.tokens.length; j++) {
                  if (userData.portfolios[portfolioIde].exchanges[wallet].tokens[i].symbol === walletApi.tokens[j].currency.symbol.toLowerCase()) {
                    walletRestore.push(userData.portfolios[portfolioIde].exchanges[wallet].tokens[i]);
                    break;
                  }
                }
              }

              userData.portfolios[portfolioIde].exchanges[wallet].tokens = walletRestore


              walletApi.tokens.map((walletApiValue) => {
                try {
                  from(userData.portfolios[portfolioIde].exchanges[wallet].tokens).where((walletDbValue) => walletApiValue.currency.symbol.toLowerCase() == walletDbValue.currency.symbol).first()
                } catch (err) {

                  newCryptos.tokens.push(walletApiValue);
                  console.log("ADD", walletApiValue)
                }
              })

              let marketDataCryptos = await coingeckoRequests(0, newCryptos)
              marketDataCryptos.map((value, index) => {
                userData.portfolios[portfolioIde].exchanges[wallet].tokens.push(newCryptos.tokens[index]);
              })

            }

            for (let index = 0; index < walletApi.tokens.length; index++) {
              console.log("ENTROOO")
              for (let j = 0; j < userData.portfolios[portfolioIde].exchanges[wallet].tokens.length; j++) {
                if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].symbol && walletApi.tokens[index].value != userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].value) {
                  userData.portfolios[portfolioIde].exchanges[wallet].tokens[j].value = walletApi.tokens[index].value;
                }
              }
            }

            await userData.save();

            return 200;
          }
        } catch (err) {
          console.log(err);
        }
      }



    },
    async updateWalletConnection(_, { name, portfolioId, walletId, active, all }, context) {


      const user = checkAuth(context);

      let walletCoins = []
      let walletCoinMarket = []
      let marketDataCryptos = []


      if (all) {



      } else {

        try {
          const userData = await User.findById(user._id)

          if (!userData) {
            throw new Error(701)
          }

          const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

          const portfolio = userData.portfolios[portfolioIde];
          if (portfolio) {

            const wallet = userData.portfolios[portfolioIde].wallets.findIndex(wallet => wallet.id === walletId)
            const walletApi = await walletsRequests(userData.portfolios[portfolioIde].wallets[wallet].address, userData.portfolios[portfolioIde].wallets[wallet].network)

            console.log(walletApi.tokens)
            let newCryptos = {
              tokens: []
            };

            walletApi.tokens.pop();

            let equals = -1;

            for (let index = 0; index < walletApi.tokens.length; index++) {
              for (let j = 0; j < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; j++) {
                if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].wallets[wallet].tokens[j].apiSymbol) {
                  equals++
                }
              }
            }

            if (equals != walletApi.tokens.length - 1) {
              let walletRestore = [];
              for (var i = 0; i < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; i++) {
                for (var j = 0; j < walletApi.tokens.length; j++) {
                  if (userData.portfolios[portfolioIde].wallets[wallet].tokens[i].apiSymbol === walletApi.tokens[j].currency.symbol.toLowerCase()) {
                    walletRestore.push(userData.portfolios[portfolioIde].wallets[wallet].tokens[i]);
                    break;
                  }
                }
              }

              userData.portfolios[portfolioIde].wallets[wallet].tokens = walletRestore


              walletApi.tokens.map((walletApiValue) => {
                try {
                  from(userData.portfolios[portfolioIde].wallets[wallet].tokens).where((walletDbValue) => walletApiValue.currency.symbol.toLowerCase() == walletDbValue.apiSymbol).first()
                } catch (err) {

                  newCryptos.tokens.push(walletApiValue);
                  console.log("ADD", walletApiValue)
                }
              })

              let marketDataCryptos = await coingeckoRequests(0, newCryptos)
              marketDataCryptos.map((value, index) => {
                userData.portfolios[portfolioIde].wallets[wallet].tokens.push({ coinId: value.coinId, quantity: newCryptos.tokens[index].value, symbol: newCryptos.tokens[index].currency.symbol });
              })

            }

            for (let index = 0; index < walletApi.tokens.length; index++) {
              for (let j = 0; j < userData.portfolios[portfolioIde].wallets[wallet].tokens.length; j++) {
                if (walletApi.tokens[index].currency.symbol.toLowerCase() == userData.portfolios[portfolioIde].wallets[wallet].tokens[j].apiSymbol && walletApi.tokens[index].value != userData.portfolios[portfolioIde].wallets[wallet].tokens[j].quantity) {
                  userData.portfolios[portfolioIde].wallets[wallet].tokens[j].quantity = walletApi.tokens[index].value;
                }
              }
            }

            await userData.save();

            return 200;
          }


        } catch (err) {
          console.log(err);
        }
      }

    },


    async updateExchangeConnection(
      _,
      { name, portfolioId, exchangeId, key, secret, active },
      context
    ) {
      const user = checkAuth(context);

      const userData = await User.findById(user._id)

      if (!userData) {
        throw new Error(701)
      }

      const portfolioIde = userData.portfolios.findIndex(port => port.id == portfolioId)

      const portfolio = userData.portfolios[portfolioIde];

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {

          const exchange = userData.portfolios[portfolioIde].exchanges.findIndex(exchange => exchange.id === exchangeId)

          const address = userData.portfolios[portfolioIde].exchange[wallet].address;
          const apiKey = userData.portfolios[portfolioIde].exchanges[wallet].network
          // const walletApi = await exchangeRequests(exchange, address, apiKey,  )

          await updateCryptos(exchange, walletApi, portfolioIde, userData)

          // const exchange = userData.portfolios[portfolioIde].exchanges.findIndex(exchange => exchange.id === exchangeId)
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

      const client = new MainClient({
        api_key: key,
        api_secret: secret,
      });

      const myClient = new Client({
        'apiKey': key, 'apiSecret': secret,
        strictSSL: false
      });

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
          })
          if (portfolio) {
            await userData.portfolios[portfolioIde].exchanges.unshift({
              name,
              apiKey: key,
              image: image,
              network: network,
              inusd: "ready",
              apiSecret: secret,
              tokens: portfolioTokens
            });



            await userData.save();
          }


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


          if (portfolio) {
            await userData.portfolios[portfolioIde].exchanges.unshift({
              name,
              apiKey: key,
              image: image,
              network: network,
              apiSecret: secret,
              tokens: portfolioTokens
            });

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


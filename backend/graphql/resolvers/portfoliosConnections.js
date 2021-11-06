import Portfolio from "../../models/portfolioModel.js"
import checkAuth from '../../utils/checkAuth.js';
import rp from "request-promise"
import Binance from 'binance';
import Coinbase from 'coinbase';
import Kucoin from 'kucoin-node-api';
import CoinGecko from 'coingecko-api';

const {Client} = Coinbase;



const { MainClient } = Binance;
const coinbaseClient = new Coinbase.Client({accessToken: "638adf181444ba8972ce76b77246b3043891be3008ad8f06558207b0dad75acd"});

const CoinGeckoClient = new CoinGecko();

const coinMarket = async (coinId) => {

  // let dataMarketall = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: "max"});
  // let dataMarket24h = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 1});
  // let dataMarket7d = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 7});
  // let dataMarket1m = await CoinGeckoClient.coins.fetchMarketChart(coinId, {days: 30});
  let dataMarket1y = await CoinGeckoClient.coins.fetchMarketChart(coinId, { days: 365 });

  // console.log(dataMarket1y.data.prices[0][1])
  // console.log(dataMarketall.data.prices)
  // console.log(dataMarket24h.data.prices)
  // console.log(dataMarket7d.data.prices)
  // console.log(dataMarket1m.data.prices)
  return dataMarket1y.data.prices[0][1];

}

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

    async getExchangeInfo(_, { key, secret }, context) {
      // const user = checkAuth(context);

      const client = new MainClient({
        api_key: key,
        api_secret: secret,
      });

      try {
        const data = await client.getBalances();
        const tokens = data.filter((token) => token.free > 0)
        const tokensQuantity = tokens.reduce((a, c) => a + Number(c.free), 0)
        console.log(tokens)
        console.log(tokensQuantity);
        // console.log(data.balances.free > 0? data.balances.free : 0 );
        return data;
      } catch (err) {
        console.log(err);
      }
    },

    async getWalletsConnection(_, { portfolioId }, context) {
      // const user = checkAuth(context);
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
    async getMetadataPortfolio(_, { portfolioId }, context) {

      const portfolio = await Portfolio.findById(portfolioId);

      // console.log(portfolio.wallets)
      if (portfolio) {
        try {

          const wallets = [];
          const exchanges = [];
          portfolio.exchanges.forEach(function (exchange) {
            if (!exchanges[exchange.network]) {
              exchanges[exchange.network] = {
                network: exchange.network,
                totalQuantity: 0,
                totalTokens: exchange.tokens
              }
              exchanges.push(exchanges[exchange.network]);
            };

            exchanges[exchange.network].totalQuantity = parseFloat(exchange.quantity) + parseFloat(exchanges[exchange.network].totalQuantity);
            exchanges[exchange.network].totalTokens.push(exchange.tokens);
          })

          portfolio.wallets.forEach(function (wallet) {

            if (!wallets[wallet.network]) {
              wallets[wallet.network] = {
                network: wallet.network,
                totalQuantity: 0,
                totalTokens: wallet.tokens
              }
              wallets.push(wallets[wallet.network]);
            };

            // const tokens = wallet.tokens.reduce((a, d) => (a[d]? a[d].value += d.value : a[d] = d , a) ,{})

            wallets[wallet.network].totalQuantity = parseFloat(wallet.quantity) + parseFloat(wallets[wallet.network].totalQuantity);
            wallets[wallet.network].totalTokens.push(wallet.tokens);

            // wallets[wallet.network].tokens = tokens;
          });

          const tokens = wallets.bsc.totalTokens.reduce((a, d) => (a[d] ? a[d].value += d.value : a[d] = d, a), {})

          let metadata = {}

          const { data } = await CoinGeckoClient.coins.markets({ per_page: 10000 });


          let walletCryptos = []


          wallets.map((wallet) => {

            metadata = {
              balance: wallet.totalQuantity,
              cryptos: []
            }

            walletCryptos = [...wallet.totalTokens.map((token) => {
              // console.log(token.currency)
              for (let i = 0; i < data.length; i++) {
                if (token.currency.symbol) {
                  if (token.currency.symbol.toString().toLowerCase() == data[i].symbol) {
                    // console.log(data[i].name)
                    token.image = data[i].image
                    // console.log(convertValue(Number(token.value),s token.currency.symbol))
                    // token.quantity = token.currency.valueMarket != null && token.value != null? Number(token.value) / Number(token.currency.valueMarket) : 0

                    // convertValue(Number(data[i].current_price), token.currency.symbol)
                    token.currency.valueMarket = data[i].current_price != null && token.currency.symbol != null ? data[i].current_price : 0
                    if (token.currency.valueMarket) {
                      // console.log(convertValue(token.value, token.currency.symbol));
                      token.value = convertValue(Number(token.quantity), token.currency.symbol)
                      token.quantity = quantityMarket(token.value, token.currency.valueMarket)

                      // coinMarket(token.currency.symbol)
                      // token.value1y = coinMarket(token.currency.symbol)[0]? coinMarket(token.currency.symbol)[0] : 1 ;  


                      // const cm = coinMarket("bitcoin");

                      // const convalue = cm.then(function (result) {
                      //   return result
                      // })

                      // console.log("Conva", convalue)
                      // token.value1y = Number(token.currency.valueMarket) / convalue;
                    }

                  }
                }
              }
              return token
            })]
          })
          
          

          exchanges.map((exchange) => {

            metadata.cryptos = [...walletCryptos, ...exchange.totalTokens.map((token) => {
              // console.log(token.currency)
              for (let i = 0; i < data.length; i++) {
                if (token.currency.symbol) {
                  if (token.currency.symbol.toString().toLowerCase() == data[i].symbol) {
                    token.image = data[i].image
                    // console.log(convertValue(Number(token.value),s token.currency.symbol))
                    // token.quantity = token.currency.valueMarket != null && token.value != null? Number(token.value) / Number(token.currency.valueMarket) : 0

                    // convertValue(Number(data[i].current_price), token.currency.symbol)
                    token.currency.valueMarket = data[i].current_price != null && token.currency.symbol != null ? data[i].current_price : 0
                    if (token.currency.valueMarket) {
                      // console.log(convertValue(token.value, token.currency.symbol));
                      token.quantity = token.value;
                      const val = convertValue(Number(token.quantity), token.currency.symbol)

                      function valueConver(){
                        val.then( function(result) {
                          token.value = result;                      
                          console.log(result)
                          return result
                        });

                      }

                      setTimeout(() => {
                        valueConver()
                      }, 2000)




                      // coinMarket(token.currency.symbol)
                      // token.value1y =  ((Number(token.currency.valueMarket) / coinMarket("bitcoin")) - 1) * 100;  
                      token.value1y = coinMarket("bitcoin");

                      // token.value1m =   
                    }

                  }
                }
              }
              return token
            })]
          })


          metadata.cryptos = metadata.cryptos.filter(function (crypto) {
            return crypto.currency.valueMarket != null
          })

          return metadata;
        }
        catch (err) {
          console.log(err)
        }
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
      "network": "bsc",
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
        console.log(data)
        if (portfolio) {

          await portfolio.wallets.unshift({
            name,
            address: publicAddress,
            network: network,
            image: image,
            quantity: 100,
            // quantity: data.data.ethereum.address[0].balance?data.data.ethereum.address[0].balance * 3846 : 0,
            tokens: data.data.ethereum.address[0].balances? data.data.ethereum.address[0].balances.filter((bal, index) => bal.value > 0 && index > 0): []
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
    async deleteWalletConnection(
      _,
      { portfolioId, walletId },
      context
    ) {
      // const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          const walletIndex = portfolio.wallets.findIndex((w) => w.id === walletId);

          portfolio.wallets.splice(walletIndex, 1)

          // console.log(portfolio.wallets)

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
      { input: { name, image, portfolioId, key, secret } },
      context
    ) {

      // const user = checkAuth(context);

      // const client = new MainClient({
      //   api_key: key,
      //   api_secret: secret,
      // });
  
      // const coinbaseClient = Client(
      //   {
      //     apiKey: key,
      //     apiSecret: secret
      //   }
      // )


    const myClient = new Client({ 'apiKey':key, 'apiSecret':secret, 
    strictSSL:false });

      myClient.getAccounts({}, function(err, accounts) {
           accounts.forEach(function(acct) {
             console.log('my bal: ' + acct + ' for ' + acct.name);
           });
         });


      // coinbaseClient.getAccounts({}, function(err, accounts) {
      //   accounts.forEach(function(acct) {
      //     console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
      //   });
      // });

      // console.log(coinbaseClient)

   

      // try {
      //   const data = await client.getBalances();
      //   const tokens = data.filter((token) => token.free > 0)
      //   const tokensQuantity = tokens.reduce((a, c) => a + Number(c.free), 0)
      //   console.log(tokensQuantity);
      //   const portfolio = await Portfolio.findById(portfolioId);

      //   let portfolioTokens = [];
      //   let newToken = {}

      //   tokens.map((token) => {
      //     newToken = {}
      //     newToken.value = Number(token.free),
      //       newToken.currency = {
      //         symbol: token.coin,
      //         name: token.name
      //       }


      //     portfolioTokens.unshift(newToken)
      //   })

      //   console.log(portfolioTokens)

      //   if (portfolio) {
      //     await portfolio.exchanges.unshift({
      //       name,
      //       apiKey: key,
      //       image: image,
      //       quantity: tokensQuantity,
      //       apiSecret: secret,
      //       tokens: portfolioTokens
      //     });

      //     portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.exchanges[0].quantity);
      //     await portfolio.save();

      //     return 200;
      //   } else {
      //     throw new Error(701);
      //   }
      // } catch (err) {
      //   console.log(err);
      //   throw new Error(701);
      // }

      return 200
    },
  },
};


import Portfolio from "../../models/portfolioModel.js"
import checkAuth from '../../utils/checkAuth.js';
import rp from "request-promise"
import Binance from 'binance';
import Coinbase from 'coinbase';
import Kucoin from 'kucoin-node-api';

const { MainClient } = Binance;
const { Client } = Coinbase;

export default {

  Query: {

    async getExchangeInfo(_, { key, secret }, context) {
      // const user = checkAuth(context);

      const client = new MainClient({
        api_key: key,
        api_secret: secret,
      });

      try {
        const data = await client.getAccountInformation();
        console.log(data.balances);
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

          // console.log(tokens)
          wallets.map((wallet) => {
            // console.log(wallet.totalQuantity)
            console.log(wallet.totalTokens[0])

            metadata = {
              balance: wallet.totalQuantity,
              cryptos: []
            }


            metadata.cryptos = wallet.totalTokens.map((token) => { return token })
          })

          console.log(metadata)
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


          console.log(data.data.ethereum.address[0].balance)
          await portfolio.wallets.unshift({
            name,
            address: publicAddress,
            network: network,
            image: image,
            quantity: data.data.ethereum.address[0].balance * 3846,
            tokens: data.data.ethereum.address[0].balances.filter((bal, index) => bal.value > 0 && index > 0)
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

          if(portfolio.wallets[wallet].id === walletId)
          {
            portfolio.wallets[wallet] = ({
              name: name? name : portfolio.wallets[wallet].name,
              address: publicAddress? publicAddress : portfolio.wallets[wallet].address,
              active: active? active : portfolio.wallets[wallet].active,
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


      // try {
      //   const portfolio = await Portfolio.findById(portfolioId);
      //   if (portfolio) {
      //     await portfolio.wallets.unshift({
      //       name,
      //       address: publicAddress,
      //       active: active
      //     });

      //     await portfolio.save();
      //     return 200;
      //   } else {
      //     throw new Error(701);
      //   }
      // } catch (err) {
      //   console.log(err);
      // }
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
          portfolio.wallets = portfolio.wallets.filter((w) => w.id != walletId);

          console.log(portfolio.wallets)

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


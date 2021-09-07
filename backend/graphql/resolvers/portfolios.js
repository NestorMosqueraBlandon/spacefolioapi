import Portfolio from "../../models/portfolioModel.js";
import checkAuth from "../../utils/checkAuth.js";

import nbr from 'node-bitcoin-rpc'

nbr.init()
let host = 'localhost';
let port = 8332;
let user = 'bitcoinrpc';
let pass = 'foo';

function initBitcoinRpc() {
  nbr.init(host, port, user, pass);
  nbr.setTimeout(2000);
}

export default {

  Query: {
    async getPortfolios(_, {userId}, context) {
      const user = checkAuth(context);
      try {
        const portfolios = await Portfolio.find().sort({ createdAt: -1, user: userId });
          return portfolios;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPortfolio(_, { portfolioId, userId }, context) {
      const user = checkAuth(context);
      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          if(userId === portfolio.user){
            return portfolio;
          }else{
            return 105
          }
        } else {
          throw new Error(701);
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    // 1MzxJi4TsiyChnwvSTvWQgS5dyegnKjy9B
    // CONNECTION
    async getWalletBalance() {
      // await initBitcoinRpc();

      nbr.init(host, port, user, pass)
      await nbr.call('getbalance', ['1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX'], function (err, res) {
        if (err !== null) {
          console.log('I have an error :( ' + err + ' ' + res.error)
        } else {
          console.log('Yay! I need to do whatevere now with ' + res.result)
        }
      })
    },

  //   async getTransactions() {
  //     await initBitcoinRpc();

  //     await nbr.call('listtranssactions', ['*', 1], (err, res) => {
  //       if(err){
  //         console.log(err)
  //       }else{
  //         console.log(res)
  //       }
  //     })
  //   },
  //   async getTransaction() {
  //     await initBitcoinRpc();

  //     await nbr.call('gettransaction', ['texid'], (err, res) => {
  //       if(err){
  //         console.log(err)
  //       }else{
  //         console.log(res)
  //       }
  //     })
  //   },
   },

  Mutation: {
    async createPortfolio(_, { input: { name, dfCurrency } }, context) {
      const user = checkAuth(context);
      try {
        const newPortfolio = new Portfolio({
          name,
          dfCurrency,
          user: user.id
        })

        await newPortfolio.save();

        return 202
      } catch (err) {
        return err
      }
    },

    async deletePortfolio(_, { portfolioId }, context) {
      const user = checkAuth(context);

      try {
        if (user) {
          const portfolio = await Portfolio.findById(portfolioId);
          await portfolio.delete();
          return 202
        }
      }
      catch (err) {
        throw new Error(err);
      }
    },

    // PORTFOLIOS CONNECTION

    // async syncPortfolio(_, {name, portfolioId, address}){
      
    // },

    // async generateAddress() {
    //   await initBitcoinRpc();
      
    //   const address = await nbr.call('generatenewaddress', [], (err, res) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(res);
    //     }
    //   })
    // },
    
    // async sendMoneyToAddress(_, {address, amount}){
    //   await initBitcoinRpc();

    //   await nbr.call('getbalance', [], (err, res) => {
    //     if(err){
    //       reject(err);
    //     }else if(res.result > amount){
    //       nbr.call('sentdtoaddress', [address, amount], (err, res1) => {
    //         try{
    //           console.log(txid, res1.result);

    //         }
    //         catch(err){
    //           console.log(err)
    //         }
    //       })
    //     }else{
    //       console.log('No amount in wallet')
    //     }

    //   })
    }
  }

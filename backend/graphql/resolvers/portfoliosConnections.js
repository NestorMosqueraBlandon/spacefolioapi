import Portfolio from '../../models/portfolioModel.js';
import checkAuth from '../../utils/checkAuth.js';
import Tatum from '@tatumio/tatum';
import Binance from 'binance';
import Coinbase from 'coinbase';
import Kucoin from 'kucoin-node-api';
// import { Kraken } from 'node-kraken-api';

const { MainClient } = Binance;
const { Client } = Coinbase;

// 614909570da0301fbc0ec2f9

// BINANCE
// wbOCGQPL4kIIFgSy3ZB9Sv2Pttx1xSrwlk7eNae0WEjU8biVd8RDolxi5eINdUSB
// TLKVxLPXgVuutdCPFgep3QWhIvUxkf3gviWwaGJAk19iFG77qrkc549IeEOXLtNw

// COINBASE
// ZhivcNNiWwKY6aM4
// 9WhpTnlxssplvyecDq0kduDVWQ6wxMCh

//
const { btcGetBalance, btcGetTransaction, btcGetTxForAccount } = Tatum;

export default {
  Query: {
    async getWalletBalance(_, { address }, context) {
      const user = checkAuth(context);
      const balance = await btcGetBalance(address);
      let e = null;
      for (e in balance) {
        //
      }

      console.log(balance[e]);
      return balance[e];
    },

    async getTransaction(_, { address }, context) {
      const user = checkAuth(context);

      try {
        const transaction = await btcGetTransaction(address);
        
        return transaction;
      } catch (err) {
        console.log(err);
      }
    },

    async getTransactions(_, { account }, context) {
      const user = checkAuth(context);
      try {
        const transactions = await btcGetTxForAccount(account);
        console.log(transactions);
        return transactions;
      } catch (err) {
        console.log(err);
      }
    },

    async getExchangeInfo(_, { key, secret }, context) {
      const user = checkAuth(context);

      const client = new MainClient({
        api_key: key,
        api_secret: secret,
      });

      try {
        const data = await client.getExchangeInfo();
        console.log(data);
        return data;
      } catch (err) {
        console.log(err);
      }
    },

    async getExchangeBalance(_, { key, secret }, context) {
      const user = checkAuth(context);

      const client = new MainClient({
        api_key: key,
        api_secret: secret,
      });

      try {
        const data = await client.getBalances();
        console.log(data);
        return data;
      } catch (err) {
        console.log(err);
      }
    },
    async getCoinbaseAccounts(_, { key, secret }, context) {
      const user = checkAuth(context);

      const client = new Client({
        apiKey: key,
        apiSecret: secret,
      });

      const data = client.getAccounts({}, function(err, accounts) {
        accounts.forEach(function(acct) {
          console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
        });
      });

      console.log(data);
    },
    async getCoinbaseBalance(_, { key, secret, accountId }, context) {
      const user = checkAuth(context);

      const client = new Client({
        apiKey: key,
        apiSecret: secret,
      });

      const data = client.getAccount('<ACCOUNT ID>', function(err, account) {
        console.log(
          'bal: ' +
            account.balance.amount +
            ' currency: ' +
            account.balance.currency
        );
      });

      console.log(data);
    },
    async getCoinbaseTransactions(_, { key, secret, accountId }, context) {
      const user = checkAuth(context);

      const client = new Client({
        apiKey: key,
        apiSecret: secret,
      });

      const data = account.getTransactions(null, function(err, txns) {
        txns.forEach(function(txn) {
          console.log('my txn status: ' + txn.status);
        });
      });

      console.log(data);
    },

    async getKucoinAccounts(_, { key, secret }, context) {
      const user = checkAuth(context);

      const client = {
        apiKey: key,
        apiSecret: secret,
        environment: 'live',
      };

      Kucoin.init(client);

      try {
        const data = await Kucoin.getAccounts();
      } catch (err) {
        console.log(err);
      }
    },
    async getKucoinAccount(_, { key, secret, accountId }, context) {
      const user = checkAuth(context);

      const client = {
        apiKey: key,
        apiSecret: secret,
        environment: 'live',
      };

      Kucoin.init(client);

      try {
        const data = await Kucoin.getAccountById(accountId);

      } catch (err) {
        console.log(err);
      }
    },
  },

  Mutation: {
    async addWalletConnection(
      _,
      { name, portfolioId, publicAddress },
      context
    ) {
      const user = checkAuth(context);

      try {
        const portfolio = await Portfolio.findById(portfolioId);
        if (portfolio) {
          await portfolio.wallets.unshift({
            name,
            address: publicAddress,
          });

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

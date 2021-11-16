import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    balance: { type: Number, default: 0 },
    dfCurrency: { type: String },
    sellTransactions: [
      {
        userId: String,
        coinId: String,
        quantity: Number,
        buyPrice: [Object],
        exchangue: Boolean,
        tradingPair: String,
        feeId: String,
        date: String,
        time: String,
        note: String,
        model: Number,
        createdAt: String,
      },
    ],
    buyTransactions: [
      {
        userId: String,
        coinId: String,
        quantity: Number,
        buyPrice: [Object],
        exchangue: Boolean,
        tradingPair: String,
        feeId: [Object],
        date: String,
        time: String,
        note: String,
        model: Number,
        createdAt: String,
        type: String
      },
    ],
    transferTransactions: [
      {
        from: String,
        to: String,
        quantity: Number,
        buyPrice: [Object],
        exchangue: Boolean,
        tradingPair: String,
        feeId: [Object],
        date: String,
        time: String,
        note: String,
        createdAt: String,
      },
    ],
    wallets: [
      {
        name: {type: String, unique: true},
        address: {type: String, unique: true},
        network: String,
        active: {type: Boolean, default: true},
        image: String,
        quantity: String,
        tokens: [
          {
            currency: {
              address: String,
              symbol: String,
              name: String
            },
            value: Number
          }
        ]
      },
    ],
    exchanges: [
      {
        name: String,
        apiKey: String,
        apiSecret: String,
        network: String,
        active: {type: Boolean, default: true},
        image: String,
        quantity: Number,
        inusd: {type: String, default: "no" },
        tokens: [
          {
            currency:{
              address: String,
              symbol: String,
              name: String,
              quantity: Number,
            },
            value: Number
          }
        ]
      },
    ],

    coinBlacklist: [
      {
        name: String
      }
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;

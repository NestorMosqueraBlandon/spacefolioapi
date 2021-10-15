import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, trim: true },
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
        name: String,
        address: String,
        active: {type: Boolean, default: true}
      },
    ],
    exchanges: [
      {
        name: String,
        apiKey: String,
        apiSecret: String,
      },
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

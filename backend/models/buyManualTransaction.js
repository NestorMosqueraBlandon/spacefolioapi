import mongoose from 'mongoose';

const buyManualTransactionSchema = new mongoose.Schema(
  {
    userId: { type: String },
    coinId: { type: String, required: true },
    quantity: { type: Number, required: true },
    buyPrice: [
      {
        type: Number,
        value: Number,
      },
    ],
    exchangue: { type: Boolean },
    tradingPair: { data: String },
    feeId: [
      {
        type: String,
        value: String,
      },
    ],
    date: { data: String },
    time: { data: String },
    usdt: { data: Boolean },
    note: { data: String },
    type: { data: String },
  },
  {
    timestamps: true,
  }
);

const BuyManualTransaction = mongoose.model(
  'BuyManualTransaction',
  buyManualTransactionSchema
);

export default BuyManualTransaction;

import mongoose from 'mongoose';

const exchangeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    network: { type: String },
    symbol: { type: String },
    image:{ type: String}
  },
  {
    timestamps: true,
  }
);

const Exchange = mongoose.model(
  'Exchange',
  exchangeSchema
);

export default Exchange;

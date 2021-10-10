import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image:{ type: String}
  },
  {
    timestamps: true,
  }
);

const Wallet = mongoose.model(
  'Wallet',
  walletSchema
);

export default Wallet;

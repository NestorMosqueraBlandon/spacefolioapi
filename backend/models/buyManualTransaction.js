import mongoose from 'mongoose';

const buyManualTransactionSchema = new mongoose.Schema({
    userId: {type: String},
    coinId: {type: String, required: true},
    quantity: {type: Number, required: true},
    buyPrice: {type: Number, required: true},
    exchangue: {type: Boolean},
    tradingPair:{ data: String},
    feeId:{ data: String},
    date:{ data: String},
    time:{ data: String},
    note:{ data: String},
    type:{ data: String},
},{
    timestamps: true
});

const BuyManualTransaction = mongoose.model('BuyManualTransaction', buyManualTransactionSchema);

export default BuyManualTransaction;
import mongoose from 'mongoose';

const sellManualTransactionSchema = new mongoose.Schema({
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

const SellManualTransaction = mongoose.model('SellManualTransaction', sellManualTransactionSchema);

export default SellManualTransaction;
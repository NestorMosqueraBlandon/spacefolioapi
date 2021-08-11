import mongoose from 'mongoose';

const transferTransactionSchema = new mongoose.Schema({
    userId: {type: String},
    from: {type: String},
    to: {type: String},
    quantity: {type: Number, required: true},
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

const transferTransaction = mongoose.model('transferTransaction', transferTransactionSchema);

export default transferTransaction;
import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    name: {type: String, unique:true, trim:true},
    balance: {type: Number, default: 0},
    dfCurrency: {type: String, },
    sellTransactions:[
        {
            userId:  String,
            coinId: String,
            quantity:  Number,
            buyPrice:  Number,
            exchangue:  Boolean,
            tradingPair: String,
            feeId: String,
            date: String,
            time: String,
            note: String,
            model: Number,
            createdAt: String
        }
    ],
    buyTransactions:[
        {
            userId:  String,
            coinId: String,
            quantity:  Number,
            buyPrice:  Number,
            exchangue:  Boolean,
            tradingPair: String,
            feeId: String,
            date: String,
            time: String,
            note: String,
            model: Number,
            createdAt: String
        }
    ],
    transferTransactions:[
        {
            from:  String,
            to: String,
            quantity:  Number,
            buyPrice:  Number,
            exchangue:  Boolean,
            tradingPair: String,
            feeId: String,
            date: String,
            time: String,
            note: String,
            createdAt: String
        }
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
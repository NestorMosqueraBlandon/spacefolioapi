import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    name: {type: String, required: true, unique:true, trim:true},
    balance: {type: String, required: true},
    dfCurrency: {type: String, required: true},
    transanctions:[
        {
            type: {type: String},
            transactionId: {type:String}
        }
    ]
},{
    timestamps: true
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
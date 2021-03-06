import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    activateCode: { type: String, required: true },
    activate: { type: Boolean, required: true, default: false },
    balance: { type: Number, default: 0 },
    subscriptionStatus: { type: String, },
    subscriptionId: { type: String },
    token: { data: String, dafault: '' },
    portfolios: [
        {
            name: { type: String, trim: true, unique: false},
            balance: { type: Number, default: 0 },
            dfCurrency: { type: String },
            portfolioGeneralChart: { type: String },
            wallets: [
                {
                    name: { type: String, unique: false},
                    address: { type: String, unique: false },
                    network: String,
                    active: { type: Boolean, default: true },
                    image: String,
                    quantity: String,
                    tokens: [
                        {
                            coinId: String,
                            quantity: Number,
                            symbol:String,
                            address: String,
                            apiSymbol: String

                        }
                    ]
                },
            ],
            exchanges: [
                {
                    name: {type: String, unique: false},
                    apiKey: String,
                    apiSecret: String,
                    network: String,
                    active: { type: Boolean, default: true },
                    image: String,
                    quantity: Number,
                    inusd: { type: String, default: "no" },
                    tokens: [
                        {
                            currency: {
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
                    name:{String, unique: false}
                }
            ],

        }
    ],

    portfolioGeneralChart: { type: String }


}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
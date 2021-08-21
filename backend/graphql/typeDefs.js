const typeDefs = `

type Query{
 
    users: [User]
    coinList: [Coin]
    exchangeList: [Exchange]
    getSellTransaction(userId: String): [SellTransaction]
    getBuyTransaction(userId: String): [BuyTransaction]
    getTransferTransaction(userId: String): [TransferTransaction]
    currencyList: [Coin]
    getPortfolios: [Portfolio]
    getPortfolio(portfolioId: ID!): Portfolio
}

type Portfolio {
    id: ID!
    name: String!
    dfCurrency: String!
    sellTransanctions: [SellTransaction]!
    buyTransanctions: [SellTransaction]!
    transferTransanctions: [TransferTransaction]!
    tranferCount: Int!
    sellCount: Int!
    createdAt: String!
}

type User{
    _id: ID
    email: String!
    password: String!
}

type Exchange{
    id: String
    name: String
    image: String
}

type SellTransaction{
    userId: String
    coinId: String
    quantity: String
    buyPrice: String 
    exchangue: Boolean
    tradingPair: String
    feeId: String
    date: String
    time: String
    note: String
    type: String
}

type BuyTransaction{
    userId: String
    coinId: String
    quantity: String
    buyPrice: String 
    exchangue: Boolean
    tradingPair: String
    feeId: String
    date: String
    time: String
    note: String
    type: String
}

type TransferTransaction{
    userId: String
    coinId: String
    quantity: String
    buyPrice: String 
    exchangue: Boolean
    tradingPair: String
    feeId: String
    date: String
    time: String
    note: String
    type: String
}

type Coin{
    id: String
    name: String
    image: String
}

type MessageSignup {
    otpCode: String!
    
}
type MessageSignin {
    token: String!
    userId: ID!
}

type ActivateEmail {
    userId: String
    token: String
}


input UserInput{
    email: String!
    password: String!
}

input AddManualTransactionInput{
    portfolioId: String
    model: String!
    coinId: String!
    quantity: String!
    buyPrice: String!
    exchange: String
    tradingPair: String
    fee: String
    date: String
    time: String
    note: String
}

input AddTransferTransactionInput{
    portfolioId: String!
    from: String!
    to: String!
    quantity: String!
}


input ResetPasswordInput{
    token: String!
    newPassword: String!
}

input SignupInput{
    email: String!
    password: String!
}

input CreatePortfolioInput{
    name: String!
    dfCurrency: String!
}

type Mutation{
    signup(signupInput: SignupInput): MessageSignup
    signin(email: String!, password: String!): MessageSignin
    emailActivate(otpCode: String): ActivateEmail
    forgotPassword(email: String): String!
    resetPassword(input: ResetPasswordInput): String!
    addManualTransaction(input: AddManualTransactionInput) : String!
    transferTransaction(input: AddTransferTransactionInput) : String!
    newCode(email: String): MessageSignin
    createPortfolio(input: CreatePortfolioInput) : String!
    deleteBuySellTransaction(portfolioId: ID!, transactionId: ID!): SellTransaction!
}
`;

export default typeDefs;
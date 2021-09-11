const typeDefs = `

type Query{
    users: [User]
    coinList: [Coin]
    exchangeList: [Exchange]
    getSellTransaction(userId: String): [SellTransaction]
    getBuyTransaction(userId: String): [BuyTransaction]
    getTransferTransaction(userId: String): [TransferTransaction]
    currencyList: [Coin]
    getPortfolios(userId: ID): [Portfolio]
    getPortfolio(portfolioId: ID!, userId: ID): Portfolio
    getWalletBalance(address: String!): String
    getTransaction(address: String!): String
    getTransactions(account: String!): [Transaction]
}

type Portfolio {
    id: ID!
    name: String!
    dfCurrency: String!
    balance: String!
    sellTransactions: [SellTransaction]
    buyTransactions: [SellTransaction]
    transferTransactions: [TransferTransaction]
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

type Balance{
    incoming: String
}

type Transaction{
    blockNumber: String,
    fee: String
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
    symbol: String
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
    signup(signupInput: SignupInput): String
    signin(email: String!, password: String!): MessageSignin
    emailActivate(otpCode: String): ActivateEmail!
    forgotPassword(email: String): String!
    resetPassword(input: ResetPasswordInput): String!
    addManualTransaction(input: AddManualTransactionInput) : String!
    transferTransaction(input: AddTransferTransactionInput) : String!
    newCode(email: String): MessageSignin
    createPortfolio(input: CreatePortfolioInput) : String!
    deleteBuySellTransaction(portfolioId: ID!, transactionId: ID!): SellTransaction!
    deletePortfolio(portfolioId : ID!) : String!
    addWalletConnection(name: String, portfolioId: String, publicAddress: String): String
}
`;

export default typeDefs;
const typeDefs = `

type Query{
    users: [User]
    coinList: [Coin]
    exchangeList: [Exchange]
    walletsList: [Wallet]
    getSellTransaction(userId: String): [SellTransaction]
    getBuyTransaction(userId: String): [BuyTransaction]
    getTransferTransaction(userId: String): [TransferTransaction]
    fiatList: [Fiat]
    getPortfolios(userId: ID): [Portfolio]
    getPortfolio(portfolioId: ID!, userId: ID): Portfolio
    getWalletBalance(address: String!, type: String!): String
    getTransaction(address: String!): String
    getTransactions(account: String!): [Transaction]
    getExchangeInfo(key: String!, secret: String!): String
    getExchangeBalance(key: String!, secret: String!): String
    getCoinbaseAccounts(key: String!, secret: String!): String
    getCoinbaseBalance(key: String!, secret: String!, accountId: String!): String
    getCoinbaseTransactions(key: String!, secret: String!, accountId: String!): String
    getKucoinAccounts(key: String!, secret: String!): String
    getKucoinAccount(key: String!, secret: String!, accountId: String!): String
    getWalletTransactionByAddress(address: String!): String
    getMetadataPortfolio(portfolioId: String!): Metadata
    getWalletsConnection(portfolioId: String!): [WalletConnection]
}

type Metadata{
    balance: String
    cryptos: [Crypto]
}

type Crypto{
    name: String
    balance: String
    image: String
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

type WalletConnection{
    id: ID
    name: String
    address: String
}

type Wallet{
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

type Img{
    thumb: String
    small: String
    large: String
}

type Coin{
    id: String
    name: String
    image: Img
    symbol: String
}

type Fiat{
    id: String
    name: String
    sign: String
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
    buyPriceValue: String!
    buyPriceType: String!
    feeValue: String!
    feeType: String!
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
    initialValue: String!
}

input CreateWalletInput{
    name: String!
    img: String
}

input ExchangeConnection {
    name: String! 
    portfolioId: String! 
    key: String! 
    secret: String!
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
    updateWalletConnection(name: String, portfolioId: String!): String
    deleteWalletConnection(portfolioId: String, walletId: String!): String
    addExchangeConnection(input: ExchangeConnection): String!
}
`;

export default typeDefs;

const typeDefs = `

type Query{
    users: [User]
    coinList(page: String): [Coin]
    newsList(page:String): [New]
    coinMarket(coinId: String): Data
    portfolioMarket(portfolioId: String): PotfolioMarket
    exchangeList(page: String): [Exchange]
    walletsList: [Wallet]
    exchangeListAvailable: [Wallet]
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

type New{
    feedDate: String
    title: String
    description: String
    imgURL: String
    link: String
}
type Metadata{
    balance: String
    cryptos: [Crypto]
}

type Currency{
    name: String
    symbol: String
}
type Crypto{    
    currency: Currency
    value: String
    quantity: String
    image: String
    value1y: String
    value1m: String
    value7d: String
    value24h: String
    valueall: String
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
    year_established: String
    url: String
    trust_score_rank: String
    trade_volume_24h_btc: String

}

type WalletConnection{
    id: ID
    name: String
    address: String
    active: String
    network: String
    image: String
    tokens: [Token]
}

type Token{
    id: ID
    currency: Currency
    value: String
}

type Currency{
    address: String
    symbol: String
    name: String
    valueMarket: String
}

type Wallet{
    id: String
    name: String
    image: String
    network: String
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

type Data{
    coin: Coin
    marketall: String
    market24h: String
    market7d: String
    market1m: String
    market1y: String
}

type PotfolioMarket{
    coin: Coin
    marketall: String
    market24h: String
    market7d: String
    market1m: String
    market1y: String
}

type Market{
    prices: String
}

type Caps{
    item1: String
    item2: String
}

type Det{
    value: [String]
}

type Coin{
    id: String
    name: String
    image: String
    symbol: String
    current_price: String
    market_cap_rank: String
    price_change_percentage_24h: String
    price_change_24h:String
    sentiment_votes_up_percentage:String
    sentiment_votes_down_percentage:String

    market_data: MarketData
    links: Links

}

type Links{
    homepage: [String]
}

type MarketData{
    current_price: String
    low_price_24h: String
    high_price_24h: String
    price_change_percentage_24h: String
    price_change_percentage_7d:String
    price_change_percentage_14d:String
    price_change_percentage_30d:String
    price_change_percentage_60d:String
    price_change_percentage_200d:String
    price_change_percentage_1y: String
    market_cap_change_percentage_24h_in_currency: String
    market_cap_change_24h_in_currency: String
    total_supply:String
    max_supply:String
    circulating_supply:String
    last_updated:String
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
    network: String! 
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
    updatePortfolio(portfolioId: ID!, name: String, coinBlacklist: String) : String!
    addCoinBlackList(portfolioId: ID!, coinBlacklist: String): String
    deleteCoinBlackList(portfolioId: ID!, coinBlacklistId: ID): String
    addWalletConnection(name: String, portfolioId: String, publicAddress: String, network: String, image: String): String
    updateWalletConnection(name: String, portfolioId: String!, walletId: String): String
    deleteWalletConnection(portfolioId: String, walletId: String!): String
    addExchangeConnection(input: ExchangeConnection): String!
    handlePayment(email: String): String
    cancelSubscription(subscriptionId: String): String

}

type Subscription{
    checkPayment: String
}
`;

export default typeDefs;

import graphqlTools from 'graphql-tools';
const { makeExecutableSchema } = graphqlTools;

import {resolvers} from './resolvers.js';

const typeDefs = `
    type Query{
        users: [User]
        coinList: [Coin]
        exchangeList: [Exchange]
        getSellTransaction(userId: String): [SellTransaction]
        getBuyTransaction(userId: String): [BuyTransaction]
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

    type Coin{
        id: String
        name: String
        image: String
    }

    type MessageSignup {
        otpCode: String!
        user: User
        
    }
    type MessageSignin {
        token: String
        userId: String
    }

    type ActivateEmail {
        user: User
        token: String
    }

    type Mutation{
        signup(input: UserInput): MessageSignin
        signin(input: UserInput): MessageSignin
        emailActivate(token: String): ActivateEmail
        forgotPassword(email: String): String!
        resetPassword(input: ResetPasswordInput): String!
        addManualTransaction(input: AddManualTransactionInput) : String!
        transferTransaction(input: AddTransferTransactionInput) : String!
    }
  
    input UserInput{
        email: String!
        password: String!
    }
  
    input AddManualTransactionInput{
        userId: String!
        type: String!
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
        userId: String!
        from: String!
        to: String!
        quantity: String!
    }
    

    input ResetPasswordInput{
        token: String!
        newPassword: String!
    }
`;

export default makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers
});

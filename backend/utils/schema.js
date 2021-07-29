import { makeExecutableSchema } from '@graphql-tools/schema';
import {resolvers} from './resolvers.js';

const typeDefs = `
    type Query{
        users: [User]
    }

    type User{
        _id: ID
        email: String!
        password: String!
    }

    type MessageSignup {
        token: String!
        user: User
        
    }
    type MessageSignin {
        token: String
        user: User
    }

    type Mutation{
        signup(input: UserInput): MessageSignin
        signin(input: UserInput): MessageSignin
        emailActivate(token: String): Boolean!
        forgotPassword(email: String): String!
        resetPassword(input: ResetPasswordInput): String!
    }
  
    input UserInput{
        email: String!
        password: String!
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

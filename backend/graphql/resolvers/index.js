import manualTransactionsResolvers from "./manualTransactions.js";
import usersResolvers from "./users.js";

export default {
    Query:{
        ...usersResolvers.Query,
        ...manualTransactionsResolvers.Query
    },
    
    Mutation:{
        ...usersResolvers.Mutation,
        ...manualTransactionsResolvers.Mutation
        
    }
}
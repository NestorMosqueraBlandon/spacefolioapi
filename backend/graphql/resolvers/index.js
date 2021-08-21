import manualTransactionsResolvers from "./manualTransactions.js";
import usersResolvers from "./users.js";
import portfolioResolvers from "./portfolios.js";
import general from "./general.js";

export default {
    Query:{
        ...usersResolvers.Query,
        ...manualTransactionsResolvers.Query,
        ...portfolioResolvers.Query,
        ...general.Query
    },
    
    Mutation:{
        ...usersResolvers.Mutation,
        ...manualTransactionsResolvers.Mutation,
        ...portfolioResolvers.Mutation
    }
}
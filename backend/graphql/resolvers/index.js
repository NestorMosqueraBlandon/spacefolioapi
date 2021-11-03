import manualTransactionsResolvers from "./manualTransactions.js";
import usersResolvers from "./users.js";
import portfolioResolvers from "./portfolios.js";
import connectionResolvers from "./portfoliosConnections.js";
import general from "./general.js";
import walletTransactions from "./walletTransactions.js";

export default {
    Query: {
        ...usersResolvers.Query,
        ...manualTransactionsResolvers.Query,
        ...portfolioResolvers.Query,
        ...connectionResolvers.Query,
        ...general.Query,
    },

    Mutation: {
        ...usersResolvers.Mutation,
        ...manualTransactionsResolvers.Mutation,
        ...portfolioResolvers.Mutation,
        ...connectionResolvers.Mutation,
        // ...walletTransactions.Mutation
    }
}
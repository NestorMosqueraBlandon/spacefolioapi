import apollo  from "apollo-server";
const { ApolloServer } = apollo;
import './database/connectDB.js';
import cron from "node-cron"
import dotenv from 'dotenv'

dotenv.config();

// GRAPHQL
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';

import config from './utils/config.js';
import { portfolioChart } from "./graphql/resolvers/portfoliosConnections.js";


const server = new ApolloServer({
    cors: true,
    typeDefs,
    resolvers,
    context: ({req}) => ({req}),
});

const port = config.PORT;

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})




// setInterval(() => portfolioChart(100), 10)

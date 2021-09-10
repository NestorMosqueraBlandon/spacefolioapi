import apollo  from "apollo-server";
const { ApolloServer } = apollo;
import './database/connectDB.js';

import dotenv from 'dotenv'

dotenv.config();

// GRAPHQL
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';

import config from './utils/config.js';

import data from './data.js';


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => ({req})
});

const port = config.PORT;

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})


// import express from 'express';
// import expressGraphql from 'express-graphql';
// import bodyParser from 'body-parser';
// import userRouter from './routes/userRouter.js';
// import cors from 'cors';
// import schema from './utils/schema.js';

// import resolvers from './graphql/resolvers/index.js';

 
// const { graphqlHTTP } = expressGraphql;
// const app = express();


// const root = {
//     server: () => {
//         return 'Server is ready!';
//     },
// };

// app.get('/', (req, res) => {
//     res.json({
//         message: 'Server is ready'
//     });
// });

//Middlewares
// app.use(cors());

// app.use('/graphql', graphqlHTTP({
//     schema: schema,
//     rootValue: root,
//     graphiql: true,
//     context: {
//         messageId: 'Text'
//     }
// }));

// const port = config.PORT;
// app.listen(port, () => {
//     console.log(`Server is running on port:  http://localhost:${port}`);
//     console.log(`Running a GraphQL API server at http://localhost:${port}/graphql`);
// });


// app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
// app.use(/\/((?!graphql).)*/, bodyParser.json());



// app.use((err,req,res, next) => {
//     res.status(500).send({message: err.message});
// });




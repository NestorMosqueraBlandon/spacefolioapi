import express from 'express';
import config from './utils/config.js'
import expressGraphql from 'express-graphql';
import bodyParser from 'body-parser';
import './database/connectDB.js'
import userRouter from './routes/userRouter.js';
import data from './data.js';
import cors from 'cors';
import schema from './utils/schema.js';

// GRAPHQL
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';


const { graphqlHTTP } = expressGraphql;
const app = express();


const root = {
    server: () => {
        return 'Server is ready!';
    },
};

app.get('/', (req, res) => {
    res.json({
        message: 'Server is ready'
    });
});

//Middlewares
app.use(cors());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: {
        messageId: 'Text'
    }
}));

const port = config.PORT;
app.listen(port, () => {
    console.log(`Server is running on port:  http://localhost:${port}`);
    console.log(`Running a GraphQL API server at http://localhost:${port}/graphql`);
});


// app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
// app.use(/\/((?!graphql).)*/, bodyParser.json());



// app.use((err,req,res, next) => {
//     res.status(500).send({message: err.message});
// });




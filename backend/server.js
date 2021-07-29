import express from 'express';
import config from './utils/config.js'
import expressGraphql from 'express-graphql';
import bodyParser from 'body-parser';
import database from './database/connectDB.js'
import userRouter from './routes/userRouter.js';
import data from './data.js';
import schema from './utils/schema.js';

const { graphqlHTTP } = expressGraphql;

const app = express();

database.call();
app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
app.use(/\/((?!graphql).)*/, bodyParser.json());

const root = {
    hello: () => {
        return 'Hello world!';
    },
};

//Middlewares
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'Hello world'
    });
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: {
        messageId: 'Text'
    }
}));

app.use((err,req,res, next) => {
    res.status(500).send({message: err.message});
});

const port = config.PORT;
app.listen(port, () => {
    console.log(`Server is running on port:  http://localhost:${port}`);
    console.log(`Running a GraphQL API server at http://localhost:${port}/graphql`);
});



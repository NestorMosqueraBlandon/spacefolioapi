import express from 'express';
import database from './database/connectDB.js'
import dotenv from 'dotenv'; // to use env variables
import userRouter from './routes/userRouter.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
database.call();

//Middlewares
app.use('api/users', userRouter);


app.use((err,req,res, next) => {
    res.status(500).send({message: err.message});
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port:  http://localhost:${port}`);
})
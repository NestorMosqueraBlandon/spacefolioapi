import mongoose from 'mongoose';

 const connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/spacefolio', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }).then(() => console.log('Database connected established'))
    .catch(err => console.log('Database connection error: ', err));
}

export default connectDB;
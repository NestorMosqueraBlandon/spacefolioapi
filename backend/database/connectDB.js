import mongoose from 'mongoose';
import config from '../utils/config.js';

 const connectDB = () => {
    mongoose.connect(config.MONGODB_URL || 'mongodb://localhost/spacefolio', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }).then(() => console.log('Database connected established'))
    .catch(err => console.log('Database connection error: ', err));
}

export default connectDB;
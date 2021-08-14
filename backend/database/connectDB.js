import mongoose from 'mongoose';
import config from '../utils/config.js';

(async () => {
    try{
        const db = await mongoose.connect(config.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        console.log('Database is connected to:', db.connection.name)
    }catch(err){
        console.error(err);
    }
})();
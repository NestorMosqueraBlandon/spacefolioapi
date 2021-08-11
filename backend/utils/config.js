import path from 'path';
import dotenv from 'dotenv'; // to use env variables
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});

export default {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 9000,
    MONGODB_URL:'mongodb+srv://spacefolio:spacefolio@cluster0.thboz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    // MONGODB_URL:'mongodb://localhost/spacefolio',
    SKIP_PREFLIGHT_CHECK:true,
    MAILGUN_APIKEY:'a5e2f6a88af9e5de3261717aa90f7df0-e31dc3cc-65a8594d',
    JWT_ACC_ACTIVATE:'accountactivatekey123',
    CLIENT_URL:'http://localhost:3000',
    RESET_PASSWORD_KEY:'passwordresetkey123456',
    JWT_SIGNIN_KEY:'signinkey1234',
}
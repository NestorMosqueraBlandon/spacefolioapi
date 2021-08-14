import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import CoinGecko from 'coingecko-api';
const CoinGeckoClient = new CoinGecko();

import { sendConfirmationEmail, sendResetPassword } from '../services/emailService.js';
import config from './config.js';

import BuyManualTransaction from '../models/buyManualTransaction.js';
import SellManualTransaction from '../models/sellManualTransaction.js';
import TransferTransaction from '../models/transferTransaction.js';


export const resolvers = {

    Mutation: {
   
        // TRANSACTION
   
        
    }
}
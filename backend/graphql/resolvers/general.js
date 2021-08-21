import CoinGecko from "coingecko-api";

import BuyManualTransaction from '../../models/buyManualTransaction.js';
import SellManualTransaction from '../../models/sellManualTransaction.js';
import TransferTransaction from '../../models/transferTransaction.js';
import checkAuth from "../../utils/checkAuth.js";
import User from '../../models/userModel.js'

import fetch from 'node-fetch'

const CoinGeckoClient = new CoinGecko();
export default {
    Query:{

        async currencyList(){
            try{
                const data = await fetch('https://free.currconv.com/api/v7/currencies?apiKey=f554853b73ecb60b35d4');
                console.log(data)
                // let e = null;
                // for(e in data){
                //     //
                // }
                // return data[e];
            }catch(err){
                throw new Error(err);
            }
        },

    },


}
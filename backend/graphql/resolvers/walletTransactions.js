import CoinGecko from 'coingecko-api';
import Wallet from "../../models/walletModel.js";

const CoinGeckoClient = new CoinGecko();
export default {

    Mutation: {
        async createWallet(
            _,
            { name, image, network },
        ) {
            try {
                const newWallet = new Wallet({
                    name,
                    network
                });

                await newWallet.save();

                return 200;
            } catch (err) {
                return err;
            }
        },


    async updateImageWallet(_, { name}, context) {
        const { data } = await CoinGeckoClient.coins.markets({per_page: 10000});

        const wallets = await Wallet.find();
        try {
            const newWallets = [...wallets.map((wallet) => {
                for(let i = 0; i < data.length; i++){
                    if(wallet.symbol.toString().toLowerCase() == data[i].symbol){
                        wallet.image = data[i].image
                         wallet.save();
                    }
                }
                return wallet;
            })]

            
            
            // wallets = newWallets;
            return 200;
        } catch (err) {
            return err;
        }
    },

    },
};


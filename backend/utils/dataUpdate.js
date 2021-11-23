import Portfolio from "../models/portfolioModel.js";
import rp from "request-promise"


export const walletAndExchangeUpdate = async () => {

    const portfolios = await Portfolio.find();
    portfolios.map(async (portfolio) => {
        portfolio.wallets.map(async (wallet) => {

            const query = `
      query ($network: EthereumNetwork!, $address: String!) {
        ethereum(network: $network) {
          address(address: {is: $address}) {
            balances {
              currency {
                address
                symbol
                tokenType
                name
              }
              value
            }
            balance
          }
        }
      }
      
    `;

            const variables = `
    {
      "network": "${wallet.network}",
      "address": "${wallet.address}"
    }
    
  `;

            const requestOptions = {
                method: 'POST',
                uri: `https://graphql.bitquery.io`,
                headers: {
                    "Content-Type": "application/json",
                    'X-API-KEY': 'BQYmmb3rW726zLmxE3Fd5aMSyr7AtWT5'
                },
                body: ({
                    query,
                    variables
                }),
                json: true,
                gzip: true
            };

            const { data } = await rp(requestOptions);
            console.log(data)
            if (data.ethereum.address[0].balances) {
            
            portfolio.wallets[wallet.id] = ({                
                tokens:  data.ethereum.address[0].balances.filter((bal) => bal.value > 0)
              })    
            }

            console.log(portfolio)
        })

    })

    // try {
    //     const portfolio = await Portfolio.findById(portfolioId);

    //     if (portfolio) {
    //         if (data.ethereum.address[0].balances) {


    //             portfolio.balance = parseFloat(portfolio.balance) + parseFloat(portfolio.wallets[0].quantity);
    //             await portfolio.save();
    //         }

    //         return 200;
    //     } else {
    //         throw new Error(701);
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
}
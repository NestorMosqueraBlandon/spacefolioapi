import Portfolio from "../../models/portfolioModel"

export default{
    Query:{

    },

    Mutation:{
        async createPortfolio(_, {userId, name, dfCurrency}){
            // const user = checkAuth(context);
            try{
                const newPortfolio = new Portfolio({
                    userId,
                    name,
                    dfCurrency
                })

                await newPortfolio.save();

                return 'Portfolio created successfully'
            }catch(err){
                return err
            }
        }


    }
}
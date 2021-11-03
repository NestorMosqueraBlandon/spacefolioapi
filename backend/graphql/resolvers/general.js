import rp from "request-promise"

export default {
  Query: {
    async fiatList() {

      const requestOptions = {
        method: 'GET',
        uri: 'https://pro-api.coinmarketcap.com/v1/fiat/map',
        qs: {
          'start': '1',
          'limit': '5000',
          
        },
        headers: {
          'X-CMC_PRO_API_KEY': '91f97ef8-bc4e-40f9-9d20-7e7e67af1776'
        },
        json: true,
        gzip: true
      };

      try{
        const data  = await rp(requestOptions);
        // console.log(data.data)
        return data.data
      }
      catch(err){
        console.log(err)
      }
    },

    async newsList(_, {page}){
      const requestOptions = {
        method: 'GET',
        uri: `https://api.coinstats.app/public/v1/news?skip=${page}&limit=30`,
        headers: {},
        json: true,
        gzip: true
      };

      try{
        const {news}  = await rp(requestOptions);
        return news
      }
      catch(err){
        console.log(err)
      }

    }
  },
};

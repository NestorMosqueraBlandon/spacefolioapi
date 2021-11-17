import rp from "request-promise"
import Stripe from "stripe";
const stripe = Stripe("sk_test_51JQIemFkdOhFel1fusJiZze5dFbv1OD75min6QFSX8LwTSsnGcMoTnU86sIHcWuINEj1UgP4jGcw9KapU7sY9eY200o59GjBm1")
import checkAuth from '../../utils/checkAuth.js';
import User from "../../models/userModel.js"
import {urlGoogle} from "../../utils/googleAuth.js"
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
        return data.data
      }
      catch(err){
        console.log(err)
      }
    },

    async newsList(_, {page}){
      const requestOptions = {
        method: 'GET',
        uri: `https://api.coinstats.app/public/v1/news`,
        qs: {
          'skip': Number(page) * 20,
        },
        headers: {},
        json: true,
        gzip: true
      };

      try{
        const news  = await rp(requestOptions);
        console.log(news)
        return news.news
      }
      catch(err){
        console.log(err)
      }

    },

    async googleAuth(_, {}){
      const url = urlGoogle()

      return url
    }


  },

  Mutation: {

    async handlePayment(_, {email, paymentMethod}, context){
      
      const user = checkAuth(context);
      
      const priceId = "price_1JuOneFkdOhFel1fNi9rSVuB"
  
      const customer = await stripe.customers.create({
        payment_method: paymentMethod,
        email: email
      })

      try{
        const userId = user._id
        const userData = await User.findById(userId);

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: priceId,
          }],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        });

        userData.subscriptionStatus = subscription.status;
        userData.subscriptionId = subscription.id;

        await userData.save();

        console.log(subscription.id, subscription.status)
      }catch(err)
      {
        console.log(err)
      }  
    },

    async cancelSubscription(_, {subscriptionId}, context){
      const deletedSubscription = await stripe.subscriptions.del(subscriptionId);

      return 200
    }
  },

  Subscription: {
    async chackPayment(){
      let event;

      try{
        event = stripe.webhooks.constructEvent()
      }catch(err){
        console.log(err)
        return 700
      }

      const dataObject = event.data.object;

      switch (event.type) {
        case "invoice.paid":
          break;
        case "invoice.payment_failed":
            break;
        case "customer.subscription.deleted":
          break;
        default:
          break;
      }

      return 200
    }

   
  }
  
};
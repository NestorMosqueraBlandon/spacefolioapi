import jwt from 'jsonwebtoken';
import config from './config.js';

export default (context) => {
    // context = { ... headers }
    const authHeader =  context.req.headers.authorization;
    if(authHeader){
        // Bearer .....
        const token = authHeader.split('Bearer ')[1];
        if(token){
            try{
                const user = jwt.verify(token, config.SECRET_KEY);
                return user;
            }catch(err){
                throw new Error('Invalid/Expired token');
            }
        }

        throw new Error('Authentication token must be \' Bearer [token]')
    }
    throw new Error('Authorization token must be provided')
}
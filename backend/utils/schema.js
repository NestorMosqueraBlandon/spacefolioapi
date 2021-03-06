import graphqlTools from 'graphql-tools';
const { makeExecutableSchema } = graphqlTools;
import resolvers from '../graphql/resolvers/index.js';
import typeDefs from '../graphql/typeDefs.js';


export default makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers 
});



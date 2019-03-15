// graphql yoga is built on top of express server and apollo

const { GraphQLServer } = require('graphql-yoga');

const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

// Create the GeraphQl yoga server

function createServer() {
  return new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: {
      Mutation,
      Query
    },
    resolverValidationOptions: {
      requireResolverForResolveType: false
    },
    context: req => ({ ...req, db })
  });
}

module.exports = createServer;

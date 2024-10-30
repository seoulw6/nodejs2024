const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');
const express = require('express');

const schema = buildSchema(`
    type Query {    
        hello: String
        welcome(name: String!): String
    }
`);
// String! String필수
// hello  method 
// resolver 
// client library for react https://www.apollographql.com/docs/react/get-started/
const root = {
    hello: () => {
        return 'Hello GraphQL!';
    },
    welcome: ({ name }) => {
        return `Welcome ${name}`;
    }
};

const app = express();
app.use('/graphql',
    graphqlHTTP({
        schema: schema,     //schema
        rootValue: root,    //resolver
        graphiql: true      //true: web based tool to test the API 기본 제공
    })
);

app.listen(4000, () => {
    console.log('Running a GraphQL API server at localhost:4000/graphql');
});

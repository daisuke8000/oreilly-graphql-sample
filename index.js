// 1. require apollo-server-express and express
const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const expressPlayground = require(`graphql-playground-middleware-express`).default
const { readFileSync } = require(`fs`)
let typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

const resolvers = require('./resolvers')

//  2. Add express-application
const app = express()

const server = new ApolloServer({ typeDefs, resolvers })
console.log(server)
// 3. Add middleware to application
server.start().then( res => {
    server.applyMiddleware({app});
    // 4. listen port for 4000
    app.listen({ port: 4000 }, () => {
        console.log(`GraphQl Server running @ http://localhost:4000${server.graphqlPath}`)
    })
})

// 5. root add
app.get('/', (req, res) => res.end(`Welcome to the PhotoShare API`))
app.get('/playground', expressPlayground({ endpoint: `/graphql` }))
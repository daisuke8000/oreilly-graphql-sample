// 1. require apollo-server-express and express
const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const { GraphQLScalarType } = require(`graphql`)

const typeDefs = `
   scalar DateTime
   enum PhotoCategory {
     SELFIE
     PORTRAIT
     ACTION
     LANDSCAPE
     GRAPHIC
   }

   type Photo {
     id: ID!
     url: String!
     name: String!
     description: String
     created: DateTime!
     category: PhotoCategory
     postedBy: User!
     taggedUsers: [User!]!
   }

   type User {
     githubLogin: ID!
     name: String
     avatar: String
     postedPhotos: [Photo!]!
     inPhotos: [Photo!]!
   }

   type Query {
     totalPhotos: Int!
     allPhotos(after: DateTime): [Photo!]!
   }

   input PostPhotoInput {
     name: String!
     category: PhotoCategory=PORTRAIT
     description: String
   }

   type Mutation {
     postPhoto(input: PostPhotoInput!): Photo!
   }
`

let _id = 0
const users = [
    {"githubLogin": "mHattrup", "name": "Mike Hattrup"},
    {"githubLogin": "gPlake", "name": "Glen Plake"},
    {"githubLogin": "sSchmidt", "name": "Scot Schmidt"}
]
const photos = [
    {
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "The heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake",
        "created" : "3-28-2020"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created" : "1-2-2019"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created" : "2018-04-15T19:09:57.308Z"
    }
]
const tags = [
    {"photoID": "1", "userID": "gPlake"},
    {"photoID": "2", "userID": "sSchmidt"},
    {"photoID": "2", "userID": "mHattrup"},
    {"photoID": "2", "userID": "gPlake"}
]

const resolvers = {
   Query: {
      totalPhotos: () => photos.length,
       allPhotos: (parent, args) => {
          console.log(args.after)
           console.log(typeof(args.after))
           return photos
               .filter((photo) => Date.parse(photo.created) > Date.parse(args.after))
      }
   },
    Mutation: {
       postPhoto (parent,args) {
           const newPhoto = {
               id: _id++,
               ...args.input,
               created: new Date()
           }
           photos.push(newPhoto)
           return newPhoto
       },
    },
    Photo: {
       url: parent => `https://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
           return users.find(u => u.githubLogin === parent.githubUser)
        },
        taggedUsers: parent => tags
            // 対象ユーザーが関係しているタグ配列を返す
            .filter(tag => tag.photoID === parent.id)
            // タグの配列をユーザーIDの配列に変換する
            .map(tag => tag.userID)
            // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
            .map(userID => users.find(u => u.githubLogin === userID))
    },
    User: {
       postedPhotos: parent => {
           return photos.filter(p => p.githubUser === parent.githubLogin)
       },
        inPhotos: parent => tags
            // 対象ユーザーが関係しているタグ配列を返す
            .filter(tag => tag.userID === parent.id)
            // タグの配列を写真IDの配列に変換する
            .map(tag => tag.photoID)
            // 写真IDの配列を写真オブジェクトの配列に変換する
            .map(photoID => photos.find(p => p.id === photoID))
    },
    DateTime: new GraphQLScalarType({
        name: `DateTime`,
        description: `A valid date time value`,
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

//  2. Add express-application
const app = express()

const server = new ApolloServer({ typeDefs, resolvers })

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

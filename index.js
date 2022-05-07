const { ApolloServer } = require(`apollo-server`)
const typeDefs = `
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
     category: PhotoCategory
   }

   type Query {
     totalPhotos: Int!
     allPhotos: [Photo!]!
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
let photos = []

const resolvers = {
   Query: {
      totalPhotos: () => photos.length,
       allPhotos: () => photos
   },
    Mutation: {
       postPhoto (parent,args) {
           const newPhoto = {
               id: _id++,
               ...args.input
           }
           photos.push(newPhoto)
           return newPhoto
       },
    },
    Photo: {
       url: parent => `https://yoursite.com/img/${parent.id}.jpg`
    }
}


const server = new ApolloServer({
   typeDefs,
   resolvers
})

server.listen().then(({url}) => console.log(`GraphQl Service running on ${url}`))
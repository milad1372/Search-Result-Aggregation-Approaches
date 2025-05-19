const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    artworkCount: Int
    savedArtworks: [Artwork]
  }

  type Artwork {
    artworkId: String!
    title: String!
    type: String
    image: String
    description: String
  }

  type Auth {
    token: ID!
    user: User
  }

  input ArtworkInput {
    artworkId: String!
    title: String!
    type: String
    image: String
    description: String
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveArtwork(input: ArtworkInput): User
    removeArtwork(artworkId: String!): User
  }
`;

module.exports = typeDefs;

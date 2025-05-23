import { gql } from "@apollo/client";

export const GET_ME = gql`
  {
    me {
      _id
      username
      email
      savedArtworks {
        artworkId
        description
        title
        image
      }
    }
  }
`;

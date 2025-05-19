import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const SAVE_ARTWORK = gql`
  mutation saveArtwork($input: ArtworkInput) {
    saveArtwork(input: $input) {
      _id
      username
      artworkCount
      savedArtworks {
        artworkId
        title
        type
        image
        description
      }
    }
  }
`;

export const REMOVE_ARTWORK = gql`
  mutation removeArtwork($artworkId: String!) {
    removeArtwork(artworkId: $artworkId) {
      _id
      username
      artworkCount
      savedArtworks {
        artworkId
        title
        type
        image
        description
      }
    }
  }
`;

import React from "react";
import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
} from "react-bootstrap";
import { GET_ME } from "../utils/queries";
import { REMOVE_ARTWORK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeArtworkId } from "../utils/localStorage";
import { useQuery, useMutation } from "@apollo/react-hooks";

const SavedArtworks = () => {
  const { loading, data } = useQuery(GET_ME);
  let userData = data?.me || {};
  const [removeArtwork] = useMutation(REMOVE_ARTWORK);

  // function that accepts the artwork's mongo _id value as param and deletes the artwork from the database
  const handleDeleteArtwork = async (artworkId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { user } = await removeArtwork({
        variables: {
          artworkId: artworkId,
        },
      });

      userData = user;
      removeArtworkId(artworkId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Viewing saved artworks!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedArtworks?.length
            ? `Viewing ${userData.savedArtworks.length} saved ${
                userData.savedArtworks.length === 1 ? "artwork" : "artworks"
              }:`
            : "You have no saved artworks!"}
        </h2>
        <CardColumns>
          {userData.savedArtworks?.map((artwork) => {
            return (
              <Card key={artwork.artworkId} border="dark">
                {artwork.image ? (
                  <Card.Img
                    src={artwork.image}
                    alt={`The artwork titled ${artwork.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{artwork.title}</Card.Title>
                  <Card.Text>{artwork.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteArtwork(artwork.artworkId)}
                  >
                    Delete this Artwork!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedArtworks;

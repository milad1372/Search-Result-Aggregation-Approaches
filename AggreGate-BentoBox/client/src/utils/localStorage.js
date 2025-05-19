export const getSavedArtworkIds = () => {
  const savedArtworkIds = localStorage.getItem('saved_artworks')
    ? JSON.parse(localStorage.getItem('saved_artworks'))
    : [];

  return savedArtworkIds;
};

export const saveArtworkIds = (artworkIdArr) => {
  if (artworkIdArr.length) {
    localStorage.setItem('saved_artworks', JSON.stringify(artworkIdArr));
  } else {
    localStorage.removeItem('saved_artworks');
  }
};

export const removeArtworkId = (artworkId) => {
  const savedArtworkIds = localStorage.getItem('saved_artworks')
    ? JSON.parse(localStorage.getItem('saved_artworks'))
    : null;

  if (!savedArtworkIds) {
    return false;
  }

  const updatedSavedArtworkIds = savedArtworkIds?.filter((savedArtworkId) => savedArtworkId !== artworkId);
  localStorage.setItem('saved_artworks', JSON.stringify(updatedSavedArtworkIds));

  return true;
};

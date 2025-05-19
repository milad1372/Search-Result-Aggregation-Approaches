import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import "../css/common.css";
import {
  Container,
  Col,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import Auth from "../utils/auth";
import { saveArtworkIds, getSavedArtworkIds } from "../utils/localStorage";
import { SAVE_ARTWORK } from "../utils/mutations";
import { useMutation } from "@apollo/react-hooks";
import "./SearchArtworks.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import getRecords from "../api/getRecordsApi";
import Chip from "@mui/material/Chip";
import { withStyles } from "@mui/styles"; // Updated import
import makeStyles from "@mui/styles/makeStyles"; // Use @mui/styles
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import saveGalleryIntoDataBase from "../api/saveGalleryApi";
import saveLikedArtworkIntoDataBase from "../api/saveLikedArtworksApi";
import deleteArtworkFromGallery from "../api/deleteArtworkFromGalleryApi";
import deleteLikedArtworkFromDataBase from "../api/deleteLikedArtworkFromDataBaseApi";
import getGalleries from "../api/getGalleriesApi";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const StyledChip = withStyles({
  label: {
    marginRight: -3,
  },
  icon: {
    position: "absolute",
    right: 10,
    backgroundColor: "#000",
  },
})(Chip);

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const SearchArtworks = ({
  isLoading,
  totalPages,
  searchedArtworks,
  filters,
  onFilterChange,
  onChipDelete,
}) => {
  const [savedArtworkIds, setSavedArtworkIds] = useState(getSavedArtworkIds());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [artworkData, setArtworkData] = useState([]);
  const [showProgressbar, setShowProgressbar] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddModalChildOpen, setIsAddModalChildOpen] = useState(false);
  const [galleryName, setGalleryName] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryPrivate, setGalleryPrivate] = useState(false);
  const [addedArtworkToGallery, setAddedArtworkToGallery] = useState("");
  const [addedArtworkImageToGallery, setAddedArtworkImageToGallery] =
    useState("");
  const [userGalleries, setUserGalleries] = useState([]);
  const [pageIsLoading, setPageIsLoading] = useState(false);
  const [savedArtworks, setSavedArtworks] = useState(() => {
    if (localStorage.getItem("savedArtworks")) {
      return JSON.parse(localStorage.getItem("savedArtworks"));
    }
    return {};
  });

  useEffect(() => {
    const fetchArtworks = async () => {
      setShowProgressbar(true);
      setPageIsLoading(true);
      const response = await getRecords(
        localStorage.getItem("currentQuery"),
        filterQuery,
        currentPage
      );
      console.log(response);
      setShowProgressbar(false);
      setPageIsLoading(false);
      const updatedArtworkData = (response?.artworkData || []).map(
        (artwork) => {
          if (artwork.liked) {
            artwork.isFavorited = true;
          }
          return artwork;
        }
      );
      setArtworkData(updatedArtworkData);
      setTotalRecords(response?.totalPages || 0);
    };

    fetchArtworks();
  }, [filterQuery, currentPage]);

  useEffect(() => {
    setShowProgressbar(isLoading);
    setCurrentPage(1);
    setTotalRecords(totalPages);
    const updatedArtworkData = searchedArtworks.map((artwork) => {
      if (artwork.liked) {
        artwork.isFavorited = true;
      }
      return artwork;
    });
    setArtworkData(updatedArtworkData);

    return () => {
      saveArtworkIds(savedArtworkIds);
    };
  }, [isLoading, searchedArtworks, totalPages]);

  const [saveArtwork] = useMutation(SAVE_ARTWORK);

  const handleSaveArtwork = async (artworkId) => {
    const artworkToSave = searchedArtworks.find(
      (artwork) => artwork.artworkId === artworkId
    );

    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const response = await saveArtwork({
        variables: {
          input: artworkToSave,
        },
      });

      if (!response) {
        throw new Error("something went wrong!");
      }

      setSavedArtworkIds([...savedArtworkIds, artworkToSave.artworkId]);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (pageNumber) => {
    setShowProgressbar(true);
    setCurrentPage(pageNumber);
    getPaginatedArtworks(pageNumber).then((data) => {
      const updatedArtworkData = data.map((artwork) => {
        if (artwork.liked) {
          artwork.isFavorited = true;
        }
        return artwork;
      });
      setArtworkData(updatedArtworkData);
      setShowProgressbar(false);
    });
  };

  const getPaginatedArtworks = async (pageNumber) => {
    const response = await getRecords(
      localStorage.getItem("currentQuery"),
      localStorage.getItem("currentFilter"),
      pageNumber
    );
    const updatedArtworkData = (response?.artworkData || []).map((artwork) => {
      if (artwork.liked) {
        artwork.isFavorited = true;
      }
      return artwork;
    });
    setTotalRecords(response?.totalPages || 0);
    setArtworkData(updatedArtworkData);
    return response?.artworkData || [];
  };

  const handleCardClick = (artwork, event) => {
    if (isAddModalOpen) {
      return;
    }

    const target = event.target;
    let currentElement = target;
    let isInsideDataAndButtonsWrapper = false;
    while (currentElement) {
      if (
        currentElement.classList.contains("data-and-buttons-wrapper") ||
        currentElement.classList.contains("MuiSvgIcon-root") ||
        currentElement.classList.contains("bullet-pad-left") ||
        currentElement.classList.contains("bullet")
      ) {
        isInsideDataAndButtonsWrapper = true;
        break;
      }
      currentElement = currentElement.parentElement;
    }
    if (isInsideDataAndButtonsWrapper) {
      return;
    }

    let link = "";
    if (artwork.url) {
      // If the artwork object has a direct URL, use it
      link = artwork.url;
    } else if (artwork.license === "EXLIB") {
      // UofR link
      link = "https://your-uofr-link.com/item/" + artwork.artworkId;
    } else if (artwork.license === "WIKI") {
      // Wikipedia link
      link = "https://en.wikipedia.org/wiki/" + encodeURIComponent(artwork.title);
    } else {
      // Default to Europeana link
      link = "https://www.europeana.eu/en/item" + artwork.artworkId;
    }
    window.open(link, "_blank");
  };

  const handleFavoriteClick = async (artwork) => {
    if (!localStorage.getItem("loggedInUser")) {
      window.location.href = "/LoginForm";
      return;
    }
    if (localStorage.getItem("loggedInUser")) {
      if (!artwork.isFavorited) {
        await saveLikedArtworkIntoDataBase(artwork);
      } else {
        await deleteLikedArtworkFromDataBase(artwork.artworkId);
      }
    }

    let artworkId = artwork.artworkId;
    setArtworkData((prevArtworkData) =>
      prevArtworkData.map((artwork) =>
        artwork.artworkId === artworkId
          ? {
              ...artwork,
              isFavorited: !artwork.isFavorited,
              liked: !artwork.liked,
            }
          : artwork
      )
    );
  };

  const CardLogo = ({ src, alt = "Logo", style = {} }) => {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          width: "2.5rem",
          height: "2.5rem",
          ...style,
        }}
      />
    );
  };

  // Function to cluster artworks based on keywords, limit to 6 per cluster
  const clusterArtworksByKeywords = (artworks) => {
    const clusters = [];
    const visited = new Set();

    artworks.forEach((artwork) => {
      if (visited.has(artwork)) return;

      const cluster = {
        keywordCounts: {},
        artworks: [artwork],
      };
      visited.add(artwork);

      // Initialize keyword counts
      (artwork.keywords || []).forEach((keyword) => {
        cluster.keywordCounts[keyword] = 1;
      });

      artworks.forEach((otherArtwork) => {
        if (visited.has(otherArtwork)) return;
        const sharedKeywords = (artwork.keywords || []).some((keyword) =>
          otherArtwork.keywords?.includes(keyword)
        );
        if (sharedKeywords && cluster.artworks.length < 6) {
          cluster.artworks.push(otherArtwork);
          (otherArtwork.keywords || []).forEach((kw) => {
            if (cluster.keywordCounts[kw]) {
              cluster.keywordCounts[kw] += 1;
            } else {
              cluster.keywordCounts[kw] = 1;
            }
          });
          visited.add(otherArtwork);
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  };

  const ClustersView = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      handleDelete() {
        setArtworkData([]);
        localStorage.setItem("currentQuery", "");
        setCurrentPage(1);
        setShowProgressbar(true);
        getPaginatedArtworks(currentPage).then((data) => {
          setShowProgressbar(false);
          setArtworkData(data);
        });
      },
    }));

    const clusters = clusterArtworksByKeywords(artworkData);

    const useStyles = makeStyles({
      clusterContainer: {
        border: "1px solid #ccc",
        padding: "15px",
        marginBottom: "20px",
        display: "flex",
      },
      keywordList: {
        flex: "0 0 200px",
        marginRight: "20px",
      },
      artworkGrid: {
        flex: "1",
      },
      keywordButton: {
        marginBottom: "10px",
        width: "100%",
        textAlign: "left",
        padding: "5px 10px", // Adjust padding for better appearance
        backgroundColor: "#f8f8f8", // Set background color
        borderRadius: "4px", // Optional: add border-radius for a cleaner look
        cursor: "default", // Disable pointer cursor
      },
      cardImage: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
      },
      card: {
        width: "100%",
      },
      mainKeywordTitle: {
        fontWeight: "bold",
        marginBottom: "15px",
      },
    });

    const classes = useStyles();

    return (
      <Container>
        {clusters.map((cluster, index) => {
          // Get keywords and their counts, then sort them by counts
          const sortedKeywords = Object.entries(cluster.keywordCounts)
            .sort((a, b) => b[1] - a[1]) // Sort descending by count
            .map(([keyword, count]) => ({ keyword, count }));
  
          return (
            <div key={index} className={classes.clusterContainer}>
              <div className={classes.keywordList}>
                <h5 className={classes.mainKeywordTitle}>
                  {cluster.mainKeyword}
                </h5>
                {sortedKeywords.map((item, idx) => (
                  <div
                    key={idx}
                    className={classes.keywordButton} // Use div for non-interactive display
                  >
                    {item.keyword} ({item.count})
                  </div>
                ))}
              </div>
              <div className={classes.artworkGrid}>
                <Row>
                  {cluster.artworks.map((artwork) => (
                    <Col xs={12} md={6} lg={4} xl={4} key={artwork.artworkId}>
                      <Card
                        className={`artwork-card ${classes.card}`}
                        style={{ marginBottom: "20px" }}
                      >
                        <div
                          onClick={(event) => handleCardClick(artwork, event)}
                        >
                          {artwork.image &&
                          artwork.image !== "No image available" ? (
                            <Card.Img
                              src={artwork.image}
                              alt={`The image for ${artwork.title}`}
                              className={classes.cardImage}
                            />
                          ) : (
                            <Card.Img
                              src="./url.png"
                              alt="Fallback"
                              className={classes.cardImage}
                            />
                          )}
                          <Card.Body>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <CardLogo
                                src={
                                  artwork.license === "EXLIB"
                                    ? "./uofrLogo.png"
                                    : artwork.license === "WIKI"
                                    ? "./wikipedia.png"
                                    : "./europeana.png"
                                }
                                alt="Artwork Logo"
                              />
                              <Card.Subtitle style={{ marginLeft: "10px" }}>
                                {artwork.dataProvider}
                              </Card.Subtitle>
                            </div>
                            <Card.Title>
                              {artwork.title == "null" ? "" : artwork.title}
                            </Card.Title>
                            <Card.Text>
                              {artwork.description != null &&
                              artwork.description !== ""
                                ? artwork.description.slice(0, 150) + "..."
                                : ""}
                            </Card.Text>
                            <div className="data-and-buttons-wrapper d-flex">
                              <span
                                className={`d-inline-flex align-items-center text-uppercase hover-effect ${
                                  savedArtworks[artwork.artworkId]
                                    ? "green-label"
                                    : ""
                                }`}
                                onClick={() =>
                                  toggleAddModal(artwork, artwork.image)
                                }
                              ></span>
  
                              <span
                                className={`buttons-wrapper d-inline-flex align-items-center text-uppercase hover-effect ${
                                  artwork.isFavorited == true
                                    ? "Liked-label"
                                    : "Like-label"
                                }`}
                                onClick={() => handleFavoriteClick(artwork)}
                              >
                                {artwork.isFavorited == true ? (
                                  <>
                                    <BeenhereIcon
                                      id={"saveIcon"}
                                      sx={{ fontSize: ".875rem", color: "green" }}
                                    />
                                    <span
                                      className="Save-label-text buttons-wrapper-icon"
                                      style={{ color: "green" }}
                                    >
                                      Saved
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <LibraryAddIcon
                                      id={"saveIcon"}
                                      sx={{ fontSize: ".875rem", color: "black" }}
                                    />
                                    <span className="Like-label-text buttons-wrapper-icon">
                                      Save
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          </Card.Body>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          );
        })}
      </Container>
    );
  });

  const Pagination = () => {
    const [inputValue, setInputValue] = useState(currentPage);

    const handleKeyPress = (e) => {
      if (e.key === "Enter" || e.keyCode === 13) {
        const page = Number(e.target.value);

        if (page >= 1 && page <= totalRecords / 24) {
          handlePageChange(page);
        }
      }
    };

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      e.preventDefault();
    };

    const nextPage = () => {
      if (currentPage < totalRecords / 24) {
        handlePageChange(inputValue + 1);
      }
    };

    const previousPage = () => {
      if (currentPage > 1) {
        handlePageChange(inputValue - 1);
      }
    };

    return (
      <div className="pagination-ep d-flex align-items-center">
        <button className="btn-page-nav mx-3" onClick={previousPage}>
          <FontAwesomeIcon icon={faArrowLeft} />
          &nbsp;PREVIOUS
        </button>

        <input
          type="number"
          className="form-control mx-3"
          min={1}
          max={totalRecords / 24}
          onKeyDown={handleKeyPress}
          value={inputValue}
          onChange={handleInputChange}
          style={{ width: "100px", textAlign: "center" }}
        />

        <span className="mx-3">
          OF{" "}
          {Math.floor(
            totalRecords / 24 < 1
              ? 1
              : totalRecords / 24 > 42
              ? 42
              : totalRecords / 24
          )}
        </span>
        <button className="btn-page-nav mx-3" onClick={nextPage}>
          NEXT&nbsp;
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    );
  };

  const childRef = useRef();

  const toggleAddModal = async (artwork, image) => {
    if (!localStorage.getItem("loggedInUser")) {
      window.location.href = "/LoginForm";
      return;
    }
    if (localStorage.getItem("loggedInUser")) {
      setAddedArtworkToGallery(artwork);
      setAddedArtworkImageToGallery(image);
      setIsAddModalOpen(!isAddModalOpen);
      const response = await getGalleries();
      setUserGalleries(response.galleries);
    }
    let updatedSavedArtworks = { ...savedArtworks };

    if (localStorage.getItem("savedArtworks")) {
      updatedSavedArtworks = JSON.parse(localStorage.getItem("savedArtworks"));
    }

    updatedSavedArtworks[artwork.artworkId] =
      !updatedSavedArtworks[artwork.artworkId];
    localStorage.setItem("savedArtworks", JSON.stringify(updatedSavedArtworks));

    setSavedArtworks(updatedSavedArtworks);
  };

  const handleGalleryNameChange = (e) => {
    let value = e.target.value;
    setGalleryName(value);
  };
  const handleGalleryDescriptionChange = (e) => {
    let value = e.target.value;
    setGalleryDescription(value);
  };
  const handleGalleryPublicChange = (e) => {
    let value = e.target.checked;
    setGalleryPrivate(value);
  };

  const handleCreateGallerySubmit = async (event) => {
    event.preventDefault();
    if (!galleryName) {
      return;
    }
    try {
      await saveGalleryIntoDataBase(
        addedArtworkToGallery,
        galleryName,
        addedArtworkImageToGallery,
        galleryDescription,
        galleryPrivate
      );
    } catch (err) {
      console.error(err);
    }
    const response = await getGalleries();
    setUserGalleries(response.galleries);
    setGalleryName("");
    setGalleryDescription("");
    setGalleryPrivate(false);
    setIsAddModalChildOpen(!isAddModalChildOpen);
  };

  const useStyles = makeStyles((theme) => ({
    customButton: {
      maxWidth: "750px",
      minHeight: "55px",
      minWidth: "550px",
      display: "flex",
      backgroundImage: (props) =>
        !props.isGalleryButtonSelected ? `url(${props.image})` : "none",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden",
      color: "#000",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      border: "none",
      padding: theme.spacing(2),
      "&:focus": {
        outline: "none",
      },
    },
    selectedButton: {
      backgroundImage: "none",
      backgroundColor: theme.palette.success.main,
      "&:hover": {
        backgroundColor: theme.palette.success.dark,
      },
    },
    checkboxIcon: {
      marginLeft: theme.spacing(1),
    },
  }));

  const GalleryButton = ({ gallery }) => {
    const [isGalleryButtonSelected, setIsGalleryButtonSelected] =
      useState(false);
    const [galleryArtWorks, setGalleryArtWorks] = useState([]);
    const classes = useStyles({
      image: gallery.image,
      isGalleryButtonSelected,
    });

    useEffect(() => {
      setGalleryArtWorks(gallery.artworks);
    }, [isGalleryButtonSelected]);

    const handleButtonClick = async () => {
      setIsGalleryButtonSelected((prevState) => !prevState);

      try {
        if (!isGalleryButtonSelected) {
          await saveGalleryIntoDataBase(
            addedArtworkToGallery,
            gallery.gallery,
            gallery.image,
            gallery.galleryDescription,
            gallery.isPrivate
          );
          let elementPos = gallery.artworks
            .map(function (x) {
              return x.artworkId.toLocaleLowerCase();
            })
            .indexOf(addedArtworkToGallery.artworkId.toLocaleLowerCase());
          if (elementPos === -1) {
            setGalleryArtWorks((updatedArtworks) => [
              ...updatedArtworks,
              addedArtworkToGallery,
            ]);
          }
        } else {
          await deleteArtworkFromGallery(
            addedArtworkToGallery.artworkId,
            gallery._id
          );
          setGalleryArtWorks((updatedArtworks) =>
            updatedArtworks.filter(
              (artwork) =>
                artwork.artworkId.toLocaleLowerCase() !==
                addedArtworkToGallery.artworkId.toLocaleLowerCase()
            )
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <Grid item xs={8}>
        <Button
          className={`${classes.customButton} ${
            isGalleryButtonSelected && classes.selectedButton
          }`}
          fullWidth
          onClick={handleButtonClick}
        >
          <span>
            {gallery.gallery +
              " (" +
              (!gallery.isPrivate ? "public" : "private") +
              ") - " +
              (galleryArtWorks == null ? 0 : galleryArtWorks.length + " items")}
          </span>
          {isGalleryButtonSelected && (
            <CheckCircleIcon className={classes.checkboxIcon} />
          )}
        </Button>
      </Grid>
    );
  };

  return (
    <>
      {localStorage.getItem("firstRun") != null &&
      localStorage.getItem("firstRun") !== "true" ? (
        <Container fluid className="search-container">
          <Row>
            <Col xs={12} sm={12}>
              <Row>
                <Col xs={12} sm={10}>
                  <h5 className="padtop context-label">
                    {totalRecords > 5
                      ? `${totalRecords.toLocaleString()} RESULTS `
                      : ""}
                    {localStorage.getItem("currentQuery") ? (
                      <>
                        <span>FOR</span>
                        <StyledChip
                          style={{
                            backgroundColor: "#daeaf8",
                            color: "#4d4d4d",
                            margin: "6px",
                            borderRadius: "2.25rem",
                          }}
                          label={localStorage.getItem("currentQuery")}
                          onDelete={() => {
                            childRef.current.handleDelete();
                            onChipDelete && onChipDelete();
                          }}
                        />
                      </>
                    ) : (
                      <div></div>
                    )}
                  </h5>
                </Col>
                <Col xs={12} sm={2}></Col>
              </Row>
              <div className={"card-container"}>
                <ClustersView ref={childRef} />
              </div>
              <Dialog
                sx={{ top: "-40%", "& .MuiBackdrop-root": { opacity: "0.9" } }}
                open={isAddModalOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setIsAddModalOpen(!isAddModalOpen)}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>{"Add to gallery"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    <Button
                      className={"gallery-create-btn"}
                      style={{
                        maxWidth: "750px",
                        minHeight: "55px",
                        minWidth: "550px",
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "center",
                        marginBottom: "20px",
                        color: "#000",
                      }}
                      fullWidth={true}
                      onClick={(event) => {
                        event.preventDefault();
                        setIsAddModalChildOpen(!isAddModalChildOpen);
                      }}
                    >
                      CREATE NEW GALLERY
                    </Button>
                    <Grid container spacing={2}>
                      {userGalleries.map((gallery) => (
                        <GalleryButton
                          className={"gallery-add-btn"}
                          gallery={gallery}
                        />
                      ))}
                    </Grid>
                  </DialogContentText>
                </DialogContent>
                <Button
                  style={{
                    border: "2px solid black",
                    backgroundColor: "white",
                    cursor: "pointer",
                    borderColor: "#2196F3",
                    color: "dodgerblue",
                    maxWidth: "75px",
                    minWidth: "55px",
                    marginLeft: "25px",
                    marginTop: "25px",
                    marginBottom: "30px",
                  }}
                  variant="outlined"
                  onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                >
                  Close
                </Button>
              </Dialog>

              <Dialog
                sx={{ top: "-5%", "& .MuiBackdrop-root": { opacity: "0.9" } }}
                open={isAddModalChildOpen}
                keepMounted
                onClose={() => setIsAddModalChildOpen(!isAddModalChildOpen)}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>{"Create gallery"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    <form onSubmit={handleCreateGallerySubmit}>
                      <label> Gallery name</label>
                      <TextField
                        required
                        label=""
                        variant="outlined"
                        value={galleryName}
                        onChange={handleGalleryNameChange}
                        style={{
                          maxWidth: "750px",
                          minWidth: "550px",
                          marginBottom: "0",
                        }}
                        fullWidth={true}
                      />
                      <label style={{ fontSize: ".75rem" }}>
                        {" "}
                        Required field
                      </label>
                      <br />
                      <br />
                      <label> Gallery description</label>
                      <TextField
                        multiline
                        rows={4}
                        label=""
                        variant="outlined"
                        value={galleryDescription}
                        onChange={handleGalleryDescriptionChange}
                        fullWidth={true}
                      />
                      <FormControlLabel
                        style={{
                          marginLeft: "1px",
                        }}
                        control={
                          <Checkbox
                            checked={galleryPrivate}
                            onChange={handleGalleryPublicChange}
                          />
                        }
                        label="Keep this gallery private"
                      />
                    </form>
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Button
                        style={{
                          border: "2px solid black",
                          backgroundColor: "white",
                          cursor: "pointer",
                          borderColor: "#2196F3",
                          color: "dodgerblue",
                          maxWidth: "85px",
                          minWidth: "65px",
                          marginLeft: "10px",
                          marginBottom: "20px",
                        }}
                        variant="outlined"
                        onClick={() =>
                          setIsAddModalChildOpen(!isAddModalChildOpen)
                        }
                      >
                        CANCEL
                      </Button>
                    </Grid>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={4}>
                      <Button style={{}} onClick={handleCreateGallerySubmit}>
                        CREATE GALLERY
                      </Button>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Dialog>
              {!pageIsLoading && totalRecords > 1 && (
                <div className="d-flex justify-content-center">
                  <Pagination />
                </div>
              )}
            </Col>
          </Row>
        </Container>
      ) : (
        <></>
      )}
    </>
  );
};

export default SearchArtworks;

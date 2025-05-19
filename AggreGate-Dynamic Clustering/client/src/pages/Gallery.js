import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import "./SearchArtworks.css";
import "../css/gallery.css";
import Button from "@mui/material/Button";
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import {Card, Col, Container, Row} from "react-bootstrap";
import CircularProgress from "@material-ui/core/CircularProgress";
import getGalleries from "../api/getGalleriesApi";
import {useLocation} from 'react-router-dom';
import {makeStyles} from '@mui/styles';
import LockIcon from '@mui/icons-material/Lock';
import FaceIcon from '@mui/icons-material/Face';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import DialogActions from "@mui/material/DialogActions";
import saveGalleryIntoDataBase from "../api/saveGalleryApi";
import updateGalleryFromDataBase from "../api/updateGalleryFromDataBaseApi";
import deleteGalleryFromDataBase from "../api/deleteGalleryFromDataBaseApi";

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        marginLeft: '100px',
        marginTop: '100px'
    },
}));


const Gallery = function () {
    const [galleryArtworks, setGalleryArtworks] = useState([]);
    const [isAddModalChildOpen, setIsAddModalChildOpen] = useState(false);
    const [galleryName, setGalleryName] = useState("");
    const [galleryDescription, setGalleryDescription] = useState("");
    const [galleryPrivate, setGalleryPrivate] = useState(false);
    const [addedArtworkToGallery, setAddedArtworkToGallery] = useState("");
    const [addedArtworkImageToGallery, setAddedArtworkImageToGallery] = useState("");
    const [galleryImage, setGalleryImage] = useState("");
    const [updatingGallery, setUpdatingGallery] = useState(false);
    const [selectedKeywords, setSelectedKeywords] = useState({});
    const [availableColors, setAvailableColors] = useState([
        "#e41a1c",
        "#377eb8",
        "#4daf4a",
        "#984ea3",
        "#ff7f00",
        "#ffff33",
        "#a65628",
        "#f781bf",
        "#999999"
    ]);

    const location = useLocation();
    let {galleryData} = location.state || {};
    const classes = useStyles();
    useEffect(() => {
        if (!updatingGallery) {
            console.log('galleryData: ', galleryData);
            setGalleryArtworks(galleryData.artworks);
            setGalleryPrivate(galleryData.isPrivate);
            setGalleryName(galleryData.gallery);
            setGalleryDescription(galleryData.galleryDescription);
        }
    }, [galleryData, updatingGallery]);

    const Artworks = (() => {
        const [hoveredCard, setHoveredCard] = useState(null);
        const [showProgressbar, setShowProgressbar] = useState(false);

        const handleCardHover = (artworkId) => {
            setHoveredCard(artworkId);
        };

        const handleCardLeave = () => {
            setHoveredCard(null);
        };

        const handleCardClick = (artworkId, event) => {

            const target = event.target;
            let currentElement = target;
            let isInsideDataAndButtonsWrapper = false;
            while (currentElement) {
                if (currentElement.classList.contains('data-and-buttons-wrapper') || currentElement.classList.contains('MuiSvgIcon-root') || currentElement.classList.contains('bullet')) {
                    isInsideDataAndButtonsWrapper = true;
                    break;
                }
                currentElement = currentElement.parentElement;
            }
            if (isInsideDataAndButtonsWrapper) {
                return;
            }

            let link = 'https://www.europeana.eu/en/item' + artworkId;
            window.open(link, "_blank");
        };

        const handleKeywordClick = useCallback((keyword) => {
            const currentSelected = {...selectedKeywords};

            if (currentSelected[keyword]) {
                const colorToReturn = currentSelected[keyword];
                setAvailableColors(prev => [...prev, colorToReturn]);
                delete currentSelected[keyword];
            } else {
                if (availableColors.length === 0) {
                    alert("You can't select more keywords!");
                    return;
                }

                const colorToAssign = availableColors[0];
                currentSelected[keyword] = colorToAssign;
                setAvailableColors(prev => prev.slice(1));
            }

            setSelectedKeywords(currentSelected);
        }, [selectedKeywords, availableColors]);


        return (
            <div className={"gallery-container"}>
            <Container className="card-container-grid mx-0">
                {showProgressbar ?
                    <div className={'progressbarBox'}>
                        <CircularProgress
                            size={20}
                            style={{
                                color: 'black',
                                width: 20,
                                height: 20,
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,

                                margin: 'auto'
                            }}/>
                    </div>
                    : galleryArtworks.map((artwork) => (


                        <div className={"gallery-card"}>
                            <Card key={artwork.artworkId} className="artwork-card-grid"
                                  onClick={(event) => handleCardClick(artwork.artworkId, event)}
                                  onMouseEnter={() => handleCardHover(artwork.artworkId)}
                                  onMouseLeave={handleCardLeave}>
                                <Grid container >
                                        <div className="card-content-wrapper">
                                            {/* Card image */}
                                            {artwork.image && artwork.image !== "No image available" ? (
                                                <div className={'temp'}>
                                                    <Card.Img className="card-image-grid"
                                                              src={artwork.image}
                                                              alt={`The image for ${artwork.title}`}
                                                              variant="top"
                                                    />

                                                </div>
                                            ) : (
                                                <div>
                                                    <Card.Img className="card-image-grid"
                                                              src="./url.png"
                                                              alt="Fallback"
                                                              variant="top"
                                                    />

                                                </div>
                                            )}
                                            {/* Card body */}
                                            <Card.Body>
                                                <Card.Title>
                                                    {artwork.title == "null" ? "" : artwork.title}
                                                </Card.Title>
                                                <Row>
                                                    <Col xs={12}>
                                                        <Card.Text>{artwork.dcCreator}</Card.Text>
                                                        <Card.Text>{artwork.dataProvider}</Card.Text>
                                                    </Col>
                                                    {/* <Col xs={6}>
                                                        <Grid item xs={6} md={4} className="bullet-parent">
                                                            <div className="bullet">
                                                                {[...artwork.keywords].map((keyword) => (
                                                                    <div
                                                                        key={keyword}
                                                                        onClick={() => handleKeywordClick(keyword)}
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            margin: "2px 0",
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="circle"
                                                                            style={{
                                                                                background:
                                                                                    selectedKeywords[keyword] || "transparent",
                                                                                border: selectedKeywords[keyword]
                                                                                    ? "none"
                                                                                    : "1px solid gray",
                                                                            }}
                                                                        />
                                                                        <span
                                                                            style={{
                                                                                marginLeft: "2px",
                                                                                color: selectedKeywords[keyword] || "black",
                                                                            }}
                                                                        >
                              {keyword}
                            </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Grid>
                                                    </Col> */}
                                                </Row>
                                            </Card.Body>
                                        </div>
                                    </Grid>
                            </Card>
                        </div>
                    ))}
            </Container>
            </div>
        );
    });


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
            const response = await saveGalleryIntoDataBase(addedArtworkToGallery, galleryName, addedArtworkImageToGallery, galleryDescription, galleryPrivate);
        } catch (err) {
            console.error(err);
        }
        const response = await getGalleries();

        setGalleryName("");
        setGalleryDescription("");
        setGalleryPrivate(false);
        setIsAddModalChildOpen(!isAddModalChildOpen);
    };


    const handleCreateNewGalleryCardClick = (event) => {
        setIsAddModalChildOpen(!isAddModalChildOpen);
    }

    const handleUpdateGallery = async () => {
        setUpdatingGallery(false);
        let gallery = {
            _id: galleryData._id,
            gallery: galleryName,
            image: galleryImage,
            artworks: galleryArtworks,
            galleryDescription: galleryDescription,
            isPrivate: galleryPrivate
        };
        const response = await updateGalleryFromDataBase(gallery);
        const response1 = await getGalleries();
        const filteredGalleries = response1.galleries.filter((gallery) => gallery._id == galleryData._id)[0];
        galleryData = filteredGalleries;
        setGalleryPrivate(filteredGalleries.isPrivate);
        setGalleryName(filteredGalleries.gallery);
        setGalleryDescription(filteredGalleries.galleryDescription);

        setIsAddModalChildOpen(!isAddModalChildOpen);
        setUpdatingGallery(true);
    }


    const handleDeleteGallery = async () => {
        const response = await deleteGalleryFromDataBase(galleryName);
        window.location.href = '/UserProfile';
    }

    return (
        <>
            <Grid
                container
                spacing={5}
                direction="row"
                className={classes.gridContainer}
            >
                <Grid item xs={12}>
                    <Typography level="body-sm">
                        GALLERY
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <Typography level="h3" style={{fontWeight: 'bold'}}>
                        {galleryName}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography level="body-sm">
                        <FaceIcon/> Curated by @{localStorage.getItem('loggedInUser')}
                    </Typography>
                </Grid>
                {galleryPrivate ? <><Grid item xs={2}>
                        <Typography level="body-sm">
                            <><LockIcon/> Private gallery</>
                        </Typography>
                    </Grid>
                        <Grid item xs={8}>
                        </Grid>
                    </>
                    : <></>}


                <Grid item xs={12}>
                    <Button className={"gallery-edit-btn"} component="a" color="secondary" style={{
                        background: '#f1f1ee',
                        border: '1px solid #f1f1ee',
                        borderRadius: '0.25rem',
                        color: '#4d4d4d',
                        fontSize: '.875rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '100px'
                    }
                    } onClick={(e) => {
                        handleCreateNewGalleryCardClick(e);
                    }}>
                        <ModeEditOutlinedIcon/>
                        Edit
                    </Button>
                </Grid>
            </Grid>
            <Grid style={{backgroundColor: '#ededed'}}
                  container
                  spacing={1}
                  direction="row"
            >
                <Grid item sx={12} style={{paddingLeft: '150px'}}>{galleryArtworks.length > 1 ? "ITEMS" : "ITEM"}</Grid>
                <Grid item xs={12} style={{paddingLeft: '120px', paddingRight: '50px'}}>
                    <Artworks/>
                </Grid>
            </Grid>

            <Dialog
                sx={{top: '-5%', '& .MuiBackdrop-root': {opacity: '0.9'}}}
                open={isAddModalChildOpen}
                keepMounted
                onClose={() => setIsAddModalChildOpen(!isAddModalChildOpen)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Edit gallery"}</DialogTitle>
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
                                    maxWidth: '750px',
                                    minWidth: '550px',
                                    marginBottom: '0'
                                }} fullWidth={true}/>
                            <br/>
                            <br/>
                            <label> Gallery description</label>
                            <TextField
                                multiline
                                rows={4}
                                label=""
                                variant="outlined"
                                value={galleryDescription}
                                onChange={handleGalleryDescriptionChange}
                                fullWidth={true}/>
                            <FormControlLabel style={{
                                marginLeft: '1px',
                            }}
                                              control={<Checkbox checked={galleryPrivate}
                                                                 onChange={handleGalleryPublicChange}/>}
                                              label="Keep this gallery private"/>
                        </form>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Button style={{
                                border: '2px solid black',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                borderColor: '#2196F3',
                                color: 'dodgerblue',
                                maxWidth: '85px',
                                minWidth: '65px',
                                marginLeft: '10px',
                                marginBottom: '20px',
                            }} variant="outlined"
                                    onClick={() => setIsAddModalChildOpen(!isAddModalChildOpen)}>Close</Button>
                        </Grid>
                        <Grid item xs={1}>

                        </Grid>

                        <Grid item xs={4} style={{justifyContent: 'flex-end'}}>
                            <Button style={{backgroundColor: "#dc3545", fontSize: '.875rem'}} variant="contained" class={"gallery-delete-btn"}
                                    onClick={handleDeleteGallery}>
                                DELETE GALLERY
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button style={{backgroundColor: "#0a72cc", fontSize: '.875rem'}} class={"gallery-update-btn"}
                                    variant="contained"
                                    onClick={handleUpdateGallery}>
                                UPDATE GALLERY
                            </Button>
                        </Grid>

                    </Grid>


                </DialogActions>
            </Dialog>
        </>
    );


}
export default Gallery;

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import "../css/user-profile.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import React, {forwardRef, useEffect, useImperativeHandle, useState, useMemo, useCallback} from "react";
import {Card, Col, Container, Row} from "react-bootstrap";
import CircularProgress from "@material-ui/core/CircularProgress";
import getGalleries from "../api/getGalleriesApi";
import getUserLikedArtworks from "../api/getUserLikedArtworksApi";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import deleteLikedArtworkFromDataBase from "../api/deleteLikedArtworkFromDataBaseApi";
import TimelineWithLabels  from "../components/TimelineWithLabels";
import { useHistory } from 'react-router-dom';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import DialogActions from "@mui/material/DialogActions";
import saveGalleryIntoDataBase from "../api/saveGalleryApi";
import Slide from "@mui/material/Slide";
import deleteArtworkFromGallery from "../api/deleteArtworkFromGalleryApi";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import makeStyles from "@material-ui/core/styles/makeStyles";
import DHAVideoRecorder from "../components/videoRecorder";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const UserProfile = function () {
    const history = useHistory();
    const [value, setValue] = React.useState(1);
    const [userPublicGalleries, setUserPublicGalleries] = useState([]);
    const [userPrivateGalleries, setUserPrivateGalleries] = useState([]);
    const [userLikedArtworks, setUserLikedArtworks] = useState([]);
    const [isAddModalChildOpen, setIsAddModalChildOpen] = useState(false);
    const [galleryName, setGalleryName] = useState("");
    const [galleryDescription, setGalleryDescription] = useState("");
    const [galleryPrivate, setGalleryPrivate] = useState(false);
    const [addedArtworkToGalleryUP, setAddedArtworkToGalleryUP] = useState("");
    const [addedArtworkImageToGalleryUP, setAddedArtworkImageToGalleryUP] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userGalleries, setUserGalleries] = useState([]);

    useEffect(() => {
        // DHAVideoRecorder.initRecorder().then(()=>{console.log("video recording started ...........")});

    });


    const handleChange = async (event, newValue) => {
        setValue(newValue);
        if (newValue == 1) {
            const response = await getUserLikedArtworks();
            setUserLikedArtworks(response.likedArtworks.length != 0 ? response.likedArtworks[0].artworks : []);
        }
        if (newValue == 2) {
            const response = await getGalleries();
            const filteredGalleries = response.galleries.filter((gallery) => gallery.isPrivate == false);
            for (const gallery of filteredGalleries) {
                gallery.timelineData = gallery.artworks.map(artwork => ({
                    query: artwork.query,
                    addTimeStamp: artwork.addTimeStamp,
                }));

                const keywordsSet = new Set();
                gallery.artworks.forEach(artwork => {
                    artwork.keywords.forEach(keyword => keywordsSet.add(keyword));
                });
                gallery.keywords = [...keywordsSet];
            }
            setUserPublicGalleries(filteredGalleries);
        }
        if (newValue == 3) {
            const response = await getGalleries();
            const filteredGalleries = response.galleries.filter((gallery) => gallery.isPrivate == true);
            setUserPrivateGalleries(filteredGalleries);
        }
    };

    const handleCreateNewGalleryCardClick= (event) => {
        setIsAddModalChildOpen(!isAddModalChildOpen);
    }



    const PublicGalleris = (() => {
        const [showProgressbar, setShowProgressbar] = useState(false);
        const handleCardClick = (gallery, event) => {
            const target = event.target;
            let currentElement = target;
            let isInsideTimeChartOrKeywords = false;
            while (currentElement) {
                if (currentElement.classList.contains('visualization-element-for-galley') || currentElement.classList.contains('bullet-points')) {
                    isInsideTimeChartOrKeywords = true;
                    break;
                }
                currentElement = currentElement.parentElement;
            }
            if (isInsideTimeChartOrKeywords) {
                return;
            }
            console.log("list: ",event.target.classList)
            if (event.target.classList.contains('react-calendar-timeline ')) {
                // Clicked on TimelineWithTags, do not proceed with handleCardClick
                return;
            }
            event.preventDefault();
            history.push('/Gallery', { galleryData: gallery });
        }



        return (
            <div className={"user-profile-container"}>
            <Container className="card-container-grid mx-0 user-profile-grid">
                {showProgressbar ? (
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
                            }}
                        />
                    </div>
                ) : (
                    <>
                    {userPublicGalleries.map((gallery) => {
                        return (
                            <Card
                                key={gallery.gallery}
                                className="artwork-card-grid"
                                onClick={(event) => handleCardClick(gallery, event)}
                            >
                                <Grid container >
                                        {gallery.image && gallery.image !== 'No image available' ? (
                                                <Card.Img
                                                    className="card-image-grid"
                                                    src={gallery.image}
                                                    alt={`The image for ${gallery.gallery}`}
                                                    variant="top"
                                                    style={{ height: '200px' }} // Set a fixed height for the image
                                                />
                                        ) : (
                                                <Card.Img
                                                    className="card-image-grid"
                                                    src="./url.png"
                                                    alt="Fallback"
                                                    variant="top"
                                                    style={{ height: '200px' }} // Set a fixed height for the image
                                                />

                                        )}
                                        <Card.Body>
                                            <Card.Title>{gallery.artworks == null ? 0 : gallery.artworks.length + ' items'}</Card.Title>
                                            <Card.Text>{gallery.gallery === 'null' ? '' : gallery.gallery}</Card.Text>
                                        </Card.Body>
                                    </Grid>
                            </Card>
                    );
                    })}

                        {/* Add the "Create new gallery" card here */}
                        <Card key={"createGal"} className="artwork-card-grid" onClick={(event) => handleCreateNewGalleryCardClick(event)}>
                            <div className={'temp'}>
                                <Box sx={{ padding: '10px' }}>
                                    <Card.Img
                                        className="card-image-grid"
                                        src="./create-new-gallery.png"
                                        alt={`The image for create`}
                                        variant="top"
                                        style={{ height: '275px' }} // Set a fixed height for the image
                                    />
                                </Box>
                            </div>
                        </Card>
                    </>
                )}
            </Container>
            </div>
        );
    });

    const PrivateGalleris = (() => {
        const [showProgressbar, setShowProgressbar] = useState(false);

        const handleCardClick = (gallery, event) => {
            event.preventDefault();
            history.push('/Gallery', { galleryData: gallery });
        }


        return (
            <Container className="card-container-grid mx-0 user-profile-grid">
                {showProgressbar ? (
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
                            }}
                        />
                    </div>
                ) : (
                    <>
                    {userPrivateGalleries.map((gallery) => {
                            const timelineData = [];
                            gallery.artworks.forEach((artwork) => {
                            timelineData.push({
                            query: artwork.query,
                            addTimeStamp: artwork.addTimeStamp,
                        });
                        });
                            return (
                            <Card
                                key={gallery.gallery}
                                className="artwork-card-grid"
                                onClick={(event) => handleCardClick(gallery, event)}
                            >
                                {/* Card image */}
                                {gallery.image && gallery.image !== 'No image available' ? (
                                    <div className={'temp'}>
                                        <Card.Img
                                            className="card-image-grid"
                                            src={gallery.image}
                                            alt={`The image for ${gallery.gallery}`}
                                            variant="top"
                                            style={{ height: '200px' }} // Set a fixed height for the image
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <Card.Img
                                            className="card-image-grid"
                                            src="./url.png"
                                            alt="Fallback"
                                            variant="top"
                                            style={{ height: '200px' }} // Set a fixed height for the image
                                        />
                                    </div>
                                )}
                                {/* Card body */}
                                <Card.Body>
                                    <Card.Title>{gallery.artworks==null?0:gallery.artworks.length + ' items'}</Card.Title>
                                    <Card.Text>{gallery.gallery === 'null' ? '' : gallery.gallery}</Card.Text>
                                        {/*<div>*/}
                                        {/*    <TimelineWithLabels  timelineData={gallery.timelineData} />*/}
                                        {/*</div>*/}

                                </Card.Body>
                            </Card>
                    );
                    })}

                        {/* Add the "Create new gallery" card here */}
                        <Card key={"createGal"} className="artwork-card-grid" onClick={(event) => handleCreateNewGalleryCardClick(event)}>
                            <div className={'temp'}>
                                <Box sx={{ padding: '10px' }}>
                                    <Card.Img
                                        className="card-image-grid"
                                        src="./create-new-gallery.png"
                                        alt={`The image for create`}
                                        variant="top"
                                        style={{ height: '275px' }} // Set a fixed height for the image
                                    />
                                </Box>
                            </div>
                        </Card>
                    </>

                )}
            </Container>
        );
    });

    const LikedArtworks = (() => {
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
                if (currentElement.classList.contains('data-and-buttons-wrapper') || currentElement.classList.contains('MuiSvgIcon-root')) {
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

        const handleFavoriteClick = async (artwork) => {
            const response1 = await deleteLikedArtworkFromDataBase(artwork.artworkId);
            const response = await getUserLikedArtworks();
            setUserLikedArtworks(response.likedArtworks.length != 0 ? response.likedArtworks[0].artworks : []);

        };

        return (
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
                    : userLikedArtworks.map((artwork) => (
                        <Card key={artwork.artworkId} className="artwork-card-grid"
                              onClick={(event) => handleCardClick(artwork.artworkId, event)}
                              onMouseEnter={() => handleCardHover(artwork.artworkId)}
                              onMouseLeave={handleCardLeave}>
                            {/* Card image */}
                            {artwork.image && artwork.image !== "No image available" ? (
                                <div className={'temp'}>
                                    <Card.Img className="card-image-grid"
                                              src={artwork.image}
                                              alt={`The image for ${artwork.title}`}
                                              variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon" onClick={() => toggleAddModal(artwork, artwork.image)}/>
                                            <FavoriteIcon onClick={() => handleFavoriteClick(artwork)} sx={{
                                                fontSize: "10px",
                                                height: "36px",
                                                width: "36px",
                                                color: '#fff !important',
                                                backgroundColor: 'red !important'
                                            }}
                                                          className="hover-icon"/>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <Card.Img className="card-image-grid"
                                              src="./url.png"
                                              alt="Fallback"
                                              variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon" onClick={() => toggleAddModal(artwork, artwork.image)}/>
                                            <FavoriteIcon onClick={() => handleFavoriteClick(artwork)} sx={{
                                                fontSize: "10px",
                                                height: "36px",
                                                width: "36px",
                                                color: '#fff !important',
                                                backgroundColor: 'red !important'
                                            }}
                                                          className="hover-icon"/>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Card body */}
                            <Card.Body>
                                <Card.Title>{artwork.title == "null" ? "" : artwork.title}</Card.Title>
                                <Card.Text>{artwork.dcCreator}</Card.Text>
                                <Card.Text>{artwork.dataProvider}</Card.Text>
                                {/* rest of the code */}
                            </Card.Body>
                        </Card>
                    ))}
            </Container>
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
        console.log("check: ",value)
        setGalleryPrivate(value);
    };

    const handleCreateGallerySubmit = async (event) => {
        event.preventDefault();
        if (!galleryName) {
            return;
        }
        try {
            const response = await saveGalleryIntoDataBase(addedArtworkToGalleryUP, galleryName, addedArtworkImageToGalleryUP, galleryDescription, galleryPrivate);
        } catch (err) {
            console.error(err);
        }
        if (value == 2) {
            const response = await getGalleries();
            const filteredGalleries = response.galleries.filter((gallery) => gallery.isPrivate == false);
            setUserPublicGalleries(filteredGalleries);
        }
        if (value == 3) {
            const response = await getGalleries();
            const filteredGalleries = response.galleries.filter((gallery) => gallery.isPrivate == true);
            setUserPrivateGalleries(filteredGalleries);
        }

        setGalleryName("");
        setGalleryDescription("");
        setGalleryPrivate(false);
        setIsAddModalChildOpen(!isAddModalChildOpen);
    };

    const toggleAddModal = async (artwork, image) => {
        if(localStorage.getItem('loggedInUser')){
            setAddedArtworkToGalleryUP(artwork);
            setAddedArtworkImageToGalleryUP(image);
            setIsAddModalOpen(!isAddModalOpen);
            const response = await getGalleries();
            setUserGalleries(response.galleries);
        }
    };

    const useStyles = makeStyles((theme) => ({
        customButton: {

            maxWidth: '750px',
            minHeight: '55px',
            minWidth: '550px',
            display: 'flex',
            backgroundImage: (props) => !props.isGalleryButtonSelected ? `url(${props.image})` : 'none', // Apply background image if not selected
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: "#0a72cc",
            position: 'relative',
            overflow: 'hidden',
            color: 'white', // Customize the text color as needed
            fontSize: '1rem', // Customize the font size as needed
            fontWeight: 'bold', // Customize the font weight as needed
            cursor: 'pointer', // Add a pointer cursor to indicate interactivity
            border: 'none', // Remove the default button border
            padding: theme.spacing(2), // Adjust padding as needed
            '&:focus': {
                outline: 'none', // Remove the default focus outline
            },
        },
        selectedButton: {
            backgroundImage: 'none', // Remove background image
            backgroundColor: theme.palette.success.main,
            '&:hover': {
                backgroundColor: theme.palette.success.dark,
            },
        },
        checkboxIcon: {
            marginLeft: theme.spacing(1),
        },
    }));

    const GalleryButton = ({ gallery, setIsAddModalChildOpen }) => {
        const [isGalleryButtonSelected, setIsGalleryButtonSelected] = useState(false);
        const [galleryArtWorks, setGalleryArtWorks] = useState([]);
        const classes = useStyles({ image: gallery.image, isGalleryButtonSelected });

        useEffect(() => {
            setGalleryArtWorks(gallery.artworks);
        }, [isGalleryButtonSelected]);

        const handleButtonClick = async () => {
            setIsGalleryButtonSelected(prevState => !prevState);

            try {
                if (!isGalleryButtonSelected) {
                    const response = await saveGalleryIntoDataBase(addedArtworkToGalleryUP, gallery.gallery, gallery.image, gallery.galleryDescription, gallery.isPrivate);
                    let elementPos = gallery.artworks.map(function(x) {return x.artworkId.toLocaleLowerCase(); }).indexOf(addedArtworkToGalleryUP.artworkId.toLocaleLowerCase());
                    if (elementPos == -1) {
                        setGalleryArtWorks(updatedArtworks => [...updatedArtworks, addedArtworkToGalleryUP]);
                    }
                } else {
                    const response = await deleteArtworkFromGallery(addedArtworkToGalleryUP.artworkId, gallery._id);
                    setGalleryArtWorks(updatedArtworks =>
                        updatedArtworks.filter(artwork => artwork.artworkId.toLocaleLowerCase() !== addedArtworkToGalleryUP.artworkId.toLocaleLowerCase())
                    );
                }
            } catch (err) {
                console.error(err);
            }
        };

        return (
            <Grid item xs={8}>
                <Button
                    className={`${classes.customButton} ${isGalleryButtonSelected && classes.selectedButton}`}
                    fullWidth
                    onClick={handleButtonClick}
                >
                <span>
                    {gallery.gallery +
                    ' (' +
                    (!gallery.isPrivate ? 'public' : 'private') +
                    ') - ' +
                    (galleryArtWorks == null ? 0 : galleryArtWorks.length + ' items')}
                </span>
                    {isGalleryButtonSelected && <CheckCircleIcon className={classes.checkboxIcon} />}
                </Button>
            </Grid>
        );
    };



    return (
        <Grid container spacing={2}
                  direction="row"
                  justifyContent="center"
                  alignItems="center" className={"userProfile"}>
        <Grid item xs={12}>
            <Typography variant="h6" sx={{marginTop:'100px',display: 'flex',
                justifyContent:"center",
                alignItems:"center"}}>
                @{localStorage.getItem('loggedInUser')}
            </Typography>
        </Grid>
        <Grid item xs={5}>

        </Grid>
        <Grid item xs={2} sx={{display: 'flex',
            justifyContent:"center",
            alignItems:"center"}} >
            <Button color="secondary" style={   {
                background: '#f1f1ee',
                border: '1px solid #f1f1ee',
                borderRadius: '0.25rem',
                color: '#4d4d4d',
                fontSize: '.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
            }
               }  onClick={() => {
                localStorage.setItem('loggedInUser', "");
                window.location.href = '/';
            }}>Log out</Button>
        </Grid>
        <Grid item xs={5}>

        </Grid>

        <Grid item xs={12}>
            <Box sx={{width: '100%', typography: 'body1'}}>
                <TabContext sx={{width: '80%', typography: 'body1'}} value={value}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center'}}>
                        <TabList onChange={handleChange} >
                            <Tab label="Likes" value="1" className={"navbarElement"}/>
                            <Tab label="Public Galleries" value="2" className={"navbarElement"}/>
                            <Tab label="Private Galleries" value="3" className={"navbarElement"}/>
                        </TabList>
                    </Box>
                    <Box sx={{borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center'}}>
                        <TabPanel value="1">
                            <LikedArtworks/>
                        </TabPanel>
                        <TabPanel value="2">
                            <PublicGalleris/>
                        </TabPanel>
                        <TabPanel value="3">
                            <PrivateGalleris/>
                        </TabPanel>
                    </Box>
                </TabContext>

                <Dialog
                    sx={{top: '-40%', '& .MuiBackdrop-root': {opacity: '0.9'}}}
                    open={isAddModalOpen}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => setIsAddModalOpen(!isAddModalOpen)}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle>{"Add to gallery"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <Button style={{
                                maxWidth: '750px',
                                minHeight: '55px',
                                minWidth: '550px',
                                display: 'flex',
                                justifyContent: 'left',
                                alignItems: "center",
                                marginBottom: "20px",
                                backgroundColor: "#0a72cc",
                            }} fullWidth={true} variant="contained"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setIsAddModalChildOpen(!isAddModalChildOpen);
                                    }}>CREATE NEW
                                GALLERY</Button>
                            <Grid container spacing={2}>
                                {userGalleries.map((gallery) => (
                                    <GalleryButton gallery={gallery} setIsAddModalChildOpen={setIsAddModalChildOpen} />
                                ))}

                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                    {/*<DialogActions>*/}
                    <Button style={{
                        border: '2px solid black',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        borderColor: '#2196F3',
                        color: 'dodgerblue',
                        maxWidth: '75px',
                        minWidth: '55px',
                        marginLeft: '25px',
                        marginTop: '25px',
                        marginBottom: '30px',
                    }} variant="outlined"
                            onClick={() => setIsAddModalOpen(!isAddModalOpen)}>Close</Button>
                    {/*</DialogActions>*/}
                </Dialog>
                <Dialog
                    sx={{top: '-5%', '& .MuiBackdrop-root': {opacity: '0.9'}}}
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
                                        maxWidth: '750px',
                                        minWidth: '550px',
                                        marginBottom: '0'
                                    }} fullWidth={true}/>
                                <label style={{fontSize: '.75rem'}}> Required field</label>
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
                                        onClick={() => setIsAddModalChildOpen(!isAddModalChildOpen)}>CANCEL</Button>
                            </Grid>
                            <Grid item xs={3}>

                            </Grid>
                            <Grid item xs={2}>

                            </Grid>
                            <Grid item xs={4}>
                                <Button  style={{backgroundColor: "#0a72cc", fontSize: '.875rem'}}     variant="contained" className={"gallery-create-btn"}
                                         onClick={handleCreateGallerySubmit}>
                                    CREATE GALLERY
                                </Button>
                            </Grid>

                        </Grid>


                    </DialogActions>
                </Dialog>
            </Box>

        </Grid>


    </Grid>);
};

export default UserProfile;

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Modal, Tab } from "react-bootstrap";
import "../css/navbar.css";
import Auth from "../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputAdornment from "@mui/material/InputAdornment";
import {
  faBook,
  faBars,
  faUser,
  faSearch,
  faFolderTree,
} from "@fortawesome/free-solid-svg-icons";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import makeStyles from "@mui/styles/makeStyles";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";
import getRecords from "../api/getRecordsApi";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import ListItemIcon from "@mui/material/ListItemIcon";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import ClearIcon from "@mui/icons-material/Clear";
import DHAVideoRecorder from "./videoRecorder";
const useStyles = makeStyles((theme) => ({
  noBorderNavbar: {
    border: "none", // Set the border property to 'none' to remove the border
  },
  searchForm: {
    width: "100%", // Ensure the form takes full width
    margin: 0, // Remove any margins
    padding: 0, // Remove any padding
  },
  searchInput: {
    width: "100%", // Adjust the width as needed
  },
  navbarFlexContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchContainer: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center", // Center the search bar
    width: "500px",
  },
  hoverablePaper: {
    marginTop: "55px",
    "&:hover": {
      backgroundColor: "#007bff",
      "& #search-suggestions": {
        color: "white",
      },
      "& .MuiSvgIcon-root": {
        // Style for SearchIcon
        fill: "white",
      },
    },
  },
  hoverableMenuItem: {
    "&:hover #search-suggestions": {
      color: "white",
    },
  },
}));

// const AppNavbar = ({ totalPages, artworkData, onSharedVariableChange })=> {
const AppNavbar = forwardRef(
  (
    {
      isLoading,
      totalPages,
      searchedArtworks,
      onSharedVariableChange,
      filters,
      onFilterChange,
      // ... any other props you might have ...
    },
    ref
  ) => {
    // set modal display state
    const [showModal, setShowModal] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      handleChipDelete: () => {
        setSearchInput(""); // Clear the input
        inputRef.current && inputRef.current.focus(); // Focus the input
      },
    }));

    const [showSearchMessage, setShowSearchMessage] = useState(false);
    const classes = useStyles();

    const handleFocus = (event) => {
      setShowSearchMessage(true);
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (
          document.getElementById("search-suggestions") != null &&
          document.activeElement !==
            document.getElementById("search-suggestions")
        ) {
          setShowSearchMessage(false);
        }
      }, 200); // Delayed the onBlur event by 200 milliseconds
    };

    const handleFormSubmit = async (event) => {
      setShowSearchBar(false); // Close navbar
      // DHAVideoRecorder.initRecorder().then(()=>{console.log("video recording started ...........")});
      if (window.LogUI && window.LogUI.isActive()) {
        window.LogUI.logCustomMessage({
          name: "query-submitted",
          objectName: searchInput,
          id: localStorage.getItem("loggedInUser"),
        });
      }
      event.preventDefault();
      onSharedVariableChange(true, 0, []);

      localStorage.setItem("firstRun", false);
      console.log(localStorage.getItem("firstRun"));
      try {
        const filterQuery = Object.entries(filters)
          .map(([key, value]) => `${key}=${value}`)
          .join("&");
        const response = await getRecords(searchInput, filterQuery, 1);
        onSharedVariableChange(
          false,
          response.totalPages,
          response.artworkData
        );
      } catch (err) {
        console.error(err);
      }
    };

    const handleQueryChange = (e) => {
      let value = e.target.value;
      setSearchInput(value);
    };

    const clearSearchInput = () => {
      setSearchInput("");
    };

    const searchMessage = searchInput
      ? `Search for ${searchInput}`
      : "Search for everything";
    const mainNavBar = () => (
      <Navbar
        bg="light"
        variant="light"
        expand="lg"
        className={"m-0 header-navbar"}
      >
        <Container fluid>
          {/* Centered search bar */}
          <div className={classes.searchContainer}>
            <form onSubmit={handleFormSubmit} className={classes.searchForm}>
              <TextField
                ref={inputRef}
                className={classes.searchInput} // Apply the custom style
                autoComplete="off"
                placeholder="Search 50+ million items"
                variant="outlined"
                fullWidth
                autoFocus
                name="query"
                id="query"
                value={searchInput}
                onChange={handleQueryChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faSearch} /> {/* Search Icon */}
                    </InputAdornment>
                  ),
                  endAdornment: searchInput && (
                    <IconButton onClick={clearSearchInput}>
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
            </form>
          </div>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav className="ml-auto nav-link" id={"profileIcon"}>
              {localStorage.getItem("loggedInUser") ? (
                <>
                  <Nav.Link href={"/UserProfile"}>
                    <FontAwesomeIcon icon={faFolderTree} /> MY SPACE
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link href={"/LoginForm"}>
                  <FontAwesomeIcon icon={faUser} /> Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );

    return (
      <>
        {showSearchBar ? (
          <div className={"wrapper"}>
            <div>
              <Navbar expand="lg" className={"m-0 header-navbar"}>
                <Grid container>
                  <Grid xs={12} item={true}>
                    <div>
                      <form onSubmit={handleFormSubmit} className="ml-auto">
                        <TextField
                          ref={inputRef}
                          autoComplete="off"
                          placeholder="Search 50+ million items"
                          variant="outlined"
                          fullWidth
                          autoFocus
                          name="query"
                          id="query"
                          value={searchInput}
                          onChange={handleQueryChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          InputProps={{
                            startAdornment: (
                              <IconButton
                                onClick={() => setShowSearchBar(false)}
                              >
                                <ArrowBackIcon className="arrow-back-icon" />
                              </IconButton>
                            ),
                            endAdornment: searchInput && (
                              <IconButton onClick={clearSearchInput}>
                                <ClearIcon />
                              </IconButton>
                            ),
                          }}
                        />
                      </form>
                    </div>
                  </Grid>
                </Grid>
              </Navbar>
              {showSearchMessage && (
                <Paper className={`${classes.hoverablePaper} header-navbar`}>
                  <MenuList id={"search-suggestions"}>
                    <MenuItem
                      className={classes.hoverableMenuItem}
                      onClick={handleFormSubmit}
                    >
                      <ListItemIcon>
                        <SearchIcon fontSize="small" className={"searchIcon"} />
                      </ListItemIcon>
                      <Typography variant="inherit" id="search-suggestions">
                        {searchMessage}
                      </Typography>
                    </MenuItem>
                  </MenuList>
                </Paper>
              )}
            </div>
          </div>
        ) : (
          mainNavBar()
        )}
        <Modal
          size="md"
          show={showModal}
          onHide={() => setShowModal(false)}
          aria-labelledby="signup-modal"
        >
          {/* tab container to do either signup or login component */}
          <Tab.Container defaultActiveKey="login">
            <Modal.Header closeButton>
              <Modal.Title id="signup-modal">
                <Nav variant="pills"></Nav>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tab.Content>
                <Tab.Pane eventKey="login">
                  <LoginForm handleModalClose={() => setShowModal(false)} />
                </Tab.Pane>
                <Tab.Pane eventKey="signup">
                  <SignUpForm handleModalClose={() => setShowModal(false)} />
                </Tab.Pane>
              </Tab.Content>
            </Modal.Body>
          </Tab.Container>
        </Modal>
      </>
    );
  }
);

export default AppNavbar;

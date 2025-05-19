import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import AppNavbar from './Navbar';
import '../css/homepage.css';
import makeStyles from "@mui/styles/makeStyles";
import DHAVideoRecorder from "./videoRecorder";
import getRecords from "../api/getRecordsApi";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import '../css/searchbox.css'
import {faBars, faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { useHistory } from 'react-router-dom';

const useStylesMain = makeStyles((theme) => ({
    noBorderNavbar: {
        border: "none", // Set the border property to 'none' to remove the border
    },
    hoverablePaper1: {
        "&:hover": {
            backgroundColor: "#007bff",
            "& #search-suggestions-main": {
                color: "white",
            },
            "& .MuiSvgIcon-root": {
                // Style for SearchIcon
                fill: "white",
            },
        },
    },
    hoverableMenuItem1: {
        "&:hover #search-suggestions-main": {
            color: "white",
        },
    },
}));


const Homepage = forwardRef(
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

        const [searchInputMain, setSearchInputMain] = useState("");
        const inputRef = useRef(null);
        const [showSearchMainMessage, setShowSearchMainMessage] = useState(false);

        useImperativeHandle(ref, () => ({
            handleChipDelete: () => {
                setSearchInputMain(""); // Clear the input
                inputRef.current && inputRef.current.focus(); // Focus the input
            },
        }));
        const classesMain = useStylesMain();
        const history = useHistory();

        const handleMainFocus = (event) => {
            setShowSearchMainMessage(true);
        };
        const handleMainBlur = () => {
            setTimeout(() => {
                if (
                    document.getElementById("search-suggestions-main") != null &&
                    document.activeElement !==
                    document.getElementById("search-suggestions-main")
                ) {
                    setShowSearchMainMessage(false);
                }
            }, 200); // Delayed the onBlur event by 200 milliseconds
        };

        const handleFormSubmit = async (event) => {
            history.push('/Search');

            setShowSearchMainMessage(false); // Close navbar
            // DHAVideoRecorder.initRecorder().then(()=>{console.log("video recording started ...........")});
            if (window.LogUI && window.LogUI.isActive()) {
                window.LogUI.logCustomMessage({
                    name: 'query-submitted',
                    objectName: searchInputMain,
                    id: localStorage.getItem('loggedInUser')
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
                const response = await getRecords(searchInputMain, filterQuery, 1);
                onSharedVariableChange(
                    false,
                    response.totalPages,
                    response.artworkData
                );
                history.push('/Search');
            } catch (err) {
                console.error(err);
            }

        };

        const handleQueryMainChange = (e) => {
            let value = e.target.value;
            setSearchInputMain(value);
        };

        const clearSearchInputMain = () => {
            setSearchInputMain("");
        };

        const searchMessageMain = searchInputMain
            ? `Search for ${searchInputMain}`
            : "Search for everything";

        return (
            <div className="homepage-container">
                <AppNavbar />

                <div className="searchbox-container">
                    {/* <h1>AggreGate</h1> */}
                    {/* <p>Search, save and share art, books, films, and music from thousands of cultural institutions</p> */}
                    <div>
                        <div expand="lg" className={"searchbox"}>
                                <form onSubmit={handleFormSubmit} className="ml-auto">
                                    <TextField
                                        ref={inputRef}
                                        autoComplete="off"
                                        placeholder="Search 50+ million items"
                                        variant="outlined"
                                        fullWidth
                                        autoFocus
                                        name="queryMain"
                                        id="queryMain"
                                        value={searchInputMain}
                                        onChange={handleQueryMainChange}
                                        onBlur={handleMainBlur}
                                        onFocus={handleMainFocus}
                                        InputProps={{
                                            startAdornment: (
                                                <IconButton >
                                                    <FontAwesomeIcon icon={faSearch} />
                                                </IconButton>
                                            ),
                                            endAdornment: (
                                                searchInputMain && (
                                                    <IconButton onClick={clearSearchInputMain}>
                                                        <ClearIcon/>
                                                    </IconButton>
                                                )
                                            ),
                                        }}
                                    />
                                </form>
                            {showSearchMainMessage && (
                                <Paper className={`${classesMain.hoverablePaper1} searchbox-suggestion-main`}>
                                    <MenuList id={"search-suggestions"}>
                                        <MenuItem
                                            className={classesMain.hoverableMenuItem1}
                                            onClick={handleFormSubmit}
                                        >
                                            <ListItemIcon>
                                                <SearchIcon fontSize="large" className={"searchIcon"} />
                                            </ListItemIcon>
                                            <Typography variant="inherit" id="search-suggestions">
                                                {searchMessageMain}
                                            </Typography>
                                        </MenuItem>
                                    </MenuList>
                                </Paper>
                            )}
                        </div>

                    </div>
                </div>

                <footer>
                    <p>&copy; 2024 AggreGate</p>
                </footer>
            </div>
        );
    });

export default Homepage;

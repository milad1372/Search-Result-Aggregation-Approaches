import React, {useState, useRef} from "react";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    useLocation,
} from "react-router-dom";
import SearchArtworks from "./pages/SearchArtworks";
import SavedArtworks from "./pages/SavedArtworks";
import Navbar from "./components/Navbar";
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    createHttpLink,
} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import {getSavedArtworkIds} from "./utils/localStorage";
import {Container, Row} from "react-bootstrap";
import LoginForm from "./components/LoginForm";
import UserProfile from "./pages/UserProfile";
import Gallery from "./pages/Gallery";
import Homepage from "./components/HomePage";

const httpLink = createHttpLink({
    uri: "/graphql",
});

const authLink = setContext((_, {headers}) => {
    const token = localStorage.getItem("id_token");
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

const NavbarWrapper = ({children}) => {
    const location = useLocation();

    // Hide the Navbar on the "/LoginForm" route
    const hideNavbar = location.pathname === "/LoginForm";

    return <>{hideNavbar ? null : children}</>;
};

const App = () => {
    const [searchedArtworks, setSearchedArtworks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({}); // Add this state to hold the current filters
    const [isLoading, setIsLoading] = useState(false); // Add this state to hold the current filters
    const handleChipDelete = () => {
        navbarRef.current && navbarRef.current.handleChipDelete();
    };

    const navbarRef = useRef(null);
    const handleSharedVariableChange = (isLoading, totalPages, artworkData) => {
        console.log("nav isLoading: ", isLoading);
        setTotalPages(totalPages);
        setSearchedArtworks(artworkData);
        setCurrentPage(1);
        setIsLoading(isLoading);
    };

    return (
        <ApolloProvider client={client}>
            <Router>
                <NavbarWrapper>
                    <Navbar
                        ref={navbarRef}
                        searchedArtworks={searchedArtworks}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        isLoading={isLoading}
                        onSharedVariableChange={handleSharedVariableChange}
                        filters={filters} // Pass the filters to Navbar
                        onFilterChange={setFilters} // Pass a function to update the filters
                    />
                </NavbarWrapper>

                <Switch>
                    <Route exact path="/"
                           render={(props) => (
                               <Homepage
                                   {...props}
                                   ref={navbarRef}
                                   searchedArtworks={searchedArtworks}
                                   currentPage={currentPage}
                                   totalPages={totalPages}
                                   isLoading={isLoading}
                                   onSharedVariableChange={handleSharedVariableChange}
                                   filters={filters} // Pass the filters to Navbar
                                   onFilterChange={setFilters} // Pass a function to update the filters
                               />
                           )}/> <Route
                    exact
                    path="/Search"
                    render={(props) => (
                        <SearchArtworks
                            {...props}
                            onChipDelete={handleChipDelete}
                            searchedArtworks={searchedArtworks}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            isLoading={isLoading}
                            filters={filters} // Pass the filters to SearchArtworks
                            onFilterChange={setFilters} // Pass a function to update the filters
                        />
                    )}
                />
                    <Route exact path="/saved" component={SavedArtworks}/>
                    <Route exact path="/LoginForm" component={LoginForm}/>
                    <Route exact path="/UserProfile" component={UserProfile}/>
                    <Route exact path="/Gallery" component={Gallery}/>
                </Switch>
            </Router>
        </ApolloProvider>
    );
};

export default App;

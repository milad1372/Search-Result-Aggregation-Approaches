import getUserLikedArtworks from "./getUserLikedArtworksApi";

const AWS_Base_URL = "XXXX.amazonaws.com:3005/";
const Local_Base_URL = "http://localhost:3001/";
const mainURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? Local_Base_URL : AWS_Base_URL;

const getRecords = async function (searchInput, filterQuery, pageNumber) {
    if (localStorage.getItem('firstRun') !== null && localStorage.getItem('firstRun') !== "true") {
        localStorage.setItem('currentQuery', searchInput);
        localStorage.setItem('currentFilter', filterQuery);

        let dataObject = {
            items: [],
            artworkData: [],
            totalPages: 0
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                searchInput: searchInput,
                filterQuery: filterQuery,
                pageNumber: pageNumber,
            })
        };

        const response = await fetch(mainURL + 'recordList', requestOptions);
        if (!response.ok) {
            console.log("response.ok", response.ok);
            return dataObject;
        }

        const result = await response.json();

        const res = await getUserLikedArtworks();
        const likedArtwork = (res.likedArtworks && res.likedArtworks.length != 0) ? res.likedArtworks[0].artworks : []
        const likedArtworkIds = new Set(likedArtwork.map(artwork => artwork.artworkId));
        console.log("ids: ", likedArtworkIds)
        console.log("res: ", res)
        let artworkData = result.data ? result.data.items.map((artwork) => ({
            artworkId: artwork.id,
            title: artwork.title[0],
            license: artwork.rights[0],
            dataProvider: artwork.dataProvider[0],
            dcCreator: artwork.dcCreator ? artwork.dcCreator[0] : "",
            type: artwork.type,
            image: artwork.edmPreview ? artwork.edmPreview[0] : "No image available",
            // description: artwork.dcDescriptionLangAware ? (artwork.dcDescriptionLangAware.en ? artwork.dcDescriptionLangAware.en[0] : "") : "",
            description: artwork.dcDescription ? artwork.dcDescription[0] : "",
            keywords: [],
            liked: likedArtworkIds.has(artwork.id),
        })) : [];

        await fetchKeywordsForAllArtworks(artworkData);

        dataObject = {
            items: result.data ? result.data.items : [],
            artworkData: artworkData,
            totalPages: result.data ? result.data.totalResults : 0,
            // facets: result.data ? result.data.facets : []
            
        };
        // console.log(dataObject.facets);
        return dataObject;
    }
};

const fetchKeywordsForArtwork = async (artwork) => {
    const response = await fetch(mainURL + 'getKeywords', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({title: artwork.title})
    });

    const keywords = await response.json();
    artwork.keywords = keywords;
};

const fetchKeywordsForAllArtworks = async (artworks) => {
    // Here we map each artwork to a promise that fetches its keywords
    const promises = artworks.map(artwork => fetchKeywordsForArtwork(artwork));

    // Wait for all those promises to resolve
    await Promise.all(promises);
};

export default getRecords;

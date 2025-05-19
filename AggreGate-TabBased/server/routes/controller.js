const express = require("express");
const app = express();

const recordRoutes = express.Router();
const apiCall = require("../business/ApiCall");
const databaseOperations = require("../business/databaseOperation");

recordRoutes.route("/").get(function () {
    console.log("api connected!\n");
});

app.use(function (req, res, next) {
    // running front-end application on port 3000
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

async function fetchImageUrlsForDocs(docs) {
    const imageUrls = await Promise.all(docs.map(async (doc) => {
        const doi = doc.article.pnx.addata.doi;
        const issn = doc.article.pnx.addata.issn && doc.article.pnx.addata.issn[0]; // Assuming ISSN is an array and using the first one
        console.log("DOI", doi, "ISSN", issn);
        let urlImage;
        if (doi) {
            urlImage = `https://public-api.thirdiron.com/public/v1/libraries/172/articles/doi/${doi}?include=journal&access_token=XXXX`;
        } else if (issn) {
            urlImage = `https://public-api.thirdiron.com/public/v1/libraries/172/search?issns=${issn}&access_token=XXXX`;
        } else {
            console.warn('Both DOI and ISSN are undefined for a document; using default image URL.');
            return "No image available";
        }

        try {
            const response = await fetch(urlImage);
            if (!response.ok) {
                throw new Error('Failed to fetch image URL');
            }
            const data = await response.json();
            if (doi) {
                // Accessing coverImageUrl for a DOI-based fetch
                return data.included && data.included.length > 0 ? data.included[0].coverImageUrl : "No image available";
            } else {
                // Assuming the first result is the most relevant for an ISSN search
                // Adjust this logic based on the actual response structure for an ISSN-based search
                const coverImageUrl = data.results && data.results.length > 0 && data.results[0].coverImageUrl ? data.results[0].coverImageUrl : "No image available";
                return coverImageUrl;
            }
        } catch (error) {
            console.error(`Error fetching image URL for ${doi ? 'DOI: ' + doi : 'ISSN: ' + issn}`, error);
            return "No image available";
        }
    }));
    console.log("IMGG", imageUrls);
    return imageUrls;
}


function transformExLibrisToEuropeana(exLibrisDocs, imageUrls) {
    console.log("NOW", imageUrls);
    const items = exLibrisDocs.map((doc, index) => {
        // Access the corresponding image URL by index
        const imageUrl = imageUrls[index];
        
        return {
            id: doc.article.pnx.control.recordid,
            title: doc.article.pnx.sort.title || [],
            rights: ["EXLIB"],
            dataProvider: doc.article.pnx.display.publisher || [],
            dcCreator: doc.article.pnx.display.publisher || [],
            type: "Article",
            edmPreview: imageUrl ? [imageUrl] : ["No image available"], // Ensure edmPreview is an array with the specific URL
            // dcDescriptionLangAware: doc.article.pnx.display.description || [],
            dcDescription: doc.article.pnx.display.description || [],
        };
    });

    // Encapsulating the items in the broader response structure
    return {
        apikey: "exlib",
        success: true,
        requestNumber: 999,
        itemsCount: items.length,
        totalResults: exLibrisDocs[0]?.totalRecords || 0, // Adjusted for potential undefined totalRecords
        items: items
    };
}

function mergeDataOrdered(europeanaItems, exLibrisItems, wikipediaItems) {
    const mergedItems = [];
    const maxLength = Math.max(europeanaItems.length, exLibrisItems.length, wikipediaItems.length);
    const batch = 10; // Number of items to take from each array in one round

    for (let i = 0; i < maxLength; i += batch) {
        // Add from europeanaItems
        mergedItems.push(...europeanaItems.slice(i, i + batch));
        // Add from exLibrisItems
        mergedItems.push(...exLibrisItems.slice(i, i + batch));
        // Add from wikipediaItems
        mergedItems.push(...wikipediaItems.slice(i, i + batch));
    }

    return mergedItems;
}

// This section will help you get a list of all the records.
recordRoutes.route("/recordList").post(async function (request, response) {
    console.log('get record list operation ____________________________________________');
    let searchInput = String(request.body.searchInput).trim().toLowerCase();
    searchInput = (!searchInput || searchInput === "") ? null : searchInput;

    let filterQuery = String(request.body.filterQuery).trim();
    let pageNumber = request.body.pageNumber;

    console.log("endpoint hit! ---- search term=", searchInput, filterQuery, " ------page# =", pageNumber, "\n");

    if (searchInput === undefined || searchInput === "") {
        return response.status(404).send({
            success: 'false',
            data: [],
        });
    }

    try {
        const [europeanaData, exlibrisData, wikipediaData] = await Promise.all([
            apiCall.retrieveDocumentsFromEuropeanaAPI(searchInput, filterQuery, pageNumber),
            apiCall.retrieveDocumentsFromexlibrisgroupAPI(searchInput, pageNumber),
            apiCall.retrieveDocumentsFromWikipedia(searchInput, pageNumber) // Adding the Wikipedia call
        ]);
        console.log("WIKI:",wikipediaData);
        // Assuming europeanaData is already in the correct format or has been transformed accordingly
        const europeanaItems = europeanaData.items; // Adjust as necessary
        const wikipediaItems = wikipediaData.items; // Direct use if already in correct format or transform as needed

        // Fetch image URLs before transforming ExLibris documents
        const imageUrls = await fetchImageUrlsForDocs(exlibrisData);
    
        // Transform the ExLibris documents, including the fetched image URLs
        const transformedExLibrisData = transformExLibrisToEuropeana(exlibrisData, imageUrls);
        const exLibrisItems = transformedExLibrisData.items; // Assuming this is the correct structure
    
        // Merge the data from Europeana and ExLibris in a round-robin fashion
        const mergedItems = mergeDataOrdered(europeanaItems, exLibrisItems, wikipediaItems);
        const totalResults = europeanaData.totalResults + transformedExLibrisData.totalResults + wikipediaItems.length; // Adjust as necessary        // console.log("FINAL",mergedItems)
        response.status(200).send({
            success: 'true',
            data: {
                items: mergedItems,
                totalResults: totalResults,
                // Include other relevant response fields
            },
        });
    } catch (error) {
        console.error("Error during API calls:", error);
        response.status(500).send({
            success: 'false',
            message: 'An error occurred while fetching data.',
        });
    }
});

recordRoutes.route("/saveGalleryIntoDataBase").post(async function (request, response) {
    console.log('save Gallery into dataBase operation ____________________________________________');

    let gallery = String(request.body.gallery).trim();
    let artwork = request.body.artwork;
    let image = request.body.image;
    let isPrivate = request.body.isPrivate;
    let galleryDescription = request.body.galleryDescription;
    let user = request.body.user.trim().toLowerCase();
    let query = request.body.query.trim();
    await databaseOperations.saveGallery(gallery, artwork, image, galleryDescription, user,isPrivate, query).then(function (isSavedSuccessful) {
        console.log("is gallery save Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/saveArtworkIntoDataBase").post(async function (request, response) {
    console.log('save Gallery into dataBase operation ____________________________________________');

    let artwork = request.body.artwork;
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.saveLikedArtwork(artwork, user).then(function (isSavedSuccessful) {
        console.log("is artwork save Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/deleteLikedArtwork").post(async function (request, response) {
    console.log('delete Liked Artwork from dataBase operation ____________________________________________');

    let artworkId = request.body.artworkId;
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.deleteLikedArtwork(artworkId, user).then(function (isSavedSuccessful) {
        console.log("is artwork deleted Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/deleteGallery").post(async function (request, response) {
    console.log(' delete Gallery from dataBase operation ____________________________________________');

    let galleryName = request.body.galleryName.trim().toLowerCase();
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.deleteGallery(galleryName, user).then(function (isSavedSuccessful) {
        console.log("is artwork deleted Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/deleteArtworkFromGallery").post(async function (request, response) {
    console.log(' delete Gallery from dataBase operation ____________________________________________');

    let galleryId = request.body.galleryId.trim().toLowerCase();
    let artworkId = request.body.artworkId.trim().toLowerCase();
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.deleteArtworkFromGallery(galleryId, artworkId, user).then(function (isSavedSuccessful) {
        console.log("is artwork deleted Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/updateGallery").post(async function (request, response) {
    console.log('update deleteGallery from dataBase operation ____________________________________________');

    let gallery = request.body.gallery;
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.updateGallery(gallery, user).then(function (isSavedSuccessful) {
        console.log("is artwork update Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/getGalleries").post(function (request, response) {
    console.log('get gallery  operation ____________________________________________');
    let user = request.body.user ? request.body.user.trim().toLowerCase() : '';
    databaseOperations.getGalleries(user).then(
        function (galleries) {
            console.log("retrieved galleries count from database: ", galleries.length, "\n");
            response.status(200).send({
                success: 'true',
                galleries: galleries
            });
        })

});

recordRoutes.route("/getLikedArtworksForUser").post(function (request, response) {
    console.log('get gallery  operation ____________________________________________');
    let user = request.body.user ? request.body.user.trim().toLowerCase() : '';
    databaseOperations.getLikedArtworksForUser(user).then(
        function (likedArtworks) {
            console.log("retrieved user liked artworks count from database: ", likedArtworks.length, "\n");
            response.status(200).send({
                success: 'true',
                likedArtworks: likedArtworks
            });
        })

});

recordRoutes.route("/getKeywords").post(async function (request, response) {
    const title = request.body.title;
    console.log(`Received title for keyword extraction: "${title}"`);
    const keywords = await apiCall.retrieveKeywordsFromYAKE(title);
    console.log(`Extracted keywords for title "${title}":`, keywords);
    response.status(200).send(keywords);
});

const multer = require('multer');

// Set storage engine for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './videos'); // Folder to save the video file
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep the original file name
    }
});

const upload = multer({storage: storage});


recordRoutes.post("/saveVideoFile", upload.single('video'), async (request, response) => {
    console.log(request.file);
})

var WebSocket = require('ws');
const wss = new WebSocket.Server({port: 2007});

wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {

        const data = JSON.parse(message);
        if (data.type == 'logEvents') {

            if (data.payload.items && data.payload.items.length > 0) {
                // console.log('new log arrived: ', data.payload.items[0].eventType);
                if (data.payload.items[0].applicationSpecificData) {
                    databaseOperations.getLogByUserId(data.payload.items[0].applicationSpecificData.userID ).then( function (t) {
                        if (t) {
                            data.payload.items.forEach(logObj => {
                                if (logObj.eventType!="browserEvent"){
                                    console.log('type: ',logObj);

                                    t.logs.push({
                                        applicationSpecificData: logObj.applicationSpecificData,
                                        eventType: logObj.eventType,
                                        eventDetails: logObj.eventDetails,
                                        timestamps: logObj.timestamps,
                                        metadata: logObj.metadata
                                    });
                                }
                            });

                            databaseOperations.updateLog(t);
                        } else {
                            console.log(2);
                            const logList = {
                                userID:data.payload.items[0].applicationSpecificData.userID,
                                logs: []
                            };
                            data.payload.items.forEach(logObj => {
                                if (logObj.eventType!="browserEvent"){
                                    logList.logs.push({
                                        applicationSpecificData: logObj.applicationSpecificData,
                                        eventType: logObj.eventType,
                                        eventDetails: logObj.eventDetails,
                                        timestamps: logObj.timestamps,
                                        metadata: logObj.metadata
                                    });
                                }});
                            databaseOperations.saveNewLog(logList);
                        }
                    });
                }
            }
        }
    })
});

module.exports = recordRoutes;


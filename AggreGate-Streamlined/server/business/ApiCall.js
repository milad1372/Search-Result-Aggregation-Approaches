const axios = require('axios');
const querystring = require('querystring');


const Api_Key_EUROP = process.env.Api_Key_EUROP;
const Api_Key_EXLIB = process.env.Api_Key_EXLIB;
const Format = process.env.Format;
const Max_Records = process.env.Max_Records;
const Sort_Order = process.env.Sort_Order;
const Sort_Field = process.env.Sort_Field;
const Base_URL_For_Europeana = process.env.Base_URL_For_Europeana;
const Base_URL_For_exlibrisgroup = process.env.Base_URL_For_exlibrisgroup;
const BASE_URL_FOR_WIKIPEDIA = process.env.BASE_URL_FOR_WIKIPEDIA;

const yakeURL = "http://XXXX/yake/";
const stopWords = [
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'null', 'nüll'
];

module.exports = {

    retrieveDocumentsFromEuropeanaAPI: async function (searchInput, filterQuery, pageNumber, response) {
        let startRecord = 10 * (pageNumber - 1) + 1;
        let targetURI = Base_URL_For_Europeana + `profile=facets&sort=score+desc&query=${searchInput}&${filterQuery}&rows=${Max_Records}&start=${startRecord}&wskey=${Api_Key_EUROP}`;

        console.log("targetURI: ", targetURI);

        try {
            const apiResponse = await axios.get(targetURI, {
                headers: {
                    Accept: "application/json, text/plain",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                    "Accept-Language": "en-ca",
                },
            });

            const responseData = apiResponse.data;
            return responseData;
        } catch (error) {
            console.error("Error retrieving data from API:", error);
            return null;
        }
    },

    retrieveKeywordsFromYAKE: async function(title) {
        try {
            const response = await axios.post(yakeURL, {
                language: "en",
                max_ngram_size: 2,
                number_of_keywords: 5,
                text: title
            }, {
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            const keywords = response.data ? response.data.map(keywordObj => keywordObj.ngram) : [];

            const filteredKeywords = keywords.filter(keyword => {
                const parts = keyword.toLowerCase().split(/[- .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/);
                return !parts.some(part => stopWords.includes(part));
            });

            return filteredKeywords;

        } catch (error) {
            console.error("Error retrieving keywords from YAKE:", error);
            return [];
        }
    },


    retrieveDocumentsFromexlibrisgroupAPI: async function (searchInput, pageNumber, response) {

        let startRecord = 10 * (pageNumber - 1) + 1;
        let documents = [];
        let offset = (pageNumber - 1) * 10;
        let targetURI = Base_URL_For_exlibrisgroup + "q=any,contains," + searchInput + "&offset=" + offset + "&sort=rank";

        console.log("targetURI: ", targetURI);

        await axios.get(targetURI,
            {
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                    'Accept-Language': 'en-ca'
                }
            }).then(response => {
            let totalRecords;
            if (response.status === 200) {
                const data = response.data.docs;
                totalRecords = response.data.info.total;
                //  console.log("data---------->\n", data);
                console.log("total records----------", totalRecords);

                if (totalRecords == 0) {
                    return 0;
                } else {
                    for (let j = 0; j < data.length; j++) {
                        let document = {
                            totalRecords: totalRecords,
                            savedOrderId: startRecord + j,
                            article: data[j],
                        };
                        documents.push(document);
                    }
                    return documents;
                }
            } else {
                console.log(response.status)
            }
        }).then(function (documents) {
            //read data ids and query IEEE API to get papers
            if (documents === 0) {
                return documents;
            }
        }).catch(function (error) {
            if (error.response) {
                // Request made and server responded
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                return documents;
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
                return documents;
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
                return documents;
            }

        });
        return documents;
    },

    retrieveDocumentsFromWikipedia: async function(searchInput, pageNumber = 1) {
        const Max_Records = process.env.Max_Records || 10; // Use environment variable or default
        const sroffset = (pageNumber - 1) * Max_Records;
        const searchParams = {
            action: "query",
            list: "search",
            srsearch: searchInput,
            srlimit: Max_Records,
            sroffset: sroffset,
            format: "json"
        };

        console.log(`Retrieving page ${pageNumber} of documents from Wikipedia for:`, searchInput);

        try {
            const searchResponse = await axios.get(BASE_URL_FOR_WIKIPEDIA, { params: searchParams });
            const searchResults = searchResponse.data.query.search;
            const pageIds = searchResults.map(result => result.pageid).join("|");

            const imageParams = {
                action: "query",
                pageids: pageIds,
                prop: "pageimages",
                pithumbsize: 100,
                format: "json"
            };

            const imageResponse = await axios.get(BASE_URL_FOR_WIKIPEDIA, { params: imageParams });
            const pages = imageResponse.data.query.pages;

            const transformedItems = searchResults.map(result => {
                const page = pages[result.pageid];
                const imageUrl = page.thumbnail ? page.thumbnail.source : "No image available";
                
                return {
                    id: result.pageid.toString(),
                    title: [result.title], // Wikipedia title in an array
                    rights: ["WIKI"], // Static value indicating the source
                    dataProvider: ["Wikipedia"], // Static value as Wikipedia is the data provider
                    dcCreator: ["Wikipedia"], // Assuming Wikipedia as the creator due to lack of specific author data
                    type: "WIKI", // Static value indicating the type of document
                    edmPreview: [imageUrl], // Image URL from Wikipedia, or a placeholder
                    dcDescription: [result.snippet.replace(/<\/?[^>]+(>|$)/g, "")], // Removing HTML tags from snippet
                };
            });

            return {
                apikey: "wikipedia",
                success: true,
                requestNumber: pageNumber,
                itemsCount: transformedItems.length,
                totalResults: searchResponse.data.query.searchinfo.totalhits,
                items: transformedItems
            };
        } catch (error) {
            console.error("Error retrieving documents and images from Wikipedia:", error);
            return {
                success: false,
                message: "An error occurred while fetching data from Wikipedia."
            };
        }
    },

};

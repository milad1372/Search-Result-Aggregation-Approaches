const dbo = require("../config/connection");
const sort = {savedOrderId: 1};
const limit = 10;
let ObjectId = require('mongodb').ObjectId;

module.exports = {

    saveGallery: async function (gallery, artwork, image, galleryDescription, user, isPrivate, query) {
        let newArtworks = [];
        artwork.query = query;
        artwork.addTimeStamp = new Date();
        let db_connect = dbo.getDb();
        let galleryFromDatabase = await this.getGalleryFromDatabaseByGalleryName(gallery, user);
        if (galleryFromDatabase != null && galleryFromDatabase != "" && galleryFromDatabase != undefined) {
            newArtworks = galleryFromDatabase.artworks;
            const filterArtworks = newArtworks.filter((artworkC) => artworkC.artworkId == artwork.artworkId);
            filterArtworks.length == 0 && artwork!=null && artwork!= ""? newArtworks.push(artwork) : newArtworks;

            let newValue = {$set: {artworks: newArtworks}};
            const filter = {"gallery": {$regex: new RegExp(gallery, "i")}, user: user};
            try {
                let res = await db_connect.collection("galleryCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 gallery updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        } else {
            artwork!=null && artwork!= ""?newArtworks.push(artwork):[];
            let galleryFroSavingIntoDatabase = {
                gallery: gallery,
                image: image,
                artworks: newArtworks,
                galleryDescription: galleryDescription,
                user: user,
                isPrivate: isPrivate
            };

            try {
                let res = await db_connect.collection("galleryCollection").insertOne(galleryFroSavingIntoDatabase);
                console.log("1 gallery inserted: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        }
    },


    saveLikedArtwork: async function (artwork, user) {
        let newArtworks = [];
        let db_connect = dbo.getDb();

        let userFromDatabase = await this.getUserLikedArtworksFromDatabaseByUserName(user);
        if (userFromDatabase != null && userFromDatabase != "" && userFromDatabase != undefined) {
            newArtworks = userFromDatabase.artworks;
            const filterArtworks = newArtworks.filter((artworkC) => artworkC.artworkId == artwork.artworkId);
            filterArtworks.length == 0 ? newArtworks.push(artwork) : newArtworks;
            let newValue = {$set: {artworks: newArtworks}};
            const filter = {user: user};
            try {
                let res = await db_connect.collection("userLikedArtworksCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 user data updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        } else {
            newArtworks.push(artwork);
            let userArtworkFroSavingIntoDatabase = {
                artworks: newArtworks,
                user: user,
            };

            try {
                let res = await db_connect.collection("userLikedArtworksCollection").insertOne(userArtworkFroSavingIntoDatabase);
                console.log("1 gallery inserted: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        }
    },


    deleteLikedArtwork: async function (artworkId, user) {
        let db_connect = dbo.getDb();

        console.log("deleted artworkId: " ,artworkId);
        let userFromDatabase = await this.getUserLikedArtworksFromDatabaseByUserName(user);
        const artworkIdToFind = artworkId.toString().toLowerCase().trim();
        console.log("previouse ArtworkIds length: ", userFromDatabase.artworks.length);

        let indexToRemove = userFromDatabase.artworks.findIndex(function(el) {
            return el.artworkId.toString().toLowerCase().trim() === artworkIdToFind;
        });

        if (indexToRemove !== -1) {
            userFromDatabase.artworks.splice(indexToRemove, 1);
        }

        console.log("Index to remove: ", indexToRemove);
        console.log("newArtworkIds length: ", userFromDatabase.artworks.length);

        let newValue = {$set: {artworks: userFromDatabase.artworks}};
        const filter = {user: user};
        try {
            let res = await db_connect.collection("userLikedArtworksCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
            console.log("1 user updated");
            return true;
        } catch (err) {
            console.error(`Something went wrong: ${err}`);
            return false;
        }

    },


    deleteGallery: async function (galleryName, user) {
        let db_connect = dbo.getDb();

        const filter = {"gallery": {$regex: new RegExp(galleryName, "i")}, user: user};
        try {
            let res = await db_connect.collection("galleryCollection").findOneAndDelete(filter, {returnDocument: "after"});
            console.log("1 gallery deleted: ", res);
            return true;
        } catch (err) {
            console.error(`Something went wrong: ${err}`);
            return false;
        }
    },

    deleteArtworkFromGallery: async function (galleryId, artworkId, user) {
        let newArtworks = [];
        let db_connect = dbo.getDb();

        let galleryFromDatabase = await this.getGalleryFromDatabaseById(galleryId, user);
        if (galleryFromDatabase != null && galleryFromDatabase != "" && galleryFromDatabase != undefined) {
            newArtworks = galleryFromDatabase.artworks;
            const updatedArtworks = newArtworks.filter(artwork => artwork.artworkId.toLocaleLowerCase() !== artworkId.toLocaleLowerCase());
            let newValue = {$set: {artworks: updatedArtworks}};
            const filter = {"_id": ObjectId(galleryId), user: user};
            try {
                let res = await db_connect.collection("galleryCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 gallery updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        }
    },

    updateGallery: async function (galleryNew, user) {
        let db_connect = dbo.getDb();
        let newValue = {$set: {gallery: galleryNew.gallery,
                image: galleryNew.image,
                artworks: galleryNew.artworks,
                galleryDescription: galleryNew.galleryDescription,
                user: user,
                isPrivate: galleryNew.isPrivate}};
            const filter = { "_id": ObjectId(galleryNew._id)};
            try {
                let res = await db_connect.collection("galleryCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 gallery updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
    },

    getGalleries: async function (user) {
        let db_connect = dbo.getDb();
        let galleries = [];
        galleries = await db_connect.collection('galleryCollection').find({
            user: user
        }).toArray();
        return galleries;
    },


    getLikedArtworksForUser: async function (user) {
        let db_connect = dbo.getDb();
        let likedArtworks = [];
        likedArtworks = await db_connect.collection('userLikedArtworksCollection').find({
            user: user
        }).toArray();
        return likedArtworks;
    },

    getGalleryFromDatabaseByGalleryName: async function (gallery, user) {
        let db_connect = dbo.getDb();
        let existingGallery;
        existingGallery = await db_connect.collection('galleryCollection').findOne({
            "gallery": {$regex: new RegExp(gallery, "i")},
            user: user
        });
        return existingGallery;
    },


    getGalleryFromDatabaseById: async function (Id, user) {
        console.log(Id)
        let db_connect = dbo.getDb();
        let existingGallery;
        existingGallery = await db_connect.collection('galleryCollection').findOne({
            "_id": ObjectId(Id),
            user: user
        });
        return existingGallery;
    },


    getUserLikedArtworksFromDatabaseByUserName: async function (user) {
        let db_connect = dbo.getDb();
        let existingUser;
        existingUser = await db_connect.collection('userLikedArtworksCollection').findOne({
            "user": {$regex: new RegExp(user, "i")},
            user: user
        });
        return existingUser;
    },

    getLogByUserId: async function (userID) {
        let db_connect = dbo.getDb();
        let existingLog;
        let query1 = {"userID":  userID};
        existingLog = await db_connect.collection('logCollection').findOne(query1);
        return existingLog;
    },

    updateLog: async function (log) {
        let db_connect = dbo.getDb();
        const filter = {"_id": ObjectId(log._id)};
        let existingLog = await db_connect.collection('logCollection').findOneAndReplace(filter, log, {returnDocument: "after"});
        return existingLog;

    },

    saveNewLog: async function (logList) {
        let db_connect = dbo.getDb();
        await db_connect.collection("logCollection").insertOne(logList, function (err) {
            if (err) {
                throw err;
                console.log("Database error: ", err);
                return false;
            } else {
                console.log("log saved into database successfully!");
                return true;
            }
        });
    }
}

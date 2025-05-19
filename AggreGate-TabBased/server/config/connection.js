const { MongoClient } = require("mongodb");
const Db = "mongodb+srv://XXXX";
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let _db;

module.exports = {
  connectToServer: function (callback) {
    console.log('DB Establised: ',Db)
    client.connect(function (err, db) {
      // Verify we got a good "db" object
      if (db)
      {
        _db = db.db("dhaDB");
        console.log("Successfully connected to MongoDB.\n");
      }
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  },
};

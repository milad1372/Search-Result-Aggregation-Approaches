const express = require("express");
const path = require("path");
const dbo = require("./config/connection");

// add apollo server
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
app.use(cors());
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb'}));
app.use(require("./routes/controller"));


app.listen(PORT, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);

  });
  console.log(`Server is running on port: ${PORT}\n`);
});


// // add apollo middleware
// const startServer = async () => {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: authMiddleware,
//   });
//   await server.start();
//   server.applyMiddleware({ app });
//   console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
// };
//
// startServer();
//
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
//
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
// }
//
// app.listen(PORT, () => {
//   // perform a database connection when server starts
//   db.connectToServer(function (err) {
//     if (err) console.error(err);
//
//   });
//   console.log(`Server is running on port: ${PORT}\n`);
// });

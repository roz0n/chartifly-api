const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@chartify.iv5wu.mongodb.net/spotify-auth?retryWrites=true&w=majority`;
const db = require("monk")(uri);

db.then(() => {
  console.log("Successfully connected to MongoDB");
});

module.exports = db;
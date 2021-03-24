const db = require("../db");

async function spotifyAuth(req, res, next) {
  // get token
  const collection = await db.get("token");
  const query = await collection.findOne();
  const { token } = query;
  const { expirationDate } = token;
  // check if token is expired by checking if currentTime is greater than expirationDate
  const currentDate = new Date();
  const expiredOnDate = new Date(expirationDate);

  if (true) {
    // issue new token
    // delete the old token
    next();
  } else {
    // token is not expired
    next();
  }
  // if token is expired, get new token, store it, delete the old one, and call next()
  // if token is not expired, just call next()
  console.log("SPOTIFY AUTH MIDDLEWARE");
  next();
}

module.exports = spotifyAuth;

const db = require("../db");

async function spotifyAuth(req, res, next) {
  try {
    // get token
    const collection = await db.get("token");
    const query = await collection.findOne();
    const { token } = query;
    const { expirationDate: expirationString } = token;
    // check if token is expired by checking if currentTime is greater than expirationDate
    const current = new Date();
    const expiration = new Date(expirationString);

    if (current >= expiration) {
      // issue new token
      // delete the old token
      console.log("Token expired, issuing new token");
      next();
    } else {
      // token is not expired
      console.log("Token is not expired, proceed with request");
      next();
    }
    // if token is expired, get new token, store it, delete the old one, and call next()
    // if token is not expired, just call next()
    console.log("SPOTIFY AUTH MIDDLEWARE");
  } catch (error) {
    console.log("ERROR AUTH MIDDLEWARE", error);
  }
}

module.exports = spotifyAuth;

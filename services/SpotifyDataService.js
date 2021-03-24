const db = require("../db");
const axios = require("axios");
const querystring = require("querystring");

function Token(token, type, creationDate, expirationDate) {
  this.token = token;
  this.type = type;
  this.creationDate = creationDate;
  this.expirationDate = expirationDate;
}

function handleTokenDates(currentTime, expirationTime) {
  const expirationMs = expirationTime * 1000;
  return new Date(currentTime.getTime() + expirationMs);
}

class SpotifyDataService {
  CLIENT_ID = process.env.CLIENT_ID;
  CLIENT_SECRET = process.env.CLIENT_SECRET;

  endpoints = {
    getToken: "https://accounts.spotify.com/api/token",
    getTracklist: (region) =>
      `https://spotifycharts.com/regional/${region}/daily/latest/download`,
    getTrack: (id) => `https://api.spotify.com/v1/tracks/${id}`,
  };

  encodeCredentials(id, secret) {
    const data = `${id}:${secret}`;
    const buffer = Buffer.from(data);
    return buffer.toString("base64");
  }

  async issueToken() {
    try {
      const collection = db.get("token");
      const body = { grant_type: "client_credentials" };

      const { data } = await axios({
        method: "post",
        url: this.endpoints.getToken,
        headers: {
          Authorization: `Basic ${this.encodeCredentials(
            this.CLIENT_ID,
            this.CLIENT_SECRET
          )}`,
        },
        data: querystring.stringify(body),
      });

      const currentTime = new Date();

      const token = new Token(
        data.access_token,
        data.token_type,
        currentTime,
        handleTokenDates(currentTime, data.expires_in)
      );

      await collection.insert(token);
      await db.close();

      console.log("Successfully issued new auth token!");
      console.table(token);

      return token;
    } catch (error) {
      console.log("Error issuing auth token:", error.stack);
    }
  }
}

module.exports = new SpotifyDataService();

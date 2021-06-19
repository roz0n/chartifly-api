const db = require("../db");
const axios = require("axios");
const querystring = require("querystring");
const Token = require("../models/Token.model");
const { token } = require("morgan");

class SpotifyDataService {
  CLIENT_ID = process.env.CLIENT_ID;
  CLIENT_SECRET = process.env.CLIENT_SECRET;

  endpoints = {
    getToken: "https://accounts.spotify.com/api/token",
    getTracklist: (region) =>
      `https://spotifycharts.com/regional/${region}/daily/latest/download`,
    getTrack: (id) => `https://api.spotify.com/v1/tracks/${id}`,
    getRecentyPlayed: "https://api.spotify.com/v1/me/player/recently-played",
  };

  encodeCredentials(id, secret) {
    const data = `${id}:${secret}`;
    const buffer = Buffer.from(data);
    return buffer.toString("base64");
  }

  async issueToken() {
    try {
      const collection = db.get("token");
      const body = {
        grant_type: "client_credentials",
        scope: "user-read-recently-played"
      };
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
      
      const currentDate = new Date();
      const expirationDate = new Date;
      expirationDate.setSeconds(expirationDate.getSeconds() + data.expires_in);

      const token = new Token(
        data.access_token,
        data.token_type,
        currentDate,
        expirationDate
      );

      await collection.insert(token);
      return token;
    } catch (error) {
      console.log("Error issuing auth token:", error.stack);
    }
  }
}

module.exports = new SpotifyDataService();

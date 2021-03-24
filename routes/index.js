const axios = require("axios");
const querystring = require("querystring");
const csv = require("csvtojson");
const db = require("../db");
// const { Token } = "../models/Token";

const express = require("express");
const router = express.Router();

// CREDS
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

function encodeCredentials(id, secret) {
  const data = `${id}:${secret}`;
  const buffer = Buffer.from(data);
  return buffer.toString("base64");
}

function Token(token, type, expiration) {
  this.token = token;
  this.type = type;
  this.expiration = expiration;
}

// TEST ROUTE
router.get("/", function (req, res, next) {
  res.send({ success: true });
});

// SPOTIFY CLIENT-CREDENTIALS FLOW
// TODO: I don't think this needs to be a publicly accessible route
router.get("/token", async (req, res, next) => {
  try {
    const collection = db.get("token");
    const body = { grant_type: "client_credentials" };
    const endpoint = "https://accounts.spotify.com/api/token";

    const { data } = await axios({
      method: "post",
      url: endpoint,
      headers: {
        Authorization: `Basic ${encodeCredentials(CLIENT_ID, CLIENT_SECRET)}`,
      },
      data: querystring.stringify(body),
    });

    // TODO: This could be in a middleware
    const token = new Token(
      data.access_token,
      data.token_type,
      // TODO: Do date math
      data.expires_in
    );
    collection.insert(token);

    res.send({
      success: true,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send({
      success: false,
      error: "Failed to obtain access token",
    });
  }
});

// TRACKLIST
router.get("/tracklist/:region", async (req, res, next) => {
  try {
    const { region } = req.params;
    const endpoint = `https://spotifycharts.com/regional/${region}/daily/latest/download`;
    const { data } = await axios({
      method: "get",
      url: endpoint,
    });

    // `data` is a csv string
    const options = {
      noheader: true,
      headers: ["position", "trackName", "artist", "streams", "url"],
      output: "json",
    };
    let output = await csv(options).fromString(data);
    output.splice(0, 2);

    res.send({
      success: true,
      region,
      data: output,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: "Failed to get region tracklist",
    });
  }
});

// TRACK
// This is the only route that needs Spotify authentication
router.get("/track/:id", async (req, res, next) => {
  try {
    // TODO: Move to class
    const endpoint = "https://api.spotify.com/v1/tracks/${id}";
    const { id } = req.params;
    
    if (!id) throw new Error("No track id provided");
    
    const { data } = await axios({
      method: "get",
      url: endpoint,
      headers: {
        Authorization: `Bearer xxx`,
      },
    });

    res.send({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message || "Failed to get track data",
    });
  }
});

module.exports = router;

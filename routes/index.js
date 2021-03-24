const axios = require("axios");
// const querystring = require("querystring");
const csv = require("csvtojson");
const db = require("../db");
// const { Token } = "../models/Token";
const spotifyAuth = require("../middleware/spotifyAuth");

const express = require("express");
const router = express.Router();

// CREDS
// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;

// function encodeCredentials(id, secret) {
//   const data = `${id}:${secret}`;
//   const buffer = Buffer.from(data);
//   return buffer.toString("base64");
// }

// TOKEN HELPERS
// function Token(token, type, creationDate, expirationDate) {
//   this.token = token;
//   this.type = type;
//   this.creationDate = creationDate;
//   this.expirationDate = expirationDate;
// }

// function handleTokenDates(currentTime, expirationTime) {
//   const expirationMs = expirationTime * 1000;
//   return new Date(currentTime.getTime() + expirationMs);
// }

// TEST ROUTE
router.get("/", function (req, res, next) {
  res.send({ success: true });
});

// SPOTIFY CLIENT-CREDENTIALS FLOW
// TODO: I don't think this needs to be a publicly accessible route
// router.get("/token", async (req, res, next) => {
//   try {
//     const collection = db.get("token");
//     const body = { grant_type: "client_credentials" };
//     const endpoint = "https://accounts.spotify.com/api/token";

//     const { data } = await axios({
//       method: "post",
//       url: endpoint,
//       headers: {
//         Authorization: `Basic ${encodeCredentials(CLIENT_ID, CLIENT_SECRET)}`,
//       },
//       data: querystring.stringify(body),
//     });

//     const currentTime = new Date();

//     const token = new Token(
//       data.access_token,
//       data.token_type,
//       currentTime,
//       handleTokenDates(currentTime, data.expires_in)
//     );

//     await collection.insert(token);
//     await db.close();

//     res.send({
//       success: true,
//     });
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).send({
//       success: false,
//       error: "Spotify authentication failure",
//     });
//   }
// });

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
router.get("/track/:id", spotifyAuth, async (req, res, next) => {
  try {
    // TODO: Move to class
    const { id } = req.params;
    if (!id) throw new Error("No track id provided");

    const endpoint = `https://api.spotify.com/v1/tracks/${id}`;

    // Get token
    const collection = db.get("token");
    const query = await collection.findOne();
    const { token } = query;
    await db.close();

    const { data } = await axios({
      method: "get",
      url: endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.send({
      success: true,
      data,
    });
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).send({
      success: false,
      error: error.message || "Failed to get track data",
    });
  }
});

module.exports = router;

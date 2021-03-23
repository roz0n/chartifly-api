const axios = require("axios");
const querystring = require("querystring");

var express = require("express");
var router = express.Router();

// CREDS
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

function encodeCredentials(id, secret) {
  let data = `${id}:${secret}`;
  let buffer = Buffer.from(data);
  return buffer.toString("base64");
}

// TEST ROUTE
router.get("/", function (req, res, next) {
  res.send({ success: true });
});

// SPOTIFY CLIENT-CREDENTIALS FLOW
router.get("/token", async (req, res, next) => {
  try {
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

    res.send({
      success: true,
      token: data.access_token,
      type: data.token_type,
      expiration: data.expires_in,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: "Failed to obtain access token",
    });
  }
});

// TRACKLIST
router.get("/tracklist/:region", async (req, res, next) => {
  try {
    let { region } = req.params;

    res.send({
      success: true,
      for: region,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: "Failed to obtain region tracklist",
    });
  }
});

// TRACK
router.get("/tracklist/:region", async (req, res, next) => {
  try {
    let { region } = req.params;
    res.send({
      success: true,
      for: region,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: "Failed to obtain region tracklist",
    });
  }
});

module.exports = router;

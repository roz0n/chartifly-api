const axios = require("axios");
const db = require("../db");
const spotifyAuthMiddleware = require("../middleware/spotifyAuth.middleware");
const SpotifyDataService = require("../services/SpotifyData.service");
const express = require("express");
const router = express.Router();

router.use(spotifyAuthMiddleware);

// This route doesn't work as Spotify does now client-crential authenticated routes to access user data. Bummer.

router.get("/", async function (req, res, next) {
  try {
    const collection = db.get("token");
    const query = await collection.findOne();
    const { token } = query;
    const { data } = await axios({
      method: "get",
      url: SpotifyDataService.endpoints.getRecentyPlayed,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.send({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message || "Failed to get recently played data",
    });
  }
});

module.exports = router;
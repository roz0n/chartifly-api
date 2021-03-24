const axios = require("axios");
const db = require("../db");
const spotifyAuthMiddleware = require("../middleware/spotifyAuth.middleware");
const SpotifyDataService = require("../services/SpotifyData.service");
const express = require("express");
const router = express.Router();

router.use(spotifyAuthMiddleware);

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("No track id provided");
    }
    // Obtain token from db (middleware ensures it's there)
    const collection = db.get("token");
    const query = await collection.findOne();
    const { token } = query;
    await db.close();

    // Fetch data
    const { data } = await axios({
      method: "get",
      url: SpotifyDataService.endpoints.getTrack(id),
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
      error: error.message || "Failed to get track data",
    });
  }
});

module.exports = router;

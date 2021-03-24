const csv = require("csvtojson");
const axios = require("axios");
const SpotifyDataService = require("../services/SpotifyData.service");
const express = require("express");
const router = express.Router();

router.get("/:region", async (req, res, next) => {
  try {
    const { region } = req.params;
    const { data } = await axios({
      method: "get",
      url: SpotifyDataService.endpoints.getTracklist(region),
    });

    // `data` is a csv string
    let output = await csv({
      noheader: true,
      headers: ["position", "trackName", "artist", "streams", "url"],
      output: "json",
    }).fromString(data);

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

module.exports = router;

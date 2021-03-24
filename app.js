const dotenv = require("dotenv").config();
const _ = require("./db");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const indexRouter = require("./routes/index.route");
const trackRouter = require("./routes/track.route");
const tracklistRouter = require("./routes/tracklist.route");

app.use("/", indexRouter);
app.use("/track", trackRouter);
app.use("/tracklist", tracklistRouter);

module.exports = app;
// models/scrapedData.js

const mongoose = require('mongoose');

const scrapedDataSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
});

const ScrapedData = mongoose.model('ScrapedData', scrapedDataSchema);

module.exports = ScrapedData;

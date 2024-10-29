// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const websiteInfoRoute = require('./routes/websiteInfo');
const scraper = require('./scraper');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/Chat_demo', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

// Use the websiteInfo route
app.use('/', websiteInfoRoute);

// Endpoint to trigger scraping
app.post('/scrape', async (req, res) => {
  const scrapeUrl = req.body.url; // Assuming you'll provide the URL in the request body
  try {
    const scrapedData = await scraper.scrapeAndStoreData(scrapeUrl);
    res.json({ success: true, data: scrapedData });
  } catch (error) {
    console.error('Error scraping and storing data:', error);
    res.json({ success: false, error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

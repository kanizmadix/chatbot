// routes/websiteInfo.js

const express = require('express');
const router = express.Router();
const ScrapedData = require('../models/scrapedData');

// Endpoint to get website information
router.post('/website-info', async (req, res) => {
  const { url } = req.body;

  try {
    const data = await ScrapedData.findOne({ url });
    if (data) {
      res.json({ success: true, data });
    } else {
      res.json({ success: false, error: 'Website information not found' });
    }
  } catch (error) {
    console.error('Error retrieving website information:', error);
    res.json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;

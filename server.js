// server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

app.use(express.json());


app.post('/website-info', async (req, res) => {
  const { url } = req.body;

  try {
    const response = await axios.get(url);
    const websiteInfo = extractWebsiteInfo(response.data);
    res.json({ success: true, data: websiteInfo });
  } catch (error) {
    console.error('Error fetching website information:', error.message);
    res.status(500).json({ success: false, error: 'Error fetching website information' });
  }
});

function extractWebsiteInfo(html) {
  const $ = cheerio.load(html);

  // Extract relevant information based on your requirements
  const title = $('title').text();
  const metaDescription = $('meta[name="description"]').attr('content');
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  const firstParagraph = $('p').first().text();

  return {
    title,
    metaDescription,
    metaKeywords,
    firstParagraph
    // Add more fields as needed
  };
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

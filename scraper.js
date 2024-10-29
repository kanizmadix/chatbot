// scraper.js

const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/Chat_demo', { useNewUrlParser: true, useUnifiedTopology: true });

const ScrapedData = require('./models/scrapedData');

async function scrapeAndStoreData(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url);

  // Your scraping logic here...

  const title = await page.title();
  const description = await page.$eval('meta[name="description"]', (element) => element.getAttribute('content'));

  // Store data in MongoDB
  const scrapedData = new ScrapedData({
    title,
    description,
    url,
  });
  await scrapedData.save();

  await browser.close();

  return { title, description, url };
}

// Example usage:
const url = 'https://example.com';
scrapeAndStoreData(url)
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

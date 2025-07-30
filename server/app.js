const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage (in production, use a proper database)
const urlDatabase = new Map();
const statisticsDatabase = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
const logRequest = (req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  console.log('Backend Request:', JSON.stringify(logEntry));
  next();
};

app.use(logRequest);

// Utility functions
const generateShortcode = () => {
  return Math.random().toString(36).substring(2, 8);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const isValidShortcode = (shortcode) => {
  return /^[a-zA-Z0-9-_]{3,20}$/.test(shortcode);
};

// API Endpoints

// Create Short URL
app.post('/shorturls', (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (validity < 1 || validity > 10080) {
      return res.status(400).json({ error: 'Validity must be between 1 and 10080 minutes' });
    }

    let finalShortcode = shortcode;

    // Handle custom shortcode
    if (shortcode) {
      if (!isValidShortcode(shortcode)) {
        return res.status(400).json({ error: 'Invalid shortcode format' });
      }
      if (urlDatabase.has(shortcode)) {
        return res.status(409).json({ error: 'Shortcode already exists' });
      }
    } else {
      // Generate unique shortcode
      do {
        finalShortcode = generateShortcode();
      } while (urlDatabase.has(finalShortcode));
    }

    const expiry = new Date(Date.now() + validity * 60 * 1000);
    const shortLink = `http://localhost:${PORT}/${finalShortcode}`;

    const urlData = {
      shortcode: finalShortcode,
      originalUrl: url,
      shortLink,
      expiry: expiry.toISOString(),
      createdAt: new Date().toISOString(),
      clickCount: 0
    };

    // Store in database
    urlDatabase.set(finalShortcode, urlData);
    statisticsDatabase.set(finalShortcode, {
      ...urlData,
      clickData: []
    });

    console.log('URL Created:', JSON.stringify({
      shortcode: finalShortcode,
      originalUrl: url,
      expiry: expiry.toISOString()
    }));

    res.status(201).json({
      shortLink,
      expiry: expiry.toISOString()
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect to original URL
app.get('/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlData = urlDatabase.get(shortcode);

    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if expired
    if (new Date() > new Date(urlData.expiry)) {
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Update click statistics
    urlData.clickCount++;
    const clickData = {
      timestamp: new Date().toISOString(),
      source: req.get('Referer') || 'Direct',
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    const stats = statisticsDatabase.get(shortcode);
    if (stats) {
      stats.clickCount = urlData.clickCount;
      stats.clickData.push(clickData);
    }

    console.log('URL Accessed:', JSON.stringify({
      shortcode,
      originalUrl: urlData.originalUrl,
      clickCount: urlData.clickCount
    }));

    // Redirect to original URL
    res.redirect(urlData.originalUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get URL statistics
app.get('/shorturls/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    const stats = statisticsDatabase.get(shortcode);

    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    console.log('Statistics Retrieved:', JSON.stringify({
      shortcode,
      clickCount: stats.clickCount
    }));

    res.json(stats);

  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all URLs
app.get('/shorturls', (req, res) => {
  try {
    const allUrls = Array.from(statisticsDatabase.values()).map(url => ({
      shortcode: url.shortcode,
      originalUrl: url.originalUrl,
      shortLink: url.shortLink,
      expiry: url.expiry,
      createdAt: url.createdAt,
      clickCount: url.clickCount
    }));

    console.log('All URLs Retrieved:', JSON.stringify({ count: allUrls.length }));
    res.json(allUrls);

  } catch (error) {
    console.error('Error retrieving all URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('URL Shortener Microservice initialized');
});

module.exports = app;
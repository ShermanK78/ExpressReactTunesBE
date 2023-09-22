const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const port = process.env.PORT || 80;

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "img-src 'self' is1-ssl.mzstatic.com data:;");
  next();
});

app.get('/', (req, res) => {
  res.send('Server Running'); // Display "Server Running" message
});

app.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url; // Get the image URL from the request query
    const response = await axios.get(imageUrl, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).send('Error proxying image');
  }
});

let mediaData = [];

const fetchAndStoreData = async (term, entity) => {
  try {
    const apiUrl = `https://itunes.apple.com/search?term=${term}&entity=${entity}&limit=12`;

    const response = await axios.get(apiUrl, { timeout: 3000 });

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = response.data;

    mediaData = [];

    mediaData.push(...data.results);
  } catch (error) {
    console.error('Error fetching and storing data from iTunes API:', error.message);
  }
};

app.get('/api/search', async (req, res) => {
  try {
    const { term, entity } = req.query;

    await fetchAndStoreData(term, entity);

    console.log('Fetched data from iTunes API and stored in mediaData:', mediaData);

    res.json(mediaData);
  } catch (error) {
    console.error('Error handling /api/search request:', error.message);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});

app.post('/api/search', (req, res) => {
  const receivedData = req.body;
  console.log('Received data from React application:', receivedData);
  res.json({ message: 'Data received successfully.' });
});

app.delete('/api/media/:id', (req, res) => {
  const mediaId = parseInt(req.params.id);

  const index = mediaData.findIndex((media) => media.id === mediaId);

  if (index === -1) {
    res.status(404).json({ error: 'Media not found.' });
  } else {
    mediaData.splice(index, 1);
    res.json({ message: 'Media deleted successfully.' });
  }
});

app.listen(port, () => {
  console.log('Listening on', port);
});

module.exports = app;

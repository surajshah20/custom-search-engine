const express = require('express');
const cors = require('cors');
const { crawl } = require('./crawler');
const { indexDocument, search } = require('./indexer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows our React frontend to communicate with this API
app.use(express.json()); // Parses JSON body payloads

// Route 1: Trigger a crawl (POST /api/crawl)
app.post('/api/crawl', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const document = await crawl(url);
    if (document) {
        indexDocument(document);
        res.json({ message: 'Document crawled and indexed', title: document.title });
    } else {
        res.status(500).json({ error: 'Failed to crawl the provided URL' });
    }
});

// Route 2: Perform a search (GET /api/search?q=your+query)
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

    const results = search(query);
    res.json({ count: results.length, results });
});

app.listen(PORT, () => {
    console.log(`[Server] Search API running at http://localhost:${PORT}`);
});
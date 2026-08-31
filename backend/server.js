const express = require('express');
const cors = require('cors');
const { crawlCategoryPage, getLiveNepse } = require('./crawler');
const { indexDocument, search } = require('./indexer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const CATEGORY_URLS = [
    'https://www.sharesansar.com/category/latest',
    'https://www.sharesansar.com/category/ipo-fpo-right-share',
    'https://www.sharesansar.com/category/dividend-bonus'
];

async function runBackgroundCrawler() {
    console.log('\n[Background Worker] Fetching latest live news...');
    for (const catUrl of CATEGORY_URLS) {
        const docs = await crawlCategoryPage(catUrl);
        for (const doc of docs) {
            await indexDocument(doc);
        }
    }
    console.log('[Background Worker] Indexing complete.\n');
}

app.get('/api/search', async (req, res) => {
    const query = (req.query.q || '').toLowerCase();
    if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

    let directAnswer = null;
    if (query.includes('nepse') || query.includes('index') || query.includes('market')) {
        directAnswer = await getLiveNepse();
    }

    const results = await search(query);
    res.json({
        directAnswer,
        count: results.length,
        results
    });
});

app.listen(PORT, () => {
    console.log(`[Server] Search API running at http://localhost:${PORT}`);
    runBackgroundCrawler();
    setInterval(runBackgroundCrawler, 1800000);
});
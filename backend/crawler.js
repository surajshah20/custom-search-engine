const axios = require('axios');
const cheerio = require('cheerio');

async function crawl(url) {
    console.log(`[Crawler] Starting crawl for: ${url}`);
    try {
        // 1. Fetch the raw HTML from the web server
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'CustomSearchBot/1.0' } // Politely identify our bot
        });
        const html = response.data;

        // 2. Load the HTML into Cheerio for parsing
        const $ = cheerio.load(html);

        // 3. Extract metadata
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || 'No description available';

        // 4. Extract main text content (combining all <p> tags)
        let content = '';
        $('p').each((_, element) => {
            content += $(element).text().trim() + ' ';
        });

        // Clean up excess whitespace from the scraped text
        content = content.replace(/\s+/g, ' ').trim();

        // 5. Structure the final document
        const document = {
            id: Buffer.from(url).toString('base64'), // Create a unique ID from the URL
            title,
            description,
            content,
            url
        };

        console.log('\n--- Successfully Crawled Document ---');
        console.log(`Title: ${document.title}`);
        console.log(`Description: ${document.description}`);
        console.log(`Content Snippet: ${document.content.substring(0, 150)}...\n`);

        return document;

    } catch (error) {
        console.error(`[Crawler Error] Failed to crawl ${url}: ${error.message}`);
        return null;
    }
}

const { indexDocument, search } = require('./indexer');

async function runTest() {
    // 1. Crawl two different pages
    const doc1 = await crawl('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
    const doc2 = await crawl('https://en.wikipedia.org/wiki/Web_search_engine');

    // 2. Add them to the search index
    indexDocument(doc1);
    indexDocument(doc2);

    // 3. Perform a test search
    const results = search('javascript programming');
    
    console.log('\n--- Search Results ---');
    console.log(JSON.stringify(results, null, 2));
}

module.exports = { crawl };
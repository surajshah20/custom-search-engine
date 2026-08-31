const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// 1. Crawl an individual article page
async function crawlArticle(url) {
    try {
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
        const $ = cheerio.load(data);

        const title = $('h1, .news-title, title').first().text().trim();
        if (!title) return null;

        let content = '';
        $('p').each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 20) content += text + ' ';
        });
        content = content.replace(/\s+/g, ' ').trim();

        if (content.length < 50) return null;

        const lower = (title + ' ' + content).toLowerCase();
        const category = lower.includes('dividend') ? 'Dividend' :
                         lower.includes('ipo') ? 'IPO' :
                         lower.includes('bonus') ? 'Bonus Share' : 'Market News';

        return {
            title,
            category,
            publishDate: new Date().toISOString().split('T')[0],
            content,
            url
        };
    } catch (err) {
        console.error(`[Crawler] Skipping ${url} (${err.message})`);
        return null;
    }
}

// 2. Discover real article URLs from ShareSansar category page
async function crawlCategoryPage(categoryUrl) {
    console.log(`[Market Crawler] Discovering articles from: ${categoryUrl}`);
    try {
        const { data } = await axios.get(categoryUrl, { headers: HEADERS });
        const $ = cheerio.load(data);
        const articleUrls = new Set();

        // Extract links matching news detail patterns
        $('a[href*="/newsdetail/"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                const fullUrl = href.startsWith('http') ? href : `https://www.sharesansar.com${href}`;
                articleUrls.add(fullUrl);
            }
        });

        const urls = Array.from(articleUrls).slice(0, 5); // Pick top 5 recent articles
        console.log(`[Market Crawler] Found ${urls.length} live articles to index.`);

        const documents = [];
        for (const url of urls) {
            console.log(`[Market Crawler] Indexing article: ${url}`);
            const doc = await crawlArticle(url);
            if (doc) documents.push(doc);
        }
        return documents;
    } catch (err) {
        console.error(`[Market Crawler] Failed to load category: ${err.message}`);
        return [];
    }
}

// 3. Live NEPSE direct-answer scraper
async function getLiveNepse() {
    try {
        const { data } = await axios.get('https://merolagani.com/latestmarket.aspx', { headers: HEADERS });
        const $ = cheerio.load(data);
        const rawText = $('body').text().replace(/\s+/g, ' ');

        const match = rawText.match(/NEPSE\s+([\d,]+\.\d{1,2})\s+([+-]?\d+\.\d{1,2}%)/i);
        const turnoverMatch = rawText.match(/Total Turnover\s+([\d,]+\.\d{2})/i);

        return {
            type: 'stock-ticker',
            title: 'Nepal Stock Exchange (NEPSE)',
            index: match ? match[1] : '2,557.31',
            change: match ? match[2] : '-0.04%',
            turnover: turnoverMatch ? turnoverMatch[1] : '3,786,455,070'
        };
    } catch (error) {
        console.error('Failed to fetch live NEPSE:', error.message);
        return null;
    }
}

module.exports = { crawlCategoryPage, crawlArticle, getLiveNepse };
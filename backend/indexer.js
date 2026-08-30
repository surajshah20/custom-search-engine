const MiniSearch = require('minisearch');

// 1. Configure the search engine
const searchEngine = new MiniSearch({
    fields: ['title', 'description', 'content'], // The fields we want to search through
    storeFields: ['title', 'description', 'url', 'id'], // The fields we want returned in the results
    idField: 'id'
});

// 2. Function to add a crawled document to the index
function indexDocument(document) {
    if (!document) return;
    
    // Check if document already exists to avoid duplicates
    if (!searchEngine.has(document.id)) {
        searchEngine.add(document);
        console.log(`[Indexer] Indexed: ${document.title}`);
    }
}

// 3. Function to query the index
function search(query) {
    console.log(`\n[Search] Executing query: "${query}"`);
    
    // Perform a search with typo tolerance (fuzzy) and partial word matching (prefix)
    const results = searchEngine.search(query, { 
        prefix: true, 
        fuzzy: 0.2 
    });
    
    return results;
}

// Export the functions so our API can use them later
module.exports = { indexDocument, search };
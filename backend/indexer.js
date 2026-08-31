const sdk = require('node-appwrite');
require('dotenv').config();

// 1. Initialize the Appwrite Client
const client = new sdk.Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const DB_ID = process.env.APPWRITE_DATABASE_ID;
const COL_ID = process.env.APPWRITE_COLLECTION_ID;

// 2. Save a Crawled Document to Appwrite
async function indexDocument(document) {
    if (!document) return;
    try {
        // Check for existing record by URL
        const existing = await databases.listDocuments(
            DB_ID,
            COL_ID,
            [sdk.Query.equal('url', document.url)]
        );

        if (existing.total > 0) {
            console.log(`[Database] Skipped duplicate: ${document.title}`);
            return;
        }

        await databases.createDocument(
            DB_ID,
            COL_ID,
            sdk.ID.unique(),
            {
                title: document.title,
                category: document.category,
                publishDate: document.publishDate,
                content: document.content,
                url: document.url
            }
        );
        console.log(`[Database] Saved to Appwrite: ${document.title}`);
    } catch (error) {
        console.error('[Database Error] Failed to save:', error.message);
    }
}

// 3. Search Appwrite using Full-Text Queries
async function search(queryText) {
    console.log(`\n[Search] Querying Appwrite for: "${queryText}"`);
    try {
        const response = await databases.listDocuments(
            DB_ID,
            COL_ID,
            [
                // This tells Appwrite to search across all attributes for the query text
                sdk.Query.search('content', queryText) 
            ]
        );
        
        // Map the Appwrite document structure back to what React expects
        return response.documents.map(doc => ({
            id: doc.$id,
            title: doc.title,
            category: doc.category,
            publishDate: doc.publishDate,
            content: doc.content,
            url: doc.url
        }));
    } catch (error) {
        console.error('[Search Error] Appwrite query failed:', error.message);
        return [];
    }
}

module.exports = { indexDocument, search };
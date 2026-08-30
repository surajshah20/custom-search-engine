import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [urlToCrawl, setUrlToCrawl] = useState('');
  const [status, setStatus] = useState('');

  // Function to send a URL to our backend crawler
  const handleCrawl = async (e) => {
    e.preventDefault();
    setStatus('Crawling...');
    try {
      const res = await fetch('http://localhost:3000/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToCrawl })
      });
      const data = await res.json();
      if (data.error) setStatus(`Error: ${data.error}`);
      else setStatus(`Success! Indexed: ${data.title}`);
      setUrlToCrawl('');
    } catch (err) {
      setStatus('Failed to connect to backend.');
    }
  };

  // Function to search the indexed documents
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await fetch(`http://localhost:3000/api/search?q=${query}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>My Custom Search Engine</h1>
      
      {/* 1. The Indexing Interface */}
      <div style={{ background: '#f4f4f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>1. Feed the Engine (Crawl a URL)</h3>
        <form onSubmit={handleCrawl} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="url" 
            value={urlToCrawl} 
            onChange={(e) => setUrlToCrawl(e.target.value)} 
            placeholder="https://en.wikipedia.org/wiki/JavaScript" 
            required 
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Index Page</button>
        </form>
        {status && <p style={{ marginTop: '10px', color: '#059669', fontWeight: 'bold' }}>{status}</p>}
      </div>

      {/* 2. The Search Interface */}
      <div>
        <h3>2. Search the Database</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Type your search query..." 
            style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #dfe1e5', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', background: '#1a73e8', color: 'white', border: 'none' }}>Search</button>
        </form>
      </div>

      {/* 3. The Results */}
      <div>
        <p style={{ color: '#70757a', fontSize: '14px' }}>Found {results.length} results</p>
        {results.map((result) => (
          <div key={result.id} style={{ marginBottom: '24px' }}>
            <a href={result.url} target="_blank" rel="noreferrer" style={{ fontSize: '20px', color: '#1a0dab', textDecoration: 'none' }}>
              {result.title}
            </a>
            <div style={{ color: '#006621', fontSize: '14px', marginBottom: '4px' }}>{result.url}</div>
            <div style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.58' }}>
              {result.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
import { useState } from 'react';
import './App.css';

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/\s*-\s*\|\|\s*ShareSansar\s*\|\|/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function getCategoryColor(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('ipo')) return 'badge-ipo';
  if (cat.includes('dividend') || cat.includes('bonus')) return 'badge-dividend';
  if (cat.includes('bank')) return 'badge-bank';
  return 'badge-news';
}

function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [directAnswer, setDirectAnswer] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = ['ALL', 'Market News', 'IPO', 'Dividend', 'Banking'];
  const suggestions = ['nepse', 'commercial bank', 'bonus shares', 'ipo'];

  const executeSearch = async (searchTerm) => {
    const term = (searchTerm ?? query).trim();
    if (!term) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setDirectAnswer(data.directAnswer || null);
      setResults(data.results || []);
    } catch (err) {
      console.error('Search request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const filteredResults = results.filter((item) => {
    if (activeCategory === 'ALL') return true;
    const cat = (item.category || '').toLowerCase();
    const active = activeCategory.toLowerCase();
    return cat.includes(active) || (active === 'banking' && item.title.toLowerCase().includes('bank'));
  });

  return (
    <div className="app-container">
      {/* Background radial glow */}
      <div className="bg-glow" />

      {/* Header */}
      <header className="header">
        <div className="logo-row">
          <span className="logo-badge">NEPAL FINTECH</span>
          <h1 className="logo-title">
            Market<span className="accent">Intel</span>
          </h1>
        </div>
        <p className="subtitle">Real-time NEPSE intelligence, capital plans, and disclosures</p>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search NEPSE index, dividend, commercial banks, IPOs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery('')}>
              ×
            </button>
          )}
          <button className="search-action-btn" onClick={() => executeSearch()} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="suggestion-row">
          <span className="suggestion-label">Try:</span>
          {suggestions.map((item) => (
            <button
              key={item}
              className="chip-btn"
              onClick={() => {
                setQuery(item);
                executeSearch(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Category Tabs */}
      {hasSearched && (
        <nav className="tabs-nav">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'tab-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content Area */}
      <main className="results-container">
        {/* Live NEPSE Direct Answer Card */}
        {directAnswer && (
          <div className="live-nepse-card">
            <div className="nepse-header">
              <div className="nepse-status">
                <span className="pulse-dot" />
                <span className="nepse-title">{directAnswer.title}</span>
              </div>
              <span className="live-tag">LIVE FEED</span>
            </div>

            <div className="nepse-body">
              <div className="nepse-main-stat">
                <span className="nepse-number">{directAnswer.index}</span>
                <span className={`nepse-change ${directAnswer.change?.includes('-') ? 'negative' : 'positive'}`}>
                  {directAnswer.change}
                </span>
              </div>
              {directAnswer.turnover && (
                <div className="nepse-meta">
                  <span className="meta-label">Total Turnover:</span>
                  <span className="meta-value">NPR {directAnswer.turnover}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Header */}
        {hasSearched && !loading && (
          <div className="results-meta-bar">
            <span>Found {filteredResults.length} market insights</span>
          </div>
        )}

        {/* Articles List */}
        <div className="cards-grid">
          {filteredResults.map((item, index) => (
            <article key={item.$id || index} className="article-card">
              <div className="card-top-row">
                <span className={`category-badge ${getCategoryColor(item.category)}`}>
                  {item.category || 'Market News'}
                </span>
                <span className="card-date">{item.publishDate || 'Recent'}</span>
              </div>

              <h2 className="card-title">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {cleanText(item.title)}
                </a>
              </h2>

              <p className="card-snippet">{cleanText(item.content)}</p>

              <div className="card-footer">
                <span className="source-label">Source: ShareSansar</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-link">
                  Read article <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {hasSearched && !loading && filteredResults.length === 0 && !directAnswer && (
          <div className="empty-state">
            <p className="empty-title">No matching disclosures found</p>
            <p className="empty-desc">Try checking for typos or searching general terms like "bank", "bonus", or "nepse".</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
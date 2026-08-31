import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [directAnswer, setDirectAnswer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setDirectAnswer(null); // Clear previous widget
    try {
      const res = await fetch(`http://localhost:3000/api/search?q=${query}`);
      const data = await res.json();
      setResults(data.results || []);
      if (data.directAnswer) setDirectAnswer(data.directAnswer);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setIsSearching(false);
  };

  const getCategoryColor = (category) => {
    if (category === 'IPO') return '#10b981'; 
    if (category === 'Dividend') return '#3b82f6'; 
    return '#8b5cf6'; 
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '36px', fontWeight: '700', letterSpacing: '-1px' }}>
            Market<span style={{ color: '#3b82f6' }}>Intel</span>
          </h1>
          <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '16px' }}>Zero-Click Nepali Financial Search</p>
        </header>

        {/* The Clean Search Bar */}
        <div style={{ marginBottom: '40px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Try searching 'nepse', 'ipo', or 'dividend'..." 
              style={{ flex: 1, padding: '18px 24px', borderRadius: '30px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', fontSize: '18px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <button type="submit" disabled={isSearching} style={{ padding: '0 32px', borderRadius: '30px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold' }}>
              {isSearching ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {/* 🚀 THE DIRECT ANSWER WIDGET */}
        {directAnswer && (
          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #3b82f6', borderTop: '4px solid #3b82f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 'bold' }}>Live Market Widget</div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', color: '#f8fafc' }}>{directAnswer.title}</h2>
            
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Current Index</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>{directAnswer.index}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Day Change</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: directAnswer.change.includes('-') ? '#ef4444' : '#10b981', marginTop: '10px' }}>
                  {directAnswer.change}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Turnover (Rs)</div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#cbd5e1', marginTop: '14px' }}>{directAnswer.turnover}</div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Indexed Results */}
        {results.length > 0 && (
          <div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Database Results</p>
            <div style={{ display: 'grid', gap: '20px' }}>
              {results.map((result) => (
                <div key={result.id} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <a href={result.url} target="_blank" rel="noreferrer" style={{ fontSize: '18px', color: '#f8fafc', textDecoration: 'none', fontWeight: '600' }}>
                      {result.title}
                    </a>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                    {result.content.substring(0, 250)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
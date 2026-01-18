import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // Store saved notes

  // 1. Load History when app starts
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSummarize = async () => {
    if (!note) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: note }),
      });
      const data = await response.json();
      setResult({ ...data, originalText: note }); // Keep original text to save later
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Save Note to Database
  const handleSave = async () => {
    if (!result) return;

    try {
      await fetch('http://localhost:5001/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: result.originalText,
          summary: result.summary,
          keywords: result.keywords
        }),
      });
      alert("Note Saved! 💾");
      fetchHistory(); // Refresh the list
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR - HISTORY */}
      <aside className="sidebar">
        <h2>📚 History</h2>
        <div className="history-list">
          {history.length === 0 && <p className="empty-msg">No saved notes yet.</p>}
          
          {history.map((item) => (
            <div key={item._id} className="history-item">
              <div className="history-summary">{item.summary.substring(0, 60)}...</div>
              <div className="history-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header>
          <h1>🧠 Smart Note-Taker</h1>
          <p>Paste your lecture notes and let AI summarise them.</p>
        </header>

        <div className="workspace">
          {/* Input Section */}
          <div className="card input-section">
            <h2>Your Notes</h2>
            <textarea 
              placeholder="Paste your text here..." 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button 
              className="btn-primary" 
              onClick={handleSummarize} 
              disabled={loading || !note}
            >
              {loading ? "Analysing..." : "Summarise ✨"}
            </button>
          </div>

          {/* Output Section */}
          <div className="card output-section">
            <h2>AI Summary</h2>
            {result ? (
              <div className="result-box">
                <p><strong>Summary:</strong> {result.summary}</p>
                <div className="tags">
                  {result.keywords.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
                {/* Save Button */}
                <button className="btn-secondary" onClick={handleSave}>
                  Save to History 💾
                </button>
              </div>
            ) : (
              <div className="placeholder-text">
                Results will appear here...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
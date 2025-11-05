import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000/supervisor"; 
function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answerMap, setAnswerMap] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // ✅ Reusable fetch function
  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRequests(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("fetchRequests error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();

    // ✅ Safe polling with cleanup
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  async function submitAnswer(id) {
    const answer = answerMap[id];
    if (!answer || answer.trim().length === 0) {
      alert("Type an answer first");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert("Error: " + (result.error || JSON.stringify(result)));
      } else {
        alert("✅ Answer submitted successfully");
        setAnswerMap(prev => ({ ...prev, [id]: "" }));
        fetchRequests();
      }
    } catch (err) {
      console.error("submitAnswer error:", err);
      alert("Network error while submitting answer");
    }
  }

  // ✅ Helper: render cards for each status
  const renderRequests = (filterFn, emptyText, styleFn) => {
    const items = requests.filter(filterFn);
    if (items.length === 0) return <div>{emptyText}</div>;
    return items.map(r => (
      <div key={r.id} style={styleFn(r)}>
        <div><b>Customer:</b> {r.customer?.name || "Unknown"} ({r.customer?.phone || "N/A"})</div>
        <div><b>Question:</b> {r.question}</div>

        {r.status === "pending" && (
          <div style={{ marginTop: 6 }}>
            <input
              style={{ width: "70%" }}
              value={answerMap[r.id] || ""}
              placeholder="Type answer here..."
              onChange={e =>
                setAnswerMap(prev => ({ ...prev, [r.id]: e.target.value }))
              }
            />
            <button onClick={() => submitAnswer(r.id)} style={{ marginLeft: 8 }}>
              Submit
            </button>
          </div>
        )}

        {r.status === "resolved" && (
          <div><b>Answer:</b> {r.supervisor_answer}</div>
        )}
        {r.status === "unresolved" && (
          <div><b>Status:</b> {r.status}</div>
        )}
      </div>
    ));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Supervisor Dashboard</h1>
      <button onClick={fetchRequests} style={{ marginBottom: 12 }}>
        🔄 Refresh
      </button>

      {lastUpdated && (
        <div style={{ fontSize: 12, color: "#555" }}>
          Last updated: {lastUpdated}
        </div>
      )}

      <h2>🕐 Pending</h2>
      {loading && <div>Loading...</div>}
      {renderRequests(r => r.status === "pending", "No pending requests", () => ({
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 8,
        borderRadius: 6,
      }))}

      <h2>✅ Resolved</h2>
      {renderRequests(r => r.status === "resolved", "No resolved requests", () => ({
        border: "1px solid #eee",
        padding: 8,
        marginBottom: 6,
        borderRadius: 6,
      }))}

      <h2>⚠️ Unresolved (timed out)</h2>
      {renderRequests(r => r.status === "unresolved", "No unresolved requests", () => ({
        border: "1px dashed #f99",
        padding: 8,
        marginBottom: 6,
        borderRadius: 6,
      }))}
    </div>
  );
}

export default App;

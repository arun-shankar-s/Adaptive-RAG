const statsStyles = `
  .statsbar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }

  /* Top row: title + total tokens badge */
  .statsbar-top {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .statsbar-title {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .statsbar-title span {
    color: #94a3b8;
    font-weight: 400;
  }
  .statsbar-token-badge {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
  }

  /* Stat cards row */
  .statsbar-cards {
    display: flex;
    gap: 1px;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    overflow: hidden;
    background: rgba(255,255,255,0.04);
  }
  .stat-card {
    flex: 1;
    padding: 12px 16px;
    border-right: 1px solid rgba(255,255,255,0.06);
    background: #0d1117;
  }
  .stat-card:last-child { border-right: none; }
  .stat-label {
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    color: #475569;
    margin: 0 0 5px;
    font-weight: 400;
  }
  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: #e2e8f0;
    margin: 0;
  }
  .stat-value small {
    font-size: 11px;
    color: #475569;
    margin-left: 3px;
  }

  /* Filter tabs */
  .filter-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .filter-tab {
    padding: 5px 14px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: #64748b;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .filter-tab:hover {
    border-color: rgba(255,255,255,0.15);
    color: #94a3b8;
  }
  .filter-tab.active {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.15);
    color: #e2e8f0;
  }
`;

// const FILTERS = [
//   { id: "all", label: "All" },
//   { id: "headings", label: "Headings" },
//   { id: "tables", label: "Tables" },
//   { id: "high", label: "High-density" },
//   { id: "low", label: "Low-density" },
// ];

function formatTokens(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function StatsBar({ data, activeFilter, onFilterChange }) {
  const chunks = data.chunks;
  const total = chunks.length;
  const totalChars = data.total_characters ?? chunks.reduce((s, c) => s + c.char_count, 0);
  const avgChunkSize = Math.round(totalChars / total / 4); // approx tokens
  const totalTokens = chunks.reduce((s, c) => s + (c.token_count ?? Math.round(c.char_count / 4)), 0);
  const embCost = ((totalTokens / 1000) * 0.0001).toFixed(4);

  return (
    <>
      <style>{statsStyles}</style>
      <div className="statsbar">
        <div className="statsbar-top">
          <h2 className="statsbar-title">
            Parsed Chunks <span>({total})</span>
          </h2>
          <span className="statsbar-token-badge">
            Total Tokens: {formatTokens(totalTokens)}
          </span>
        </div>

        <div className="statsbar-cards">
          <div className="stat-card">
            <p className="stat-label">Avg Chunk Size</p>
            <p className="stat-value">{avgChunkSize}<small>tokens</small></p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Estimated Embedding Cost</p>
            <p className="stat-value">${embCost}</p>
          </div>
        </div>

        {/* <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`filter-tab${activeFilter === f.id ? " active" : ""}`}
              onClick={() => onFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div> */}
      </div>
    </>
  );
}

export default StatsBar;
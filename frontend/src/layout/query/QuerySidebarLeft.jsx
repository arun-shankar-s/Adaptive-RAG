const leftStyles = `
  .qsl-panel {
    width: 220px;
    min-width: 220px;
    background: #0d1117;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 16px;
    font-family: 'Sora', sans-serif;
    overflow-y: auto;
    box-sizing: border-box;
  }
  .qsl-panel::-webkit-scrollbar { width: 3px; }
  .qsl-panel::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  .qsl-title { font-size: 15px; font-weight: 600; color: #f1f5f9; letter-spacing: -0.2px; margin: 0; }

  /* File card */
  .qsl-file-card {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 10px 12px;
  }
  .qsl-file-icon {
    width: 36px; height: 36px;
    background: #ef4444;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #fff;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }
  .qsl-file-info { flex: 1; min-width: 0; }
  .qsl-file-name {
    font-size: 11.5px; font-weight: 500; color: #e2e8f0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 3px;
  }
  .qsl-file-status { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #22c55e; }
  .qsl-file-status svg { width: 10px; height: 10px; }

  .qsl-indexed-badge {
    display: flex; align-items: center; gap: 5px;
    font-size: 10.5px; color: #64748b; padding: 3px 0;
  }
  .qsl-indexed-badge svg { width: 12px; height: 12px; }

  /* Summary card */
  .qsl-summary-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 14px;
    display: flex; flex-direction: column; gap: 0;
  }
  .qsl-summary-title { font-size: 11.5px; font-weight: 600; color: #94a3b8; margin: 0 0 10px; letter-spacing: 0.02em; }
  .qsl-summary-row {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); gap: 8px;
  }
  .qsl-summary-row:last-child { border-bottom: none; }
  .qsl-summary-key { font-size: 11px; color: #475569; }
  .qsl-summary-val {
    font-size: 11.5px; font-weight: 500; color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    text-align: right; max-width: 110px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .qsl-status-dot {
    display: inline-flex; align-items: center; gap: 4px;
    color: #22c55e; font-size: 11px;
  }
  .qsl-status-dot::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.6); flex-shrink: 0;
  }

  /* ── Scope buttons group ── */
  .qsl-scope-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }
  .qsl-scope-label {
    font-size: 10.5px;
    font-weight: 500;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 2px;
  }

  /* Current doc button (blue) */
  .qsl-session-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border-radius: 11px;
    border: 1px solid rgba(56,189,248,0.2);
    background: rgba(56,189,248,0.05);
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }
  .qsl-session-btn:hover,
  .qsl-session-btn.active {
    background: rgba(56,189,248,0.1);
    border-color: rgba(56,189,248,0.4);
    box-shadow: 0 0 14px rgba(56,189,248,0.1);
  }
  .qsl-session-btn-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: rgba(56,189,248,0.12);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #38bdf8;
  }
  .qsl-session-btn-icon svg { width: 15px; height: 15px; }
  .qsl-session-btn-text { display: flex; flex-direction: column; gap: 2px; }
  .qsl-session-btn-label { font-size: 12.5px; font-weight: 600; color: #38bdf8; }
  .qsl-session-btn-sub   { font-size: 10.5px; color: rgba(56,189,248,0.5); }

  /* All documents button (green) */
  .qsl-query-all {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border-radius: 11px;
    border: 1px solid rgba(52,211,153,0.25);
    background: rgba(16,185,129,0.06);
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }
  .qsl-query-all:hover,
  .qsl-query-all.active {
    background: rgba(16,185,129,0.12);
    border-color: rgba(52,211,153,0.5);
    box-shadow: 0 0 16px rgba(16,185,129,0.12);
  }
  .qsl-query-all-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: rgba(52,211,153,0.12);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #34d399;
  }
  .qsl-query-all-icon svg { width: 15px; height: 15px; }
  .qsl-query-all-text { display: flex; flex-direction: column; gap: 2px; }
  .qsl-query-all-label { font-size: 12.5px; font-weight: 600; color: #34d399; }
  .qsl-query-all-sub   { font-size: 10.5px; color: rgba(52,211,153,0.5); }
`;

function QuerySidebarLeft({ indexSummary, fileName, fileSize, scope, onQueryAll, onQuerySession }) {
  const summary = indexSummary || {};

  return (
    <>
      <style>{leftStyles}</style>
      <div className="qsl-panel">
        <h2 className="qsl-title">Document Intelligence</h2>

        {/* File card */}
        {scope === "session" && (
        <>
        <div className="qsl-file-card">
          <div className="qsl-file-icon">PDF</div>
          <div className="qsl-file-info">
            <p className="qsl-file-name">{fileName || "document.pdf"}</p>
            <div className="qsl-file-status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Uploaded · {fileSize || "—"}
            </div>
          </div>
        </div>
      

        {/* Indexed badge */}
        <div className="qsl-indexed-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Indexed just now
        </div>

        {/* Index Summary */}
        <div className="qsl-summary-card">
          <p className="qsl-summary-title">Index Summary</p>
          {[
            ["Chunks",            summary.chunks],
            ["Total Tokens",      summary.totalTokens],
            ["Embedding Model",   summary.embeddingModel ?? "all-MiniLM-L6-v2"],
            ["Vector Store",      summary.vectorStore ?? "Qdrant (Vector DB)"],
            ["Chunk Size",        summary.chunkSize],
            ["Overlap",           summary.overlap],
            ["Chunking Strategy", summary.strategy],
          ].map(([key, val]) => (
            <div className="qsl-summary-row" key={key}>
              <span className="qsl-summary-key">{key}</span>
              <span className="qsl-summary-val">{val ?? "—"}</span>
            </div>
          ))}
          <div className="qsl-summary-row">
            <span className="qsl-summary-key">Status</span>
            <span className="qsl-summary-val"><span className="qsl-status-dot">Ready</span></span>
          </div>
        </div>
        </>
      )}
        
      
        {/* ── Scope selector ── */}
        <div className="qsl-scope-group">
          <span className="qsl-scope-label">Query Scope</span>

          {/* Current document */}
          <button
            className={`qsl-session-btn${scope === "session" ? " active" : ""}`}
            onClick={onQuerySession}
          >
            <div className="qsl-session-btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="qsl-session-btn-text">
              <span className="qsl-session-btn-label">Current Document</span>
              <span className="qsl-session-btn-sub">Query this file only</span>
            </div>
          </button>

          {/* All documents */}
          <button
            className={`qsl-query-all${scope === "all" ? " active" : ""}`}
            onClick={onQueryAll}
          >
            <div className="qsl-query-all-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div className="qsl-query-all-text">
              <span className="qsl-query-all-label">Query All Documents</span>
              <span className="qsl-query-all-sub">Stored in Database</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

export default QuerySidebarLeft;
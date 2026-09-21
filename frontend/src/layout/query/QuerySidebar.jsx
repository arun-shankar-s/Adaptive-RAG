import { useState } from "react";

const qsStyles = `
  .qs-panel {
    width: 240px;
    min-width: 240px;
    background: #0a0f18;
    border-left: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    font-family: 'Sora', sans-serif;
  }
  .qs-panel::-webkit-scrollbar { width: 4px; }
  .qs-panel::-webkit-scrollbar-track { background: transparent; }
  .qs-panel::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  /* Section card */
  .qs-card {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 18px 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Card header */
  .qs-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .qs-card-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.02em;
  }
  .qs-card-title svg { width: 14px; height: 14px; color: #64748b; }
  .qs-close-btn {
    width: 22px; height: 22px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: #334155;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .qs-close-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.05); }
  .qs-close-btn svg { width: 13px; height: 13px; }

  /* Field row */
  .qs-field { display: flex; flex-direction: column; gap: 7px; }
  .qs-field-label {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: #64748b;
  }
  .qs-field-label .qs-info {
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 1px solid #334155;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 8px; color: #475569; cursor: help;
  }

  /* Top K buttons */
  .qs-topk-group {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  .qs-topk-btn {
    padding: 7px 4px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.04);
    color: #475569;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }
  .qs-topk-btn:hover { border-color: rgba(56,189,248,0.2); color: #94a3b8; }
  .qs-topk-btn.active {
    background: #1d4ed8;
    border-color: #2563eb;
    color: #fff;
  }

  /* Search type toggle */
  .qs-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .qs-toggle-btn {
    padding: 8px 6px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.04);
    color: #475569;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }
  .qs-toggle-btn:hover { border-color: rgba(56,189,248,0.2); color: #94a3b8; }
  .qs-toggle-btn.active {
    background: #1d4ed8;
    border-color: #2563eb;
    color: #fff;
  }

  /* Slider */
  .qs-slider-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .qs-slider-track {
    flex: 1;
    height: 4px;
    border-radius: 99px;
    background: rgba(255,255,255,0.08);
    position: relative;
  }
  .qs-slider-fill {
    position: absolute; left: 0; top: 0; height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #1d4ed8, #38bdf8);
    pointer-events: none;
  }
  .qs-slider-thumb {
    position: absolute; top: 50%;
    transform: translate(-50%, -50%);
    width: 13px; height: 13px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.2);
    pointer-events: none;
  }
  .qs-slider-input {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    opacity: 0; cursor: pointer; margin: 0;
  }
  .qs-slider-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    color: #e2e8f0;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 2px 7px;
    min-width: 40px;
    text-align: center;
  }

  /* Add Filter */
  .qs-add-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px;
    border-radius: 9px;
    border: 1px dashed rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.02);
    color: #475569;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .qs-add-filter:hover { border-color: rgba(56,189,248,0.3); color: #94a3b8; }
  .qs-add-filter svg { width: 13px; height: 13px; }

  /* Query Details */
  .qs-detail-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .qs-detail-key { font-size: 11px; color: #475569; }
  .qs-detail-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11.5px;
    color: #94a3b8;
    text-align: right;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* View Raw Results */
  .qs-raw-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 10px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #64748b;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .qs-raw-btn:hover { border-color: rgba(56,189,248,0.25); color: #94a3b8; }
  .qs-raw-btn svg { width: 13px; height: 13px; }
`;

const TOP_K_OPTIONS = [3, 5, 10, 20];
const SEARCH_TYPES = ["Similarity", "MMR"];

function QuerySidebar({ queryDetails, settings, onSettingsChange }) {
  const [topK, setTopK] = useState(settings?.topK ?? 5);
  const [searchType, setSearchType] = useState(settings?.searchType ?? "Similarity");
  const [threshold, setThreshold] = useState(settings?.threshold ?? 0.30);

  const thresholdPct = ((threshold - 0) / (1 - 0)) * 100;

  const update = (key, val) => {
    onSettingsChange?.({ topK, searchType, threshold, [key]: val });
  };

  return (
    <>
      <style>{qsStyles}</style>
      <div className="qs-panel">

        {/* ── Query Settings ── */}
        <div className="qs-card">
          <div className="qs-card-header">
            <span className="qs-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
              Query Settings
            </span>
            <button className="qs-close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Top K */}
          <div className="qs-field">
            <span className="qs-field-label">
              Top K <span className="qs-info" title="Number of chunks to retrieve">?</span>
            </span>
            <div className="qs-topk-group">
              {TOP_K_OPTIONS.map((k) => (
                <button
                  key={k}
                  className={`qs-topk-btn${topK === k ? " active" : ""}`}
                  onClick={() => { setTopK(k); update("topK", k); }}
                >{k}</button>
              ))}
            </div>
          </div>

          {/* Search Type */}
          <div className="qs-field">
            <span className="qs-field-label">
              Search Type <span className="qs-info" title="Similarity: direct cosine; MMR: diversity-aware">?</span>
            </span>
            <div className="qs-toggle">
              {SEARCH_TYPES.map((t) => (
                <button
                  key={t}
                  className={`qs-toggle-btn${searchType === t ? " active" : ""}`}
                  onClick={() => { setSearchType(t); update("searchType", t); }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Score Threshold */}
          <div className="qs-field">
            <span className="qs-field-label">
              Score Threshold <span className="qs-info" title="Minimum similarity score for a chunk to be returned">?</span>
            </span>
            <div className="qs-slider-row">
              <div className="qs-slider-track">
                <div className="qs-slider-fill" style={{ width: `${thresholdPct}%` }} />
                <div className="qs-slider-thumb" style={{ left: `${thresholdPct}%` }} />
                <input
                  className="qs-slider-input"
                  type="range" min={0} max={1} step={0.01}
                  value={threshold}
                  onChange={(e) => { const v = parseFloat(e.target.value); setThreshold(v); update("threshold", v); }}
                />
              </div>
              <span className="qs-slider-val">{threshold.toFixed(2)}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="qs-field">
            <span className="qs-field-label">Filters</span>
            <button className="qs-add-filter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Filter
            </button>
          </div>
        </div>

        {/* ── Query Details ── */}
        <div className="qs-card">
          <div className="qs-card-header">
            <span className="qs-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
              Query Details
            </span>
            <button className="qs-close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="qs-detail-row">
            <span className="qs-detail-key">Embedding Model</span>
            <span className="qs-detail-val">{queryDetails?.embeddingModel ?? "—"}</span>
          </div>
          <div className="qs-detail-row">
            <span className="qs-detail-key">Vector Dimensions</span>
            <span className="qs-detail-val">{queryDetails?.dimensions ?? "—"}</span>
          </div>
          <div className="qs-detail-row">
            <span className="qs-detail-key">Search Time</span>
            <span className="qs-detail-val">{queryDetails?.searchTime ? `${queryDetails.searchTime} ms` : "—"}</span>
          </div>
          <div className="qs-detail-row">
            <span className="qs-detail-key">Total Time</span>
            <span className="qs-detail-val">{queryDetails?.totalTime ? `${queryDetails.totalTime} s` : "—"}</span>
          </div>

          <button className="qs-raw-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            View Raw Results
          </button>
        </div>
      </div>
    </>
  );
}

export default QuerySidebar;
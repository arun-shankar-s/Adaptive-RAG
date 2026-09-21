import { useState, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap');

  .sidebar {
    width: 300px;
    min-height: 100vh;
    background: #0d1117;
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Sora', sans-serif;
    color: #e2e8f0;
    box-sizing: border-box;
  }

  .sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: -0.3px;
    margin: 0 0 4px 0;
  }

  /* Drop Zone */
  .drop-zone {
    border: 1.5px dashed rgba(56, 189, 248, 0.35);
    border-radius: 12px;
    padding: 28px 16px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: rgba(56, 189, 248, 0.03);
    position: relative;
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color: rgba(56, 189, 248, 0.7);
    background: rgba(56, 189, 248, 0.07);
  }
  .drop-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .drop-icon {
    width: 44px;
    height: 44px;
    margin: 0 auto 10px;
    background: radial-gradient(circle at 60% 35%, rgba(56,189,248,0.25), transparent 70%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .drop-icon svg {
    width: 24px;
    height: 24px;
    color: #38bdf8;
  }
  .drop-title {
    font-size: 13px;
    font-weight: 500;
    color: #cbd5e1;
    margin: 0 0 4px;
  }
  .drop-sub {
    font-size: 11px;
    color: #64748b;
    margin: 0;
  }

  /* File Card */
  .file-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 10px 12px;
  }
  .file-icon {
    width: 40px;
    height: 40px;
    background: #ef4444;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 700;
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }
  .file-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .file-name {
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    width: 100%;
    margin: 0;
  }
  .file-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .file-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #22c55e;
    font-size: 11px;
    font-family: 'Sora', sans-serif;
    font-weight: 500;
    flex-shrink: 0;
  }
  .file-status svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
  .file-dot {
    color: #334155;
    font-size: 11px;
    flex-shrink: 0;
  }
  .file-size {
    font-size: 11px;
    color: #475569;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }

  /* Advanced Controls */
  .advanced-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  }
  .advanced-label {
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
  }
  .advanced-chevron {
    width: 16px;
    height: 16px;
    color: #64748b;
    transition: transform 0.2s;
  }
  .advanced-chevron.open {
    transform: rotate(180deg);
  }

  .controls-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  /* Slider Row */
  .control-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .control-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .control-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #94a3b8;
  }
  .control-label .info-icon {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    border: 1px solid #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: #64748b;
    cursor: help;
    flex-shrink: 0;
  }
  .control-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #e2e8f0;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 2px 8px;
    min-width: 44px;
    text-align: center;
  }

  /* Custom Slider */
  .slider-track {
    position: relative;
    height: 4px;
    border-radius: 99px;
    background: rgba(255,255,255,0.08);
  }
  .slider-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #1d4ed8, #38bdf8);
    pointer-events: none;
  }
  .slider-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    margin: 0;
    -webkit-appearance: none;
  }
  .slider-thumb-vis {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.2);
    pointer-events: none;
    transition: box-shadow 0.15s;
  }

  /* Strategy Buttons */
  .strategy-group {
    display: flex;
    gap: 6px;
  }
  .strategy-btn {
    flex: 1;
    padding: 7px 4px;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px;
    background: rgba(255,255,255,0.04);
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .strategy-btn:hover {
    border-color: rgba(56,189,248,0.3);
    color: #94a3b8;
  }
  .strategy-btn.active {
    background: #1d4ed8;
    border-color: #2563eb;
    color: #fff;
  }

  .divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
  }

  /* ── Mode Buttons ── */
  .mode-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }

  .mode-btn {
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #cbd5e1;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    text-align: left;
    transition: background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.1s;
    position: relative;
  }
  .mode-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .mode-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .mode-btn:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  /* Top row: icon + label */
  .mode-btn-top {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .mode-btn-top svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  /* Sub-label */
  .mode-btn-sub {
    font-size: 11px;
    font-weight: 400;
    padding-left: 24px; /* indent to align under label text */
  }

  /* Variant: active/primary (Parse Document) */
  .mode-btn.mode-primary {
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    border-color: #2563eb;
    color: #fff;
    box-shadow: 0 0 22px rgba(59,130,246,0.35);
  }
  .mode-btn.mode-primary:hover:not(:disabled) {
    box-shadow: 0 0 30px rgba(59,130,246,0.55);
  }
  .mode-btn.mode-primary .mode-btn-sub {
    color: rgba(255,255,255,0.65);
  }

  /* Variant: default (Build Knowledge Base) */
  .mode-btn.mode-default {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.09);
    color: #cbd5e1;
  }
  .mode-btn.mode-default:hover:not(:disabled) {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.14);
  }
  .mode-btn.mode-default .mode-btn-sub {
    color: #475569;
  }

  /* Variant: accent (Enter Query Mode) */
  .mode-btn.mode-accent {
    background: rgba(16, 185, 129, 0.06);
    border-color: rgba(16, 185, 129, 0.35);
    color: #34d399;
  }
  .mode-btn.mode-accent:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.11);
    border-color: rgba(16, 185, 129, 0.6);
    box-shadow: 0 0 18px rgba(16,185,129,0.15);
  }
  .mode-btn.mode-accent .mode-btn-sub {
    color: rgba(52,211,153,0.6);
  }

  /* Arrow icon for query mode */
  .mode-btn-arrow {
    margin-left: auto;
    opacity: 0.7;
  }
`;

function SliderControl({ label, tooltip, value, min, max, onChange, displayValue }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="control-row">
      <div className="control-header">
        <span className="control-label">
          {label}
          <span className="info-icon" title={tooltip}>?</span>
        </span>
        <span className="control-value">{displayValue ?? value}</span>
      </div>
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${pct}%` }} />
        <div className="slider-thumb-vis" style={{ left: `${pct}%` }} />
        <input
          className="slider-input"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}

const STRATEGIES = [
  { id: "semantic", label: "Semantic" },
  { id: "recursive", label: "Recursive" },
  { id: "layout", label: "Layout-aware" },
];

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ── Icons ──────────────────────────────────────────────────────────
const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const IconMessageCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({ onParse, onBuildKB, onQueryMode, loading, mode, setMode, kbReady, hasParsed }){
  const [file, setFile] = useState(null);
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(15);
  const [strategy, setStrategy] = useState("semantic");
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) {
      setFile(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleParse = () => {
    if (!file || loading) return;
    if (setMode) setMode("parse");
    if (onParse) onParse({ file, chunkSize, overlap: Math.round(overlap), strategy });
  };

  const handleBuildKB = () => {
    if (loading) return;
    if (setMode) setMode("kb");
    if (onBuildKB) onBuildKB();
  };

  const handleQueryMode = () => {
    if (loading) return;
    if (setMode) setMode("query");
    if (onQueryMode) onQueryMode();
  };

  const overlapPct = `${overlap}%`;

  // Determine active mode for button highlighting
  const activeMode = mode || "parse";

  return (
    <>
      <style>{styles}</style>
      <div className="sidebar">
        <h2 className="sidebar-title">Document Parser</h2>

        {/* Drop Zone */}
        <div
          className={`drop-zone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="drop-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="drop-title">Drop PDF or DOCX</p>
          <p className="drop-sub">or click to browse</p>
        </div>

        {/* File Card */}
        {file && (
          <div className="file-card">
            <div className="file-icon">
              {file.name.endsWith(".pdf") ? "PDF" : "DOC"}
            </div>
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <div className="file-meta">
                <span className="file-status">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Uploaded
                </span>
                <span className="file-dot">·</span>
                <span className="file-size">{formatBytes(file.size)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Advanced Controls */}
        <div>
          <div className="advanced-header" onClick={() => setAdvancedOpen((o) => !o)}>
            <span className="advanced-label">Advanced Controls</span>
            <svg className={`advanced-chevron${advancedOpen ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </div>

          {advancedOpen && (
            <div className="controls-body" style={{ marginTop: 16 }}>
              <SliderControl
                label="Chunk Size"
                tooltip="Determines the number of tokens per chunk. Higher values include more context but increase memory usage."
                value={chunkSize}
                min={100}
                max={1000}
                onChange={setChunkSize}
              />

              <SliderControl
                label="Overlap"
                tooltip="Percentage of overlap between adjacent chunks to preserve context continuity."
                value={overlap}
                min={0}
                max={50}
                onChange={setOverlap}
                displayValue={overlapPct}
              />

              <div className="control-row">
                <div className="control-header">
                  <span className="control-label">Chunking Strategy</span>
                </div>
                <div className="strategy-group">
                  {STRATEGIES.map((s) => (
                    <button
                      key={s.id}
                      className={`strategy-btn${strategy === s.id ? " active" : ""}`}
                      onClick={() => setStrategy(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Mode Action Buttons ── */}
        <div className="mode-stack">
          {/* 1. Parse Document */}
          <button
            className={`mode-btn mode-primary`}
            onClick={handleParse}
            disabled={!file || loading}
          >
            <div className="mode-btn-top">
              <IconBolt />
              Parse Document
            </div>
            <span className="mode-btn-sub">Chunk and preview content</span>
          </button>

          {/* 2. Build Knowledge Base */}
          <button
            className={`mode-btn mode-default`}
            onClick={handleBuildKB}
            disabled={loading || !hasParsed}
          >
            <div className="mode-btn-top">
              <IconDatabase />
              Build Knowledge Base
            </div>
            <span className="mode-btn-sub">Embed &amp; store in temporary DB</span>
          </button>

          {/* 3. Enter Query Mode */}
          <button
            className={`mode-btn mode-accent`}
            onClick={handleQueryMode}
            disabled={loading}
          >
            <div className="mode-btn-top">
              <IconMessageCircle />
              Enter Query Mode
              <span className="mode-btn-arrow"><IconArrowRight /></span>
            </div>
            <span className="mode-btn-sub">Ask questions about this document</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
import { useState, useEffect, useRef } from "react";
import StatsBar from "../components/StatsBar";
import ChunkGrid from "../components/ChunkGrid";
import SearchBar from "../components/SearchBar";
import QueryView from "./query/QueryView";

const mainStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap');

  .main-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #080c12;
    overflow: hidden;
    font-family: 'Sora', sans-serif;
  }

  /* ── Empty State ── */
  .main-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #334155;
  }
  .main-empty svg { width: 40px; height: 40px; color: #1e293b; }
  .main-empty p { font-size: 13px; margin: 0; }

  /* ── Parse view header ── */
  .main-header {
    padding: 24px 28px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .main-toolbar { display: flex; align-items: center; gap: 12px; }
  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px 40px;
  }
  .main-content::-webkit-scrollbar { width: 5px; }
  .main-content::-webkit-scrollbar-track { background: transparent; }
  .main-content::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  /* ══════════════════════════════════════════
     KNOWLEDGE BASE VIEW
  ══════════════════════════════════════════ */
  .kb-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 28px 32px 48px;
    gap: 24px;
  }
  .kb-view::-webkit-scrollbar { width: 5px; }
  .kb-view::-webkit-scrollbar-track { background: transparent; }
  .kb-view::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  /* Top bar */
  .kb-topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .kb-title-group { display: flex; align-items: center; gap: 12px; }
  .kb-bolt {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #1d4ed8, #38bdf8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 18px rgba(56,189,248,0.3);
  }
  .kb-bolt svg { width: 18px; height: 18px; color: #fff; }
  .kb-heading { margin: 0; font-size: 22px; font-weight: 600; color: #f1f5f9; letter-spacing: -0.4px; }
  .kb-sub { margin: 4px 0 0; font-size: 13px; color: #475569; }

  .kb-cancel-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #94a3b8;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .kb-cancel-btn:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); color: #f87171; }
  .kb-cancel-btn svg { width: 14px; height: 14px; }

  /* Overall progress card */
  .kb-progress-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .kb-progress-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
  .kb-progress-pct {
    font-size: 56px;
    font-weight: 600;
    color: #f1f5f9;
    line-height: 1;
    letter-spacing: -2px;
  }
  .kb-progress-pct span { font-size: 28px; color: #94a3b8; letter-spacing: 0; }
  .kb-progress-status { font-size: 13px; color: #64748b; margin: 4px 0 10px; }

  /* Progress bar */
  .kb-bar-track {
    width: 100%;
    height: 6px;
    border-radius: 99px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .kb-bar-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #1d4ed8, #38bdf8);
    transition: width 0.4s ease;
    position: relative;
  }
  .kb-bar-fill::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 40px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25));
    border-radius: 99px;
  }
.kb-bar-fill.animate::after {
  animation: kb-shimmer 1.2s ease-in-out infinite;
}

  @keyframes kb-shimmer {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  /* Steps */
  .kb-steps { display: flex; flex-direction: column; gap: 10px; }

  .kb-step {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .kb-step.step-active { border-color: rgba(56,189,248,0.2); }
  .kb-step.step-done { border-color: rgba(34,197,94,0.15); }

  .kb-step-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    cursor: default;
  }

  /* Step number / status badge */
  .kb-step-badge {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    transition: all 0.2s;
  }
  .kb-step-badge.badge-pending {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #475569;
  }
  .kb-step-badge.badge-active {
    background: rgba(56,189,248,0.15);
    border: 1px solid rgba(56,189,248,0.35);
    color: #38bdf8;
  }
  .kb-step-badge.badge-done {
    background: rgba(34,197,94,0.15);
    border: 1px solid rgba(34,197,94,0.3);
    color: #22c55e;
  }
  .kb-step-badge svg { width: 15px; height: 15px; }

  /* Pulse ring for active */
  .badge-active-wrap {
    position: relative;
    width: 32px; height: 32px; flex-shrink: 0;
  }
  .badge-pulse-ring {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px solid rgba(56,189,248,0.3);
    animation: pulse-ring 1.4s ease-out infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.85); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0; }
  }

  .kb-step-info { flex: 1; min-width: 0; }
  .kb-step-name { font-size: 14px; font-weight: 600; color: #e2e8f0; margin: 0 0 2px; }
  .kb-step-desc { font-size: 12px; color: #475569; margin: 0; }

  .kb-step-right {
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .kb-step-status-pill {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 99px;
    font-family: 'Sora', sans-serif;
  }
  .pill-progress {
    background: rgba(56,189,248,0.12);
    border: 1px solid rgba(56,189,248,0.25);
    color: #38bdf8;
  }
  .pill-pending {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #475569;
  }
  .kb-step-timer {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #38bdf8;
    min-width: 42px;
    text-align: right;
  }
  .kb-step-timer.timer-done { color: #22c55e; }
  .kb-step-timer.timer-pending { color: #334155; }

  .kb-chevron {
    width: 16px; height: 16px; color: #334155;
    transition: transform 0.2s;
  }
  .kb-chevron.open { transform: rotate(180deg); }

  /* Expanded step detail */
  .kb-step-detail {
    padding: 0 20px 18px 66px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .kb-detail-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 14px 16px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .kb-detail-field { display: flex; flex-direction: column; gap: 4px; }
  .kb-detail-field-label { font-size: 11px; color: #475569; }
  .kb-detail-field-value {
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Indexing Details strip */
  .kb-details-section { display: flex; flex-direction: column; gap: 10px; }
  .kb-details-title {
    font-size: 13px; font-weight: 500; color: #64748b;
    display: flex; align-items: center; gap: 6px;
  }
  .kb-details-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.05);
  }
  .kb-details-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .kb-detail-tile {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .kb-detail-tile-top {
    display: flex; align-items: center; gap: 8px;
    color: #475569;
  }
  .kb-detail-tile-top svg { width: 16px; height: 16px; flex-shrink: 0; }
  .kb-detail-tile-label { font-size: 11px; }
  .kb-detail-tile-value {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Info banner */
  .kb-info-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: rgba(56,189,248,0.05);
    border: 1px solid rgba(56,189,248,0.15);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .kb-info-icon {
    width: 32px; height: 32px;
    background: rgba(56,189,248,0.12);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .kb-info-icon svg { width: 16px; height: 16px; color: #38bdf8; }
  .kb-info-text { display: flex; flex-direction: column; gap: 3px; }
  .kb-info-primary { font-size: 13px; font-weight: 500; color: #cbd5e1; }
  .kb-info-secondary { font-size: 12px; color: #475569; }
`;

// ── Tiny icon components ───────────────────────────────────────────
const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg className={`kb-chevron${open ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconCpu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="6" height="6" /><rect x="2" y="2" width="20" height="20" rx="3" />
    <path d="M9 1v2M15 1v2M9 21v2M15 21v2M1 9h2M1 15h2M21 9h2M21 15h2" />
  </svg>
);
const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Animated dots icon (in-progress step 2 icon) ───────────────────
function AnimatedDots() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle cx="8" cy="16" r="3" fill="#38bdf8" opacity="0.9">
        <animate attributeName="cy" values="16;10;16" dur="0.9s" begin="0s" repeatCount="indefinite" />
      </circle>
      <circle cx="16" cy="16" r="3" fill="#38bdf8" opacity="0.7">
        <animate attributeName="cy" values="16;10;16" dur="0.9s" begin="0.15s" repeatCount="indefinite" />
      </circle>
      <circle cx="24" cy="16" r="3" fill="#38bdf8" opacity="0.5">
        <animate attributeName="cy" values="16;10;16" dur="0.9s" begin="0.3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ── Format seconds as MM:SS ────────────────────────────────────────
function fmtTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

// ── KB View component ──────────────────────────────────────────────
function KBView({ kbState, onCancel }) {
  const {
    progress = 0,         // 0-100
    currentChunk = 0,
    totalChunks = 0,
    stepTimers = [0, 0, 0],   // elapsed seconds per step
    activeStep = 0,       // 0-indexed: 0=prepare, 1=embed, 2=store
    expandedStep = 1,     // which step detail is open
    embeddingModel = "all-MiniLM-L6-v2",
    dimensions = 384,
    batchSize = 32,
    estimatedTime = "~40 seconds",
    onToggleStep,
  } = kbState;

    const isComplete = progress === 100;
    const steps = [
        {
          number: 1,
          name: "Preparing chunks",
          desc: "Splitting and validating document chunks",
          status: activeStep > 0 ? "done" : activeStep === 0 ? "active" : "pending",
        },
        {
          number: 2,
          name: "Processing chunks",
          desc: "Generating embeddings and storing vectors",
          status: activeStep > 1 ? "done" : activeStep === 1 ? "active" : "pending",
        },
        {
          number: 3,
          name: "Finalizing",
          desc: "Completing indexing process",
          status: progress === 100 ? "done" : activeStep === 2 ? "active" : "pending",
        },
      ];

  return (
    <div className="kb-view">
      {/* Top bar */}
      <div className="kb-topbar">
        <div className="kb-title-group">
          <div className="kb-bolt"><IconBolt /></div>
          <div>
            <h1 className="kb-heading">
            {isComplete ? "Knowledge Base Ready" : "Building Knowledge Base"}
            </h1>

            <p className="kb-sub">
            {isComplete
                ? "Your document is now ready for querying"
                : "Converting your document into a searchable knowledge base"}
            </p>
          </div>
        </div>
        <button className="kb-cancel-btn" onClick={onCancel}>
          <IconX /> Cancel Indexing
        </button>
      </div>

      {/* Overall progress */}
      <div className="kb-progress-card">
        <span className="kb-progress-label">Overall Progress</span>
        <div className="kb-progress-pct">
          {Math.round(progress)}<span>%</span>
        </div>
        <p className="kb-progress-status">Processing {currentChunk} of {totalChunks} chunks</p>
        <div className="kb-bar-track" style={{ width: "100%" }}>
        <div
        className={`kb-bar-fill ${progress !== 100 ? "animate" : ""}`}
        style={{ width: `${progress}%` }}
        />
        </div>
      </div>

      {/* Steps */}
      <div className="kb-steps">
        {steps.map((step, i) => {
          const isOpen = expandedStep === i;
          const isActive = step.status === "active";
          const isDone = step.status === "done";
          const isPending = step.status === "pending";
          const timer = stepTimers[i] ?? 0;

          return (
            <div
              key={i}
              className={`kb-step${isActive ? " step-active" : ""}${isDone ? " step-done" : ""}`}
            >
              <div className="kb-step-header" onClick={() => onToggleStep && onToggleStep(i)}>
                {/* Badge */}
                {isActive ? (
                  <div className="badge-active-wrap">
                    <div className="badge-pulse-ring" />
                    <div className="kb-step-badge badge-active">{step.number}</div>
                  </div>
                ) : (
                  <div className={`kb-step-badge ${isDone ? "badge-done" : "badge-pending"}`}>
                    {isDone ? <IconCheck /> : step.number}
                  </div>
                )}

                <div className="kb-step-info">
                  <p className="kb-step-name">{step.name}</p>
                  <p className="kb-step-desc">{step.desc}</p>
                </div>

                <div className="kb-step-right">
                  {isActive && (
                    <span className="kb-step-status-pill pill-progress">In progress</span>
                  )}
                  {isPending && (
                    <span className="kb-step-status-pill pill-pending">Pending</span>
                  )}
                  <span className={`kb-step-timer${isDone ? " timer-done" : isPending ? " timer-pending" : ""}`}>
                    {isPending ? "--:--" : fmtTime(timer)}
                  </span>
                  {(isActive || isDone) && <IconChevron open={isOpen} />}
                </div>
              </div>

              {/* Expanded detail — only for embedding step */}
              {isOpen && i === 1 && (
                  <div className="kb-step-detail">
                  <div className="kb-detail-card">
                    <div className="kb-detail-field">
                      <span className="kb-detail-field-label">Embedding Model</span>
                      <span className="kb-detail-field-value">{embeddingModel}</span>
                    </div>
                    <div className="kb-detail-field">
                      <span className="kb-detail-field-label">Dimensions</span>
                      <span className="kb-detail-field-value">{dimensions}</span>
                    </div>
                    <div className="kb-detail-field">
                      <span className="kb-detail-field-label">Batch Size</span>
                      <span className="kb-detail-field-value">{batchSize} <span style={{ color: "#475569", fontFamily: "Sora, sans-serif", fontSize: 11, fontWeight: 400 }}>chunks</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Indexing details */}
      <div className="kb-details-section">
        <span className="kb-details-title">Indexing Details</span>
        <div className="kb-details-grid">
          <div className="kb-detail-tile">
            <div className="kb-detail-tile-top"><IconFile /><span className="kb-detail-tile-label">Total Chunks</span></div>
            <span className="kb-detail-tile-value">{totalChunks}</span>
          </div>
          <div className="kb-detail-tile">
            <div className="kb-detail-tile-top"><IconCpu /><span className="kb-detail-tile-label">Embedding Model</span></div>
            <span className="kb-detail-tile-value" style={{ fontSize: 11 }}>{embeddingModel}</span>
          </div>
          <div className="kb-detail-tile">
            <div className="kb-detail-tile-top"><IconDatabase /><span className="kb-detail-tile-label">Vector Store</span></div>
            <span className="kb-detail-tile-value" style={{ fontSize: 11 }}>Qdrant (Vector DB)</span></div>
          <div className="kb-detail-tile">
            <div className="kb-detail-tile-top"><IconClock /><span className="kb-detail-tile-label">Estimated Time</span></div>
            <span className="kb-detail-tile-value">{estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="kb-info-banner">
        <div className="kb-info-icon"><IconInfo /></div>
        <div className="kb-info-text">
          <span className="kb-info-primary">Please keep this window open while we build your knowledge base.</span>
          <span className="kb-info-secondary">You'll be able to ask questions about your document once indexing is complete.</span>
        </div>
      </div>
    </div>
  );
}

// ── Main MainView component ────────────────────────────────────────
function MainView({ data, viewMode, kbState, onCancelKB }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  if (viewMode === "query") {
    return (
      <>
        <style>{mainStyles}</style>
        <div className="main-view" style={{ flexDirection: "row" }}>
          <QueryView kbState={kbState} data={data} />
        </div>
      </>
    );
  }

  // KB view
  if (viewMode === "kb") {
    return (
      <>
        <style>{mainStyles}</style>
        <div className="main-view">
          <KBView kbState={kbState || {}} onCancel={onCancelKB} />
        </div>
      </>
    );
  }

  // Empty state
  if (!data) {
    return (
      <>
        <style>{mainStyles}</style>
        <div className="main-view">
          <div className="main-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p>Upload a document to begin</p>
          </div>
        </div>
      </>
    );
  }

  // Parse / chunk view (default)
  return (
    <>
      <style>{mainStyles}</style>
      <div className="main-view">
        <div className="main-header">
          <StatsBar data={data} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <div className="main-toolbar">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
        <div className="main-content">
          <ChunkGrid chunks={data.chunks} searchQuery={search} activeFilter={activeFilter} />
        </div>
      </div>
    </>
  );
}

export default MainView;
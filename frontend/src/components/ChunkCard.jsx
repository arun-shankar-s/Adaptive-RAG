import { useState, useEffect } from "react";

const cardStyles = `
  .chunk-card {
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .chunk-card:hover {
    border-color: rgba(56,189,248,0.25);
    box-shadow: 0 0 0 1px rgba(56,189,248,0.08);
  }
  .chunk-card.selected {
    border-color: rgba(56,189,248,0.55);
    box-shadow: 0 0 0 1px rgba(56,189,248,0.2), 0 0 20px rgba(56,189,248,0.08);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-title {
    font-family: 'Sora', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    color: #e2e8f0;
  }
  .card-tokens {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    color: #475569;
  }

  .card-badge-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .card-badge {
    font-family: 'Sora', sans-serif;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8;
    white-space: nowrap;
  }
  .card-badge-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #334155;
    flex-shrink: 0;
  }

  .card-text {
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    line-height: 1.65;
    color: #94a3b8;
    flex: 1;
  }
  .card-text .highlight {
    color: #38bdf8;
    font-weight: 500;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
  }
  .card-progress {
    flex: 1;
    height: 2.5px;
    background: rgba(255,255,255,0.06);
    border-radius: 99px;
    overflow: hidden;
  }
  .card-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #1d4ed8, #38bdf8);
  }
  .card-eye {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
    margin-left: 10px;
  }
  .card-eye:hover {
    background: rgba(56,189,248,0.1);
    border-color: rgba(56,189,248,0.3);
  }
  .card-eye svg {
    width: 13px;
    height: 13px;
    color: #475569;
  }
  .card-eye:hover svg {
    color: #38bdf8;
  }

  /* ── Modal overlay ── */
  .chunk-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: overlayIn 0.18s ease;
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .chunk-modal {
    background: #0d1117;
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 16px;
    width: 100%;
    max-width: 680px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.08), 0 24px 60px rgba(0,0,0,0.6);
    animation: modalIn 0.2s cubic-bezier(0.34,1.3,0.64,1);
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .modal-title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .modal-title {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
  .modal-badge-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .modal-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
    color: #64748b;
  }
  .modal-close:hover {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.3);
    color: #f87171;
  }
  .modal-close svg { width: 14px; height: 14px; }

  .modal-meta-bar {
    display: flex;
    gap: 20px;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
    background: rgba(255,255,255,0.02);
  }
  .modal-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .modal-meta-label {
    font-family: 'Sora', sans-serif;
    font-size: 10px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .modal-meta-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #e2e8f0;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .modal-body::-webkit-scrollbar { width: 5px; }
  .modal-body::-webkit-scrollbar-track { background: transparent; }
  .modal-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  .modal-text {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    line-height: 1.75;
    color: #94a3b8;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .modal-text .highlight {
    color: #38bdf8;
    font-weight: 500;
    background: rgba(56,189,248,0.08);
    border-radius: 3px;
    padding: 0 2px;
  }

  .modal-footer {
    padding: 12px 20px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
  .modal-copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: 7px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.04);
    color: #94a3b8;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .modal-copy-btn:hover {
    background: rgba(56,189,248,0.07);
    border-color: rgba(56,189,248,0.25);
    color: #e2e8f0;
  }
  .modal-copy-btn.copied {
    border-color: rgba(34,197,94,0.35);
    color: #22c55e;
    background: rgba(34,197,94,0.07);
  }
  .modal-copy-btn svg { width: 13px; height: 13px; }

  /* Table inside card */
  .card-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
  }
  .card-table th {
    color: #64748b;
    font-weight: 500;
    text-align: left;
    padding: 4px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .card-table td {
    color: #94a3b8;
    padding: 4px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
`;

function highlightKeywords(text, keywords = []) {
  if (!keywords.length) return text;
  const regex = new RegExp(`(${keywords.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <span key={i} className="highlight">{part}</span> : part
  );
}

function ChunkModal({ chunk, searchQuery = "", onClose }) {
  const [copied, setCopied] = useState(false);
  const keywords = searchQuery.trim().length > 1 ? [searchQuery.trim()] : [];
  const tokens = chunk.token_count ?? Math.round(chunk.char_count / 4);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chunk.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="chunk-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chunk-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 className="modal-title">Chunk #{chunk.chunk_index + 1}</h3>
            <div className="modal-badge-row">
              <span className="card-badge">Page {chunk.page_number ?? "—"}</span>
              <div className="card-badge-dot" />
              <span className="card-badge">{chunk.section_type ?? "Text"}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Meta bar */}
        <div className="modal-meta-bar">
          <div className="modal-meta-item">
            <span className="modal-meta-label">Characters</span>
            <span className="modal-meta-value">{chunk.char_count.toLocaleString()}</span>
          </div>
          <div className="modal-meta-item">
            <span className="modal-meta-label">Tokens</span>
            <span className="modal-meta-value">{tokens.toLocaleString()}</span>
          </div>
          <div className="modal-meta-item">
            <span className="modal-meta-label">Words</span>
            <span className="modal-meta-value">{chunk.text.split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
          </div>
          {chunk.page_number && (
            <div className="modal-meta-item">
              <span className="modal-meta-label">Page</span>
              <span className="modal-meta-value">{chunk.page_number}</span>
            </div>
          )}
        </div>

        {/* Full text */}
        <div className="modal-body">
          <div className="modal-text">
            {highlightKeywords(chunk.text, keywords)}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className={`modal-copy-btn${copied ? " copied" : ""}`} onClick={handleCopy}>
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Text
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChunkCard({ chunk, searchQuery = "", selected = false, onSelect }) {
  const [modalOpen, setModalOpen] = useState(false);
  const MAX = 220;
  const preview = chunk.text.length > MAX ? chunk.text.slice(0, MAX) + "…" : chunk.text;
  const keywords = searchQuery.trim().length > 1 ? [searchQuery.trim()] : [];

  // density of text
  const densityPct = Math.min(100, Math.round((chunk.char_count / 1000) * 100));

  // detect table-like chunks
  const isTable = chunk.section_type === "table" || (chunk.text.includes("\t") && chunk.text.split("\n").length > 3);

  return (
    <>
      <style>{cardStyles}</style>
      <div
        className={`chunk-card${selected ? " selected" : ""}`}
        onClick={() => onSelect && onSelect(chunk.chunk_index)}
      >
        {/* Header */}
        <div className="card-header">
          <span className="card-title">Chunk #{chunk.chunk_index + 1}</span>
          <span className="card-tokens">{chunk.token_count ?? Math.round(chunk.char_count / 4)} tokens</span>
        </div>

        {/* Badge row */}
        <div className="card-badge-row">
          <span className="card-badge">Page {chunk.page_number ?? "—"}</span>
          <div className="card-badge-dot" />
          <span className="card-badge">{chunk.section_type ?? "Text"}</span>
        </div>

        {/* Content */}
        {isTable ? (
          <table className="card-table">
            <tbody>
              {chunk.text.split("\n").slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {row.split("\t").map((cell, j) => (
                    i === 0
                      ? <th key={j}>{cell}</th>
                      : <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="card-text">
            {highlightKeywords(preview, keywords)}
          </div>
        )}

        {/* Footer */}
        <div className="card-footer">
          <div className="card-progress">
            <div className="card-progress-fill" style={{ width: `${densityPct}%` }} />
          </div>
          <div
            className="card-eye"
            onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
            title="View full chunk"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ChunkModal
          chunk={chunk}
          searchQuery={searchQuery}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

export default ChunkCard;
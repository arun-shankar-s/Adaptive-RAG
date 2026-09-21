import { useState } from "react";
import ChunkCard from "./ChunkCard";

const gridStyles = `
  .chunk-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  @media (max-width: 1100px) {
    .chunk-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 700px) {
    .chunk-grid { grid-template-columns: 1fr; }
  }

  .show-more-row {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  .show-more-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 22px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #94a3b8;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .show-more-btn:hover {
    background: rgba(56,189,248,0.07);
    border-color: rgba(56,189,248,0.25);
    color: #e2e8f0;
  }
  .show-more-btn svg {
    width: 14px;
    height: 14px;
  }

  .grid-count {
    text-align: center;
    margin-top: 10px;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    color: #334155;
  }
`;

const PAGE_SIZE = 9;

function ChunkGrid({ chunks, searchQuery, activeFilter }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);

  const filtered = chunks.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "headings") return c.section_type?.toLowerCase().includes("head") || c.section_type?.toLowerCase().includes("title");
    if (activeFilter === "tables") return c.section_type?.toLowerCase().includes("table");
    if (activeFilter === "high") return c.char_count > 1200;
    if (activeFilter === "low") return c.char_count <= 600;
    return true;
  }).filter((c) => {
    if (!searchQuery?.trim()) return true;
    return c.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <>
      <style>{gridStyles}</style>
      <div className="chunk-grid">
        {shown.map((chunk) => (
          <ChunkCard
            key={chunk.chunk_index}
            chunk={chunk}
            searchQuery={searchQuery}
            selected={selected === chunk.chunk_index}
            onSelect={setSelected}
          />
        ))}
      </div>

      {hasMore && (
        <div className="show-more-row">
          <button className="show-more-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show More
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}

      <p className="grid-count">
        Showing {shown.length} of {filtered.length} chunks
      </p>
    </>
  );
}

export default ChunkGrid;
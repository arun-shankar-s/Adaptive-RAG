import { useState, useCallback } from "react";
import QuerySidebarLeft from "./QuerySidebarLeft";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";
import QuerySidebar from "./QuerySidebar";

const qvStyles = `
  .qv-root {
    flex: 1;
    display: flex;
    height: 100%;
    overflow: hidden;
    font-family: 'Sora', sans-serif;
    background: #080c12;
  }

  /* Center column */
  .qv-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  /* Top bar */
  .qv-topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
  }
  .qv-search-wrap { flex: 1; position: relative; }
  .qv-search-input {
    width: 100%;
    padding: 10px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    color: #e2e8f0;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .qv-search-input::placeholder { color: #334155; }
  .qv-search-input:focus { border-color: rgba(56,189,248,0.3); }

  .qv-ask-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(59,130,246,0.3);
    transition: box-shadow 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .qv-ask-btn:hover { box-shadow: 0 0 24px rgba(59,130,246,0.5); transform: translateY(-1px); }
  .qv-ask-btn:active { transform: translateY(0); }
  .qv-ask-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; transform: none; }
  .qv-ask-btn svg { width: 15px; height: 15px; }

  /* Scope banner */
  .qv-scope-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 20px;
    font-family: 'Sora', sans-serif;
    font-size: 11.5px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.2s;
  }
  .qv-scope-banner.scope-session {
    background: rgba(56,189,248,0.04);
    color: #38bdf8;
  }
  .qv-scope-banner.scope-all {
    background: rgba(52,211,153,0.05);
    color: #34d399;
  }
  .qv-scope-banner-left { display: flex; align-items: center; gap: 7px; }
  .qv-scope-banner-left svg { width: 13px; height: 13px; }
  .qv-scope-switch-btn {
    font-size: 11px;
    font-family: 'Sora', sans-serif;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid currentColor;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .qv-scope-switch-btn:hover { opacity: 1; }
`;

const QUERY_API_URL = "http://127.0.0.1:8001/query";

let msgIdCounter = 1;
function makeId() { return `msg-${msgIdCounter++}`; }

function QueryView({ kbState, data }) {
  const [messages, setMessages]       = useState([]);
  const [isTyping, setIsTyping]       = useState(false);
  const [queryDetails, setQueryDetails] = useState(null);
  const [settings, setSettings]       = useState({ topK: 5, searchType: "Similarity", threshold: 0.30 });
  const [topInput, setTopInput]       = useState("");

  // "session" = current doc only | "all" = all indexed docs
  const [scope, setScope] = useState("session");

  const indexSummary = {
    chunks:         data?.total_chunks ?? kbState?.totalChunks ?? "—",
    totalTokens:    data?.total_characters ? `${(data.total_characters / 4).toFixed(1)}k` : "—",
    embeddingModel: kbState?.embeddingModel ?? "all-MiniLM-L6-v2",
    vectorStore:    "Qdrant (Vector DB)",
    chunkSize:      data?.chunk_size ?? "—",
    overlap:        data?.chunk_overlap ? `${data.chunk_overlap}%` : "—",
    strategy:       data?.strategy ? data.strategy.charAt(0).toUpperCase() + data.strategy.slice(1) : "—",
  };

  const fileName = data?.file_name ?? "document.pdf";
  const fileSize = data?.file_size ?? "";

  const sendQuery = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id:        makeId(),
      role:      "user",
      content:   text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(QUERY_API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:           text.trim(),
          top_k:           settings.topK,
          search_type:     settings.searchType.toLowerCase(),
          score_threshold: settings.threshold,
          scope,                          // ← "session" or "all"
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      if (result.search_time_ms !== undefined) {
        setQueryDetails({
          embeddingModel: kbState?.embeddingModel ?? "all-MiniLM-L6-v2",
          dimensions:     kbState?.dimensions ?? 384,
          searchTime:     result.search_time_ms,
          totalTime:      result.total_time_s ?? "—",
          scope:          result.scope,
        });
      }

      const aiMsg = {
        id:        makeId(),
        role:      "ai",
        content:   result.answer ?? "No answer returned.",
        timestamp: new Date().toISOString(),
        scope:     result.scope,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: makeId(), role: "ai",
        content: `Error: ${err.message}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, settings, scope, kbState]);

  const handleTopAsk = () => {
    if (topInput.trim()) { sendQuery(topInput); setTopInput(""); }
  };

  const handleQueryAll = () => {
    setScope("all");
    // Clear chat so context is fresh for cross-doc queries
    setMessages([]);
  };

  const handleCopy    = (text) => navigator.clipboard?.writeText(text);
  const handleLike    = (id) => setMessages((prev) => prev.map((m) => m.id === id ? { ...m, liked: !m.liked, disliked: false } : m));
  const handleDislike = (id) => setMessages((prev) => prev.map((m) => m.id === id ? { ...m, disliked: !m.disliked, liked: false } : m));

  return (
    <>
      <style>{qvStyles}</style>
      <div className="qv-root">

        {/* Left sidebar */}
        <QuerySidebarLeft
          indexSummary={indexSummary}
          fileName={fileName}
          fileSize={fileSize}
          scope={scope}
          onQueryAll={handleQueryAll}
          onQuerySession={() => { setScope("session"); setMessages([]); }}
        />

        {/* Center */}
        <div className="qv-center">

          {/* Top search bar */}
          <div className="qv-topbar">
            {/* <div className="qv-search-wrap">
              <input
                className="qv-search-input"
                placeholder="Ask anything about your document..."
                value={topInput}
                onChange={(e) => setTopInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTopAsk()}
              />
            </div> */}
            {/* <button className="qv-ask-btn" onClick={handleTopAsk} disabled={!topInput.trim() || isTyping}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Ask
            </button> */}
          </div>

          {/* Scope banner */}
          <div className={`qv-scope-banner scope-${scope}`}>
            <div className="qv-scope-banner-left">
              {scope === "session" ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Querying current document only
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                  Querying all indexed documents
                </>
              )}
            </div>
            <button
              className="qv-scope-switch-btn"
              onClick={() => {
                if (scope === "all") { setScope("session"); setMessages([]); }
                else { handleQueryAll(); }
              }}
            >
              {scope === "session" ? "Switch to All Docs →" : "← Back to Current Doc"}
            </button>
          </div>

          {/* Chat area */}
          <ChatArea
            messages={messages}
            isTyping={isTyping}
            onExampleClick={sendQuery}
            onCopy={handleCopy}
            onLike={handleLike}
            onDislike={handleDislike}
          />

          {/* Bottom input */}
          <ChatInput
            onSend={sendQuery}
            isLoading={isTyping}
            hasMessages={messages.length > 0}
          />
        </div>

        {/* Right sidebar */}
        <QuerySidebar
          queryDetails={queryDetails}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </>
  );
}

export default QueryView;
const msgStyles = `
  .chat-msg-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .chat-msg-row.user-row {
    flex-direction: row-reverse;
    padding-left: 48px;
  }
  .chat-msg-row.ai-row {
    padding-right: 48px;
  }

  /* Avatar */
  .chat-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .chat-avatar.ai-avatar {
    background: linear-gradient(135deg, #1d4ed8, #38bdf8);
    box-shadow: 0 0 12px rgba(56,189,248,0.3);
  }
  .chat-avatar.user-avatar {
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 600;
  }
  .chat-avatar svg { width: 16px; height: 16px; color: #fff; }

  /* Bubble */
  .chat-bubble {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 100%;
  }
  .chat-time {
    font-size: 10px;
    color: #334155;
    font-family: 'JetBrains Mono', monospace;
  }
  .user-row .chat-time { text-align: right; }

   .bubble-body {
    padding: 12px 16px;
    border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    line-height: 1.65;
    text-align: left;
  }
  .ai-bubble {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px 14px 14px 4px;
    color: #cbd5e1;
    text-align: left;
  }
  .user-bubble {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px 14px 4px 14px;
    color: #e2e8f0;
    text-align: left;
  }

  /* Markdown-style list inside AI bubble */
  .bubble-body ul {
    margin: 6px 0 0 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .bubble-body li { color: #94a3b8; font-size: 13px; }

  /* Actions */
  .bubble-actions {
    display: flex;
    gap: 4px;
    margin-top: 2px;
  }
  .bubble-action-btn {
    width: 28px; height: 28px;
    border-radius: 7px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    color: #475569;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
  }
  .bubble-action-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
  .bubble-action-btn.liked { color: #22c55e; border-color: rgba(34,197,94,0.3); }
  .bubble-action-btn.disliked { color: #ef4444; border-color: rgba(239,68,68,0.3); }
  .bubble-action-btn svg { width: 13px; height: 13px; }
`;

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Minimal markdown: bold + bullet lists
function RenderText({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const parseInline = (str) => {
    // Convert **bold** to <strong>
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} style={{ color: "#e2e8f0", fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: "6px 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {listItems.map((li, i) => (
            <li key={i} style={{ color: "#94a3b8", fontSize: 13 }}>{parseInline(li)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    // Bullet: lines starting with "* ", "- ", "• "
    if (/^[\*\-•]\s/.test(line)) {
      listItems.push(line.replace(/^[\*\-•]\s/, ""));
    } else {
      flushList();
      if (line.trim()) {
        elements.push(
          <p key={i} style={{ margin: "0 0 6px", lineHeight: 1.65 }}>
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  flushList();
  return <>{elements}</>;
}

function ChatMessage({ message, onCopy, onLike, onDislike }) {
  const isUser = message.role === "user";

  return (
    <>
      <style>{msgStyles}</style>
      <div className={`chat-msg-row ${isUser ? "user-row" : "ai-row"}`}>
        <div className={`chat-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
          {isUser ? "U" : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          )}
        </div>

        <div className="chat-bubble">
          <span className="chat-time">{fmtTime(message.timestamp)}</span>
          <div className={`bubble-body ${isUser ? "user-bubble" : "ai-bubble"}`}>
            <RenderText text={message.content} />
          </div>
          {!isUser && (
            <div className="bubble-actions">
              <button className="bubble-action-btn" onClick={() => onCopy?.(message.content)} title="Copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button className={`bubble-action-btn${message.liked ? " liked" : ""}`} onClick={() => onLike?.(message.id)} title="Good">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>
              <button className={`bubble-action-btn${message.disliked ? " disliked" : ""}`} onClick={() => onDislike?.(message.id)} title="Bad">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" /><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatMessage;
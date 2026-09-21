import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

const areaStyles = `
  .chat-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 24px 28px;
    gap: 20px;
    scroll-behavior: smooth;
  }
  .chat-area::-webkit-scrollbar { width: 4px; }
  .chat-area::-webkit-scrollbar-track { background: transparent; }
  .chat-area::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  /* Empty state */
  .chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 40px 0 20px;
    text-align: center;
  }
  .chat-empty-icon {
    width: 80px; height: 80px;
    background: radial-gradient(circle at 50% 40%, rgba(56,189,248,0.2), rgba(29,78,216,0.15) 60%, transparent 80%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .chat-empty-icon svg { width: 40px; height: 40px; color: #38bdf8; }
  .chat-empty-icon::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 1px solid rgba(56,189,248,0.15);
    animation: empty-pulse 2.5s ease-in-out infinite;
  }
  @keyframes empty-pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.06); opacity: 1; }
  }
  .chat-empty-title {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: -0.3px;
    margin: 0;
  }
  .chat-empty-sub {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: #475569;
    margin: 0;
    line-height: 1.6;
    max-width: 320px;
  }

  /* Example cards in empty state */
  .chat-examples-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    max-width: 560px;
    margin-top: 8px;
  }
  .chat-example-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    text-align: left;
  }
  .chat-example-card:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(56,189,248,0.2);
    transform: translateY(-1px);
  }
  .chat-example-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: rgba(56,189,248,0.1);
    border: 1px solid rgba(56,189,248,0.15);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: #38bdf8;
  }
  .chat-example-icon svg { width: 15px; height: 15px; }
  .chat-example-text {
    font-family: 'Sora', sans-serif;
    font-size: 12.5px;
    color: #94a3b8;
    line-height: 1.4;
  }

  /* Date separator */
  .chat-date-sep {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .chat-date-sep::before, .chat-date-sep::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.05);
  }

  /* Typing indicator */
  .typing-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .typing-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1d4ed8, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 12px rgba(56,189,248,0.3);
  }
  .typing-avatar svg { width: 16px; height: 16px; color: #fff; }
  .typing-bubble {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px 14px 14px 4px;
    padding: 14px 18px;
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .typing-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #38bdf8;
    opacity: 0.4;
    animation: typing-bounce 1.2s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .typing-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes typing-bounce {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
`;

const EXAMPLE_QUESTIONS = [
  { icon: "doc", text: "Summarize this document" },
  { icon: "list", text: "What are the key points?" },
  { icon: "img", text: "Explain the images in the document" },
  { icon: "format", text: "What formatting styles are used?" },
];

function ExampleIcon({ type }) {
  const icons = {
    doc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    img: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    format: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>,
  };
  return icons[type] || icons.doc;
}

function ChatArea({ messages, isTyping, onExampleClick, onCopy, onLike, onDislike }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const isEmpty = !messages || messages.length === 0;

  return (
    <>
      <style>{areaStyles}</style>
      <div className="chat-area">
        {isEmpty ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h8M8 14h4" strokeWidth="2"/>
                <circle cx="19" cy="4" r="3" fill="#38bdf8" stroke="none" opacity="0.9">
                  <animate attributeName="r" values="3;3.5;3" dur="2s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <h2 className="chat-empty-title">Ask anything about your document</h2>
            <p className="chat-empty-sub">Get answers, insights, and summaries from your document using AI-powered search.</p>
            <div className="chat-examples-grid">
              {EXAMPLE_QUESTIONS.map((q) => (
                <div key={q.text} className="chat-example-card" onClick={() => onExampleClick?.(q.text)}>
                  <div className="chat-example-icon"><ExampleIcon type={q.icon} /></div>
                  <span className="chat-example-text">{q.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="chat-date-sep">Today</div>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onCopy={onCopy}
                onLike={onLike}
                onDislike={onDislike}
              />
            ))}
            {isTyping && (
              <div className="typing-row">
                <div className="typing-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </>
  );
}

export default ChatArea;
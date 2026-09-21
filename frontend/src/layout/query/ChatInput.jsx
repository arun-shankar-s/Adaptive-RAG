import { useState, useRef } from "react";

const inputStyles = `
  .chat-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
    border-top: 1px solid rgba(255,255,255,0.05);
    background: #080c12;
  }

  /* Example chips strip — only shown when no messages */
  .chat-chips-bar {
    padding: 10px 20px 0;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chat-chips-label {
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    color: #475569;
    display: flex;
    align-items: center;
    margin-right: 4px;
    white-space: nowrap;
  }
  .chat-chip {
    padding: 5px 12px;
    border-radius: 99px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #64748b;
    font-family: 'Sora', sans-serif;
    font-size: 11.5px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .chat-chip:hover {
    border-color: rgba(56,189,248,0.3);
    color: #94a3b8;
    background: rgba(56,189,248,0.05);
  }

  /* Main input row */
  .chat-input-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 12px 20px 16px;
  }

  /* Attach button */
  .chat-attach-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #475569;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s, background 0.15s;
  }
  .chat-attach-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.07); }
  .chat-attach-btn svg { width: 16px; height: 16px; }

  /* Textarea */
  .chat-textarea-wrap {
    flex: 1;
    position: relative;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    transition: border-color 0.2s;
  }
  .chat-textarea-wrap:focus-within {
    border-color: rgba(56,189,248,0.35);
  }
  .chat-textarea {
    width: 100%;
    min-height: 42px;
    max-height: 140px;
    padding: 11px 44px 11px 14px;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    color: #e2e8f0;
    line-height: 1.5;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .chat-textarea::placeholder { color: #334155; }
  .chat-textarea::-webkit-scrollbar { width: 3px; }
  .chat-textarea::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

  /* Voice button inside textarea */
  .chat-voice-btn {
    position: absolute;
    right: 10px;
    bottom: 9px;
    width: 26px; height: 26px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #334155;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: color 0.15s;
  }
  .chat-voice-btn:hover { color: #64748b; }
  .chat-voice-btn svg { width: 14px; height: 14px; }

  /* Send button */
  .chat-send-btn {
    width: 42px; height: 42px;
    border-radius: 11px;
    border: none;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(59,130,246,0.35);
    transition: opacity 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .chat-send-btn:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(59,130,246,0.55);
    transform: translateY(-1px);
  }
  .chat-send-btn:active:not(:disabled) { transform: translateY(0); }
  .chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
  .chat-send-btn svg { width: 17px; height: 17px; }

  /* Waveform send button (active/loading) */
  .chat-waveform-btn {
    background: linear-gradient(135deg, #1d4ed8, #38bdf8);
    box-shadow: 0 0 18px rgba(56,189,248,0.4);
  }
  .waveform-bars {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 16px;
  }
  .waveform-bar {
    width: 3px;
    border-radius: 99px;
    background: #fff;
    animation: waveform 0.8s ease-in-out infinite;
  }
  .waveform-bar:nth-child(1) { animation-delay: 0s; }
  .waveform-bar:nth-child(2) { animation-delay: 0.1s; }
  .waveform-bar:nth-child(3) { animation-delay: 0.2s; }
  .waveform-bar:nth-child(4) { animation-delay: 0.3s; }
  @keyframes waveform {
    0%, 100% { height: 4px; opacity: 0.5; }
    50% { height: 14px; opacity: 1; }
  }
`;

const EXAMPLE_CHIPS = [
  "Summarize this document",
  "What are the key points?",
  "Explain the images in the document",
  "What formatting styles are used?",
];

function ChatInput({ onSend, isLoading, hasMessages }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend?.(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const handleChip = (chip) => {
    setText(chip);
    textareaRef.current?.focus();
  };

  return (
    <>
      <style>{inputStyles}</style>
      <div className="chat-input-wrapper">
        {/* Chips bar — shown when there are messages */}
        {hasMessages && (
          <div className="chat-chips-bar">
            <span className="chat-chips-label">Try these examples:</span>
            {EXAMPLE_CHIPS.map((c) => (
              <button key={c} className="chat-chip" onClick={() => handleChip(c)}>{c}</button>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          {/* Attach */}
          <button className="chat-attach-btn" title="Attach file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Textarea */}
          <div className="chat-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder={hasMessages ? "Ask a follow-up question..." : "Ask anything about your document..."}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="chat-voice-btn" title="Voice input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>

          {/* Send / waveform */}
          <button
            className={`chat-send-btn${isLoading ? " chat-waveform-btn" : ""}`}
            onClick={handleSend}
            disabled={(!text.trim() && !isLoading)}
            title="Send"
          >
            {isLoading ? (
              <div className="waveform-bars">
                <div className="waveform-bar" />
                <div className="waveform-bar" />
                <div className="waveform-bar" />
                <div className="waveform-bar" />
              </div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatInput;
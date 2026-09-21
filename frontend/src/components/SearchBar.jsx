const searchStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .search-wrap {
    position: relative;
    flex: 1;
    max-width: 420px;
  }
  .search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
    color: #475569;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    padding: 9px 14px 9px 38px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.04);
    color: #e2e8f0;
    font-family: 'Sora', sans-serif;
    font-size: 12.5px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .search-input::placeholder { color: #475569; }
  .search-input:focus {
    border-color: rgba(56,189,248,0.4);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.07);
  }
`;

function SearchBar({ value, onChange }) {
  return (
    <>
      <style>{searchStyles}</style>
      <div className="search-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          placeholder="Search within chunks..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </>
  );
}

export default SearchBar;
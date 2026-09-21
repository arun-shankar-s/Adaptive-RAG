function StatsBar({ data }) {
    const chunks = data.chunks;
  
    const total = chunks.length;
    const totalChars = data.total_characters;
  
    const avg = totalChars / total;
    const max = Math.max(...chunks.map(c => c.char_count));
    const min = Math.min(...chunks.map(c => c.char_count));
  
    return (
      <div
        style={{
          padding: "10px",
          background: "#eee",
          marginTop: "20px",
          borderRadius: "6px"
        }}
      >
        <strong>{data.file_name}</strong> <br />
  
        Chunks: {total} | Characters: {totalChars} <br />
        Avg: {avg.toFixed(1)} | Max: {max} | Min: {min}
      </div>
    );
  }
  
  export default StatsBar;
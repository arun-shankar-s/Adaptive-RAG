import { useState, useEffect, useRef } from "react";
import Sidebar from "./layout/Sidebar";
import MainView from "./layout/MainView";

const KB_API_URL = "http://127.0.0.1:8001/build-kb";
const PARSE_API_URL = "http://127.0.0.1:8001/parse";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("parse"); // "parse" | "kb" | "query"
  const [kbTotalChunks, setKbTotalChunks] = useState(0);

  // ── KB state ──────────────────────────────────────────────────────
  const [kbProgress, setKbProgress] = useState(0);
  const [kbCurrentChunk, setKbCurrentChunk] = useState(0);
  const [kbActiveStep, setKbActiveStep] = useState(0);
  const [kbExpandedStep, setKbExpandedStep] = useState(1);
  const [kbStepTimers, setKbStepTimers] = useState([0, 0, 0]);
  const [kbRunning, setKbRunning] = useState(false);
  const [kbReady, setKbReady] = useState(false);

  const stepTimerRefs = useRef([null, null, null]);
  const kbAbortRef = useRef(null);

  // ── Tick the active step's timer every second ─────────────────────
  useEffect(() => {
    // Clear all existing intervals
    stepTimerRefs.current.forEach((t) => t && clearInterval(t));
    stepTimerRefs.current = [null, null, null];

    if (!kbRunning) return;

    const interval = setInterval(() => {
      setKbStepTimers((prev) => {
        const next = [...prev];
        if (kbActiveStep <=2) next[kbActiveStep] = (next[kbActiveStep] || 0) + 1;
        return next;
      });
    }, 1000);

    stepTimerRefs.current[kbActiveStep] = interval;
    return () => clearInterval(interval);
  }, [kbActiveStep, kbRunning]);

  // ── Parse handler ─────────────────────────────────────────────────
  const handleParse = async ({ file, chunkSize, overlap, strategy }) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chunk_size", chunkSize);
    formData.append("chunk_overlap", overlap);
    formData.append("strategy", strategy);

    setLoading(true);
    setViewMode("parse");

    try {
      const res = await fetch(PARSE_API_URL, { method: "POST", body: formData });
      if (!res.ok) { console.error("Server error"); return; }
      const result = await res.json();
      if (result.error) { console.error(result.error); return; }
      setData(result);
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Build KB handler ──────────────────────────────────────────────
  
  const handleBuildKB = async () => {
    
    if (kbRunning) return;
    if (!data || !data.chunks?.length) return;

    const totalChunks = data.chunks.length;
    // Reset KB state
    setKbReady(false);
    setKbProgress(0);
    setKbCurrentChunk(0);
    setKbActiveStep(0);
    setKbExpandedStep(1);
    setKbStepTimers([0, 0, 0]);
    setKbRunning(true);
    setViewMode("kb");
    

    const controller = new AbortController();
    kbAbortRef.current = controller;

    try {
      const res = await fetch(KB_API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        // Pass any needed body params here, e.g. chunk ids
        body: JSON.stringify({ chunks: data?.chunks ?? [] }),
      });

      if (!res.ok || !res.body) {
        console.error("KB build failed");
        setKbRunning(false);
        return;
      }

      // Read SSE / NDJSON stream from backend
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          const text = line.startsWith("data: ") ? line.slice(6) : line;
          if (!text.trim()) continue;
          try {
            const event = JSON.parse(text);

            if (event.totalChunks !== undefined) { setKbTotalChunks(event.totalChunks); }
            if (event.error) {
              console.error("KB ERROR:", event.error);
              controller.abort();
              reader.cancel();
              setKbRunning(false);
              setKbReady(false);
            
              // optional but better
              alert("Indexing failed: " + event.error);
            
              return;
            }
            // Expected shape: { step, progress, currentChunk, totalChunks }
            if (event.step !== undefined) setKbActiveStep(event.step);
            if (event.progress === 100) {
              completed=true
            }
            if (event.progress !== undefined) setKbProgress(event.progress);
            if (event.currentChunk !== undefined) setKbCurrentChunk(event.currentChunk);
            if (event.expandedStep !== undefined) setKbExpandedStep(event.expandedStep);
          } catch {
            // ignore malformed lines
          }
        }
      }
      if (completed) {
        setKbReady(true);
      } else {
        console.error("Stream ended before completion");
        setKbReady(false);
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("KB stream error:", err);
    } finally {
      setKbRunning(false);
    }
  };

  // ── Cancel KB ─────────────────────────────────────────────────────
  const handleCancelKB = () => {
    if (kbAbortRef.current) kbAbortRef.current.abort();
    stepTimerRefs.current.forEach((t) => t && clearInterval(t));
    setKbRunning(false);
    setViewMode("parse");
    setKbReady(false);
  };

  // ── Query mode ────────────────────────────────────────────────────
  const handleQueryMode = () => {
    setViewMode("query");
  };

  // ── kbState object passed to MainView ────────────────────────────
  const kbState = {
    progress: kbProgress,
    currentChunk: kbCurrentChunk,
    totalChunks: kbTotalChunks || data?.chunks?.length || 0,
    activeStep: kbActiveStep,
    expandedStep: kbExpandedStep,
    stepTimers: kbStepTimers,
    onToggleStep: (i) => setKbExpandedStep((prev) => (prev === i ? -1 : i)),
    embeddingModel: "all-MiniLM-L6-v2",
    dimensions: 384,
    batchSize: 32,
    estimatedTime: "~40 seconds",
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {viewMode !== "query" && (
      <Sidebar
        onParse={handleParse}
        onBuildKB={handleBuildKB}
        onQueryMode={handleQueryMode}
        loading={loading || kbRunning}
        mode={viewMode}
        setMode={setViewMode}
        kbReady={kbReady}
        hasParsed={!!data?.chunks?.length}
      />
      )}
      <MainView
        data={data}
        viewMode={viewMode}
        kbState={kbState}
        onCancelKB={handleCancelKB}
      />
    </div>
  );
}

export default App;
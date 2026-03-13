import { useState } from "react";
import Header from "./components/Header.jsx";
import UploadZone from "./components/UploadZone.jsx";
import DetectionCanvas from "./components/DetectionCanvas.jsx";
import ResultsSidebar from "./components/ResultsSidebar.jsx";
import { detectObjects } from "./detect.js";
import "./index.css";
import "./App.css";

export default function App() {
  const [imageUrl, setImageUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [hoveredDetection, setHoveredDetection] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [uploadKey, setUploadKey] = useState(0);

  const handleImageSelect = (file) => {
    setImageUrl(URL.createObjectURL(file));
    setDetections([]);
    setDismissed(new Set());
    setError(null);
  };

  const handleDetect = async () => {
    if (!imageUrl) return;

    setIsLoading(true);
    setError(null);
    setDismissed(new Set());

    try {
      const results = await detectObjects(imageUrl, setLoadingMsg);
      setDetections(results);
      if (results.length === 0) {
        setError("No objects detected. Try a different image.");
      }
    } catch (err) {
      console.error(err);
      setError("Detection failed: " + err.message);
    } finally {
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setDetections([]);
    setDismissed(new Set());
    setError(null);
    setUploadKey((k) => k + 1);
  };

  const handleDismiss = (index) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const filteredDetections = detections
    .map((d, i) => ({ ...d, originalIndex: i }))
    .filter(
      (d) => d.score >= confidenceThreshold && !dismissed.has(d.originalIndex),
    );

  return (
    <div className="app">
      <Header />

      {!imageUrl ? (
        <UploadZone key={uploadKey} onImageSelect={handleImageSelect} />
      ) : (
        <div className="workspace">
          <div className="canvas-area">
            <DetectionCanvas
              imageUrl={imageUrl}
              detections={filteredDetections}
              hoveredDetection={hoveredDetection}
              onDismiss={handleDismiss}
            />

            <div className="controls-bar">
              <button
                onClick={handleDetect}
                disabled={isLoading}
                className="btn-detect"
              >
                {isLoading
                  ? loadingMsg || "Loading..."
                  : detections.length > 0
                  ? "Re-scan"
                  : "Scan Image"}
              </button>
              <button onClick={handleReset} className="btn-reset">
                New Image
              </button>
            </div>

            {error && <p className="error-msg">{error}</p>}
          </div>

          {detections.length > 0 && (
            <ResultsSidebar
              detections={filteredDetections}
              confidenceThreshold={confidenceThreshold}
              onThresholdChange={setConfidenceThreshold}
              hoveredDetection={hoveredDetection}
              onHoverDetection={setHoveredDetection}
              onDismiss={handleDismiss}
              totalRaw={detections.length}
            />
          )}
        </div>
      )}
    </div>
  );
}

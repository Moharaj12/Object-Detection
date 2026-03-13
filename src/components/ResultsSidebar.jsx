import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Eye, Box, X } from "lucide-react";
import "./ResultsSidebar.css";

function TypewriterText({ text, delayMs = 0 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    const start = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 22);
      return () => clearInterval(iv);
    }, delayMs);
    return () => clearTimeout(start);
  }, [text, delayMs]);

  return <>{displayed || "\u00A0"}</>;
}

const slideIn = {
  hidden: { opacity: 0, x: 20 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 340, damping: 28, delay: i * 0.05 },
  }),
  exit: { opacity: 0, x: -12, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.18 } },
};

export default function ResultsSidebar({
  detections,
  confidenceThreshold,
  onThresholdChange,
  hoveredDetection,
  onHoverDetection,
  onDismiss,
  totalRaw,
}) {
  const labelCounts = {};
  detections.forEach((d) => {
    labelCounts[d.label] = (labelCounts[d.label] || 0) + 1;
  });
  const uniqueLabels = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="sidebar">
      {/* Stats */}
      <motion.div
        className="sidebar-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="stat-row">
          <div className="stat-box">
            <span className="stat-num">{detections.length}</span>
            <span className="stat-label">Objects</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{uniqueLabels.length}</span>
            <span className="stat-label">Types</span>
          </div>
        </div>
      </motion.div>

      {/* Confidence slider */}
      <motion.div
        className="sidebar-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06 }}
      >
        <div className="section-header">
          <SlidersHorizontal size={14} />
          <span>Confidence Filter</span>
        </div>
        <div className="slider-row">
          <input
            type="range"
            className="conf-slider"
            min={0}
            max={100}
            value={Math.round(confidenceThreshold * 100)}
            onChange={(e) => onThresholdChange(Number(e.target.value) / 100)}
          />
          <span className="conf-value">
            {Math.round(confidenceThreshold * 100)}%
          </span>
        </div>
        {totalRaw !== detections.length && (
          <p className="filter-note">
            Showing {detections.length} of {totalRaw} detections
          </p>
        )}
      </motion.div>

      {/* Label chips */}
      <motion.div
        className="sidebar-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.12 }}
      >
        <div className="section-header">
          <Box size={14} />
          <span>Detected Objects</span>
        </div>
        <div className="label-chips">
          <AnimatePresence>
            {uniqueLabels.map(([label, count], i) => {
              const det = detections.find((d) => d.label === label);
              return (
                <motion.div
                  key={label}
                  className="label-chip"
                  style={{ "--chip-color": det?.color }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 360, damping: 26 }}
                >
                  <span className="chip-dot" />
                  <span className="chip-name">{label}</span>
                  <span className="chip-count">×{count}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detection list */}
      <motion.div
        className="sidebar-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.18 }}
      >
        <div className="section-header">
          <Eye size={14} />
          <span>All Detections</span>
        </div>
        <div className="det-list">
          <AnimatePresence>
            {detections.map((det, i) => (
              <motion.div
                key={det.originalIndex}
                className={`det-item ${hoveredDetection === i ? "det-hovered" : ""}`}
                custom={i}
                variants={slideIn}
                initial="hidden"
                animate="show"
                exit="exit"
                onMouseEnter={() => onHoverDetection(i)}
                onMouseLeave={() => onHoverDetection(null)}
                layout
              >
                <span
                  className="det-color-bar"
                  style={{ background: det.color }}
                />
                <span className="det-label">
                  <TypewriterText
                    text={det.label}
                    delayMs={200 + i * 50}
                  />
                </span>
                <motion.span
                  className="det-conf"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 + i * 0.05 }}
                >
                  {Math.round(det.score * 100)}%
                </motion.span>
                <button
                  className="det-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(det.originalIndex);
                  }}
                  title="Dismiss detection"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </aside>
  );
}

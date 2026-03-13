import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import "./DetectionCanvas.css";

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
      }, 28);
      return () => clearInterval(iv);
    }, delayMs);
    return () => clearTimeout(start);
  }, [text, delayMs]);

  return <>{displayed || "\u00A0"}</>;
}

// Calculates the actual rendered content area of an object-fit:contain image
function getRenderedRect(img) {
  const { naturalWidth, naturalHeight, clientWidth: elW, clientHeight: elH } = img;
  if (!naturalWidth || !elW) return null;
  const natAspect = naturalWidth / naturalHeight;
  const elAspect = elW / elH;
  let rW, rH, oX, oY;
  if (natAspect > elAspect) {
    // wider image — letterbox top/bottom
    rW = elW;
    rH = elW / natAspect;
    oX = 0;
    oY = (elH - rH) / 2;
  } else {
    // taller image — pillarbox left/right
    rH = elH;
    rW = elH * natAspect;
    oX = (elW - rW) / 2;
    oY = 0;
  }
  return { rW, rH, oX, oY, naturalWidth, naturalHeight };
}

export default function DetectionCanvas({
  imageUrl,
  detections,
  hoveredDetection,
  onDismiss,
}) {
  const containerRef = useRef(null);
  const [rect, setRect] = useState(null);

  const updateRect = () => {
    const img = containerRef.current?.querySelector("img");
    if (img) setRect(getRenderedRect(img));
  };

  const handleImageLoad = (e) => setRect(getRenderedRect(e.target));

  useEffect(() => {
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  const scaleBox = (box) => {
    if (!rect) return null;
    const { rW, rH, oX, oY, naturalWidth, naturalHeight } = rect;
    const sx = rW / naturalWidth;
    const sy = rH / naturalHeight;
    return {
      xmin: box.xmin * sx + oX,
      ymin: box.ymin * sy + oY,
      xmax: box.xmax * sx + oX,
      ymax: box.ymax * sy + oY,
    };
  };

  return (
    <div className="detection-canvas" ref={containerRef}>
      <img
        src={imageUrl}
        alt="Uploaded"
        className="canvas-image"
        onLoad={handleImageLoad}
        draggable={false}
      />

      <AnimatePresence>
        {detections.map((det, i) => {
          const box = scaleBox(det.box);
          if (!box) return null;
          const d = i * 0.08;

          return (
            <motion.div
              key={`${det.label}-${det.originalIndex}`}
              className={`bbox ${hoveredDetection === i ? "bbox-hovered" : ""}`}
              style={{
                "--box-color": det.color,
                left: box.xmin,
                top: box.ymin,
                width: box.xmax - box.xmin,
                height: box.ymax - box.ymin,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.15 } }}
              transition={{ duration: 0.15, delay: d }}
            >
              {/* Scan line sweeps top → bottom once */}
              <motion.div
                className="bbox-scan-line"
                initial={{ top: "0%", opacity: 1 }}
                animate={{ top: "108%", opacity: 0 }}
                transition={{ delay: d + 0.05, duration: 0.38, ease: "easeIn" }}
              />

              {/* Corners draw in one by one */}
              {[
                ["tl", d + 0.05],
                ["tr", d + 0.09],
                ["bl", d + 0.13],
                ["br", d + 0.17],
              ].map(([pos, cornerDelay]) => (
                <motion.span
                  key={pos}
                  className={`bbox-corner ${pos}`}
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{ width: 12, height: 12, opacity: 1 }}
                  transition={{ delay: cornerDelay, duration: 0.16, ease: "easeOut" }}
                />
              ))}

              {/* Label fades up then typewriter fills in */}
              <motion.div
                className="bbox-label"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d + 0.22, duration: 0.18 }}
              >
                <TypewriterText text={det.label} delayMs={(d + 0.25) * 1000} />
                <motion.span
                  className="bbox-score"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ delay: d + 0.45 }}
                >
                  {Math.round(det.score * 100)}%
                </motion.span>
              </motion.div>

              {/* Dismiss button */}
              <motion.button
                className="bbox-dismiss"
                onClick={(e) => { e.stopPropagation(); onDismiss(det.originalIndex); }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: d + 0.45 }}
                title="Remove detection"
              >
                <X size={10} />
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

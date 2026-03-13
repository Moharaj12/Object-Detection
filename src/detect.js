import { AutoModel, AutoProcessor, RawImage } from "@huggingface/transformers";

let model = null;
let processor = null;

// Muted but distinct palette — consistent per label across detections
const PALETTE = [
  "#60a5fa", // blue
  "#34d399", // emerald
  "#f87171", // red/coral
  "#a78bfa", // violet
  "#fbbf24", // amber
  "#38bdf8", // sky
  "#f472b6", // pink
  "#4ade80", // green
  "#fb923c", // orange
  "#e879f9", // fuchsia
  "#22d3ee", // cyan
  "#facc15", // yellow
  "#818cf8", // indigo
  "#2dd4bf", // teal
  "#f9a8d4", // rose
];

function getLabelColor(label) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export async function loadModel(onProgress) {
  if (model && processor) return;

  if (onProgress) onProgress("Downloading AI model (first time only)...");

  model = await AutoModel.from_pretrained("Xenova/yolov9-c", {
    dtype: "fp32",
  });

  processor = await AutoProcessor.from_pretrained("Xenova/yolov9-c");

  if (onProgress) onProgress("Model ready!");
}

export async function detectObjects(imageUrl, onProgress) {
  // Make sure model is loaded
  await loadModel(onProgress);

  if (onProgress) onProgress("Scanning image...");

  // Load the image
  const image = await RawImage.read(imageUrl);

  // Run the image through the processor (resizes + normalizes)
  const { pixel_values } = await processor(image);

  // Run the model
  const { outputs } = await model({ images: pixel_values });

  // Parse the raw output into a clean array
  const predictions = outputs.tolist();
  const results = [];

  for (const [xmin, ymin, xmax, ymax, score, id] of predictions) {
    if (score < 0.3) break; // model returns sorted by score, stop at low ones
    const label = model.config.id2label[id];
    results.push({
      label,
      score,
      box: { xmin, ymin, xmax, ymax },
      color: getLabelColor(label),
    });
  }

  return results;
}


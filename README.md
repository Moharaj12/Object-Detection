# DETECT THIS — AI Object Detection

Upload any image and watch AI detect and label every object with animated bounding boxes, confidence scores, and a filterable results panel.

Runs **entirely in your browser** — no backend, no API keys, no cost.

## Demo

1. Drop or click to upload an image
2. Hit **Scan Image**
3. Watch bounding boxes spring in with labels and confidence scores
4. Use the confidence slider to filter weak detections
5. Hover detections in the sidebar to highlight them on the image
6. Dismiss wrong detections with the X button

## Features

- **In-browser AI** — YOLOv9 runs locally via Transformers.js, no server needed
- **Drag-and-drop upload** with scanner-themed drop zone
- **Animated bounding boxes** that spring in one by one with corner accents (ngl this isnt that accurate but I currently cannot be bothered to fix this lol srry)
- **Color-coded labels** — each object type gets a consistent color
- **Confidence slider** to filter low-confidence detections
- **Hover interaction** between sidebar and bounding boxes
- **Dismiss detections** that the AI got wrong
- **Responsive layout** — works on desktop and mobile

## Tech Stack

- React 18 + Vite
- Framer Motion (animations)
- Transformers.js + YOLOv9 (in-browser object detection)
- Lucide React (icons)
- react-dropzone (file upload)

## Getting Started
```bash
git clone https://github.com/Moharaj12/Object-Detection.git
cd Object-Detection
npm install
npm run dev
```

Opens at http://localhost:5173

The first scan downloads the YOLOv9 model (~136MB). After that it's cached and fast.

## How It Works

The app uses [Transformers.js](https://huggingface.co/docs/transformers.js) to run the [YOLOv9](https://huggingface.co/Xenova/yolov9-c) object detection model directly in the browser using ONNX Runtime. No data ever leaves your machine.

1. Image is uploaded and displayed on a canvas
2. The image is preprocessed (resized and normalized) by the YOLOv9 processor
3. The model returns bounding box coordinates, labels, and confidence scores
4. Boxes are scaled from the model's coordinate space to the displayed image size
5. Results are rendered as animated overlays with a filterable sidebar

## Project Structure
```
src/
├── components/
│   ├── Header.jsx         # Logo and model status tag
│   ├── Header.css
│   ├── UploadZone.jsx     # Drag-and-drop image upload
│   ├── UploadZone.css
│   ├── DetectionCanvas.jsx # Image with bounding box overlays
│   ├── DetectionCanvas.css
│   ├── ResultsSidebar.jsx  # Stats, slider, detection list
│   ├── ResultsSidebar.css
│   ├── ShimmerText.jsx     # Animated loading text
│   └── ShimmerText.css
├── detect.js              # YOLOv9 model loading and inference
├── App.jsx                # Main app with state management
├── App.css
├── index.css              # Global styles and design system
└── main.jsx               # Entry point
```

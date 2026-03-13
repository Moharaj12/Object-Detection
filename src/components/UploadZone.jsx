import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, ScanLine } from "lucide-react";
import "./UploadZone.css";

export default function UploadZone({ onImageSelect }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) onImageSelect(file);
    },
    [onImageSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="upload-page">
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? "dragging" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="upload-corners">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
        </div>

        <div className="upload-content">
          {isDragActive ? (
            <>
              <ScanLine size={48} className="upload-icon active" />
              <p className="upload-main">Target acquired</p>
            </>
          ) : (
            <>
              <ImagePlus size={48} className="upload-icon" />
              <p className="upload-main">Drop an image to scan</p>
              <p className="upload-hint">JPG, PNG, or WebP — max 100MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

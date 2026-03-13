import "./Header.css";
import { ScanLine } from "lucide-react";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-icon">
          <ScanLine size={24} />
        </div>
        <div>
          <h1 className="header-title">
            DETECT<span className="header-accent">THIS</span>
          </h1>
          <p className="header-sub">AI-Powered Object Detection</p>
        </div>
      </div>
      <div className="header-tag">
        <span className="tag-dot" />
        YOLOv9 · In-Browser
      </div>
    </header>
  );
}

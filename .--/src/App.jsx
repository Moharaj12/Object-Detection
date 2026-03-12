import Header from "./componenets/Header";
import "./index.css";

export default function App() {
  return (
    <div className="app">
      <Header />
      <p style={{ color: "var(--text-mid)", textAlign: "center" }}>
        Uploading here
      </p>
    </div>
  );
}

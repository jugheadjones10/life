import "./Controls.css";
// src/components/Controls.jsx
const Controls = ({
  isRunning,
  setIsRunning,
  onClear,
  onImportRule,
  onImportPattern,
  generation,
  zoom,
  setZoom,
}) => {
  return (
    <div className="controls">
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Start"}
      </button>
      <button onClick={onClear}>Clear</button>

      <div className="file-inputs">
        <div className="file-input">
          <label>Import Rule: </label>
          <input
            type="file"
            accept=".rule"
            onChange={(e) => onImportRule(e.target.files[0])}
          />
        </div>
        <div className="file-input">
          <label>Import Pattern: </label>
          <input
            type="file"
            accept=".rle"
            onChange={(e) => onImportPattern(e.target.files[0])}
          />
        </div>
      </div>

      <div className="zoom-controls">
        <button onClick={() => setZoom((z) => z * 1.1)}>Zoom In</button>
        <button onClick={() => setZoom((z) => z / 1.1)}>Zoom Out</button>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
      <div className="generation">Generation: {generation}</div>
    </div>
  );
};

export default Controls;

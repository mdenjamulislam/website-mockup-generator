import type { MockupConfig, DeviceType, Theme } from "../types/index";

interface MockupConfigPanelProps {
  config: MockupConfig;
  onChange: <K extends keyof MockupConfig>(key: K, value: MockupConfig[K]) => void;
  onReset: () => void;
  onDownload?: (format: "png" | "webp") => void;
  isDownloading?: boolean;
  hasMockup?: boolean;
}

const BG_COLORS = [
  { value: "#078D8F", label: "Brand" },
  { value: "#0f172a", label: "Slate 900" },
  { value: "#18181b", label: "Zinc 900" },
  { value: "#111827", label: "Gray 900" },
  { value: "#1e1b4b", label: "Indigo 950" },
  { value: "#14532d", label: "Green 900" },
  { value: "#ffffff", label: "White" },
  { value: "#f8fafc", label: "Slate 50" },
  { value: "transparent", label: "None" },
];

export function MockupConfigPanel({ config, onChange, onReset, onDownload, isDownloading, hasMockup }: MockupConfigPanelProps) {
  return (
    <section className="card" aria-labelledby="config-section-title">
      <div className="card-header">
        <div className="card-header-icon" aria-hidden="true">⚙️</div>
        <div className="card-header-content">
          <h2 className="card-title" id="config-section-title">Mockup Configuration</h2>
          <p className="card-subtitle">Customise the device, theme, and appearance</p>
        </div>
        <button
          type="button"
          id="reset-config-btn"
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          aria-label="Reset configuration to defaults"
        >
          Reset
        </button>
      </div>

      <div className="card-body">
        <div className="config-grid">
          {/* Device Type */}
          <div className="config-field">
            <label htmlFor="device-type-select" className="config-label">Device</label>
            <select
              id="device-type-select"
              className="config-select"
              value={config.deviceType}
              onChange={(e) => onChange("deviceType", e.target.value as DeviceType)}
            >
              <option value="browser">🌐 Browser Window</option>
              <option value="desktop">🖥️ Desktop Monitor</option>
              <option value="laptop">💻 Laptop (coming soon)</option>
              <option value="tablet">📲 Tablet (coming soon)</option>
              <option value="mobile">📱 Mobile (coming soon)</option>
            </select>
          </div>

          {/* Theme */}
          <div className="config-field">
            <label htmlFor="theme-select" className="config-label">Browser Theme</label>
            <select
              id="theme-select"
              className="config-select"
              value={config.theme}
              onChange={(e) => onChange("theme", e.target.value as Theme)}
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
          </div>

          {/* Padding */}
          <div className="config-field">
            <label htmlFor="padding-range" className="config-label">Padding</label>
            <div className="range-row">
              <input
                id="padding-range"
                type="range"
                className="range-input"
                min={0}
                max={120}
                step={10}
                value={config.padding}
                onChange={(e) => onChange("padding", Number(e.target.value))}
              />
              <span className="range-value">{config.padding}px</span>
            </div>
          </div>

          {/* Scale */}
          <div className="config-field">
            <label htmlFor="scale-range" className="config-label">Scale</label>
            <div className="range-row">
              <input
                id="scale-range"
                type="range"
                className="range-input"
                min={0.5}
                max={2}
                step={0.1}
                value={config.scale}
                onChange={(e) => onChange("scale", Number(e.target.value))}
              />
              <span className="range-value">{config.scale.toFixed(1)}×</span>
            </div>
          </div>

          {/* Position X */}
          <div className="config-field">
            <label htmlFor="posx-range" className="config-label">Position X</label>
            <div className="range-row">
              <input
                id="posx-range"
                type="range"
                className="range-input"
                min={-500}
                max={500}
                step={10}
                value={config.positionX}
                onChange={(e) => onChange("positionX", Number(e.target.value))}
              />
              <span className="range-value">{config.positionX}px</span>
            </div>
          </div>

          {/* Position Y */}
          <div className="config-field">
            <label htmlFor="posy-range" className="config-label">Position Y</label>
            <div className="range-row">
              <input
                id="posy-range"
                type="range"
                className="range-input"
                min={-500}
                max={500}
                step={10}
                value={config.positionY}
                onChange={(e) => onChange("positionY", Number(e.target.value))}
              />
              <span className="range-value">{config.positionY}px</span>
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div className="config-field" style={{ marginTop: "var(--space-5)" }}>
          <span className="config-label">Background Colour</span>
          <div className="color-swatches" role="group" aria-label="Background colour swatches">
            {BG_COLORS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`color-swatch${config.backgroundColor === value ? " active" : ""}`}
                style={{
                  background:
                    value === "transparent"
                      ? "repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 0 0 / 12px 12px"
                      : value,
                }}
                title={label}
                aria-label={`Set background to ${label}`}
                aria-pressed={config.backgroundColor === value}
                onClick={() => onChange("backgroundColor", value)}
              />
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            marginTop: "var(--space-5)",
          }}
        >
          <ToggleRow
            id="browser-chrome-toggle"
            label="Show browser chrome (address bar)"
            checked={config.showBrowserChrome}
            onChange={(v) => onChange("showBrowserChrome", v)}
          />
          <ToggleRow
            id="shadow-toggle"
            label="Drop shadow"
            checked={config.shadow}
            onChange={(v) => onChange("shadow", v)}
          />
          <ToggleRow
            id="rounded-toggle"
            label="Rounded corners"
            checked={config.rounded}
            onChange={(v) => onChange("rounded", v)}
          />
        </div>

        {/* Dimensions */}
        <div className="config-grid" style={{ marginTop: "var(--space-5)" }}>
          <div className="config-field">
            <label htmlFor="canvasWidth-input" className="config-label">Canvas Width (px)</label>
            <input
              id="canvasWidth-input"
              type="number"
              className="url-input"
              min={600}
              max={3840}
              value={config.canvasWidth}
              onChange={(e) => onChange("canvasWidth", Number(e.target.value))}
            />
          </div>
          <div className="config-field">
            <label htmlFor="canvasHeight-input" className="config-label">Canvas Height (px)</label>
            <input
              id="canvasHeight-input"
              type="number"
              className="url-input"
              min={400}
              max={3840}
              value={config.canvasHeight}
              onChange={(e) => onChange("canvasHeight", Number(e.target.value))}
            />
          </div>
        </div>

        {hasMockup && onDownload && (
          <div style={{ marginTop: "var(--space-8)", display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-success"
              style={{ flex: 1 }}
              onClick={() => onDownload("png")}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="btn-icon">⏳</span>
                  Generating…
                </>
              ) : (
                <>
                  <span className="btn-icon">⬇️</span>
                  Download PNG
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onDownload("webp")}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="btn-icon">⏳</span>
                  Generating…
                </>
              ) : (
                <>
                  <span className="btn-icon">⬇️</span>
                  Download WebP
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ id, label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="toggle-row" htmlFor={id}>
      <span className="toggle-label">{label}</span>
      <span className="toggle" aria-hidden="true">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </span>
    </label>
  );
}

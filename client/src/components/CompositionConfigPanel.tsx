import { useState } from "react";
import type { DeviceId } from "../types/index";
import { ORDERED_DEVICE_IDS, DEVICE_PRESET_INFO } from "../types/index";
import type {
  CompositionConfig,
  DeviceLayerConfig,
  CanvasConfig,
  PresetId,
} from "../types/composition";

interface CompositionConfigPanelProps {
  config: CompositionConfig;
  updateDeviceLayer: (deviceId: DeviceId, partial: Partial<DeviceLayerConfig>) => void;
  updateCanvas: (partial: Partial<CanvasConfig>) => void;
  applyPreset: (presetId: PresetId) => void;
  onDownload: (format: "png" | "webp") => void;
  isDownloading: boolean;
}

const PRESET_OPTIONS: { id: PresetId; label: string; icon: string }[] = [
  { id: "all", label: "All Devices", icon: "📱💻" },
  { id: "desktop-laptop", label: "Desktop + Laptop", icon: "🖥️💻" },
  { id: "desktop-tablet-mobile", label: "Desktop + Tablet + Mobile", icon: "🖥️📱" },
  { id: "laptop-mobile", label: "Laptop + Mobile", icon: "💻📱" },
  { id: "mobile-tablet", label: "Mobile + Tablet", icon: "📱🤳" },
  { id: "desktop-focus", label: "Desktop Focus", icon: "🖥️" },
];

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

export function CompositionConfigPanel({
  config,
  updateDeviceLayer,
  updateCanvas,
  applyPreset,
  onDownload,
  isDownloading,
}: CompositionConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "devices" | "canvas" | "appearance" | "export">("presets");

  return (
    <section className="card" aria-labelledby="composition-config-title" style={{ marginTop: "var(--space-6)" }}>
      <div className="card-header">
        <div className="card-header-icon" aria-hidden="true">🎨</div>
        <div className="card-header-content">
          <h2 className="card-title" id="composition-config-title">Composition Layout</h2>
          <p className="card-subtitle">Arrange devices and tweak the canvas</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => applyPreset("all")}
          aria-label="Reset composition to All Devices preset"
        >
          Reset Layout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", margin: "0 var(--space-4)" }}>
        {(["presets", "devices", "canvas", "appearance", "export"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            style={{
              padding: "var(--space-3) var(--space-4)",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === tab ? "var(--color-primary)" : "var(--color-text-2)",
              fontWeight: activeTab === tab ? "600" : "400",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card-body">
        {activeTab === "presets" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            {PRESET_OPTIONS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`btn ${config.preset === preset.id ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "flex-start", padding: "var(--space-3)" }}
                onClick={() => applyPreset(preset.id)}
              >
                <span style={{ fontSize: "1.2rem", marginRight: "var(--space-2)" }}>{preset.icon}</span>
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "devices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
              {ORDERED_DEVICE_IDS.map((deviceId) => {
                const info = DEVICE_PRESET_INFO[deviceId];
                const isVisible = config.devices[deviceId].visible;
                return (
                  <button
                    key={`quick-${deviceId}`}
                    type="button"
                    className={`btn ${isVisible ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1, padding: "var(--space-2)" }}
                    onClick={() => updateDeviceLayer(deviceId, { visible: !isVisible })}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
            {ORDERED_DEVICE_IDS.map((deviceId) => {
              const devConfig = config.devices[deviceId];
              const info = DEVICE_PRESET_INFO[deviceId];

              return (
                <div key={deviceId} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                    <h3 style={{ margin: 0, fontSize: "var(--text-md)" }}>{info.name} Configuration</h3>
                  </div>

                  {devConfig.visible && (
                    <div className="config-grid">
                      <div className="config-field">
                        <label className="config-label">Scale ({devConfig.scale.toFixed(2)}x)</label>
                        <input
                          type="range"
                          className="range-input"
                          min={0.2} max={2} step={0.05}
                          value={devConfig.scale}
                          onChange={(e) => updateDeviceLayer(deviceId, { scale: Number(e.target.value) })}
                        />
                      </div>
                      <div className="config-field">
                        <label className="config-label">Rotation ({devConfig.rotation}°)</label>
                        <input
                          type="range"
                          className="range-input"
                          min={-15} max={15} step={1}
                          value={devConfig.rotation}
                          onChange={(e) => updateDeviceLayer(deviceId, { rotation: Number(e.target.value) })}
                        />
                      </div>
                      <div className="config-field">
                        <label className="config-label">Position X ({devConfig.x}px)</label>
                        <input
                          type="range"
                          className="range-input"
                          min={-500} max={2500} step={10}
                          value={devConfig.x}
                          onChange={(e) => updateDeviceLayer(deviceId, { x: Number(e.target.value) })}
                        />
                      </div>
                      <div className="config-field">
                        <label className="config-label">Position Y ({devConfig.y}px)</label>
                        <input
                          type="range"
                          className="range-input"
                          min={-500} max={1500} step={10}
                          value={devConfig.y}
                          onChange={(e) => updateDeviceLayer(deviceId, { y: Number(e.target.value) })}
                        />
                      </div>
                      <div className="config-field">
                        <label className="config-label">Z-Index</label>
                        <select
                          className="config-select"
                          value={devConfig.zIndex}
                          onChange={(e) => updateDeviceLayer(deviceId, { zIndex: Number(e.target.value) })}
                        >
                          <option value={10}>10 (Back)</option>
                          <option value={20}>20 (Middle Back)</option>
                          <option value={30}>30 (Middle Front)</option>
                          <option value={40}>40 (Front)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "canvas" && (
          <div className="config-grid">
            <div className="config-field">
              <label className="config-label">Canvas Width (px)</label>
              <input
                type="number"
                className="url-input"
                min={800} max={3840}
                value={config.canvas.width}
                onChange={(e) => updateCanvas({ width: Number(e.target.value) })}
              />
            </div>
            <div className="config-field">
              <label className="config-label">Canvas Height (px)</label>
              <input
                type="number"
                className="url-input"
                min={600} max={2160}
                value={config.canvas.height}
                onChange={(e) => updateCanvas({ height: Number(e.target.value) })}
              />
            </div>
            
            <div className="config-field" style={{ gridColumn: "1 / -1", marginTop: "var(--space-4)" }}>
              <span className="config-label">Background Colour</span>
              <div className="color-swatches">
                {BG_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`color-swatch ${config.canvas.backgroundColor === value ? "active" : ""}`}
                    style={{
                      background: value === "transparent"
                        ? "repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 0 0 / 12px 12px"
                        : value
                    }}
                    title={label}
                    onClick={() => updateCanvas({ 
                      backgroundColor: value,
                      transparent: value === "transparent" 
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-md)" }}>Global Device Shadows</h3>
            
            <div className="config-field">
              <label className="config-label">Shadow Blur</label>
              <input
                type="range"
                className="range-input"
                min={0} max={100} step={1}
                value={config.devices.desktop.shadowBlur} // using desktop as source of truth for global slider
                onChange={(e) => {
                  const val = Number(e.target.value);
                  ORDERED_DEVICE_IDS.forEach(id => updateDeviceLayer(id, { shadowBlur: val }));
                }}
              />
            </div>

            <div className="config-field">
              <label className="config-label">Shadow Opacity</label>
              <input
                type="range"
                className="range-input"
                min={0} max={1} step={0.05}
                value={config.devices.desktop.shadowOpacity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  ORDERED_DEVICE_IDS.forEach(id => updateDeviceLayer(id, { shadowOpacity: val }));
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "export" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-md)" }}>Export Settings</h3>
            <p style={{ margin: 0, color: "var(--color-text-2)", textAlign: "center" }}>
              Export the current composition at exactly {config.canvas.width} × {config.canvas.height}.
            </p>
          </div>
        )}
      </div>

      <div className="card-footer" style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
        <button
          type="button"
          className="btn btn-success"
          style={{ flex: 1, padding: "var(--space-3)", fontWeight: "bold" }}
          onClick={() => onDownload("png")}
          disabled={isDownloading}
        >
          {isDownloading ? "⏳ Generating..." : "⬇️ Download PNG"}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ flex: 1, padding: "var(--space-3)", fontWeight: "bold" }}
          onClick={() => onDownload("webp")}
          disabled={isDownloading}
        >
          {isDownloading ? "⏳ Generating..." : "⬇️ Download WebP"}
        </button>
      </div>
    </section>
  );
}



import type { MultiDeviceScreenshots } from "../types/index";
import { DEVICE_PRESET_INFO, ORDERED_DEVICE_IDS } from "../types/index";

interface DevicePreviewGridProps {
  screenshots: MultiDeviceScreenshots;
}

export function DevicePreviewGrid({ screenshots }: DevicePreviewGridProps) {
  return (
    <section className="card" aria-labelledby="multi-device-preview-title" style={{ marginTop: "var(--space-6)" }}>
      <div className="card-header">
        <div className="card-header-icon" aria-hidden="true">📱</div>
        <div className="card-header-content">
          <h2 className="card-title" id="multi-device-preview-title">
            Responsive Renders
          </h2>
          <p className="card-subtitle">
            Raw screenshots rendered at different viewports
          </p>
        </div>
      </div>

      <div
        className="card-body"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-4)",
          padding: "var(--space-4)",
        }}
      >
        {ORDERED_DEVICE_IDS.map((deviceId) => {
          const result = screenshots[deviceId];
          const info = DEVICE_PRESET_INFO[deviceId];

          return (
            <div
              key={deviceId}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--color-bg)",
              }}
            >
              <div
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  borderBottom: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                }}
              >
                <span>{info.name}</span>
                <span style={{ color: "var(--color-text-3)", fontSize: "var(--text-xs)" }}>
                  {info.width} × {info.height}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--color-canvas)",
                  padding: "var(--space-4)",
                  minHeight: "200px",
                }}
              >
                {!result ? (
                  <span style={{ color: "var(--color-text-3)" }}>Pending...</span>
                ) : result.success && result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt={`${info.name} screenshot`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                ) : (
                  <div style={{ color: "var(--color-danger)", textAlign: "center" }}>
                    <div style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>⚠️</div>
                    <div style={{ fontSize: "var(--text-sm)" }}>Failed to render</div>
                    {result.error && (
                      <div style={{ fontSize: "var(--text-xs)", opacity: 0.8, marginTop: "var(--space-1)" }}>
                        {result.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

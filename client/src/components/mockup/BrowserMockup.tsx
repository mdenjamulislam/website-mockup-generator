import type { MockupConfig } from "../../types/index";
import { ReactNode } from "react";

interface BrowserMockupProps {
  config: MockupConfig;
  children: ReactNode;
}

export function BrowserMockup({ config, children }: BrowserMockupProps) {
  const isDark = config.theme === "dark";
  const headerBg = isDark ? "#2d2d2d" : "#f1f5f9";
  const dotColors = {
    close: "#ef4444",
    min: "#f59e0b",
    max: "#10b981",
  };

  const borderRadiusStyle = config.rounded ? { borderRadius: "12px" } : {};
  const shadowStyle = config.shadow
    ? { boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }
    : {};

  return (
    <div
      style={{
        ...borderRadiusStyle,
        ...shadowStyle,
        overflow: "hidden",
        backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${isDark ? "#404040" : "#e2e8f0"}`,
      }}
    >
      {/* Browser Chrome Header */}
      {config.showBrowserChrome && (
        <div
          style={{
            height: "40px",
            backgroundColor: headerBg,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: "8px",
            borderBottom: `1px solid ${isDark ? "#404040" : "#e2e8f0"}`,
          }}
        >
          {/* Dots */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: dotColors.close,
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: dotColors.min,
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: dotColors.max,
              }}
            />
          </div>

          {/* URL Bar */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "24px",
                backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                borderRadius: "6px",
                border: `1px solid ${isDark ? "#404040" : "#e2e8f0"}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

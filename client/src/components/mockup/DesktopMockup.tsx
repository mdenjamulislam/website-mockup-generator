import type { MockupConfig } from "../../types/index";
import { ReactNode } from "react";

interface DesktopMockupProps {
  config: MockupConfig;
  children: ReactNode;
}

export function DesktopMockup({ config, children }: DesktopMockupProps) {
  const isDark = config.theme === "dark";
  const frameBg = isDark ? "#1a1a1a" : "#f8fafc";
  const bezelColor = isDark ? "#000000" : "#e2e8f0";

  const borderRadiusStyle = config.rounded ? { borderRadius: "16px" } : {};
  const shadowStyle = config.shadow
    ? { boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }
    : {};

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Monitor Frame */}
      <div
        style={{
          ...borderRadiusStyle,
          ...shadowStyle,
          backgroundColor: bezelColor,
          padding: "16px 16px 24px 16px",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Inner Screen */}
        <div
          style={{
            flex: 1,
            backgroundColor: frameBg,
            overflow: "hidden",
            position: "relative",
            borderRadius: config.rounded ? "4px" : "0",
            border: `2px solid ${isDark ? "#262626" : "#cbd5e1"}`,
          }}
        >
          {children}
        </div>

        {/* Brand Logo area (just a small dot for minimalist look) */}
        <div
          style={{
            height: "8px",
            display: "flex",
            justifyContent: "center",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: isDark ? "#333" : "#cbd5e1",
            }}
          />
        </div>
      </div>

      {/* Stand (CSS only, simplified) */}
      <div
        style={{
          width: "20%",
          height: "40px",
          backgroundColor: isDark ? "#262626" : "#cbd5e1",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          position: "relative",
          zIndex: -1,
        }}
      />
      <div
        style={{
          width: "30%",
          height: "8px",
          backgroundColor: isDark ? "#333" : "#94a3b8",
          borderRadius: "4px",
        }}
      />
    </div>
  );
}

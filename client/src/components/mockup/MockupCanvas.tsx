import { useRef, useEffect, useState } from "react";
import type { MockupConfig } from "../../types/index";
import { BrowserMockup } from "./BrowserMockup";
import { DesktopMockup } from "./DesktopMockup";

interface MockupCanvasProps {
  config: MockupConfig;
  imageUrl: string;
}

export function MockupCanvas({ config, imageUrl }: MockupCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale to fit container width
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const targetWidth = config.canvasWidth;

      // Calculate scale to fit width, max scale is 1
      const newScale = Math.min(containerWidth / targetWidth, 1);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [config.canvasWidth]);

  let MockupComponent;
  switch (config.deviceType) {
    case "desktop":
      MockupComponent = DesktopMockup;
      break;
    case "browser":
    case "laptop": // fallback until dedicated frames are built
    case "tablet":
    case "mobile":
    default:
      MockupComponent = BrowserMockup;
      break;
  }

  // Calculate inner content positioning
  const contentStyle: React.CSSProperties = {
    width: `${config.width}px`,
    height: `${config.height}px`,
    transform: `scale(${config.scale}) translate(${config.positionX}px, ${config.positionY}px)`,
    transformOrigin: "top left",
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "top left",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${Math.round(config.canvasHeight * scale)}px`,
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Scaled Container */}
      <div
        style={{
          width: `${config.canvasWidth}px`,
          height: `${config.canvasHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          // Background for the overall canvas
          backgroundColor:
            config.backgroundColor === "transparent"
              ? "transparent"
              : config.backgroundColor,
          padding: `${config.padding}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MockupComponent config={config}>
          <div style={contentStyle} />
        </MockupComponent>
      </div>
    </div>
  );
}

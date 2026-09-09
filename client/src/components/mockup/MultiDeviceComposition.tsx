import { useRef, useEffect, useState } from "react";
import type { MultiDeviceScreenshots } from "../../types/index";
import type { CompositionConfig, DeviceLayerConfig } from "../../types/composition";
import { DesktopMockup } from "./DesktopMockup";
import { LaptopMockup } from "./LaptopMockup";
import { TabletMockup } from "./TabletMockup";
import { MobileMockup } from "./MobileMockup";
import "./deviceStyles.css";

interface MultiDeviceCompositionProps {
  screenshots: MultiDeviceScreenshots;
  config: CompositionConfig;
}

export function MultiDeviceComposition({
  screenshots,
  config,
}: MultiDeviceCompositionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = config.canvas;

  // Auto-scale to fit container width
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;

      // Calculate scale to fit width, max scale is 1
      const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [CANVAS_WIDTH]); // recalculate if canvas width changes

  // Helper to construct inline styles for a device layer
  const getLayerStyle = (layer: DeviceLayerConfig): React.CSSProperties => {
    if (!layer.visible) return { display: "none" };

    return {
      position: "absolute",
      left: `${layer.x}px`,
      top: `${layer.y}px`,
      transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
      transformOrigin: "center center",
      zIndex: layer.zIndex,
      // Shadow is applied via CSS variables or standard filter if needed, but our CSS handles standard shadows.
      // We can override drop-shadow dynamically here:
      filter: layer.shadow 
        ? `drop-shadow(0 ${layer.shadowBlur / 2}px ${layer.shadowBlur}px rgba(0,0,0,${layer.shadowOpacity}))`
        : "none",
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${Math.round(CANVAS_HEIGHT * scale)}px`,
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        className="composition-canvas"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          backgroundColor: config.canvas.transparent ? "transparent" : config.canvas.backgroundColor,
        }}
      >
        {config.devices.desktop.visible && (
          <div style={getLayerStyle(config.devices.desktop)}>
            <DesktopMockup imageUrl={screenshots.desktop?.imageUrl} />
          </div>
        )}
        {config.devices.tablet.visible && (
          <div style={getLayerStyle(config.devices.tablet)}>
            <TabletMockup imageUrl={screenshots.tablet?.imageUrl} />
          </div>
        )}
        {config.devices.laptop.visible && (
          <div style={getLayerStyle(config.devices.laptop)}>
            <LaptopMockup imageUrl={screenshots.laptop?.imageUrl} />
          </div>
        )}
        {config.devices.mobile.visible && (
          <div style={getLayerStyle(config.devices.mobile)}>
            <MobileMockup imageUrl={screenshots.mobile?.imageUrl} />
          </div>
        )}
      </div>
    </div>
  );
}

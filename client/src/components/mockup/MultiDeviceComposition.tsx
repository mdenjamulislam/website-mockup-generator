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

  // Auto-scale to fit container width perfectly using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        // Calculate scale to fit width, max scale is 1
        const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1);
        setScale(newScale);
      }
    });

    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [CANVAS_WIDTH]);

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
      filter: layer.shadow 
        ? `drop-shadow(0 ${layer.shadowBlur / 2}px ${layer.shadowBlur}px rgba(0,0,0,${layer.shadowOpacity}))`
        : "none",
    };
  };

  return (
    <div style={{ padding: 'var(--space-4)', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: `${CANVAS_WIDTH}px`,
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          backgroundColor: config.canvas.transparent ? "#1a1a1a" : config.canvas.backgroundColor,
          backgroundImage: config.canvas.transparent 
            ? "linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)"
            : "none",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
        }}
      >
        <div
          className="composition-canvas"
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundColor: "transparent", // handled by parent
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
    </div>
  );
}

import { useRef, useEffect, useState } from "react";
import type { MultiDeviceScreenshots } from "../../types/index";
import type { CompositionConfig, DeviceLayerConfig } from "../../types/composition";
import { DesktopMockup } from "./DesktopMockup";
import { LaptopMockup } from "./LaptopMockup";
import { TabletMockup } from "./TabletMockup";
import { MobileMockup } from "./MobileMockup";

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

  // Auto-scale to fit container width using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1);
        setScale(newScale);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [CANVAS_WIDTH]);

  // Build CSS transform for each device layer
  const getLayerStyle = (layer: DeviceLayerConfig): React.CSSProperties => {
    if (!layer.visible) return { display: "none" };

    const shadowFilter = layer.shadow
      ? `drop-shadow(0 ${Math.round(layer.shadowBlur * 0.4)}px ${layer.shadowBlur}px rgba(0,0,0,${layer.shadowOpacity}))`
      : "none";

    return {
      position: "absolute",
      left: `${layer.x}px`,
      top: `${layer.y}px`,
      transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
      transformOrigin: "center center",
      zIndex: layer.zIndex,
      filter: shadowFilter,
    };
  };

  const bgStyle: React.CSSProperties = config.canvas.transparent
    ? {
        backgroundColor: "transparent",
        backgroundImage:
          "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
      }
    : { backgroundColor: config.canvas.backgroundColor };

  return (
    <div style={{ padding: "24px 16px 32px", width: "100%" }}>
      {/* Outer wrapper: scales the canvas to fit the available width */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: `${CANVAS_WIDTH}px`,
          margin: "0 auto",
          // Maintain correct aspect ratio as the canvas scales
          height: `${Math.round(CANVAS_HEIGHT * scale)}px`,
          position: "relative",
        }}
      >
        {/* The canvas at its native resolution, scaled down */}
        <div
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow:
              "0 32px 64px -16px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)",
            ...bgStyle,
          }}
        >
          {/* Device layers — back to front via z-index */}
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

          {/* Subtle grounding shadow at the bottom of the canvas */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              left: "10%",
              right: "10%",
              height: "60px",
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 80%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

import type { MultiDeviceScreenshots } from "../../types/index";
import type { CompositionConfig, DeviceLayerConfig } from "../../types/composition";
import { DesktopMockup } from "./DesktopMockup";
import { LaptopMockup } from "./LaptopMockup";
import { TabletMockup } from "./TabletMockup";
import { MobileMockup } from "./MobileMockup";

export interface MockupCanvasInnerProps {
  screenshots: MultiDeviceScreenshots;
  config: CompositionConfig;
  id?: string;
  exportMode?: boolean;
}

function getLayerStyle(layer: DeviceLayerConfig): React.CSSProperties {
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
}

export function MockupCanvasInner({
  screenshots,
  config,
  id,
  exportMode = false,
}: MockupCanvasInnerProps) {
  const { width: W, height: H } = config.canvas;

  const bgStyle: React.CSSProperties = config.canvas.transparent
    ? {
        backgroundColor: exportMode ? "transparent" : undefined,
        backgroundImage: exportMode
          ? undefined
          : "linear-gradient(45deg,#ccc 25%,transparent 25%)," +
            "linear-gradient(-45deg,#ccc 25%,transparent 25%)," +
            "linear-gradient(45deg,transparent 75%,#ccc 75%)," +
            "linear-gradient(-45deg,transparent 75%,#ccc 75%)",
        backgroundSize: exportMode ? undefined : "24px 24px",
        backgroundPosition: exportMode ? undefined : "0 0,0 12px,12px -12px,-12px 0px",
      }
    : { backgroundColor: config.canvas.backgroundColor };

  return (
    <div
      id={id}
      style={{
        width: `${W}px`,
        height: `${H}px`,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...(exportMode
          ? {}
          : {
              borderRadius: "20px",
              boxShadow:
                "0 32px 64px -16px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)",
            }),
        ...bgStyle,
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
      {!exportMode && (
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
      )}
    </div>
  );
}

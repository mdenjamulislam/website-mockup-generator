import { useRef, useEffect, useState } from "react";
import type { MultiDeviceScreenshots } from "../../types/index";
import type { CompositionConfig } from "../../types/composition";
import { MockupCanvasInner } from "./MockupCanvasInner";

interface MultiDeviceCompositionProps {
  screenshots: MultiDeviceScreenshots;
  config: CompositionConfig;
}

/**
 * Editor preview wrapper.
 *
 * Owns the ResizeObserver scale-to-fit logic so the 1920x1080 canvas
 * fits any editor panel width. Device rendering is delegated to
 * MockupCanvasInner which is shared with the headless export page.
 */
export function MultiDeviceComposition({
  screenshots,
  config,
}: MultiDeviceCompositionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = config.canvas;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newScale = Math.min(entry.contentRect.width / CANVAS_WIDTH, 1);
        setScale(newScale);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [CANVAS_WIDTH]);

  return (
    <div style={{ padding: "24px 16px 32px", width: "100%" }}>
      {/* Outer wrapper: reserves correct vertical space as scale changes */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: `${CANVAS_WIDTH}px`,
          margin: "0 auto",
          height: `${Math.round(CANVAS_HEIGHT * scale)}px`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scale-transform wrapper — MockupCanvasInner renders at native size */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <MockupCanvasInner
            screenshots={screenshots}
            config={config}
            exportMode={false}
          />
        </div>
      </div>
    </div>
  );
}

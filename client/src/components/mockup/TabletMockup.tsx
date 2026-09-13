import { TabletMockup as LibTabletMockup } from "@codinix/device-mockup";

interface TabletMockupProps {
  imageUrl?: string;
}

/**
 * Tablet device frame powered by @codinix/device-mockup.
 * Intrinsic screen area: 480×640px (set by the library).
 */
export function TabletMockup({ imageUrl }: TabletMockupProps) {
  return (
    <LibTabletMockup>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Tablet preview"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1f2e 0%, #0d1117 100%)" }} />
      )}
    </LibTabletMockup>
  );
}

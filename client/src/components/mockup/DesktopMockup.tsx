import { DesktopMockup as LibDesktopMockup } from "@codinix/device-mockup";

interface DesktopMockupProps {
  imageUrl?: string;
}

/**
 * Desktop device frame powered by @codinix/device-mockup.
 * Intrinsic screen area: 890×500px (set by the library).
 */
export function DesktopMockup({ imageUrl }: DesktopMockupProps) {
  return (
    <LibDesktopMockup>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Desktop preview"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1f2e 0%, #0d1117 100%)" }} />
      )}
    </LibDesktopMockup>
  );
}

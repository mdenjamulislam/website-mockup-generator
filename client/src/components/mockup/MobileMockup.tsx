import { PhoneMockup as LibPhoneMockup } from "@codinix/device-mockup";

interface MobileMockupProps {
  imageUrl?: string;
}

/**
 * Mobile phone device frame powered by @codinix/device-mockup.
 * Intrinsic screen area: 320×640px (set by the library).
 */
export function MobileMockup({ imageUrl }: MobileMockupProps) {
  return (
    <LibPhoneMockup>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Mobile preview"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1f2e 0%, #0d1117 100%)" }} />
      )}
    </LibPhoneMockup>
  );
}

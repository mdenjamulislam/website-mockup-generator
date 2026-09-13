import { LaptopMockup as LibLaptopMockup } from "@codinix/device-mockup";

interface LaptopMockupProps {
  imageUrl?: string;
}

/**
 * Laptop device frame powered by @codinix/device-mockup.
 * Intrinsic screen area: 700×420px (set by the library).
 */
export function LaptopMockup({ imageUrl }: LaptopMockupProps) {
  return (
    <LibLaptopMockup>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Laptop preview"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1f2e 0%, #0d1117 100%)" }} />
      )}
    </LibLaptopMockup>
  );
}

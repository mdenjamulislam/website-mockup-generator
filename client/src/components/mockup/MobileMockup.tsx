import "./deviceStyles.css";

interface MobileMockupProps {
  imageUrl?: string;
}

export function MobileMockup({ imageUrl }: MobileMockupProps) {
  return (
    <div className="dev-frame dev-mobile dev-bezel-gloss">
      {/* Dynamic Island */}
      <div className="dev-dynamic-island" aria-hidden="true" />

      {/* Volume buttons */}
      <div className="dev-mobile-vol-up" aria-hidden="true" />
      <div className="dev-mobile-vol-down" aria-hidden="true" />

      {/* Power button */}
      <div className="dev-mobile-power" aria-hidden="true" />

      {/* Screen */}
      <div className="dev-screen dev-mobile-screen">
        {imageUrl ? (
          <img src={imageUrl} alt="Mobile Preview" />
        ) : (
          <div className="dev-screen-empty" />
        )}
      </div>

      {/* Home indicator */}
      <div className="dev-mobile-home-indicator" aria-hidden="true" />
    </div>
  );
}

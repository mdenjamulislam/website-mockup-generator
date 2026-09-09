import "./deviceStyles.css";

interface DesktopMockupProps {
  imageUrl?: string;
}

export function DesktopMockup({ imageUrl }: DesktopMockupProps) {
  return (
    <div className="dev-frame dev-desktop">
      {/* Screen housing */}
      <div className="dev-desktop-display dev-bezel-gloss">
        <div className="dev-desktop-camera" aria-hidden="true" />
        <div className="dev-screen dev-desktop-screen">
          {imageUrl ? (
            <img src={imageUrl} alt="Desktop Preview" />
          ) : (
            <div className="dev-screen-empty" />
          )}
        </div>
        <div className="dev-desktop-chin">
          <div className="dev-desktop-logo" aria-hidden="true" />
        </div>
      </div>
      {/* Stand */}
      <div className="dev-desktop-neck" aria-hidden="true" />
      <div className="dev-desktop-base" aria-hidden="true" />
    </div>
  );
}

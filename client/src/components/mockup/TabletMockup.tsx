import "./deviceStyles.css";

interface TabletMockupProps {
  imageUrl?: string;
}

export function TabletMockup({ imageUrl }: TabletMockupProps) {
  return (
    <div className="dev-frame dev-tablet dev-bezel-gloss">
      {/* Camera + mic cluster */}
      <div className="dev-tablet-camera-wrap" aria-hidden="true">
        <div className="dev-tablet-camera" />
        <div className="dev-tablet-mic" />
      </div>

      {/* Side button */}
      <div className="dev-tablet-button" aria-hidden="true" />

      {/* Screen */}
      <div className="dev-screen dev-tablet-screen">
        {imageUrl ? (
          <img src={imageUrl} alt="Tablet Preview" />
        ) : (
          <div className="dev-screen-empty" />
        )}
      </div>

      {/* Home indicator */}
      <div className="dev-tablet-home" aria-hidden="true" />
    </div>
  );
}

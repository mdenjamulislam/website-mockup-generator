import "./deviceStyles.css";

interface LaptopMockupProps {
  imageUrl?: string;
}

export function LaptopMockup({ imageUrl }: LaptopMockupProps) {
  return (
    <div className="dev-frame dev-laptop">
      {/* Lid / screen housing */}
      <div className="dev-laptop-lid dev-bezel-gloss">
        <div className="dev-laptop-camera" aria-hidden="true" />
        <div className="dev-screen dev-laptop-screen">
          {imageUrl ? (
            <img src={imageUrl} alt="Laptop Preview" />
          ) : (
            <div className="dev-screen-empty" />
          )}
        </div>
      </div>

      {/* Thin hinge */}
      <div className="dev-laptop-hinge" aria-hidden="true" />

      {/* Keyboard deck */}
      <div className="dev-laptop-deck" aria-hidden="true">
        <div className="dev-laptop-keyboard" />
        <div className="dev-laptop-trackpad" />
        <div className="dev-laptop-foot" />
      </div>
    </div>
  );
}

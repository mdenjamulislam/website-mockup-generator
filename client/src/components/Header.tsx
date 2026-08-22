import { useServerHealth } from "../hooks/useServerHealth";

export function Header() {
  const { isHealthy } = useServerHealth();

  return (
    <header className="header" role="banner">
      <a href="/" className="header-logo" aria-label="Mockup Maker home">
        <div className="header-logo-icon" aria-hidden="true">🖥️</div>
        <div className="header-logo-text">
          <span className="header-logo-title">Mockup Maker</span>
          <span className="header-logo-subtitle">Website Screenshot Generator</span>
        </div>
      </a>

      {isHealthy !== null && (
        <div
          className="header-badge"
          role="status"
          aria-label={isHealthy ? "Server online" : "Server offline"}
        >
          <span
            className="header-badge-dot"
            style={
              isHealthy
                ? {}
                : { background: "var(--color-danger)", animationDuration: "0s" }
            }
          />
          {isHealthy ? "Server Online" : "Server Offline"}
        </div>
      )}
    </header>
  );
}

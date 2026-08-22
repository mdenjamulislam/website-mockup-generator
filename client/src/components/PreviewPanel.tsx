import type { MockupConfig } from "../types/index";
import { MockupCanvas } from "./mockup/MockupCanvas";

export type PreviewState =
  | { status: "idle" }
  | { status: "loading"; step: string; progress: number }
  | { status: "success"; imageUrl: string; isDownloading?: boolean }
  | { status: "error"; message: string };

interface PreviewPanelProps {
  state: PreviewState;
  config: MockupConfig;
  onRegenerate?: () => void;
}

export function PreviewPanel({ state, config, onRegenerate }: PreviewPanelProps) {
  return (
    <section className="card preview-section" aria-labelledby="preview-section-title">
      <div className="card-header">
        <div className="card-header-icon" aria-hidden="true">🖼️</div>
        <div className="card-header-content">
          <h2 className="card-title" id="preview-section-title">Mockup Preview</h2>
          <p className="card-subtitle">Your generated mockup will appear here</p>
        </div>
      </div>

      <div className="card-body preview-section">
        {state.status === "idle" && <IdleState />}
        {state.status === "loading" && (
          <LoadingState step={state.step} progress={state.progress} />
        )}
        {state.status === "success" && (
          <SuccessState imageUrl={state.imageUrl} config={config} />
        )}
        {state.status === "error" && (
          <ErrorState message={state.message} onRetry={onRegenerate} />
        )}
      </div>
    </section>
  );
}

function IdleState() {
  return (
    <div className="preview-empty" role="status" aria-label="No preview yet">
      <div className="preview-empty-icon" aria-hidden="true">🖥️</div>
      <p className="preview-empty-text">Your mockup will appear here</p>
      <p className="preview-empty-hint">
        Enter a URL above and click Generate Mockup to get started
      </p>
    </div>
  );
}

interface LoadingStateProps {
  step: string;
  progress: number;
}

function LoadingState({ step, progress }: LoadingStateProps) {
  return (
    <div className="preview-loading" role="status" aria-live="polite">
      <div className="preview-loading-spinner" aria-hidden="true" />
      <div>
        <p className="preview-loading-text">Generating your mockup…</p>
        <p className="preview-loading-step">{step}</p>
      </div>
      <div className="progress-bar-container" aria-label={`Progress: ${progress}%`}>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
}

interface SuccessStateProps {
  imageUrl: string;
  config: MockupConfig;
}

function SuccessState({ imageUrl, config }: SuccessStateProps) {
  return (
    <div className="preview-image-container animate-fadeIn" style={{ width: "100%", height: "100%" }}>
      <MockupCanvas config={config} imageUrl={imageUrl} />
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="preview-empty"
      role="alert"
      style={{ color: "var(--color-danger)" }}
    >
      <div className="preview-empty-icon" aria-hidden="true">⚠️</div>
      <p className="preview-empty-text">Something went wrong</p>
      <p
        className="preview-empty-hint"
        style={{ color: "var(--color-text-3)" }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          id="retry-btn"
          className="btn btn-secondary"
          onClick={onRetry}
          style={{ marginTop: "var(--space-4)" }}
        >
          ↺ Try Again
        </button>
      )}
    </div>
  );
}

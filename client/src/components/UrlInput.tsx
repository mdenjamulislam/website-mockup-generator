import { useState, type FormEvent } from "react";
import { isValidUrl, normalizeUrl } from "../utils/url.js";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  function validate(v: string): string {
    if (!v.trim()) return "Please enter a URL.";
    if (!isValidUrl(v)) return "Please enter a valid URL (e.g. https://example.com).";
    return "";
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (touched) setError(validate(e.target.value));
  }

  function handleBlur() {
    setTouched(true);
    setError(validate(value));
  }

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setTouched(true);
    const trimmed = value.trim();
    const err = validate(trimmed);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    onSubmit(normalizeUrl(trimmed));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const hasError = touched && !!error;

  return (
    <section className="card url-section" aria-labelledby="url-section-title">
      <div className="card-header">
        <div className="card-header-icon" aria-hidden="true">🔗</div>
        <div className="card-header-content">
          <h2 className="card-title" id="url-section-title">Enter Website URL</h2>
          <p className="card-subtitle">Paste any publicly accessible website URL</p>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate aria-label="URL submission form">
          <div className="url-input-wrapper">
            <div className="url-input-container">
              <span className="url-input-prefix" aria-hidden="true">🌐</span>
              <input
                id="url-input"
                type="url"
                className={`url-input${hasError ? " has-error" : ""}`}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                aria-label="Website URL"
                aria-describedby={hasError ? "url-error" : undefined}
                aria-invalid={hasError}
                disabled={isLoading}
                autoComplete="url"
                spellCheck={false}
              />
            </div>

            <button
              type="submit"
              id="generate-btn"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-icon">⏳</span>
                  Generating…
                </>
              ) : (
                <>
                  <span className="btn-icon">✨</span>
                  Generate Mockup
                </>
              )}
            </button>
          </div>

          {hasError && (
            <p id="url-error" className="url-error" role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

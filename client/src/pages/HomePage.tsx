import { useState, useCallback, useRef } from "react";
import { UrlInput } from "../components/UrlInput";
import { MockupConfigPanel } from "../components/MockupConfigPanel";
import { PreviewPanel, type PreviewState } from "../components/PreviewPanel";
import { StepsIndicator } from "../components/StepsIndicator";
import { useMockupConfig } from "../hooks/useMockupConfig";
import { generateMockup } from "../services/mockupService";

export function HomePage() {
  const { config, updateConfig, resetConfig } = useMockupConfig();
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });
  const lastUrlRef = useRef<string>("");

  const handleGenerate = useCallback(
    async (url: string) => {
      lastUrlRef.current = url;

      setPreview({ status: "loading", step: "Launching browser…", progress: 10 });

      setPreview({ status: "loading", step: "Capturing website screenshot…", progress: 50 });

      try {
        const result = await generateMockup(url, config);
        setPreview({ status: "success", imageUrl: result.imageUrl });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred.";
        setPreview({ status: "error", message });
      }
    },
    [config]
  );

  const handleRegenerate = useCallback(() => {
    if (lastUrlRef.current) {
      void handleGenerate(lastUrlRef.current);
    }
  }, [handleGenerate]);

  const currentStatus =
    preview.status === "idle"
      ? "idle"
      : preview.status === "loading"
        ? "loading"
        : preview.status === "success"
          ? "success"
          : "error";

  const handleDownloadMockup = useCallback(async (format: "png" | "webp" = "png") => {
    if (preview.status !== "success") return;
    setPreview(prev => ({ ...prev, isDownloading: true }) as PreviewState);
    
    try {
      // Get the blob from the object URL
      const response = await fetch(preview.imageUrl);
      const blob = await response.blob();
      
      // Send to composite API
      const formData = new FormData();
      formData.append("screenshot", blob, "screenshot.png");
      formData.append("config", JSON.stringify(config));
      formData.append("format", format);
      
      const compositeResponse = await fetch("/api/mockup/render", {
        method: "POST",
        body: formData,
      });
      
      if (!compositeResponse.ok) {
        throw new Error(`HTTP ${compositeResponse.status}`);
      }
      
      const finalBlob = await compositeResponse.blob();
      const finalUrl = URL.createObjectURL(finalBlob);
      
      // Download it
      const a = document.createElement("a");
      a.href = finalUrl;
      a.download = `website-mockup-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(finalUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to generate final mockup image.");
    } finally {
      setPreview(prev => ({ ...prev, isDownloading: false }) as PreviewState);
    }
  }, [preview, config]);

  return (
    <main id="main-content" className="app-content app-workspace">
      {/* Hero */}
      <section className="hero" aria-label="Application introduction" style={{ padding: "var(--space-8) var(--space-5) var(--space-4)" }}>
        <h1 className="hero-title" style={{ fontSize: "var(--text-4xl)" }}>
          Website Mockup <span className="hero-title-gradient">Generator</span>
        </h1>
        <p className="hero-description" style={{ fontSize: "var(--text-base)", maxWidth: "600px" }}>
          Enter a URL, capture a real screenshot, and generate a beautiful device mockup.
        </p>
      </section>

      {/* Controls */}
      <div className="sidebar" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <UrlInput
          onSubmit={handleGenerate}
          isLoading={preview.status === "loading"}
        />

        <MockupConfigPanel
          config={config}
          onChange={updateConfig}
          onReset={resetConfig}
          onDownload={handleDownloadMockup}
          isDownloading={preview.status === "success" && preview.isDownloading}
          hasMockup={preview.status === "success"}
        />
      </div>

      {/* Main Preview Area */}
      <div className="preview-area" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <PreviewPanel
          state={preview}
          config={config}
          onRegenerate={
            preview.status !== "idle" ? handleRegenerate : undefined
          }
        />
      </div>
    </main>
  );
}

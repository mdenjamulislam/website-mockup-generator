import { useState, useCallback, useRef, useEffect } from "react";
import { UrlInput } from "../components/UrlInput";
import { MockupConfigPanel } from "../components/MockupConfigPanel";
import { PreviewPanel, type PreviewState } from "../components/PreviewPanel";
import { MultiDeviceComposition } from "../components/mockup/MultiDeviceComposition";
import { useMockupConfig } from "../hooks/useMockupConfig";
import { useCompositionConfig } from "../hooks/useCompositionConfig";
import { CompositionConfigPanel } from "../components/CompositionConfigPanel";
import { generateMockup, generateMultiDeviceMockup, downloadMultiDeviceMockup } from "../services/mockupService";
import type { MultiDeviceScreenshots } from "../types/index";

export function HomePage() {
  const { config, updateConfig, resetConfig } = useMockupConfig();
  const comp = useCompositionConfig();
  const [preview, setPreview] = useState<PreviewState & { multiProgress?: Record<string, "pending" | "success" | "error"> }>({ status: "idle" });
  const [multiScreenshots, setMultiScreenshots] = useState<MultiDeviceScreenshots | null>(null);
  const [isDownloadingMulti, setIsDownloadingMulti] = useState(false);
  const lastUrlRef = useRef<string>("");

  // Cleanup object URLs when component unmounts or before new generation
  useEffect(() => {
    return () => {
      if (multiScreenshots) {
        Object.values(multiScreenshots).forEach(result => {
          if (result.success && result.imageUrl) {
            URL.revokeObjectURL(result.imageUrl);
          }
        });
      }
    };
  }, [multiScreenshots]);

  const handleGenerate = useCallback(
    async (url: string) => {
      lastUrlRef.current = url;

      const initialProgress: Record<string, "pending"> = {
        desktop: "pending",
        laptop: "pending",
        tablet: "pending",
        mobile: "pending"
      };

      setPreview({ 
        status: "loading", 
        step: "Rendering website...", 
        progress: 10,
        multiProgress: initialProgress 
      });
      
      // Clear previous multi-device renders
      setMultiScreenshots(null);

      try {
        const [singleResult, multiResult] = await Promise.all([
          generateMockup(url, config),
          generateMultiDeviceMockup(url, (deviceId, success) => {
            setPreview(prev => {
              if (prev.status !== "loading") return prev;
              return {
                ...prev,
                multiProgress: {
                  ...prev.multiProgress,
                  [deviceId]: success ? "success" : "error"
                }
              };
            });
          })
        ]);
        
        setPreview({ status: "loading", step: "Creating mockup...", progress: 90 });
        
        setMultiScreenshots(multiResult);
        setPreview({ status: "success", imageUrl: singleResult.imageUrl });
      } catch (err: any) {
        setPreview({
          status: "error",
          message: err.message || "Failed to generate mockup.",
        });
      }
    },
    [config]
  );

  const handleDownloadMultiDeviceMockup = useCallback(async (format: "png" | "webp") => {
    if (!multiScreenshots) return;
    setIsDownloadingMulti(true);
    try {
      await downloadMultiDeviceMockup(multiScreenshots, comp.config, format);
    } catch (err: any) {
      alert("Failed to download mockup: " + (err.message || "Unknown error"));
    } finally {
      setIsDownloadingMulti(false);
    }
  }, [multiScreenshots, comp.config]);

  const handleRegenerate = useCallback(() => {
    if (lastUrlRef.current) {
      void handleGenerate(lastUrlRef.current);
    }
  }, [handleGenerate]);

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
      {/* URL Input at Top */}
      <div style={{ maxWidth: "1000px", margin: "0 auto var(--space-6)", width: "100%" }}>
        <UrlInput
          onSubmit={handleGenerate}
          isLoading={preview.status === "loading"}
        />
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(300px, 1fr) minmax(300px, 2fr)", 
        gap: "var(--space-6)",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
        alignItems: "start"
      }}>
        {/* Controls */}
        <div className="sidebar" style={{ width: "100%" }}>
          {!multiScreenshots && (
            <MockupConfigPanel
              config={config}
              onChange={updateConfig}
              onReset={resetConfig}
              onDownload={handleDownloadMockup}
              isDownloading={preview.status === "success" && preview.isDownloading}
              hasMockup={preview.status === "success"}
            />
          )}

          {multiScreenshots && (
            <CompositionConfigPanel
              config={comp.config}
              updateDeviceLayer={comp.updateDeviceLayer}
              updateCanvas={comp.updateCanvas}
              applyPreset={comp.applyPreset}
              onDownload={handleDownloadMultiDeviceMockup}
              isDownloading={isDownloadingMulti}
            />
          )}
        </div>

        {/* Main Preview Area */}
        <div className="preview-area" style={{ width: "100%", minWidth: 0 }}>
          {(!multiScreenshots || preview.status === "loading" || preview.status === "error") && (
            <PreviewPanel
              state={preview}
              config={config}
              onRegenerate={
                preview.status !== "idle" ? handleRegenerate : undefined
              }
            />
          )}
          
          {multiScreenshots && preview.status === "success" && (
            <MultiDeviceComposition screenshots={multiScreenshots} config={comp.config} />
          )}
        </div>
      </div>
    </main>
  );
}

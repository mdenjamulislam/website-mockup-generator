import { useState, useCallback } from "react";
import type { MockupConfig } from "../types/index";

export const DEFAULT_CONFIG: MockupConfig = {
  deviceType: "browser",
  theme: "light",
  showBrowserChrome: true,
  backgroundColor: "#1a1a2e",
  padding: 60,
  shadow: true,
  rounded: true,
  scale: 1,
  positionX: 0,
  positionY: 0,
  width: 1440,
  height: 900,
  canvasWidth: 1600,
  canvasHeight: 1200,
};

export function useMockupConfig() {
  const [config, setConfig] = useState<MockupConfig>(DEFAULT_CONFIG);

  const updateConfig = useCallback(
    <K extends keyof MockupConfig>(key: K, value: MockupConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return { config, updateConfig, resetConfig };
}

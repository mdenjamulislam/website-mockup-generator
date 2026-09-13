import { useState, useCallback } from "react";
import { CompositionConfig, DeviceLayerConfig, CanvasConfig, PresetId, PRESETS } from "../types/composition";
import type { DeviceId } from "../types/index";

export function useCompositionConfig() {
  const [config, setConfig] = useState<CompositionConfig>(PRESETS["professional-showcase"]);

  const updateDeviceLayer = useCallback(
    (deviceId: DeviceId, partial: Partial<DeviceLayerConfig>) => {
      setConfig((prev) => ({
        ...prev,
        devices: {
          ...prev.devices,
          [deviceId]: {
            ...prev.devices[deviceId],
            ...partial,
          },
        },
      }));
    },
    []
  );

  const updateCanvas = useCallback((partial: Partial<CanvasConfig>) => {
    setConfig((prev) => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        ...partial,
      },
    }));
  }, []);

  const applyPreset = useCallback((presetId: PresetId) => {
    setConfig(PRESETS[presetId]);
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(PRESETS["professional-showcase"]);
  }, []);

  return {
    config,
    updateDeviceLayer,
    updateCanvas,
    applyPreset,
    resetConfig,
  };
}

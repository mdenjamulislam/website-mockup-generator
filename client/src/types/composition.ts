import type { DeviceId } from "./index";

export interface DeviceLayerConfig {
  visible: boolean;
  scale: number;      // 0.2 - 3.0
  x: number;          // absolute px center point on canvas
  y: number;
  rotation: number;   // -15 to +15 degrees
  zIndex: number;
  shadow: boolean;
  shadowBlur: number;
  shadowSpread: number;
  shadowOpacity: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  transparent: boolean;
  padding: number;
}

export interface CompositionConfig {
  preset: PresetId;
  canvas: CanvasConfig;
  devices: Record<DeviceId, DeviceLayerConfig>;
}

export type PresetId =
  | "professional-showcase"
  | "desktop-focus"
  | "balanced-devices"
  | "laptop-focus"
  | "mobile-focus";

// ── Shadow defaults ───────────────────────────────────────────────────────────
const HERO_SHADOW = {
  shadow: true,
  shadowBlur: 80,
  shadowSpread: 0,
  shadowOpacity: 0.28,
};

const DEFAULT_SHADOW = {
  shadow: true,
  shadowBlur: 55,
  shadowSpread: 0,
  shadowOpacity: 0.22,
};

const ACCENT_SHADOW = {
  shadow: true,
  shadowBlur: 40,
  shadowSpread: 0,
  shadowOpacity: 0.18,
};

const NO_SHADOW = {
  shadow: false,
  shadowBlur: 40,
  shadowSpread: 0,
  shadowOpacity: 0,
};

// ── Canvas ────────────────────────────────────────────────────────────────────
// Premium clean presentation canvas
const DEFAULT_CANVAS: CanvasConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: "#f0f2f5",
  transparent: false,
  padding: 80,
};

// ── Library device intrinsic sizes (CSS px, unscaled) ────────────────────────
// Desktop:  ~920 × 570  (890 screen width + keyboard stand image ~900px wide)
// Laptop:   ~870 × 560  (700 screen + keyboard asset ~870px wide, lid ~480px h)
// Tablet:   ~492 × 680  (480 screen + ~6px outer border, 640 screen + ~20px bezels)
// Mobile:   ~332 × 692  (320 screen + ~6px outer border, 640 screen + ~48px bezels + notch)

// ============================================================
// DEFAULT MOCKUP LAYOUT — "Professional Showcase" preset
//
// This is the centralized default configuration for the
// multi-device composition. All of the following must stay
// in sync:
//   • Initial application state  (useCompositionConfig)
//   • "Professional Showcase" preset  (applyPreset)
//   • Reset Layout button  (resetConfig)
//   • Export / canvas rendering
//
// Visual hierarchy (back → front):
//   desktop   z:10  hero, upper-center (scale 1.20)
//   tablet    z:20  middle-back, right side (scale 0.65)
//   laptop    z:30  middle-front, left side (scale 0.75)
//   mobile    z:40  front accent, right-center (scale 0.45)
//
// Canvas = 1920×1080 internal coordinate space.
// Device centers (x, y) are absolute px in that space.
// DO NOT convert these to percentages or viewport units.
// ============================================================

/** Central defaults object — single source of truth. */
export const DEFAULT_MOCKUP_LAYOUT = {
  desktop: {
    visible: true,
    scale: 1.20,
    rotation: 0,
    x: 1000,
    y: 560,
    zIndex: 10,
  },
  laptop: {
    visible: true,
    scale: 0.75,
    rotation: 0,
    x: 460,
    y: 770,
    zIndex: 30,
  },
  tablet: {
    visible: true,
    scale: 0.65,
    rotation: 0,
    x: 1580,
    y: 700,
    zIndex: 20,
  },
  mobile: {
    visible: true,
    scale: 0.45,
    rotation: 0,
    x: 1420,
    y: 870,
    zIndex: 40,
  },
} as const satisfies Record<string, {
  visible: boolean;
  scale: number;
  rotation: number;
  x: number;
  y: number;
  zIndex: number;
}>;

export const PRESETS: Record<PresetId, CompositionConfig> = {
  "professional-showcase": {
    preset: "professional-showcase",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: {
        visible: DEFAULT_MOCKUP_LAYOUT.desktop.visible,
        scale:    DEFAULT_MOCKUP_LAYOUT.desktop.scale,
        x:        DEFAULT_MOCKUP_LAYOUT.desktop.x,
        y:        DEFAULT_MOCKUP_LAYOUT.desktop.y,
        rotation: DEFAULT_MOCKUP_LAYOUT.desktop.rotation,
        zIndex:   DEFAULT_MOCKUP_LAYOUT.desktop.zIndex,
        ...HERO_SHADOW,
      },
      laptop: {
        visible: DEFAULT_MOCKUP_LAYOUT.laptop.visible,
        scale:    DEFAULT_MOCKUP_LAYOUT.laptop.scale,
        x:        DEFAULT_MOCKUP_LAYOUT.laptop.x,
        y:        DEFAULT_MOCKUP_LAYOUT.laptop.y,
        rotation: DEFAULT_MOCKUP_LAYOUT.laptop.rotation,
        zIndex:   DEFAULT_MOCKUP_LAYOUT.laptop.zIndex,
        ...DEFAULT_SHADOW,
      },
      tablet: {
        visible: DEFAULT_MOCKUP_LAYOUT.tablet.visible,
        scale:    DEFAULT_MOCKUP_LAYOUT.tablet.scale,
        x:        DEFAULT_MOCKUP_LAYOUT.tablet.x,
        y:        DEFAULT_MOCKUP_LAYOUT.tablet.y,
        rotation: DEFAULT_MOCKUP_LAYOUT.tablet.rotation,
        zIndex:   DEFAULT_MOCKUP_LAYOUT.tablet.zIndex,
        ...DEFAULT_SHADOW,
      },
      mobile: {
        visible: DEFAULT_MOCKUP_LAYOUT.mobile.visible,
        scale:    DEFAULT_MOCKUP_LAYOUT.mobile.scale,
        x:        DEFAULT_MOCKUP_LAYOUT.mobile.x,
        y:        DEFAULT_MOCKUP_LAYOUT.mobile.y,
        rotation: DEFAULT_MOCKUP_LAYOUT.mobile.rotation,
        zIndex:   DEFAULT_MOCKUP_LAYOUT.mobile.zIndex,
        ...ACCENT_SHADOW,
      },
    },
  },

  // ── Desktop Focus ────────────────────────────────────────
  "desktop-focus": {
    preset: "desktop-focus",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: {
        visible: true,
        scale: 0.95,
        x: 960,
        y: 500,
        rotation: 0,
        zIndex: 10,
        ...HERO_SHADOW,
      },
      laptop: { visible: false, scale: 0.52, x: 440, y: 820, rotation: 3, zIndex: 10, ...NO_SHADOW },
      tablet: { visible: false, scale: 0.40, x: 1520, y: 800, rotation: -4, zIndex: 10, ...NO_SHADOW },
      mobile: { visible: false, scale: 0.20, x: 960, y: 930, rotation: -2, zIndex: 10, ...NO_SHADOW },
    },
  },

  // ── Balanced Devices ─────────────────────────────────────
  "balanced-devices": {
    preset: "balanced-devices",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: {
        visible: true,
        scale: 0.80,
        x: 960,
        y: 440,
        rotation: 0,
        zIndex: 10,
        ...HERO_SHADOW,
      },
      laptop: {
        visible: true,
        scale: 0.58,
        x: 380,
        y: 830,
        rotation: 4,
        zIndex: 30,
        ...DEFAULT_SHADOW,
      },
      tablet: {
        visible: true,
        scale: 0.46,
        x: 1540,
        y: 800,
        rotation: -5,
        zIndex: 20,
        ...DEFAULT_SHADOW,
      },
      mobile: {
        visible: true,
        scale: 0.24,
        x: 960,
        y: 940,
        rotation: 0,
        zIndex: 40,
        ...ACCENT_SHADOW,
      },
    },
  },

  // ── Laptop Focus ─────────────────────────────────────────
  "laptop-focus": {
    preset: "laptop-focus",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: { visible: false, scale: 0.88, x: 960, y: 460, rotation: 0, zIndex: 10, ...NO_SHADOW },
      laptop: {
        visible: true,
        scale: 0.80,
        x: 860,
        y: 500,
        rotation: 0,
        zIndex: 10,
        ...HERO_SHADOW,
      },
      tablet: { visible: false, scale: 0.40, x: 1520, y: 800, rotation: -4, zIndex: 10, ...NO_SHADOW },
      mobile: {
        visible: true,
        scale: 0.30,
        x: 1480,
        y: 720,
        rotation: -5,
        zIndex: 20,
        ...DEFAULT_SHADOW,
      },
    },
  },

  // ── Mobile Focus ─────────────────────────────────────────
  "mobile-focus": {
    preset: "mobile-focus",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: { visible: false, scale: 0.88, x: 960, y: 460, rotation: 0, zIndex: 10, ...NO_SHADOW },
      laptop: { visible: false, scale: 0.52, x: 440, y: 820, rotation: 3, zIndex: 10, ...NO_SHADOW },
      tablet: {
        visible: true,
        scale: 0.70,
        x: 560,
        y: 520,
        rotation: 2,
        zIndex: 10,
        ...HERO_SHADOW,
      },
      mobile: {
        visible: true,
        scale: 0.55,
        x: 1280,
        y: 520,
        rotation: -3,
        zIndex: 20,
        ...HERO_SHADOW,
      },
    },
  },
};

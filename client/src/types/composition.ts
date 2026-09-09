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
  | "all"
  | "desktop-laptop"
  | "desktop-tablet-mobile"
  | "laptop-mobile"
  | "mobile-tablet"
  | "desktop-focus";

// ── Shadow defaults ───────────────────────────────────────────────────────────
// Richer shadow for premium look: deeper blur, slightly more opacity
const DEFAULT_SHADOW = {
  shadow: true,
  shadowBlur: 60,
  shadowSpread: 0,
  shadowOpacity: 0.22,
};

const LIGHT_SHADOW = {
  shadow: true,
  shadowBlur: 40,
  shadowSpread: 0,
  shadowOpacity: 0.18,
};

// ── Canvas ────────────────────────────────────────────────────────────────────
// Premium neutral warm-white canvas (#f5f5f5)
const DEFAULT_CANVAS: CanvasConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: "#f4f4f6",
  transparent: false,
  padding: 80,
};

// ============================================================
// "All Devices" — flagship preset
//
// Visual hierarchy (back → front):
//   desktop  z:10  large, slightly upper-center
//   laptop   z:30  0.52 scale, right side, bottom aligned
//   tablet   z:20  0.42 scale, left side, bottom aligned, slight rotation
//   mobile   z:40  0.38 scale, foreground center-left, slight rotation
//
// Canvas = 1920×1080 internal coord space.
// Device intrinsic sizes (CSS px):
//   desktop  1440 × ~1062 (screen 900 + chin 20 + neck 80 + base 14 = 1014 approx, display 960)
//   laptop   1240 × ~830  (lid 766 + hinge 5 + deck ~106)
//   tablet    600 × ~884  (28 top + 28 bot padding + 800 screen + 14 home)
//   mobile    340 × ~776  (14 top + 14 bot + 720 screen + 30 home)
// ============================================================
export const PRESETS: Record<PresetId, CompositionConfig> = {
  all: {
    preset: "all",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: {
        visible: true,
        scale: 0.72,          // large but fits canvas
        x: 880,               // slightly left of center so right side has laptop
        y: 480,               // upper half
        rotation: 0,
        zIndex: 10,
        ...DEFAULT_SHADOW,
      },
      laptop: {
        visible: true,
        scale: 0.42,          // prominent secondary
        x: 1460,              // right side
        y: 760,               // bottom-anchored
        rotation: -2,         // very subtle natural tilt
        zIndex: 30,
        ...DEFAULT_SHADOW,
      },
      tablet: {
        visible: true,
        scale: 0.32,          // smaller tertiary
        x: 420,               // left side
        y: 760,               // bottom-anchored like laptop
        rotation: 3,          // slight outward tilt
        zIndex: 20,
        ...DEFAULT_SHADOW,
      },
      mobile: {
        visible: true,
        scale: 0.28,          // smallest, foreground accent
        x: 760,               // front-center-left
        y: 840,               // lowest = most "in front"
        rotation: -4,         // slight lean
        zIndex: 40,
        ...DEFAULT_SHADOW,
      },
    },
  },

  // ── Desktop + Laptop ─────────────────────────────────────
  "desktop-laptop": {
    preset: "desktop-laptop",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: {
        visible: true,
        scale: 0.82,
        x: 820,
        y: 460,
        rotation: 0,
        zIndex: 10,
        ...DEFAULT_SHADOW,
      },
      laptop: {
        visible: true,
        scale: 0.56,
        x: 1460,
        y: 740,
        rotation: -2,
        zIndex: 20,
        ...DEFAULT_SHADOW,
      },
      tablet: { visible: false, scale: 0.32, x: 420, y: 760, rotation: 3, zIndex: 10, ...LIGHT_SHADOW },
      mobile: { visible: false, scale: 0.28, x: 760, y: 840, rotation: -4, zIndex: 10, ...LIGHT_SHADOW },
    },
  },

  // ── Desktop + Tablet + Mobile ─────────────────────────────
  "desktop-tablet-mobile": {
    preset: "desktop-tablet-mobile",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: {
        visible: true,
        scale: 0.76,
        x: 920,
        y: 460,
        rotation: 0,
        zIndex: 10,
        ...DEFAULT_SHADOW,
      },
      laptop: { visible: false, scale: 0.42, x: 1460, y: 760, rotation: -2, zIndex: 10, ...LIGHT_SHADOW },
      tablet: {
        visible: true,
        scale: 0.36,
        x: 430,
        y: 740,
        rotation: 5,
        zIndex: 20,
        ...DEFAULT_SHADOW,
      },
      mobile: {
        visible: true,
        scale: 0.30,
        x: 1440,
        y: 800,
        rotation: -5,
        zIndex: 30,
        ...DEFAULT_SHADOW,
      },
    },
  },

  // ── Laptop + Mobile ──────────────────────────────────────
  "laptop-mobile": {
    preset: "laptop-mobile",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: { visible: false, scale: 0.72, x: 880, y: 480, rotation: 0, zIndex: 10, ...LIGHT_SHADOW },
      laptop: {
        visible: true,
        scale: 0.68,
        x: 860,
        y: 520,
        rotation: 0,
        zIndex: 10,
        ...DEFAULT_SHADOW,
      },
      tablet: { visible: false, scale: 0.32, x: 420, y: 760, rotation: 3, zIndex: 10, ...LIGHT_SHADOW },
      mobile: {
        visible: true,
        scale: 0.36,
        x: 1470,
        y: 680,
        rotation: -5,
        zIndex: 20,
        ...DEFAULT_SHADOW,
      },
    },
  },

  // ── Mobile + Tablet ──────────────────────────────────────
  "mobile-tablet": {
    preset: "mobile-tablet",
    canvas: DEFAULT_CANVAS,
    devices: {
      desktop: { visible: false, scale: 0.72, x: 880, y: 480, rotation: 0, zIndex: 10, ...LIGHT_SHADOW },
      laptop: { visible: false, scale: 0.42, x: 1460, y: 760, rotation: -2, zIndex: 10, ...LIGHT_SHADOW },
      tablet: {
        visible: true,
        scale: 0.58,
        x: 1120,
        y: 520,
        rotation: -2,
        zIndex: 10,
        ...DEFAULT_SHADOW,
      },
      mobile: {
        visible: true,
        scale: 0.46,
        x: 620,
        y: 560,
        rotation: 3,
        zIndex: 20,
        ...DEFAULT_SHADOW,
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
        scale: 0.88,
        x: 960,
        y: 500,
        rotation: 0,
        zIndex: 10,
        ...DEFAULT_SHADOW,
      },
      laptop: { visible: false, scale: 0.42, x: 1460, y: 760, rotation: -2, zIndex: 10, ...LIGHT_SHADOW },
      tablet: { visible: false, scale: 0.32, x: 420, y: 760, rotation: 3, zIndex: 10, ...LIGHT_SHADOW },
      mobile: { visible: false, scale: 0.28, x: 760, y: 840, rotation: -4, zIndex: 10, ...LIGHT_SHADOW },
    },
  },
};

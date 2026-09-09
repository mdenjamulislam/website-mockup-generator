import sharp from "sharp";
import type { MultiCompositeRequest } from "../schemas/multiCompositeSchema.js";
import type { DeviceId } from "../config/devicePresets.js";

// ── Device frame specs (must match CSS pixel dimensions in deviceStyles.css) ──
// These are the *unscaled* intrinsic pixel sizes of each fully-rendered device.
interface DeviceFrameSpec {
  contentW: number;   // screenshot/screen width
  contentH: number;   // screenshot/screen height
  frameW: number;     // full device width including side bezels
  frameH: number;     // full device height including all chrome
  screenOffsetX: number;  // left edge of screen within frameW
  screenOffsetY: number;  // top edge of screen within frameH
  screenRx: number;   // screen corner radius
}

const DEVICE_SPECS: Record<DeviceId, DeviceFrameSpec> = {
  // CSS: .dev-desktop width=1440, display padding 18/16/20, screen 900h, camera top 8+7
  // display height = 18(top) + 7(cam) + 2(gap) + 900(screen) + 20(chin) = 947; neck=80; base=14
  desktop: {
    contentW: 1440,
    contentH: 900,
    frameW: 1440,
    frameH: 947 + 80 + 14, // 1041
    screenOffsetX: 16,
    screenOffsetY: 38,      // 18 top-pad + 8 camera gap + 7 camera h + 5 gap ≈ 38
    screenRx: 4,
  },
  // CSS: .dev-laptop width=1200, lid padding 14; deck width=1240 (margin-left=-20)
  // lid: 14(top) + 6(camera) + 6(gap) + 750(screen) = 776; hinge=5; deck=42+30+10+18 padding ≈ 110
  laptop: {
    contentW: 1200,
    contentH: 750,
    frameW: 1240,
    frameH: 776 + 5 + 110, // 891
    screenOffsetX: 34,      // (1240-1200)/2 + 14 = 34
    screenOffsetY: 26,      // 14(top-pad) + 6(camera) + 6
    screenRx: 3,
  },
  // CSS: .dev-tablet width=600, padding 28/22, screen h=800; camera cluster top=13+8+5; home indicator bottom
  // frameH = 28(top) + 800(screen) + 28(bottom) = 856
  tablet: {
    contentW: 556,          // 600 - 22*2 side padding
    contentH: 800,
    frameW: 600,
    frameH: 856,
    screenOffsetX: 22,
    screenOffsetY: 28,
    screenRx: 14,
  },
  // CSS: .dev-mobile width=340, padding 14/12, screen h=720; dynIsland top=16h=30
  // frameH = 14(top) + 720(screen) + 14(bottom) = 748
  mobile: {
    contentW: 316,          // 340 - 12*2
    contentH: 720,
    frameW: 340,
    frameH: 748,
    screenOffsetX: 12,
    screenOffsetY: 14,
    screenRx: 38,
  },
};

// ── SVG device frame builders ─────────────────────────────────────────────────

function buildDesktopSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch } = spec;
  const neckY = sy + ch + 20 + 20; // after screen + chin
  const baseY = neckY + 80;
  const baseW = 380;
  const neckW = 140;
  const neckX = (frameW - neckW) / 2;
  const baseX = (frameW - baseW) / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <defs>
    <linearGradient id="deskDisplay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="deskNeck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e2e2e"/>
      <stop offset="100%" stop-color="#3a3a3a"/>
    </linearGradient>
    <linearGradient id="deskBase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a3a3a"/>
      <stop offset="100%" stop-color="#2a2a2a"/>
    </linearGradient>
    <linearGradient id="deskGloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <!-- Display housing -->
  <rect x="0" y="0" width="${frameW}" height="${sy + ch + 40}" rx="20" ry="20"
        fill="url(#deskDisplay)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <!-- Gloss strip -->
  <rect x="${frameW * 0.1}" y="1" width="${frameW * 0.8}" height="2" rx="1"
        fill="rgba(255,255,255,0.12)"/>
  <!-- Camera -->
  <circle cx="${frameW / 2}" cy="12" r="4" fill="#111" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <circle cx="${frameW / 2 - 1}" cy="11" r="1.5" fill="rgba(255,255,255,0.15)"/>
  <!-- Screen bezel cut-out (image composited here by sharp) -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="4" fill="#0a0a0f"/>
  <!-- Chin logo -->
  <circle cx="${frameW / 2}" cy="${sy + ch + 12}" r="7" fill="rgba(255,255,255,0.12)"/>

  <!-- Neck (trapezoid) -->
  <polygon points="${neckX + neckW * 0.2},${neckY} ${neckX + neckW * 0.8},${neckY} ${neckX + neckW},${baseY} ${neckX},${baseY}"
           fill="url(#deskNeck)"/>
  <!-- Base plate -->
  <rect x="${baseX}" y="${baseY}" width="${baseW}" height="14" rx="7"
        fill="url(#deskBase)" stroke="#1a1a1a" stroke-width="2"/>
</svg>`;
}

function buildLaptopSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch } = spec;
  const lidH = sy + ch + 0; // lid bottom = just below screen
  const hingeY = lidH;
  const deckY = hingeY + 5;
  const deckH = frameH - deckY;
  const lidX = (frameW - 1200) / 2; // lid is 1200 centered in 1240

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <defs>
    <linearGradient id="lapLid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c2c2c"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
    <linearGradient id="lapDeck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#282828"/>
      <stop offset="100%" stop-color="#1e1e1e"/>
    </linearGradient>
  </defs>

  <!-- Lid -->
  <rect x="${lidX}" y="0" width="1200" height="${lidH}" rx="16" ry="16"
        fill="url(#lapLid)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <!-- Lid gloss -->
  <rect x="${lidX + 1200 * 0.1}" y="1" width="${1200 * 0.8}" height="2" rx="1"
        fill="rgba(255,255,255,0.10)"/>
  <!-- Camera -->
  <circle cx="${frameW / 2}" cy="9" r="3.5" fill="#111" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <circle cx="${frameW / 2 - 1}" cy="8" r="1.5" fill="rgba(255,255,255,0.15)"/>
  <!-- Screen area -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="3" fill="#0a0a0f"/>

  <!-- Hinge -->
  <rect x="0" y="${hingeY}" width="${frameW}" height="5" fill="#111"/>

  <!-- Keyboard deck -->
  <rect x="0" y="${deckY}" width="${frameW}" height="${deckH}" rx="0"
        fill="url(#lapDeck)" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <!-- Keyboard texture hint -->
  <rect x="${frameW * 0.05}" y="${deckY + 10}" width="${frameW * 0.9}" height="42"
        rx="4" fill="rgba(0,0,0,0.25)"/>
  <!-- Trackpad -->
  <rect x="${(frameW - 260) / 2}" y="${deckY + 60}" width="260" height="30"
        rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <!-- Bottom foot strip -->
  <rect x="0" y="${frameH - 10}" width="${frameW}" height="10" rx="0"
        fill="rgba(0,0,0,0.3)"/>
  <rect x="0" y="${frameH - 10}" width="${frameW}" height="10"
        rx="16" fill="rgba(0,0,0,0.1)"/>
</svg>`;
}

function buildTabletSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch, screenRx } = spec;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <defs>
    <linearGradient id="tabBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#282828"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
  </defs>

  <!-- Body -->
  <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="40" ry="40"
        fill="url(#tabBody)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <!-- Gloss -->
  <rect x="${frameW * 0.15}" y="1" width="${frameW * 0.7}" height="2" rx="1"
        fill="rgba(255,255,255,0.10)"/>
  <!-- Camera -->
  <circle cx="${frameW / 2 - 6}" cy="${sy / 2}" r="5" fill="#080808" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <circle cx="${frameW / 2 - 7}" cy="${sy / 2 - 1}" r="2" fill="rgba(255,255,255,0.15)"/>
  <!-- Mic -->
  <circle cx="${frameW / 2 + 6}" cy="${sy / 2}" r="3" fill="#0a0a0a" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <!-- Side button -->
  <rect x="${frameW - 2}" y="120" width="4" height="40" rx="2" fill="#333"/>
  <!-- Screen -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="${screenRx}" fill="#0a0a0f"/>
  <!-- Home indicator -->
  <rect x="${(frameW - 100) / 2}" y="${frameH - 12}" width="100" height="4" rx="2"
        fill="rgba(255,255,255,0.15)"/>
</svg>`;
}

function buildMobileSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch, screenRx } = spec;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <defs>
    <linearGradient id="mobBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c2c2c"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
  </defs>

  <!-- Body -->
  <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="50" ry="50"
        fill="url(#mobBody)" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
  <!-- Side gloss highlights -->
  <rect x="1" y="60" width="2" height="${frameH - 120}" rx="1"
        fill="rgba(255,255,255,0.06)"/>
  <rect x="${frameW - 3}" y="60" width="2" height="${frameH - 120}" rx="1"
        fill="rgba(255,255,255,0.06)"/>
  <!-- Gloss top -->
  <rect x="${frameW * 0.2}" y="1" width="${frameW * 0.6}" height="2" rx="1"
        fill="rgba(255,255,255,0.12)"/>

  <!-- Dynamic island -->
  <rect x="${(frameW - 110) / 2}" y="16" width="110" height="30" rx="16"
        fill="#000"/>

  <!-- Volume up -->
  <rect x="-3" y="100" width="4" height="34" rx="2" fill="#2a2a2a"/>
  <!-- Volume down -->
  <rect x="-3" y="148" width="4" height="34" rx="2" fill="#2a2a2a"/>
  <!-- Power -->
  <rect x="${frameW - 1}" y="120" width="4" height="50" rx="2" fill="#2a2a2a"/>

  <!-- Screen -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="${screenRx}" fill="#0a0a0f"/>
  <!-- Home indicator -->
  <rect x="${(frameW - 100) / 2}" y="${frameH - 10}" width="100" height="4" rx="2"
        fill="rgba(255,255,255,0.18)"/>
</svg>`;
}

const SVG_BUILDERS: Record<DeviceId, (spec: DeviceFrameSpec) => string> = {
  desktop: buildDesktopSvg,
  laptop: buildLaptopSvg,
  tablet: buildTabletSvg,
  mobile: buildMobileSvg,
};

// ── Build a device frame with the screenshot embedded ─────────────────────────

async function buildDeviceFrame(deviceId: DeviceId, imageBuffer: Buffer): Promise<Buffer> {
  const spec = DEVICE_SPECS[deviceId];
  const svgString = SVG_BUILDERS[deviceId](spec);

  // Resize screenshot to fit screen area exactly
  const roundedMask = Buffer.from(
    `<svg><rect x="0" y="0" width="${spec.contentW}" height="${spec.contentH}" rx="${spec.screenRx}" ry="${spec.screenRx}"/></svg>`
  );
  const screenBuffer = await sharp(imageBuffer)
    .resize(spec.contentW, spec.contentH, { fit: "cover", position: "top" })
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // Composite the SVG frame + screenshot together
  return sharp(Buffer.from(svgString))
    .composite([
      { input: screenBuffer, left: spec.screenOffsetX, top: spec.screenOffsetY }
    ])
    .png()
    .toBuffer();
}

// ── Apply transforms (scale, rotation, shadow) ────────────────────────────────

async function applyTransforms(
  frameBuffer: Buffer,
  layer: MultiCompositeRequest["configuration"]["devices"]["desktop"]
): Promise<{ buffer: Buffer; cx: number; cy: number }> {
  const meta = await sharp(frameBuffer).metadata();
  const origW = meta.width!;
  const origH = meta.height!;

  // 1. Scale
  const scaledW = Math.max(1, Math.round(origW * layer.scale));
  const scaledH = Math.max(1, Math.round(origH * layer.scale));
  let buf = await sharp(frameBuffer)
    .resize(scaledW, scaledH)
    .png()
    .toBuffer();

  // 2. Rotate (sharp rotates around center, adds transparent padding)
  if (layer.rotation !== 0) {
    buf = await sharp(buf)
      .rotate(layer.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }

  const rotMeta = await sharp(buf).metadata();
  const rotW = rotMeta.width!;
  const rotH = rotMeta.height!;

  // 3. Shadow
  if (layer.shadow && layer.shadowOpacity > 0) {
    const b64 = buf.toString("base64");
    const pad = Math.ceil(layer.shadowBlur * 2.5);
    const svgW = rotW + pad * 2;
    const svgH = rotH + pad * 2;
    const shadowSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${layer.shadowBlur * 0.4}" stdDeviation="${layer.shadowBlur * 0.5}"
        flood-color="rgba(0,0,0,${layer.shadowOpacity})"/>
    </filter>
  </defs>
  <image href="data:image/png;base64,${b64}" x="${pad}" y="${pad}"
         width="${rotW}" height="${rotH}" filter="url(#shadow)"/>
</svg>`;
    buf = await sharp(Buffer.from(shadowSvg)).png().toBuffer();
    const shadowMeta = await sharp(buf).metadata();
    return {
      buffer: buf,
      cx: Math.round(shadowMeta.width! / 2),
      cy: Math.round(shadowMeta.height! / 2),
    };
  }

  return {
    buffer: buf,
    cx: Math.round(rotW / 2),
    cy: Math.round(rotH / 2),
  };
}

// ── Main compositor ───────────────────────────────────────────────────────────

export async function renderMultiDeviceComposition(request: MultiCompositeRequest): Promise<Buffer> {
  const { configuration, screenshots, format } = request;
  const { width, height, backgroundColor, transparent } = configuration.canvas;

  const layers: Array<{ buffer: Buffer; left: number; top: number; zIndex: number }> = [];

  const deviceOrder: DeviceId[] = ["desktop", "laptop", "tablet", "mobile"];

  await Promise.all(
    deviceOrder.map(async (deviceId) => {
      const layerConf = configuration.devices[deviceId];
      if (!layerConf.visible) return;

      const b64 = screenshots[deviceId as keyof typeof screenshots];
      if (!b64) return;

      const imgBuf = Buffer.from(b64, "base64");
      const frameBuf = await buildDeviceFrame(deviceId, imgBuf);
      const { buffer, cx, cy } = await applyTransforms(frameBuf, layerConf);

      layers.push({
        buffer,
        left: Math.round(layerConf.x - cx),
        top: Math.round(layerConf.y - cy),
        zIndex: layerConf.zIndex,
      });
    })
  );

  // Sort by zIndex ascending so higher z-index composites on top
  layers.sort((a, b) => a.zIndex - b.zIndex);

  const bg = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : backgroundColor;

  let instance = sharp({
    create: { width, height, channels: 4, background: bg },
  });

  if (layers.length > 0) {
    instance = instance.composite(
      layers.map((l) => ({ input: l.buffer, left: l.left, top: l.top }))
    );
  }

  return format === "webp"
    ? instance.webp({ quality: 92 }).toBuffer()
    : instance.png({ compressionLevel: 8 }).toBuffer();
}

import sharp from "sharp";
import type { MultiCompositeRequest } from "../schemas/multiCompositeSchema.js";
import type { DeviceId } from "../config/devicePresets.js";

// ── Device frame specs (matched to @codinix/device-mockup library dimensions) ─
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

// @codinix/device-mockup intrinsic sizes:
// Desktop:  screen 890×500, outer frame ~920×570 (stand image extends below)
// Laptop:   screen 700×420, outer frame ~870×500 (keyboard image extends below)
// Tablet:   screen 480×640, outer border ~3px, bezels ~18px top/bottom = 492×680
// Mobile:   screen 320×640, outer border ~3px, bezels ~14px top/bottom = 332×692
const DEVICE_SPECS: Record<DeviceId, DeviceFrameSpec> = {
  desktop: {
    contentW: 890,
    contentH: 500,
    frameW: 920,
    frameH: 570,
    screenOffsetX: 15,
    screenOffsetY: 22,   // top bezel
    screenRx: 4,
  },
  laptop: {
    contentW: 700,
    contentH: 420,
    frameW: 870,
    frameH: 500,
    screenOffsetX: 100,   // (870-700)/2 + 15 bezel
    screenOffsetY: 24,    // top bezel
    screenRx: 3,
  },
  tablet: {
    contentW: 480,
    contentH: 640,
    frameW: 492,
    frameH: 680,
    screenOffsetX: 6,
    screenOffsetY: 20,
    screenRx: 12,
  },
  mobile: {
    contentW: 320,
    contentH: 640,
    frameW: 332,
    frameH: 692,
    screenOffsetX: 6,
    screenOffsetY: 26,
    screenRx: 26,
  },
};


// ── SVG device frame builders ─────────────────────────────────────────────────

function buildDesktopSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch } = spec;
  // iMac-style: black bezel around screen, stand below
  const bezW = frameW;
  const bezH = sy + ch + 20; // screen area + bottom chin
  const standW = Math.round(frameW * 0.15);
  const standBaseW = Math.round(frameW * 0.5);
  const standH = frameH - bezH;
  const standX = (frameW - standW) / 2;
  const standBaseX = (frameW - standBaseW) / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <defs>
    <linearGradient id="deskBezel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
  </defs>
  <!-- Display bezel -->
  <rect x="0" y="0" width="${bezW}" height="${bezH}" rx="12" ry="12"
        fill="url(#deskBezel)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <!-- Screen area (image composited here) -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="4" fill="#000"/>
  <!-- Camera dot -->
  <circle cx="${frameW / 2}" cy="${sy / 2}" r="4" fill="#333"/>
  <!-- iMac stand neck -->
  <polygon points="${standX},${bezH} ${standX + standW},${bezH} ${standBaseX + standBaseW},${frameH - 8} ${standBaseX},${frameH - 8}"
           fill="#2a2a2a"/>
  <!-- Stand base -->
  <rect x="${standBaseX}" y="${frameH - 10}" width="${standBaseW}" height="10" rx="5"
        fill="#222" stroke="#111" stroke-width="1"/>
</svg>`;
}

function buildLaptopSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch } = spec;
  const lidW = cw + 30;   // lid is slightly wider than screen by ~15px each side
  const lidH = sy + ch + 10;
  const lidX = (frameW - lidW) / 2;
  const hingeY = lidH;
  const deckH = frameH - hingeY;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <defs>
    <linearGradient id="lapLid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c2c2c"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="lapDeck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
  </defs>
  <!-- Lid (silver outer bezel) -->
  <rect x="${lidX - 3}" y="0" width="${lidW + 6}" height="${lidH}" rx="16" ry="16"
        fill="#b2b0af" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <!-- Lid screen area (black bezel) -->
  <rect x="${lidX}" y="0" width="${lidW}" height="${lidH}" rx="14" ry="14"
        fill="url(#lapLid)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <!-- Camera dot -->
  <circle cx="${frameW / 2}" cy="${sy / 2 + 4}" r="3.5" fill="#333"/>
  <!-- Screen content area -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="3" fill="#000"/>
  <!-- Hinge bar -->
  <rect x="0" y="${hingeY}" width="${frameW}" height="5" fill="#111"/>
  <!-- Keyboard deck -->
  <rect x="0" y="${hingeY + 5}" width="${frameW}" height="${deckH - 5}" rx="0"
        fill="url(#lapDeck)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <!-- Keyboard area -->
  <rect x="${frameW * 0.06}" y="${hingeY + 14}" width="${frameW * 0.88}" height="${Math.max(30, deckH * 0.5)}"
        rx="4" fill="rgba(0,0,0,0.3)"/>
  <!-- Trackpad -->
  <rect x="${(frameW - 180) / 2}" y="${hingeY + 14 + Math.max(30, deckH * 0.5) + 8}" width="180" height="${Math.max(20, deckH * 0.28)}"
        rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
</svg>`;
}

function buildTabletSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch, screenRx } = spec;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <!-- Body -->
  <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="36" ry="36"
        fill="#565656" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="3" y="3" width="${frameW - 6}" height="${frameH - 6}" rx="33" ry="33"
        fill="#1a1a1a"/>
  <!-- Camera cluster -->
  <circle cx="${frameW / 2 - 6}" cy="${sy / 2}" r="5" fill="#0a0a0a" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <circle cx="${frameW / 2 + 6}" cy="${sy / 2}" r="4" fill="#0a0a0a" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <!-- Screen -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="${screenRx}" fill="#000"/>
  <!-- Side button -->
  <rect x="${frameW - 4}" y="30" width="4" height="40" rx="2" fill="#424242"/>
  <!-- Home indicator -->
  <rect x="${(frameW - 60) / 2}" y="${frameH - 12}" width="60" height="4" rx="2"
        fill="rgba(255,255,255,0.15)"/>
</svg>`;
}

function buildMobileSvg(spec: DeviceFrameSpec): string {
  const { frameW, frameH, screenOffsetX: sx, screenOffsetY: sy, contentW: cw, contentH: ch, screenRx } = spec;
  const islandW = Math.round(frameW * 0.46);
  const islandX = (frameW - islandW) / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${frameW}" height="${frameH}">
  <!-- Outer border -->
  <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="44" ry="44"
        fill="#555555" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <!-- Inner body -->
  <rect x="3" y="3" width="${frameW - 6}" height="${frameH - 6}" rx="40" ry="40"
        fill="#1a1a1a"/>
  <!-- Dynamic island -->
  <rect x="${islandX}" y="${sy - 22}" width="${islandW}" height="24" rx="12"
        fill="#000"/>
  <!-- Screen content area -->
  <rect x="${sx}" y="${sy}" width="${cw}" height="${ch}" rx="${screenRx}" fill="#000"/>
  <!-- Volume up -->
  <rect x="-2" y="${Math.round(frameH * 0.12)}" width="4" height="36" rx="2" fill="#2e2e2e"/>
  <!-- Volume down -->
  <rect x="-2" y="${Math.round(frameH * 0.12) + 46}" width="4" height="36" rx="2" fill="#2e2e2e"/>
  <!-- Power -->
  <rect x="${frameW - 2}" y="${Math.round(frameH * 0.23)}" width="4" height="80" rx="2" fill="#2e2e2e"/>
  <!-- Home indicator -->
  <rect x="${(frameW - 100) / 2}" y="${frameH - 12}" width="100" height="4" rx="2"
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

// ── Main compositor ──────────────────────────────────────────────────

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

  // ── Clip each layer to canvas bounds ─────────────────────────────────────────────
  // Sharp throws when any composite input lies fully or partially outside the
  // base canvas dimensions. This became a real risk with the new larger default
  // scales (desktop 1.20x, laptop 0.75x, etc.) where scaled device frames can
  // extend beyond the 1920x1080 canvas edges. We crop each layer to the
  // visible intersection with the canvas before compositing.
  const clippedLayers: Array<{ input: Buffer; left: number; top: number }> = [];

  for (const layer of layers) {
    const meta = await sharp(layer.buffer).metadata();
    const lw = meta.width!;
    const lh = meta.height!;

    // Intersection of the layer rect with the canvas rect [0,width) x [0,height)
    const srcLeft = Math.max(0, -layer.left);              // px to crop from left of layer buffer
    const srcTop  = Math.max(0, -layer.top);               // px to crop from top of layer buffer
    const dstLeft = Math.max(0, layer.left);               // final left on canvas
    const dstTop  = Math.max(0, layer.top);                // final top on canvas

    const visW = Math.min(lw - srcLeft, width  - dstLeft); // visible width
    const visH = Math.min(lh - srcTop,  height - dstTop);  // visible height

    if (visW <= 0 || visH <= 0) continue; // fully outside canvas — skip

    let input: Buffer;
    if (srcLeft === 0 && srcTop === 0 && visW === lw && visH === lh) {
      // Layer is entirely within canvas — no crop needed
      input = layer.buffer;
    } else {
      input = await sharp(layer.buffer)
        .extract({ left: srcLeft, top: srcTop, width: visW, height: visH })
        .png()
        .toBuffer();
    }

    clippedLayers.push({ input, left: dstLeft, top: dstTop });
  }

  let instance = sharp({
    create: { width, height, channels: 4, background: bg },
  });

  if (clippedLayers.length > 0) {
    instance = instance.composite(clippedLayers);
  }

  return format === "webp"
    ? instance.webp({ quality: 92 }).toBuffer()
    : instance.png({ compressionLevel: 8 }).toBuffer();
}

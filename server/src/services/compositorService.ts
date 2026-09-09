import sharp from "sharp";
import { compositeSchema } from "../schemas/compositeSchema.js";
import type { z } from "zod";

type MockupConfig = z.infer<typeof compositeSchema>["config"];

export async function compositeMockup(
  imageBuffer: Buffer,
  config: MockupConfig,
  format: "png" | "webp" = "png"
): Promise<Buffer> {
  const {
    width,
    height,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    padding,
    rounded,
    shadow,
    deviceType,
    showBrowserChrome,
    theme,
  } = config;

  const isDark = theme === "dark";
  const contentWidth = width;
  const contentHeight = height;

  // 1. Process the inner screenshot
  let processedImage = sharp(imageBuffer)
    .resize(contentWidth, contentHeight, {
      fit: "cover",
      position: "top",
    });

  if (rounded && deviceType === "desktop") {
    // Desktop has slight inner rounding if configured
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${contentWidth}" height="${contentHeight}" rx="4" ry="4"/></svg>`
    );
    processedImage = processedImage.composite([
      { input: roundedCorners, blend: "dest-in" },
    ]);
  }

  const innerBuffer = await processedImage.png().toBuffer();

  // 2. Build the frame
  let frameBuffer: Buffer;
  let frameWidth: number;
  let frameHeight: number;

  if (deviceType === "desktop") {
    frameWidth = contentWidth + 32;
    frameHeight = contentHeight + 40; // 16 top + 24 bottom
    const bezelColor = isDark ? "#000000" : "#e2e8f0";
    const frameRadius = rounded ? 16 : 0;
    
    // SVG frame
    const svg = `
      <svg width="${frameWidth}" height="${frameHeight}">
        <rect width="${frameWidth}" height="${frameHeight}" rx="${frameRadius}" ry="${frameRadius}" fill="${bezelColor}" />
      </svg>
    `;
    frameBuffer = await sharp(Buffer.from(svg))
      .composite([
        { input: innerBuffer, top: 16, left: 16 }
      ])
      .png()
      .toBuffer();
  } else {
    // Browser / Laptop / Tablet / Mobile Mockup
    const topBarHeight = showBrowserChrome ? 40 : 0;
    frameWidth = contentWidth;
    frameHeight = contentHeight + topBarHeight;
    const headerBg = isDark ? "#2d2d2d" : "#f1f5f9";
    const borderColor = isDark ? "#404040" : "#e2e8f0";
    const frameRadius = rounded ? 12 : 0;
    const urlBarBg = isDark ? "#1a1a1a" : "#ffffff";

    let svg = `<svg width="${frameWidth}" height="${frameHeight}">`;
    // Background and border
    svg += `<rect width="${frameWidth}" height="${frameHeight}" rx="${frameRadius}" ry="${frameRadius}" fill="#ffffff" stroke="${borderColor}" stroke-width="1" />`;
    
    if (showBrowserChrome) {
      // Top bar
      svg += `<path d="M0 ${frameRadius} a ${frameRadius} ${frameRadius} 0 0 1 ${frameRadius} -${frameRadius} h ${frameWidth - 2 * frameRadius} a ${frameRadius} ${frameRadius} 0 0 1 ${frameRadius} ${frameRadius} v ${topBarHeight - frameRadius} h -${frameWidth} z" fill="${headerBg}" />`;
      svg += `<line x1="0" y1="${topBarHeight}" x2="${frameWidth}" y2="${topBarHeight}" stroke="${borderColor}" stroke-width="1" />`;
      // Dots
      svg += `<circle cx="22" cy="20" r="6" fill="#ef4444" />`;
      svg += `<circle cx="42" cy="20" r="6" fill="#f59e0b" />`;
      svg += `<circle cx="62" cy="20" r="6" fill="#10b981" />`;
      // URL Bar
      const urlBarWidth = frameWidth * 0.6;
      const urlBarX = (frameWidth - urlBarWidth) / 2;
      svg += `<rect x="${urlBarX}" y="8" width="${urlBarWidth}" height="24" rx="6" ry="6" fill="${urlBarBg}" stroke="${borderColor}" stroke-width="1" />`;
    }
    svg += `</svg>`;

    frameBuffer = await sharp(Buffer.from(svg))
      .composite([
        { input: innerBuffer, top: topBarHeight, left: 0 }
      ])
      .png()
      .toBuffer();
  }

  // 3. Add shadow if needed
  if (shadow) {
    // A simple drop shadow simulation
    const shadowWidth = frameWidth + 100;
    const shadowHeight = frameHeight + 100;
    const shadowSvg = `
      <svg width="${shadowWidth}" height="${shadowHeight}">
        <filter id="blur">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        <rect x="50" y="65" width="${frameWidth}" height="${frameHeight}" fill="rgba(0,0,0,0.4)" filter="url(#blur)" />
      </svg>
    `;
    frameBuffer = await sharp(Buffer.from(shadowSvg))
      .composite([
        { input: frameBuffer, top: 50, left: 50 }
      ])
      .png()
      .toBuffer();
      
    // Update frame dims to include shadow bounds
    frameWidth = shadowWidth;
    frameHeight = shadowHeight;
  }

  // 4. Composite onto final canvas
  // Ensure background color is valid for sharp. transparent should be a true transparent background.
  const bg = backgroundColor === "transparent" ? { r: 0, g: 0, b: 0, alpha: 0 } : backgroundColor;
  
  // Actually, we should just center the frame buffer on the canvas.
  // The frontend scale/position controls are for the content inside, but if the frame is fixed to content,
  // we just place the frame in the center. Wait, the frontend scale/position controls the *frame* in the canvas.
  // In `MockupCanvas`, `transform: scale(config.scale) translate(config.positionX, config.positionY)` is applied
  // to the content? No, wait. 
  // Ah, the frontend `MockupCanvas` applies scale to the *container*, but `positionX/Y` to the `contentStyle`.
  // Actually, let's keep it simple for the backend generation: just center the frame on the canvas.
  const left = Math.max(0, Math.floor((canvasWidth - frameWidth) / 2));
  const top = Math.max(0, Math.floor((canvasHeight - frameHeight) / 2));

  const sharpInstance = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: bg,
    }
  }).composite([
    {
      input: frameBuffer,
      left,
      top,
    }
  ]);

  if (format === "webp") {
    return sharpInstance.webp({ quality: 90 }).toBuffer();
  }
  
  return sharpInstance.png().toBuffer();
}

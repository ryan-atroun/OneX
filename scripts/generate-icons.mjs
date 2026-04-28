import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const outDir = new URL("../public/icons/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function colorMix(a, b, t) {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function addPixel(data, index, color, alpha) {
  const inv = 1 - alpha;
  data[index] = clamp(data[index] * inv + color[0] * alpha);
  data[index + 1] = clamp(data[index + 1] * inv + color[1] * alpha);
  data[index + 2] = clamp(data[index + 2] * inv + color[2] * alpha);
  data[index + 3] = 255;
}

function drawPolygon(data, size, polygon, colorA, colorB, alpha = 1) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!pointInPolygon(x + 0.5, y + 0.5, polygon)) continue;
      const t = (x + y) / (size * 2);
      addPixel(data, (y * size + x) * 4, colorMix(colorA, colorB, t), alpha);
    }
  }
}

function drawLine(data, size, yPos, xStart, xEnd, height, color) {
  const radius = height / 2;
  for (let y = Math.floor(yPos - radius); y <= Math.ceil(yPos + radius); y += 1) {
    for (let x = Math.floor(xStart); x <= Math.ceil(xEnd); x += 1) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const leftDistance = Math.max(0, xStart - x);
      const rightDistance = Math.max(0, x - xEnd);
      const distance = Math.hypot(leftDistance + rightDistance, y - yPos);
      if (distance <= radius) addPixel(data, (y * size + x) * 4, color, 0.9);
    }
  }
}

function makeIcon(size) {
  const data = Buffer.alloc(size * size * 4);
  const center = size / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const vignette = Math.min(1, Math.hypot(dx, dy) / (size * 0.72));
      data[i] = clamp(mix(10, 3, vignette));
      data[i + 1] = clamp(mix(12, 5, vignette));
      data[i + 2] = clamp(mix(22, 9, vignette));
      data[i + 3] = 255;

      const violetGlow = Math.max(0, 1 - Math.hypot(x - size * 0.30, y - size * 0.24) / (size * 0.52));
      const cyanGlow = Math.max(0, 1 - Math.hypot(x - size * 0.72, y - size * 0.30) / (size * 0.48));
      addPixel(data, i, [139, 92, 246], violetGlow * 0.22);
      addPixel(data, i, [34, 211, 238], cyanGlow * 0.17);
    }
  }

  const s = size / 512;
  const slashA = [
    [118 * s, 118 * s],
    [179 * s, 118 * s],
    [404 * s, 394 * s],
    [342 * s, 394 * s]
  ];
  const slashB = [
    [334 * s, 118 * s],
    [395 * s, 118 * s],
    [170 * s, 394 * s],
    [108 * s, 394 * s]
  ];
  const shadowA = slashA.map(([x, y]) => [x + 6 * s, y + 8 * s]);
  const shadowB = slashB.map(([x, y]) => [x + 6 * s, y + 8 * s]);

  drawPolygon(data, size, shadowA, [34, 211, 238], [139, 92, 246], 0.24);
  drawPolygon(data, size, shadowB, [34, 211, 238], [139, 92, 246], 0.24);
  drawPolygon(data, size, slashA, [196, 181, 253], [34, 211, 238], 1);
  drawPolygon(data, size, slashB, [139, 92, 246], [34, 211, 238], 1);
  drawLine(data, size, 412 * s, 104 * s, 408 * s, 18 * s, [34, 211, 238]);

  return encodePng(size, size, data);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

for (const size of sizes) {
  writeFileSync(new URL(`icon-${size}.png`, outDir), makeIcon(size));
}

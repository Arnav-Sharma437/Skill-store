/* eslint-disable */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-JS PNG encoder
function createPNG(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth: 8
  ihdrData.writeUInt8(6, 9); // color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression method
  ihdrData.writeUInt8(0, 11); // filter method
  ihdrData.writeUInt8(0, 12); // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk: filter byte (0 = none) before each scanline
  const rowSize = width * 4;
  const filteredData = Buffer.alloc(height * (rowSize + 1));
  for (let y = 0; y < height; y++) {
    filteredData[y * (rowSize + 1)] = 0; // filter: none
    rgbaBuffer.copy(filteredData, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
  }
  const compressedData = zlib.deflateSync(filteredData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw Skill Store Icon onto RGBA buffer
function renderSkillStoreIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;
  const center = size / 2;

  // Background gradient: #0b132b (11, 19, 43) to #1c2d52 (28, 45, 82)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rectangle check
      let inRect = false;
      const dx = Math.max(0, Math.abs(x - center) - (center - radius));
      const dy = Math.max(0, Math.abs(y - center) - (center - radius));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Anti-aliased edge
        const alphaEdge = Math.min(1, Math.max(0, radius - dist + 0.5));
        const t = (x + y) / (size * 2);
        
        // Dark navy gradient
        const r = Math.round(11 + (28 - 11) * t);
        const g = Math.round(19 + (45 - 19) * t);
        const b = Math.round(43 + (82 - 43) * t);

        // Border glow near edge
        const isNearBorder = dist > radius - Math.max(1.5, size * 0.04);
        if (isNearBorder) {
          buf[idx] = Math.round(56 * alphaEdge);
          buf[idx + 1] = Math.round(182 * alphaEdge);
          buf[idx + 2] = Math.round(255 * alphaEdge);
          buf[idx + 3] = Math.round(180 * alphaEdge);
        } else {
          buf[idx] = Math.round(r * alphaEdge);
          buf[idx + 1] = Math.round(g * alphaEdge);
          buf[idx + 2] = Math.round(b * alphaEdge);
          buf[idx + 3] = Math.round(255 * alphaEdge);
        }
      } else {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }

  // Draw Stylized 'S'
  const strokeW = Math.max(2, size * 0.12);
  const sTopY = size * 0.28;
  const sMidY = size * 0.50;
  const sBotY = size * 0.72;
  const sLeft = size * 0.28;
  const sRight = size * 0.72;

  function drawPixel(px, py, color, intensity = 1) {
    const x = Math.round(px);
    const y = Math.round(py);
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      const curA = buf[idx + 3] / 255;
      const newA = Math.min(1, intensity);
      buf[idx] = Math.round(color[0] * newA + buf[idx] * (1 - newA));
      buf[idx + 1] = Math.round(color[1] * newA + buf[idx + 1] * (1 - newA));
      buf[idx + 2] = Math.round(color[2] * newA + buf[idx + 2] * (1 - newA));
      buf[idx + 3] = Math.max(buf[idx + 3], Math.round(newA * 255));
    }
  }

  function drawThickLine(x0, y0, x1, y1, width, color) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      const halfW = width / 2;
      for (let ox = -halfW; ox <= halfW; ox += 0.5) {
        for (let oy = -halfW; oy <= halfW; oy += 0.5) {
          if (ox * ox + oy * oy <= halfW * halfW) {
            const d = Math.sqrt(ox * ox + oy * oy);
            const a = Math.min(1, Math.max(0, halfW - d + 0.5));
            drawPixel(cx + ox, cy + oy, color, a);
          }
        }
      }
    }
  }

  const skyBlue = [56, 182, 255];
  const brightCyan = [0, 229, 255];
  const yellowAccent = [255, 214, 0];

  // Top horizontal bar: right to left
  drawThickLine(sRight - size * 0.05, sTopY, sLeft + size * 0.08, sTopY, strokeW, skyBlue);
  // Top left curve downward to middle
  drawThickLine(sLeft + size * 0.08, sTopY, sLeft, sTopY + (sMidY - sTopY) * 0.4, strokeW, skyBlue);
  drawThickLine(sLeft, sTopY + (sMidY - sTopY) * 0.4, sLeft + size * 0.08, sMidY, strokeW, brightCyan);
  
  // Middle horizontal bar
  drawThickLine(sLeft + size * 0.08, sMidY, sRight - size * 0.08, sMidY, strokeW, brightCyan);
  
  // Middle right curve downward to bottom
  drawThickLine(sRight - size * 0.08, sMidY, sRight, sMidY + (sBotY - sMidY) * 0.6, strokeW, skyBlue);
  drawThickLine(sRight, sMidY + (sBotY - sMidY) * 0.6, sRight - size * 0.08, sBotY, strokeW, skyBlue);

  // Bottom horizontal bar: right to left
  drawThickLine(sRight - size * 0.08, sBotY, sLeft + size * 0.05, sBotY, strokeW, skyBlue);

  // Top-Right Power Spark / Yellow Accent Dot
  const sparkX = sRight - size * 0.02;
  const sparkY = sTopY - size * 0.12;
  const sparkSize = Math.max(1.5, size * 0.08);
  for (let ox = -sparkSize; ox <= sparkSize; ox += 0.5) {
    for (let oy = -sparkSize; oy <= sparkSize; oy += 0.5) {
      if (Math.abs(ox) + Math.abs(oy) <= sparkSize * 1.2) {
        drawPixel(sparkX + ox, sparkY + oy, yellowAccent, 1);
      }
    }
  }

  return buf;
}

// Convert PNG to ICO format
function createICO(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type (1 = icon)
  header.writeUInt16LE(1, 4); // number of images (1)

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0); // width (32)
  dirEntry.writeUInt8(32, 1); // height (32)
  dirEntry.writeUInt8(0, 2);  // color palette (0 = >=256)
  dirEntry.writeUInt8(0, 3);  // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // size of image in bytes
  dirEntry.writeUInt32LE(22, 12); // offset of image data

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

// Generate all sizes
const sizes = [
  { size: 16, name: 'favicon-16x16.png', dir: 'public' },
  { size: 32, name: 'favicon-32x32.png', dir: 'public' },
  { size: 48, name: 'favicon-48x48.png', dir: 'public' },
  { size: 180, name: 'apple-touch-icon.png', dir: 'public' },
  { size: 192, name: 'android-chrome-192x192.png', dir: 'public' },
  { size: 512, name: 'android-chrome-512x512.png', dir: 'public' },
];

const png32 = createPNG(32, 32, renderSkillStoreIcon(32));
const ico = createICO(png32);

// Write ICO files
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), ico);
fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), ico);
fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), png32);

// Write PNG sizes
for (const s of sizes) {
  const buf = renderSkillStoreIcon(s.size);
  const png = createPNG(s.size, s.size, buf);
  fs.writeFileSync(path.join(__dirname, '..', s.dir, s.name), png);
}

console.log('Successfully generated all Skill Store favicons and icons!');

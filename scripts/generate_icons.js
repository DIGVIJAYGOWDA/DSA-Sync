import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to write a valid uncompressed PNG file with pure Node.js zlib
function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit color depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw Image Data (Filter byte 0 + RGBA per pixel)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Draw a subtle border and inner logo mark
      const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      // Theme colors: Deep indigo background #0F172A, Teal accent #0D9488 / Emerald #10B981
      if (isBorder) {
        rawData[pos++] = 15;  // R
        rawData[pos++] = 23;  // G
        rawData[pos++] = 42;  // B
        rawData[pos++] = 255; // A
      } else if (dist <= width * 0.45) {
        // Inner circle icon
        if (x >= width * 0.3 && x <= width * 0.7 && y >= height * 0.35 && y <= height * 0.65) {
          // Sync arrow/symbol accent (white/cyan)
          rawData[pos++] = 255; // R
          rawData[pos++] = 255; // G
          rawData[pos++] = 255; // B
          rawData[pos++] = 255; // A
        } else {
          // Brand Teal background
          rawData[pos++] = 13;  // R
          rawData[pos++] = 148; // G
          rawData[pos++] = 136; // B
          rawData[pos++] = 255; // A
        }
      } else {
        // Outer slate background
        rawData[pos++] = 30;  // R
        rawData[pos++] = 41;  // G
        rawData[pos++] = 59;  // B
        rawData[pos++] = 255; // A
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

// Simple CRC32 table & function
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
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

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const png = createPng(size, size, 13, 148, 136);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Generated icon${size}.png`);
});

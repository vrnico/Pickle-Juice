import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
const svg = readFileSync(resolve(publicDir, "icon.svg"));

async function render(size, outFile, maskablePadding = 0) {
  const inner = size - maskablePadding * 2;
  const padded = await sharp(svg)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background:
        maskablePadding > 0
          ? { r: 58, g: 160, b: 74, alpha: 1 }
          : { r: 255, g: 255, b: 255, alpha: 0 },
    },
  });
  await base
    .composite([{ input: padded, top: maskablePadding, left: maskablePadding }])
    .png()
    .toFile(resolve(publicDir, outFile));
  console.log("wrote", outFile);
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(512, "icon-maskable-512.png", 64);

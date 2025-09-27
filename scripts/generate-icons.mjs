import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const SRC = path.resolve("public", "m4capitallogo2.png");
const OUT_DIR = path.resolve("public", "icons");
const SIZES = [16, 32, 48, 64, 96, 120, 128, 152, 167, 180, 192, 256, 512];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDir(OUT_DIR);
  for (const size of SIZES) {
    const outfile = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(SRC)
      .resize(size, size, { fit: "cover" })
      .png({ quality: 90 })
      .toFile(outfile);
    console.log("Generated", outfile);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Рендерить assets/logo.svg → assets/icon.png (1024×1024) для Expo icon / splash / adaptiveIcon.
 * Запуск: node scripts/generate-app-icon.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "assets", "logo.svg");
const outPath = join(root, "assets", "icon.png");

const SIZE = 1024;

await sharp(svgPath)
  .resize(SIZE, SIZE, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile(outPath);

console.log("Written:", outPath);

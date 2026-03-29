/**
 * Копіює assets/icon.png у нативні res Android (mipmap + splash).
 * Зміна лише app.json/icon.png НЕ оновлює ці файли — без цього на емуляторі лишається шаблонна іконка Expo.
 * Запуск: node scripts/sync-android-icons.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconPath = join(root, "assets", "icon.png");
const res = join(root, "android", "app", "src", "main", "res");

/** Розміри launcher icon (dp → px для кожної щільності) */
const MIPMAP = [
  { dir: "mipmap-mdpi", px: 48 },
  { dir: "mipmap-hdpi", px: 72 },
  { dir: "mipmap-xhdpi", px: 96 },
  { dir: "mipmap-xxhdpi", px: 144 },
  { dir: "mipmap-xxxhdpi", px: 192 },
];

/** Розміри splash logo (як у типовому prebuild Expo) */
const SPLASH = [
  { dir: "drawable-mdpi", px: 124 },
  { dir: "drawable-hdpi", px: 186 },
  { dir: "drawable-xhdpi", px: 248 },
  { dir: "drawable-xxhdpi", px: 372 },
  { dir: "drawable-xxxhdpi", px: 496 },
];

async function writeWebpLauncher(size, outFile) {
  await sharp(iconPath)
    .resize(size, size, { fit: "cover", position: "centre" })
    .webp({ quality: 92 })
    .toFile(outFile);
}

async function writePngSplash(size, outFile) {
  await sharp(iconPath)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(outFile);
}

for (const { dir, px } of MIPMAP) {
  const folder = join(res, dir);
  await writeWebpLauncher(px, join(folder, "ic_launcher.webp"));
  await writeWebpLauncher(px, join(folder, "ic_launcher_round.webp"));
  console.log("mipmap:", dir, px + "px");
}

for (const { dir, px } of SPLASH) {
  const folder = join(res, dir);
  await writePngSplash(px, join(folder, "splashscreen_logo.png"));
  console.log("splash:", dir, px + "px");
}

console.log("Android res оновлено з", iconPath);

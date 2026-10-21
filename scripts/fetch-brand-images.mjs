// Downloads the site photos listed in src/config/brand-images.json into public/brand/.
// Runs automatically before `npm run build` (prebuild). Existing files are kept, so committed
// or hand-placed images always win. A failed download only warns: the build continues.
import { mkdir, writeFile, access } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { images } = JSON.parse(readFileSync(path.join(root, "src/config/brand-images.json"), "utf8"));
const outDir = path.join(root, "public/brand");
await mkdir(outDir, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);

for (const [name, { url }] of Object.entries(images)) {
  const file = path.join(outDir, `${name}.jpg`);
  if (await exists(file)) continue;
  if (!url) {
    console.warn(`[brand-images] ${name}: no url and no file at public/brand/${name}.jpg`);
    continue;
  }
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`[brand-images] ${name} downloaded`);
  } catch (err) {
    console.warn(`[brand-images] ${name}: download failed (${err.message}). The page will show the image area empty.`);
  }
}

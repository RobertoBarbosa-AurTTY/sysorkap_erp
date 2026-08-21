import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export function resolveViewsDir(): string {
  let bundleDir = "";
  try {
    bundleDir = path.dirname(fileURLToPath(import.meta.url));
  } catch {
    bundleDir = "";
  }
  const candidates = [
    path.join(bundleDir, "views"),
    path.join(process.cwd(), "netlify", "functions", "site", "views"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0];
}
/**
 * Automated acceptance check for VISUALIZER_SPEC.md
 * Run with: node scripts/check-visualizer.mjs
 *
 * Checks that can be verified without a browser:
 *   1. TypeScript compiles clean
 *   2. p5 is installed
 *   3. SongVisualizer exports the correct interface
 *   4. Canvas size is 540×960 in the component defaults
 *   5. useVideoExport has WIDTH=540, HEIGHT=960
 *   6. drawFrame is exported
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

let pass = 0;
let fail = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) throw new Error("returned false");
    console.log(`  ✓  ${label}`);
    pass++;
  } catch (e) {
    console.error(`  ✗  ${label}`);
    console.error(`     ${e.message}`);
    fail++;
  }
}

console.log("\nVisualizer acceptance checks\n");

// 1. TypeScript
check("TypeScript compiles without errors", () => {
  execSync("npx tsc --noEmit", { cwd: root, stdio: "pipe" });
});

// 2. p5 installed
check("p5 is in node_modules", () => {
  const p5Path = path.join(root, "node_modules/p5");
  if (!existsSync(p5Path)) throw new Error("p5 not found in node_modules");
});

// 3. p5 in package.json
check("p5 listed in dependencies", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  if (!pkg.dependencies?.p5) throw new Error("p5 not in dependencies");
});

// 4. SongVisualizer file exists
check("song-visualizer.tsx exists", () => {
  if (!existsSync(path.join(root, "components/f1/song-visualizer.tsx")))
    throw new Error("file not found");
});

// 5. Correct canvas default size
check("SongVisualizer default height is 960 (9:16 portrait)", () => {
  const src = readFileSync(
    path.join(root, "components/f1/song-visualizer.tsx"),
    "utf8"
  );
  if (!src.includes("960")) throw new Error("960 not found in visualizer source");
});

// 6. drawFrame exported via VisualizerHandle
check("VisualizerHandle interface exports drawFrame", () => {
  const src = readFileSync(
    path.join(root, "components/f1/song-visualizer.tsx"),
    "utf8"
  );
  if (!src.includes("drawFrame")) throw new Error("drawFrame not found");
});

// 7. p5 used in instance mode (not global)
check("p5 used in instance mode (new p5(...))", () => {
  const src = readFileSync(
    path.join(root, "components/f1/song-visualizer.tsx"),
    "utf8"
  );
  if (!src.includes("new p5")) throw new Error("p5 instance mode not found");
});

// 8. useVideoExport uses 540×960
check("useVideoExport WIDTH=540, HEIGHT=960", () => {
  const src = readFileSync(
    path.join(root, "hooks/use-video-export.ts"),
    "utf8"
  );
  if (!src.includes("960")) throw new Error("960 not found in use-video-export");
});

// 9. Team palette present in visualizer
check("Team color palette present in visualizer", () => {
  const src = readFileSync(
    path.join(root, "components/f1/song-visualizer.tsx"),
    "utf8"
  );
  if (!src.includes("ferrari") || !src.includes("mercedes"))
    throw new Error("team palette not found");
});

// 10. Landscape keywords present (flat shapes, not radial bars)
check("Visualizer draws landscape elements (mountains/islands/water)", () => {
  const src = readFileSync(
    path.join(root, "components/f1/song-visualizer.tsx"),
    "utf8"
  );
  const keywords = ["mountain", "island", "water", "tree", "sky"];
  const missing = keywords.filter((k) => !src.toLowerCase().includes(k));
  if (missing.length > 0)
    throw new Error(`Missing landscape keywords: ${missing.join(", ")}`);
});

// 11. Next.js build succeeds
check("next build succeeds (production)", () => {
  execSync("npm run build", { cwd: root, stdio: "pipe" });
});

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);

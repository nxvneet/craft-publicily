import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
mkdirSync("shots", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.4 });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem("voxel.intro", "1"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Landing hero
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await wait(5000);
await page.screenshot({ path: "shots/v-hero.png" });
console.log("v-hero");

// Builder: capture generation overlay mid-flight, then the revealed site
await page.goto(`${BASE}/create?p=${encodeURIComponent("a calm emerald wellness studio")}`, { waitUntil: "domcontentloaded" });
await wait(1100); // overlay should be showing its staged steps
await page.screenshot({ path: "shots/v-generating.png" });
console.log("v-generating");
await wait(5500); // revealed website preview
await page.screenshot({ path: "shots/v-builder-emerald.png" });
console.log("v-builder-emerald");

// Another prompt to prove distinct output
await page.goto(`${BASE}/create?p=${encodeURIComponent("a molten energy drink, bold and fast")}`, { waitUntil: "domcontentloaded" });
await wait(9000);
await page.screenshot({ path: "shots/v-builder-molten.png" });
console.log("v-builder-molten");

await browser.close();

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
mkdirSync("shots", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then((c) => c.newPage());

const errs = [];
page.on("console", (m) => m.type() === "error" && errs.push("console.error: " + m.text()));
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("requestfailed", (r) => errs.push("requestfailed: " + r.url() + " " + r.failure()?.errorText));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.addInitScript(() => sessionStorage.setItem("voxel.intro", "1"));

console.log("=== LANDING → type → click Generate ===");
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await wait(2500);
await page.fill('input[placeholder="Describe the site you want…"]', "a calm emerald wellness studio");
await page.click('button:has-text("Generate")');
await wait(4000);
console.log("URL after click:", page.url());
await page.screenshot({ path: "shots/diag-after-generate.png" });

console.log("=== direct /create?p=... — watch /api/generate ===");
const apiResponses = [];
page.on("response", (r) => r.url().includes("/api/generate") && apiResponses.push(r.status()));
await page.goto(`${BASE}/create?p=${encodeURIComponent("cyber neural ai platform")}`, { waitUntil: "domcontentloaded" });
await wait(6000);
console.log("/api/generate responses:", apiResponses);
const canvasCount = await page.locator("canvas").count();
console.log("canvas elements on /create:", canvasCount);
await page.screenshot({ path: "shots/diag-create.png" });

console.log("=== ERRORS (" + errs.length + ") ===");
errs.slice(0, 25).forEach((e) => console.log(" -", e));

await browser.close();

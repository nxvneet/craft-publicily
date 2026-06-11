import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
mkdirSync("shots", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
  ],
});

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
});
const page = await ctx.newPage();
// skip the intro overlay so we capture the hero itself
await page.addInitScript(() => sessionStorage.setItem("voxel.intro", "1"));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(name) {
  await page.screenshot({ path: `shots/${name}.png` });
  console.log("shot:", name);
}

// Lenis intercepts wheel — drive real wheel deltas to move the page.
async function scrollTo(sel) {
  const target = await page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }, sel);
  const cur = await page.evaluate(() => window.scrollY);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, target - cur);
  await wait(2000);
}

try {
  // 1. Landing hero
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas").catch(() => {});
  await wait(5500); // let WebGL compile + animate in
  await shot("01-hero");

  // 2. Templates gallery (real AI cover art)
  await scrollTo("#templates");
  await shot("02-templates");

  // 3. Pricing
  await scrollTo("#pricing");
  await shot("03-pricing");

  // 4. Builder
  await page.goto(`${BASE}/create?p=${encodeURIComponent("a molten energy drink, bold and fast")}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("canvas").catch(() => {});
  await wait(6500); // initial AI pass + scene
  await shot("04-builder");

  // 5. Publish → grab the live URL → open the published site
  try {
    await page.getByRole("button", { name: /Publish/ }).click();
    await page.getByText("You're live").waitFor({ timeout: 8000 });
    await shot("05-publish-modal");
    const href = await page.locator('a:has-text("Open live site")').getAttribute("href");
    if (href) {
      await page.goto(href, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("canvas").catch(() => {});
      await wait(5500);
      await shot("06-published-site");
    }
  } catch (e) {
    console.log("publish flow skipped:", e.message);
  }

  // 6. Dashboard (should list the just-published site in local mode)
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await wait(2000);
  await shot("07-dashboard");
} catch (e) {
  console.error("error:", e.message);
} finally {
  await browser.close();
}

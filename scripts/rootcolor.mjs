import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext()).newPage();
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await new Promise(r=>setTimeout(r,2500));
const r = await p.evaluate(() => ({
  htmlColor: getComputedStyle(document.documentElement).color,
  bodyColor: getComputedStyle(document.body).color,
  creamVar: getComputedStyle(document.documentElement).getPropertyValue("--color-cream"),
  inkVar: getComputedStyle(document.documentElement).getPropertyValue("--color-ink"),
  h1Color: getComputedStyle(document.querySelector("h1")).color,
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));
console.log(JSON.stringify(r,null,2));
await b.close();

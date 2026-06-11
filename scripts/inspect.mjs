import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
await p.goto("http://localhost:3000/create?p=a%20calm%20emerald%20wellness%20studio", { waitUntil:"domcontentloaded" });
await new Promise(r=>setTimeout(r,6000));
const info = await p.evaluate(() => {
  const h1s = [...document.querySelectorAll("h1")].map(h => {
    const r = h.getBoundingClientRect(); const cs = getComputedStyle(h);
    return { text: h.textContent, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), opacity: cs.opacity, color: cs.color, parentOpacity: getComputedStyle(h.parentElement).opacity };
  });
  return { h1s };
});
console.log(JSON.stringify(info, null, 2));
await b.close();

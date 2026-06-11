import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.3 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5500); await p.mouse.move(500,250); await wait(1000);
await p.screenshot({ path:"shots/applied-hero.png" });
// verify clock text present
const clock = await p.evaluate(()=>{const els=[...document.querySelectorAll("span")].map(s=>s.textContent).filter(t=>/^\d\d:\d\d$/.test(t||"")); return els.slice(0,3);});
console.log("live clock values:", clock);
await b.close();

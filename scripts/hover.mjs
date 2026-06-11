import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1.4 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(4000);
// wheel down to templates
const y = await p.evaluate(()=>{const el=document.querySelector("#templates");return el?el.getBoundingClientRect().top+window.scrollY:0;});
await p.mouse.move(720,450); await p.mouse.wheel(0, y - await p.evaluate(()=>window.scrollY) + 120); await wait(2200);
// hover the first preset card
const card = p.locator("button:has(h3:text('Hydra'))").first();
await card.hover();
console.log("hovering Hydra; waiting for live scene…");
await wait(5000); // let WebGL mount + compile
await p.screenshot({ path:"shots/live-preset.png" });
const canvases = await p.locator("#templates canvas").count();
console.log("canvases in #templates:", canvases);
await b.close();

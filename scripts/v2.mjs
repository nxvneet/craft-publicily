import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.3 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// V2 editorial
await p.goto("http://localhost:3000/v2", { waitUntil:"domcontentloaded" });
await wait(5500); await p.mouse.move(1150,400); await wait(1200);
await p.screenshot({ path:"shots/v2-editorial.png" });
console.log("v2 done");
// V1 with tabs (top)
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5000);
await p.screenshot({ path:"shots/v1-tabs.png", clip:{x:500,y:0,width:600,height:90} });
console.log("v1 tabs done");
await b.close();

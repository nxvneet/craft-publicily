import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.2 })).newPage();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/cinetest", { waitUntil:"domcontentloaded" });
await wait(5000);
await p.mouse.move(1200, 300); await wait(1500); // tilt right
await p.screenshot({ path:"shots/cine-bloom.png" });
console.log("bloom");
await p.click("body >> nth=0"); // ensure focus
// switch to studio (2nd dot)
await p.locator("button.rounded-full").nth(1).click(); await wait(3500);
await p.mouse.move(400, 600); await wait(1500);
await p.screenshot({ path:"shots/cine-studio.png" });
console.log("studio");
await p.locator("button.rounded-full").nth(2).click(); await wait(3500);
await p.mouse.move(1000, 400); await wait(1500);
await p.screenshot({ path:"shots/cine-cyber.png" });
console.log("cyber");
await b.close();

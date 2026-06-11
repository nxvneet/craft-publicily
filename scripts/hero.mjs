import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.3 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5500);
await p.mouse.move(500, 250); await wait(1200);
await p.screenshot({ path:"shots/hero-fixed.png" });
// measure approx fps over 1.5s
const fps = await p.evaluate(()=>new Promise(res=>{let n=0;const t0=performance.now();function f(){n++;if(performance.now()-t0<1500)requestAnimationFrame(f);else res(Math.round(n/((performance.now()-t0)/1000)));}requestAnimationFrame(f);}));
console.log("approx rAF fps (swiftshader, not GPU-representative):", fps);
console.log("pageerrors:", errs.slice(0,3));
await b.close();

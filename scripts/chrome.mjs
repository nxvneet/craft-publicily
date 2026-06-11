import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.3 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const errs=[]; p.on("pageerror",e=>errs.push("pageerror: "+e.message)); p.on("console",m=>{if(m.type()==="error")errs.push("console.error: "+m.text().slice(0,200));});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(4500);
// scroll into the scroll engine
const y = await p.evaluate(()=>{const el=document.querySelector("#showcase");return el?el.getBoundingClientRect().top+window.scrollY:0;});
await p.mouse.move(800,450); await p.mouse.wheel(0, y + 600); await wait(3500);
await p.screenshot({ path:"shots/chrome-scroll.png" });
console.log("=== ISSUES ("+errs.length+") ===");
[...new Set(errs)].slice(0,8).forEach(e=>console.log(" -",e));
await b.close();

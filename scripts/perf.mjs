import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const cnt = async ()=> p.locator("canvas").count();
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5000);
console.log("landing canvases at top:", await cnt());
// scroll to templates and rapidly hover all cards (the old hang source)
const y = await p.evaluate(()=>{const el=document.querySelector("#templates");return el?el.getBoundingClientRect().top+window.scrollY:0;});
await p.mouse.move(800,450); await p.mouse.wheel(0, y); await wait(2000);
for (const x of [300,650,1000,1300,650,300,1000]) { await p.mouse.move(x, 500); await wait(120); }
await wait(800);
console.log("canvases after sweeping all preset cards:", await cnt());
await b.close();

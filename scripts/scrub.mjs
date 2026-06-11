import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport:{width:1400,height:850} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(4000);
// find the scroll engine section range
const range = await p.evaluate(()=>{const e=document.querySelector("#showcase"); const r=e.getBoundingClientRect(); return {top: r.top+scrollY, h: e.offsetHeight};});
// wait for the scrollstage video metadata
await p.evaluate(()=>new Promise(res=>{const v=document.querySelectorAll("video")[1]; if(v&&v.readyState>=1)return res(); v?.addEventListener("loadedmetadata",()=>res(),{once:true}); setTimeout(res,3000);}));
const dur = await p.evaluate(()=>document.querySelectorAll("video")[1]?.duration);
console.log("scrollstage video duration:", dur);
// step through the section, sampling currentTime after the rAF ease settles
const samples=[];
for (let i=0;i<=12;i++){
  const y = range.top + (range.h - 850) * (i/12);
  await p.evaluate(yy=>window.scrollTo(0,yy), Math.round(y));
  await wait(450); // let easing settle
  const ct = await p.evaluate(()=>document.querySelectorAll("video")[1]?.currentTime);
  samples.push(+ct?.toFixed(3));
}
console.log("currentTime across scroll (should rise smoothly to ~duration):");
console.log(samples.join("  "));
// max jump between consecutive samples
let maxJump=0; for(let i=1;i<samples.length;i++){maxJump=Math.max(maxJump, Math.abs(samples[i]-samples[i-1]));}
console.log("max step between samples:", maxJump.toFixed(3), "s (of", dur?.toFixed(2),"s total)");
await b.close();

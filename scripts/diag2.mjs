import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1400,height:850} })).newPage();
const errs=[];
p.on("pageerror",e=>errs.push("PAGEERROR: "+e.message));
p.on("console",m=>{ if(m.type()==="error") errs.push("console.error: "+m.text().slice(0,300)); });
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(6000);
const state = await p.evaluate(()=>({
  title: document.title,
  bodyTextLen: document.body.innerText.length,
  hasHero: !!document.body.innerText.match(/One prompt/),
  introVisible: !!document.querySelector(".grain") && (()=>{const el=[...document.querySelectorAll("div")].find(d=>d.textContent?.includes("Compiling a real-time world")); return el? getComputedStyle(el).opacity : "n/a";})(),
  topZ: (()=>{let max=0,tag=""; document.querySelectorAll("*").forEach(e=>{const z=+getComputedStyle(e).zIndex; if(z>max){max=z;tag=e.className?.toString().slice(0,40);}}); return max+" :: "+tag;})(),
}));
console.log("STATE:", JSON.stringify(state,null,2));
console.log("ERRORS ("+errs.length+"):"); [...new Set(errs)].slice(0,12).forEach(e=>console.log("  -",e));
await p.screenshot({ path:"shots/loadcheck.png" });
await b.close();

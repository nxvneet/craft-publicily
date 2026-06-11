import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport:{width:1400,height:850} })).newPage();
const four=[]; p.on("response",r=>{if(r.status()>=400)four.push(r.status()+" "+r.url().slice(0,80));});
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5000);
const r = await p.evaluate(()=>{
  const introTxt = [...document.querySelectorAll("div")].some(d=>d.textContent?.includes("Compiling a real-time world"));
  const introEl = [...document.querySelectorAll("div")].find(d=>d.textContent==="Compiling a real-time world from one sentence…");
  // top stacking element visible?
  const cover = document.elementFromPoint(700,400);
  return { introPresent: introTxt, coverTag: cover?.tagName+" "+(cover?.className?.toString().slice(0,40)), heroVisible: getComputedStyle([...document.querySelectorAll("h1")][0]||document.body).getPropertyValue("opacity") };
});
console.log("after 5s -> intro overlay present:", r.introPresent, "| element at center:", r.coverTag);
console.log("404s:", four.length?four:"none", "| pageerrors:", errs.length?errs.slice(0,3):"none");
await p.screenshot({ path:"shots/loadok.png" });
await b.close();

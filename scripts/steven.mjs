import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1512,height:900}, deviceScaleFactor:1.2 })).newPage();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
  await p.goto("https://steven.com/", { waitUntil:"networkidle", timeout:45000 });
} catch(e){ console.log("nav:", e.message); }
await wait(4000);
// accept cookies if present
for (const t of ["Accept All","Accept all","Accept","No thanks"]) {
  const btn = p.getByRole("button",{name:t}); if (await btn.count()){ await btn.first().click().catch(()=>{}); break; }
}
await wait(2500);
await p.screenshot({ path:"shots/steven-1.png" });
// extract design tokens + structure
const info = await p.evaluate(()=>{
  const cs = getComputedStyle(document.body);
  const fonts = new Set(); const sizes = new Set();
  document.querySelectorAll("h1,h2,h3,p,a,span,button").forEach(e=>{const s=getComputedStyle(e); if(e.textContent.trim()){fonts.add(s.fontFamily); sizes.add(s.fontSize);}});
  const headings = [...document.querySelectorAll("h1,h2,h3")].slice(0,12).map(h=>({t:h.tagName, txt:h.textContent.trim().slice(0,80), size:getComputedStyle(h).fontSize, weight:getComputedStyle(h).fontWeight}));
  const navs = [...document.querySelectorAll("nav a, header a")].map(a=>a.textContent.trim()).filter(Boolean).slice(0,12);
  const canvases = document.querySelectorAll("canvas").length;
  const rive = document.querySelectorAll("[class*='rive'],canvas").length;
  return { bodyBg: cs.backgroundColor, bodyColor: cs.color, bodyFont: cs.fontFamily, fonts:[...fonts].slice(0,6), headings, navs, canvases, docHeight: document.body.scrollHeight, vh: window.innerHeight };
});
console.log(JSON.stringify(info,null,2));
// scroll captures
const H = info.docHeight;
for (let i=1;i<=4;i++){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:"instant"}), Math.round(H*i/5));
  await wait(2200);
  await p.screenshot({ path:`shots/steven-${i+1}.png` });
}
console.log("done; docHeight", H);
await b.close();

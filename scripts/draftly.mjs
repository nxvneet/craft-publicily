import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1512,height:850}, deviceScaleFactor:1.1 })).newPage();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try { await p.goto("https://www.draftly.space/", { waitUntil:"networkidle", timeout:50000 }); } catch(e){ console.log("nav:",e.message); }
await wait(4000);
for (const t of ["Accept All","Accept all","Accept","Got it","No thanks"]) { const x=p.getByRole("button",{name:t}); if(await x.count()){await x.first().click().catch(()=>{}); break;} }
await wait(2000);

// tech + structure
const info = await p.evaluate(()=>{
  const cs = getComputedStyle(document.body);
  const fonts=new Set(); document.querySelectorAll("h1,h2,h3,p,a,button,span").forEach(e=>{if(e.textContent.trim())fonts.add(getComputedStyle(e).fontFamily);});
  return {
    docHeight: document.body.scrollHeight, vh: innerHeight,
    bodyBg: cs.backgroundColor, fonts:[...fonts].slice(0,6),
    videos: document.querySelectorAll("video").length,
    canvases: document.querySelectorAll("canvas").length,
    imgs: document.querySelectorAll("img").length,
    h1: [...document.querySelectorAll("h1")].map(h=>h.textContent.trim().slice(0,80)).slice(0,4),
    h2: [...document.querySelectorAll("h2")].map(h=>h.textContent.trim().slice(0,60)).slice(0,10),
    ctas: [...document.querySelectorAll("a,button")].map(a=>a.textContent.trim()).filter(t=>t&&t.length<30).slice(0,20),
  };
});
console.log(JSON.stringify(info,null,2));
const H = info.docHeight;
await p.screenshot({ path:"shots/draftly-0.png" });
for (let i=1;i<=6;i++){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:"instant"}), Math.round(H*i/7));
  await wait(2500);
  await p.screenshot({ path:`shots/draftly-${i}.png` });
}
console.log("docHeight",H,"vh",info.vh);
await b.close();

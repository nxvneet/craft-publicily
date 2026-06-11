import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--ignore-gpu-blocklist","--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1512,height:850}, deviceScaleFactor:1.3 })).newPage();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("https://steven.com/", { waitUntil:"load", timeout:45000 }).catch(e=>console.log("nav",e.message));
await wait(6000);
for (const t of ["Accept All","Accept all","Accept"]) { const btn=p.getByRole("button",{name:t}); if(await btn.count()){await btn.first().click().catch(()=>{}); break;} }
await wait(3000);
// wiggle mouse over center to wake interactive graphic
for (const [x,y] of [[756,400],[600,350],[900,450],[756,420]]){ await p.mouse.move(x,y); await wait(500); }
await wait(2000);
await p.screenshot({ path:"shots/steven-live.png" });
// dump visible text + element rects for structure
const t = await p.evaluate(()=>{
  const out=[]; document.querySelectorAll("h1,h2,h3,p,a,button,nav,canvas,[class*='rive']").forEach(e=>{
    const r=e.getBoundingClientRect(); const tx=(e.tagName==='CANVAS')?`[canvas ${Math.round(r.width)}x${Math.round(r.height)}]`:e.textContent.trim().slice(0,60);
    if((r.width>5&&r.height>5)&&(tx)) out.push(`${e.tagName} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} :: ${tx}`);
  });
  return out.slice(0,30).join("\n");
});
console.log(t);
await b.close();

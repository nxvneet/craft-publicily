import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
await p.goto("http://localhost:3000/create?p=a%20calm%20emerald%20wellness%20studio", { waitUntil:"domcontentloaded" });
await new Promise(r=>setTimeout(r,6000));
const chain = await p.evaluate(() => {
  const h1 = document.querySelector("h1"); const out = [];
  let el = h1;
  for (let i=0; i<5 && el; i++) {
    const cs = getComputedStyle(el);
    out.push({ tag: el.tagName, class: el.className?.toString().slice(0,90), padL: cs.paddingLeft, width: cs.width, position: cs.position, display: cs.display });
    el = el.parentElement;
  }
  return out;
});
console.log(JSON.stringify(chain, null, 2));
await b.close();

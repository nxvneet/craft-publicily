import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/create?p="+encodeURIComponent("a quiet brutalist architecture studio"), { waitUntil:"domcontentloaded" });
await wait(6500);
const h = p.locator('[contenteditable]', { hasText: "unforgettable" }).first();
await h.click();
// select-all within the element via DOM Range, then type to replace
await p.evaluate(() => { const el=document.activeElement; const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); });
await p.keyboard.type("Concrete poetry.");
await p.locator("aside").click({ position:{x:180,y:300} }); await wait(700);
console.log("headline after clean edit:", JSON.stringify((await h.innerText()).trim()));
// undo it
await p.keyboard.press("Meta+z"); await wait(600);
console.log("headline after undo:", JSON.stringify((await h.innerText()).trim()));
await b.close();

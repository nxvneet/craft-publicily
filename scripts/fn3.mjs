import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/create?p="+encodeURIComponent("a quiet brutalist architecture studio"), { waitUntil:"domcontentloaded" });
await wait(6500);
// headline is the editable with the largest font in the preview overlay
const headline = p.locator('.z-10 [contenteditable]').nth(1);
console.log("before:", JSON.stringify((await headline.innerText()).trim()));
await headline.click();
await p.evaluate(() => { const el=document.activeElement; const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); });
await p.keyboard.type("Concrete poetry.");
await p.keyboard.press("Tab"); await wait(700);
console.log("after edit:", JSON.stringify((await headline.innerText()).trim()));
await b.close();

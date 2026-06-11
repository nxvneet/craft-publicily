import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/create?p="+encodeURIComponent("a quiet brutalist architecture studio"), { waitUntil:"domcontentloaded" });
await wait(6500);

// 1. click-to-edit the headline
const h = p.locator('[contenteditable]', { hasText: "unforgettable" }).first();
await h.click(); await p.keyboard.press("Control+A"); await p.keyboard.type("Concrete poetry."); 
await p.locator("body").click({ position:{x:1300,y:120} }); await wait(600);
const headlineNow = (await h.innerText()).trim();

// 2. section count before/after hiding one (Content tab)
const pillsBefore = await p.locator("text=/sections ↓/").first().innerText();
await p.getByRole("button",{name:"content"}).click(); await wait(600);
// hide the first section toggle (the ● buttons) 
await p.locator('aside button[title="Hide"]').first().click(); await wait(500);
const pillsAfter = await p.locator("text=/sections ↓/").first().innerText();

console.log("headline after edit:", JSON.stringify(headlineNow));
console.log("pills before hide:", pillsBefore.split("\n")[0]);
console.log("pills after hide:", pillsAfter.split("\n")[0]);
await b.close();

import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.2 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// landing hero
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5500); await p.mouse.move(1100,350); await wait(1200);
await p.screenshot({ path:"shots/final-hero.png" });
console.log("hero");
// publish an ai site → view published cinematic hero
await p.goto("http://localhost:3000/create?p="+encodeURIComponent("a neural AI agent platform for developers"), { waitUntil:"domcontentloaded" });
await wait(6500);
await p.getByRole("button",{name:/Publish/}).click();
await p.getByText("You're live").waitFor({ timeout:8000 });
const href = await p.locator('a:has-text("Open live site")').getAttribute("href");
await p.goto(href, { waitUntil:"domcontentloaded" });
await wait(5500); await p.mouse.move(500,300); await wait(1200);
await p.screenshot({ path:"shots/final-published.png" });
console.log("published:", href);
await b.close();

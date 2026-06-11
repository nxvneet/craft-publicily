import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1.3 });
const p = await ctx.newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

await p.goto("http://localhost:3000/create?p="+encodeURIComponent("a neural AI agent platform for developers"), { waitUntil:"domcontentloaded" });
await wait(6500);
await p.screenshot({ path:"shots/site-builder.png" });
await p.getByRole("button",{name:/Publish/}).click();
await p.getByText("You're live").waitFor({ timeout:8000 });
const href = await p.locator('a:has-text("Open live site")').getAttribute("href");
console.log("published:", href);

await p.goto(href, { waitUntil:"domcontentloaded" });
await wait(5500);
await p.screenshot({ path:"shots/site-hero.png" });
// scroll through the sections (published page is a normal-scroll page, no Lenis)
for (let i=1;i<=4;i++){
  await p.evaluate(y=>window.scrollTo(0,y), i*900);
  await wait(1600);
  await p.screenshot({ path:`shots/site-sec${i}.png` });
}
console.log("done");
await b.close();

import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport:{width:1600,height:900}, deviceScaleFactor:1.2 })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:3000/", { waitUntil:"domcontentloaded" });
await wait(5000);
await p.screenshot({ path:"shots/m-hero.png" });
console.log("hero. canvases on landing:", await p.locator("canvas").count());
// templates
const ty = await p.evaluate(()=>{const e=document.querySelector("#templates");return e?e.getBoundingClientRect().top+window.scrollY:0;});
await p.mouse.move(800,450); await p.mouse.wheel(0, ty); await wait(1800);
await p.screenshot({ path:"shots/m-templates.png" });
// publish a saas site -> real website layout
await p.goto("http://localhost:3000/create?p="+encodeURIComponent("Northwind, a sales CRM SaaS platform for teams, premium blue"), { waitUntil:"domcontentloaded" });
await wait(6500);
await p.getByRole("button",{name:/Publish/}).click();
await p.getByText("You're live").waitFor({ timeout:8000 });
const href = await p.locator('a:has-text("Open live site")').getAttribute("href");
await p.goto(href, { waitUntil:"domcontentloaded" });
await wait(2500);
await p.screenshot({ path:"shots/m-published-hero.png" });
console.log("pageerrors:", errs.slice(0,3));
await b.close();

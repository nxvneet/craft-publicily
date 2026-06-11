import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1400,height:850} })).newPage();
const logs=[];
p.on("pageerror",e=>logs.push("PAGEERROR: "+e.message+(e.stack?(" :: "+e.stack.split("\n").slice(0,3).join(" | ")):"")));
p.on("console",m=>logs.push("console."+m.type()+": "+m.text().slice(0,300)));
p.on("requestfailed",r=>logs.push("REQFAIL "+r.url()+" :: "+(r.failure()?.errorText||"")));
p.on("response",r=>{ if(r.status()>=400) logs.push("HTTP "+r.status()+" "+r.url()); });
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto("http://localhost:3000/", { waitUntil:"networkidle" });
await wait(4000);
// is the intro counter advancing? sample twice
const c1 = await p.evaluate(()=>document.body.innerText.match(/\d\d\d/)?.[0]);
await wait(1500);
const c2 = await p.evaluate(()=>document.body.innerText.match(/\d\d\d/)?.[0]);
console.log("intro counter samples:", c1, "->", c2, c1===c2?"(STUCK = no hydration)":"(advancing = ok)");
console.log("--- logs ---");
[...new Set(logs)].slice(0,20).forEach(l=>console.log(" ",l));
await b.close();

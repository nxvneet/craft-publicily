import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
await p.addInitScript(() => sessionStorage.setItem("voxel.intro","1"));

function lum(rgb){const m=rgb.match(/\d+/g).map(Number);return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2];}

for (const url of ["http://localhost:3000/create?p=cyber%20ai", "http://localhost:3000/dashboard", "http://localhost:3000/"]) {
  await p.goto(url, { waitUntil:"domcontentloaded" });
  await new Promise(r=>setTimeout(r,4500));
  const bad = await p.evaluate(() => {
    function lum(rgb){const m=rgb.match(/\d+/g).map(Number);return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2];}
    function effBg(el){let e=el;while(e){const bg=getComputedStyle(e).backgroundColor;if(bg&&bg!=="rgba(0, 0, 0, 0)"&&bg!=="transparent")return bg;e=e.parentElement;}return "rgb(6,6,10)";}
    const out=[];
    for(const el of document.querySelectorAll("input,textarea,h1,h2,h3,p,span,a,button,li,div,code")){
      const t=el.textContent?.trim(); if(!t || el.children.length>0) continue;
      const cs=getComputedStyle(el); if(cs.visibility==="hidden"||cs.display==="none"||+cs.opacity===0) continue;
      const col=cs.color, bg=effBg(el);
      const cl=lum(col), bl=lum(bg);
      if(Math.abs(cl-bl)<60){ // low contrast
        out.push({tag:el.tagName, text:t.slice(0,30), color:col, bg, dContrast:Math.round(Math.abs(cl-bl))});
      }
    }
    // also explicitly: inputs
    const inputs=[...document.querySelectorAll("input")].map(i=>({ph:i.placeholder?.slice(0,20),color:getComputedStyle(i).color}));
    return {out:out.slice(0,20), inputs};
  });
  console.log("\n### "+url);
  console.log("inputs:", JSON.stringify(bad.inputs));
  console.log("low-contrast text ("+bad.out.length+"):");
  bad.out.forEach(o=>console.log("  ["+o.dContrast+"] <"+o.tag+"> \""+o.text+"\"  color="+o.color+" bg="+o.bg));
}
await b.close();

"use strict";
const fs = require("fs");
global.window = {};
const load = f => eval(fs.readFileSync(f, "utf8"));
load("data/acupoints-4.js"); load("data/acupoints-5.js"); load("data/acupoints-6.js");
const src = fs.readFileSync(".work/src/针灸甲乙经.txt", "utf8");
// 去所有空白后建全文串
const norm = s => s.replace(/[\s\u3000]+/g, "");
const N = norm(src);
const pts = [].concat(window.ACUPARTS_4||[], window.ACUPARTS_5||[], window.ACUPARTS_6||[]);
let hit=0, miss=0;
const misses=[];
for (const p of pts) {
  if (!p.classic) continue;
  const quotes = [...p.classic.matchAll(/『([^』]+)』/g)].map(m=>m[1]);
  for (const q of quotes) {
    const nq = norm(q);
    if (N.includes(nq)) { hit++; }
    else {
      // 尝试截短：取前 12 字找位置，看差异
      miss++;
      let head = nq.slice(0, 12), info = "";
      const i = N.indexOf(head);
      if (i >= 0) info = "源文:" + N.slice(i, i + nq.length + 4);
      misses.push(`${p.id} ${p.name} | ${q} ${info? "|| "+info : "|| 前缀未命中"}`);
    }
  }
}
console.log(`引文总数（『』内）: ${hit+miss}，命中 ${hit}，未命中 ${miss}`);
misses.forEach(m=>console.log("MISS "+m));

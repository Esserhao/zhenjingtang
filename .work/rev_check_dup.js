"use strict";
const fs = require("fs");
global.window = {};
const load = f => eval(fs.readFileSync(f, "utf8"));
for (const f of ["data/acupoints-1.js","data/acupoints-2.js","data/acupoints-3.js","data/acupoints-4.js","data/acupoints-5.js","data/acupoints-6.js"]) load(f);
const all = [].concat(window.ACUPARTS_1||[],window.ACUPARTS_2||[],window.ACUPARTS_3||[],window.ACUPARTS_4||[],window.ACUPARTS_5||[],window.ACUPARTS_6||[]);
// 1) id 重复
const idMap = {};
for (const p of all) (idMap[p.id] = idMap[p.id]||[]).push(p.name);
for (const [id,ns] of Object.entries(idMap)) if (ns.length>1) console.log("ID重复: "+id+" → "+ns.join(","));
// 2) 同名异 id
const nameMap = {};
for (const p of all) (nameMap[p.name] = nameMap[p.name]||[]).push(p.id);
for (const [n,ids] of Object.entries(nameMap)) if (ids.length>1) console.log("穴名重复: "+n+" → "+ids.join(","));
// 3) 检查头部声明中"已存在未重复收录"的穴
const need = ["ST28","ST38","ST43","SP2","SP4"];
for (const id of need) console.log(id+" 在库: "+(idMap[id]? idMap[id][0] : "缺失!"));
// 4) 每经穴数盘点（对照361标准）
const cnt = {};
for (const p of all) { const k = p.meridian; cnt[k]=(cnt[k]||0)+1; }
const std = {"手太阴肺经":11,"手阳明大肠经":20,"足阳明胃经":45,"足太阴脾经":21,"手少阴心经":9,"手太阳小肠经":19,"足太阳膀胱经":67,"足少阴肾经":27,"手厥阴心包经":9,"手少阳三焦经":23,"足少阳胆经":44,"足厥阴肝经":14,"任脉":24,"督脉":28};
console.log("--- 各经收录数/标准数 ---");
for (const [m,s] of Object.entries(std)) console.log(m+": "+(cnt[m]||0)+"/"+s);
// 5) 列出缺失的穴（按经脉索引对照）
const idx = window.MERIDIAN_INDEX||[];
for (const m of idx) {
  if (!std[m.meridian]) continue;
  const have = new Set(all.filter(p=>p.meridian===m.meridian).map(p=>p.name));
  const miss = m.points.filter(n=>!have.has(n));
  if (miss.length) console.log("缺: "+m.meridian+" → "+miss.join("、"));
}

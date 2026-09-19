"use strict";
const fs = require("fs");
global.window = {};
const load = f => eval(fs.readFileSync(f, "utf8"));
load("data/acupoints-4.js"); load("data/acupoints-5.js"); load("data/acupoints-6.js");
const src = fs.readFileSync(".work/src/针灸甲乙经.txt", "utf8");
const norm = s => s.replace(/[\s\u3000]+/g, "");
const N = norm(src);
const pts = [].concat(window.ACUPARTS_4||[], window.ACUPARTS_5||[], window.ACUPARTS_6||[]);
// 别名映射（数据中注明或甲乙经古名）
const alias = {
  ST5:["大迎","髓孔"], ST10:["水突","水门"], ST24:["滑肉门"], ST23:["太乙"],
  ST27:["大巨","腋门"], SP14:["腹结","腹屈"], SP12:["冲门","慈宫"], SP16:["腹哀"],
  BL45:["譩譆","噫嘻"], BL56:["承筋","肠","直肠"], BL61:["仆参","安邪"],
  KI11:["横骨","下极"], KI12:["大赫","阴维","阴关"], KI13:["气穴","胞门","子户"],
  KI14:["四满","髓府"], KI19:["阴都","食宫"], KI21:["幽门","上门"],
  GB3:["上关","客主人"], GB32:["中渎","中犊"], GB16:["目窗","至营"], GB19:["脑空","颞"],
  GV15:["哑门","喑门","舌横","舌厌"], GV19:["后顶","交冲"], GV22:["囟会"],
  TE22:["耳和髎","和髎","和"], LV10:["足五里","五里"], KI27:["俞府","输府"],
  BL29:["中膂俞","中膂内俞"], BL35:["会阳","利机"], BL36:["承扶","肉"], BL37:["殷门"],
  GB27:["五枢"], GB28:["维道","外枢"], SP13:["府舍"], ST30:["气冲"], KI20:["通谷","腹通谷"],
};
function nameInQuote(names, q) {
  const nq = norm(q);
  for (const nm of names) if (nm && nq.includes(norm(nm))) return nm;
  return null;
}
let problems = 0;
for (const p of pts) {
  if (!p.classic) continue;
  const names = alias[p.id] || [p.name];
  const quotes = [...p.classic.matchAll(/『([^』]+)』/g)].map(m=>m[1]);
  quotes.forEach((q, i) => {
    const hit = nameInQuote(names, q);
    if (!hit) {
      problems++;
      console.log(`[${p.id} ${p.name}] 第${i+1}条引文中未出现穴名/别名，需人工判断挂穴是否正确：\n    ${q.slice(0,60)}...`);
    }
  });
}
console.log("疑似挂错穴需人工复核数: " + problems);

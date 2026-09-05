#!/usr/bin/env node
/* check_data.js —— 针经堂数据校验（改完 data/*.js 先跑一遍再刷新页面）
 * 用法：node tools/check_data.js
 * 退出码：0 = 全部通过；1 = 有错误（错误清单打印到控制台）
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
global.window = {};
const load = (f) => {
  const file = path.join(ROOT, f);
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("\uFFFD")) errors.push(f + " 含乱码字符 U+FFFD（多半是编码坏了）");
  // eslint-disable-next-line no-eval
  eval(src);
};
const errors = [];
const warn = [];

/* ---------- 加载与语法 ---------- */
const files = ["data/acupoints-1.js", "data/acupoints-2.js", "data/acupoints-3.js", "data/meridian-index.js", "data/theory.js", "data/classics.js", "data/nanjing.js", "data/compare.js"];
let syntaxOK = true;
for (const f of files) {
  try {
    load(f);
  } catch (e) {
    syntaxOK = false;
    errors.push(f + " 语法/加载失败：" + e.message);
  }
}

const pts = (window.ACUPARTS_1 || []).concat(window.ACUPARTS_2 || []).concat(window.ACUPARTS_3 || []);
const idx = window.MERIDIAN_INDEX || [];
const theory = window.THEORY || [];
const lingshu = window.LINGSHU || [];
const nanjing = window.NANJING || [];

const abbrMap = { "手太阴肺经": "LU", "手阳明大肠经": "LI", "足阳明胃经": "ST", "足太阴脾经": "SP", "手少阴心经": "HT", "手太阳小肠经": "SI", "足太阳膀胱经": "BL", "足少阴肾经": "KI", "手厥阴心包经": "PC", "手少阳三焦经": "TE", "足少阳胆经": "GB", "足厥阴肝经": "LV", "任脉": "CV", "督脉": "GV", "经外奇穴": "EX" };
const EXisting = ["经外奇穴"];

/* ---------- 穴位库 ---------- */
const seen = {};
const needDetailed = ["id", "name", "pinyin", "meridian", "special", "location", "care", "indications", "classic", "caution", "detailed"];
for (const p of pts) {
  const where = p.id || "(无id)";
  if (!p.id || !p.name || !p.pinyin || !p.meridian) errors.push("穴位缺基础字段: " + where + "（id/name/pinyin/meridian 必填）");
  if (seen[p.id]) errors.push("穴位 id 重复: " + p.id);
  seen[p.id] = p;
  if (!abbrMap[p.meridian]) errors.push("穴位经脉名不在映射表: " + where + " → " + p.meridian);
  if (p.detailed) {
    for (const k of needDetailed) if (p[k] === undefined) errors.push("精讲穴缺字段: " + where + " → " + k);
    if (!Array.isArray(p.indications)) errors.push("精讲穴 indications 非数组: " + where);
  } else {
    for (const k of ["id", "name", "pinyin", "meridian", "location"]) if (!p[k]) errors.push("速查穴缺字段: " + where + " → " + k);
  }
  if (p.location && p.location.length < 8) warn.push("穴位 location 疑似过短: " + where);
  if (p.indications && !Array.isArray(p.indications) && p.detailed) errors.push("indications 必须是数组: " + where);
  // 常见错字巡检
  const text = [p.location, p.care, p.caution, p.classic, (p.indications || []).join("")].join("");
  for (const typo of ["膀肶", "膀经", "洒浙", "治冱", "脆穴"]) if (text.includes(typo)) errors.push("穴位疑似错字「" + typo + "」: " + where);
}

/* ---------- 经脉索引 ---------- */
const idxMer = {};
for (const m of idx) {
  if (idxMer[m.abbr]) errors.push("MERIDIAN_INDEX abbr 重复: " + m.abbr);
  idxMer[m.abbr] = m;
  if (!abbrMap[m.meridian]) errors.push("MERIDIAN_INDEX 经脉名不在映射表: " + m.meridian);
  if (abbrMap[m.meridian] !== m.abbr) errors.push("MERIDIAN_INDEX abbr 与经脉名不匹配: " + m.meridian + " ↔ " + m.abbr);
  const nameSet = {};
  for (const n of m.points) {
    if (nameSet[n]) errors.push("「" + m.meridian + "」索引内穴名重复: " + n);
    nameSet[n] = 1;
  }
}
// 精讲穴必须能在索引中找到（同经同名）
for (const p of pts) {
  const m = idxMer[abbrMap[p.meridian]];
  if (m && !m.points.includes(p.name)) errors.push("精讲穴不在其经索引中: " + p.id + " " + p.name + "（" + p.meridian + "）");
}

/* ---------- 理论课 ---------- */
const orderSeen = {};
const tIdSeen = {};
for (const c of theory) {
  if (tIdSeen[c.id]) errors.push("理论课 id 重复: " + c.id);
  tIdSeen[c.id] = 1;
  if (orderSeen[c.order]) errors.push("理论课 order 重复: " + c.order);
  orderSeen[c.order] = 1;
  if (!Array.isArray(c.sections) || !c.sections.length) errors.push("理论课无 sections: " + c.id);
  for (const s of c.sections || []) {
    if (!s.h || !s.body) errors.push("理论课节缺 h/body: " + c.id + " → " + (s.h || "?"));
  }
}

/* ---------- 经典 ---------- */
const cIdSeen = {};
for (const ch of lingshu) {
  if (cIdSeen[ch.id]) errors.push("经典篇章 id 重复: " + ch.id);
  cIdSeen[ch.id] = 1;
  if (!Array.isArray(ch.sections) || !ch.sections.length) errors.push("经典篇无 sections: " + ch.id);
  let n = 0;
  for (const s of ch.sections || []) {
    n++;
    if (!s.original) errors.push("条文缺原文: " + ch.id + " 第" + n + "条");
    if (!s.translation) errors.push("条文缺译文: " + ch.id + " 第" + n + "条");
    if (!s.translation.includes("AI 参考译文") && s.translation) warn.push("译文缺「AI 参考译文」标注: " + ch.id + " 第" + n + "条");
  }
  if (ch.source && !ch.source.includes("《")) warn.push("篇章 source 疑似缺书名号: " + ch.id);
}
for (const nj of nanjing) {
  if (cIdSeen[nj.id]) errors.push("经典篇章 id 重复: " + nj.id);
  cIdSeen[nj.id] = 1;
  if (typeof nj.num !== "number") errors.push("难经缺 num: " + nj.id);
  // 难经是平铺结构：original/translation/keynotes 在条目级
  if (!nj.original) errors.push("难经缺原文: " + nj.id);
  if (!nj.translation) errors.push("难经缺译文: " + nj.id);
  if (!nj.keynotes) errors.push("难经缺零基础要点: " + nj.id);
}

/* ---------- 对比卡组 ---------- */
const gIdSeen = {};
for (const g of window.COMPARE_GROUPS || []) {
  if (gIdSeen[g.id]) errors.push("对比卡组 id 重复: " + g.id);
  gIdSeen[g.id] = 1;
  if (!g.title || !g.intro || !g.tip) errors.push("对比卡组缺 title/intro/tip: " + (g.id || "?"));
  if (!Array.isArray(g.ids) || g.ids.length < 2) errors.push("对比卡组 ids 少于 2 穴: " + g.id);
  for (const pid of g.ids || []) {
    const p = seen[pid];
    if (!p) errors.push("对比卡组引用不存在的穴位 id: " + g.id + " → " + pid);
    else if (!p.detailed) errors.push("对比卡组引用了非精讲穴: " + g.id + " → " + pid);
  }
}

/* ---------- 汇总 ---------- */
console.log("== 针经堂数据校验 ==");
console.log("精讲穴 " + pts.filter((p) => p.detailed).length + " / 总条目 " + pts.length +
  "；经脉索引 " + idx.length + " 条；理论 " + theory.length + " 课；灵枢 " + lingshu.length + " 篇 + 难经 " + nanjing.length + " 难");
if (warn.length) {
  console.log("警告 " + warn.length + " 条：");
  warn.forEach((w) => console.log("  ⚠ " + w));
}
if (errors.length) {
  console.log("错误 " + errors.length + " 条：");
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
}
console.log("全部通过 ✓");

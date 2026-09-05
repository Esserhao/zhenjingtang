// 2026-09-03 批五修复：ST 五穴（ST2/ST8/ST18/ST28/ST29）从 ST9 前挪到各自正确锚点
const fs = require("fs");
const FILE = "data/acupoints-1.js";
let src = fs.readFileSync(FILE, "utf8");

// 取单个条目块（含尾逗号）
function takeBlock(s, id) {
  const marker = 'id: "' + id + '"';
  const idPos = s.indexOf(marker);
  if (idPos < 0) throw new Error("找不到 " + id);
  const start = s.lastIndexOf("\n  {", idPos) + 1;
  const end = s.indexOf("\n  },\n", start);
  if (end < 0) throw new Error("取块失败 " + id);
  return { s: s.slice(start, end + 6), pos: start };
}

// 1. 摘出五个错位条目
const ids = ["ST2", "ST8", "ST18", "ST28", "ST29"];
const blocks = {};
for (const id of ids) {
  const b = takeBlock(src, id);
  blocks[id] = b.s;
  src = src.slice(0, b.pos) + src.slice(b.pos + b.s.length);
}

// 2. 按正确锚点重新插入
function insertBefore(s, anchorId, block) {
  const idPos = s.indexOf('id: "' + anchorId + '"');
  if (idPos < 0) throw new Error("找不到锚点 " + anchorId);
  const open = s.lastIndexOf("\n  {", idPos) + 1;
  return s.slice(0, open) + block + s.slice(open);
}
src = insertBefore(src, "ST4", blocks.ST2);
src = insertBefore(src, "ST9", blocks.ST8);
src = insertBefore(src, "ST25", blocks.ST18);
src = insertBefore(src, "ST34", blocks.ST28);
src = insertBefore(src, "ST34", blocks.ST29); // 插在 ST28 之后、ST34 之前

fs.writeFileSync(FILE, src, "utf8");
console.log("ST 五穴归位完成，长度", src.length);

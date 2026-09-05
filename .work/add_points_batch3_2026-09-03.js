// 2026-09-03 批三：补 BL31-34 八髎 + BL43 膏肓（5 穴），插入 acupoints-2.js 的 BL 块
// 匹配既有 schema：无 simple 字段（简便取穴并入 location），care 为自我保健风格。
// 锚点法：先插入 BL31-34（BL39 前），再插入 BL43（BL57 前）。
const fs = require("fs");
const FILE = "data/acupoints-2.js";

function render(p) {
  const ind = (s) => (s === "" ? '""' : JSON.stringify(s));
  return "  {\n" +
    '    id: ' + JSON.stringify(p.id) + ', name: ' + JSON.stringify(p.name) + ', pinyin: ' + JSON.stringify(p.pinyin) + ', meridian: ' + JSON.stringify(p.meridian) + ',\n' +
    '    special: ' + ind(p.special) + ',\n' +
    '    location: ' + ind(p.location) + ',\n' +
    '    care: ' + ind(p.care) + ',\n' +
    '    indications: [' + p.indications.map((x) => JSON.stringify(x)).join(",") + '],\n' +
    '    classic: ' + ind(p.classic) + ',\n' +
    '    caution: ' + ind(p.caution) + ',\n' +
    '    detailed: true\n' +
    "  },\n";
}

function insertBeforeId(src, anchorId, entries) {
  const marker = 'id: "' + anchorId + '"';
  const idPos = src.indexOf(marker);
  if (idPos < 0) throw new Error("找不到锚点 id: " + anchorId);
  const openBrace = src.lastIndexOf("\n  {", idPos);
  if (openBrace < 0) throw new Error("回溯不到条目起始花括号（锚点 " + anchorId + "）");
  const block = entries.map(render).join("");
  return src.slice(0, openBrace + 1) + block + src.slice(openBrace + 1);
}

const bl31_34 = [
  {
    id: "BL31", name: "上髎", pinyin: "Shàngliáo", meridian: "足太阳膀胱经",
    special: "八髎穴",
    location: "在骶部，正对第1骶后孔中。简便取穴：俯卧，沿骶骨正中嵴两侧自上而下摸第一对凹陷。",
    care: "用掌根或拇指按揉2-3分钟，每日1-2次；腰骶冷痛、宫寒者可温和灸10-15分钟，隔日1次。",
    indications: ["腰骶疼痛","月经不调","带下","遗精阳痿","大小便不利"],
    classic: "《针灸甲乙经》：上髎，在第一空腰髁下一寸，侠脊陷者中。",
    caution: "孕妇慎用。"
  },
  {
    id: "BL32", name: "次髎", pinyin: "Cìliáo", meridian: "足太阳膀胱经",
    special: "八髎穴",
    location: "在骶部，正对第2骶后孔中。简便取穴：髂后上棘内下方凹陷处即是，八髎自上而下第二对孔。",
    care: "拇指按揉2-3分钟，每日1-2次；痛经、腰骶酸痛者可温和灸10-15分钟，经前一周开始每日1次。",
    indications: ["痛经","月经不调","带下","遗精阳痿","小便不利","腰骶痛","下肢痿痹"],
    classic: "《针灸大成》：主妇人赤白带下，小便淋沥不通。",
    caution: "孕妇慎用；八髎中最常用的一穴，妇科与泌尿生殖病症多配伍使用。"
  },
  {
    id: "BL33", name: "中髎", pinyin: "Zhōngliáo", meridian: "足太阳膀胱经",
    special: "八髎穴",
    location: "在骶部，正对第3骶后孔中。简便取穴：次髎往下摸到的第三对凹陷。",
    care: "拇指按揉2-3分钟，每日1-2次；可配合温和灸10-15分钟，隔日1次。",
    indications: ["便秘","泄泻","小便不利","月经不调","带下","腰骶痛"],
    classic: "《针灸甲乙经》：中髎，在第三空侠脊陷者中。",
    caution: "孕妇慎用。"
  },
  {
    id: "BL34", name: "下髎", pinyin: "Xiàliáo", meridian: "足太阳膀胱经",
    special: "八髎穴",
    location: "在骶部，正对第4骶后孔中。简便取穴：骶骨下端、尾骨上方最后一对凹陷。",
    care: "拇指按揉2-3分钟，每日1-2次；可配合温和灸10-15分钟，隔日1次。",
    indications: ["腹痛","便秘","小便不利","带下","腰骶痛"],
    classic: "《针灸甲乙经》：下髎，在第四空侠脊陷者中。",
    caution: "孕妇慎用。"
  }
];

const bl43 = {
  id: "BL43", name: "膏肓", pinyin: "Gāohuāng", meridian: "足太阳膀胱经",
  special: "无",
  location: "在脊柱区，第4胸椎棘突下，后正中线旁开3寸。简便取穴：正坐低头，颈后最突起的大椎骨往下数4个棘突即第4胸椎，其下旁开四横指。",
  care: "本穴传统以灸法著称：温和灸或隔姜灸10-20分钟，隔日1次，适合体虚易感冒、久咳之人；也可双手握空拳轻叩。成人须经医师指导后再行艾灸，儿童不宜自行施灸。",
  indications: ["咳嗽气喘","盗汗","健忘","体虚易感冒","虚劳诸证"],
  classic: "《千金要方》：膏肓俞无所不治，主羸瘦虚损，梦中失精，上气咳逆。",
  caution: "深部为肺脏，切忌用力重按或深刺；灸量宜循序渐进，阴虚火旺者慎灸。"
};

let src = fs.readFileSync(FILE, "utf8");
const before = src.length;
src = insertBeforeId(src, "BL39", bl31_34);
src = insertBeforeId(src, "BL57", [bl43]);
fs.writeFileSync(FILE, src, "utf8");
console.log("插入完成：八髎 4 穴 + 膏肓 1 穴，文件长度", before, "->", src.length);

/* 一次性插入脚本：向 acupoints-1.js / acupoints-2.js 补入第二批 11 个特定穴
   （郄穴 8、下合穴 2、八脉交会穴 1）——2026-09-03
   运行：node .work/add_points_batch2_2026-09-03.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

/* ---------- 条目定义 ---------- */
// 足阳明胃经（文件1）
const ST39 = { id: "ST39", name: "下巨虚", pinyin: "Xiàjùxū", meridian: "足阳明胃经",
  special: "手太阳小肠经之下合穴",
  location: "在小腿外侧，犊鼻（外膝眼）下9寸，犊鼻与解溪连线上。简便取穴：足三里直下6寸，即上巨虚（足三里下3寸）再下3寸处。",
  care: "拇指或掌根按揉2-3分钟，每日1-2次；小腹隐痛、泄泻时配合上巨虚往返按揉。",
  indications: ["小腹痛","泄泻","痢疾","乳痈","下肢痿痹","腰脊痛引睾丸"],
  classic: "", caution: "", detailed: true };
// 足太阳膀胱经（文件2）
const BL39 = { id: "BL39", name: "委阳", pinyin: "Wěiyáng", meridian: "足太阳膀胱经",
  special: "手少阳三焦经之下合穴",
  location: "在膝部，腘横纹上，股二头肌腱的内侧缘。简便取穴：腘窝（膝后窝）横纹外侧端、可摸到大筋（股二头肌腱）内侧的凹陷，与委中（横纹中点）相邻。",
  care: "坐位屈膝，拇指按揉1-2分钟，酸胀为度；小便不畅时可与委中配合轻揉。",
  indications: ["腹满","小便不利","腰脊强痛","腿足挛痛"],
  classic: "", caution: "", detailed: true };
const BL59 = { id: "BL59", name: "跗阳", pinyin: "Fūyáng", meridian: "足太阳膀胱经",
  special: "阳跷脉之郄穴",
  location: "在小腿后区，昆仑穴（外踝尖与跟腱之间）直上3寸，腓骨与跟腱之间。简便取穴：外踝尖与跟腱连线中点向上四横指宽、两条大筋之间的凹陷。",
  care: "拇指或掌根按揉2分钟，每日1-2次；久走久站后小腿酸胀可自下而上推揉至此。",
  indications: ["头重","头痛","腰骶疼痛","下肢痿痹","外踝肿痛"],
  classic: "", caution: "", detailed: true };
const BL62 = { id: "BL62", name: "申脉", pinyin: "Shēnmài", meridian: "足太阳膀胱经",
  special: "八脉交会穴之一，通阳跷脉",
  location: "在踝区，外踝尖直下，外踝下缘与骰骨之间凹陷中。简便取穴：外踝最突起点的正下方凹陷，按之酸胀。",
  care: "拇指指腹按揉2-3分钟，每日1-2次；传统上申脉配照海调理睡眠节律（阳跷主昼、阴跷主夜），白天倦怠可揉申脉，夜不能寐可揉照海。",
  indications: ["头痛","眩晕","癫狂痫","失眠","嗜卧","腰腿酸痛","目赤肿痛","项强"],
  classic: "", caution: "", detailed: true };
const BL63 = { id: "BL63", name: "金门", pinyin: "Jīnmén", meridian: "足太阳膀胱经",
  special: "足太阳膀胱经郄穴",
  location: "在足背，外踝前缘直下，第5跖骨粗隆后方，骰骨下缘凹陷中。简便取穴：足外侧缘、外踝前下方延至小趾根的骨缝里，按压酸胀明显的凹陷。",
  care: "拇指指尖掐按1-2分钟，酸胀为度；急性腰痛、外踝扭伤时轻揉周围。",
  indications: ["头痛","癫痫","小儿惊风","腰痛","外踝肿痛","下肢痹痛"],
  classic: "", caution: "外踝扭伤急性肿胀期不宜用力按压。", detailed: true };
// 足少阴肾经（文件2）
const KI5 = { id: "KI5", name: "水泉", pinyin: "Shuǐquán", meridian: "足少阴肾经",
  special: "足少阴肾经郄穴",
  location: "在足跟区，太溪穴直下1寸，跟骨结节内侧凹陷中。简便取穴：内踝尖与跟腱之间（太溪）垂直向下一拇指宽、跟骨内侧的凹陷。",
  care: "拇指指腹按揉2分钟，每日1-2次；妇科虚寒不适可配温和灸（须防烫伤，参照灸法安全课）。",
  indications: ["月经不调","痛经","经闭","阴挺","小便不利","目昏花"],
  classic: "", caution: "孕期慎按；妇科急症（剧烈腹痛、异常出血）先就医。", detailed: true };
const KI8 = { id: "KI8", name: "交信", pinyin: "Jiāoxìn", meridian: "足少阴肾经",
  special: "阴跷脉之郄穴",
  location: "在小腿内侧，内踝尖上2寸，胫骨内侧缘后方凹陷中。简便取穴：复溜穴（太溪直上2寸）再向前约半横指、贴胫骨后缘。",
  care: "拇指按揉2分钟，每日1-2次；崩漏、经期紊乱属虚者可配三阴交轻揉。",
  indications: ["月经不调","崩漏","泄泻","便秘","睾丸肿痛","失眠"],
  classic: "", caution: "", detailed: true };
// 手少阳三焦经（文件2）
const TE7 = { id: "TE7", name: "会宗", pinyin: "Huìzōng", meridian: "手少阳三焦经",
  special: "手少阳三焦经郄穴",
  location: "在前臂后区，腕背侧远端横纹上3寸，尺骨的桡侧缘。简便取穴：外关穴（腕背横纹上2寸）再向上1寸、偏向小指侧贴尺骨边缘。",
  care: "对侧拇指按揉2分钟，每日1-2次，酸胀为度。",
  indications: ["耳聋","痫证","上肢肌肤痛"],
  classic: "", caution: "", detailed: true };
// 足少阳胆经（文件2）
const GB35 = { id: "GB35", name: "阳交", pinyin: "Yángjiāo", meridian: "足少阳胆经",
  special: "阳维脉之郄穴",
  location: "在小腿外侧，外踝尖上7寸，腓骨后缘。简便取穴：外踝尖直上约一掌宽再加大拇指（7寸），腓骨后缘凹陷，与外丘穴前后相邻。",
  care: "拇指按揉2分钟，每日1-2次；胸胁苦闷时可与外丘配合前后对揉。",
  indications: ["惊狂","癫痫","瘛疭","胸胁满痛","下肢痿痹"],
  classic: "", caution: "", detailed: true };
const GB36 = { id: "GB36", name: "外丘", pinyin: "Wàiqiū", meridian: "足少阳胆经",
  special: "足少阳胆经郄穴",
  location: "在小腿外侧，外踝尖上7寸，腓骨前缘。简便取穴：阳交穴（腓骨后缘）同一水平、翻到腓骨前缘即是；急慢性胆绞痛发作时此穴常有明显压痛。",
  care: "拇指按揉2分钟，每日1-2次；肋间神经痛、胆区不适时可与阳陵泉配合按揉。",
  indications: ["颈项强痛","胸胁痛","癫狂","下肢痿痹"],
  classic: "", caution: "", detailed: true };
// 足厥阴肝经（文件2）
const LV6 = { id: "LV6", name: "中都", pinyin: "Zhōngdū", meridian: "足厥阴肝经",
  special: "足厥阴肝经郄穴",
  location: "在小腿内侧，内踝尖上7寸，胫骨内侧面的中央。简便取穴：蠡沟穴（内踝尖上5寸）再直上2寸，贴胫骨内侧面。",
  care: "拇指按揉2分钟，每日1-2次；经前小腹胀痛时可配三阴交上下往返按揉。",
  indications: ["疝气","崩漏","腹痛","泄泻","恶露不尽"],
  classic: "", caution: "", detailed: true };

/* ---------- 插入配置 ---------- */
const PLAN = {
  "acupoints-1.js": [
    { anchor: "ST40", entries: [ST39] },
  ],
  "acupoints-2.js": [
    { anchor: "BL40", entries: [BL39] },
    { anchor: "BL60", entries: [BL59] },
    { anchor: "BL64", entries: [BL62, BL63] },
    { anchor: "KI6",  entries: [KI5] },
    { anchor: "KI9",  entries: [KI8] },
    { anchor: "TE10", entries: [TE7] },
    { anchor: "GB37", entries: [GB35, GB36] },
    { anchor: "LV8",  entries: [LV6] },
  ],
};

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

let total = 0;
for (const [file, groups] of Object.entries(PLAN)) {
  const fp = path.join(ROOT, "data", file);
  let text = fs.readFileSync(fp, "utf8");
  for (const g of groups) {
    const anchorIdx = text.indexOf('id: "' + g.anchor + '"');
    if (anchorIdx < 0) throw new Error(file + " 找不到锚点 " + g.anchor);
    const openBrace = text.lastIndexOf("\n  {", anchorIdx);
    if (openBrace < 0) throw new Error(file + " 锚点 " + g.anchor + " 前找不到条目起始花括号");
    const insertAt = openBrace + 1;
    const block = g.entries.map(render).join("");
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
    total += g.entries.length;
    console.log(file, "锚点", g.anchor, "←", g.entries.map((e) => e.id + " " + e.name).join("、"));
  }
  fs.writeFileSync(fp, text, "utf8");
}
console.log("\n共插入", total, "个条目");

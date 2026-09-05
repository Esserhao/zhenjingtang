// 2026-09-03 批四：追加经外奇穴精讲 5 穴（太阳/印堂/腰痛点/胆囊/阑尾）到 acupoints-2.js 末尾
// 锚点：文件末尾的 "];"，在最后一个条目的收尾 "  }\n];" 处插入。
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

const ex = [
  {
    id: "EX-HN4", name: "太阳", pinyin: "Tàiyáng", meridian: "经外奇穴",
    special: "经外奇穴",
    location: "在头部，眉梢与目外眦之间，向后约一横指的凹陷处。简便取穴：眉梢和外眼角连线中点再往后摸，按到凹陷酸痛处即是。",
    care: "双手拇指或中指指腹按揉1-2分钟，酸胀为度，每日2-3次；眼疲劳、头痛时随按随用。",
    indications: ["头痛","偏头痛","目赤肿痛","眼疲劳","牙痛","口眼歪斜"],
    classic: "《圣济总录》：眼小眦后一寸，太阳穴，不可伤。（据文献概述）",
    caution: "穴位深部有颞浅血管，古籍明言「不可伤」——切勿自行针刺、放血或用力重按；针刺须由医师操作。"
  },
  {
    id: "EX-HN3", name: "印堂", pinyin: "Yìntáng", meridian: "经外奇穴",
    special: "经外奇穴",
    location: "在头部，两眉毛内侧端中间的凹陷处。简便取穴：两眉头连线的中点。",
    care: "中指指腹按揉1-2分钟，或用两手拇指交替从印堂向上推至发际30次（开天门），睡前做有助入睡。",
    indications: ["头痛","眩晕","失眠","鼻塞鼻渊","小儿惊风"],
    classic: "《玉龙经》：印堂，在两眉间宛宛中。（据文献概述）",
    caution: "捏起皮肤进针等针法须由医师操作；自行按摩无碍。"
  },
  {
    id: "EX-UE7", name: "腰痛点", pinyin: "Yāotòngdiǎn", meridian: "经外奇穴",
    special: "经外奇穴",
    location: "在手背，第2、3掌骨及第4、5掌骨之间，腕横纹与掌指关节中点处，一侧两穴。简便取穴：手背朝上，指总伸肌腱两侧、腕背横纹下约一横指处。",
    care: "急性腰扭伤时用拇指用力按压，同时缓慢转动腰部、弯伸活动，左右手各按1-2分钟。",
    indications: ["急性腰扭伤","腰肌劳损","头痛"],
    classic: "《常用新医疗法手册》等现代文献收载（概述）。",
    caution: "急性腰扭伤若伴下肢放射痛、麻木，或久不缓解，须就医排查腰椎间盘等问题。"
  },
  {
    id: "EX-LE5", name: "胆囊", pinyin: "Dǎnnáng", meridian: "经外奇穴",
    special: "经外奇穴",
    location: "在小腿外侧，腓骨小头前下方凹陷处（阳陵泉）直下2寸。简便取穴：阳陵泉下约三横指，胆囊病压痛最明显处。",
    care: "拇指按揉2-3分钟，每日1-2次；慢性胆囊炎、消化不良者可配合艾灸10-15分钟。",
    indications: ["胆囊炎","胆石症","胆绞痛","下肢痿痹"],
    classic: "现代临床经验穴（概述），在部分国家标准中作为下肢奇穴收载。",
    caution: "急性胆绞痛发作或发热黄疸时须立即就医，按摩不能替代治疗。"
  },
  {
    id: "EX-LE6", name: "阑尾", pinyin: "Lánwěi", meridian: "经外奇穴",
    special: "经外奇穴",
    location: "在小腿外侧，犊鼻下5寸（足三里直下2寸）附近，阑尾炎时压痛明显处。简便取穴：外膝眼正下约一掌宽处按压找最痛点。",
    care: "拇指按揉2-3分钟，每日1-2次；用于慢性调理与辅助观察，可配合艾灸10-15分钟。",
    indications: ["阑尾炎","消化不良","下肢痿痹"],
    classic: "现代临床经验穴（概述），在部分国家标准中作为下肢奇穴收载。",
    caution: "疑似急性阑尾炎（右下腹持续疼痛、发热、恶心呕吐）须立即就医，切勿依赖按摩拖延。"
  }
];

let src = fs.readFileSync(FILE, "utf8");
const tail = "\n];";
const tailPos = src.lastIndexOf(tail);
if (tailPos < 0) throw new Error("找不到结尾 ];");
const tailPart = src.slice(tailPos); // "\n];"
const head = src.slice(0, tailPos);
if (/,\s*$/.test(head)) throw new Error("末条目已带逗号，与预期不符，中止");
// 原末条目无尾逗号：补 "},\n" 再接新条目（条目间逗号），最后不加尾逗号
const entries = ex.map(render).map((s) => s.replace(/,\n$/, "")).join(",\n");
src = head + ",\n" + entries + tailPart;
fs.writeFileSync(FILE, src, "utf8");
console.log("追加 5 个奇穴精讲，文件长度", head.length, "->", src.length);

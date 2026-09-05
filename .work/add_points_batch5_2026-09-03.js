// 2026-09-03 批五：常用要穴扩容 26 个（ST5 SI1 BL4 TE2 GB2 CV4 GV4 EX4）
// ST 插 acupoints-1.js，其余插 acupoints-2.js；EX 追加文件尾。锚点=同经下一个已有精讲穴 id。
const fs = require("fs");

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

const ST = "足阳明胃经", SI = "手太阳小肠经", BL = "足太阳膀胱经", TE = "手少阳三焦经", GB = "足少阳胆经", CV = "任脉", GV = "督脉", EXM = "经外奇穴";

/* 足阳明胃经 → acupoints-1.js */
const st = {
  anchor: "ST9",
  entries: [
    {
      id: "ST2", name: "四白", pinyin: "Sìbái", meridian: ST, special: "无",
      location: "在面部，目正视，瞳孔直下，眶下孔凹陷处。简便取穴：双眼平视，瞳孔直下约一横指、颧骨上的小凹陷，按压有明显酸胀感。",
      care: "食指指腹轻揉1分钟，每日2-3次；用眼过度、面部麻木不适时随按随用。",
      indications: ["目赤痛痒","眼睑瞤动","面痛","面瘫","头痛眩晕"],
      classic: "《针灸甲乙经》载四白在目下一寸、颧骨孔处（据原书概述）。",
      caution: "眶下孔深部血管神经丰富，不可深刺、不可用力重按；针刺须由医师操作。"
    },
    {
      id: "ST8", name: "头维", pinyin: "Tóuwéi", meridian: ST, special: "无",
      location: "在头部，额角发际直上0.5寸，头正中线旁开4.5寸。简便取穴：额角入发际约半横指处，咀嚼时该处肌肉微动。",
      care: "双手拇指或食指按揉1-2分钟，酸胀为度，每日2-3次；偏头痛发作时配合太阳穴按揉。",
      indications: ["头痛","偏头痛","目眩","目痛","迎风流泪"],
      classic: "《针灸甲乙经》载头维在额角发际、本神两旁各一寸五分（据原书概述）。",
      caution: "本穴一般不灸。"
    },
    {
      id: "ST18", name: "乳根", pinyin: "Rǔgēn", meridian: ST, special: "无",
      location: "在胸部，第5肋间隙，前正中线旁开4寸。简便取穴：乳头直下一个肋间隙、乳房根部。",
      care: "指腹按揉2分钟，每日1-2次；哺乳期乳胀可配合轻柔梳理与热敷。",
      indications: ["咳嗽气喘","胸痛胸闷","乳痈","乳汁少"],
      classic: "《针灸甲乙经》载乳根在乳下一寸六分陷者中（据原书概述）。",
      caution: "乳头乳晕不施针；本穴深部为肺，不可深刺，针刺须由医师操作。"
    },
    {
      id: "ST28", name: "水道", pinyin: "Shuǐdào", meridian: ST, special: "无",
      location: "在下腹部，脐中下3寸，前正中线旁开2寸。简便取穴：关元穴旁开约两横指。",
      care: "掌根按揉2-3分钟，每日1-2次；小便不利、下肢水肿者可温和灸10-15分钟。",
      indications: ["小便不利","水肿","小腹胀满","疝气","痛经","不孕"],
      classic: "《针灸甲乙经》载水道在大巨下三寸（据原书概述）。",
      caution: "孕妇慎用。"
    },
    {
      id: "ST29", name: "归来", pinyin: "Guīlái", meridian: ST, special: "无",
      location: "在下腹部，脐中下4寸，前正中线旁开2寸。简便取穴：中极穴旁开约两横指。",
      care: "掌根按揉2-3分钟；妇科调理、痛经者可温和灸10-15分钟，经前一周开始每日1次。",
      indications: ["腹痛","疝气","月经不调","带下","阴挺","闭经"],
      classic: "《针灸甲乙经》载归来（一名溪穴）在水道下二寸（据原书概述）。",
      caution: "孕妇慎用。"
    }
  ],
  extra: [
    {
      id: "ST38", name: "条口", pinyin: "Tiáokǒu", meridian: ST, special: "无",
      location: "在小腿外侧，犊鼻（外膝眼）下8寸，犊鼻与解溪连线上。简便取穴：外膝眼到足踝连线的中点附近、胫骨前缘外一横指。",
      care: "拇指按揉2分钟，两腿各按；肩周炎者可一边重按条口、一边缓慢活动肩关节（条口经验用法）。",
      indications: ["下肢痿痹","小腿转筋","肩臂痛","跗肿"],
      classic: "《针灸甲乙经》载条口在下廉上一寸（据原书概述）。",
      caution: "无。"
    }
  ]
};
/* 条口(ST38) 锚点单独处理：插在 ST39（下巨虚）前 */

/* 手太阳小肠经 → acupoints-2.js */
const si = {
  anchor: "SI19",
  entries: [
    {
      id: "SI18", name: "颧髎", pinyin: "Quánliáo", meridian: SI, special: "手少阳、手太阳经交会穴",
      location: "在面部，颧骨下缘凹陷处，目外眦直下。简便取穴：外眼角直下、颧骨下缘的小凹陷，按压酸痛。",
      care: "指腹轻揉1分钟，每日2-3次；面痛、牙痛不适时随按随用。",
      indications: ["口眼歪斜","面痛","齿痛","面肿","眼睑瞤动"],
      classic: "《针灸甲乙经》载颧髎在面頄骨下廉陷者中（据原书概述）。",
      caution: "面部血管丰富，针刺须由医师操作。"
    }
  ]
};

/* 足太阳膀胱经 → acupoints-2.js */
const blA = {
  anchor: "BL13",
  entries: [
    {
      id: "BL11", name: "大杼", pinyin: "Dàzhù", meridian: BL, special: "骨会（八会穴之一）",
      location: "在脊柱区，第1胸椎棘突下，后正中线旁开1.5寸。简便取穴：低头，颈后最突起的大椎骨往下数1个棘突，旁开约两横指。",
      care: "掌根按揉2-3分钟；颈肩僵硬、易感冒者可温和灸10-15分钟，隔日1次。",
      indications: ["咳嗽","发热","项强","肩背痛","骨节酸痛"],
      classic: "《难经·四十五难》：「骨会大杼。」骨病可取大杼。",
      caution: "本穴深部近肺尖，不可深刺，针刺须由医师操作。"
    },
    {
      id: "BL12", name: "风门", pinyin: "Fēngmén", meridian: BL, special: "无",
      location: "在脊柱区，第2胸椎棘突下，后正中线旁开1.5寸。简便取穴：大椎骨往下数2个棘突，旁开约两横指。",
      care: "感冒初起、受凉打喷嚏时按揉2-3分钟，或家人帮温和灸10-15分钟，每日1次；平时易感冒者隔日灸1次。",
      indications: ["伤风咳嗽","发热头痛","项强","鼻塞","胸背痛","荨麻疹"],
      classic: "《针灸甲乙经》载风门（一名热府）在第二椎下两旁各一寸五分（据原书概述）。",
      caution: "深部为肺，忌深刺；灸后避风保暖。"
    }
  ]
};
const blB = {
  anchor: "BL57",
  entries: [
    {
      id: "BL52", name: "志室", pinyin: "Zhìshì", meridian: BL, special: "无",
      location: "在腰区，第2腰椎棘突下，后正中线旁开3寸。简便取穴：命门穴（与肚脐相平）旁开约四横指。",
      care: "掌根按揉或温和灸10-15分钟，用于腰膝酸软、遗精频作，隔日1次。",
      indications: ["遗精","阳痿","小便不利","腰脊强痛","水肿"],
      classic: "《针灸甲乙经》载志室在第十四椎下两旁各三寸（据原书概述）。",
      caution: "孕妇慎用。"
    },
    {
      id: "BL54", name: "秩边", pinyin: "Zhìbiān", meridian: BL, special: "无",
      location: "在骶区，骶正中嵴旁开3寸，平第4骶后孔。简便取穴：尾骨上方、臀部外下侧按压最酸处。",
      care: "握空拳轻叩或掌根按揉2-3分钟；久坐腰骶酸痛者每日1-2次。",
      indications: ["腰骶痛","下肢痿痹","坐骨神经痛","小便不利","便秘","痔疾","阴痛"],
      classic: "《针灸甲乙经》载秩边在第二十一椎下两旁各三寸陷者中（据原书概述）。",
      caution: "孕妇慎用。"
    }
  ]
};

/* 手少阳三焦经 → acupoints-2.js */
const te = {
  anchor: "TE23",
  entries: [
    {
      id: "TE17", name: "翳风", pinyin: "Yìfēng", meridian: TE, special: "无",
      location: "在颈后区，耳垂后方，乳突前下方凹陷处。简便取穴：耳垂后缘与下颌角之间的小凹陷。",
      care: "指腹按揉1-2分钟，每日2-3次；耳鸣、耳闷时随按随用。",
      indications: ["耳鸣耳聋","口眼歪斜","牙关不利","颊肿","瘰疬"],
      classic: "《针灸甲乙经》载翳风在耳后陷者中，按之引耳中痛（据原书概述）。",
      caution: "穴位深部为面神经与腮腺，针刺须由医师操作。"
    },
    {
      id: "TE21", name: "耳门", pinyin: "Ěrmén", meridian: TE, special: "无",
      location: "在耳区，耳屏上切迹前方，下颌骨髁状突后缘凹陷处。简便取穴：张口时耳屏前方出现的凹陷。",
      care: "张口位用指腹轻揉1分钟，每日2-3次。",
      indications: ["耳鸣耳聋","聤耳","齿痛","面瘫","颔颊肿"],
      classic: "《针灸甲乙经》载耳门在耳前起肉当耳缺者（据原书概述）。",
      caution: "针刺须张口、由医师操作。"
    }
  ]
};

/* 足少阳胆经 → acupoints-2.js */
const gbA = {
  anchor: "GB14",
  entries: [
    {
      id: "GB8", name: "率谷", pinyin: "Shuàigǔ", meridian: GB, special: "无",
      location: "在头部，耳尖直上入发际1.5寸。简便取穴：把耳朵向前折，耳尖正上方入发际约一横指半。",
      care: "指腹按揉1-2分钟，每日2-3次；偏头痛发作时配合太阳、风池。",
      indications: ["偏头痛","眩晕","呕吐","烦躁","小儿惊风"],
      classic: "《针灸甲乙经》载率谷在耳上入发际一寸五分（据原书概述）。",
      caution: "婴幼儿囟门未闭者头部穴位禁刺。"
    }
  ]
};
const gbB = {
  anchor: "GB34",
  entries: [
    {
      id: "GB31", name: "风市", pinyin: "Fēngshì", meridian: GB, special: "无",
      location: "在股部，大腿外侧正中，腘横纹上7寸。简便取穴：直立垂手，中指尖所点处即是。",
      care: "空掌拍打或按揉2-3分钟，两腿各做；久坐腿麻、下肢怕冷者每日1-2次。",
      indications: ["下肢痿痹","麻木","半身不遂","遍身瘙痒","脚气"],
      classic: "《针灸甲乙经》载风市（实际首见于《肘后备急方》等文献）在大腿外侧垂手中指尖处（概述）。",
      caution: "无。"
    }
  ]
};

/* 任脉 → acupoints-2.js */
const cvA = {
  anchor: "CV12",
  entries: [
    {
      id: "CV9", name: "水分", pinyin: "Shuǐfēn", meridian: CV, special: "无",
      location: "在上腹部，脐中上1寸。简便取穴：肚脐正上方一横指。",
      care: "掌摩2-3分钟，每日1-2次；水肿、腹胀者可温和灸10-15分钟。",
      indications: ["水肿","小便不利","腹痛","泄泻","反胃"],
      classic: "《针灸甲乙经》载水分在下脘下一寸（据原书概述）。",
      caution: "孕妇慎用。"
    },
    {
      id: "CV10", name: "下脘", pinyin: "Xiàwǎn", meridian: CV, special: "无",
      location: "在上腹部，脐中上2寸。简便取穴：肚脐正上方约两横指、中脘与神阙之间。",
      care: "掌摩或温和灸10-15分钟，用于胃脘胀满、消化不良、食欲差，每日或隔日1次。",
      indications: ["脘腹胀满","呕吐","泄泻","食谷不化","胃痛"],
      classic: "《针灸甲乙经》载下脘在建里下一寸（据原书概述）。",
      caution: "孕妇慎用。"
    }
  ]
};
const cvB = {
  anchor: "CV17",
  entries: [
    {
      id: "CV15", name: "鸠尾", pinyin: "Jiūwěi", meridian: CV, special: "任脉络穴",
      location: "在上腹部，前正中线上，剑胸结合部（胸剑结合）下1寸。简便取穴：胸骨下端剑突下缘。",
      care: "指腹轻按揉1分钟；本穴不宜重手法。",
      indications: ["心痛心悸","胸满咳喘","呕吐","癫狂痫"],
      classic: "《针灸甲乙经》载鸠尾在臆前弊骨下五分（据原书概述）。",
      caution: "深部近肝左叶与心脏，忌深刺、忌暴力按压；针刺须由医师操作；孕妇慎用。"
    }
  ]
};
const cvC = {
  anchor: "CV23",
  entries: [
    {
      id: "CV22", name: "天突", pinyin: "Tiāntū", meridian: CV, special: "无",
      location: "在颈前区，胸骨上窝中央，前正中线上。简便取穴：仰头，锁骨中间的凹陷处。",
      care: "食指指腹沿胸骨窝向内向下轻按1分钟，咳嗽咽痒、咽部异物感时用；不掌握手法者只做轻揉。",
      indications: ["咳嗽气喘","咽喉肿痛","失音","梅核气","瘿气"],
      classic: "《针灸甲乙经》载天突在颈结喉下二寸中央宛宛中（据原书概述）。",
      caution: "穴下紧邻气管与大血管，严禁垂直深刺、暴力按压；针刺由医师沿胸骨柄后缘斜刺操作。"
    }
  ]
};

/* 督脉 → acupoints-2.js */
const gvA = {
  anchor: "GV4",
  entries: [
    {
      id: "GV3", name: "腰阳关", pinyin: "Yāoyángguān", meridian: GV, special: "无",
      location: "在脊柱区，第4腰椎棘突下凹陷中，后正中线上。简便取穴：两侧髂嵴最高点连线平第4腰椎，连线与后正中线交点处。",
      care: "掌根按揉或搓热后温灸10-20分钟，用于腰骶冷痛、遇寒加重者，隔日1次。",
      indications: ["腰骶痛","下肢痿痹","遗精阳痿","月经不调","带下"],
      classic: "《针灸甲乙经》载阳关在第十六椎节下间（据原书概述）。",
      caution: "孕妇慎用。"
    }
  ]
};
const gvB = {
  anchor: "GV12",
  entries: [
    {
      id: "GV9", name: "至阳", pinyin: "Zhìyáng", meridian: GV, special: "无",
      location: "在脊柱区，第7胸椎棘突下凹陷中，后正中线上。简便取穴：两侧肩胛骨下角连线平第7胸椎。",
      care: "掌根按揉2-3分钟；肝胆不适、胸闷者可配合温和灸10分钟。",
      indications: ["黄疸","胸胁胀痛","咳嗽气喘","脊背强痛","胃脘痛"],
      classic: "《针灸甲乙经》载至阳在第七椎下间（据原书概述）。",
      caution: "深部为脊髓所在节段，不可暴力按压。"
    }
  ]
};
const gvC = {
  anchor: "GV26",
  entries: [
    {
      id: "GV24", name: "神庭", pinyin: "Shéntíng", meridian: GV, special: "无",
      location: "在头部，前发际正中直上0.5寸。简便取穴：前额发际正中往上约半横指。",
      care: "指腹按揉1分钟，睡前按有助安神入睡。",
      indications: ["头痛","眩晕","失眠","鼻渊","癫狂痫"],
      classic: "《针灸甲乙经》载神庭在发际直上（据原书概述）。",
      caution: "小儿囟门未闭者禁刺。"
    },
    {
      id: "GV25", name: "素髎", pinyin: "Sùliáo", meridian: GV, special: "无",
      location: "在面部，鼻尖正中。",
      care: "鼻塞不通时用指端轻掐数下，有瞬时通气感；一般不做长时间揉按。",
      indications: ["鼻塞","鼻衄","鼻渊","酒糟鼻","惊厥（急救配穴）"],
      classic: "《针灸甲乙经》载素髎（一名面王）在鼻柱上端（据原书概述）。",
      caution: "穴在鼻尖皮薄处，只宜小幅度捻转、不宜提插，针刺由医师操作；一般不灸。"
    }
  ]
};

/* 经外奇穴 → acupoints-2.js 末尾追加 */
const exTail = [
  {
    id: "EX-HN1", name: "四神聪", pinyin: "Sìshéncōng", meridian: EXM, special: "经外奇穴",
    location: "在头部，百会前后左右各旁开1寸，共四穴。简便取穴：先找头顶正中的百会，再在其前后左右各一横指处。",
    care: "双手指腹依次按揉四穴，各约1分钟，每日1-2次；学习疲劳、睡不好时用。",
    indications: ["失眠健忘","头痛眩晕","癫狂痫","耳鸣"],
    classic: "「神聪四穴」见于《太平圣惠方》（据文献概述）。",
    caution: "无。"
  },
  {
    id: "EX-HN5", name: "耳尖", pinyin: "Ěrjiān", meridian: EXM, special: "经外奇穴",
    location: "在耳区，折耳向前，耳廓上方尖端处。",
    care: "用拇指食指捏住耳尖轻轻搓揉1分钟，两耳交替；目赤、咽痛时可用。",
    indications: ["目赤肿痛","眼生翳膜","咽喉肿痛","发热","麦粒肿"],
    classic: "《针灸大成》等文献载灸耳尖治眼生翳膜（据文献概述）。",
    caution: "耳尖放血是医师操作，请勿自行放血；日常只宜轻揉。"
  },
  {
    id: "EX-B1", name: "定喘", pinyin: "Dìngchuǎn", meridian: EXM, special: "经外奇穴",
    location: "在脊柱区，第7颈椎棘突下（大椎穴）旁开0.5寸。简便取穴：低头，大椎骨两侧约半横指、按压最酸处。",
    care: "拇指按揉1-2分钟，两侧各做；咳嗽气喘、脖子僵硬时用。",
    indications: ["哮喘","咳嗽","项背痛","荨麻疹"],
    classic: "现代临床经验穴（概述）。",
    caution: "深部近肺尖，不可深刺。"
  },
  {
    id: "EX-UE11", name: "十宣", pinyin: "Shíxuān", meridian: EXM, special: "经外奇穴",
    location: "在手指，十指尖端，距指甲游离缘0.1寸，左右共十穴。简便取穴：十个手指尖的正中点。",
    care: "中暑头晕、情绪急躁时用拇指指甲逐个点掐十指尖，每穴数秒，有醒神作用。",
    indications: ["昏迷晕厥","中暑","高热","咽喉肿痛","手指麻木"],
    classic: "《千金要方》等文献即载刺十指端出血救急（据文献概述）。",
    caution: "十宣放血属急救医疗操作，须由医师施行；日常自我保健只宜点掐，不放血。"
  }
];

/* ---- 执行 ---- */
// acupoints-1.js：ST 五穴（四白/头维/乳根/水道/归来 → ST9 前；条口 → ST39 前）
const F1 = "data/acupoints-1.js";
let s1 = fs.readFileSync(F1, "utf8");
const len1 = s1.length;
s1 = insertBeforeId(s1, "ST9", st.entries);          // ST2 ST8 ST18 ST28 ST29
s1 = insertBeforeId(s1, "ST39", st.extra);           // ST38
fs.writeFileSync(F1, s1, "utf8");
console.log("acupoints-1.js：ST 6 穴，", len1, "->", s1.length);

// acupoints-2.js：SI/BL/TE/GB/CV/GV + EX 尾追
const F2 = "data/acupoints-2.js";
let s2 = fs.readFileSync(F2, "utf8");
const len2 = s2.length;
s2 = insertBeforeId(s2, si.anchor, si.entries);      // SI18 → SI19 前
s2 = insertBeforeId(s2, blA.anchor, blA.entries);    // BL11 BL12 → BL13 前
s2 = insertBeforeId(s2, blB.anchor, blB.entries);    // BL52 BL54 → BL57 前
s2 = insertBeforeId(s2, te.anchor, te.entries);      // TE17 TE21 → TE23 前
s2 = insertBeforeId(s2, gbA.anchor, gbA.entries);    // GB8 → GB14 前
s2 = insertBeforeId(s2, gbB.anchor, gbB.entries);    // GB31 → GB34 前
s2 = insertBeforeId(s2, cvA.anchor, cvA.entries);    // CV9 CV10 → CV12 前
s2 = insertBeforeId(s2, cvB.anchor, cvB.entries);    // CV15 → CV17 前
s2 = insertBeforeId(s2, cvC.anchor, cvC.entries);    // CV22 → CV23 前
s2 = insertBeforeId(s2, gvA.anchor, gvA.entries);    // GV3 → GV4 前
s2 = insertBeforeId(s2, gvB.anchor, gvB.entries);    // GV9 → GV12 前
s2 = insertBeforeId(s2, gvC.anchor, gvC.entries);    // GV24 GV25 → GV26 前
// EX 追加文件尾（原末条目无尾逗号）
const tail = "\n];";
const tailPos = s2.lastIndexOf(tail);
if (tailPos < 0) throw new Error("找不到结尾 ];");
const head = s2.slice(0, tailPos);
if (/,\s*$/.test(head)) throw new Error("末条目已带逗号，中止");
const entries = exTail.map(render).map((s) => s.replace(/,\n$/, "")).join(",\n");
s2 = head + ",\n" + entries + s2.slice(tailPos);
fs.writeFileSync(F2, s2, "utf8");
console.log("acupoints-2.js：其余 20 穴，", len2, "->", s2.length);

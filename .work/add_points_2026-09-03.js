/* 一次性插入脚本：向 acupoints-1.js / acupoints-2.js 补入 30 个特定穴（2026-09-03）
   运行：node .work/add_points_2026-09-03.js
   完成并验证后本文件按 .work 惯例留档。 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

/* ---------- 条目定义（与 SCHEMA.md 完全一致的字段） ---------- */
// 足阳明胃经（文件1）
const ST42 = { id: "ST42", name: "冲阳", pinyin: "Chōngyáng", meridian: "足阳明胃经",
  special: "足阳明胃经原穴",
  location: "在足背，第2、3跖骨与中间楔状骨之间凹陷中，当拇长伸肌腱与趾长伸肌腱之间，足背动脉搏动处。简便取穴：足背最高处、能摸到动脉搏动的凹陷即是，约在内庭穴直上、解溪穴下方。",
  care: "用拇指指腹轻柔按揉1-2分钟，每日1-2次；此穴正当足背动脉，按压力度务必轻缓，以微感酸胀为度。",
  indications: ["口眼歪斜","面肿","齿痛","癫狂痫","胃病","足痿无力","足背肿痛"],
  classic: "", caution: "穴下正当足背动脉，居家只做轻揉，勿重力按压或叩击；针刺需避开动脉，应由专业医师操作。", detailed: true };
const ST43 = { id: "ST43", name: "陷谷", pinyin: "Xiàngǔ", meridian: "足阳明胃经",
  special: "足阳明胃经输穴",
  location: "在足背，第2、3跖骨间，第2跖趾关节近端凹陷中。简便取穴：内庭穴直上约2寸（约两横指），足背二三趾骨间的凹陷处。",
  care: "拇指或食指指腹按揉2-3分钟，每日1-2次，酸胀为度；足部温水泡后按揉更舒适。",
  indications: ["面浮身肿","目赤肿痛","肠鸣腹痛","足背肿痛","足痿无力"],
  classic: "", caution: "", detailed: true };
const ST44 = { id: "ST44", name: "内庭", pinyin: "Nèitíng", meridian: "足阳明胃经",
  special: "足阳明胃经荥穴",
  location: "在足背，第2、3趾间，趾蹼缘后方赤白肉际处。简便取穴：二三足趾缝纹端的凹陷即是。",
  care: "拇指指尖掐按或指腹按揉2-3分钟，每日1-2次；胃火牙痛时力度可稍重，以明显酸胀为度。",
  indications: ["齿痛","咽喉肿痛","口歪","鼻衄","胃病吐酸","腹胀","泄泻","痢疾","便秘","热病","足背肿痛"],
  classic: "", caution: "", detailed: true };
// 足太阴脾经（文件1）
const SP2 = { id: "SP2", name: "大都", pinyin: "Dàdū", meridian: "足太阴脾经",
  special: "足太阴脾经荥穴",
  location: "在足趾，足大趾内侧，第1跖趾关节前下方赤白肉际凹陷处。简便取穴：大脚趾内侧趾根关节前、皮肤颜色深浅交界处的凹陷。",
  care: "拇指指尖掐按1-2分钟，每日1-2次；脾经荥穴，传统用于腹胀食滞的辅助按揉。",
  indications: ["腹胀","胃痛","呕吐","泄泻","便秘","热病无汗"],
  classic: "", caution: "", detailed: true };
const SP5 = { id: "SP5", name: "商丘", pinyin: "Shāngqiū", meridian: "足太阴脾经",
  special: "足太阴脾经经穴",
  location: "在踝区，内踝前下方，舟骨粗隆与内踝尖连线中点凹陷中。简便取穴：内踝尖前下方、可摸到骨性隆起（舟骨粗隆）附近的凹陷。",
  care: "拇指指腹按揉2分钟，每日1-2次；踝关节扭伤肿痛时轻揉周围，勿用力按压痛点。",
  indications: ["腹胀","泄泻","便秘","黄疸","怠惰嗜卧","足踝痛"],
  classic: "", caution: "足踝扭伤急性期局部肿胀明显时不宜按压此穴。", detailed: true };
// 手太阳小肠经（文件2）
const SI2 = { id: "SI2", name: "前谷", pinyin: "Qiángǔ", meridian: "手太阳小肠经",
  special: "手太阳小肠经荥穴",
  location: "在手指，小指尺侧，第5掌指关节前方（远端）赤白肉际凹陷处。简便取穴：小指外侧、掌指关节前的凹陷。",
  care: "对侧拇指掐按1-2分钟，每日1-2次，酸胀为度。",
  indications: ["头痛","项强","目痛","耳鸣","咽喉肿痛","乳痈","热病"],
  classic: "", caution: "", detailed: true };
const SI5 = { id: "SI5", name: "阳谷", pinyin: "Yánggǔ", meridian: "手太阳小肠经",
  special: "手太阳小肠经经穴",
  location: "在手外侧，腕后区，尺骨茎突与三角骨之间凹陷中。简便取穴：手腕外侧小指侧、摸到圆形骨突（尺骨茎突）后方的凹陷。",
  care: "拇指指腹按揉2分钟，每日1-2次；可配合转腕活动后按揉。",
  indications: ["头痛","目眩","耳鸣耳聋","齿痛颊肿","腕痛","癫狂痫"],
  classic: "", caution: "", detailed: true };
const SI7 = { id: "SI7", name: "支正", pinyin: "Zhīzhèng", meridian: "手太阳小肠经",
  special: "手太阳小肠经络穴",
  location: "在前臂后区，腕背侧远端横纹上5寸，尺骨尺侧缘。简便取穴：阳谷穴（腕外侧凹陷）与小海穴（肘内侧凹陷）连线上，腕背横纹上五横指宽再加约一寸处、贴尺骨边缘。",
  care: "对侧拇指沿尺骨边缘按揉2分钟，每日1-2次，酸胀为度。",
  indications: ["头痛","项强","肘臂酸痛","热病","癫狂","疣症"],
  classic: "", caution: "", detailed: true };
const SI8 = { id: "SI8", name: "小海", pinyin: "Xiǎohǎi", meridian: "手太阳小肠经",
  special: "手太阳小肠经合穴",
  location: "在肘后区，尺骨鹰嘴与肱骨内上髁之间凹陷处。简便取穴：屈肘，肘内侧骨缝凹陷（俗称「肘麻窝」），用指弹拨时有触电样麻感窜到小指。",
  care: "拇指指腹轻揉1-2分钟；弹拨出现麻感窜指属正常现象，力度勿过重、时间勿过长。",
  indications: ["肘臂疼痛麻木","癫痫"],
  classic: "", caution: "此穴弹拨有放射性麻感，切勿反复重刺激，以免引起手臂麻木不适。", detailed: true };
// 足太阳膀胱经（文件2）
const BL14 = { id: "BL14", name: "厥阴俞", pinyin: "Juéyīnshū", meridian: "足太阳膀胱经",
  special: "心包之背俞穴",
  location: "在脊柱区，第4胸椎棘突下，后正中线旁开1.5寸。简便取穴：两侧肩胛下角连线平第7胸椎，向上再数3个棘突即第4胸椎，旁开两横指。",
  care: "需他人协助：用拇指或掌根沿脊柱两侧按揉2-3分钟，酸胀为度；也可用按摩球靠墙轻滚背部相应区域。",
  indications: ["心痛","心悸","咳嗽","胸闷","呕吐"],
  classic: "", caution: "背部穴位不可深刺，针刺不当有气胸风险；居家以按揉、温灸为宜。", detailed: true };
const BL15 = { id: "BL15", name: "心俞", pinyin: "Xīnshū", meridian: "足太阳膀胱经",
  special: "心之背俞穴",
  location: "在脊柱区，第5胸椎棘突下，后正中线旁开1.5寸。简便取穴：两侧肩胛下角连线平第7胸椎，向上数2个棘突即第5胸椎，旁开两横指。",
  care: "需他人协助按揉2-3分钟，酸胀为度；心烦失眠时可配阔胸放松后轻揉，勿重力叩击。",
  indications: ["心痛","惊悸","失眠","健忘","癫痫","咳嗽","吐血","盗汗","遗精"],
  classic: "", caution: "穴区深部邻肺，不可深刺，以防气胸；居家以轻柔按揉与温和灸为宜。", detailed: true };
const BL19 = { id: "BL19", name: "胆俞", pinyin: "Dǎnshū", meridian: "足太阳膀胱经",
  special: "胆之背俞穴",
  location: "在脊柱区，第10胸椎棘突下，后正中线旁开1.5寸。",
  care: "需他人协助按揉2-3分钟；口苦胁胀时可配合肝俞一线往返轻揉。",
  indications: ["黄疸","口苦","胁痛","肺痨","潮热"],
  classic: "", caution: "不可深刺，以免伤及胸膜与内脏。", detailed: true };
const BL21 = { id: "BL21", name: "胃俞", pinyin: "Wèishū", meridian: "足太阳膀胱经",
  special: "胃之背俞穴",
  location: "在脊柱区，第12胸椎棘突下，后正中线旁开1.5寸。简便取穴：两侧髂嵴最高点连线平第4腰椎，向上数4个棘突（第4→第3→第2→第1腰椎→第12胸椎），旁开两横指。",
  care: "需他人协助按揉2-3分钟；胃脘不适时可配合中脘（前面）与胃俞（后面）前后呼应轻揉，即「俞募配穴」的生活版。",
  indications: ["胃脘痛","呕吐","腹胀","肠鸣","胸胁痛"],
  classic: "", caution: "不可深刺，此平面深部邻近肾脏与腹腔脏器。", detailed: true };
const BL22 = { id: "BL22", name: "三焦俞", pinyin: "Sānjiāoshū", meridian: "足太阳膀胱经",
  special: "三焦之背俞穴",
  location: "在脊柱区，第1腰椎棘突下，后正中线旁开1.5寸。简便取穴：第12胸椎（胃俞水平）再往下1个棘突即是。",
  care: "需他人协助按揉2-3分钟；水肿、腹胀时可与肾俞、气海一带配合轻揉。",
  indications: ["肠鸣","腹胀","呕吐","泄泻","痢疾","水肿","腰背强痛"],
  classic: "", caution: "不可深刺，深部邻近肾脏。", detailed: true };
const BL27 = { id: "BL27", name: "小肠俞", pinyin: "Xiǎochángshū", meridian: "足太阳膀胱经",
  special: "小肠之背俞穴",
  location: "在骶区，横平第1骶后孔，骶正中嵴旁开1.5寸。",
  care: "需他人协助按揉或用手掌根部轻揉腰骶部2-3分钟；可配合温灸。",
  indications: ["遗精","遗尿","尿血","带下","少腹胀痛","泄泻","腰骶痛"],
  classic: "", caution: "", detailed: true };
const BL28 = { id: "BL28", name: "膀胱俞", pinyin: "Pángguāngshū", meridian: "足太阳膀胱经",
  special: "膀胱之背俞穴",
  location: "在骶区，横平第2骶后孔，骶正中嵴旁开1.5寸。简便取穴：两侧髂后上棘连线约平第2骶后孔水平，旁开两横指。",
  care: "手掌根轻揉腰骶部2-3分钟，每日1-2次；小便不适时可与中极（前面）配合前后呼应。",
  indications: ["小便不利","遗尿","泄泻","便秘","腰脊强痛"],
  classic: "", caution: "", detailed: true };
const BL58 = { id: "BL58", name: "飞扬", pinyin: "Fēiyáng", meridian: "足太阳膀胱经",
  special: "足太阳膀胱经络穴",
  location: "在小腿后区，昆仑穴直上7寸，腓肠肌外下缘与跟腱移行处。简便取穴：外踝尖与跟腱之间（昆仑）直上，约一掌再加三指宽处、小腿肚外侧下缘。",
  care: "拇指或掌根按揉2-3分钟，每日1-2次；久站后小腿酸胀时自踝向上推揉至此穴。",
  indications: ["头痛","目眩","鼻塞","鼻衄","腰腿疼痛","痔疾"],
  classic: "", caution: "", detailed: true };
const BL64 = { id: "BL64", name: "京骨", pinyin: "Jīnggǔ", meridian: "足太阳膀胱经",
  special: "足太阳膀胱经原穴",
  location: "在跗区，第5跖骨粗隆下方，赤白肉际处。简便取穴：足外侧缘中部、可摸到一圆形骨突（第5跖骨粗隆），其下方凹陷。",
  care: "拇指指腹按揉2分钟，每日1-2次，酸胀为度。",
  indications: ["头痛","项强","目翳","癫痫","腰腿痛"],
  classic: "", caution: "", detailed: true };
const BL65 = { id: "BL65", name: "束骨", pinyin: "Shùgǔ", meridian: "足太阳膀胱经",
  special: "足太阳膀胱经输穴",
  location: "在跗区，小趾外侧，第5跖趾关节后方赤白肉际凹陷处。简便取穴：京骨穴前方、小脚趾根关节后的凹陷。",
  care: "拇指指尖掐按1-2分钟，每日1-2次。",
  indications: ["头痛","项强","目眩","癫狂","腰腿痛"],
  classic: "", caution: "", detailed: true };
const BL66 = { id: "BL66", name: "足通谷", pinyin: "Zútōnggǔ", meridian: "足太阳膀胱经",
  special: "足太阳膀胱经荥穴",
  location: "在足趾，小趾外侧，第5跖趾关节前方赤白肉际凹陷处。简便取穴：束骨穴前方、小脚趾根关节前的凹陷。",
  care: "拇指指尖掐按1分钟，每日1-2次。",
  indications: ["头痛","项强","目眩","鼻衄","癫狂"],
  classic: "", caution: "", detailed: true };
const BL67 = { id: "BL67", name: "至阴", pinyin: "Zhìyīn", meridian: "足太阳膀胱经",
  special: "足太阳膀胱经井穴",
  location: "在足趾，小趾外侧趾甲根角旁开0.1寸。简便取穴：小脚趾外侧指甲角外下一点。",
  care: "传统用艾条温和灸此穴辅助矫正胎位，须在产科医师指导下进行，每次10-15分钟；日常头痛目痛可用拇指轻掐1分钟。",
  indications: ["胎位不正","滞产","头痛","目痛","鼻塞","鼻衄"],
  classic: "", caution: "孕妇禁针；艾灸矫正胎位属医疗行为，务必先咨询产科医师，不可自行盲目施灸。", detailed: true };
// 手少阳三焦经（文件2）
const TE2 = { id: "TE2", name: "液门", pinyin: "Yèmén", meridian: "手少阳三焦经",
  special: "手少阳三焦经荥穴",
  location: "在手背，第4、5指间，指蹼缘上方赤白肉际凹陷处。简便取穴：无名指与小指指缝上方的凹陷。",
  care: "拇指指尖掐按1-2分钟，每日1-2次；咽干目赤时按揉后饮温水。",
  indications: ["头痛","目赤","耳聋","咽喉肿痛","疟疾","手臂痛"],
  classic: "", caution: "", detailed: true };
const TE10 = { id: "TE10", name: "天井", pinyin: "Tiānjǐng", meridian: "手少阳三焦经",
  special: "手少阳三焦经合穴",
  location: "在肘后区，肘尖（尺骨鹰嘴）上方1寸凹陷中。简便取穴：屈肘，肘尖直上一指宽的凹陷。",
  care: "拇指指腹按揉2分钟，每日1-2次；肘臂酸痛时可配合轻缓屈伸肘关节后按揉。",
  indications: ["偏头痛","胁肋痛","瘰疬","瘿气","肘臂痛"],
  classic: "", caution: "", detailed: true };
// 足少阳胆经（文件2）
const GB25 = { id: "GB25", name: "京门", pinyin: "Jīngmén", meridian: "足少阳胆经",
  special: "肾之募穴",
  location: "在侧腰部，第12肋骨游离端下方垂线与脐水平线的交点上。简便取穴：侧卧，摸到最下面一根浮肋（第12肋）的游离端，其下方即是。",
  care: "侧卧放松，用拇指或掌根轻揉2分钟，酸胀为度；勿在饭后立即按压。",
  indications: ["小便不利","水肿","腰痛","胁痛","腹胀","泄泻"],
  classic: "", caution: "穴区深部为肾脏所在，不可深刺，居家以轻揉为限。", detailed: true };
const GB38 = { id: "GB38", name: "阳辅", pinyin: "Yángfǔ", meridian: "足少阳胆经",
  special: "足少阳胆经经穴",
  location: "在小腿外侧，外踝尖上4寸，腓骨前缘稍前方。简便取穴：外踝尖直上四横指再略加，贴腓骨前缘。",
  care: "拇指按揉2分钟，每日1-2次；可沿腓骨前缘上下往返推揉。",
  indications: ["偏头痛","目外眦痛","缺盆中痛","腋下痛","瘰疬","胸胁痛","下肢外侧痛"],
  classic: "", caution: "", detailed: true };
const GB43 = { id: "GB43", name: "侠溪", pinyin: "Xiáxī", meridian: "足少阳胆经",
  special: "足少阳胆经荥穴",
  location: "在足背，第4、5趾间，趾蹼缘上方赤白肉际凹陷处。简便取穴：四趾与五趾趾缝上方的凹陷。",
  care: "拇指指尖掐按1-2分钟，每日1-2次；肝胆火盛之偏头痛、耳鸣时按揉，酸胀为度。",
  indications: ["偏头痛","眩晕","耳鸣耳聋","目赤肿痛","胁肋疼痛","热病","乳痈"],
  classic: "", caution: "", detailed: true };
const GB44 = { id: "GB44", name: "足窍阴", pinyin: "Zúqiàoyīn", meridian: "足少阳胆经",
  special: "足少阳胆经井穴",
  location: "在足趾，第4趾外侧趾甲根角旁开0.1寸。简便取穴：第四脚趾外侧指甲角旁一点。",
  care: "拇指指尖轻掐1分钟，每日1-2次；失眠多梦时睡前轻掐配合温水泡脚。",
  indications: ["偏头痛","目赤肿痛","耳鸣耳聋","咽喉肿痛","失眠","多梦","热病"],
  classic: "", caution: "", detailed: true };
// 任脉（文件2）
const CV3 = { id: "CV3", name: "中极", pinyin: "Zhōngjí", meridian: "任脉",
  special: "膀胱之募穴；任脉与足三阴经交会穴",
  location: "在下腹部，前正中线上，脐中下4寸。简便取穴：脐中到耻骨联合上缘共5寸，脐下五分之四处即是。",
  care: "食中两指并拢轻揉2-3分钟；排空小便后按揉更妥；可配膀胱俞（腰骶部）前后呼应。",
  indications: ["遗尿","小便不利","遗精","阳痿","早泄","月经不调","崩漏","阴挺","带下"],
  classic: "", caution: "针刺前须排空膀胱，不可深刺；孕妇慎用。", detailed: true };
const CV5 = { id: "CV5", name: "石门", pinyin: "Shímén", meridian: "任脉",
  special: "三焦之募穴",
  location: "在下腹部，前正中线上，脐中下2寸。",
  care: "食中两指并拢轻揉2分钟，每日1-2次；腹部放松、空腹或饭后1小时以上再按。",
  indications: ["腹胀","泄泻","绕脐疼痛","疝气","水肿","小便不利","经闭","带下","崩漏"],
  classic: "《针灸甲乙经》载此穴「女子不可灸刺，不幸使人绝子」——此说历代有争议，今多仅作育龄女性慎用的提示。",
  caution: "育龄女性慎用针刺与直接灸；孕妇慎用。", detailed: true };
const CV14 = { id: "CV14", name: "巨阙", pinyin: "Jùquè", meridian: "任脉",
  special: "心之募穴",
  location: "在上腹部，前正中线上，脐中上6寸。简便取穴：胸骨下端（剑突，岐骨）下2寸；或中脘穴（脐上4寸）直上2寸。",
  care: "食中两指并拢轻揉2分钟，心烦胸闷时配合深呼吸按揉，酸胀为度；饭后勿立即按。",
  indications: ["心痛","心悸","癫狂痫","胸痛","呕吐","吞酸"],
  classic: "", caution: "此穴深部邻近肝脏与膈肌，不可深刺；居家只宜轻揉。", detailed: true };

/* ---------- 插入配置：file => [{anchor, entries:[]}] ---------- */
const PLAN = {
  "acupoints-1.js": [
    { anchor: "ST45", entries: [ST42, ST43, ST44] },
    { anchor: "SP3",  entries: [SP2] },
    { anchor: "SP6",  entries: [SP5] },
  ],
  "acupoints-2.js": [
    { anchor: "SI3",  entries: [SI2] },
    { anchor: "SI6",  entries: [SI5] },
    { anchor: "SI9",  entries: [SI7, SI8] },
    { anchor: "BL17", entries: [BL14, BL15] },
    { anchor: "BL20", entries: [BL19] },
    { anchor: "BL23", entries: [BL21, BL22] },
    { anchor: "BL40", entries: [BL27, BL28] },
    { anchor: "BL60", entries: [BL58] },
    { anchor: "KI1",  entries: [BL64, BL65, BL66, BL67] },
    { anchor: "TE3",  entries: [TE2] },
    { anchor: "TE14", entries: [TE10] },
    { anchor: "GB30", entries: [GB25] },
    { anchor: "GB39", entries: [GB38] },
    { anchor: "LV1",  entries: [GB43, GB44] },
    { anchor: "CV4",  entries: [CV3] },
    { anchor: "CV6",  entries: [CV5] },
    { anchor: "CV17", entries: [CV14] },
  ],
};

/* ---------- 序列化：与既有条目相同的缩进与排版 ---------- */
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
    const insertAt = openBrace + 1; // 跳过换行，插在锚点条目的 `  {` 之前
    const block = g.entries.map(render).join("");
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
    total += g.entries.length;
    console.log(file, "锚点", g.anchor, "←", g.entries.map((e) => e.id + " " + e.name).join("、"));
  }
  fs.writeFileSync(fp, text, "utf8");
}
console.log("\n共插入", total, "个条目");

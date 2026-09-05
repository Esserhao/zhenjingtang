# 数据文件约定（改内容请读这份）

本站内容与代码分离。所有 data/*.js 是**普通脚本**（非模块），在浏览器里先于 app.js 加载，
把数据挂到 `window` 全局变量上。用记事本/VS Code 改完保存、刷新网页即生效。

## 通用规则

- 编码必须是 **UTF-8**
- 文件末尾形如 `window.针经堂穴位一 = [...]` 的全局变量，**变量名不能改**（app.js 按名取数）
- 「AI 参考译文」「注家对照」等标注文字写进数据本身，页面上如实展示

## data/acupoints-1.js / acupoints-2.js —— 穴位库

```js
window.ACUPARTS_1 = [
  {
    id: "LU1",                 // 经脉缩写+序号，全局唯一
    name: "中府",
    pinyin: "Zhōngfǔ",
    meridian: "手太阴肺经",     // 十四经全名
    special: "肺之募穴",        // 特定穴属性，没有就写 ""
    location: "…",             // 定位（文字描述，准确到骨性/肌性标志）
    care: "…",                 // 居家保健用法（艾灸/指压），含简单手法
    indications: ["咳嗽", "气喘", "胸痛", "肩背痛"],  // 主治
    classic: "《针灸甲乙经》……",  // 经典出处/条文，没有就写 ""
    caution: "…",              // 安全提示（如不可深刺），没有就写 ""
    detailed: true
  },
  // detailed:false 的条目只需 id/name/pinyin/meridian/location，进速查表
];
```

## data/meridian-index.js —— 十四经 361 穴速查总表

```js
window.MERIDIAN_INDEX = [
  { meridian: "手太阴肺经", abbr: "LU", points: ["中府", "云门", …] },
  …
];
```

## data/classics.js —— 灵枢经典诵读

```js
window.LINGSHU = [
  {
    id: "ls-jiuzhen",
    title: "九针十二原",
    source: "《灵枢·九针十二原》",
    note: "选段说明，全篇照录则留空字符串",
    sections: [
      {
        label: "一",              // 条文序号
        original: "……",          // 原文
        translation: "……",       // AI 参考译文（页面会标注）
        keynotes: "……",          // 学习要点提示，可空
        debate: {                 // 仅当历代注家确有分歧时写，否则省略该字段
          quote: "有分歧的原句片段",
          schools: [
            { commentator: "杨上善", work: "《太素》", view: "……" },
            { commentator: "张介宾", work: "《类经》", view: "……" },
          ],
        },
        cases: [                  // 仅当确知有出处关联医案时写
          { source: "《名医类案·卷三》", text: "……", takeaway: "……" },
        ],
      },
    ],
  },
];
```

## data/nanjing.js —— 难经（六十二至六十八难）

结构与 LINGSHU 相同，变量 `window.NANJING`，每条多一个 `num: 62` 字段。

## data/theory.js —— 理论课程

```js
window.THEORY = [
  {
    id: "meridian-intro",
    title: "经络总论",
    order: 1,
    sections: [
      { h: "什么是经络", body: "……" },   // body 允许含 <strong> <em> 少量标签
    ],
  },
];
```

## 页面笔记与进度

个人笔记、已读标记、打卡记录、自测 SRS 记录、诵读打卡印章不放在数据文件里，
存在浏览器 localStorage（key: zjsx_state_v1，结构见 js/store.js 头注释），
可随时在「备份」页一键导出/导入 JSON。改完数据文件后建议先跑 `node tools/check_data.js`。

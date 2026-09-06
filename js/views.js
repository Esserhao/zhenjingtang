/* views.js —— 页面渲染。依赖：Store、各 data/*.js 挂载的全局数据。由 app.js 调用。 */
(function () {
  "use strict";

  /* ---------- 数据归一化 ---------- */
  var MER_ABBR = { "手太阴肺经": "LU", "手阳明大肠经": "LI", "足阳明胃经": "ST", "足太阴脾经": "SP",
    "手少阴心经": "HT", "手太阳小肠经": "SI", "足太阳膀胱经": "BL", "足少阴肾经": "KI",
    "手厥阴心包经": "PC", "手少阳三焦经": "TE", "足少阳胆经": "GB", "足厥阴肝经": "LV",
    "任脉": "CV", "督脉": "GV", "经外奇穴": "EX" };
  var MER_NAME = { LU: "手太阴肺经", LI: "手阳明大肠经", ST: "足阳明胃经", SP: "足太阴脾经",
    HT: "手少阴心经", SI: "手太阳小肠经", BL: "足太阳膀胱经", KI: "足少阴肾经",
    PC: "手厥阴心包经", TE: "手少阳三焦经", GB: "足少阳胆经", LV: "足厥阴肝经",
    CV: "任脉", GV: "督脉", EX: "经外奇穴" };
  /* 只有十四经有古籍木刻图；经外奇穴无图，渲染时用占位块 */
  var MER_HAS_IMG = { LU: 1, LI: 1, ST: 1, SP: 1, HT: 1, SI: 1, BL: 1, KI: 1, PC: 1, TE: 1, GB: 1, LV: 1, CV: 1, GV: 1 };

  function allPoints() {
    return (window.ACUPARTS_1 || []).concat(window.ACUPARTS_2 || []).concat(window.ACUPARTS_3 || []);
  }
  var pointMap = {};
  allPoints().forEach(function (p) { pointMap[p.id] = p; });

  /* 难经归一为经典章节（每难一条 section，按难次排序）
     secId 用稳定 id「nj-group#n<num>」；store.js 一次性把旧下标制（nj-group#0..8）迁移过来 */
  var nanjingChapters = [{
    id: "nj-group", title: "难经 · 全八十一难", source: "《难经》",
    note: "脉论经、脏论病、穴论俞、针法论刺——与《灵枢》互为表里",
    sections: (window.NANJING || []).slice().sort(function (a, b) { return a.num - b.num; }).map(function (n) {
      return {
        label: "第" + n.num + "难", original: n.original, translation: n.translation,
        keynotes: n.keynotes, debate: n.debate, cases: n.cases, secId: "nj-group#n" + n.num
      };
    })
  }];

  function allChapters() { return (window.LINGSHU || []).concat(window.SUWEN || []).concat(nanjingChapters); }
  var chapterMap = {}; allChapters().forEach(function (c) { chapterMap[c.id] = c; });

  function chapterSections(c) {
    return c.sections.map(function (s, i) {
      s.secId = s.secId || c.id + "#" + i;
      return s;
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* keynotes/translation 可能带「【AI 参考译文】」前缀，交给 CSS 呈现 */
  function stripPrefix(s) { return String(s || "").replace(/^【AI\s*参考译文】[:：]?/, "").replace(/^零基础要点[:：]?/, ""); }

  /* ---------- 通用小件 ---------- */
  function readToggleHtml(id) {
    return '<button class="read-toggle' + (Store.isRead(id) ? " on" : "") + '" onclick="App.toggleRead(this, \'' + id + '\')">已读</button>';
  }
  function noteBoxHtml(id) {
    return '<div class="field"><div class="fl">朱批 · 个人笔记</div>' +
      '<textarea class="note-box" id="note-' + esc(id) + '" placeholder="写点心得，随手记……">' + esc(Store.getNote(id)) + '</textarea>' +
      '<div style="margin-top:6px"><button class="btn ghost" onclick="App.saveNote(\'' + id + '\')">保存笔记</button></div></div>';
  }
  function progressPct() {
    var total = allPoints().filter(function (p) { return p.detailed; }).length +
      (window.THEORY || []).reduce(function (s, c) { return s + c.sections.length; }, 0) +
      allChapters().reduce(function (s, c) { return s + c.sections.length; }, 0);
    return total ? Math.round(Store.readCount() / total * 100) : 0;
  }

  /* ---------- 首页 ---------- */
  function pickDaily() {
    var t = Store.today(), saved = Store.getDaily(t);
    if (saved && pointMap[saved]) return pointMap[saved];
    /* 以日期做确定性抽取：djb2 hash → 详细穴位 */
    var h = 5381;
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0;
    var list = allPoints().filter(function (p) { return p.detailed; });
    var p = list[h % list.length];
    Store.setDaily(t, p.id);
    return p;
  }
  function pickQuote() {
    var secs = [];
    allChapters().forEach(function (c) {
      chapterSections(c).forEach(function (s) { if (s.original && s.original.length < 60) secs.push({ src: c.title, original: s.original }); });
    });
    var t = Store.today(), h = 52711;
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0;
    return secs[h % secs.length];
  }

  function homeView() {
    var p = pickDaily(), q = pickQuote();
    var days = Store.days(), streak = Store.streak();
    /* 打卡绿墙：最近 15 周，列=周，行=星期（首列补空对齐） */
    var cells = "", start = new Date();
    start.setHours(12, 0, 0, 0);
    start.setDate(start.getDate() - 104);
    start.setDate(start.getDate() - start.getDay()); // 回退到周日
    var end = new Date(); end.setHours(12, 0, 0, 0);
    var total = Math.round((end - start) / 86400000);
    for (var i = 0; i <= total; i++) {
      var d = new Date(start.getTime() + i * 86400000);
      var k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      var n = days[k] || 0;
      var lvl = n === 0 ? "" : n <= 1 ? "l1" : n <= 2 ? "l2" : n <= 4 ? "l3" : "l4";
      cells += '<div class="cell ' + lvl + '" title="' + k + " · " + n + ' 条"></div>';
    }
    var recentNotes = Object.keys(Store.raw().notes).length;
    /* 首次访问引导卡：没有任何学习记录且未看过入门时显示 */
    var firstVisit = Store.readCount() === 0 && !Store.guideSeen();
    var guideCard = firstVisit ? '<div class="card" style="border-color:var(--cinnabar);margin-bottom:18px">' +
      '<h3>第一次来？三步上手</h3>' +
      '<div style="font-size:14px;line-height:2">① 读「理论」第一课〈经络总论〉，十五分钟打底<br>' +
      '② 每天看「每日一穴」，点开细读，顺手按一按<br>' +
      '③ 用「自测」巩固，答错的第二天自动排最前复习</div>' +
      '<div style="margin-top:10px"><a class="btn" href="#/guide">看新手指南与术语表 →</a> ' +
      '<button class="btn ghost" onclick="App.dismissGuide()">我知道了，直接逛</button></div></div>' : '';

    return '<div class="page">' +
      '<div class="page-title">针经堂<span class="zh-dot"> · </span>针灸自学</div>' +
      '<div class="page-sub">零基础起步 · 以《灵枢》为经，以腧穴为纬 · <span class="src">学以致用，先保健后针道</span></div>' +
      guideCard +
      '<div class="stats-row">' +
        '<div class="stat"><div class="num">' + Store.readCount() + '</div><div class="lbl">已读条目</div></div>' +
        '<div class="stat"><div class="num">' + streak + '</div><div class="lbl">连续天数</div></div>' +
        '<div class="stat"><div class="num">' + recentNotes + '</div><div class="lbl">朱批笔记</div></div>' +
        '<div class="stat"><div class="num">' + progressPct() + '%</div><div class="lbl">总进度</div></div>' +
      '</div>' +
      '<div class="home-grid">' +
        '<div class="daily-card">' +
          '<h3>' + esc(p.name) + '</h3><div class="py">' + esc(p.pinyin) + ' · ' + esc(p.meridian) + (p.special ? ' · ' + esc(p.special) : '') + '</div>' +
          '<div style="font-size:15px">' + esc(p.location || "") + '</div>' +
          (p.care ? '<div style="font-size:14px;color:#6b6154;margin-top:8px">保健：' + esc(p.care) + '</div>' : '') +
          (q ? '<div class="quote"><b>今日经句</b>（' + esc(q.src) + '）<br>' + esc(q.original) + '</div>' : '') +
          '<div style="margin-top:16px"><a class="btn" href="#/point/' + esc(p.id) + '">细读此穴</a></div>' +
        '</div>' +
        '<div>' +
          '<div class="card"><h3>打卡</h3><div class="wall-title">近十五周 · 每格一天 · 越深学得越多</div>' +
          '<div class="wall">' + cells + '</div></div>' +
          '<div class="card"><h3>继续学习</h3>' +
            '<div style="font-size:14px;line-height:2.3">' +
            '<span class="tag moss">理论</span><a href="#/theory">理论五课</a>——经络、腧穴、刺灸安全、特定穴、自我保健<br>' +
            '<span class="tag moss">穴位</span><a href="#/meridians">经络穴位</a>——十四经木刻图与' + allPoints().filter(function (p) { return p.detailed; }).length + '个精讲穴<br>' +
            '<span class="tag moss">经典</span><a href="#/classics">经典诵读</a>——《灵枢》十五篇、素问针灸选篇与《难经》九难<br>' +
            '<span class="tag moss">检索</span><a href="#/search">全文搜索</a>——按穴名、症名、条文查</div>' +
          '</div>' +
        '</div>' +
      '</div></div>';
  }

  /* ---------- 理论 ---------- */
  function theoryView(courseId) {
    var courses = window.THEORY || [];
    if (courseId) {
      var c = courses.find(function (x) { return x.id === courseId; });
      if (!c) return '<div class="empty">未找到该课程</div>';
      var body = chapterSections(c).map(function (s, i) {
        var paras = String(s.body).split("\n\n").map(function (t) { return "<p>" + t + "</p>"; }).join("");
        return '<h2 class="sec">' + esc(s.h) + '</h2><div class="theory-body">' + paras + '</div>' +
          readToggleHtml(c.id + "#" + i);
      }).join("");
      return '<div class="page">' +
        '<div class="crumb"><a href="#/theory">理论</a> / ' + esc(c.title) + '</div>' +
        '<div class="page-title">' + esc(c.title) + '</div>' +
        '<div class="page-sub">第 ' + c.order + ' 课 · 学完一节点「已读」，打卡自动记录</div>' + body + '</div>';
    }
    var items = courses.slice().sort(function (a, b) { return a.order - b.order; }).map(function (c) {
      var secs = chapterSections(c);
      var done = secs.filter(function (s) { return Store.isRead(s.secId); }).length;
      return '<div class="toc-item" onclick="location.hash=\'#/theory/' + esc(c.id) + '\'">' +
        '<div><div class="t">' + esc(c.title) + '</div><div class="d">' + secs.length + ' 节 · 已读 ' + done + '</div></div>' +
        '<div class="d">' + (done === secs.length ? "✓ 完成" : "") + '</div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">理论<span class="zh-dot"> · </span>五课入门</div>' +
      '<div class="page-sub">零基础从这里开始 · <span class="src">先懂道理，再认穴位，最后谈针</span></div>' + items + '</div>';
  }

  /* ---------- 经络穴位 ---------- */
  function meridiansView() {
    var cards = (window.MERIDIAN_INDEX || []).map(function (m) {
      var abbr = m.abbr;
      var done = allPoints().filter(function (p) { return p.meridian === m.meridian && p.detailed && Store.isRead(p.id); }).length;
      var det = allPoints().filter(function (p) { return p.meridian === m.meridian && p.detailed; }).length;
      return '<div class="mer-card" onclick="location.hash=\'#/meridian/' + abbr + '\'">' +
        (MER_HAS_IMG[abbr]
          ? '<img src="assets/img/mer-' + abbr + '.jpg" alt="' + esc(m.meridian) + '木刻经络图" loading="lazy">'
          : '<div class="mer-ph">奇穴无古籍图 · 以穴会友</div>') +
        '<div class="nm">' + esc(m.meridian) + '</div><div class="ct">' + m.points.length + ' 穴 · 精讲 ' + det + (det ? ' · 已读 ' + done : '') + '</div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">经络<span class="zh-dot"> · </span>十四经与奇穴</div>' +
      '<div class="page-sub">图为 Wellcome 藏古籍木刻经络图（CC BY 4.0） · <span class="src">点开一经，先看图，再认穴；经外奇穴不属十四经，故无图</span></div>' +
      '<div class="mer-grid">' + cards + '</div></div>';
  }

  function meridianView(abbr) {
    var name = MER_NAME[abbr];
    var idx = (window.MERIDIAN_INDEX || []).find(function (m) { return m.abbr === abbr; });
    if (!name || !idx) return '<div class="empty">未找到经脉</div>';
    var detailed = allPoints().filter(function (p) { return p.meridian === name && p.detailed; });
    var detIds = {}; detailed.forEach(function (p) { detIds[p.id] = 1; });
    var chips = idx.points.map(function (nm) {
      var p = allPoints().find(function (x) { return x.meridian === name && x.name === nm; });
      if (p) return '<div class="point-chip" onclick="location.hash=\'#/point/' + esc(p.id) + '\'">' +
        '<span>' + esc(p.name) + (Store.isRead(p.id) ? ' <span class="read-mark">◉</span>' : '') + '</span><span class="pid">' + esc(p.id) + '</span></div>';
      return '<div class="point-chip brief"><span>' + esc(nm) + '</span><span class="pid">速查</span></div>';
    }).join("");
    return '<div class="page">' +
      '<div class="crumb"><a href="#/meridians">经络穴位</a> / ' + esc(name) + '</div>' +
      (MER_HAS_IMG[abbr]
        ? '<div class="mer-image"><img src="assets/img/mer-' + esc(abbr) + '.jpg" alt="' + esc(name) + '木刻图">' +
          '<div class="cap">' + esc(name) + ' · 古籍木刻图（Wellcome 藏，CC BY 4.0）</div></div>'
        : '<div class="mer-image"><div class="mer-ph-big">经外奇穴 · 不属十四经，故无古籍经络图</div></div>') +
      '<div class="page-title">' + esc(name) + '</div>' +
      '<div class="page-sub">共 ' + idx.points.length + ' 穴 · 精讲 ' + detailed.length + ' 穴 · <span class="src">「速查」为全名单，暂无详解</span></div>' +
      '<div class="point-list">' + chips + '</div></div>';
  }

  function pointView(id) {
    var p = pointMap[id];
    if (!p) return '<div class="empty">未找到穴位</div>';
    var abbr = MER_ABBR[p.meridian];
    /* 同经精讲穴内上一穴/下一穴 */
    var siblings = allPoints().filter(function (x) { return x.meridian === p.meridian && x.detailed; });
    var si = siblings.findIndex(function (x) { return x.id === p.id; });
    var prev = si > 0 ? siblings[si - 1] : null;
    var next = si < siblings.length - 1 ? siblings[si + 1] : null;
    var nav = (prev || next) ? '<div class="pn-nav">' +
      (prev ? '<a class="pn-btn" href="#/point/' + esc(prev.id) + '">← 上一穴 ' + esc(prev.name) + '</a>' : '<span class="pn-btn ghost2"></span>') +
      (next ? '<a class="pn-btn" href="#/point/' + esc(next.id) + '">' + esc(next.name) + ' 下一穴 →</a>' : '<span class="pn-btn ghost2"></span>') +
      '</div>' : '';
    return '<div class="page">' +
      '<div class="crumb"><a href="#/meridians">经络穴位</a> / <a href="#/meridian/' + esc(abbr) + '">' + esc(p.meridian) + '</a> / ' + esc(p.name) + '</div>' +
      '<div class="point-head"><div class="big">' + esc(p.name) + '</div>' +
        '<div><div style="font-size:14px;color:#6b6154">' + esc(p.pinyin) + '</div>' +
        '<div style="margin-top:6px">' + readToggleHtml(p.id) + '</div></div></div>' +
      '<div style="margin:8px 0 18px"><span class="tag">' + esc(p.meridian) + '</span>' +
        (p.special ? '<a class="tag moss" href="#/guide/t-teding" title="这是「特定穴」标签，点看解释">' + esc(p.special) + '</a>' : '') +
        '<span class="tag">' + esc(p.id) + '</span></div>' +
      (p.caution ? '<div class="warn">⚠ ' + esc(p.caution) + '</div>' : '') +
      '<div class="field"><div class="fl">定位</div><div>' + esc(p.location || "") + '</div></div>' +
      '<div class="field"><div class="fl">主治</div><div class="indications">' +
        (p.indications || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div></div>' +
      (p.care ? '<div class="field"><div class="fl">居家保健用法</div><div>' + esc(p.care) + '</div></div>' : '') +
      (p.classic ? '<div class="field"><div class="fl">经典出处</div><div class="classic-quote">' + esc(p.classic) + '</div></div>' : '') +
      noteBoxHtml(p.id) + nav + '</div>';
  }

  /* ---------- 经典诵读 ---------- */
  function classicsView() {
    var items = allChapters().map(function (c) {
      var secs = chapterSections(c);
      var done = secs.filter(function (s) { return Store.isRead(s.secId); }).length;
      return '<div class="toc-item" onclick="location.hash=\'#/classic/' + esc(c.id) + '\'">' +
        '<div><div class="t">' + esc(c.title) + (Store.recitedToday(c.id) ? ' <span class="recite-dot" title="今日已诵">诵</span>' : '') + '</div><div class="d">' + esc(c.source) + (c.note ? ' · ' + esc(c.note) : '') + '</div></div>' +
        '<div class="d">' + done + ' / ' + secs.length + '</div></div>';
    }).join("");
    var recited = Store.recitedTodayCount();
    return '<div class="page"><div class="page-title">经典诵读<span class="zh-dot"> · </span>针灸之源</div>' +
      '<div class="page-sub">' + (recited ? '今日已诵 ' + recited + ' 篇 · ' : '') + '《灵枢》为针灸之源，《素问》申其刺法，《难经》明其穴理 · <span class="src">译文为 AI 参考译文；读毕可在篇内盖「今日已诵」印</span></div>' + items + '</div>';
  }

  function debateHtml(d) {
    if (!d || !d.schools || !d.schools.length) return "";
    return '<div class="debate"><div class="db-title">笺注 · 注家分歧</div>' +
      '<div class="quote-line">「' + esc(d.quote) + '」</div>' +
      d.schools.map(function (s) {
        return '<div class="school"><span class="who">' + esc(s.commentator) + '</span> <span class="work">' + esc(s.work || "") + '</span><br>' + esc(s.view) + '</div>';
      }).join("") + '</div>';
  }
  function casesHtml(cases) {
    if (!cases || !cases.length) return "";
    return cases.map(function (c) {
      return '<div class="case"><div class="cs-title">医案对账</div>' + esc(c.text) +
        '<div class="src">—— ' + esc(c.source) + (c.takeaway ? ' · 启示：' + esc(c.takeaway) : '') + '</div></div>';
    }).join("");
  }

  function classicView(chId) {
    var c = chapterMap[chId];
    if (!c) return '<div class="empty">未找到篇章</div>';
    var chapters = allChapters();
    var ci = chapters.findIndex(function (x) { return x.id === chId; });
    var prevC = ci > 0 ? chapters[ci - 1] : null;
    var nextC = ci < chapters.length - 1 ? chapters[ci + 1] : null;
    var nav = '<div class="pn-nav">' +
      (prevC ? '<a class="pn-btn" href="#/classic/' + esc(prevC.id) + '">← ' + esc(prevC.title) + '</a>' : '<span class="pn-btn ghost2"></span>') +
      (nextC ? '<a class="pn-btn" href="#/classic/' + esc(nextC.id) + '">' + esc(nextC.title) + ' →</a>' : '<span class="pn-btn ghost2"></span>') +
      '</div>';
    var secs = chapterSections(c);
    var body = secs.map(function (s, i) {
      return '<div class="section-item card">' +
        '<div class="original"><span class="sec-no">' + esc(s.label || (i + 1)) + '</span>' + esc(s.original) + '</div>' +
        (s.translation ? '<div class="translation"><span class="tt">AI 参考译文</span><br>' + esc(stripPrefix(s.translation)) + '</div>' : '') +
        (s.keynotes ? '<div class="keynote"><b>零基础要点</b> · ' + esc(stripPrefix(s.keynotes)) + '</div>' : '') +
        debateHtml(s.debate) + casesHtml(s.cases) +
        '<div style="text-align:right">' + readToggleHtml(s.secId) + '</div></div>';
    }).join("");
    return '<div class="page">' +
      '<div class="crumb"><a href="#/classics">经典诵读</a> / ' + esc(c.title) + '</div>' +
      '<div class="page-title">' + esc(c.title) + (Store.recitedToday(c.id) ? ' <span class="recite-seal">今日已诵</span>' : '') + '</div>' +
      '<div class="page-sub">' + esc(c.source) + (c.note ? ' · ' + esc(c.note) : '') + '</div>' +
      (Store.recitedToday(c.id) ? '' :
        '<div style="margin:0 0 14px"><button class="btn" onclick="App.reciteDone(\'' + esc(c.id) + '\')">诵毕打卡 ✓ 记今日诵读</button>' +
        '<span class="src" style="margin-left:10px">朗读一遍后点此，计入今日打卡</span></div>') +
      body + nav + '</div>';
  }

  /* ---------- 穴位自测 ---------- */
  var quizCur = null, quizRevealed = false, quizMeta = { reviewing: false, overdue: 0, dueTotal: 0 };
  function drawQuizPoint() {
    var detailed = allPoints().filter(function (p) { return p.detailed; });
    var pick = null, reviewing = false, overdue = 0;
    var due = Store.quizDue();
    if (due.length) { // SRS：到期卡最优先，最久超期先出
      pick = pointMap[due[0].id]; reviewing = true; overdue = due[0].overdue;
    }
    if (!pick) { // 无到期卡：40% 概率抽薄弱穴
      var weak = Store.quizStats().weak.map(function (w) { return w.id; });
      if (weak.length && Math.random() < 0.4) pick = pointMap[weak[Math.floor(Math.random() * weak.length)]];
    }
    if (!pick) { // 兼底：随机新卡
      var pool = detailed.filter(function (p) { return !quizCur || p.id !== quizCur.id; });
      pick = pool[Math.floor(Math.random() * pool.length)];
    }
    quizCur = pick; quizRevealed = false;
    quizMeta = { reviewing: reviewing, overdue: overdue, dueTotal: due.length };
    return pick;
  }
  function quizCardHtml(p) {
    var q = Store.getQuiz(p.id);
    return '<div class="quiz-card" id="quiz-card">' +
      '<div class="q-head"><span class="tag">' + esc(p.meridian) + '</span>' +
        (p.special ? '<span class="tag moss">' + esc(p.special) + '</span>' : '') +
        (quizMeta.reviewing ? '<span class="tag moss">SRS 复习' + (quizMeta.overdue > 0 ? ' · 超' + quizMeta.overdue + ' 天' : '') + '</span>' : '') +
        '<span class="q-rec">答对 ' + q.r + ' · 记错 ' + q.w + (quizMeta.reviewing ? ' · 待复习 ' + quizMeta.dueTotal : '') + '</span></div>' +
      '<div class="q-name">' + esc(p.name) + '</div>' +
      '<div class="q-py">' + esc(p.pinyin) + '</div>' +
      '<div class="q-tip">先默背定位与主治，再翻面对照</div>' +
      '<div class="q-answer" id="quiz-answer" style="display:none">' +
        '<div class="field"><div class="fl">定位</div><div>' + esc(p.location || "") + '</div></div>' +
        '<div class="field"><div class="fl">主治</div><div class="indications">' +
          (p.indications || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>' +
        (p.care ? '<div class="field"><div class="fl">居家保健</div><div>' + esc(p.care) + '</div></div>' : '') +
      '</div>' +
      '<div class="q-actions" id="quiz-actions">' +
        (!quizRevealed ? '<button class="btn" onclick="App.quizFlip()">翻面对照</button>' : '') +
      '</div>' +
      '</div>';
  }
  function quizView() {
    quizRevealed = false;
    drawQuizPoint();
    var st = Store.quizStats();
    var rate = st.total ? Math.round(st.right / st.total * 100) : null;
    var weak = st.weak.slice(0, 8).map(function (w) {
      return '<a class="weak-chip" href="#/point/' + esc(w.id) + '">' + esc(pointMap[w.id].name) + ' <span>' + w.r + '/' + (w.r + w.w) + '</span></a>';
    }).join('');
    return '<div class="page"><div class="page-title">自测<span class="zh-dot"> · </span>认穴</div>' +
      '<div class="page-sub">' + (quizMeta.dueTotal ? '今日待复习 ' + quizMeta.dueTotal + ' 穴（已优先安排） · ' : '') + '随机抽精讲穴 · ' +
      '<span class="src">SRS 间隔复习：答对按 1/3/7/16/35 天拉长间隔，答错回炉；答题计入当日打卡</span></div>' +
      '<div class="quiz-stats">累计 ' + st.total + ' 题' + (rate !== null ? ' · 正确率 ' + rate + '%' : ' · 还没答过题') +
        (st.total ? ' <button class="btn ghost" style="margin-left:10px" onclick="App.quizReset()">清零记录</button>' : '') + '</div>' +
      (weak ? '<div class="weak-row"><span class="fl" style="margin-right:8px">薄弱穴</span>' + weak + '</div>' : '') +
      '<div id="quiz-area">' + quizCardHtml(quizCur) + '</div></div>';
  }

  /* ---------- 搜索 ---------- */
  var searchIndex = [];
  function buildIndex() {
    searchIndex = [];
    (window.THEORY || []).forEach(function (c) {
      chapterSections(c).forEach(function (s, i) {
        searchIndex.push({ cat: "理论", title: c.title + " · " + s.h, url: "#/theory/" + c.id, text: String(s.body), readId: c.id + "#" + i });
      });
    });
    allPoints().forEach(function (p) {
      if (!p.detailed) return;
      searchIndex.push({ cat: "穴位", title: p.name + " " + p.pinyin, url: "#/point/" + p.id,
        text: [p.meridian, p.special, p.location, p.care, (p.indications || []).join(" ")].join(" "), readId: p.id });
    });
    allChapters().forEach(function (c) {
      chapterSections(c).forEach(function (s, i) {
        searchIndex.push({ cat: "经典", title: c.title + " · " + (s.label || i + 1), url: "#/classic/" + c.id,
          text: [s.original, s.translation, s.keynotes].join(" "), readId: s.secId });
      });
    });
  }
  function searchView(q) {
    q = (q || "").trim();
    var hits = [];
    if (q) {
      var ql = q.toLowerCase();
      searchIndex.forEach(function (e) {
        var tl = e.title.toLowerCase(), xl = e.text.toLowerCase();
        var pos = xl.indexOf(ql);
        if (tl.indexOf(ql) >= 0 || pos >= 0) {
          var snippet = pos >= 0 ? e.text.slice(Math.max(0, pos - 24), pos + 56) : e.text.slice(0, 80);
          hits.push({ e: e, titleHit: tl.indexOf(ql) >= 0, snippet: snippet });
        }
      });
      hits.sort(function (a, b) { return (b.titleHit ? 1 : 0) - (a.titleHit ? 1 : 0); });
      if (hits.length > 60) hits = hits.slice(0, 60);
    }
    var em = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "g");
    var html = '<div class="page"><div class="page-title">搜索<span class="zh-dot"> · </span>全文</div>' +
      '<div style="margin-bottom:20px"><input class="search-input-big" id="search-big" value="' + esc(q) + '" placeholder="试：足三里 / 失眠 / 迎随 / 头痛…"></div>';
    if (!q) return html + '<div class="empty">输入关键词，搜穴位、条文、理论</div></div>';
    html += '<div class="page-sub">找到 ' + hits.length + ' 条相关内容</div>';
    hits.forEach(function (h) {
      var sn = esc(h.snippet).replace(em, "<em>$1</em>");
      html += '<div class="hit" onclick="location.hash=\'' + h.e.url + '\'">' +
        '<div class="ht"><span class="cat">' + h.e.cat + '</span>' + esc(h.e.title) + '</div>' +
        '<div class="hx">…' + sn + '…</div></div>';
    });
    return html + '</div>';
  }

  /* ---------- 笔记 ---------- */
  function notesView() {
    var notes = Store.raw().notes, keys = Object.keys(notes);
    if (!keys.length) return '<div class="page"><div class="page-title">朱批<span class="zh-dot"> · </span>笔记</div>' +
      '<div class="empty">还没有笔记。在穴位或条文页写下第一条吧。</div></div>';
    function linkFor(id) {
      if (pointMap[id]) return '<a href="#/point/' + esc(id) + '">' + esc(pointMap[id].name) + '</a>';
      if (id.indexOf("#") >= 0) {
        var cid = id.split("#")[0], c = chapterMap[cid], th = (window.THEORY || []).find(function (t) { return t.id === cid; });
        if (c) return '<a href="#/classic/' + esc(cid) + '">' + esc(c.title) + '</a>';
        if (th) return '<a href="#/theory/' + esc(cid) + '">' + esc(th.title) + '</a>';
      }
      return esc(id);
    }
    var items = keys.map(function (k) {
      return '<div class="card"><div class="meta">' + linkFor(k) + '</div>' +
        '<div style="margin-top:6px;font-size:15px">' + esc(notes[k]) + '</div>' +
        '<div style="margin-top:8px"><button class="btn ghost" onclick="App.editNoteFromList(\'' + k + '\')">去修改</button> ' +
        '<button class="btn ghost" onclick="App.deleteNote(\'' + k + '\')">删除</button></div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">朱批<span class="zh-dot"> · </span>笔记</div>' +
      '<div class="page-sub">共 ' + keys.length + ' 条</div>' + items + '</div>';
  }

  /* ---------- 备份 ---------- */
  function backupView() {
    return '<div class="page"><div class="page-title">备份<span class="zh-dot"> · </span>数据</div>' +
      '<div class="page-sub">学习进度、笔记、打卡都存在本浏览器里 · <span class="src">换电脑或清缓存前请先导出</span></div>' +
      '<div class="card"><h3>导出</h3><div style="font-size:14px;color:#6b6154">把全部学习数据存成一个 JSON 文件。</div>' +
        '<div style="margin-top:10px"><button class="btn" onclick="App.exportData()">导出 JSON 备份</button></div></div>' +
      '<div class="card"><h3>导入</h3><div style="font-size:14px;color:#6b6154">选择之前导出的备份文件，<strong style="color:#7e2b1e">将覆盖</strong>当前数据。</div>' +
        '<div style="margin-top:10px"><input type="file" id="import-file" accept=".json" onchange="App.importData(this)"></div></div>' +
      '<div class="card"><h3>二维码接力</h3><div style="font-size:14px;color:#6b6154">电脑出码、手机扫，数据不经网盘、不出本机。大备份会自动分段，请<strong>逐段扫描</strong>；扫满段数自动拼装。</div>' +
        '<div style="margin-top:10px"><button class="btn" onclick="App.qrExportStart()">出码（本机数据）</button> ' +
        '<button class="btn" onclick="App.qrImportStart()">扫码导入</button></div>' +
        '<div id="qr-export" style="display:none;margin-top:14px"></div>' +
        '<div id="qr-import" style="display:none;margin-top:14px"></div></div>' +
      '<div class="card"><h3>危险区</h3><div style="font-size:14px;color:#6b6154">清空全部学习数据，不可恢复。</div>' +
        '<div style="margin-top:10px"><button class="btn ghost" onclick="App.clearAll()">清空全部数据</button></div></div>' +
      '<div class="card"><h3>图片来源</h3><div style="font-size:13px;color:#6b6154">经络木刻图取自 Wikimedia Commons（Wellcome Collection，CC BY 4.0）。经典原文供诵读学习，译文与注解仅供参考，最终以原典与师授为准。</div></div>' +
      '</div>';
  }

  /* ---------- 对比卡组 ---------- */
  var cmpMasked = {}; // groupId -> bool（自测模式：遮住定位与主治）
  var cmpOpen = {};   // groupId|序号 -> bool（逐卡揭示）
  function compareView() {
    var groups = window.COMPARE_GROUPS || [];
    var html = groups.map(function (g) {
      var masked = !!cmpMasked[g.id];
      var cards = (g.ids || []).map(function (pid, i) {
        var p = pointMap[pid];
        if (!p) return "";
        var hidden = masked && !cmpOpen[g.id + "|" + i];
        return '<div class="cv-card' + (hidden ? " masked" : "") + '" ' +
          (hidden ? 'onclick="App.cmpFlip(\'' + g.id + '|' + i + '\')"' : '') + '>' +
          '<div class="nm">' + esc(p.name) + '</div><div class="py">' + esc(p.pinyin) + ' · ' + esc(p.id) + '</div>' +
          '<div class="mer">' + esc(p.meridian) + (p.special && p.special !== "无" ? ' · ' + esc(p.special) : '') + '</div>' +
          (hidden
            ? '<div class="cv-hidden">定位与主治已遮住<br>点我对照</div>'
            : '<div class="loc">' + esc(p.location) + '</div>' +
              '<div class="ind">主治：' + esc((p.indications || []).join("、")) + '</div>') +
          '</div>';
      }).join("");
      return '<div class="card cmp-group"><h3>' + esc(g.title) +
        '<span class="src" style="margin-left:10px;font-weight:normal">' + (masked ? "自测中 · 点击卡片揭示" : "") + '</span>' +
        '<button class="btn ghost" style="float:right" onclick="App.cmpMask(\'' + g.id + '\')">' + (masked ? "退出自测" : "自测模式") + '</button></h3>' +
        '<div class="cv-intro">' + esc(g.intro) + '</div>' +
        '<div class="cv-grid">' + cards + '</div>' +
        '<div class="cv-tip"><b>记忆抓手</b> · ' + esc(g.tip) + '</div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">对比<span class="zh-dot"> · </span>卡组</div>' +
      '<div class="page-sub">易混穴摆在一起记，比单个记牢 · <span class="src">开「自测模式」先回忆定位主治，再点卡对照</span></div>' + html + '</div>';
  }

  /* ---------- 循经点穴 ---------- */
  var pw = null; // 会话：{abbr, order:[正确序列], cand:[待点乱序], next, errs, done}
  function pwShuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pwStart(abbr) {
    var idx = (window.MERIDIAN_INDEX || []).find(function (m) { return m.abbr === abbr; });
    if (!idx) { pw = null; return; }
    pw = { abbr: abbr, order: idx.points.slice(), cand: pwShuffle(idx.points.slice()), next: 0, errs: 0, done: false, lastMiss: "" };
  }
  function pwPickList() {
    var cards = (window.MERIDIAN_INDEX || []).filter(function (m) { return m.abbr !== "EX"; }).map(function (m) {
      var doneToday = Store.pwDoneToday(m.abbr);
      var errs = Store.pwErrsToday(m.abbr);
      return '<div class="mer-card" onclick="location.hash=\'#/pathway/' + m.abbr + '\'">' +
        '<div class="pw-mer">' + esc(m.meridian) + '</div>' +
        '<div class="ct">' + m.points.length + ' 穴 · ' +
        (doneToday ? '<span class="pw-ok">今日已过 · 错 ' + errs + ' 次</span>' : '点开始挑战') + '</div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">循经<span class="zh-dot"> · </span>点穴</div>' +
      '<div class="page-sub">把一条经的穴按流注顺序点出来 · <span class="src">经脉流注本身是最好的记忆结构；当日首次通关记一笔打卡</span></div>' +
      '<div class="mer-grid">' + cards + '</div></div>';
  }
  function pwAreaHtml() {
    if (!pw || pw.done) return "";
    var idx = (window.MERIDIAN_INDEX || []).find(function (m) { return m.abbr === pw.abbr; });
    var N = idx.points.length;
    var slots = "";
    for (var i = 0; i < N; i++) {
      slots += i < pw.next
        ? '<div class="pw-slot locked"><span class="no">' + (i + 1) + '</span>' + esc(pw.order[i]) + '</div>'
        : '<div class="pw-slot"><span class="no">' + (i + 1) + '</span><span class="q">?</span></div>';
    }
    var pool = pw.cand.map(function (nm) {
      return '<button class="btn ghost pw-chip' + (pw.lastMiss === nm ? " miss" : "") + '" id="pw-' + esc(nm) + '" onclick="App.pwPick(\'' + esc(nm) + '\')">' + esc(nm) + '</button>';
    }).join("");
    return '<div class="pw-progress">已点 <b>' + pw.next + '</b> / ' + N + ' · 错 ' + pw.errs + ' 次' +
      ' <button class="btn ghost" style="margin-left:10px" onclick="App.pwReset()">重新洗牌</button></div>' +
      '<div class="pw-slots">' + slots + '</div>' +
      '<div class="pw-pool">' + pool + '</div>';
  }
  function pathwayView(abbr) {
    if (!abbr) return pwPickList();
    var idx = (window.MERIDIAN_INDEX || []).find(function (m) { return m.abbr === abbr; });
    if (!idx) return pwPickList();
    if (!pw || pw.abbr !== abbr) pwStart(abbr); // 换经/首次进入才洗牌，route 重绘不打乱进度
    var doneHtml = pw.done
      ? '<div class="pw-done">通关！本经 ' + pw.order.length + ' 穴全数点到 · 错 ' + pw.errs + ' 次' +
        (Store.pwDoneToday(abbr) ? ' <span class="pw-ok">今日已记打卡</span>' : '') +
        ' <button class="btn" onclick="App.pwReset()">再练一遍</button></div>' : "";
    return '<div class="page">' +
      '<div class="crumb"><a href="#/pathway">循经点穴</a> / ' + esc(idx.meridian) + '</div>' +
      '<div class="page-title">' + esc(idx.meridian) + '<span class="zh-dot"> · </span>点穴</div>' +
      '<div class="page-sub">共 ' + idx.points.length + ' 穴 · <span class="src">按经脉流注顺序点出下面的穴，点错会计数但不提示哪个对</span></div>' +
      (pw.done ? doneHtml : '') +
      '<div id="pw-area">' + pwAreaHtml() + '</div></div>';
  }

  /* ---------- 医案库 ---------- */
  var casesChapter = "", casesQ = "", casesSym = "";
  /* 病症维度：关键词表（按现有 12 案手工归纳，新案入库若涉及新病症需在此补关键词） */
  var CASE_SYMS = [
    { tag: "头风头痛", re: /头风|头痛|眩/ },
    { tag: "齿牙痛", re: /龋|齿痛|齿/ },
    { tag: "厥逆急救", re: /尸厥|厥|气绝/ },
    { tag: "风痹不遂", re: /痹|风懿|不挽弓|偏枯/ },
    { tag: "喘咳", re: /喘|咳/ },
    { tag: "泄利", re: /溏|泄|利下|下利/ },
  ];
  /* 穴位维度：医案原文中提到的穴名（含古称）→ 本库穴位 id */
  var CASE_POINTS = [
    { names: ["三阳五会", "百会"], id: "GV20" },
    { names: ["脑户"], id: "GV17" },
    { names: ["肩髃", "肩隅"], id: "LI15" },
    { names: ["肺俞"], id: "BL13" },
    { names: ["脐中", "神阙"], id: "CV8" },
    { names: ["鬲", "膈"], id: "BL17" },
  ];
  function caseSyms(c) {
    var full = c.text + " " + c.takeaway;
    return CASE_SYMS.filter(function (s) { return s.re.test(full); }).map(function (s) { return s.tag; });
  }
  function casePoints(c) {
    return CASE_POINTS.filter(function (p) {
      return p.names.some(function (n) { return c.text.indexOf(n) >= 0; }) && pointMap[p.id];
    }).map(function (p) { return { name: pointMap[p.id].name, id: p.id }; });
  }
  function collectCases() {
    var out = [];
    allChapters().forEach(function (c) {
      chapterSections(c).forEach(function (s) {
        (s.cases || []).forEach(function (cs) {
          var item = { text: cs.text, source: cs.source || "", takeaway: cs.takeaway || "",
            chId: c.id, chTitle: c.title, label: s.label || "" };
          item.syms = caseSyms(item); item.points = casePoints(item);
          out.push(item);
        });
      });
    });
    return out;
  }
  function casesView() {
    var all = collectCases();
    var chs = [];
    all.forEach(function (c) { if (chs.indexOf(c.chTitle) < 0) chs.push(c.chTitle); });
    var q = casesQ.trim().toLowerCase();
    var list = all.filter(function (c) {
      if (casesChapter && c.chTitle !== casesChapter) return false;
      if (casesSym && c.syms.indexOf(casesSym) < 0) return false;
      if (q && (c.text + " " + c.source + " " + c.takeaway).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var chips = ['<button class="read-toggle' + (casesChapter ? "" : " on") + '" onclick="App.casesFilter(\'\', \'\')">全部 ' + all.length + '</button>']
      .concat(chs.map(function (t) {
        var n = all.filter(function (c) { return c.chTitle === t; }).length;
        return '<button class="read-toggle' + (casesChapter === t ? " on" : "") + '" onclick="App.casesFilter(\'' + esc(t) + '\', \'\')">' + esc(t) + ' ' + n + '</button>';
      })).join("");
    /* 病症维度 chips */
    var syms = [];
    all.forEach(function (c) { c.syms.forEach(function (t) { if (syms.indexOf(t) < 0) syms.push(t); }); });
    var symChips = syms.map(function (t) {
      var n = all.filter(function (c) { return c.syms.indexOf(t) >= 0; }).length;
      return '<button class="read-toggle' + (casesSym === t ? " on" : "") + '" onclick="App.casesSym(\'' + esc(t) + '\')">' + esc(t) + ' ' + n + '</button>';
    }).join("");
    var cards = list.map(function (c) {
      var ptChips = c.points.map(function (p) {
        return '<a class="tag moss" href="#/point/' + esc(p.id) + '">穴 · ' + esc(p.name) + '</a>';
      }).join(" ");
      var symChips = c.syms.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join(" ");
      return '<div class="case" style="margin-bottom:14px"><div class="cs-title">' + esc(c.chTitle) + (c.label ? ' · ' + esc(c.label) : '') + '</div>' +
        esc(c.text) +
        '<div class="src">—— ' + esc(c.source) + (c.takeaway ? ' · 启示：' + esc(c.takeaway) : '') + '</div>' +
        ((symChips || ptChips) ? '<div style="margin:8px 0 4px">' + symChips + ' ' + ptChips + '</div>' : '') +
        '<div style="margin-top:8px"><a class="btn ghost" href="#/classic/' + esc(c.chId) + '">回到原文语境 →</a></div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">医案<span class="zh-dot"> · </span>对账库</div>' +
      '<div class="page-sub">散在经典条文下的真实医案汇总于此 · <span class="src">全部注明出处，学理以医案验证——「读经不验案，如观图不渡」</span></div>' +
      '<div style="margin-bottom:12px"><input class="search-input-big" id="cases-q" value="' + esc(casesQ) + '" placeholder="按病症/人物/书名搜，如：头风 / 华佗 / 龋齿"></div>' +
      '<div style="margin-bottom:8px">' + chips + '</div>' +
      (symChips ? '<div style="margin-bottom:16px"><span class="fl" style="margin-right:8px">病症</span>' + symChips + '</div>' : '') +
      (list.length ? cards : '<div class="empty">没有命中的医案</div>') + '</div>';
  }

  /* ---------- 周学习报告 ---------- */
  function fmtD(dt) {
    return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
  }
  function reportView() {
    var days = Store.days(), raw = Store.raw();
    /* 近七日：已读条数（打卡计数）+ 诵读篇数 + 循经通关 */
    var rows = "", weekRead = 0, weekRecite = 0, weekPw = 0;
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
      var k = fmtD(d);
      var rd = days[k] || 0; weekRead += rd;
      var rc = raw.recite && raw.recite[k] ? Object.keys(raw.recite[k]).length : 0; weekRecite += rc;
      var pwN = 0;
      if (raw.pathway) Object.keys(raw.pathway).forEach(function (a) {
        if (raw.pathway[a].d === k) pwN++;
      });
      weekPw += pwN;
      var wd = "日一二三四五六"[d.getDay()];
      rows += '<tr><td>' + (i === 0 ? "今天" : "周" + wd) + '</td><td>' + k.slice(5) + '</td>' +
        '<td>' + (rd ? "◉".repeat(Math.min(rd, 8)) + (rd > 8 ? "×" + rd : "") : "—") + '</td>' +
        '<td>' + (rc ? "诵 " + rc + " 篇" : "—") + '</td>' +
        '<td>' + (pwN ? "通 " + pwN + " 经" : "—") + '</td></tr>';
    }
    var st = Store.quizStats();
    var rate = st.total ? Math.round(st.right / st.total * 100) : null;
    var weakRows = st.weak.slice(0, 10).map(function (w, i) {
      var p = pointMap[w.id];
      return '<tr><td>' + (i + 1) + '</td><td><a href="#/point/' + esc(w.id) + '">' + esc(p ? p.name : w.id) + '</a></td>' +
        '<td>对 ' + w.r + ' / 错 ' + w.w + '</td></tr>';
    }).join("");
    var reciteTotal = raw.recite ? Object.keys(raw.recite).reduce(function (s, k) { return s + Object.keys(raw.recite[k]).length; }, 0) : 0;
    var pwTotal = raw.pathway ? Object.keys(raw.pathway).length : 0;
    return '<div class="page"><div class="page-title">周报<span class="zh-dot"> · </span>学习</div>' +
      '<div class="page-sub">生成于 ' + Store.today() + ' · <span class="src">数据全部来自本机浏览器的学习记录</span></div>' +
      '<div class="stats-row">' +
        '<div class="stat"><div class="num">' + weekRead + '</div><div class="lbl">本周已读</div></div>' +
        '<div class="stat"><div class="num">' + Store.streak() + '</div><div class="lbl">连续天数</div></div>' +
        '<div class="stat"><div class="num">' + Store.readCount() + '</div><div class="lbl">累计已读</div></div>' +
        '<div class="stat"><div class="num">' + (rate === null ? "—" : rate + "%") + '</div><div class="lbl">自测正确率</div></div>' +
      '</div>' +
      '<h2 class="sec">近七日</h2>' +
      '<table class="report-table"><tr><th>日</th><th>日期</th><th>已读条目</th><th>诵读</th><th>循经点穴</th></tr>' + rows + '</table>' +
      '<h2 class="sec">自测</h2>' +
      '<div class="card">累计 ' + st.total + ' 题' + (rate !== null ? ' · 正确率 ' + rate + '%' : ' · 尚未答题') +
        ' · 诵读累计 ' + reciteTotal + ' 篇 · 循经通关累计 ' + pwTotal + ' 经</div>' +
      (st.weak.length ? '<h2 class="sec">薄弱穴 Top10</h2>' +
        '<table class="report-table"><tr><th>#</th><th>穴位</th><th>记录</th></tr>' + weakRows + '</table>' : '') +
      '<div style="margin-top:24px" class="no-print"><button class="btn" onclick="window.print()">打印 / 存 PDF</button>' +
        '<span class="src" style="margin-left:10px">打印时自动隐藏导航与按钮</span></div>' +
      '</div>';
  }

  /* ---------- 入门引导 + 术语快释（小白视角） ---------- */
  var GUIDE_TERMS = [
    { id: "t-jingluo", term: "经络", cat: "基础", def: "运行气血的通路，纵贯全身。主干有十二条（十二经脉），加上任、督等奇经八脉，构成针灸取穴的地图。" },
    { id: "t-xue", term: "腧穴（穴位）", cat: "基础", def: "经络上气血汇聚、反应病痛、接受刺激的点。人体经穴共 361 个，另有经外奇穴。" },
    { id: "t-teding", term: "特定穴", cat: "基础", def: "有特殊身份和用途的穴位总称——下面这些标签（五输穴、原穴、郄穴……）都是特定穴的分类。看到不认识就点它，跳到本表。" },
    { id: "t-wushu", term: "五输穴", cat: "特定穴", def: "十二经在肘膝以下的井、荥、输、经、合五类穴。经气由小到大，如水流由泉到海。《难经》：井主心下满，荥主身热，输主体重节痛，经主喘咳寒热，合主逆气而泄。" },
    { id: "t-yuan", term: "原穴", cat: "特定穴", def: "脏腑原气留止之处，多在腕踝附近。脏有病常查其原穴（「十二经皆以俞为原」，《难经·六十六难》）。" },
    { id: "t-luo", term: "络穴", cat: "特定穴", def: "联络表里两经的枢纽，一穴管两条经。如列缺是肺经络穴，通任脉。" },
    { id: "t-xi", term: "郄穴", cat: "特定穴", def: "经气深聚之处，共 16 个。擅长治急症、重症——如孔最（肺经郄穴）治急性咳血。" },
    { id: "t-beishu", term: "背俞穴", cat: "特定穴", def: "脏腑之气输注于腰背的穴位，位于膀胱经第一侧线，离脊柱 1.5 寸。治脏腑慢性病要穴，如肝俞、肾俞。" },
    { id: "t-mu", term: "募穴", cat: "特定穴", def: "脏腑之气汇聚于胸腹的穴位，与背俞穴前后呼应（俞募配穴）。如中脘是胃之募。" },
    { id: "t-bahui", term: "八会穴", cat: "特定穴", def: "脏、腑、气、血、筋、脉、骨、髓八类精气会聚的八个穴位。如膈俞为血会、阳陵泉为筋会（《难经·四十五难》）。" },
    { id: "t-bamai", term: "八脉交会穴", cat: "特定穴", def: "四肢上与奇经八脉相通的八个穴位，常两两配对使用，如内关配公孙治心胸胃。" },
    { id: "t-xiahe", term: "下合穴", cat: "特定穴", def: "六腑之气下合于下肢的穴位，治腑病为主——「合治内府」（足三里治胃痛即此理）。" },
    { id: "t-shidong", term: "是动病 / 所生病", cat: "经典", def: "《灵枢·经脉》术语。大致说：「是动」指本经经气异常变动发生的病候；「所生病」指本经腧穴所能主治的病。历代注家有分歧，诵读时看条文下的笺注卡。" },
    { id: "t-deqi", term: "得气", cat: "针法", def: "针刺入穴后产生的酸、麻、胀、重感，古称「气至」——「气至而有效」（《灵枢·九针十二原》）。指压到位的酸胀感同理。" },
    { id: "t-yingsui", term: "迎随补泻", cat: "针法", def: "以针刺方向区分补泻的针法：逆经脉来向而刺为迎（泻），顺经脉去向而刺为随（补）。诸家释义有分歧，见笺注。" },
    { id: "t-miuci", term: "缪刺 / 巨刺", cat: "针法", def: "左病刺右、右病刺左的交叉取穴法：浅刺络脉为缪刺，深刺经穴为巨刺（《素问·缪刺论》）。" },
    { id: "t-gudu", term: "骨度分寸法", cat: "取穴", def: "把身体某段骨性长度规定为固定「寸」数来折量取穴，人人比例一致。如两乳头之间作 8 寸——这里的「寸」不是尺子上的寸。" },
    { id: "t-tongshen", term: "手指同身寸", cat: "取穴", def: "用自己的手指量自己的身体：拇指指间关节横宽作 1 寸，四指并拢横宽作 3 寸。方便但粗略，重要部位以骨度分寸为准。" },
    { id: "t-qijing", term: "奇经八脉", cat: "基础", def: "十二经之外的八条经脉：任、督、冲、带、阴跷、阳跷、阴维、阳维。任督与十四经同列本站图谱，余六脉不设穴位。" },
    { id: "t-biaoli", term: "表里经", cat: "基础", def: "脏腑阴阳相配的一对经脉，如肺经与大肠经互为表里。络穴正是沟通表里两经的桥。" },
  ];
  function guideView(termId) {
    var cats = ["基础", "特定穴", "经典", "针法", "取穴"];
    var termsHtml = cats.map(function (cat) {
      var list = GUIDE_TERMS.filter(function (t) { return t.cat === cat; });
      if (!list.length) return "";
      return '<h2 class="sec" id="cat-' + cat + '">' + cat + '</h2>' + list.map(function (t) {
        return '<div class="card" id="' + esc(t.id) + '"><h3>' + esc(t.term) + '</h3><div style="font-size:15px">' + esc(t.def) + '</div></div>';
      }).join("");
    }).join("");
    var steps = [
      { n: "一", t: "先读理论第一课", d: "到「理论」读〈经络总论〉，约十五分钟，把「经络是什么、穴位怎么定」搞明白。不认识的概念，来本页「术语快释」查。", a: "去读第一课", href: "#/theory/meridian-intro" },
      { n: "二", t: "每天认识一个穴", d: "首页「每日一穴」每天换一个，点「细读此穴」看定位、主治和居家按揉方法。积少成多，一个月就是三十个穴。", a: "看今日一穴", href: "#/" },
      { n: "三", t: "自测巩固", d: "「自测」抽穴考你，答错的第二天自动排到最前面复习（间隔复习），记不住也能记住。学累了去「对比卡组」看易混穴。", a: "去自测", href: "#/quiz" },
    ];
    var stepsHtml = steps.map(function (s) {
      return '<div class="card"><h3>第' + s.n + '步 · ' + esc(s.t) + '</h3><div style="font-size:15px">' + esc(s.d) + '</div>' +
        '<div style="margin-top:10px"><a class="btn" href="' + s.href + '">' + esc(s.a) + ' →</a></div></div>';
    }).join("");
    var board = [
      ["理论", "六门零基础课：经络、取穴、特定穴、灸法安全、保健实操、配穴总则"],
      ["经络穴位", "十四经木刻古籍图 + 精讲穴卡片；点击穴名看定位、主治、保健用法"],
      ["经典诵读", "《灵枢》《素问》《难经》原文配白话参考译文；历代注家分歧摆在一起给你看"],
      ["医案", "古籍里的真实医案，按病症筛选，和条文对账"],
      ["对比卡组 / 循经点穴 / 自测", "三种巩固方式：易混穴对照记忆、按经脉流注顺序点穴、随机抽穴默背"],
      ["笔记 / 周报 / 备份", "随手记心得、看学习报告、导出数据（换浏览器前记得备份）"],
    ];
    var boardHtml = board.map(function (b) {
      return '<div class="toc-item" style="cursor:default"><div><div class="t" style="font-size:16px">' + esc(b[0]) + '</div><div class="d">' + esc(b[1]) + '</div></div></div>';
    }).join("");
    return '<div class="page"><div class="page-title">入门<span class="zh-dot"> · </span>新手指南</div>' +
      '<div class="page-sub">三步上手 + 全站导读 + 术语快释 · <span class="src">零基础从这里开始，随时回来查</span></div>' +
      '<h2 class="sec">三步上手</h2>' + stepsHtml +
      '<h2 class="sec">全站导读</h2>' + boardHtml +
      '<div class="warn" style="margin:22px 0">⚠ 安全边界：本站讲的是知识与居家保健（按揉、温和灸）。<strong>不教自行针刺</strong>——针刺实操必须正规面授师承；持续不适请就医，本站不替代诊疗。</div>' +
      '<h2 class="sec">术语快释</h2>' +
      '<div class="page-sub">穴位页里点蓝色的特定穴标签，也会跳到这里对应的解释</div>' +
      termsHtml + '</div>';
  }

  /* ---------- 导出 ---------- */
  window.Views = {
    home: homeView, theory: theoryView, meridians: meridiansView, meridian: meridianView,
    point: pointView, classics: classicsView, classic: classicView, search: searchView,
    notes: notesView, backup: backupView, buildIndex: buildIndex, quiz: quizView,
    compare: compareView, pathway: pathwayView, cases: casesView, report: reportView, guide: guideView,
    helpers: { esc: esc, MER_ABBR: MER_ABBR, allPoints: allPoints, pointMap: pointMap, chapterMap: chapterMap }
  };

  /* 局部重绘下一题（供 App 调用）；返回当前题穴 id */
  window.Views.quizDraw = function (container) {
    drawQuizPoint();
    if (container) container.innerHTML = quizCardHtml(quizCur);
    return quizCur ? quizCur.id : null;
  };
  window.Views.quizCurrentId = function () { return quizCur ? quizCur.id : null; };

  /* 医案库筛选状态（供 App 调用） */
  window.Views.casesFilter = function (ch, q) { casesChapter = ch; casesQ = q || ""; };
  window.Views.casesCurrentChapter = function () { return casesChapter; };
  window.Views.casesSetSym = function (t) { casesSym = (casesSym === t) ? "" : t; };

  /* 局部重绘点穴区（供 App.pwPick/pwReset 调用，避免整页重绘丢失节奏） */
  window.Views.pwArea = function () { return pwAreaHtml(); };

  /* ---- 卡组/点穴的状态变更（供 App 调用） ---- */
  window.Views.cmpMaskToggle = function (gid) {
    cmpMasked[gid] = !cmpMasked[gid];
    if (!cmpMasked[gid]) {
      Object.keys(cmpOpen).forEach(function (k) { if (k.indexOf(gid + "|") === 0) delete cmpOpen[k]; });
    }
  };
  window.Views.cmpReveal = function (key) { cmpOpen[key] = !cmpOpen[key]; };
  window.Views.pwGuess = function (name) {
    if (!pw || pw.done) return "";
    if (name === pw.order[pw.next]) {
      pw.next++;
      pw.cand = pw.cand.filter(function (n) { return n !== name; });
      pw.lastMiss = "";
      if (pw.next >= pw.order.length) {
        pw.done = true;
        Store.pwDone(pw.abbr, pw.errs); // 当日首次通关记一笔打卡
      }
      return "";
    }
    pw.errs++;
    pw.lastMiss = name;
    return name;
  };
  window.Views.pwFinished = function () { return !!pw && pw.done; };
  window.Views.pwRestart = function () { if (pw) pwStart(pw.abbr); };
})();

/* store.js —— 学习状态：localStorage 单源
   结构：{ read:{id:true}, days:{"YYYY-MM-DD":n}, notes:{id:text}, daily:{"YYYY-MM-DD":pointId}, quiz:{id:{r:n,w:n}}, recite:{"YYYY-MM-DD":{章节id:1}}, pathway:{经脉缩写:{d:"日期",errs:n}} }
   markRead/unmarkRead 自动维护当日打卡计数（取消已读会回退计数）；自测答题 bumpDay 计入打卡；诵读打卡每篇 +1。 */
(function () {
  "use strict";
  var KEY = "zjsx_state_v1";

  /* 一次性迁移：难经旧下标制 id（nj-group#0..8 → 16,45,62..68 难）改为稳定难次制（nj-group#n<num>）。
     旧键其余数字（9+）不存在（当时只有 9 条），迁移幂等。 */
  function migrateNanjingIds(s) {
    var old2new = { "nj-group#0": "nj-group#n16", "nj-group#1": "nj-group#n45", "nj-group#2": "nj-group#n62",
      "nj-group#3": "nj-group#n63", "nj-group#4": "nj-group#n64", "nj-group#5": "nj-group#n65",
      "nj-group#6": "nj-group#n66", "nj-group#7": "nj-group#n67", "nj-group#8": "nj-group#n68" };
    ["read", "notes"].forEach(function (field) {
      var obj = s[field], changed = false;
      Object.keys(old2new).forEach(function (oldKey) {
        if (obj[oldKey] !== undefined) {
          obj[old2new[oldKey]] = obj[oldKey];
          delete obj[oldKey];
          changed = true;
        }
      });
      // 只改内存对象，state 建立后随下次操作统一落盘
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        s = { read: s.read || {}, days: s.days || {}, notes: s.notes || {}, daily: s.daily || {}, quiz: s.quiz || {}, recite: s.recite || {}, pathway: s.pathway || {} };
        migrateNanjingIds(s);
        return s;
      }
    } catch (e) { console.warn("状态读取失败，已重置", e); }
    return { read: {}, days: {}, notes: {}, daily: {}, quiz: {}, recite: {}, pathway: {} };
  }

  var state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error("状态保存失败", e); }
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  window.Store = {
    raw: function () { return state; },
    today: today,
    isRead: function (id) { return !!state.read[id]; },
    markRead: function (id) {
      if (state.read[id]) return;
      state.read[id] = true;
      var t = today();
      state.days[t] = (state.days[t] || 0) + 1;
      save();
    },
    unmarkRead: function (id) {
      if (!state.read[id]) return;
      delete state.read[id];
      var t = today();
      if (state.days[t] > 0) state.days[t] -= 1;
      if (!state.days[t]) delete state.days[t];
      save();
    },
    toggleRead: function (id) {
      if (state.read[id]) this.unmarkRead(id); else this.markRead(id);
      return !!state.read[id];
    },
    readCount: function () { return Object.keys(state.read).length; },
    getNote: function (id) { return state.notes[id] || ""; },
    setNote: function (id, text) {
      text = (text || "").trim();
      if (text) state.notes[id] = text; else delete state.notes[id];
      save();
    },
    noteCount: function () { return Object.keys(state.notes).length; },
    /* 连续学习天数：从今天（或昨天）往回数有打卡记录的天数 */
    streak: function () {
      var d = new Date(), n = 0;
      function fmt(dt) {
        return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
      }
      if (!state.days[fmt(d)]) d.setDate(d.getDate() - 1); // 今天还没学则从昨天起算，不打破连续
      while (state.days[fmt(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    days: function () { return state.days; },
    getDaily: function (k) { return state.daily[k]; },
    setDaily: function (k, v) { state.daily[k] = v; save(); },
    /* ---- 自测 ---- */
    getQuiz: function (id) { return state.quiz[id] || { r: 0, w: 0 }; },
    /* SRS-lite 阶段间隔（天）：答对升一档、答错回零；老数据无时间戳走随机池 */
    QUIZ_IV: [1, 3, 7, 16, 35],
    quizAnswer: function (id, right) {
      var q = state.quiz[id] || (state.quiz[id] = { r: 0, w: 0 });
      if (right) q.r++; else q.w++;
      q.s = right ? Math.min((typeof q.s === "number" ? q.s : 0) + 1, 4) : 0; // SRS 阶段
      q.t = Date.now();
      var t = today();
      state.days[t] = (state.days[t] || 0) + 1; // 答题计入当日打卡
      save();
    },
    quizDue: function () {
      var now = Date.now(), due = [];
      Object.keys(state.quiz).forEach(function (id) {
        var q = state.quiz[id];
        if (typeof q.t !== "number" || typeof q.s !== "number") return;
        var iv = (Store.QUIZ_IV[Math.min(q.s, Store.QUIZ_IV.length - 1)] || 1) * 864e5;
        if (now >= q.t + iv) {
          var overdue = Math.floor((now - q.t - iv) / 864e5);
          // 错题卡（阶段0/错多于对）次日必出且排最前：排序权值加 1000 天
          var pri = (q.s === 0 || q.w > q.r) ? overdue + 1000 : overdue;
          due.push({ id: id, overdue: overdue, pri: pri });
        }
      });
      due.sort(function (a, b) { return b.pri - a.pri; }); // 错题最久超期优先
      return due;
    },
    quizStats: function () {
      var r = 0, w = 0, wrong = [];
      Object.keys(state.quiz).forEach(function (id) {
        var q = state.quiz[id]; r += q.r; w += q.w;
        if (q.w > q.r) wrong.push({ id: id, r: q.r, w: q.w });
      });
      return { right: r, wrong: w, total: r + w, weak: wrong };
    },
    clearQuiz: function () { state.quiz = {}; save(); },
    /* ---- 诵读打卡：每篇当日一次，不可取消，计入当日打卡 ---- */
    reciteDone: function (chId) {
      var t = today();
      state.recite[t] = state.recite[t] || {};
      if (state.recite[t][chId]) return false; // 当日已盖过印
      state.recite[t][chId] = 1;
      state.days[t] = (state.days[t] || 0) + 1; // 与打卡墙打通
      save();
      return true;
    },
    recitedToday: function (chId) {
      var t = today();
      return !!(state.recite[t] && state.recite[t][chId]);
    },
    recitedTodayCount: function () { return Object.keys(state.recite[today()] || {}).length; },
    /* ---- 循经点穴：当日首次通关记一笔打卡，错次取当日最好成绩 ---- */
    pwDone: function (abbr, errs) {
      var t = today();
      var first = !(state.pathway[abbr] && state.pathway[abbr].d === t);
      var prev = state.pathway[abbr] && state.pathway[abbr].d === t ? state.pathway[abbr].errs : 99;
      state.pathway[abbr] = { d: t, errs: Math.min(prev, typeof errs === "number" ? errs : 0) };
      if (first) state.days[t] = (state.days[t] || 0) + 1;
      save();
    },
    pwDoneToday: function (abbr) {
      var rec = state.pathway[abbr];
      return !!rec && rec.d === today();
    },
    pwErrsToday: function (abbr) {
      var rec = state.pathway[abbr];
      return rec && rec.d === today() ? rec.errs : null;
    },
    exportJSON: function () {
      return JSON.stringify({ app: "针经堂", version: 1, exportedAt: new Date().toISOString(), state: state }, null, 2);
    },
    importJSON: function (text) {
      var obj = JSON.parse(text);
      var s = obj && obj.state ? obj.state : obj;
      if (!s || typeof s !== "object" || !s.read) throw new Error("不是针经堂备份文件");
      state = { read: s.read || {}, days: s.days || {}, notes: s.notes || {}, daily: s.daily || {}, quiz: s.quiz || {}, recite: s.recite || {}, pathway: s.pathway || {} };
      save();
    },
    clearAll: function () {
      state = { read: {}, days: {}, notes: {}, daily: {}, quiz: {}, recite: {}, pathway: {} };
      save();
    }
  };
})();

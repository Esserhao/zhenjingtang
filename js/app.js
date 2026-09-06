/* app.js —— 路由与全局交互 */
(function () {
  "use strict";

  var main = document.getElementById("main");
  var lastQuery = "";

  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("?"), path = parts[0] || "home", qs = new URLSearchParams(parts[1] || "");
    var seg = path.split("/").filter(Boolean);
    var html;
    var V = window.Views;
    switch (seg[0]) {
      case "": case "home": html = V.home(); break;
      case "theory": html = V.theory(seg[1]); break;
      case "meridians": html = V.meridians(); break;
      case "meridian": html = V.meridian(seg[1]); break;
      case "point": html = V.point(seg[1]); break;
      case "classics": html = V.classics(); break;
      case "classic": html = V.classic(seg[1]); break;
      case "search": lastQuery = qs.get("q") || ""; html = V.search(lastQuery); break;
      case "notes": html = V.notes(); break;
      case "quiz": html = V.quiz(); break;
      case "compare": html = V.compare(); break;
      case "pathway": html = V.pathway(seg[1]); break;
      case "cases": html = V.cases(); break;
      case "report": html = V.report(); break;
      case "guide": html = V.guide(seg[1]); break;
      case "backup": html = V.backup(); break;
      default: html = V.home();
    }
    main.innerHTML = html;
    document.querySelectorAll(".nav-tab").forEach(function (a) {
      a.classList.toggle("active", a.dataset.nav === seg[0]);
    });
    updateStreakChip();
    if (seg[0] === "search") wireSearchBox();
    if (seg[0] === "cases") wireCasesBox();
    if (seg[0] === "guide" && seg[1]) scrollToTerm(seg[1]);
    window.scrollTo(0, 0);
  }

  function updateStreakChip() {
    var el = document.getElementById("streak-chip");
    var n = Store.streak();
    el.textContent = n > 0 ? "已连学 " + n + " 天" : "今日尚未打卡";
  }

  function wireSearchBox() {
    var box = document.getElementById("search-big");
    if (!box) return;
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter") location.hash = "#/search?q=" + encodeURIComponent(box.value.trim());
    });
    box.focus();
    box.setSelectionRange(box.value.length, box.value.length);
  }

  /* ---------- 全局交互（views 里 inline 调用） ---------- */
  window.App = {
    toggleRead: function (btn, id) {
      var on = Store.toggleRead(id);
      btn.classList.toggle("on", on);
      updateStreakChip();
    },
    saveNote: function (id) {
      var ta = document.getElementById("note-" + id);
      Store.setNote(id, ta.value);
      ta.value = Store.getNote(id);
      btnFlash(ta, "已保存");
    },
    editNoteFromList: function (id) {
      if (window.Views.helpers.pointMap[id]) { location.hash = "#/point/" + id; }
      else if (id.indexOf("nj-group#") === 0) { location.hash = "#/classic/nj-group"; }
      else if (id.indexOf("#") >= 0) {
        var cid = id.split("#")[0];
        if (window.Views.helpers.chapterMap[cid]) location.hash = "#/classic/" + cid;
        else location.hash = "#/theory/" + cid;
      }
    },
    deleteNote: function (id) {
      if (!confirm("删除这条笔记？")) return;
      Store.setNote(id, "");
      route();
    },
    exportData: function () {
      var blob = new Blob([Store.exportJSON()], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "针经堂备份-" + Store.today() + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
    },
    importData: function (input) {
      var f = input.files && input.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          Store.importJSON(r.result);
          alert("导入成功");
          route();
        } catch (e) { alert("导入失败：" + e.message); }
      };
      r.readAsText(f, "utf-8");
    },
    /* ---- 二维码接力 ----
       段格式：ZJSX1|i|n|b64(JSON)。b64 为 UTF-8 安全 base64，不含 "|"，可直接 split。 */
    _qrChunks: null, _qrIdx: 0, _qrRecv: null, _qrStream: null, _qrScanning: false,
    qrEncodeB64: function (s) { return btoa(unescape(encodeURIComponent(s))); },
    qrDecodeB64: function (b) { return decodeURIComponent(escape(atob(b))); },
    qrExportStart: function () {
      var json = Store.exportJSON();
      var b64 = App.qrEncodeB64(json);
      var CH = 600, n = Math.max(1, Math.ceil(b64.length / CH));
      App._qrChunks = [];
      for (var i = 0; i < n; i++)
        App._qrChunks.push("ZJSX1|" + (i + 1) + "|" + n + "|" + b64.slice(i * CH, (i + 1) * CH));
      App._qrIdx = 0;
      var box = document.getElementById("qr-export");
      box.style.display = "block";
      App.qrRenderChunk();
    },
    qrRenderChunk: function () {
      var box = document.getElementById("qr-export");
      if (!App._qrChunks || typeof qrcode !== "function") {
        box.innerHTML = '<span style="color:#7e2b1e">二维码库未加载</span>';
        return;
      }
      var qr = qrcode(0, "M");
      qr.addData(App._qrChunks[App._qrIdx], "Byte");
      qr.make();
      var count = qr.getModuleCount(), scale = 5, quiet = 4;
      var size = (count + quiet * 2) * scale;
      box.innerHTML =
        '<canvas id="qr-canvas" width="' + size + '" height="' + size + '"></canvas>' +
        '<div class="qr-line" id="qr-chunk-label">第 ' + (App._qrIdx + 1) + ' / ' + App._qrChunks.length + ' 段 · 请逐段扫，扫满自动拼装</div>' +
        '<div><button class="btn ghost" onclick="App.qrPrevChunk()">← 上一段</button> ' +
        '<button class="btn ghost" onclick="App.qrNextChunk()">下一段 →</button> ' +
        '<button class="btn ghost" onclick="App.qrExportStop()">收起</button></div>';
      var ctx = document.getElementById("qr-canvas").getContext("2d");
      ctx.fillStyle = "#f4efe2"; ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#2f2a24";
      for (var r = 0; r < count; r++)
        for (var c = 0; c < count; c++)
          if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
    },
    qrNextChunk: function () { if (App._qrIdx < App._qrChunks.length - 1) { App._qrIdx++; App.qrRenderChunk(); } },
    qrPrevChunk: function () { if (App._qrIdx > 0) { App._qrIdx--; App.qrRenderChunk(); } },
    qrExportStop: function () {
      var box = document.getElementById("qr-export");
      if (box) { box.style.display = "none"; box.innerHTML = ""; }
      App._qrChunks = null; App._qrIdx = 0;
    },
    qrImportStart: function () {
      var box = document.getElementById("qr-import");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        box.style.display = "block";
        box.innerHTML = '<div class="qr-line" style="color:#7e2b1e">此浏览器不支持摄像头扫码，请改用上方文件导入。</div>' +
          '<button class="btn ghost" onclick="App.qrImportStop()">关闭</button>';
        return;
      }
      App._qrRecv = { n: null, parts: {} };
      box.style.display = "block";
      box.innerHTML = '<video id="qr-video" playsinline muted style="width:280px;max-width:100%;background:#2f2a24;border-radius:4px;display:block"></video>' +
        '<div class="qr-line" id="qr-progress">正在启动摄像头…请对准二维码，逐段扫</div>' +
        '<button class="btn ghost" onclick="App.qrImportStop()">取消扫码</button>';
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
        App._qrStream = stream;
        var video = document.getElementById("qr-video");
        if (!video) { App.qrStopStream(); return; }
        video.srcObject = stream;
        video.play();
        App._qrScanning = true;
        requestAnimationFrame(App.qrScanLoop);
      }).catch(function (e) {
        var msg = (e && e.message) ? e.message : "未知错误";
        box.innerHTML = '<div class="qr-line" style="color:#7e2b1e"></div>' +
          '<button class="btn ghost" onclick="App.qrImportStop()">关闭</button>';
        box.firstChild.textContent = "摄像头不可用：" + msg + "。可改用上方文件导入。";
      });
    },
    qrScanLoop: function () {
      if (!App._qrScanning) return;
      var video = document.getElementById("qr-video");
      var work = document.getElementById("qr-work");
      if (!work) {
        work = document.createElement("canvas");
        work.id = "qr-work"; work.style.display = "none";
        document.body.appendChild(work);
      }
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        if (work.width !== video.videoWidth) { work.width = video.videoWidth; work.height = video.videoHeight; }
        var ctx = work.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0);
        var img = ctx.getImageData(0, 0, work.width, work.height);
        var code = (typeof jsQR === "function") && jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (code && code.data) App.qrHandleChunk(code.data);
      }
      requestAnimationFrame(App.qrScanLoop);
    },
    qrHandleChunk: function (text) {
      if (typeof text !== "string" || text.indexOf("ZJSX1|") !== 0) return;
      var seg = text.split("|");
      var i = parseInt(seg[1], 10), n = parseInt(seg[2], 10);
      if (!i || !n || i > n) return;
      if (!App._qrRecv) App._qrRecv = { n: null, parts: {} };
      var recv = App._qrRecv;
      if (recv.n && recv.n !== n) { recv.parts = {}; } // 段数变了，重新收
      recv.n = n;
      if (recv.parts[i]) return; // 重复扫同段去重
      recv.parts[i] = seg[3];
      var got = Object.keys(recv.parts).length;
      var prog = document.getElementById("qr-progress");
      if (prog) prog.textContent = "已收 " + got + " / " + n + " 段";
      if (got === n) App.qrFinishImport();
    },
    qrFinishImport: function () {
      App.qrStopStream();
      var recv = App._qrRecv, b64 = "";
      for (var i = 1; i <= recv.n; i++) b64 += recv.parts[i] || "";
      var box = document.getElementById("qr-import");
      try {
        var json = App.qrDecodeB64(b64);
        JSON.parse(json); // 先验可解析
        if (!confirm("已收齐 " + recv.n + " 段。导入将覆盖当前数据，确定？")) {
          box.innerHTML = '<div class="qr-line">已取消导入，可重新点「扫码导入」。</div>';
          return;
        }
        Store.importJSON(json);
        box.innerHTML = '<div class="qr-line" style="color:#3d5a4c">导入成功 ✓</div>';
        updateStreakChip();
      } catch (e) {
        box.innerHTML = '<div class="qr-line" style="color:#7e2b1e">拼装或解析失败，请重新扫全部段落。</div>' +
          '<button class="btn ghost" onclick="App.qrImportStop()">关闭</button>';
      }
    },
    qrStopStream: function () {
      App._qrScanning = false;
      if (App._qrStream) {
        App._qrStream.getTracks().forEach(function (t) { t.stop(); });
        App._qrStream = null;
      }
    },
    qrImportStop: function () {
      App.qrStopStream();
      var box = document.getElementById("qr-import");
      if (box) { box.style.display = "none"; box.innerHTML = ""; }
      App._qrRecv = null;
    },
    clearAll: function () {
      if (!confirm("确定清空全部学习数据？此操作不可恢复。")) return;
      Store.clearAll();
      route();
    },
    /* ---- 自测 ---- */
    quizFlip: function () {
      var ans = document.getElementById("quiz-answer");
      var acts = document.getElementById("quiz-actions");
      if (!ans || window.Views.quizCurrentId() == null) return;
      ans.style.display = "block";
      acts.innerHTML = '<div class="q-judge"><span>记得牢吗？</span>' +
        '<button class="btn" onclick="App.quizAnswer(true)">记得 ✓</button>' +
        '<button class="btn ghost" onclick="App.quizAnswer(false)">记错 ✗</button>' +
        '<button class="btn ghost" onclick="App.quizNext()">跳过 → 下一题</button></div>';
    },
    quizAnswer: function (right) {
      var id = window.Views.quizCurrentId();
      if (id == null) return;
      Store.quizAnswer(id, right);
      route(); // 整页重绘：统计行、打卡章、新题卡一并更新
    },
    quizNext: function () {
      window.Views.quizDraw(document.getElementById("quiz-area"));
    },
    /* ---- 诵读打卡 ---- */
    reciteDone: function (chId) {
      Store.reciteDone(chId);
      route();
    },
    /* ---- 对比卡组 ---- */
    cmpMask: function (gid) {
      window.Views.cmpMaskToggle(gid);
      route();
    },
    cmpFlip: function (key) {
      window.Views.cmpReveal(key);
      route();
    },
    /* ---- 循经点穴 ---- */
    pwPick: function (name) {
      var area = document.getElementById("pw-area");
      var miss = window.Views.pwGuess(name);
      if (area) area.innerHTML = window.Views.pwArea();
      if (miss) { // 错误短闪提示，不告知正确答案
        var el = document.getElementById("pw-" + miss);
        if (el) { el.classList.add("miss"); setTimeout(function () { el.classList.remove("miss"); }, 420); }
      }
      if (window.Views.pwFinished()) route(); // 通关后整页重绘，显示结案面板与打卡标记
    },
    pwReset: function () {
      window.Views.pwRestart();
      route();
    },
    quizReset: function () {
      if (!confirm("清零全部自测记录？打卡与笔记不受影响。")) return;
      Store.clearQuiz();
      route();
    },
    /* ---- 医案库筛选 ---- */
    casesFilter: function (ch, q) {
      var box = document.getElementById("cases-q");
      window.Views.casesFilter(ch, q != null ? q : (box ? box.value : ""));
      route();
    },
    casesSym: function (t) {
      window.Views.casesSetSym(t);
      route();
    },
    dismissGuide: function () {
      Store.dismissGuide();
      route();
    },
    setFont: function (lv) {
      var v = Store.setFontScale(parseInt(lv, 10));
      document.querySelectorAll(".font-btn").forEach(function (b) {
        b.classList.toggle("on", parseInt(b.dataset.lv, 10) === v);
      });
    }
  };

  function wireCasesBox() {
    var box = document.getElementById("cases-q");
    if (!box) return;
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter") App.casesFilter(window.Views.casesCurrentChapter(), box.value);
    });
  }

  function btnFlash(ta, msg) {
    var old = ta.nextElementSibling && ta.nextElementSibling.querySelector ? ta.nextElementSibling : null;
    var note = document.createElement("span");
    note.textContent = " " + msg;
    note.style.cssText = "color:#3d5a4c;font-size:13px;font-family:KaiTi,serif;margin-left:8px";
    if (old) old.appendChild(note);
    setTimeout(function () { note.remove(); }, 1500);
  }

  /* 自测的卡面状态在 views.js 内部，这里只负责触发与统计刷新 */

  /* ---------- 启动 ---------- */
  var sidebarSearch = document.getElementById("global-search");
  sidebarSearch.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      location.hash = "#/search?q=" + encodeURIComponent(sidebarSearch.value.trim());
      sidebarSearch.blur();
    }
  });

  function scrollToTerm(termId) {
    var el = document.getElementById(decodeURIComponent(termId));
    if (el) {
      var top = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo(0, top);
      el.style.borderColor = "var(--cinnabar)";
    }
  }

  // 启动应用字号档并点亮对应按钮
  (function () {
    var lv = Store.fontScale();
    if (lv) Store.setFontScale(lv);
    document.querySelectorAll(".font-btn").forEach(function (b) {
      b.classList.toggle("on", parseInt(b.dataset.lv, 10) === lv);
    });
  })();
  window.Views.buildIndex();
  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#/home";
  route();
})();

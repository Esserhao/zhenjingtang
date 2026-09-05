/* ============================================================
   二维码接力链路回归测试（Node 直接跑，无需浏览器）
   验证：出码分块格式 ZJSX1|i|n|b64 → QR 矩阵（与页面同参数：
   scale=5 / quiet=4 / 宣纸底 #f4efe2 / 墨点 #2f2a24）→ jsQR 解码
   → 拼装 base64 → 还原 JSON → 与原始备份逐字一致。
   用法：node tools/qr-sync-test.js
   ============================================================ */
const path = require("path");

// qrcode-generator 2.0.4 是双轨包，require 兼容处理
let qrcode = require(path.join(__dirname, "..", "assets", "vendor", "qrcode.min.js"));
if (typeof qrcode !== "function") qrcode = qrcode.qrcode || qrcode.default;
const jsQR = require(path.join(__dirname, "..", "assets", "vendor", "jsQR.min.js"));

const b64enc = (s) => Buffer.from(s, "utf8").toString("base64"); // 等价 btoa(unescape(encodeURIComponent(s)))
const b64dec = (b) => Buffer.from(b, "base64").toString("utf8");

/* ---- 1. 造一份含中文笔记的假备份（同 Store.exportJSON 外层结构） ---- */
const state = {
  read: { "LU1": true, "ST36": true, "ls-jzsey#0": true },
  days: { "2026-09-01": 3, "2026-09-02": 5, "2026-09-03": 2 },
  notes: { "ST36": "足三里：肚腹三里留。灸之可健运脾胃，试验性记录 emoji 🙂 与引号\"句\"。" },
  daily: { "2026-09-03": "SI4" },
  quiz: { "SI4": { r: 3, w: 1 }, "LI8": { r: 0, w: 2 }, "PC6": { r: 1, w: 1 } }
};
const backup = JSON.stringify({ app: "针经堂", version: 1, exportedAt: new Date().toISOString(), state }, null, 2);

/* ---- 2. 与 App.qrExportStart 相同的分块 ---- */
const CH = 600;
const b64 = b64enc(backup);
const n = Math.max(1, Math.ceil(b64.length / CH));
const chunks = [];
for (let i = 0; i < n; i++)
  chunks.push("ZJSX1|" + (i + 1) + "|" + n + "|" + b64.slice(i * CH, (i + 1) * CH));
console.log(`备份 ${backup.length} 字节 → base64 ${b64.length} 字符 → ${n} 段`);

/* ---- 3. 每段编码成 QR 矩阵，再按页面同参数栅格化并用 jsQR 解码 ---- */
const SCALE = 5, QUIET = 4;
const decoded = chunks.map((payload, idx) => {
  const qr = qrcode(0, "M");
  qr.addData(payload, "Byte");
  qr.make();
  const count = qr.getModuleCount();
  const size = (count + QUIET * 2) * SCALE;
  // RGBA 缓冲：浅底深点（jsQR 按亮度识别，颜色深浅等效黑白）
  const px = new Uint8ClampedArray(size * size * 4);
  const set = (x, y, v) => {
    const o = (y * size + x) * 4;
    px[o] = px[o + 1] = px[o + 2] = v; px[o + 3] = 255;
  };
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) set(x, y, 244); // 宣纸底
  for (let r = 0; r < count; r++)
    for (let c = 0; c < count; c++)
      if (qr.isDark(r, c))
        for (let dy = 0; dy < SCALE; dy++)
          for (let dx = 0; dx < SCALE; dx++)
            set((c + QUIET) * SCALE + dx, (r + QUIET) * SCALE + dy, 47); // 墨点
  const res = jsQR(px, size, size, { inversionAttempts: "dontInvert" });
  const out = res && res.data;
  if (out !== payload) {
    console.error(`✗ 第 ${idx + 1} 段解码不符\n  期望长度 ${payload.length} 实得 ${out ? out.length : null}`);
    process.exit(1);
  }
  console.log(`✓ 第 ${idx + 1}/${n} 段：${payload.length} 字符，${count}×${count} 模块，解码一致`);
  return out;
});

/* ---- 4. 与 App.qrFinishImport 相同的拼装 ---- */
const gotB64 = decoded.map(d => d.split("|")[3]).join("");
const gotJson = b64dec(gotB64);
if (gotJson !== backup) {
  console.error("✗ 拼装后的 JSON 与原备份不一致");
  process.exit(1);
}
const back = JSON.parse(gotJson);
if (!back.state || !back.state.read || back.state.notes.ST36.indexOf("足三里") < 0) {
  console.error("✗ 还原的状态字段缺失");
  process.exit(1);
}
console.log("✓ 拼装还原成功：JSON 逐字一致，中文字段完好");
console.log("\n全部通过 —— 二维码接力链路（分块/编码/解码/拼装）可用");

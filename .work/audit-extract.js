// 审校辅助：对 diff-report 中含 replace 差异的条目，重新对齐源文并输出逐字差异
const fs = require('fs');
global.window = {};
require('E:/Desk/中医学习/data/classics.js');
require('E:/Desk/中医学习/data/suwen.js');
require('E:/Desk/中医学习/data/nanjing.js');
const LINGSHU = window.LINGSHU, SUWEN = window.SUWEN, NANJING = window.NANJING;

const srcCache = {};
function loadSrc(name){
  if(!srcCache[name]){
    const map = {classics:'灵枢经.txt', suwen:'黄帝内经素问.txt', nanjing:'八十一难经.txt'};
    srcCache[name] = fs.readFileSync('E:/Desk/中医学习/.work/src/'+map[name],'utf8').replace(/\s+/g,'');
  }
  return srcCache[name];
}

const rep = JSON.parse(fs.readFileSync('E:/Desk/中医学习/.work/replace-diffs.json','utf8'));
function norm(s){return s.replace(/[，。；：、！？“”《》（）]/g,'');}

function align(name, ours){
  const src = loadSrc(name);
  const probe = norm(ours).slice(0, 24);
  if(!probe) return null;
  let i = -1, from = 0;
  while(true){
    i = src.indexOf(probe, from);
    if(i<0) break;
    // extend match to find window
    break;
  }
  if(i<0){
    // try shorter probe
    for(let l=12; l>=4; l--){
      const p = norm(ours).slice(0,l);
      i = src.indexOf(p);
      if(i>=0) break;
    }
    if(i<0) return null;
  }
  // window: extend to cover whole ours; take generous window around i
  const start = Math.max(0, i-10);
  const need = norm(ours).length + 60;
  let end = start;
  let cnt = 0;
  const chars = src.slice(start);
  while(cnt < need && end < chars.length){
    const ch = chars[end];
    if(!/[，。；：、！？“”《》（）]/.test(ch)) cnt++;
    end++;
  }
  return chars.slice(0, end);
}

// simple LCS char diff ignoring punctuation on src side for alignment
function diffOursVsSrc(ours, window){
  // align ignoring punct in window; then walk both producing ops
  const out = [];
  let wi = 0, oi = 0;
  const isP = c => /[，。；：、！？“”《》（）—…]/.test(c);
  // Use LCS over normalized streams but keep mapping
  const a = [...ours]; const b = [];
  const mapB = [];
  for(let k=0;k<window.length;k++){ if(!isP(window[k])){ b.push(window[k]); mapB.push(k);} }
  const n=a.filter(c=>!isP(c)).length;
  // dp LCS (a-norm vs b)
  const an = a.map((c,idx)=>({c,skip:isP(c)}));
  const m1 = an.filter(x=>!x.skip).length;
  const dp = Array.from({length:m1+1},()=>new Uint16Array(b.length+1));
  const av = an.filter(x=>!x.skip).map(x=>x.c);
  for(let i=1;i<=m1;i++) for(let j=1;j<=b.length;j++){
    dp[i][j] = av[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
  }
  // backtrack
  let i=m1, j=b.length; const ops=[];
  while(i>0||j>0){
    if(i>0&&j>0&&av[i-1]===b[j-1]){ ops.push(['=',av[i-1]]); i--; j--; }
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){ ops.push(['+',b[j-1]]); j--; }
    else { ops.push(['-',av[i-1]]); i--; }
  }
  ops.reverse();
  // merge consecutive
  const merged=[];
  for(const [t,c] of ops){
    const last=merged[merged.length-1];
    if(last && last.t===t){ last.s+=c; } else merged.push({t,s:c});
  }
  return merged;
}

const result=[];
for(const e of rep){
  const coll = e.file==='classics'?LINGSHU:e.file==='suwen'?SUWEN:NANJING;
  let ours=null;
  if(e.file==='nanjing'){ ours = (coll.find(x=>x.num===parseInt(e.chap.replace(/[^0-9]/g,'')))||{}).original; }
  else if(e.file==='classics'){ for(const t of coll){ const sec=(t.sections||[]).find(s=>s.label===e.label&&t.title===e.chap); if(sec){ours=sec.original;break;} } }
  else { for(const t of coll){ const sec=(t.sections||[]).find(s=>s.label===e.label&&t.title===e.chap); if(sec){ours=sec.original;break;} } }
  if(ours==null){ result.push({file:e.file,chap:e.chap,label:e.label,error:'NOT FOUND'}); continue; }
  const w = align(e.file, ours);
  const d = w? diffOursVsSrc(ours, w) : null;
  result.push({file:e.file,chap:e.chap,label:e.label,len:ours.length,windowStart: w? w.slice(0,20):null, ops: d});
}
fs.writeFileSync('E:/Desk/中医学习/.work/audit-diff.json', JSON.stringify(result,null,1),'utf8');
console.log('done', result.length, 'errors:', result.filter(r=>r.error).length);

// Generator: scenes.json + assets/transcript.json -> index.html, compositions/*.html, script_en.md
// Plain Node, no dependencies. Idempotent. Run: node tools/build.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...a) => path.join(ROOT, ...a);
const S = JSON.parse(fs.readFileSync(P("scenes.json"), "utf8"));
const W = S.canvas.width, H = S.canvas.height;
const f3 = (n) => Number(n.toFixed(3));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------- stage / camera geometry ----------
const STAGE = { x: 660, y: 50, w: 700, h: 850, r: 36 };
const REC_H = 850;
const REC_W = (S.source.width / S.source.height) * REC_H; // ~390.47
const OX = (STAGE.w - REC_W) / 2;
const K = REC_H / S.source.height; // source px -> camera px at rest

// ---------- avatar slot logic (single switch) ----------
function recapLayout(step, idx) {
  const rel = step.recap.avatar;
  const file = rel && fs.existsSync(P(rel)) ? rel : null;
  if (!file) return { mode: "card", avatar: null, duration: S.timing.recap };
  let dur = S.timing.recap;
  try {
    const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", P(rel)]).toString().trim();
    const d = parseFloat(out);
    if (d > 0) dur = Math.min(20, Math.max(S.timing.recap, d));
  } catch {}
  return { mode: "avatar", avatar: file, duration: f3(dur) };
}

// ---------- timeline ----------
const T = { title: { start: 0, dur: S.timing.title } };
let cursor = S.timing.title;
const steps = S.steps.map((st, i) => {
  const chapter = { start: f3(cursor), dur: S.timing.chapter };
  cursor += S.timing.chapter;
  const segDur = f3(st.clipEnd - st.clipStart);
  const seg = { start: f3(cursor), dur: segDur };
  cursor += segDur;
  const rl = recapLayout(st, i);
  const recap = { start: f3(cursor), dur: rl.duration, layout: rl };
  cursor += rl.duration;
  return { ...st, n: i + 1, chapter, seg, recap, fin: (t) => f3(seg.start + (t - st.clipStart)) };
});
const OUTRO = { start: f3(cursor), dur: S.timing.outro };
const TOTAL = f3(cursor + S.timing.outro);

// ---------- transcript -> caption groups ----------
let words = [];
const tpath = P("assets", "transcript.json");
if (fs.existsSync(tpath)) {
  words = JSON.parse(fs.readFileSync(tpath, "utf8")).words.filter((w) => w.text && String(w.text).trim() && /[\p{L}\p{N}]/u.test(w.text));
} else console.warn("WARNING: assets/transcript.json missing - captions empty");

const MAX_WORDS = 6, MAX_CHARS = 36, PAUSE = 0.15;
const isEnd = (t) => /[.?!]["”')\]]*$/.test(t.trim());
function buildGroups(stepWords) {
  const gs = [];
  let cur = [];
  const chars = (arr) => arr.map((w) => w.text.trim()).join(" ").length;
  for (let i = 0; i < stepWords.length; i++) {
    const w = stepWords[i];
    if (cur.length && (cur.length >= MAX_WORDS || chars([...cur, w]) > MAX_CHARS)) { gs.push(cur); cur = []; }
    cur.push(w);
    const nxt = stepWords[i + 1];
    if (!nxt) break;
    const sentence = isEnd(w.text);
    const pause = nxt.s - w.e >= PAUSE;
    if (sentence || (pause && cur.length >= 2) || (cur.length >= 3 && /[,;:]$/.test(w.text.trim()) && false)) { gs.push(cur); cur = []; }
  }
  if (cur.length) gs.push(cur);
  // repair 1-word groups that are not a sentence on their own
  for (let i = 0; i < gs.length; i++) {
    if (gs[i].length !== 1) continue;
    const prevEnds = i === 0 || isEnd(gs[i - 1][gs[i - 1].length - 1].text);
    const alone = prevEnds && isEnd(gs[i][0].text);
    if (alone) continue;
    const ok = (a) => a.length <= MAX_WORDS && a.map((w) => w.text.trim()).join(" ").length <= MAX_CHARS + 6;
    if (i > 0 && !prevEnds && ok([...gs[i - 1], ...gs[i]])) { gs[i - 1].push(...gs[i]); gs.splice(i, 1); i--; }
    else if (i + 1 < gs.length && !isEnd(gs[i][0].text) && ok([...gs[i], ...gs[i + 1]])) { gs[i + 1].unshift(...gs[i]); gs.splice(i, 1); i--; }
    else if (i > 0 && gs[i - 1].length >= 3) { gs[i].unshift(gs[i - 1].pop()); }
  }
  return gs;
}
const capGroups = [];
for (const st of steps) {
  const sw = words
    .filter((w) => Number(w.step) === st.n)
    .map((w) => ({ text: w.text.trim(), s: st.fin(w.start), e: st.fin(w.end) }))
    .filter((w) => w.s >= st.seg.start - 0.01 && w.s < st.seg.start + st.seg.dur);
  for (let i = 0; i < sw.length; i++) { if (i && sw[i].s < sw[i - 1].s) sw[i].s = sw[i - 1].s; if (sw[i].e < sw[i].s) sw[i].e = sw[i].s + 0.05; }
  const gs = buildGroups(sw);
  const segEnd = st.seg.start + st.seg.dur;
  gs.forEach((g, i) => {
    const open = Math.max(st.seg.start + 0.02, g[0].s - 0.1);
    let close = Math.min(g[g.length - 1].e + 0.25, segEnd - 0.02);
    const nx = gs[i + 1];
    if (nx) { const nOpen = Math.max(st.seg.start + 0.02, nx[0].s - 0.1); if (nOpen < close) close = nOpen; }
    capGroups.push({ words: g, open: f3(open), close: f3(Math.max(close, open + 0.3)), step: st.n });
  });
}

// ---------- shared scene helpers ----------
const TOKENS = "--ground:#F5F3EE;--ink:#15171C;--muted:#5B616E;--line:#E2DED3;--card:#FFFFFF;--accent:#2563EB;--accent-soft:#DCE7FF;--stage:#0F1218;";
function scene({ id, css, body, js }) {
  return `<template>
  <style>
    #root { position: absolute; inset: 0; ${TOKENS} font-family: Inter, sans-serif; color: var(--ink); overflow: hidden; }
    #root * { box-sizing: border-box; margin: 0; padding: 0; }
${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${body}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${js}
    window.__timelines = window.__timelines || {};
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}
const ENTER = `duration: 0.5, ease: "power3.out"`;
const enter = (sel, at, y = 28) => `    tl.fromTo("${sel}", { opacity: 0, y: ${y} }, { opacity: 1, y: 0, ${ENTER} }, ${f3(at)});`;
const exitAt = (sel, at) => `    tl.fromTo("${sel}", { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.in" }, ${f3(at)});`;
const out = {};
const write = (name, html) => { out[name] = html; };

// ---------- 00-title ----------
write("00-title", scene({
  id: "title",
  css: `    #t-wrap { position: absolute; inset: 0; }
    #t-text { position: absolute; left: 80px; top: 300px; width: 680px; }
    #t-kicker { font-size: 26px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
    #t-head { margin-top: 26px; font-size: 92px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.04; }
    #t-sub { margin-top: 30px; font-size: 38px; font-weight: 400; color: var(--muted); line-height: 1.3; }
    #t-banner { position: absolute; left: 800px; top: 382px; width: 560px; height: 315px; border-radius: 28px; overflow: hidden; box-shadow: 0 12px 40px rgba(21,23,28,.10); border: 1px solid var(--line); }
    #t-banner img { width: 100%; height: 100%; object-fit: cover; display: block; }`,
  body: `    <div id="t-wrap">
      <div id="t-text">
        <div id="t-kicker">${esc(S.title.kicker)}</div>
        <h1 id="t-head">${esc(S.title.headline)}</h1>
        <div id="t-sub">${esc(S.title.sub)}</div>
      </div>
      <div id="t-banner"><img id="t-banner-img" src="${S.brand.banner}" alt="${esc(S.brand.name)}" /></div>
    </div>`,
  js: [enter("#t-kicker", 0.2), enter("#t-head", 0.4), enter("#t-sub", 0.7), enter("#t-banner", 0.9), exitAt("#t-wrap", T.title.dur - 0.3)].join("\n"),
}));

// ---------- chapters ----------
for (const st of steps) {
  const p = `c${st.n}`;
  const dots = steps.map((s) => `<span id="${p}-dot${s.n}" class="dot${s.n === st.n ? " on" : ""}"></span>`).join("");
  write(`step${st.n}-chapter`, scene({
    id: `step${st.n}-chapter`,
    css: `    #root { background: var(--ground); }
    #${p}-wrap { position: absolute; inset: 0; }
    #${p}-body { position: absolute; left: 80px; top: 340px; width: 1280px; }
    #${p}-badge { display: inline-block; background: var(--accent); color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 30px; border-radius: 999px; }
    #${p}-title { margin-top: 34px; font-size: 84px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
    #${p}-sub { margin-top: 24px; font-size: 40px; font-weight: 400; color: var(--muted); line-height: 1.25; }
    #${p}-dots { position: absolute; left: 80px; top: 900px; display: flex; gap: 18px; align-items: center; }
    .dot { width: 18px; height: 18px; border-radius: 50%; background: var(--line); display: block; }
    .dot.on { background: var(--accent); width: 54px; border-radius: 9px; }`,
    body: `    <div id="${p}-wrap">
      <div id="${p}-body">
        <div id="${p}-badge">Step ${st.n}</div>
        <h1 id="${p}-title">${esc(st.title)}</h1>
        <div id="${p}-sub">${esc(st.chapterSub)}</div>
      </div>
      <div id="${p}-dots">${dots}</div>
    </div>`,
    js: [enter(`#${p}-badge`, 0.1), enter(`#${p}-title`, 0.3), enter(`#${p}-sub`, 0.6), enter(`#${p}-dots`, 0.5, 16), exitAt(`#${p}-wrap`, S.timing.chapter - 0.3)].join("\n"),
  }));
}

// ---------- panels ----------
for (const st of steps) {
  const p = `p${st.n}`;
  const bl = st.bullets.map((b, j) => `        <div id="${p}-b${j}" class="b"><span id="${p}-b${j}-cur" class="cur">${esc(b.text)}</span><span id="${p}-b${j}-old" class="old">${esc(b.text)}</span></div>`).join("\n");
  const lts = st.lowerThirds.map((l, j) => `    <div id="${p}-lt${j}" class="lt"><div class="bar"></div><div class="lt-t">${esc(l.title)}</div><div class="lt-s">${esc(l.sub)}</div></div>`).join("\n");
  const js = [];
  js.push(enter(`#${p}-badge`, 0.1), enter(`#${p}-title`, 0.25));
  st.bullets.forEach((b, j) => {
    const at = b.t - st.clipStart;
    js.push(enter(`#${p}-b${j}`, at));
    const nx = st.bullets[j + 1];
    if (nx) {
      const t2 = nx.t - st.clipStart;
      js.push(`    tl.fromTo("#${p}-b${j}-cur", { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.inOut" }, ${f3(t2)});`);
      js.push(`    tl.fromTo("#${p}-b${j}-old", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.inOut" }, ${f3(t2)});`);
    }
  });
  st.lowerThirds.forEach((l, j) => {
    js.push(enter(`#${p}-lt${j}`, l.t0 - st.clipStart));
    js.push(exitAt(`#${p}-lt${j}`, l.t1 - st.clipStart - 0.3));
  });
  js.push(exitAt(`#${p}-col`, st.seg.dur - 0.3));
  write(`step${st.n}-panel`, scene({
    id: `step${st.n}-panel`,
    css: `    #${p}-col { position: absolute; left: 80px; top: 60px; width: 520px; }
    #${p}-badge { display: inline-block; background: var(--accent); color: #fff; font-size: 26px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 20px; border-radius: 999px; line-height: 1.2; }
    #${p}-title { margin-top: 26px; font-size: 58px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; }
    #${p}-bullets { margin-top: 36px; }
    #${p}-col .b { display: grid; margin-bottom: 22px; font-size: 34px; line-height: 1.25; }
    #${p}-col .b span { grid-area: 1 / 1; display: block; }
    #${p}-col .cur { font-weight: 700; color: var(--ink); }
    #${p}-col .old { font-weight: 400; color: var(--muted); opacity: 0; }
    .lt { position: absolute; left: 80px; bottom: 200px; width: 520px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 12px 40px rgba(21,23,28,.10); padding: 20px 24px 20px 34px; overflow: hidden; }
    .lt .bar { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: var(--accent); }
    .lt-t { font-size: 32px; font-weight: 700; line-height: 1.2; }
    .lt-s { margin-top: 6px; font-size: 26px; font-weight: 400; color: var(--muted); line-height: 1.25; }`,
    body: `    <div id="${p}-col">
      <div id="${p}-badge">Step ${st.n} / ${steps.length}</div>
      <h2 id="${p}-title">${esc(st.title)}</h2>
      <div id="${p}-bullets">
${bl}
      </div>
    </div>
${lts}`,
    js: js.join("\n"),
  }));
}

// ---------- recaps ----------
for (const st of steps) {
  const p = `r${st.n}`;
  const av = st.recap.layout.mode === "avatar";
  const blocks = [["WHAT JUST HAPPENED", st.recap.happened, 0.4], ["WHAT’S NEXT", st.recap.next, 3.3], ["QUICK TIP", st.recap.tip, 6.2]];
  const bhtml = blocks.map((b, j) => `        <div id="${p}-b${j}" class="blk"><div class="lab">${b[0]}</div><div class="body">${esc(b[1])}</div></div>`).join("\n");
  const js = [enter(`#${p}-head`, 0.0, 16), ...blocks.map((b, j) => enter(`#${p}-b${j}`, b[2])), exitAt(`#${p}-wrap`, st.recap.dur - 0.3)];
  write(`step${st.n}-recap`, scene({
    id: `step${st.n}-recap`,
    css: `    #root { background: var(--ground); }
    #${p}-wrap { position: absolute; inset: 0; }
    #${p}-head { position: absolute; left: 80px; top: 80px; width: 1280px; }
    #${p}-kick { font-size: 26px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
    #${p}-h1 { margin-top: 8px; font-size: 72px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.05; }
    #${p}-blocks { position: absolute; left: ${av ? 700 : 80}px; top: ${av ? 240 : 250}px; width: ${av ? 660 : 1280}px; }
    .blk { border-top: 2px solid var(--line); padding-top: 16px; margin-bottom: 28px; }
    .lab { font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: var(--accent); }
    .body { margin-top: 8px; font-size: 40px; font-weight: 700; line-height: 1.22; }`,
    body: `    <div id="${p}-wrap">
      <div id="${p}-head"><div id="${p}-kick">Step ${st.n} / ${steps.length}</div><h1 id="${p}-h1">Step ${st.n} recap</h1></div>
      <div id="${p}-blocks">
${bhtml}
      </div>
    </div>`,
    js: js.join("\n"),
  }));
}

// ---------- captions ----------
{
  const css = `    .cg { position: absolute; left: 0; width: ${W}px; bottom: ${H - 1020}px; text-align: center; line-height: 0; font-size: 0; opacity: 0; visibility: hidden; overflow: visible; }
    .cb { display: inline-block; vertical-align: bottom; background: var(--card); border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 12px 40px rgba(21,23,28,.10); padding: 14px 26px; white-space: nowrap; font-size: 52px; font-weight: 700; line-height: 1.2; }
    .cw { display: inline-block; padding: 2px 10px; margin: 0 -3px; border-radius: 14px; color: var(--muted); background-color: rgba(37,99,235,0); }`;
  let body = "", js = [];
  capGroups.forEach((g, gi) => {
    const id = `cap-g${gi}`;
    body += `      <div id="${id}" class="cg"><div class="cb">${g.words.map((w, wi) => `<span id="${id}-w${wi}" class="cw">${esc(w.text)}</span>`).join("")}</div></div>\n`;
    const o = g.open - 0, c = g.close;
    js.push(`    tl.set("#${id}", { visibility: "visible" }, ${f3(o)});`);
    js.push(`    tl.fromTo("#${id}", { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power2.out" }, ${f3(o)});`);
    g.words.forEach((w, wi) => {
      const nx = g.words[wi + 1];
      const endAt = nx ? nx.s : Math.min(w.e, c - 0.05);
      js.push(`    tl.set("#${id}-w${wi}", { color: "#FFFFFF", backgroundColor: "#2563EB" }, ${f3(w.s)});`);
      js.push(`    tl.set("#${id}-w${wi}", { color: "#15171C", backgroundColor: "rgba(37,99,235,0)" }, ${f3(Math.max(endAt, w.s + 0.02))});`);
    });
    js.push(`    tl.to("#${id}", { opacity: 0, duration: 0.1, ease: "power2.in" }, ${f3(c - 0.1)});`);
    js.push(`    tl.set("#${id}", { opacity: 0, visibility: "hidden" }, ${f3(c)});`);
  });
  write("captions", scene({ id: "captions", css, body, js: js.join("\n") }));
}

// ---------- outro ----------
write("99-outro", scene({
  id: "outro",
  css: `    #o-wrap { position: absolute; inset: 0; }
    #o-text { position: absolute; left: 80px; top: 280px; width: 780px; }
    #o-head { font-size: 92px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.04; }
    #o-sub { margin-top: 28px; font-size: 38px; font-weight: 400; color: var(--muted); line-height: 1.3; }
    #o-cta { display: inline-block; margin-top: 44px; background: var(--accent-soft); color: var(--accent); font-size: 30px; font-weight: 700; padding: 14px 28px; border-radius: 999px; line-height: 1.25; }
    #o-banner { position: absolute; left: 880px; top: 380px; width: 480px; height: 270px; border-radius: 28px; overflow: hidden; box-shadow: 0 12px 40px rgba(21,23,28,.10); border: 1px solid var(--line); }
    #o-banner img { width: 100%; height: 100%; object-fit: cover; display: block; }`,
  body: `    <div id="o-wrap">
      <div id="o-text">
        <h1 id="o-head">${esc(S.outro.headline)}</h1>
        <div id="o-sub">${esc(S.outro.sub)}</div>
        <div id="o-cta">${esc(S.outro.cta)}</div>
      </div>
      <div id="o-banner"><img id="o-banner-img" src="${S.brand.banner}" alt="${esc(S.brand.name)}" /></div>
    </div>`,
  js: [enter("#o-head", 0.2), enter("#o-sub", 0.5), enter("#o-cta", 0.9), enter("#o-banner", 0.7), exitAt("#o-wrap", S.timing.outro - 0.3)].join("\n"),
}));

// ---------- camera / zooms ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function camState(cx, cy, s) {
  const px = OX + cx * K, py = cy * K;
  const sw = REC_W * s;
  const x = sw <= STAGE.w ? (STAGE.w / 2) * (1 - s) : clamp(STAGE.w / 2 - s * px, STAGE.w - (OX + REC_W) * s, -OX * s);
  const y = clamp(STAGE.h / 2 - s * py, STAGE.h * (1 - s), 0);
  return { x: f3(x), y: f3(y), scale: s };
}
const rt = []; // root timeline lines
const ft = (sel, from, to, at) => rt.push(`      tl.fromTo("${sel}", ${JSON.stringify(from)}, ${JSON.stringify({ ...to, immediateRender: false })}, ${f3(at)});`);
const zoomLog = [];
let boxesHtml = {};
rt.push(`      tl.set("#camera", { x: 0, y: 0, scale: 1, transformOrigin: "0 0" }, 0);`);
rt.push(`      tl.set("#stage", { opacity: 0 }, 0);`);
for (const st of steps) {
  const segEnd = st.seg.start + st.seg.dur;
  ft("#stage", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, st.seg.start);
  ft("#stage", { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.in" }, segEnd - 0.3);
  const rest = { x: 0, y: 0, scale: 1 };
  const z = st.zooms;
  const states = z.map((q) => camState(q.cx, q.cy, q.scale));
  const direct = (k) => k + 1 < z.length && z[k + 1].t0 - z[k].t1 < 1.0;
  boxesHtml[st.n] = "";
  z.forEach((q, k) => {
    const in0 = st.fin(q.t0), t1 = st.fin(q.t1);
    const sk = states[k];
    const mv = (from, to, at, dur) => ft("#camera", from, { ...to, duration: f3(dur), ease: "power2.inOut" }, at);
    if (k === 0 || !direct(k - 1)) mv(rest, sk, in0, 0.6);
    else {
      const pt1 = st.fin(z[k - 1].t1);
      mv(states[k - 1], sk, pt1, in0 + 0.6 - pt1);
    }
    if (!direct(k)) mv(sk, rest, t1, clamp(segEnd - t1, 0.2, 0.6));
    zoomLog.push({ step: st.n, k: k + 1, hold: [f3(in0 + 0.6), t1], mid: f3((in0 + 0.6 + t1) / 2) });
    if (q.box) {
      const [bx, by, bw, bh] = q.box;
      const id = `${st.id}-box${k + 1}`;
      boxesHtml[st.n] += `        <div id="${id}" class="hb" style="left:${f3(OX + bx * K)}px;top:${f3(by * K)}px;width:${f3(bw * K)}px;height:${f3(bh * K)}px;border-width:${f3(4 / q.scale)}px;border-radius:${f3(12 / q.scale)}px"></div>\n`;
      ft(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, in0 + 0.6);
      ft(`#${id}`, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "power2.in" }, t1 - 0.2);
    }
  });
}

// ---------- index.html ----------
const hosts = [];
const host = (id, kind, start, dur, src, z = 2, track = 1) =>
  `      <div id="${id}" data-composition-id="${id}" data-composition-src="${src}" data-start="${f3(start)}" data-duration="${f3(dur)}" data-track-index="${track}" data-track-kind="${kind}" data-width="${W}" data-height="${H}" style="z-index:${z}"></div>`;
hosts.push(host("title", "graphics", 0, T.title.dur, "compositions/00-title.html"));
for (const st of steps) {
  hosts.push(host(`step${st.n}-chapter`, "graphics", st.chapter.start, st.chapter.dur, `compositions/step${st.n}-chapter.html`));
  hosts.push(host(`step${st.n}-panel`, "graphics", st.seg.start, st.seg.dur, `compositions/step${st.n}-panel.html`, 3, 2));
  hosts.push(host(`step${st.n}-recap`, "graphics", st.recap.start, st.recap.dur, `compositions/step${st.n}-recap.html`));
}
hosts.push(host("outro", "graphics", OUTRO.start, OUTRO.dur, "compositions/99-outro.html"));
hosts.push(host("captions", "captions", 0, TOTAL, "compositions/captions.html", 6, 4));

const videos = steps.map((st) => `        <video id="${st.id}-video" class="clip" src="${st.video}" data-start="${st.seg.start}" data-duration="${st.seg.dur}" data-track-index="0" playsinline data-has-audio="true"></video>`).join("\n");
const boxes = steps.map((st) => boxesHtml[st.n]).join("");
const avatars = steps.filter((s) => s.recap.layout.mode === "avatar").map((st) =>
  `      <video id="step${st.n}-recap-avatar" class="clip avatar" src="${st.recap.layout.avatar}" data-start="${st.recap.start}" data-duration="${st.recap.dur}" data-track-index="3" playsinline data-has-audio="true"></video>`).join("\n");

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      :root { ${TOKENS} }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--ground); font-family: Inter, sans-serif; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }
      #bg { position: absolute; inset: 0; background: var(--ground); z-index: 0; }
      #stage { position: absolute; left: ${STAGE.x}px; top: ${STAGE.y}px; width: ${STAGE.w}px; height: ${STAGE.h}px; border-radius: ${STAGE.r}px; background: var(--stage); overflow: hidden; opacity: 0; z-index: 1; box-shadow: 0 12px 40px rgba(21,23,28,.10); }
      #camera { position: absolute; left: 0; top: 0; width: ${STAGE.w}px; height: ${STAGE.h}px; }
      #camera video { position: absolute; left: ${f3(OX)}px; top: 0; width: ${f3(REC_W)}px; height: ${REC_H}px; object-fit: fill; }
      .hb { position: absolute; border-style: solid; border-color: var(--accent); background: rgba(37,99,235,.07); opacity: 0; }
      video.avatar { position: absolute; left: 80px; top: 260px; width: 560px; height: 420px; border-radius: 28px; object-fit: cover; z-index: 4; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
      <div id="bg"></div>
      <div id="stage">
        <div id="camera">
${videos}
${boxes}        </div>
      </div>
${hosts.join("\n")}
${avatars}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${rt.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.mkdirSync(P("compositions"), { recursive: true });
fs.writeFileSync(P("index.html"), indexHtml);
const keep = new Set();
for (const [name, html] of Object.entries(out)) { fs.writeFileSync(P("compositions", name + ".html"), html); keep.add(name + ".html"); }
for (const f of fs.readdirSync(P("compositions"))) if (f.endsWith(".html") && !keep.has(f)) fs.unlinkSync(P("compositions", f));

// ---------- script_en.md ----------
const tc = (t) => { const m = Math.floor(t / 60), s = t - m * 60; return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`; };
let md = `# script_en.md\n\nGenerated by tools/build.mjs from scenes.json + assets/transcript.json. Total ${tc(TOTAL)} (${TOTAL} s).\nTranslators: copy to script_<lang>.md, translate the on-screen text and spoken text, regenerate the voiceover and captions.\n\n`;
const row = (a, b, name, onscreen, spoken) => {
  md += `## ${tc(a)} - ${tc(b)}  ${name}\n\n**On screen**\n${onscreen.map((l) => `- ${l}`).join("\n")}\n\n`;
  if (spoken) md += `**Spoken**\n\n${spoken}\n\n`;
};
row(0, T.title.dur, "Title", [S.title.kicker, S.title.headline, S.title.sub]);
for (const st of steps) {
  row(st.chapter.start, st.chapter.start + st.chapter.dur, `Step ${st.n} chapter`, [`Step ${st.n}`, st.title, st.chapterSub]);
  const spoken = words.filter((w) => Number(w.step) === st.n).map((w) => w.text.trim()).join(" ");
  row(st.seg.start, st.seg.start + st.seg.dur, `Step ${st.n} footage: ${st.title}`,
    [`Badge: STEP ${st.n} / ${steps.length}`, `Title: ${st.title}`, ...st.bullets.map((b) => `Bullet @${tc(st.fin(b.t))}: ${b.text}`), ...st.lowerThirds.map((l) => `Lower third @${tc(st.fin(l.t0))}: ${l.title} / ${l.sub}`)], spoken);
  row(st.recap.start, st.recap.start + st.recap.dur, `Step ${st.n} recap (${st.recap.layout.mode})`,
    [`What just happened: ${st.recap.happened}`, `What's next: ${st.recap.next}`, `Quick tip: ${st.recap.tip}`]);
}
row(OUTRO.start, TOTAL, "Outro", [S.outro.headline, S.outro.sub, S.outro.cta]);
fs.writeFileSync(P("script_en.md"), md);

// ---------- timeline summary (for review tooling) ----------
fs.mkdirSync(P(".build"), { recursive: true });
fs.writeFileSync(P(".build", "timeline.json"), JSON.stringify({ total: TOTAL, title: T.title, steps: steps.map((s) => ({ n: s.n, chapter: s.chapter, seg: s.seg, recap: { start: s.recap.start, dur: s.recap.dur, mode: s.recap.layout.mode } })), outro: OUTRO, zooms: zoomLog, captionGroups: capGroups.map((g) => ({ step: g.step, open: g.open, close: g.close, text: g.words.map((w) => w.text).join(" "), words: g.words.map((w) => [w.s, w.e]) })) }, null, 1));
console.log(`built: total ${TOTAL}s, ${capGroups.length} caption groups, ${Object.keys(out).length} scenes`);

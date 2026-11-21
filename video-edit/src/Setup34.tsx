import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import scenes from "./scenes-34.json";

// 3:4 (720x960) tutorial: pastel launch style + real-looking Claude Code mobile (dark) screen
const FPS = 30;
const PAD = 0.15;
const frames = scenes.map((s) => Math.round((s.dur + PAD) * FPS));
const starts = frames.map((_, i) => frames.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL_34 = frames.reduce((a, b) => a + b, 0) + 15;

const C = {
  ink: "#111216",
  dim: "#7b7f8c",
  claude: "#d97757",
  violet: "#8b7bff",
  mint: "#2fbf8f",
  blue: "#4f8cff",
  pink: "#ff6fae",
  // Claude Code mobile dark UI
  app: "#1f1f1e",
  appText: "#f2f1ee",
  appDim: "#a3a29c",
  appCard: "#2b2b29",
  appLine: "#3a3a37",
  link: "#7fb0ff",
  green: "#5bd27a",
  red: "#ff6b6b",
};
const FONT = "Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SF Mono', Menlo, monospace";
const sp = (f: number, fps: number, d = 14) => spring({ frame: f, fps, config: { damping: d } });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- Background ---------- */
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 90) * 8;
  return (
    <AbsoluteFill style={{ background: "#f4f2fb" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${15 + a}% 10%, #d9d2ff 0%, transparent 45%), radial-gradient(circle at ${90 - a}% 75%, #c9f3e4 0%, transparent 45%), radial-gradient(circle at 85% 5%, #ffe0d2 0%, transparent 35%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Orb: React.FC<{ size: number }> = ({ size }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: `conic-gradient(from ${f * 2}deg, #ff9a6e, #ff6fae, #8b7bff, #4fd1c5, #ff9a6e)`,
        boxShadow: `0 ${size / 8}px ${size / 2}px #8b7bff55, inset 0 0 ${size / 4}px #ffffffaa`,
      }}
    />
  );
};

const Reveal: React.FC<{ text: string; at?: number; size: number; hl?: string[]; hlColor?: string; gap?: number }> = ({ text, at = 0, size, hl = [], hlColor = C.claude, gap = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.ink, letterSpacing: -size * 0.035, lineHeight: 1.05, textAlign: "center" }}>
      {text.split(" ").map((w, i) => {
        const s = sp(f - at - i * gap, fps, 200);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: size * 0.25, opacity: s, filter: `blur(${(1 - s) * 10}px)`, transform: `translateY(${(1 - s) * 18}px)`, color: hl.includes(w) ? hlColor : C.ink }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Step tracker (top) ---------- */
const Tracker: React.FC<{ step: number }> = ({ step }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, 14);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", opacity: s }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n === step;
        const done = n < step;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: on ? 46 : 30,
                height: 30,
                borderRadius: 15,
                background: on ? C.ink : done ? C.mint : "#ffffffcc",
                color: on || done ? "#fff" : C.dim,
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: on ? "0 6px 18px #11121633" : "none",
              }}
            >
              {done ? "✓" : n}
            </div>
            {n < 5 && <div style={{ width: 18, height: 3, borderRadius: 2, background: done ? C.mint : "#0000001a" }} />}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Claude Code mobile screen (dark, like the real app) ---------- */
type Msg =
  | { t: "user"; text: string; at: number }
  | { t: "claude"; text: string; at: number }
  | { t: "tool"; text: string; at: number }
  | { t: "file"; text: string; at: number }
  | { t: "video"; text: string; at: number };

const Phone: React.FC<{
  title?: string;
  sub?: string;
  msgs?: Msg[];
  typing?: { text: string; from: number; send: number };
  attach?: number;
  zoom?: [number, number, number];
  children?: React.ReactNode;
}> = ({ title = "Claude-editore-pro", sub = "Default", msgs = [], typing, attach, zoom = [0, 0, 1], children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = sp(f, fps, 18);
  const typed = typing && f >= typing.from && f < typing.send ? typing.text.slice(0, Math.floor((f - typing.from) * 1.6)) : "";
  const tap = typing ? sp(f - typing.send + 4, fps, 10) : 0;
  const tapOn = typing && f > typing.send - 6 && f < typing.send + 10;
  const plusTap = attach !== undefined && f > attach - 6 && f < attach + 10;
  const zs = zoom[2];
  return (
    <div
      style={{
        position: "absolute",
        left: 360 - 165,
        top: 225,
        width: 330,
        height: 650,
        borderRadius: 50,
        background: "#0c0c0c",
        padding: 10,
        boxShadow: "0 40px 90px #3b2f8a40, 0 0 0 2px #2d2d2d",
        transform: `translateY(${(1 - inS) * 200}px) scale(${zs}) translate(${zoom[0]}px, ${zoom[1]}px)`,
        transformOrigin: "50% 40%",
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 41, background: C.app, overflow: "hidden", position: "relative", fontFamily: FONT, color: C.appText }}>
        {/* status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 24px 0", fontSize: 13, fontWeight: 700 }}>
          <span>12:31</span>
          <span style={{ width: 70, height: 20, borderRadius: 12, background: "#000" }} />
          <span>5G ▮</span>
        </div>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px 10px", borderBottom: `1px solid ${C.appLine}` }}>
          <span style={{ fontSize: 22, color: C.appText }}>←</span>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
            <div style={{ fontSize: 11.5, color: C.appDim }}>{sub}</div>
          </div>
          <span style={{ fontSize: 18, color: C.appDim }}>⋮</span>
        </div>
        {/* messages */}
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
          {msgs.map((m, i) => {
            if (f < m.at) return null;
            const ms = sp(f - m.at, fps, 15);
            const base: React.CSSProperties = { opacity: ms, transform: `translateY(${(1 - ms) * 14}px)`, fontSize: 13.5, lineHeight: 1.4 };
            const n = Math.min(m.text.length, Math.floor((f - m.at) * 2.4));
            if (m.t === "user")
              return (
                <div key={i} style={{ ...base, alignSelf: "flex-end", background: C.appCard, padding: "8px 12px", borderRadius: 14, maxWidth: "82%" }}>
                  {m.text}
                </div>
              );
            if (m.t === "tool")
              return (
                <div key={i} style={{ ...base, fontFamily: MONO, fontSize: 11.5, background: "#141413", border: `1px solid ${C.appLine}`, color: C.appDim, padding: "7px 10px", borderRadius: 10, whiteSpace: "pre-wrap" }}>
                  {m.text.slice(0, n)}
                </div>
              );
            if (m.t === "file")
              return (
                <div key={i} style={{ ...base, alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 8, background: C.appCard, border: `1px solid ${C.appLine}`, padding: "8px 12px", borderRadius: 12 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 7, background: C.claude, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>▶</span>
                  <span style={{ fontSize: 12.5 }}>{m.text}</span>
                </div>
              );
            if (m.t === "video")
              return (
                <div key={i} style={{ ...base, background: "#000", borderRadius: 12, height: 150, border: `1px solid ${C.appLine}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #d9d2ff, #c9f3e4, #ffe0d2)", opacity: 0.85 }} />
                  <div style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -24, marginTop: -24, width: 48, height: 48, borderRadius: 48, background: "#000a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
                  <div style={{ position: "absolute", bottom: 6, left: 8, fontSize: 11, color: C.ink, fontWeight: 700 }}>{m.text}</div>
                </div>
              );
            return (
              <div key={i} style={{ ...base, color: C.appText }}>
                {m.text.slice(0, n)}
              </div>
            );
          })}
          {children}
        </div>
        {/* input box (like the real app) */}
        <div style={{ position: "absolute", left: 10, right: 10, bottom: 16, borderRadius: 22, background: "#262624", border: `1px solid ${C.appLine}`, padding: "12px 12px 10px" }}>
          <div style={{ fontSize: 13.5, minHeight: 20, color: typed ? C.appText : C.appDim }}>
            {typed || "Reply to Claude…"}
            {typed && <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: C.appCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: plusTap ? `0 0 0 6px ${C.claude}66` : "none" }}>+</div>
            <div style={{ padding: "6px 12px", borderRadius: 16, background: C.appCard, fontSize: 12 }}>
              Opus 5.5 <span style={{ color: C.appDim }}>Low</span>
            </div>
            <div style={{ marginLeft: "auto", width: 32, height: 32, borderRadius: 16, background: C.appCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🎙</div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                background: C.claude,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 900,
                transform: `scale(${tapOn ? 0.85 + tap * 0.15 : 1})`,
                boxShadow: tapOn ? `0 0 0 8px ${C.claude}55` : "none",
              }}
            >
              ↑
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Header block per scene ---------- */
const Head: React.FC<{ step?: number; title: string; hl: string[]; color: string; sub?: string }> = ({ step, title, hl, color, sub }) => (
  <div style={{ position: "absolute", top: 34, width: "100%", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
    {step ? <Tracker step={step} /> : null}
    <Reveal text={title} size={50} hl={hl} hlColor={color} at={4} />
    {sub ? <Reveal text={sub} size={20} at={18} gap={2} /> : null}
  </div>
);

const Tag: React.FC<{ text: string; color: string; at: number; x: number; y: number }> = ({ text, color, at, x, y }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - at, fps, 11);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "9px 16px",
        borderRadius: 24,
        background: "#fff",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 17,
        color: C.ink,
        boxShadow: "0 10px 30px #3b2f8a26",
        borderLeft: `5px solid ${color}`,
        transform: `scale(${s}) rotate(${(1 - s) * -10}deg)`,
        opacity: s,
        zIndex: 5,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- Scenes ---------- */
const Scene: React.FC<{ id: string; len: number }> = ({ id, len }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(f, [len - 6, len], [1, 0], clamp);
  const W = (c: React.ReactNode) => <AbsoluteFill style={{ opacity: exit, filter: `blur(${(1 - exit) * 8}px)` }}>{c}</AbsoluteFill>;

  if (id === "hook") {
    const o = sp(f, fps, 12);
    const steps = ["Repo", "Setup", "Upload", "Build", "Render"];
    return W(
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ transform: `scale(${o})` }}>
          <Orb size={130} />
        </div>
        <Reveal text="Videos banao" size={40} at={6} />
        <Reveal text="sirf Claude Code se" size={60} at={14} hl={["Claude", "Code"]} />
        <Reveal text="No Premiere. No After Effects." size={22} at={40} gap={3} />
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap", justifyContent: "center", width: 640 }}>
          {steps.map((t, i) => {
            const s = sp(f - 150 - i * 7, fps, 12);
            return (
              <div key={t} style={{ padding: "10px 14px", borderRadius: 16, background: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 18, color: C.ink, boxShadow: "0 8px 24px #3b2f8a1f", transform: `scale(${s})`, opacity: s }}>
                <span style={{ color: C.claude }}>{i + 1}.</span> {t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  if (id === "s1") {
    const repos = ["my-portfolio", "Claude-editore-pro", "notes-app"];
    const pick = f > 95;
    return W(
      <>
        <Head step={1} title="Repo select karo" hl={["Repo"]} color={C.claude} sub="GitHub → Claude Code app" />
        <Phone title="New session" sub="Choose a repository">
          {repos.map((r, i) => {
            const s = sp(f - 20 - i * 6, fps, 14);
            const sel = pick && i === 1;
            return (
              <div key={r} style={{ opacity: s, transform: `translateX(${(1 - s) * 30}px)`, display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", borderRadius: 12, background: sel ? "#d9775722" : C.appCard, border: `1.5px solid ${sel ? C.claude : C.appLine}`, fontSize: 13.5 }}>
                <span style={{ color: C.appDim }}>⌂</span>
                <span style={{ flex: 1 }}>{r}</span>
                {sel && <span style={{ color: C.claude, fontWeight: 900 }}>✓</span>}
              </div>
            );
          })}
        </Phone>
        <Tag text="👆 Apna repo tap karo" color={C.claude} at={90} x={420} y={520} />
      </>
    );
  }
  if (id === "s2")
    return W(
      <>
        <Head step={2} title="Bolo: setup chalao" hl={["setup", "chalao"]} color={C.mint} />
        <Phone
          typing={{ text: "bash setup.sh chalao", from: 10, send: 45 }}
          msgs={[
            { t: "user", text: "bash setup.sh chalao", at: 46 },
            { t: "tool", text: "Ran 1 command\n$ bash setup.sh", at: 65 },
            { t: "claude", text: "✅ Setup done! Remotion, Whisper, AI voice aur SFX ready hain.", at: 120 },
          ]}
        />
        {[
          ["🎬 Remotion", C.blue, 150, 30, 360],
          ["📝 Whisper", C.mint, 165, 520, 420],
          ["🎙️ AI Voice", C.pink, 180, 30, 560],
          ["🔊 SFX", C.claude, 195, 540, 640],
        ].map(([t, c, at, x, y]) => (
          <Tag key={t as string} text={t as string} color={c as string} at={at as number} x={x as number} y={y as number} />
        ))}
      </>
    );
  if (id === "s3")
    return W(
      <>
        <Head step={3} title="Reference + topic do" hl={["Reference", "topic"]} color={C.blue} />
        <Phone
          attach={20}
          typing={{ text: "Isi style me Claude setup par video banao", from: 50, send: 125 }}
          msgs={[
            { t: "file", text: "reference.mp4 · 33s", at: 30 },
            { t: "user", text: "Isi style me Claude setup par video banao", at: 126 },
          ]}
        />
        <Tag text="➕ se video attach" color={C.blue} at={22} x={30} y={800} />
      </>
    );
  if (id === "s4") {
    const sweep = interpolate(f, [20, 90], [0, 100], clamp);
    return W(
      <>
        <Head step={4} title="Claude sab banata hai" hl={["sab"]} color={C.violet} />
        <Phone
          msgs={[
            { t: "tool", text: "Ran 4 commands · frame-by-frame", at: 5 },
            { t: "claude", text: "Style samajh gaya: pastel, bold text, clean UI.", at: 95 },
            { t: "tool", text: "Created 3 files +412", at: 140 },
          ]}
        >
          {f > 8 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
              {Array.from({ length: 10 }).map((_, k) => {
                const on = (k / 10) * 100 < sweep;
                const cs = [C.violet, C.mint, C.pink, C.blue, C.claude];
                return <div key={k} style={{ height: 34, borderRadius: 4, background: on ? cs[k % 5] : C.appCard, opacity: on ? 0.9 : 1 }} />;
              })}
            </div>
          )}
        </Phone>
        {[
          ["1 · Style samjha", C.blue, 60, 30, 330],
          ["2 · Script ✍️", C.violet, 120, 500, 400],
          ["3 · Voice 🎙️", C.pink, 160, 30, 520],
          ["4 · Animation 🎬", C.mint, 200, 470, 610],
        ].map(([t, c, at, x, y]) => (
          <Tag key={t as string} text={t as string} color={c as string} at={at as number} x={x as number} y={y as number} />
        ))}
      </>
    );
  }
  if (id === "s5") {
    const p = interpolate(f, [10, 90], [0, 100], clamp);
    return W(
      <>
        <Head step={5} title="Final video chat me" hl={["Final", "video"]} color={C.claude} sub="SFX + music ke saath, 10-12 min" />
        <Phone
          msgs={[
            { t: "tool", text: `Rendering… ${Math.round(p)}%`, at: 5 },
            { t: "claude", text: "Final video ready hai 🎉", at: 100 },
            { t: "video", text: "final.mp4 · 1080p", at: 115 },
          ]}
        />
        <Tag text="✅ Download karo" color={C.mint} at={150} x={440} y={700} />
      </>
    );
  }
  if (id === "bonus")
    return W(
      <>
        <Head title="Best part?" hl={["Best"]} color={C.pink} sub="Naya session = auto setup" />
        <Phone
          title="New session"
          sub="Claude-editore-pro · Default"
          msgs={[
            { t: "tool", text: "☁️ Container started\n$ setup.sh … ✓ done", at: 15 },
            { t: "claude", text: "Setup ready. Aaj kya banaye?", at: 60 },
          ]}
        />
        <Tag text="⚡ Zero setup" color={C.pink} at={70} x={460} y={520} />
      </>
    );
  if (id === "cta")
    return W(
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 22 }}>
        <Reveal text="Aise aur AI tutorials ke liye" size={30} at={0} gap={2} />
        <div style={{ padding: "18px 40px", borderRadius: 40, background: f > 50 ? C.claude : C.ink, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 40, transform: `scale(${sp(f - 10, fps, 10) * (f > 50 && f < 60 ? 1.08 : 1)})` }}>
          {f > 50 ? "Following ✓" : "+ Follow"}
        </div>
        <div style={{ position: "absolute", bottom: -240 }}>
          <Orb size={440} />
        </div>
      </AbsoluteFill>
    );
  return null;
};

const Caption: React.FC<{ text: string; len: number }> = ({ text, len }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const total = words.reduce((a, w) => a + w.length + 2, 0);
  let acc = 0;
  let cur = 0;
  words.forEach((w, k) => {
    if (f >= (acc / total) * (len - PAD * FPS)) cur = k;
    acc += w.length + 2;
  });
  const start = Math.floor(cur / 4) * 4;
  return (
    <div style={{ position: "absolute", bottom: 22, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 30, zIndex: 10 }}>
      <span style={{ background: "#fff", padding: "8px 16px", borderRadius: 12, boxShadow: "0 8px 24px #3b2f8a33" }}>
        {words.slice(start, start + 4).map((w, k) => (
          <span key={k} style={{ color: start + k === cur ? C.claude : start + k < cur ? C.ink : "#b4b6be" }}>
            {w}{" "}
          </span>
        ))}
      </span>
    </div>
  );
};

export const Setup34: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    {scenes.map((s, i) => (
      <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
        <Scene id={s.id} len={frames[i]} />
        <Caption text={s.caption} len={frames[i]} />
        <Audio src={staticFile(`Voice over/v34/${s.id}.mp3`)} />
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
    ))}
    {[
      [0, 4, "bass-hit"],
      [0, 150, "pop"],
      [0, 157, "pop"],
      [0, 164, "pop"],
      [0, 171, "pop"],
      [0, 178, "pop"],
      [1, 95, "click"],
      [1, 90, "pop"],
      [2, 45, "click"],
      [2, 120, "pop"],
      [2, 150, "pop"],
      [2, 165, "pop"],
      [2, 180, "pop"],
      [2, 195, "pop"],
      [3, 20, "click"],
      [3, 125, "click"],
      [4, 60, "pop"],
      [4, 120, "pop"],
      [4, 160, "pop"],
      [4, 200, "pop"],
      [5, 5, "riser"],
      [5, 100, "bass-hit"],
      [6, 70, "pop"],
      [7, 50, "click"],
    ].map(([sc, at, n], k) => (
      <Sequence key={k} from={starts[sc as number] + (at as number)} durationInFrames={50}>
        <Audio src={staticFile(`sfx/${n}.mp3`)} volume={0.45} />
      </Sequence>
    ))}
    <Audio src={staticFile("music/bg.mp3")} volume={0.12} />
  </AbsoluteFill>
);

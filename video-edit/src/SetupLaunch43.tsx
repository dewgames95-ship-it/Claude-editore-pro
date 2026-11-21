import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import scenes from "./scenes-43.json";

// 4:3 launch-style video (light pastel, big bold text, phone with Claude Code screen)
const FPS = 30;
const PAD = 0.12;
const frames = scenes.map((s) => Math.round((s.dur + PAD) * FPS));
const starts = frames.map((_, i) => frames.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL_43 = frames.reduce((a, b) => a + b, 0) + 15;

const C = {
  ink: "#111216",
  dim: "#7b7f8c",
  claude: "#e8673c",
  violet: "#8b7bff",
  mint: "#3ccf9e",
  blue: "#4f8cff",
  pink: "#ff6fae",
  card: "#ffffff",
};
const FONT = "Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SF Mono', Menlo, monospace";

const sp = (f: number, fps: number, d = 14) => spring({ frame: f, fps, config: { damping: d } });

/* ---------- Background: pastel gradient that drifts ---------- */
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 90) * 8;
  return (
    <AbsoluteFill style={{ background: "#f3f2fb" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${20 + a}% 15%, #d9d2ff 0%, transparent 45%), radial-gradient(circle at ${85 - a}% 80%, #c9f3e4 0%, transparent 45%), radial-gradient(circle at 80% 10%, #ffe0d2 0%, transparent 35%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Orb ---------- */
const Orb: React.FC<{ size: number }> = ({ size }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: `conic-gradient(from ${f * 2}deg, #ff9a6e, #ff6fae, #8b7bff, #4fd1c5, #ff9a6e)`,
        filter: "saturate(1.1)",
        boxShadow: `0 ${size / 8}px ${size / 2}px #8b7bff55, inset 0 0 ${size / 4}px #ffffffaa`,
      }}
    />
  );
};

/* ---------- Word-by-word blur reveal (reference style) ---------- */
const Reveal: React.FC<{ text: string; at?: number; size: number; hl?: string[]; hlColor?: string; align?: "left" | "center"; gap?: number }> = ({
  text,
  at = 0,
  size,
  hl = [],
  hlColor = C.claude,
  align = "center",
  gap = 4,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.ink, letterSpacing: -size * 0.035, lineHeight: 1.05, textAlign: align }}>
      {text.split(" ").map((w, i) => {
        const s = sp(f - at - i * gap, fps, 200);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: size * 0.25,
              opacity: s,
              filter: `blur(${(1 - s) * 10}px)`,
              transform: `translateY(${(1 - s) * 18}px)`,
              color: hl.includes(w) ? hlColor : C.ink,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Phone with Claude Code screen ---------- */
type Msg = { role: "user" | "claude" | "tool"; text: string; at: number };
const Phone: React.FC<{ msgs: Msg[]; at?: number; x?: number; children?: React.ReactNode }> = ({ msgs, at = 0, x = 600, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - at, fps, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 95,
        width: 270,
        height: 560,
        borderRadius: 44,
        background: "#111",
        padding: 10,
        boxShadow: "0 40px 80px #4a3f9a40, 0 0 0 2px #2a2a2e",
        transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * 6}deg)`,
        opacity: s,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 35, background: "#faf9f5", overflow: "hidden", position: "relative", fontFamily: FONT }}>
        <div style={{ position: "absolute", top: 8, left: "50%", marginLeft: -40, width: 80, height: 22, borderRadius: 12, background: "#111" }} />
        <div style={{ padding: "40px 14px 10px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #ece9e0" }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: C.claude, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✳</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, whiteSpace: "nowrap" }}>Claude Code</div>
          <div style={{ marginLeft: "auto", fontSize: 10, color: C.dim, fontFamily: MONO }}>● live</div>
        </div>
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {msgs.map((m, i) => {
            const ms = sp(f - m.at, fps, 15);
            if (f < m.at) return null;
            const n = m.role === "user" ? m.text.length : Math.min(m.text.length, Math.floor((f - m.at) * 2.2));
            const base: React.CSSProperties = { opacity: ms, transform: `translateY(${(1 - ms) * 12}px)`, fontSize: 12.5, lineHeight: 1.35 };
            if (m.role === "user")
              return (
                <div key={i} style={{ ...base, alignSelf: "flex-end", background: "#ece6dc", color: C.ink, padding: "7px 10px", borderRadius: 12, maxWidth: "85%", fontWeight: 600 }}>
                  {m.text}
                </div>
              );
            if (m.role === "tool")
              return (
                <div key={i} style={{ ...base, fontFamily: MONO, fontSize: 11, background: "#1d1d20", color: "#9be89b", padding: "7px 9px", whiteSpace: "pre-wrap", borderRadius: 8 }}>
                  {m.text.slice(0, n)}
                </div>
              );
            return (
              <div key={i} style={{ ...base, color: C.ink }}>
                <span style={{ color: C.claude, fontWeight: 900 }}>✳ </span>
                {m.text.slice(0, n)}
              </div>
            );
          })}
          {children}
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, height: 34, borderRadius: 17, border: "1px solid #e2ddd2", background: "#fff", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, color: C.dim }}>
          Reply to Claude…
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ text: string; color: string; at: number; dark?: boolean }> = ({ text, color, at, dark }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - at, fps, 12);
  return (
    <div
      style={{
        display: "inline-flex",
        alignSelf: "flex-start",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 30,
        background: dark ? C.ink : "#fff",
        color: dark ? "#fff" : C.ink,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 18,
        boxShadow: "0 8px 24px #4a3f9a1f",
        transform: `scale(${s})`,
        opacity: s,
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 10, background: color }} />
      {text}
    </div>
  );
};

const Left: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 70, top: 0, bottom: 0, width: 500, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>{children}</div>
);

/* ---------- Scenes ---------- */
const Scene: React.FC<{ id: string; len: number }> = ({ id, len }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(f, [len - 6, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wrap = (c: React.ReactNode) => <AbsoluteFill style={{ opacity: exit, filter: `blur(${(1 - exit) * 8}px)` }}>{c}</AbsoluteFill>;

  if (id === "hook") {
    const o = sp(f, fps, 12);
    return wrap(
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Reveal text="Meet" size={34} at={2} />
        <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `scale(${0.8 + o * 0.2})` }}>
          <div style={{ transform: `scale(${o})` }}>
            <Orb size={110} />
          </div>
          <Reveal text="Claude Editor" size={96} at={8} hl={["Editor"]} />
        </div>
        <Reveal text="No editing software. Just Claude Code." size={28} at={40} gap={3} />
      </AbsoluteFill>
    );
  }
  if (id === "repo")
    return wrap(
      <>
        <Left>
          <Pill text="STEP 01" color={C.claude} at={2} />
          <Reveal text="Connect your repo" size={66} align="left" hl={["repo"]} at={6} />
          <Reveal text="GitHub → Claude Code → bash setup.sh" size={22} align="left" at={30} gap={3} />
        </Left>
        <Phone
          at={0}
          msgs={[
            { role: "user", text: "bash setup.sh chalao", at: 25 },
            { role: "tool", text: "$ bash setup.sh\ninstalling remotion…", at: 45 },
            { role: "claude", text: "✓ Setup done. Ready to edit!", at: 80 },
          ]}
        />
      </>
    );
  if (id === "tools") {
    const tools: [string, string, string][] = [
      ["🎬", "Remotion", C.blue],
      ["📝", "Whisper", C.mint],
      ["🎙️", "AI Voice", C.pink],
      ["🔊", "SFX + Music", C.claude],
    ];
    return wrap(
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46 }}>
        <Reveal text="The essentials, built in." size={64} hl={["built", "in."]} hlColor={C.violet} />
        <div style={{ display: "flex", gap: 22 }}>
          {tools.map(([e, t, c], i) => {
            const s = sp(f - 18 - i * 9, fps, 12);
            return (
              <div
                key={t}
                style={{
                  width: 180,
                  height: 170,
                  borderRadius: 22,
                  background: "#fff",
                  boxShadow: "0 14px 40px #4a3f9a22",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + s * 0.2})`,
                  opacity: s,
                  borderTop: `5px solid ${c}`,
                  fontFamily: FONT,
                }}
              >
                <div style={{ fontSize: 50 }}>{e}</div>
                <div style={{ fontWeight: 800, fontSize: 21, color: C.ink }}>{t}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  if (id === "folders")
    return wrap(
      <>
        <Left>
          <Pill text="STEP 02" color={C.mint} at={2} />
          <Reveal text="Drop your files" size={66} align="left" hl={["files"]} hlColor={C.mint} at={6} />
          <Reveal text="Reference · A-roll · Voice over" size={24} align="left" at={28} gap={3} />
        </Left>
        <Phone at={0} msgs={[{ role: "user", text: "📎 ref.mp4  📎 aroll.mp4", at: 15 }, { role: "claude", text: "Files saved:", at: 35 }]}>
          {[
            ["📁 public/reference/", C.violet, 50],
            ["📁 public/aroll/", C.blue, 60],
            ["📁 public/Voice over/", C.pink, 70],
          ].map(([t, c, at]) => {
            const s = sp(f - (at as number), fps, 14);
            return (
              <div key={t as string} style={{ fontFamily: MONO, fontSize: 11.5, padding: "6px 8px", background: "#fff", borderRadius: 8, borderLeft: `4px solid ${c}`, opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
                {t}
              </div>
            );
          })}
        </Phone>
      </>
    );
  if (id === "analyse") {
    const sweep = interpolate(f, [25, 90], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return wrap(
      <>
        <Left>
          <Pill text="STEP 03" color={C.blue} at={2} />
          <Reveal text="Frame by frame analysis" size={62} align="left" hl={["frame", "analysis"]} hlColor={C.blue} at={6} />
          <Reveal text="Style + topic, samjha ek baar me" size={24} align="left" at={30} gap={3} />
        </Left>
        <Phone at={0} msgs={[{ role: "user", text: "Is reference ka style samjho", at: 10 }]}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, position: "relative", marginTop: 4 }}>
            {Array.from({ length: 16 }).map((_, k) => {
              const on = (k / 16) * 100 < sweep;
              const cs = [C.violet, C.mint, C.pink, C.blue];
              return <div key={k} style={{ height: 42, borderRadius: 5, background: on ? `linear-gradient(${cs[k % 4]}, #fff)` : "#ebe8e0" }} />;
            })}
          </div>
          {sweep > 95 && <div style={{ fontSize: 12.5, color: C.ink }}><span style={{ color: C.claude, fontWeight: 900 }}>✳ </span>Pastel · bold text · clean UI ✓</div>}
        </Phone>
      </>
    );
  }
  if (id === "build") {
    const items: [string, string, number][] = [
      ["Script", C.violet, 0],
      ["Voice", C.pink, 14],
      ["Animation", C.blue, 28],
    ];
    return wrap(
      <>
        <Left>
          <Pill text="STEP 04" color={C.violet} at={2} />
          {items.map(([t, c, at]) => {
            const s = sp(f - 8 - at, fps, 200);
            return (
              <div key={t} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, letterSpacing: -2, color: c, opacity: s, filter: `blur(${(1 - s) * 10}px)`, lineHeight: 1 }}>
                {t}.
              </div>
            );
          })}
        </Left>
        <Phone
          at={0}
          msgs={[
            { role: "claude", text: "✓ Script likha (9 scenes)", at: 15 },
            { role: "claude", text: "✓ AI voice bani", at: 35 },
            { role: "tool", text: "$ remotion studio", at: 55 },
            { role: "claude", text: "✓ Scenes animate ho gaye", at: 75 },
          ]}
        />
      </>
    );
  }
  if (id === "render") {
    const p = interpolate(f, [10, 80], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mins = Math.round(interpolate(f, [10, 80], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    return wrap(
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 150, letterSpacing: -6, color: C.ink, lineHeight: 1 }}>
          {mins}
          <span style={{ fontSize: 60, color: C.claude }}> min</span>
        </div>
        <Reveal text="to a final 1080p video" size={32} at={8} hl={["1080p"]} />
        <div style={{ width: 520, height: 14, borderRadius: 7, background: "#ffffffaa", overflow: "hidden", boxShadow: "inset 0 0 0 1px #0000000d" }}>
          <div style={{ width: `${p}%`, height: "100%", background: `linear-gradient(90deg, ${C.violet}, ${C.pink}, ${C.claude})` }} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          <Pill text="Voice" color={C.pink} at={40} />
          <Pill text="SFX" color={C.claude} at={48} />
          <Pill text="Music" color={C.mint} at={56} />
          <Pill text="final.mp4 ✓" color={C.mint} at={84} dark />
        </div>
      </AbsoluteFill>
    );
  }
  if (id === "bonus")
    return wrap(
      <>
        <Left>
          <Pill text="BEST PART" color={C.pink} at={2} />
          <Reveal text="Runs in the cloud." size={66} align="left" hl={["cloud."]} hlColor={C.blue} at={6} />
          <Reveal text="Har naye session me setup apne aap." size={24} align="left" at={30} gap={3} />
        </Left>
        <Phone
          at={0}
          msgs={[
            { role: "tool", text: "☁️ new session started\n$ setup.sh … done", at: 20 },
            { role: "claude", text: "Setup ready. Kya banaye aaj?", at: 55 },
          ]}
        />
      </>
    );
  if (id === "cta")
    return wrap(
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
        <Reveal text="Get started with" size={28} at={0} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: -5, color: C.ink }}>
          claude<span style={{ color: C.claude }}>.editor</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Pill text={f > 45 ? "Following ✓" : "Follow for more"} color={C.claude} at={15} dark />
          <Pill text="Learn AI editing" color={C.violet} at={22} />
        </div>
        <div style={{ position: "absolute", bottom: -260 }}>
          <Orb size={420} />
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
  const start = Math.floor(cur / 5) * 5;
  return (
    <div style={{ position: "absolute", bottom: 26, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 22 }}>
      <span style={{ background: "#ffffffd9", padding: "6px 14px", borderRadius: 10, color: C.dim, boxShadow: "0 4px 16px #4a3f9a14" }}>
        {words.slice(start, start + 5).map((w, k) => (
          <span key={k} style={{ color: start + k <= cur ? C.ink : "#b4b6be" }}>
            {w}{" "}
          </span>
        ))}
      </span>
    </div>
  );
};

export const SetupLaunch43: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />
      {scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
          <Scene id={s.id} len={frames[i]} />
          <Caption text={s.caption} len={frames[i]} />
          <Audio src={staticFile(`Voice over/setup43/${s.id}.mp3`)} />
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
        </Sequence>
      ))}
      {[
        [0, 8, "bass-hit"],
        [1, 25, "pop"],
        [1, 80, "click"],
        [2, 18, "pop"],
        [2, 27, "pop"],
        [2, 36, "pop"],
        [2, 45, "pop"],
        [3, 50, "click"],
        [3, 60, "click"],
        [3, 70, "click"],
        [5, 8, "pop"],
        [5, 22, "pop"],
        [5, 36, "pop"],
        [6, 5, "riser"],
        [6, 84, "bass-hit"],
        [8, 0, "bass-hit"],
        [8, 45, "click"],
      ].map(([sc, at, n], k) => (
        <Sequence key={k} from={starts[sc as number] + (at as number)} durationInFrames={50}>
          <Audio src={staticFile(`sfx/${n}.mp3`)} volume={0.45} />
        </Sequence>
      ))}
      <Audio src={staticFile("music/bg.mp3")} volume={0.12} />
    </AbsoluteFill>
  );
};

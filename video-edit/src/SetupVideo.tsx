import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import scenes from "./scenes-setup.json";

const FPS = 30;
const PAD = 0.35; // seconds gap after each voice line
const sceneFrames = scenes.map((s) => Math.round((s.dur + PAD) * FPS));
const starts = sceneFrames.map((_, i) => sceneFrames.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL_SETUP = sceneFrames.reduce((a, b) => a + b, 0) + 20;

const C = {
  bg: "#07080c",
  claude: "#ff6a3d",
  wa: "#3d8bff",
  call: "#25d366",
  mail: "#ffb020",
  inv: "#ff4d8d",
  text: "#f4f4f6",
  dim: "#8a8f9c",
};
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

type AgentKey = "wa" | "call" | "inv" | "mail";
const AGENTS: { key: AgentKey; label: string; x: number; y: number; n: number }[] = [
  { key: "wa", label: "Remotion\nAnimation", x: -200, y: -230, n: 1 },
  { key: "call", label: "Whisper\nCaptions", x: 200, y: -230, n: 2 },
  { key: "mail", label: "SFX +\nMusic", x: 200, y: 230, n: 3 },
  { key: "inv", label: "AI Voice\n(TTS)", x: -200, y: 230, n: 4 },
];

const SCENE_META: Record<string, { badge: string; color: string; focus: [number, number, number]; active: AgentKey[] }> = {
  hook: { badge: "NO EDITING SOFTWARE", color: C.claude, focus: [0, 0, 1], active: ["wa", "call", "mail", "inv"] },
  repo: { badge: "STEP 01 · CONNECT REPO", color: C.claude, focus: [0, 0, 1.15], active: [] },
  tools: { badge: "AUTO INSTALL · 4 TOOLS", color: C.wa, focus: [0, 0, 1], active: ["wa", "call", "mail", "inv"] },
  folders: { badge: "STEP 02 · ADD FILES", color: C.mail, focus: [0, 0, 0.9], active: [] },
  analyse: { badge: "STEP 03 · ANALYSE", color: C.call, focus: [200, -230, 1.4], active: ["call"] },
  build: { badge: "STEP 04 · BUILD", color: C.inv, focus: [-140, 0, 1.2], active: ["inv", "wa"] },
  render: { badge: "STEP 05 · RENDER", color: C.mail, focus: [140, 200, 1.3], active: ["mail"] },
  bonus: { badge: "BONUS · CLOUD READY", color: "#ff4d8d", focus: [0, 0, 0.95], active: ["wa", "call", "mail", "inv"] },
  cta: { badge: "LEARN AI EDITING", color: C.claude, focus: [0, 0, 0.9], active: ["wa", "call", "mail", "inv"] },
};

const useSceneIndex = () => {
  const f = useCurrentFrame();
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (f >= starts[k]) i = k;
  return i;
};

/* ---------- Icons (simple SVG) ---------- */
const Icon: React.FC<{ k: AgentKey | "claude"; size: number; color: string }> = ({ k, size, color }) => {
  const s = { width: size, height: size, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k === "wa")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3z" />
      </svg>
    );
  if (k === "call")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 11h4M13 11h4M7 14h7" />
      </svg>
    );
  if (k === "mail")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="17.5" cy="16" r="2.5" />
      </svg>
    );
  if (k === "inv")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="11" y="2" width="2.4" height="9" rx="1.2" fill={color} transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </svg>
  );
};

/* ---------- Background ---------- */
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const i = useSceneIndex();
  const m = SCENE_META[scenes[i].id];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(#ffffff18 1.2px, transparent 1.2px)",
          backgroundSize: "26px 26px",
          backgroundPosition: `0 ${-f * 0.3}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 52%, ${m.color}38 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 50%, #000a 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- Header ---------- */
const Header: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = useSceneIndex();
  const m = SCENE_META[scenes[i].id];
  const inS = spring({ frame: f, fps, config: { damping: 15 } });
  const bS = spring({ frame: f - starts[i], fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: FONT, transform: `translateY(${(1 - inS) * -80}px)`, opacity: inS }}>
      <div style={{ color: C.text, fontWeight: 900, fontSize: 44, lineHeight: 1.08, letterSpacing: -0.5 }}>
        AI VIDEO EDITING
        <br />
        SETUP WITH{" "}
        <span style={{ display: "inline-flex", verticalAlign: "-6px", background: C.claude, borderRadius: 8, padding: 4 }}>
          <Icon k="claude" size={30} color="#fff" />
        </span>{" "}
        CLAUDE
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
          padding: "6px 16px",
          borderRadius: 30,
          border: `2px solid ${m.color}`,
          color: C.text,
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: 1,
          background: "#0009",
          transform: `scale(${0.7 + bS * 0.3})`,
          boxShadow: `0 0 20px ${m.color}55`,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 9, background: m.color }} />
        {m.badge}
      </div>
    </div>
  );
};

/* ---------- Network ---------- */
const Network: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = useSceneIndex();
  const id = scenes[i].id;
  const m = SCENE_META[id];
  const prev = SCENE_META[scenes[Math.max(0, i - 1)].id].focus;
  const t = i === 0 ? 1 : spring({ frame: f - starts[i], fps, config: { damping: 20, mass: 1.1 } });
  const fx = prev[0] + (m.focus[0] - prev[0]) * t;
  const fy = prev[1] + (m.focus[1] - prev[1]) * t;
  const sc = prev[2] + (m.focus[2] - prev[2]) * t;
  const cy = 680;
  const claudeIn = spring({ frame: f - 3, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ transform: `translate(${-fx * sc}px, ${-fy * sc}px) scale(${sc})`, transformOrigin: `360px ${cy}px` }}>
      {/* links */}
      <svg width={720} height={1280} style={{ position: "absolute" }}>
        {AGENTS.map((a, k) => {
          const appear = spring({ frame: f - (12 + k * 8), fps, config: { damping: 200 } });
          const on = m.active.includes(a.key);
          const len = Math.hypot(a.x, a.y);
          return (
            <g key={a.key} opacity={on ? 1 : 0.25}>
              <line
                x1={360}
                y1={cy}
                x2={360 + a.x}
                y2={cy + a.y}
                stroke={C[a.key]}
                strokeWidth={3}
                strokeDasharray={`${len}`}
                strokeDashoffset={len * (1 - appear)}
              />
              <circle r={5} fill={C[a.key]} cx={360 + a.x * ((f * 0.02 + k * 0.25) % 1)} cy={cy + a.y * ((f * 0.02 + k * 0.25) % 1)} opacity={appear} />
              <g opacity={appear}>
                <circle cx={360 + a.x * 0.55} cy={cy + a.y * 0.55} r={14} fill={C.bg} stroke={C[a.key]} strokeWidth={2} />
                <text x={360 + a.x * 0.55} y={cy + a.y * 0.55 + 5} textAnchor="middle" fill={C.text} fontSize={14} fontWeight={800} fontFamily={FONT}>
                  {a.n}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      {/* agents */}
      {AGENTS.map((a, k) => {
        const appear = spring({ frame: f - (18 + k * 8), fps, config: { damping: 11 } });
        const on = m.active.includes(a.key);
        const pulse = on ? 1 + Math.sin(f / 7) * 0.04 : 1;
        return (
          <div
            key={a.key}
            style={{
              position: "absolute",
              left: 360 + a.x - 50,
              top: cy + a.y - 50,
              width: 100,
              textAlign: "center",
              transform: `scale(${appear * pulse})`,
              opacity: on ? 1 : 0.35,
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 26,
                background: `linear-gradient(160deg, ${C[a.key]}40, #0d0f16 70%)`,
                border: `2.5px solid ${C[a.key]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: on ? `0 0 40px ${C[a.key]}90` : "none",
              }}
            >
              <Icon k={a.key} size={52} color={C[a.key]} />
            </div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 19, marginTop: 10, whiteSpace: "pre-line", lineHeight: 1.15 }}>{a.label}</div>
          </div>
        );
      })}
      {/* claude orb */}
      <div
        style={{
          position: "absolute",
          left: 360 - 90,
          top: cy - 90,
          width: 180,
          height: 180,
          borderRadius: 200,
          background: `radial-gradient(circle at 35% 30%, #ff9a6e, ${C.claude} 55%, #c2401a)`,
          boxShadow: `0 0 ${70 + Math.sin(f / 8) * 15}px ${C.claude}aa`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${claudeIn})`,
          fontFamily: FONT,
        }}
      >
        <div style={{ background: "#fff", borderRadius: 16, padding: 10 }}>
          <Icon k="claude" size={50} color={C.claude} />
        </div>
        <div style={{ color: "#fff", fontWeight: 900, fontSize: 26, marginTop: 6 }}>Claude</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 360 - 140,
          top: cy - 140,
          width: 280,
          height: 280,
          borderRadius: 300,
          border: `2px dashed ${C.claude}55`,
          transform: `rotate(${f * 0.6}deg) scale(${claudeIn})`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Overlay cards ---------- */
const Card: React.FC<{ color: string; title: string; children: React.ReactNode; top?: number; delay?: number; local: number }> = ({ color, title, children, top = 300, delay = 0, local }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: local - delay, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        width: 540,
        top,
        borderRadius: 20,
        background: "#0d1017ee",
        border: `2px solid ${color}`,
        boxShadow: `0 20px 60px #000c, 0 0 30px ${color}40`,
        padding: 22,
        fontFamily: FONT,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + s * 0.15})`,
        opacity: s,
      }}
    >
      <div style={{ color, fontWeight: 800, fontSize: 16, letterSpacing: 2, marginBottom: 14, fontFamily: "monospace" }}>● {title}</div>
      {children}
    </div>
  );
};

const Stamp: React.FC<{ text: string; color: string; local: number; at: number; top: number; rot?: number; dark?: boolean }> = ({ text, color, local, at, top, rot = -6, dark }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: local - at, fps, config: { damping: 9, stiffness: 180 } });
  return (
    <div
      style={{
        position: "absolute",
        top,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, s * 2),
      }}
    >
      <div
        style={{
          background: color,
          color: dark ? "#111" : "#fff",
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: 54,
          padding: "6px 22px",
          borderRadius: 8,
          transform: `rotate(${rot}deg) scale(${2 - s})`,
          boxShadow: `0 10px 40px ${color}88`,
          letterSpacing: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Row: React.FC<{ a: string; b: string; color?: string }> = ({ a, b, color = C.text }) => (
  <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 21, fontWeight: 600, padding: "8px 0", borderBottom: "1px solid #ffffff14" }}>
    <span>{a}</span>
    <span style={{ color, fontWeight: 800 }}>{b}</span>
  </div>
);

const Term: React.FC<{ lines: [string, number][]; local: number; color: string }> = ({ lines, local, color }) => (
  <div style={{ fontFamily: "monospace", fontSize: 21, lineHeight: 1.6 }}>
    {lines.map(([l, at], k) => {
      const n = Math.max(0, Math.min(l.length, Math.floor((local - at) * 1.5)));
      if (local < at) return null;
      return (
        <div key={k} style={{ color: l.startsWith("✓") ? color : C.text }}>
          {l.startsWith("✓") ? "" : <span style={{ color }}>$ </span>}
          {l.slice(0, n)}
        </div>
      );
    })}
  </div>
);

const SceneOverlay: React.FC<{ id: string }> = ({ id }) => {
  const local = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (id === "hook") return <Stamp text="NO PREMIERE. NO AE." color={C.claude} local={local} at={100} top={1000} />;
  if (id === "repo")
    return (
      <Card color={C.claude} title="CLAUDE CODE · TERMINAL" local={local} delay={30} top={300}>
        <Term
          color={C.call}
          local={local}
          lines={[
            ["github.com/new  →  my-video-repo", 50],
            ["claude  (repo connected)", 100],
            ["bash setup.sh", 140],
            ["✓ Setup done", 190],
          ]}
        />
      </Card>
    );
  if (id === "tools") return <Stamp text="AUTO INSTALL ✓" color={C.call} dark local={local} at={150} top={1000} rot={4} />;
  if (id === "folders") {
    const items: [string, string, number][] = [
      ["📁 video-edit/", C.text, 10],
      ["   📁 public/reference/", C.mail, 40],
      ["   📁 public/aroll/", C.call, 80],
      ["   📁 public/Voice over/", C.inv, 120],
      ["   📁 src/   (Claude likhega)", C.wa, 160],
      ["   📁 out/   (final.mp4)", C.claude, 190],
    ];
    return (
      <Card color={C.mail} title="PROJECT FOLDER" local={local} top={420}>
        {items.map(([t, col, at], k) => {
          const s = spring({ frame: local - at, fps, config: { damping: 14 } });
          return (
            <div key={k} style={{ color: col, fontFamily: "monospace", fontSize: 24, fontWeight: 700, padding: "6px 0", whiteSpace: "pre", opacity: s, transform: `translateX(${(1 - s) * -40}px)` }}>
              {t}
            </div>
          );
        })}
      </Card>
    );
  }
  if (id === "analyse") {
    const sweep = interpolate(local, [30, 200], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <Card color={C.call} title="REFERENCE · 30 FPS BREAKDOWN" local={local} delay={10} top={290}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, position: "relative" }}>
          {Array.from({ length: 18 }).map((_, k) => {
            const cols = [C.wa, C.call, C.mail, C.inv, C.claude];
            const on = (k / 18) * 100 < sweep;
            return <div key={k} style={{ height: 70, borderRadius: 6, background: on ? `linear-gradient(${cols[k % 5]}66, #111)` : "#1a1d26", border: `1px solid ${on ? cols[k % 5] : "#ffffff14"}` }} />;
          })}
          <div style={{ position: "absolute", left: `${sweep}%`, top: -6, bottom: -6, width: 3, background: C.call, boxShadow: `0 0 16px ${C.call}` }} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Row a="Style" b={sweep > 50 ? "Dark neon · nodes" : "…"} color={C.call} />
          <Row a="Topic" b={sweep > 90 ? "Detected ✓" : "…"} color={C.call} />
        </div>
      </Card>
    );
  }
  if (id === "build") {
    const steps: [string, string, number][] = [
      ["✍️ Script likha", C.text, 20],
      ["🎙️ AI voice bani", C.inv, 80],
      ["🎬 Scenes animate", C.wa, 140],
    ];
    return (
      <>
        {steps.map(([t, col, at], k) => {
          const s = spring({ frame: local - at, fps, config: { damping: 13 } });
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 110,
                width: 500,
                top: 300 + k * 86,
                background: "#0d1017f2",
                border: `2px solid ${col}`,
                borderRadius: 16,
                padding: "14px 20px",
                fontFamily: FONT,
                color: C.text,
                fontWeight: 800,
                fontSize: 26,
                display: "flex",
                justifyContent: "space-between",
                opacity: s,
                transform: `translateX(${(1 - s) * 300}px)`,
                boxShadow: `0 0 24px ${col}40`,
              }}
            >
              <span>{t}</span>
              <span style={{ color: "#25d366" }}>✓</span>
            </div>
          );
        })}
      </>
    );
  }
  if (id === "render") {
    const p = interpolate(local, [20, 110], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <>
        <Card color={C.mail} title="RENDERING · 1080x1920" local={local} delay={5} top={300}>
          <div style={{ height: 22, background: "#ffffff18", borderRadius: 11, overflow: "hidden" }}>
            <div style={{ width: `${p}%`, height: "100%", background: `linear-gradient(90deg, ${C.mail}, ${C.claude})` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontFamily: "monospace", fontSize: 20, marginTop: 12 }}>
            <span>frames {Math.round((p / 100) * 1927)}/1927</span>
            <span>{Math.round(p)}%</span>
          </div>
          <Row a="🔊 Voice + SFX + Music" b={p > 60 ? "✓ Mixed" : "…"} color="#25d366" />
        </Card>
        <Stamp text="FINAL.MP4 ✓" color={C.mail} dark local={local} at={115} top={1000} rot={-5} />
      </>
    );
  }
  if (id === "bonus")
    return (
      <>
        <Stamp text="THE BEST PART" color="#fff" dark local={local} at={5} top={300} />
        {[
          ["#3d8bff", "☁️ Cloud me bhi chalta hai", "CLAUDE CODE ON THE WEB", 70],
          ["#25d366", "⚡ Auto setup har session", "SETUP SCRIPT", 150],
        ].map(([col, t, sub, at], k) => {
          const s = spring({ frame: local - (at as number), fps, config: { damping: 13 } });
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 70,
                width: 580,
                top: 860 + k * 86,
                background: "#0d1017f2",
                border: `2px solid ${col}`,
                borderRadius: 16,
                padding: "12px 18px",
                fontFamily: FONT,
                opacity: s,
                transform: `translateX(${(1 - s) * -300}px)`,
                boxShadow: `0 0 24px ${col}40`,
              }}
            >
              <div style={{ color: C.text, fontWeight: 800, fontSize: 23 }}>{t}</div>
              <div style={{ color: C.dim, fontSize: 14, fontFamily: "monospace" }}>{sub}</div>
            </div>
          );
        })}
      </>
    );
  if (id === "cta") {
    const clicked = local > 90;
    const b = spring({ frame: local - 60, fps, config: { damping: 12 } });
    return (
      <>
        <Stamp text="LEARN AI EDITING" color="#fff" dark local={local} at={5} top={320} />
        <div style={{ position: "absolute", top: 990, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${b * (clicked ? 1.08 : 1)})` }}>
          <div style={{ background: clicked ? C.claude : "#fff", color: clicked ? "#fff" : "#111", fontFamily: FONT, fontWeight: 900, fontSize: 30, padding: "14px 34px", borderRadius: 40 }}>
            {clicked ? "Following ✓" : "+ Follow for more"}
          </div>
        </div>
      </>
    );
  }
  return null;
};

/* ---------- Captions ---------- */
const KEY = /^(claude|github|repo|setup|remotion|whisper|sfx|reference|a-roll|voice|style|topic|script|animate|1080p|music|cloud|best|follow|step|ai)/i;
const Captions: React.FC<{ text: string; frames: number; color: string; hide?: boolean }> = ({ text, frames, color, hide }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const total = words.reduce((a, w) => a + w.length + 2, 0);
  const speak = frames - PAD * FPS;
  let acc = 0;
  const times = words.map((w) => {
    const t = (acc / total) * speak;
    acc += w.length + 2;
    return t;
  });
  let cur = 0;
  times.forEach((t, k) => {
    if (f >= t) cur = k;
  });
  const chunk = Math.floor(cur / 3) * 3;
  const shown = words.slice(chunk, chunk + 3);
  if (hide) return null;
  return (
    <div style={{ position: "absolute", top: 1130, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 18px", fontFamily: FONT, fontWeight: 900, fontSize: 36, boxShadow: "0 8px 30px #000a" }}>
        {shown.map((w, k) => {
          const idx = chunk + k;
          const spoken = idx <= cur;
          const isKey = KEY.test(w.replace(/[,.?]/g, ""));
          return (
            <span key={idx} style={{ color: !spoken ? "#b9bcc4" : isKey ? color : "#111", marginRight: k < shown.length - 1 ? 10 : 0 }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Main ---------- */
export const SetupVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background />
      <Network />
      {scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames[i]}>
          <SceneOverlay id={s.id} />
          <Captions text={s.caption} frames={sceneFrames[i]} color={SCENE_META[s.id].color === "#fff" ? C.claude : SCENE_META[s.id].color} />
          <Audio src={staticFile(`Voice over/setup/${s.id}.mp3`)} />
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.5} />
        </Sequence>
      ))}
      {[
        [0, 100, "bass-hit"], [1, 50, "pop"], [1, 100, "click"], [1, 140, "click"],
        [3, 40, "pop"], [3, 80, "pop"], [3, 120, "pop"], [4, 40, "whoosh"],
        [5, 20, "pop"], [5, 80, "pop"], [5, 140, "pop"], [6, 20, "riser"],
        [6, 115, "bass-hit"], [7, 5, "riser"], [8, 5, "bass-hit"], [8, 90, "click"],
      ].map(([sc, at, name], k) => (
        <Sequence key={k} from={starts[sc as number] + (at as number)} durationInFrames={60}>
          <Audio src={staticFile(`sfx/${name}.mp3`)} volume={0.55} />
        </Sequence>
      ))}
      <Audio src={staticFile("music/bg.mp3")} volume={0.13} />
      <div style={{ position: "absolute", top: 0, width: "100%", height: 260, background: "linear-gradient(#07080cff 60%, #07080c00)" }} />
      <Header />
    </AbsoluteFill>
  );
};

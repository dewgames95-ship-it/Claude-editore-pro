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
import scenes from "./scenes.json";

export const FPS = 30;
const PAD = 0.35; // seconds gap after each voice line
export const sceneFrames = scenes.map((s) => Math.round((s.dur + PAD) * FPS));
export const starts = sceneFrames.map((_, i) => sceneFrames.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL = sceneFrames.reduce((a, b) => a + b, 0) + 20;

const C = {
  bg: "#07080c",
  claude: "#ff6a3d",
  wa: "#25d366",
  call: "#3d8bff",
  mail: "#ffb020",
  inv: "#9b6bff",
  text: "#f4f4f6",
  dim: "#8a8f9c",
};
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

type AgentKey = "wa" | "call" | "inv" | "mail";
const AGENTS: { key: AgentKey; label: string; x: number; y: number; n: number }[] = [
  { key: "wa", label: "WhatsApp\nAgent", x: -200, y: -230, n: 1 },
  { key: "call", label: "Calling\nAgent", x: 200, y: -230, n: 2 },
  { key: "mail", label: "Email\nAgent", x: 200, y: 230, n: 3 },
  { key: "inv", label: "Invoice\nBuilder", x: -200, y: 230, n: 4 },
];

const SCENE_META: Record<string, { badge: string; color: string; focus: [number, number, number]; active: AgentKey[] }> = {
  hook: { badge: "4 AI AGENTS · ZERO LEAKS", color: C.claude, focus: [0, 0, 1], active: ["wa", "call", "mail", "inv"] },
  whatsapp: { badge: "01 / 04 · WHATSAPP AGENT", color: C.wa, focus: [-200, -230, 1.55], active: ["wa"] },
  calling: { badge: "02 / 04 · CALLING AGENT", color: C.call, focus: [200, -230, 1.55], active: ["call"] },
  email: { badge: "03 / 04 · EMAIL AGENT", color: C.mail, focus: [140, 200, 1.3], active: ["mail", "inv"] },
  invoice: { badge: "04 / 04 · INVOICE BUILDER", color: C.inv, focus: [-140, 200, 1.3], active: ["inv", "mail"] },
  bonus: { badge: "BONUS · AUTO FOLLOW-UPS", color: "#ff4d8d", focus: [0, 0, 0.95], active: ["wa", "call", "mail", "inv"] },
  cta: { badge: "YOUR AI SALES TEAM · 24/7", color: C.claude, focus: [0, 0, 0.9], active: ["wa", "call", "mail", "inv"] },
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
        <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
        <path d="M9 9.5c.5 2.5 2.5 4.5 5 5" />
      </svg>
    );
  if (k === "call")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    );
  if (k === "mail")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  if (k === "inv")
    return (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
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
        NEVER WASTE A LEAD
        <br />
        AGAIN WITH{" "}
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

const Bubble: React.FC<{ text: string; me?: boolean; local: number; at: number; color: string }> = ({ text, me, local, at, color }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: local - at, fps, config: { damping: 13 } });
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", marginBottom: 10, opacity: s, transform: `scale(${0.6 + s * 0.4})` }}>
      <div style={{ background: me ? color : "#222733", color: me ? "#04130a" : C.text, fontWeight: 700, fontSize: 21, padding: "10px 16px", borderRadius: 14 }}>{text}</div>
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

const SceneOverlay: React.FC<{ id: string }> = ({ id }) => {
  const local = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (id === "hook") return <Stamp text="0 LEADS WASTED" color={C.claude} local={local} at={110} top={1000} />;
  if (id === "whatsapp")
    return (
      <Card color={C.wa} title="NEW LEAD · CHAT" local={local} delay={40}>
        <Bubble text="Hi, I need a website" local={local} at={60} color={C.wa} />
        <Bubble text="Hi Rahul! Happy to help ✓✓" me local={local} at={110} color={C.wa} />
        <Bubble text="Budget & timeline? ✓✓" me local={local} at={150} color={C.wa} />
        <Bubble text="₹50K · 2 weeks" local={local} at={200} color={C.wa} />
      </Card>
    );
  if (id === "calling") {
    const bars = Array.from({ length: 14 }).map((_, k) => 8 + Math.abs(Math.sin(local / 4 + k)) * 26);
    return (
      <Card color={C.call} title="LIVE CALL · AI VOICE" local={local} delay={60}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 52, background: C.call, color: "#fff", fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>R</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 22 }}>Rahul · Client</div>
            <div style={{ color: C.dim, fontSize: 16, fontFamily: "monospace" }}>On call · 00:{String(Math.floor(Math.max(0, local - 60) / fps)).padStart(2, "0")}</div>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {bars.map((h, k) => (
              <div key={k} style={{ width: 4, height: h, background: C.call, borderRadius: 2 }} />
            ))}
          </div>
        </div>
        {[
          ["Price for website?", "₹50K", 130],
          ["How long?", "2 weeks", 190],
          ["Any support?", "✓ Yes", 250],
        ].map(([q, a, at]) => {
          const s = spring({ frame: local - (at as number), fps, config: { damping: 14 } });
          return (
            <div key={q as string} style={{ opacity: s, transform: `translateX(${(1 - s) * -40}px)` }}>
              <Row a={`✓ ${q}`} b={a as string} color={C.call} />
            </div>
          );
        })}
      </Card>
    );
  }
  if (id === "email")
    return (
      <Card color={C.mail} title="CONNECTED" local={local} delay={50} top={320}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", color: C.text, fontWeight: 800, fontSize: 22 }}>
          <div style={{ textAlign: "center" }}>
            <Icon k="inv" size={56} color={C.inv} />
            <div>Invoice</div>
          </div>
          <div style={{ color: C.mail, fontSize: 40 }}>⇄</div>
          <div style={{ textAlign: "center" }}>
            <Icon k="mail" size={56} color={C.mail} />
            <div>Email</div>
          </div>
        </div>
      </Card>
    );
  if (id === "invoice")
    return (
      <>
        <Card color={C.inv} title="INVOICE #1042" local={local} delay={20} top={290}>
          <Row a="Website design" b="₹48,000" />
          <Row a="Hosting" b="₹1,700" />
          <Row a="GST 18%" b="₹8,946" color={C.inv} />
          <div style={{ display: "flex", justifyContent: "space-between", color: C.text, fontSize: 26, fontWeight: 900, paddingTop: 10 }}>
            <span>TOTAL</span>
            <span>₹{Math.round(interpolate(local, [60, 120], [0, 58646], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })).toLocaleString("en-IN")}</span>
          </div>
        </Card>
        <Stamp text="INVOICE READY ✓" color={C.inv} local={local} at={130} top={640} rot={-8} />
        <Sequence from={170} layout="none">
          <Card color={C.mail} title="SENT TO ALL CLIENTS" local={local - 170} top={760}>
            <Row a="📄 Invoice_1042.pdf" b="48 KB" />
            <Row a="rahul@abc.co" b="✓ Sent" color={C.wa} />
            <Row a="priya@abc.co" b="✓ Sent" color={C.wa} />
          </Card>
        </Sequence>
      </>
    );
  if (id === "bonus")
    return (
      <>
        <Stamp text="THE BEST PART" color="#fff" dark local={local} at={5} top={300} />
        {[
          [C.wa, "Follow-up sent on WhatsApp", "DAY 3 · RAHUL", 140],
          [C.call, "Reminder call scheduled", "DAY 4 · 11:00 AM", 210],
          [C.mail, "Payment reminder emailed", "DAY 7 · INVOICE #1042", 280],
        ].map(([col, t, sub, at], k) => {
          const s = spring({ frame: local - (at as number), fps, config: { damping: 13 } });
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 70,
                width: 580,
                top: 800 + k * 82,
                background: "#0d1017f2",
                border: `2px solid ${col}`,
                borderRadius: 16,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: FONT,
                opacity: s,
                transform: `translateX(${(1 - s) * -300}px)`,
                boxShadow: `0 0 24px ${col}40`,
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: 16, background: col as string }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 21 }}>{t}</div>
                <div style={{ color: C.dim, fontSize: 14, fontFamily: "monospace" }}>{sub}</div>
              </div>
              <div style={{ color: C.wa, fontSize: 26, fontWeight: 900 }}>✓</div>
            </div>
          );
        })}
      </>
    );
  if (id === "cta") {
    const clicked = local > 130;
    const b = spring({ frame: local - 100, fps, config: { damping: 12 } });
    return (
      <>
        <Stamp text="FOR YOUR BUSINESS" color="#fff" dark local={local} at={5} top={320} />
        <Stamp text="CUSTOM AI AGENTS" color={C.wa} dark local={local} at={60} top={880} rot={4} />
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
const KEY = /^(claude|lead|whatsapp|calling|email|invoice|gst|automatically|follow-ups|custom|agents?|answers|requirement|best|follow)/i;
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
export const LeadVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background />
      <Network />
      {scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames[i]}>
          <SceneOverlay id={s.id} />
          <Captions text={s.caption} frames={sceneFrames[i]} color={SCENE_META[s.id].color === "#fff" ? C.claude : SCENE_META[s.id].color} />
          <Audio src={staticFile(`Voice over/${s.id}.mp3`)} />
          <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.5} />
        </Sequence>
      ))}
      {/* pops on key moments */}
      {[
        [0, 110, "bass-hit"],
        [1, 40, "pop"],
        [1, 110, "pop"],
        [1, 150, "pop"],
        [2, 60, "pop"],
        [2, 130, "click"],
        [2, 190, "click"],
        [2, 250, "click"],
        [4, 130, "bass-hit"],
        [4, 170, "pop"],
        [5, 5, "riser"],
        [5, 140, "pop"],
        [5, 210, "pop"],
        [5, 280, "pop"],
        [6, 5, "bass-hit"],
        [6, 130, "click"],
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

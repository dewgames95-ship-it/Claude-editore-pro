import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import scenes from "./scenes-me.json";
import { Phone } from "./Setup34";

// 16:9 news-explainer style: presenter cutout + navy/gold headline boxes + AI bg images + phone demo
const FPS = 30;
const PAD = 0.2;
const frames = scenes.map((s) => Math.round((s.dur + PAD) * FPS));
const starts = frames.map((_, i) => frames.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL_ME = frames.reduce((a, b) => a + b, 0) + 15;

const NAVY = "#0f1f4a";
const GOLD = "#f5c242";
const FONT = "Montserrat, 'Arial Black', Inter, Arial, sans-serif";
const sp = (f: number, fps: number, d = 14) => spring({ frame: f, fps, config: { damping: d } });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Pose = "point" | "listen" | "pray" | "pocket" | "neutral" | "wow";
const META: Record<string, { pose: Pose; bg: number; title: [string, string]; side: "left" | "right" }> = {
  hook: { pose: "point", bg: 1, title: ["NO PREMIERE.", "NO AFTER EFFECTS."], side: "right" },
  how: { pose: "listen", bg: 2, title: ["PEHLE", "SAMJHO"], side: "right" },
  s1: { pose: "neutral", bg: 3, title: ["STEP 1", "REPO SELECT"], side: "right" },
  s2: { pose: "pocket", bg: 4, title: ["STEP 2", "SETUP CHALAO"], side: "right" },
  s3: { pose: "point", bg: 4, title: ["STEP 3", "VIDEO ATTACH"], side: "right" },
  s4: { pose: "pray", bg: 2, title: ["STEP 4", "CLAUDE KA KAAM"], side: "right" },
  s5: { pose: "wow", bg: 5, title: ["STEP 5", "FINAL VIDEO"], side: "right" },
  tip: { pose: "listen", bg: 6, title: ["PRO", "TIP"], side: "right" },
  cta: { pose: "point", bg: 1, title: ["FOLLOW", "FOR MORE"], side: "right" },
};

const Bg: React.FC<{ n: number }> = ({ n }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img src={staticFile(`images/me/bg${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.12 + f * 0.0006}) translate(-2%, -2%)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #06102bee 0%, #0a1838aa 55%, #0a183855 100%)" }} />
    </AbsoluteFill>
  );
};

const Presenter: React.FC<{ pose: Pose; len: number }> = ({ pose, len }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, 16);
  const breathe = 1 + Math.sin(f / 22) * 0.006;
  const out = interpolate(f, [len - 5, len], [1, 0], clamp);
  return (
    <Img
      src={staticFile(`presenter/${pose}.png`)}
      style={{
        position: "absolute",
        right: 40,
        bottom: 0,
        height: 640,
        transform: `translateX(${(1 - s) * 120}px) scale(${breathe})`,
        transformOrigin: "bottom center",
        opacity: s * out,
        filter: "drop-shadow(0 20px 40px #000a)",
      }}
    />
  );
};

const Headline: React.FC<{ a: string; b: string }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - 2, fps, 13);
  const s2 = sp(f - 9, fps, 13);
  return (
    <div style={{ position: "absolute", left: 60, top: 50, fontFamily: FONT }}>
      <div
        style={{
          display: "inline-block",
          background: `linear-gradient(180deg, #16295e, ${NAVY})`,
          border: `3px solid ${GOLD}`,
          borderRadius: 10,
          padding: "10px 26px 12px",
          boxShadow: "0 16px 40px #000a",
          transform: `scale(${s})`,
          transformOrigin: "left center",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 900, fontSize: 36, letterSpacing: 1 }}>{a}</div>
        <div style={{ color: GOLD, fontWeight: 900, fontSize: 52, letterSpacing: 1, lineHeight: 1, opacity: s2, transform: `translateY(${(1 - s2) * 14}px)` }}>{b}</div>
      </div>
    </div>
  );
};

const GoldCard: React.FC<{ n: string; label: string; at: number; x: number; y: number; w?: number }> = ({ n, label, at, x, y, w = 170 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f - at, fps, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        padding: "16px 10px",
        borderRadius: 14,
        background: `linear-gradient(180deg, #1a2f6b, ${NAVY})`,
        border: `2.5px solid ${GOLD}`,
        textAlign: "center",
        fontFamily: FONT,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + s * 0.3})`,
        opacity: s,
        boxShadow: "0 14px 34px #000a",
      }}
    >
      <div style={{ fontSize: 44, lineHeight: 1.1 }}>{n}</div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginTop: 8, letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
};

// Phone placed inside a 720x960 frame and scaled
const PhoneAt: React.FC<{ x: number; y: number; scale: number; children: React.ReactNode }> = ({ x, y, scale, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 720, height: 960, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
);

const Flow: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items: [string, string, number][] = [
    ["🤖", "Claude Code", 20],
    ["💻", "Code (React)", 75],
    ["🎬", "Remotion → Video", 130],
  ];
  return (
    <div style={{ position: "absolute", left: 60, top: 250, display: "flex", alignItems: "center", gap: 14 }}>
      {items.map(([e, t, at], i) => {
        const s = sp(f - at, fps, 12);
        return (
          <React.Fragment key={t}>
            {i > 0 && <div style={{ color: GOLD, fontSize: 40, fontWeight: 900, opacity: s }}>→</div>}
            <div style={{ width: 170, padding: "18px 8px", borderRadius: 14, background: `linear-gradient(180deg, #1a2f6b, ${NAVY})`, border: `2.5px solid ${GOLD}`, textAlign: "center", fontFamily: FONT, transform: `scale(${s})`, boxShadow: "0 14px 34px #000a" }}>
              <div style={{ fontSize: 46 }}>{e}</div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginTop: 6 }}>{t}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Scene: React.FC<{ id: string; len: number }> = ({ id, len }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = META[id];
  let body: React.ReactNode = null;

  if (id === "hook") {
    const s = sp(f - 120, fps, 10);
    body = (
      <div style={{ position: "absolute", left: 60, top: 300, fontFamily: FONT, transform: `scale(${s})`, transformOrigin: "left" }}>
        <div style={{ color: "#fff", fontWeight: 900, fontSize: 40 }}>SIRF</div>
        <div style={{ color: GOLD, fontWeight: 900, fontSize: 84, lineHeight: 1 }}>CLAUDE CODE</div>
        <div style={{ marginTop: 18, display: "inline-block", background: GOLD, color: NAVY, fontWeight: 900, fontSize: 24, padding: "8px 18px", borderRadius: 8 }}>5 EASY STEPS · FULL SETUP</div>
      </div>
    );
  }
  if (id === "how") body = <Flow />;
  if (id === "s1") {
    const repos = ["my-portfolio", "my-video-repo", "notes-app"];
    const pick = f > 110;
    body = (
      <PhoneAt x={140} y={95} scale={0.6}>
        <Phone title="New session" sub="Choose a repository">
          {repos.map((r, i) => {
            const s = sp(f - 30 - i * 6, fps, 14);
            const sel = pick && i === 1;
            return (
              <div key={r} style={{ opacity: s, display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12, background: sel ? "#d9775722" : "#2b2b29", border: `1.5px solid ${sel ? "#d97757" : "#3a3a37"}`, fontSize: 13.5, fontFamily: "Inter, Arial" }}>
                <span style={{ flex: 1 }}>{r}</span>
                {sel && <span style={{ color: "#d97757", fontWeight: 900 }}>✓</span>}
              </div>
            );
          })}
        </Phone>
      </PhoneAt>
    );
  }
  if (id === "s2")
    body = (
      <>
        <PhoneAt x={-60} y={95} scale={0.6}>
          <Phone
            typing={{ text: "setup chalao", from: 10, send: 40 }}
            msgs={[
              { t: "user", text: "setup chalao", at: 41 },
              { t: "tool", text: "Ran 1 command\n$ bash setup.sh", at: 55 },
              { t: "claude", text: "✅ Setup done! 4 tools ready.", at: 110 },
            ]}
          />
        </PhoneAt>
        <GoldCard n="🎬" label="REMOTION" at={130} x={470} y={170} w={150} />
        <GoldCard n="📝" label="WHISPER" at={160} x={630} y={170} w={150} />
        <GoldCard n="🎙️" label="AI VOICE" at={190} x={470} y={340} w={150} />
        <GoldCard n="🔊" label="SFX" at={220} x={630} y={340} w={150} />
      </>
    );
  if (id === "s3")
    body = (
      <PhoneAt x={140} y={95} scale={0.6}>
        <Phone
          attach={25}
          typing={{ text: "Isi style me is topic par video banao", from: 75, send: 150 }}
          msgs={[
            { t: "file", text: "reference.mp4 · 45s", at: 35 },
            { t: "user", text: "Isi style me is topic par video banao", at: 151 },
            { t: "claude", text: "Theek hai! Reference dekh raha hoon…", at: 175 },
          ]}
        />
      </PhoneAt>
    );
  if (id === "s4")
    body = (
      <>
        <GoldCard n="👀" label="STYLE SAMJHA" at={60} x={60} y={250} />
        <GoldCard n="✍️" label="SCRIPT" at={95} x={245} y={250} />
        <GoldCard n="🎙️" label="VOICE" at={130} x={430} y={250} />
        <GoldCard n="🎬" label="ANIMATION" at={165} x={615} y={250} />
        <div style={{ position: "absolute", left: 60, top: 470, fontFamily: FONT, color: "#fff", fontWeight: 800, fontSize: 26, opacity: sp(f - 190, fps, 14) }}>
          Sab <span style={{ color: GOLD }}>automatic</span> · aapko bas dekhna hai
        </div>
      </>
    );
  if (id === "s5") {
    const p = Math.round(interpolate(f, [10, 90], [0, 100], clamp));
    body = (
      <PhoneAt x={140} y={95} scale={0.6}>
        <Phone
          msgs={[
            { t: "tool", text: `Rendering… ${p}%`, at: 5 },
            { t: "claude", text: "Final video ready hai 🎉", at: 100 },
            { t: "video", text: "final.mp4 · 1080p", at: 115 },
          ]}
        />
      </PhoneAt>
    );
  }
  if (id === "tip")
    body = (
      <div style={{ position: "absolute", left: 60, top: 270, width: 640, fontFamily: FONT, transform: `scale(${sp(f - 30, fps, 12)})`, transformOrigin: "left" }}>
        <div style={{ background: `linear-gradient(180deg, #1a2f6b, ${NAVY})`, border: `3px solid ${GOLD}`, borderRadius: 14, padding: 24 }}>
          <div style={{ color: GOLD, fontWeight: 900, fontSize: 34 }}>⚡ AUTO SETUP</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 24, marginTop: 8 }}>Har naya session = setup apne aap</div>
        </div>
        <div style={{ marginTop: 16, display: "inline-block", background: GOLD, color: NAVY, fontWeight: 900, fontSize: 24, padding: "8px 18px", borderRadius: 8 }}>NO INSTALL TENSION</div>
      </div>
    );
  if (id === "cta") {
    const clicked = f > 60;
    body = (
      <div style={{ position: "absolute", left: 60, top: 300, fontFamily: FONT, transform: `scale(${sp(f - 10, fps, 10) * (clicked && f < 70 ? 1.06 : 1)})`, transformOrigin: "left" }}>
        <div style={{ background: clicked ? GOLD : "#fff", color: NAVY, fontWeight: 900, fontSize: 44, padding: "16px 36px", borderRadius: 50 }}>{clicked ? "FOLLOWING ✓" : "+ FOLLOW"}</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 26, marginTop: 16 }}>
          Milte hain <span style={{ color: GOLD }}>agle video</span> me 👋
        </div>
      </div>
    );
  }

  const out = interpolate(f, [len - 5, len], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Bg n={m.bg} />
      <AbsoluteFill style={{ opacity: out }}>
        {body}
        <Headline a={m.title[0]} b={m.title[1]} />
      </AbsoluteFill>
      <Presenter pose={m.pose} len={len} />
    </AbsoluteFill>
  );
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
    <div style={{ position: "absolute", bottom: 34, left: 60, fontFamily: FONT, fontWeight: 900, fontSize: 30, zIndex: 20 }}>
      <span style={{ background: NAVY, border: `2px solid ${GOLD}`, padding: "8px 18px", borderRadius: 10, boxShadow: "0 10px 30px #000a" }}>
        {words.slice(start, start + 4).map((w, k) => (
          <span key={k} style={{ color: start + k === cur ? GOLD : start + k < cur ? "#fff" : "#8592b8" }}>
            {w}{" "}
          </span>
        ))}
      </span>
    </div>
  );
};

export const MeVideo: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    {scenes.map((s, i) => (
      <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
        <Scene id={s.id} len={frames[i]} />
        <Caption text={s.caption} len={frames[i]} />
        <Audio src={staticFile(`Voice over/me/${s.id}.mp3`)} />
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} />
      </Sequence>
    ))}
    {[
      [0, 120, "bass-hit"],
      [1, 20, "pop"],
      [1, 75, "pop"],
      [1, 130, "pop"],
      [2, 110, "click"],
      [3, 40, "click"],
      [3, 130, "pop"],
      [3, 160, "pop"],
      [3, 190, "pop"],
      [3, 220, "pop"],
      [4, 25, "click"],
      [4, 150, "click"],
      [5, 60, "pop"],
      [5, 95, "pop"],
      [5, 130, "pop"],
      [5, 165, "pop"],
      [6, 5, "riser"],
      [6, 100, "bass-hit"],
      [7, 30, "pop"],
      [8, 60, "click"],
    ].map(([sc, at, n], k) => (
      <Sequence key={k} from={starts[sc as number] + (at as number)} durationInFrames={50}>
        <Audio src={staticFile(`sfx/${n}.mp3`)} volume={0.45} />
      </Sequence>
    ))}
    <Audio src={staticFile("music/bg.mp3")} volume={0.1} loop />
  </AbsoluteFill>
);

import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const LIME = "#c6ff3d";

const Title: React.FC<{ text: string; delay: number; size: number; color?: string }> = ({
  text,
  delay,
  size,
  color = "#fff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 800,
        color,
        fontFamily: "Inter, Arial, sans-serif",
        transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + s * 0.2})`,
        opacity: s,
        textAlign: "center",
        lineHeight: 1.1,
      }}
    >
      {text}
    </div>
  );
};

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = spring({ frame: frame - 5, fps, config: { damping: 200 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  const bar = interpolate(frame, [40, 110], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(frame, [140, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", opacity: out }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(#ffffff22 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          transform: `translateY(${-frame * 0.5}px)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `10px solid ${LIME}`,
            boxShadow: `0 0 60px ${LIME}88`,
            transform: `scale(${ring * pulse}) rotate(${frame * 2}deg)`,
            borderTopColor: "transparent",
          }}
        />
        <Title text="Claude Editor" delay={15} size={84} />
        <Title text="PRO" delay={25} size={110} color={LIME} />
        <div style={{ width: 460, height: 14, background: "#ffffff22", borderRadius: 7 }}>
          <div style={{ width: `${bar}%`, height: "100%", background: LIME, borderRadius: 7 }} />
        </div>
        <Title text="Remotion se banaya ✨" delay={60} size={40} color="#bbb" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

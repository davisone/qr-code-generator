"use client";

interface MarqueeProps {
  items: string[];
}

export const Marquee = ({ items }: MarqueeProps) => {
  /* On duplique les items pour un défilement sans coupure */
  const repeated = [...items, ...items];

  return (
    <div
      style={{
        background: "var(--ink)",
        borderTop: "var(--rule)",
        borderBottom: "var(--rule)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-track">
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
              letterSpacing: "0.08em",
              color: "rgba(240,235,225,0.85)",
              padding: "0.9rem 1.8rem",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "1.8rem",
            }}
          >
            {item}
            <span style={{ color: "var(--red)", fontSize: "0.6em" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

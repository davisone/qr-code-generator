interface Props {
  title: string;
  subtitle: string;
  badge: string;
  kicker?: string;
}

export const GeneratorHero = ({ title, subtitle, badge, kicker }: Props) => {
  return (
    <section
      style={{
        borderBottom: "var(--rule)",
        padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="max-w-7xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            padding: "0.35rem 0.85rem",
            background: "var(--ink)",
            width: "fit-content",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--yellow)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#f0ebe1",
            }}
          >
            {badge}
          </span>
        </div>

        {kicker && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--red)",
              marginBottom: "0.8rem",
            }}
          >
            {kicker}
          </p>
        )}

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 7vw, 6rem)",
            lineHeight: 0.92,
            letterSpacing: "0.02em",
            color: "var(--ink)",
            margin: 0,
            maxWidth: "18ch",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "1.05rem",
            color: "var(--mid)",
            fontFamily: "var(--font-sans)",
            maxWidth: "55ch",
            lineHeight: 1.65,
          }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
};

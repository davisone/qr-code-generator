interface GuideStep {
  title: string;
  body: string;
}

interface Props {
  label: string;
  title: string;
  steps: GuideStep[];
}

export const GeneratorGuide = ({ label, title, steps }: Props) => {
  return (
    <section style={{ background: "var(--ink)", borderBottom: "var(--rule)" }}>
      <div className="max-w-7xl mx-auto">
        <div
          style={{
            padding: "3rem clamp(1.5rem, 4vw, 3rem) 2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--yellow)",
              marginBottom: "0.6rem",
            }}
          >
            {label}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              letterSpacing: "0.02em",
              color: "#f0ebe1",
              lineHeight: 0.95,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: "clamp(2rem, 4vw, 3rem)",
                borderRight: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.5rem, 7vw, 5rem)",
                  color: "var(--red)",
                  lineHeight: 1,
                  marginBottom: "1.2rem",
                  letterSpacing: "0.02em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
                  letterSpacing: "0.04em",
                  color: "#f0ebe1",
                  marginBottom: "0.8rem",
                  lineHeight: 1,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "rgba(240,235,225,0.55)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

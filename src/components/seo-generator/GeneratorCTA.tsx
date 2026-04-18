import { Link } from "@/i18n/navigation";

interface Props {
  title: string;
  body: string;
  button: string;
  href?: string;
}

export const GeneratorCTA = ({ title, body, button, href = "/register" }: Props) => {
  return (
    <section
      style={{
        background: "var(--red)",
        borderBottom: "var(--rule)",
        padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)",
      }}
    >
      <div
        className="max-w-7xl mx-auto"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              letterSpacing: "0.02em",
              color: "white",
              lineHeight: 0.95,
              marginBottom: "0.8rem",
              maxWidth: "20ch",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.55,
              maxWidth: "48ch",
              margin: 0,
            }}
          >
            {body}
          </p>
        </div>
        <Link
          href={href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "white",
            color: "var(--red)",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "1rem 2.2rem",
            textDecoration: "none",
            flexShrink: 0,
            border: "2px solid white",
          }}
        >
          {button} →
        </Link>
      </div>
    </section>
  );
};

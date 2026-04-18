import { Accordion } from "@/components/ui/Accordion";

interface Props {
  label: string;
  title: string;
  items: { q: string; a: string }[];
}

export const GeneratorFAQ = ({ label, title, items }: Props) => {
  return (
    <section style={{ borderBottom: "var(--rule)" }}>
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}
      >
        <div style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--red)",
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
              color: "var(--ink)",
              lineHeight: 0.95,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
};

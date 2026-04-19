import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Embed QR Code Generator Widget — Documentation | QRaft",
  description: "Add a free QR code generator to your website with one line of HTML. Copy the embed code and paste it anywhere.",
  robots: { index: true, follow: true },
};

export default function EmbedDocsPage() {
  const embedCode = `<iframe src="${BASE_URL}/en/embed" width="420" height="500" frameborder="0" style="border:1px solid #eee;border-radius:8px"></iframe>`;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto" style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <Link href="/" style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "var(--ink)", textDecoration: "none", display: "block", marginBottom: "3rem" }}>
          QRaft
        </Link>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 0.95, letterSpacing: "0.02em", color: "var(--ink)", marginBottom: "1.5rem" }}>
          EMBED THE QR CODE GENERATOR ON YOUR SITE
        </h1>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Add a free QR code generator to your website with a single line of HTML. Your visitors can create and download QR codes directly from your page.
        </p>

        {/* Code snippet */}
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", marginBottom: "0.8rem" }}>
            COPY THIS CODE
          </p>
          <pre style={{ background: "var(--ink)", color: "#f0ebe1", padding: "1.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {embedCode}
          </pre>
        </div>

        {/* Customize */}
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1rem" }}>
          CUSTOMIZATION
        </h2>
        <ul style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "3rem" }}>
          <li><strong>Width:</strong> Adjust the <code>width</code> attribute (min 320px recommended)</li>
          <li><strong>Height:</strong> Adjust <code>height</code> (min 450px for the full generator)</li>
          <li><strong>Language:</strong> Change <code>/en/embed</code> to any supported locale: fr, es, de, it, pt, nl, ja, zh, ko</li>
          <li><strong>Border:</strong> Modify the <code>style</code> attribute to match your site design</li>
        </ul>

        {/* Live preview */}
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "0.03em", color: "var(--ink)", marginBottom: "1rem" }}>
          LIVE PREVIEW
        </h2>
        <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden", marginBottom: "3rem" }}>
          <iframe src={`${BASE_URL}/en/embed`} width="420" height="500" style={{ border: "none", display: "block", margin: "0 auto" }} title="QRaft Embed Preview" />
        </div>

        <Link
          href="/register"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--red)", color: "white", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "1rem 2.2rem", textDecoration: "none" }}
        >
          Create a free account →
        </Link>
      </div>
    </div>
  );
}

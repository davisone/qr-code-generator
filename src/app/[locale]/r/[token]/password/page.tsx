import Navbar from "@/components/Navbar";
import { PasswordUnlockForm } from "./PasswordUnlockForm";

interface Props {
  params: Promise<{ token: string; locale: string }>;
}

export default async function QRPasswordPage({ params }: Props) {
  const { token } = await params;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 20vw, 12rem)",
            color: "var(--ink)",
            lineHeight: 1,
            opacity: 0.08,
            userSelect: "none",
            marginBottom: "-2rem",
          }}
        >
          ⌾
        </p>
        <PasswordUnlockForm token={token} />
      </div>
    </div>
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "useqraft — Générateur de QR codes gratuit et personnalisable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Décoration QR code en arrière-plan */}
        <div
          style={{
            position: "absolute",
            right: "60px",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.08,
            display: "flex",
          }}
        >
          <svg viewBox="0 0 200 200" width="340" height="340">
            <rect fill="white" x="20" y="20" width="60" height="60" rx="4" />
            <rect fill="white" x="120" y="20" width="60" height="60" rx="4" />
            <rect fill="white" x="20" y="120" width="60" height="60" rx="4" />
            <rect fill="white" x="30" y="30" width="40" height="40" rx="2" />
            <rect fill="#0a0a0a" x="38" y="38" width="24" height="24" rx="1" />
            <rect fill="white" x="130" y="30" width="40" height="40" rx="2" />
            <rect fill="#0a0a0a" x="138" y="38" width="24" height="24" rx="1" />
            <rect fill="white" x="30" y="130" width="40" height="40" rx="2" />
            <rect fill="#0a0a0a" x="38" y="138" width="24" height="24" rx="1" />
            <rect fill="white" x="90" y="20" width="20" height="20" rx="2" />
            <rect fill="white" x="90" y="50" width="20" height="20" rx="2" />
            <rect fill="white" x="120" y="90" width="20" height="20" rx="2" />
            <rect fill="white" x="150" y="90" width="20" height="20" rx="2" />
            <rect fill="white" x="90" y="120" width="20" height="20" rx="2" />
            <rect fill="white" x="120" y="150" width="20" height="20" rx="2" />
            <rect fill="white" x="150" y="150" width="20" height="20" rx="2" />
            <rect fill="white" x="90" y="90" width="20" height="20" rx="2" />
            <rect fill="white" x="20" y="90" width="20" height="20" rx="2" />
            <rect fill="white" x="50" y="90" width="20" height="20" rx="2" />
            <rect fill="white" x="90" y="150" width="20" height="20" rx="2" />
            <rect fill="white" x="120" y="120" width="20" height="20" rx="2" />
            <rect fill="white" x="150" y="120" width="20" height="20" rx="2" />
            <rect fill="white" x="170" y="150" width="10" height="10" rx="1" />
          </svg>
        </div>

        {/* Accent vert */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "6px",
            height: "100%",
            background: "#10b981",
          }}
        />

        {/* Badge */}
        <div
          style={{
            background: "#10b98120",
            border: "1px solid #10b98140",
            borderRadius: "100px",
            padding: "8px 20px",
            display: "flex",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#10b981", fontSize: "18px", fontWeight: 600 }}>
            100% Gratuit
          </span>
        </div>

        {/* Titre */}
        <div
          style={{
            color: "white",
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            maxWidth: "720px",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>useqraft</span>
          <span style={{ color: "#10b981" }}>Générateur de QR codes</span>
        </div>

        {/* Sous-titre */}
        <div
          style={{
            color: "#a3a3a3",
            fontSize: "26px",
            maxWidth: "620px",
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          Créez, personnalisez et partagez vos QR codes. Avec logo, couleurs et analytics.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const runtime = "nodejs";
export const alt = "QRaft Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryLabels: Record<string, { label: string; color: string }> = {
  tutorial: { label: "TUTORIEL", color: "#10b981" },
  "use-case": { label: "CAS D'USAGE", color: "#f97316" },
  comparison: { label: "COMPARATIF", color: "#6366f1" },
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);

  const title = post?.title ?? "QRaft Blog";
  const cat = categoryLabels[post?.category ?? ""] ?? categoryLabels.tutorial;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* QR pattern background */}
        <div
          style={{
            position: "absolute",
            right: "-20px",
            bottom: "-20px",
            opacity: 0.04,
            display: "flex",
          }}
        >
          <svg viewBox="0 0 200 200" width="380" height="380">
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
          </svg>
        </div>

        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "6px",
            height: "100%",
            background: cat.color,
          }}
        />

        {/* Top: category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              background: `${cat.color}20`,
              border: `1px solid ${cat.color}40`,
              borderRadius: "100px",
              padding: "6px 18px",
              display: "flex",
            }}
          >
            <span
              style={{
                color: cat.color,
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.12em",
              }}
            >
              {cat.label}
            </span>
          </div>
          {post?.readingTime && (
            <span style={{ color: "#737373", fontSize: "15px" }}>
              {post.readingTime} min de lecture
            </span>
          )}
        </div>

        {/* Center: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "900px",
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: cat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              Q
            </div>
            <span
              style={{ color: "white", fontSize: "24px", fontWeight: 700 }}
            >
              QRaft
            </span>
            <span style={{ color: "#525252", fontSize: "20px" }}>Blog</span>
          </div>
          <span style={{ color: "#525252", fontSize: "16px" }}>
            useqraft.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

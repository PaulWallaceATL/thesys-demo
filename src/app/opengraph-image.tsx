import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background:
            "linear-gradient(135deg, rgba(10,12,40,1) 0%, rgba(23,28,68,1) 40%, rgba(122,123,255,1) 100%)",
          color: "#f8fbff",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: "0.35em", opacity: 0.8 }}>
          THESYS C1
        </div>
        <div>
          <p style={{ fontSize: 64, fontWeight: 600, margin: 0 }}>
            Thesys Demo Studio
          </p>
          <p style={{ fontSize: 32, margin: "16px 0 0", opacity: 0.9 }}>
            Stream live Generative UI artifacts with presets & dashboards.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 20,
            opacity: 0.9,
          }}
        >
          <span>Slides & Decks</span>
          <span>Dashboards</span>
          <span>Workflow Copilots</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}


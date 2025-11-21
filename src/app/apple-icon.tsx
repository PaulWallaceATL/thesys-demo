import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#f8fbff",
          background: "radial-gradient(circle at 20% 20%,#a8a4ff,#1b1d3e)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(255,255,255,0.2)",
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: "-0.05em",
          }}
        >
          C1
        </div>
        <span style={{ fontSize: 26, fontWeight: 500 }}>Thesys</span>
      </div>
    ),
    {
      ...size,
    },
  );
}


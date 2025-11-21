import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.04em",
          color: "#f8fbff",
          background: "linear-gradient(135deg,#7f7bff,#5ac8fa)",
          borderRadius: "18%",
        }}
      >
        C1
      </div>
    ),
    {
      ...size,
    },
  );
}


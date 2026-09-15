import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
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
          background: "linear-gradient(135deg, #0b132b 0%, #121e38 50%, #1c2d52 100%)",
          borderRadius: "38px",
          border: "3px solid rgba(56, 182, 255, 0.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Yellow power accent polygon */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 30,
            width: 24,
            height: 12,
            backgroundColor: "#ffd600",
            borderRadius: "3px",
            boxShadow: "0 0 12px #ffd600",
          }}
        />

        {/* Stylized Brand S */}
        <span
          style={{
            fontSize: 108,
            fontWeight: 900,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#38b6ff",
            lineHeight: 1,
            textShadow: "0 4px 18px rgba(56, 182, 255, 0.5)",
          }}
        >
          S
        </span>

        {/* Small "SKILL" badge */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "4px",
            color: "#ffffff",
            marginTop: 4,
            opacity: 0.9,
          }}
        >
          SKILL STORE
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
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
          background: "linear-gradient(135deg, #0b132b 0%, #162d52 100%)",
          borderRadius: "7px",
          border: "1px solid rgba(56, 182, 255, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Yellow power accent bar */}
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 4,
            width: 6,
            height: 3,
            backgroundColor: "#ffd600",
            borderRadius: "1px",
          }}
        />
        {/* Stylized "S" typography */}
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: "linear-gradient(180deg, #ffffff 0%, #38b6ff 100%)",
            backgroundClip: "text",
            color: "#38b6ff",
            lineHeight: 1,
            marginTop: "-1px",
            letterSpacing: "-0.5px",
          }}
        >
          S
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from "next/og";

export const alt = "AJ System Soft Technology — Software built around your requirements.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded default OG image for every page without its own og:image.
 * Pure layout (system fonts) so generation is deterministic and fast.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f5f6f8",
        padding: "72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "9999px",
            backgroundColor: "#2347dd",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: 700,
          }}
        >
          AJ
        </div>
        <div style={{ fontSize: "28px", fontWeight: 600, color: "#0b1220" }}>
          AJ System Soft Technology
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ fontSize: "64px", fontWeight: 700, color: "#0b1220", lineHeight: 1.1 }}>
          Software built around
        </div>
        <div style={{ fontSize: "64px", fontWeight: 700, color: "#2347dd", lineHeight: 1.1 }}>
          your requirements.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #e4e7ee",
          paddingTop: "28px",
          fontSize: "26px",
          color: "#5b6478",
        }}
      >
        <span>Custom software · SaaS · Web · Mobile · ERP</span>
        <span style={{ color: "#2347dd", fontWeight: 600 }}>AJS Technology</span>
      </div>
    </div>,
    size,
  );
}

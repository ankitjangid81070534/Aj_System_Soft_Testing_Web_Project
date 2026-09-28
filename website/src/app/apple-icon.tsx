import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Branded Apple touch icon: white "AJ" on the brand-blue roundel. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "36px",
        backgroundColor: "#2347dd",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "80px",
        fontWeight: 700,
      }}
    >
      AJ
    </div>,
    size,
  );
}

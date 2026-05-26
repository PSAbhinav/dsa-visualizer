import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "linear-gradient(135deg, #030712 0%, #111827 55%, #581c87 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px",
          width: "100%",
        }}
      >
        <div style={{ color: "#d8b4fe", display: "flex", fontSize: 32, fontWeight: 700 }}>
          DSA Visualizer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Learn Data Structures &amp; Algorithms Interactively
          </div>
          <div style={{ color: "#d1d5db", display: "flex", fontSize: 32, lineHeight: 1.3 }}>
            Master DSA with interactive visualizations, multi-language code, and practice problems
          </div>
        </div>
        <div style={{ color: "#f9a8d4", display: "flex", fontSize: 26, gap: 24 }}>
          <span>Interactive Visualizations</span>
          <span>•</span>
          <span>Multi-Language Code</span>
          <span>•</span>
          <span>Practice Problems</span>
        </div>
      </div>
    ),
    size,
  );
}

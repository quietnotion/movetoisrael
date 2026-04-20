import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Moving to Israel: The Math — 2026 tax year calculator for American Jewish families";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#00274C",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              background: "#FFCB05",
              color: "#00274C",
              fontSize: 20,
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: 6,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            U.S. & Israel 2026 tax year
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            What would moving to Israel actually mean for your money?
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", maxWidth: 900 }}>
            Plug in your state, income, and kids. Get a straight-dollars answer.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,203,5,0.3)",
            paddingTop: 24,
          }}
        >
          <div style={{ color: "#FFCB05", fontSize: 26, fontWeight: 700 }}>movetoisrael.fyi</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }}>A free calculator from Quiet Notion</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

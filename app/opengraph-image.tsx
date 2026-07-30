import { ImageResponse } from "next/og"

export const alt =
  "DocCollab — write together in real time, with an AI assistant for your draft"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#f7f8fa",
          color: "#16161a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(115deg, #f7f8fa 0%, #eef0f3 42%, rgba(15, 118, 110, 0.14) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -60,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(15, 118, 110, 0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: -140,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(15, 118, 110, 0.08)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: "#0f766e",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "#0f766e",
                display: "flex",
              }}
            >
              Real-time docs · Ask AI
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                fontSize: 92,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.05em",
                display: "flex",
              }}
            >
              DocCollab
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 500,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                color: "#4a4e57",
                display: "flex",
                maxWidth: 780,
              }}
            >
              Write together in real time — and ask AI about the draft.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 52,
                padding: "0 22px",
                borderRadius: 12,
                background: "#0f766e",
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Continue with Google
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#4a4e57",
                display: "flex",
              }}
            >
              Collaborative editing with a document-aware assistant
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

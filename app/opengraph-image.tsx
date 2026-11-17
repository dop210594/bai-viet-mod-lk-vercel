import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Mod của Claude Code: chúng là gì, và mod chúng tôi cài sẵn cho mọi agent";
const EYEBROW = "CLAUDE CODE · AGENTSROOM";

/** Load a Google Font subset (TTF) that covers exactly the characters we draw. */
async function loadFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`Could not load font ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

export default async function OpengraphImage() {
  const [display, body] = await Promise.all([
    loadFont("Bricolage+Grotesque", 800, HEADLINE),
    loadFont("Be+Vietnam+Pro", 700, EYEBROW + "agentsroom.dev"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#faf6ef",
          backgroundImage:
            "radial-gradient(700px 500px at 0% 0%, rgba(150,122,255,0.30), transparent 70%), radial-gradient(600px 420px at 100% 0%, rgba(255,176,132,0.34), transparent 70%)",
          color: "#17130d",
        }}
      >
        <div style={{ fontFamily: "Body", fontSize: 26, letterSpacing: 3, color: "#857a6c" }}>{EYEBROW}</div>
        <div
          style={{
            fontFamily: "Display",
            fontSize: 74,
            lineHeight: 1.05,
            letterSpacing: -2.5,
            maxWidth: 1000,
          }}
        >
          {HEADLINE}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 8, borderRadius: 4, background: "#5b3fd6" }} />
          <div style={{ fontFamily: "Body", fontSize: 26, color: "#5b3fd6" }}>agentsroom.dev</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Display", data: display, weight: 800, style: "normal" },
        { name: "Body", data: body, weight: 700, style: "normal" },
      ],
    }
  );
}

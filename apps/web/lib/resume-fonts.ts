import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

function fontFile(name: string) {
  const candidates = [
    path.join(process.cwd(), "fonts", name),
    path.join(process.cwd(), "apps/web/fonts", name),
  ];
  const match = candidates.find((file) => fs.existsSync(file));
  if (!match) {
    throw new Error(`Resume font missing: ${name} (cwd=${process.cwd()})`);
  }
  return match;
}

export function registerResumeFonts() {
  if (registered) {
    return;
  }

  Font.register({
    family: "Source Serif 4",
    fonts: [
      {
        src: fontFile("SourceSerif4-Regular.woff"),
        fontWeight: 400,
        fontStyle: "normal",
      },
      {
        src: fontFile("SourceSerif4-Italic.woff"),
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: fontFile("SourceSerif4-Bold.woff"),
        fontWeight: 700,
        fontStyle: "normal",
      },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

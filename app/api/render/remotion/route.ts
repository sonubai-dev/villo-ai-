import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { audioUrl, words, avatarImageUrl } = await req.json();

    // In a real production app, the bundling is done once during build time, 
    // but for local dev/testing, we bundle on the fly.
    const bundled = await bundle({
      entryPoint: path.resolve("./remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "ReelComposition",
      inputProps: { audioUrl, words, avatarImageUrl },
    });

    // Ensure exports directory exists
    const exportsDir = path.resolve("./public/exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const outputFileName = `reel-${Date.now()}.mp4`;
    const outputPath = path.join(exportsDir, outputFileName);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
    });

    return NextResponse.json({ success: true, videoUrl: `/exports/${outputFileName}` });
  } catch (error: any) {
    console.error("Remotion render error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

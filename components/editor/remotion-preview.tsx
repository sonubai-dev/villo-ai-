"use client";

import React from "react";
import { Player } from "@remotion/player";
import { ReelComposition } from "@/remotion/ReelComposition";

interface RemotionReelPreviewProps {
  audioUrl: string;
  words: Array<{ word: string; start: number; end: number }>;
  avatarImageUrl?: string;
}

export function RemotionReelPreview({ audioUrl, words, avatarImageUrl }: RemotionReelPreviewProps) {
  return (
    <div className="flex justify-center items-center py-6 w-full h-full bg-slate-900 rounded-2xl border border-slate-800">
      <Player
        component={ReelComposition}
        inputProps={{
          audioUrl,
          scriptText: "Create engaging social media reels without API costs!",
          words,
          avatarImageUrl
        }}
        durationInFrames={30 * 30} // 30 Seconds @ 30 FPS. Can be made dynamic.
        compositionWidth={1080}
        compositionHeight={1920}
        fps={30}
        style={{
          width: "auto",
          height: "100%",
          maxHeight: "70vh",
          aspectRatio: "9/16",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
        controls
        autoPlay
        loop
      />
    </div>
  );
}

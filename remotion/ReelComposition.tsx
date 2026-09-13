import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ReelProps {
  audioUrl: string;
  scriptText: string;
  words: Array<{ word: string; start: number; end: number }>;
  avatarImageUrl?: string;
  backgroundColor?: string;
}

export const ReelComposition: React.FC<ReelProps> = ({
  audioUrl,
  words,
  avatarImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
  backgroundColor = "#090d16",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Kinetic Camera Zoom Animation
  const scale = interpolate(Math.sin(frame / 15), [-1, 1], [1.0, 1.05]);

  return (
    <AbsoluteFill style={{ backgroundColor, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Background Audio */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Visual Avatar / Background Overlay */}
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        
        {/* Avatar Image */}
        <img
          src={avatarImageUrl}
          alt="Presenter"
          style={{ 
            transform: `scale(${scale})`, 
            width: "500px", 
            height: "500px", 
            borderRadius: "50%", 
            objectFit: "cover", 
            border: "10px solid #0ea5e9", // Tailwind sky-500
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            marginBottom: "60px"
          }}
        />

        {/* Dynamic Kinetic Captions (Word by Word highlight) */}
        <div style={{ padding: "0 40px", textAlign: "center", maxWidth: "800px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            {words.map((w, idx) => {
              const isActive = currentTime >= w.start && currentTime <= w.end;
              return (
                <span
                  key={idx}
                  style={{
                    fontSize: "64px",
                    fontWeight: 900,
                    transition: "all 0.1s ease",
                    color: isActive ? "#facc15" : "white", // yellow-400 vs white
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    textDecoration: isActive ? "underline" : "none",
                    textDecorationColor: "#0ea5e9",
                    opacity: isActive ? 1 : 0.7,
                    fontFamily: "sans-serif"
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

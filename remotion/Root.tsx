import { Composition } from "remotion";
import { ReelComposition } from "./ReelComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReelComposition"
        component={ReelComposition}
        durationInFrames={900} // 30 seconds @ 30fps
        fps={30}
        width={1080}
        height={1920} // 9:16 vertical
        defaultProps={{
          audioUrl: "",
          scriptText: "Welcome to Vilo AI API-Free Reels",
          words: [
            { word: "Welcome", start: 0, end: 0.5 },
            { word: "to", start: 0.5, end: 1.0 },
            { word: "Vilo", start: 1.0, end: 1.5 },
            { word: "AI", start: 1.5, end: 2.0 },
          ],
          avatarImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
          backgroundColor: "#090d16",
        }}
      />
    </>
  );
};

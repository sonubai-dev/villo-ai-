/**
 * Vilo V1 - Data-Driven Animation Engine
 * Standardized motion curves and transitions for text overlays and visual scenes.
 */

export type V1AnimationType = "fade" | "slide" | "zoom-in" | "zoom-out" | "pop";

export interface V1AnimationDefinition {
  id: V1AnimationType;
  name: string;
  description: string;
  cssInitial: React.CSSProperties;
  cssActive: React.CSSProperties;
  transitionString: string;
}

export const V1_ANIMATIONS: Record<V1AnimationType, V1AnimationDefinition> = {
  fade: {
    id: "fade",
    name: "Smooth Fade",
    description: "Gentle opacity dissolve",
    cssInitial: { opacity: 0, transform: "none" },
    cssActive: { opacity: 1, transform: "none" },
    transitionString: "opacity 0.4s ease-in-out",
  },
  slide: {
    id: "slide",
    name: "Slide In",
    description: "Horizontal entry from left",
    cssInitial: { opacity: 0, transform: "translateX(-40px)" },
    cssActive: { opacity: 1, transform: "translateX(0px)" },
    transitionString: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
  },
  "zoom-in": {
    id: "zoom-in",
    name: "Zoom In",
    description: "Scale forward toward camera",
    cssInitial: { opacity: 0, transform: "scale(0.85)" },
    cssActive: { opacity: 1, transform: "scale(1)" },
    transitionString: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
  },
  "zoom-out": {
    id: "zoom-out",
    name: "Zoom Out",
    description: "Scale backward into scene",
    cssInitial: { opacity: 0, transform: "scale(1.15)" },
    cssActive: { opacity: 1, transform: "scale(1)" },
    transitionString: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
  },
  pop: {
    id: "pop",
    name: "Pop In",
    description: "Energetic spring bounce",
    cssInitial: { opacity: 0, transform: "scale(0.7)" },
    cssActive: { opacity: 1, transform: "scale(1)" },
    transitionString: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
  },
};

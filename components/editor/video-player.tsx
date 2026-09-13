"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Grid,
  Gauge,
  Film,
  Monitor,
  Smartphone,
  Square
} from "lucide-react";
import { Project, Scene, MotionPreset, AspectRatio } from "@/lib/types";
import { SpeechEngine } from "@/lib/speech-engine";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";
import { MOCK_VOICES } from "@/lib/providers/mock/mock-voice";
import { formatTimecode } from "@/lib/utils";

interface VideoPlayerProps {
  project: Project;
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onUpdateAspectRatio?: (ratio: AspectRatio) => void;
}

export function VideoPlayer({
  project,
  activeSceneId,
  onSelectScene,
  onUpdateAspectRatio,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSafeGuides, setShowSafeGuides] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0) || 1;

  // Calculate current scene index based on playback time
  let accumulatedTime = 0;
  let currentSceneIndex = 0;
  for (let i = 0; i < project.scenes.length; i++) {
    const sc = project.scenes[i];
    if (currentTime >= accumulatedTime && currentTime < accumulatedTime + sc.duration) {
      currentSceneIndex = i;
      break;
    }
    accumulatedTime += sc.duration;
    if (i === project.scenes.length - 1) {
      currentSceneIndex = i;
    }
  }

  const currentScene = project.scenes[currentSceneIndex] || project.scenes[0];
  const selectedAvatar = MOCK_AVATARS.find((a) => a.id === currentScene.avatarId) || MOCK_AVATARS[0];
  const selectedVoice = MOCK_VOICES.find((v) => v.id === currentScene.voiceId) || MOCK_VOICES[0];

  // Calculate progress within current scene (0.0 to 1.0)
  let sceneStartTime = 0;
  for (let i = 0; i < currentSceneIndex; i++) {
    sceneStartTime += project.scenes[i].duration;
  }
  const sceneProgress = Math.min(1, Math.max(0, (currentTime - sceneStartTime) / (currentScene.duration || 1)));

  // Playback timer & Speech synchronization
  useEffect(() => {
    if (!isPlaying) {
      SpeechEngine.getInstance().stop();
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
      return;
    }

    // Play speech audio for current scene if not muted
    if (!isMuted && currentScene?.script) {
      SpeechEngine.getInstance().speak({
        text: currentScene.script,
        language: selectedVoice.language,
        gender: selectedVoice.gender,
        pitch: selectedVoice.pitch,
        rate: selectedVoice.rate * playbackSpeed,
        onBoundary: (charIndex) => {
          const wordsBefore = currentScene.script.slice(0, charIndex).split(/\s+/).length;
          setActiveWordIndex(wordsBefore);
        },
      });
    }

    // Interval to advance playhead
    const intervalTime = 100;
    const timeIncrement = 0.1 * playbackSpeed;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + timeIncrement;
        if (next >= totalDuration) {
          setIsPlaying(false);
          SpeechEngine.getInstance().stop();
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      clearInterval(interval);
      SpeechEngine.getInstance().stop();
    };
  }, [isPlaying, currentSceneIndex, isMuted, playbackSpeed, totalDuration]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const words = currentScene.script.split(/\s+/).filter(Boolean);

  // Compute CSS Transform for all 9 Motion Presets + user custom zoom/pan/rotation
  const motionPreset: MotionPreset = currentScene.motionPreset || (currentScene.cameraEffect as MotionPreset) || "zoom-in";
  const userZoom = currentScene.zoom ?? 1.0;
  const userPanX = currentScene.panX ?? 0;
  const userPanY = currentScene.panY ?? 0;
  const userRotation = currentScene.rotation ?? 0;
  const motionStrength = (currentScene.motionStrength ?? 75) / 100;

  let dynamicScale = userZoom;
  let dynamicTranslateX = userPanX;
  let dynamicTranslateY = userPanY;
  let dynamicRotation = userRotation;

  switch (motionPreset) {
    case "zoom-in":
      dynamicScale = userZoom * (1 + sceneProgress * 0.22 * motionStrength);
      break;
    case "zoom-out":
      dynamicScale = userZoom * (1.25 - sceneProgress * 0.22 * motionStrength);
      break;
    case "pan-left":
      dynamicTranslateX = userPanX - sceneProgress * 15 * motionStrength;
      dynamicScale = userZoom * 1.08;
      break;
    case "pan-right":
      dynamicTranslateX = userPanX + sceneProgress * 15 * motionStrength;
      dynamicScale = userZoom * 1.08;
      break;
    case "pan-up":
      dynamicTranslateY = userPanY - sceneProgress * 15 * motionStrength;
      dynamicScale = userZoom * 1.08;
      break;
    case "pan-down":
      dynamicTranslateY = userPanY + sceneProgress * 15 * motionStrength;
      dynamicScale = userZoom * 1.08;
      break;
    case "slow-zoom":
      dynamicScale = userZoom * (1 + sceneProgress * 0.06 * motionStrength);
      break;
    case "cinematic-push":
      dynamicScale = userZoom * (1 + sceneProgress * 0.32 * motionStrength);
      dynamicTranslateY = userPanY - sceneProgress * 4 * motionStrength;
      dynamicRotation = userRotation + sceneProgress * 1.5 * motionStrength;
      break;
    case "cinematic-pull":
      dynamicScale = userZoom * (1.35 - sceneProgress * 0.32 * motionStrength);
      dynamicTranslateX = userPanX + sceneProgress * 3 * motionStrength;
      dynamicRotation = userRotation - sceneProgress * 1.0 * motionStrength;
      break;
    case "none":
    default:
      dynamicScale = userZoom;
      break;
  }

  // Aspect ratio class
  const aspectClass =
    project.aspectRatio === "9:16"
      ? "aspect-[9/16] max-h-[560px] mx-auto w-auto"
      : project.aspectRatio === "1:1"
      ? "aspect-square max-h-[560px] mx-auto w-auto"
      : project.aspectRatio === "4:5"
      ? "aspect-[4/5] max-h-[560px] mx-auto w-auto"
      : "aspect-video w-full max-h-[560px]";

  const overlayTextContent = currentScene.textOverlay?.content || currentScene.overlayText;

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col items-center justify-center p-4 bg-slate-950/60 overflow-hidden relative"
    >
      {/* Top Floating Mini Controls */}
      <div className="mb-2 flex w-full max-w-2xl items-center justify-between px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Film className="h-3.5 w-3.5 text-sky-400" />
            <span>
              Scene {currentSceneIndex + 1}/{project.scenes.length}: {currentScene.title || "Scene"}
            </span>
          </span>
          <span className="font-mono text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 capitalize">
            {motionPreset.replace("-", " ")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Guides Toggle */}
          <button
            onClick={() => setShowSafeGuides(!showSafeGuides)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors border ${
              showSafeGuides
                ? "border-sky-500 bg-sky-500/15 text-sky-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
            title="Toggle Safe Framing Grid"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guides</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
            {[1.0, 1.5, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
                  playbackSpeed === spd ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Video Canvas Screen */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ${aspectClass}`}
      >
        {/* Background Visual Layer with Real-time Camera Transforms */}
        <div
          className="h-full w-full overflow-hidden flex items-center justify-center pointer-events-none"
          style={{ perspective: "1000px" }}
        >
          <img
            src={currentScene.image}
            alt={currentScene.title || "Scene"}
            style={{
              transform: `scale(${dynamicScale}) translate(${dynamicTranslateX}%, ${dynamicTranslateY}%) rotate(${dynamicRotation}deg)`,
              transformOrigin: "center center",
              transition: isPlaying ? "none" : "transform 0.3s ease-out",
            }}
            className={`h-full w-full ${currentScene.imageFit === "contain" ? "object-contain" : "object-cover"}`}
          />
        </div>

        {/* Transition Overlays */}
        {sceneProgress < 0.12 && currentScene.transition === "fade" && (
          <div className="absolute inset-0 bg-black animate-in fade-out duration-300 pointer-events-none" />
        )}
        {sceneProgress < 0.12 && currentScene.transition === "glitch" && (
          <div className="absolute inset-0 bg-sky-500/20 backdrop-invert animate-pulse pointer-events-none mix-blend-difference" />
        )}

        {/* Safe Frame Guidelines Overlay */}
        {showSafeGuides && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-sky-400/30">
            <div className="border-r border-b border-sky-400/20" />
            <div className="border-r border-b border-sky-400/20" />
            <div className="border-b border-sky-400/20" />
            <div className="border-r border-b border-sky-400/20" />
            <div className="border-r border-b border-sky-400/20" />
            <div className="border-b border-sky-400/20" />
            <div className="border-r border-sky-400/20" />
            <div className="border-r border-sky-400/20" />
            <div />
            {/* Title Safe Boundary */}
            <div className="absolute inset-6 border border-dashed border-sky-400/40 rounded-xl" />
          </div>
        )}

        {/* Custom Text Overlay Rendering */}
        {overlayTextContent && (
          <div
            className={`absolute px-4 pointer-events-none ${
              currentScene.textOverlay?.position === "bottom"
                ? "bottom-16 inset-x-0 text-center"
                : currentScene.textOverlay?.position === "center"
                ? "top-1/2 -translate-y-1/2 inset-x-0 text-center"
                : "top-4 inset-x-0 text-center"
            }`}
          >
            <span
              className="inline-block rounded-xl px-4 py-2 backdrop-blur-md shadow-2xl font-bold border border-white/10"
              style={{
                fontFamily: currentScene.textOverlay?.fontFamily || "inherit",
                backgroundColor: currentScene.textOverlay?.backgroundColor || "rgba(0,0,0,0.75)",
                color: currentScene.textOverlay?.textColor || "#ffffff",
                fontSize:
                  currentScene.textOverlay?.fontSize === "hero"
                    ? "1.5rem"
                    : currentScene.textOverlay?.fontSize === "large"
                    ? "1.25rem"
                    : "0.95rem",
              }}
            >
              {overlayTextContent}
            </span>
          </div>
        )}

        {/* AI Presenter Placement Layer */}
        {currentScene.showAvatar && (
          <>
            {currentScene.avatarLayout === "fullscreen-presenter" ? (
              <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center pointer-events-none">
                <img
                  src={selectedAvatar.previewImage}
                  alt={selectedAvatar.name}
                  className={`h-full w-full object-cover ${isPlaying ? "animate-talking-head" : ""}`}
                />
              </div>
            ) : currentScene.avatarLayout === "side-by-side-left" ? (
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-slate-950/60 border-r border-white/10 overflow-hidden pointer-events-none">
                <img
                  src={selectedAvatar.previewImage}
                  alt={selectedAvatar.name}
                  className={`h-full w-full object-cover ${isPlaying ? "animate-talking-head" : ""}`}
                />
              </div>
            ) : currentScene.avatarLayout === "side-by-side-right" ? (
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-slate-950/60 border-l border-white/10 overflow-hidden pointer-events-none">
                <img
                  src={selectedAvatar.previewImage}
                  alt={selectedAvatar.name}
                  className={`h-full w-full object-cover ${isPlaying ? "animate-talking-head" : ""}`}
                />
              </div>
            ) : currentScene.avatarLayout === "circle-bottom-left" ? (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-2xl border border-sky-400/50 bg-slate-950/85 p-1.5 shadow-2xl backdrop-blur-md">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-sky-400">
                  <img
                    src={selectedAvatar.previewImage}
                    alt={selectedAvatar.name}
                    className={`h-full w-full object-cover ${isPlaying ? "animate-talking-head" : ""}`}
                  />
                </div>
              </div>
            ) : (
              // Default circle bottom right
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl border border-sky-400/50 bg-slate-950/85 p-1.5 shadow-2xl backdrop-blur-md">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-sky-400">
                  <img
                    src={selectedAvatar.previewImage}
                    alt={selectedAvatar.name}
                    className={`h-full w-full object-cover ${isPlaying ? "animate-talking-head" : ""}`}
                  />
                  <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Dynamic Karaoke Captions Overlay */}
        {currentScene.script && (
          <div
            className={`absolute left-4 right-24 ${
              currentScene.captions?.position === "top"
                ? "top-14"
                : currentScene.captions?.position === "center"
                ? "top-1/2 -translate-y-1/2"
                : "bottom-4"
            } pointer-events-none`}
          >
            <div className="rounded-xl bg-black/80 px-3.5 py-2 backdrop-blur-md border border-white/10 text-left max-w-lg shadow-2xl">
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-white">
                {words.map((word, idx) => {
                  const isHighlighted = idx <= Math.floor(sceneProgress * words.length);
                  return (
                    <span
                      key={idx}
                      className={`inline-block mr-1 transition-colors duration-150 ${
                        isHighlighted
                          ? "text-sky-400 font-bold underline decoration-sky-400 decoration-2 underline-offset-2"
                          : "text-slate-300 opacity-90"
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="mt-3 flex w-full max-w-2xl items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 backdrop-blur-xl shadow-xl">
        {/* Play & Restart */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayToggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-colors"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
          </button>
          <button
            onClick={handleRestart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Restart playback"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Timecode */}
        <span className="font-mono text-xs text-slate-300 min-w-[95px]">
          {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
        </span>

        {/* Scrubber Progress Bar */}
        <div className="flex-1 mx-2">
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-sky-400 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${
                (currentTime / totalDuration) * 100
              }%, #1e293b ${(currentTime / totalDuration) * 100}%, #1e293b 100%)`,
            }}
          />
        </div>

        {/* Audio Mute & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`rounded-lg p-1.5 transition-colors ${isMuted ? "text-rose-400 bg-rose-500/10" : "text-slate-400 hover:text-white"}`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

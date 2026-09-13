"use client";

import React, { useState } from "react";
import { RemotionReelPreview } from "@/components/editor/remotion-preview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Video, Download, Sparkles, AudioLines, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CreateReelPage() {
  const [scriptText, setScriptText] = useState("Welcome to Vilo AI. Create engaging zero API cost social media reels instantly!");
  const [avatarImageUrl, setAvatarImageUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600");
  const [isExporting, setIsExporting] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  // Mock function to generate word timings based on text
  const generateMockTimings = (text: string) => {
    const words = text.split(" ").filter(w => w.length > 0);
    return words.map((word, index) => ({
      word,
      start: index * 0.4, // Each word takes 0.4s
      end: (index * 0.4) + 0.4,
    }));
  };

  const wordTimings = generateMockTimings(scriptText);

  const handleExport = async () => {
    setIsExporting(true);
    setExportedVideoUrl(null);
    try {
      const res = await fetch("/api/render/remotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: "", // Assuming local TTS/audio is injected or generated later
          words: wordTimings,
          avatarImageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setExportedVideoUrl(data.videoUrl);
      } else {
        alert("Export failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Render failed. Make sure Remotion is properly set up.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] p-4 flex flex-col lg:flex-row gap-6">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
        <div>
          <Badge variant="glow" className="mb-2">API-Free Engine</Badge>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-sky-400" /> Reel Studio
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Create dynamic 9:16 vertical videos using Remotion. Zero third-party API costs.
          </p>
        </div>

        {/* Script Section */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AudioLines className="h-4 w-4 text-sky-400" />
            Script & Captions
          </h3>
          <Textarea 
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            className="bg-slate-950 border-slate-700 min-h-[120px] text-white"
            placeholder="Type your script here..."
          />
          <p className="text-xs text-slate-500">
            Captions are auto-synced dynamically. For real audio, integrate your local Android TTS or Edge-TTS.
          </p>
        </div>

        {/* Visuals Section */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-400" />
            Presenter Image / Video
          </h3>
          <Input 
            value={avatarImageUrl}
            onChange={(e) => setAvatarImageUrl(e.target.value)}
            className="bg-slate-950 border-slate-700 text-white"
            placeholder="Paste image URL..."
          />
        </div>

        {/* Actions */}
        <div className="mt-auto pt-6 space-y-4">
          <Button 
            variant="glow" 
            className="w-full h-12 text-lg font-bold shadow-lg shadow-sky-500/20"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Sparkles className="h-5 w-5" /> Rendering Reel...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-5 w-5" /> Export MP4
              </span>
            )}
          </Button>

          {exportedVideoUrl && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-center">
              <p className="text-sm text-emerald-400 font-bold mb-2">Video Rendered Successfully!</p>
              <a href={exportedVideoUrl} download>
                <Button variant="outline" className="w-full border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/40">
                  Download Reel
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Remotion Live Preview */}
      <div className="w-full lg:w-2/3 h-full flex flex-col bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-md border-white/10">Live Canvas (60 FPS)</Badge>
        </div>
        <div className="flex-1 w-full h-full p-4 flex items-center justify-center">
          <RemotionReelPreview 
            audioUrl="" 
            words={wordTimings} 
            avatarImageUrl={avatarImageUrl}
          />
        </div>
      </div>
      
    </div>
  );
}

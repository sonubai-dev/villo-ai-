# Vilo AI — Architecture & Engineering Specification

> **Platform Focus**: Dedicated **AI Avatar Video Creation Platform**  
> **Core Purpose**: Produce high-converting presenter videos by seamlessly composing:  
> `AI Avatar + Script + Neural/Cloned Voice + Lip Sync + Deterministic Motion + Motion Graphics + VFX + Captions + Decoupled Background + Camera Transforms = Final Video`

---

## 1. Product Structure & Routing

The application shell has been restructured to strictly focus on AI Avatar Video generation:

```
Vilo AI
├── Dashboard          (/dashboard)   — Avatar studio command center & quick launch
├── Create Video       (/create)      — Flagship 8-step guided creation flow
├── Projects           (/projects)    — Project system & scene editor workspace
├── Avatars            (/avatars)     — Photorealistic presenter catalog (9 categories)
├── Voices             (/voices)      — Neural voice catalog & ElevenLabs cloning studio
├── Templates          (/templates)   — High-converting avatar video frameworks
└── Settings           (/settings)    — API keys, account configuration, and credits
```

Legacy, unrelated tools (generic image splitter, slide converter, generic presentation generators) have been removed from the navigation and menus.

---

## 2. Flagship 8-Step Create Video Flow

The core creation wizard at `/create` is designed for creators, marketers, businesses, and agencies:

```
Step 1: Choose Avatar
  └─ Select from 9 business categories: Business, Creator, Education, Marketing, 
     Fashion, Fitness, Real Estate, Technology, Professional.
  └─ Actions: Preview speech, Select avatar, Upload Avatar, Create Custom Avatar.

Step 2: Write Script
  └─ Real-time duration estimator (~2.3 words/second).
  └─ Duration presets: 10s, 15s, 20s, 30s, 60s.
  └─ AI Assistant: Generate, Rewrite, Shorten, Expand.
  └─ Tone switcher: Professional, Casual, Energetic, Educational, Storytelling, Promotional.

Step 3: Choose Voice
  └─ Sections: Default Neural Voices and My Cloned Voices.
  └─ Providers: ElevenLabs, neural TTS, self-hosted TTS abstraction.
  └─ Live voice testing console with adjustable playback rate.

Step 4: Choose Motion
  └─ 14 Deterministic presets: Natural Talking, Professional Presenter, Head Movement,
     Hand Gesture, Dynamic, Cinematic, Zoom In, Zoom Out, Pan, Push, Pull,
     Floating, Energetic, Social Media.
  └─ Zero AI API calls for basic camera transforms.

Step 5: Add Visuals & Background
  └─ Modes: Solid Color, Cyber Gradient, High-res Image, Video, AI Background.
  └─ Decoupled layer: Background can be swapped without regenerating avatar video.

Step 6: Add VFX / Motion Graphics & Captions
  └─ Formats: 9:16 (Reels/TikTok/Shorts), 16:9 (YouTube/LinkedIn), 1:1 (Square).
  └─ VFX: Glow, Particles, Light Leak, Flash, Lens Flare, Smoke, Energy, Glitch,
     Film Grain, Blur, Vignette.
  └─ Motion Graphics: Kinetic Text, Lower Third, CTA, Title, Highlight, Word Pop,
     Typewriter, Callout, Shapes, Arrows, Social Handle.
  └─ Captions: Minimal, Bold, Highlight, Word Pop, Kinetic, Professional.

Step 7: Live Preview
  └─ Lightweight multi-layer composite canvas previewing Avatar + Voice +
     Motion transforms + Background + Overlays + Captions in real time.

Step 8: Generate Video
  └─ Executes provider-agnostic pipeline with progress reporting.
  └─ Low-cost hash caching prevents duplicate rendering.
  └─ Automatically creates project in Project System for subsequent fine-tuning.
```

---

## 3. Low-Cost Hash Caching Architecture

To minimize cloud computing costs and latency, Vilo implements deterministic content hashing (`services/avatar-studio/caching/avatar-cache-service.ts`):

```
Voice Hash    = Hash(text + voiceId + speed + pitch)
Avatar Hash   = Hash(avatarId + duration + aspectRatio)
LipSync Hash  = Hash(avatarHash + voiceHash)
```

### Invalidation Matrix:
| Property Modified | Voice Regenerated? | Avatar Regenerated? | Lip-Sync Regenerated? | Compositing Pass |
|---|:---:|:---:|:---:|:---:|
| **Script / Narration** | **YES** | NO | **YES** | Full Re-render |
| **Voice Model / Rate** | **YES** | NO | **YES** | Full Re-render |
| **Avatar Model** | NO | **YES** | **YES** | Full Re-render |
| **Duration / Aspect Ratio** | **YES** | **YES** | **YES** | Full Re-render |
| **Background (Color/Image)** | **NO (Cached)** | **NO (Cached)** | **NO (Cached)** | Fast Composite Only |
| **Camera Motion Preset** | **NO (Cached)** | **NO (Cached)** | **NO (Cached)** | Transform Re-calc Only |
| **VFX (Glow/Particles/etc.)** | **NO (Cached)** | **NO (Cached)** | **NO (Cached)** | Shader/Blend Pass Only |
| **Captions Style / Font** | **NO (Cached)** | **NO (Cached)** | **NO (Cached)** | Text Overlay Pass Only |
| **Call-To-Action Text** | **NO (Cached)** | **NO (Cached)** | **NO (Cached)** | Overlay Pass Only |

---

## 4. Deterministic Motion & VFX Library

### A. 14 Motion Presets (`lib/avatar/motion-presets.ts`)
Camera and gesture effects execute via GPU-accelerated CSS and Canvas matrices without triggering third-party AI video diffusion APIs:
1. **Natural Talking**: Subtle micro-movements, breathing cycle, and gentle gaze drift.
2. **Professional Presenter**: Poised keynote stance with measured head nods.
3. **Head Movement**: Conversational head tilt synchronized to speech cadence.
4. **Hand Gesture**: Expressive hand cadence on script emphasis keywords.
5. **Dynamic**: Multi-angle punch-ins on punchlines and transitions.
6. **Cinematic**: Steadicam floating dolly with soft 2.5D optical parallax.
7. **Zoom In**: Smooth continuous slow push focusing attention on speaker.
8. **Zoom Out**: Gradual reveal pulling out to expose full background.
9. **Pan**: Horizontal slide framing across the video canvas.
10. **Push**: Sharp forward camera shove timed to emphasize bold claims.
11. **Pull**: Dramatic backward snap creating distance before a CTA.
12. **Floating**: Weightless handheld drone sensation with sinusoidal damping.
13. **Energetic**: Fast-paced creator motion with frequent micro-zooms.
14. **Social Media**: Optimized for 9:16 vertical feeds with hook punch-in at 2.5s.

### B. 11 VFX Presets (`lib/avatar/vfx-presets.ts`)
- `Glow` (Screen), `Particles` (Screen), `Light Leak` (Screen), `Flash` (Screen), `Lens Flare` (Screen), `Smoke` (Screen), `Energy` (Screen), `Glitch` (Overlay), `Film Grain` (Overlay), `Blur` (Normal), `Vignette` (Normal).
- Controllable: Intensity (0–100%), Opacity, Duration, Position, Scale.

### C. 11 Motion Graphic Presets (`lib/avatar/vfx-presets.ts`)
- `Kinetic Text`, `Lower Third`, `CTA Button`, `Bold Title`, `Text Highlight`, `Word Pop`, `Typewriter`, `Callout Badge`, `Animated Shapes`, `Focus Arrows`, `Social Handle`.

---

## 5. Provider-Agnostic Abstraction Layer

The pipeline is completely decoupled from any single AI vendor:

```
               ┌───────────────────────────────┐
               │    Vilo AI Studio Pipeline    │
               └───────────────┬───────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ VoiceProvider│       │AvatarProvider│       │LipSyncProvider
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       ├─ ElevenLabs          ├─ HeyGen              ├─ LivePortrait
       ├─ OpenAI TTS          ├─ D-ID                ├─ SadTalker
       └─ Mock/Internal       └─ Mock/Internal       └─ Mock/Internal
```

---

## 6. Verification & Quality Assurance Summary

- **Avatar Platform Test Suite (`scripts/test-avatar-platform-pipeline.ts`)**:
  - **53 / 53 Tests Passing (100%)** covering avatar catalog, motion transforms, VFX blends, deterministic caching, and pipeline executions.
- **TypeScript Typecheck (`npx tsc --noEmit`)**:
  - **0 Errors**.
- **Next.js Production Build (`npm run build`)**:
  - **43 / 43 Routes Compiled Cleanly**.

---

## 7. Remaining Work & Future Roadmap (V3)

1. **Self-Hosted Lip-Sync Service**:
   - Deploying open-source Wav2Lip / LivePortrait on GPU worker pods (AWS EC2 G5 / Modal Labs) to reduce API costs to <$0.005 per video minute.
2. **Real-time WebRTC Avatar Streaming**:
   - Low-latency interactive avatar conversations for live sales demos and customer support widgets.
3. **Automated B-Roll Insertion**:
   - Keyword-triggered stock footage cutaways during avatar speech.

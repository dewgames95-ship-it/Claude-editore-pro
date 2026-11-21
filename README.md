# Claude Editor Pro

Claude Code se AI video editing. Reference video do, apni voice/aroll do (ya AI voice), Claude edit karke final MP4 dega.

---

## ⚡ Quick start (har naye session me)

| Situation | Kya karna hai |
|---|---|
| Wahi purana session, kuch ghante baad | Kuch nahi, seedha kaam bolo |
| Wahi session, 2+ din baad / `/clear` ke baad / naya session | Claude ko bolo: **"bash setup.sh chalao"** (~10 sec - 2 min) |
| Environment me auto setup script save hai | Kuch nahi, session start par khud chalta hai |

Phir bas:
1. Chat me **reference video** + **apni voice / aroll** attach karo (GitHub push zaroori nahi)
2. Bolo: *"Purane reference/aroll delete karo, ye naye daalo, isi style me mera video [topic] par banao"*
3. Claude: analyse → script → voice → animation → SFX → captions → `out/final.mp4` deta hai

---

## 📁 Folder structure

```
Claude-editore-pro/
├── setup.sh                 # Ek command setup
├── tools/
│   ├── voice.sh             # Free AI voice-over (Edge TTS)
│   ├── image.sh             # Free AI images (Pollinations)
│   └── sfx.sh               # SFX generate (ffmpeg)
├── video-edit/              # Remotion project (reels, 720x1280 @ 30fps)
│   ├── public/reference/    # Reference videos
│   ├── public/aroll/        # Aapke talking-head shots
│   ├── public/Voice over/   # Voice-over audio
│   ├── public/sfx/          # whoosh, pop, click, riser, bass-hit
│   ├── src/                 # Compositions (Claude likhta hai)
│   ├── transcribe.mjs       # Whisper captions
│   └── out/                 # Final renders (git me nahi jata)
├── claude-intro/ claude-long/ claude-short/   # HyperFrames tutorial videos (4:3)
├── claude-edit-prompts.md   # 4-step prompt sheet
├── demo/                    # Demo video + voice sample
└── .claude/skills/          # Remotion + tutorial-video skills
```

---

## 🧰 Tools (sab free, koi API key nahi)

| Kaam | Tool | Command |
|---|---|---|
| Voice-over | Edge TTS 7.x | `bash tools/voice.sh script.txt "video-edit/public/Voice over/vo.mp3" hi-IN-MadhurNeural` |
| AI images | Pollinations | `bash tools/image.sh "prompt" video-edit/public/images/1.jpg` |
| SFX | ffmpeg | `bash tools/sfx.sh` |
| Captions | Whisper.cpp (medium, Hinglish) | `cd video-edit && npm run transcribe -- public/aroll/clip.mp4` |
| Preview | Remotion Studio | `cd video-edit && npm run dev` (local PC) |
| Render 720p | Remotion 4.0.545 | `cd video-edit && npm run render` |
| Render 1080p | Remotion | `cd video-edit && npm run render:1080` |
| Tutorial videos | HyperFrames 0.9.77 | `cd claude-long && npm run render` |

Voices: `hi-IN-MadhurNeural` (male), `hi-IN-SwaraNeural` (female), `en-IN-PrabhatNeural`, `en-IN-NeerjaNeural`

---

## ⚙️ Setup details

`bash setup.sh` ye karta hai:
1. edge-tts install/update
2. Cloud proxy certificate fix (sirf cloud me)
3. `video-edit` me `npm install`
4. SFX generate

Whisper model (1.5GB) pehli baar `npm run transcribe` par khud download hota hai. Pehle se chahiye toh: `bash setup.sh --whisper`

Cloud me render ke liye pre-installed Chromium auto-detect hota hai (`remotion.config.ts`). Local PC par Remotion apna browser download karta hai.

---

## 📤 Files kaise doon

| Tarika | Kab use karo |
|---|---|
| Chat me attach | Chhoti files (reference clips, voice). Claude khud sahi folder me daalta hai |
| GitHub push | Badi files (100MB tak per file). `video-edit/public/...` me |
| Google Drive link (public) | Bahut badi files |

⚠️ Cloud container 1-2 din me reset hota hai. Final video chahiye toh session me hi download kar lo, ya Claude ko bolo `demo/` ya `renders/` me push kare.

---

## 🆕 Naye repo me same setup

1. Is repo ko GitHub par **Template** bana do (Settings → General → Template repository ✅)
2. Naya repo: **Use this template** → naam do → create
3. Naye repo ke saath session kholo → "bash setup.sh chalao"

Ya naye repo ke session me bolo: *"dewgames95-ship-it/Claude-editore-pro se setup copy karo"*

---

## 💻 Local PC (Mac/Windows) par

1. Node.js 22+, FFmpeg, Python 3, Git install karo
2. Claude desktop app → Claude Code → is folder ko open karo
3. `bash setup.sh` (Windows par Git Bash me)
4. `cd video-edit && npm run dev` se live preview

---

## 🎬 Example: "Never Waste a Lead" video (`demo/lead-agents-final.mp4`)

Reference reel se same topic + style me banaya, 1080x1920, 64 sec. Steps jo Claude ne kiye:
1. Reference ko `public/reference/` me rakha, contact sheets (1 frame/sec) + Whisper transcript se topic aur style samjha
2. Hinglish script likhi (7 scenes), har scene ki voice Edge TTS (`hi-IN-MadhurNeural`, +12% speed) se → `public/Voice over/*.mp3`
3. Scene durations voice length se auto (`src/scenes.json`)
4. `src/LeadVideo.tsx`: dark dotted bg, neon node network, Claude orb center, har agent par camera zoom, chat/call/invoice cards, stamps, 3-word captions with keyword color
5. SFX (whoosh har scene, pop/click/bass-hit) + ffmpeg se bana ambient music `public/music/bg.mp3`
6. `npx remotion render LeadVideo out/final.mp4 --scale=1.5`

**Naye user ke liye same cheez:** repo template se copy → session kholo → reference + topic chat me do → bolo *"isi style me, Hinglish TTS voice, SFX, music ke saath final MP4 banao"*.

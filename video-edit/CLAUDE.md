# Video Edit (Remotion)

## Folders
- `public/reference/`: reference videos (style copy karna hai)
- `public/aroll/`: talking-head shots, beech-beech me use karo jahan zarurat ho
- `public/Voice over/`: voice-over audio
- `src/`: Remotion compositions
- `out/`: final renders

## Rules
- Default: vertical 720x1280, 30fps
- Pehle reference videos ka cut detection + contact sheets banao, style notes likho, phir scene-by-scene animate karo
- Assets `staticFile()` se load karo
- Cloud me render ke liye kuch extra nahi chahiye (config me Chromium auto-detect)
- Voice: `bash ../tools/voice.sh`, Images: `bash ../tools/image.sh`, SFX: `public/sfx/`
- Captions: `npm run transcribe -- <video>`
- Remotion skills use karo (`.claude/skills/`)

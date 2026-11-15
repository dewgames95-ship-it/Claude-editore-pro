---
name: pro-tutorial-video
description: Make Professor-of-How style tutorial, launch and intro videos in 4:3 with always-on captions, zoom callouts and 10-20s avatar recap breaks after each step. Use for any video in claude-intro, claude-short or claude-long.
---

# Pro Tutorial Video

## Format
- 4:3, 1440x1080, 30fps, MP4 (H.264 + AAC)
- Captions always on, word highlight, max 2 lines, 48px+, mobile readable
- Safe margins 80px; text holds at least 1.5s on screen

## Style (Professor of How vibe)
- Clean white/dark background, 1 accent color, 1 font (Inter)
- Calm pacing, smooth ease-out moves, no bouncy or cheesy effects
- Zoom-in + highlight box on every UI click being explained
- Arrow / circle callouts, step number badge top-left

## Video types
- intro: 10-20s logo + title sting
- short: ~60s, hook in first 3s, 4-6 fast scenes, CTA at end
- long: ~5min, chapters; after each step add a 10-20s recap:
  1) What just happened  2) What's next  3) One tip
  Recap = avatar clip (avatar_XX.mp4) or animated explainer card if no avatar

## Inputs
- User gives: cut raw clip + own MP3 voiceover (+ avatar clips later)
- Sync audio to clip; captions from MP3 via whisper (word timestamps)

## Work loop
1. Read script_*.md + MOTION.md
2. Build one scene, render still, get approval
3. Build rest, one composition per scene
4. Apply timestamped feedback, re-render only changed scenes
5. Final render to /out

## Languages
- Keep text in script_en.md / script_zh.md / script_hi.md
- Language swap = new script file + new MP3 + regenerate captions; keep the design the same

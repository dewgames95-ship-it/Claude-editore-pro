# MOTION.md — Signal Follow Bot video system

One look for all three projects (claude-intro, claude-short, claude-long). Engine: HyperFrames (HTML + GSAP).

## Canvas
- 1440x1080 (4:3), 30 fps, MP4 H.264 + AAC
- Safe margin 80 px on every side. Nothing important outside x 80..1360, y 50..1030

## Colour (one accent only)
| Token | Value | Use |
| --- | --- | --- |
| --ground | #F5F3EE | page background (warm white) |
| --ink | #15171C | all main text |
| --muted | #5B616E | secondary text, future caption words |
| --line | #E2DED3 | hairlines, card borders |
| --card | #FFFFFF | cards, caption bar, lower-thirds |
| --accent | #2563EB | badge, highlight box, active caption word, arrows |
| --accent-soft | #DCE7FF | accent tints behind icons and numbers |
| --stage | #0F1218 | the dark panel behind the phone recording |

No second accent. No gradients on text. Shadows: 0 12px 40px rgba(21,23,28,.10) only.

## Type (Inter only)
| Role | Size / weight |
| --- | --- |
| Title card headline | 92 / 900, letter-spacing -0.03em |
| Chapter title | 84 / 900 |
| Step title (left column) | 58 / 900, line-height 1.05 |
| Bullets | 34 / 700 (current), 34 / 400 --muted (earlier ones) |
| Step badge | 26 / 700, uppercase, letter-spacing 0.08em |
| Lower-third title / sub | 32 / 700, 26 / 400 |
| Captions | 52 / 700 (never below 48) |
| Recap labels | 24 / 700 uppercase accent; recap body 40 / 700 |

## Layout — tutorial step (claude-long)
- Left column x 80..600: step badge top-left (y 60), step title (y 130), bullets below, lower-third at the bottom of the column (ends at y 880)
- Stage (phone recording) x 660..1360, y 50..900, radius 36, --stage background. The recording sits centred at rest (850 px tall)
- Captions: one centred group, bar bottom edge at y 1020, never taller than 2 lines

## Motion
- Enter: 0.5 s, power3.out, opacity 0→1 plus 28 px rise (never more than 40 px)
- Exit: 0.3 s, power2.in, opacity only
- Camera zoom on the stage: 0.6 s power2.inOut in, hold, 0.6 s out. Scale 1.5 to 1.6 on the click being explained
- Highlight box: 4 px accent outline, radius 12, draws in 0.3 s after the zoom lands; a soft accent arrow/label is optional
- Text holds at least 1.5 s. One new thing at a time
- Never: bounce, elastic, back eases, spins, shakes, glows, emoji confetti

## Captions
- Always on while someone speaks. Source: assets/transcript.json (whisper word timestamps)
- Groups of 3 to 6 words, break on sentence end or a pause of 0.15 s or more
- Current word: white text on an --accent pill. Spoken words: --ink. Upcoming words: --muted
- White bar sized to the text (radius 20, hairline border, soft shadow)

## Recap card (after every step, 10 to 20 s)
- Three blocks revealed in order: What just happened, What's next, Quick tip
- If assets/avatar_XX.mp4 exists the build puts it in the left slot (4:3, 560x420, radius 28) and the blocks move right. Without it the card is a full-width explainer card

## Privacy
- QR codes and keys in screen recordings are pixelated before they enter assets/. Never ship a readable API key or QR

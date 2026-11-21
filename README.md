# Claude Editor Pro

Claude Code se AI video editing (HyperFrames + Remotion skills).

## Folder structure
| Folder | Kya hai |
|---|---|
| `video-edit/` | Remotion project (video jaisa setup) |
| `video-edit/public/reference/` | Reference videos |
| `video-edit/public/aroll/` | Talking-head shots |
| `video-edit/public/Voice over/` | Voice-over audio |
| `video-edit/src/` | Compositions (720x1280 @ 30fps) |
| `claude-edit-prompts.md` | 4-step prompt sheet |
| `claude-intro/`, `claude-long/`, `claude-short/` | HyperFrames tutorial videos |
| `.claude/skills/` | Remotion skills |

## Setup (local)
1. Node.js 20+, FFmpeg, Git install karo
2. `npm i -g @anthropic-ai/claude-code`
3. Repo clone karo, `cd video-edit && npm install`, phir `claude` chalao
4. Preview: `npm run dev`, Render: `npm run render`
5. `/model` se model choose karo, permissions allow karo
6. Claude ko bolo: "check setup and install required tools"

## Workflow
1. Reference videos `public/reference/` me, talking shots `public/aroll/` me, audio `public/Voice over/` me
2. Claude ko bolo: "reference folder check karo, same style me edit karo, 30fps"
3. Claude cut detection + style notes banata hai, phir scene-by-scene Remotion me animate
4. `npm run render` se `out/final.mp4`

## Cloud (claude.ai/code) notes
✅ Same repo, same skills, same prompts kaam karte hain
⚠️ Bade videos (>100MB) Git me nahi jaate, Git LFS ya chhote clips use karo
⚠️ Container temporary hai: render ke baad commit + push karo

# Claude Editor Pro

Claude Code se AI video editing (HyperFrames + Remotion skills).

## Folder structure
| Folder | Kya hai |
|---|---|
| `claude-edit/` | Reference-video wala edit workflow |
| `claude-edit/reference/` | Reference video (jis style me edit chahiye) |
| `claude-edit/input/` | Apni raw video |
| `claude-edit/prompts/prompt-sheet.md` | 4-step prompts |
| `claude-edit/out/` | Final render |
| `claude-intro/` | Intro video (rendered) |
| `claude-long/` | Long tutorial (rendered) |
| `claude-short/` | Short video (setup only) |
| `.claude/skills/` | Remotion / tutorial-video skills |

## Setup (local)
1. Node.js 20+, FFmpeg, Git install karo
2. `npm i -g @anthropic-ai/claude-code`
3. Repo clone karo, folder me `claude` chalao
4. `/model` se model choose karo, permissions allow karo
5. Claude ko bolo: "check setup and install required tools"

## Workflow
1. Reference video `claude-edit/reference/` me daalo
2. `prompts/prompt-sheet.md` ke Step 2 se reference analyse karwao
3. Step 3 se apne video ke liye custom prompt banwao
4. Step 4: Claude Code render karega `claude-edit/out/` me

## Cloud (claude.ai/code) notes
✅ Same repo, same skills, same prompts kaam karte hain
⚠️ Bade videos (>100MB) Git me nahi jaate, Git LFS ya chhote clips use karo
⚠️ Container temporary hai: render ke baad commit + push karo

# SETUP.md: Claude Editor Pro (start to end)

> **Claude ke liye:** user jab bole *"setup complete karo"*, toh is file ke steps 1 se 4 tak khud chalao, bina dobara pooche. Phir short report do: kya ready hai, kya fail hua.

---

## 1. Setup (ek command)

```bash
bash setup.sh --full
```

Ye install karta hai:

| Tool | Kaam | Kahan |
|---|---|---|
| Node deps + Remotion 4.0.545 | Animation + render | `video-edit/node_modules` |
| Edge TTS | Main voices (Madhur, Andrew) | pip |
| auto-editor | Silence/pause auto-cut (jump cuts) | pip |
| ffmpeg | Cut, crop, convert, SFX banana | system (pehle se) |
| Whisper.cpp medium | Word-by-word captions (Hinglish) | `video-edit/whisper.cpp` |
| Kokoro TTS | Extra natural voices (optional) | `/opt/kokoro` (Python 3.12 venv) |
| rembg | Presenter cutout (background remove) | `/opt/kokoro` |
| espeak-ng | Kokoro Hindi ke liye | apt |
| SFX | whoosh, pop, click, riser, bass-hit | `video-edit/public/sfx` |

Fast setup (bina Kokoro/rembg/Whisper): `bash setup.sh`. Environment ki setup script har naye cloud session me ise khud chalati hai.

## 2. Check

```bash
cd video-edit && npx tsc --noEmit && npx remotion still MyVideo /tmp/t.png --frame=30
edge-tts --voice hi-IN-MadhurNeural --text "test" --write-media /tmp/v.mp3
auto-editor --version
/opt/kokoro/bin/python -c "import kokoro, rembg; print('ok')"
```

## 3. Folders

```
video-edit/public/reference/   reference videos (git me nahi jaate)
video-edit/public/aroll/       user ki talking-head / raw recording (git me nahi)
video-edit/public/presenter/   user ke cutouts (private, git me nahi)
video-edit/public/Voice over/  generated voices
video-edit/public/images/      AI background images
video-edit/public/sfx/ music/  sound
video-edit/out/                renders (git me nahi)
samples/voices/  (sirf Madhur + Andrew)   samples/styles/   saved samples
```

## 4. Report do user ko

---

## 🎙️ Voice rules (user ki pasand)

| Language | Voice | Command |
|---|---|---|
| **Hinglish / Hindi** | `hi-IN-MadhurNeural` (male) **default** | `edge-tts --voice hi-IN-MadhurNeural` |
| **English** | `en-US-AndrewMultilingualNeural` (male) | `edge-tts --voice en-US-AndrewMultilingualNeural` |

Baaki voices (Swara, Ava, Neerja, Kokoro) **use mat karo** jab tak user khud na bole. User apni voice-over de toh wahi use karo.

Tips:
- Hindi/Hinglish text Devanagari me likho, English words Roman me (`Claude Code से video बनाओ`)
- Speed `+10%` se `+18%`, silence trim on (`tools/make_voice.py` khud karta hai)

Kokoro try karna ho (user bole tab):
```bash
/opt/kokoro/bin/python tools/kokoro.py h hm_omega "हिंदी text" out.wav     # Hindi male
/opt/kokoro/bin/python tools/kokoro.py a am_michael "English text" out.wav  # English male
```

---

## 🎨 Style templates (`video-edit/src/`)

| # | Style | File / Composition | Ratio | Sample |
|---|---|---|---|---|
| 1 | Dark neon network, node graph, camera zoom | `LeadVideo.tsx` / `LeadVideo` | 9:16 | `samples/styles/01-neon-network-9x16.mp4` |
| 2 | Pastel product launch, blur word reveal | `SetupLaunch43.tsx` / `SetupLaunch43` | 4:3 | `samples/styles/02-pastel-launch-4x3.mp4` |
| 3 | Phone demo (Claude Code dark UI) + step tracker | `Setup34.tsx` / `Setup34` | 3:4 | `samples/styles/03-phone-demo-3x4.mp4` |
| 4 | News explainer: presenter cutout + navy/gold boxes | `MeVideo.tsx` / `MeVideo` | 16:9 | (sample nahi, user ki photos chahiye) |

**User kaise bole:** *"Style 3 me, topic X par, Madhur voice, 60 sec video banao"*

---

## 🔁 Workflow (jo is chat me hua, start to end)

1. **Reference analyse:** contact sheet (`ffmpeg -vf "fps=1,scale=300:-1,tile=6x4"`) + Whisper transcript → topic, style, pacing samjho
2. **Script:** scenes me todo (hook → steps → bonus → CTA), har scene 1-2 lines
3. **Voice:** `script.json` banao, phir:
   ```bash
   python3 tools/make_voice.py script.json "video-edit/public/Voice over/<name>" video-edit/src/scenes-<name>.json
   ```
4. **Visuals:** template copy karo (`cp src/Setup34.tsx src/<Name>.tsx`), scenes json import badlo, overlays edit karo, `Root.tsx` me Composition add karo
5. **Images (optional):** `bash tools/image.sh "prompt, no text" video-edit/public/images/x.jpg` (Pollinations, free; watermark crop ke liye `scale(1.12)`)
6. **Presenter cutout (user ki video ho toh):**
   ```bash
   /opt/kokoro/bin/python tools/cutout.py video-edit/public/aroll/me.mp4 video-edit/public/presenter 1,7,37
   ```
7. **Raw recording clean:** `auto-editor input.mp4 --margin 0.15s -o clean.mp4 --no-open`
8. **Preview check:** `npx remotion still <Comp> /tmp/f.png --frame=N --scale=0.4` (kai frames ka grid banake dekho)
9. **Render:** `npx remotion render <Comp> out/final.mp4 --scale=1.5 --crf=18`
10. **Deliver:** file user ko bhejo. **Output videos push mat karo.**

---

## ⚠️ Rules (user ke)

- Push sirf jab user bole. Output videos, reference videos aur user ki photos kabhi push mat karo
- Koi step 3 baar fail ho toh ruko aur batao kahan atke
- Concise Hinglish replies, end me "kya changed" + "aage kya"

## ❌ Jo try kiya, kaam nahi kiya

- **XTTS v2 voice clone:** torch/transformers version conflict (3 baar fail). Clone chahiye toh F5-TTS ya OpenVoice try karo
- **Lip-sync (Wav2Lip):** CPU par slow, try nahi kiya. Real face ke liye user se A-roll record karwao

## 🔑 Optional keys (quality badhane ke liye)

- Pexels API key: asli stock video clips
- Freesound API key: asli music/SFX

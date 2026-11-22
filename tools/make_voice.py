# Script JSON -> per-scene voice mp3 + scenes json with durations (silence trimmed)
# Usage: python3 tools/make_voice.py script.json "video-edit/public/Voice over/<name>" video-edit/src/scenes-<name>.json
# script.json: [{"id":"hook","rate":"+12%","tts":"हिंदी/Hinglish text (Devanagari best)","caption":"Roman caption"}, ...]
# Optional per item: "voice" (default hi-IN-MadhurNeural; English: en-US-AndrewMultilingualNeural)
import json, subprocess, sys, time, os
src, outdir, scenes = sys.argv[1:4]
os.makedirs(outdir, exist_ok=True)
res = []
for s in json.load(open(src)):
    raw = f"/tmp/{s['id']}.mp3"; f = f"{outdir}/{s['id']}.mp3"
    for _ in range(5):
        r = subprocess.run(["edge-tts", "--voice", s.get("voice", "hi-IN-MadhurNeural"), f"--rate={s.get('rate', '+12%')}", "--text", s["tts"], "--write-media", raw], capture_output=True)
        if r.returncode == 0: break
        time.sleep(3)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB,apad=pad_dur=0.05", "-b:a", "160k", f], check=True)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
    res.append({"id": s["id"], "caption": s["caption"], "dur": round(d, 2)})
json.dump(res, open(scenes, "w"), indent=1)
print("total", round(sum(x["dur"] for x in res), 1), "sec")

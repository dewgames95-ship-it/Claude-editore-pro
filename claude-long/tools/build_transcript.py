#!/usr/bin/env python3
"""python3 -I build_transcript.py WHISPER_JSON OUT_DIR"""
import sys, json, re, os
src, out = sys.argv[1], sys.argv[2]
CUTS = [0, 11.2, 42.5, 73.0, 96.5, 132.2]
# (sentence start fragment, {word-index-in-sentence-by-original-text: new}) matched by position
FIX = [
 ("And there are three modes", {"both": "bot", "2LR": "12-hour"}),
 ("Put any name here like I am putting", {"my": "My", "vote.": "bot."}),
 ("Then here after convenient 2FA", {"convenient": "confirming"}),
 ("So you need to delete the first.", {"delete": "edit"}),
 ("You delete first before taking screen shot.", {"delete": "edit"}),
]
d = json.load(open(src))
words, segs = [], []
for seg in d["segments"]:
    sw = []
    for w in seg["words"]:
        t = w["word"].strip()
        if not re.search(r"[A-Za-z0-9]", t): continue
        sw.append({"text": t, "start": w["start"], "end": w["end"]})
    stext = seg["text"].strip()
    for frag, m in FIX:
        if stext.startswith(frag) or frag in stext:
            for w in sw:
                if w["text"] in m:
                    w["text"] = m.pop(w["text"])  # first occurrence in this sentence only
            assert not m, (frag, m)
    segs.append(sw); words += sw
res = []
for i, w in enumerate(words):
    s, e = w["start"], w["end"]
    step = next(k for k in range(5, 0, -1) if s >= CUTS[k-1])
    a, b = CUTS[step-1], CUTS[step]
    res.append({"id": f"w{i}", "text": w["text"], "start": round(s, 3), "end": round(e, 3), "step": step,
                "local_start": round(s-a, 3), "local_end": round(min(e, b)-a, 3)})
json.dump({"language": "en", "source": "voiceover.mp3", "words": res}, open(os.path.join(out, "transcript.json"), "w"), indent=1)
def ts(x):
    ms = round(x*1000); return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}"
lines, cur = [], []
for k, w in enumerate(res):
    cur.append(w)
    nxt = res[k+1] if k+1 < len(res) else None
    if len(cur) >= 6 or w["text"][-1] in ".?!" or nxt is None or nxt["start"]-w["end"] >= 0.15:
        lines.append(cur); cur = []
with open(os.path.join(out, "captions_en.srt"), "w") as f:
    for n, l in enumerate(lines, 1):
        f.write(f"{n}\n{ts(l[0]['start'])} --> {ts(l[-1]['end'])}\n{' '.join(w['text'] for w in l)}\n\n")
for sw in segs: print(" ".join(w["text"] for w in sw))
print(len(res), "words")

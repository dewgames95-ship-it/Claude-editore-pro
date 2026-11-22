# Presenter cutout (background remove) from a video
# Usage: /opt/kokoro/bin/python tools/cutout.py <video> <out_dir> <sec1,sec2,...>
import sys, subprocess, os
from rembg import remove, new_session
from PIL import Image
video, out, secs = sys.argv[1], sys.argv[2], sys.argv[3].split(",")
os.makedirs(out, exist_ok=True)
s = new_session("u2net_human_seg")
for t in secs:
    f = f"/tmp/cut_{t}.png"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", t, "-i", video, "-frames:v", "1", "-vf", "scale=1280:-1", f], check=True)
    o = remove(Image.open(f), session=s)
    o = o.crop(o.getbbox())
    o.save(f"{out}/pose_{t}s.png")
    print("saved", f"{out}/pose_{t}s.png", o.size)

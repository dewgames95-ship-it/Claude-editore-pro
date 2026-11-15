#!/usr/bin/env python3
"""python3 -I verify_blur.py SRC_DIR : detector count on blurred.mp4 + contact sheet + fallback-candidate gaps"""
import sys, os, json
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from multiprocessing import Pool
SRC = sys.argv[1]
def chk(a):
    i, f = a
    import blur_qr as L
    return i, bool(L.detect_qr(f)), L.detect_fallback(f) if i/30 >= 60 else []
def it():
    cap = cv2.VideoCapture(os.path.join(SRC, "blurred.mp4")); i = 0
    while True:
        ok, f = cap.read()
        if not ok: break
        yield i, f; i += 1
if __name__ == "__main__":
    with Pool(4) as p: r = sorted(p.imap_unordered(chk, it(), chunksize=4))
    print("frames", len(r), "still detect:", [i for i, d, _ in r if d][:50], sum(d for _, d, _ in r))
    print("fallback candidate frames still in blurred:", [i for i, _, c in r if c][:50], sum(bool(c) for _, _, c in r))
    cap = cv2.VideoCapture(os.path.join(SRC, "blurred.mp4"))
    tiles = []
    t = 64.0
    while t <= 132.0:
        cap.set(cv2.CAP_PROP_POS_MSEC, t*1000); ok, f = cap.read()
        if not ok: f = np.zeros((1280, 588, 3), np.uint8)
        f = cv2.resize(f, (196, int(1280*196/588)), interpolation=cv2.INTER_AREA)
        cv2.putText(f, f"{t:.1f}s", (4, 22), cv2.FONT_HERSHEY_SIMPLEX, .6, (0,0,0), 4)
        cv2.putText(f, f"{t:.1f}s", (4, 22), cv2.FONT_HERSHEY_SIMPLEX, .6, (0,255,255), 1)
        tiles.append(f); t += 1.5
    while len(tiles) % 12: tiles.append(np.zeros_like(tiles[0]))
    rows = [np.hstack(tiles[i:i+12]) for i in range(0, len(tiles), 12)]
    os.makedirs(os.path.join(SRC, "frames"), exist_ok=True)
    cv2.imwrite(os.path.join(SRC, "frames/blur_check.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])

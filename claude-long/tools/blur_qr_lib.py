#!/usr/bin/env python3
"""Detect and irreversibly obscure QR codes. Usage: python3 -I blur_qr.py SRC_DIR
Reads SRC/raw.mp4 -> SRC/blurred.mp4, SRC/qr_boxes.json"""
import sys, os, json, subprocess
import numpy as np, cv2
from multiprocessing import Pool

SRC = sys.argv[1]
RAW = os.path.join(SRC, "raw.mp4")
W, H, FPS = 588, 1280, 30
PAD, GAP, EXT = 0.12, 20, 8
FALLBACK_FROM_S = 60.0

def quad_to_box(q):
    q = np.asarray(q).reshape(-1, 2)
    x0, y0 = q.min(0); x1, y1 = q.max(0)
    return [float(x0), float(y0), float(x1 - x0), float(y1 - y0)]

def iou(a, b):
    ax1, ay1, bx1, by1 = a[0]+a[2], a[1]+a[3], b[0]+b[2], b[1]+b[3]
    iw = min(ax1, bx1) - max(a[0], b[0]); ih = min(ay1, by1) - max(a[1], b[1])
    if iw <= 0 or ih <= 0: return 0.0
    i = iw * ih
    return i / (a[2]*a[3] + b[2]*b[3] - i)

def detect_qr(frame):
    det = cv2.QRCodeDetector()
    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    boxes = []
    def run(img, s):
        try:
            ok, pts = det.detectMulti(img)
        except cv2.error:
            return []
        if not ok or pts is None: return []
        out = []
        for q in pts:
            b = quad_to_box(q / s)
            if b[2] > 20 and b[3] > 20 and b[2] < W*1.2: out.append(b)
        return out
    boxes = run(g, 1)
    if not boxes:
        boxes = run(cv2.resize(g, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC), 2)
    return boxes

def detect_fallback(frame):
    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, wh = cv2.threshold(g, 225, 255, cv2.THRESH_BINARY)
    wh = cv2.morphologyEx(wh, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(wh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    res = []
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if not (170 <= w <= 440 and 170 <= h <= 440): continue
        if not 0.85 <= w / h <= 1.18: continue
        roi = g[y:y+h, x:x+w]
        dark = float((roi < 110).mean())
        if not 0.30 <= dark <= 0.65: continue
        # modules: strong edge density
        e = cv2.Canny(roi, 80, 200)
        if (e > 0).mean() < 0.08: continue
        res.append([float(x), float(y), float(w), float(h)])
    return res

def work(args):
    i, frame = args
    t = i / FPS
    q = detect_qr(frame)
    fb = detect_fallback(frame) if t >= FALLBACK_FROM_S else []
    return i, q, fb

def frames_iter():
    cap = cv2.VideoCapture(RAW)
    k = 0; i = 0
    while True:
        ok, f = cap.read()
        if not ok: break
        if k % 2 == 0:
            yield i, f; i += 1
        k += 1
    cap.release()

def link_tracks(det):
    """det: dict frame->list of boxes. Greedy tracks: dict frame->box."""
    tracks = []
    for f in sorted(det):
        used = set()
        for b in det[f]:
            cx, cy = b[0]+b[2]/2, b[1]+b[3]/2
            best, bd = None, 1e9
            for ti, tr in enumerate(tracks):
                if ti in used: continue
                lf = max(tr); 
                if f - lf > GAP or f == lf: continue
                lb = tr[lf]
                d = ((cx-lb[0]-lb[2]/2)**2 + (cy-lb[1]-lb[3]/2)**2) ** .5
                lim = max(lb[2], lb[3]) * (0.5 + 0.05 * (f - lf))
                if d < lim and d < bd: best, bd = ti, d
            if best is None:
                tracks.append({f: b}); used.add(len(tracks)-1)
            else:
                tracks[best][f] = b; used.add(best)
    return tracks

def fill_track(tr, nframes):
    fs = sorted(tr); out = dict(tr)
    for a, b in zip(fs, fs[1:]):
        if 1 < b - a <= GAP + 1:
            for f in range(a+1, b):
                u = (f-a)/(b-a)
                out[f] = [tr[a][k]*(1-u) + tr[b][k]*u for k in range(4)]
    first, last = fs[0], fs[-1]
    for f in range(max(0, first-EXT), first): out[f] = tr[first]
    for f in range(last+1, min(nframes, last+EXT+1)): out[f] = tr[last]
    return out

def pad_clip(b):
    x, y, w, h = b
    x -= w*PAD; y -= h*PAD; w *= 1+2*PAD; h *= 1+2*PAD
    x0, y0 = max(0, int(np.floor(x))), max(0, int(np.floor(y)))
    x1, y1 = min(W, int(np.ceil(x+w))), min(H, int(np.ceil(y+h)))
    return [x0, y0, x1-x0, y1-y0]

def obscure(img, b):
    x, y, w, h = b
    if w < 2 or h < 2: return
    roi = img[y:y+h, x:x+w]
    small = cv2.resize(roi, (8, 8), interpolation=cv2.INTER_AREA)
    pix = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
    k = (max(w, h) // 4) | 1
    img[y:y+h, x:x+w] = cv2.GaussianBlur(pix, (k, k), 0)

def main():
    cap = cv2.VideoCapture(RAW)
    nraw = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)); cap.release()
    n = (nraw + 1) // 2
    det, fbd = {}, {}
    with Pool(4) as p:
        for i, q, fb in p.imap_unordered(work, frames_iter(), chunksize=4):
            if q: det[i] = q
            if fb: fbd[i] = fb
    print("frames", n, "detector hits", len(det), "fallback candidates", len(fbd), flush=True)
    tracks = [fill_track(t, n) for t in link_tracks(det)]
    print("tracks", len(tracks))
    allb = {}
    for tr in tracks:
        for f, b in tr.items(): allb.setdefault(f, []).append(b)
    # fallback: only fill frames the QR detector missed, IoU>0.3 with a box within +-30 frames
    added = 0
    for f, cands in sorted(fbd.items()):
        if f in det: continue
        for c in cands:
            ok = any(iou(c, b) > 0.3 for g in range(f-30, f+31) for b in allb.get(g, []))
            if ok and not any(iou(c, b) > 0.5 for b in allb.get(f, [])):
                allb.setdefault(f, []).append(c); added += 1
    print("fallback boxes added", added)
    # light second temporal smoothing: fallback additions may leave 1-frame holes; fill again per frame
    out_boxes = []
    for f in range(n):
        bs = [pad_clip(b) for b in allb.get(f, [])]
        if bs: out_boxes.append({"frame": f, "t": round(f/FPS, 3), "boxes": bs})
    json.dump(out_boxes, open(os.path.join(SRC, "qr_boxes.json"), "w"))
    print("frames with boxes", len(out_boxes))
    bmap = {e["frame"]: e["boxes"] for e in out_boxes}
    tmp = os.path.join(SRC, "blur_video_only.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "14",
        "-preset", "veryfast", "-pix_fmt", "yuv420p", "-r", str(FPS), tmp], stdin=subprocess.PIPE)
    for i, f in frames_iter():
        for b in bmap.get(i, []): obscure(f, b)
        ff.stdin.write(f.tobytes())
    ff.stdin.close(); ff.wait()
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-i", RAW, "-map", "0:v", "-map", "1:a",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", "132.2", os.path.join(SRC, "blurred.mp4")])
    os.remove(tmp)

if __name__ == "__main__":
    main()

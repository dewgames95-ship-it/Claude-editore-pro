#!/usr/bin/env bash
# Ek command setup: bash setup.sh  |  Full (Kokoro voice + rembg cutout + Whisper): bash setup.sh --full
cd "$(dirname "$0")"
pip install -q -U edge-tts auto-editor 2>/dev/null || pip install -q -U --break-system-packages edge-tts auto-editor
# Cloud proxy certificate (edge-tts ke liye); dobara add nahi karega
CA=/root/.ccr/ca-bundle.crt; CF=$(python3 -c 'import certifi;print(certifi.where())' 2>/dev/null)
if [ -f "$CA" ] && [ -n "$CF" ] && ! grep -q "$(sed -n 2p $CA)" "$CF"; then cat "$CA" >> "$CF"; fi
[ -d video-edit ] && (cd video-edit && npm install --silent --no-audit --no-fund)
[ -f tools/sfx.sh ] && bash tools/sfx.sh >/dev/null
if [ "$1" = "--full" ]; then
  command -v espeak-ng >/dev/null || (apt-get update -q && apt-get install -y -q espeak-ng) >/dev/null 2>&1
  command -v uv >/dev/null || pip install -q uv
  [ -x /opt/kokoro/bin/python ] || uv venv -q -p 3.12 /opt/kokoro
  VIRTUAL_ENV=/opt/kokoro uv pip install -q kokoro soundfile "misaki[en]" "rembg[cpu]" torch --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple --index-strategy unsafe-best-match
fi
if { [ "$1" = "--whisper" ] || [ "$1" = "--full" ]; } && [ -d video-edit ]; then
  (cd video-edit && node -e 'const w=require("@remotion/install-whisper-cpp");(async()=>{await w.installWhisperCpp({to:"whisper.cpp",version:"1.5.5"});await w.downloadWhisperModel({model:"medium",folder:"whisper.cpp"})})()')
fi
echo "✅ Setup done"

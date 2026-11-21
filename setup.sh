#!/usr/bin/env bash
# Ek command setup (cloud ya local): bash setup.sh   |  Whisper bhi abhi chahiye: bash setup.sh --whisper
cd "$(dirname "$0")"
pip install -q -U edge-tts 2>/dev/null || pip install -q -U --break-system-packages edge-tts
# Cloud proxy certificate (edge-tts ke liye); dobara add nahi karega
CA=/root/.ccr/ca-bundle.crt; CF=$(python3 -c 'import certifi;print(certifi.where())' 2>/dev/null)
if [ -f "$CA" ] && [ -n "$CF" ] && ! grep -q "$(sed -n 2p $CA)" "$CF"; then cat "$CA" >> "$CF"; fi
[ -d video-edit ] && (cd video-edit && npm install --silent --no-audit --no-fund)
[ -f tools/sfx.sh ] && bash tools/sfx.sh >/dev/null
if [ "$1" = "--whisper" ] && [ -d video-edit ]; then
  (cd video-edit && node -e 'const w=require("@remotion/install-whisper-cpp");(async()=>{await w.installWhisperCpp({to:"whisper.cpp",version:"1.5.5"});await w.downloadWhisperModel({model:"medium",folder:"whisper.cpp"})})()')
fi
echo "✅ Setup done"

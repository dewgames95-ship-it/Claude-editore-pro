#!/usr/bin/env bash
# Naye cloud session me ek baar chalao: bash setup.sh
set -e
cd "$(dirname "$0")"
pip install -q edge-tts
# Cloud proxy ka certificate python ko do (edge-tts ke liye)
[ -f /root/.ccr/ca-bundle.crt ] && cat /root/.ccr/ca-bundle.crt >> "$(python3 -c 'import certifi;print(certifi.where())')"
(cd video-edit && npm install --silent)
# Whisper (medium, ~1.5GB) download
(cd video-edit && node -e 'const w=require("@remotion/install-whisper-cpp");(async()=>{await w.installWhisperCpp({to:"whisper.cpp",version:"1.5.5"});await w.downloadWhisperModel({model:"medium",folder:"whisper.cpp"})})()')
echo "✅ Setup done"

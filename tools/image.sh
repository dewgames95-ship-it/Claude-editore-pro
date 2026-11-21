#!/usr/bin/env bash
# Free AI image (Pollinations, no key)
# Usage: bash tools/image.sh "prompt text" video-edit/public/images/img1.jpg
mkdir -p "$(dirname "$2")"
P=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$1")
curl -s -m 120 -o "$2" "https://image.pollinations.ai/prompt/$P?width=720&height=1280&nologo=true"

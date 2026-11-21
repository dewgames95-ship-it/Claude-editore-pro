#!/usr/bin/env bash
# Free AI voice-over (Microsoft Edge TTS)
# Usage: bash tools/voice.sh script.txt "video-edit/public/Voice over/vo.mp3" [voice]
# Voices: hi-IN-MadhurNeural (male), hi-IN-SwaraNeural (female), en-IN-PrabhatNeural, en-IN-NeerjaNeural
VOICE=${3:-hi-IN-MadhurNeural}
edge-tts --voice "$VOICE" --rate=+8% -f "$1" --write-media "$2" --write-subtitles "${2%.*}.srt"

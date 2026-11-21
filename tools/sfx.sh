#!/usr/bin/env bash
# Free SFX ffmpeg se generate (whoosh, pop, click, riser, bass hit)
D=video-edit/public/sfx; mkdir -p $D
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=d=0.6:c=pink" -af "highpass=f=400,lowpass=f=4000,afade=t=in:d=0.25,afade=t=out:st=0.3:d=0.3,volume=0.6" $D/whoosh.mp3
ffmpeg -y -loglevel error -f lavfi -i "sine=f=900:d=0.08" -af "afade=t=out:d=0.08" $D/pop.mp3
ffmpeg -y -loglevel error -f lavfi -i "sine=f=2000:d=0.03" $D/click.mp3
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc=sin(2*PI*(200+800*t)*t):d=1.5" -af "afade=t=in:d=1.2,volume=0.4" $D/riser.mp3
ffmpeg -y -loglevel error -f lavfi -i "sine=f=55:d=0.6" -af "afade=t=out:st=0.1:d=0.5,volume=2" $D/bass-hit.mp3
echo "✅ SFX ready in $D"

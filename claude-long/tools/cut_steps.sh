#!/bin/bash
# usage: cut_steps.sh SRC_DIR OUT_DIR
SRC=$1; OUT=$2
CUTS=(0 11.2 42.5 73.0 96.5)
ENDS=(11.2 42.5 73.0 96.5 $(ffprobe -v error -show_entries format=duration -of csv=p=0 $SRC/raw.mp4))
for i in 0 1 2 3 4; do
  s=${CUTS[$i]}; e=${ENDS[$i]}; d=$(python3 -c "print(round($e-$s,3))"); fo=$(python3 -c "print(round($d-0.05,3))")
  ffmpeg -y -v error -ss $s -i $SRC/raw.mp4 -t $d -vf fps=30 \
    -af "aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.05,afade=t=out:st=$fo:d=0.05" \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r 30 -g 30 -keyint_min 30 -sc_threshold 0 \
    -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart $OUT/step$((i+1)).mp4
done
ffmpeg -y -v error -i $SRC/raw.mp4 -vn -c:a libmp3lame -b:a 192k $OUT/voiceover.mp3
ffmpeg -y -v error -ss 3 -i $OUT/step1.mp4 -frames:v 1 -q:v 2 $OUT/poster_step1.jpg

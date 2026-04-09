#!/bin/sh

gource -1920x1080 -c 4 -s 0.75 -b 000000 --colour-images --padding 1.2 --hide filenames,mouse,progress --bloom-multiplier 0.75 --bloom-intensity 1.5 --logo ccxt-logo-white.svg --highlight-users -o - | ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset ultrafast -pix_fmt yuv420p -crf 1 -threads 0 -bf 0 gource.mp4
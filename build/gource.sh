#!/bin/sh
# build/gource.sh — generate a gource video of the repo history
# works when invoked as:  cd build && ./gource.sh
#                    or:  ./build/gource.sh
# logo lives next to this script (build/ccxt-logo-white.png); video is written
# to the current working directory.

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
logo="$script_dir/ccxt-logo-white.png"

if [ ! -f "$logo" ]; then
    echo "error: logo not found at $logo" >&2
    exit 1
fi

gource -1920x1080 -c 4 -s 0.5 -b 000000 --colour-images --padding 1.3 --hide filenames,mouse,progress --bloom-multiplier 0.75 --bloom-intensity 1.5 --logo "$logo" --highlight-users -o - --date-format "%Y-%m-%d %H:%M:%S" | ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset ultrafast -pix_fmt yuv420p -crf 1 -threads 0 -bf 0 gource.mp4


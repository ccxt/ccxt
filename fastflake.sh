#!/usr/bin/env bash

# saves time over the other running flake8 on all the files

files=$(git diff --name-only origin/master | sed -n '/py$/p' | xargs)
python3 -m flake8 --ignore=F841,W504,E501 ${files}

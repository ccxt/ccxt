#!/usr/bin/env bash

# saves time over the other running flake8 on all the files

files=$(git diff --name-only origin/master | sed -n '/py$/p' | xargs)
command="flake8 --ignore=F722,F841,F821,W504,E402,E501"
execute="${command} ${files}"
printf "\n${execute}\n\n"

# only one variable expansion happens here so it is safe
${execute}

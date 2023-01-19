#!/usr/bin/env bash

# saves time over the other running flake8 on all the files

files=$(git diff --name-only --relative origin/master | sed -n '/py$/p' | xargs)
command="flake8 --ignore=F722,F841,F821,W504,E402,E501,E275,E902 --exclude static_dependencies,node_modules,.tox"
execute="${command} ${files}"
printf "\n${execute}\n\n"

if [[ -n ${files} ]]; then
  # only one variable expansion happens here so it is safe
  ${execute}
fi

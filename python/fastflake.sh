#!/usr/bin/env bash

# saves time over the other running flake8 on all the files

echo -e '\n checking syntax using flake8 over the following files:\n'
git diff --name-only --relative origin/master | sed -n '/py$/p' | tee /dev/stderr | xargs -n 1000 flake8 --ignore=F722,F841,F821,W504,E402,E501,E275,E902 --exclude static_dependencies,node_modules,.tox

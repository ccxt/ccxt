#!/usr/bin/env bash
set -e
echo $APPVEYOR_REPO_BRANCH
if [ -z "$APPVEYOR_REPO_BRANCH" ]; then
  echo "-z"
fi
if [[ "$APPVEYOR_REPO_BRANCH" == "master" ]]; then
  echo "ismaset"
fi
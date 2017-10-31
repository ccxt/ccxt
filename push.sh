#!/bin/sh

LAST_COMMIT_MESSAGE="$(git log --no-merges -1 --pretty=%B)"
COMPILED_MESSAGE="${LAST_COMMIT_MESSAGE}"$'\n'"[ci skip]"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git add --force build/ccxt.browser.js
git commit -a -m "${COMMIT_MESSAGE}" -m '[ci skip]'
git tag -a "${COMMIT_MESSAGE}" -m "${COMPILED_MESSAGE}"
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.git
git push origin --tags HEAD:master

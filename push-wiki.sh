#!/bin/sh

cd ccxt.wiki
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git tag "${COMMIT_MESSAGE}"
git commit -a -m ${COMMIT_MESSAGE}
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/kroitor/ccxt.wiki.git
git push origin --tags HEAD:master
#!/bin/sh

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git commit -a -m "${COMMIT_MESSAGE}" -m "[ci skip]"
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/kroitor/ccxt.git
git push origin HEAD:master
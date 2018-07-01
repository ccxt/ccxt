#!/bin/sh

cd ccxt.wiki
cp ../wiki/FAQ.md .
cp ../wiki/Manual.md .
cp ../wiki/README.md ./Home.md
cp ../wiki/Exchange-Markets.md .
cp ../wiki/Exchange-Markets-By-Country.md .
cp ../wiki/Install.md .
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git commit -a -m ${COMMIT_MESSAGE}
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.wiki.git
git push origin HEAD:master

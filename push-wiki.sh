#!/bin/sh

cd ccxt.wiki
git commit -a -m ${NPM_VERSION}
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/kroitor/ccxt.wiki.git
git push origin HEAD:master
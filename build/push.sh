#!/bin/sh

set -e

# ---------------------------------------------------------------------------------

echo "Checking if HEAD hasn't changed on remote..."
echo ""

HEAD_LOCAL=`git rev-parse HEAD`
HEAD_REMOTE=`git ls-remote --heads origin master | cut -c1-40`

echo "Head (local):  $HEAD_LOCAL"
echo "Head (remote): $HEAD_REMOTE"
echo ""

if [ "$HEAD_LOCAL" != "$HEAD_REMOTE" ]; then
    echo "HEAD CHANGED, ABORTING BUILD!"
    echo ""
    exit 1
fi

# ---------------------------------------------------------------------------------

echo "Pushing generated files back to GitHub..."

LAST_COMMIT_MESSAGE="$(git log --no-merges -1 --pretty=%B)"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git commit -a -m "${COMMIT_MESSAGE}" -m '[ci skip]'
git tag -a "${COMMIT_MESSAGE}" -m "${LAST_COMMIT_MESSAGE}" -m "" -m "[ci skip]"
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.git
node build/cleanup-old-tags --limit
git push origin --tags HEAD:master

# ---------------------------------------------------------------------------------

echo "Pushing to ccxt.wiki"

cd build/ccxt.wiki
cp ../../wiki/* .
git commit -a -m ${COMMIT_MESSAGE} || true
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.wiki.git
git push origin HEAD:master
cd ../..

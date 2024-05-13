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

echo "Pushing to ccxt.wiki"

cd build/ccxt.wiki
cp -R ../../wiki/* .
git commit -a -m "${COMMIT_MESSAGE}" || true
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.wiki.git
git push origin HEAD:master
cd ../..

# ---------------------------------------------------------------------------------

echo "Pushing generated files back to GitHub..."

LAST_COMMIT_MESSAGE="$(git log --no-merges -1 --pretty=%B)"
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
# echo "After configing email/name" # debug
# git remote remove origin
# echo "After removing origin" # debug
# git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.git
# echo "After adding origin" # debug
# git fetch origin
# echo "After fetching origin" # debug
# git add dist/cjs/**/* dist/ccxt.bundle.cjs dist/ccxt.browser.js dist/ccxt.browser.min.js ts/ccxt.ts ts/src/abstract/*.ts js/**/** php/*.php php/abstract/*.php php/async/*.php php/async/abstract/*.php php/pro/*.php python/ccxt/async_support/*.py python/ccxt/*.py python/ccxt/abstract/*.py python/ccxt/pro/*.py wiki/* examples/py examples/php examples/js
# git add php/test/ php/pro/test/
# git add python/ccxt/test/ python/ccxt/pro/test/
# git add -f python/LICENSE.txt python/package.json python/README.md
# if [ "$SHOULD_TAG" = "true" ]; then
#     echo "Pushing changelog..."
#     node build/changelog "${COMMIT_MESSAGE}"
# fi
git add . -A
git status
git commit -m "${COMMIT_MESSAGE}" -m '[ci skip]' || exit 0
if [ "$SHOULD_TAG" = "true" ]; then
    git tag -a "${COMMIT_MESSAGE}" -m "${LAST_COMMIT_MESSAGE}" -m "" -m "[ci skip]";
fi
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.git
node build/cleanup-old-tags --limit
git push origin --tags HEAD:master
if [ "$SHOULD_TAG" = "true" ]; then
    echo "Creating release..."
    gh release create "${COMMIT_MESSAGE}" --generate-notes --verify-tag
fi
echo "Done executing build/push.sh"

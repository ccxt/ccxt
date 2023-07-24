#!/bin/bash

# The script will stop if any commands fail
set -e

# Check if the 'upstream' remote exists and if it's correct
if ! git remote -v | grep -q 'upstream.*git@github.com:ccxt/ccxt.git'; then
    echo "Checking 'upstream' remote..."

    if git remote | grep -q 'upstream'; then
        echo "Upstream exists but is incorrect. Resetting 'upstream'..."
        git remote remove upstream
    fi

    echo "Adding 'upstream' remote..."
    git remote add upstream git@github.com:ccxt/ccxt.git
fi

echo "Fetching updates from 'upstream'..."
git fetch upstream

echo "Checking out the 'master' branch..."
git checkout master

echo "Pulling updates from the master branch..."
git pull

echo "Rebasing with 'upstream/master'..."
git rebase upstream/master

echo "Installing dependencies using NPM..."
npm i

echo "Building using NPM..."
npm run build

echo "Done!"

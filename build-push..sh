git checkout master composer.json
if [ "$TRAVIS_PULL_REQUEST" = "false" ] && [ "$TRAVIS_BRANCH" = "master" ]; then
  echo "Not publishing";
  env COMMIT_MESSAGE="${TRAVIS_COMMIT_MESSAGE}" GITHUB_TOKEN=${GITHUB_TOKEN} SHOULD_TAG=${SHOULD_DEPLOY} ./build/push.sh;
  exit 0;
fi;

echo "Publishing";
if [ "$RUNSTEP" = "PY_JS_PHP" ]; then
  npm config set git-tag-version=false && NPM_VERSION=$(npm version patch);
  npm run vss && npm run copy-python-files;
  env COMMIT_MESSAGE=${NPM_VERSION:1} GITHUB_TOKEN=${GITHUB_TOKEN} SHOULD_TAG=${SHOULD_DEPLOY} ./build/push.sh;
  ./cs/deploy.sh;
  cd python && env PYPI_TOKEN=${PYPI_TOKEN} ./deploy.sh && cd ..;
fi;
if [ "$RUNSTEP" = "CSHARP" ]; then
  npm config set git-tag-version=false && NPM_VERSION=$(npm version patch);
  npm run vss && npm run copy-python-files && npm run buildCSRelease;
  env COMMIT_MESSAGE=${NPM_VERSION:1} GITHUB_TOKEN=${GITHUB_TOKEN} SHOULD_TAG=${SHOULD_DEPLOY} ./build/push.sh;
  ./cs/deploy.sh;
fi;
#!/bin/bash

# this script is started by Travis CI:
# env DEPLOY_CACHE=.cache/deploy SECONDS_BEFORE_NEXT_DEPLOY=43200 ./build/deploy.sh;

set -e

pwd

CURRENT_TIME=$(date +%s);
CURRENT_DATETIME=$(date +%c);

if [ ! -f "${DEPLOY_CACHE}" ]; then
    echo "${DEPLOY_CACHE} does not exist";
    echo "Writing ${CURRENT_DATETIME} to ${DEPLOY_CACHE}";
    echo "${CURRENT_DATETIME}" > ${DEPLOY_CACHE};
fi

LAST_DEPLOYED_DATETIME=$(cat ${DEPLOY_CACHE});
echo "LAST_DEPLOYED_DATETIME: ${LAST_DEPLOYED_DATETIME}";
DEPLOY_CACHE_MTIME=$(date -r ${DEPLOY_CACHE} +%s);
echo "DEPLOY_CACHE_MTIME: ${DEPLOY_CACHE_MTIME} $(date -r ${DEPLOY_CACHE} +%c)";
SECONDS_SINCE_LAST_DEPLOY=$((${CURRENT_TIME} - ${DEPLOY_CACHE_MTIME}));
echo "SECONDS_SINCE_LAST_DEPLOY: ${SECONDS_SINCE_LAST_DEPLOY}";

NEXT_DEPLOY_TIME=$((${DEPLOY_CACHE_MTIME} + ${SECONDS_BEFORE_NEXT_DEPLOY}));
echo "NEXT_DEPLOY_TIME: ${NEXT_DEPLOY_TIME}";

NEXT_DEPLOY_DATETIME=$(date -d @${NEXT_DEPLOY_TIME} +%c);
echo "NEXT_DEPLOY_DATETIME: ${NEXT_DEPLOY_DATETIME}";

SHOULD_DEPLOY="test ${SECONDS_SINCE_LAST_DEPLOY} -ge ${SECONDS_BEFORE_NEXT_DEPLOY}"

if [[ "${TRAVIS_COMMIT_MESSAGE}" = *'[ci deploy]'* ]]; then
    echo "Detected the [ci deploy] tag, forcing deploy"
    SHOULD_DEPLOY=true
fi

if $SHOULD_DEPLOY; then
    echo "Publishing and writing ${CURRENT_DATETIME} to ${DEPLOY_CACHE}"
    echo "${CURRENT_DATETIME}" > ${DEPLOY_CACHE}
    exit 0
else
    echo "Not publishing until ${NEXT_DEPLOY_DATETIME}"
    exit 1
fi

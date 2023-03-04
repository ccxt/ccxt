#!/bin/bash

# this script is started by Travis CI:
# env DEPLOY_CACHE=.cache/deploy SECONDS_BEFORE_NEXT_DEPLOY=43200 ./build/deploy.sh;

set -e

pwd

if [ ! -f "${DEPLOY_CACHE}" ]; then
    echo "${DEPLOY_CACHE} does not exist";
    echo "Writing ${NPM_VERSION} to ${DEPLOY_CACHE}";
    echo "${NPM_VERSION}" > ${DEPLOY_CACHE};
fi

LAST_DEPLOYED_VERSION=$(cat ${DEPLOY_CACHE});
echo "LAST_DEPLOYED_VERSION: ${LAST_DEPLOYED_VERSION}"
DEPLOY_CACHE_MTIME=$(date -r ${DEPLOY_CACHE} +%s);
CURRENT_TIME=$(date +%s);
echo "DEPLOY_CACHE_MTIME: ${DEPLOY_CACHE_MTIME} $(date -r ${DEPLOY_CACHE} +%c)"
SECONDS_SINCE_LAST_DEPLOY=$((${CURRENT_TIME} - ${DEPLOY_CACHE_MTIME}));
echo "SECONDS_SINCE_LAST_DEPLOY: ${SECONDS_SINCE_LAST_DEPLOY}";

NEXT_DEPLOY_TIME=$((${DEPLOY_CACHE_MTIME} + ${SECONDS_BEFORE_NEXT_DEPLOY}));
echo "NEXT_DEPLOY_TIME: ${NEXT_DEPLOY_TIME}";

NEXT_DEPLOY_DATETIME=$(date -d @${NEXT_DEPLOY_TIME} +%c);
echo "NEXT_DEPLOY_DATETIME: ${NEXT_DEPLOY_DATETIME}";

if [ ${SECONDS_SINCE_LAST_DEPLOY} -lt ${SECONDS_BEFORE_NEXT_DEPLOY} ]; then
    echo "Not publishing until ${NEXT_DEPLOY_DATETIME}";
    echo "Publish: false"
else
    echo "Publish: true"
fi
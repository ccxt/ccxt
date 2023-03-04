#!/bin/sh

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
DEPLOY_CACHE_MTIME=$(date -r ${DEPLOY_CACHE} +%s);
CURRENT_TIME=$(date +%s);
SECONDS_SINCE_LAST_DEPLOY=$((${CURRENT_TIME} - ${DEPLOY_CACHE_MTIME}));
NEXT_DEPLOY_TIME=$((${DEPLOY_CACHE_MTIME} + ${SECONDS_BEFORE_NEXT_DEPLOY}));
NEXT_DEPLOY_DATETIME=$(date -r ${NEXT_DEPLOY_TIME} +%c);

echo "Last deployed version: ${LAST_DEPLOYED_VERSION} as of $(date -r ${DEPLOY_CACHE_MTIME} '+%F %T'), ${SECONDS_SINCE_LAST_DEPLOY} seconds ago";

if [ ${SECONDS_SINCE_LAST_DEPLOY} -lt ${SECONDS_BEFORE_NEXT_DEPLOY} ]; then
    echo "Not publishing until ${NEXT_DEPLOY_DATETIME}";
fi

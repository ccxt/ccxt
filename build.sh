#!/usr/bin/env bash
set -e

if [ "${BASH_VERSION:0:1}" -lt 4 ]; then
  echo "EPROGMISMATCH: bash version must be at least 4" >&2
  exit 75
fi

if [ $# -gt 0 ]; then
  echo "E2BIG: too many arguments" >&2
  exit 7
fi

[[ -n "$TRAVIS_BUILD_ID" ]] && IS_TRAVIS="TRUE" || IS_TRAVIS="FALSE"
[[ "$RUNSTEP" == "PY_JS_PHP" ]] && STAGE_PYJSPHP="TRUE" || STAGE_PYJSPHP="FALSE"
[[ "$RUNSTEP" == "CSHARP" ]] && STAGE_CSHARP="TRUE" || STAGE_CSHARP="FALSE"

if [ "$STAGE_CSHARP" == "TRUE" ]; then
  echo "S 1"
  node t1.js
fi
if [ "$STAGE_PYJSPHP" == "TRUE" ]; then
  echo "S 2"
  node t1.js
fi

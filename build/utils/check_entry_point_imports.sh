#!/usr/bin/env bash
# Fails the build if any exchange file imports from the package entry point.
#
# Exchange files under ts/src/ must import error classes from './base/errors.js'
# and types from './base/types.js'. Importing '../ccxt.js' creates a circular
# dependency (ccxt.ts imports the exchange, the exchange imports ccxt.ts) that
# only crashes at registration time with "Cannot access '<id>' before
# initialization" — which is how an unregistered exchange can carry the defect
# invisibly for months (see https://github.com/ccxt/ccxt/pull/27862, where the
# combination of a missing ts/ccxt.ts registration and this import class kept
# every build lane red).

set -u

offenders=$(grep -rlnE "from '(\.\./)+ccxt\.js'" ts/src/*.ts ts/src/pro/*.ts ts/src/prediction/*.ts ts/src/pro/prediction/*.ts 2>/dev/null || true)

if [ -n "$offenders" ]; then
    echo "error: exchange files must not import from the package entry point '../ccxt.js'"
    echo "       (circular dependency, crashes at registration with a TDZ error);"
    echo "       import error classes and types from the base/ folder at the file's relative depth"
    echo "       (e.g. './base/errors.js' from ts/src, '../base/errors.js' from prediction/ or pro/) instead:"
    for f in $offenders; do
        echo "  $f"
        grep -nE "from '(\.\./)+ccxt\.js'" "$f" | sed 's/^/      /'
    done
    exit 1
fi

echo "entry-point import guard: clean"

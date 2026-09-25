#!/bin/bash
# replay.sh <outdir> <ts files...>: single-file printer replays, prints toMapArg count per file
wt=/root/worktrees/typed90-sub/java-tuple-params-map; out=$1; shift; mkdir -p $out
cd $wt; [ -f js/src/base/errors.js ] || cp -a /root/worktrees/typed90-sub/java-addelem-native/js .
for f in "$@"; do
  b=$(echo $f | sed 's#ts/src/##; s#/#_#g; s#\.ts$##')
  AST=/root/worktrees/ast-go-divide/dist/transpiler.js timeout 500 node_modules/.bin/tsx research/r16/java-tuple-params-map/probe.mts $wt $f $out/$b.java 2>/dev/null
  echo "$b $(grep -c 'Helpers.toMapArg(' $out/$b.java 2>/dev/null)"
done

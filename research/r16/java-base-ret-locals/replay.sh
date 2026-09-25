#!/bin/bash
# replay.sh <outdir> <ts ids...>: single-file printer replays (pin a85f57dc = ast-go-divide dist)
wt=/root/worktrees/typed90-sub/java-base-ret-locals; out=$1; shift; mkdir -p $out; cd $wt
[ -f js/src/base/errors.js ] || cp -a /root/worktrees/typed90-sub/java-tuple-params-map/js .
for f in "$@"; do b=$(echo $f | tr / _)
  AST=/root/worktrees/ast-go-divide/dist/transpiler.js timeout 500 node_modules/.bin/tsx research/r16/java-base-ret-locals/probe.mts $wt ts/src/$f.ts $out/$b.java 2>>$out/$b.err
done

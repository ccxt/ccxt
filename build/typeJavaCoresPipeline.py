#!/usr/bin/env python3
"""
Post-transpile entry point for the strictly-typed Java cores.

Runs after `build/javaTranspiler.ts` + `build/generateJavaWrappers.ts` have emitted the
untyped cores and the converting wrappers, and turns them into the typed form. It is
wired into every Java transpile npm script so that CI's force-transpile bot reproduces
exactly what is committed -- the generated Java in this repo is committed, so the passes
must be part of the generator, not a manual step.

Order matters:

  1. generateJavaTypedCoreHelpers.py  emits io/github/ccxt/TypedCores.java (to*/from*/
     fromTyped) by PARSING the type constructors. Must run first: the passes below emit
     calls to these helpers.
  2. typeJavaCores.py                 retypes the core signatures per the closed allowlist
     in build/javaTypedCores.ts, funnels the single supplyAsync tail through to*, retypes
     the hand-written async aliases, and wraps non-tail consuming call sites in from*.
  3. dropJavaThinWrappers.py          removes the now-redundant conversion from the
     generated wrappers.

`build/reconcileJavaTiers.py` is NOT run here: it edits the committed allowlist itself
and is a maintenance tool, run by hand when the tables need recomputing.
"""
import subprocess
import sys
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# `dropJavaThinWrappers.py` is gone: the separate `<X>.java extends <X>Core`
# wrapper layer no longer exists. `build/javaCoreSurface.ts --migrate` emits the
# typed public surface straight into the core and renames it to `<X>.java`, and
# it emits the already-converted `Helpers.joinTyped` form for every name in
# TYPED_CORES / PREDICTION_TYPED_CORES, so there is nothing left to strip.
STEPS = [
    'generateJavaTypedCoreHelpers.py',
    'typeJavaCores.py',
]


def main():
    for step in STEPS:
        path = os.path.join(HERE, step)
        print('--- %s ---' % step, flush=True)
        rc = subprocess.call([sys.executable, path])
        if rc != 0:
            print('typeJavaCoresPipeline: %s failed with %d' % (step, rc), file=sys.stderr)
            return rc
    return 0


if __name__ == '__main__':
    sys.exit(main())

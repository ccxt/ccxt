#!/usr/bin/env python3
"""
Post-transpile entry point for the typed Java core returns (JN-2 slice).

Runs after `build/javaTranspiler.ts` + `build/generateJavaWrappers.ts` have emitted the
cores and the wrappers, and retypes the async surface of the unified methods listed in
build/javaTypedCores.ts. It is wired into the Java transpile npm scripts so the committed
generated Java is reproduced by the generator, not by hand.

Order matters:

  1. generateJavaTypedCoreHelpers.py  emits io/github/ccxt/TypedCores.java (to*/from*/
     fromTyped) by PARSING the type constructors. Must run first: the passes below emit
     calls to these helpers.
  2. typeJavaCores.py                 retypes the core signatures per the closed allowlist
     in build/javaTypedCores.ts, funnels the single supplyAsync tail through to*, retypes
     the hand-written async aliases, and wraps consuming call sites in from*.

This slice keeps the typed wrapper layer (unlike ccxt/ccxt#30113, which folded it into
the cores): the wrappers' already-converted `Helpers.joinTyped` form for table names is
emitted by build/generateJavaWrappers.ts, so there is nothing to strip here.
"""
import subprocess
import sys
import os

HERE = os.path.dirname(os.path.abspath(__file__))

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

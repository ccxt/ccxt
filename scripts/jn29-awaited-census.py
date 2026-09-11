#!/usr/bin/env python3
"""Census of the awaited implicit-api locals in a generated java tree.

Counts, over java/lib/src/main/java/io/github/ccxt/exchanges/**:
  * declarations of the form `T x = (this.<endpoint>(...)).join()` grouped by T,
    split into api-endpoint calls (name present in the api/ table) and others;
  * accumulators `Object x = null;` written by an awaited api call.

usage: python3 jn29-awaited-census.py <tree-root>
"""
import collections
import glob
import os
import re
import sys

root = sys.argv[1]
api_dir = os.path.join(root, 'java/lib/src/main/java/io/github/ccxt/api')
api_sig = re.compile(r'public java\.util\.concurrent\.CompletableFuture<(.+?)>\s+(\w+) \(Object\.\.\. optionalArgs\)')
api = {}
for f in glob.glob(os.path.join(api_dir, '*.java')) + glob.glob(os.path.join(api_dir, 'prediction', '*.java')):
    for line in open(f):
        m = api_sig.search(line)
        if m:
            api[m.group(2)] = m.group(1)

decl = re.compile(r'^\s*(?:final\s+)?([A-Za-z_$][\w$<>., ]*?)\s+(\w+)\s*=\s*(\(this\.(\w+)\(.*\)\)\.join\(\));')
files = glob.glob(os.path.join(root, 'java/lib/src/main/java/io/github/ccxt/exchanges/**/*.java'), recursive=True)
c = collections.Counter()
for f in files:
    for line in open(f):
        m = decl.match(line)
        if m:
            t, ep = m.group(1).strip(), m.group(4)
            if ep in api:
                c[f'api-endpoint decl: {t}' if api[ep] != 'Object' else 'api-endpoint decl: (T=Object, union)'] += 1
            else:
                c['non-endpoint decl: ' + t] += 1
print(f'== {root}')
for k, v in sorted(c.items(), key=lambda kv: -kv[1]):
    print(f'  {v:6d}  {k}')
print(f'  {len(api):6d}  api endpoints in api/ dir; {sum(1 for v in api.values() if v == "Object"):5d} of them CompletableFuture<Object>')

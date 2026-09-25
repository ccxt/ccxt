#!/usr/bin/env python3
"""For each site in sites-before.tsv print the TS declaration + first concat line (ts/src)."""
import re, sys
for row in open(sys.argv[1]):
    f, ln, name, n, init = row.rstrip('\n').split('\t')
    ts = f.replace('cs/ccxt/exchanges/', 'ts/src/').replace('.cs', '.ts')
    src = open(ts).read().split('\n')
    # TS names: C# renames event->eventVar, base->bs, etc.
    tsname = {'eventVar': 'event', 'bs': 'base'}.get(name, name)
    key = init.split('(', 1)[1][:40]
    hits = [i for i, l in enumerate(src) if re.search(r'(const|let) ' + tsname + r' = this\.safeString', l)]
    print(f'== {ts} {tsname}  C#:{ln}  init {init[:80]}')
    for i in hits:
        for k in range(i, min(i + 40, len(src))):
            if k == i or re.search(r'(?<![\w.\'])' + tsname + r'\s*\+|\+\s*' + tsname + r'\b', src[k]):
                print(f'  {k+1}: {src[k].strip()[:150]}')

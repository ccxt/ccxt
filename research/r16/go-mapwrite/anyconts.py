#!/usr/bin/env python3
"""For AddElementToObject sites whose container is a `var x any` local: why is x any?
Buckets by (initializer head, set of rebinding RHS heads). usage: anyconts.py <ref>"""
import re, subprocess, sys, collections
REF = sys.argv[1]
def git(*a):
    return subprocess.run(['git', '-C', '/root/ccxt', *a], capture_output=True, text=True).stdout
files = [f for f in git('ls-tree', '-r', '--name-only', REF, 'go/').split('\n') if f.endswith('.go')]
head = lambda e: re.sub(r'\(.*', '(', e.strip())[:40]
c = collections.Counter(); rb = collections.Counter(); samples = collections.defaultdict(list)
for f in files:
    src = git('show', f'{REF}:{f}')
    if 'AddElementToObject(' not in src: continue
    lines = src.split('\n'); fstart = 0
    for i, l in enumerate(lines):
        if l.startswith('func '): fstart = i
        m = re.match(r'\s*(?:ccxt\.)?AddElementToObject\((\w+), ', l)
        if not m: continue
        n = m.group(1); init = None; rebinds = set()
        for j in range(fstart, len(lines)):
            if j > fstart and lines[j] == '}': break
            d = re.match(r'\s*var ' + n + r' any = (.*)', lines[j])
            if d: init = head(d.group(1))
            r = re.match(r'\s*' + n + r' = (.*)', lines[j])
            if r: rebinds.add(head(r.group(1)))
        if init is None: continue
        key = (init, tuple(sorted(rebinds)))
        c[key] += 1
        for r in rebinds: rb[r] += 1
        if len(samples[key]) < 2: samples[key].append(f'{f}:{i+1}')
print('TOTAL', sum(c.values()))
print('## rebind heads (sites)')
for k, v in rb.most_common(30): print(v, k)
print('## init/rebind buckets')
for k, v in c.most_common(40): print(v, k, samples[k])

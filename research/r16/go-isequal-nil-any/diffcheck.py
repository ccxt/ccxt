#!/usr/bin/env python3
"""Prove every changed generated-Go line is only IsEqual(x, nil) -> (x == nil) / !IsEqual(x, nil) -> (x != nil).
usage: diffcheck.py <base rev> <new rev or WORKTREE>"""
import re, subprocess, sys, collections
base, new = sys.argv[1], sys.argv[2]
cmd = ['git', 'diff', '-U0', base] + ([] if new == 'WORKTREE' else [new]) + ['--', 'go/v4']
diff = subprocess.run(cmd, capture_output=True, text=True).stdout
minus, plus, bad, n = [], [], 0, 0
per = collections.Counter()
def flush():
    global bad, n
    if len(minus) != len(plus):
        bad += 1; print('SHAPE', minus[:2], plus[:2]); return
    for a, b in zip(minus, plus):
        r = re.sub(r'!(?:ccxt\.)?IsEqual\((\w+), nil\)', r'(\1 != nil)', a)
        r = re.sub(r'(?<![.\w])(?:ccxt\.)?IsEqual\((\w+), nil\)', r'(\1 == nil)', r)
        # any IsEqual(x, nil) may legitimately stay; accept b if it is reachable by converting a subset
        cands = re.findall(r'!?(?:ccxt\.)?IsEqual\((\w+), nil\)', a)
        ok = False
        import itertools
        occ = list(re.finditer(r'(!?)(?<![.\w])(?:ccxt\.)?IsEqual\((\w+), nil\)', a))
        for mask in range(1, 1 << len(occ)):
            s, last = '', 0
            for i, m in enumerate(occ):
                s += a[last:m.start()]
                s += ('(' + m.group(2) + (' != nil)' if m.group(1) else ' == nil)')) if mask >> i & 1 else m.group(0)
                last = m.end()
            s += a[last:]
            if s == b: ok = True; n += bin(mask).count('1'); break
        if not ok: bad += 1; print('BAD\n-', a, '\n+', b)
for line in diff.split('\n'):
    if line.startswith('@@') or line.startswith('diff '):
        flush(); minus, plus = [], []
    elif line.startswith('-') and not line.startswith('---'): minus.append(line[1:])
    elif line.startswith('+') and not line.startswith('+++'): plus.append(line[1:])
flush()
print('converted', n, 'anomalies', bad)

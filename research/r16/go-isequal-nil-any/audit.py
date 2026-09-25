#!/usr/bin/env python3
"""For every converted site in the worktree diff, list every write of the local inside ITS func block."""
import re, subprocess, collections
files = subprocess.run(['git', 'diff', '--name-only', '--', 'go/v4'], capture_output=True, text=True).stdout.split()
heads = collections.Counter(); ex = {}
for f in files:
    d = subprocess.run(['git', 'diff', '-U0', '--', f], capture_output=True, text=True).stdout
    new = open(f).read().split('\n')
    starts = [i for i, l in enumerate(new) if l.startswith('func ')]
    seen = set()
    for m in re.finditer(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))?', d, re.M):
        a = int(m.group(1)) - 1; cnt = int(m.group(2) or 1)
        for ln in range(a, a + cnt):
            s = max([i for i in starts if i <= ln] or [0])
            e = next((i for i in starts if i > ln), len(new))
            fn = '\n'.join(new[s:e])
            for n in re.findall(r'\((\w+) [!=]= nil\)', new[ln]):
                if (f, s, n) in seen or not re.search(r'\bvar ' + n + r' any\b', fn): continue
                seen.add((f, s, n))
                for w in re.findall(r'(?:var ' + n + r' any = |^\s*' + n + r' = )([^\n]*)', fn, re.M):
                    h = re.sub(r'\bccxt\.', '', w); h = re.sub(r'\(.*', '(', h)[:40]
                    heads[h] += 1; ex.setdefault(h, (f, n, w[:100]))
for h, c in heads.most_common(): print(f'{c:5d} {h:40s} {ex[h]}')

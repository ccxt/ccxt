#!/usr/bin/env python3
"""Override-signature checker: every `override` needs another declaration of the same name
(a virtual when one exists, else an override in another file) with identical parameter types, else CS0115."""
import re, sys, pathlib, collections
SIG = re.compile(r'^\s*public (?:async )?(virtual|override) (?:async )?[^(=]*?\b(\w+)\((.*)\)\s*$')
def ptypes(params):
    out, depth, cur = [], 0, ''
    for ch in params:
        if ch in '<(': depth += 1
        if ch in '>)': depth -= 1
        if ch == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    if cur.strip(): out.append(cur)
    return tuple(re.sub(r'\s+\w+(\s*=.*)?$', '', p.strip()).replace('?', '') for p in out)
decls = collections.defaultdict(list)
for root in sys.argv[1:]:
    for f in pathlib.Path(root).rglob('*.cs'):
        if '/static/' in str(f): continue  # vendored code overrides BCL bases
        for n, line in enumerate(f.read_text(errors='replace').splitlines(), 1):
            m = SIG.match(line)
            if m: decls[m.group(2).lower()].append((ptypes(m.group(3)), m.group(1), f'{f}:{n}'))
bad = 0
for name, ds in sorted(decls.items()):
    for t, k, w in ds:
        if k != 'override': continue
        virtuals = [t2 for t2, k2, _ in ds if k2 == 'virtual']
        pool = virtuals if virtuals else [t2 for t2, _, w2 in ds if w2.split(':')[0] != w.split(':')[0]]
        if t not in pool:
            bad += 1
            print('MISMATCH', name, ','.join(t), w)
print(f'names {len(decls)} mismatches {bad}')
sys.exit(1 if bad else 0)

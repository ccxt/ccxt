#!/usr/bin/env python3
"""Classify the java diff vs the campaign base for the SS-11 report metrics."""
import re
import subprocess
from collections import defaultdict

diff = subprocess.run(['git', 'diff', '3ca818ac31e', 'HEAD', '--', 'java'],
                      capture_output=True, text=True, cwd='/root/worktrees/ss-11').stdout
minus, plus = [], []
for line in diff.splitlines():
    if line.startswith('---') or line.startswith('+++'):
        continue
    if line.startswith('-'):
        minus.append(line[1:])
    elif line.startswith('+'):
        plus.append(line[1:])
print('minus lines:', len(minus), 'plus lines:', len(plus))


def strip_casts(s):
    s = re.sub(r'\(\(String\)[ \t]*([A-Za-z_$][A-Za-z0-9_$]*)\)', r'\1', s)
    return re.sub(r'\(String\)[ \t]*', '', s)


def type_norm(s):
    return re.sub(r'\b(String|Object)\b', '<T>', s)


pindex = defaultdict(list)
pnorm_index = defaultdict(list)
for i, p in enumerate(plus):
    pindex[p].append(i)
    pnorm_index[type_norm(p)].append(i)
used = set()

sig = loc_typeonly = loc_cast_removed = 0
for m in minus:
    sa = strip_casts(m)
    cands = [i for i in pindex.get(sa, []) if i not in used]
    if cands:
        a = plus[cands[0]]
        used.add(cands[0])
        if re.match(r'^\s*(public|private|protected|static|final|\s)*String\s+\w+\s*\(', a) \
                and re.match(r'^\s*(public|private|protected|static|final|\s)*Object\s+\w+\s*\(', m):
            sig += 1
        elif re.match(r'^\s*String\s+\w+', a) and re.match(r'^\s*Object\s+\w+', m):
            loc_cast_removed += 1
        continue
    sb = type_norm(m)
    cands = [i for i in pnorm_index.get(sb, []) if i not in used]
    if cands:
        a = plus[cands[0]]
        used.add(cands[0])
        if re.match(r'^\s*(public|private|protected|static|final|\s)*Object\s+\w+\s*\(', m):
            sig += 1
        elif re.match(r'^\s*Object\s+\w+', m):
            loc_typeonly += 1
print('signature Object->String:', sig)
print('local Object->String (type-token only):', loc_typeonly)
print('local Object->String (cast also removed):', loc_cast_removed)
print('total locals retyped:', loc_typeonly + loc_cast_removed)
print('object_to_string total:', sig + loc_typeonly + loc_cast_removed)

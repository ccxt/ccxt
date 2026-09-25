#!/usr/bin/env python3
"""diffcheck.py <before dir> <after dir>: every changed line must be a declaration retype
(`var|Object X = rhs` -> `Map<String, Object> X = (Map<String, Object>) rhs`) or a dropped
Helpers.toMapArg(x) wrapper; prints counts and any other pair."""
import difflib, os, re, sys
a, b = sys.argv[1], sys.argv[2]
M = r'(?:java\.util\.)?Map<String, Object>'
kinds = {'decl': 0, 'tomaparg': 0, 'other': 0}
def norm(line):
    line = re.sub(r'^(\s*)' + M + r' (\w+) = \(' + M + r'\) ', r'\1var \2 = ', line)
    line = re.sub(r'^(\s*)' + M + r' (\w+) = ', r'\1var \2 = ', line)
    line = re.sub(r'^(\s*)Object (\w+) = ', r'\1var \2 = ', line)
    line = re.sub(r'^(\s*)(\w+) = \(' + M + r'\) (\(\((?:java\.util\.)?List<Object>\) \w+\)\.get\(1\))', r'\1\2 = \3', line)
    return line
def strip_conv(line):
    line = re.sub(r'\(\(' + M + r'\)(\w+)\)\.', r'\1.', line)
    return re.sub(r'Helpers\.toMapArg\((\w+)\)', r'\1', line)
for f in sorted(os.listdir(b)):
    x = open(os.path.join(a, f)).read().split('\n'); y = open(os.path.join(b, f)).read().split('\n')
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, x, y, autojunk=False).get_opcodes():
        if op == 'equal':
            continue
        if op != 'replace' or i2 - i1 != j2 - j1:
            kinds['other'] += 1; print('SHAPE', f, x[i1:i2], y[j1:j2]); continue
        for l, r in zip(x[i1:i2], y[j1:j2]):
            if strip_conv(norm(l)) != strip_conv(norm(r)):
                kinds['other'] += 1; print('OTHER', f, '\n -', l.strip(), '\n +', r.strip())
            else:
                if norm(l) != norm(r) or l != r and l.count('toMapArg') == r.count('toMapArg'):
                    kinds['decl'] += 1
                kinds['tomaparg'] += l.count('Helpers.toMapArg(') - r.count('Helpers.toMapArg(')
print(kinds)

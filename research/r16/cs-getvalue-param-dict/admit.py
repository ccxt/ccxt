#!/usr/bin/env python3
"""Fixed-point admission for `object market` -> IDictionary on name-keyed parse* families.

usage: admit.py TREE NAME...   (TREE holds cs/ and examples/ of the base sha)
A call `.NAME(arg0, market-arg, ...)` at the market position is proven when the argument is
null / omitted, a local declared Dictionary/IDictionary, or the enclosing method's own `market`
parameter AND that enclosing method's name is admitted (all-or-nothing, iterated to a fixed point).
Anything else (object local, getValue, cast, unknown) rejects the NAME.
"""
import os, re, sys

tree = sys.argv[1]
cands = set(sys.argv[2:])
SIG = re.compile(r'^(\s*)(?:public|private|protected|internal)[^(=;]*?\s(\w+)\((.*)\)\s*$')
DICT = ('Dictionary<string, object>', 'IDictionary<string, object>')


def split(s):
    out, d, cur = [], 0, ''
    for c in s:
        if c in '([{<': d += 1
        if c in ')]}>': d -= 1
        if c == ',' and d == 0:
            out.append(cur.strip()); cur = ''
        else:
            cur += c
    if cur.strip(): out.append(cur.strip())
    return out


# name -> market position (from declarations)
pos = {}
decl_ok = {}
files = []
for root in ('cs', 'examples'):
    for d, _, fs in os.walk(os.path.join(tree, root)):
        for f in fs:
            if f.endswith('.cs'):
                files.append(os.path.join(d, f))
for p in files:
    for line in open(p, encoding='utf-8', errors='replace'):
        m = SIG.match(line)
        if m and m.group(2) in cands:
            ps = split(m.group(3))
            idx = [i for i, x in enumerate(ps) if re.match(r'object market\b', x)]
            if not idx:
                decl_ok[m.group(2)] = False  # renamed / typed differently
                continue
            if pos.setdefault(m.group(2), idx[0]) != idx[0]:
                decl_ok[m.group(2)] = False
# call sites
sites = []  # (name, arg, enclosing method, enclosing has object market, local types, file:line)
for p in files:
    lines = open(p, encoding='utf-8', errors='replace').read().split('\n')
    enc, encmarket, locs = None, False, {}
    for i, line in enumerate(lines):
        m = SIG.match(line)
        if m:
            enc = m.group(2)
            encmarket = bool(re.search(r'\bobject market\b', m.group(3)))
            locs = {}
            for x in split(m.group(3)):
                mm = re.match(r'(.+?)\s+(\w+)(\s*=.*)?$', x)
                if mm: locs[mm.group(2)] = mm.group(1)
            continue
        for mm in re.finditer(r'^\s*(\w[\w<>, ?]*?)\s+(\w+)\s*(=|;)', line):
            t = mm.group(1)
            if t not in ('return', 'else', 'var'):
                prev = locs.get(mm.group(2))
                locs[mm.group(2)] = t if prev in (None, t) else '?conflict'
        for c in re.finditer(r'(?<![\w])(?:this|base|exchange)\.(\w+)\(', line):
            n = c.group(1)
            if n not in cands or n not in pos:
                continue
            j, dep, k = c.end(), 1, c.end()
            while k < len(line) and dep:
                dep += line[k] == '('; dep -= line[k] == ')'; k += 1
            args = split(line[j:k - 1])
            a = args[pos[n]] if len(args) > pos[n] else None
            sites.append((n, a, enc, encmarket, dict(locs), '%s:%d' % (os.path.relpath(p, tree), i + 1)))

admitted = {n for n in cands if decl_ok.get(n, True) and n in pos}
why = {}
changed = True
while changed:
    changed = False
    for n, a, enc, encmarket, locs, where in sites:
        if n not in admitted:
            continue
        ok = False
        if a is None or a == 'null':
            ok = True
        elif a == 'market' and locs.get('market') == 'object' and encmarket:
            ok = enc in admitted
        elif re.match(r'^\w+$', a or '') and locs.get(a) in DICT:
            ok = True
        if not ok:
            admitted.discard(n); why[n] = '%s arg=%r in %s (%s)' % (where, a, enc, locs.get(a or '', '?'))
            changed = True
for n in sorted(cands):
    print('ADMIT ' if n in admitted else 'REJECT', n, '' if n in admitted else why.get(n, 'decl'))

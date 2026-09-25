#!/usr/bin/env python3
"""Classify Go AddElementToObject(container, key, value) sites by printed static types.
usage: size.py <git-ref> [--samples N]"""
import re, subprocess, sys, collections, json

REF = sys.argv[1]
NS = int(sys.argv[sys.argv.index('--samples') + 1]) if '--samples' in sys.argv else 3
REPO = '/root/ccxt'

def git(*a):
    return subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True, check=True).stdout

files = [f for f in git('ls-tree', '-r', '--name-only', REF, 'go/').split('\n')
         if f.endswith('.go')]

def split_args(s, i):
    """s[i] is just after '('; return list of args and end index."""
    depth, args, cur, j, instr = 0, [], [], i, None
    while j < len(s):
        c = s[j]
        if instr:
            cur.append(c)
            if c == '\\':
                cur.append(s[j + 1]); j += 2; continue
            if c == instr:
                instr = None
        elif c in '"`':
            instr = c; cur.append(c)
        elif c in '([{':
            depth += 1; cur.append(c)
        elif c in ')]}':
            if depth == 0:
                args.append(''.join(cur).strip()); return args, j
            depth -= 1; cur.append(c)
        elif c == ',' and depth == 0:
            args.append(''.join(cur).strip()); cur = []
        else:
            cur.append(c)
        j += 1
    return args, j

FUNC = re.compile(r'^func .*$', re.M)
IDENT = re.compile(r'^[A-Za-z_]\w*$')

def decl_type(body_before, sig, name):
    # nearest preceding declaration in the function
    best = None
    for m in re.finditer(r'\bvar ' + re.escape(name) + r' ([^=\n]+?)(?: =|\n)', body_before):
        best = m.group(1).strip()
    for m in re.finditer(r'\b' + re.escape(name) + r' := ', body_before):
        best = best or ':='
    if best:
        return best
    m = re.search(r'[(,]\s*' + re.escape(name) + r' ([^,)]+)', sig)
    if m:
        return 'param:' + m.group(1).strip()
    return '?'

def classify_expr(e, before, sig):
    e = e.strip()
    while e.startswith('(') and e.endswith(')'):
        a, end = split_args(e, 1)
        if end == len(e) - 1 and len(a) == 1:
            e = e[1:-1].strip()
        else:
            break
    if e.startswith('"'):
        return 'lit-string'
    if re.match(r'^-?\d+$', e):
        return 'lit-int'
    if re.match(r'^-?[\d.]+(e-?\d+)?$', e):
        return 'lit-float'
    if e in ('true', 'false'):
        return 'lit-bool'
    if e == 'nil':
        return 'nil'
    if e.startswith('map[string]any{'):
        return 'maplit'
    if e.startswith('[]any{'):
        return 'slicelit'
    if IDENT.match(e):
        return 'id:' + decl_type(before, sig, e)
    if e.startswith('this.') and IDENT.match(e[5:]):
        return 'field:' + e[5:]
    m = re.match(r'^(ccxt\.)?([\w.]+)\(', e)
    if m:
        callee = m.group(2)
        if callee.startswith('this.'):
            return 'call:this.' + callee[5:]
        return 'call:' + callee
    if re.match(r'^\w+\[', e):
        return 'index'
    if e.startswith('*'):
        return 'deref'
    return 'other'

stats = collections.Counter()
by = {k: collections.Counter() for k in ('cont', 'key', 'val', 'triple')}
samples = collections.defaultdict(list)
total = 0
for f in files:
    src = git('show', f'{REF}:{f}')
    if 'AddElementToObject(' not in src:
        continue
    funcs = [m.start() for m in FUNC.finditer(src)]
    for m in re.finditer(r'(?<![\w.])(ccxt\.)?AddElementToObject\(', src):
        args, _ = split_args(src, m.end())
        if len(args) != 3:
            continue
        total += 1
        fs = max([p for p in funcs if p < m.start()], default=0)
        sig = src[fs:src.find('\n', fs)]
        before = src[fs:m.start()]
        c, k, v = (classify_expr(a, before, sig) for a in args)
        by['cont'][c] += 1; by['key'][k] += 1; by['val'][v] += 1
        t = f'{c} | {k} | {v}'
        by['triple'][t] += 1
        if len(samples[t]) < NS:
            samples[t].append(f"{f}:{src.count(chr(10), 0, m.start()) + 1}: {src[m.start():m.start() + 140].splitlines()[0]}")

print('TOTAL', total)
for k in ('cont', 'key', 'val'):
    print(f'\n## {k}')
    for n, c in by[k].most_common(40):
        print(f'{c:6d}  {n}')
print('\n## triples')
for n, c in by['triple'].most_common(80):
    print(f'{c:6d}  {n}')
    for s in samples[n]:
        print('          ', s)

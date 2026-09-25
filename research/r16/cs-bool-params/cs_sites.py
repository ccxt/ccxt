#!/usr/bin/env python3
"""Fixpoint admission for boolean params over a generated C# tree.

usage: cs_sites.py <tree root containing cs/ (+examples/cs)> <census.json> [--table]
For each (ts name, position) whose every ts/src declaration is boolean-ish, check every C#
declaration (prints `object` there; hand-written ones reported) and every C# call site
argument; target bool (required everywhere) or bool? (optional anywhere), downgraded
bool -> bool? -> rejected until stable.
"""
import json, os, re, sys

root, census = sys.argv[1], sys.argv[2]
rows = json.load(open(census))

GENERATED = re.compile(r'^cs/(ccxt/exchanges/|ccxt/base/Exchange\.(BaseMethods|TradingMethods)\.cs|tests/Generated/)')
files = {}
for base in ('cs', 'examples/cs'):
    for dp, dn, fn in os.walk(os.path.join(root, base)):
        for f in fn:
            if f.endswith('.cs'):
                p = os.path.join(dp, f)
                files[os.path.relpath(p, root)] = open(p, encoding='utf8', errors='replace').read().split('\n')

SIG = re.compile(r'^\s*(?:public|private|protected|internal)\b[^=;(]*?\b(\w+)\(')

def strip(line):
    out, q, i = [], None, 0
    while i < len(line):
        c = line[i]
        if q:
            if c == '\\':
                out.append('__'); i += 2; continue
            if c == q:
                q = None
            out.append(c if c == q or q is None else '_')
        else:
            if c in '"\'':
                q = c
            elif line.startswith('//', i):
                break
            out.append(c)
        i += 1
    return ''.join(out)

def split_args(text, open_idx):
    depth, cur, args, i = 0, '', [], open_idx + 1
    while i < len(text):
        c = text[i]
        if c in '([{<' and not (c == '<' and False):
            if c != '<': depth += 1
        if c in ')]}':
            if depth == 0:
                args.append(cur.strip()); return args, i
            depth -= 1
        if c == ',' and depth == 0:
            args.append(cur.strip()); cur = ''; i += 1; continue
        cur += c; i += 1
    return None, None

# method regions: (file, start line, end line, name, params {name: type}, param list)
regions = []
for rel, lines in files.items():
    starts = []
    for i, l in enumerate(lines):
        m = SIG.match(strip(l))
        if m and not strip(l).rstrip().endswith(';'):
            starts.append((i, m.group(1)))
    for n, (s, name) in enumerate(starts):
        e = starts[n + 1][0] if n + 1 < len(starts) else len(lines)
        text = ' '.join(strip(x) for x in lines[s:s + 12])
        o = text.find(name + '(') + len(name)
        args, _ = split_args(text, o)
        plist = []
        for a in (args or []):
            a = a.split('=')[0].strip()
            parts = a.rsplit(' ', 1)
            if len(parts) == 2:
                plist.append((parts[1], parts[0].replace('params ', '').strip()))
        regions.append({'file': rel, 'start': s, 'end': e, 'name': name, 'plist': plist, 'params': dict(plist)})

def cs_names(n):
    return {n, n[0].upper() + n[1:]}

cands = {}
for r in rows:
    kinds = r['kinds']
    if not all(k.startswith(('boolean', 'Bool', 'inferred')) for k in kinds):
        continue
    optional = any(('=' in k) or k.endswith('?') or k.startswith('Bool') for k in kinds)
    cands[(r['name'], r['i'])] = {'target': 'bool?' if optional else 'bool', 'optional': optional, 'why': []}

decls = {}
for key in cands:
    name, pos = key
    ds = [g for g in regions if g['name'] in cs_names(name) and len(g['plist']) > pos]
    decls[key] = ds
    for g in ds:
        t = g['plist'][pos][1]
        if t != 'object':
            cands[key]['why'].append('decl-type %s %s:%d' % (t, g['file'], g['start'] + 1))
        if not GENERATED.match(g['file']):
            cands[key].setdefault('hand', []).append('%s:%d' % (g['file'], g['start'] + 1))
    if not ds:
        cands[key]['why'].append('no-cs-decl')

def region_of(rel, i):
    best = None
    for g in regions:
        if g['file'] == rel and g['start'] <= i < g['end']:
            best = g
    return best

LOCAL = lambda v: re.compile(r'(?<![\w.])(bool\??|object|var|[\w<>?,\s]+?)\s+' + re.escape(v) + r'\s*(=|;)')

def body_writes(g, pname):
    lines = files[g['file']]
    w = re.compile(r'(?<![\w.])' + re.escape(pname) + r'\s*(=(?!=)|\?\?=|\+\+|--)|(?:ref|out)\s+' + re.escape(pname) + r'\b')
    for k in range(g['start'] + 1, g['end']):
        s = strip(lines[k])
        m = w.search(s)
        if m:
            if re.match(r'^\s*' + re.escape(pname) + r'\s*\?\?=\s*(true|false)\s*;', s):
                continue
            return lines[k].strip()
    return None

# param-level body checks that break a non-nullable bool
def bool_hostile(g, pname):
    lines = files[g['file']]
    h = re.compile(r'(?<![\w.])' + re.escape(pname) + r'\s*(==|!=)\s*null|null\s*(==|!=)\s*' + re.escape(pname) + r'\b|(?<![\w.])' + re.escape(pname) + r'\s*\?\?|(?<![\w.])' + re.escape(pname) + r'\s+is\b')
    for k in range(g['start'] + 1, g['end']):
        if h.search(strip(lines[k])):
            return lines[k].strip()
    return None

for key, c in cands.items():
    name, pos = key
    for g in decls[key]:
        pname = g['plist'][pos][0]
        w = body_writes(g, pname)
        if w:
            c['why'].append('write %s:%d %s' % (g['file'], g['start'] + 1, w[:80]))

# call sites
sites = {key: [] for key in cands}
for rel, lines in files.items():
    for i, l in enumerate(lines):
        s = strip(l)
        if '(' not in s or re.match(r'^\s*(\*|///|/\*)', s):
            continue
        for key in cands:
            name, pos = key
            for nm in cs_names(name):
                for m in re.finditer(r'(?<![\w])' + nm + r'\(', s):
                    if SIG.match(s) and SIG.match(s).group(1) == nm:
                        continue
                    pre = s[:m.start()]
                    if re.search(r'(void|object|Task<[^>]*>|bool\??|string\??)\s*$', pre):
                        continue
                    text = s
                    k = i
                    args, end = split_args(text, m.end() - 1)
                    while args is None and k + 1 < len(lines) and k < i + 15:
                        k += 1
                        text += ' ' + strip(lines[k])
                        args, end = split_args(text, m.end() - 1)
                    if args is None:
                        sites[key].append((rel, i, None)); continue
                    if args == ['']:
                        args = []
                    sites[key].append((rel, i, args[pos] if pos < len(args) else '<omit>'))

BOOLCALL = re.compile(r'^!|^\(?(isEqual|isTrue|inOp|isGreaterThan\w*|isLessThan\w*|Precise\.string(Eq|Gt|Ge|Lt|Le)\w*)\(|^\(.* (==|!=) .*\)$')
NULLBOOLCALL = re.compile(r'^this\.safeBool(2|N)?\(')

def arg_type(rel, i, a, admitted):
    a = a.strip()
    if a in ('true', 'false'):
        return 'bool'
    if a == 'null':
        return 'null'
    if BOOLCALL.search(a) and a.count('?') == 0:
        return 'bool'
    if NULLBOOLCALL.search(a):
        return 'bool?'
    if re.match(r'^\w+$', a):
        g = region_of(rel, i)
        if g is None:
            return None
        if a in g['params']:
            idx = [p[0] for p in g['plist']].index(a)
            t = g['params'][a]
            for key, c in admitted.items():
                if g['name'] in cs_names(key[0]) and key[1] == idx and c['target']:
                    if body_writes(g, a):
                        return None
                    return c['target']
            return t if t in ('bool', 'bool?') else None
        lines = files[rel]
        found = set()
        for k in range(g['start'], i + 1):
            for m in re.finditer(r'(?<![\w.<])(bool\??|object|var|string\??|Int64\??|double\??|int|[A-Z][\w<>, ]*?)\s+' + re.escape(a) + r'\s*(=|;|\))', strip(lines[k])):
                found.add(m.group(1).strip())
        if len(found) == 1 and list(found)[0] in ('bool', 'bool?'):
            t = list(found)[0]
            # a later write of an object value would already fail C#; declared type is the static type
            return t
        return None
    return None

ASSIGN = {'bool': {'bool'}, 'bool?': {'bool', 'bool?', 'null'}}

changed = True
while changed:
    changed = False
    for key, c in cands.items():
        if c['target'] is None:
            continue
        if c['why'] and any(not w.startswith('site') for w in c['why']):
            c['target'] = None; changed = True; continue
        bad = []
        for rel, i, a in sites[key]:
            if a is None:
                bad.append('%s:%d unparsed' % (rel, i + 1)); continue
            if a == '<omit>':
                if not c['optional']:
                    bad.append('%s:%d omitted' % (rel, i + 1))
                continue
            t = arg_type(rel, i, a, cands)
            if t is None or t not in ASSIGN[c['target']]:
                bad.append('%s:%d %s -> %s' % (rel, i + 1, a[:60], t))
        if c['target'] == 'bool':
            for g in decls[key]:
                h = bool_hostile(g, g['plist'][key[1]][0])
                if h:
                    bad.append('hostile %s:%d %s' % (g['file'], g['start'] + 1, h[:60]))
        if bad:
            if c['target'] == 'bool':
                c['target'] = 'bool?'
            else:
                c['target'] = None
                c['why'] += ['site ' + b for b in bad]
            changed = True

ok = {k: c for k, c in cands.items() if c['target']}
print('candidates', len(cands), 'admitted', len(ok))
for k, c in sorted(cands.items()):
    print(('OK ' if c['target'] else 'NO ') + '%s %d %s decls=%d sites=%d hand=%s' % (k[0], k[1], c['target'], len(decls[k]), len(sites[k]), c.get('hand', [])))
    if not c['target']:
        for w in c['why'][:4]:
            print('     ', w)
if '--table' in sys.argv:
    print(json.dumps({k[0] + '#' + str(k[1]): c['target'] for k, c in sorted(ok.items())}, indent=1))

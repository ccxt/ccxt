#!/usr/bin/env python3
"""Census: for every TS interface in ts/src/base/types.ts with a Java counterpart,
compare each member's TS type text against the Java field's declared type and flag
suspicious cases: Java raw (Object/List<Object>/Map<String,Object> non-info) while
TS names a shape; Java missing a field TS has; Java field count mismatch."""
import re, sys, os

TS = 'ts/src/base/types.ts'
JAVA = 'java/lib/src/main/java/io/github/ccxt/types'

ts = open(TS).read()

# --- parse TS interfaces (top level only, brace depth) ---
def parse_ts_interfaces(src):
    out = {}
    for m in re.finditer(r'export interface (\w+)(?: extends [^{]+)? \{', src):
        name = m.group(1)
        i = m.end()
        depth = 1
        while i < len(src) and depth > 0:
            if src[i] == '{': depth += 1
            elif src[i] == '}': depth -= 1
            i += 1
        body = src[m.end():i-1]
        fields = []
        # strip line comments
        body2 = re.sub(r'//[^\n]*', '', body)
        # split at top-level commas/semicolons
        parts, depth, cur = [], 0, ''
        for ch in body2:
            if ch in '{[(': depth += 1
            elif ch in '}])': depth -= 1
            if ch in ',;' and depth == 0:
                parts.append(cur); cur = ''
            else:
                cur += ch
        if cur.strip(): parts.append(cur)
        for p in parts:
            p = p.strip()
            if not p or p.startswith('/'): continue
            mm = re.match(r"([\w$]+)\s*\??\s*:\s*([\s\S]+)$", p)
            if mm:
                ftype = ' '.join(mm.group(2).split())
                fields.append((mm.group(1).rstrip('?'), ftype))
        out[name] = fields
    return out

ts_ifaces = parse_ts_interfaces(ts)

# --- parse Java classes ---
def parse_java(path):
    src = open(path).read()
    fields = []
    for m in re.finditer(r'^ {4}public ([\w<>, .\[\]]+?) (\w+);', src, re.M):
        fields.append((m.group(2), m.group(1).strip()))
    return fields

# TS name -> Java class name mapping (from emitter)
ts_to_class = {'FeeInterface': 'Fee'}
class_to_ts = {v: k for k, v in ts_to_class.items()}

TS_NAMED = set(ts_ifaces.keys())
# aliases (type X = ...) too
aliases = {m.group(1): m.group(2) for m in re.finditer(r'export type (\w+) = ([\s\S]*?);', ts)}

report = []
for jf in sorted(os.listdir(JAVA)):
    if not jf.endswith('.java'): continue
    cls = jf[:-5]
    tsname = class_to_ts.get(cls, cls)
    if tsname not in ts_ifaces:
        continue
    java_fields = parse_java(os.path.join(JAVA, jf))
    jnames = {n for n, _ in java_fields}
    for (fn, ft) in ts_ifaces[tsname]:
        # skip pure scalar/primitive/any/dict-of-any fields
        refs = re.findall(r'[A-Z]\w+', ft)
        named = [r for r in refs if r in TS_NAMED or r in aliases]
        inline = '{' in ft
        if not named and not inline:
            continue
        # find java field (event -> eventId rename)
        jn = 'eventId' if fn == 'event' else fn
        if jn not in jnames:
            report.append((cls, fn, ft, 'MISSING in Java'))
            continue
        jt = dict(java_fields)[jn]
        if 'Object' in jt and not (jt == 'Map<String, Object>' and fn == 'info'):
            report.append((cls, fn, ft, 'RAW: ' + jt))
        else:
            report.append((cls, fn, ft, 'java=' + jt))

print('=== TS member -> Java field for every member that references a named/ inline TS shape ===')
for r in report:
    flag = '  <<< CHECK' if ('RAW' in r[3] or 'MISSING' in r[3]) else ''
    print(f'{r[0]:24s} {r[1]:22s} TS={r[2][:70]:72s} {r[3]}{flag}')

# Also: whole-class field diff (fields in TS but not Java)
print()
print('=== classes where TS declares a field Java lacks ===')
for jf in sorted(os.listdir(JAVA)):
    if not jf.endswith('.java'): continue
    cls = jf[:-5]
    tsname = class_to_ts.get(cls, cls)
    if tsname not in ts_ifaces: continue
    java_fields = parse_java(os.path.join(JAVA, jf))
    jnames = {n for n, _ in java_fields}
    for (fn, ft) in ts_ifaces[tsname]:
        jn = 'eventId' if fn == 'event' else fn
        if jn not in jnames:
            print(f'{cls}: missing {fn}: {ft[:70]}')

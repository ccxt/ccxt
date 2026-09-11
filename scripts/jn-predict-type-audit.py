#!/usr/bin/env python3
# JN-10 (b): field-level audit of the java Prediction* type classes against the TS
# source of truth (ts/src/base/types.ts). Reports for every Prediction* interface:
#   * TS fields missing from the Java class (modulo the documented `event`->`eventId`
#     rename and the always-last `info`)
#   * Java fields with no TS counterpart
#   * Java container value types that differ from the TS element type mapping
# Usage: python3 scripts/jn-predict-type-audit.py [repo-root]
import os, re, sys, collections

root = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
types_ts = os.path.join(root, 'ts/src/base/types.ts')
java_dir = os.path.join(root, 'java/lib/src/main/java/io/github/ccxt/types')

text = open(types_ts, encoding='utf-8').read()
# strip comments (keep lines) to make parsing simpler
lines = text.split('\n')

# TS: map of interface name -> list of (field, tsType, optional)
interfaces = collections.OrderedDict()
cur = None
for line in lines:
    m = re.match(r'export interface (\w+)(?:\s+extends\s+Dictionary<(\w+)>)?\s*\{', line)
    if m:
        cur = m.group(1)
        interfaces[cur] = []
        continue
    if cur is not None:
        if line.strip() == '}':
            cur = None
            continue
        fm = re.match(r'\s*(\w+)\??:\s*([^;]+?);', line)
        if fm:
            name = fm.group(1)
            t = fm.group(2)
            # strip trailing comment
            t = re.sub(r'\s*//.*$', '', t).strip()
            interfaces[cur].append((name, t))

# Java: map of class name -> list of (field, javaType)
def java_fields(path):
    out = []
    for line in open(path, encoding='utf-8'):
        m = re.match(r'^ {4}public (?:final |volatile )?(.+?) (\w+);', line)
        if m:
            out.append((m.group(2), m.group(1)))
    return out

RENAME = {'event': 'eventId'}
TS_TO_JAVA = {
    'Str': 'String', 'string': 'String', 'Num': 'Double', 'number': 'Double',
    'Bool': 'Boolean', 'boolean': 'Boolean', 'Int': 'Long', 'int': 'Long',
    'any': 'Object', 'Dict': 'Map<String, Object>',
    # the Java port models the order union aliases as plain String (no Java enum);
    # see Order.java's `public String type; public String side;`
    'OrderType': 'String', 'OrderSide': 'String',
}
# Java-only fields that are the port's documented modelling choices
ALLOWED_JAVA_ONLY = {
    ('PredictionTickers', 'tickers'),   # the `extends Dictionary<T>` wrapper body
}
# fields whose Java dict spelling is deliberate even though TS says `any`
DICT_LIKE = {('PredictionOrderRequest', 'params')}

def tuple_java(els):
    # a tuple prints as a List of its members — one type param when homogeneous,
    # List<Object> otherwise (Java generics cannot hold a heterogeneous pair)
    if len(set(els)) == 1:
        return f'List<{els[0]}>'
    return 'List<Object>'

def map_ts_type(t):
    t = t.strip()
    # strip the TS nullability members before mapping
    members = [x.strip() for x in t.split('|') if x.strip() not in ('undefined', 'null')]
    if len(members) == 1:
        t = members[0]
    elif len(members) > 1 and not t.endswith('[]'):
        # a union of literals + an alias (e.g. 'buy' | 'sell' | Str) -> the alias mapping
        for cand, java in (('Str', 'String'), ('string', 'String'), ('Bool', 'Boolean'), ('Num', 'Double'), ('Int', 'Long')):
            if cand in members:
                return java
        return 'Object'
    if t.endswith('[][]'):
        return f'List<{map_ts_type(t[:-4])}>'  # handled by generic array below in practice
    if t.endswith('[]'):
        inner = t[:-2].strip()
        if inner.startswith('[') and inner.endswith(']'):
            # a tuple element: [Num, Num][] -> List<List<Double>> (the tuple prints as
            # a List of its members; the array wraps those pair-lists)
            els = [map_ts_type(x) for x in inner[1:-1].split(',')]
            return f'List<{tuple_java(els)}>'
        return f'List<{map_ts_type(inner)}>'
    if t.startswith('[') and t.endswith(']'):
        els = [map_ts_type(x) for x in t[1:-1].split(',')]
        return tuple_java(els)
    if t.startswith('{'):
        return '(inline)'
    if t in TS_TO_JAVA:
        return TS_TO_JAVA[t]
    return t  # named type (e.g. Fee, Precision, PredictionTicker)

problems = []
checked = 0
for name, fields in interfaces.items():
    if not name.startswith('Prediction'):
        continue
    jpath = os.path.join(java_dir, name + '.java')
    if not os.path.exists(jpath):
        problems.append(f'{name}: no Java class')
        continue
    jf = java_fields(jpath)
    jmap = {n: t for n, t in jf}
    ts_names = set()
    for fname, tstype in fields:
        jname = RENAME.get(fname, fname)
        ts_names.add(jname)
        if tstype.startswith('{'):
            # inline object: Java uses a named helper class (e.g. Limits); counted as
            # present when the field itself exists in Java
            checked += 1
            if jname not in jmap:
                problems.append(f'{name}.{fname}: missing in Java (TS inline {tstype})')
            continue
        if jname == 'info':
            continue
        if jname not in jmap:
            problems.append(f'{name}.{fname}: missing in Java (TS {tstype})')
            continue
        expected = map_ts_type(tstype)
        actual = jmap[jname].replace('java.util.', '')
        checked += 1
        if expected != actual and expected != '(inline)':
            if (name, jname) in DICT_LIKE and actual.startswith('Map<'):
                continue
            problems.append(f'{name}.{jname}: Java {actual} != TS-expected {expected} (TS {tstype})')
    for jn, jt in jf:
        if jn == 'info':
            continue
        if jn not in ts_names and (name, jn) not in ALLOWED_JAVA_ONLY:
            problems.append(f'{name}.{jn}: Java-only field ({jt})')

print(f'Prediction* interfaces: {sum(1 for n in interfaces if n.startswith("Prediction"))}')
print(f'field checks: {checked}')
if problems:
    print(f'ISSUES ({len(problems)}):')
    for p in problems:
        print('  ' + p)
    sys.exit(1)
print('OK: every TS field is present in the Java class with the mapped type')

#!/usr/bin/env python3
"""SS-09 census: the map put/get channel for safeString values.

A safeString result that is STORED into a map field / object literal and READ BACK
prints through four hand-written emitters (see build/java-local-types.js,
"SS-09: map put/get channel String casts"):

    map[k] = v        ->  Helpers.addElementToObject(map, k, v)      (put)
    { 'k': v }        ->  new java.util.HashMap<String, Object>() {{ put( "k", v ) }}
    map[k]           ->  Helpers.GetValue(map, k)                    (get / read back)
    this.safeString(map, k[, d])                                     (typed get)

The script measures, over the generated tree on disk (what javac sees):

  A. every `((String)IDENT)` checkcast whose *nearest enclosing call on its printed
     line* is one of the map put/get emitters, resolved against the IDENT's
     enclosing-scope declaration (method params + locals):
       * operand declared `String` -> the checkcast is a runtime no-op, DROPPABLE
         (patchJavaMapChannelStringCasts drops it, print-order-proof based),
       * operand declared anything else -> the cast may fire, NOT droppable (the
         operand's own typing is another slice's root cause);
  B. the helper signatures — exactly ONE declaration per name, all with `Object`
     parameters (there is no String-typed overload a String could rebind to, so a
     String argument compiles with zero casts and the same invoke descriptor);
  C. the object-literal emit census: `put(` appears only inside
     `new java.util.HashMap<String, Object>()` double-brace initializers, and
     `Map.of` appears nowhere (rejection: no generated Map.of site exists).

Usage:  python3 build/ss09-map-channel-census.py [--root java/lib/src/main/java]
Exit code 0; prints a report. Read-only.
"""
import re
import sys
import collections
from pathlib import Path

ROOT = Path(sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == '--root' else 'java/lib/src/main/java')

CAST = re.compile(r'\(\(String\)\s*([A-Za-z_$][\w$]*)\s*\)')
METHOD_START = re.compile(r'^    (?:public|private|protected)\s')
DECL = re.compile(r'^\s*(?:final\s+|static\s+|volatile\s+)*'
                  r'(String|Object|Long|Double|Integer|Boolean|int|long|double|var|'
                  r'java\.util\.Map<String, Object>|java\.util\.List<Object>|[A-Za-z_$][\w$.<>]*)\s+'
                  r'(\w+)\s*=')
PARAM = re.compile(r'\b(String|Object|Long|Double|Integer|Boolean|int|long|double|'
                   r'java\.util\.Map<String, Object>|java\.util\.List<Object>|[A-Za-z_$][\w$.<>]*)\s+(\w+)\s*(?=[,)])')

MAP_CHANNEL_CALLS = {
    'addElementToObject': 'map-put (Helpers.addElementToObject)',
    'GetValue': 'map-get (Helpers.GetValue)',
    'safeString': 'typed map-get (this.safeString)',
    'safeString2': 'typed map-get (this.safeString2)',
    'safeStringN': 'typed map-get (this.safeStringN)',
    'put': 'object-literal put(...)',
}


def enclosing_call(line, idx):
    """name of the nearest unclosed call whose argument list contains `idx`"""
    depth = 0
    i = idx - 1
    while i >= 0:
        c = line[i]
        if c == ')':
            depth += 1
        elif c == '(':
            if depth == 0:
                j = i - 1
                while j >= 0 and (line[j].isalnum() or line[j] in '_.$'):
                    j -= 1
                return line[j + 1:i]
            depth -= 1
        i -= 1
    return None


def method_window(lines, i):
    n = len(lines)
    start = i
    for k in range(i, max(0, i - 2000), -1):
        if METHOD_START.match(lines[k]):
            start = k
            break
    depth = 0
    end = n - 1
    for j in range(start, n):
        depth += lines[j].count('{') - lines[j].count('}')
        if j > start and depth <= 0:
            end = j
            break
    return start, end


def declared_type(lines, start, i, name):
    found = None
    sig = ' '.join(lines[start:start + 4])
    for pm in PARAM.finditer(sig):
        if pm.group(2) == name:
            found = pm.group(1)
    for k in range(start, i + 1):
        dm = DECL.match(lines[k])
        if dm and dm.group(2) == name:
            found = dm.group(1)
    return found


def main():
    files = sorted(p for p in ROOT.rglob('*.java'))
    per_channel = collections.Counter()
    per_channel_typed = collections.Counter()
    droppable, kept = [], []
    total_casts = 0
    receiver_casts = 0
    for path in files:
        try:
            lines = path.read_text(errors='replace').split('\n')
        except OSError:
            continue
        for i, line in enumerate(lines):
            for m in CAST.finditer(line):
                total_casts += 1
                after = line[m.end():].lstrip()
                if after.startswith('.'):
                    receiver_casts += 1
                    continue
                call = enclosing_call(line, m.start())
                if call is None:
                    continue
                name = call.split('.')[-1]
                ch = None
                if name == 'GetValue':
                    # Helpers.GetValue(recv, key): a cast in the FIRST argument is the
                    # container (the printed shape of `(x as string)[idx]` — an
                    # element-access RECEIVER, a String index read, not a map key/value
                    # slot this patch covers); the key argument is the channel.
                    head = line[:m.start()]
                    open_idx = head.rfind('(')
                    arg_prefix = line[open_idx + 1:m.start()]
                    if ',' not in arg_prefix:
                        pass  # first argument — receiver position, out of scope
                    else:
                        ch = MAP_CHANNEL_CALLS['GetValue']
                else:
                    ch = MAP_CHANNEL_CALLS.get(name)
                if ch is None:
                    continue
                start, _end = method_window(lines, i)
                t = declared_type(lines, start, i, m.group(1))
                per_channel[ch] += 1
                per_channel_typed[(ch, t)] += 1
                row = (str(path), i + 1, m.group(1), t, line.strip()[:140])
                (droppable if t == 'String' else kept).append(row)

    print('== SS-09 map put/get channel census ==')
    print('tree:', ROOT, ' files:', len(files))
    print('total ((String)IDENT) occurrences in tree:', total_casts)
    print('  of which `((String)x).method()` receiver casts:', receiver_casts)
    print('occurrences at a map put/get position:', sum(per_channel.values()))
    print()
    print('-- by channel:')
    for ch, n in per_channel.most_common():
        print(f'   {n:5d}  {ch}')
    print()
    print('-- by channel x operand declaration:')
    for (ch, t), n in sorted(per_channel_typed.items()):
        print(f'   {n:5d}  {ch:40s} {t if t else "UNRESOLVED"}')
    print()
    print(f'-- droppable (operand declared String): {len(droppable)}')
    for row in droppable:
        print('   ', row[0].split('io/github/ccxt/')[-1], row[1], row[2], '|', row[4])
    print()
    print(f'-- kept (operand not declared String): {len(kept)}  (first 12)')
    for row in kept[:12]:
        print('   ', row[0].split('io/github/ccxt/')[-1], row[1], row[2], row[3], '|', row[4])

    print()
    print('-- helper signature census (one declaration per name, Object parameters):')
    helpers = ROOT / 'io/github/ccxt/Helpers.java'
    if not helpers.exists():
        helpers = Path('java/lib/src/main/java/io/github/ccxt/Helpers.java')
    if helpers.exists():
        src = helpers.read_text()
        for name in ('addElementToObject', 'GetValue'):
            decls = re.findall(r'public static [\w<>,.\[\] ]+ ' + name + r'\s*\(([^)]*)\)', src)
            print(f'   Helpers.{name}: {len(decls)} declaration(s) -> {decls}')
    base = Path('java/lib/src/main/java/io/github/ccxt/BaseExchange.java')
    if base.exists():
        src = base.read_text()
        for name in ('safeString', 'safeString2', 'safeStringN'):
            decls = re.findall(r'public [\w<>,.\[\] ]+ ' + name + r'\s*\(([^)]*)\)', src)
            print(f'   BaseExchange.{name}: {len(decls)} declaration(s) -> {decls}')
    mapof = double_brace = 0
    for path in files:
        try:
            text = path.read_text(errors='replace')
        except OSError:
            continue
        mapof += text.count('Map.of(')
        double_brace += text.count('new java.util.HashMap<String, Object>() {{')
    print(f'   Map.of occurrences in generated tree: {mapof}')
    print(f'   double-brace HashMap put() initializers: {double_brace}')


if __name__ == '__main__':
    main()

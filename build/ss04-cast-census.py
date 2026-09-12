#!/usr/bin/env python3
"""SS-04 redundant-cast census.

Classifies every String-cast emitted into the generated Java tree:
  A) `(String) this.safeString*(...)` occurrences (any spacing)
  B) `((String)IDENT)` occurrences, resolving IDENT's nearest declared Java type
Reports per family: context (decl RHS / argument / receiver / throw / as-expr),
declared type of the operand where resolvable, and counts.
"""
import re, sys, os, collections

ROOT = sys.argv[1] if len(sys.argv) > 1 else 'java/lib/src/main/java'

CAST_IDENT = re.compile(r'\(\(String\)([A-Za-z_][A-Za-z0-9_]*)\)')
CAST_SAFE = re.compile(r'\(String\)\s?(this\.safeString[A-Za-z0-9]*)')
# declaration patterns (Java)
DECL = re.compile(r'\b(String|Object|Integer|Long|Double|Boolean|var|char|byte\[\])\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[=;,)])')
FIELD = re.compile(r'\b(String|Object|Integer|Long|Double|Boolean)\s+([A-Za-z_][A-Za-z0-9_]*)\s*;')
PARAM = re.compile(r'\b(String|Object|Integer|Long|Double|Boolean)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[,)])')

def decls_of_file(path):
    """Return {ident: {'types': set, 'decls': [(line, type)]}} from a java file."""
    out = collections.defaultdict(lambda: {'types': set(), 'decls': []})
    try:
        text = open(path, encoding='utf-8', errors='replace').read()
    except OSError:
        return out
    for m in re.finditer(r'\b(String|Object|Integer|Long|Double|Boolean)\s+([A-Za-z_][A-Za-z0-9_]*)\b', text):
        t, ident = m.group(1), m.group(2)
        line = text.count('\n', 0, m.start()) + 1
        out[ident]['types'].add(t)
        out[ident]['decls'].append((line, t))
    return out

def classify_context(line, col, ident):
    after = line[col + len('((String)' + ident + ')'):]
    a = after.lstrip()
    if a.startswith('.'):
        m = re.match(r'\.([A-Za-z0-9_]+)', a)
        return 'receiver.' + (m.group(1) if m else '?')
    if a.startswith(';'):
        return 'stmt'
    if a.startswith(',') or a.startswith(')'):
        return 'argument'
    if a.startswith(']'):
        return 'index'
    return 'other:' + a[:20]

def main():
    a_ctx = collections.Counter()
    a_by = collections.Counter()
    b_ctx = collections.Counter()
    b_type = collections.Counter()
    b_detail = collections.Counter()
    total_a = total_b = 0
    b_string_idents = collections.Counter()
    for dirpath, _, files in os.walk(ROOT):
        for fn in files:
            if not fn.endswith('.java'):
                continue
            path = os.path.join(dirpath, fn)
            text = open(path, encoding='utf-8', errors='replace').read()
            lines = text.split('\n')
            decls = decls_of_file(path)
            for i, line in enumerate(lines):
                for m in CAST_SAFE.finditer(line):
                    total_a += 1
                    a_by[m.group(1)] += 1
                    before = line[:m.start()].rstrip()
                    if re.search(r'\b[a-zA-Z_][\w.<>,\[\]\s]*\s+[A-Za-z_][A-Za-z0-9_]*\s*=\s*$', before):
                        a_ctx['decl-rhs'] += 1
                    elif re.search(r'return\s*$', before):
                        a_ctx['return'] += 1
                    elif before.endswith('(') or before.endswith(','):
                        a_ctx['argument'] += 1
                    elif before.endswith('(('):
                        a_ctx['double-paren'] += 1
                    else:
                        a_ctx['other'] += 1
                for m in CAST_IDENT.finditer(line):
                    total_b += 1
                    ident = m.group(1)
                    ctx = classify_context(line, m.start(), ident)
                    b_ctx[ctx] += 1
                    info = decls[ident]
                    types = info['types']
                    if 'String' in types and len(types) == 1:
                        b_type['String-only'] += 1
                        b_string_idents[ident] += 1
                    elif 'Object' in types and len(types) == 1:
                        b_type['Object-only'] += 1
                    elif not types:
                        b_type['no-decl'] += 1
                    else:
                        b_type['mixed:' + ','.join(sorted(types))] += 1
                    b_detail[(ident, ctx, ','.join(sorted(types)) if types else 'NONE')] += 1
    print('=== A) (String)this.safeString* ===')
    print('total', total_a)
    for k, v in a_by.most_common():
        print(f'  {v:5d}  {k}')
    print('contexts:', dict(a_ctx))
    print()
    print('=== B) ((String)IDENT) ===')
    print('total', total_b)
    print('by declared type of IDENT:', dict(b_type))
    print('top String-only idents:', b_string_idents.most_common(25))
    print()
    print('top contexts:', b_ctx.most_common(15))
    print()
    print('detail (ident, context, decl-types) top 60:')
    for (ident, ctx, types), v in b_detail.most_common(60):
        print(f'  {v:5d}  {ident:22s} {ctx:24s} {types}')

if __name__ == '__main__':
    main()

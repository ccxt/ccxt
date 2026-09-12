#!/usr/bin/env python3
"""SS-04 scope-aware census v2.

For every `((String)IDENT)` occurrence in the generated java tree, resolve the
innermost enclosing method and check the declared Java type of IDENT there.
Scope tracking is line-based with a brace stack (good enough: generated java is
regular). Also census `(String)this.safeString*` occurrences by method/context.
"""
import re, os, sys, collections

ROOT = sys.argv[1] if len(sys.argv) > 1 else 'java/lib/src/main/java'

METHOD_RE = re.compile(r'^\s{4}(?:@\w+.*)?(?:public|private|protected|static|final|abstract|synchronized|\s)*[\w.<>,\[\]\s?]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(')
DECL_RE = re.compile(r'(?:^|;\s*|\(\s*|\s)(String|Object|Integer|Long|Double|Boolean|var|char)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[=;,)])')
CAST_IDENT = re.compile(r'\(\(String\)([A-Za-z_][A-Za-z0-9_]*)\)')
CAST_SAFE = re.compile(r'\(String\)\s?(this\.safeString[A-Za-z0-9]*)')

def method_params(sig):
    """extract (type, name) params from a method signature line fragment"""
    out = []
    m = re.search(r'\((.*)\)', sig)
    if not m:
        return out
    body = m.group(1)
    for pm in re.finditer(r'\b(String|Object|Integer|Long|Double|Boolean|var|char)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[,)]|\.\.\.)', body):
        out.append((pm.group(1), pm.group(2)))
    return out

def main():
    b_type = collections.Counter()
    b_ctx = collections.Counter()
    b_detail = collections.Counter()
    string_idents = collections.Counter()
    files_with_wins = set()
    total_b = 0
    total_a = 0
    a_ctx = collections.Counter()
    a_by = collections.Counter()
    a_files = collections.Counter()

    for dirpath, _, files in os.walk(ROOT):
        for fn in files:
            if not fn.endswith('.java'):
                continue
            path = os.path.join(dirpath, fn)
            lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
            # scope stack: list of dicts ident->set(types)
            stack = [dict()]
            pending_sig = ''
            for i, line in enumerate(lines):
                m = METHOD_RE.match(line)
                if m and ('(' in line):
                    pending_sig = line
                # locals/params
                for dm in DECL_RE.finditer(line):
                    t, ident = dm.group(1), dm.group(2)
                    stack[-1].setdefault(ident, set()).add(t)
                if m:
                    for t, ident in method_params(pending_sig):
                        stack[-1].setdefault(ident, set()).add(t)
                # counts
                for cm in CAST_SAFE.finditer(line):
                    total_a += 1
                    a_by[cm.group(1)] += 1
                    a_files[fn] += 1
                    before = line[:cm.start()].rstrip()
                    if re.search(r'=\s*$', before):
                        a_ctx['decl-rhs'] += 1
                    elif re.search(r'return\s*$', before):
                        a_ctx['return'] += 1
                    elif before.endswith('(') or before.endswith(','):
                        a_ctx['argument'] += 1
                    elif before.endswith('(('):
                        a_ctx['double-paren'] += 1
                    else:
                        a_ctx['other'] += 1
                for cm in CAST_IDENT.finditer(line):
                    total_b += 1
                    ident = cm.group(1)
                    after = line[cm.end():]
                    a = after.lstrip()
                    if a.startswith('.'):
                        mm = re.match(r'\.([A-Za-z0-9_]+)', a)
                        ctx = 'receiver.' + (mm.group(1) if mm else '?')
                    elif a.startswith(';'):
                        ctx = 'stmt'
                    elif a.startswith(','):
                        ctx = 'argument(,'
                    elif a.startswith(')'):
                        ctx = 'argument()'
                    elif a.startswith(']'):
                        ctx = 'index'
                    else:
                        ctx = 'other'
                    found = set()
                    for scope in reversed(stack):
                        if ident in scope:
                            found = scope[ident]
                            break
                    if not found:
                        b_type['undeclared'] += 1
                    elif found == {'String'}:
                        b_type['String'] += 1
                        string_idents[ident] += 1
                        files_with_wins.add(path)
                    elif 'String' in found and 'Object' in found:
                        b_type['String+Object'] += 1
                    elif 'String' in found:
                        b_type['String+' + '|'.join(sorted(found - {'String'}))] += 1
                    elif 'Object' in found:
                        b_type['Object' + ('+' + '|'.join(sorted(found - {'Object'})) if len(found) > 1 else '')] += 1
                    else:
                        b_type['other:' + ','.join(sorted(found))] += 1
                    b_ctx[ctx] += 1
                    b_detail[(ident, ctx, ','.join(sorted(found)) if found else 'NONE')] += 1
                # brace tracking
                opens = line.count('{')
                closes = line.count('}')
                # process closes first (rough)
                for _ in range(closes):
                    if len(stack) > 1:
                        stack.pop()
                for _ in range(opens):
                    stack.append({})
    print(f'=== B) ((String)IDENT): total {total_b}')
    for k, v in b_type.most_common():
        print(f'  {v:6d}  {k}')
    print(f'  -- files with >=1 String-resolved occurrence: {len(files_with_wins)}')
    print('  top idents String-resolved:', string_idents.most_common(30))
    print('  contexts:', b_ctx.most_common(12))
    print('  top detail (ident, ctx, types):')
    for (ident, ctx, types), v in b_detail.most_common(40):
        print(f'    {v:5d}  {ident:22s} {ctx:20s} {types}')
    print()
    print(f'=== A) (String)this.safeString*: total {total_a}')
    for k, v in a_by.most_common():
        print(f'  {v:5d}  {k}')
    print('  contexts:', dict(a_ctx))

if __name__ == '__main__':
    main()

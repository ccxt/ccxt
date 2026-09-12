#!/usr/bin/env python3
"""Dump all `((String)IDENT)` occurrences whose identifier resolves to a String-declared
scope-local, with the emitting shape. Run with [--all] to include Object ones for contrast."""
import re, os, sys, collections

ROOT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'java/lib/src/main/java'
METHOD_RE = re.compile(r'^\s{4}(?:@\w+.*)?(?:public|private|protected|static|final|abstract|synchronized|\s)*[\w.<>,\[\]\s?]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(')
DECL_RE = re.compile(r'(?:^|;\s*|\(\s*|\s)(String|Object|Integer|Long|Double|Boolean|var|char)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[=;,)])')
CAST_IDENT = re.compile(r'\(\(String\)([A-Za-z_][A-Za-z0-9_]*)\)')

def method_params(sig):
    out = []
    m = re.search(r'\((.*)\)', sig)
    if not m:
        return out
    for pm in re.finditer(r'\b(String|Object|Integer|Long|Double|Boolean|var|char)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[,)]|\.\.\.)', m.group(1)):
        out.append((pm.group(1), pm.group(2)))
    return out

def shape(line, m):
    after = line[m.end():].lstrip()
    mm = re.match(r'\.([A-Za-z0-9_]+)', after)
    if mm:
        return 'recv.' + mm.group(1)
    if after.startswith(';'):
        return 'stmt'
    if after.startswith(','):
        return 'arg,'
    if after.startswith(')'):
        return 'arg)'
    return 'other:' + after[:24]

def main():
    per_site = collections.Counter()
    persite_examples = collections.defaultdict(list)
    total = 0
    for dirpath, _, files in os.walk(ROOT):
        for fn in sorted(files):
            if not fn.endswith('.java'):
                continue
            path = os.path.join(dirpath, fn)
            lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
            stack = [dict()]
            for i, line in enumerate(lines):
                m = METHOD_RE.match(line)
                if m and '(' in line:
                    for t, ident in method_params(line):
                        stack[-1].setdefault(ident, set()).add(t)
                for dm in DECL_RE.finditer(line):
                    t, ident = dm.group(1), dm.group(2)
                    stack[-1].setdefault(ident, set()).add(t)
                for cm in CAST_IDENT.finditer(line):
                    ident = cm.group(1)
                    found = set()
                    for scope in reversed(stack):
                        if ident in scope:
                            found = scope[ident]
                            break
                    if found == {'String'}:
                        total += 1
                        sh = shape(line, cm)
                        per_site[sh] += 1
                        if len(persite_examples[sh]) < 4:
                            persite_examples[sh].append(f'{fn}:{i+1}: {line.strip()[:150]}')
                opens = line.count('{')
                closes = line.count('}')
                for _ in range(closes):
                    if len(stack) > 1:
                        stack.pop()
                for _ in range(opens):
                    stack.append({})
    print('total String-resolved occurrences:', total)
    for sh, n in per_site.most_common():
        print(f'\n== {sh}: {n}')
        for ex in persite_examples[sh]:
            print('   ', ex)

if __name__ == '__main__':
    main()

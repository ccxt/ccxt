#!/usr/bin/env python3
"""Classify the first argument of every `((String)Helpers.add(A, ...` occurrence:
is A a string literal / this.<member> (THIS_MEMBER_TYPES) / an identifier whose
scope-local declared type is String / other (unprovable -> cast stays)?"""
import re, os, sys, collections

ROOT = 'java/lib/src/main/java'
MEMBER_STRING = set(['id', 'version', 'name', 'secret', 'apiKey', 'password', 'uid', 'login', 'url', 'hostname'])
CAST = re.compile(r'\(\(String\)Helpers\.add\(([^,()]*)')
METHOD_RE = re.compile(r'^\s{4}(?:@\w+.*)?(?:public|private|protected|static|final|abstract|synchronized|\s)*[\w.<>,\[\]\s?]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(')
DECL_RE = re.compile(r'(?:^|;\s*|\s)(String|Object|Integer|Long|Double|Boolean|var|char)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=[=;,)])')

def main():
    kinds = collections.Counter()
    examples = collections.defaultdict(list)
    for dirpath, _, files in os.walk(ROOT):
        for fn in sorted(files):
            if not fn.endswith('.java'):
                continue
            lines = open(os.path.join(dirpath, fn), encoding='utf-8', errors='replace').read().split('\n')
            stack = [dict()]
            for i, line in enumerate(lines):
                for dm in DECL_RE.finditer(line):
                    stack[-1].setdefault(dm.group(2), set()).add(dm.group(1))
                for cm in CAST.finditer(line):
                    arg = cm.group(1).strip()
                    if arg == '':
                        # empty first arg impossible; something like (String)Helpers.add(Helpers.add(
                        kinds['nested-add'] += 1
                        continue
                    if arg.startswith('"'):
                        kind = 'literal'
                    elif arg.startswith('this.'):
                        member = arg[5:]
                        kind = 'this.member(String)' if member in MEMBER_STRING else 'this.member(?)'
                    else:
                        found = set()
                        for scope in reversed(stack):
                            if arg in scope:
                                found = scope[arg]
                                break
                        if found == {'String'}:
                            kind = 'ident(String)'
                        elif not found:
                            kind = 'ident(undeclared)'
                        else:
                            kind = 'ident(' + ','.join(sorted(found)) + ')'
                    kinds[kind] += 1
                    if len(examples[kind]) < 3:
                        examples[kind].append(f'{fn}:{i+1}: {line.strip()[:120]}')
                opens = line.count('{')
                closes = line.count('}')
                for _ in range(closes):
                    if len(stack) > 1:
                        stack.pop()
                for _ in range(opens):
                    stack.append({})
    for k, v in kinds.most_common():
        print(f'{v:6d}  {k}')
        for ex in examples[k][:2]:
            print('          ', ex)

if __name__ == '__main__':
    main()

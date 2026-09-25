#!/usr/bin/env python3
"""toMapArg census by argument shape and ident receiver declaration: size.py <git-ref> [repo]"""
import re, subprocess, sys, collections
ref = sys.argv[1]; repo = sys.argv[2] if len(sys.argv) > 2 else '.'
root = 'java/lib/src/main/java/io/github/ccxt/exchanges'
files = subprocess.run(['git', '-C', repo, 'ls-tree', '-r', '--name-only', ref, root], capture_output=True, text=True).stdout.split()
def iter_args(line):
    for m in re.finditer(r'Helpers\.toMapArg\(', line):
        d=0; j=m.end()
        for k in range(m.end(), len(line)):
            c=line[k]
            if c=='(': d+=1
            elif c==')':
                if d==0: yield type('M',(),{'group':lambda self,i,a=line[m.end():k]:a})(); break
                d-=1
shape = collections.Counter(); decl = collections.Counter(); total = 0
for f in files:
    if not f.endswith('.java') or '/prediction/' in f:
        continue
    src = subprocess.run(['git', '-C', repo, 'show', f'{ref}:{f}'], capture_output=True, text=True).stdout
    lines = src.split('\n')
    for i, line in enumerate(lines):
        for m in iter_args(line):
            total += 1
            arg = m.group(1).strip()
            if re.fullmatch(r'\w+', arg):
                shape['ident'] += 1
                k = 'undeclared'
                for j in range(i, -1, -1):
                    l = lines[j]
                    dm = re.match(r'\s*(?:final\s+)?(\w[\w.<>, ?]*?)\s+' + arg + r'\s*=\s*(.*)', l)
                    if dm and not l.strip().startswith('return'):
                        t, rhs = dm.group(1).strip(), dm.group(2)
                        if 'List<Object>) ' in rhs and rhs.rstrip(';').endswith('.get(1)'):
                            k = f'{t} = tuple.get(1)'
                        elif rhs.startswith('this.omit('): k = f'{t} = this.omit'
                        elif rhs.startswith('this.extend('): k = f'{t} = this.extend'
                        elif rhs.startswith('null'): k = f'{t} = null'
                        else: k = f'{t} = other'
                        break
                    if re.match(r'\s*(public|private|protected)\s.*\(', l):
                        k = 'param' if re.search(r'\b' + arg + r'\b', l) else 'undeclared'
                        break
                decl[k] += 1
            elif arg.startswith('this.extend('): shape['this.extend'] += 1
            elif arg.startswith('this.omit('): shape['this.omit'] += 1
            else: shape['other'] += 1
print('total', total)
for k, v in shape.most_common(): print(f'  shape {k}: {v}')
for k, v in decl.most_common(25): print(f'  ident {k}: {v}')

#!/usr/bin/env python3
"""Size IsEqual(ident, nil) sites in generated Go by the ident's declaration in its func block.
usage: size.py <rev> [--rhs]  (rev = git rev, reads go/v4, go/v4/pro, go/v4/prediction)"""
import re, subprocess, sys, collections
rev = sys.argv[1]; show_rhs = '--rhs' in sys.argv
files = subprocess.run(['git', 'ls-tree', '-r', '--name-only', rev, '--', 'go/v4'], capture_output=True, text=True).stdout.split()
files = [f for f in files if f.endswith('.go') and f.count('/') <= 3 and not re.search(r'/(exchange[^/]*|[^/]*_api|[^/]*_test)\.go$', f)]
cls = collections.Counter(); rhs = collections.Counter(); total = 0
typed_nil = []
for f in files:
    src = subprocess.run(['git', 'show', rev + ':' + f], capture_output=True, text=True).stdout
    total += len(re.findall(r'IsEqual\(', src))
    for fn in re.split(r'\nfunc ', src)[1:]:
        brace = fn.find('{'); sig = fn[:brace]
        for m in re.finditer(r'(!?)(?<![.\w])(?:ccxt\.)?IsEqual\((\w+), nil\)', fn):
            n = m.group(2)
            if re.search(r'[(,]\s*' + n + r' ', sig):
                cls['param ' + ('any' if re.search(r'[(,]\s*' + n + r' any\b', sig) else 'typed')] += 1; continue
            decls = re.findall(r'\bvar ' + n + r' ([^=\n]+?) =', fn)
            if len(decls) != 1:
                cls['other/undeclared'] += 1; continue
            t = decls[0].strip(); cls['local ' + t] += 1
            if t == 'any' and show_rhs:
                for w in re.findall(r'(?:var ' + n + r' any|(?<![.\w])' + n + r') = ([^\n]*)', fn):
                    rhs[re.sub(r'\(.*', '(', w)[:50]] += 1
            if t in ('[]string', 'map[string]any', '[]any'):
                init = re.search(r'\bvar ' + n + r' [^=\n]+? = ([^\n]*)', fn).group(1)
                writes = re.findall(r'(?<![.\w])' + n + r' = ([^\n]*)', fn)
                typed_nil.append((f, n, t, m.group(0), init[:80], [w[:60] for w in writes]))
print('IsEqual( total', total)
for k, v in cls.most_common(): print(f'{v:6d} {k}')
if show_rhs:
    print('--- any-local write RHS heads')
    for k, v in rhs.most_common(60): print(f'{v:6d} {k}')
if '--typed' in sys.argv:
    for r in typed_nil: print(r)

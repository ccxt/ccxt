#!/usr/bin/env python3
# census the remaining `Object x = <rhs>` declarations in the prediction tree by rhs shape
import os, re, sys, collections

root = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = os.path.join(root, 'java/lib/src/main/java/io/github/ccxt/exchanges/prediction')

pat = re.compile(r'^\s+Object (\w+) = (.*)$')
counts = collections.Counter()
examples = {}
for fn in sorted(os.listdir(d)):
    if not fn.endswith('.java') or fn.endswith('Core.java') is False:
        continue
    for i, line in enumerate(open(os.path.join(d, fn), encoding='utf-8')):
        m = pat.match(line.rstrip('\n'))
        if not m:
            continue
        rhs = m.group(2).strip()
        # classify
        if rhs.startswith('(this.'):
            kind = 'awaited this-call .join()'
        elif rhs.startswith('this.'):
            mm = re.match(r'this\.(\w+)\(', rhs)
            mm2 = re.match(r'this\.(\w+)\b(?!\()', rhs)
            if mm:
                kind = 'this-call ' + mm.group(1)
            elif mm2:
                kind = 'this-member/field ' + mm2.group(1)
            else:
                kind = 'this-other'
        elif rhs.startswith('Helpers.'):
            mm = re.match(r'Helpers\.(\w+)\(', rhs)
            kind = 'Helpers.' + (mm.group(1) if mm else '?')
        elif rhs.startswith('new java.util.ArrayList'):
            kind = 'array literal'
        elif rhs.startswith('new java.util.HashMap'):
            kind = 'object literal'
        elif rhs.startswith('"'):
            kind = 'string literal'
        elif rhs.startswith('Helpers'):
            kind = 'Helpers-other'
        elif re.match(r'[-0-9]', rhs):
            kind = 'numeric literal'
        elif rhs.startswith('(') or rhs.endswith('?'):
            kind = 'ternary/paren'
        else:
            kind = 'identifier/other: ' + rhs.split('(')[0].split('.')[0][:40]
        counts[kind] += 1
        examples.setdefault(kind, f'{fn}:{i+1}: ' + line.strip()[:150])

total = sum(counts.values())
print(f'prediction Core files: total Object locals = {total}')
for kind, n in counts.most_common(45):
    print(f'{n:5d}  {kind}')
    print(f'       e.g. {examples[kind]}')

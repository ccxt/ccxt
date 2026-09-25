#!/usr/bin/env python3
"""Pool for the ccxt-side post-pass write arm: container `var m map[string]any = <non-nil init>`
declared once, never rebound; bucket by value text class. usage: pool.py <ref>"""
import re, subprocess, sys, collections
REF = sys.argv[1]
NONNIL = re.compile(r'^(?:map\[string\]any\{|GetArgMap\(optionalArgs, \d+, map\[string\]any\{\}\)$|this\.(?:Extend|DeepExtend)\()')
def git(*a):
    return subprocess.run(['git', '-C', '/root/ccxt', *a], capture_output=True, text=True).stdout
files = [f for f in git('ls-tree', '-r', '--name-only', REF, 'go/').split('\n') if f.endswith('.go')]
c = collections.Counter(); samples = collections.defaultdict(list); inits = collections.Counter()
for f in files:
    src = git('show', f'{REF}:{f}')
    if 'AddElementToObject(' not in src: continue
    lines = src.split('\n'); fs = 0
    for i, l in enumerate(lines):
        if l.startswith('func '): fs = i
        m = re.match(r'^(\s*)(?:ccxt\.)?AddElementToObject\((\w+), ("[^"\\]*"), (.+)\)$', l)
        if not m: continue
        n, v = m.group(2), m.group(4)
        end = next(j for j in range(i, len(lines)) if lines[j] == '}')
        body = '\n'.join(lines[fs:end + 1])
        decls = re.findall(r'\bvar ' + n + r' (map\[string\]any) = (.*)', body)
        if len(decls) != 1:
            continue
        init = decls[0][1].strip()
        if re.search(r'(?:^|[^\w.&*])' + n + r'\s*=(?!=)|&\s*' + n + r'\b', body, re.M):
            inits['rebound'] += 1; continue
        if not NONNIL.match(init):
            inits[re.sub(r'\(.*', '(', init)[:30]] += 1; continue
        vt = 'other'
        if re.match(r'^\w+$', v):
            d = re.findall(r'\bvar ' + v + r' ([^=\n]+?) =', '\n'.join(lines[fs:i]))
            p = re.search(r'[(,]\s*' + v + r' ([^,)]+)', lines[fs])
            vt = 'id:' + (d[-1] if d else (('param:' + p.group(1)) if p else '?'))
        elif v.startswith('map[string]any{'): vt = 'maplit'
        elif v.startswith('[]any{'): vt = 'slicelit'
        else: vt = 'expr:' + re.sub(r'\(.*', '(', v)[:30]
        c[vt] += 1
        if len(samples[vt]) < 2: samples[vt].append(f'{f}:{i+1}: {l.strip()[:110]}')
print('pool', sum(c.values()), 'excluded', dict(inits))
for k, v in c.most_common(40): print(v, k, samples[k])

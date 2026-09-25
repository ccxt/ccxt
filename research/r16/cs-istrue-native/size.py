#!/usr/bin/env python3
"""Bucket every isTrue(...) call in a C# tree by its argument's declaration in the enclosing method.
usage: size.py DIR"""
import os, re, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from checkdiff import SIG

def enclosing(lines, i):
    s = i
    while s > 0 and not (SIG.match(lines[s]) and not lines[s].rstrip().endswith(';')):
        s -= 1
    e = s + 1
    while e < len(lines) and not (SIG.match(lines[e]) and not lines[e].rstrip().endswith(';')):
        e += 1
    return s, e

def kind(lines, i, name):
    s, e = enclosing(lines, i)
    types = set()
    for k in range(s + 1, e):
        m = re.match(r'^\s*([\w<>?][\w<>?,\[\] ]*?)\s+' + name + r'\s*(=|;)', lines[k])
        if m and m.group(1).split()[0] not in ('return', 'else', 'await', 'throw'):
            types.add(m.group(1).strip())
    if types:
        return 'local:' + '|'.join(sorted(types))
    m = re.search(r'([\w<>?\[\]]+)\s+' + name + r'\b(?=\s*[,)=])', lines[s])
    if m:
        return 'param:' + m.group(1) + ':' + re.search(r'(\w+)\s*\(', lines[s][len(lines[s]) - len(lines[s].lstrip()):].split('(')[0] + '(').group(1)
    return 'unresolved'

buckets = collections.Counter(); ex = {}
for root, _, files in os.walk(sys.argv[1]):
    for f in files:
        if not f.endswith('.cs'):
            continue
        p = os.path.join(root, f); lines = open(p).read().split('\n')
        for i, l in enumerate(lines):
            for m in re.finditer(r'(?<![\w.])isTrue\(([^()]*(?:\([^()]*\))?[^()]*)\)', l):
                a = m.group(1).strip()
                if re.fullmatch(r'\w+', a):
                    k = kind(lines, i, a)
                    key = k if not k.startswith('param:') else 'param:' + k.split(':')[1]
                else:
                    key = 'nonident'; k = a[:60]
                buckets[key] += 1
                ex.setdefault(key, []).append('%s:%d %s %s' % (os.path.relpath(p, sys.argv[1]), i + 1, a[:40], k))
for k, v in buckets.most_common():
    print(v, k)
    for e in ex[k][:4]:
        print('    ', e)
if '-v' in sys.argv:
    for k in ex:
        if k.startswith('param'):
            for e in ex[k]: print('P', e)

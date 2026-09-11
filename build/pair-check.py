#!/usr/bin/env python3
"""Assert every changed line pair in the generated java diff is a declaration-only
retype (or an injected checkcast on the same expression). Usage:
  python3 /root/worktrees/jre-h/build/pair-check.py /root/worktrees/jre-h [--committed BASE]
"""
import re, subprocess, sys

root = sys.argv[1]
rev = sys.argv[2] if len(sys.argv) > 2 else 'HEAD'

out = subprocess.run(['git', '-C', root, 'diff', rev, '--', 'java/'], capture_output=True, text=True).stdout

# collect - and + lines by file
minus, plus = {}, {}
cur = None
for line in out.split('\n'):
    if line.startswith('diff --git'):
        cur = line
        continue
    if cur is None:
        continue
    if line.startswith('---') or line.startswith('+++'):
        continue
    if line.startswith('-'):
        minus.setdefault(cur, []).append(line[1:])
    elif line.startswith('+'):
        plus.setdefault(cur, []).append(line[1:])

TYPE_RE = re.compile(r'^(?P<indent>\s*)(?P<type>[A-Za-z_][\w.<>, ]*?) (?P<rest>.*)$')

def normalize(line):
    s = line.strip()
    # strip a leading declaration type only when followed by `name = `
    m = re.match(r'^(?:final\s+)?(?:java\.util\.Map<String, Object>|java\.util\.List<Object>|java\.util\.List<String>|io\.github\.ccxt\.ws\.[A-Za-z.]+|String|Long|Integer|Double|Boolean|Object)\s+(\w+ = .*)$', s)
    if m:
        s = m.group(1)
    # strip injected checkcast right after `= `
    s = re.sub(r'^(\w+ = )\((?:java\.util\.Map<String, Object>|java\.util\.List<Object>|io\.github\.ccxt\.ws\.[A-Za-z.]+|String|Long|Integer|Double|Boolean)\) ', r'\1', s)
    s = re.sub(r'^\(\((?:java\.util\.Map<String, Object>|java\.util\.List<Object>|String|Long)\)(\w+)\)', r'\1', s)
    # return-site casts: `return (String) x` vs `return x`
    s = re.sub(r'^return \((?:String|java\.util\.List<Object>|java\.util\.Map<String, Object>)\) (.*)$', r'return \1', s)
    return s

bad = 0
total = 0
for f in minus:
    m, p = minus[f], plus.get(f, [])
    if len(m) != len(p):
        print(f'MISMATCH COUNT {f}: {len(m)} vs {len(p)}')
        bad += 1
        continue
    for a, b in zip(m, p):
        total += 1
        if normalize(a) != normalize(b):
            bad += 1
            print(f'NON-DECL PAIR in {f}:\n  - {a}\n  + {b}')

print(f'pairs={total} bad={bad}')
sys.exit(1 if bad else 0)

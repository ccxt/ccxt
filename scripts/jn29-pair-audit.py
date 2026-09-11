#!/usr/bin/env python3
"""Pair-audit for the JN-29 awaited-write-path diff.

Every removed line must have a matching added line that differs ONLY by the
declared type (Object <name> = <value>  ->  <Type> <name> = <value>).
Reports any unpaired / non-declaration change (must be 0).
"""
import re
import subprocess
import sys

T = r'(?:java\.util\.Map<String, Object>|java\.util\.List<Object>|String|Long|Integer|Double|Boolean)'
decl_old = re.compile(r'^(\s*)Object(\s+)(\w+)(\s*=\s*.*)$')
decl_new = re.compile(r'^(\s*)' + T + r'(\s+)(\w+)(\s*=\s*.*)$')


def normalize(line):
    """Object x = v  and  T x = v  collapse to the same shape."""
    m = decl_old.match(line) or decl_new.match(line)
    if m:
        return f'{m.group(1)}<T>{m.group(2)}{m.group(3)}{m.group(4)}'
    return line


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
    raw = subprocess.run(['git', 'diff', '-U0', base, '--', 'java/'],
                         capture_output=True, text=True).stdout
    removed, added = [], []
    for line in raw.split('\n'):
        if line.startswith('---') or line.startswith('+++'):
            continue
        if line.startswith('-'):
            removed.append(line[1:])
        elif line.startswith('+'):
            added.append(line[1:])
    print(f'removed={len(removed)} added={len(added)}')
    # exact multiset pairing on the normalization
    from collections import Counter
    c_old, c_new = Counter(normalize(l) for l in removed), Counter(normalize(l) for l in added)
    bad = 0
    for key in set(c_old) | set(c_new):
        o, n = c_old.get(key, 0), c_new.get(key, 0)
        if o != n:
            bad += abs(o - n)
            print(f'UNPAIRED x{abs(o - n)}: {key[:150]}')
    # every changed line must itself be a declaration retype
    non_decl = 0
    for l in removed:
        if not decl_old.match(l):
            non_decl += 1
            print(f'NON-DECL REMOVED: {l[:150]}')
    for l in added:
        if not decl_new.match(l):
            non_decl += 1
            print(f'NON-DECL ADDED: {l[:150]}')
    print(f'RESULT: bad_pairs={bad} non_decl_lines={non_decl}')
    return 0 if (bad == 0 and non_decl == 0) else 1


if __name__ == '__main__':
    sys.exit(main())

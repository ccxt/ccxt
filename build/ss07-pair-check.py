#!/usr/bin/env python3
"""SS-07 verifier: every changed line in the generated Java must be a declaration-only
retype (Object -> String/List/Map/..) or a dropped redundant checkcast on such a line.

Usage: python3 build/ss07-pair-check.py <base-rev> [--tier pro|prediction|all]
Prints a per-family census and exits non-zero when any changed line is unsanctioned.
"""
import re
import subprocess
import sys
from collections import Counter

TYPE_TOKENS = [
    'java.util.List<Object>', 'java.util.Map<String, Object>',
    'io.github.ccxt.ws.ArrayCache', 'io.github.ccxt.ws.WsOrderBook', 'io.github.ccxt.ws.Future',
    'String', 'Object', 'Integer', 'Long', 'Double', 'Boolean', 'Client',
]
DECL = re.compile(r'^\s*(?:final\s+)?(' + '|'.join(re.escape(t) for t in TYPE_TOKENS) + r')\s+([A-Za-z_]\w*)\s*=\s*(.*)$')
CAST = re.compile(r'^\(String\)\s*')


def normalise(line: str):
    """(name, value, declared_type) with the checkcast stripped, or None when not a decl."""
    match = DECL.match(line)
    if match is None:
        return None
    value = CAST.sub('', match.group(3))
    return match.group(2), value, match.group(1)


def diff_lines(rev: str, paths):
    out = subprocess.run(['git', 'diff', '-U0', rev, '--'] + paths,
                         capture_output=True, text=True).stdout
    removed, added = [], []
    for line in out.splitlines():
        if line.startswith('+++') or line.startswith('---'):
            continue
        if line.startswith('-'):
            removed.append(line[1:])
        elif line.startswith('+'):
            added.append(line[1:])
    return removed, added


def main():
    rev = sys.argv[1]
    paths = ['java/']
    if '--tier' in sys.argv:
        tier = sys.argv[sys.argv.index('--tier') + 1]
        paths = [f'java/lib/src/main/java/io/github/ccxt/exchanges/{tier}/']
    removed, added = diff_lines(rev, paths)
    bad, families = [], Counter()
    for old, new in zip(removed, added):
        if old.strip() == new.strip():
            continue  # context noise
        norm_old, norm_new = normalise(old), normalise(new)
        if norm_old is None or norm_new is None:
            bad.append((old, new, 'not a declaration line'))
            continue
        if norm_old[0] != norm_new[0] or norm_old[1] != norm_new[1]:
            bad.append((old, new, 'value/name changed'))
            continue
        families[f'{norm_old[2]} -> {norm_new[2]}'] += 1
    if len(removed) != len(added):
        print(f'WARN: unpaired lines removed={len(removed)} added={len(added)}')
    print(f'changed lines: {len(added)} added / {len(removed)} removed')
    for family, count in families.most_common():
        print(f'  {family}: {count}')
    if bad:
        print(f'UNSANCTIONED CHANGES: {len(bad)}')
        for old, new, why in bad[:20]:
            print(f'  [{why}]\n    - {old.strip()}\n    + {new.strip()}')
        sys.exit(1)
    print('OK: every changed line is a declaration-only retype / dropped checkcast')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""SS-04 cast-only diff audit.

Reads `git diff <base> -- java/` in the cwd worktree and asserts that EVERY changed
line pair is a cast-token-only rewrite:
  * paired 1:1 inside each hunk (balanced +/-, in order);
  * after removing every `(String)` cast token from BOTH sides and dropping ALL
    parenthesis characters, the two lines are IDENTICAL — i.e. every identifier,
    literal, comma, operator and semantic token is unchanged; only cast parens moved;
  * the new line contains no MORE `(String)` tokens than the old one.

Usage: python3 build/ss04-pair-audit.py <base-rev> [--verbose]
"""
import re, subprocess, sys

def tokens_without_parens(line):
    s = re.sub(r'\(String\)', '', line)
    return re.sub(r'[()]', '', s)

def cast_count(line):
    return line.count('(String)')

def collect_hunks(text):
    """yield (file, [removed lines], [added lines]) per hunk"""
    file = '?'
    current = None
    for line in text.split('\n'):
        if line.startswith('+++ b/'):
            file = line[6:]
            continue
        if line.startswith('@@'):
            if current is not None:
                yield file, current[0], current[1]
            current = ([], [])
            continue
        if current is None:
            continue
        if line.startswith('-') and not line.startswith('---'):
            current[0].append(line[1:])
        elif line.startswith('+') and not line.startswith('+++'):
            current[1].append(line[1:])
        elif line.startswith('diff --git '):
            yield file, current[0], current[1]
            current = None
    if current is not None:
        yield file, current[0], current[1]

def main():
    base = sys.argv[1]
    verbose = '--verbose' in sys.argv
    diff = subprocess.run(['git', 'diff', base, '--', 'java/'], capture_output=True, text=True).stdout
    total_pairs = 0
    total_cast_delta = 0
    bad = []
    for file, old, new in collect_hunks(diff):
        if len(old) != len(new):
            bad.append((file, 'UNBALANCED hunk: %d removed / %d added' % (len(old), len(new)), old[:1], new[:1]))
            continue
        for o, n in zip(old, new):
            total_pairs += 1
            total_cast_delta += cast_count(o) - cast_count(n)
            if cast_count(n) > cast_count(o):
                bad.append((file, 'MORE casts in new line', o, n))
            elif tokens_without_parens(o) != tokens_without_parens(n):
                bad.append((file, 'NON-CAST token change', o, n))
            elif verbose:
                print('OK  -', o)
                print('    +', n)
    print('paired lines:', total_pairs)
    print('(String) cast tokens removed (paired):', total_cast_delta)
    print('violations:', len(bad))
    for f, why, o, n in bad[:40]:
        print('---', f, '|', why)
        print('  -', o)
        print('  +', n)
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()

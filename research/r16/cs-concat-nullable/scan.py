#!/usr/bin/env python3
"""List C# `object x = this.safeString*(...)` locals whose every read is the LEFT operand of add().
usage: scan.py <git-rev>  -> TSV file, line, name, nreads, initializer; plus add( total."""
import re, subprocess, sys
rev = sys.argv[1]
files = subprocess.run(['git', 'ls-tree', '-r', '--name-only', rev, 'cs/ccxt/exchanges/'], capture_output=True, text=True).stdout.split()
decl = re.compile(r'^(\s*)object (\w+) = (this\.safeString\w*\(.*);\s*$')
total_add = 0; sites = []
for f in files:
    if not f.endswith('.cs'): continue
    src = subprocess.run(['git', 'show', f'{rev}:{f}'], capture_output=True, text=True).stdout
    total_add += src.count('add(')
    lines = src.split('\n')
    for i, l in enumerate(lines):
        m = decl.match(l)
        if not m: continue
        ind, name = m.group(1), m.group(2)
        # method end: first line with smaller indent closing brace
        close = ind[:-4] + '}'
        j = i + 1; reads = []; bad = False
        while j < len(lines) and lines[j].rstrip() != close:
            for mm in re.finditer(r'(?<![\w.])' + name + r'(?!\w)', lines[j]):
                reads.append((j, mm.start()))
            j += 1
        if not reads: continue
        for (j, s) in reads:
            t = lines[j]
            if re.match(r'\s*' + name + r'\s*=[^=]', t[s - len(t[:s]) + s:] if False else t[s:]) and t[:s].strip() == '':
                bad = True; break
        if not bad and any(lines[j][:s].endswith('add(') for (j, s) in reads):
            sites.append((f, i + 1, name, len(reads), m.group(3)))
for s in sites: print('\t'.join(map(str, s)))
print(f'# sites {len(sites)} add( {total_add}', file=sys.stderr)

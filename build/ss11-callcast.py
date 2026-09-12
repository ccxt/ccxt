#!/usr/bin/env python3
"""Count current (String) casts / Object locals at call sites of the given names."""
import re
import sys
from pathlib import Path

ROOT = Path('/root/worktrees/ss-11/java/lib/src/main/java/io/github/ccxt')
names = sys.argv[1:]

files = [ROOT / 'BaseExchange.java']
files += sorted((ROOT / 'exchanges').rglob('*.java'))
text = '\n'.join(p.read_text(errors='replace') for p in files)

for name in names:
    pats = {
        'decl-cast (String)this.N(': len(re.findall(r'\(String\) ?this\.' + name + r'\s*\(', text)),
        'use-site ((String)this.N(': len(re.findall(r'\(\(String\) ?this\.' + name + r'\s*\(', text)),
        'Object local = this.N(': len(re.findall(r'Object \w+ = this\.' + name + r'\s*\(', text)),
        'String local = this.N(': len(re.findall(r'String \w+ = this\.' + name + r'\s*\(', text)),
        'bare N(' : len(re.findall(r'(?<![.\w])' + name + r'\s*\(', text)),
    }
    print('%-34s %s' % (name, {k: v for k, v in pats.items() if v}))

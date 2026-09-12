#!/usr/bin/env python3
"""SS-01 diff audit: pair every removed/added line in the java/ diff vs the base commit
and classify it.

Expected classes:
  * cast-removed / cast-removed-in-expr  — a `(String)` checkcast on a safeStringUpper/Lower*
    call site went away
  * object->string[+cast-removed]        — `Object x = [cast]this.safeStringUpper/Lower*(...)`
    became `String x = ...`
  * producer-signature / producer-body   — the hand-written SafeMethods.java / BaseExchange.java
    producer retype (the root-cause change this slice makes)
Anything else is printed under "unclassified" for review.
"""
import re
import subprocess
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else '3ca818ac31e'
HAND_WRITTEN = ('base/SafeMethods.java', 'ccxt/BaseExchange.java')
DIFF = subprocess.run(['git', 'diff', '-U0', BASE, '--', 'java'],
                      capture_output=True, text=True, check=True).stdout

pairs = []
fname = None
minus = []
for line in DIFF.split('\n'):
    if line.startswith('+++ '):
        fname = line[6:]
    elif line.startswith('@@'):
        minus = []
    elif line.startswith('---'):
        continue
    elif line.startswith('-') and not line.startswith('---'):
        minus.append(line[1:])
    elif line.startswith('+') and not line.startswith('+++'):
        pairs.append((fname, minus.pop(0) if minus else None, line[1:]))
    elif line == '':
        continue
    else:
        minus = []

CASE = r'safeString(?:Upper|Lower)[0-9]?N?'
PRODUCER = r'(?:public|private|protected) (?:static )?String safeString(?:Upper|Lower)[0-9]?N?\('
categories = {}
unexpected = []


def is_hand_written(fn):
    return fn is not None and any(h in fn for h in HAND_WRITTEN)


def classify(fn, old, new):
    if old is None or new is None:
        return 'producer-body' if is_hand_written(fn) else None
    o, n = old, new
    if re.sub(r'\(String\) ?', '', o) == n and re.search(r'\(String\) ?this\.(' + CASE + r')', o):
        return 'cast-removed'
    m = re.match(r'^(\s*)Object (\w+) = (?:(?:\(String\) ?)?this\.(' + CASE + r'))', o)
    if m and re.match(r'^(\s*)String (\w+) = this\.(' + CASE + r')', n):
        return 'object->string' + ('+cast-removed' if '(String)' in o else '')
    if re.sub(r'\(String\) ?', '', o) == n and 'return' in o:
        return 'return-cast-removed'
    if re.sub(r'\(String\)\s*', '', o) == re.sub(r'\(String\)\s*', '', n) and '(String)' in o:
        return 'cast-removed-in-expr'
    if re.match(r'^\s*public Object safeString(?:Upper|Lower)', o) and re.match(PRODUCER, n.strip()):
        return 'producer-signature'
    if is_hand_written(fn) and re.match(r'^\s*(?:String|Object|if|return|\}|//|private|public)', n):
        return 'producer-body'
    return None


for fn, old, new in pairs:
    cat = classify(fn, old, new)
    if cat is None:
        unexpected.append((fn, old, new))
    else:
        categories[cat] = categories.get(cat, 0) + 1

print('== classified change pairs ==')
for k, v in sorted(categories.items(), key=lambda kv: -kv[1]):
    print(f'  {k:28s} {v}')
print(f'  total pairs: {sum(categories.values())}')
print()
print(f'== unclassified pairs (need review): {len(unexpected)} ==')
for fn, old, new in unexpected[:30]:
    print(f'  {fn}\n    - {old}\n    + {new}')
sys.exit(1 if unexpected else 0)

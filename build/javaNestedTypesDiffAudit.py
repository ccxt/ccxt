#!/usr/bin/env python3
"""Classify every changed line block of the JN-2 java diff against the base commit.

Each removed/added block must fall into a sanctioned category:
  decl-retype      public ... CompletableFuture<Object> X(  ->  ... <T> X(
  alias-retype     one-line *Async forwarder retype
  tail-funnel      });                         ->  }).thenApply(TypedCores::toX);
  consumer-wrap    ...(this.X(...)).join()...   (plus a TypedCores.fromX( insert)
  bare-future      this.X(...)                  ->  this.X(...).thenApply(fromX)
  wrapper-*        joinUnwrapped/new T(res)/thenApply removed for joinTyped
  raw-retention    + public final Object __raw;  /  + this.__raw = raw;
  comment/other    comments, imports, wiring files
Anything else is flagged BAD.
"""
import collections
import re
import subprocess
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else '853ab685540'
WT = '/root/worktrees/jn-b'

out = subprocess.run(['git', '-C', WT, 'diff', BASE, '--', 'java/'],
                     capture_output=True, text=True).stdout
lines = out.split('\n')


def classify(m, p):
    ms = m.strip() if m is not None else None
    ps = p.strip() if p is not None else None
    if ms is not None and ps is not None:
        if re.match(r'^public java\.util\.concurrent\.CompletableFuture<Object> \w+\(', ms) and \
           re.match(r'^public java\.util\.concurrent\.CompletableFuture<[^>]+(?:<[^>]*>)?> \w+\(', ps):
            return 'decl-retype'
        if re.match(r'^public java\.util\.concurrent\.CompletableFuture<Object> \w+Async\(Object\.\.\. \w+\) \{', ms) and \
           re.match(r'^public java\.util\.concurrent\.CompletableFuture<[^>]+> \w+Async\(Object\.\.\. \w+\) \{', ps):
            return 'alias-retype'
        if ms == '});' and re.match(r'^\}\)\.thenApply\(io\.github\.ccxt\.TypedCores::to\w+\);$', ps):
            return 'tail-funnel'
        if re.fullmatch(r'return super\.\w+\(.*\)\.thenApply\(.*\);', ms) and re.fullmatch(r'return super\.\w+\(.*\);', ps):
            return 'wrapper-async'
        stripped = re.sub(r'\.thenApply\(io\.github\.ccxt\.TypedCores::from\w+\)', '', ps)
        if stripped == ms and 'TypedCores::from' in ps:
            return 'bare-future'
        # multi-line call site: the wrap's opening paren is on an earlier line, so the
        # closing line only gains the extra ')'
        if ps == ms + ')' and ms.endswith(').join();'):
            return 'consumer-wrap-closing'
        if ps == ms + '))' and ms.endswith(').join();'):
            return 'consumer-wrap-closing'
    if 'io.github.ccxt.TypedCores.from' in (p or ''):
        if m is not None:
            return 'consumer-wrap'
    if p is not None and m is not None and 'io.github.ccxt.TypedCores.from' in p and len(p) > len(m):
        return 'consumer-wrap'
    if ps == 'public final Object __raw;' or ps == 'this.__raw = raw;':
        return 'raw-retention'
    if ps is not None and ps.startswith('// ') and ms is None:
        return 'comment'
    if ms is not None and ps is None:
        if re.fullmatch(r'return new \w+\(res\);', ms) or re.fullmatch(r'return toTypedList\(res, \w+::new\);', ms):
            return 'wrapper-sync-tail-removed'
        if ms == '@SuppressWarnings("unchecked")':
            return 'annotation-removed'
        if ms.startswith('import '):
            return 'import-removed'
    if ps is not None and ms is None and ps.startswith('return Helpers.joinTyped('):
        return 'wrapper-sync-joined'
    if ps is not None and ms is None:
        return 'insertion'
    if ms is not None and ps is not None and 'Object res = Helpers.joinUnwrapped(' in ms:
        return 'wrapper-sync-join-removed'
    return 'BAD'


counts = collections.Counter()
bad = []
file = ''
i = 0
while i < len(lines):
    l = lines[i]
    if l.startswith('diff --git'):
        file = l.split(' b/')[-1]
        i += 1
        continue
    if l.startswith('-') and not l.startswith('---'):
        block_minus = []
        while i < len(lines) and lines[i].startswith('-') and not lines[i].startswith('---'):
            block_minus.append(lines[i][1:])
            i += 1
        block_plus = []
        while i < len(lines) and lines[i].startswith('+') and not lines[i].startswith('+++'):
            block_plus.append(lines[i][1:])
            i += 1
        n = max(len(block_minus), len(block_plus))
        for j in range(n):
            m = block_minus[j] if j < len(block_minus) else None
            p = block_plus[j] if j < len(block_plus) else None
            c = classify(m, p)
            counts[c] += 1
            if c == 'BAD':
                bad.append((file, m, p))
        continue
    i += 1

print('categories:')
for k, v in counts.most_common():
    print('  %-26s %d' % (k, v))
print()
print('BAD pairs: %d' % len(bad))
for f, m, p in bad[:20]:
    print('  %s\n    - %s\n    + %s' % (f, m, p))

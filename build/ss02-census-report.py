#!/usr/bin/env python3
"""SS-02 census report.

Reads the JSONL census produced by the SS-02 instrumentation in build/javaTranspiler.ts
(CCXT_SS02_CENSUS=1 CCXT_SS02_CENSUS_OUT=<file>) and reports, for every local whose
initializer is a whole `this.safeString*`-family call:

  * the tier split (rest / pro / prediction) of the FINAL emitted type — a rest file
    keeps this engine's decision, a ws-tier file is subject to postProcessWsJava's
    `String x = this.<m>(` -> Object revert unless the declaration carries a cast,
  * every Object local with later writes, grouped by which blocker set stopped it
    (write acceptance vs compound writes vs other uses vs the ws revert),
  * for write-blocked locals, which are covered by the SS-02 reassignment acceptance
    (the `extended` flag each write record carries, computed by the shipped
    isProvablyStringReassignment / isProvablyNonNullStringOperand) and which shapes
    still block the rest.

Usage: python3 build/ss02-census-report.py [census.jsonl]
"""
import json
import sys
import collections

PATH = sys.argv[1] if len(sys.argv) > 1 else '/tmp/ss02-census.jsonl'


def tier(r):
    return 'prediction' if r.get('prediction') else ('pro' if r.get('pro') else 'rest')


def final_emitted(r):
    """the token the generated file actually carries after the ws-tier revert"""
    if r['verdict'] != 'String':
        return 'Object'
    if r.get('ws') and r.get('retyped') and r.get('survivesWsRevert') is False:
        return 'Object(reverted)'
    return 'String'


def write_accepted(w, r):
    """the shipped write acceptance: base provability, or the SS-02 extension (non-ws
    tiers only — a ws-tier retype is reverted anyway and would pre-empt the surviving
    spellings of the other slices, e.g. the messageHash `(String)` rule)"""
    if w.get('op') != '=':
        return False
    if w.get('provable'):
        return True
    return not r.get('ws') and w.get('extended') is True


def write_needs_cast(w):
    """an accepted write that still needs a (String) checkcast at the write site (the
    reassignment hook injects it for string-element element reads)"""
    return w.get('shape') == 'element-access' and w.get('stringElements') is True and not w.get('provable')


def main():
    recs = []
    with open(PATH) as f:
        for line in f:
            line = line.strip()
            if line:
                recs.append(json.loads(line))
    print(f"records: {len(recs)}   errors: {sum(1 for r in recs if 'error' in r)}   "
          f"replica mismatches: {sum(1 for r in recs if r.get('mismatch'))}")

    print('\n== final emitted type by tier (rest keeps the engine decision, ws-tier is '
          'subject to the postProcessWsJava revert) ==')
    by = collections.Counter((tier(r), final_emitted(r)) for r in recs)
    for k in sorted(by):
        print(f"   {k[0]:11s} {k[1]:16s} {by[k]}")

    print('\n== locals with at least one later assignment ==')
    withw = [r for r in recs if r.get('writes')]
    print(f"   total {len(withw)};  " +
          ', '.join(f"{k[0]}/{k[1]}=" + str(v) for k, v in sorted(collections.Counter(
              (tier(r), final_emitted(r)) for r in withw).items())))

    def reasonset(r):
        return tuple(sorted(set(b['reason'] for b in r['blockers'])))

    print('\n== Object-with-writes, by blocker set (classifies=false records keep Object '
          'before any scan: case family with a non-String default, non-base override) ==')
    objw = [r for r in withw if final_emitted(r) != 'String']
    for key, group in sorted(collections.Counter(
            (reasonset(r), r.get('classifies', True), tier(r)) for r in objw).items()):
        print(f"   blockers={key[0]} classifies={key[1]} tier={key[2]}: {group}")

    print('\n== Object-with-writes whose only blockers are write/compound-write '
          '(the SS-02 reassignment-acceptance target) ==')
    target = [r for r in objw if r.get('classifies', True)
              and all(b['reason'] in ('write', 'compound-write') for b in r['blockers'])
              and r['blockers']]
    print(f"   {len(target)} locals; by tier "
          + str(dict(collections.Counter(tier(r) for r in target))))
    covered = [r for r in target if all(write_accepted(w, r) for w in r['writes'])]
    residual = [r for r in target if not all(write_accepted(w, r) for w in r['writes'])]
    print(f"   covered by the shipped reassignment acceptance: {len(covered)} "
          f"(of which {sum(1 for r in covered if tier(r) == 'rest')} rest)")
    print(f"   still blocked (residual): {len(residual)}")
    shapes = collections.Counter()
    for r in residual:
        for w in r['writes']:
            if not write_accepted(w, r):
                shapes[(w.get('shape', w.get('kind')), w.get('op'))] += 1
    print('   residual write shapes:')
    for k, v in shapes.most_common(40):
        print(f"      {v:4d}  shape={k[0]} op={k[1]}")

    print('\n== accepted writes that still need a (String) checkcast at the write site ==')
    needcast = collections.Counter()
    for r in target:
        for w in r['writes']:
            if write_accepted(w, r) and write_needs_cast(w):
                needcast[w.get('shape')] += 1
    for k, v in needcast.most_common(20):
        print(f"      {v:4d}  {k}")

    print('\n== sample target locals (file :: name) ==')
    for r in target[:25]:
        reasons = ','.join(b['reason'] for b in r['blockers'])
        print(f"   {r['file']}::{r['name']} acc={r['accessor']} blockers={reasons} "
              f"writes={len(r['writes'])}")


if __name__ == '__main__':
    main()

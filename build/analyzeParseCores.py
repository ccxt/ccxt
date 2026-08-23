#!/usr/bin/env python3
"""Closed-set analysis for typing the generated C# parse* cores.

Unlike a fetch* core (whose result is terminal — it flows straight into the
PascalCase wrapper), a parse* result is an INPUT to more transpiled logic:
`getValue(parsed, "symbol")`, `this.extend(parsed, ...)`, `setValue(...)`.
Those helpers take `object` and do dictionary access, so handing them a boxed
struct compiles fine and then fails at RUNTIME. A compile gate cannot catch it.

So a parse* name is typeable only when every call site is terminal:
  * `return this.parseX(...);`
  * `return ccxt.BaseExchange.ToX(this.parseX(...));`   (typeCores already wrapped it)
  * `var v = this.parseX(...); ... return v;`           with no dict/list use of v
and every declaration agrees on arity + defaults (C# invariance).

Prints, per name, the blocking call sites so the skip list is auditable.
"""
import re
import glob
import collections
import json
import sys

ROOT = '/root/worktrees/cs-typed-cores/'

# TS unified structure per parse* name (ts/src/base/Exchange.ts)
TS_SHAPES = {
    'parseMarket': 'MarketInterface', 'parseMarkets': 'List<MarketInterface>',
    'parseTicker': 'Ticker', 'parseTickers': 'Tickers',
    'parseTrade': 'Trade', 'parseTrades': 'List<Trade>',
    'parseTransaction': 'Transaction', 'parseTransactions': 'List<Transaction>',
    'parseLedgerEntry': 'LedgerEntry', 'parseLedger': 'List<LedgerEntry>',
    'parseOrder': 'Order', 'parseOrders': 'List<Order>',
    'parsePosition': 'Position', 'parsePositions': 'List<Position>',
    'parseOHLCV': 'OHLCV', 'parseOHLCVs': 'List<OHLCV>',
    'parseBalance': 'Balances',
    'parseFundingRate': 'FundingRate',
    'parseOpenInterest': 'OpenInterest',
    'parseLeverage': 'Leverage',
    'parseTransfer': 'TransferEntry',
    'parseDepositAddress': 'DepositAddress',
    'parseLiquidation': 'Liquidation',
    'parseIncome': 'FundingHistory',
    'parseAccount': 'Account',
    'parseBorrowInterest': 'BorrowInterest',
    'parseMarginModification': 'MarginModification',
    'parseTradingFee': 'TradingFeeInterface',
    'parseCurrency': 'CurrencyInterface',
    'parseGreeks': 'Greeks',
    'parseOption': 'Option',
    'parseMarketLeverageTiers': 'List<LeverageTier>',
}

SIG = re.compile(r'^(\s*)public (?:async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$')


def files():
    out = []
    for pat in ('cs/ccxt/base/*.cs', 'cs/ccxt/exchanges/**/*.cs'):
        out += glob.glob(ROOT + pat, recursive=True)
    return [f for f in out if '/wrappers/' not in f]


def split_params(s):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '<([{':
            depth += 1
        elif ch in '>)]}':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur.strip())
            cur = ''
        else:
            cur += ch
    if cur.strip():
        out.append(cur.strip())
    return out


def main():
    names = list(TS_SHAPES)
    decls = collections.defaultdict(set)
    blockers = collections.defaultdict(list)
    sites = collections.Counter()
    for f in files():
        text = open(f, encoding='utf8').read()
        lines = text.split('\n')
        for line in lines:
            m = SIG.match(line.rstrip())
            if m and m.group(4) in TS_SHAPES:
                decls[m.group(4)].add(tuple(split_params(m.group(5))))
        for i, line in enumerate(lines):
            for n in names:
                for m in re.finditer(r'(?<![\w])this\.' + n + r'\(', line):
                    sites[n] += 1
                    before = line[:m.start()].strip()
                    if before.endswith('return') or re.search(r'return ccxt\.BaseExchange\.To\w+\($', before):
                        continue
                    assign = re.search(r'(\w+)\s*=\s*$', before)
                    if not assign:
                        blockers[n].append((f, i + 1, line.strip()[:110]))
                        continue
                    var = assign.group(1)
                    bad = None
                    for j in range(i + 1, min(i + 60, len(lines))):
                        seg = lines[j]
                        if re.search(r'return\s+' + var + r'\s*;', seg):
                            break
                        if re.search(r'(getValue|setValue|inOp)\(\s*' + var + r'\b', seg) \
                           or re.search(r'\(I(?:List|Dictionary|Collection)<[^)]*\)\s*' + var + r'\b', seg) \
                           or re.search(r'extend\([^)]*\b' + var + r'\b', seg) \
                           or re.search(r'\b' + var + r'\s*=(?!=)', seg) and j > i:
                            bad = (f, j + 1, seg.strip()[:110])
                            break
                    if bad:
                        blockers[n].append(bad)
    typeable = {}
    for n in sorted(names):
        shapes = decls.get(n)
        if not shapes:
            continue
        why = []
        if len(shapes) != 1:
            why.append('%d differing parameter shapes' % len(shapes))
        if blockers[n]:
            why.append('%d consuming call sites' % len(blockers[n]))
        if not why:
            typeable[n] = TS_SHAPES[n]
        print('%-26s sites=%-4d %s' % (n, sites[n], 'TYPEABLE -> ' + TS_SHAPES[n] if not why else 'SKIP: ' + '; '.join(why)))
        for b in blockers[n][:3]:
            print('        %s:%s  %s' % (b[0].replace(ROOT, ''), b[1], b[2]))
    json.dump(typeable, open(ROOT + 'build/parseCores.report.json', 'w'), indent=1)
    print('\ntypeable parse* names:', len(typeable), sorted(typeable))


main()

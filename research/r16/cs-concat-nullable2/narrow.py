#!/usr/bin/env python3
"""Narrow ws-handler guards: wrap only the hash build + its resolve(s) in `if (V !== undefined)`.
spec (decl, rs, re, var): decl line (or None) is moved inside the guard; lines rs..re are wrapped."""
import re, sys
S = {
 'bitopro': [(None, 273, 273, 'messageHash'), (120, 128, 128, 'event'), (181, 193, 193, 'event'), (400, 407, 407, 'event')],
 'bitfinex': [(434, 465, 465, 'channel')],
 'bitvavo': [(186, 191, 191, 'event')],
 'blofin': [(155, 156, 156, 'channelName'), (227, 247, 247, 'channelName'), (310, 312, 312, 'channelName'), (593, 595, 595, 'channelName'), (648, 649, 649, 'channelName')],
 'coinbase': [(483, 484, 485, 'channel')],
 'coinbaseinternational': [(None, n, n, v) for n, v in [(302, 'channel'), (413, 'channel'), (520, 'messageHash'), (589, 'channel'), (711, 'channel'), (786, 'channel')]],
 'derive': [(637, 638, 638, 'topic'), (703, 704, 704, 'topic')],
 'hitbtc': [(None, 979, 979, 'messageHash')],
 'hollaex': [(123, 124, 124, 'channel'), (184, 185, 185, 'channel'), (273, 274, 274, 'channel'), (402, 403, 403, 'channel')],
 'hyperliquid': [(1126, 1156, 1156, 'topic')],
 'okx': [(353, 360, 360, 'channel'), (635, 636, 636, 'channel'), (2135, 2136, 2136, 'channel'), (2228, 2229, 2234, 'channel')],
 'p2b': [(296, 307, 307, 'channel'), (406, 407, 407, 'messageHashStart')],
 'paradex': [(440, 444, 444, 'channel'), (546, 547, 547, 'channel')],
 'poloniex': [(637, 650, 650, 'channel')],
 'xt': [(744, 745, 745, 'event'), (911, 912, 912, 'event'), (1078, 1079, 1079, 'event'), (1134, 1135, 1135, 'event')],
}
root = sys.argv[1]
for f, specs in S.items():
    p = f'{root}/ts/src/pro/{f}.ts'
    L = open(p).read().split('\n')
    for decl, rs, re_, v in sorted(specs, key=lambda s: -s[1]):
        body = L[rs - 1:re_]
        ind = re.match(r'\s*', body[0]).group(0)
        assert (v + ' + ') in (L[decl - 1] if decl else body[0]), (f, rs)
        moved = []
        if decl:
            d = L[decl - 1]
            m = re.match(r'\s*const (\w+) = ', d)
            assert m, (f, decl)
            name = m.group(1)
            for k in range(decl, rs - 1):  # no use of the hash between decl and resolve
                assert not re.search(r'\b' + name + r'\b', L[k]), (f, k + 1, L[k])
                assert not re.search(r'\b' + v + r'\s*=[^=]', L[k]), (f, k + 1)
            moved = [ind + '    ' + d.strip()]
        dind = re.match(r'\s*', body[0]).group(0)
        new = [ind + f'if ({v} !== undefined) {{'] + moved + [('    ' + x if x.strip() else x) for x in body] + [ind + '}']
        L[rs - 1:re_] = new
        if decl:
            del L[decl - 1]
    open(p, 'w').write('\n'.join(L))
    print('ok', f)

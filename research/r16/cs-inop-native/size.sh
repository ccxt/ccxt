#!/bin/bash
# inOp( counts by receiver class over generated C#
F="cs/ccxt/exchanges cs/ccxt/base/Exchange.BaseMethods.cs cs/ccxt/base/PredictionExchange.cs"
echo "total $(grep -rhoP '(?<![\w.])inOp\(' $F | wc -l)"
echo "this.field $(grep -rhoP '(?<![\w.])inOp\(this\.\w+,' $F | wc -l)"
echo "ident $(grep -rhoP '(?<![\w.])inOp\([A-Za-z_]\w*,' $F | wc -l)"
echo "client.map $(grep -rhoP '(?<![\w.])inOp\(\w+\.(subscriptions|futures),' $F | wc -l)"
grep -rhoP '(?<![\w.])inOp\(this\.\w+' $F | sort | uniq -c | sort -rn | head -20

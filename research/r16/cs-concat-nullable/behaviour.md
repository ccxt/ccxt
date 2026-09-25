# behaviour changes (rest; pro rows in behaviour-pro.md)
file | local | class | change
apex.ts parseMarket | baseId/quote/settle | a | missing -> market skipped (parseMarkets drops undefined); was symbol "undefined/..."
coinbaseinternational.ts parseMarket | baseId/quoteId | a | missing -> market skipped; was "undefined/..."
revolutx.ts fetchMarkets | base/quote | a | missing -> `continue`; was id "undefined-..."
bitbns.ts fetchMarkets | baseId | a | missing baseId -> skipped (base was already required)
binance.ts transfer | fromId | b | none: throw guard collapsed to a single statement so the exit proof applies

Left (reason): sign() apiUrl sites (bitopro, bitvavo, blofin, gemini, grvt, kraken x2, krakenfutures) already throw
before the concat; they stay `object` because the RIGHT operand is not a proven string, not the left.
Not touched: prediction baseUrl/ticker/networkId, gate price, hyperliquid, bithumb, bitstamp, bittrade/htx brokerId,
upbit, weex, xt, kraken part4/offset, paradex hours - budget ran out.

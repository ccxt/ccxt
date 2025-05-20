# Changelog

## v4.4.79

- fix(htx): python base & certificates addition [#25886](https://github.com/ccxt/ccxt/pull/25886)
- test(orderbook): amend all orderbook tests [#25889](https://github.com/ccxt/ccxt/pull/25889)
- test(bingx): bv compare ^ [#25890](https://github.com/ccxt/ccxt/pull/25890)
- fix(bitget): parse tickers fix [#25896](https://github.com/ccxt/ccxt/pull/25896)
- fix(bitfinex): fetchTickers & parseTicker [#25895](https://github.com/ccxt/ccxt/pull/25895)
- test(apex): skip spread [#25910](https://github.com/ccxt/ccxt/pull/25910)
- refactor: remove l2 skips [#25901](https://github.com/ccxt/ccxt/pull/25901)
- upbit - skips [#25909](https://github.com/ccxt/ccxt/pull/25909)
- refactor(htx): unfix :) [#25903](https://github.com/ccxt/ccxt/pull/25903)
- fix(bitmex): fetchMarkets [#25898](https://github.com/ccxt/ccxt/pull/25898)
- fix(bitopro): currency type [#25900](https://github.com/ccxt/ccxt/pull/25900)
- fix(coinbase): revert USD [#25922](https://github.com/ccxt/ccxt/pull/25922)
- fix(okx): fetchDepositAddress network handling [#25920](https://github.com/ccxt/ccxt/pull/25920)
- feat(binance): update testnet ws url for spot [#25923](https://github.com/ccxt/ccxt/pull/25923)
- test(btcturk): retest loadmarkets fields [#25915](https://github.com/ccxt/ccxt/pull/25915)
- fix(bitvavo): multiple fields in fetchCurrencies [#25911](https://github.com/ccxt/ccxt/pull/25911)
- test(btcmarkets): retest [#25914](https://github.com/ccxt/ccxt/pull/25914)
- test(bitteam): retest [#25908](https://github.com/ccxt/ccxt/pull/25908)
- test(bitso): unskip ohlcv [#25906](https://github.com/ccxt/ccxt/pull/25906)
- fix(bybit): createOrder, option category param [#25925](https://github.com/ccxt/ccxt/pull/25925)
- fix(bybit): fetchLedger inverse for uta 2.0 [#25924](https://github.com/ccxt/ccxt/pull/25924)
- fix(bitmart): bitmart upgrade positions to v2 [#25926](https://github.com/ccxt/ccxt/pull/25926)
- test(btcalpha): unskip [#25913](https://github.com/ccxt/ccxt/pull/25913)
- test.market.ts allow linear and inverse to be undefined for options [#25927](https://github.com/ccxt/ccxt/pull/25927)
- feat(bitget): type crypto & fiat [#25897](https://github.com/ccxt/ccxt/pull/25897)
- fix: changelog and release notes [#25431](https://github.com/ccxt/ccxt/pull/25431)


## v4.4.78

- fix(timex): safeTrade ^ [#25827](https://github.com/ccxt/ccxt/pull/25827)
- fix(bitopro): networks key ^ [#25851](https://github.com/ccxt/ccxt/pull/25851)
- fix(hyperliquid): currency type ^ [#25840](https://github.com/ccxt/ccxt/pull/25840)
- fix(bitrue): currency type ^ [#25839](https://github.com/ccxt/ccxt/pull/25839)
- fix(poloniex): currency type ^ [#25838](https://github.com/ccxt/ccxt/pull/25838)
- fix(kraken): fc type ^ [#25842](https://github.com/ccxt/ccxt/pull/25842)
- fix(hollaex): fc type ^ [#25843](https://github.com/ccxt/ccxt/pull/25843)
- fix(delta): fc type ^ [#25844](https://github.com/ccxt/ccxt/pull/25844)
- fix(deribit): fc type ^ [#25845](https://github.com/ccxt/ccxt/pull/25845)
- fix(huobijp): currency networks ^ [#25841](https://github.com/ccxt/ccxt/pull/25841)
- fix(bitmex): currency type ^ [#25849](https://github.com/ccxt/ccxt/pull/25849)
- fix(bitvavo): fc type ^ [#25850](https://github.com/ccxt/ccxt/pull/25850)
- fix(coinone): currency type field ^ [#25846](https://github.com/ccxt/ccxt/pull/25846)
- fix(coinlist): currency type ^ [#25847](https://github.com/ccxt/ccxt/pull/25847)
- fix(coinex): fc type ^ [#25848](https://github.com/ccxt/ccxt/pull/25848)
- fix(whitebit): crypto type [#25857](https://github.com/ccxt/ccxt/pull/25857)
- fix(htx): currency type  [#25856](https://github.com/ccxt/ccxt/pull/25856)
- chore(ace): remove json skip ^ [#25854](https://github.com/ccxt/ccxt/pull/25854)
- test(skip): several exchanges ^ [#25865](https://github.com/ccxt/ccxt/pull/25865)
- fix(ascendex): deposit withdraw [#25863](https://github.com/ccxt/ccxt/pull/25863)
- fix(delta): correct expiry when no mfetched market [#25866](https://github.com/ccxt/ccxt/pull/25866)
- test(coinone): major currencies skip [#25867](https://github.com/ccxt/ccxt/pull/25867)
- fix(bingx): safe currency [#25869](https://github.com/ccxt/ccxt/pull/25869)
- feat(upbit): define new CCXT Pro watchOHLCV AP [#25872](https://github.com/ccxt/ccxt/pull/25872)
- feat(bitvavo): support operatorId [#25874](https://github.com/ccxt/ccxt/pull/25874)
- fix(typo): build/transpile.sh [#25876](https://github.com/ccxt/ccxt/pull/25876)
- fix(bitmat): currency related things [#25871](https://github.com/ccxt/ccxt/pull/25871)
- retest htx [#25873](https://github.com/ccxt/ccxt/pull/25873)
- fix(bitget): fix fetchCurrencies [#25870](https://github.com/ccxt/ccxt/pull/25870)
- refactor(ticker): minor [#25868](https://github.com/ccxt/ccxt/pull/25868)
- update(upbit): Update Docs site URL [#25860](https://github.com/ccxt/ccxt/pull/25860)
- test(htx): remove proxy [#25883](https://github.com/ccxt/ccxt/pull/25883)
- feat(binance): add loadAllOptions flag [#25885](https://github.com/ccxt/ccxt/pull/25885)
- feat(bybit): change createOrder stopLossPrice endpoint [#25887](https://github.com/ccxt/ccxt/pull/25887)
- fix(htx): null bid-ask [#25881](https://github.com/ccxt/ccxt/pull/25881)
- test(ticker): more detailed tests [#25888](https://github.com/ccxt/ccxt/pull/25888)
- fix(docs): table generation [#25891](https://github.com/ccxt/ccxt/pull/25891)
- fix(cs): handle empty keys/values [#25892](https://github.com/ccxt/ccxt/pull/25892)


## v4.4.77

- apex omni - v3 Merge [#25428](https://github.com/ccxt/ccxt/pull/25428)
- feat(upbit): define new Unified API fetchTradingFees [#25768](https://github.com/ccxt/ccxt/pull/25768)
- fix(upbit): fetchTickers check [#25769](https://github.com/ccxt/ccxt/pull/25769)
- fix(apex) jsdoc [#25773](https://github.com/ccxt/ccxt/pull/25773)
- fix(poloniex): open orders symbol check [#25771](https://github.com/ccxt/ccxt/pull/25771)
- tests(fetchCurrencies): make active/deposit/withdraw checks robust [#25723](https://github.com/ccxt/ccxt/pull/25723)
- feat(bitget): fetchFundingRate, alternative method [#25778](https://github.com/ccxt/ccxt/pull/25778)
- fix(gate): watchPostions fix close positions error [#25782](https://github.com/ccxt/ccxt/pull/25782)
- chore(binance): remove malta MT [#25752](https://github.com/ccxt/ccxt/pull/25752)
- feat(bitget): fetchFundingRate, updated response [#25783](https://github.com/ccxt/ccxt/pull/25783)
- chore(deps): bump golang.org/x/crypto from 0.31.0 to 0.35.0 in /go/tests/profile [#25791](https://github.com/ccxt/ccxt/pull/25791)
- fix(upbit): max url lengthes [#25789](https://github.com/ccxt/ccxt/pull/25789)
- feat(apex): multiple fixes [#25787](https://github.com/ccxt/ccxt/pull/25787)
- test(defx): skip ohlcv open ^ [#25790](https://github.com/ccxt/ccxt/pull/25790)
- fix(cex): fetchtickers open price [#25788](https://github.com/ccxt/ccxt/pull/25788)
- fix(bitmex): market states & expiry for perps [#25785](https://github.com/ccxt/ccxt/pull/25785)
- tradeogre websockets adding [#25775](https://github.com/ccxt/ccxt/pull/25775)
- fix(precision): base safeCurrencyStructure change for currency wide precision [#25786](https://github.com/ccxt/ccxt/pull/25786)
- update(upbit): update createOrder  [#25799](https://github.com/ccxt/ccxt/pull/25799)
- test(fetchCurrencies): check for duplicate codes [#25801](https://github.com/ccxt/ccxt/pull/25801)
- feat(tests): add log with info level [#25804](https://github.com/ccxt/ccxt/pull/25804)
- test(currencies): fix check ^ [#25809](https://github.com/ccxt/ccxt/pull/25809)
- fix(p2b): remove recursion call [#25814](https://github.com/ccxt/ccxt/pull/25814)
- fix(hollaex): remove recursion call [#25815](https://github.com/ccxt/ccxt/pull/25815)
- fix(hyperliquid): update balance with isolated margin [#25816](https://github.com/ccxt/ccxt/pull/25816)
- feat(cointach): implement fetchDepositWithdrawFees [#25818](https://github.com/ccxt/ccxt/pull/25818)
- test(shared-methods): add extra extend for empty values [#25817](https://github.com/ccxt/ccxt/pull/25817)
- fix(hitbtc & bequant): currency type ^ [#25819](https://github.com/ccxt/ccxt/pull/25819)
- fix(probit): type currency ^ [#25829](https://github.com/ccxt/ccxt/pull/25829)
- fix!(ace): delist [#25820](https://github.com/ccxt/ccxt/pull/25820)
- fix(coinbase) - WS orderbook [#25095](https://github.com/ccxt/ccxt/pull/25095)
- fix(mexc): fetchCurrencies [#25813](https://github.com/ccxt/ccxt/pull/25813)
- fix(phemex): currency type ^ [#25828](https://github.com/ccxt/ccxt/pull/25828)
- test(binancecoinm): remove skip [#25822](https://github.com/ccxt/ccxt/pull/25822)
- fix(whitebit): missing key ^ [#25826](https://github.com/ccxt/ccxt/pull/25826)
- fix(woo): currency & market fields [#25824](https://github.com/ccxt/ccxt/pull/25824)
- fix(mexc): createOrder multiple fixes [#25808](https://github.com/ccxt/ccxt/pull/25808)
- fix(bitget): fetchOHLCV reorganize [#25797](https://github.com/ccxt/ccxt/pull/25797)
- fix(xt): currency type [#25825](https://github.com/ccxt/ccxt/pull/25825)
- feat(upbit): editOrder [#25834](https://github.com/ccxt/ccxt/pull/25834)
- feat(exchanges): add type to fetchPositions [#25833](https://github.com/ccxt/ccxt/pull/25833)
- fix(bitget): swap sandbox balance [#25836](https://github.com/ccxt/ccxt/pull/25836)
- fix(go): disable flaky test [#25837](https://github.com/ccxt/ccxt/pull/25837)


## v4.4.76

- chore(deps): bump golang.org/x/crypto from 0.31.0 to 0.35.0 in /go/v4 [#25745](https://github.com/ccxt/ccxt/pull/25745)
- update(upbit): update rateLimit and add cost to Implicit API [#25747](https://github.com/ccxt/ccxt/pull/25747)
- feat(tests): add conflicts detection to markets [#25748](https://github.com/ccxt/ccxt/pull/25748)
- chore: bump ubuntu version in go [#25750](https://github.com/ccxt/ccxt/pull/25750)
- chore(deps): bump golang.org/x/crypto from 0.31.0 to 0.35.0 in /go/tests/types [#25754](https://github.com/ccxt/ccxt/pull/25754)
- feat(okx): April 17 2025 changelog [#25756](https://github.com/ccxt/ccxt/pull/25756)
- feat(xt): add editOrder [#25751](https://github.com/ccxt/ccxt/pull/25751)
- fix(okx): preopen sandbox markets parsing [#25761](https://github.com/ccxt/ccxt/pull/25761)


## v4.4.75

- bitrue.has leverage methods = false [#25708](https://github.com/ccxt/ccxt/pull/25708)
- feat(upbit): add '1s' and '1y' timeframes [#25711](https://github.com/ccxt/ccxt/pull/25711)
- Optimize Docker setup: replace .NET SDK installation with direct scri… [#25715](https://github.com/ccxt/ccxt/pull/25715)
- feat(tests): add per lang disabled flag [#25716](https://github.com/ccxt/ccxt/pull/25716)
- chore(deps): bump golang.org/x/crypto from 0.31.0 to 0.35.0 in /go/cli [#25717](https://github.com/ccxt/ccxt/pull/25717)
- feat(coinlist): add fetchFundingRate [#25719](https://github.com/ccxt/ccxt/pull/25719)
- fix(binance): deposit address & reversedNetworks  [#25718](https://github.com/ccxt/ccxt/pull/25718)
- fix(coinex.cs): fetchCurrencies network key [#25722](https://github.com/ccxt/ccxt/pull/25722)
- test(skips): add type ^ [#25724](https://github.com/ccxt/ccxt/pull/25724)
- fix(hyperliquid): orderId in watchMyTrades [#25726](https://github.com/ccxt/ccxt/pull/25726)
- ace - skip further ^ [#25725](https://github.com/ccxt/ccxt/pull/25725)
- fix(bitget): fetchTradingFee swap [#25730](https://github.com/ccxt/ccxt/pull/25730)
- fix(proxy): proxyUrl fix & implementation in c# [#25638](https://github.com/ccxt/ccxt/pull/25638)
- feat(upbit): define new Implicit APIs and remove deprecated API [#25733](https://github.com/ccxt/ccxt/pull/25733)
- fix(paradex): fetchTickers [#25735](https://github.com/ccxt/ccxt/pull/25735)
- chore: update actions/python to v5 [#25744](https://github.com/ccxt/ccxt/pull/25744)


## v4.4.74

- test(market): fix precision issues ^ [#25690](https://github.com/ccxt/ccxt/pull/25690)
- test(bitmart): skip watchOB bid-ask  ^ [#25691](https://github.com/ccxt/ccxt/pull/25691)
- test(bitflyer): no settleId ^ [#25693](https://github.com/ccxt/ccxt/pull/25693)
- fix(safeCurrencyStructure): withdraw/deposit/active [#25698](https://github.com/ccxt/ccxt/pull/25698)
- bitopro.has leverage methods = false [#25705](https://github.com/ccxt/ccxt/pull/25705)
- chore: remove js/ dep from export-exchanges [#25700](https://github.com/ccxt/ccxt/pull/25700)
- test(market): removal of few skips ^ [#25692](https://github.com/ccxt/ccxt/pull/25692)
- feat(coinlist): add missing endpoints [#25703](https://github.com/ccxt/ccxt/pull/25703)
- test(coinex): skip precision & networks ^ [#25696](https://github.com/ccxt/ccxt/pull/25696)
- test(bitopro): skip l2 ^ [#25695](https://github.com/ccxt/ccxt/pull/25695)
- test(ace): skip temp ^ [#25694](https://github.com/ccxt/ccxt/pull/25694)
- fix(vss): remove js/ overwrite [#25706](https://github.com/ccxt/ccxt/pull/25706)


## v4.4.73

- ascendex.has - option and future methods = false [#25656](https://github.com/ccxt/ccxt/pull/25656)
- ace, alpaca: option methods = false [#25655](https://github.com/ccxt/ccxt/pull/25655)
- fix(deribit): currency inference [#25657](https://github.com/ccxt/ccxt/pull/25657)
- hitbtc.has: option/future methods = false [#25658](https://github.com/ccxt/ccxt/pull/25658)
- bit2c.has leverage methods = false [#25659](https://github.com/ccxt/ccxt/pull/25659)
- bitbank.has = false for leverage methods [#25662](https://github.com/ccxt/ccxt/pull/25662)
- fix(gate): currencies url encoding [#25667](https://github.com/ccxt/ccxt/pull/25667)
- bitmart parseTransaction fix [#25671](https://github.com/ccxt/ccxt/pull/25671)
- fix(gate): btc inverse contractSize fix [#25672](https://github.com/ccxt/ccxt/pull/25672)
- test(ace): skip temp ^ [#25670](https://github.com/ccxt/ccxt/pull/25670)
- tests(ascendex): skip bid ask ^ [#25665](https://github.com/ccxt/ccxt/pull/25665)
- delist(bitpanda): remove old alias [#25664](https://github.com/ccxt/ccxt/pull/25664)
- duplicate folders/files ^ [#25648](https://github.com/ccxt/ccxt/pull/25648)
- chore(onetrading): comment ^ [#25632](https://github.com/ccxt/ccxt/pull/25632)
- fix(bitopro): ws unskip (minor changes) [#25630](https://github.com/ccxt/ccxt/pull/25630)
- tests(bitmart): unskip fields ^ [#25627](https://github.com/ccxt/ccxt/pull/25627)
- chore(reorg): validate types ^ [#25622](https://github.com/ccxt/ccxt/pull/25622)
- chore(bitcoincom): delist (remove) inexistent old alias ^ [#25620](https://github.com/ccxt/ccxt/pull/25620)
- fix(bitbns) - active & unskip ^ [#25619](https://github.com/ccxt/ccxt/pull/25619)
- unskip bequant ^ [#25615](https://github.com/ccxt/ccxt/pull/25615)
- tests(binanceusdm) - retest few props ^ [#25617](https://github.com/ccxt/ccxt/pull/25617)
- chore(tests): datetime comments enhance ^ [#25631](https://github.com/ccxt/ccxt/pull/25631)
- test(assertions): enhance tests [#25650](https://github.com/ccxt/ccxt/pull/25650)
- test(markets): complete reorg [#25669](https://github.com/ccxt/ccxt/pull/25669)
- fix(bybit): option currency inference [#25673](https://github.com/ccxt/ccxt/pull/25673)
- fix(docs) - precisions [#23316](https://github.com/ccxt/ccxt/pull/23316)
- bitopro skip timestamp ^ [#25675](https://github.com/ccxt/ccxt/pull/25675)
-  ws duplicate trades filtering [#25639](https://github.com/ccxt/ccxt/pull/25639)
- fix(coinlist): support swap markets [#25676](https://github.com/ccxt/ccxt/pull/25676)
- feat(bitmart): add setPositionMode [#25678](https://github.com/ccxt/ccxt/pull/25678)
- unskip bitflyer ^ [#25623](https://github.com/ccxt/ccxt/pull/25623)
- chore(skips): sort alphabetically ^ [#25677](https://github.com/ccxt/ccxt/pull/25677)
- bithumb.has leverage methods = false [#25680](https://github.com/ccxt/ccxt/pull/25680)
- fix(tests): skip json ^ [#25681](https://github.com/ccxt/ccxt/pull/25681)
- fix(Exchange): removeRepeatedElementsFromArray keys order dependency [#25683](https://github.com/ccxt/ccxt/pull/25683)
- fix(blofin): fetchClosedOrders flag [#25685](https://github.com/ccxt/ccxt/pull/25685)
- feat(bitmart): add fetchPositionMode [#25686](https://github.com/ccxt/ccxt/pull/25686)
- chore: disable go test [#25687](https://github.com/ccxt/ccxt/pull/25687)
- fix(okx): fetchohlcv [#25682](https://github.com/ccxt/ccxt/pull/25682)
- doc(order): stoploss & params [#25684](https://github.com/ccxt/ccxt/pull/25684)
- chore: fix js action [#25697](https://github.com/ccxt/ccxt/pull/25697)


## v4.4.72

- bit2c has false methods [#25609](https://github.com/ccxt/ccxt/pull/25609)
- tests(ace) - unskip markets ^ [#25599](https://github.com/ccxt/ccxt/pull/25599)
- fix(defx) - market inverse ^ [#25601](https://github.com/ccxt/ccxt/pull/25601)
- fix(derive): options linear ^ [#25608](https://github.com/ccxt/ccxt/pull/25608)
- tests(binanceus) - fetchStatus unskip ^ [#25597](https://github.com/ccxt/ccxt/pull/25597)
- build(deps): bump next from 14.2.25 to 14.2.26 in /examples/ts/nextjs-page-router [#25626](https://github.com/ccxt/ccxt/pull/25626)
- fix(bitget) - market precision [#25624](https://github.com/ccxt/ccxt/pull/25624)
- fix(ascedex): currency id str ^ [#25614](https://github.com/ccxt/ccxt/pull/25614)
- chore(bitfinex1) - delist old version [#25621](https://github.com/ccxt/ccxt/pull/25621)
- tests(bitget): ws orderbook field ^ [#25625](https://github.com/ccxt/ccxt/pull/25625)
- tests(binance): unskip ticker & precision ^ [#25616](https://github.com/ccxt/ccxt/pull/25616)
- fix(bitget):  fetchWithdrawals code not required [#25633](https://github.com/ccxt/ccxt/pull/25633)
- fix(bitrue): orderbook & retest [#25634](https://github.com/ccxt/ccxt/pull/25634)
- fix(build): remove bitfinex1 data [#25640](https://github.com/ccxt/ccxt/pull/25640)
- feat(bybit): define most method types [#25636](https://github.com/ccxt/ccxt/pull/25636)
- chore: pushback ccxt.ts [#25641](https://github.com/ccxt/ccxt/pull/25641)
- ace.has: false for leverage methods [#25642](https://github.com/ccxt/ccxt/pull/25642)
- chore(tests): minor comment [#25635](https://github.com/ccxt/ccxt/pull/25635)
- fix(binance): update ids [#25645](https://github.com/ccxt/ccxt/pull/25645)
- feat(bybit): add pagination to fetchPositions [#25646](https://github.com/ccxt/ccxt/pull/25646)
- alpaca.has = false for leverage methods [#25649](https://github.com/ccxt/ccxt/pull/25649)
- chore(skips): empty entries ^ [#25618](https://github.com/ccxt/ccxt/pull/25618)
- refactor(base): reorg removeRepeatedElementsFromArray [#25644](https://github.com/ccxt/ccxt/pull/25644)


## v4.4.71

- chore(poloniex) - ws skip tests ^ [#25566](https://github.com/ccxt/ccxt/pull/25566)
- fix(cex) - missing active key ^ [#25565](https://github.com/ccxt/ccxt/pull/25565)
- whitebit: createOrder - update docstring, has array [#25563](https://github.com/ccxt/ccxt/pull/25563)
- feat(whitebit): createDepositAddress [#25569](https://github.com/ccxt/ccxt/pull/25569)
- fix(gate): currencies encoding [#25571](https://github.com/ccxt/ccxt/pull/25571)
- fix(poloniex) - features missing symbol req [#25573](https://github.com/ccxt/ccxt/pull/25573)
- fix(gate): use replaceAll instead [#25572](https://github.com/ccxt/ccxt/pull/25572)
- feat(whitebit): fetchCrossBorrowRate [#25568](https://github.com/ccxt/ccxt/pull/25568)
- fix(bingx): allAccountBalance endpoint [#25575](https://github.com/ccxt/ccxt/pull/25575)
- fix(derive): update balance [#25581](https://github.com/ccxt/ccxt/pull/25581)
- fix(derive): rename deriveWalletAddress [#25582](https://github.com/ccxt/ccxt/pull/25582)
- krakenfutures["has"]: createPostOnlyOrder, createReduceOnlyOrder, ...  = true [#25576](https://github.com/ccxt/ccxt/pull/25576)
- feat(hyperliquid): add createVault [#25577](https://github.com/ccxt/ccxt/pull/25577)
- refactor & fix(okx) - fetchCurrencies [#25564](https://github.com/ccxt/ccxt/pull/25564)
- fix(bingx) - unskip tests [#25583](https://github.com/ccxt/ccxt/pull/25583)
- fix(derive): add creation_timestamp [#25594](https://github.com/ccxt/ccxt/pull/25594)
- fix(exchange) mismatched return type [#25593](https://github.com/ccxt/ccxt/pull/25593)
- fix(bingx) - implicit api [#25584](https://github.com/ccxt/ccxt/pull/25584)
- fix(krakenfutures) - unskip ^ [#25586](https://github.com/ccxt/ccxt/pull/25586)
- okcoin.has createPostOnlyOrder, createReduceOnlyOrder, createStopLimitOrder, createStopMarketOrder [#25585](https://github.com/ccxt/ccxt/pull/25585)
- feat(exchanges): createDepositAddress, add DepositAddress type [#25595](https://github.com/ccxt/ccxt/pull/25595)
- fix(coinbase) - unskip tests ^ [#25587](https://github.com/ccxt/ccxt/pull/25587)
- fix(bitmart) - watchTrades fix [#25589](https://github.com/ccxt/ccxt/pull/25589)
- tests(ace) - unskip ^ [#25590](https://github.com/ccxt/ccxt/pull/25590)
- fix(ascendex) - unskip tests ^ [#25591](https://github.com/ccxt/ccxt/pull/25591)
- fix(paradex): market parsing [#25606](https://github.com/ccxt/ccxt/pull/25606)
- fix(woo): inverse false ^ [#25605](https://github.com/ccxt/ccxt/pull/25605)
- tests(binance) - unksip networks ^ [#25607](https://github.com/ccxt/ccxt/pull/25607)
- fix(okx) - expiry time for future/option [#25600](https://github.com/ccxt/ccxt/pull/25600)
- fix(woofipro) - inverse false ^ [#25604](https://github.com/ccxt/ccxt/pull/25604)
- fix(derive) - linear inverse ^ [#25602](https://github.com/ccxt/ccxt/pull/25602)
- fix(paradex): inverse false ^ [#25603](https://github.com/ccxt/ccxt/pull/25603)


## v4.4.70

- build(deps): bump next from 14.2.21 to 14.2.25 in /examples/ts/nextjs-page-router [#25542](https://github.com/ccxt/ccxt/pull/25542)
- fix(kraken) - commoncurrencies [#25543](https://github.com/ccxt/ccxt/pull/25543)
- better instructions for exhange-capabilities script [#25546](https://github.com/ccxt/ccxt/pull/25546)
- feat(bitmart): add editOrder to limit swap orders [#25547](https://github.com/ccxt/ccxt/pull/25547)
- chore: readme remove expired campaign [#25551](https://github.com/ccxt/ccxt/pull/25551)
- docs(readme): minor [#25550](https://github.com/ccxt/ccxt/pull/25550)
- fix(goTranspiler): safeCurrencyCode inherited call [#25548](https://github.com/ccxt/ccxt/pull/25548)
- bingx, bitmart: has["createReduceOnlyOrder"] = true [#25552](https://github.com/ccxt/ccxt/pull/25552)
- feat(okx) - full networks unif [#25553](https://github.com/ccxt/ccxt/pull/25553)
- feat(base) - handleRequestNetwork [#25466](https://github.com/ccxt/ccxt/pull/25466)
- has["createReduceOnlyOrder"] [#25555](https://github.com/ccxt/ccxt/pull/25555)
- fix(bitget): sandbox markets loading [#25557](https://github.com/ccxt/ccxt/pull/25557)
- feat(exchange): type constructor [#25558](https://github.com/ccxt/ccxt/pull/25558)
- feat(constructor): support sandbox/testnet key [#25559](https://github.com/ccxt/ccxt/pull/25559)
- fix(okx) - zksync ^ [#25560](https://github.com/ccxt/ccxt/pull/25560)
- poloniex & poloniexfutures - v3 Update & merger [#25378](https://github.com/ccxt/ccxt/pull/25378)
- feat(binance): update binance documentation links [#25561](https://github.com/ccxt/ccxt/pull/25561)
- feat(exchange): remove params['cost'] [#25562](https://github.com/ccxt/ccxt/pull/25562)
- fix(bingx) - implicit balance endpoint ^ [#25567](https://github.com/ccxt/ccxt/pull/25567)


## v4.4.69

- feat(bybit): update apis [#25513](https://github.com/ccxt/ccxt/pull/25513)
- feat(okx): add new v2 endpoints [#25515](https://github.com/ccxt/ccxt/pull/25515)
- fix(go): isObject helper [#25516](https://github.com/ccxt/ccxt/pull/25516)
- fix(okx): createOrder param [#25514](https://github.com/ccxt/ccxt/pull/25514)
- fix(tradeogre): parseOrder [#25519](https://github.com/ccxt/ccxt/pull/25519)
- fix(hyperliquid): postOnly parsing [#25521](https://github.com/ccxt/ccxt/pull/25521)
- fix(tradeogre): account/balance endpoint [#25520](https://github.com/ccxt/ccxt/pull/25520)
- fix(coinbase): error handling [#25517](https://github.com/ccxt/ccxt/pull/25517)
- fix(go): static response tests [#25526](https://github.com/ccxt/ccxt/pull/25526)
- fix(hyperliquid): infer take/maker [#25527](https://github.com/ccxt/ccxt/pull/25527)
- fix(bitget): watchOrders without a symbol [#25528](https://github.com/ccxt/ccxt/pull/25528)
- fix(Exchange): remove BCC/BCH from commonCurrencies [#25518](https://github.com/ccxt/ccxt/pull/25518)
- fix(bitget): fetchFundingHistory symbol filtering [#25531](https://github.com/ccxt/ccxt/pull/25531)
- fix(types): CrossBorrowRates/IsolatedBorrowRates [#25535](https://github.com/ccxt/ccxt/pull/25535)
- fix(bitget): adjust leverage parsing for cross margin mode [#25534](https://github.com/ccxt/ccxt/pull/25534)
- tests(static): fix string & number issues [#25538](https://github.com/ccxt/ccxt/pull/25538)
- fix(hyperliquid): editOrder price precision [#25540](https://github.com/ccxt/ccxt/pull/25540)
- feat(bitget): expanded demo trading capabilities [#25541](https://github.com/ccxt/ccxt/pull/25541)


## v4.4.68

- fix(coinbase): commit flag in deposits() [#25489](https://github.com/ccxt/ccxt/pull/25489)
- fix(transpiler) - types completed [#25468](https://github.com/ccxt/ccxt/pull/25468)
- cryptomus updating [#25437](https://github.com/ccxt/ccxt/pull/25437)
- Binance check brokerId for batchOrders [#25452](https://github.com/ccxt/ccxt/pull/25452)
- feat(paradex): update apis [#25492](https://github.com/ccxt/ccxt/pull/25492)
- [bug] removed duplicate cryptomus#fetchTradingFees [#25495](https://github.com/ccxt/ccxt/pull/25495)
- feat(whitebit): add fetchPosition, fetchPositions, fetchPositionHistory [#25478](https://github.com/ccxt/ccxt/pull/25478)
- transpile.ts expect string fileHeaders.pyPro [#25494](https://github.com/ccxt/ccxt/pull/25494)
- fix(tradeogre): ohlcv until handling [#25497](https://github.com/ccxt/ccxt/pull/25497)
- fix(tradeogre): parseTicker parsing [#25498](https://github.com/ccxt/ccxt/pull/25498)
- [bug] Remove parsePortfolioDetails documentation [#25499](https://github.com/ccxt/ccxt/pull/25499)
- fix(tradeogre): ohlcv parsing [#25503](https://github.com/ccxt/ccxt/pull/25503)
- fix(bitstamp): parseTradingFees loop [#25505](https://github.com/ccxt/ccxt/pull/25505)
- fix(phemex): fetchPositions default currency (USDT) [#25507](https://github.com/ccxt/ccxt/pull/25507)
- fix(hyperliquid): correct swap balance [#25509](https://github.com/ccxt/ccxt/pull/25509)
- fix(exchange.py): load_markets exception handling [#25510](https://github.com/ccxt/ccxt/pull/25510)


## v4.4.67

- Update fetchOHLCV with added until parameter [#25454](https://github.com/ccxt/ccxt/pull/25454)
- fix(gotranspiler) - types completed [#25471](https://github.com/ccxt/ccxt/pull/25471)
- fix(retries) - base [#25441](https://github.com/ccxt/ccxt/pull/25441)
- Revert "build/transpile.ts minor typing fixes" [#25474](https://github.com/ccxt/ccxt/pull/25474)
- feat(luno): createDepositAddress, fetchDepositAddress [#25472](https://github.com/ccxt/ccxt/pull/25472)
- fix(bitrue): parseTickers fix [#25476](https://github.com/ccxt/ccxt/pull/25476)
- chore(deps): update ^ [#25477](https://github.com/ccxt/ccxt/pull/25477)
- feat(coinbase): add fetchPortfolioDetails [#25470](https://github.com/ccxt/ccxt/pull/25470)
- fix(csharpTranspiler) - types completed [#25469](https://github.com/ccxt/ccxt/pull/25469)
- fix(bybit): handleErrors [#25480](https://github.com/ccxt/ccxt/pull/25480)
- fix(hyperliquid): createOrders in GO [#25483](https://github.com/ccxt/ccxt/pull/25483)
- fix(coinbase): deposit key [#25485](https://github.com/ccxt/ccxt/pull/25485)


## v4.4.66

- fetchDeposits update [#25405](https://github.com/ccxt/ccxt/pull/25405)
- fix(build) build broken: duplicated key hashkey#cancelOrder [#25422](https://github.com/ccxt/ccxt/pull/25422)
- chore: update go install command [#25424](https://github.com/ccxt/ccxt/pull/25424)
- fix(gate): fetchFundingRates inverse [#25426](https://github.com/ccxt/ccxt/pull/25426)
- build(deps): bump esbuild and tsx [#25398](https://github.com/ccxt/ccxt/pull/25398)
- tradeogre add fetchTickers and OHLCV [#25425](https://github.com/ccxt/ccxt/pull/25425)
- fix(gate): watchBidsAsks flag [#25434](https://github.com/ccxt/ccxt/pull/25434)
- fix(bitget): editOrder fix [#25430](https://github.com/ccxt/ccxt/pull/25430)
- chore: update sponsors [#25439](https://github.com/ccxt/ccxt/pull/25439)
- Brocker ID tests updated with cryptomus and derive [#25440](https://github.com/ccxt/ccxt/pull/25440)
- feat(whitebit): add endpoints [#25449](https://github.com/ccxt/ccxt/pull/25449)
- Derive `checkRequiredCredentials` moved from `sign` to `signHash` [#25448](https://github.com/ccxt/ccxt/pull/25448)
- feat(bitget): update fetchCanceledAndClosedOrders [#25444](https://github.com/ccxt/ccxt/pull/25444)
- build(deps-dev): bump prismjs from 1.29.0 to 1.30.0 [#25442](https://github.com/ccxt/ccxt/pull/25442)
- feat(whitebit): add fetchFundingHistory [#25370](https://github.com/ccxt/ccxt/pull/25370)
- Update README.md [#25453](https://github.com/ccxt/ccxt/pull/25453)
- feat(cli): read keys.json [#25458](https://github.com/ccxt/ccxt/pull/25458)
- fix(whitebit): remove duplicated endpoint [#25461](https://github.com/ccxt/ccxt/pull/25461)
- feat(whitebit): add conversion methods [#25376](https://github.com/ccxt/ccxt/pull/25376)
- fix(hyperliquid.go) packb helpers [#25460](https://github.com/ccxt/ccxt/pull/25460)
- fix(htx): cancelOrder error handling [#25462](https://github.com/ccxt/ccxt/pull/25462)


## v4.4.65

- feat(derive): new exchange [#24762](https://github.com/ccxt/ccxt/pull/24762)
- fix(bitrue): replace fromIdx with until [#25412](https://github.com/ccxt/ccxt/pull/25412)
- docs: add go proxy instructions [#25410](https://github.com/ccxt/ccxt/pull/25410)
- fix(actions): avoid pull conflicts [#25414](https://github.com/ccxt/ccxt/pull/25414)
- Cryptomus integration [#23581](https://github.com/ccxt/ccxt/pull/23581)
- fix(binance): read portfolioMargin from options [#25415](https://github.com/ccxt/ccxt/pull/25415)
- fix(derive): flip var [#25416](https://github.com/ccxt/ccxt/pull/25416)
- fix(tests): safe dict wrapper [#25419](https://github.com/ccxt/ccxt/pull/25419)


## v4.4.64

- fix(gate): watchPostions filter empty positions on snapshot [#25385](https://github.com/ccxt/ccxt/pull/25385)
- fix(c#): add streaming dict [#25386](https://github.com/ccxt/ccxt/pull/25386)
- build(deps): bump github.com/ethereum/go-ethereum from 1.14.12 to 1.14.13 in /go/cli [#25390](https://github.com/ccxt/ccxt/pull/25390)
- onetradings: fetchTime, fetchCurrencies - static tests [#25384](https://github.com/ccxt/ccxt/pull/25384)
- feat(util): add exchange removal script and remove currencycom [#25394](https://github.com/ccxt/ccxt/pull/25394)
- cryptocom error mapping [#25395](https://github.com/ccxt/ccxt/pull/25395)
- build(deps): bump github.com/ethereum/go-ethereum from 1.14.12 to 1.14.13 in /go/tests/profile [#25397](https://github.com/ccxt/ccxt/pull/25397)
- fix(bybit): correct volume key in parse ws ohlcv [#25400](https://github.com/ccxt/ccxt/pull/25400)
- fix(gate): ws id [#25401](https://github.com/ccxt/ccxt/pull/25401)
- feat(paradex): add TP/SL order [#25407](https://github.com/ccxt/ccxt/pull/25407)
- feat(hyperliquid): add editOrders [#25322](https://github.com/ccxt/ccxt/pull/25322)
- Hyperliquid orders 2 [#25408](https://github.com/ccxt/ccxt/pull/25408)
- typo in py example [#25404](https://github.com/ccxt/ccxt/pull/25404)


## v4.4.63

- fix(bitopro): watchOrderBook [#25375](https://github.com/ccxt/ccxt/pull/25375)
- fix(vertex): watchOrderBook [#25377](https://github.com/ccxt/ccxt/pull/25377)
- feat(gate): add ccxt referral to private websocket requests [#25374](https://github.com/ccxt/ccxt/pull/25374)
- fix(binance)  - spot marginMode [#23694](https://github.com/ccxt/ccxt/pull/23694)
- onetrading fetchMarkets static response [#25380](https://github.com/ccxt/ccxt/pull/25380)
- fix(go): mathFloor type checking [#25381](https://github.com/ccxt/ccxt/pull/25381)
- feat(binance): add portfolio/pmloan-history [#25382](https://github.com/ccxt/ccxt/pull/25382)


## v4.4.62

- whitebit sign fix [#25353](https://github.com/ccxt/ccxt/pull/25353)
- gate & exchange - networks [#25307](https://github.com/ccxt/ccxt/pull/25307)
- fix(bingx): closedOrders limit param [#25356](https://github.com/ccxt/ccxt/pull/25356)
- refactor(bybit) remove enableDemoTrading no longer required [#25359](https://github.com/ccxt/ccxt/pull/25359)
- fix(go): update exchange_dynamic.go when transpiling single exchange [#25360](https://github.com/ccxt/ccxt/pull/25360)
- Bitmart update [#25342](https://github.com/ccxt/ccxt/pull/25342)
- fix(go): getValue boundaries [#25362](https://github.com/ccxt/ccxt/pull/25362)
- fix(tradeogre): formatting amount and price [#25363](https://github.com/ccxt/ccxt/pull/25363)
- fix(phemex) - inverse symbols [#25367](https://github.com/ccxt/ccxt/pull/25367)
- fix(python) - encode decode latin-1 into utf-8 [#25365](https://github.com/ccxt/ccxt/pull/25365)
- feat(bybit): revert enableDemoTrading removal [#25369](https://github.com/ccxt/ccxt/pull/25369)
- fix(phemex) - two loadmarkets [#25366](https://github.com/ccxt/ccxt/pull/25366)


## 4.4.52

- test(base) - afterConstructor [#25282](https://github.com/ccxt/ccxt/pull/25282)
- feat(xt): ohlcv pagination [#25286](https://github.com/ccxt/ccxt/pull/25286)
- fix(bybit): parseOpenInterest, different open interest for linear and inverse [#25287](https://github.com/ccxt/ccxt/pull/25287)
- fix(hollaex): fetchDepositWithdrawFees - returns response [#25284](https://github.com/ccxt/ccxt/pull/25284)
- feat(xt): add watchPositions [#25261](https://github.com/ccxt/ccxt/pull/25261)
- feat(binance): add editOrders [#25290](https://github.com/ccxt/ccxt/pull/25290)
- fix(bitget): skip sandbox header in fetchTime [#25291](https://github.com/ccxt/ccxt/pull/25291)
- test(ticker) - fix precisions PHP [#25295](https://github.com/ccxt/ccxt/pull/25295)
- fix(gate): remove subscriptions for watch symbols [#25301](https://github.com/ccxt/ccxt/pull/25301)
- test(currency) - leveraged tokens tests ^ [#25298](https://github.com/ccxt/ccxt/pull/25298)
- fix(gate) - trade timestamps [#25299](https://github.com/ccxt/ccxt/pull/25299)
- fix(go): signSecp256k1 available in all envs [#25303](https://github.com/ccxt/ccxt/pull/25303)
- fix(go): signSecp256k1 available in all envs [#25305](https://github.com/ccxt/ccxt/pull/25305)
- fix(phemex) - perpetual pilot [#25304](https://github.com/ccxt/ccxt/pull/25304)
- gate - networks list unification ^ [#18487](https://github.com/ccxt/ccxt/pull/18487)
- chore: Remove appveyor [#25313](https://github.com/ccxt/ccxt/pull/25313)
- fix(exchange) - transpilable parts (RL & init methods) [#23372](https://github.com/ccxt/ccxt/pull/23372)
- feat(bybit): add new api [#25310](https://github.com/ccxt/ccxt/pull/25310)
- fix(phemex) - perps lower [#25320](https://github.com/ccxt/ccxt/pull/25320)
- fix(kraken) expose askVolume and bidVolume in fetchTicker [#25324](https://github.com/ccxt/ccxt/pull/25324)
- test(base) - comments * [#25327](https://github.com/ccxt/ccxt/pull/25327)
- fix(cli) - http response [#25329](https://github.com/ccxt/ccxt/pull/25329)
- feat(bybit) - fetchBidsAsks [#25328](https://github.com/ccxt/ccxt/pull/25328)
- feat(bybit): add editOrders [#25311](https://github.com/ccxt/ccxt/pull/25311)
- feat(phemex): add fetchConvertQuote, createConvertTrade, fetchConvertHistory [#25306](https://github.com/ccxt/ccxt/pull/25306)
- fix(phemex) - createOrder reduceOnly [#25333](https://github.com/ccxt/ccxt/pull/25333)
- fix(lbank) - trade parsing [#25334](https://github.com/ccxt/ccxt/pull/25334)
- chore: update cleanup script [#25339](https://github.com/ccxt/ccxt/pull/25339)
- feat(binance): add coinm ws api [#25330](https://github.com/ccxt/ccxt/pull/25330)
- fix(bingx): fetchCanceledAndClosedOrders symbol requirement [#25341](https://github.com/ccxt/ccxt/pull/25341)
- fix: myokx uses the wrong rest api URL's [#25344](https://github.com/ccxt/ccxt/pull/25344)
- chore(deps): bump github.com/ethereum/go-ethereum from 1.14.12 to 1.14.13 in /go/tests/types [#25346](https://github.com/ccxt/ccxt/pull/25346)
- refactor(handleMarketTypeAndParams) [#25222](https://github.com/ccxt/ccxt/pull/25222)
- whitebit parseTrade update [#25348](https://github.com/ccxt/ccxt/pull/25348)
- chore: update release tag [#25349](https://github.com/ccxt/ccxt/pull/25349)


## 4.4.51

- chore: release npm auth [#25072](https://github.com/ccxt/ccxt/pull/25072)
- deribit - fix 2 [#25064](https://github.com/ccxt/ccxt/pull/25064)
- feat(base) - handleTriggerDirectionAndParams [#24548](https://github.com/ccxt/ccxt/pull/24548)
- refactor(test) - remove unused var [#25071](https://github.com/ccxt/ccxt/pull/25071)


## 4.4.50

- fix(onetrading): update docs [#24977](https://github.com/ccxt/ccxt/pull/24977)
- chore: add new action [#24980](https://github.com/ccxt/ccxt/pull/24980)
- chore: push-generated action logs [#24983](https://github.com/ccxt/ccxt/pull/24983)
- chore: try push from JS [#24985](https://github.com/ccxt/ccxt/pull/24985)
- chore: Try push 2 [#24986](https://github.com/ccxt/ccxt/pull/24986)
- chore: try set origin [#24987](https://github.com/ccxt/ccxt/pull/24987)
- chore: try push 4 [#24988](https://github.com/ccxt/ccxt/pull/24988)
- fix(mexc): broker API signature error [#24982](https://github.com/ccxt/ccxt/pull/24982)
- chore: try gh_token [#24990](https://github.com/ccxt/ccxt/pull/24990)
- chore: push 6 [#24991](https://github.com/ccxt/ccxt/pull/24991)
- fix(cli) - c# [#24989](https://github.com/ccxt/ccxt/pull/24989)
- chore: try push 7 [#24992](https://github.com/ccxt/ccxt/pull/24992)
- chore: try-push 9 [#24993](https://github.com/ccxt/ccxt/pull/24993)
- chore: try push and skip [#24994](https://github.com/ccxt/ccxt/pull/24994)
- chore: avoid recursion loop [#24995](https://github.com/ccxt/ccxt/pull/24995)
- chore: restore token [#24997](https://github.com/ccxt/ccxt/pull/24997)
- chore: ignore commit error [#24998](https://github.com/ccxt/ccxt/pull/24998)
- chore: conditional token availability [#24999](https://github.com/ccxt/ccxt/pull/24999)
- chore: test dummy change [#25000](https://github.com/ccxt/ccxt/pull/25000)
- chore: another try [#25001](https://github.com/ccxt/ccxt/pull/25001)
- chore: use gh_token [#25002](https://github.com/ccxt/ccxt/pull/25002)
- chore: debug github vars [#25009](https://github.com/ccxt/ccxt/pull/25009)
- fix(deribit): fetchFundingRateHistory, edit since and until handling [#25008](https://github.com/ccxt/ccxt/pull/25008)
- chore: try print vars [#25010](https://github.com/ccxt/ccxt/pull/25010)
- fix(htx) - sign order [#24979](https://github.com/ccxt/ccxt/pull/24979)
- chore: debug github vars [#25011](https://github.com/ccxt/ccxt/pull/25011)
- chore: try skip actions commits [#25012](https://github.com/ccxt/ccxt/pull/25012)
- chore: move py/php/c# pushback to actions [#25015](https://github.com/ccxt/ccxt/pull/25015)
- chore: draft release action [#25016](https://github.com/ccxt/ccxt/pull/25016)
- chore(astt) - update ^ [#25018](https://github.com/ccxt/ccxt/pull/25018)
- fix(gate): fetchCurrencies parsing [#25017](https://github.com/ccxt/ccxt/pull/25017)
- chore: Release draft build [#25020](https://github.com/ccxt/ccxt/pull/25020)
- chore: release permissions [#25021](https://github.com/ccxt/ccxt/pull/25021)
- chore: release permissions [#25022](https://github.com/ccxt/ccxt/pull/25022)
- chore: release move action up [#25024](https://github.com/ccxt/ccxt/pull/25024)
- chore: release permissions [#25025](https://github.com/ccxt/ccxt/pull/25025)
- chore: release action: mkdir [#25026](https://github.com/ccxt/ccxt/pull/25026)
- chore: release try to create folder [#25027](https://github.com/ccxt/ccxt/pull/25027)
- fix(kucoin): fetchMyTrades limit [#25023](https://github.com/ccxt/ccxt/pull/25023)
- chore: try rebase=false [#25028](https://github.com/ccxt/ccxt/pull/25028)
- chore: git pull origin [#25029](https://github.com/ccxt/ccxt/pull/25029)
- fix(mexc): support tif in params [#25030](https://github.com/ccxt/ccxt/pull/25030)
- chore: travis skip actions commits [#25033](https://github.com/ccxt/ccxt/pull/25033)
- refactor(exchange) - features ^ [#24975](https://github.com/ccxt/ccxt/pull/24975)
- feat(xt) - features [#24965](https://github.com/ccxt/ccxt/pull/24965)
- feat(wazirx) - features [#24962](https://github.com/ccxt/ccxt/pull/24962)
- feat(vertex) - features [#24959](https://github.com/ccxt/ccxt/pull/24959)
- feat(yobit) - features [#24966](https://github.com/ccxt/ccxt/pull/24966)
- feat(zonda) - features [#24968](https://github.com/ccxt/ccxt/pull/24968)
- feat(zaif) - features [#24967](https://github.com/ccxt/ccxt/pull/24967)
- chore: add dotnet to live-tests [#25034](https://github.com/ccxt/ccxt/pull/25034)
- feat(whitebit) - features [#24963](https://github.com/ccxt/ccxt/pull/24963)
- feat(wavesexchange) - features [#24961](https://github.com/ccxt/ccxt/pull/24961)
- chore: avoid loop [#25035](https://github.com/ccxt/ccxt/pull/25035)
- chore: test actions dummy [#25037](https://github.com/ccxt/ccxt/pull/25037)
- chore: fix workflow condition [#25038](https://github.com/ccxt/ccxt/pull/25038)
- chore: skip travis master commit [#25039](https://github.com/ccxt/ccxt/pull/25039)
- chore: add deployment steps to release.yml [#25036](https://github.com/ccxt/ccxt/pull/25036)
- chore: add final steps to release [#25041](https://github.com/ccxt/ccxt/pull/25041)
- fix(binance) - zero prices [#24581](https://github.com/ccxt/ccxt/pull/24581)
- fix(php) - safeNumberOmitZero [#25043](https://github.com/ccxt/ccxt/pull/25043)
- fix(binance): keepAliveListenKey [#25045](https://github.com/ccxt/ccxt/pull/25045)
- chore: add config --global to user.name [#25048](https://github.com/ccxt/ccxt/pull/25048)
- feat(probit): fetchOHLCV - params["until"] [#25032](https://github.com/ccxt/ccxt/pull/25032)
- binance features updates (part 1) [#25007](https://github.com/ccxt/ccxt/pull/25007)
- fix(docs): fix htx docs, fix #25044 [#25051](https://github.com/ccxt/ccxt/pull/25051)
- feat(blofin): add testnet urls [#25052](https://github.com/ccxt/ccxt/pull/25052)
- fix(blofin): features test [#25054](https://github.com/ccxt/ccxt/pull/25054)
- fix(deribit) - fetchFundingRateHistory pagination [#25049](https://github.com/ccxt/ccxt/pull/25049)
- fix(coinex): depositAddress memo parsing [#25056](https://github.com/ccxt/ccxt/pull/25056)
- chore: add debug to release.yml [#25057](https://github.com/ccxt/ccxt/pull/25057)
- chore: relesat tag msg [#25058](https://github.com/ccxt/ccxt/pull/25058)
- fix(coinex): watchBalance - only watch active currencies [#25061](https://github.com/ccxt/ccxt/pull/25061)
- fix(coinmetro): fix fetchMarkets [#25059](https://github.com/ccxt/ccxt/pull/25059)
- fix(coinlist): loadMarkets test, skip precision.amount [#25055](https://github.com/ccxt/ccxt/pull/25055)
- chore: replace gh installations [#25060](https://github.com/ccxt/ccxt/pull/25060)
- chore: remove gh installation [#25062](https://github.com/ccxt/ccxt/pull/25062)
- chore: release pull first [#25065](https://github.com/ccxt/ccxt/pull/25065)
- chore: set gh token [#25066](https://github.com/ccxt/ccxt/pull/25066)
- chore: release fixes [#25067](https://github.com/ccxt/ccxt/pull/25067)
- chore: relesae twine install [#25068](https://github.com/ccxt/ccxt/pull/25068)


## 4.4.49

- fix(binance): fetchOpenOrder docs [#24939](https://github.com/ccxt/ccxt/pull/24939)
- fix: docs build [#24940](https://github.com/ccxt/ccxt/pull/24940)
- fix: csharp action - upgrade to net 7.0 [#24941](https://github.com/ccxt/ccxt/pull/24941)
- feat(paymium) - features [#24931](https://github.com/ccxt/ccxt/pull/24931)
- feat(tradeogre) - features [#24936](https://github.com/ccxt/ccxt/pull/24936)
- feat(timex) - features [#24934](https://github.com/ccxt/ccxt/pull/24934)
- feat(probit) - features [#24932](https://github.com/ccxt/ccxt/pull/24932)
- withdraw with memo [#24938](https://github.com/ccxt/ccxt/pull/24938)
- fix(mexc): inverse subType [#24945](https://github.com/ccxt/ccxt/pull/24945)
- feat(tokocrypto) - features [#24935](https://github.com/ccxt/ccxt/pull/24935)
- fix(coinex) - SOL network fix ^ [#24947](https://github.com/ccxt/ccxt/pull/24947)
- Hollaex ohlcv [#24922](https://github.com/ccxt/ccxt/pull/24922)
- feat(alpaca): add createMarketOrderWithCost [#24952](https://github.com/ccxt/ccxt/pull/24952)
- fix(kucoin) - fetchCurrencies new data [#24055](https://github.com/ccxt/ccxt/pull/24055)
- feat(binance): protect safeMarket call [#24958](https://github.com/ccxt/ccxt/pull/24958)
- build: skip-tests [#24960](https://github.com/ccxt/ccxt/pull/24960)
- fix(kucoin) - parsing networks & fees [#24956](https://github.com/ccxt/ccxt/pull/24956)
- build: skip-tests [#24969](https://github.com/ccxt/ccxt/pull/24969)
- okcoin, tokocrypto, whitebit updated fetchTime [#24954](https://github.com/ccxt/ccxt/pull/24954)
- fix(blofin) - features ohlcv [#24957](https://github.com/ccxt/ccxt/pull/24957)
- feat(binance): add portfolio/negative-balance-exchange-record [#24953](https://github.com/ccxt/ccxt/pull/24953)
- fix(binance) - historical trades [#24955](https://github.com/ccxt/ccxt/pull/24955)
- feat(transpiler): add OpenInterest type [#24973](https://github.com/ccxt/ccxt/pull/24973)
- build: skip-tests [#24974](https://github.com/ccxt/ccxt/pull/24974)


## 4.4.48

- feat(deribit) - features [#24881](https://github.com/ccxt/ccxt/pull/24881)
- feat(digifinex) - features [#24882](https://github.com/ccxt/ccxt/pull/24882)
- fix(bingx): sign, json body converting arrays to strings [#24444](https://github.com/ccxt/ccxt/pull/24444)
- refactor(bingx): use parseFundingRateHistories [#24893](https://github.com/ccxt/ccxt/pull/24893)
- feat(ellipx) - features [#24884](https://github.com/ccxt/ccxt/pull/24884)
- feat(exmo) - features [#24885](https://github.com/ccxt/ccxt/pull/24885)
- feat(hitbtc) - features [#24886](https://github.com/ccxt/ccxt/pull/24886)
- feat(idex) - features [#24891](https://github.com/ccxt/ccxt/pull/24891)
- feat(hollaex) - features [#24887](https://github.com/ccxt/ccxt/pull/24887)
- feat(huobijp) - features [#24888](https://github.com/ccxt/ccxt/pull/24888)
- feat(bitmart): support ob speed [#24899](https://github.com/ccxt/ccxt/pull/24899)
- docs(ellipx): params["until"] in docstring [#24907](https://github.com/ccxt/ccxt/pull/24907)
- feat(coinsph): fetchOHLCV - params["until"], limit fix [#24869](https://github.com/ccxt/ccxt/pull/24869)
- feat(novadax) - features [#24906](https://github.com/ccxt/ccxt/pull/24906)
- feat(luno) - features [#24901](https://github.com/ccxt/ccxt/pull/24901)
- feat(mercado) - features [#24903](https://github.com/ccxt/ccxt/pull/24903)
- feat(independentreserve) - features [#24894](https://github.com/ccxt/ccxt/pull/24894)
- feat(lykke) - features [#24902](https://github.com/ccxt/ccxt/pull/24902)
- feat(bitget) - fetchOhlcv useHistoryEndpoint [#24900](https://github.com/ccxt/ccxt/pull/24900)
- feat(indodax) - features [#24895](https://github.com/ccxt/ccxt/pull/24895)
- feat(lbank) - features [#24898](https://github.com/ccxt/ccxt/pull/24898)
- feat(kuna) - features [#24896](https://github.com/ccxt/ccxt/pull/24896)
- fix(mexc): add currency id [#24911](https://github.com/ccxt/ccxt/pull/24911)
- fix(bingx): application/json custom encoding [#24910](https://github.com/ccxt/ccxt/pull/24910)
- feat(oxfun) - features [#24916](https://github.com/ccxt/ccxt/pull/24916)
- feat(p2b) - features [#24917](https://github.com/ccxt/ccxt/pull/24917)
- feat(okcoin) - features [#24913](https://github.com/ccxt/ccxt/pull/24913)
- fix(hyperliquid): type transfer [#24920](https://github.com/ccxt/ccxt/pull/24920)
- fix(static-updater) - tsx support [#24478](https://github.com/ccxt/ccxt/pull/24478)
- feat(digifinex): fetchOHLCV - params["until"] [#24889](https://github.com/ccxt/ccxt/pull/24889)
- feat(latoken) - features [#24897](https://github.com/ccxt/ccxt/pull/24897)
- feat(paradex) - features [#24918](https://github.com/ccxt/ccxt/pull/24918)
- feat(myokx) - features [#24904](https://github.com/ccxt/ccxt/pull/24904)
- feat(onetrading) - features [#24914](https://github.com/ccxt/ccxt/pull/24914)
- fix(bingx): fetchBalance parsing [#24912](https://github.com/ccxt/ccxt/pull/24912)
- feat(ndax) - features [#24905](https://github.com/ccxt/ccxt/pull/24905)
- feat(oceanex) - features [#24909](https://github.com/ccxt/ccxt/pull/24909)
- build: skip-tests [#24927](https://github.com/ccxt/ccxt/pull/24927)


## 4.4.47

- feat(coinmetro) - features [#24837](https://github.com/ccxt/ccxt/pull/24837)
- feat(coincatch) - features [#24828](https://github.com/ccxt/ccxt/pull/24828)
- feat(features) - coincheck [#24833](https://github.com/ccxt/ccxt/pull/24833)
- feat(coinspot) - features [#24840](https://github.com/ccxt/ccxt/pull/24840)
- feat(coinlist) - features [#24834](https://github.com/ccxt/ccxt/pull/24834)
- feat(coinmate) - features [#24836](https://github.com/ccxt/ccxt/pull/24836)
- feat(coinone) - features [#24838](https://github.com/ccxt/ccxt/pull/24838)
- feat(coinsph) - features [#24839](https://github.com/ccxt/ccxt/pull/24839)
- fix(krakenfutures): correct leverage tiers [#24844](https://github.com/ccxt/ccxt/pull/24844)
- fix(defx,bitget): remove params[''] [#24845](https://github.com/ccxt/ccxt/pull/24845)
- chore: update changelog [#24851](https://github.com/ccxt/ccxt/pull/24851)
- feat(phemex) - features [#24849](https://github.com/ccxt/ccxt/pull/24849)
- fix(paradex): shorten expiration of jwt token [#24862](https://github.com/ccxt/ccxt/pull/24862)
- independentreserve - add new api endpoitns [#24860](https://github.com/ccxt/ccxt/pull/24860)
- fix(ace): correct key for orderbook [#24861](https://github.com/ccxt/ccxt/pull/24861)
- fix(kraken): skip ZEUS [#24857](https://github.com/ccxt/ccxt/pull/24857)
- fix(bybit): createOrder docs [#24863](https://github.com/ccxt/ccxt/pull/24863)
- feat(poloniexfutures) - features [#24854](https://github.com/ccxt/ccxt/pull/24854)
- feat(upbit) - features [#24855](https://github.com/ccxt/ccxt/pull/24855)
- feat(poloniex) - features [#24852](https://github.com/ccxt/ccxt/pull/24852)
- Fix: Corrected Delta Exchange payload signature generation for cancel order [#24853](https://github.com/ccxt/ccxt/pull/24853)
- feat: adding timeDifference option  [#24639](https://github.com/ccxt/ccxt/pull/24639)
- fix(hyperliquid): update active [#24875](https://github.com/ccxt/ccxt/pull/24875)
- feat(currencycom) - features [#24865](https://github.com/ccxt/ccxt/pull/24865)
- feat(defx) - features [#24866](https://github.com/ccxt/ccxt/pull/24866)
- feat(delta) - features [#24867](https://github.com/ccxt/ccxt/pull/24867)
- refactor(binance): use parseFundingRateHistories [#24876](https://github.com/ccxt/ccxt/pull/24876)
- fix(bybit): fetchBalance parsing [#24879](https://github.com/ccxt/ccxt/pull/24879)
- build: skip-tests [#24880](https://github.com/ccxt/ccxt/pull/24880)


## 4.4.46

- bybit: add api [#24763](https://github.com/ccxt/ccxt/pull/24763)
- fix(bitget): close position [#24761](https://github.com/ccxt/ccxt/pull/24761)
- fix(gate): unify networks [#24759](https://github.com/ccxt/ccxt/pull/24759)
- fix(okx): update avaxc network [#24764](https://github.com/ccxt/ccxt/pull/24764)
- fix(base) - disable last json response [#23931](https://github.com/ccxt/ccxt/pull/23931)
- feat(bigone): fetchOHLCV - params["until"] [#24760](https://github.com/ccxt/ccxt/pull/24760)
- chore: update readme [#24781](https://github.com/ccxt/ccxt/pull/24781)
- feat(bitfinex1): fetchOHLCV - params["until"] [#24773](https://github.com/ccxt/ccxt/pull/24773)
- fix(bingx) - ws balance incoming [#24765](https://github.com/ccxt/ccxt/pull/24765)
- feat(ace) - features [#24766](https://github.com/ccxt/ccxt/pull/24766)
- feat(alpaca) - features [#24767](https://github.com/ccxt/ccxt/pull/24767)
- feat(ascendex) - features [#24769](https://github.com/ccxt/ccxt/pull/24769)
- feat(bigone) - features [#24770](https://github.com/ccxt/ccxt/pull/24770)
- feat(binanceus) - features [#24771](https://github.com/ccxt/ccxt/pull/24771)
- feat(bit2c) - features [#24772](https://github.com/ccxt/ccxt/pull/24772)
- feat(bitbank) - features [#24777](https://github.com/ccxt/ccxt/pull/24777)
- whitebit error mapping [#24782](https://github.com/ccxt/ccxt/pull/24782)
- feat(bitbns) - features [#24778](https://github.com/ccxt/ccxt/pull/24778)
- feat(bitflyer) - features [#24783](https://github.com/ccxt/ccxt/pull/24783)
- feat(bithumb) - features [#24784](https://github.com/ccxt/ccxt/pull/24784)
- feat(bitopro) - features [#24785](https://github.com/ccxt/ccxt/pull/24785)
- fix(Crypto.cs): Elliptic Curve message signing fix for JWT (+ cleanup) [#24776](https://github.com/ccxt/ccxt/pull/24776)
- tests - `createOrder` [#14772](https://github.com/ccxt/ccxt/pull/14772)
- feat(binance): add papi/rateLimit/order [#24789](https://github.com/ccxt/ccxt/pull/24789)
- bitrue - spot & swap [#24786](https://github.com/ccxt/ccxt/pull/24786)
- feat(bitso) - features [#24787](https://github.com/ccxt/ccxt/pull/24787)
- feat(bitvavo) - features [#24792](https://github.com/ccxt/ccxt/pull/24792)
- feat(blofin) - features [#24796](https://github.com/ccxt/ccxt/pull/24796)
- feat(bitteam) - features [#24788](https://github.com/ccxt/ccxt/pull/24788)
- feat(bl3p) - features [#24794](https://github.com/ccxt/ccxt/pull/24794)
- feat(blockchaincom) - features [#24795](https://github.com/ccxt/ccxt/pull/24795)
- ace & alpaca - minor edits [#24793](https://github.com/ccxt/ccxt/pull/24793)
- feat(Exchange): parseFundingRates use filterByArray [#24779](https://github.com/ccxt/ccxt/pull/24779)
- refactor(Exchange): parseOpenInterests use filterByArray [#24780](https://github.com/ccxt/ccxt/pull/24780)
- feat(btcalpha) - features [#24798](https://github.com/ccxt/ccxt/pull/24798)
- feat(btcbox) - features [#24799](https://github.com/ccxt/ccxt/pull/24799)
- feat(btcmarkets) - features [#24800](https://github.com/ccxt/ccxt/pull/24800)
- chore: detach JS headers step [#24801](https://github.com/ccxt/ccxt/pull/24801)
- feat(btcturk) - features [#24804](https://github.com/ccxt/ccxt/pull/24804)
- feat(cex) - features [#24807](https://github.com/ccxt/ccxt/pull/24807)
- fix(bybit) - fetchBalance parsing [#24808](https://github.com/ccxt/ccxt/pull/24808)
- feat(FAQ): add funding rate FAQ [#24812](https://github.com/ccxt/ccxt/pull/24812)
- fix(xt): websocket token recreated on each watch_ call, causing 429 error [#24809](https://github.com/ccxt/ccxt/pull/24809)
- chore: add github actions [read-only for now] [#24803](https://github.com/ccxt/ccxt/pull/24803)
- fix(okx): remove params[] [#24814](https://github.com/ccxt/ccxt/pull/24814)
- fix(hyperliquid): fetchFundingRateHistory required symbol [#24825](https://github.com/ccxt/ccxt/pull/24825)
- fix(krakenfutures): escape when marginlevels is undefined [#24826](https://github.com/ccxt/ccxt/pull/24826)
- feat(coinbaseexchange) - features [#24827](https://github.com/ccxt/ccxt/pull/24827)
- build: skip-tests [#24829](https://github.com/ccxt/ccxt/pull/24829)


## 4.4.45

- tests(features) - gtc [#24479](https://github.com/ccxt/ccxt/pull/24479)
- feat(delta): fetchOHLCV - params["until"] [#24746](https://github.com/ccxt/ccxt/pull/24746)
- fix(coinex): use parseInteger [#24748](https://github.com/ccxt/ccxt/pull/24748)
- fix(mexc): add missing timeframe 1w [#24747](https://github.com/ccxt/ccxt/pull/24747)
- feat(bybit) - networks mappings ^ [#24739](https://github.com/ccxt/ccxt/pull/24739)
- bybit - fetchDepositAddress unification [#24740](https://github.com/ccxt/ccxt/pull/24740)
- feat(bitget) - networks list ^ [#24742](https://github.com/ccxt/ccxt/pull/24742)
- detect missing parser methods [#24738](https://github.com/ccxt/ccxt/pull/24738)
- refactor(bitget) - networks methods [#24743](https://github.com/ccxt/ccxt/pull/24743)
- build(deps): bump next from 14.2.15 to 14.2.21 in /examples/ts/nextjs-page-router [#24744](https://github.com/ccxt/ccxt/pull/24744)
- fix(binance): pm exception mapping [#24750](https://github.com/ccxt/ccxt/pull/24750)
- feat(ascendex): fetchOHLCV - params["until"] [#24753](https://github.com/ccxt/ccxt/pull/24753)
- Update `ccxt.pro.manual.md` [#24754](https://github.com/ccxt/ccxt/pull/24754)
- fix(onetrading): order placement [#24755](https://github.com/ccxt/ccxt/pull/24755)
- fix(hyperliquid): order timestamp [#24756](https://github.com/ccxt/ccxt/pull/24756)
- build: skip-tests [#24757](https://github.com/ccxt/ccxt/pull/24757)


## 4.4.44

- feat(binance): editOrder, add portfolioMargin support [#24704](https://github.com/ccxt/ccxt/pull/24704)
- fix(bingx): remove params[''] [#24705](https://github.com/ccxt/ccxt/pull/24705)
- fix(okx) - strike num [#24708](https://github.com/ccxt/ccxt/pull/24708)
- fix(okx) - fetchmarkets retests [#24709](https://github.com/ccxt/ccxt/pull/24709)
- skip ellipx - ob2 [#24711](https://github.com/ccxt/ccxt/pull/24711)
- fix(okx) - missing currency 'info' [#24710](https://github.com/ccxt/ccxt/pull/24710)
- ellipx - L2 ob skip [#24713](https://github.com/ccxt/ccxt/pull/24713)
- bybit skip q/b vol [#24712](https://github.com/ccxt/ccxt/pull/24712)
- fix(onetrading): fetchOHLCV parsing [#24716](https://github.com/ccxt/ccxt/pull/24716)
- feat(exmo): fetchOHLCV - params.until [#24715](https://github.com/ccxt/ccxt/pull/24715)
- fix(binance): portfolioMargin handleErrors [#24717](https://github.com/ccxt/ccxt/pull/24717)
- features corrections [#24703](https://github.com/ccxt/ccxt/pull/24703)
- feat(whitebit): support v2 in tickers [#24719](https://github.com/ccxt/ccxt/pull/24719)
- feat(binance): edited fetchBalance portfolio margin [#24720](https://github.com/ccxt/ccxt/pull/24720)
- feat(blofin): adding copy trading endpoints to urls [#24721](https://github.com/ccxt/ccxt/pull/24721)
- fix(myokx) - swap/future [#24723](https://github.com/ccxt/ccxt/pull/24723)
- fix(hashkey) - buy sell taker maker fix [#24725](https://github.com/ccxt/ccxt/pull/24725)
- tests(lykke) - try with proxy [#24724](https://github.com/ccxt/ccxt/pull/24724)
- fix(binance) - ws closing signal [#24726](https://github.com/ccxt/ccxt/pull/24726)
- build: skip-tests [#24731](https://github.com/ccxt/ccxt/pull/24731)


## 4.4.43

- refactor(binance) - features [#24652](https://github.com/ccxt/ccxt/pull/24652)
- fix(delta,coincatch): linear/inverse flags [#24654](https://github.com/ccxt/ccxt/pull/24654)
- fix(bybit): option linear flag [#24655](https://github.com/ccxt/ccxt/pull/24655)
- refactor(mexc) - meta changes [#24651](https://github.com/ccxt/ccxt/pull/24651)
- fix(bitget): fetchFundingRates filtering [#24659](https://github.com/ccxt/ccxt/pull/24659)
- bingx - features upd [#24656](https://github.com/ccxt/ccxt/pull/24656)
- features - updates [#24660](https://github.com/ccxt/ccxt/pull/24660)
- fix(defx): trade side parsing [#24666](https://github.com/ccxt/ccxt/pull/24666)
- oceanex fetchOpenOrders and fetchOHLCV static tests [#24634](https://github.com/ccxt/ccxt/pull/24634)
- chore: bitmart skip-keys [#24669](https://github.com/ccxt/ccxt/pull/24669)
- tests(static) - detect & retest exchanges [#24670](https://github.com/ccxt/ccxt/pull/24670)
- tests(trades) - taker only [#24619](https://github.com/ccxt/ccxt/pull/24619)
- feat(htx): fetchOpenInterests [#24676](https://github.com/ccxt/ccxt/pull/24676)
- build(deps): bump nanoid from 3.3.7 to 3.3.8 in /examples/ts/nextjs-page-router [#24523](https://github.com/ccxt/ccxt/pull/24523)
- build(deps): bump next from 14.2.10 to 14.2.15 in /examples/ts/nextjs-page-router [#24585](https://github.com/ccxt/ccxt/pull/24585)
- ndax static tests for fetchAccounts and fetchLedger [#24682](https://github.com/ccxt/ccxt/pull/24682)
- chore: update changelog [#24684](https://github.com/ccxt/ccxt/pull/24684)
- binance: add cost in doc [#24689](https://github.com/ccxt/ccxt/pull/24689)
- fix(binance): update links to spot doc [#24688](https://github.com/ccxt/ccxt/pull/24688)
- feat(binance): add papiV2 endpoint [#24687](https://github.com/ccxt/ccxt/pull/24687)
- fix(bitopro): patch watchOrderBook [#24685](https://github.com/ccxt/ccxt/pull/24685)
- fix(transpile): replace tsx with npx tsx [#24686](https://github.com/ccxt/ccxt/pull/24686)
- fix(binance): remove params['cost'] [#24697](https://github.com/ccxt/ccxt/pull/24697)
- fix(Bitcoincom): ws urls [#24693](https://github.com/ccxt/ccxt/pull/24693)
- ndax editOrder static test [#24692](https://github.com/ccxt/ccxt/pull/24692)
- build: skip-tests [#24699](https://github.com/ccxt/ccxt/pull/24699)


## 4.4.42

- feat(hyperliquid): certify :D [#24624](https://github.com/ccxt/ccxt/pull/24624)
- feat(bingx): add unique sign handling for some account endpoints [#24625](https://github.com/ccxt/ccxt/pull/24625)
- feat(transpile): split php and python transpilation [#24626](https://github.com/ccxt/ccxt/pull/24626)
- build: move files to typescript [#24627](https://github.com/ccxt/ccxt/pull/24627)
- fix(transpileWs): multiprocess [#24629](https://github.com/ccxt/ccxt/pull/24629)
- chore: debug build [#24630](https://github.com/ccxt/ccxt/pull/24630)
- chore: fix import [#24631](https://github.com/ccxt/ccxt/pull/24631)
- chore: try replace with npm command [#24632](https://github.com/ccxt/ccxt/pull/24632)
- chore: replace tsx calls with npm commands [#24636](https://github.com/ccxt/ccxt/pull/24636)
- feat(vertex): add fetchOpenInterests [#24633](https://github.com/ccxt/ccxt/pull/24633)
- fix(phemex): fetchPositions code handling [#24637](https://github.com/ccxt/ccxt/pull/24637)
- fix(php) - E_STRICT removal [#24640](https://github.com/ccxt/ccxt/pull/24640)
- feat(okx): add myokx branch [wip] [#24638](https://github.com/ccxt/ccxt/pull/24638)
- fix(php) - version numbers [#24641](https://github.com/ccxt/ccxt/pull/24641)
- fix(myokx): urls [#24642](https://github.com/ccxt/ccxt/pull/24642)
- fix(php) - pow gmp [#24643](https://github.com/ccxt/ccxt/pull/24643)
- fix(gemini) - add triggerPrice [#24644](https://github.com/ccxt/ccxt/pull/24644)
- fix(woo) - stoploss/takeprofit price [#24613](https://github.com/ccxt/ccxt/pull/24613)
- gemini - `features` [#24647](https://github.com/ccxt/ccxt/pull/24647)
- feat(bitstamp) - .features implementation [#24438](https://github.com/ccxt/ccxt/pull/24438)
- refactor(exchanges) - remove extra [#24648](https://github.com/ccxt/ccxt/pull/24648)
- gmp func - 2 [#24646](https://github.com/ccxt/ccxt/pull/24646)
- build: [skip-tests] [#24645](https://github.com/ccxt/ccxt/pull/24645)


## 4.4.41

- feat(kraken) - features [#24575](https://github.com/ccxt/ccxt/pull/24575)
- chore: try workflow [debug] [#24593](https://github.com/ccxt/ccxt/pull/24593)
- chore: remove workflows [#24595](https://github.com/ccxt/ccxt/pull/24595)
- fix(triggerPrice) - bulk exchanges 1 [#24555](https://github.com/ccxt/ccxt/pull/24555)
- feat(cryptocom): error mapping [#24603](https://github.com/ccxt/ccxt/pull/24603)
- feat(binance): add portfolio mint/reedem endpoint [#24604](https://github.com/ccxt/ccxt/pull/24604)
- fix(exchange) - handleOptionAndParams2 [#24600](https://github.com/ccxt/ccxt/pull/24600)
- feat(woox) - until missing [#24614](https://github.com/ccxt/ccxt/pull/24614)
- feat(binance): add blockTrades endpoint [#24592](https://github.com/ccxt/ccxt/pull/24592)
- bingx fetchMyTrades limit [#24605](https://github.com/ccxt/ccxt/pull/24605)
- fix(exchanges) - remove extra [#24599](https://github.com/ccxt/ccxt/pull/24599)
- refactor(hashkey) - dry up [#24609](https://github.com/ccxt/ccxt/pull/24609)
- hashkey -`features` [#24610](https://github.com/ccxt/ccxt/pull/24610)
- feat(coinex) - features [#24596](https://github.com/ccxt/ccxt/pull/24596)
- fix(blofin): default balance [#24606](https://github.com/ccxt/ccxt/pull/24606)
- feat(bitfinex): add fetchOpenInterests [#24611](https://github.com/ccxt/ccxt/pull/24611)
- oceanex: static tests for fetchBalance, fetchTicker [#24591](https://github.com/ccxt/ccxt/pull/24591)
- feat(hitbtc): add fetchOpenInterests [#24612](https://github.com/ccxt/ccxt/pull/24612)
- woo (woox) -  `features` implementation [#24615](https://github.com/ccxt/ccxt/pull/24615)
- feat(bitfinex) - `features` [#24617](https://github.com/ccxt/ccxt/pull/24617)
- feat(woofipro) - `features` implementation [#24616](https://github.com/ccxt/ccxt/pull/24616)
- ndax static tests [#24573](https://github.com/ccxt/ccxt/pull/24573)
- krakenfutures - features [#24578](https://github.com/ccxt/ccxt/pull/24578)
- build: skip-tests [#24618](https://github.com/ccxt/ccxt/pull/24618)
- fix(ndax): tests [skip-tests] [#24620](https://github.com/ccxt/ccxt/pull/24620)
- fix(blofin): protect data [skip-tests] [#24621](https://github.com/ccxt/ccxt/pull/24621)


## 4.4.40

- build Improve generate implicit api [#24553](https://github.com/ccxt/ccxt/pull/24553)
- refactor(bybit) - `stopPrice` to `triggerPrice` [#24536](https://github.com/ccxt/ccxt/pull/24536)
- kraken: adjust clientOrderId handling in methods [#24504](https://github.com/ccxt/ccxt/pull/24504)
- feat(kucoin): add adjustForTimeDifference option [#24558](https://github.com/ccxt/ccxt/pull/24558)
- chore: update changelog [#24562](https://github.com/ccxt/ccxt/pull/24562)
- feat(bitget): add 41001 error mapping [#24563](https://github.com/ccxt/ccxt/pull/24563)
- fix(xt): fundingRate protection against null [#24567](https://github.com/ccxt/ccxt/pull/24567)
- feat(exmo): add createMarketOrderWithCost [#24568](https://github.com/ccxt/ccxt/pull/24568)
- feat(bitmart): fetchFundingRateHistory [#24569](https://github.com/ccxt/ccxt/pull/24569)
- feat(bitmart): fetchLedger and fetchFundingHistory [#24574](https://github.com/ccxt/ccxt/pull/24574)
- feat(okx) - sol staking endpoints [#24570](https://github.com/ccxt/ccxt/pull/24570)
- refactor(binance) - `stopPrice` -> `triggerPrice` [#24535](https://github.com/ccxt/ccxt/pull/24535)
- docs(triggerDirection) - ascending/descending [#24547](https://github.com/ccxt/ccxt/pull/24547)
- bingx methods [#24580](https://github.com/ccxt/ccxt/pull/24580)
- feat(hyperliquid): add fetchOpenInterest/s [#24577](https://github.com/ccxt/ccxt/pull/24577)
- mexc feature rename [#24579](https://github.com/ccxt/ccxt/pull/24579)
- chore: github workflow [ignore] [#24584](https://github.com/ccxt/ccxt/pull/24584)
- fix(pagination): allow repeated option [#24582](https://github.com/ccxt/ccxt/pull/24582)
- bingx fetchOHLCV fix [#24583](https://github.com/ccxt/ccxt/pull/24583)
- build: skip-tests [#24586](https://github.com/ccxt/ccxt/pull/24586)


## 4.4.39

- fix(bybit): filter execType [#24528](https://github.com/ccxt/ccxt/pull/24528)
- feat(ws): increase size limit to 10MB [#23791](https://github.com/ccxt/ccxt/pull/23791)
- fix(exchange): correct checkWsProxySettings [#24527](https://github.com/ccxt/ccxt/pull/24527)
- cryptocom - features [#24525](https://github.com/ccxt/ccxt/pull/24525)
- fix(docs): ledger link [#24529](https://github.com/ccxt/ccxt/pull/24529)
- stop to trigger [#24531](https://github.com/ccxt/ccxt/pull/24531)
- params - `stop` to `trigger` [#24532](https://github.com/ccxt/ccxt/pull/24532)
- docs(announcements) - add ^ [#24222](https://github.com/ccxt/ccxt/pull/24222)
- upbit: update doc [#24542](https://github.com/ccxt/ccxt/pull/24542)
- `stopPrice` -> `triggerPrice` [#24534](https://github.com/ccxt/ccxt/pull/24534)
- feat(coinbase) - features [#24533](https://github.com/ccxt/ccxt/pull/24533)
- mexc - features [#24517](https://github.com/ccxt/ccxt/pull/24517)
- ndax static tests [#24513](https://github.com/ccxt/ccxt/pull/24513)
- fix(bitmex): fetchFundingRate parsing [#24545](https://github.com/ccxt/ccxt/pull/24545)
- feat(coinbaseinternational) - features [#24537](https://github.com/ccxt/ccxt/pull/24537)
- feat(phemex): fetchFundingRate, add fundingRate field for linear swap [#24546](https://github.com/ccxt/ccxt/pull/24546)
- Fix coinbase fetch accounts base and exponent overflow [#24520](https://github.com/ccxt/ccxt/pull/24520)
- fix(binance): simplify reduceOnly conditional [#24516](https://github.com/ccxt/ccxt/pull/24516)
- fix(bybit): increase leverage tiers pagination [#24551](https://github.com/ccxt/ccxt/pull/24551)
- build: skip-tests [#24552](https://github.com/ccxt/ccxt/pull/24552)


## 4.4.38

- fix(mexc): add fetchTradingFee, remove fetchTradingFees [#24505](https://github.com/ccxt/ccxt/pull/24505)
- feat(okx): improve fetchTrades docs [#24506](https://github.com/ccxt/ccxt/pull/24506)
- htx - features [#24502](https://github.com/ccxt/ccxt/pull/24502)
- fix(alpaca): sandbox market API [#24510](https://github.com/ccxt/ccxt/pull/24510)
- fix(Exchange): protect cleanCache deletions [#24511](https://github.com/ccxt/ccxt/pull/24511)
- feat(digifinex): add spot <> swap to transfer [#24508](https://github.com/ccxt/ccxt/pull/24508)
- feat(examples): add exchange-save-load-markets [#24512](https://github.com/ccxt/ccxt/pull/24512)
- feat(alpaca): fetchBalance [#24514](https://github.com/ccxt/ccxt/pull/24514)
- kucoin error mapping [#24521](https://github.com/ccxt/ccxt/pull/24521)
- htx - `stop` rename into `trigger` [#24509](https://github.com/ccxt/ccxt/pull/24509)
- docs(orders) - add stoploss order [#24480](https://github.com/ccxt/ccxt/pull/24480)
- feat(woo): update parseWsOrder and rateLimit [#24518](https://github.com/ccxt/ccxt/pull/24518)
- build: skip-tests [#24522](https://github.com/ccxt/ccxt/pull/24522)


## 4.4.37

- bitmart - `.features`  [#24404](https://github.com/ccxt/ccxt/pull/24404)
- ndax static tests [#24477](https://github.com/ccxt/ccxt/pull/24477)
- Fix (kucoin): make BASE network name unified [#24481](https://github.com/ccxt/ccxt/pull/24481)
- feat(bithumb): add support for TON coin tag in withdraw method [#24472](https://github.com/ccxt/ccxt/pull/24472)
- chore: update changelog [#24488](https://github.com/ccxt/ccxt/pull/24488)
- feat(bingx): add fetchPositionHistory [#24482](https://github.com/ccxt/ccxt/pull/24482)
- fix(features) - gtc (urgent) [#24489](https://github.com/ccxt/ccxt/pull/24489)
- feat(kucoin) - features [#24486](https://github.com/ccxt/ccxt/pull/24486)
- ndax static tests, docstring params [#24492](https://github.com/ccxt/ccxt/pull/24492)
- fix(bybit): add additional Error code mappings [#24496](https://github.com/ccxt/ccxt/pull/24496)
- feat(kucoinfutures) - .features [#24487](https://github.com/ccxt/ccxt/pull/24487)
- ndax fetchDeposits - static tests [#24495](https://github.com/ccxt/ccxt/pull/24495)
- fix(bingx): php sign [#24498](https://github.com/ccxt/ccxt/pull/24498)
- feat(bingx): adjust fetchMarkOHLCV endpoint and remove private endpoint [#24470](https://github.com/ccxt/ccxt/pull/24470)
- Update probit.ts [#24497](https://github.com/ccxt/ccxt/pull/24497)
- fix(ndax): read account: [skip-tests] [#24499](https://github.com/ccxt/ccxt/pull/24499)


## 4.4.36

- refactor(bitfinex) - old into v1 [#24443](https://github.com/ccxt/ccxt/pull/24443)
- feat(gate): update logo [#24459](https://github.com/ccxt/ccxt/pull/24459)
- fix(probit) - watchTrades [#24456](https://github.com/ccxt/ccxt/pull/24456)
- feat(coinbase): add fetchDepositId, fetchDepositIds methods [#24454](https://github.com/ccxt/ccxt/pull/24454)
- fix!(bitfinex) - bitfinex2 [#24445](https://github.com/ccxt/ccxt/pull/24445)
- fix sh [#24460](https://github.com/ccxt/ccxt/pull/24460)
- refactor(features) - gtc to true as default [#24451](https://github.com/ccxt/ccxt/pull/24451)
- fix(hyperliquid): upgrade transfer signature [#24441](https://github.com/ccxt/ccxt/pull/24441)
- hyperliquid - features implementation [#24448](https://github.com/ccxt/ccxt/pull/24448)
- fix(hyperliquid): update baseid for spot market [#24465](https://github.com/ccxt/ccxt/pull/24465)
- feat(paradex): allow private request with paradexAccount [#24466](https://github.com/ccxt/ccxt/pull/24466)
- feat(coinbase): change fetchDepositId name to fetchDepositMethodId [#24467](https://github.com/ccxt/ccxt/pull/24467)
- build: skip-tests [#24468](https://github.com/ccxt/ccxt/pull/24468)


## 4.4.35

- bitopro: update fetchOpenOrders to new api [#24420](https://github.com/ccxt/ccxt/pull/24420)
- bitso sign fixed [#24421](https://github.com/ccxt/ccxt/pull/24421)
- fix(deribit): improve fetchBalance with new endpoint [#24422](https://github.com/ccxt/ccxt/pull/24422)
- test(hashkey) - skip [#24429](https://github.com/ccxt/ccxt/pull/24429)
- fix(htx): place orders in hedged mode [#24428](https://github.com/ccxt/ccxt/pull/24428)
- fix(kraken) - errors check & rewrite [#24430](https://github.com/ccxt/ccxt/pull/24430)
- feat(bitmex) - features [#24435](https://github.com/ccxt/ccxt/pull/24435)
- feat(defx): new exchange [#23980](https://github.com/ccxt/ccxt/pull/23980)
- fix(bitfinex2) - some updates [#24431](https://github.com/ccxt/ccxt/pull/24431)
- bybit: add apis [#24439](https://github.com/ccxt/ccxt/pull/24439)
- gate: add apis [#24440](https://github.com/ccxt/ccxt/pull/24440)
- build: skip-test [#24446](https://github.com/ccxt/ccxt/pull/24446)
- build: skip-tests [#24447](https://github.com/ccxt/ccxt/pull/24447)


## 4.4.34

- fix(probit): resolve ws auth [#24384](https://github.com/ccxt/ccxt/pull/24384)
- fix: myLiquidations in python [#24388](https://github.com/ccxt/ccxt/pull/24388)
- Fix(Kucoin): Typo in market structure property [#24387](https://github.com/ccxt/ccxt/pull/24387)
- fix(onetrading): remove obselete fetchTrades method [#24385](https://github.com/ccxt/ccxt/pull/24385)
- feat(hyperliquid): update precision [#24347](https://github.com/ccxt/ccxt/pull/24347)
- Hyperliquid - fix calculatePricePrecision while-loop [#24392](https://github.com/ccxt/ccxt/pull/24392)
- feat(bingx): add twap order [#24390](https://github.com/ccxt/ccxt/pull/24390)
- gate - features  [#24393](https://github.com/ccxt/ccxt/pull/24393)
- okx new endpoint [#24400](https://github.com/ccxt/ccxt/pull/24400)
- xt update rate limits [#24397](https://github.com/ccxt/ccxt/pull/24397)
- fix(bitrue): correct listenkey [#24402](https://github.com/ccxt/ccxt/pull/24402)
- fix(bitmex) - fetchOHLCV [#24401](https://github.com/ccxt/ccxt/pull/24401)
- fix(probit) - safe markets [#24406](https://github.com/ccxt/ccxt/pull/24406)
- idex - DECIMAL_PLACES into TICK_SIZE [#24273](https://github.com/ccxt/ccxt/pull/24273)
- tests related fixes [#24389](https://github.com/ccxt/ccxt/pull/24389)
- fix(bingx): sign, add Content-Type application/json [#24414](https://github.com/ccxt/ccxt/pull/24414)
- feat(kraken): update editOrder endpoint [#24413](https://github.com/ccxt/ccxt/pull/24413)
- fix(tests) - static updater [#24412](https://github.com/ccxt/ccxt/pull/24412)
- docs(onetrading): docstring @see [#24411](https://github.com/ccxt/ccxt/pull/24411)
- fix(onetrading): remove fetchDeposits, fetchDepositAddress, createDepositAddress [#24395](https://github.com/ccxt/ccxt/pull/24395)
- btcmarkets.ts updated with safeValue to safeDict/Bool [#24221](https://github.com/ccxt/ccxt/pull/24221)
- fix(base) - static tests full msg [#23356](https://github.com/ccxt/ccxt/pull/23356)
- fix(probit) - WS reorganize [#24415](https://github.com/ccxt/ccxt/pull/24415)
- fix(hyperliquid) - migrate to TICK_SIZE [#24410](https://github.com/ccxt/ccxt/pull/24410)
- chore: update changelog [#24417](https://github.com/ccxt/ccxt/pull/24417)
- build: skip-tests [#24418](https://github.com/ccxt/ccxt/pull/24418)


## 4.4.33

- feat(bingx) - features [#24315](https://github.com/ccxt/ccxt/pull/24315)
- fix(gate): return value when loadUnifiedStatus [#24327](https://github.com/ccxt/ccxt/pull/24327)
- remove token_bucket [#24317](https://github.com/ccxt/ccxt/pull/24317)
- fix(okx): adjust setLeverage [#24328](https://github.com/ccxt/ccxt/pull/24328)
- fix(woo): old domain replaced with new domain woox.io [#24326](https://github.com/ccxt/ccxt/pull/24326)
- cex change rateLimit [#24329](https://github.com/ccxt/ccxt/pull/24329)
- cex order statuses [#24332](https://github.com/ccxt/ccxt/pull/24332)
- fix(bybit): options tickers [#24334](https://github.com/ccxt/ccxt/pull/24334)
- fix(krakenfuture): update error [#24340](https://github.com/ccxt/ccxt/pull/24340)
- bingx: add apis [#24342](https://github.com/ccxt/ccxt/pull/24342)
- bitbank: add apis [#24343](https://github.com/ccxt/ccxt/pull/24343)
- bitfinex: add apis [#24344](https://github.com/ccxt/ccxt/pull/24344)
- feat(bitget) - `.features` implementation [#24345](https://github.com/ccxt/ccxt/pull/24345)
- feat(phemex) - trigger orders [#24300](https://github.com/ccxt/ccxt/pull/24300)
- bybit.ts editing with safeValueN to safeListN [#24276](https://github.com/ccxt/ccxt/pull/24276)
- feat(features) - marginMode [#24351](https://github.com/ccxt/ccxt/pull/24351)
- fix: added missing createStopOrder/createTriggerOrder to exchange["has"] [#24350](https://github.com/ccxt/ccxt/pull/24350)
- chore: update changelog [#24354](https://github.com/ccxt/ccxt/pull/24354)
- idex pro docstring @see [#24356](https://github.com/ccxt/ccxt/pull/24356)
- fix(okx) - currencies & fees & static tests [#24335](https://github.com/ccxt/ccxt/pull/24335)
- fix(binance): testnet error handling [#24362](https://github.com/ccxt/ccxt/pull/24362)
- fix(onetrading): fetchTradingFees - replace dynamic method call with explicit method call [#24361](https://github.com/ccxt/ccxt/pull/24361)
- chore: bump ast-transpiler version [#24364](https://github.com/ccxt/ccxt/pull/24364)
- bitrue error mapping [#24363](https://github.com/ccxt/ccxt/pull/24363)
- refactor(static-tests-updaters) - reorg [#24349](https://github.com/ccxt/ccxt/pull/24349)
- Coinone coinsph editing safe value [#24337](https://github.com/ccxt/ccxt/pull/24337)
- Coinspot and cryptocom editing safe value [#24359](https://github.com/ccxt/ccxt/pull/24359)
- fix(coinbase): increase max limit [#24367](https://github.com/ccxt/ccxt/pull/24367)
- fix(probit): msg length in ws [#24378](https://github.com/ccxt/ccxt/pull/24378)
- binance: update python examples [#24374](https://github.com/ccxt/ccxt/pull/24374)
- feat(c#): add encoding and other fixes [#24381](https://github.com/ccxt/ccxt/pull/24381)
- fix(filterByValueSinceLimit): handle since = 0 [#24380](https://github.com/ccxt/ccxt/pull/24380)
- fix(php): array_slice handle strings [#24382](https://github.com/ccxt/ccxt/pull/24382)
- New exchange: Ellipx [#24151](https://github.com/ccxt/ccxt/pull/24151)
- build: skip-tests [#24383](https://github.com/ccxt/ccxt/pull/24383)


## 4.4.32

- bybit error mapping [#24292](https://github.com/ccxt/ccxt/pull/24292)
- kucoin - leverage param [#24291](https://github.com/ccxt/ccxt/pull/24291)
- fix(coinbase): fetchLedger pagination [#24293](https://github.com/ccxt/ccxt/pull/24293)
- kraken new endpoint for editOrder [#24297](https://github.com/ccxt/ccxt/pull/24297)
- phemex docstrings [#24302](https://github.com/ccxt/ccxt/pull/24302)
- lbank HIT mapping [#24299](https://github.com/ccxt/ccxt/pull/24299)
- fix(phemex) - space in symbols [#24296](https://github.com/ccxt/ccxt/pull/24296)
- fix(bybit): flip createMarketBuyRequiresPrice flag [#24303](https://github.com/ccxt/ccxt/pull/24303)
- fix(hyperliquid): fetchMarkets [#24295](https://github.com/ccxt/ccxt/pull/24295)
- coinex transaction status [#24307](https://github.com/ccxt/ccxt/pull/24307)
- cex error mapping [#24309](https://github.com/ccxt/ccxt/pull/24309)
- fix(binance) - error codes ^ [#24308](https://github.com/ccxt/ccxt/pull/24308)
- feat(features) - initial [#23629](https://github.com/ccxt/ccxt/pull/23629)
- test(static) - writer updates [#24311](https://github.com/ccxt/ccxt/pull/24311)
- coinbaseexchange: add api [#24316](https://github.com/ccxt/ccxt/pull/24316)
- cex parseBalance [#24313](https://github.com/ccxt/ccxt/pull/24313)
- fix(okx): illegal request error handling in ws [#24319](https://github.com/ccxt/ccxt/pull/24319)
- build: skip-tests [#24320](https://github.com/ccxt/ccxt/pull/24320)
- fix(bybit): cost order parsing [#24321](https://github.com/ccxt/ccxt/pull/24321)
- build: skip-tests [#24322](https://github.com/ccxt/ccxt/pull/24322)
- fix(bybit): php build: skip-tests [#24324](https://github.com/ccxt/ccxt/pull/24324)


## 4.4.31

- wavesexchange fetchMyTrades docstring @see [#24271](https://github.com/ccxt/ccxt/pull/24271)
- feat(phemex) - add createOrder stoploss & takeprofit limit price & triggerType params [#24269](https://github.com/ccxt/ccxt/pull/24269)
- feat(kucoinfutures): createOrder cost param [#24264](https://github.com/ccxt/ccxt/pull/24264)
- fix(indodax): rl value [#24274](https://github.com/ccxt/ccxt/pull/24274)
- fix(bitvavo): use requestId in crude ws [#24277](https://github.com/ccxt/ccxt/pull/24277)
- fix(gate): fetchFundingRatehistory since/until [#24278](https://github.com/ccxt/ccxt/pull/24278)
- feat(kucoinfutures): updated transfer, added static request tests [#24279](https://github.com/ccxt/ccxt/pull/24279)
- fix(MEXC) Fixed error in MEXC parsing, fixes issue ccxt/ccxt#24058 [#24284](https://github.com/ccxt/ccxt/pull/24284)
- chore: update changelog [#24285](https://github.com/ccxt/ccxt/pull/24285)
- feat(exchange): add orjson support [#24223](https://github.com/ccxt/ccxt/pull/24223)
- Disaster docs moving to get doc build broken [#24281](https://github.com/ccxt/ccxt/pull/24281)
- fix(exchange): json.loads call [#24289](https://github.com/ccxt/ccxt/pull/24289)
- kucoin: add errors [#24287](https://github.com/ccxt/ccxt/pull/24287)
- feat(kucoinfutures): transfer from spot account [#24282](https://github.com/ccxt/ccxt/pull/24282)
- build: skip-tests [#24290](https://github.com/ccxt/ccxt/pull/24290)


## 4.4.30

- feat(gate): fetchTime [#24242](https://github.com/ccxt/ccxt/pull/24242)
- test(exchanges): static response, fetchBorrowInterest [#24243](https://github.com/ccxt/ccxt/pull/24243)
- feat(exchanges): LeverageTier type usage [#24234](https://github.com/ccxt/ccxt/pull/24234)
- fix(hyperliquid): correct spot market [#24244](https://github.com/ccxt/ccxt/pull/24244)
- coinex error mapping [#24246](https://github.com/ccxt/ccxt/pull/24246)
- coinex cancelOrders fix [#24248](https://github.com/ccxt/ccxt/pull/24248)
- fix(coincatch): type inference in inside fetchbalance [#24249](https://github.com/ccxt/ccxt/pull/24249)
- test(exchanges): fetchMarginMode static response tests [#24255](https://github.com/ccxt/ccxt/pull/24255)
- feat(binance): fetchMarginMode [#24256](https://github.com/ccxt/ccxt/pull/24256)
- docs(ohlcv) - custom overload for raw ^ [#24258](https://github.com/ccxt/ccxt/pull/24258)
- fix(docs): move docs around [#24250](https://github.com/ccxt/ccxt/pull/24250)
- fix(transpile): remove debug statement [#24260](https://github.com/ccxt/ccxt/pull/24260)
- wavesexchange docstrings [#24261](https://github.com/ccxt/ccxt/pull/24261)
- paradex: auth token add expires [#24263](https://github.com/ccxt/ccxt/pull/24263)
- fix(transpile): python-docs [#24265](https://github.com/ccxt/ccxt/pull/24265)
- fix(requirments): pin aiohttp version: skip-tests [#24266](https://github.com/ccxt/ccxt/pull/24266)
- fix(indodax): error handling [#24267](https://github.com/ccxt/ccxt/pull/24267)
- build: skip-tests [#24268](https://github.com/ccxt/ccxt/pull/24268)


## 4.4.29

- bitmart.ts editing with safeValue to safeDict/List [#24173](https://github.com/ccxt/ccxt/pull/24173)
- bitfinex.ts updated with safeValue to safeBool/Dict [#24114](https://github.com/ccxt/ccxt/pull/24114)
- bitbns.ts updated with safeValue to safeDict/List [#24113](https://github.com/ccxt/ccxt/pull/24113)
- feat(alpaca): editOrder [#24172](https://github.com/ccxt/ccxt/pull/24172)
- fix(tests): ws import files with case sensitive OS [#24227](https://github.com/ccxt/ccxt/pull/24227)
- fix(blofin): authenticate hang [#24228](https://github.com/ccxt/ccxt/pull/24228)
- fix(lbank) parseFundingRate [#24226](https://github.com/ccxt/ccxt/pull/24226)
- test(ws) - casing [#24229](https://github.com/ccxt/ccxt/pull/24229)
- feat(binance): add staking apis [#24233](https://github.com/ccxt/ccxt/pull/24233)
- hyperliquid: update timeframes [#24231](https://github.com/ccxt/ccxt/pull/24231)
- feat(hyperliquid) fetchFundingRates [#24225](https://github.com/ccxt/ccxt/pull/24225)
- fix(deribit): spot market flags [#24235](https://github.com/ccxt/ccxt/pull/24235)
- build: skip-tests [#24237](https://github.com/ccxt/ccxt/pull/24237)
- fix(deribit): order parsing [skip-tests] [#24238](https://github.com/ccxt/ccxt/pull/24238)


## 4.4.28

- fix(cli) - auto injection fixes [#24199](https://github.com/ccxt/ccxt/pull/24199)
- feat(bitget): fetchFundingRates [#24196](https://github.com/ccxt/ccxt/pull/24196)
- feat(exchanges): withdraw use the Transaction type [#24198](https://github.com/ccxt/ccxt/pull/24198)
- fix(docs) remove broken link from examples/README.md [#24193](https://github.com/ccxt/ccxt/pull/24193)
- fix(bitvavo): ws deadlock with multiple calls [#24201](https://github.com/ccxt/ccxt/pull/24201)
- fix(lbank): parseFundingRate interval [#24204](https://github.com/ccxt/ccxt/pull/24204)
- fix(bybit) - reorg USDC [#24205](https://github.com/ccxt/ccxt/pull/24205)
- refactor(bybit) - stop & trigger [#24200](https://github.com/ccxt/ccxt/pull/24200)
- fix(bybit): parseFundingRate [#24203](https://github.com/ccxt/ccxt/pull/24203)
- bitrue.ts editing with safeValue to safeDict/List/Bool [#24181](https://github.com/ccxt/ccxt/pull/24181)
- bitopro.ts updating with safeValue to safeDict/List/bool [#24177](https://github.com/ccxt/ccxt/pull/24177)
- feat(mexc): watchTicker, watchTickers add miniTicker support [#24208](https://github.com/ccxt/ccxt/pull/24208)
- feat(exchange): add fetchOrderBookWs base [#24214](https://github.com/ccxt/ccxt/pull/24214)
- build: skip-tests [#24213](https://github.com/ccxt/ccxt/pull/24213)


## 4.4.27

- feat(binance): add option block order endpoints [#24189](https://github.com/ccxt/ccxt/pull/24189)
- alpaca: add withdraw, fetchDeposits, fetchWithdrawals tests [#24190](https://github.com/ccxt/ccxt/pull/24190)
- fix(binance): watchPositions type inference [#24195](https://github.com/ccxt/ccxt/pull/24195)
- fix(kraken) - order parsing [#24192](https://github.com/ccxt/ccxt/pull/24192)
- wavesexchange fetchOrder docstring [#24197](https://github.com/ccxt/ccxt/pull/24197)


## 4.4.26

- feat(coinbase) - fetchDepositsWithdrawals [#24155](https://github.com/ccxt/ccxt/pull/24155)
- fix(hyperliquid): update rl [#24132](https://github.com/ccxt/ccxt/pull/24132)
- chore: update readme [#24162](https://github.com/ccxt/ccxt/pull/24162)
- fix(lbank): catch error when handle ping [#24161](https://github.com/ccxt/ccxt/pull/24161)
- fix exchanges logos starting with letters A and B [#24150](https://github.com/ccxt/ccxt/pull/24150)
- fix Bybit fetchFundingRates [#24156](https://github.com/ccxt/ccxt/pull/24156)
- wavesexchange doc links [#24163](https://github.com/ccxt/ccxt/pull/24163)
- feat(gate): protect loadUnifiedStatus call [#24164](https://github.com/ccxt/ccxt/pull/24164)
- fix(coinex): transfer account id [#24165](https://github.com/ccxt/ccxt/pull/24165)
- fix(bingx): createOrders adjustments [#24170](https://github.com/ccxt/ccxt/pull/24170)
- feat(lbank) fetchFundingRates [#24166](https://github.com/ccxt/ccxt/pull/24166)
- feat(alpaca): withdraw, fetchDepositsWithdrawals [#24169](https://github.com/ccxt/ccxt/pull/24169)
- docs: update `ccxt.js` reference [#24175](https://github.com/ccxt/ccxt/pull/24175)
- wavesexchange docstrings [#24178](https://github.com/ccxt/ccxt/pull/24178)
- fix(bingx): use addressWithPrefix inside parseDepositAddress [#24182](https://github.com/ccxt/ccxt/pull/24182)
- fix(watchTickers/bidsAsks): default market [#24183](https://github.com/ccxt/ccxt/pull/24183)
- feat(cli) - static request & response auto-writing [#24149](https://github.com/ccxt/ccxt/pull/24149)
- build: skip-tests [#24184](https://github.com/ccxt/ccxt/pull/24184)
- feat(Exchange): add unWatch base implementations [#24185](https://github.com/ccxt/ccxt/pull/24185)
- fix(build): unwatchOHLCVForSymbols signature [#24186](https://github.com/ccxt/ccxt/pull/24186)
- build: skip-tests [#24187](https://github.com/ccxt/ccxt/pull/24187)


## 4.4.25

- feat(okx): add staking product-info endpoint [#24116](https://github.com/ccxt/ccxt/pull/24116)
- phemex new endpoint [#24117](https://github.com/ccxt/ccxt/pull/24117)
- feat(bingx): add sync to createOrders [#24118](https://github.com/ccxt/ccxt/pull/24118)
- feat(bingx): add /positionMargin/history [#24122](https://github.com/ccxt/ccxt/pull/24122)
- feat(phemex): fetchMarkets add create time [#24120](https://github.com/ccxt/ccxt/pull/24120)
- Margin types [#24119](https://github.com/ccxt/ccxt/pull/24119)
- isSandboxMode [#23726](https://github.com/ccxt/ccxt/pull/23726)
- feat(bingx): reduceOnly through watchOrders [#24123](https://github.com/ccxt/ccxt/pull/24123)
- feat(exchanges): use BorrowInterest type in fetchBorrowInterest [#24121](https://github.com/ccxt/ccxt/pull/24121)
- fetchBorrowInterest, static request tests [#24128](https://github.com/ccxt/ccxt/pull/24128)
- feat(cex): add fetchOpenOrder/fetchClosedOrder [#24129](https://github.com/ccxt/ccxt/pull/24129)
- exmo: add watchOrders [#24106](https://github.com/ccxt/ccxt/pull/24106)
- feat(alpaca): add fetchMyTrades support [#24136](https://github.com/ccxt/ccxt/pull/24136)
- chore: update codeowners [#24137](https://github.com/ccxt/ccxt/pull/24137)
- feat: optimize hyperliquid ohlcv [#24130](https://github.com/ccxt/ccxt/pull/24130)
- fix(bitmart): update maxlimit [#24142](https://github.com/ccxt/ccxt/pull/24142)
- feat(alpaca): add fetchTicker and fetchTickers support [#24140](https://github.com/ccxt/ccxt/pull/24140)
- test(alpaca): static response, fetchMyTrades [#24143](https://github.com/ccxt/ccxt/pull/24143)
- fix(hyperliquid): fetchFundingRateHistory max limit [#24145](https://github.com/ccxt/ccxt/pull/24145)
- fix(exchange): normalize stringified number [#24148](https://github.com/ccxt/ccxt/pull/24148)
- fix(xt) - trades parsing [#24146](https://github.com/ccxt/ccxt/pull/24146)
- test(statics) - add supported flags ^ [#24147](https://github.com/ccxt/ccxt/pull/24147)
- feat(alpaca): add fetchDepositAddress [#24152](https://github.com/ccxt/ccxt/pull/24152)
- build: skip-tests [#24153](https://github.com/ccxt/ccxt/pull/24153)


## 4.4.24

- chore: update changelog [#24096](https://github.com/ccxt/ccxt/pull/24096)
- fix woofipro logo [#24094](https://github.com/ccxt/ccxt/pull/24094)
- fix(coinex) - network codes unified, withdraw & fetchDepositAddress [#24098](https://github.com/ccxt/ccxt/pull/24098)
- fix(bitmex): correct fee [#24105](https://github.com/ccxt/ccxt/pull/24105)
- fix(xt): correct percentage [#24104](https://github.com/ccxt/ccxt/pull/24104)
- fix(hitbtc) - remove safeNetwork [#23543](https://github.com/ccxt/ccxt/pull/23543)
- fix(cs) - this.limits [#24097](https://github.com/ccxt/ccxt/pull/24097)
- fix(htx) - trigger orders support ^ [#24110](https://github.com/ccxt/ccxt/pull/24110)
- fix(xt): percentage using Precise [#24112](https://github.com/ccxt/ccxt/pull/24112)


## 4.4.23

- fix(coincatch): logo [#24078](https://github.com/ccxt/ccxt/pull/24078)
- feat(gate): fetchBorrowInterest [#24075](https://github.com/ccxt/ccxt/pull/24075)
- fix(binance) - asyn end slash ^ [#24079](https://github.com/ccxt/ccxt/pull/24079)
- fix(gate) - trigger orders updates [#24016](https://github.com/ccxt/ccxt/pull/24016)
- fix(tests) - types and fixes for exchanges [#24050](https://github.com/ccxt/ccxt/pull/24050)
- fix(bybit): handle uta2.0 inside fetchBalance [#24081](https://github.com/ccxt/ccxt/pull/24081)
- feat(gate): borrowCrossMargin, repayCrossMargin unifiedAccount [#24074](https://github.com/ccxt/ccxt/pull/24074)
- test(kucoin) - withdraw resp [#24063](https://github.com/ccxt/ccxt/pull/24063)
- fix(kucoin) - auto migration detect [#24054](https://github.com/ccxt/ccxt/pull/24054)
- fix(gate): params persistence [#24083](https://github.com/ccxt/ccxt/pull/24083)
- fix(safeOrder): parse trades normally [#24086](https://github.com/ccxt/ccxt/pull/24086)
- fix(kucoin): handle_my_trade in php [#24091](https://github.com/ccxt/ccxt/pull/24091)
- feat(gate): add unified support to spot create, fetch and cancel methods [#24089](https://github.com/ccxt/ccxt/pull/24089)
- build: skip-tests [#24092](https://github.com/ccxt/ccxt/pull/24092)


## 4.4.22

- Manual: borrowCrossMargin, repayCrossMargin, borrowIsolatedMargin, repayIsolatedMargin [#24069](https://github.com/ccxt/ccxt/pull/24069)
- feat(binance): add endpoints, adjust papi weights [#24067](https://github.com/ccxt/ccxt/pull/24067)
- feat(coinex): closePosition [#24068](https://github.com/ccxt/ccxt/pull/24068)
- Coincatch integration [#23589](https://github.com/ccxt/ccxt/pull/23589)
- has related to funding rate methods [#24066](https://github.com/ccxt/ccxt/pull/24066)
- feat(coinbase): update fetchMyTrades pagination max entries [#24071](https://github.com/ccxt/ccxt/pull/24071)
- build: skip-tests [#24072](https://github.com/ccxt/ccxt/pull/24072)


## 4.4.21

- test: skip fetchL2OrderBook in ndax [#24043](https://github.com/ccxt/ccxt/pull/24043)
- new api - CEX PLUS [#23942](https://github.com/ccxt/ccxt/pull/23942)
- fix(cli) - ts fix `info` removal [#24046](https://github.com/ccxt/ccxt/pull/24046)
- test(comments) - minor change ^ [#24047](https://github.com/ccxt/ccxt/pull/24047)
- feat(bitflyer): fetchFundingRate [#24049](https://github.com/ccxt/ccxt/pull/24049)
- feat(sh): update cleanup [#24053](https://github.com/ccxt/ccxt/pull/24053)
- has: funding rate methods [#24048](https://github.com/ccxt/ccxt/pull/24048)
- fix(php) - unsubscribe error [#24045](https://github.com/ccxt/ccxt/pull/24045)
- fix(htx): update cost [#24041](https://github.com/ccxt/ccxt/pull/24041)
- feat(exchanges): fetchLongShortRatio, fetchLongShortRatioHistory [#24011](https://github.com/ccxt/ccxt/pull/24011)
- feat(gate): fetchBalance, unified support [#23961](https://github.com/ccxt/ccxt/pull/23961)
- fix(kucoin) - update withdraw endpoint [#24059](https://github.com/ccxt/ccxt/pull/24059)
- fix(hyperliquid): contracts units/and unrealizedPnl [#24060](https://github.com/ccxt/ccxt/pull/24060)
- fix(cryptocom): add fetchMyTrades pagination limit [#24062](https://github.com/ccxt/ccxt/pull/24062)
- fix(kucoin) - createDepositAddress & static tests [#24057](https://github.com/ccxt/ccxt/pull/24057)
- build: skip-tests [#24064](https://github.com/ccxt/ccxt/pull/24064)


## 4.4.20

- Bingx withdraw tag fix [#24019](https://github.com/ccxt/ccxt/pull/24019)
- htx.fetchMarkets docstring @see [#24018](https://github.com/ccxt/ccxt/pull/24018)
- feat(kucoin): add announcements and avgDealPrice [#24021](https://github.com/ccxt/ccxt/pull/24021)
- fix(paradex): circular dependencies [#24022](https://github.com/ccxt/ccxt/pull/24022)
- feat(bybit): add fetchBorrowRateHistory [#24020](https://github.com/ccxt/ccxt/pull/24020)
- docs(ws) - fixes  [#24032](https://github.com/ccxt/ccxt/pull/24032)
- feat(okx) - api updates [#24028](https://github.com/ccxt/ccxt/pull/24028)
- test(ndax) - skip ^ [#24030](https://github.com/ccxt/ccxt/pull/24030)
- feat(cli) - request ^ [#24026](https://github.com/ccxt/ccxt/pull/24026)
- fix(bybit): watchOHLCV normalize symbol [#24027](https://github.com/ccxt/ccxt/pull/24027)
- docs(ws) - unwatch [#24033](https://github.com/ccxt/ccxt/pull/24033)
- fix(hyperliquid): position size [#24035](https://github.com/ccxt/ccxt/pull/24035)
- htx docstrings [#24037](https://github.com/ccxt/ccxt/pull/24037)
- fix(kucoin): fetchDepositWithdrawFee parsing [#24039](https://github.com/ccxt/ccxt/pull/24039)
- fix: ws memory leak on watchMultiple by using watchable un promise as static dependency [#23988](https://github.com/ccxt/ccxt/pull/23988)
- build: skip-tests [#24040](https://github.com/ccxt/ccxt/pull/24040)


## 4.4.19

- fix(bybit): fetchOpenInterest pagination [#24006](https://github.com/ccxt/ccxt/pull/24006)
- feat(phemex): fetchOpenInterest [#24009](https://github.com/ccxt/ccxt/pull/24009)
- docs(static-tests) - fix ^ [#24010](https://github.com/ccxt/ccxt/pull/24010)
- fix(coinbaseadvanced): alias for pro/sockets [#24008](https://github.com/ccxt/ccxt/pull/24008)
- fix(lbank): since/limit workaorund [#24012](https://github.com/ccxt/ccxt/pull/24012)
- fix(staticTests): phemex wrong format [#24015](https://github.com/ccxt/ccxt/pull/24015)
- build: skip-tests [#24014](https://github.com/ccxt/ccxt/pull/24014)
- build: skip-tests [#24017](https://github.com/ccxt/ccxt/pull/24017)


## 4.4.18

- fix(bitget): active market using strings [#23993](https://github.com/ccxt/ccxt/pull/23993)
- feat(kucoinfutures): add cancelOrders [#23994](https://github.com/ccxt/ccxt/pull/23994)
- feat(binance): add usdm convert endpoints [#24000](https://github.com/ccxt/ccxt/pull/24000)
- fix(types): add limits.market [#23992](https://github.com/ccxt/ccxt/pull/23992)
- fix(hyperliquid): add more order status [#24001](https://github.com/ccxt/ccxt/pull/24001)
- htx docstrings [#23999](https://github.com/ccxt/ccxt/pull/23999)
- test(market) - skip min/max for inactive markets [#23996](https://github.com/ccxt/ccxt/pull/23996)
- fix(binance): options parsing and precision handling [#24002](https://github.com/ccxt/ccxt/pull/24002)
- feat(networks): bingx/bitget inconsistencies [#24003](https://github.com/ccxt/ccxt/pull/24003)
- build: skip-tests [#24004](https://github.com/ccxt/ccxt/pull/24004)


## 4.4.17

- fix(bitso) - safeNetwork removal [#23541](https://github.com/ccxt/ccxt/pull/23541)
- htx.docstring @see [#23967](https://github.com/ccxt/ccxt/pull/23967)
- fix(okx): use oiUsd as openinterest value [#23971](https://github.com/ccxt/ccxt/pull/23971)
- fix(bitmart): correct change in ticker [#23966](https://github.com/ccxt/ccxt/pull/23966)
- chore: update changelog [#23974](https://github.com/ccxt/ccxt/pull/23974)
- fix(mexc): createOrder parsing [#23978](https://github.com/ccxt/ccxt/pull/23978)
- feat(kucoinfutures): add tp+sl orders [#23979](https://github.com/ccxt/ccxt/pull/23979)
- fix(bingx): networks info [#23981](https://github.com/ccxt/ccxt/pull/23981)
- fix(bitget): watchOrders/MyTrades spot wildcard subscription [#23983](https://github.com/ccxt/ccxt/pull/23983)
- build: skip-tests [#23982](https://github.com/ccxt/ccxt/pull/23982)


## 4.4.16

- feat(base) - parseCurrencies & parseCurrency [#23943](https://github.com/ccxt/ccxt/pull/23943)
- feat(mexc): spotPrivateGetSelfSymbols [#23955](https://github.com/ccxt/ccxt/pull/23955)
- fix(binanceus) - margin currencies [#23960](https://github.com/ccxt/ccxt/pull/23960)
- feat(bingx): add fetchMarkPrice [#23954](https://github.com/ccxt/ccxt/pull/23954)
- fix(bybit): update error [#23962](https://github.com/ccxt/ccxt/pull/23962)
- feat(okx): add fetchMarkPrice [#23956](https://github.com/ccxt/ccxt/pull/23956)
- build: skip-tests [#23964](https://github.com/ccxt/ccxt/pull/23964)


## 4.4.15

- feat(okx): read indexPrice from index-tickers [#23933](https://github.com/ccxt/ccxt/pull/23933)
- few skips ^ [#23934](https://github.com/ccxt/ccxt/pull/23934)
- htx.fetchPosition docstring @see [#23930](https://github.com/ccxt/ccxt/pull/23930)
- tests - use proxy [#23936](https://github.com/ccxt/ccxt/pull/23936)
- feat(bitmart): add indexPrice to ticker [#23939](https://github.com/ccxt/ccxt/pull/23939)
- feat(binance): add fetchMarkPrice [#23938](https://github.com/ccxt/ccxt/pull/23938)
- feat(blofin): add fetchMarkPrice [#23940](https://github.com/ccxt/ccxt/pull/23940)
- Has spot [#23945](https://github.com/ccxt/ccxt/pull/23945)
- fetchPositions, fetchBorrowInterest docstrings [#23944](https://github.com/ccxt/ccxt/pull/23944)
- fetchDepositAddress, fetchDepositAddresses and fetchDepositAddressesByNetwork use DepositAddress and DepositAddress[] types [#23947](https://github.com/ccxt/ccxt/pull/23947)
- fix(hyperliquid): update parsePosition [#23948](https://github.com/ccxt/ccxt/pull/23948)
- fix(lbank): fetchDepositWithdrawFees return [#23950](https://github.com/ccxt/ccxt/pull/23950)
- oxfun ws skip [#23953](https://github.com/ccxt/ccxt/pull/23953)
- build: skip-tests [#23951](https://github.com/ccxt/ccxt/pull/23951)


## 4.4.14

- Misc fixes [#23919](https://github.com/ccxt/ccxt/pull/23919)
- fix(onetrading): new url [#21109](https://github.com/ccxt/ccxt/pull/21109)
- upbit: add watchTickers [#23790](https://github.com/ccxt/ccxt/pull/23790)
- fix(tests) - oxfun skip ^ [#23926](https://github.com/ccxt/ccxt/pull/23926)
- feat(vertex): update encoding [#23903](https://github.com/ccxt/ccxt/pull/23903)
- htx rename FUD [#23927](https://github.com/ccxt/ccxt/pull/23927)
- build: skip-tests [#23928](https://github.com/ccxt/ccxt/pull/23928)


## 4.4.13

- fix(mexc): resolve until in fetchOrders [#23906](https://github.com/ccxt/ccxt/pull/23906)
- feat(bitget): fetchMarkPrice [#23901](https://github.com/ccxt/ccxt/pull/23901)
- feat(base) - fix currency to precision [#23887](https://github.com/ccxt/ccxt/pull/23887)
- feat(exchanges): fetchFundingInterval and fetchFundingIntervals [#23905](https://github.com/ccxt/ccxt/pull/23905)
- base tests- reorg (part 1) [#23895](https://github.com/ccxt/ccxt/pull/23895)
- feat(cryptocom): add v1PublicGetPublicGetRiskParameters [#23907](https://github.com/ccxt/ccxt/pull/23907)
- build(deps-dev): bump rollup from 2.79.1 to 2.79.2 [#23841](https://github.com/ccxt/ccxt/pull/23841)
- feat(okx): add watchMarkPrices [#23911](https://github.com/ccxt/ccxt/pull/23911)
- feat(tests):  unnecessary vars [#23912](https://github.com/ccxt/ccxt/pull/23912)
- chore: update changelog [#23914](https://github.com/ccxt/ccxt/pull/23914)
- fix(mexc): fetchDepositAddress/createDepositAddress network id [#23915](https://github.com/ccxt/ccxt/pull/23915)
- build: skip-tests [#23916](https://github.com/ccxt/ccxt/pull/23916)


## 4.4.12

- fix(tests) - inheritance refactor & props [#23817](https://github.com/ccxt/ccxt/pull/23817)
- feat(htx): add more static tests [#23866](https://github.com/ccxt/ccxt/pull/23866)
- fix(docs): maxPaginationCalls -> paginationCalls [#23891](https://github.com/ccxt/ccxt/pull/23891)
- fix(tests) - proxy ip (Q) [#23898](https://github.com/ccxt/ccxt/pull/23898)
- fix(tests) - oxfun skip (Q) [#23893](https://github.com/ccxt/ccxt/pull/23893)
- fix(tests) - kucoin taker (Q) [#23892](https://github.com/ccxt/ccxt/pull/23892)
- feat(woo): add watchBidsAsks [#23861](https://github.com/ccxt/ccxt/pull/23861)
- feat(types): add indexPrice and markPrice to ticker [#23889](https://github.com/ccxt/ccxt/pull/23889)
- fix(binance): add BNFCR currency [#23899](https://github.com/ccxt/ccxt/pull/23899)
- build: skip-tests [#23900](https://github.com/ccxt/ccxt/pull/23900)


## 4.4.11

- fix(kraken): createOrder, trailingLimitPercent [#23884](https://github.com/ccxt/ccxt/pull/23884)
- htx.fetchOrder docstring @see [#23882](https://github.com/ccxt/ccxt/pull/23882)
- createOrder: standardize hedged reduceOnly orders [#23871](https://github.com/ccxt/ccxt/pull/23871)
- fix(okx): fetchDepositAddress [#23885](https://github.com/ccxt/ccxt/pull/23885)
- build: skip-tests [#23886](https://github.com/ccxt/ccxt/pull/23886)


## 4.4.10

- fix(bitget): trx network unified [#23867](https://github.com/ccxt/ccxt/pull/23867)
- feat(htx): rename NGL token [#23868](https://github.com/ccxt/ccxt/pull/23868)
- feat(binance): add /papi/v1/um/feeBurn [#23869](https://github.com/ccxt/ccxt/pull/23869)
- feat(okx): add error mapping [#23876](https://github.com/ccxt/ccxt/pull/23876)
- fix(okx): watchMYTrades resolve [#23877](https://github.com/ccxt/ccxt/pull/23877)
- feat(exmo): add watchTickers [#23873](https://github.com/ccxt/ccxt/pull/23873)
- htx.setLeverage docstring see [#23870](https://github.com/ccxt/ccxt/pull/23870)
- fix(proxy) - change port [#23874](https://github.com/ccxt/ccxt/pull/23874)
- feat(deribit): add watchBidsAsks [#23872](https://github.com/ccxt/ccxt/pull/23872)
- feat(kraken): createOrder, add trailingPercent support [#23850](https://github.com/ccxt/ccxt/pull/23850)
- feat(mexc): unify until [#23880](https://github.com/ccxt/ccxt/pull/23880)
- build: skip-tests [#23881](https://github.com/ccxt/ccxt/pull/23881)


## 4.4.9

- fix(bybit): add hedged inside position [#23848](https://github.com/ccxt/ccxt/pull/23848)
- feat(oceanex): fetchDepositAddress [#23811](https://github.com/ccxt/ccxt/pull/23811)
- feat(docs) - string (fixed-point) math ^ [#23805](https://github.com/ccxt/ccxt/pull/23805)
- feat(bybit): add "reduceOnly" support to hedged orders [#23851](https://github.com/ccxt/ccxt/pull/23851)
- fix(hyperliquid): fetchMyTrade - correct fee currency [#23855](https://github.com/ccxt/ccxt/pull/23855)
- htx.fetchSettlementHistory docstring see [#23856](https://github.com/ccxt/ccxt/pull/23856)
- Add FundingRate and FundingRates type usage to fetchFundingRate(s) [#23844](https://github.com/ccxt/ccxt/pull/23844)
- fix(gate): until handling inside fetchClosedorders for spot market [#23860](https://github.com/ccxt/ccxt/pull/23860)
- fix(bitget): unify USDT networks [#23863](https://github.com/ccxt/ccxt/pull/23863)
- feat(deribit): add watchTickers [#23862](https://github.com/ccxt/ccxt/pull/23862)
- build: skip-tests [#23864](https://github.com/ccxt/ccxt/pull/23864)


## 4.4.8

- feat(gate): networks mapping [#23824](https://github.com/ccxt/ccxt/pull/23824)
- bingx parseMarket fix [#23831](https://github.com/ccxt/ccxt/pull/23831)
- feat(p2b): add watchTickers [#23837](https://github.com/ccxt/ccxt/pull/23837)
- feat(hitbtc): update ws [#23827](https://github.com/ccxt/ccxt/pull/23827)
- hollaex: add @see [#23826](https://github.com/ccxt/ccxt/pull/23826)
- fix(cs) - cli null exchanges [#23832](https://github.com/ccxt/ccxt/pull/23832)
- fix(binance): update watchBalance [#23839](https://github.com/ccxt/ccxt/pull/23839)
- okx: update ws error [#23840](https://github.com/ccxt/ccxt/pull/23840)
- feat(whitebit): add watchTickers [#23838](https://github.com/ccxt/ccxt/pull/23838)
- kucoin - new endpoints, new methods .. [#23835](https://github.com/ccxt/ccxt/pull/23835)
- fix(bybit): support hedged inside createOrder [#23845](https://github.com/ccxt/ccxt/pull/23845)
- htx.fetchAccounts, fetchCurrencies [#23842](https://github.com/ccxt/ccxt/pull/23842)
- feat(gate): add historical endpoint to fetchClosedOrders [#23846](https://github.com/ccxt/ccxt/pull/23846)
- feat(bigone):assets to v3 [#23825](https://github.com/ccxt/ccxt/pull/23825)
- build: skip-tests [#23847](https://github.com/ccxt/ccxt/pull/23847)


## 4.4.7

- fix(binance): margin markets loading [#23808](https://github.com/ccxt/ccxt/pull/23808)
- htx.fetchTicker docstring @see [#23812](https://github.com/ccxt/ccxt/pull/23812)
- bitvavo: add ws watchTickers / watchBidsAsks [#23813](https://github.com/ccxt/ccxt/pull/23813)
- feat(blofin): add watchBidsAsks [#23819](https://github.com/ccxt/ccxt/pull/23819)
- Bybit: add conversion trade methods [#23814](https://github.com/ccxt/ccxt/pull/23814)
- feat(binance): repayCrossMargin alternative endpoint [#23802](https://github.com/ccxt/ccxt/pull/23802)
- okx: add apis, update error code [#23758](https://github.com/ccxt/ccxt/pull/23758)
- feat(bitmart): add watchBidsAsks [#23750](https://github.com/ccxt/ccxt/pull/23750)
- htx(fetchOrderBook, fetchOrderTrades, fetchSpotOrderTrades): docstrings [#23820](https://github.com/ccxt/ccxt/pull/23820)
- build: skip-tests [#23821](https://github.com/ccxt/ccxt/pull/23821)


## 4.4.6

- mexc docstring links [#23786](https://github.com/ccxt/ccxt/pull/23786)
- mexc: update [#23788](https://github.com/ccxt/ccxt/pull/23788)
- fix(networks): inconsistencies [#23789](https://github.com/ccxt/ccxt/pull/23789)
- feat(bitget,mexc): add networks [#23792](https://github.com/ccxt/ccxt/pull/23792)
- feat(mexc): setMarginMode [#23755](https://github.com/ccxt/ccxt/pull/23755)
- feat(cli): close connection [#23796](https://github.com/ccxt/ccxt/pull/23796)
- feat(okx): expose requestId in ws [#23795](https://github.com/ccxt/ccxt/pull/23795)
- feat(bitget): add watchBidsAsks [#23803](https://github.com/ccxt/ccxt/pull/23803)
- feat(bitmart): add editOrder with trigger, sl/tp support [#23799](https://github.com/ccxt/ccxt/pull/23799)
- fix(fetchPaginatedCallCursor): search cursor [#23800](https://github.com/ccxt/ccxt/pull/23800)
- fix(bybit): parseLedgerEntry, parseToNumeric on undefined value [#23801](https://github.com/ccxt/ccxt/pull/23801)
- build: skip-tests [#23804](https://github.com/ccxt/ccxt/pull/23804)


## 4.4.5

- htx: add @see [#23760](https://github.com/ccxt/ccxt/pull/23760)
- mexc has [#23754](https://github.com/ccxt/ccxt/pull/23754)
- refactor(bitmart): fetchTickers, fetchTicker, fetchMarkets swap response [#23761](https://github.com/ccxt/ccxt/pull/23761)
- feat(bybit): load preLaunch markets [#23762](https://github.com/ccxt/ccxt/pull/23762)
- feat(mexc,kraken,bitget): add adjustTimeDifference option [#23763](https://github.com/ccxt/ccxt/pull/23763)
- kraken: add watchBidsAsks [#23759](https://github.com/ccxt/ccxt/pull/23759)
- feat(bitmart): createOrder, add stopLossPrice and takeProfitPrice [#23767](https://github.com/ccxt/ccxt/pull/23767)
- Coinbase: clearly document fetchDeposits/Withdrawals/Ledger [#23773](https://github.com/ccxt/ccxt/pull/23773)
- Update Manual.md: clarify trade vs. transaction structure [#23768](https://github.com/ccxt/ccxt/pull/23768)
- Update API key format in coinbase-fetch-all-balances.js [#23770](https://github.com/ccxt/ccxt/pull/23770)
- fix(bitflyer): fix handleErrors [#23782](https://github.com/ccxt/ccxt/pull/23782)
- chore: update changelog [#23781](https://github.com/ccxt/ccxt/pull/23781)
- fix(mexc): bsc-> bep20 mapping [#23783](https://github.com/ccxt/ccxt/pull/23783)
- build: skip-tests [#23764](https://github.com/ccxt/ccxt/pull/23764)


## 4.4.4

- fix(paradex): update api [#23743](https://github.com/ccxt/ccxt/pull/23743)
- mexc docstring @see [#23747](https://github.com/ccxt/ccxt/pull/23747)
- feat(bybit) - fetchOrder [#23746](https://github.com/ccxt/ccxt/pull/23746)
- lykke parseBalance fix [#23752](https://github.com/ccxt/ccxt/pull/23752)
- feat(hyperliquid): add watchTicker [#23751](https://github.com/ccxt/ccxt/pull/23751)
- feat(bitget): add margin in fetchMarkets [#23738](https://github.com/ccxt/ccxt/pull/23738)
- feat(binanceus): skip margin loading [#23749](https://github.com/ccxt/ccxt/pull/23749)
- build: skip-tests [#23753](https://github.com/ccxt/ccxt/pull/23753)


## 4.4.3

- fix(mexc) - loading rl [#23698](https://github.com/ccxt/ccxt/pull/23698)
- kucoin handleErrors full message [#23706](https://github.com/ccxt/ccxt/pull/23706)
- feat(okx): add error code [#23714](https://github.com/ccxt/ccxt/pull/23714)
- Mexc transfer method docstrings [#23717](https://github.com/ccxt/ccxt/pull/23717)
- chore: update changelog [#23718](https://github.com/ccxt/ccxt/pull/23718)
- docs(mexc): docstring @see links [#23722](https://github.com/ccxt/ccxt/pull/23722)
- fix(examples): update import path [#23725](https://github.com/ccxt/ccxt/pull/23725)
- added pop method to BaseCache [#23720](https://github.com/ccxt/ccxt/pull/23720)
- refactor(Exchange): add usage of the LedgerEntry type in fetchLedger [#23681](https://github.com/ccxt/ccxt/pull/23681)
- feat(test) - repeat pause increase [#23727](https://github.com/ccxt/ccxt/pull/23727)
- readme - build ohlc bars !Q [#21587](https://github.com/ccxt/ccxt/pull/21587)
- hyperliquid: update precision mode [#23560](https://github.com/ccxt/ccxt/pull/23560)
- fix(build) broken jsdoc syntax for mexc [#23730](https://github.com/ccxt/ccxt/pull/23730)
- docs(mexc): docstring @see [#23729](https://github.com/ccxt/ccxt/pull/23729)
- feat(hyperliquid): add min cost [#23732](https://github.com/ccxt/ccxt/pull/23732)
- fix(deno): check whether self is undefined [#23733](https://github.com/ccxt/ccxt/pull/23733)
- feat(readme): trading campaign [#23734](https://github.com/ccxt/ccxt/pull/23734)
- feat(mexc): add watchBidsAsks [#23652](https://github.com/ccxt/ccxt/pull/23652)
- feat(bybit): add watchBidsAsks [#23644](https://github.com/ccxt/ccxt/pull/23644)
- p2b docstring fixes [#23736](https://github.com/ccxt/ccxt/pull/23736)
- build(deps): bump next from 14.1.1 to 14.2.10 in /examples/ts/nextjs-page-router [#23735](https://github.com/ccxt/ccxt/pull/23735)
- fix(python) - unclosed connection leak [#23470](https://github.com/ccxt/ccxt/pull/23470)
- build: skip-tests [#23742](https://github.com/ccxt/ccxt/pull/23742)


## 4.4.2

- cryptocom: update @see [#23693](https://github.com/ccxt/ccxt/pull/23693)
- feat(cryptocom): update ws [#23689](https://github.com/ccxt/ccxt/pull/23689)
- binance - `trigger`  [#23688](https://github.com/ccxt/ccxt/pull/23688)
- feat(phemex): add watchTickers [#23696](https://github.com/ccxt/ccxt/pull/23696)
- mexc: add watchTickers [#23670](https://github.com/ccxt/ccxt/pull/23670)
- bybit error mapping [#23697](https://github.com/ccxt/ccxt/pull/23697)
- feat(c#): add arrayConcat helper [#23705](https://github.com/ccxt/ccxt/pull/23705)
- fix(okx): allow custom params in watchPositions [#23704](https://github.com/ccxt/ccxt/pull/23704)
- fix(mexc): swap watchTickers [#23702](https://github.com/ccxt/ccxt/pull/23702)
- feat(woofipro): add watchBidsAsks [#23701](https://github.com/ccxt/ccxt/pull/23701)
- feat(oxfun): add watchBidsAsks [#23703](https://github.com/ccxt/ccxt/pull/23703)
- xt parseMarket fix [#23699](https://github.com/ccxt/ccxt/pull/23699)
- bitmart cancelAllOrders new endpoint [#23707](https://github.com/ccxt/ccxt/pull/23707)
- fix(c#): rename name [#23709](https://github.com/ccxt/ccxt/pull/23709)
- fetchPositionMode, setPositionMode docstrings [#23710](https://github.com/ccxt/ccxt/pull/23710)
- bitstamp update fee tiers [#23708](https://github.com/ccxt/ccxt/pull/23708)


## 4.4.1

- fix(Unsubscription): clean subscription safely [#23667](https://github.com/ccxt/ccxt/pull/23667)
- feat(kucoin): add unWatchOrderBook/unWatchTrades [wip] [#23668](https://github.com/ccxt/ccxt/pull/23668)
- Mexc docstrings [#23672](https://github.com/ccxt/ccxt/pull/23672)
- bitmex: add @see [#23669](https://github.com/ccxt/ccxt/pull/23669)
- fix(binance): watchBidsAsks [#23676](https://github.com/ccxt/ccxt/pull/23676)
- fix(cli) - readable stringify [#23674](https://github.com/ccxt/ccxt/pull/23674)
- feat(binance) - margin field in fetchCurrencies & margin data in fetchMarkets [#22913](https://github.com/ccxt/ccxt/pull/22913)
- fix(docs) - cross isolated readme ^Q [#23678](https://github.com/ccxt/ccxt/pull/23678)
- fix(currencycom,htx,mexc) - unrealized Pnl [#23679](https://github.com/ccxt/ccxt/pull/23679)
- build: skip-tests [#23682](https://github.com/ccxt/ccxt/pull/23682)
- fix(xt): OHLCV spot volume [#23683](https://github.com/ccxt/ccxt/pull/23683)
- build: skip-tests [#23687](https://github.com/ccxt/ccxt/pull/23687)


## 4.3.98

- chore: update changelog [#23664](https://github.com/ccxt/ccxt/pull/23664)
- feat(hyperliquid): add unWatchTrades/OrderBook/OHLCV/Tickers [#23665](https://github.com/ccxt/ccxt/pull/23665)


## 4.3.97

- kraken: update doc [#23651](https://github.com/ccxt/ccxt/pull/23651)
- feat(htx): update watchOrderbook levels [#23649](https://github.com/ccxt/ccxt/pull/23649)
- fix(doc) - trigger order lines [#23643](https://github.com/ccxt/ccxt/pull/23643)
- fix(gate): createOrderWs swap market orders [#23654](https://github.com/ccxt/ccxt/pull/23654)
- bitget error mapping [#23658](https://github.com/ccxt/ccxt/pull/23658)
- kucoin fetchBalance funding account [#23655](https://github.com/ccxt/ccxt/pull/23655)
- fix(whitebit) cross market fetchOpenOrders [#23657](https://github.com/ccxt/ccxt/pull/23657)
- feat(kucoin): add unWatchOrderBook [#23662](https://github.com/ccxt/ccxt/pull/23662)
- build: skip-tests [#23663](https://github.com/ccxt/ccxt/pull/23663)


## 4.3.96

- feat(gate): add unWatchOrderBook/unWatchTradesForSymbols [#23647](https://github.com/ccxt/ccxt/pull/23647)
- coinex parseTrade fee [#23646](https://github.com/ccxt/ccxt/pull/23646)
- feat(kucoin): add unWatchTrades [#23554](https://github.com/ccxt/ccxt/pull/23554)
- fix(binance): use maxLimit when using since+until [#23620](https://github.com/ccxt/ccxt/pull/23620)


## 4.3.95

- feat(hyperliquid):  fetchLedger / fetchDeposits / fetchWithdrawals [#23616](https://github.com/ccxt/ccxt/pull/23616)
- fix(bybit): update fetchLedger endpoint for classic accounts [#23630](https://github.com/ccxt/ccxt/pull/23630)
- feat(binance, bybit): add unWatchOHLCVForSymbols [#23631](https://github.com/ccxt/ccxt/pull/23631)
- Mexc docstring @see [#23634](https://github.com/ccxt/ccxt/pull/23634)
- fix(hyperliquid): correct market id in fetchMytrade [#23636](https://github.com/ccxt/ccxt/pull/23636)
- feat(bybit): add pagination to fetchLedger [#23638](https://github.com/ccxt/ccxt/pull/23638)
- feat(okx, cryptocom): add unWatchOHLCVForSymbols/unWatchX [#23639](https://github.com/ccxt/ccxt/pull/23639)
- feat(kucoin): remove hf detection [#23640](https://github.com/ccxt/ccxt/pull/23640)
- fix(bitbay, hitbtc3) - remove aliases [#23641](https://github.com/ccxt/ccxt/pull/23641)
- feat(okx): add watchBidsAsks and unwatchTickers [#23584](https://github.com/ccxt/ccxt/pull/23584)
- fix(exchange) - remove fetchPermissions [#23642](https://github.com/ccxt/ccxt/pull/23642)
- build: skip-tests [#23645](https://github.com/ccxt/ccxt/pull/23645)


## 4.3.94

- fix(mexc): withdraw [#23611](https://github.com/ccxt/ccxt/pull/23611)
- feat(okx) - bills history since 2021 [#23622](https://github.com/ccxt/ccxt/pull/23622)
- fix(indodax): create limit order [#23619](https://github.com/ccxt/ccxt/pull/23619)
- fix(skip) - bingx skip [#23623](https://github.com/ccxt/ccxt/pull/23623)
- exchanges - promise.all [#23600](https://github.com/ccxt/ccxt/pull/23600)
- feat(hyperliquid): add fetchOrders/ClosedOrder and other fixes [#23626](https://github.com/ccxt/ccxt/pull/23626)
- fix(parseOHLCVs): tail cut [#23625](https://github.com/ccxt/ccxt/pull/23625)


## 4.3.93

- fix(bingx): swap reduceOnly order [#23608](https://github.com/ccxt/ccxt/pull/23608)
- feat(tests) - static data updater [#23612](https://github.com/ccxt/ccxt/pull/23612)


## 4.3.92

- fix(hyperliquid): fetchTickers [#23605](https://github.com/ccxt/ccxt/pull/23605)
- chore: update changelog [#23603](https://github.com/ccxt/ccxt/pull/23603)
- feat(kucoin): add hf sync endpoints [#23604](https://github.com/ccxt/ccxt/pull/23604)
- fix(hyperliquid): spot balance parsing [#23606](https://github.com/ccxt/ccxt/pull/23606)
- build: skip-tests [#23607](https://github.com/ccxt/ccxt/pull/23607)


## 4.3.91

- kucoin - corrections of 'safe' methods [#23590](https://github.com/ccxt/ccxt/pull/23590)
- build(deps-dev): bump webpack from 5.90.0 to 5.94.0 [#23574](https://github.com/ccxt/ccxt/pull/23574)
- fix(kucoin) - static tests [#23593](https://github.com/ccxt/ccxt/pull/23593)
- fix(hyperliquid): fetchOrder with clientOrderId [#23595](https://github.com/ccxt/ccxt/pull/23595)
- build: skip-tests [#23598](https://github.com/ccxt/ccxt/pull/23598)


## 4.3.90

- hitbtc transaction status [#23578](https://github.com/ccxt/ccxt/pull/23578)
- feat(kucoinfutures): add fetchBidsAsks [#23579](https://github.com/ccxt/ccxt/pull/23579)
- feat(woo): add active flag [#23583](https://github.com/ccxt/ccxt/pull/23583)
- fix(binance): update rl for withdraw history api [#23585](https://github.com/ccxt/ccxt/pull/23585)
- fix(kucoin) - handle HighFrequency (hf) accounts [#23582](https://github.com/ccxt/ccxt/pull/23582)
- build: skip-tests [#23586](https://github.com/ccxt/ccxt/pull/23586)
- build: skip-tests [#23588](https://github.com/ccxt/ccxt/pull/23588)


## 4.3.89

- fix(bitfinex2) - remove safeNetwork [#23540](https://github.com/ccxt/ccxt/pull/23540)
- fix(huobijp) - remove safenetwork [#23538](https://github.com/ccxt/ccxt/pull/23538)
- fix(okx) - remove safenetwork [#23539](https://github.com/ccxt/ccxt/pull/23539)
- feat(binance): add some unSub methods [#23550](https://github.com/ccxt/ccxt/pull/23550)
- feat(okx): add unWatchTrades/OrderBook [#23553](https://github.com/ccxt/ccxt/pull/23553)
- fix(coinex) - remove safeNetwork [#23542](https://github.com/ccxt/ccxt/pull/23542)
- fix(bitget): fees signal [#23561](https://github.com/ccxt/ccxt/pull/23561)
- hitbtc transaction status [#23558](https://github.com/ccxt/ccxt/pull/23558)
- latoken transaction status [#23557](https://github.com/ccxt/ccxt/pull/23557)
- fix(bitmart) - remove safenetwork [#23556](https://github.com/ccxt/ccxt/pull/23556)
- Safe value to safe dict/list/bool [#23552](https://github.com/ccxt/ccxt/pull/23552)
- bingx: websocket pro, inverse swap support [#23336](https://github.com/ccxt/ccxt/pull/23336)
- fix(whitebit) error handling [#23565](https://github.com/ccxt/ccxt/pull/23565)
- feat(bingx): createOrder, add hedged param and default to one way mode [#23564](https://github.com/ccxt/ccxt/pull/23564)
- feat(coinex): upgrade pro to v2 [#23189](https://github.com/ccxt/ccxt/pull/23189)
- bithumb: update doc [#23570](https://github.com/ccxt/ccxt/pull/23570)
- fix(bybit): update watchLiquidations [#23572](https://github.com/ccxt/ccxt/pull/23572)
- htx: update doc [#23571](https://github.com/ccxt/ccxt/pull/23571)
- lbank: update doc [#23569](https://github.com/ccxt/ccxt/pull/23569)
- build: skip-tests [#23573](https://github.com/ccxt/ccxt/pull/23573)


## 4.3.88

- remove cs Sending [#23521](https://github.com/ccxt/ccxt/pull/23521)
- fix(docs): fetchOrder jsdoc [#23526](https://github.com/ccxt/ccxt/pull/23526)
- fix(docs) - cors snippet example [#23523](https://github.com/ccxt/ccxt/pull/23523)
- fix(mexc) - remove networksById [#23534](https://github.com/ccxt/ccxt/pull/23534)
- chore: update changelog [#23531](https://github.com/ccxt/ccxt/pull/23531)
- fix(kraken,mexc): network space fix [#23532](https://github.com/ccxt/ccxt/pull/23532)
- fix(ascendex) - remove safeNetwork [#23535](https://github.com/ccxt/ccxt/pull/23535)
- fix(bitrue) - remove safeNetwork [#23537](https://github.com/ccxt/ccxt/pull/23537)
- fix(cryptocom) - safeNetwork removal [#23536](https://github.com/ccxt/ccxt/pull/23536)
- fix(kraken, mexc): networks [#23546](https://github.com/ccxt/ccxt/pull/23546)
- fix(base): get_object_value_from_key_list [#23549](https://github.com/ccxt/ccxt/pull/23549)
- fix(okcoin) - remove safeNetwork [#23544](https://github.com/ccxt/ccxt/pull/23544)
- fix(ascendex) - remove nbi ascendex [#23533](https://github.com/ccxt/ccxt/pull/23533)
- feat(bybit): unWatchTrades/OrderBook/ticker [#23513](https://github.com/ccxt/ccxt/pull/23513)
- build: skip-tests [#23545](https://github.com/ccxt/ccxt/pull/23545)


## 4.3.87

- fix(base): paginationTimestamp shoud add one for forward [#23519](https://github.com/ccxt/ccxt/pull/23519)
- fix(base): correct return type for fetchPositionHistory [#23518](https://github.com/ccxt/ccxt/pull/23518)
- feat: update ws docs [#23508](https://github.com/ccxt/ccxt/pull/23508)
- fix(c#) - parseToInt [#23506](https://github.com/ccxt/ccxt/pull/23506)
- feat(kucoin): add "asset/ndbroker/deposit/list" api endpoint under br… [#23520](https://github.com/ccxt/ccxt/pull/23520)


## 4.3.86

- feat(bitget): add multiple unWatch methods [#23481](https://github.com/ccxt/ccxt/pull/23481)
- feat(bitget): reject before resolve unWatchX [#23498](https://github.com/ccxt/ccxt/pull/23498)
- wazirx: update @see & doc [#23478](https://github.com/ccxt/ccxt/pull/23478)
- whitebit: update @see & doc [#23479](https://github.com/ccxt/ccxt/pull/23479)
- vertex: update doc [#23480](https://github.com/ccxt/ccxt/pull/23480)
- probit: update @see & doc [#23494](https://github.com/ccxt/ccxt/pull/23494)
- Kraken: fix since and until [#23456](https://github.com/ccxt/ccxt/pull/23456)
- feat(hashkey): add id test [#23499](https://github.com/ccxt/ccxt/pull/23499)
- poloniexfutures: update doc [#23495](https://github.com/ccxt/ccxt/pull/23495)
- chore: update readme [#23500](https://github.com/ccxt/ccxt/pull/23500)
- upbit: add watchTradesForSymbols [#23497](https://github.com/ccxt/ccxt/pull/23497)
- fix(errors): UnsubscribeError [#23502](https://github.com/ccxt/ccxt/pull/23502)
- chore: update auth method in upbit.ts file [#23492](https://github.com/ccxt/ccxt/pull/23492)
- poloniex: add watchTradesForSymbols [#23496](https://github.com/ccxt/ccxt/pull/23496)
- kraken: exchange specific end param [#23507](https://github.com/ccxt/ccxt/pull/23507)
- fix(build) broken build after adding 'hashkey' [#23505](https://github.com/ccxt/ccxt/pull/23505)
- fix(readme) - watchOrderBookForSymbols [#23488](https://github.com/ccxt/ccxt/pull/23488)
- p2b: add watchTradesForSymbols [#23509](https://github.com/ccxt/ccxt/pull/23509)
- fix(bingx): active flag [#23511](https://github.com/ccxt/ccxt/pull/23511)


## 4.3.85

- fix(binance) - tickers inverse quote volume [#23406](https://github.com/ccxt/ccxt/pull/23406)
- feat(indodax): support market order [#23425](https://github.com/ccxt/ccxt/pull/23425)
- feat(wiki) - custom ws handling [#23426](https://github.com/ccxt/ccxt/pull/23426)
- bingx: update @see [#23466](https://github.com/ccxt/ccxt/pull/23466)
- feat(hyperliquid): add createOrderWs and editOrderWs [#23461](https://github.com/ccxt/ccxt/pull/23461)
- feat(ascendex): add watchTradesForSymbols [#23463](https://github.com/ccxt/ccxt/pull/23463)
- woofipro: update doc [#23476](https://github.com/ccxt/ccxt/pull/23476)
- Hashkey integration [#23176](https://github.com/ccxt/ccxt/pull/23176)
- woo: update doc [#23477](https://github.com/ccxt/ccxt/pull/23477)
- fix(bitfinex): fetchTickers parsing [#23474](https://github.com/ccxt/ccxt/pull/23474)
- xt: update doc [#23472](https://github.com/ccxt/ccxt/pull/23472)
- fix(krakenfutures): patch parseOrder [#23471](https://github.com/ccxt/ccxt/pull/23471)
- mexc: update @see & doc [#23473](https://github.com/ccxt/ccxt/pull/23473)
- fix(hashkey): build and tests [#23482](https://github.com/ccxt/ccxt/pull/23482)
- fix(tests): remove exchangeHint [#23475](https://github.com/ccxt/ccxt/pull/23475)
- fix(hashkey): readme link [#23485](https://github.com/ccxt/ccxt/pull/23485)
- build: skip-tests [#23486](https://github.com/ccxt/ccxt/pull/23486)
- fix(base): use two parameters when call fetchPaginatedCallCursor in f… [#23484](https://github.com/ccxt/ccxt/pull/23484)
- build: skip-tests [#23489](https://github.com/ccxt/ccxt/pull/23489)


## 4.3.84

- fix(binance): watchLiquidationsForSymbols should use lowercase id [#23441](https://github.com/ccxt/ccxt/pull/23441)
- feat(kucoinfutures): add maxOpenSize and allTickers endpoints [#23448](https://github.com/ccxt/ccxt/pull/23448)
- fix(okx): watchLiquidationsForSymbols subscription [#23451](https://github.com/ccxt/ccxt/pull/23451)
- fix(okx): error on closing positions: [#23455](https://github.com/ccxt/ccxt/pull/23455)
- mexc fetchSpotMarkets fix [#23458](https://github.com/ccxt/ccxt/pull/23458)
- feat(errors) - ManualInteractionRequired ^Q [#23437](https://github.com/ccxt/ccxt/pull/23437)
- Kraken: parseTrade, define takerOrMaker [#23454](https://github.com/ccxt/ccxt/pull/23454)
- feat(cryptocom): add feeRate endpoints [#23450](https://github.com/ccxt/ccxt/pull/23450)
- feat(bitget): add unWatchOrderBook [#23464](https://github.com/ccxt/ccxt/pull/23464)
- build: skip-tests [#23465](https://github.com/ccxt/ccxt/pull/23465)


## 4.3.83

- fix(binance): correct signature for simple-earn [#23428](https://github.com/ccxt/ccxt/pull/23428)
- fix(bitrue): populate authenticate error [#23433](https://github.com/ccxt/ccxt/pull/23433)
- bitfinex2: update exchange types  [#23434](https://github.com/ccxt/ccxt/pull/23434)
- fix(binance): watchOHLCV - exchange-specific id [#23435](https://github.com/ccxt/ccxt/pull/23435)
- feat(kraken): remove requirement for currency code argument in fetchDeposits [#23432](https://github.com/ccxt/ccxt/pull/23432)
- fix(gate): handleErrors inside watchMethods [#23436](https://github.com/ccxt/ccxt/pull/23436)
- build: skip-tests [#23438](https://github.com/ccxt/ccxt/pull/23438)


## 4.3.82

- chore: update readme [#23409](https://github.com/ccxt/ccxt/pull/23409)
- feat(binance): check 30 days interval in fetchConvertTradeHistory [#22315](https://github.com/ccxt/ccxt/pull/22315)
- fix(gate): edit order size type [#23418](https://github.com/ccxt/ccxt/pull/23418)
- fix(okx): watchTicker symbol [#23419](https://github.com/ccxt/ccxt/pull/23419)
- fix(phemex) - no closed orders in fetchOrders [#23411](https://github.com/ccxt/ccxt/pull/23411)
- fix(npm) - silent [#23410](https://github.com/ccxt/ccxt/pull/23410)
- feat(bybit): add withdraw request test [#23421](https://github.com/ccxt/ccxt/pull/23421)
- implement useV2 for param/options of other brand new v3 methods [#23412](https://github.com/ccxt/ccxt/pull/23412)
- fix(binance): parseLeverage [#23423](https://github.com/ccxt/ccxt/pull/23423)
- feat(phemex): add watchBalance flag [#23424](https://github.com/ccxt/ccxt/pull/23424)
- build: skip-tests [ci deploy] [#23420](https://github.com/ccxt/ccxt/pull/23420)


## 4.3.81

- fix(waves) - createOrder params [#23400](https://github.com/ccxt/ccxt/pull/23400)


## 4.3.80

- checkaddress - unified [#23376](https://github.com/ccxt/ccxt/pull/23376)
- bybit: amount, price and cost precision helper methods [#23373](https://github.com/ccxt/ccxt/pull/23373)
- fix(base): remove starknet js json [#23401](https://github.com/ccxt/ccxt/pull/23401)
- fix(yobit) - BCHN to BSV [#23402](https://github.com/ccxt/ccxt/pull/23402)
- fix(exchange): watchOHLCVForSymbols in dotnet [#23403](https://github.com/ccxt/ccxt/pull/23403)
- build: skip-tests [#23405](https://github.com/ccxt/ccxt/pull/23405)


## 4.3.79

- fix(binance): adjust has flags [#23386](https://github.com/ccxt/ccxt/pull/23386)
- fix(Exchange): checkProxySettings accept camelcase and snake_case [#23383](https://github.com/ccxt/ccxt/pull/23383)
- chore: update changelog [#23388](https://github.com/ccxt/ccxt/pull/23388)
- feat(bybit): add inverse wallet ledger [#23390](https://github.com/ccxt/ccxt/pull/23390)
- fix(poloniex): fetchOpenOrders [#23392](https://github.com/ccxt/ccxt/pull/23392)
- build: skip-tests [#23394](https://github.com/ccxt/ccxt/pull/23394)
- fix(bitmart): update createSwapOrderRequest [#23395](https://github.com/ccxt/ccxt/pull/23395)
- build: skip-tests [#23396](https://github.com/ccxt/ccxt/pull/23396)


## 4.3.78

- fix(py) - remove this [#23382](https://github.com/ccxt/ccxt/pull/23382)
- fix: watchPositions - handleOption used instead of safeBool to get option for awaitPositionsSnapshot [#23295](https://github.com/ccxt/ccxt/pull/23295)
- binance: update apis [#23266](https://github.com/ccxt/ccxt/pull/23266)


## 4.3.77

- fix(binance) - watchLiquidations ^Q [#23371](https://github.com/ccxt/ccxt/pull/23371)
- fix(kraken): oflags [#23375](https://github.com/ccxt/ccxt/pull/23375)
- feat(kraken): update [#23374](https://github.com/ccxt/ccxt/pull/23374)
- fix(paradex): add missing loadMarkets() [#23377](https://github.com/ccxt/ccxt/pull/23377)
- exchange: update safeTicker [#23337](https://github.com/ccxt/ccxt/pull/23337)
- base - `safeTrade` ->cost to number [#14268](https://github.com/ccxt/ccxt/pull/14268)
- build: skip-tests [#23378](https://github.com/ccxt/ccxt/pull/23378)
- fix(build): response tests: skip-tests [#23380](https://github.com/ccxt/ccxt/pull/23380)


## 4.3.76

- fix(woo): watch private [#23359](https://github.com/ccxt/ccxt/pull/23359)
- feat(xt): add class header [#23361](https://github.com/ccxt/ccxt/pull/23361)
- bybit: createOrder, fix option qty param [#23360](https://github.com/ccxt/ccxt/pull/23360)
- feat(bithumb): update doc [#23363](https://github.com/ccxt/ccxt/pull/23363)
- feat(bybit): add demotrading for ws [#23364](https://github.com/ccxt/ccxt/pull/23364)
- feat(binance): fix fetchCurrencies return params [#23365](https://github.com/ccxt/ccxt/pull/23365)
- fix(kraken):  oflags handling [#23366](https://github.com/ccxt/ccxt/pull/23366)
- fix(bitmart): trigger order placement [#23367](https://github.com/ccxt/ccxt/pull/23367)
- feat(static): remove typing_extensions static dep [#23368](https://github.com/ccxt/ccxt/pull/23368)
- fix(json): serialize json, add tests, and fix c# base tests [#23357](https://github.com/ccxt/ccxt/pull/23357)
- build: skip-tests [#23369](https://github.com/ccxt/ccxt/pull/23369)


## 4.3.75

- fix(bybit): handle inverse futures subscription [#23343](https://github.com/ccxt/ccxt/pull/23343)
- fix(gemini) - add roles endpoint [#23344](https://github.com/ccxt/ccxt/pull/23344)
- feat(binance): add links [#23346](https://github.com/ccxt/ccxt/pull/23346)
- feat(coinbase): default spot fees [#23347](https://github.com/ccxt/ccxt/pull/23347)
- feat(htx): add some docs [#23348](https://github.com/ccxt/ccxt/pull/23348)
- feat(bitmart): update futures to v2 [#23267](https://github.com/ccxt/ccxt/pull/23267)
- fix(liquidations): var declaration [#23350](https://github.com/ccxt/ccxt/pull/23350)
- build: skip-tests [#23351](https://github.com/ccxt/ccxt/pull/23351)


## 4.3.74

- mexc: update withdraw [#23331](https://github.com/ccxt/ccxt/pull/23331)
- fix(whitebit) parseTicker [#23338](https://github.com/ccxt/ccxt/pull/23338)
- feat(bybit): add usePrivateInstrumentsInfo option [#23339](https://github.com/ccxt/ccxt/pull/23339)
- fix(binance) - php parsing [#23340](https://github.com/ccxt/ccxt/pull/23340)
- build: skip-tests [#23341](https://github.com/ccxt/ccxt/pull/23341)


## 4.3.73

- chore(ace): method param types [#23297](https://github.com/ccxt/ccxt/pull/23297)
- feat(binance): add callerName and links to watchTrades [#23318](https://github.com/ccxt/ccxt/pull/23318)
- feat(yobit) - fetchTickers all [#23317](https://github.com/ccxt/ccxt/pull/23317)
- feat(cli): add no-keys options [#23319](https://github.com/ccxt/ccxt/pull/23319)
- chore: update changelog [#23321](https://github.com/ccxt/ccxt/pull/23321)
- c# - exception overwriting [#23250](https://github.com/ccxt/ccxt/pull/23250)
- fix(examples): poloniex-fetch-ohlcv-with-pagination.py [#23326](https://github.com/ccxt/ccxt/pull/23326)
- alpaca: add @see [#23329](https://github.com/ccxt/ccxt/pull/23329)
- bitfinex: add @see [#23330](https://github.com/ccxt/ccxt/pull/23330)
- binance - new endpoints (fetchPositions / fetchAccountPositions / fetchPositionRisk) [#23225](https://github.com/ccxt/ccxt/pull/23225)
- fix(bybit): fetchTransfers with currency parsing [#23332](https://github.com/ccxt/ccxt/pull/23332)
- fix(binance): parseAccountPosition [#23334](https://github.com/ccxt/ccxt/pull/23334)
- fix(binance): temporarily disable php test [#23335](https://github.com/ccxt/ccxt/pull/23335)
- build: skip-tests [#23333](https://github.com/ccxt/ccxt/pull/23333)


## 4.3.72

- fix(exchange): set message queue to false by default [#23311](https://github.com/ccxt/ccxt/pull/23311)
- fix(kucoin): patch parseWsTrade [#23312](https://github.com/ccxt/ccxt/pull/23312)
- feat(woo): replace orderbook with orderbookupdate  [#23300](https://github.com/ccxt/ccxt/pull/23300)
- feat(binance) - OHLCV with timezone param support [#23252](https://github.com/ccxt/ccxt/pull/23252)
- build: skip-tests [#23315](https://github.com/ccxt/ccxt/pull/23315)


## 4.3.71

- fix(paradex): update logo [#23306](https://github.com/ccxt/ccxt/pull/23306)
- fix cli ts/js [#23279](https://github.com/ccxt/ccxt/pull/23279)
- docker: update dockerignore file [#23281](https://github.com/ccxt/ccxt/pull/23281)
- fix(types): update MarketInterface so fields can be undefined [#23288](https://github.com/ccxt/ccxt/pull/23288)
- fix(cli) - ts [#23280](https://github.com/ccxt/ccxt/pull/23280)
- fix(package): add starkware module [ci deploy] [#23308](https://github.com/ccxt/ccxt/pull/23308)
- build: skip-tests [ci deploy] [#23309](https://github.com/ccxt/ccxt/pull/23309)


## 4.3.70

- fix(woo): fetchFundingHistory income parsing [#23278](https://github.com/ccxt/ccxt/pull/23278)
- fix(types.cs): remove duplicated info [#23293](https://github.com/ccxt/ccxt/pull/23293)
- fix(bequant): correctws url [#23286](https://github.com/ccxt/ccxt/pull/23286)
- fix(test): add -- before --sync in php test [#23285](https://github.com/ccxt/ccxt/pull/23285)
- New exchange: paradex [#22777](https://github.com/ccxt/ccxt/pull/22777)
- build: skip-tests [#23304](https://github.com/ccxt/ccxt/pull/23304)


## 4.3.69

- feat(coinbaseinternational): add missing methods [#23263](https://github.com/ccxt/ccxt/pull/23263)
- fix(doc): fetchMarginMode => fetchMarginModes [#23271](https://github.com/ccxt/ccxt/pull/23271)
- fix(okx): handle ws crude errors properly [#23264](https://github.com/ccxt/ccxt/pull/23264)
- fix(cryptocom,poloniex,hitbt): error handling [#23265](https://github.com/ccxt/ccxt/pull/23265)
- Blofin - WebSockets [#21184](https://github.com/ccxt/ccxt/pull/21184)
- fix(woo): new ws url [#23274](https://github.com/ccxt/ccxt/pull/23274)
- fix(bybit): fetchMyLiquidations safeMarket call [#23277](https://github.com/ccxt/ccxt/pull/23277)
- build: skip-tests [#23275](https://github.com/ccxt/ccxt/pull/23275)


## 4.3.68

- base - unify `describe` & other objects [#18990](https://github.com/ccxt/ccxt/pull/18990)
- fix(kucoin): fetchDepositWithdrawFees [#23234](https://github.com/ccxt/ccxt/pull/23234)
- bingx: fetchMyTrades, inverse swap support [#23240](https://github.com/ccxt/ccxt/pull/23240)
- fix(wiki): update links [#23245](https://github.com/ccxt/ccxt/pull/23245)
- fix(hyperliquid): set default limit to 5000 [#23244](https://github.com/ccxt/ccxt/pull/23244)
- update OrderBook type and added LedgerEntry for python types [#23235](https://github.com/ccxt/ccxt/pull/23235)
- fix(cs) - handling message [#23248](https://github.com/ccxt/ccxt/pull/23248)
- withdraw typo fixed in withdraw [#23256](https://github.com/ccxt/ccxt/pull/23256)
- feat(coinbaseinternational): add fetchFundingHistory [#23254](https://github.com/ccxt/ccxt/pull/23254)
- poloniex: update docs [#23255](https://github.com/ccxt/ccxt/pull/23255)
- fix(btcbox): signature [#23257](https://github.com/ccxt/ccxt/pull/23257)
- build: skip-tests [#23259](https://github.com/ccxt/ccxt/pull/23259)


## 4.3.67

- bingx: fetchOrder, inverse swap support [#23211](https://github.com/ccxt/ccxt/pull/23211)
- chore: remove delisted exchange [#23206](https://github.com/ccxt/ccxt/pull/23206)
- Update test.safeMethods.ts [#23118](https://github.com/ccxt/ccxt/pull/23118)
- tests: fix python tests in docker [#23213](https://github.com/ccxt/ccxt/pull/23213)
- bingx: fetchClosedOrders, fetchCanceledOrders inverse swap support [#23217](https://github.com/ccxt/ccxt/pull/23217)
- bingx: setMarginMode inverse swap support [#23219](https://github.com/ccxt/ccxt/pull/23219)
- bingx: fetchMarginMode, inverse swap support [#23218](https://github.com/ccxt/ccxt/pull/23218)
- fix(krakenfutures): concurrent authentication [#23221](https://github.com/ccxt/ccxt/pull/23221)
- fix(types.cs): watchBalance type cast [#23224](https://github.com/ccxt/ccxt/pull/23224)
- defaultNetworkCode fixed [#23226](https://github.com/ccxt/ccxt/pull/23226)
- build: skip-tests [#23227](https://github.com/ccxt/ccxt/pull/23227)


## 4.3.66

- update docker-compose.yml (fixed bug with php in docker) [#23172](https://github.com/ccxt/ccxt/pull/23172)
- chore: isFiat return type [#23183](https://github.com/ccxt/ccxt/pull/23183)
- chore: safe methods param types [#23188](https://github.com/ccxt/ccxt/pull/23188)
- chore: types for parameters on base exchange [#23182](https://github.com/ccxt/ccxt/pull/23182)
- chore: ping param types [#23187](https://github.com/ccxt/ccxt/pull/23187)
- chore: parseAccount types [#23186](https://github.com/ccxt/ccxt/pull/23186)
- chore: remove delisted exchange [#23190](https://github.com/ccxt/ccxt/pull/23190)
- fix(bithumb) - parallel requests & others [#23181](https://github.com/ccxt/ccxt/pull/23181)
- tests - multi updates [#23157](https://github.com/ccxt/ccxt/pull/23157)
- chore(tests): types for pro tests [#23131](https://github.com/ccxt/ccxt/pull/23131)
- build(deps): bump ws from 8.16.0 to 8.17.1 [#23163](https://github.com/ccxt/ccxt/pull/23163)
- bingx: fetchOpenOrders, inverse swap support [#23198](https://github.com/ccxt/ccxt/pull/23198)
- bingx: cancelOrder, add inverse swap support [#23197](https://github.com/ccxt/ccxt/pull/23197)
- fix(future.cs): protect resolve call [#23202](https://github.com/ccxt/ccxt/pull/23202)
- feat(okx): add sequence check to checksum check in orderbook and fix market reference [#23195](https://github.com/ccxt/ccxt/pull/23195)
- build: skip-tests [#23204](https://github.com/ccxt/ccxt/pull/23204)


## 4.3.65

- base: fix typo in loadProxyModules (httpsProxyAgentModule) [#23171](https://github.com/ccxt/ccxt/pull/23171)
- fix future reject hanging error [#23161](https://github.com/ccxt/ccxt/pull/23161)
- feat(Readme): add sponsor [#23175](https://github.com/ccxt/ccxt/pull/23175)
- feat(binance): update static-tests [#23173](https://github.com/ccxt/ccxt/pull/23173)
- independentreserve: fix circular dependency [#23169](https://github.com/ccxt/ccxt/pull/23169)
- feat(hyperliquid) - watchTickers [#23117](https://github.com/ccxt/ccxt/pull/23117)
- feat(kraken): add fetchStatus [#23178](https://github.com/ccxt/ccxt/pull/23178)
- fix(okx): crude messageHash using milliseconds [#23179](https://github.com/ccxt/ccxt/pull/23179)
- build: skip-tests [#23180](https://github.com/ccxt/ccxt/pull/23180)


## 4.3.64

- build(deps): bump ws from 8.14.2 to 8.17.1 in /examples/ts/nextjs-page-router [#22843](https://github.com/ccxt/ccxt/pull/22843)
- build(deps-dev): bump braces from 3.0.2 to 3.0.3 in /examples/ts/nextjs-page-router [#22789](https://github.com/ccxt/ccxt/pull/22789)
- fix(bybit): fetchBalance funding account [#23164](https://github.com/ccxt/ccxt/pull/23164)
- fix(bybit): read options inside fetchBalance [#23165](https://github.com/ccxt/ccxt/pull/23165)
- fix(mexc) - skip vwap test ^Q [#23162](https://github.com/ccxt/ccxt/pull/23162)
- feat(bigone): add more test [#23167](https://github.com/ccxt/ccxt/pull/23167)
- feat(ascendex): add more tests [#23166](https://github.com/ccxt/ccxt/pull/23166)


## 4.3.63

- feat(independentreserve): withdraw implementation [#23141](https://github.com/ccxt/ccxt/pull/23141)
- fix(woo): fetchfundingHistory docs [#23139](https://github.com/ccxt/ccxt/pull/23139)
- chore: isFiat types [#23136](https://github.com/ccxt/ccxt/pull/23136)
- chore: types for ids.length [#23135](https://github.com/ccxt/ccxt/pull/23135)
- alpaca: add checkRequiredCredentials (fixed NRE in c# if apiKey is null) [#23145](https://github.com/ccxt/ccxt/pull/23145)
- fix(base) - add watchTicker emulated and fix fetchtickerWs [#23137](https://github.com/ccxt/ccxt/pull/23137)
- fix(runtests) - remove unnecessary untils [#23148](https://github.com/ccxt/ccxt/pull/23148)
- python - fix [#23126](https://github.com/ccxt/ccxt/pull/23126)
- bingx: fetchTradingFee [#23152](https://github.com/ccxt/ccxt/pull/23152)
- feat(woo): add pagination to fetchFundingHistory [#23153](https://github.com/ccxt/ccxt/pull/23153)
- fix(tests): get_test_files fix [#23154](https://github.com/ccxt/ccxt/pull/23154)
- feat(kucoin): add publicGetMarkPriceAllSymbols [#23155](https://github.com/ccxt/ccxt/pull/23155)
- C# OptionChain type: rename variables [#23158](https://github.com/ccxt/ccxt/pull/23158)
- fix types & comparisons [#23146](https://github.com/ccxt/ccxt/pull/23146)
- build: skip-tests [#23159](https://github.com/ccxt/ccxt/pull/23159)


## 4.3.62

- base: fix links in jsdocs [#23107](https://github.com/ccxt/ccxt/pull/23107)
- feat(kraken): add watchBalance [#23112](https://github.com/ccxt/ccxt/pull/23112)
- feat(binance) - watchOhlcvForSymbols [#23053](https://github.com/ccxt/ccxt/pull/23053)
- bingx: fetchPosition, fetchPositions inverse swap support [#23111](https://github.com/ccxt/ccxt/pull/23111)
- ace: update requestTests [#23113](https://github.com/ccxt/ccxt/pull/23113)
- fix(ace): python signature [#23115](https://github.com/ccxt/ccxt/pull/23115)
- cryptocom: add new staking endpoints [#23120](https://github.com/ccxt/ccxt/pull/23120)
- bingx: fetchBalance, add inverse swap support [#23121](https://github.com/ccxt/ccxt/pull/23121)
- fix(c#) - responses parsing [#23116](https://github.com/ccxt/ccxt/pull/23116)
- fix(base): correct the symbol in safeOpenInterest [#23114](https://github.com/ccxt/ccxt/pull/23114)
- feat(bybit) - watchOhlcvForSymbols [#23059](https://github.com/ccxt/ccxt/pull/23059)
- fix(binance) - open orders rate limits [#23119](https://github.com/ccxt/ccxt/pull/23119)
- Woo update (marginMode) [#23045](https://github.com/ccxt/ccxt/pull/23045)
- checksum handling unification [#22150](https://github.com/ccxt/ccxt/pull/22150)
- ace: update api [#23124](https://github.com/ccxt/ccxt/pull/23124)
- mercado.createOrder string math [#17098](https://github.com/ccxt/ccxt/pull/17098)
- alpaca: update static tests [#23138](https://github.com/ccxt/ccxt/pull/23138)
- fix(xt, coinbaseinternational): type string = undefined updated to STR [#23132](https://github.com/ccxt/ccxt/pull/23132)
- fix(errors.ts): ChecksumError type [#23128](https://github.com/ccxt/ccxt/pull/23128)
- bingx: fetchMyLiquidations, inverse swap support [#23130](https://github.com/ccxt/ccxt/pull/23130)
- fix(cryptocom): fetchOHLCV  [#23140](https://github.com/ccxt/ccxt/pull/23140)
- fix(ace): number comparison php [#23143](https://github.com/ccxt/ccxt/pull/23143)
- build: skip-tests [#23144](https://github.com/ccxt/ccxt/pull/23144)


## 4.3.61

- vertex: fix fetchCurrencies test [#23079](https://github.com/ccxt/ccxt/pull/23079)
- tradeogre: fix maker fee in market struct [#23085](https://github.com/ccxt/ccxt/pull/23085)
- chore: update changelog [#23088](https://github.com/ccxt/ccxt/pull/23088)
- fix(binance): inverse positions parsing [#23090](https://github.com/ccxt/ccxt/pull/23090)
- fix(bybit): watchLiquidations parsing [#23091](https://github.com/ccxt/ccxt/pull/23091)
- fix #22662 - ws closing [#23094](https://github.com/ccxt/ccxt/pull/23094)
- fix(binance): resolve orderbook on receiving snapshot [#23093](https://github.com/ccxt/ccxt/pull/23093)
- base: fix links in jsdocs [#23092](https://github.com/ccxt/ccxt/pull/23092)
- fix(bybit): Move loadMarkets call earlier in fetchPositions function [#23102](https://github.com/ccxt/ccxt/pull/23102)
- fix(binance): fetchOpenInterest for option market [#23099](https://github.com/ccxt/ccxt/pull/23099)
- build: skip-tests [#23095](https://github.com/ccxt/ccxt/pull/23095)
- fix(xt): signature encoding [#23104](https://github.com/ccxt/ccxt/pull/23104)
- base(type): use Dictionary<any) [#23103](https://github.com/ccxt/ccxt/pull/23103)
- bingx: fix currency deposit status and withdraw limits [#23097](https://github.com/ccxt/ccxt/pull/23097)
- build: skip-tests [#23105](https://github.com/ccxt/ccxt/pull/23105)


## 4.3.60

- hyperliquid: c# fix NullReferenceException when get currency info [#23076](https://github.com/ccxt/ccxt/pull/23076)
- base: c# fix withdraw limits in Currency struct [#23075](https://github.com/ccxt/ccxt/pull/23075)
- fix(tests) - eslintrc <Q [#23074](https://github.com/ccxt/ccxt/pull/23074)
- fix(bybit): cancelOrders and cancelOrdersForSymbols only supports UTA accounts [#23068](https://github.com/ccxt/ccxt/pull/23068)
- vertex: c# fix NullReferenceException when get currency info [#23077](https://github.com/ccxt/ccxt/pull/23077)
- fix(kucoin): watchMyTrades - set method using options [#23078](https://github.com/ccxt/ccxt/pull/23078)
- mexc: update withdraw [#23065](https://github.com/ccxt/ccxt/pull/23065)


## 4.3.59

- bingx: cancelAllOrders, inverse swap support [#23029](https://github.com/ccxt/ccxt/pull/23029)
- fix(binance): cancelAllOrders - unified response for contract and portfolio margin orders [#23040](https://github.com/ccxt/ccxt/pull/23040)
- feat(dev): .gitignore - added .custom_gitignore [#23039](https://github.com/ccxt/ccxt/pull/23039)
- fix(bitfinex): cancelOrder, cancelAllOrders - unified response [#22986](https://github.com/ccxt/ccxt/pull/22986)
- feat(okx): add some error codes [#23043](https://github.com/ccxt/ccxt/pull/23043)
- fix(phemex): phemex keepAlive value reduced to 9000 to fix keepAlive error [#23048](https://github.com/ccxt/ccxt/pull/23048)
- wiki: add debt in balance structure [#23047](https://github.com/ccxt/ccxt/pull/23047)
- bingx: fetchTicker, fetchTickers add inverse swap support [#23046](https://github.com/ccxt/ccxt/pull/23046)
- bingx: fetchLeverage, add inverse swap support [#23049](https://github.com/ccxt/ccxt/pull/23049)
- fix(run-tests) - periphericals [#23041](https://github.com/ccxt/ccxt/pull/23041)
- fix(cancelOrdersForSymbols): docs [#23051](https://github.com/ccxt/ccxt/pull/23051)
- feat(timex): cancelOrder - response unification [#22653](https://github.com/ccxt/ccxt/pull/22653)
- feat(bitso): add sandbox url and static tests [#23055](https://github.com/ccxt/ccxt/pull/23055)
- fix(cex): handleOrderBookUpdate - use safeInteger instead of safeNumber for incrementalId [#23062](https://github.com/ccxt/ccxt/pull/23062)
- bingx: setLeverage, add inverse swap support [#23056](https://github.com/ccxt/ccxt/pull/23056)
- fix(xt) - fetchCurrencies  & watchOHLCV [#23060](https://github.com/ccxt/ccxt/pull/23060)
- bingx: closePosition, closeAllPositions inverse swap support [#23067](https://github.com/ccxt/ccxt/pull/23067)
- fix(kraken): fetchLedger - timestamp millisecond data parsed correctly [#23061](https://github.com/ccxt/ccxt/pull/23061)
- cryptocom: update fetchOHLCV [#23069](https://github.com/ccxt/ccxt/pull/23069)
- feat(kucoin): watchMyTrades - params["method"] options, fixes: #23057 [#23064](https://github.com/ccxt/ccxt/pull/23064)
- fix(php) - test for method [#23058](https://github.com/ccxt/ccxt/pull/23058)
- fix(bitso): update api url [#23072](https://github.com/ccxt/ccxt/pull/23072)
- build: skip-tests [#23070](https://github.com/ccxt/ccxt/pull/23070)


## 4.3.58

- upbit: update fetchOpenOrders, fetchClosedOrders and fetchCanceledOrders [#23019](https://github.com/ccxt/ccxt/pull/23019)
- bingx: createOrder, inverse swap support [#23005](https://github.com/ccxt/ccxt/pull/23005)
- fix(build.sh): run request-tests sync and async with a single exchange [#23022](https://github.com/ccxt/ccxt/pull/23022)
- hyperliquid: add fetchTradingFee & static-tests [#23020](https://github.com/ccxt/ccxt/pull/23020)
- fix(binance) - message hashes [#22998](https://github.com/ccxt/ccxt/pull/22998)
- feat(bitmart): add /contract/private/position-risk [#23023](https://github.com/ccxt/ccxt/pull/23023)
- feat(exceptions) - BadResponse & CancelPending moved [#23016](https://github.com/ccxt/ccxt/pull/23016)
- fix!(exceptions) - ProxyError into InvalidProxySettings [#23001](https://github.com/ccxt/ccxt/pull/23001)
- feat(FAQ): add createMarketBuyRequiresPrice explanation [#23024](https://github.com/ccxt/ccxt/pull/23024)
- tests - fix args [#23000](https://github.com/ccxt/ccxt/pull/23000)
- fix(bybit): typo on variable name [#23030](https://github.com/ccxt/ccxt/pull/23030)
- fix(bingx)  - watchTrades issue [#23027](https://github.com/ccxt/ccxt/pull/23027)
- feat(wiki) - taker maker fees [#22974](https://github.com/ccxt/ccxt/pull/22974)
- fix(digifinex): cancelOrder(s) - unified response [#23032](https://github.com/ccxt/ccxt/pull/23032)
- feat(xt): websocket implementation [#17814](https://github.com/ccxt/ccxt/pull/17814)
- fix(deribit): cancelAllOrders - unified response [#23031](https://github.com/ccxt/ccxt/pull/23031)
- fix(htx) - commonCurrencies [#20541](https://github.com/ccxt/ccxt/pull/20541)
- fix(gate) - commoncurrencies [#20543](https://github.com/ccxt/ccxt/pull/20543)
- fix(mexc) - commonCurrencies [#20544](https://github.com/ccxt/ccxt/pull/20544)
- fix(btcbox): load markets dynamically [#23035](https://github.com/ccxt/ccxt/pull/23035)
- fix(xtWs): watchOrderBook [#23036](https://github.com/ccxt/ccxt/pull/23036)
- build: skip-tests [#23037](https://github.com/ccxt/ccxt/pull/23037)


## 4.3.57

- htx: set minDeposit value in fetchCurrencies [#22977](https://github.com/ccxt/ccxt/pull/22977)
- bingx: fetchOHLCV inverse swap support [#22976](https://github.com/ccxt/ccxt/pull/22976)
- Bigone cancel all orders [#22983](https://github.com/ccxt/ccxt/pull/22983)
- fix(latoken): cancelAllOrders - unified response [#22981](https://github.com/ccxt/ccxt/pull/22981)
- feat(kucoin): add affiliate/inviter/statistics [#22985](https://github.com/ccxt/ccxt/pull/22985)
- fix(alpaca): cancelAllOrders - unified response [#22984](https://github.com/ccxt/ccxt/pull/22984)
- bingx: fetchOrderBook inverse swap support [#22980](https://github.com/ccxt/ccxt/pull/22980)
- build: skip-tests [#22987](https://github.com/ccxt/ccxt/pull/22987)
- bingx: fetchFundingRate, inverse swap support [#22991](https://github.com/ccxt/ccxt/pull/22991)
- feat(woo) - opf [#22992](https://github.com/ccxt/ccxt/pull/22992)
- doc(htx): fix example error msg in comment [#23006](https://github.com/ccxt/ccxt/pull/23006)
- bingx: fetchOpenInterest, add inverse swap support [#23004](https://github.com/ccxt/ccxt/pull/23004)
- coinone: fix handle errors if cloudflare in response [#23002](https://github.com/ccxt/ccxt/pull/23002)
- chore: update changelog [#23007](https://github.com/ccxt/ccxt/pull/23007)
- coinmate: fix handle errors, update ratelimit and fees [#23008](https://github.com/ccxt/ccxt/pull/23008)
- fix(okx): handleErrors' response parameter expects dictionary input [#23003](https://github.com/ccxt/ccxt/pull/23003)
- docs(okx): fix old exchange name to current one [#22999](https://github.com/ccxt/ccxt/pull/22999)
- fix(okx): fetchDepositWithdrawFees [#23011](https://github.com/ccxt/ccxt/pull/23011)
- fix(gate): swap trigger market orders [#23012](https://github.com/ccxt/ccxt/pull/23012)
- fix #22996 - remove resolved future when using messageQueue [#23015](https://github.com/ccxt/ccxt/pull/23015)
- build: skip-tests [#23013](https://github.com/ccxt/ccxt/pull/23013)


## 4.3.56

- fix(bitget): cancelAllOrders - unified response [#22949](https://github.com/ccxt/ccxt/pull/22949)
- huobijp, htx: cancelAllOrders, cancelOrders - unified response [#22962](https://github.com/ccxt/ccxt/pull/22962)
- bingx: fetchInverseSwapMarkets [#22970](https://github.com/ccxt/ccxt/pull/22970)
- coinone: fix ratelimit and handle errors [#22969](https://github.com/ccxt/ccxt/pull/22969)
- feat(gate): add cancelOrders and cancelOrdersForSymbols [#22972](https://github.com/ccxt/ccxt/pull/22972)
- Create message queue for unresolved messages in WS client [#22768](https://github.com/ccxt/ccxt/pull/22768)


## 4.3.55

- btcmarkets: fill active in market structure [#22947](https://github.com/ccxt/ccxt/pull/22947)
- fix(lbank): cancelOrder, cancelAllOrders - unified response [#22948](https://github.com/ccxt/ccxt/pull/22948)
- fix(hyperliquid): add maxLeverage to market [#22952](https://github.com/ccxt/ccxt/pull/22952)
- fix(delta): cancelAllOrders - unified response [#22951](https://github.com/ccxt/ccxt/pull/22951)
- fix(gate): add createMarketBuyOrderRequiresPrice to options [#22954](https://github.com/ccxt/ccxt/pull/22954)
- chore: remove banner [#22955](https://github.com/ccxt/ccxt/pull/22955)
- fix(bitflyer): cancelOrder - unified response [#22950](https://github.com/ccxt/ccxt/pull/22950)
- feat(tests): sync response tests [#22956](https://github.com/ccxt/ccxt/pull/22956)
- fix(php): remove Use of "static" in callables is deprecated warning [#22957](https://github.com/ccxt/ccxt/pull/22957)
- base - functionality for method retry on failure [#22861](https://github.com/ccxt/ccxt/pull/22861)
- fix(bybit): fetch balance for unified inverse account [#22960](https://github.com/ccxt/ccxt/pull/22960)
- fix(binance) - exceptions for OpRejected [#22958](https://github.com/ccxt/ccxt/pull/22958)
- bingx: add coin-m endpoints [#22963](https://github.com/ccxt/ccxt/pull/22963)
- fix(bybit): fee to number [#22964](https://github.com/ccxt/ccxt/pull/22964)
- btcmarkets: fix handle errors [#22946](https://github.com/ccxt/ccxt/pull/22946)
- fix(bitopro): cancelOrder - unified response [#22961](https://github.com/ccxt/ccxt/pull/22961)
- fix(eddsa): missing reassignment [#22967](https://github.com/ccxt/ccxt/pull/22967)
- fix(bingx): skip 0 timestamp [#22966](https://github.com/ccxt/ccxt/pull/22966)
- build: skip-tests [#22968](https://github.com/ccxt/ccxt/pull/22968)


## 4.3.54

- okx: fetchPositions returns empty list in some cases [#22929](https://github.com/ccxt/ccxt/pull/22929)
- feature(coinbase) Allow use of heartbeats channel [#22892](https://github.com/ccxt/ccxt/pull/22892)
- fix(ascendex): cancelAllOrders - unified response [#22926](https://github.com/ccxt/ccxt/pull/22926)
- chore: update changelog [#22931](https://github.com/ccxt/ccxt/pull/22931)
- tests - reorg; base-tests, etc.. [#22381](https://github.com/ccxt/ccxt/pull/22381)
- fix(kucoin): correct price and amount in watchMyTrades [#22934](https://github.com/ccxt/ccxt/pull/22934)
- Fix poloniex edit_order response [#22933](https://github.com/ccxt/ccxt/pull/22933)
- fix(blockchaincom): update urls and fees in doc [#22932](https://github.com/ccxt/ccxt/pull/22932)
- doc: fix typo in parameter descriptions [#22935](https://github.com/ccxt/ccxt/pull/22935)
- feat(base) - add marginMode type [#22920](https://github.com/ccxt/ccxt/pull/22920)
- feat(tests): add safeMethdos test [#22936](https://github.com/ccxt/ccxt/pull/22936)
- kucoin - fetchMarkets, setLeverage, implicit api [#22903](https://github.com/ccxt/ccxt/pull/22903)
- fix(woo): spot market parsing [#22941](https://github.com/ccxt/ccxt/pull/22941)
- fix(vertex): timestamp inside ws trade [#22940](https://github.com/ccxt/ccxt/pull/22940)
- btcalpha: fix handleErrors [#22939](https://github.com/ccxt/ccxt/pull/22939)
- fix(woo): disable test temporarily [#22942](https://github.com/ccxt/ccxt/pull/22942)
- fix(woo): response test [#22943](https://github.com/ccxt/ccxt/pull/22943)
- fix(woo): response tests [#22944](https://github.com/ccxt/ccxt/pull/22944)
- build: skip-tests [#22945](https://github.com/ccxt/ccxt/pull/22945)


## 4.3.53

- fix(bingx) - max leverage markets ^Q [#22908](https://github.com/ccxt/ccxt/pull/22908)
- fix(poloniex): createOrder return type [#22911](https://github.com/ccxt/ccxt/pull/22911)
- fix(bingx) - remove leverage [#22912](https://github.com/ccxt/ccxt/pull/22912)
- Update binance.ts: Simple Typo in comment [#22916](https://github.com/ccxt/ccxt/pull/22916)
- fix(kucoin): update watchMyTrades [#22918](https://github.com/ccxt/ccxt/pull/22918)
- fix(python) - ruff syntax [#22921](https://github.com/ccxt/ccxt/pull/22921)
- Bybit: enable unified USDC support on bybit [#22917](https://github.com/ccxt/ccxt/pull/22917)
- fix(phemex): cancelAllOrders response unification [#22914](https://github.com/ccxt/ccxt/pull/22914)
- fix(woo): createMarketBuy/Sell with cost [#22922](https://github.com/ccxt/ccxt/pull/22922)
- fix(vertex) - ticker ts [#22924](https://github.com/ccxt/ccxt/pull/22924)
- build: skip-tests [#22923](https://github.com/ccxt/ccxt/pull/22923)


## 4.3.52

- fix #22794 - fix arraycachebysymbolbyside [#22877](https://github.com/ccxt/ccxt/pull/22877)
- hyperliquid: remove extend param [#22901](https://github.com/ccxt/ccxt/pull/22901)
- parseIsolatedBorrowRate - header params [#22899](https://github.com/ccxt/ccxt/pull/22899)
- fix(probit) improved error handling [#22893](https://github.com/ccxt/ccxt/pull/22893)
- New exchange: vertex [#22509](https://github.com/ccxt/ccxt/pull/22509)
- feat(hyperliquid): load all spot markets [#22902](https://github.com/ccxt/ccxt/pull/22902)
- fix(vertex): correct request id in python [#22907](https://github.com/ccxt/ccxt/pull/22907)
- build: skip-tests [#22905](https://github.com/ccxt/ccxt/pull/22905)


## 4.3.51

- feat(build): update transpile script [#22881](https://github.com/ccxt/ccxt/pull/22881)
- feat(okx): add sprd/cancel-all-after [#22888](https://github.com/ccxt/ccxt/pull/22888)
- fix(okx): keepAlive changed to 18000 to fix ping-pong keepAlive error [#22883](https://github.com/ccxt/ccxt/pull/22883)
- fix(bybit): add pagination in fetchOpenOrders [#22889](https://github.com/ccxt/ccxt/pull/22889)
- fix(binance): cancelOrders signature  [#22890](https://github.com/ccxt/ccxt/pull/22890)
- fix(krakenfutures): add history url in test api [#22894](https://github.com/ccxt/ccxt/pull/22894)
- build: skip-tests [#22895](https://github.com/ccxt/ccxt/pull/22895)


## 4.3.50

- feat(bybit): add cancelAllOrdersAfter [#22870](https://github.com/ccxt/ccxt/pull/22870)
- binance: new API documentation [#22847](https://github.com/ccxt/ccxt/pull/22847)
- chore: update changelog [#22872](https://github.com/ccxt/ccxt/pull/22872)
- fix(handleErrors): body content in php [#22874](https://github.com/ccxt/ccxt/pull/22874)
- fix(exmo): fix ratelimit. 350ms -> 100ms delay between requests [#22876](https://github.com/ccxt/ccxt/pull/22876)
- fix(bigone): fix ratelimit. 1200ms -> 20ms delay between requests [#22875](https://github.com/ccxt/ccxt/pull/22875)
- build: skip-tests [#22880](https://github.com/ccxt/ccxt/pull/22880)


## 4.3.49

- fix (c#) null baseCurrency in market structure [#22862](https://github.com/ccxt/ccxt/pull/22862)
- feat(bitget): add reduceOnly to the docs [#22866](https://github.com/ccxt/ccxt/pull/22866)
- feat(trigger): add trigger support [#22865](https://github.com/ccxt/ccxt/pull/22865)
- fix(base): correct microseconds in c# [#22867](https://github.com/ccxt/ccxt/pull/22867)
- build: skip-tests [#22868](https://github.com/ccxt/ccxt/pull/22868)


## 4.3.48

- fix(ace): signature for private methods, [TypeError] Cannot use in operator to search for 0 in timeStamp [#22845](https://github.com/ccxt/ccxt/pull/22845)
- binance - migration to TICK_SIZE [#22811](https://github.com/ccxt/ccxt/pull/22811)
- fix(exchange): update php handle errors [#22846](https://github.com/ccxt/ccxt/pull/22846)
- Kraken cancel order [#22753](https://github.com/ccxt/ccxt/pull/22753)
- fix(kraken): reduceOnly parsing [#22848](https://github.com/ccxt/ccxt/pull/22848)
- fix(php-syntax) new dex property broke the php syntax checking [#22850](https://github.com/ccxt/ccxt/pull/22850)
- fix build skips  ^Q [#22851](https://github.com/ccxt/ccxt/pull/22851)
- fix(hyperliquid): cancelOrder(s) unified response [#22854](https://github.com/ccxt/ccxt/pull/22854)
- fix(coinbase): cancelOrder - unify response [#22855](https://github.com/ccxt/ccxt/pull/22855)
- fix(bitso): cancelOrder - unify response [#22856](https://github.com/ccxt/ccxt/pull/22856)
- fix(coinbaseinternational): loadMarkets at beginning of subscribe and subscribeMultiple [#22853](https://github.com/ccxt/ccxt/pull/22853)
- build: skip-tests [#22858](https://github.com/ccxt/ccxt/pull/22858)


## 4.3.47

- fix(tests) - oxfun related issues [#22832](https://github.com/ccxt/ccxt/pull/22832)
- fix(bingx): restore safeValue inside handleOHLCV [#22834](https://github.com/ccxt/ccxt/pull/22834)
- feat(krakenfutures): add assignment program endpoints [#22837](https://github.com/ccxt/ccxt/pull/22837)
- feat(gate): add crud ws [#22826](https://github.com/ccxt/ccxt/pull/22826)
- fix(gateWs): minor adjustments [#22839](https://github.com/ccxt/ccxt/pull/22839)
- feat(binance): add precison-related static tests [#22840](https://github.com/ccxt/ccxt/pull/22840)
- fix(bingx) - spot /swap candles [#22835](https://github.com/ccxt/ccxt/pull/22835)
- fix(woo): ohlcv endpoint access [#22841](https://github.com/ccxt/ccxt/pull/22841)
- build: skip-tests [#22842](https://github.com/ccxt/ccxt/pull/22842)


## 4.3.46

- chore: update changelog [#22822](https://github.com/ccxt/ccxt/pull/22822)
- fix(hyperliquid): withdraw parsing [#22821](https://github.com/ccxt/ccxt/pull/22821)
- fix(coinex): watchOrderBook symbol inference [#22823](https://github.com/ccxt/ccxt/pull/22823)
- fix(bitmart): clientOrderId parsing [#22824](https://github.com/ccxt/ccxt/pull/22824)
- fix!(base) - precisionFromString update, to handle `e` and `E` and al… [#22812](https://github.com/ccxt/ccxt/pull/22812)
- fix(bitget): spot margin with createMarketBuyOrderRequiresPrice = false [#22831](https://github.com/ccxt/ccxt/pull/22831)
- build: skip-tests [#22830](https://github.com/ccxt/ccxt/pull/22830)


## 4.3.45

- feat(okx): add fetchBalance params [#22804](https://github.com/ccxt/ccxt/pull/22804)
- fix(bingx) - migrate to ticksize [#22803](https://github.com/ccxt/ccxt/pull/22803)
- fix(coinmetro) - migrate to tick size [#22805](https://github.com/ccxt/ccxt/pull/22805)
- feat(binance): add new apis [#22806](https://github.com/ccxt/ccxt/pull/22806)
- fix(oxfun): rename [#22807](https://github.com/ccxt/ccxt/pull/22807)
- feat(oxfun): update logo [#22809](https://github.com/ccxt/ccxt/pull/22809)
- fix(bitteam) - ticksize migration [#22802](https://github.com/ccxt/ccxt/pull/22802)
- fix(tokocrypto) - migration to TICK_SIZE [#22808](https://github.com/ccxt/ccxt/pull/22808)
- fix(binanceus): remove fees override [#22813](https://github.com/ccxt/ccxt/pull/22813)
- feat(mexc): update withdraw endpoint [#22817](https://github.com/ccxt/ccxt/pull/22817)
- hyperliquid: update signature for transfer and withdraw [#22816](https://github.com/ccxt/ccxt/pull/22816)
- feat(bitmart): add clientOrderId support for spot orders [#22819](https://github.com/ccxt/ccxt/pull/22819)
- feat(exchange): add dex flag [#22818](https://github.com/ccxt/ccxt/pull/22818)
- build: skip-tests [#22820](https://github.com/ccxt/ccxt/pull/22820)


## 4.3.44

- feat(exchange): remove cert [#22799](https://github.com/ccxt/ccxt/pull/22799)
- TICK_SIZE - waves.exchange [#13689](https://github.com/ccxt/ccxt/pull/13689)
- kucoin: added some new endpoints [#22798](https://github.com/ccxt/ccxt/pull/22798)
- fix(luno): cancelOrder - response unification [#22797](https://github.com/ccxt/ccxt/pull/22797)
- Added support for missing currencies [#22800](https://github.com/ccxt/ccxt/pull/22800)
- New exchange: ox.fun [#22354](https://github.com/ccxt/ccxt/pull/22354)
- build: skip-tests [#22801](https://github.com/ccxt/ccxt/pull/22801)


## 4.3.43

- fix(bitmex): guard handleOrderBook [#22786](https://github.com/ccxt/ccxt/pull/22786)
- fix(ndax): cancelAllOrders - unified response [#22793](https://github.com/ccxt/ccxt/pull/22793)
- fix(poloniexfutures): cancelAllOrders - response wrapped in safeOrder [#22791](https://github.com/ccxt/ccxt/pull/22791)
- fix(lykke): cancelOrder, cancelAllOrders - response unification [#22792](https://github.com/ccxt/ccxt/pull/22792)
- fix(woo): keepAlive set to 9000 to fix ping-pong keepAlive error [#22790](https://github.com/ccxt/ccxt/pull/22790)
- feat(xt): restore [#22782](https://github.com/ccxt/ccxt/pull/22782)
- feat(idTests): add xt [#22795](https://github.com/ccxt/ccxt/pull/22795)


## 4.3.42

- feat(binance): add bbo static tests [#22759](https://github.com/ccxt/ccxt/pull/22759)
- chore: update changelog [ci skip] [#22765](https://github.com/ccxt/ccxt/pull/22765)
- fix(bitget) - margin ws orders [#22762](https://github.com/ccxt/ccxt/pull/22762)
- fix(mexc): pro - keepAlive changed to 8000, fixes error: Connection to wss://wbs.mexc.com/ws timed out due to a ping-pong keepalive missing on time [#22764](https://github.com/ccxt/ccxt/pull/22764)
- coinex: fetchCurrencies v2 [#22755](https://github.com/ccxt/ccxt/pull/22755)
- feat(types): automate export process [#22771](https://github.com/ccxt/ccxt/pull/22771)
- fix(tradeogre): cancelAllOrders - unify response [#22778](https://github.com/ccxt/ccxt/pull/22778)
- fix(tradeogre): createOrder - BadRequest thrown if type is "market", ArgumentsRequired thrown if price argument is missing [#22776](https://github.com/ccxt/ccxt/pull/22776)
- fix(bybit): pro - changed keepAlive value to 18000 [#22585](https://github.com/ccxt/ccxt/pull/22585)
- feat(phemex): add fetchOrder for USDT settled swaps [#22781](https://github.com/ccxt/ccxt/pull/22781)
- feat(binance): add internal payment history [#22772](https://github.com/ccxt/ccxt/pull/22772)
- Zonda cancel order unification [#22773](https://github.com/ccxt/ccxt/pull/22773)
- fix(wazirx): cancelAllOrders response unification [#22774](https://github.com/ccxt/ccxt/pull/22774)
- fix(wavesexchange): cancelOrder - response wrapped in safeOrder [#22775](https://github.com/ccxt/ccxt/pull/22775)
- fix(btcmarkets): cancelOrder(s) - unified response [#22685](https://github.com/ccxt/ccxt/pull/22685)
- build: skip-test [#22787](https://github.com/ccxt/ccxt/pull/22787)
- build: skip-tests [#22788](https://github.com/ccxt/ccxt/pull/22788)


## 4.3.41

- fix(kraken): cancelOrder(s), cancelAllOrders - unify response [#22745](https://github.com/ccxt/ccxt/pull/22745)
- fix(coinex): content-type remove charset [#22743](https://github.com/ccxt/ccxt/pull/22743)
- woo: update doc [#22746](https://github.com/ccxt/ccxt/pull/22746)
- fix(krakenfutures): cancelAllOrders - unify response [#22744](https://github.com/ccxt/ccxt/pull/22744)
- fix(kucoin): cancelOrder - unify response [#22723](https://github.com/ccxt/ccxt/pull/22723)
- fix(bitget): watchOrders spot-margin resolver [#22749](https://github.com/ccxt/ccxt/pull/22749)
- fix(mexcWs): update contract url [#22751](https://github.com/ccxt/ccxt/pull/22751)
- fix(cs): stringContent protection [#22752](https://github.com/ccxt/ccxt/pull/22752)
- fix(upbit): ws options [#22754](https://github.com/ccxt/ccxt/pull/22754)
- fix(blockchaincom): cancelOrder, cancelAllOrders unified response [#22678](https://github.com/ccxt/ccxt/pull/22678)
- bitmart: updated the fetchTickers spot endpoint [#22680](https://github.com/ccxt/ccxt/pull/22680)


## 4.3.40

- Bitstamp cancel order [#22669](https://github.com/ccxt/ccxt/pull/22669)
- fix(bingx) - watch multiple [#22629](https://github.com/ccxt/ccxt/pull/22629)
- fix(woo): cancelAllOrders - unified response [#22710](https://github.com/ccxt/ccxt/pull/22710)
- fix(coinmate): cancelOrder - unified response [#22713](https://github.com/ccxt/ccxt/pull/22713)
- fix(bithumb): cancelOrder - unified response [#22711](https://github.com/ccxt/ccxt/pull/22711)
- fix(coinspot): cancelOrder - unified response, remove dynamic method call [#22715](https://github.com/ccxt/ccxt/pull/22715)
- fix(coinone): cancelOrder - unified response [#22714](https://github.com/ccxt/ccxt/pull/22714)
- fix(bitget): watchOrders spot margin [#22718](https://github.com/ccxt/ccxt/pull/22718)
- okx: add new endpoints 2024-06-03 [#22725](https://github.com/ccxt/ccxt/pull/22725)
- feat(binance): add copyTrading endpoints [#22730](https://github.com/ccxt/ccxt/pull/22730)
- fix(indodax): cancelOrder - unified response [#22722](https://github.com/ccxt/ccxt/pull/22722)
- feat(orderbook): type variable [#22729](https://github.com/ccxt/ccxt/pull/22729)
- feat(upbit): watch private topic [#22724](https://github.com/ccxt/ccxt/pull/22724)
- fix(bitget) - watchOrder calculation of remaining & filled [#22728](https://github.com/ccxt/ccxt/pull/22728)
- feat(types.cs): handle info [#22731](https://github.com/ccxt/ccxt/pull/22731)
- fix(independentreserve): cancelOrder - unify response [#22721](https://github.com/ccxt/ccxt/pull/22721)
- fix(coinlist): cancelOrders - unify response [#22692](https://github.com/ccxt/ccxt/pull/22692)
- fix(bitfinex2): createOrder parsing [#22733](https://github.com/ccxt/ccxt/pull/22733)
- fix(appveyor): cinst replacement [#22738](https://github.com/ccxt/ccxt/pull/22738)
- fix(cs): update charset and fix uuid() [#22740](https://github.com/ccxt/ccxt/pull/22740)
- build: skip-tests [#22742](https://github.com/ccxt/ccxt/pull/22742)


## 4.3.39

- fix(binance): add swap to accountsByType [#22707](https://github.com/ccxt/ccxt/pull/22707)
- fix(hitbtc): currency network withdrawal and deposit status [#22705](https://github.com/ccxt/ccxt/pull/22705)
- Woofipro cancel order [#22709](https://github.com/ccxt/ccxt/pull/22709)


## 4.3.38

- fix(CS): urlencode, handle special cases [#22704](https://github.com/ccxt/ccxt/pull/22704)
- fix(coinlist): cancelOrders encoding [#22706](https://github.com/ccxt/ccxt/pull/22706)


## 4.3.37

- fix(coinex): fetchBalance switch statements [#22683](https://github.com/ccxt/ccxt/pull/22683)
- feat(okx): Simple earn fixed endpoints [#22688](https://github.com/ccxt/ccxt/pull/22688)
- fix(btcturk): cancelOrder - response unification [#22686](https://github.com/ccxt/ccxt/pull/22686)
- fix(btcalpha): cancelOrder - unified response [#22684](https://github.com/ccxt/ccxt/pull/22684)
- fix(coincheck): cancelOrder - unified response [#22690](https://github.com/ccxt/ccxt/pull/22690)
- bitmart: update the fetchTrades spot endpoint [#22694](https://github.com/ccxt/ccxt/pull/22694)
- fix(coinbase): fetchAccounts default limit [#22698](https://github.com/ccxt/ccxt/pull/22698)
- fix(coinex): cancelAllOrders - unified response [#22691](https://github.com/ccxt/ccxt/pull/22691)
- feat(bl3p): cancelOrder - response unification [#22676](https://github.com/ccxt/ccxt/pull/22676)


## 4.3.36

- feat(kraken): adjust rl [#22661](https://github.com/ccxt/ccxt/pull/22661)
- feat(htx): closePosition [#20604](https://github.com/ccxt/ccxt/pull/20604)
- feat(bitbank): cancelOrder - response unification [#22667](https://github.com/ccxt/ccxt/pull/22667)
- feat(bingx): cancelOrders, cancelAllOrders - response unification [#22665](https://github.com/ccxt/ccxt/pull/22665)
- fix(woofipro): signHash in php [#22673](https://github.com/ccxt/ccxt/pull/22673)
- fix(cli.py): remove call reg to suppress warning [#22677](https://github.com/ccxt/ccxt/pull/22677)
- fix(bitmart): remove abs for percentage in ticker [#22674](https://github.com/ccxt/ccxt/pull/22674)
- fix(kraken): div trading fee by 100 [#22679](https://github.com/ccxt/ccxt/pull/22679)
- fix(static): disable failing static test [#22682](https://github.com/ccxt/ccxt/pull/22682)


## 4.3.35

- bitget hedge mode [#22610](https://github.com/ccxt/ccxt/pull/22610)
- feat(whitebit): cancelOrder, cancelAllOrders - response unification [#22652](https://github.com/ccxt/ccxt/pull/22652)
- paymium: cancelOrder - unified response [#22654](https://github.com/ccxt/ccxt/pull/22654)
- feat(zonda): new deposit & withdrawal endpoints [#22649](https://github.com/ccxt/ccxt/pull/22649)
- bitmart: watchOrders edit spot support [#22656](https://github.com/ccxt/ccxt/pull/22656)
- feat(bit2c): cancelOrder - unified response [#22648](https://github.com/ccxt/ccxt/pull/22648)
- feat(zaif): cancelOrder - unification [#22651](https://github.com/ccxt/ccxt/pull/22651)
- fix(bingx): symbol inference on trades [#22659](https://github.com/ccxt/ccxt/pull/22659)
- feat(orderbook): type variable [#22660](https://github.com/ccxt/ccxt/pull/22660)
- fix(bitfinex2) handleOrderBook [#22658](https://github.com/ccxt/ccxt/pull/22658)


## 4.3.34

- feat(base) - findNearestCeiling [#22630](https://github.com/ccxt/ccxt/pull/22630)
- feat(base): uncamelcase python/php base invocations programatically [#13882](https://github.com/ccxt/ccxt/pull/13882)
- alpaca cancelOrder unified response [#22635](https://github.com/ccxt/ccxt/pull/22635)
- coinex: withdraw v2 [#22637](https://github.com/ccxt/ccxt/pull/22637)
- fix(bitmart): fetchTickers [#22640](https://github.com/ccxt/ccxt/pull/22640)
- fix(kraken): since handling [#22641](https://github.com/ccxt/ccxt/pull/22641)
- fix(kraken): since off by 1 fix [#22642](https://github.com/ccxt/ccxt/pull/22642)
- fix(bitget): watchOrders different subs [#22644](https://github.com/ccxt/ccxt/pull/22644)
- feat(coinbase): add fetchTradingFees [#22645](https://github.com/ccxt/ccxt/pull/22645)
- fix(okx) - await [#22647](https://github.com/ccxt/ccxt/pull/22647)
- build: skip-tests [#22646](https://github.com/ccxt/ccxt/pull/22646)


## 4.3.33

- feat(binance): add v1/account/info [#22627](https://github.com/ccxt/ccxt/pull/22627)
- fix(handleErrors): types [#22618](https://github.com/ccxt/ccxt/pull/22618)
- feat(exchange,binance, gate, bybit, okx, bitmex): add watchLiquidations and watchMyLiquidations, add tests for fetch and watchLiquidations [#19832](https://github.com/ccxt/ccxt/pull/19832)
- fix(coinbase) - add usePrivate option [#22579](https://github.com/ccxt/ccxt/pull/22579)
- build: skip-tests [#22628](https://github.com/ccxt/ccxt/pull/22628)


## 4.3.32

- fix broken docu build [#22620](https://github.com/ccxt/ccxt/pull/22620)
- chore: update changelog [#22624](https://github.com/ccxt/ccxt/pull/22624)
- fix(bitget): swap order placement weight adjustment [#22625](https://github.com/ccxt/ccxt/pull/22625)


## 4.3.31

- feat(cex): handleOrderBookSnapshot - string math [#19456](https://github.com/ccxt/ccxt/pull/19456)
- coinex: fetchLeverages v2 [#22616](https://github.com/ccxt/ccxt/pull/22616)
- docs(mexc): pro - docstrings for pro methods updated from mexc3 to mexc [#22615](https://github.com/ccxt/ccxt/pull/22615)
- fix(coinbase) - WS fixes [#22612](https://github.com/ccxt/ccxt/pull/22612)
- fix(tests) - args [#22613](https://github.com/ccxt/ccxt/pull/22613)
- fix(base) - handleParamBool & handleParamBool2 [#22611](https://github.com/ccxt/ccxt/pull/22611)


## 4.3.30

- fix(bingx) websocket ticker timestamp/datetime [#22591](https://github.com/ccxt/ccxt/pull/22591)
- feat(exchange): type request object [#22577](https://github.com/ccxt/ccxt/pull/22577)
- fix(binance): portfolioMargin postOnly handling [#22592](https://github.com/ccxt/ccxt/pull/22592)
- fix(poloniexfutures) - timestamp [#22598](https://github.com/ccxt/ccxt/pull/22598)
- chore: test file types [#21989](https://github.com/ccxt/ccxt/pull/21989)
- chore: types.ts - types [#22385](https://github.com/ccxt/ccxt/pull/22385)
- coinex: fetchDepositWithdrawFee v2 [#22602](https://github.com/ccxt/ccxt/pull/22602)
- fix(parseLedgerEntry): type [#22596](https://github.com/ccxt/ccxt/pull/22596)
- feat(parseTransaction): type [#22595](https://github.com/ccxt/ccxt/pull/22595)
- feat(types): type aux methods [#22597](https://github.com/ccxt/ccxt/pull/22597)
- feat(binance): add feeBurn endpoints [#22604](https://github.com/ccxt/ccxt/pull/22604)
- feat(parseTrade): type [#22594](https://github.com/ccxt/ccxt/pull/22594)
- fix(parseOrder): type order [#22593](https://github.com/ccxt/ccxt/pull/22593)
- Leverage tiers types [#22465](https://github.com/ccxt/ccxt/pull/22465)
- fix(kraken): fetchOHLCV since handling [#22607](https://github.com/ccxt/ccxt/pull/22607)
- build: skip-tests [#22608](https://github.com/ccxt/ccxt/pull/22608)


## 4.3.29

- fix(manual): browserified version path [#22568](https://github.com/ccxt/ccxt/pull/22568)
- fix(vss): minified version [#22569](https://github.com/ccxt/ccxt/pull/22569)
- fix(future.py): add tests and fixes [#22461](https://github.com/ccxt/ccxt/pull/22461)
- fix(whitebit) - add market order by cost endpoint [#22572](https://github.com/ccxt/ccxt/pull/22572)
- coinex: fetchWithdrawals, fetchDeposits v2 [#22574](https://github.com/ccxt/ccxt/pull/22574)
- bingx: patch cost in parseOrder [#22573](https://github.com/ccxt/ccxt/pull/22573)
- fix(whitebit): market sell with cost removal [#22576](https://github.com/ccxt/ccxt/pull/22576)
- fix(fetchLeverages): default market type [#22586](https://github.com/ccxt/ccxt/pull/22586)
- coinex: borrowIsolatedMargin, repayIsolatedMargin v2 [#22583](https://github.com/ccxt/ccxt/pull/22583)
- coinex: fetchBorrowInterest v2 [#22581](https://github.com/ccxt/ccxt/pull/22581)
- coinex: fetchIsolatedBorrowRate v2 [#22580](https://github.com/ccxt/ccxt/pull/22580)
- build: skip-tests [#22587](https://github.com/ccxt/ccxt/pull/22587)


## 4.3.28

- feat(bitmart): add createOrders [#22557](https://github.com/ccxt/ccxt/pull/22557)
- whitebit parseBalance fix [#22559](https://github.com/ccxt/ccxt/pull/22559)
- bingx: update ratelimits [#22563](https://github.com/ccxt/ccxt/pull/22563)
- fix(kucoin): invalid order error mapping [#22565](https://github.com/ccxt/ccxt/pull/22565)
- fix(Orderbook.ts): typescript types [#22564](https://github.com/ccxt/ccxt/pull/22564)
- fix(npm): browser bundle [#22566](https://github.com/ccxt/ccxt/pull/22566)
- build: skip-tests [#22567](https://github.com/ccxt/ccxt/pull/22567)


## 4.3.27

- fix(coinbase) added datetime/timestamp to ws ticker [#22544](https://github.com/ccxt/ccxt/pull/22544)
- feat(bitget): add v2/earn/account/assets [#22546](https://github.com/ccxt/ccxt/pull/22546)
- feat(bitmart): add spot cancelOrders [#22529](https://github.com/ccxt/ccxt/pull/22529)
- chore: update changelog [ci-skip] [#22548](https://github.com/ccxt/ccxt/pull/22548)
- docs(krakenfutures): fix docs url [#22553](https://github.com/ccxt/ccxt/pull/22553)
- fix(coinbase): fix parseOrder to use safeMarket - fix #2250 [#22554](https://github.com/ccxt/ccxt/pull/22554)
- fix(bybit): fetchFundingRateHistory pagination [#22549](https://github.com/ccxt/ccxt/pull/22549)
- fix(bingx): sl/tp order parsing [#22556](https://github.com/ccxt/ccxt/pull/22556)


## 4.3.25

- build: [ci deploy] [skip-tests] [#22545](https://github.com/ccxt/ccxt/pull/22545)


## 4.3.24

- fix(phemex): swap order fees [#22517](https://github.com/ccxt/ccxt/pull/22517)
- feat(kraken): add createMarketBuyOrderWithCost [#22522](https://github.com/ccxt/ccxt/pull/22522)
- coinex: fetchTransfers v2 [#22523](https://github.com/ccxt/ccxt/pull/22523)
- fix(omitZero): protect against non numeric inputs [#22524](https://github.com/ccxt/ccxt/pull/22524)
- feat(kraken): support multiple oflags [#22525](https://github.com/ccxt/ccxt/pull/22525)
- feat(base) - handleParamString2, handleParamInteger2 [#22042](https://github.com/ccxt/ccxt/pull/22042)
- fix(kraken): usdt market buy with cost [#22526](https://github.com/ccxt/ccxt/pull/22526)
- fix(editOrderWs): amount should be optional [#22528](https://github.com/ccxt/ccxt/pull/22528)
- build: skip-tests [#22527](https://github.com/ccxt/ccxt/pull/22527)


## 4.3.23

- feat(coinex): infer order type [#22501](https://github.com/ccxt/ccxt/pull/22501)
- feat(kucoin): add new validation header [#22503](https://github.com/ccxt/ccxt/pull/22503)
- fix(waves) - static tests [#22506](https://github.com/ccxt/ccxt/pull/22506)
- Deprecate CoinbasePro and add CoinbaseExchange [#22502](https://github.com/ccxt/ccxt/pull/22502)
- fix(bybit): fetchPaginatedCallCursor exception fix [#22507](https://github.com/ccxt/ccxt/pull/22507)
- fix(waves): static tests utils [#22508](https://github.com/ccxt/ccxt/pull/22508)
- fix(bitrue): sign with query params [#22504](https://github.com/ccxt/ccxt/pull/22504)
- fix(bitget) - watch parse orders [#22510](https://github.com/ccxt/ccxt/pull/22510)
- coinex: transfer v2 [#22511](https://github.com/ccxt/ccxt/pull/22511)
- build: fix request tests [#22513](https://github.com/ccxt/ccxt/pull/22513)
- fix(bitrue): php array length [#22515](https://github.com/ccxt/ccxt/pull/22515)
- build: skip-tests [#22514](https://github.com/ccxt/ccxt/pull/22514)


## 4.3.22

- fix(poloniexfutures): fix watchOrderBook [#22487](https://github.com/ccxt/ccxt/pull/22487)
- fix(docs) - position mode [#22491](https://github.com/ccxt/ccxt/pull/22491)
- fix(coinbase) - fetchTickers market types [#22490](https://github.com/ccxt/ccxt/pull/22490)
- whitebit new endpoints [#22485](https://github.com/ccxt/ccxt/pull/22485)
- coinex fetchFundingHistory v2 [#22489](https://github.com/ccxt/ccxt/pull/22489)
- probit commonCurrencies [#22486](https://github.com/ccxt/ccxt/pull/22486)
- feat(manual): mention to static tests [#22482](https://github.com/ccxt/ccxt/pull/22482)
- coinex error mapping [#22492](https://github.com/ccxt/ccxt/pull/22492)
- build(deps): bump next from 14.0.3 to 14.1.1 in /examples/ts/nextjs-page-router [#22453](https://github.com/ccxt/ccxt/pull/22453)
- fix(binance): update default value of options.leverageBrackets [#22496](https://github.com/ccxt/ccxt/pull/22496)
- coinex: fetchFundingRate, fetchFundingRates, fetchFundingRateHistory v2 [#22497](https://github.com/ccxt/ccxt/pull/22497)
- fix(phemex) - funding fees [#22443](https://github.com/ccxt/ccxt/pull/22443)
- build: skip-tests [#22499](https://github.com/ccxt/ccxt/pull/22499)


## 4.3.21

- feat(travis): create release [#20535](https://github.com/ccxt/ccxt/pull/20535)
- fix(php): spawn [#21895](https://github.com/ccxt/ccxt/pull/21895)
- fix(coinex): handleErrors should also check for "OK" [#22479](https://github.com/ccxt/ccxt/pull/22479)
- fix(tests): remove asyncio.gather from sync tests [#22480](https://github.com/ccxt/ccxt/pull/22480)
- fix(phemex): handle PT fees [#22481](https://github.com/ccxt/ccxt/pull/22481)
- chore: skip-tests [#22483](https://github.com/ccxt/ccxt/pull/22483)


## 4.3.20

- fix(coinex) [#22469](https://github.com/ccxt/ccxt/pull/22469)
- chore: parseMarginModification types [#22436](https://github.com/ccxt/ccxt/pull/22436)
- feat(woo): update pro [#22455](https://github.com/ccxt/ccxt/pull/22455)
- coinex: addMargin, reduceMargin, fetchMarginAdjustmentHistory v2 [#22473](https://github.com/ccxt/ccxt/pull/22473)
- fix(deno): ws in deno to use WebSocket API, fix #22440 [#22471](https://github.com/ccxt/ccxt/pull/22471)
- feat(okx): add sprd endpoints [#22470](https://github.com/ccxt/ccxt/pull/22470)
- feat(binance): add  fetchPremiumIndexOHLCV [#22474](https://github.com/ccxt/ccxt/pull/22474)
- feat(kucoinfutures): add watchOHLCV [#22472](https://github.com/ccxt/ccxt/pull/22472)
- fix(hyperliquid): update fetchOpenOrders with frontendOrders [#22476](https://github.com/ccxt/ccxt/pull/22476)
- chore: update changelog [ci skip] [#22475](https://github.com/ccxt/ccxt/pull/22475)


## 4.3.19

- fix(phemex): spot trigger orders [#22462](https://github.com/ccxt/ccxt/pull/22462)
- fix(bybit): update fetchLeverageTiers [#22459](https://github.com/ccxt/ccxt/pull/22459)
- fix(htx): fix #22451 [#22466](https://github.com/ccxt/ccxt/pull/22466)
- fix(htx): ws authentication error handling [#22467](https://github.com/ccxt/ccxt/pull/22467)
- bitget assets implicit endpoints, fixes: #22464 [#22468](https://github.com/ccxt/ccxt/pull/22468)
- coinex: fetchLeverageTiers, fetchMarketLeverageTiers v2 [#22457](https://github.com/ccxt/ccxt/pull/22457)


## 4.3.18

- fix(PHP): 8.3 remove assert warning [#22423](https://github.com/ccxt/ccxt/pull/22423)
- decimalToPrecision types [#22424](https://github.com/ccxt/ccxt/pull/22424)
- parseTicker parameter types [#22386](https://github.com/ccxt/ccxt/pull/22386)
- woo: update doc [#22428](https://github.com/ccxt/ccxt/pull/22428)
- coinex: fetchMyTrades v2 [#22372](https://github.com/ccxt/ccxt/pull/22372)
- fix(indodax): patch fetchTickers [#22429](https://github.com/ccxt/ccxt/pull/22429)
- fix(base) - handleTriggerAndParams [#22422](https://github.com/ccxt/ccxt/pull/22422)
- coinex: fetchPosition, fetchPositions, fetchPositionHistory [#22426](https://github.com/ccxt/ccxt/pull/22426)
- fix(bitget) - WS orders [#22420](https://github.com/ccxt/ccxt/pull/22420)
- fix(exchange): add missing has key [#22439](https://github.com/ccxt/ccxt/pull/22439)
- Transfer types [#22435](https://github.com/ccxt/ccxt/pull/22435)
- feat(okx): add investment endpoint [#22441](https://github.com/ccxt/ccxt/pull/22441)
- extend in php [#22430](https://github.com/ccxt/ccxt/pull/22430)
- feat(base) - safeIntegerOmitZero [#22244](https://github.com/ccxt/ccxt/pull/22244)
- coinex: setMarginMode v2 [#22452](https://github.com/ccxt/ccxt/pull/22452)
- coinex: setLeverage v2 [#22454](https://github.com/ccxt/ccxt/pull/22454)
- parseConversion types [#22437](https://github.com/ccxt/ccxt/pull/22437)
- parseLeverage types [#22438](https://github.com/ccxt/ccxt/pull/22438)
- chore: parseGreeks types [#22445](https://github.com/ccxt/ccxt/pull/22445)
- parseOption types [#22444](https://github.com/ccxt/ccxt/pull/22444)
- woofipro: new dex [#22196](https://github.com/ccxt/ccxt/pull/22196)
- feat(okx): add watchFundingRate/s [#22458](https://github.com/ccxt/ccxt/pull/22458)
- bybit: add api [#22456](https://github.com/ccxt/ccxt/pull/22456)


## 4.3.17

- feat(binance): createOrder spot trailingPercent support [#22414](https://github.com/ccxt/ccxt/pull/22414)
- feat(phemex): add tp/sl static test [#22416](https://github.com/ccxt/ccxt/pull/22416)
- fix(bybit): WS trade endpoint [#22417](https://github.com/ccxt/ccxt/pull/22417)
- fix(bybit): WS trade endpoint [#22418](https://github.com/ccxt/ccxt/pull/22418)
- fix(exchange): networkIdToCode [#22415](https://github.com/ccxt/ccxt/pull/22415)


## 4.3.16

- chore: update changelog [ci skip] [#22398](https://github.com/ccxt/ccxt/pull/22398)
- feat(binance): add static tests [#22399](https://github.com/ccxt/ccxt/pull/22399)
- feat(binance): replace safeValue with safeBool/safeList/safeDict [#22396](https://github.com/ccxt/ccxt/pull/22396)
- feat(bybit): ws flags [#22406](https://github.com/ccxt/ccxt/pull/22406)
- feat(bybit): add marginTrading to market structure, fix #22400 [#22404](https://github.com/ccxt/ccxt/pull/22404)
- fix(okx): default to public watchOrderBook [#22401](https://github.com/ccxt/ccxt/pull/22401)
- fix(okx): fix #22228 [#22402](https://github.com/ccxt/ccxt/pull/22402)
- fix(invalidNonce): handleInvalid nonce to reset subscription, fix #21997 [#22403](https://github.com/ccxt/ccxt/pull/22403)
- chore: Precise.ts types [#22370](https://github.com/ccxt/ccxt/pull/22370)
- fix(okx): error import [#22408](https://github.com/ccxt/ccxt/pull/22408)


## 4.3.15

- chore(transpile.js): transpile typed variables with list type [#22193](https://github.com/ccxt/ccxt/pull/22193)
- chore: WsClient - types [#22382](https://github.com/ccxt/ccxt/pull/22382)
- feat(Exchange): add sandbox flag inside has [#22389](https://github.com/ccxt/ccxt/pull/22389)
- fix(Exchange): fetchPaginatedCallDeterministic [#22392](https://github.com/ccxt/ccxt/pull/22392)
- hyperliquid: patch fetchSpotMerkets [#22391](https://github.com/ccxt/ccxt/pull/22391)
- zaif: patch customNonce [#22393](https://github.com/ccxt/ccxt/pull/22393)
- chore: errors.ts types [#22369](https://github.com/ccxt/ccxt/pull/22369)
- fix(Number.cs): precisioNFromString [#22395](https://github.com/ccxt/ccxt/pull/22395)
- build: skip-tests [#22394](https://github.com/ccxt/ccxt/pull/22394)


## 4.3.14

- feat(hitbtc): "type"=="swap" used for "derivatives" account [#22374](https://github.com/ccxt/ccxt/pull/22374)
- fix(bingx) - operationfailed [#22368](https://github.com/ccxt/ccxt/pull/22368)
- Update LICENSE.txt [#22366](https://github.com/ccxt/ccxt/pull/22366)
- fix(docs) - operationFailed operationRejected [#22376](https://github.com/ccxt/ccxt/pull/22376)
- feat(Exceptions): add MarketClosed [#22365](https://github.com/ccxt/ccxt/pull/22365)
- feat(luno): add beneficiaries endpoint [#22377](https://github.com/ccxt/ccxt/pull/22377)
- coinex: createDepositAddress, fetchDepositAddress v2 [#22371](https://github.com/ccxt/ccxt/pull/22371)
- feat: ws/Client.ts types [#22373](https://github.com/ccxt/ccxt/pull/22373)
- chore: misc.ts types [#22357](https://github.com/ccxt/ccxt/pull/22357)
- chore: numbers.ts types [#22359](https://github.com/ccxt/ccxt/pull/22359)
- build: skip idex [#22378](https://github.com/ccxt/ccxt/pull/22378)
- fix(binance): fetchLastPrices docs [#22380](https://github.com/ccxt/ccxt/pull/22380)


## 4.3.13

- coinbase: add new conversion methods [#21905](https://github.com/ccxt/ccxt/pull/21905)
- feat(woo): add watchMyTrades [#22345](https://github.com/ccxt/ccxt/pull/22345)
- fix(okx): protect Position symbol [#22350](https://github.com/ccxt/ccxt/pull/22350)
- fix(proxy) - explanations [#22348](https://github.com/ccxt/ccxt/pull/22348)
- feat: can assign sandbox mode using options in exchange constructor [#22355](https://github.com/ccxt/ccxt/pull/22355)
- feat(bybit): remove some safeValue [#22347](https://github.com/ccxt/ccxt/pull/22347)
- fix(Types.cs): order id typo [#22358](https://github.com/ccxt/ccxt/pull/22358)
- fix(Types.cs): order id typo [#22360](https://github.com/ccxt/ccxt/pull/22360)
- fix(coinex): headers [#22356](https://github.com/ccxt/ccxt/pull/22356)
- generic.ts omit function type [#22364](https://github.com/ccxt/ccxt/pull/22364)
- chore: totp method types [#22362](https://github.com/ccxt/ccxt/pull/22362)
- chore: jwt function types [#22363](https://github.com/ccxt/ccxt/pull/22363)
- coinex: fetchOpenOrders, fetchClosedOrders v2 [#22352](https://github.com/ccxt/ccxt/pull/22352)
- feat(binance): fetchIsolatedBorrowRates [#22206](https://github.com/ccxt/ccxt/pull/22206)
- build: skip-tests [#22367](https://github.com/ccxt/ccxt/pull/22367)


## 4.3.12

- bybit: add api [#22344](https://github.com/ccxt/ccxt/pull/22344)


## 4.3.11

- coinex: editOrder v2 [#22317](https://github.com/ccxt/ccxt/pull/22317)
- feat(bybit): add ws crud [#22313](https://github.com/ccxt/ccxt/pull/22313)
- Borrow rate types and parsers [#22205](https://github.com/ccxt/ccxt/pull/22205)
- fix(binance): linear swap taker fee [#22319](https://github.com/ccxt/ccxt/pull/22319)
- fix(mexcPro): add fee to trade [#22320](https://github.com/ccxt/ccxt/pull/22320)
- coinex: cancelOrder v2 [#22324](https://github.com/ccxt/ccxt/pull/22324)
- fix(ws): fix #22037 - concurrent subscription requests [#22309](https://github.com/ccxt/ccxt/pull/22309)
- feat(whitebit): fetchDepositsWithdrawals [#22065](https://github.com/ccxt/ccxt/pull/22065)
- feat(bitget): add meaningful exception to editOrder [#22328](https://github.com/ccxt/ccxt/pull/22328)
- fix(Exchange): add fetchConvertTrade/History flags [#22331](https://github.com/ccxt/ccxt/pull/22331)
- chore: add freshness-test [#22327](https://github.com/ccxt/ccxt/pull/22327)
- Remove use of 'till' parameter [#22323](https://github.com/ccxt/ccxt/pull/22323)
- coinex: cancelAllOrders v2 [#22335](https://github.com/ccxt/ccxt/pull/22335)
- feat: separated forced transpilation from --multiprocess [#22301](https://github.com/ccxt/ccxt/pull/22301)
- coinex: fetchOrder v2 [#22336](https://github.com/ccxt/ccxt/pull/22336)
- Bigone safeValue to safeDict/List/Bool [#22325](https://github.com/ccxt/ccxt/pull/22325)
- feat(bitget): upgrade watchMyTrades [#22338](https://github.com/ccxt/ccxt/pull/22338)
- feat(coinbase): add watchTradesForSymbols/watchOrderBookForSymbols [#22339](https://github.com/ccxt/ccxt/pull/22339)
- fix(kraken): active inside market [#22343](https://github.com/ccxt/ccxt/pull/22343)
- fix(python) - datetime numeric to string & tests [#22332](https://github.com/ccxt/ccxt/pull/22332)
- fix(poloniex) - skip [#22342](https://github.com/ccxt/ccxt/pull/22342)
- Update test.ledgerEntry.ts [#22340](https://github.com/ccxt/ccxt/pull/22340)


## 4.3.10

- chore: update changelog [ci skip] [#22316](https://github.com/ccxt/ccxt/pull/22316)
- feat(blofin): add query-apiKey and affiliate endpoints [#22311](https://github.com/ccxt/ccxt/pull/22311)


## 4.3.9

- feat(Order): add reduceOnly and postOnly [#22296](https://github.com/ccxt/ccxt/pull/22296)
- coinex: cancelOrders v2 [#22299](https://github.com/ccxt/ccxt/pull/22299)
- feat(kucoinfutures): add fetchTradingFee and fetchPositionsHistory [#22292](https://github.com/ccxt/ccxt/pull/22292)
- fix(parseConversions): use safeCurrency instead [#22302](https://github.com/ccxt/ccxt/pull/22302)
- chore: replace tsx in build.sh [#22303](https://github.com/ccxt/ccxt/pull/22303)
- fix(kucoinfutures): fetchPositionsHistory signature [#22305](https://github.com/ccxt/ccxt/pull/22305)
- build: try middle push [#22306](https://github.com/ccxt/ccxt/pull/22306)
- build: skip-tests [#22308](https://github.com/ccxt/ccxt/pull/22308)


## 4.3.8

- feat(okx) - fetchPositionMode [#22271](https://github.com/ccxt/ccxt/pull/22271)
- feat(okx) - createOrder automatic hedge-mode [#22273](https://github.com/ccxt/ccxt/pull/22273)
- ts-node tsx migration [#22270](https://github.com/ccxt/ccxt/pull/22270)
- coinex: createOrder, createOrders v2 [#22283](https://github.com/ccxt/ccxt/pull/22283)
- chore: update transpile.sh to use tsx [#22286](https://github.com/ccxt/ccxt/pull/22286)
- Fix BingX apiKey query endpoint [#22288](https://github.com/ccxt/ccxt/pull/22288)
- feat(bingx): add stopLossPrice/takeProfitPrice support to spot [#22290](https://github.com/ccxt/ccxt/pull/22290)
- feat(coinmetro): add new endpoint to fetchBalance [#22291](https://github.com/ccxt/ccxt/pull/22291)
- build: skip-tests [#22258](https://github.com/ccxt/ccxt/pull/22258)


## 4.3.7

- Fix missing clientOrderId for BingX fetchOrders [#22272](https://github.com/ccxt/ccxt/pull/22272)
- coinex: fetchBalance v2 [#22275](https://github.com/ccxt/ccxt/pull/22275)
- fix(fetchConvertTradeHistory): parseConversions [#22277](https://github.com/ccxt/ccxt/pull/22277)
- generic.ts types [#22098](https://github.com/ccxt/ccxt/pull/22098)


## 4.3.6

- bybit.pro streaming["keepAlive"] changed from 20000 to 19000 [#22262](https://github.com/ccxt/ccxt/pull/22262)
- coinex: fetchOHLCV v2 [#22263](https://github.com/ccxt/ccxt/pull/22263)
- feat(coinbase): public endpoints added for fetchTicker, fetchMarkets,  fetchOHLCV, and fetchOrderBook [#22246](https://github.com/ccxt/ccxt/pull/22246)
- feat(coinbase): public websocket endpoints for watchOrderBook, watchTicker, watchTickers, watchTrades [#22247](https://github.com/ccxt/ccxt/pull/22247)
- feat(safe.cs): type some safeMethods [#22266](https://github.com/ccxt/ccxt/pull/22266)
- feat: new method - fetchPositionHistory [#21942](https://github.com/ccxt/ccxt/pull/21942)


## 4.3.5

- fix(transpile): fetchCurrencies return type [#22236](https://github.com/ccxt/ccxt/pull/22236)
- fix(Throttler.cs): double parsing [#22238](https://github.com/ccxt/ccxt/pull/22238)
- coinex: update doc [#22219](https://github.com/ccxt/ccxt/pull/22219)
- build: move package-tests to master build [#22240](https://github.com/ccxt/ccxt/pull/22240)
- fix(bitget): handleOrder invocation [#22239](https://github.com/ccxt/ccxt/pull/22239)
- fix(binance) - watch method fixes !Q [#22245](https://github.com/ccxt/ccxt/pull/22245)
- coinex: fetchTrades v2 [#22250](https://github.com/ccxt/ccxt/pull/22250)
- fix(coinbase): fetchOHLCV - until timestamp converted to seconds [#22248](https://github.com/ccxt/ccxt/pull/22248)
- fix(test) - exmo qv <> bv check fix [#22253](https://github.com/ccxt/ccxt/pull/22253)
- docs(binance): fetchTickers - added params["type"] to docstring [#22249](https://github.com/ccxt/ccxt/pull/22249)
- fix(tests) - watchOrderBookForSymbols - unsorted timestamps !Q [#22252](https://github.com/ccxt/ccxt/pull/22252)
- feat(binance): add withdraw/list [#22255](https://github.com/ccxt/ccxt/pull/22255)
- feat(okx,cryptocom): add cancelOrdersForSymbols [#22257](https://github.com/ccxt/ccxt/pull/22257)
- feat(bybit): add cancelOrdersForSymbols [#22259](https://github.com/ccxt/ccxt/pull/22259)
- feat(all): add cancelAllOrdersAfter [#22100](https://github.com/ccxt/ccxt/pull/22100)


## 4.3.4

- feat(whitebit): add v4 apis [#22153](https://github.com/ccxt/ccxt/pull/22153)
- feat(exchange): add create order ws [#22087](https://github.com/ccxt/ccxt/pull/22087)
- tests - argvs parsing [#20788](https://github.com/ccxt/ccxt/pull/20788)
- binance future ws [#22133](https://github.com/ccxt/ccxt/pull/22133)
- fix(woo): watchPublic required UID [#22232](https://github.com/ccxt/ccxt/pull/22232)
- chore: update changelog [#22229](https://github.com/ccxt/ccxt/pull/22229)
- fix(kucoin) - chain id currency, network precisions, etc [#22127](https://github.com/ccxt/ccxt/pull/22127)


## 4.3.3



## 4.3.2

- fix(tsx) - ext static depth  [#22202](https://github.com/ccxt/ccxt/pull/22202)
- fix(bingx) - minors !Q [#22215](https://github.com/ccxt/ccxt/pull/22215)
- fix(poloniexfutures) - ts !Q [#22212](https://github.com/ccxt/ccxt/pull/22212)
- wazirx.handleMessage - replace.inArray with string.includes [#22166](https://github.com/ccxt/ccxt/pull/22166)
- new methods: fetchConvertTrade, fetchConvertTradeHistory [#22195](https://github.com/ccxt/ccxt/pull/22195)
- feat(coinbase): createOrder - "FOK" option for params["timeInForce"] [#22222](https://github.com/ccxt/ccxt/pull/22222)
- fix(kraken): watchOrderBook limit extension [#22225](https://github.com/ccxt/ccxt/pull/22225)
- fix(hyperliquid): load spot on mainnet [#22224](https://github.com/ccxt/ccxt/pull/22224)
- fix(hyperliquid): watchTrades spot [#22227](https://github.com/ccxt/ccxt/pull/22227)
- build: skip-tests [#22226](https://github.com/ccxt/ccxt/pull/22226)


## 4.3.1

- fix(bitget) - handleerrors msg [#22164](https://github.com/ccxt/ccxt/pull/22164)
- fix(cli.php): escape pem keys from env [#22201](https://github.com/ccxt/ccxt/pull/22201)
- feat(coinbase): certify [#22203](https://github.com/ccxt/ccxt/pull/22203)
- feat(coinbase): renames [#22211](https://github.com/ccxt/ccxt/pull/22211)
- fix(bingx): remove white line [#22213](https://github.com/ccxt/ccxt/pull/22213)
- coinex: update fetchTicker and fetchTickers to v2 [#22207](https://github.com/ccxt/ccxt/pull/22207)
- feat(hyperliquid): add cancelOrdersForSymbols [#22204](https://github.com/ccxt/ccxt/pull/22204)
- fix(build): CancellationRequest type [#22216](https://github.com/ccxt/ccxt/pull/22216)
- fix(hyperliquid): cancelOrdersForSymbols by clientOrderId [#22217](https://github.com/ccxt/ccxt/pull/22217)
- build: skip-tests [#22214](https://github.com/ccxt/ccxt/pull/22214)
- fix(cryptocom): protect against unknown currencies: skip-tests [#22218](https://github.com/ccxt/ccxt/pull/22218)


## 4.2.100

- new method: createConvertTrade [#22167](https://github.com/ccxt/ccxt/pull/22167)
- fix(kraken): reduceOnly orders over WS [#22185](https://github.com/ccxt/ccxt/pull/22185)
- feat(cs): add ed25519  [#22183](https://github.com/ccxt/ccxt/pull/22183)
- fix(bingx): fetchMyLiquidations [#22186](https://github.com/ccxt/ccxt/pull/22186)
- feat(npmignore): rewrite npmignore [#22174](https://github.com/ccxt/ccxt/pull/22174)
- docs(kucoin): update some @see links [#22192](https://github.com/ccxt/ccxt/pull/22192)
- coinex: fetchMarkets v2 [#22180](https://github.com/ccxt/ccxt/pull/22180)
- build: fix static tests [#22197](https://github.com/ccxt/ccxt/pull/22197)
- fix(kucoin) - commoncurrencies handled [#22188](https://github.com/ccxt/ccxt/pull/22188)
- fix(docs) - commoncurrencies [#22198](https://github.com/ccxt/ccxt/pull/22198)


## 4.2.99

- kucoin replacing safeValue to safeDict/List/Bool [#22159](https://github.com/ccxt/ccxt/pull/22159)
- fix(cs) - RL cost and proper headers handling [#22172](https://github.com/ccxt/ccxt/pull/22172)
- fix(c#) - throttler [#22177](https://github.com/ccxt/ccxt/pull/22177)
- ascendex error remapping [#22173](https://github.com/ccxt/ccxt/pull/22173)


## 4.2.98

- fix(kraken): patch parse ws order [#22152](https://github.com/ccxt/ccxt/pull/22152)
- fix(coinbase): futures markets loading [#22160](https://github.com/ccxt/ccxt/pull/22160)
- feat(coinbase): support JWT on the WS side [#22162](https://github.com/ccxt/ccxt/pull/22162)
- build: skip-tests [ci-deploy] [#22163](https://github.com/ccxt/ccxt/pull/22163)
- build: skip-tests [ci-deploy] [#22168](https://github.com/ccxt/ccxt/pull/22168)


## 4.2.97

- fix(thotler.cs): fix #22141 [#22154](https://github.com/ccxt/ccxt/pull/22154)


## 4.2.96

- fix(poloniexfutures) - timestamps fix in tickers [#22138](https://github.com/ccxt/ccxt/pull/22138)
- binance: simplify spot portfolio margin usage [#22139](https://github.com/ccxt/ccxt/pull/22139)
- handleMarketTypeAndParams - add defaultValue parameter [#22129](https://github.com/ccxt/ccxt/pull/22129)
- tests - watchOrderBookForSymbols, watchTradesForSymbols, watchOHLCVForSymbols [#21457](https://github.com/ccxt/ccxt/pull/21457)
- chore: update changelog [#22145](https://github.com/ccxt/ccxt/pull/22145)
- fix(coinbase): sync markets loading [#22146](https://github.com/ccxt/ccxt/pull/22146)
- fix(deribit): fetchTickers code refactoring [#22149](https://github.com/ccxt/ccxt/pull/22149)
- build: skip-tests [#22147](https://github.com/ccxt/ccxt/pull/22147)


## 4.2.95

- fix(OrderBookSide): @typescript-eslint/parser 7.6.0 errors on wrong order [#22128](https://github.com/ccxt/ccxt/pull/22128)
- read new ask/bid from ticker [#22130](https://github.com/ccxt/ccxt/pull/22130)
- fix(orderbook): add symbol type [#22132](https://github.com/ccxt/ccxt/pull/22132)
- fix(skip) - poloniex curr !Q [#22134](https://github.com/ccxt/ccxt/pull/22134)
- fix(ecdsa): unify the ecdsa signing [#22131](https://github.com/ccxt/ccxt/pull/22131)
- feat(Coinbase): perpetuals support [#22102](https://github.com/ccxt/ccxt/pull/22102)
- fix(gemini): conflicting market [#22135](https://github.com/ccxt/ccxt/pull/22135)
- build: skip-tests [#22137](https://github.com/ccxt/ccxt/pull/22137)


## 4.2.94

- coinex: fetchOrderBook v2 [#22116](https://github.com/ccxt/ccxt/pull/22116)
- fix(tests) - latoken !Q [#22118](https://github.com/ccxt/ccxt/pull/22118)
- fix(coinbasePro): handle alias [#22120](https://github.com/ccxt/ccxt/pull/22120)
- Added support for CSPR, VCHF, VEUR [#22119](https://github.com/ccxt/ccxt/pull/22119)
- fix(gemini): parseMarket was parsing 'USDCUSD' as CUSD/USD. [#22112](https://github.com/ccxt/ccxt/pull/22112)
- fix(OrderBook.ts): add asks/bids/datetime/nonce/timestamp prop [#22122](https://github.com/ccxt/ccxt/pull/22122)
- errors autogeneration [#22013](https://github.com/ccxt/ccxt/pull/22013)
- htx - reorganization fetchMarkets & fetchTickers [#21957](https://github.com/ccxt/ccxt/pull/21957)
- Okx replacing safeValue [#22078](https://github.com/ccxt/ccxt/pull/22078)
- build: skip-tests [#22126](https://github.com/ccxt/ccxt/pull/22126)


## 4.2.93

- new method: fetchConvertQuote [#22055](https://github.com/ccxt/ccxt/pull/22055)
- fix(Kucoin): watchTickers topic should not be all if symbols passed [#22106](https://github.com/ccxt/ccxt/pull/22106)
- fix(cli): read pem secrets properly [#22108](https://github.com/ccxt/ccxt/pull/22108)
- binance: fix fetchIndexOHLCV inverse pair parameter [#22107](https://github.com/ccxt/ccxt/pull/22107)
- krakenfutures - watch multiple all streams - orderbook(s), trades(s), ticker(s), bidasks [#22093](https://github.com/ccxt/ccxt/pull/22093)
- binance: add POST /api/v3/orderList/oco [#22035](https://github.com/ccxt/ccxt/pull/22035)
- new method: fetchConvertCurrencies [#22047](https://github.com/ccxt/ccxt/pull/22047)
- fix(Kucoin): read watchTicker's method from config [#22109](https://github.com/ccxt/ccxt/pull/22109)
- build: skip-tests [#22111](https://github.com/ccxt/ccxt/pull/22111)


## 4.2.92

- feat(probit): fetchDepositsWithdrawals [#22096](https://github.com/ccxt/ccxt/pull/22096)
- encode types [#22097](https://github.com/ccxt/ccxt/pull/22097)
- refactor(exchange): parseLeverageTiers accepts either a dictionary or an array [#22099](https://github.com/ccxt/ccxt/pull/22099)


## 4.2.91

- fix(php): remove define_rest_api [#22089](https://github.com/ccxt/ccxt/pull/22089)
- bybit: add broker api [#22090](https://github.com/ccxt/ccxt/pull/22090)
- fix(kraken): parse fetchPositions [#22091](https://github.com/ccxt/ccxt/pull/22091)
- fix(base) - convertMarketIdExpireDate [#22026](https://github.com/ccxt/ccxt/pull/22026)
- build: skip-tests [#22094](https://github.com/ccxt/ccxt/pull/22094)


## 4.2.90

- fix(gemini): replace * when fetch market from web [#22068](https://github.com/ccxt/ccxt/pull/22068)
- fix(kucoinfutures) - fix sub [#22061](https://github.com/ccxt/ccxt/pull/22061)
- feat(coinbase): add clientorderid prefix [#22071](https://github.com/ccxt/ccxt/pull/22071)
- feat(kucoin) - watchBidsAsks [#22050](https://github.com/ccxt/ccxt/pull/22050)
- Okx replacing safeValue to safeBool/Dict/List [#22052](https://github.com/ccxt/ccxt/pull/22052)
- fix(Exchange): parseToInt string conversion and Crc32 fix [#22082](https://github.com/ccxt/ccxt/pull/22082)
- feat(bimex): add watchTradesForSymbols [#22080](https://github.com/ccxt/ccxt/pull/22080)
- revert commonCurrencyCode & fix fDWF currencies  [#22079](https://github.com/ccxt/ccxt/pull/22079)
- chore: update changelog skip-tests [#22081](https://github.com/ccxt/ccxt/pull/22081)


## 4.2.89

- bingx: update apis [#22049](https://github.com/ccxt/ccxt/pull/22049)
- fix(gemini) - nonce [#22031](https://github.com/ccxt/ccxt/pull/22031)
- bybit: add apis [#22036](https://github.com/ccxt/ccxt/pull/22036)
- feat: fetchMarginAdjustmentHistory [#21875](https://github.com/ccxt/ccxt/pull/21875)
- feat(kucoinfutures): add fetchOpenOrders explicitly [#22059](https://github.com/ccxt/ccxt/pull/22059)
- coinbase - auth migration [#21817](https://github.com/ccxt/ccxt/pull/21817)
- build: skip-tests [#22060](https://github.com/ccxt/ccxt/pull/22060)


## 4.2.88

- kucoin: fetchBalance, isolated margin [#22033](https://github.com/ccxt/ccxt/pull/22033)
- skip - poloniexfutures spread [#22029](https://github.com/ccxt/ccxt/pull/22029)
- fix(mexc): stop infinite loop caused by fetchLeverageTiers [#22034](https://github.com/ccxt/ccxt/pull/22034)
- fix(bitget) - zero ts ticker [#22023](https://github.com/ccxt/ccxt/pull/22023)
- fix(base) - commonCurrencies fix & parseDWF fix [#22022](https://github.com/ccxt/ccxt/pull/22022)
- CurrencyInterface and TradingFeeInterface [#21988](https://github.com/ccxt/ccxt/pull/21988)
- Bitstamp-fetchTransactionFees-update [#21933](https://github.com/ccxt/ccxt/pull/21933)
- fix(Client.cs): protect sendAsync [#22039](https://github.com/ccxt/ccxt/pull/22039)
- fix(bitget): watchBalance spot margin [#22040](https://github.com/ccxt/ccxt/pull/22040)
- fix: common_currency_code python tranpilation no longer causes error 'AttributeError: list object has no attribute "values"' [#22043](https://github.com/ccxt/ccxt/pull/22043)
- build: skip-tests [#22045](https://github.com/ccxt/ccxt/pull/22045)


## 4.2.87

- fix(readme) - minor !Q [#22006](https://github.com/ccxt/ccxt/pull/22006)
- fix(mexc) - comment [#22007](https://github.com/ccxt/ccxt/pull/22007)
- typo in property name of base class [#22001](https://github.com/ccxt/ccxt/pull/22001)
- fix(import-export) - all errors [#21981](https://github.com/ccxt/ccxt/pull/21981)
- fix(cli): remove unused imports [#21977](https://github.com/ccxt/ccxt/pull/21977)
- chore: update changelog [#22011](https://github.com/ccxt/ccxt/pull/22011)
- fix(binance): remove filtering from account positions [#22009](https://github.com/ccxt/ccxt/pull/22009)
- fix(kucoin): fetchBalance, cross margin [#22018](https://github.com/ccxt/ccxt/pull/22018)
- fix(base) - safeCurrency instead of id [#22019](https://github.com/ccxt/ccxt/pull/22019)
- fix(binance): addMargin, reduceMargin amount < 1 fix [#22015](https://github.com/ccxt/ccxt/pull/22015)
- gate - comments [#22020](https://github.com/ccxt/ccxt/pull/22020)
- bitget - fix currency ID vs CODE [#22008](https://github.com/ccxt/ccxt/pull/22008)
- fix(cryptocom): add safeDict in fetchPosition [#22021](https://github.com/ccxt/ccxt/pull/22021)
- chore: update read me [#22024](https://github.com/ccxt/ccxt/pull/22024)
- binance error mapping [#22027](https://github.com/ccxt/ccxt/pull/22027)
- krakenfutures - fix markets contractSize [#22012](https://github.com/ccxt/ccxt/pull/22012)
- build: skip-tests [#22030](https://github.com/ccxt/ccxt/pull/22030)


## 4.2.86

- chore: test files param types [#21622](https://github.com/ccxt/ccxt/pull/21622)
- bitget error mapping [#21969](https://github.com/ccxt/ccxt/pull/21969)
- fix(bitflyer) - fix issues [#21966](https://github.com/ccxt/ccxt/pull/21966)
- feat: new type - MarginModification [#21955](https://github.com/ccxt/ccxt/pull/21955)
- coinex: fetchTime v2 [#21974](https://github.com/ccxt/ccxt/pull/21974)
- coinex: fetchTradingFee, fetchTradingFees v2 [#21975](https://github.com/ccxt/ccxt/pull/21975)
- build: fix static-tests [#21980](https://github.com/ccxt/ccxt/pull/21980)
- fix(cs) - task completion check [#21982](https://github.com/ccxt/ccxt/pull/21982)
- feat(hyperliquid): add spot [#21992](https://github.com/ccxt/ccxt/pull/21992)
- fix(bitmex) - skip !Q [#21990](https://github.com/ccxt/ccxt/pull/21990)
- fix(tests) - types for skippedProps [#21984](https://github.com/ccxt/ccxt/pull/21984)
- fix(c#) - close sync output [#21983](https://github.com/ccxt/ccxt/pull/21983)
- tests & fetchOHLCV - fix across multiple exchanges  [#21958](https://github.com/ccxt/ccxt/pull/21958)
- feat(benchmark): add script to benchmark all languages [#21987](https://github.com/ccxt/ccxt/pull/21987)
- fix(kucoin): watchOrderBook in php [#21998](https://github.com/ccxt/ccxt/pull/21998)
- feat(hyperliquid): add spot fees [#22000](https://github.com/ccxt/ccxt/pull/22000)
- build: skip-tests [#21999](https://github.com/ccxt/ccxt/pull/21999)


## 4.2.85

- fix - exceptions [#21953](https://github.com/ccxt/ccxt/pull/21953)
- fix(okcoin) - ohlcv limits  [#21949](https://github.com/ccxt/ccxt/pull/21949)
- fix(coinmetro) - spread skip !Q [#21950](https://github.com/ccxt/ccxt/pull/21950)
- fix(bingx): fetchPosition - notional and collateral values [#21954](https://github.com/ccxt/ccxt/pull/21954)
- coinex: v2, add endpoints, adjust sign [#21956](https://github.com/ccxt/ccxt/pull/21956)
- fix(bingx): handle swap cost/amount properly [#21962](https://github.com/ccxt/ccxt/pull/21962)
- fix(Crypto.cs):  uniformly handling byte[] request parameter [#21961](https://github.com/ccxt/ccxt/pull/21961)
- TypeScript types [#21928](https://github.com/ccxt/ccxt/pull/21928)
- fix(future.cs): check if task is completed successfully [#21963](https://github.com/ccxt/ccxt/pull/21963)
- fix(bingx): static tests markets [#21965](https://github.com/ccxt/ccxt/pull/21965)
- fix(bitget): watchBalance in C# [#21964](https://github.com/ccxt/ccxt/pull/21964)
- fix(Exchange.cs): ws ping [#21967](https://github.com/ccxt/ccxt/pull/21967)
- build: skip-tests [#21968](https://github.com/ccxt/ccxt/pull/21968)


## 4.2.84

- fix(kucoin): myTrades cache reuse [#21934](https://github.com/ccxt/ccxt/pull/21934)
- feat(Exchange.cs): implement Close() [#21932](https://github.com/ccxt/ccxt/pull/21932)
- fix(WSClient.cs): protect connect [#21935](https://github.com/ccxt/ccxt/pull/21935)
- fix(bybit) - fetchTickers subType [#21922](https://github.com/ccxt/ccxt/pull/21922)
- refactor: convertExpireTime moved to base exchange class [#21578](https://github.com/ccxt/ccxt/pull/21578)
- fix(binance) - watchTicker, watchTickers, watchBidsAsks (using Multi-subscriptions) [#21780](https://github.com/ccxt/ccxt/pull/21780)
- fix(Orderbook.cs): copy prop [#21937](https://github.com/ccxt/ccxt/pull/21937)
- fix(Client.cs): protect connnectAsync inside thread context [#21939](https://github.com/ccxt/ccxt/pull/21939)
- feat(Exchange.cs): make close faster [#21940](https://github.com/ccxt/ccxt/pull/21940)
- feat(Exchange): replace some safeValue with safeList [#21860](https://github.com/ccxt/ccxt/pull/21860)
- hitbtc parseTransaction id [#21936](https://github.com/ccxt/ccxt/pull/21936)
- bybit: update parsePosition [#21943](https://github.com/ccxt/ccxt/pull/21943)
- cli: update fetch with --no-send [#21946](https://github.com/ccxt/ccxt/pull/21946)
- Okx Websocket watch_order_book fix for different limits [#21944](https://github.com/ccxt/ccxt/pull/21944)
- client & protect sendAsync [#21947](https://github.com/ccxt/ccxt/pull/21947)
- readme - api key permission error description !Q [#18717](https://github.com/ccxt/ccxt/pull/18717)
- removal `fetchFundingFee/s` [#14675](https://github.com/ccxt/ccxt/pull/14675)
- build: skip-tests [#21951](https://github.com/ccxt/ccxt/pull/21951)


## 4.2.83

- fix(test) - contractSize for contracts [#21914](https://github.com/ccxt/ccxt/pull/21914)
- fix(kucoin): funds should truncate with quoteIncrement when it's market order [#21903](https://github.com/ccxt/ccxt/pull/21903)
- fix(coinex): parsePosition obtains correct symbol [#21923](https://github.com/ccxt/ccxt/pull/21923)
- fix(bitget) - fetchTickers [#21921](https://github.com/ccxt/ccxt/pull/21921)
- bybit: update [#21929](https://github.com/ccxt/ccxt/pull/21929)
- htx - fetchtickers minor comments <Q [#21919](https://github.com/ccxt/ccxt/pull/21919)


## 4.2.82

- fix(okx): createOrderWs return type [#21893](https://github.com/ccxt/ccxt/pull/21893)
- feat(kucoinfutures) - fetchTickers [#21904](https://github.com/ccxt/ccxt/pull/21904)
- chore: remove repetitive words [#21906](https://github.com/ccxt/ccxt/pull/21906)
- fix(hyperliquid): setmarginMOde [#21909](https://github.com/ccxt/ccxt/pull/21909)
- fix(doc): remove redundant n char [#21910](https://github.com/ccxt/ccxt/pull/21910)
- feat(cli.cs): get keys also from keys.local.json [#21899](https://github.com/ccxt/ccxt/pull/21899)
- fix(bitmart): watchPostions trying to access undefined [#21901](https://github.com/ccxt/ccxt/pull/21901)
- fix(p2b): watchTicker multi-sub [#21913](https://github.com/ccxt/ccxt/pull/21913)
- fix(cex) - updates watchTrades / handleTrades [#21912](https://github.com/ccxt/ccxt/pull/21912)
- fix(exchange): type FetchMarkets [#21911](https://github.com/ccxt/ccxt/pull/21911)
- bithumb: add pro [#21866](https://github.com/ccxt/ccxt/pull/21866)
- skips <Q [#21843](https://github.com/ccxt/ccxt/pull/21843)
- fix(bingx) - skip <Q [#21915](https://github.com/ccxt/ccxt/pull/21915)
- Bitstamp fetch trading fee update [#21864](https://github.com/ccxt/ccxt/pull/21864)
- fix(krakenfutures) - skip contractSize [#21916](https://github.com/ccxt/ccxt/pull/21916)
- feat(deribit): fetchOHLCV pagination [#21917](https://github.com/ccxt/ccxt/pull/21917)


## 4.2.81

- deribit: parseOption fix currency code bug [#21888](https://github.com/ccxt/ccxt/pull/21888)
- delta: add fetchOption [#21879](https://github.com/ccxt/ccxt/pull/21879)
- okx: add fetchOption, fetchOptionChain [#21881](https://github.com/ccxt/ccxt/pull/21881)
- chore: update changelog [ci skip] [#21889](https://github.com/ccxt/ccxt/pull/21889)
- fix(hyperliquid): reduceOnly order [#21890](https://github.com/ccxt/ccxt/pull/21890)
- fix(hyperliquid): handlePublicAddress empty handling [#21891](https://github.com/ccxt/ccxt/pull/21891)


## 4.2.80

- binance: add fetchOption [#21877](https://github.com/ccxt/ccxt/pull/21877)
- gate: add fetchOption, fetchOptionChain [#21880](https://github.com/ccxt/ccxt/pull/21880)
- bybit: add fetchOption, fetchOptionChain [#21878](https://github.com/ccxt/ccxt/pull/21878)
- fix(okx): withdraw password requirement removal [#21882](https://github.com/ccxt/ccxt/pull/21882)
- okx - fetchtickers updates [#21871](https://github.com/ccxt/ccxt/pull/21871)


## 4.2.79

- chore(exchange): marketIds, marketSymbols, marketCodes parameter type [#21761](https://github.com/ccxt/ccxt/pull/21761)
- tests  - symbols selection [#21366](https://github.com/ccxt/ccxt/pull/21366)
- chore(binance): isInverse, isLinear - param types [#21606](https://github.com/ccxt/ccxt/pull/21606)
- phemex watchMultiple - set to false [#21490](https://github.com/ccxt/ccxt/pull/21490)
- fix(gate): edit swap sell orders [#21863](https://github.com/ccxt/ccxt/pull/21863)
- fix(test) - ohlcv [#21853](https://github.com/ccxt/ccxt/pull/21853)
- feat(tests) - watchBidsAsks [#21854](https://github.com/ccxt/ccxt/pull/21854)
- fix(hyperliquid): position contracts and format vault address [#21868](https://github.com/ccxt/ccxt/pull/21868)
- [ADD] python upbit 10m timeframe [#21869](https://github.com/ccxt/ccxt/pull/21869)
- deribit: new methods, fetchOption and fetchOptionChain [#21867](https://github.com/ccxt/ccxt/pull/21867)
- fix(cs): make this.options thread-safe [#21870](https://github.com/ccxt/ccxt/pull/21870)
- bingx - zero contractSize <Q [#21873](https://github.com/ccxt/ccxt/pull/21873)
- build: skip-tests [#21872](https://github.com/ccxt/ccxt/pull/21872)


## 4.2.78

- fix(bitget): ws auth in c# [#21840](https://github.com/ccxt/ccxt/pull/21840)
- `bitstamp` `fetchBalance` and `parseBalance` update [#21825](https://github.com/ccxt/ccxt/pull/21825)
- fix(bybit): watchPositions on the closing event [#21841](https://github.com/ccxt/ccxt/pull/21841)
- gate: add apis [#21852](https://github.com/ccxt/ccxt/pull/21852)
- feat(bybit): add fetchFundingHistory [#21844](https://github.com/ccxt/ccxt/pull/21844)
- feat(bingx): add api to close position by id [#21849](https://github.com/ccxt/ccxt/pull/21849)
- cex - trades sequence [#21847](https://github.com/ccxt/ccxt/pull/21847)
- Remove usage of deprecated python datetime functions [#21846](https://github.com/ccxt/ccxt/pull/21846)
- fix(coinbaseinternational): api docs link [#21842](https://github.com/ccxt/ccxt/pull/21842)
- fix(WooWs): sanitize exchange-specific id [#21855](https://github.com/ccxt/ccxt/pull/21855)
- fix(gate): swap edit order amount [#21859](https://github.com/ccxt/ccxt/pull/21859)
- build: skip-tests [#21858](https://github.com/ccxt/ccxt/pull/21858)


## 4.2.77

- fix(gateio): add loan endpoint for gateio [#21822](https://github.com/ccxt/ccxt/pull/21822)
- fix(coinbase): protect fetchLedger [#21821](https://github.com/ccxt/ccxt/pull/21821)
- htx - fetchOHLCV update [#21830](https://github.com/ccxt/ccxt/pull/21830)
- okx: update error code & withdraw status code [#21829](https://github.com/ccxt/ccxt/pull/21829)
- skips [#21831](https://github.com/ccxt/ccxt/pull/21831)
- fix(coinbase): allow params in fetchAccountId [#21827](https://github.com/ccxt/ccxt/pull/21827)
- fix(hyperliquid): omit timeInForce [#21826](https://github.com/ccxt/ccxt/pull/21826)
- okcoin: update errorcode [#21833](https://github.com/ccxt/ccxt/pull/21833)
- kucoin: update errorcode [#21832](https://github.com/ccxt/ccxt/pull/21832)
- feat(woo): add fetchOpenOrders and fetchClosedOrders [#21835](https://github.com/ccxt/ccxt/pull/21835)
- fix(cs): make this.clients threadSafe [#21838](https://github.com/ccxt/ccxt/pull/21838)
- fix(bybit): add maxNotional in fetchLeverageTiers [#21828](https://github.com/ccxt/ccxt/pull/21828)
- build: skip-tests [#21839](https://github.com/ccxt/ccxt/pull/21839)


## 4.2.76

- fix(blofin): add tpsl to cancelOrder [#21786](https://github.com/ccxt/ccxt/pull/21786)
- chore: added types to safeMarket header [#21579](https://github.com/ccxt/ccxt/pull/21579)
- fix(test): remove php warnings from idTests [#21788](https://github.com/ccxt/ccxt/pull/21788)
- docs(base/exchange): checkRequiredCredentials - docstring [#21797](https://github.com/ccxt/ccxt/pull/21797)
- bybit: fetchMyTrades, execType [#21801](https://github.com/ccxt/ccxt/pull/21801)
- Bingx parse status FAILED as canceled [#21796](https://github.com/ccxt/ccxt/pull/21796)
- kucoin: add fetchBorrowRateHistory & fetchBorrowRateHistories [#21802](https://github.com/ccxt/ccxt/pull/21802)
- remove extra empty lines from stderr [#21806](https://github.com/ccxt/ccxt/pull/21806)
- fix(cs): authentication flow in ws [#21793](https://github.com/ccxt/ccxt/pull/21793)
- fix(delta) - skip cs tests [QUICK] [#21804](https://github.com/ccxt/ccxt/pull/21804)
- bybit: createOrder, add alternative endpoint support [#21799](https://github.com/ccxt/ccxt/pull/21799)
- fix(base-cs) - fetchStatus from emulated to null [QUICK] [#21805](https://github.com/ccxt/ccxt/pull/21805)
- binance - reorganizing exception codes [#21220](https://github.com/ccxt/ccxt/pull/21220)
- chore(exchange): convertTradingViewToOHLCV, convertOHLCVToTradingView parameter type [#21758](https://github.com/ccxt/ccxt/pull/21758)
- chore(exchange): isRoundNumber parameter type [#21757](https://github.com/ccxt/ccxt/pull/21757)
- fix(kraken): update docstring @see links [#21810](https://github.com/ccxt/ccxt/pull/21810)
- `delta.ts` `marketsByNumericId` and `currenciesByNumericId` update [#21794](https://github.com/ccxt/ccxt/pull/21794)
- fix(hyperliquid): fetchOHLCV - timestamp for candle is opening timestamp [#21807](https://github.com/ccxt/ccxt/pull/21807)
- fix(delta): parseLedgerEntry fix [#21815](https://github.com/ccxt/ccxt/pull/21815)
- fix(types): handle list info on trade [#21814](https://github.com/ccxt/ccxt/pull/21814)
- fix(coinbase): increase pagination maxEntriesPerRequest [#21816](https://github.com/ccxt/ccxt/pull/21816)
- build: skip-tests [#21813](https://github.com/ccxt/ccxt/pull/21813)


## 4.2.75

- bingx: minor update [#21772](https://github.com/ccxt/ccxt/pull/21772)
- fix(coinbaseinternational): rename errors to exceptions [#21779](https://github.com/ccxt/ccxt/pull/21779)
- binance: add apis [#21771](https://github.com/ccxt/ccxt/pull/21771)
- feat(coinbase): add pagination in fetchLedger [#21769](https://github.com/ccxt/ccxt/pull/21769)
- fix(tests) -  skip maintenance failures [#21773](https://github.com/ccxt/ccxt/pull/21773)
- bybit: update doc [#21775](https://github.com/ccxt/ccxt/pull/21775)
- gate: update doc [#21776](https://github.com/ccxt/ccxt/pull/21776)
- htx: update doc [#21777](https://github.com/ccxt/ccxt/pull/21777)
- binance: update doc [#21778](https://github.com/ccxt/ccxt/pull/21778)
- fix(bybit): infer trade symbol correctly [#21781](https://github.com/ccxt/ccxt/pull/21781)
- build: skip-tests [#21782](https://github.com/ccxt/ccxt/pull/21782)


## 4.2.74

- fix(bitmart) - code 70003 [QUICK] [#21752](https://github.com/ccxt/ccxt/pull/21752)
- ascendex: edit fetchPositions [#21749](https://github.com/ccxt/ccxt/pull/21749)
- CLI.md: added some useful examples [#21750](https://github.com/ccxt/ccxt/pull/21750)
- coinex: update documentation links [#21751](https://github.com/ccxt/ccxt/pull/21751)
- gate: Add order type mapping for finish orders [#21765](https://github.com/ccxt/ccxt/pull/21765)
- fix(deribit) - skip [QUICK] [#21763](https://github.com/ccxt/ccxt/pull/21763)
- chore: update changelog [#21766](https://github.com/ccxt/ccxt/pull/21766)
- chore: added type AccountStructure to be returned by fetchAccounts [#21708](https://github.com/ccxt/ccxt/pull/21708)
- feat(tradeogre): add exchange [#21767](https://github.com/ccxt/ccxt/pull/21767)


## 4.2.73

- fix(bitget) - fetchOHLCV [#21724](https://github.com/ccxt/ccxt/pull/21724)
- feat(Exchange) make Str type export [#21734](https://github.com/ccxt/ccxt/pull/21734)
- feat(cli): add ccxt global command and raw, update docs [#21733](https://github.com/ccxt/ccxt/pull/21733)
- fix(coinbaseinternational): update link [#21742](https://github.com/ccxt/ccxt/pull/21742)
- fix(huobi) - fetchOHLCV [#21686](https://github.com/ccxt/ccxt/pull/21686)
- fix(krakenfutures) - watchTrades reverse timestamp  [#21744](https://github.com/ccxt/ccxt/pull/21744)
- fix(hyperliquid): precision fix [#21745](https://github.com/ccxt/ccxt/pull/21745)
- feat(bybit): add fetchLeverageTiers [#21747](https://github.com/ccxt/ccxt/pull/21747)
- skips - reorg [#21722](https://github.com/ccxt/ccxt/pull/21722)
- fix(hyperliquid): market orders price precision after slippage [#21748](https://github.com/ccxt/ccxt/pull/21748)
- build: skip-tests [ci deploy] [#21746](https://github.com/ccxt/ccxt/pull/21746)


## 4.2.72

- mexc error remapping [#21726](https://github.com/ccxt/ccxt/pull/21726)
- chore: number->Num when default value = undefined [#21714](https://github.com/ccxt/ccxt/pull/21714)
- coinbaseinternational [#21191](https://github.com/ccxt/ccxt/pull/21191)
- fix(gate) - fetchOHLCV since & limit for contracts [#21705](https://github.com/ccxt/ccxt/pull/21705)
- fix(okx): fundingRateHistory pagination [#21737](https://github.com/ccxt/ccxt/pull/21737)
- fix(hyperliquid): precision [#21739](https://github.com/ccxt/ccxt/pull/21739)
- btcturk: update timeframes [#21740](https://github.com/ccxt/ccxt/pull/21740)
- build: skip-tests [ci deploy] [#21738](https://github.com/ccxt/ccxt/pull/21738)


## 4.2.71

- ascendex: add fetchMarginMode and fetchMarginModes [#21719](https://github.com/ccxt/ccxt/pull/21719)
- chore: string->Str when variable can be undefined [#21713](https://github.com/ccxt/ccxt/pull/21713)
- ascendex: add fetchLeverage and fetchLeverages [#21718](https://github.com/ccxt/ccxt/pull/21718)
- chore: add types LastPrice, LastPrices [#21711](https://github.com/ccxt/ccxt/pull/21711)
- bingx: add keepAliveListenKey [#21710](https://github.com/ccxt/ccxt/pull/21710)
- CLI.md: fixed a few minor typos [#21720](https://github.com/ccxt/ccxt/pull/21720)
- fix(hitbtc) handle new orderbook snapshot correctly [#21723](https://github.com/ccxt/ccxt/pull/21723)


## 4.2.70

- hyperliquid: add ws pro [#21638](https://github.com/ccxt/ccxt/pull/21638)
- feat(ResponseTests): add tests [#21694](https://github.com/ccxt/ccxt/pull/21694)
- coinbase: update [#21693](https://github.com/ccxt/ccxt/pull/21693)
- test: brokerIdTests - more verbose error messages [#21697](https://github.com/ccxt/ccxt/pull/21697)
- docs: examples/ts/watch-OHLCV.ts [#21698](https://github.com/ccxt/ccxt/pull/21698)
- docs(mexc): createOrder - docstring [#21699](https://github.com/ccxt/ccxt/pull/21699)
- object specific tests skips; fix build issues [#21641](https://github.com/ccxt/ccxt/pull/21641)
- fix(php): remove undefined types [#21695](https://github.com/ccxt/ccxt/pull/21695)
- test methods - checks for response arrays [#21635](https://github.com/ccxt/ccxt/pull/21635)
- Bitget improve pos docs [#21701](https://github.com/ccxt/ccxt/pull/21701)
- Update types.ts with more Str [#21690](https://github.com/ccxt/ccxt/pull/21690)
- fix(ascendex) - skip currency-id [QUICK] [#21703](https://github.com/ccxt/ccxt/pull/21703)
- build: skip-tests [#21706](https://github.com/ccxt/ccxt/pull/21706)


## 4.2.69

- gate: add fetchLeverage and fetchLeverages [#21692](https://github.com/ccxt/ccxt/pull/21692)
- fix(base) - load proxy handling [#21674](https://github.com/ccxt/ccxt/pull/21674)
- fix(bitmart) - skip currencyid [#21689](https://github.com/ccxt/ccxt/pull/21689)
- fix(gate) - skips [#21688](https://github.com/ccxt/ccxt/pull/21688)
- fix(kucoinfutures) - skip spread [#21687](https://github.com/ccxt/ccxt/pull/21687)


## 4.2.68

- gate: patch parseOrder [#21673](https://github.com/ccxt/ccxt/pull/21673)
- fix(lbank) - side fix [QUICK] [#21672](https://github.com/ccxt/ccxt/pull/21672)
- htx: add apis [#21670](https://github.com/ccxt/ccxt/pull/21670)
- kucoin: fetchOHLCV add timeframes 1month [#21669](https://github.com/ccxt/ccxt/pull/21669)
- hitbtc: update errors [#21671](https://github.com/ccxt/ccxt/pull/21671)
- fix(gemini) - fetchmarkets reorg [#21660](https://github.com/ccxt/ccxt/pull/21660)
- Bitstamp `transfer` method added [#21214](https://github.com/ccxt/ccxt/pull/21214)
- fix(gemini) - skipWs  [QUICK] [#21676](https://github.com/ccxt/ccxt/pull/21676)
- build(deps): bump readthedocs-sphinx-search from 0.1.0 to 0.3.2 in /doc [#20842](https://github.com/ccxt/ccxt/pull/20842)
- fix(gemini) - swap true [#21677](https://github.com/ccxt/ccxt/pull/21677)
- fix(kucoin): private headers [#21680](https://github.com/ccxt/ccxt/pull/21680)
- build: skip-tests [#21681](https://github.com/ccxt/ccxt/pull/21681)


## 4.2.67

- `NullableDict` and `NullableList` types added [#21658](https://github.com/ccxt/ccxt/pull/21658)
- fix(hyperliquid): vault trading [#21656](https://github.com/ccxt/ccxt/pull/21656)
- fix(Manual): typo [#21659](https://github.com/ccxt/ccxt/pull/21659)
- krakenfutures - add historical fetchTrades [#21657](https://github.com/ccxt/ccxt/pull/21657)
- build: skip-tests [ci deploy] [#21662](https://github.com/ccxt/ccxt/pull/21662)


## 4.2.66

- feat(staticTests): add new public request tests [#21639](https://github.com/ccxt/ccxt/pull/21639)
- fix(gate): patch fetchFundingHistory [#21653](https://github.com/ccxt/ccxt/pull/21653)
- fix(exchange): patch error message when call fetchPaginatedCallDynamic [#21654](https://github.com/ccxt/ccxt/pull/21654)
- fix build issues - 3 [QUICK] [#21655](https://github.com/ccxt/ccxt/pull/21655)


## 4.2.65

- doc: add info in status structure [#21633](https://github.com/ccxt/ccxt/pull/21633)
- fix(bitfinex2) - funding fees fix [QUICK] [#21632](https://github.com/ccxt/ccxt/pull/21632)
- fix(bitget) - iteration [QUICK] [#21631](https://github.com/ccxt/ccxt/pull/21631)
- fix(bitmart) - handling issues [#21627](https://github.com/ccxt/ccxt/pull/21627)
- fix(bitfinex2) - trades reverse  [#21630](https://github.com/ccxt/ccxt/pull/21630)
- fix(transpiler) - reverse [#21629](https://github.com/ccxt/ccxt/pull/21629)
- bitget: minor update [#21636](https://github.com/ccxt/ccxt/pull/21636)
- fix(hitbtc): ohlcv since [#21648](https://github.com/ccxt/ccxt/pull/21648)
- fix(bigone): createOrder [#21649](https://github.com/ccxt/ccxt/pull/21649)
- build: skip-tests [#21647](https://github.com/ccxt/ccxt/pull/21647)


## 4.2.64

- fix(coinbase): require payload for GET v2 private endpoint [#21598](https://github.com/ccxt/ccxt/pull/21598)
- blofin: add fetchMarginMode [#21600](https://github.com/ccxt/ccxt/pull/21600)
- delta: add fetchMarginMode [#21601](https://github.com/ccxt/ccxt/pull/21601)
- docs(exchange, btcmarkets): calculateFee docstring [#21604](https://github.com/ccxt/ccxt/pull/21604)
- some issues  [#21594](https://github.com/ccxt/ccxt/pull/21594)
- kucoin: add exchange broker implicit API endpoints [#21602](https://github.com/ccxt/ccxt/pull/21602)
- base/types.ts remove extra space [#21609](https://github.com/ccxt/ccxt/pull/21609)
- chore: setSandboxMode - parameter types [#21610](https://github.com/ccxt/ccxt/pull/21610)
- fix(lbank) - skip ohlcv watch [QUICK] [#21611](https://github.com/ccxt/ccxt/pull/21611)
- fix(Exchange): snake_case transpile [#21607](https://github.com/ccxt/ccxt/pull/21607)
- fix(ts) - windows support [#21612](https://github.com/ccxt/ccxt/pull/21612)
- feat(kucoin): remove safeValue [#21613](https://github.com/ccxt/ccxt/pull/21613)
- feat(bingx): add TRAILING_TP_SL and test order [#21617](https://github.com/ccxt/ccxt/pull/21617)
- feat(py): remove network from ethereum utils [#21599](https://github.com/ccxt/ccxt/pull/21599)
- fix(btcmarkets): gave value to desription tag [#21619](https://github.com/ccxt/ccxt/pull/21619)
- binance: minor update [#21620](https://github.com/ccxt/ccxt/pull/21620)
- build skips [QUICK] [#21623](https://github.com/ccxt/ccxt/pull/21623)
- fix(bitmart) - ts [QUICK] [#21626](https://github.com/ccxt/ccxt/pull/21626)
- fix(currencycom) - handle trades [QUICK] [#21624](https://github.com/ccxt/ccxt/pull/21624)
- fix(bitmex): fetchFundingRateHistory reverse [#21628](https://github.com/ccxt/ccxt/pull/21628)
- build: skip-tests [#21621](https://github.com/ccxt/ccxt/pull/21621)


## 4.2.63

- bybit: update for spot [#21581](https://github.com/ccxt/ccxt/pull/21581)
- bitget: add fetchMarginMode [#21576](https://github.com/ccxt/ccxt/pull/21576)
- fix(gemini) - promise all markets [#21570](https://github.com/ccxt/ccxt/pull/21570)
- feat(idTests): add hyperLiquid [#21568](https://github.com/ccxt/ccxt/pull/21568)
- fix(bitget): remove filled calculation from parseWsOrder [#21567](https://github.com/ccxt/ccxt/pull/21567)
- feat(bingx): remove safeValue [#21564](https://github.com/ccxt/ccxt/pull/21564)
- feat(blofin): remove safeValue [#21566](https://github.com/ccxt/ccxt/pull/21566)
- Manual: add margin-mode-structure to the documentation [#21577](https://github.com/ccxt/ccxt/pull/21577)
- fix(binance): fetchMarkets - correctly loops through options["fetchMarkets"] [#21575](https://github.com/ccxt/ccxt/pull/21575)
- feat(kucoin): add broker download endpoint [#21583](https://github.com/ccxt/ccxt/pull/21583)
- fix(lbank) - ws tests [#21584](https://github.com/ccxt/ccxt/pull/21584)
- fix(yobit): handleErrors [#21586](https://github.com/ccxt/ccxt/pull/21586)
- fix(CS): get value with typed IDicts [#21585](https://github.com/ccxt/ccxt/pull/21585)
- fix(coinexWs): authentication [#21589](https://github.com/ccxt/ccxt/pull/21589)
- Fix bybit.py - fetchTradingFee function [#21591](https://github.com/ccxt/ccxt/pull/21591)
- fix(bitfinex2) - incorrect keys [QUICK] [#21593](https://github.com/ccxt/ccxt/pull/21593)
- feat(krakenfutures): add account-log endpoint [#21592](https://github.com/ccxt/ccxt/pull/21592)
- build: skip-tests [#21590](https://github.com/ccxt/ccxt/pull/21590)


## 4.2.62

- fix(setup): add python file [ci deploy] skip-tests [#21572](https://github.com/ccxt/ccxt/pull/21572)
- fix python dist [#21573](https://github.com/ccxt/ccxt/pull/21573)


## 4.2.61

- fix(hyperliquid): url image skip-tests [#21561](https://github.com/ccxt/ccxt/pull/21561)
- fix(hyperliquid): update logo skip-tests [#21563](https://github.com/ccxt/ccxt/pull/21563)
- fix(bitget) - fetchOHLCV  reorganization [#21513](https://github.com/ccxt/ccxt/pull/21513)
- fix(pip): include missing json file [ci deploy] skip-tests [#21571](https://github.com/ccxt/ccxt/pull/21571)


## 4.2.60

- coinex: add fetchLeverage, fetchLeverages [#21554](https://github.com/ccxt/ccxt/pull/21554)
- fix(okx): transfer - remove made up timestamp data [#21548](https://github.com/ccxt/ccxt/pull/21548)
- krakenfutures: add fetchLeverages [#21553](https://github.com/ccxt/ccxt/pull/21553)
- feat(coinbase) - RateLimits for data api and advanced api [QUICK] [#21525](https://github.com/ccxt/ccxt/pull/21525)
- fix(bingx): fix watchOHLCV load markets [#21546](https://github.com/ccxt/ccxt/pull/21546)
- kraken.parseOrder uses safeDict [#21549](https://github.com/ccxt/ccxt/pull/21549)
- fix(tokocrypto): fetchTrades - correct default type for response [#21550](https://github.com/ccxt/ccxt/pull/21550)
- fix(kucoinfutures): fetchMyTrades - correct default type [#21552](https://github.com/ccxt/ccxt/pull/21552)
- fix(phemex): fetchDeposits - correct default value [#21551](https://github.com/ccxt/ccxt/pull/21551)
- fix(whitebit): handleMessage uses safeString for result instead of safeMessage [#21547](https://github.com/ccxt/ccxt/pull/21547)
- New exchange: hyperliquid [#20590](https://github.com/ccxt/ccxt/pull/20590)
- wazirx: update [#21556](https://github.com/ccxt/ccxt/pull/21556)
- build: skip-tests [#21559](https://github.com/ccxt/ccxt/pull/21559)


## 4.2.59

- bitget: correct the side for createOrder [#21524](https://github.com/ccxt/ccxt/pull/21524)
- wazirx: add apis [#21523](https://github.com/ccxt/ccxt/pull/21523)
- bingx: fetchMarginMode [#21521](https://github.com/ccxt/ccxt/pull/21521)
- kucoinfutures: closeAllPositions = false [#21520](https://github.com/ccxt/ccxt/pull/21520)
- blofin: fetchLeverages [#21522](https://github.com/ccxt/ccxt/pull/21522)
- fix(ascendex): remove made up timestamp data [#21514](https://github.com/ccxt/ccxt/pull/21514)
- fix(bitmart): parse network ids [#21515](https://github.com/ccxt/ccxt/pull/21515)
- bitfinex2.has, createOrderRequest docstring [#21518](https://github.com/ccxt/ccxt/pull/21518)
- woo: update [#21465](https://github.com/ccxt/ccxt/pull/21465)
- binance: patch parseWsPosition [#21528](https://github.com/ccxt/ccxt/pull/21528)
- bitget parseTrade fee fix [#21530](https://github.com/ccxt/ccxt/pull/21530)
- Update hitbtc.ts Fix withdraw method [#21527](https://github.com/ccxt/ccxt/pull/21527)
- bitmart - ticker check [#21533](https://github.com/ccxt/ccxt/pull/21533)
- fix(deribit) - undefined type [QUICK] [#21534](https://github.com/ccxt/ccxt/pull/21534)
- fix(mexc) - ticker spread test skip [QUICK] [#21535](https://github.com/ccxt/ccxt/pull/21535)
- fix(bithumb) - tests fix skip [QUICK] [#21536](https://github.com/ccxt/ccxt/pull/21536)
- fix(delta) - timeout skip [QUICK] [#21537](https://github.com/ccxt/ccxt/pull/21537)
- bitfinex2 - skip orderbook tests [QUICK] [#21532](https://github.com/ccxt/ccxt/pull/21532)
- fix(kraken) - endpoints rate-limits [#21541](https://github.com/ccxt/ccxt/pull/21541)
- htx parseTrade fee fix [#21540](https://github.com/ccxt/ccxt/pull/21540)
- build: skip-tests [#21539](https://github.com/ccxt/ccxt/pull/21539)


## 4.2.58

- fix(mexc) - ws ob nonce [#21499](https://github.com/ccxt/ccxt/pull/21499)
- build: add missing paths to cleanup.sh [#21497](https://github.com/ccxt/ccxt/pull/21497)
- safeValue -> safeBool [#21479](https://github.com/ccxt/ccxt/pull/21479)
- update changelog [#21503](https://github.com/ccxt/ccxt/pull/21503)
- fix(woo): fetchTrades uses correct default type for response [#21482](https://github.com/ccxt/ccxt/pull/21482)
- fix(phemex): fetchClosed swap orders without symbol [#21506](https://github.com/ccxt/ccxt/pull/21506)
- deribit - WS implementations [#21475](https://github.com/ccxt/ccxt/pull/21475)
- bitmart - watchTicker & watchTickers reorg using MultiSubscriptions [#21344](https://github.com/ccxt/ccxt/pull/21344)
- fix(Exchange.cs): currency list info [#21508](https://github.com/ccxt/ccxt/pull/21508)
- coinbase - upgrades [#21507](https://github.com/ccxt/ccxt/pull/21507)
- build: skip-tests [#21510](https://github.com/ccxt/ccxt/pull/21510)
- feat(mexc): add delete to contentType [#21511](https://github.com/ccxt/ccxt/pull/21511)
- build: skip-tests [#21512](https://github.com/ccxt/ccxt/pull/21512)


## 4.2.57

- feat: replace some safeValues to safeBool [#21477](https://github.com/ccxt/ccxt/pull/21477)
- fix(wazirx) - fT ask skip [#21478](https://github.com/ccxt/ccxt/pull/21478)
- feat(bitget): improve profit_loss inference on fetchOpenOrders [#21476](https://github.com/ccxt/ccxt/pull/21476)
- bitmex & type assertions [#21473](https://github.com/ccxt/ccxt/pull/21473)
- fix(probit): fetchTransactions correct default value for response [#21483](https://github.com/ccxt/ccxt/pull/21483)
- fix(bitrue): fetchWithdrawals uses correct default type for response [#21481](https://github.com/ccxt/ccxt/pull/21481)
- fix(alpaca): handleCryptoMessage uses safeString instead of safeValue [#21486](https://github.com/ccxt/ccxt/pull/21486)
- fix(whitebit): handleMessage uses safeString for result instead of safeMessage [#21485](https://github.com/ccxt/ccxt/pull/21485)
- fix(alpaca): fetchTrades uses correct default type for response [#21480](https://github.com/ccxt/ccxt/pull/21480)
- Exchange: fetchLeverage, fetchLeverages [#21491](https://github.com/ccxt/ccxt/pull/21491)
- fix(kuna): fetchTrades - fix request param, default value for response [#21484](https://github.com/ccxt/ccxt/pull/21484)
- Fix(types.cs): info list [#21498](https://github.com/ccxt/ccxt/pull/21498)
- build: skip-tests [#21500](https://github.com/ccxt/ccxt/pull/21500)


## 4.2.56

- mexc: fetchLeverage [#21463](https://github.com/ccxt/ccxt/pull/21463)
- Manual: add leverage structure, fetchLeverage and fetchLeverages information [#21462](https://github.com/ccxt/ccxt/pull/21462)
- bitmex: fetchLeverage, fetchLeverages [#21461](https://github.com/ccxt/ccxt/pull/21461)
- feat(manual): add sponsored promotion [#21464](https://github.com/ccxt/ccxt/pull/21464)
- fix(mexc) - unskip [#21417](https://github.com/ccxt/ccxt/pull/21417)
- bitmex - watchTicker & watchTickers & ws tests return [#21356](https://github.com/ccxt/ccxt/pull/21356)
- feat(exchange): new method fetchMarginModes [#21440](https://github.com/ccxt/ccxt/pull/21440)
- skip bitfinex2 & delta [#21472](https://github.com/ccxt/ccxt/pull/21472)
- feat(Exchange.cs): add LoadMarkets and example [#21471](https://github.com/ccxt/ccxt/pull/21471)
- feat(Exchange): type OHLCVS [#21469](https://github.com/ccxt/ccxt/pull/21469)
- build: skip-tests [#21474](https://github.com/ccxt/ccxt/pull/21474)


## 4.2.55

- woo: add setPositionMode [#21448](https://github.com/ccxt/ccxt/pull/21448)
- kraken - unskip ws [#21452](https://github.com/ccxt/ccxt/pull/21452)
- fix(bybit): watchTicker swap [#21453](https://github.com/ccxt/ccxt/pull/21453)
- feat(transpile): type ints [#21436](https://github.com/ccxt/ccxt/pull/21436)
- fix(currencycom) - unskip [#21413](https://github.com/ccxt/ccxt/pull/21413)
- fix(upbit) - return ws test (QUICK) [#21455](https://github.com/ccxt/ccxt/pull/21455)
- remove skip exchanges [#21454](https://github.com/ccxt/ccxt/pull/21454)
- fix(bitget) - ws tests [#21330](https://github.com/ccxt/ccxt/pull/21330)
- fix(bitget): watchMyTrades without symbol [#21456](https://github.com/ccxt/ccxt/pull/21456)
- build: skip-tests [ci deploy] [#21458](https://github.com/ccxt/ccxt/pull/21458)


## 4.2.54

- okx: add error code [#21442](https://github.com/ccxt/ccxt/pull/21442)
- skip exchanges [#21445](https://github.com/ccxt/ccxt/pull/21445)
- gate: add apis, portfolio rename unified [#21443](https://github.com/ccxt/ccxt/pull/21443)
- okx: tpOrdKind support [#21434](https://github.com/ccxt/ccxt/pull/21434)
- few skips [#21449](https://github.com/ccxt/ccxt/pull/21449)


## 4.2.53

- binance: sapi flexible loan endpoints [#21433](https://github.com/ccxt/ccxt/pull/21433)
- whitebit fetchBalance type [#21429](https://github.com/ccxt/ccxt/pull/21429)
- binance: portfolio margin websocket support [#21283](https://github.com/ccxt/ccxt/pull/21283)
- docs: add FAQ.md to docs [#21402](https://github.com/ccxt/ccxt/pull/21402)
- feat(binance): fetchLedgerEntry (options only) [#21357](https://github.com/ccxt/ccxt/pull/21357)
- feat(bybit): add fetchLeverage [#21437](https://github.com/ccxt/ccxt/pull/21437)
- feat(binance): add fetchLeverage [#21438](https://github.com/ccxt/ccxt/pull/21438)
- build: skip onetrading [skip-tests] [#21439](https://github.com/ccxt/ccxt/pull/21439)


## 4.2.52

- fix(Exchange.cs): default paddingMode [#21397](https://github.com/ccxt/ccxt/pull/21397)
- fix(huobi) - fetchStatus temp fix [#21398](https://github.com/ccxt/ccxt/pull/21398)
- coinbase: add fetchTime [#21408](https://github.com/ccxt/ccxt/pull/21408)
- coinbase: increase limit for fetchBalance [#21405](https://github.com/ccxt/ccxt/pull/21405)
- bingx: update [#21403](https://github.com/ccxt/ccxt/pull/21403)
- unskip blockchaincom & remove seq number checks [#21363](https://github.com/ccxt/ccxt/pull/21363)
- feat(binance): fetchTradingLimits [#21389](https://github.com/ccxt/ccxt/pull/21389)
- feat(binance): fetchCanceledAndClosedOrders [#21388](https://github.com/ccxt/ccxt/pull/21388)
- fix(coinbase): add params to the body when using Authorization as header [#21420](https://github.com/ccxt/ccxt/pull/21420)
- fix(cryptocom) - unskip ws [#21412](https://github.com/ccxt/ccxt/pull/21412)
- skip(bitfinex2) - skips [#21409](https://github.com/ccxt/ccxt/pull/21409)
- fix(gemini) - unskip [#21415](https://github.com/ccxt/ccxt/pull/21415)
- fix(deribit) - unskip [#21414](https://github.com/ccxt/ccxt/pull/21414)
- fix(bitvavo) - de-proxified [#21411](https://github.com/ccxt/ccxt/pull/21411)
- fix(bitso) - skip ob ask bid [#21407](https://github.com/ccxt/ccxt/pull/21407)
- improve validate-type.ts performance [#21400](https://github.com/ccxt/ccxt/pull/21400)
- coinbase: deposit, fetchDeposit [#21422](https://github.com/ccxt/ccxt/pull/21422)
- fix(bequant) - spead skips [#21410](https://github.com/ccxt/ccxt/pull/21410)
- okx: update watchPositions support empty symbols [#21386](https://github.com/ccxt/ccxt/pull/21386)
- bitget parseOrderStatus [#21425](https://github.com/ccxt/ccxt/pull/21425)
- fix(build): static tests [#21426](https://github.com/ccxt/ccxt/pull/21426)
- feat(build): add tsBuildFile [#21282](https://github.com/ccxt/ccxt/pull/21282)
- build: skip-tests [#21428](https://github.com/ccxt/ccxt/pull/21428)


## 4.2.51

- update changelog [#21376](https://github.com/ccxt/ccxt/pull/21376)
- bitfinex2 - test WS fixes [#21329](https://github.com/ccxt/ccxt/pull/21329)
- fix(test.market): error message [#21377](https://github.com/ccxt/ccxt/pull/21377)
- fix(bitrue) - enable ws test [#21360](https://github.com/ccxt/ccxt/pull/21360)
- fix(bitvavo) - unskip [#21362](https://github.com/ccxt/ccxt/pull/21362)
- fix(bitstamp) - unskip ws [#21361](https://github.com/ccxt/ccxt/pull/21361)
- build: skip exchanges [#21387](https://github.com/ccxt/ccxt/pull/21387)
- fix(woo): fix empty line [#21382](https://github.com/ccxt/ccxt/pull/21382)
- fix(deribit,ndax, bingx): lint [#21383](https://github.com/ccxt/ccxt/pull/21383)
- feat(binance): fetchTradesWs [#21323](https://github.com/ccxt/ccxt/pull/21323)
- feat(binance): fetchOHLCVWs [#21349](https://github.com/ccxt/ccxt/pull/21349)
- fix!: delist bitforex [#21394](https://github.com/ccxt/ccxt/pull/21394)
- fix(gate): handleTickerAndBidAsk parsing [#21392](https://github.com/ccxt/ccxt/pull/21392)
- feat(binance): fetchPositionMode [#21395](https://github.com/ccxt/ccxt/pull/21395)
- fix(Exchange): has add missing methods [#21391](https://github.com/ccxt/ccxt/pull/21391)
- binance.has false methods [#21393](https://github.com/ccxt/ccxt/pull/21393)
- build: skip-tests [#21396](https://github.com/ccxt/ccxt/pull/21396)


## 4.2.50

- mexc: invalid content type error [#21367](https://github.com/ccxt/ccxt/pull/21367)
- fix(package.json) - ast transpiler update [#21354](https://github.com/ccxt/ccxt/pull/21354)
- fix(bitcoincom) - ws inheritance [#21355](https://github.com/ccxt/ccxt/pull/21355)
- feat(binance): add dci endpoints [#21368](https://github.com/ccxt/ccxt/pull/21368)
- fix(okx): fetchPosition - position timestamp changed to the start time of the position instead of the last updated time [#21358](https://github.com/ccxt/ccxt/pull/21358)
- fix(manual): typo [#21371](https://github.com/ccxt/ccxt/pull/21371)
- fix(bitget) - negative open [#21370](https://github.com/ccxt/ccxt/pull/21370)
- fix build: skip-tests [#21373](https://github.com/ccxt/ccxt/pull/21373)


## 4.2.49

- feat(cs): first implementation of ethAbiEncode and ethEncodeStructure [#21328](https://github.com/ccxt/ccxt/pull/21328)
- feat(cs): add keccak hash [#21332](https://github.com/ccxt/ccxt/pull/21332)
- binance.pro.has [#21335](https://github.com/ccxt/ccxt/pull/21335)
- feat(binance): fetchClosedOrdersWs [#21334](https://github.com/ccxt/ccxt/pull/21334)
- gemini - watchBidsAsks [#21342](https://github.com/ccxt/ccxt/pull/21342)
- fix(mexc): php urlencode [#21341](https://github.com/ccxt/ccxt/pull/21341)
- feat(cli.cs): add --test --testnet flag [#21340](https://github.com/ccxt/ccxt/pull/21340)
- fix(whitebit) timestamp/datetime missing from watchOrderbook [#21343](https://github.com/ccxt/ccxt/pull/21343)
- feat(bl3p): createDepositAddress [#21296](https://github.com/ccxt/ccxt/pull/21296)
- inheritance WS - > REST [#21306](https://github.com/ccxt/ccxt/pull/21306)
- binance has [#21347](https://github.com/ccxt/ccxt/pull/21347)
- timex: update [#21346](https://github.com/ccxt/ccxt/pull/21346)
- build: [skip tests] [#21350](https://github.com/ccxt/ccxt/pull/21350)
- fix build: skip-tests [#21351](https://github.com/ccxt/ccxt/pull/21351)


## 4.2.48

- feat(independentreserve): fetchDepositAddress [#21295](https://github.com/ccxt/ccxt/pull/21295)
- fix(package.json) - add csharp tests command [QUICK] [#21242](https://github.com/ccxt/ccxt/pull/21242)
- has: fetchDepositAddress = false [#21297](https://github.com/ccxt/ccxt/pull/21297)
- bitget: update parseWsOrder [#21287](https://github.com/ccxt/ccxt/pull/21287)
- Added support for LMWR, BLUR, PEPE and VEXT [#21294](https://github.com/ccxt/ccxt/pull/21294)
- binance: fix parseMarket, strike price [#21300](https://github.com/ccxt/ccxt/pull/21300)
- Fix WS timeouts - 1 [#21293](https://github.com/ccxt/ccxt/pull/21293)
- upbit: createOrder, timeInForce [#21301](https://github.com/ccxt/ccxt/pull/21301)
- lykke: add @see [#21302](https://github.com/ccxt/ccxt/pull/21302)
- latoken: add @see [#21303](https://github.com/ccxt/ccxt/pull/21303)
- upbit: update nonce timestamp to uuid [#21271](https://github.com/ccxt/ccxt/pull/21271)
- ndax: add @see [#21305](https://github.com/ccxt/ccxt/pull/21305)
- luno: add @see [#21304](https://github.com/ccxt/ccxt/pull/21304)
- fix(mexc,bitstamp): orderbook loading in C# [#21307](https://github.com/ccxt/ccxt/pull/21307)
- Bybit: fix cursor parameter [#21312](https://github.com/ccxt/ccxt/pull/21312)
- fix(bitmart) watchTicker [#21311](https://github.com/ccxt/ccxt/pull/21311)
- bybit: fetchMyLiquidations [#21317](https://github.com/ccxt/ccxt/pull/21317)
- fix(tests) - symbols order [QUICK] [#21313](https://github.com/ccxt/ccxt/pull/21313)
- fix(exchange): compare None as Int in get_object_value_from_key_list [#21319](https://github.com/ccxt/ccxt/pull/21319)
- upbit: static request, createOrder timeInForce param [#21322](https://github.com/ccxt/ccxt/pull/21322)
- feat(build): add skip-tests feature [#21324](https://github.com/ccxt/ccxt/pull/21324)
- fix skip-tests flag [#21326](https://github.com/ccxt/ccxt/pull/21326)
- update skip-tests [#21327](https://github.com/ccxt/ccxt/pull/21327)


## 4.2.47

- fix(binance): price should not be required if priceMatch is provided [#21270](https://github.com/ccxt/ccxt/pull/21270)
- fix(hitbtc) watchTicker never receives ticker [#21255](https://github.com/ccxt/ccxt/pull/21255)
- fix(okx): history position parsing [#21280](https://github.com/ccxt/ccxt/pull/21280)
- idex: update [#21281](https://github.com/ccxt/ccxt/pull/21281)
- upbit: add fetchDeposit and fetchWithdrawal [#21286](https://github.com/ccxt/ccxt/pull/21286)
- indodax: update [#21289](https://github.com/ccxt/ccxt/pull/21289)


## 4.2.46

- coinsph: update [#21260](https://github.com/ccxt/ccxt/pull/21260)
- feat(indodax): fetchDepositAddresses, fetchDepositAddress [#21247](https://github.com/ccxt/ccxt/pull/21247)
- fix(bybit): restore fetchOrder(s) for classic accounts [#21264](https://github.com/ccxt/ccxt/pull/21264)
- currencycom: add @see [#21267](https://github.com/ccxt/ccxt/pull/21267)
- deribit: add @see [#21268](https://github.com/ccxt/ccxt/pull/21268)
- exmo: add @see [#21269](https://github.com/ccxt/ccxt/pull/21269)
- gemini: add @see [#21272](https://github.com/ccxt/ccxt/pull/21272)
- fix(build): onetrading skip [#21275](https://github.com/ccxt/ccxt/pull/21275)
- hollaex: update [#21273](https://github.com/ccxt/ccxt/pull/21273)
- feat(cs): add ecdsa [#21274](https://github.com/ccxt/ccxt/pull/21274)
- fix(appveyor): bump to 8.12 [#21276](https://github.com/ccxt/ccxt/pull/21276)
- update changelog [#21277](https://github.com/ccxt/ccxt/pull/21277)


## 4.2.45

- feat(ValidateTypes): assert proper int number [#21221](https://github.com/ccxt/ccxt/pull/21221)
- fix(transpile.sh) - ws rest exchange [#21223](https://github.com/ccxt/ccxt/pull/21223)
- transpile - support for windows users [#21224](https://github.com/ccxt/ccxt/pull/21224)
- okx: add apis [#21236](https://github.com/ccxt/ccxt/pull/21236)
- hitbtc: add apis [#21235](https://github.com/ccxt/ccxt/pull/21235)
- bithumb: add apis [#21233](https://github.com/ccxt/ccxt/pull/21233)
- feat(docker): add dotnet sdk [#21234](https://github.com/ccxt/ccxt/pull/21234)
- fix(transpile.bat) - simplify and better check [#21225](https://github.com/ccxt/ccxt/pull/21225)
- coinbase.fetchDepositAddressesByNetwork docstring [#21227](https://github.com/ccxt/ccxt/pull/21227)
- coincheck: add @see [#21237](https://github.com/ccxt/ccxt/pull/21237)
- btcturk: add @see [#21238](https://github.com/ccxt/ccxt/pull/21238)
- timex: fetchDepositAddress, implodeParams used in sign [#21230](https://github.com/ccxt/ccxt/pull/21230)
- fix(coinbase): fetchBalance - limit parameter removed for v2 [#21231](https://github.com/ccxt/ccxt/pull/21231)
- fix: changelog [ci skip] [#21240](https://github.com/ccxt/ccxt/pull/21240)
- binance: fetchPositionsRisk, remove empty positions [#21248](https://github.com/ccxt/ccxt/pull/21248)
- latoken, mercado, oceanex - fetchDepositAddress = false [#21245](https://github.com/ccxt/ccxt/pull/21245)
- coinmate: update [#21252](https://github.com/ccxt/ccxt/pull/21252)
- fix(cryptocom) switch fetchDepositWithdrawFees from spot to unified api [#21250](https://github.com/ccxt/ccxt/pull/21250)
- fix(bitget): watchOrderBook [#21251](https://github.com/ccxt/ccxt/pull/21251)
- feat(idex): fetchDepositAddress [#21232](https://github.com/ccxt/ccxt/pull/21232)
- binance: edit fetchBalance, portfolio margin [#21249](https://github.com/ccxt/ccxt/pull/21249)
- fix(run-tests) - increase to 120 from 100 [#21253](https://github.com/ccxt/ccxt/pull/21253)
- feat(Exchange): type WS structures [#21222](https://github.com/ccxt/ccxt/pull/21222)
- fix(build): disable onetrading [#21256](https://github.com/ccxt/ccxt/pull/21256)
- fix build: skip coinsph [#21262](https://github.com/ccxt/ccxt/pull/21262)
- bitfinex2 HTX mapping [#21261](https://github.com/ccxt/ccxt/pull/21261)
- coinspot: add @see [#21259](https://github.com/ccxt/ccxt/pull/21259)


## 4.2.44

- fix(hitbtc) watchTickers never receives updates [#21212](https://github.com/ccxt/ccxt/pull/21212)
- fix(Exchange): fix !== 0 after safeNumber [#21213](https://github.com/ccxt/ccxt/pull/21213)
- feat(gate) - watchTickers and watchBidsAsks [#21072](https://github.com/ccxt/ccxt/pull/21072)
- binance: fetchMyLiquidations, add portfolio margin support [#21216](https://github.com/ccxt/ccxt/pull/21216)
- bybit: add fetchOpenOrder, fetchClosedOrder, remove fetchOrder, fetchOrders [#21218](https://github.com/ccxt/ccxt/pull/21218)
- binance: fetchOpenOrder [#21219](https://github.com/ccxt/ccxt/pull/21219)
- coinbase: fetchCurrencies and fetchDepositAddressesByNetwork [#21215](https://github.com/ccxt/ccxt/pull/21215)
- fix(bingx)!: fetchDepositAddress renamed to fetchDepositAddressesByNetwork. fetchDepositAddress reimplemented to return a single deposit address structure [#21172](https://github.com/ccxt/ccxt/pull/21172)
- feat(exchange): fetchDepositAddress uses fetchDepositAddressesByNetwork if fetchDepositAddress is not implemented [#21217](https://github.com/ccxt/ccxt/pull/21217)


## 4.2.43

- fix!(mexc): fetchDepositAddressesByNetwork returns an object indexed by network code [#21175](https://github.com/ccxt/ccxt/pull/21175)
- feat(binance): unify networks inside currency [#21202](https://github.com/ccxt/ccxt/pull/21202)
- fix(kucoin): protect fetchLedger [#21203](https://github.com/ccxt/ccxt/pull/21203)
- fix(blofin): fetchBalance with accountType [#21204](https://github.com/ccxt/ccxt/pull/21204)
- feat(Exchange.py): handle wait_for calls [#21205](https://github.com/ccxt/ccxt/pull/21205)
- binance: fetchTradingFee, add portfolio margin support [#21206](https://github.com/ccxt/ccxt/pull/21206)
- binance: fetchOrders, add portfolio margin support [#21207](https://github.com/ccxt/ccxt/pull/21207)
- fix(krakenfutures): format price/amount properly [#21210](https://github.com/ccxt/ccxt/pull/21210)
- fix(coinbase): v2 methods signature [#21209](https://github.com/ccxt/ccxt/pull/21209)
- fix build: bitflyer [#21211](https://github.com/ccxt/ccxt/pull/21211)


## 4.2.42

- fix(binance): fetchClosedOrders limit [#21194](https://github.com/ccxt/ccxt/pull/21194)
- feat(cs): add currency and market example [#21196](https://github.com/ccxt/ccxt/pull/21196)
- feat(exchange): addMargin, setMargin, reduceMargin, parsePosition to return Position type" [#21197](https://github.com/ccxt/ccxt/pull/21197)
- fix(binanceus) incorrect has-values in pro implementation [#21199](https://github.com/ccxt/ccxt/pull/21199)


## 4.2.41

- feat(exchange): type networkIdToCode and fix usage [#21185](https://github.com/ccxt/ccxt/pull/21185)


## 4.2.40

- feat(bingx): createOrder - added params["triggerPrice"] for spot orders [#21157](https://github.com/ccxt/ccxt/pull/21157)
- feat(transpile): helper script [#21183](https://github.com/ccxt/ccxt/pull/21183)
- binance: fetchMyTrades, add portfolio margin support [#21186](https://github.com/ccxt/ccxt/pull/21186)
- binance: fetchBorrowInterest, add portfolio margin support [#21187](https://github.com/ccxt/ccxt/pull/21187)
- fix(timestamps): replace safeNumber [#21188](https://github.com/ccxt/ccxt/pull/21188)


## 4.2.39

- feat(tests): don't load keys by default [#21153](https://github.com/ccxt/ccxt/pull/21153)
- fix .length on some exchanges <QUICK> [#21162](https://github.com/ccxt/ccxt/pull/21162)
- feat(coinbasepro): add conversion/fees endpoint [#21164](https://github.com/ccxt/ccxt/pull/21164)
- binance: fetchLeverageTiers, portfolio margin [#21161](https://github.com/ccxt/ccxt/pull/21161)
- binance: borrowCrossMargin, repayCrossMargin, portfolio margin support [#21159](https://github.com/ccxt/ccxt/pull/21159)
- bitmart - watchTradesForSymbols [#21130](https://github.com/ccxt/ccxt/pull/21130)
- feat(okx): fetchOpenOrders - params["ordType"] is no longer required when params["trigger"] = true [#21158](https://github.com/ccxt/ccxt/pull/21158)
- feat(krakenfutures): add fetchClosedOrders and fetchCanceledOrders [#21154](https://github.com/ccxt/ccxt/pull/21154)
- phemex.has: closePosition = false [#21168](https://github.com/ccxt/ccxt/pull/21168)
- feat(Exchange): remove some safeValue [#21152](https://github.com/ccxt/ccxt/pull/21152)
- feat(bingx): editOrder [#21156](https://github.com/ccxt/ccxt/pull/21156)
- feat(binance): remove safeValue [#21166](https://github.com/ccxt/ccxt/pull/21166)
- fix(ascendex): fetchDepositAddress - accepts params["network"] [#21046](https://github.com/ccxt/ccxt/pull/21046)
- fix(bitget) - coins that contain $ sign [#21169](https://github.com/ccxt/ccxt/pull/21169)
- fix(bitget): flip side if hedged+reduceOnly [#21170](https://github.com/ccxt/ccxt/pull/21170)
- docs(mexc): exchange name in docstrings changed from mexc3 to mexc [#21173](https://github.com/ccxt/ccxt/pull/21173)
- binance: fetchPositonsRisk, add portfolio margin support [#21174](https://github.com/ccxt/ccxt/pull/21174)
- feat(bybit): fetchOHLCV - add params["until"] [#21178](https://github.com/ccxt/ccxt/pull/21178)
- binance: fetchLedger, add portfolio margin support [#21177](https://github.com/ccxt/ccxt/pull/21177)
- binance: fetchAccountPositions, add portfolio margin support [#21180](https://github.com/ccxt/ccxt/pull/21180)
- binance: fetchFundingHistory, add portfolio margin support [#21179](https://github.com/ccxt/ccxt/pull/21179)


## 4.2.38

- fix(mexc): watchOrderBook assigns timestamp for contract markets [#21132](https://github.com/ccxt/ccxt/pull/21132)
- fix(krakenfutures): parseMyTrades returns symbol with response [#21133](https://github.com/ccxt/ccxt/pull/21133)
- binance: fetchOrder, portfolio margin [#21134](https://github.com/ccxt/ccxt/pull/21134)
- docs(okx): fetchOpenOrders remove till from docstring [#21135](https://github.com/ccxt/ccxt/pull/21135)
- binance: cancelOrder, portfolio margin support [#21137](https://github.com/ccxt/ccxt/pull/21137)
- bitso: add @see [#21138](https://github.com/ccxt/ccxt/pull/21138)
- binance: setPositionMode, portfolio margin support [#21142](https://github.com/ccxt/ccxt/pull/21142)
- btcmarkets: add @see [#21146](https://github.com/ccxt/ccxt/pull/21146)
- bitstamp: add @see [#21139](https://github.com/ccxt/ccxt/pull/21139)
- bl3p: add @see [#21140](https://github.com/ccxt/ccxt/pull/21140)
- btcbox: add @see [#21144](https://github.com/ccxt/ccxt/pull/21144)
- coinbase: add preview in createOrder [#21147](https://github.com/ccxt/ccxt/pull/21147)
- btcalpha: add @see [#21143](https://github.com/ccxt/ccxt/pull/21143)
- blockchaincom: add @see [#21141](https://github.com/ccxt/ccxt/pull/21141)
- feat(okx): add account-rate-limit endpoint [#21149](https://github.com/ccxt/ccxt/pull/21149)
- binance: setLeverage, portfolio margin support [#21145](https://github.com/ccxt/ccxt/pull/21145)
- feat(exchange): type overridden methods [#21148](https://github.com/ccxt/ccxt/pull/21148)
- feat(Exchange.cs): call networks afterConstruct and OKX currency networks [#21150](https://github.com/ccxt/ccxt/pull/21150)
- bitmart - subscribe multiple + watchOrderBookForSymbols [#21129](https://github.com/ccxt/ccxt/pull/21129)
- fix(build): waves precision [ci deploy] [#21155](https://github.com/ccxt/ccxt/pull/21155)


## 4.2.37

- feat(kucoin): watchOrderBook add level2Depth5 & level2Depth50 method [#21128](https://github.com/ccxt/ccxt/pull/21128)
- Blofin implementation [#20371](https://github.com/ccxt/ccxt/pull/20371)


## 4.2.36

- feat(cs): remove .vs dir [#21110](https://github.com/ccxt/ccxt/pull/21110)
- feat(tests): run a single test [#21108](https://github.com/ccxt/ccxt/pull/21108)
- fix(docs): typo [#21111](https://github.com/ccxt/ccxt/pull/21111)
- feat(gemini) - watchTradesForSymbols [#21097](https://github.com/ccxt/ccxt/pull/21097)
- feat(gemini) - watchOrderBookForSymbols [#21107](https://github.com/ccxt/ccxt/pull/21107)
- feat(bybit): limit tpsl orders support [#21114](https://github.com/ccxt/ccxt/pull/21114)
- fix(bybit): remove marginMode from parsePosition [#21117](https://github.com/ccxt/ccxt/pull/21117)
- fix(types): orderTypes [#21118](https://github.com/ccxt/ccxt/pull/21118)
- fix(types): add missing values to position [#21119](https://github.com/ccxt/ccxt/pull/21119)
- binance: createOrder, postOnly [#21116](https://github.com/ccxt/ccxt/pull/21116)
- feat(C#): update docs [#21122](https://github.com/ccxt/ccxt/pull/21122)
- binance: cancelAllOrders, portfolio margin support [#21126](https://github.com/ccxt/ccxt/pull/21126)
- binance: fetchOpenOrders, portfolio margin support [#21123](https://github.com/ccxt/ccxt/pull/21123)
- bitfinex: edit rate limit weights [#21120](https://github.com/ccxt/ccxt/pull/21120)
- bitmex: add @see [#21127](https://github.com/ccxt/ccxt/pull/21127)


## 4.2.35

- bitfinex: add @see [#21073](https://github.com/ccxt/ccxt/pull/21073)
- bithumb: add @see [#21074](https://github.com/ccxt/ccxt/pull/21074)
- feat(woo): can now use since parameter on fetchOHLCV [#21083](https://github.com/ccxt/ccxt/pull/21083)
- fix(bitget): fetchOHLCV - correctly calls history method if since timestamp is > 31 days ago [#21080](https://github.com/ccxt/ccxt/pull/21080)
- fix(binance): restore ws url port [#21101](https://github.com/ccxt/ccxt/pull/21101)
- Regression watch ticker binance [#21102](https://github.com/ccxt/ccxt/pull/21102)
- binance: createOrder, portfolio margin support [#21105](https://github.com/ccxt/ccxt/pull/21105)


## 4.2.34

- binance: fetchBalance, portfolio margin [#21093](https://github.com/ccxt/ccxt/pull/21093)
- wrong string/number concatenation [#21091](https://github.com/ccxt/ccxt/pull/21091)
- fix(Exchange): fetchPaginatedCallIncremental error msg [#21095](https://github.com/ccxt/ccxt/pull/21095)
- fix(binance): watchPositions safeSymbol and watchMyTrades parser, fix #21076 [#21086](https://github.com/ccxt/ccxt/pull/21086)
- bitfinex2: set the remaining margin methods to false [#21092](https://github.com/ccxt/ccxt/pull/21092)
- fix!(krakenfutures): update fees structure [#21081](https://github.com/ccxt/ccxt/pull/21081)
- fix(Exchange.py): linting [#21096](https://github.com/ccxt/ccxt/pull/21096)
- fix(watch) regression after c# intervention; watch for binance is broken [#21099](https://github.com/ccxt/ccxt/pull/21099)


## 4.2.33

- Fix image [ci deploy] [#21084](https://github.com/ccxt/ccxt/pull/21084)
- update image [ci deploy] [#21085](https://github.com/ccxt/ccxt/pull/21085)
- fix images format [ci deploy] [#21088](https://github.com/ccxt/ccxt/pull/21088)
- update package reference [ci deploy] [#21089](https://github.com/ccxt/ccxt/pull/21089)
- fix build: skip [ci deploy] [#21094](https://github.com/ccxt/ccxt/pull/21094)


## 4.2.32

- fix file permissions [ci deploy] [#21082](https://github.com/ccxt/ccxt/pull/21082)


## 4.2.31

- [C#][netstandard2.0][netstandard2.1] CCXT implementation [#17650](https://github.com/ccxt/ccxt/pull/17650)
- bit2c: add @see [#21066](https://github.com/ccxt/ccxt/pull/21066)
- bigone: add @see [#21067](https://github.com/ccxt/ccxt/pull/21067)
- build: tmp disable exchanges [#21070](https://github.com/ccxt/ccxt/pull/21070)
- fix(gate) - tickers default TZ [#21071](https://github.com/ccxt/ccxt/pull/21071)
- fix(static): gate tests [#21075](https://github.com/ccxt/ccxt/pull/21075)
- fix(kraken): invalid price [#21078](https://github.com/ccxt/ccxt/pull/21078)


## 4.2.30

- update readme [ci skip] [#21057](https://github.com/ccxt/ccxt/pull/21057)
- bitfinex2: cancelOrders [#21048](https://github.com/ccxt/ccxt/pull/21048)
- timex update docs url [#21043](https://github.com/ccxt/ccxt/pull/21043)
- coinbase: add apis [#21051](https://github.com/ccxt/ccxt/pull/21051)
- okx: add apis [#21054](https://github.com/ccxt/ccxt/pull/21054)
- has["fetchDepositAddress"] == false [#21044](https://github.com/ccxt/ccxt/pull/21044)
- Whitebit change rate limit [#21032](https://github.com/ccxt/ccxt/pull/21032)
- docs(lbank): lbank docstrings reference lbank instead of lbank2 [#21042](https://github.com/ccxt/ccxt/pull/21042)
- bitfinex2: createOrders [#21050](https://github.com/ccxt/ccxt/pull/21050)
- feat(bitget,okx): static tests [#21058](https://github.com/ccxt/ccxt/pull/21058)
- fix(kraken) fetchOHLC since must be passed as nanoseconds [#21055](https://github.com/ccxt/ccxt/pull/21055)
- fix(bitget): update request test [#21059](https://github.com/ccxt/ccxt/pull/21059)
- filterBySinceLimit returns the [limit] records after since instead of the [limit] most recent records [#20966](https://github.com/ccxt/ccxt/pull/20966)
- deribit: fetchOHLCV, missing the first candle in some cases [#21062](https://github.com/ccxt/ccxt/pull/21062)
- bitfinex2: add the remaining swap support [#21064](https://github.com/ccxt/ccxt/pull/21064)
- fix(htx) - order parsing and tests [#21060](https://github.com/ccxt/ccxt/pull/21060)


## 4.2.29

- feat(coinbase) - fetchBidsAsks - multi symbol arguments support [#21021](https://github.com/ccxt/ccxt/pull/21021)
- bitget has [#21026](https://github.com/ccxt/ccxt/pull/21026)
- feat(coinbase) - fetchtickers with multi symbols support [#21022](https://github.com/ccxt/ccxt/pull/21022)
- base - exception handling  [#19649](https://github.com/ccxt/ccxt/pull/19649)
- Bitfinex2: update createOrder [#21028](https://github.com/ccxt/ccxt/pull/21028)
- fix(hitbtc): reduceMargin, addMargin, can set marginMode [#21025](https://github.com/ccxt/ccxt/pull/21025)
- fix(exceptions) - Move OperationRejected, NoChange and MarginModeAlreadySet out of BadRequest [#21035](https://github.com/ccxt/ccxt/pull/21035)
- feat(bitmex) - watchTickers [#21033](https://github.com/ccxt/ccxt/pull/21033)
- Replace safe value safe bool 3 [#21030](https://github.com/ccxt/ccxt/pull/21030)
- feat(p2b): websockets/pro implementation [#20982](https://github.com/ccxt/ccxt/pull/20982)
- feat(exceptions) - ratelimitexceeded out of DDOSprotection [#21038](https://github.com/ccxt/ccxt/pull/21038)
- feat(docs) - documentation of exception types - OperationFailed, OperationRejected, BadRequest [#21037](https://github.com/ccxt/ccxt/pull/21037)
- Fix build [#21041](https://github.com/ccxt/ccxt/pull/21041)
- fix(okx): fetches first candle from start of since [#21040](https://github.com/ccxt/ccxt/pull/21040)
- Digifinex: fetchTickers, safeMarket fourth argument error [#21047](https://github.com/ccxt/ccxt/pull/21047)
- fix(bybit): set-collateral-switch and set-collateral-switch-batch are both POST [#21039](https://github.com/ccxt/ccxt/pull/21039)
- build: skip fetchTickers [#21056](https://github.com/ccxt/ccxt/pull/21056)


## 4.2.28

- feat(okx): add full ob endpoint [#21013](https://github.com/ccxt/ccxt/pull/21013)
- fix(bybit): order fee [#21014](https://github.com/ccxt/ccxt/pull/21014)
- feat(bitmex): update link [#21015](https://github.com/ccxt/ccxt/pull/21015)
- coinmetro.ts `sign` update [#21016](https://github.com/ccxt/ccxt/pull/21016)
- feat(bybit): add error mapping [#21018](https://github.com/ccxt/ccxt/pull/21018)
- feat(Exchange): add safeBool/safeList/safeDict [#21012](https://github.com/ccxt/ccxt/pull/21012)
- fix(coinbase) - watchTickers for all markets [#21020](https://github.com/ccxt/ccxt/pull/21020)
- coinmetro header update [#21023](https://github.com/ccxt/ccxt/pull/21023)


## 4.2.27

- feat(Exchange): add class tag [#21001](https://github.com/ccxt/ccxt/pull/21001)
- feat(bitforex): cancelAllOrders [#21004](https://github.com/ccxt/ccxt/pull/21004)
- has["cancelAllOrders"] [#21005](https://github.com/ccxt/ccxt/pull/21005)
- Bitfinex2: setMargin [#21008](https://github.com/ccxt/ccxt/pull/21008)
- bitfinex2: fetchBalance, debt field [#21009](https://github.com/ccxt/ccxt/pull/21009)


## 4.2.26

- feat(Exchange): improve fetchOrders error message [#20996](https://github.com/ccxt/ccxt/pull/20996)
- fix(coinbase): add params to body when using token [#20997](https://github.com/ccxt/ccxt/pull/20997)
- fix(upbit): fetchDepositAddress takes params["network"] [#20998](https://github.com/ccxt/ccxt/pull/20998)
- Coinmetro integration [ci deploy] [#20297](https://github.com/ccxt/ccxt/pull/20297)
- fix Static tests [ci deploy] [#20999](https://github.com/ccxt/ccxt/pull/20999)


## 4.2.25

- fix(ws): freezing eror [#20988](https://github.com/ccxt/ccxt/pull/20988)
- fix(bingx): order parsing [#20993](https://github.com/ccxt/ccxt/pull/20993)
- bingx: add watchTicker [#20995](https://github.com/ccxt/ccxt/pull/20995)
- bingx: add fetchMarkOHLCV [#20994](https://github.com/ccxt/ccxt/pull/20994)


## 4.2.24

- Bitfinex2: fetchLiquidations [#20989](https://github.com/ccxt/ccxt/pull/20989)
- fix(gate): parse web trade id [#20987](https://github.com/ccxt/ccxt/pull/20987)


## 4.2.23

- fix(binanceus) - ratelimits 3 [#20954](https://github.com/ccxt/ccxt/pull/20954)
- Bitfinex2: fetchOpenInterestHistory [#20980](https://github.com/ccxt/ccxt/pull/20980)
- bitopro: add watchMyTrades [#20950](https://github.com/ccxt/ccxt/pull/20950)
- Wrong class on error Bingx [#20979](https://github.com/ccxt/ccxt/pull/20979)
- fix(phemex): position parsing [#20985](https://github.com/ccxt/ccxt/pull/20985)


## 4.2.22

- fix(binance) no timestamp for futures watched tickers [#20973](https://github.com/ccxt/ccxt/pull/20973)
- Okx: edit algo order [#20970](https://github.com/ccxt/ccxt/pull/20970)
- feat(travis): add nuggetToken [ci skip] [#20974](https://github.com/ccxt/ccxt/pull/20974)
- bitfinex2: fetchOpenInterest [#20972](https://github.com/ccxt/ccxt/pull/20972)
- Okx: watchMyTrades, add spot margin support [#20971](https://github.com/ccxt/ccxt/pull/20971)
- feat(phemex): add endpoint to fetchPositions [#20976](https://github.com/ccxt/ccxt/pull/20976)
- feat(coinex): add history endpoint to fetchPositions [#20975](https://github.com/ccxt/ccxt/pull/20975)
- feat(hitbtcPro): add sandbox mode [#20978](https://github.com/ccxt/ccxt/pull/20978)


## 4.2.21

- Okx: watchOrders, unify spot margin support [#20930](https://github.com/ccxt/ccxt/pull/20930)
- fix(bitrue): use proper orderbook type [#20936](https://github.com/ccxt/ccxt/pull/20936)
- feat(woo): fix fetchDepositAddress flag [#20937](https://github.com/ccxt/ccxt/pull/20937)
- fix(binanceus) - ws extend correct inheritance [#20853](https://github.com/ccxt/ccxt/pull/20853)
- docs: Divide docs in globla referene and reference per exchange [#20902](https://github.com/ccxt/ccxt/pull/20902)
- feat(tests): allow request and response tests to run in the same command [#20939](https://github.com/ccxt/ccxt/pull/20939)
- feat(coinex): handleMarginMode [#20940](https://github.com/ccxt/ccxt/pull/20940)
- feat(phemex): improve fetchBalance docs [#20941](https://github.com/ccxt/ccxt/pull/20941)
- Manual: add notes on the marginMode parameter [#20944](https://github.com/ccxt/ccxt/pull/20944)
- Binance: watchOrders, add handleMarginModeAndParams [#20933](https://github.com/ccxt/ccxt/pull/20933)
- Deribit: createExpiredOptionMarket [#20942](https://github.com/ccxt/ccxt/pull/20942)
- feat(tests): add binance static tests [#20947](https://github.com/ccxt/ccxt/pull/20947)
- feat(binance): update test ws endpoint [#20952](https://github.com/ccxt/ccxt/pull/20952)
- feat(binance): improve docs and method handling [#20953](https://github.com/ccxt/ccxt/pull/20953)
- wrong comment breaks build [#20955](https://github.com/ccxt/ccxt/pull/20955)
- bitget has [#20958](https://github.com/ccxt/ccxt/pull/20958)
- feat(binance): add convert endpoints [#20959](https://github.com/ccxt/ccxt/pull/20959)
- fix(bitget): watchOrders - remove invalid amount for buy orders [#20956](https://github.com/ccxt/ccxt/pull/20956)
- has["fetchFundingRate"] [#20960](https://github.com/ccxt/ccxt/pull/20960)
- fix(build): poloniex skip tickers build [#20963](https://github.com/ccxt/ccxt/pull/20963)
- feat(bybit): improve market orders for UTA [#20965](https://github.com/ccxt/ccxt/pull/20965)


## 4.2.20

- feat(bitvavo): ws trading [#18629](https://github.com/ccxt/ccxt/pull/18629)
- fix(blockchaincom): fetchDepositAddress [#20916](https://github.com/ccxt/ccxt/pull/20916)
- feat(lbank): remove limit from fetchOrderBookWs [#20918](https://github.com/ccxt/ccxt/pull/20918)
- fix(gate): fetchLeverageTiers parsing [#20920](https://github.com/ccxt/ccxt/pull/20920)
- gate: add apis [#20932](https://github.com/ccxt/ccxt/pull/20932)
- WsClient eslint errors fix [#20925](https://github.com/ccxt/ccxt/pull/20925)
- fix(bitopro): fix ws url and signature [#20928](https://github.com/ccxt/ccxt/pull/20928)
- Add querying contract funds from Phemex [#20931](https://github.com/ccxt/ccxt/pull/20931)
- novadax: add apis, update ratelimit [#20934](https://github.com/ccxt/ccxt/pull/20934)
- fix(phemex): editOrder & static-tests [#20927](https://github.com/ccxt/ccxt/pull/20927)
- fix(tests) - timeouts [#20921](https://github.com/ccxt/ccxt/pull/20921)


## 4.2.19

- BingX New error parsed to InsufficientFunds [#20901](https://github.com/ccxt/ccxt/pull/20901)
- feat(Exchange): move expired option market to the base class [#20888](https://github.com/ccxt/ccxt/pull/20888)
- feat(binance): add papi/ping endpoint [#20906](https://github.com/ccxt/ccxt/pull/20906)
- feat(base): add fetchCanceledAndClosedOrders stub [#20883](https://github.com/ccxt/ccxt/pull/20883)
- feat(bitteam): update logo [#20907](https://github.com/ccxt/ccxt/pull/20907)
- fix(binanceus) - rate limits [#20908](https://github.com/ccxt/ccxt/pull/20908)
- Bitrue fix build [#20915](https://github.com/ccxt/ccxt/pull/20915)
- fix(kucoinfutures) - fix funding value [#20899](https://github.com/ccxt/ccxt/pull/20899)


## 4.2.18

- fix(root) - remove 'test.ts' file [#20867](https://github.com/ccxt/ccxt/pull/20867)
- Added support for WECAN, TRAC, EURCV, PYUSD [#20865](https://github.com/ccxt/ccxt/pull/20865)
- fix(kraken): rate limiter fixed for public methods [#20859](https://github.com/ccxt/ccxt/pull/20859)
- feat(luno): add fetchOHLCV [#20869](https://github.com/ccxt/ccxt/pull/20869)
- fix(luno): fetchOHLCV docstring return type fix for build error [#20874](https://github.com/ccxt/ccxt/pull/20874)
- Deribit: fix fetchFundingRateHistory since [#20876](https://github.com/ccxt/ccxt/pull/20876)
- htx: add apis [#20878](https://github.com/ccxt/ccxt/pull/20878)
- gate: add apis [#20879](https://github.com/ccxt/ccxt/pull/20879)
- fix(dependencies) - ast-transpiler update [#20871](https://github.com/ccxt/ccxt/pull/20871)
- Binance: trailing percent order example [#20881](https://github.com/ccxt/ccxt/pull/20881)
- Deribit: fix fetchPositions linear currency [#20880](https://github.com/ccxt/ccxt/pull/20880)
- feat(run-tests) - warning & timeouts upgrade [#20866](https://github.com/ccxt/ccxt/pull/20866)
- fix(cjs) - bundling location dist/src [#20870](https://github.com/ccxt/ccxt/pull/20870)
- lbank - websockets [#15185](https://github.com/ccxt/ccxt/pull/15185)
- poloniexfutures.has["fetchFundingRateHistory"]: false [#20891](https://github.com/ccxt/ccxt/pull/20891)
- mexc update docs link [#20893](https://github.com/ccxt/ccxt/pull/20893)
- Bitget: fetchPositions, enable calling with no symbols argument [#20890](https://github.com/ccxt/ccxt/pull/20890)
- ascendex.has["fetchOpenInterest,fetchOpenInterestHistory"] = false [#20892](https://github.com/ccxt/ccxt/pull/20892)
- createTrailingAmountOrder and createTrailingPercentOrder typescript examples [#20889](https://github.com/ccxt/ccxt/pull/20889)
- fix(binanceWs): watchPositions [#20895](https://github.com/ccxt/ccxt/pull/20895)
- fix build: disable bitpanda [#20897](https://github.com/ccxt/ccxt/pull/20897)
- feat(onetrading): rename from bitpanda [#20739](https://github.com/ccxt/ccxt/pull/20739)
- feat(bitpanda): add alias [#20898](https://github.com/ccxt/ccxt/pull/20898)


## 4.2.17

- feat(coincheck): add pro [#20846](https://github.com/ccxt/ccxt/pull/20846)
- Bybit: edit cancelAllOrders orderFilter param [#20844](https://github.com/ccxt/ccxt/pull/20844)
- fix(cryptocom): remove this as any [#20851](https://github.com/ccxt/ccxt/pull/20851)
- feat(tests) - test WatchTickers &  test fetchTickers updates (single & multi symbol tests) [#20622](https://github.com/ccxt/ccxt/pull/20622)
- bitget: allow books1 channel in watchOrderBookForSymbols [#20850](https://github.com/ccxt/ccxt/pull/20850)
- fix(BinanceWs): stream limits reading [#20852](https://github.com/ccxt/ccxt/pull/20852)
- fix(poloniexfutures, kucoin, kucoinfutures): wrap negotiate in try catch and add future to transpile, fix #20835 [#20843](https://github.com/ccxt/ccxt/pull/20843)
- add skips [#20854](https://github.com/ccxt/ccxt/pull/20854)
- fix(base) - remove fetchstatus 'emulated' from bases [#20862](https://github.com/ccxt/ccxt/pull/20862)
- fix(whitebit) - has fetchstatus true [#20863](https://github.com/ccxt/ccxt/pull/20863)
- binance: add apis [#20857](https://github.com/ccxt/ccxt/pull/20857)
- Deribit: static request tests [#20861](https://github.com/ccxt/ccxt/pull/20861)
- docs(kraken): update kraken docs link [#20858](https://github.com/ccxt/ccxt/pull/20858)
- feat(bingx): add fetchFundingRates [#20864](https://github.com/ccxt/ccxt/pull/20864)
- Bybit: adjust stop handling for fetchMyTrades, fetchOrders and fetchOpenOrders [#20856](https://github.com/ccxt/ccxt/pull/20856)


## 4.2.16

- feat(binance): add spot/delist-schedule [#20834](https://github.com/ccxt/ccxt/pull/20834)
- fix(binance) - watchtickers multi symbol [#20837](https://github.com/ccxt/ccxt/pull/20837)
- fix(hitbtc) - watchTickers & watchTicker [#20838](https://github.com/ccxt/ccxt/pull/20838)
- fix(kucoin) - watchTickers multi ticker [#20839](https://github.com/ccxt/ccxt/pull/20839)
- fix(poloniex) - watchTickers multi dict [#20841](https://github.com/ccxt/ccxt/pull/20841)
- fix(coinsph) - fetchtrades [#20847](https://github.com/ccxt/ccxt/pull/20847)
- coinlist: add apis [#20848](https://github.com/ccxt/ccxt/pull/20848)


## 4.2.15

- feat(phemex): update orders methods [#20825](https://github.com/ccxt/ccxt/pull/20825)
- feat(bingx): add swap sandbox [#20806](https://github.com/ccxt/ccxt/pull/20806)
- fix(proxy) - undefined & null [#20826](https://github.com/ccxt/ccxt/pull/20826)
- feat(ascendex): fetchBalance - can pass params["marginMode"] [#20830](https://github.com/ccxt/ccxt/pull/20830)
- Bitmex: fix disabled static request tests [#20829](https://github.com/ccxt/ccxt/pull/20829)
- fix(bingx): has["margin"] = false [#20831](https://github.com/ccxt/ccxt/pull/20831)
- feat(coinone): add ws apis [#20824](https://github.com/ccxt/ccxt/pull/20824)
- fix(krakenfutures) - watchTickers multi symbols [#20833](https://github.com/ccxt/ccxt/pull/20833)


## 4.2.14

- HTX: correct the status for partially filled orders [#20822](https://github.com/ccxt/ccxt/pull/20822)
- fix(kraken): takeProfit/stopLoss parsing [#20821](https://github.com/ccxt/ccxt/pull/20821)
- feat(woo): watchPositions, fix #20790 [#20823](https://github.com/ccxt/ccxt/pull/20823)


## 4.2.13

- fix(build) jsdoc2md.js script throws exception for woo and htx exchanges [#20805](https://github.com/ccxt/ccxt/pull/20805)
- feat(kucoinfutures): add fetchFundingRateHistory and createOrders [#20803](https://github.com/ccxt/ccxt/pull/20803)
- feat(delta): remove method usage [#20795](https://github.com/ccxt/ccxt/pull/20795)
- Bitmex: add static request tests [#20809](https://github.com/ccxt/ccxt/pull/20809)
- fetchOHLCV: switch between current and history candles [#20802](https://github.com/ccxt/ccxt/pull/20802)
- fix(bigone): fetchMarkets uses /symbols endpoint [#20808](https://github.com/ccxt/ccxt/pull/20808)
- revert - remove fetch last prices [#20542](https://github.com/ccxt/ccxt/pull/20542)
- fix build: okx static tests [#20812](https://github.com/ccxt/ccxt/pull/20812)
- fix(build): disabled bitmex tests [#20813](https://github.com/ccxt/ccxt/pull/20813)
- fix(kraken): remove reduceOnly [#20819](https://github.com/ccxt/ccxt/pull/20819)
- exchange: stop, stop loss and take profit functions [#20442](https://github.com/ccxt/ccxt/pull/20442)
- fix(tests): import [#20820](https://github.com/ccxt/ccxt/pull/20820)


## 4.2.12

- Htx, Woo: trailing order methods, require trailingTriggerPrice [#20772](https://github.com/ccxt/ccxt/pull/20772)
- feat(bigone): fetchOrderBook - can fetch contract markets [#20769](https://github.com/ccxt/ccxt/pull/20769)
- Binance: update transfer endpoint for isolated margin [#20771](https://github.com/ccxt/ccxt/pull/20771)
- bitmart update fee [#20774](https://github.com/ccxt/ccxt/pull/20774)
- fix(bitget) - trades limit (QUICK) [#20775](https://github.com/ccxt/ccxt/pull/20775)
- fix(coinlist) - max trades limit (QUICK) [#20776](https://github.com/ccxt/ccxt/pull/20776)
- fix(gate) - max trades limit (QUICK) [#20779](https://github.com/ccxt/ccxt/pull/20779)
- fix(gemini) - max trades limit [#20778](https://github.com/ccxt/ccxt/pull/20778)
- fix(probit) - max fetchtrades limit (QUICK) [#20768](https://github.com/ccxt/ccxt/pull/20768)
- fix(coinone) - max trades limit (QUICK) [#20777](https://github.com/ccxt/ccxt/pull/20777)
- fix(kraken) - trades max limit (QUICK) [#20780](https://github.com/ccxt/ccxt/pull/20780)
- lbank: remove method usage [#20770](https://github.com/ccxt/ccxt/pull/20770)
- fix(oceanex) - trades max limit (QUICK) [#20782](https://github.com/ccxt/ccxt/pull/20782)
- feat(okx): add new endpoint [#20783](https://github.com/ccxt/ccxt/pull/20783)
- feat(phemex): update ID [#20781](https://github.com/ccxt/ccxt/pull/20781)
- feat(staticTests): rename huobi to htx [#20785](https://github.com/ccxt/ccxt/pull/20785)
- independentreserve: remove method usage [#20784](https://github.com/ccxt/ccxt/pull/20784)
- transpile: update process num when build parallel [#20658](https://github.com/ccxt/ccxt/pull/20658)
- fix(wavesexchange) - fix trades limit (QUICK) [#20786](https://github.com/ccxt/ccxt/pull/20786)
- fix(IdTests): rename huobi to htx [#20789](https://github.com/ccxt/ccxt/pull/20789)
- fix(kraken): watchOHLCV interval must be passed as integer [#20787](https://github.com/ccxt/ccxt/pull/20787)
- feat(okx) - watchOHLCVForSymbols [#20294](https://github.com/ccxt/ccxt/pull/20294)
- Gate: update parsePosition [#20798](https://github.com/ccxt/ccxt/pull/20798)
- feat(bingx): add fetchMyTrades in spot market [#20801](https://github.com/ccxt/ccxt/pull/20801)
- feat(bigone): fetchTrades, fetchOHLCV - error thrown if fetchTrades or fetchOHLCV called for contract markets [#20793](https://github.com/ccxt/ccxt/pull/20793)
- Coinbase: withdraw [#20796](https://github.com/ccxt/ccxt/pull/20796)
- fix(bitget): historical endpoint until parameter [#20804](https://github.com/ccxt/ccxt/pull/20804)


## 4.2.11

- feat(tests): add assertion key to static messages [#20741](https://github.com/ccxt/ccxt/pull/20741)
- Alpaca Fees Update  [#20740](https://github.com/ccxt/ccxt/pull/20740)
- feat(js) - load modules async [#20685](https://github.com/ccxt/ccxt/pull/20685)
- bybit: add apis [#20758](https://github.com/ccxt/ccxt/pull/20758)
- gate: add apis [#20746](https://github.com/ccxt/ccxt/pull/20746)
- fix(alpaca): updata fees link [#20743](https://github.com/ccxt/ccxt/pull/20743)
- Bitget: fetchOHLCV alternative spot endpoint, add since support [#20730](https://github.com/ccxt/ccxt/pull/20730)
- Okx: fix fetchStatus [#20755](https://github.com/ccxt/ccxt/pull/20755)
- fix(bitfinex): parseTransfer - removed made up timestamp data [#20744](https://github.com/ccxt/ccxt/pull/20744)
- feat(bigone): contract implicit api endpoints, fetchMarkets [#19696](https://github.com/ccxt/ccxt/pull/19696)
- fix(huobijp): createOrder - remove made up timestamp data [#20753](https://github.com/ccxt/ccxt/pull/20753)
- fix(coinlist): fetchBalance - remove made up timestamp data [#20748](https://github.com/ccxt/ccxt/pull/20748)
- fix(hitbtc): transfer - remove made up timestamp data [#20752](https://github.com/ccxt/ccxt/pull/20752)
- fix(gate): transfer - remove made up timestamp data [#20751](https://github.com/ccxt/ccxt/pull/20751)
- fix(coinsph): fetchBalance - remove made up timestamp data [#20749](https://github.com/ccxt/ccxt/pull/20749)
- fix(bitmart): borrowIsolatedMargin/repayIsolatedMargin - remove made up timestamp data [#20747](https://github.com/ccxt/ccxt/pull/20747)
- Binance: update endpoints for borrow margin methods [#20757](https://github.com/ccxt/ccxt/pull/20757)
- fix(bingx): cancel swap orders by client order ids [#20759](https://github.com/ccxt/ccxt/pull/20759)
- fix(closePosition): default error message typo [#20760](https://github.com/ccxt/ccxt/pull/20760)
- feat(binance): add websocket limit to binance watchMultiple [#20745](https://github.com/ccxt/ccxt/pull/20745)
- fix(binance): watchPositions [#20762](https://github.com/ccxt/ccxt/pull/20762)
- exchange: createTrailingAmountOrder, createTrailingPercentOrder [#20754](https://github.com/ccxt/ccxt/pull/20754)
- fix(htx): can place isolated margin orders [#20603](https://github.com/ccxt/ccxt/pull/20603)
- Upbit decimal [#14873](https://github.com/ccxt/ccxt/pull/14873)
- feat(bigone): fetchTicker(s) - fetches contract tickers [#20765](https://github.com/ccxt/ccxt/pull/20765)
- feat(mexc): add ts to orderbook [#20766](https://github.com/ccxt/ccxt/pull/20766)
- fix(Exchange): watchTickers return type [#20763](https://github.com/ccxt/ccxt/pull/20763)
- fix(build): run php static tests [#20767](https://github.com/ccxt/ccxt/pull/20767)


## 4.2.10

- Bybit: fix fetchCurrencies RateLimitExceeded error [#20731](https://github.com/ccxt/ccxt/pull/20731)
- useProxy flag in tests  [#20706](https://github.com/ccxt/ccxt/pull/20706)
- Bitget: createOrder, one way mode orders [#20732](https://github.com/ccxt/ccxt/pull/20732)
- feat(kucoin): add hf support to fetchBalance and fetchLedger [#20733](https://github.com/ccxt/ccxt/pull/20733)
- fix(tests) - useProxy py [#20736](https://github.com/ccxt/ccxt/pull/20736)
- fix(bingx): tp/sl orders parsing [#20738](https://github.com/ccxt/ccxt/pull/20738)


## 4.2.9

- fix(exchange): safemarket with empty delimiter [#20712](https://github.com/ccxt/ccxt/pull/20712)
- fix(kucoin): hf orders parsing [#20720](https://github.com/ccxt/ccxt/pull/20720)
- Deribit: trailing order support [#20673](https://github.com/ccxt/ccxt/pull/20673)
- feat(cryptocom): watchOrderBook using updates and parseOrderBook for CountedOrderBook [#20691](https://github.com/ccxt/ccxt/pull/20691)
- feat(bitmart) - watchtickers for spot and update for swap [#20723](https://github.com/ccxt/ccxt/pull/20723)
- fix(coibnasepro) - watch tickers filter [#20699](https://github.com/ccxt/ccxt/pull/20699)
- feat(binance): provide symbols to spot fetchBidsAsks [#20726](https://github.com/ccxt/ccxt/pull/20726)


## 4.2.8

- fix(binance): watchTickers hotfix [#20710](https://github.com/ccxt/ccxt/pull/20710)
- feat(tests): run static-tests atomatically [#20708](https://github.com/ccxt/ccxt/pull/20708)
- bitmart errors mapping [#20714](https://github.com/ccxt/ccxt/pull/20714)
- fix(bitget) - watch tickers filter [#20695](https://github.com/ccxt/ccxt/pull/20695)
- fix(bybit) - watch tickers filter [#20697](https://github.com/ccxt/ccxt/pull/20697)
- fix(bitmart): watchTickers hot fix [#20711](https://github.com/ccxt/ccxt/pull/20711)


## 4.2.7

- fix(cryptocom): watchOrderBookForSymbols [#20684](https://github.com/ccxt/ccxt/pull/20684)
- Bybit: createOrder, add trailingAmount support [#20671](https://github.com/ccxt/ccxt/pull/20671)
- fix(coinbasepro): fetchTickers - docs no longer reference okx [#20682](https://github.com/ccxt/ccxt/pull/20682)
- fix(poloniex): Pro timeframes [#20689](https://github.com/ccxt/ccxt/pull/20689)
- Okx: trailing orders [#20693](https://github.com/ccxt/ccxt/pull/20693)
- fix(bingx) - nested orders parsing & JSON handling [#20669](https://github.com/ccxt/ccxt/pull/20669)
- fix(php) - reduce huge unnecessary log [#20705](https://github.com/ccxt/ccxt/pull/20705)
- bingx error mapping [#20707](https://github.com/ccxt/ccxt/pull/20707)
- Binance: createOrder, trailingPercent orders [#20672](https://github.com/ccxt/ccxt/pull/20672)
- fix test: disable bingx test [#20709](https://github.com/ccxt/ccxt/pull/20709)


## 4.2.6

- feat(phemex): update id [#20675](https://github.com/ccxt/ccxt/pull/20675)
- fix(php) - clone deep extend [#20676](https://github.com/ccxt/ccxt/pull/20676)
- fix(py) - timeout [#20678](https://github.com/ccxt/ccxt/pull/20678)
- bitmex new endpoints [#20488](https://github.com/ccxt/ccxt/pull/20488)


## 4.2.5

- feat(htx): setPositionMode [#20657](https://github.com/ccxt/ccxt/pull/20657)
- Bitmex: createOrder, editOrder, add trailing support [#20639](https://github.com/ccxt/ccxt/pull/20639)
- feat(bingx): add clientOrderId to cancelOrder [#20666](https://github.com/ccxt/ccxt/pull/20666)
- Woo: createOrder, fetchOrders, editOrder trailing support [#20656](https://github.com/ccxt/ccxt/pull/20656)
- feat(exchange.close()): have exchange.close() close any pending watch functions with an ExchangeClosedByUser error [#20609](https://github.com/ccxt/ccxt/pull/20609)


## 4.2.4

- bybit: add apis [#20636](https://github.com/ccxt/ccxt/pull/20636)
- fix(delta): expired option markets conditional check [#20634](https://github.com/ccxt/ccxt/pull/20634)
- fix(bingx): add spot ticker change and percentage [#20640](https://github.com/ccxt/ccxt/pull/20640)
- update readme [#20642](https://github.com/ccxt/ccxt/pull/20642)
- HTX: fetchOrders, fetchOpenOrders, cancelOrder, cancelAllOrders, trailing support [#20635](https://github.com/ccxt/ccxt/pull/20635)
- alpaca: fix us equity undefined quote [#20632](https://github.com/ccxt/ccxt/pull/20632)
- fix(ws): error handling for watchMultiple, fix #20412 [#20563](https://github.com/ccxt/ccxt/pull/20563)
- fix(Binance,Bingx): cancelOrders ids type [#20645](https://github.com/ccxt/ccxt/pull/20645)
- fix build: disable bitteam [#20647](https://github.com/ccxt/ccxt/pull/20647)
- fix build: disable bitteam [#20650](https://github.com/ccxt/ccxt/pull/20650)
- fix(bingx) - createOrder & fetchOrder ids (long numbers issue) [#20649](https://github.com/ccxt/ccxt/pull/20649)
- fix(build): skip binancecoinm watchOrderbook [#20652](https://github.com/ccxt/ccxt/pull/20652)
- fix(bingx): clientOrderId handling [#20661](https://github.com/ccxt/ccxt/pull/20661)
- phemex error mapping [#20660](https://github.com/ccxt/ccxt/pull/20660)


## 4.2.3

- fix(Exchange): skip proxies loading on the browser [#20621](https://github.com/ccxt/ccxt/pull/20621)
- bybit: add error codes [#20624](https://github.com/ccxt/ccxt/pull/20624)
- Manual: trailing orders [#20623](https://github.com/ccxt/ccxt/pull/20623)
- fix(phemex) - fetchtickers market undefined [#20630](https://github.com/ccxt/ccxt/pull/20630)
- coinsph: remove method usage [#20627](https://github.com/ccxt/ccxt/pull/20627)
- bitmart: add apis [#20628](https://github.com/ccxt/ccxt/pull/20628)
- HTX: trailing percent orders [#20625](https://github.com/ccxt/ccxt/pull/20625)
- feat(okx): add support to privateGetTradeOrdersHistoryArchive [#20633](https://github.com/ccxt/ccxt/pull/20633)


## 4.2.2

- feat(BingxPro): extend listen Key [#20602](https://github.com/ccxt/ccxt/pull/20602)
- feat(Exchanges): add triggerSupport [#20601](https://github.com/ccxt/ccxt/pull/20601)
- fix(alpaca): fetchBalance flag [#20608](https://github.com/ccxt/ccxt/pull/20608)
- Fix python asyncio proxy example [#20607](https://github.com/ccxt/ccxt/pull/20607)
- fix(Bybit): watchTickers [#20610](https://github.com/ccxt/ccxt/pull/20610)
- feat(bingx): unify tp/sl type 3 [#20611](https://github.com/ccxt/ccxt/pull/20611)
- feat(IdTests): add bingx [#20614](https://github.com/ccxt/ccxt/pull/20614)
- feat(bingx): add clientOrderIds to cancelOrders [#20618](https://github.com/ccxt/ccxt/pull/20618)


## 4.2.1

- fix: removed extra zaif file from ts/src [#20582](https://github.com/ccxt/ccxt/pull/20582)
- feat(bingx): swap ticker with change % [#20592](https://github.com/ccxt/ccxt/pull/20592)
- bingx: update cancelAllOrders [#20589](https://github.com/ccxt/ccxt/pull/20589)
- binance error mapping [#20578](https://github.com/ccxt/ccxt/pull/20578)
- bitstamp: remove method usage [#20575](https://github.com/ccxt/ccxt/pull/20575)
- feat(binance): remove method from pro [#20584](https://github.com/ccxt/ccxt/pull/20584)
- poloniexfutures: remove method [#20586](https://github.com/ccxt/ccxt/pull/20586)
- bybit: handleMyTrades remove method usage [#20585](https://github.com/ccxt/ccxt/pull/20585)
- fix(build): disable proxy tests [#20593](https://github.com/ccxt/ccxt/pull/20593)
- disable proxy tests [#20595](https://github.com/ccxt/ccxt/pull/20595)
- lykke: remove method [#20588](https://github.com/ccxt/ccxt/pull/20588)


## 4.1.100

- feat(bitmart): watchOrderBook increase channel [#20531](https://github.com/ccxt/ccxt/pull/20531)
- fix(cex) - test skip [#20569](https://github.com/ccxt/ccxt/pull/20569)
- fix(WsTests): watchMyTrades [#20570](https://github.com/ccxt/ccxt/pull/20570)
- php async & sync [#20568](https://github.com/ccxt/ccxt/pull/20568)
- deribit: remove method usage [#20573](https://github.com/ccxt/ccxt/pull/20573)
- cex: remove method usage [#20574](https://github.com/ccxt/ccxt/pull/20574)
- fix(bitget): OHLCV volume [#20576](https://github.com/ccxt/ccxt/pull/20576)
- build(deps-dev): bump docsify from 4.11.4 to 4.12.2 [#20450](https://github.com/ccxt/ccxt/pull/20450)
- bitget fetchBalance fix for swap [#20558](https://github.com/ccxt/ccxt/pull/20558)
- kucoinfutures reduceOnly parse [#20579](https://github.com/ccxt/ccxt/pull/20579)


## 4.1.99

- fix(kucoin): reset url store when token is expired [#20525](https://github.com/ccxt/ccxt/pull/20525)
- mexc: BEP20 network [#20559](https://github.com/ccxt/ccxt/pull/20559)
- Bitget: fetchOrder, type error [#20560](https://github.com/ccxt/ccxt/pull/20560)
- bit.team integration [#20049](https://github.com/ccxt/ccxt/pull/20049)
- fix(okx): fetchDepositAddressesByNetwork [#20564](https://github.com/ccxt/ccxt/pull/20564)
- fix(bitteam): remove this.number [ci deploy] [#20565](https://github.com/ccxt/ccxt/pull/20565)


## 4.1.98

- fix(exchange): safeOrder trade fees parse to number not string [#20534](https://github.com/ccxt/ccxt/pull/20534)
- fix(watchOHLCVForSymbols): set to false [#20545](https://github.com/ccxt/ccxt/pull/20545)
- feat(binance): add apis [#20547](https://github.com/ccxt/ccxt/pull/20547)
- binance: fetchTrades remove method usage & update static-test [#20466](https://github.com/ccxt/ccxt/pull/20466)
- binance: fetchPositionsRisk remove method usage & update static-test [#20474](https://github.com/ccxt/ccxt/pull/20474)
- binance: fetchAccountPositions remove method usage & update static-test [#20473](https://github.com/ccxt/ccxt/pull/20473)
- binance: fetchOpenInterest remove method usage & update static-test [#20476](https://github.com/ccxt/ccxt/pull/20476)
- binance: fetchLedger remove method usage & update static-test [#20477](https://github.com/ccxt/ccxt/pull/20477)
- binance: fetchOpenInterestHistory remove method usage & update static… [#20480](https://github.com/ccxt/ccxt/pull/20480)
- binance: setPositionMode remove method usage & update static-test [#20478](https://github.com/ccxt/ccxt/pull/20478)
- bitvavo: add clientOrderId [#20506](https://github.com/ccxt/ccxt/pull/20506)
- examples: add lending bot for bitfinex [#20539](https://github.com/ccxt/ccxt/pull/20539)
- Bitget: createOrder, trailingStopPercent support [#20475](https://github.com/ccxt/ccxt/pull/20475)
- Bitmart: createOrder, trailingStopPercent, triggerPrice [#20481](https://github.com/ccxt/ccxt/pull/20481)
- BingX: trailing orders [#20519](https://github.com/ccxt/ccxt/pull/20519)
- Kraken: update trailing stop unification [#20501](https://github.com/ccxt/ccxt/pull/20501)
- feat(Exchange): emulate fetchClosedOrders [#20532](https://github.com/ccxt/ccxt/pull/20532)
- coinex: update apis [#20549](https://github.com/ccxt/ccxt/pull/20549)


## 4.1.97

- bitget parseTrade fix [#20507](https://github.com/ccxt/ccxt/pull/20507)
- binance: transfer remove method usage & update static-test [#20461](https://github.com/ccxt/ccxt/pull/20461)
- binance: fetchFundingRateHistory remove method usage & update static-… [#20463](https://github.com/ccxt/ccxt/pull/20463)
- binance: loadLeverageBrackets remove method usage & update static-test [#20465](https://github.com/ccxt/ccxt/pull/20465)
- binance: fetchFundingRates remove method usage & update static-test [#20464](https://github.com/ccxt/ccxt/pull/20464)
- binance: modifyMarginHelper remove method usage [#20479](https://github.com/ccxt/ccxt/pull/20479)
- binance: fetchFundingHistory remove method usage & update static-test [#20469](https://github.com/ccxt/ccxt/pull/20469)
- fix(bitget): utc timeframes [#20526](https://github.com/ccxt/ccxt/pull/20526)
- WS tests - unification & transpilation [#20153](https://github.com/ccxt/ccxt/pull/20153)
- feat(bingx): closePosition implementation [#20538](https://github.com/ccxt/ccxt/pull/20538)
- BingX: marketType ternary handling [#20536](https://github.com/ccxt/ccxt/pull/20536)
- fix(bitmart): watchOrders, fix #20524 [#20529](https://github.com/ccxt/ccxt/pull/20529)
- fix(phemex): setLeverage - can set leverage to values between -1 to -100 (for cross leverage trading) [#20537](https://github.com/ccxt/ccxt/pull/20537)


## 4.1.96

- Static tests exception handling [#20505](https://github.com/ccxt/ccxt/pull/20505)
- Update Exchange.ts `safeLedgerEntry` [#20509](https://github.com/ccxt/ccxt/pull/20509)
- bingx: add position mode apis [#20523](https://github.com/ccxt/ccxt/pull/20523)
- skipWs - bitrue [#20522](https://github.com/ccxt/ccxt/pull/20522)
- BingX: watchOHLCV, add timestamp for swap markets [#20516](https://github.com/ccxt/ccxt/pull/20516)
- doc: update limit for all exchanges [#20517](https://github.com/ccxt/ccxt/pull/20517)


## 4.1.95

- cryptocom parseTicker fix [#20432](https://github.com/ccxt/ccxt/pull/20432)
- Krakenfutures: createOrder, triggerPrice, stopLossPrice, takeProfitPrice [#20437](https://github.com/ccxt/ccxt/pull/20437)
- fix(bingx): ticker change removal [#20418](https://github.com/ccxt/ccxt/pull/20418)
- python socks proxy - session closing (2) [#20443](https://github.com/ccxt/ccxt/pull/20443)
- binance: remove method usage fetch balance [#20440](https://github.com/ccxt/ccxt/pull/20440)
- Kraken: createOrder, trailing stop orders [#20404](https://github.com/ccxt/ccxt/pull/20404)
- fix(kucoin): protect fetchOrder against undefined order [#20448](https://github.com/ccxt/ccxt/pull/20448)
- fix(gate): correct timestamp property in handleBalance [#20449](https://github.com/ccxt/ccxt/pull/20449)
- fix(gate): fix #20445 - watchPositions with newUpdates false [#20451](https://github.com/ccxt/ccxt/pull/20451)
- docs: fix types [#20452](https://github.com/ccxt/ccxt/pull/20452)
- okx: fix watchMyTrades cost bug [#20482](https://github.com/ccxt/ccxt/pull/20482)
- [WIP] kucoin: add apis [#20467](https://github.com/ccxt/ccxt/pull/20467)
- binance: remove method usage fetch ohlcv [#20453](https://github.com/ccxt/ccxt/pull/20453)
- fix(binance): watchTicker remove default timestamp value of this.milliseconds [#20483](https://github.com/ccxt/ccxt/pull/20483)
- fix(bitmart): fetchTicker remove default timestamp value of this.milliseconds [#20484](https://github.com/ccxt/ccxt/pull/20484)
- bingx error mapping [#20485](https://github.com/ccxt/ccxt/pull/20485)
- binance: remove method usage fetch order [#20454](https://github.com/ccxt/ccxt/pull/20454)
- binance: fetchOrders remove method usage & update static-test [#20455](https://github.com/ccxt/ccxt/pull/20455)
- binance: fetchTradingFees remove method usage & update static-test [#20456](https://github.com/ccxt/ccxt/pull/20456)
- binance: cancelOrder remove method usage & update static-test [#20458](https://github.com/ccxt/ccxt/pull/20458)
- binance: setMarginMode remove method usage [#20472](https://github.com/ccxt/ccxt/pull/20472)
- binance: setLeverage remove method usage & update static-test [#20471](https://github.com/ccxt/ccxt/pull/20471)
- binance: cancelAllOrders remove method usage & update static-test [#20459](https://github.com/ccxt/ccxt/pull/20459)
- binance: fetchFundingRate remove method usage & update static-test [#20462](https://github.com/ccxt/ccxt/pull/20462)
- binance: fetchLeverageTiers remove method usage & update static-test [#20470](https://github.com/ccxt/ccxt/pull/20470)
- fix(python) - set proxy once for WS client [#20494](https://github.com/ccxt/ccxt/pull/20494)
- proxy rework for PHP ws [#20486](https://github.com/ccxt/ccxt/pull/20486)
- fix(bitfinex): watchTicker - removed timestamp data because it wasnt parsed from the response [#20492](https://github.com/ccxt/ccxt/pull/20492)
- fix(bitfinex2,btcbox,kraken): fetchTicker - removed timestamp data because it wasnt parsed from the response [#20490](https://github.com/ccxt/ccxt/pull/20490)
- fix(bit2c): fetchTicker - removed timestamp data because it wasnt parsed from the response [#20489](https://github.com/ccxt/ccxt/pull/20489)
- Delta: closeAllPositions [#20500](https://github.com/ccxt/ccxt/pull/20500)
- kucoin: update cancelallorders [#20497](https://github.com/ccxt/ccxt/pull/20497)
- Coinbase: parseOrder, stop orders [#20499](https://github.com/ccxt/ccxt/pull/20499)
- fix(woo,kraken): watchTicker - removed timestamp data because it wasnt parsed from the response [#20493](https://github.com/ccxt/ccxt/pull/20493)
- fix(cex) - watchOrders removed default timestamp value of this.milliseconds from the response [#20496](https://github.com/ccxt/ccxt/pull/20496)
- binance: fetchOpenOrders remove method usage & update static-test [#20457](https://github.com/ccxt/ccxt/pull/20457)
- binance: fetchMyTrades remove method usage & update static-test [#20460](https://github.com/ccxt/ccxt/pull/20460)
- feat(kucoin): add createMarketBuyOrder methods [#20503](https://github.com/ccxt/ccxt/pull/20503)
- Update transpile.js [#20504](https://github.com/ccxt/ccxt/pull/20504)
- travis: debug statements [#20510](https://github.com/ccxt/ccxt/pull/20510)
- tmp comment python env [#20511](https://github.com/ccxt/ccxt/pull/20511)
- revert push.sh changes [#20512](https://github.com/ccxt/ccxt/pull/20512)


## 4.1.94

- bitget: update fetchOpenOrders [#20438](https://github.com/ccxt/ccxt/pull/20438)


## 4.1.93

- feat(kucoinfutures): add cancelOrder with clientOrderId [#20435](https://github.com/ccxt/ccxt/pull/20435)
- bybit: add apis [#20427](https://github.com/ccxt/ccxt/pull/20427)
- okx: add apis [#20429](https://github.com/ccxt/ccxt/pull/20429)
- coinbase: add apis [#20428](https://github.com/ccxt/ccxt/pull/20428)
- fix build: tmp disable release/changelog [#20434](https://github.com/ccxt/ccxt/pull/20434)


## 4.1.92

- fix: travis release [#20433](https://github.com/ccxt/ccxt/pull/20433)


## 4.1.91

- feat: create release on publish and update changelog [#20388](https://github.com/ccxt/ccxt/pull/20388)
- coinone: update [#20142](https://github.com/ccxt/ccxt/pull/20142)
- fix(bingx): parse swap trades [#20414](https://github.com/ccxt/ccxt/pull/20414)
- fix: bitrue fetch tickers return spot price only for first symbol [#20416](https://github.com/ccxt/ccxt/pull/20416)
- feat(bingx): add snapshot and track used and free balance, fix #20356 [#20370](https://github.com/ccxt/ccxt/pull/20370)
- Bitget: closePosition, closeAllPositions, v2 [#20424](https://github.com/ccxt/ccxt/pull/20424)
- py - proxy session handling [#20422](https://github.com/ccxt/ccxt/pull/20422)
- feat(hitbtc): add closePosition [#20426](https://github.com/ccxt/ccxt/pull/20426)
- Coinbase: createOrder, improve error handling [#20421](https://github.com/ccxt/ccxt/pull/20421)
- Bitget: fetchCanceledAndClosedOrders, call without a symbol [#20423](https://github.com/ccxt/ccxt/pull/20423)
- fix build: skip fetchStatus [#20431](https://github.com/ccxt/ccxt/pull/20431)
- feat(binance): improve fetchTickers spot call [#20430](https://github.com/ccxt/ccxt/pull/20430)


## 4.1.90

- kucoin revert WAXP mapping [#20402](https://github.com/ccxt/ccxt/pull/20402)
- fix(bitmart): watchBalance, fix #20358 [#20391](https://github.com/ccxt/ccxt/pull/20391)
- feat(kucoinfutures): closePosition [#20394](https://github.com/ccxt/ccxt/pull/20394)
- Binance: createMarketOrderWithCost methods [#20387](https://github.com/ccxt/ccxt/pull/20387)
- phemex parseTransactions fixes [#20395](https://github.com/ccxt/ccxt/pull/20395)
- fix(zaif): parseTicker remove timestamp from parsed data [#20405](https://github.com/ccxt/ccxt/pull/20405)


## 4.1.89

- feat(phemex): withdraw method implementation [#19936](https://github.com/ccxt/ccxt/pull/19936)
- fix(bitget): spot fees and response tests [#20377](https://github.com/ccxt/ccxt/pull/20377)
- gate separated repayMargin and borrowMargin separated to repayCrossMa… [#20373](https://github.com/ccxt/ccxt/pull/20373)
- has["repayCrossMargin"] === false, and repayIsolatedMargin [#20375](https://github.com/ccxt/ccxt/pull/20375)
- huobi: remove method [#20368](https://github.com/ccxt/ccxt/pull/20368)
- fix(tests) - proxyUrl test [#20381](https://github.com/ccxt/ccxt/pull/20381)
- example file for `proxyUrl` [#20382](https://github.com/ccxt/ccxt/pull/20382)
- Okcoin: fix market sell orders [#20390](https://github.com/ccxt/ccxt/pull/20390)
- fix(test) - exception output [#20379](https://github.com/ccxt/ccxt/pull/20379)
- binance: patch watchOrders [#20399](https://github.com/ccxt/ccxt/pull/20399)
- Gate: createMarketBuyOrderWithCost [#20389](https://github.com/ccxt/ccxt/pull/20389)
- feat(gate): closePosition [#20398](https://github.com/ccxt/ccxt/pull/20398)
- bitmex.has["closePositions"] == false [#20400](https://github.com/ccxt/ccxt/pull/20400)
- bybit: update fetchMarkets [#20392](https://github.com/ccxt/ccxt/pull/20392)
- Poloniex: update createMarketBuyOrderRequiresPrice [#20384](https://github.com/ccxt/ccxt/pull/20384)
- fix(gate): closePosition test/php side [#20401](https://github.com/ccxt/ccxt/pull/20401)


## 4.1.88

- docs: add full changelog [#20369](https://github.com/ccxt/ccxt/pull/20369)
- feat(cli.ts): add static report option [#20362](https://github.com/ccxt/ccxt/pull/20362)
- fix(package) - exchanges amount [#20348](https://github.com/ccxt/ccxt/pull/20348)
- phemex fetchMarkets v2 [#20334](https://github.com/ccxt/ccxt/pull/20334)
- Tokocrypto: createMarketBuyOrderWithCost [#20363](https://github.com/ccxt/ccxt/pull/20363)
- Coinex: createMarketBuyOrderWithCost check type [#20366](https://github.com/ccxt/ccxt/pull/20366)
- woo: createMarketBuyOrderRequiresPrice [#20365](https://github.com/ccxt/ccxt/pull/20365)
- Bigone: createMarketBuyOrderWithCost check type [#20367](https://github.com/ccxt/ccxt/pull/20367)
- okcoin add margin methods to has as false [#20337](https://github.com/ccxt/ccxt/pull/20337)
- okcoin: createMarketBuyOrderRequiresPrice [#20364](https://github.com/ccxt/ccxt/pull/20364)


## 4.1.87

- fix(proxy) - typo [#20351](https://github.com/ccxt/ccxt/pull/20351)
- gate fetchDepositAddress network support [#20329](https://github.com/ccxt/ccxt/pull/20329)
- Novadax: createMarketBuyOrderWithCost [#20346](https://github.com/ccxt/ccxt/pull/20346)
- bit2c: remove method [#20352](https://github.com/ccxt/ccxt/pull/20352)
- fix(cryptocom): add referral [#20354](https://github.com/ccxt/ccxt/pull/20354)
- okcoin: remove method [#20350](https://github.com/ccxt/ccxt/pull/20350)
- Watch multiple [#20335](https://github.com/ccxt/ccxt/pull/20335)
- Bitmart: trailing stop orders [#20342](https://github.com/ccxt/ccxt/pull/20342)
- Fix build and coinbasepro [#20357](https://github.com/ccxt/ccxt/pull/20357)
- fix(coinbasepro): remove import [#20359](https://github.com/ccxt/ccxt/pull/20359)
- fix(binancePro): snapshot messageHash [ci deploy] [#20360](https://github.com/ccxt/ccxt/pull/20360)
- Cryptocom: createMarketBuyOrderRequiresPrice [#20345](https://github.com/ccxt/ccxt/pull/20345)
- Bitget: update to v2 [#19996](https://github.com/ccxt/ccxt/pull/19996)


## 4.1.86

- delist bittrex shutdown [#20338](https://github.com/ccxt/ccxt/pull/20338)
- delist coinbasepro [#20339](https://github.com/ccxt/ccxt/pull/20339)
- fix(Pro): add return type [#20330](https://github.com/ccxt/ccxt/pull/20330)
- Revert "delist-coinbasepro" [#20340](https://github.com/ccxt/ccxt/pull/20340)
- delist coinbasepro and coinbaseprime [#20341](https://github.com/ccxt/ccxt/pull/20341)
- fix(ccxt.ts): delist coinbaseprime and coinbasepro [#20343](https://github.com/ccxt/ccxt/pull/20343)
- Upbit: createMarketBuyOrderWithCost [#20325](https://github.com/ccxt/ccxt/pull/20325)


## 4.1.85

- feat:add eslint for jsdocs [#20313](https://github.com/ccxt/ccxt/pull/20313)
- Socks proxy support for Websockets  [#20319](https://github.com/ccxt/ccxt/pull/20319)
- Probit: createMarketBuyOrderWithCost [#20324](https://github.com/ccxt/ccxt/pull/20324)
- mexc: remove method usage [#20318](https://github.com/ccxt/ccxt/pull/20318)
- kucoin delete delisted and renamed aliases [#20328](https://github.com/ccxt/ccxt/pull/20328)
- feat(bitmex): watchPositions && parsePosition fix [#20268](https://github.com/ccxt/ccxt/pull/20268)
- tokocrypto: remove method usage [#20326](https://github.com/ccxt/ccxt/pull/20326)
- digifinex: remove method usage [#20327](https://github.com/ccxt/ccxt/pull/20327)
- fix build: skip bit2c orderbook test [#20332](https://github.com/ccxt/ccxt/pull/20332)
- fix(bit2c) - orderbook test [#20333](https://github.com/ccxt/ccxt/pull/20333)


## 4.1.84

- bingx: update fetchOpenOrders symbol become optional parameter [#20314](https://github.com/ccxt/ccxt/pull/20314)
- Fix several method definitions  [#20322](https://github.com/ccxt/ccxt/pull/20322)
- feat(bitmart): add websocket support for futures, and spot watchBalance [#20217](https://github.com/ccxt/ccxt/pull/20217)


## 4.1.83

- Binance: sign, origclientorderidlist length [#20306](https://github.com/ccxt/ccxt/pull/20306)
- Htx: createMarketBuyOrderWithCost [#20298](https://github.com/ccxt/ccxt/pull/20298)
- Coinsph: createMarketBuyOrderWithCost [#20305](https://github.com/ccxt/ccxt/pull/20305)
- fix(bybit): fetchPositions exchange id handling [#20312](https://github.com/ccxt/ccxt/pull/20312)


## 4.1.82

- docs(closePosition, closeAllPositions) [#20275](https://github.com/ccxt/ccxt/pull/20275)
- Cex: createMarketBuyOrderWithCost [#20300](https://github.com/ccxt/ccxt/pull/20300)
- Cryptocom close position [#20279](https://github.com/ccxt/ccxt/pull/20279)
- docs: unique link in spec for each header [#20123](https://github.com/ccxt/ccxt/pull/20123)
- fix docs build errors [#20302](https://github.com/ccxt/ccxt/pull/20302)
- docs: fix scrolling [#20303](https://github.com/ccxt/ccxt/pull/20303)
- Okx close position [#20265](https://github.com/ccxt/ccxt/pull/20265)


## 4.1.81

- fix(exchanges) - broken links updates (QUICK) [#20295](https://github.com/ccxt/ccxt/pull/20295)
- example: add watchTickers [#20289](https://github.com/ccxt/ccxt/pull/20289)
- Lbank: createMarketBuyOrderWithCost [#20290](https://github.com/ccxt/ccxt/pull/20290)
- htx cross swap balance parse [#20255](https://github.com/ccxt/ccxt/pull/20255)
- okx: remove method usage [#20272](https://github.com/ccxt/ccxt/pull/20272)
- coinex: remove method usage [#20296](https://github.com/ccxt/ccxt/pull/20296)
- Lbank: update documentation links [#20291](https://github.com/ccxt/ccxt/pull/20291)
- Manual: fetchGreeks description [#20299](https://github.com/ccxt/ccxt/pull/20299)


## 4.1.80

- whitebit: update apis [#20292](https://github.com/ccxt/ccxt/pull/20292)
- examples: rename variable symbol [#20288](https://github.com/ccxt/ccxt/pull/20288)
- bybit: add quick repay api [#20286](https://github.com/ccxt/ccxt/pull/20286)
- Digifinex: createMarketBuyOrderWithCost [#20287](https://github.com/ccxt/ccxt/pull/20287)
- fix(bybit): fetchTickers [#20293](https://github.com/ccxt/ccxt/pull/20293)


## 4.1.79

- the report for static tests gives a directory that exists [#20280](https://github.com/ccxt/ccxt/pull/20280)
- woo: add insuranceFund [#20276](https://github.com/ccxt/ccxt/pull/20276)
- fixed spot/swap symbol error [#20282](https://github.com/ccxt/ccxt/pull/20282)
- fix(bitget): improve docs [#20283](https://github.com/ccxt/ccxt/pull/20283)
- bingx: update transaction status [#20277](https://github.com/ccxt/ccxt/pull/20277)
- currencycom: remove method usage [#20273](https://github.com/ccxt/ccxt/pull/20273)
- probit fetchCurrencies fee fix [#20264](https://github.com/ccxt/ccxt/pull/20264)
- mexc update rateLimits [#20263](https://github.com/ccxt/ccxt/pull/20263)


## 4.1.78

- fix(bingx) - percent sign [#20267](https://github.com/ccxt/ccxt/pull/20267)
- coinbase: add apis [#20270](https://github.com/ccxt/ccxt/pull/20270)
- cryptocom: add apis [#20271](https://github.com/ccxt/ccxt/pull/20271)
- fix(ClientTrait.php): fix warning for unused code [#20269](https://github.com/ccxt/ccxt/pull/20269)


## 4.1.77

- feat(okx): support trigger parameter [#20244](https://github.com/ccxt/ccxt/pull/20244)
- bingx.has closeAllPosition -> closeAllPositions [#20246](https://github.com/ccxt/ccxt/pull/20246)
- feat(bitget) - closeAllPositions [#20245](https://github.com/ccxt/ccxt/pull/20245)
- fix(okx) - removal of incorrect map (QUICK) [#20248](https://github.com/ccxt/ccxt/pull/20248)
- gate: update apis [#20219](https://github.com/ccxt/ccxt/pull/20219)
- fix(gate): change watchTicker optionName to 'name' [#20249](https://github.com/ccxt/ccxt/pull/20249)
- Mexc: createMarketBuyOrderWithCost  [#20250](https://github.com/ccxt/ccxt/pull/20250)
- okx: add monthly statement api [#20253](https://github.com/ccxt/ccxt/pull/20253)
- binance: add sor.order.test [#20252](https://github.com/ccxt/ccxt/pull/20252)
- bybit: update broker apis [#20251](https://github.com/ccxt/ccxt/pull/20251)
- hitbtc: update apis [#20254](https://github.com/ccxt/ccxt/pull/20254)
- fix(binanceus): missing override [#20256](https://github.com/ccxt/ccxt/pull/20256)
- idex: remove method [#20186](https://github.com/ccxt/ccxt/pull/20186)
- upbit: remove method usage [#20107](https://github.com/ccxt/ccxt/pull/20107)
- fix(bingx): percentage parsing [#20261](https://github.com/ccxt/ccxt/pull/20261)
- closePosition change return type [#20262](https://github.com/ccxt/ccxt/pull/20262)
- feat(coinbase): infer fee currency [#20260](https://github.com/ccxt/ccxt/pull/20260)
- docs(bitmart,coinmate) fetchIsolatedBorrowRate docstring fixes [#20258](https://github.com/ccxt/ccxt/pull/20258)


## 4.1.76

- fix(gate): add 2h tf [#20232](https://github.com/ccxt/ccxt/pull/20232)
- Bitstamp: fetchOHLCV end time calculation [#20234](https://github.com/ccxt/ccxt/pull/20234)
- fix(bitmex) - empty numbers [#20239](https://github.com/ccxt/ccxt/pull/20239)
- Bitrue: createMarketBuyOrderWithCost [#20235](https://github.com/ccxt/ccxt/pull/20235)
- fix(examples): fix exchange capabilities to sort by certified and include pro [#20208](https://github.com/ccxt/ccxt/pull/20208)
- Bingx close all positions [#20241](https://github.com/ccxt/ccxt/pull/20241)
- Coinbase: createMarketBuyOrderWithCost [#20237](https://github.com/ccxt/ccxt/pull/20237)
- fix(okx) - ratelimit [#20231](https://github.com/ccxt/ccxt/pull/20231)


## 4.1.75

- fix(client.php): fix check for binary and non printable characters [#20210](https://github.com/ccxt/ccxt/pull/20210)
- fix(bingx): add base Fees [#20215](https://github.com/ccxt/ccxt/pull/20215)
- binance: add apis [#20218](https://github.com/ccxt/ccxt/pull/20218)
- okx: add apis, update rate limit [#20220](https://github.com/ccxt/ccxt/pull/20220)
- Bingx close all positions [#20212](https://github.com/ccxt/ccxt/pull/20212)
- feat(exchange): new methods closePosition and closeAllPositions [#20182](https://github.com/ccxt/ccxt/pull/20182)
- Close positions false [#20211](https://github.com/ccxt/ccxt/pull/20211)
- fix(errors) - inheritance fix [#20228](https://github.com/ccxt/ccxt/pull/20228)
- remove debug from proxies [#20226](https://github.com/ccxt/ccxt/pull/20226)
- cryptocom: remove transfer & fetchtransfer [#20221](https://github.com/ccxt/ccxt/pull/20221)


## 4.1.74

- fix(poloniex): skip undefined chains [#20199](https://github.com/ccxt/ccxt/pull/20199)
- fix(exchange): paginatedCursor sort by descending timestamp [#20191](https://github.com/ccxt/ccxt/pull/20191)
- BingX: create market order with cost methods [#20185](https://github.com/ccxt/ccxt/pull/20185)
- fix(gate): add account section [#20200](https://github.com/ccxt/ccxt/pull/20200)
- Bigone: createMarketBuyOrderRequiresPrice [#20171](https://github.com/ccxt/ccxt/pull/20171)
- feat(kraken): add pagination to fetchWithdrawals [#20192](https://github.com/ccxt/ccxt/pull/20192)
- docs: add unified networks reference [#20202](https://github.com/ccxt/ccxt/pull/20202)
- Bitmart: standardize createMarketBuyOrderRequiresPrice [#20194](https://github.com/ccxt/ccxt/pull/20194)
- fix(coinbasepro): watchOrdersForSymbols loadMarkets before checking market symbols [#20203](https://github.com/ccxt/ccxt/pull/20203)
- feat(binance): add watchOrdersForSymbols, #20201 [#20205](https://github.com/ccxt/ccxt/pull/20205)
- feat(exchange): fetchPaginatedCallCursor add break condition for since [#20206](https://github.com/ccxt/ccxt/pull/20206)
- fix(Client.ts): only decompress binary messages [#20209](https://github.com/ccxt/ccxt/pull/20209)
- Fix build kraken [#20213](https://github.com/ccxt/ccxt/pull/20213)


## 4.1.73

- Bybit: createMarketBuyOrderRequiresPrice [#20170](https://github.com/ccxt/ccxt/pull/20170)
- Okx: standardize createMarketBuyOrderRequiresPrice [#20172](https://github.com/ccxt/ccxt/pull/20172)
- exmo: update apis [#20184](https://github.com/ccxt/ccxt/pull/20184)
- docs: add tabs and divide languages into tabs [#20133](https://github.com/ccxt/ccxt/pull/20133)
- feat(cex): add ws trading [#18759](https://github.com/ccxt/ccxt/pull/18759)
- feat(kraken): add implicit endpoints for withdrawMethods and withdrawAddreses [#20190](https://github.com/ccxt/ccxt/pull/20190)
- Exchange class, create market order with cost methods [#20193](https://github.com/ccxt/ccxt/pull/20193)


## 4.1.72

- latoken: remove method [#20187](https://github.com/ccxt/ccxt/pull/20187)
- fix(exchange): fetchDeposits and fetchWithdrawals first argument is code instead of symbol [#20183](https://github.com/ccxt/ccxt/pull/20183)


## 4.1.71

- fix(binance): skip positions cache on spot balance [#20174](https://github.com/ccxt/ccxt/pull/20174)
- Mexc: createSpotOrderRequest side [#20167](https://github.com/ccxt/ccxt/pull/20167)
- bingx parseOrder fee fix [#20158](https://github.com/ccxt/ccxt/pull/20158)
- bundle: add rollup node resolve plugin [#20152](https://github.com/ccxt/ccxt/pull/20152)
- fix appveyor: bump node [#20176](https://github.com/ccxt/ccxt/pull/20176)
- gate transaction statuses [#20177](https://github.com/ccxt/ccxt/pull/20177)
- Coinex: createMarketBuyOrderRequiresPrice [#20169](https://github.com/ccxt/ccxt/pull/20169)


## 4.1.70

- binance: patch watchOrders [#20163](https://github.com/ccxt/ccxt/pull/20163)
- Feat: Add a Binance Implicit Api Entry [#20165](https://github.com/ccxt/ccxt/pull/20165)
- gate: remove method [#20155](https://github.com/ccxt/ccxt/pull/20155)
- coinbase: add apis [#20168](https://github.com/ccxt/ccxt/pull/20168)


## 4.1.69

- Coinex: createOrders, cancelOrders [#20162](https://github.com/ccxt/ccxt/pull/20162)


## 4.1.68

- python: only add tox requirement for qa [#20149](https://github.com/ccxt/ccxt/pull/20149)
- ascendex: remove method [#20154](https://github.com/ccxt/ccxt/pull/20154)
- fix(cli.ts, cli.js): small numbers parse numbers, large numbers keep as string [#20157](https://github.com/ccxt/ccxt/pull/20157)
- tests - run method oriented test & fix python tests [#20118](https://github.com/ccxt/ccxt/pull/20118)
- PY fixes & test [#20159](https://github.com/ccxt/ccxt/pull/20159)
- kuna - temproary skip [#20160](https://github.com/ccxt/ccxt/pull/20160)
- phemex new endpoints [#20161](https://github.com/ccxt/ccxt/pull/20161)


## 4.1.67

- fix(exchange): watch_positions_for_symbols returning coroutine error [#20136](https://github.com/ccxt/ccxt/pull/20136)
- fix(binance):watchTrades for future without defaultType and subtype defined [#20137](https://github.com/ccxt/ccxt/pull/20137)
- Gate - borrow & repay for margin [#20124](https://github.com/ccxt/ccxt/pull/20124)
- Remove dynamic pros [#20145](https://github.com/ccxt/ccxt/pull/20145)
- gate remove commonCurrencies [#20146](https://github.com/ccxt/ccxt/pull/20146)
- fix(transpile): add missing functions [#20148](https://github.com/ccxt/ccxt/pull/20148)
- exchange: patch safeTicker [#20151](https://github.com/ccxt/ccxt/pull/20151)


## 4.1.66

- feat(coinbase): increase balance limit and stastic tests [#20130](https://github.com/ccxt/ccxt/pull/20130)
- fix(bingx): copyTrading api [#20135](https://github.com/ccxt/ccxt/pull/20135)
- base - add `subType` in markets [#18425](https://github.com/ccxt/ccxt/pull/18425)


## 4.1.65

- fix(gate): conflicting markets handling [#20129](https://github.com/ccxt/ccxt/pull/20129)
- proxy unification for WebSockets & reorganize for REST [#19360](https://github.com/ccxt/ccxt/pull/19360)


## 4.1.64

- bitmart: remove method usage [#20113](https://github.com/ccxt/ccxt/pull/20113)
- mexc: add internal transfer api [#20114](https://github.com/ccxt/ccxt/pull/20114)
- bitmex fetchMarkets docstrings [#20116](https://github.com/ccxt/ccxt/pull/20116)
- fix(exchanges) - remove exchange name from params [#20091](https://github.com/ccxt/ccxt/pull/20091)
- fix!(cryptocom): fetchPositions response returns numContracts as an absolute value, and also returns side [#20117](https://github.com/ccxt/ccxt/pull/20117)
- fix(bybit): tickers handling [#20119](https://github.com/ccxt/ccxt/pull/20119)
- fix(luno): remove await from this.checkRequiredCredentials (); [#20120](https://github.com/ccxt/ccxt/pull/20120)
- fix(PHP): array type [#20126](https://github.com/ccxt/ccxt/pull/20126)


## 4.1.63

- phemex: update apis [#20102](https://github.com/ccxt/ccxt/pull/20102)
- fix(krakenfutures): add use of safebalance and edit docs [#20105](https://github.com/ccxt/ccxt/pull/20105)
- kraken: update doc [#20106](https://github.com/ccxt/ccxt/pull/20106)
- krakenfutures: remove method usage [#20108](https://github.com/ccxt/ccxt/pull/20108)
- wazirx: remove method usage [#20109](https://github.com/ccxt/ccxt/pull/20109)
- tokocrypto: remove method usage [#20110](https://github.com/ccxt/ccxt/pull/20110)
- binanceus margin,swap,future,option:has [#20111](https://github.com/ccxt/ccxt/pull/20111)
- luno: remove method usage [#20112](https://github.com/ccxt/ccxt/pull/20112)


## 4.1.62

- alpaca: update apis [#20099](https://github.com/ccxt/ccxt/pull/20099)
- binance: update apis [#20100](https://github.com/ccxt/ccxt/pull/20100)
- feat(poloniex): createOrderWs, cancelOrderWs, cancelOrdersWs, cancelAllOrdersWs [#19969](https://github.com/ccxt/ccxt/pull/19969)
- kucoinfutures: remove test api [#20101](https://github.com/ccxt/ccxt/pull/20101)
- kucoinfutures: remove method [#20104](https://github.com/ccxt/ccxt/pull/20104)


## 4.1.61

- fix(exchange): patch fee update by reference [#20094](https://github.com/ccxt/ccxt/pull/20094)
- bitrue: integrate swap [#19757](https://github.com/ccxt/ccxt/pull/19757)
- fix(manual) - about margin [#20098](https://github.com/ccxt/ccxt/pull/20098)
- container: replace python3 setup with pip3 install [#20057](https://github.com/ccxt/ccxt/pull/20057)
- docs: group api spec by method [#20084](https://github.com/ccxt/ccxt/pull/20084)


## 4.1.60

- Several small fixes [#20081](https://github.com/ccxt/ccxt/pull/20081)
- rename fetch positions "by symbol" into "for symbol" [#20077](https://github.com/ccxt/ccxt/pull/20077)
- bitrue withdraw network param [#20080](https://github.com/ccxt/ccxt/pull/20080)
- coinbase: update [#20082](https://github.com/ccxt/ccxt/pull/20082)
- binance: add api [#20087](https://github.com/ccxt/ccxt/pull/20087)
- fix(gate) - transfer settle id [#20088](https://github.com/ccxt/ccxt/pull/20088)
- Update okx python examples [#20086](https://github.com/ccxt/ccxt/pull/20086)
- feat(transpile): always force transpilation when transpiling a single… [#20089](https://github.com/ccxt/ccxt/pull/20089)
- fix(bybitWs): watchTickers [#20090](https://github.com/ccxt/ccxt/pull/20090)
- alpaca: update apis [#19985](https://github.com/ccxt/ccxt/pull/19985)
- fix(build): skip paymium and alpaca [#20093](https://github.com/ccxt/ccxt/pull/20093)


## 4.1.59

- fix(htx): watchOrderBook out of sync nonce [#20072](https://github.com/ccxt/ccxt/pull/20072)
- kucoin: update apis [#20071](https://github.com/ccxt/ccxt/pull/20071)
- binance: add apis [#20073](https://github.com/ccxt/ccxt/pull/20073)
- docs(examples): Add next js example [#20055](https://github.com/ccxt/ccxt/pull/20055)
- mexc network update [#20069](https://github.com/ccxt/ccxt/pull/20069)
- feat(okx) - fetchPositionsForSymbol [#16769](https://github.com/ccxt/ccxt/pull/16769)
- coinbasepro: add @see [#20078](https://github.com/ccxt/ccxt/pull/20078)


## 4.1.58

- fix(bybit) - trigger order direction & tests [#20048](https://github.com/ccxt/ccxt/pull/20048)
- mexc.has: non-watch ws methods [#20060](https://github.com/ccxt/ccxt/pull/20060)
- htx.has: non-watch ws methods [#20061](https://github.com/ccxt/ccxt/pull/20061)
- bybit.has: non-watch ws methods [#20062](https://github.com/ccxt/ccxt/pull/20062)
- bitvavo.has: ws non-watch methods [#20063](https://github.com/ccxt/ccxt/pull/20063)
- kucoin.has: ws non-watch methods [#20064](https://github.com/ccxt/ccxt/pull/20064)
- fix(htx): fix lowercaseBaseId error [#20067](https://github.com/ccxt/ccxt/pull/20067)
- bitget.has: ws non-watch methods [#20065](https://github.com/ccxt/ccxt/pull/20065)
- bitmart.has: ws non-watch methods [#20066](https://github.com/ccxt/ccxt/pull/20066)
- fix(docs) - trigger orders, stop loss orders, and some reorganisations [#20068](https://github.com/ccxt/ccxt/pull/20068)
- feat(exchange): `okex, huobipro, gateio, mexc3`  - removal of old aliases [#17960](https://github.com/ccxt/ccxt/pull/17960)
- feat(exchange): depreciate borrowMargin for borrowIsolatedMargin and borrowCrossMargin [#20053](https://github.com/ccxt/ccxt/pull/20053)


## 4.1.57

- fix(Client.ts): fix error code for browser websocket close [#20054](https://github.com/ccxt/ccxt/pull/20054)
- Bitmart: fetchOHLCV endpoint ratelimit weights [#20056](https://github.com/ccxt/ccxt/pull/20056)
- bittrex.has ws non-watch methods [#20058](https://github.com/ccxt/ccxt/pull/20058)
- fix(cli): fix cli.js and cli.ts for parsing large numbers [#20012](https://github.com/ccxt/ccxt/pull/20012)


## 4.1.56

- kucoin: remove method usage [#20015](https://github.com/ccxt/ccxt/pull/20015)
- fix(statictTests): kucoin php [#20025](https://github.com/ccxt/ccxt/pull/20025)
- krakenfutures.has order methods [#19976](https://github.com/ccxt/ccxt/pull/19976)
- bybit: add apis [#20018](https://github.com/ccxt/ccxt/pull/20018)
- bitget: remove after when use spot pair (represent order id) [#20009](https://github.com/ccxt/ccxt/pull/20009)
- fix(bitvavo): patch fetchMarkets [#20024](https://github.com/ccxt/ccxt/pull/20024)
-  static tests & base & binance bugfixes [#20020](https://github.com/ccxt/ccxt/pull/20020)
- feat(crpytocom): add response static tests [#20031](https://github.com/ccxt/ccxt/pull/20031)
- Bitmart: adjusted some ratelimit weights [#20030](https://github.com/ccxt/ccxt/pull/20030)
- fix(coinbase): price precision, fix #20026 [#20032](https://github.com/ccxt/ccxt/pull/20032)
- Replaced borrow rate methods [#20017](https://github.com/ccxt/ccxt/pull/20017)
- Types stuff [#20029](https://github.com/ccxt/ccxt/pull/20029)
- feat(krakenfutures): add ws error handling [#20033](https://github.com/ccxt/ccxt/pull/20033)
- Response tests fix and travis update [#20035](https://github.com/ccxt/ccxt/pull/20035)
- docs: udpate links from wiki to docs [#20007](https://github.com/ccxt/ccxt/pull/20007)
- fix(gate): take into position left when calculating liquidation size [#19855](https://github.com/ccxt/ccxt/pull/19855)
- remove check required symbols [#20040](https://github.com/ccxt/ccxt/pull/20040)
- crypto.com removed endpoints [#20042](https://github.com/ccxt/ccxt/pull/20042)
- Hitbtc ws order methods [#20027](https://github.com/ccxt/ccxt/pull/20027)
- fix(template): return error code [#20045](https://github.com/ccxt/ccxt/pull/20045)
- fix(hitbtc): php marginMode parameter [#20050](https://github.com/ccxt/ccxt/pull/20050)
- bitmex - `triggerPrice` unification and static tests [#19939](https://github.com/ccxt/ccxt/pull/19939)
- fix(setup): typing extensions version [#20052](https://github.com/ccxt/ccxt/pull/20052)


## 4.1.55

- exmo - static tests [#20004](https://github.com/ccxt/ccxt/pull/20004)
- fix: tox.ini and add support for 3.10 and 3.11 [#19873](https://github.com/ccxt/ccxt/pull/19873)
- fix(exmo): static test trx not found [#20010](https://github.com/ccxt/ccxt/pull/20010)
- fix(p2b): logo [ci skip] [#20022](https://github.com/ccxt/ccxt/pull/20022)
- okx: add apis [#20021](https://github.com/ccxt/ccxt/pull/20021)
- bitbank: add apis [#20016](https://github.com/ccxt/ccxt/pull/20016)
- htx: add apis [#20019](https://github.com/ccxt/ccxt/pull/20019)
- Okx: createOrder, postOnly, stopLoss and takeProfit [#20013](https://github.com/ccxt/ccxt/pull/20013)
- Bitmart: parseOrderStatusByType [#20011](https://github.com/ccxt/ccxt/pull/20011)


## 4.1.54

- coinbase: add apis [#19992](https://github.com/ccxt/ccxt/pull/19992)
- binance: update [#19993](https://github.com/ccxt/ccxt/pull/19993)
- add support for variable type hinting [#19990](https://github.com/ccxt/ccxt/pull/19990)
- Bingx - Typo [#19998](https://github.com/ccxt/ccxt/pull/19998)
- Bitvavo - Static tests [#19997](https://github.com/ccxt/ccxt/pull/19997)
- fix(errors) - move `OperationFailed` exception to root [#19987](https://github.com/ccxt/ccxt/pull/19987)
- feat(StaticTests): add Response tests and offline currencies [#19967](https://github.com/ccxt/ccxt/pull/19967)
- bitmex - fetchDepositWithdrawFee(s) misnaming [#20001](https://github.com/ccxt/ccxt/pull/20001)
- coinex - fetchDepositWithdrawFee(s) misnaming [#20002](https://github.com/ccxt/ccxt/pull/20002)


## 4.1.53

- Update build-ohlcv-many-symbols.py [#19902](https://github.com/ccxt/ccxt/pull/19902)
- fix(bitget): marginMode handling [#19983](https://github.com/ccxt/ccxt/pull/19983)
- feat(p2b): New Exchange [#19807](https://github.com/ccxt/ccxt/pull/19807)
- Bitget: add V2 endpoints, edit V1 endpoints [ci deploy] [#19978](https://github.com/ccxt/ccxt/pull/19978)
- base & examples - build bars using WebSockets live data [ci deploy] [#19760](https://github.com/ccxt/ccxt/pull/19760)
- strict null type checks [#19989](https://github.com/ccxt/ccxt/pull/19989)


## 4.1.52

- delist-bitstamp1 [#19973](https://github.com/ccxt/ccxt/pull/19973)
- make default version of lbank v2 [#19974](https://github.com/ccxt/ccxt/pull/19974)
- bybit: update [#19971](https://github.com/ccxt/ccxt/pull/19971)
- bybit: add missing apis [#19977](https://github.com/ccxt/ccxt/pull/19977)
- cryptocom error mapping [#19980](https://github.com/ccxt/ccxt/pull/19980)
- poloniexfutures.has rest ws methods [#19975](https://github.com/ccxt/ccxt/pull/19975)
- Digifinex: createOrders python sign error [#19972](https://github.com/ccxt/ccxt/pull/19972)
- bingx fixes [#19958](https://github.com/ccxt/ccxt/pull/19958)


## 4.1.51

- feat(examples): add jupyter notebook example [#19945](https://github.com/ccxt/ccxt/pull/19945)
- delist-btctradeua [#19949](https://github.com/ccxt/ccxt/pull/19949)
- delist-coinfalcon [#19948](https://github.com/ccxt/ccxt/pull/19948)
- docs: add logos to socials, add socials to docs [#19946](https://github.com/ccxt/ccxt/pull/19946)
- [WIP] kucoin: update fetchOrderBook [#19937](https://github.com/ccxt/ccxt/pull/19937)
- coinbase: patch parse trade [#19952](https://github.com/ccxt/ccxt/pull/19952)
- feat(bitmart): add 53007exception [#19942](https://github.com/ccxt/ccxt/pull/19942)
- fix(python): fee type [#19959](https://github.com/ccxt/ccxt/pull/19959)
- fix(probit): remove fetchMarkets type [#19960](https://github.com/ccxt/ccxt/pull/19960)
- fix(probit): remove market import [#19961](https://github.com/ccxt/ccxt/pull/19961)
- base: remove delist exchanges [#19957](https://github.com/ccxt/ccxt/pull/19957)
- fix(binance): parseWsPosition symbol [ci deploy] [#19962](https://github.com/ccxt/ccxt/pull/19962)
- createOrders, fix implementations that use marginMode, add static tests [#19953](https://github.com/ccxt/ccxt/pull/19953)
- fix(binance): watchPositions default to type future and use standard handleMarketTypeAndParams function [#19951](https://github.com/ccxt/ccxt/pull/19951)
- Bybit: enable stopLoss and takeProfit with trigger orders [#19950](https://github.com/ccxt/ccxt/pull/19950)
- fix(static): disable batchOrders test [#19965](https://github.com/ccxt/ccxt/pull/19965)
- coinbase websocket order methods has [#19964](https://github.com/ccxt/ccxt/pull/19964)
- Bitget: add error AccountSuspended for "The account has been cancelled and cannot be used again" [#19963](https://github.com/ccxt/ccxt/pull/19963)
- fix(build): skip probit check and bitvavo [#19968](https://github.com/ccxt/ccxt/pull/19968)
- bitvavo: update fetchMarkets [#19956](https://github.com/ccxt/ccxt/pull/19956)
- docs: add awesome section to showcase projects using ccxt [#19947](https://github.com/ccxt/ccxt/pull/19947)


## 4.1.50

- kraken: add start in fetchDeposits [#19935](https://github.com/ccxt/ccxt/pull/19935)
- fix(krakenfutures): patch watchOrders [#19934](https://github.com/ccxt/ccxt/pull/19934)
- feat(coinex): add idTest [#19933](https://github.com/ccxt/ccxt/pull/19933)


## 4.1.49

- New unified method: fetchGreeks [#19908](https://github.com/ccxt/ccxt/pull/19908)
- feat(gate): edit swap orders [#19930](https://github.com/ccxt/ccxt/pull/19930)
- htx: createOrders [#19923](https://github.com/ccxt/ccxt/pull/19923)
- fix(bit2c) - skip temporarily [#19932](https://github.com/ccxt/ccxt/pull/19932)


## 4.1.48

- fix(mexc): patch withdraw [#19926](https://github.com/ccxt/ccxt/pull/19926)


## 4.1.47

- binance: add apis [#19918](https://github.com/ccxt/ccxt/pull/19918)
- update cli.ts to be same as cli.js [#19919](https://github.com/ccxt/ccxt/pull/19919)
- feat(bitmart): add id and swap orders [#19916](https://github.com/ccxt/ccxt/pull/19916)
- fix build: coinspot [#19925](https://github.com/ccxt/ccxt/pull/19925)
- kraken: update jsdoc [#19921](https://github.com/ccxt/ccxt/pull/19921)


## 4.1.46

- Bitmart: change the fetchOHLCV endpoint [#19903](https://github.com/ccxt/ccxt/pull/19903)
- feat: add type hints to method call signatures [#19906](https://github.com/ccxt/ccxt/pull/19906)
- fix(kuna) - skip [#19901](https://github.com/ccxt/ccxt/pull/19901)
- fix(krakenfutures): fix error handling and fix #19896 [#19907](https://github.com/ccxt/ccxt/pull/19907)
- Manual: add number of contracts explanation to notes on createOrder [ci skip] [#19909](https://github.com/ccxt/ccxt/pull/19909)
- binance: add apis [#19915](https://github.com/ccxt/ccxt/pull/19915)
- hitbtc: add fetchMarginMode [#19898](https://github.com/ccxt/ccxt/pull/19898)


## 4.1.45

- Okx: add static tests, adjust posSide logic [#19889](https://github.com/ccxt/ccxt/pull/19889)
- fix(bitvavo): amount precision for markets defaults to the precision of the base currency instead of 8 [#19899](https://github.com/ccxt/ccxt/pull/19899)
- bybit parseSpotTrade fee fix [#19796](https://github.com/ccxt/ccxt/pull/19796)
- feat(Exchange): add watchPositions [ci deploy] [#15622](https://github.com/ccxt/ccxt/pull/15622)


## 4.1.44

- hitbtc: update apis [#19848](https://github.com/ccxt/ccxt/pull/19848)
- fix(tests)  - remove unused imports [#19882](https://github.com/ccxt/ccxt/pull/19882)
- feat(staticTests): add binance tests [ci skip] [#19871](https://github.com/ccxt/ccxt/pull/19871)
- Add bulk static tests [#19885](https://github.com/ccxt/ccxt/pull/19885)
- kuna - add skip prop [#19880](https://github.com/ccxt/ccxt/pull/19880)
- Add checkRequiredSymbol to exchanges [#19877](https://github.com/ccxt/ccxt/pull/19877)
- feat(staticTests): add coinbasepro [#19886](https://github.com/ccxt/ccxt/pull/19886)
- fix(hitbtc): set default margin mode to cross when create order [#19883](https://github.com/ccxt/ccxt/pull/19883)
- okx: add apis [#19892](https://github.com/ccxt/ccxt/pull/19892)
- fix(coinlist): type parseOrder [#19894](https://github.com/ccxt/ccxt/pull/19894)
- feat(binance): add rolling ticker endpoint [#19895](https://github.com/ccxt/ccxt/pull/19895)
- Bitmart: fetchOHLCV, update the spot endpoint and since logic [#19891](https://github.com/ccxt/ccxt/pull/19891)
- bybit: add apis [#19890](https://github.com/ccxt/ccxt/pull/19890)


## 4.1.43

- feat(gate): update fetchPositions [#19870](https://github.com/ccxt/ccxt/pull/19870)
- docs: add changelog to docs [#19857](https://github.com/ccxt/ccxt/pull/19857)
- feat(changelog): show PR link and title [#19856](https://github.com/ccxt/ccxt/pull/19856)
- fix(examples): async-gather-concurrency.py fix loop [#19874](https://github.com/ccxt/ccxt/pull/19874)
- jsdoc: update link to open interest structure [#19879](https://github.com/ccxt/ccxt/pull/19879)
- Mexc: keepAliveListenKey catch error missing ['spot'] from URL [#19872](https://github.com/ccxt/ccxt/pull/19872)
- Bybit: remove legacy endpoints [#19876](https://github.com/ccxt/ccxt/pull/19876)


## 4.1.41

- fix(tests) - array [#19864](https://github.com/ccxt/ccxt/pull/19864)
- fix(python): types imports for python < 3.8 [#19869](https://github.com/ccxt/ccxt/pull/19869)
- probit fetchTransactions fix [#19868](https://github.com/ccxt/ccxt/pull/19868)
- fix(tests) - relative dir for PHP/PY [#19865](https://github.com/ccxt/ccxt/pull/19865)
- Coinlist integration [#19680](https://github.com/ccxt/ccxt/pull/19680)
- Ascendex: createOrders [#19861](https://github.com/ccxt/ccxt/pull/19861)


## 4.1.40

- fix(tests) - minor cleanup (QUICK) [#19814](https://github.com/ccxt/ccxt/pull/19814)
- fix(binance): watchOrders and watchMyTrades type [#19850](https://github.com/ccxt/ccxt/pull/19850)
- feat(staticTests): add testing granularity [ci skip] [#19849](https://github.com/ccxt/ccxt/pull/19849)
- fix(staticTests): null exchange [ci skip] [#19851](https://github.com/ccxt/ccxt/pull/19851)
- feat(coinbase): add paginate to fetchAccounts [#19846](https://github.com/ccxt/ccxt/pull/19846)
- tests - exact exception matching [#19635](https://github.com/ccxt/ccxt/pull/19635)
- fix(Exchange.py): urlEncode stop mutating arg [#19852](https://github.com/ccxt/ccxt/pull/19852)
- okx(feat): update error codes for upcoming changes [#19854](https://github.com/ccxt/ccxt/pull/19854)
- fix(bittrex): fetchCurrencies - add networks key with value of empty dict to fetchCurrencies response [#19860](https://github.com/ccxt/ccxt/pull/19860)
- BingX: createOrders [#19819](https://github.com/ccxt/ccxt/pull/19819)


## 4.1.39

- feat(tests): make brokerId tests transpilable [#19839](https://github.com/ccxt/ccxt/pull/19839)
- fix(huobi): watchBalance timestamp fix #19812" [#19836](https://github.com/ccxt/ccxt/pull/19836)
- fix(travis): use npm ci instead of npm install [#19843](https://github.com/ccxt/ccxt/pull/19843)


## 4.1.38

- fix(phemex): order status [#19825](https://github.com/ccxt/ccxt/pull/19825)
- fix(mexc): swap fetchOpenOrders [#19824](https://github.com/ccxt/ccxt/pull/19824)
- fix(build.sh): remove static/ from critical changes [#19826](https://github.com/ccxt/ccxt/pull/19826)
- binance: support other signature in pro [#19822](https://github.com/ccxt/ccxt/pull/19822)
- example: add create order ws [#19820](https://github.com/ccxt/ccxt/pull/19820)
- docker: update dockerfile to support new nodejs installation steps [#19783](https://github.com/ccxt/ccxt/pull/19783)
- feat(tests): add binance and bybit static tests [ci skip] [#19827](https://github.com/ccxt/ccxt/pull/19827)
- build/transpile.js: fix typo. [#19835](https://github.com/ccxt/ccxt/pull/19835)
- fix(krakenfutures): fix feeschedules implicit api and add checkRequiredCredentials for private api [#19834](https://github.com/ccxt/ccxt/pull/19834)
- feat(binance): error handling for public ws endpoints [#19833](https://github.com/ccxt/ccxt/pull/19833)
- update changelog [ci skip] [#19838](https://github.com/ccxt/ccxt/pull/19838)
- docs: update contributing docs for writting tests [#19829](https://github.com/ccxt/ccxt/pull/19829)
- fix(build): static tests [#19842](https://github.com/ccxt/ccxt/pull/19842)
- feat(exchange): upgrade ast-transpiler [#19841](https://github.com/ccxt/ccxt/pull/19841)


## 4.1.37

- Digifinex: createOrders [#19804](https://github.com/ccxt/ccxt/pull/19804)
- fix(bitget): connection and split trigger orders cache [#19810](https://github.com/ccxt/ccxt/pull/19810)
- feat(huobi): unify timeInForce [#19811](https://github.com/ccxt/ccxt/pull/19811)
- fix(kuna) - skip active (QUICK) [#19813](https://github.com/ccxt/ccxt/pull/19813)
- feat(bybit): add del-submembe endpoint [#19823](https://github.com/ccxt/ccxt/pull/19823)
- Digifinex: createMarketBuyOrderRequiresPrice [#19818](https://github.com/ccxt/ccxt/pull/19818)
- bitforex.has leverage methods [#19817](https://github.com/ccxt/ccxt/pull/19817)
- wazirx.has margin/contract methods [#19816](https://github.com/ccxt/ccxt/pull/19816)


## 4.1.36

- feat(kuna): upgrade to v4 api [#19499](https://github.com/ccxt/ccxt/pull/19499)
- feat(exchange): add safeLiquidation [#19794](https://github.com/ccxt/ccxt/pull/19794)
- Manuals rewriting for exceptions & troubleshooting [#19793](https://github.com/ccxt/ccxt/pull/19793)
- add return type to parseOHLCV [#19797](https://github.com/ccxt/ccxt/pull/19797)
- fix(docs) - removal of leftover (QUICK) [#19806](https://github.com/ccxt/ccxt/pull/19806)
- Fix build [#19808](https://github.com/ccxt/ccxt/pull/19808)
- bitforex.has["swap"] == false [#19803](https://github.com/ccxt/ccxt/pull/19803)
- wazirx.has margin false [#19802](https://github.com/ccxt/ccxt/pull/19802)
- BingX: fetchMyLiquidations [#19800](https://github.com/ccxt/ccxt/pull/19800)
- Static test exchange name typos [#19799](https://github.com/ccxt/ccxt/pull/19799)
- latoken: has - swap,future == false [#19798](https://github.com/ccxt/ccxt/pull/19798)
- cli: add str encoding [#19788](https://github.com/ccxt/ccxt/pull/19788)


## 4.1.35

- feat(ccxt): fix transpile of ccxt.pro examples [#19571](https://github.com/ccxt/ccxt/pull/19571)
- (PHP) Fix PSR-4 autoloading warnings & testing warnings [#19273](https://github.com/ccxt/ccxt/pull/19273)
- bitopro: add apis [#19784](https://github.com/ccxt/ccxt/pull/19784)
- bitstamp: add apis [#19786](https://github.com/ccxt/ccxt/pull/19786)
- binance: add apis [#19782](https://github.com/ccxt/ccxt/pull/19782)
- bingx - expose broker id [#19376](https://github.com/ccxt/ccxt/pull/19376)
- bybit: support spot order in editOrder [#19787](https://github.com/ccxt/ccxt/pull/19787)
- feat(exchange): add filterBySymbolsSinceLimit [#19780](https://github.com/ccxt/ccxt/pull/19780)
- Bybit: adjust ratelimit weights [#19785](https://github.com/ccxt/ccxt/pull/19785)
- Phemex: add auth error for "401 Failed to load API KEY." [#19779](https://github.com/ccxt/ccxt/pull/19779)
- Bitget: add auth error for "Apikey does not exist" [#19778](https://github.com/ccxt/ccxt/pull/19778)
- feat(tests): add static tests [#19761](https://github.com/ccxt/ccxt/pull/19761)


## 4.1.34

- fix(php8) - promise interface & react update [#19100](https://github.com/ccxt/ccxt/pull/19100)
- Examples docs [#19730](https://github.com/ccxt/ccxt/pull/19730)
- Digifinex: setMarginMode [#19764](https://github.com/ccxt/ccxt/pull/19764)
- fix(okx): watchMyTrades [#19770](https://github.com/ccxt/ccxt/pull/19770)
- fix(exceptions) - OperationRejected [#19769](https://github.com/ccxt/ccxt/pull/19769)
- Digifinex: addMargin, reduceMargin [#19766](https://github.com/ccxt/ccxt/pull/19766)
- Huobi - currencies networks unification [#19745](https://github.com/ccxt/ccxt/pull/19745)
- kucoin: update apis [#19701](https://github.com/ccxt/ccxt/pull/19701)
- kraken fetchBalance enhancement [#19777](https://github.com/ccxt/ccxt/pull/19777)
- tidex - delist [#15121](https://github.com/ccxt/ccxt/pull/15121)


## 4.1.33

- feat(woo): remove brokerId from sandbox mode [#19758](https://github.com/ccxt/ccxt/pull/19758)
- Digifinex: fetchFundingHistory [#19763](https://github.com/ccxt/ccxt/pull/19763)
- bitget: allow books1 channel [#19746](https://github.com/ccxt/ccxt/pull/19746)
- feat(errors) - add `InvalidOperation` and `OperationFailed` [#19744](https://github.com/ccxt/ccxt/pull/19744)
- docs: fix docs errors and and build docs to build command [#19729](https://github.com/ccxt/ccxt/pull/19729)


## 4.1.32

- zonda: remove method [#19738](https://github.com/ccxt/ccxt/pull/19738)
- upbit: remove method [#19731](https://github.com/ccxt/ccxt/pull/19731)
- fix(base) - inarray/isarray [#19727](https://github.com/ccxt/ccxt/pull/19727)
- fix(base): add axolotl as class method to match php and py [#19742](https://github.com/ccxt/ccxt/pull/19742)
- docs(Exchange): extractParams - docstring [#19754](https://github.com/ccxt/ccxt/pull/19754)
- Digifinex: add implicit API endpoints [#19755](https://github.com/ccxt/ccxt/pull/19755)
- build.sh : only run python linter for exchange changes [#19753](https://github.com/ccxt/ccxt/pull/19753)
- fix(woo): watchBalance [#19751](https://github.com/ccxt/ccxt/pull/19751)
- Bitmex: parseOrder, add remaining value for inverse orders [#19750](https://github.com/ccxt/ccxt/pull/19750)
- fix(zonda): withdraw [#19748](https://github.com/ccxt/ccxt/pull/19748)
- fix(huobi): add check for out of order sequence, fix #19674 [#19747](https://github.com/ccxt/ccxt/pull/19747)


## 4.1.31

- woo: update method [#19718](https://github.com/ccxt/ccxt/pull/19718)
- fix(krakenfutures): check required Credentials [#19726](https://github.com/ccxt/ccxt/pull/19726)
- phemex: update apis [#19732](https://github.com/ccxt/ccxt/pull/19732)
- feat(bittrex): handle ws errors and check credentials [#19728](https://github.com/ccxt/ccxt/pull/19728)
- huobi: update balance apis [#19611](https://github.com/ccxt/ccxt/pull/19611)
- cli: update log [#19734](https://github.com/ccxt/ccxt/pull/19734)


## 4.1.30

- Bybit: remove commonCurrencies GASDAO [#19712](https://github.com/ccxt/ccxt/pull/19712)
- Mexc: set future and option to false [#19711](https://github.com/ccxt/ccxt/pull/19711)
- Ascendex: setMarginMode, setLeverage, and set future to false [#19714](https://github.com/ccxt/ccxt/pull/19714)
- OKX parse order status 'order_failed': 'canceled', [#19713](https://github.com/ccxt/ccxt/pull/19713)
- feat(tests): add static id tests [ci skip] [#19710](https://github.com/ccxt/ccxt/pull/19710)
- feat(bitvavo): pagination and jsdocs [#19709](https://github.com/ccxt/ccxt/pull/19709)
- Ascendex: fetchFundingHistory [#19715](https://github.com/ccxt/ccxt/pull/19715)
- bitget: update method [#19699](https://github.com/ccxt/ccxt/pull/19699)
- update changelog [ci skip] [#19725](https://github.com/ccxt/ccxt/pull/19725)
- fix(coinex): infer order type from parseOrder [#19724](https://github.com/ccxt/ccxt/pull/19724)
- feat(hitbtc): createOrder - unified timeInForce and postOnly [#19723](https://github.com/ccxt/ccxt/pull/19723)
- gemini: update method [#19719](https://github.com/ccxt/ccxt/pull/19719)


## 4.1.29

- gate: add @see [#19702](https://github.com/ccxt/ccxt/pull/19702)
- bitrue: fix fetchBidsAsks [#19704](https://github.com/ccxt/ccxt/pull/19704)
- feat(phemex): fetchBalance - throw error when fetching margin or future balance [#19700](https://github.com/ccxt/ccxt/pull/19700)
- Huobi: remove Hydro Protocol from commonCurrencies [#19695](https://github.com/ccxt/ccxt/pull/19695)
- fix(huobi): add timestamp to snapshot, fix #19674 [#19693](https://github.com/ccxt/ccxt/pull/19693)
- fix(exchange): have inflate return byte[] to match JS implementation [#19692](https://github.com/ccxt/ccxt/pull/19692)
- KrakenFutures: relativeFundingRate(): Return correct expected value [#19691](https://github.com/ccxt/ccxt/pull/19691)
- Bitget: fetchMarketLeverageTiers, add margin support [#19689](https://github.com/ccxt/ccxt/pull/19689)
- bitopro: update cancelAllOrders [#19698](https://github.com/ccxt/ccxt/pull/19698)
- Bitget: createOrders, add margin support [#19694](https://github.com/ccxt/ccxt/pull/19694)
- gate: remove method [#19705](https://github.com/ccxt/ccxt/pull/19705)
- feat(build): speed up single transpilation [ci skip] [#19708](https://github.com/ccxt/ccxt/pull/19708)


## 4.1.28

- okx: add apis [#19679](https://github.com/ccxt/ccxt/pull/19679)
- bybit: add apis [#19678](https://github.com/ccxt/ccxt/pull/19678)
- Bitget: fetchBorrowInterest [#19676](https://github.com/ccxt/ccxt/pull/19676)
- feat(mexc): add createOrders [#19670](https://github.com/ccxt/ccxt/pull/19670)
- feat(cryptocom): add cancelOrders [#19668](https://github.com/ccxt/ccxt/pull/19668)
- fix(krakenfutures): fetchPositions - remove unrealizedPnl and jsdocs [#19681](https://github.com/ccxt/ccxt/pull/19681)
- fix(bybit): add timestamp to balance [#19684](https://github.com/ccxt/ccxt/pull/19684)


## 4.1.27



## 4.1.26

- feat(kucoinfutures): add test order endpoint [#19664](https://github.com/ccxt/ccxt/pull/19664)
- feat(kucoin): add order test and organize createOrder [#19665](https://github.com/ccxt/ccxt/pull/19665)
- feat(kucoin): add createOrders [#19667](https://github.com/ccxt/ccxt/pull/19667)
- bitopro: update @see [#19663](https://github.com/ccxt/ccxt/pull/19663)
- Php websocket interpolation [#19671](https://github.com/ccxt/ccxt/pull/19671)


## 4.1.25

- Bitget: fetchBorrowRate [#19662](https://github.com/ccxt/ccxt/pull/19662)


## 4.1.24

- Bitget: fetchMyLiquidations [#19651](https://github.com/ccxt/ccxt/pull/19651)
- gate: update apis [#19654](https://github.com/ccxt/ccxt/pull/19654)
- fix(base): sortBy fix [#19655](https://github.com/ccxt/ccxt/pull/19655)
- Add createOrders  [#19638](https://github.com/ccxt/ccxt/pull/19638)
- fix(tests-currencies) - skip flag for FIAT deposit & withdraw for exchange (QUICK) [#19085](https://github.com/ccxt/ccxt/pull/19085)
- feat: add support for eddsa keys to binance [#19652](https://github.com/ccxt/ccxt/pull/19652)


## 4.1.23

- binance: add apis [#19643](https://github.com/ccxt/ccxt/pull/19643)
- bitmart order status [#19647](https://github.com/ccxt/ccxt/pull/19647)
- Krakenfutures :: add cancelOrders and fix signature [#19648](https://github.com/ccxt/ccxt/pull/19648)
- feat(binance) - remove wapi endpoints [#19650](https://github.com/ccxt/ccxt/pull/19650)


## 4.1.22

- ascendex: add apis [#19642](https://github.com/ccxt/ccxt/pull/19642)
- feat(docs): add star histoy to readme [ci skip] [#19640](https://github.com/ccxt/ccxt/pull/19640)
- fix(exchange):IndexedOrderBook order by price and id, fix #19479 [#19641](https://github.com/ccxt/ccxt/pull/19641)


## 4.1.20

- Okcoin update [#19631](https://github.com/ccxt/ccxt/pull/19631)
- update changelog [ci skip] [#19637](https://github.com/ccxt/ccxt/pull/19637)
- fix(bitget): cancelAllOrders default marginCoin [#19639](https://github.com/ccxt/ccxt/pull/19639)


## 4.1.19

- Bitget: fetchOpenOrders, fetchCanceledOrders, fetchClosedOrders, add margin support [#19624](https://github.com/ccxt/ccxt/pull/19624)
- feat(krakenfutures): add reduceOnly [#19626](https://github.com/ccxt/ccxt/pull/19626)
- kucoin watchOrders stop orders [#18747](https://github.com/ccxt/ccxt/pull/18747)
- feat(okx): split trigger stream in watchOrders [#19627](https://github.com/ccxt/ccxt/pull/19627)
- fix(header) - py [#19501](https://github.com/ccxt/ccxt/pull/19501)
- fix(bybit): preserve fee signal [#19630](https://github.com/ccxt/ccxt/pull/19630)
- fix(python-docs): see section [ci skip] [#19628](https://github.com/ccxt/ccxt/pull/19628)
- Bitget: fetchMyTrades, add margin support [#19633](https://github.com/ccxt/ccxt/pull/19633)


## 4.1.18

- fix(Exchange.ts): WS error handling [#19616](https://github.com/ccxt/ccxt/pull/19616)
- Validate TS return types [#19617](https://github.com/ccxt/ccxt/pull/19617)
- fix(tests) - test pair creation timestamp [#19586](https://github.com/ccxt/ccxt/pull/19586)
- feat(binance): update trades and depth RL [#19623](https://github.com/ccxt/ccxt/pull/19623)
- feat(okx): unify leverage inside setMarginMode [#19622](https://github.com/ccxt/ccxt/pull/19622)


## 4.1.17

- market structure [#19600](https://github.com/ccxt/ccxt/pull/19600)
- feat(base) - add `safeIntegerMultiplied` (safe_integer_multiplied) method [#19615](https://github.com/ccxt/ccxt/pull/19615)
- okx: add apis [#19620](https://github.com/ccxt/ccxt/pull/19620)
- Bitget: cancelOrder, add margin support [#19619](https://github.com/ccxt/ccxt/pull/19619)


## 4.1.16

- fix(bybit): order fee spot [#19606](https://github.com/ccxt/ccxt/pull/19606)
- fix(gate) - safeTimestamp [#19605](https://github.com/ccxt/ccxt/pull/19605)
- Bitget: createOrder, add margin support [#19609](https://github.com/ccxt/ccxt/pull/19609)
- fix(ascendex): reduceMargin no longer requires a negative number for amount [#19610](https://github.com/ccxt/ccxt/pull/19610)
- bingx: fix parseTrade side [#19608](https://github.com/ccxt/ccxt/pull/19608)
- fix(bitget,okx): handleUntilOption fix [ci deploy] [#19613](https://github.com/ccxt/ccxt/pull/19613)


## 4.1.15

- feat(bitmex) - pair created ts [#19543](https://github.com/ccxt/ccxt/pull/19543)
- feat(huobi) - pair create time [#19528](https://github.com/ccxt/ccxt/pull/19528)
- private tests fix [#19601](https://github.com/ccxt/ccxt/pull/19601)
- Fix safe integer product [#19604](https://github.com/ccxt/ccxt/pull/19604)
- fix(coinone): parseOrder fix [#19603](https://github.com/ccxt/ccxt/pull/19603)


## 4.1.14

- build(deps-dev): bump @babel/traverse from 7.21.3 to 7.23.2 [#19593](https://github.com/ccxt/ccxt/pull/19593)
- empty  pairs' creation timestamps [#19584](https://github.com/ccxt/ccxt/pull/19584)
- Bitget: fetchBalance, add margin support [#19594](https://github.com/ccxt/ccxt/pull/19594)
- btcturk: add apis [#19597](https://github.com/ccxt/ccxt/pull/19597)
- rename `assertTimestamp` into `assertTimestampAndDatetime` and create a separate method for `assertTimestamp` [#19585](https://github.com/ccxt/ccxt/pull/19585)
- feat(kucoinfutures) - pair created ts [#19574](https://github.com/ccxt/ccxt/pull/19574)
- feat(bittrex) - pair created ts [#19544](https://github.com/ccxt/ccxt/pull/19544)


## 4.1.13

- fix(krakenfutures): watchTrades and other fixes [ci deploy] [#19564](https://github.com/ccxt/ccxt/pull/19564)
- pairs created timestamps (part 2) [#19557](https://github.com/ccxt/ccxt/pull/19557)
- update changelog [ci skip] [#19569](https://github.com/ccxt/ccxt/pull/19569)
- fix(bingx): parseTransaction [#19570](https://github.com/ccxt/ccxt/pull/19570)
- Bittrex: ohlcv pagination [#19567](https://github.com/ccxt/ccxt/pull/19567)
- Bitget: borrowMargin, repayMargin [#19560](https://github.com/ccxt/ccxt/pull/19560)
- feat(ascendex) - pair created ts [#19540](https://github.com/ccxt/ccxt/pull/19540)
- binance: add apis [#19575](https://github.com/ccxt/ccxt/pull/19575)
- docs: update contributing docs with ruff [#19572](https://github.com/ccxt/ccxt/pull/19572)
- feat(latoken) - pair created ts [#19576](https://github.com/ccxt/ccxt/pull/19576)
- feat(poloniexfutures) - created ts pair [#19579](https://github.com/ccxt/ccxt/pull/19579)
- feat(poloniex) - pair created ts [#19578](https://github.com/ccxt/ccxt/pull/19578)
- feat(krakenfutures) - pair created ts [#19573](https://github.com/ccxt/ccxt/pull/19573)
- feat(hollaex) - market created ts [#19556](https://github.com/ccxt/ccxt/pull/19556)
- feat(woo) - pair created ts [#19583](https://github.com/ccxt/ccxt/pull/19583)
- poloniexfutures: add apis [#19581](https://github.com/ccxt/ccxt/pull/19581)
- fix(coinone): sign - encode payload [#19589](https://github.com/ccxt/ccxt/pull/19589)
- feat(bitget) - pair created empty ts [#19590](https://github.com/ccxt/ccxt/pull/19590)
- fix(poloniexfutures): fetchOpenOrders [#19587](https://github.com/ccxt/ccxt/pull/19587)
- kraken: add apis [#19580](https://github.com/ccxt/ccxt/pull/19580)
- fix(cryptocom): postOnly order [ci deploy] [#19591](https://github.com/ccxt/ccxt/pull/19591)
- feat(gate) - pair created ts [#19555](https://github.com/ccxt/ccxt/pull/19555)
- Cryptocom: remove deprecated methods [#19592](https://github.com/ccxt/ccxt/pull/19592)
- feat(deribit) - pair create ts [#19554](https://github.com/ccxt/ccxt/pull/19554)
- feat(delta) - pair launch time [#19553](https://github.com/ccxt/ccxt/pull/19553)
- feat(bitmart) - pair created ts [#19542](https://github.com/ccxt/ccxt/pull/19542)


## 4.1.12

- empty `created` timestamps (part 1) [#19545](https://github.com/ccxt/ccxt/pull/19545)
- New unified methods: fetchLiquidations and fetchMyLiquidations [#19516](https://github.com/ccxt/ccxt/pull/19516)
- poloniex: update apis [#19550](https://github.com/ccxt/ccxt/pull/19550)
- tests: fix missing variable and other fixes [#19539](https://github.com/ccxt/ccxt/pull/19539)


## 4.1.11

- fix(bybit): infer market type inside openOrders [#19538](https://github.com/ccxt/ccxt/pull/19538)
- binance: update @see [#19548](https://github.com/ccxt/ccxt/pull/19548)
- binance: patch fetchTradingFee [#19547](https://github.com/ccxt/ccxt/pull/19547)
- feat(bybit) - pair created ts [#19546](https://github.com/ccxt/ccxt/pull/19546)
- fix(okx): index OHLCV [#19549](https://github.com/ccxt/ccxt/pull/19549)
- poloniex error mapping [#19537](https://github.com/ccxt/ccxt/pull/19537)
- fix(bitget): fetchMyTrades, fetchDeposits and fetchWithdrawals ts [#19551](https://github.com/ccxt/ccxt/pull/19551)
- whitebit fetchMyTrades true [#19535](https://github.com/ccxt/ccxt/pull/19535)
- Fetchpositions type [#19531](https://github.com/ccxt/ccxt/pull/19531)


## 4.1.10

- whitebit fixes [#19510](https://github.com/ccxt/ccxt/pull/19510)
- update contributing docs [ci skip] [#19509](https://github.com/ccxt/ccxt/pull/19509)
- binance: update sign ccxt/ccxt#19511 [#19520](https://github.com/ccxt/ccxt/pull/19520)
- fix(deribit): fetchBalance [#19524](https://github.com/ccxt/ccxt/pull/19524)
- fix(tests) - ast transpiler update & integer [#19523](https://github.com/ccxt/ccxt/pull/19523)
- Binance check symbols type [#19521](https://github.com/ccxt/ccxt/pull/19521)
- binance: add apis [#19519](https://github.com/ccxt/ccxt/pull/19519)
- feat(bingx): migrate swap ohlcv to v3 [#19518](https://github.com/ccxt/ccxt/pull/19518)
- feat(okx) - listing timestamp [#19503](https://github.com/ccxt/ccxt/pull/19503)
- fix(Exchange.php): timestamp type [#19526](https://github.com/ccxt/ccxt/pull/19526)
- fix: Coinex position response 'contracts' [#19529](https://github.com/ccxt/ccxt/pull/19529)
- feat(binance) - pair created ts [#19527](https://github.com/ccxt/ccxt/pull/19527)
- feat(base): type fetchOpenInterest and fetchOpenInterestHistory [#19525](https://github.com/ccxt/ccxt/pull/19525)
- Coinspot: fetchMyTrades implementation [#19498](https://github.com/ccxt/ccxt/pull/19498)
- fix(phemex): Update pro URLs [#19532](https://github.com/ccxt/ccxt/pull/19532)


## 4.1.9

- fix(btcalpha): add warning to createOrder and jsdocs [#19495](https://github.com/ccxt/ccxt/pull/19495)
- wiki: update link for public / private api [ci skip] [#19464](https://github.com/ccxt/ccxt/pull/19464)
- fix(bingx): fetchPositions parsing [#19497](https://github.com/ccxt/ccxt/pull/19497)
- build: enable bybit [ci skip] [#19496](https://github.com/ccxt/ccxt/pull/19496)
- feat(btcmarkets): parseTransaction - string math [#19455](https://github.com/ccxt/ccxt/pull/19455)
- Bitbns trigger orders [#19415](https://github.com/ccxt/ccxt/pull/19415)
- fix(bitget): cancelAllOrders simplified [#19502](https://github.com/ccxt/ccxt/pull/19502)
- probit fetchTransactions limit [#19505](https://github.com/ccxt/ccxt/pull/19505)
- build: add Ruff (drop flake8) [#19504](https://github.com/ccxt/ccxt/pull/19504)
- add fundingRateHistory pagination [#19500](https://github.com/ccxt/ccxt/pull/19500)
- build: add pre-push hook [#19508](https://github.com/ccxt/ccxt/pull/19508)
- fix(bybit) - temporarily skip tests [#19515](https://github.com/ccxt/ccxt/pull/19515)


## 4.1.8

- feat(Exchange): type fetchFundingRateHistory [#19493](https://github.com/ccxt/ccxt/pull/19493)
- fix(pagination): restore TS types [#19492](https://github.com/ccxt/ccxt/pull/19492)
- feat(pagination): broader since and limit filter [#19494](https://github.com/ccxt/ccxt/pull/19494)
- Bingx ws [ci deploy] [#18650](https://github.com/ccxt/ccxt/pull/18650)


## 4.1.7

- feat(mexc): fetchOHLCV endTime and pagination [#19481](https://github.com/ccxt/ccxt/pull/19481)
- fix(bitbns): fetchBalance returns amouts of used and total INR instead of undefined [#19477](https://github.com/ccxt/ccxt/pull/19477)
- feat(coinfalcon): parseTransaction - string math [#19458](https://github.com/ccxt/ccxt/pull/19458)
- update changelog [ci skip] [#19488](https://github.com/ccxt/ccxt/pull/19488)
- fix(kucoin): loadMarkets [ci deploy] [#19489](https://github.com/ccxt/ccxt/pull/19489)
- bitmart: add broker api [#19483](https://github.com/ccxt/ccxt/pull/19483)
- mexc: add apis [#19482](https://github.com/ccxt/ccxt/pull/19482)
- feat(exmo): handleOrderBook - string math [#19459](https://github.com/ccxt/ccxt/pull/19459)


## 4.1.6

- small pagination fixes [ci skip] [#19480](https://github.com/ccxt/ccxt/pull/19480)
- php base - minor fixes [#19475](https://github.com/ccxt/ccxt/pull/19475)


## 4.1.5

- fix(kraken): parseOrder - rawTrades [#19474](https://github.com/ccxt/ccxt/pull/19474)
- add automatic pagination [ci deploy] [#19271](https://github.com/ccxt/ccxt/pull/19271)


## 4.1.4

- fix(bitget): websocket methods can watch coin margined and usdc margined contracts [#19472](https://github.com/ccxt/ccxt/pull/19472)
- fix(coinsph): markets correctly list active status [#19471](https://github.com/ccxt/ccxt/pull/19471)
- feat(kraken): parseLedgerEntry - string math [#19461](https://github.com/ccxt/ccxt/pull/19461)
- feat(coinex): fetchTime - uses safeInteger instead of safeNumber [#19457](https://github.com/ccxt/ccxt/pull/19457)
- feat(kuna): v4 implicit api paths [#19442](https://github.com/ccxt/ccxt/pull/19442)


## 4.1.3

- fix(kraken): handle raw trades [#19449](https://github.com/ccxt/ccxt/pull/19449)
- kraken: add @see [#19467](https://github.com/ccxt/ccxt/pull/19467)
- okx: add @see [#19466](https://github.com/ccxt/ccxt/pull/19466)
- whitebit: fetchOrderBook - parseToInt instead of parseNumber [#19463](https://github.com/ccxt/ccxt/pull/19463)
- feat(kucoinfutures): fetchTime uses safeInteger instead of safeNumber [#19462](https://github.com/ccxt/ccxt/pull/19462)
- feat(idex): fetchTime uses safeInteger instead of safeNumber [#19460](https://github.com/ccxt/ccxt/pull/19460)


## 4.1.2

- BingX: createOrder, add reduceOnly and positionSide support [#19436](https://github.com/ccxt/ccxt/pull/19436)
- fix(binance): watchOrderbook (spot) max limit [#19439](https://github.com/ccxt/ccxt/pull/19439)
- fix(Exchange.py): bytes response in the sync version [#19446](https://github.com/ccxt/ccxt/pull/19446)
- Bitmart: fetchPosition, fetchPositions [#19445](https://github.com/ccxt/ccxt/pull/19445)
- fix(tests) - skip async php [#19451](https://github.com/ccxt/ccxt/pull/19451)
- fix(tests) - error message length correction [#19450](https://github.com/ccxt/ccxt/pull/19450)
- PHP - feature to add method overload/override [#19444](https://github.com/ccxt/ccxt/pull/19444)
- fix(bitget): fetchCanceledAndClosedOrders [#19452](https://github.com/ccxt/ccxt/pull/19452)


## 4.1.1

- binance: add @see [ci skip] [#19430](https://github.com/ccxt/ccxt/pull/19430)
- okx: remove method [#19402](https://github.com/ccxt/ccxt/pull/19402)
- fix(bitrue): ticker percantage scale [#19434](https://github.com/ccxt/ccxt/pull/19434)
- Coinbasepro: add watchMyTradesForSymbols and watchOrdersForSymbols [#19435](https://github.com/ccxt/ccxt/pull/19435)
- Bybit: editOrder, triggerPrice, stopLoss and takeProfit strings [#19426](https://github.com/ccxt/ccxt/pull/19426)


## 4.0.112

- fix(kucoin): chain id [#19424](https://github.com/ccxt/ccxt/pull/19424)
- kucoin: add @see [ci skip] [#19432](https://github.com/ccxt/ccxt/pull/19432)
- okx: fix handle_my_trades in php [#19431](https://github.com/ccxt/ccxt/pull/19431)


## 4.0.111

- feat(bybit): add cursor to fetchTransfers [#19419](https://github.com/ccxt/ccxt/pull/19419)
- feat(coinbasepro): add since/until to fetchMyTrades and fetchOrders [#19420](https://github.com/ccxt/ccxt/pull/19420)
- Bybit: editOrder, stopLoss takeProfit, enable values to be set to zero [#19416](https://github.com/ccxt/ccxt/pull/19416)
- update changelog [ci skip] [#19423](https://github.com/ccxt/ccxt/pull/19423)
- feat(latoken): createOrder - unified params["stopPrice"], fetchOrder/fetchOpenOrders/fetchOrders/cancelOrder/cancelAllOrders - unified params["stop"] [#19400](https://github.com/ccxt/ccxt/pull/19400)


## 4.0.110

- Bitmart: fetchMyTrades, add swap support [#19409](https://github.com/ccxt/ccxt/pull/19409)
- feat(bitmart): add cancelorder swap support [#19410](https://github.com/ccxt/ccxt/pull/19410)
- binance.has fetchL3OrderBook and fetchWithdrawAddresses are false [#19408](https://github.com/ccxt/ccxt/pull/19408)
- bybit: add new api [#19418](https://github.com/ccxt/ccxt/pull/19418)


## 4.0.109

- bybit error mapping [#19404](https://github.com/ccxt/ccxt/pull/19404)
- feat(phemex): add from/to endpoint to fetchOHLCV [#19405](https://github.com/ccxt/ccxt/pull/19405)
- Bitget and Bybit: OrderNotFound error for Order not found [#19406](https://github.com/ccxt/ccxt/pull/19406)
- Bybit: changed the triggerDirection for stop orders [#19393](https://github.com/ccxt/ccxt/pull/19393)


## 4.0.108

- bitflyer: add @see [#19394](https://github.com/ccxt/ccxt/pull/19394)
- Bitmart: fetchOrder, add swap support [#19392](https://github.com/ccxt/ccxt/pull/19392)
- fix(bitfinex2): parseLedgerEntryType classification [#19398](https://github.com/ccxt/ccxt/pull/19398)
- bitget: add @see [#19401](https://github.com/ccxt/ccxt/pull/19401)


## 4.0.107

- binance: remove deprecated apis [#19387](https://github.com/ccxt/ccxt/pull/19387)
- feat(woo): add watchBalance [#19388](https://github.com/ccxt/ccxt/pull/19388)
- fix(base) - ESLINT no shadow [#19276](https://github.com/ccxt/ccxt/pull/19276)
- fix: watchXForSymbols example [ci skip] [#19389](https://github.com/ccxt/ccxt/pull/19389)
- bitforex: add @see [#19395](https://github.com/ccxt/ccxt/pull/19395)


## 4.0.106

- feat(exmo): fetchOpenOrders, cancelOrder, editOrder - stop and margin orders [#19117](https://github.com/ccxt/ccxt/pull/19117)
- feat(binance) - cancelOrders implementation (contract only)  [#19108](https://github.com/ccxt/ccxt/pull/19108)
- feat(bitget): add watchTickers [#19379](https://github.com/ccxt/ccxt/pull/19379)
- Bitmart: update several methods to v4 [#19382](https://github.com/ccxt/ccxt/pull/19382)
- Bitmart: fetchOpenOrders, add swap support [#19386](https://github.com/ccxt/ccxt/pull/19386)


## 4.0.105

- krakenfutures - fix #19372 - add clientOrderId [#19373](https://github.com/ccxt/ccxt/pull/19373)
- update changelog [ci skip] [#19374](https://github.com/ccxt/ccxt/pull/19374)
- feat(bybit): add watchTickers [#19375](https://github.com/ccxt/ccxt/pull/19375)


## 4.0.104

- Revert "Bybit: createOrder, remove stop order trigger direction" [#19367](https://github.com/ccxt/ccxt/pull/19367)
- Bitmart: cancelAllOrders, add swap support [#19364](https://github.com/ccxt/ccxt/pull/19364)
- fix(kucoin) - exceptional w/d currency [#19363](https://github.com/ccxt/ccxt/pull/19363)
- bitvavo - skip quoteVolume & baseVolume (QUICK) [#19371](https://github.com/ccxt/ccxt/pull/19371)


## 4.0.103

- bitfinex2: update apis [#19359](https://github.com/ccxt/ccxt/pull/19359)
- bitbank: add @see [#19358](https://github.com/ccxt/ccxt/pull/19358)
- binance: add apis [#19365](https://github.com/ccxt/ccxt/pull/19365)


## 4.0.102

- bingx: add fetchDepositAddress [#19350](https://github.com/ccxt/ccxt/pull/19350)
- wavesexchange: update toPrecision [#19351](https://github.com/ccxt/ccxt/pull/19351)
- Bitmart: fetchOrderBook, add swap support [#19349](https://github.com/ccxt/ccxt/pull/19349)
- build: skip phpAsync coinbasepro/prime [ci skip] [#19353](https://github.com/ccxt/ccxt/pull/19353)
- fix(bybit): error mapping [#19344](https://github.com/ccxt/ccxt/pull/19344)
- fix(Exchange.py): handle empty/none response properly [#19352](https://github.com/ccxt/ccxt/pull/19352)
- fix(gate): update rate limits [#19355](https://github.com/ccxt/ccxt/pull/19355)
- Bitmart: transfer, fetchTransfers, add swap support [#19354](https://github.com/ccxt/ccxt/pull/19354)
- docs(bitrue): createOrder - update docstring [#19331](https://github.com/ccxt/ccxt/pull/19331)
- fix(gate): python linting [#19357](https://github.com/ccxt/ccxt/pull/19357)


## 4.0.101

- fix build: skip novadax ask check [#19328](https://github.com/ccxt/ccxt/pull/19328)
- fix(kucoin) - pre shadow var (QUICK) [#19318](https://github.com/ccxt/ccxt/pull/19318)
- bybit WS - pre shadow vars (QUICK) [#19317](https://github.com/ccxt/ccxt/pull/19317)
- bybit: patch setMarginMode [#19315](https://github.com/ccxt/ccxt/pull/19315)
- fix(bybit) - shadows var rename (QUICK) [#19278](https://github.com/ccxt/ccxt/pull/19278)
- fix(skips) - unskip mexc & removal phpskip (QUICK) [#19122](https://github.com/ccxt/ccxt/pull/19122)
- bingx: add apis [#19338](https://github.com/ccxt/ccxt/pull/19338)
- binance: add apis [#19337](https://github.com/ccxt/ccxt/pull/19337)
- Bitmart: fetchFundingRate [#19335](https://github.com/ccxt/ccxt/pull/19335)
- gemini: add AuthenticationError [#19334](https://github.com/ccxt/ccxt/pull/19334)
- fix(bybit): watchOrders swap parsing [#19342](https://github.com/ccxt/ccxt/pull/19342)
- bl3p.has: createStopOrder == false [#19333](https://github.com/ccxt/ccxt/pull/19333)
- docs(bingx): createOrder - docstring update triggerPrice type [#19330](https://github.com/ccxt/ccxt/pull/19330)
- fix!(bkex): delist bkex [#19329](https://github.com/ccxt/ccxt/pull/19329)
- binance WS - pre shadow vars (~QUICK~) [#19316](https://github.com/ccxt/ccxt/pull/19316)
- fix(coinbasepro) - shadow vars rename (QUICK) [#19290](https://github.com/ccxt/ccxt/pull/19290)


## 4.0.100

- bybit: update setMarginMode [#19313](https://github.com/ccxt/ccxt/pull/19313)
- bybit: remove method usage [#19312](https://github.com/ccxt/ccxt/pull/19312)
- fix(krakenfutures) - shadow vars rename (QUICK) [#19294](https://github.com/ccxt/ccxt/pull/19294)
- fix(huobijp) - shadow vars rename (QUICK) [#19293](https://github.com/ccxt/ccxt/pull/19293)
- fix(bitget) - shadow vars renamed (QUICK) [#19279](https://github.com/ccxt/ccxt/pull/19279)
- fix(kucoin): fetchPosion and realizedPnl [#19277](https://github.com/ccxt/ccxt/pull/19277)
- fix(lbank) - max trade limit (QUICK) [#19261](https://github.com/ccxt/ccxt/pull/19261)
- fix(huobijp) - max trade limit (QUICK) [#19258](https://github.com/ccxt/ccxt/pull/19258)
- fix(huobi) - max trade limit (QUICK) [#19257](https://github.com/ccxt/ccxt/pull/19257)
- feat(kucoin): add watchTickers [#19314](https://github.com/ccxt/ccxt/pull/19314)
- fix(kucoinfutures) - shadow vars rename (QUICK) [#19295](https://github.com/ccxt/ccxt/pull/19295)
- fix(lbank2) - max trade limit (QUICK) [#19260](https://github.com/ccxt/ccxt/pull/19260)
- fix(idex) - max trade limit (QUICK) [#19259](https://github.com/ccxt/ccxt/pull/19259)
- fix(currencycom) - max trade limit (QUICK) [#19255](https://github.com/ccxt/ccxt/pull/19255)
- fix(binance) - max trade limit (~QUICK~) [#19247](https://github.com/ccxt/ccxt/pull/19247)
- Bybit: createOrder, remove stop order trigger direction [#19323](https://github.com/ccxt/ccxt/pull/19323)
- comments across different exchanges (QUICK) [#19321](https://github.com/ccxt/ccxt/pull/19321)
- fix(phemex) - pre shadow vars (QUICK) [#19319](https://github.com/ccxt/ccxt/pull/19319)
- fix(bybit): error mapping (InvalidOrder -> BadRequest) [#19327](https://github.com/ccxt/ccxt/pull/19327)


## 4.0.99

- fix(huobi) - shadow vars rename (QUICK) [#19292](https://github.com/ccxt/ccxt/pull/19292)
- fix(hitbtc) - shadow vars rename (QUICK) [#19291](https://github.com/ccxt/ccxt/pull/19291)
- fix(lbank2) - pre shadow var (QUICK) [#19304](https://github.com/ccxt/ccxt/pull/19304)
- fix(bitget) - pre shadow var (QUICK) [#19303](https://github.com/ccxt/ccxt/pull/19303)
- fix(bitmex) - pre shadow var (QUICK) [#19302](https://github.com/ccxt/ccxt/pull/19302)
- fix(currencycom) - pre shadow var (QUICK) [#19300](https://github.com/ccxt/ccxt/pull/19300)
- fix(phemex) - pre shadow var (QUICK) [#19299](https://github.com/ccxt/ccxt/pull/19299)
- fix(probit) - pre shadow var (QUICK) [#19298](https://github.com/ccxt/ccxt/pull/19298)
- fix(coinbase) - shadow vars rename (QUICK) [#19289](https://github.com/ccxt/ccxt/pull/19289)
- fix(bybit) - shadow vars rename 2 (QUICK) [#19288](https://github.com/ccxt/ccxt/pull/19288)
- fix(bitvavo) - shadow vars rename (QUICK) [#19287](https://github.com/ccxt/ccxt/pull/19287)
- update changelog [ci skip] [#19308](https://github.com/ccxt/ccxt/pull/19308)
- fix(cryptocom) - pre shadow var (QUICK) [#19301](https://github.com/ccxt/ccxt/pull/19301)
- fix(whitebit) - shadow vars rename (QUICK) [#19297](https://github.com/ccxt/ccxt/pull/19297)
- fix(bittrex) - shadow vars rename (QUICK) [#19286](https://github.com/ccxt/ccxt/pull/19286)
- fix(bitfinex2) - shadow vars rename (QUICK) [#19285](https://github.com/ccxt/ccxt/pull/19285)
- fix(binance) - shadow vars rename (~QUICK~) [#19284](https://github.com/ccxt/ccxt/pull/19284)
- fix(ascendex) - shadow vars rename (QUICK) [#19283](https://github.com/ccxt/ccxt/pull/19283)
- fix(okx) - shadow var recursion (QUICK) [#19282](https://github.com/ccxt/ccxt/pull/19282)
- fix(deribit) - shadows var renamed (QUICK) [#19280](https://github.com/ccxt/ccxt/pull/19280)
- safeOrder check for parsedTrades [#19306](https://github.com/ccxt/ccxt/pull/19306)
- fix(poloniex) - shadow vars rename (QUICK) [#19296](https://github.com/ccxt/ccxt/pull/19296)


## 4.0.98

- feat(exmo): createOrder - trigger orders and margin orders [#19116](https://github.com/ccxt/ccxt/pull/19116)
- exmo(fix): ArgumentsRequired import missing [#19307](https://github.com/ccxt/ccxt/pull/19307)


## 4.0.97

- fix(poloniex): watchOrders fix when a symbol is passed [#19267](https://github.com/ccxt/ccxt/pull/19267)
- Bitmart: setLeverage [#19269](https://github.com/ccxt/ccxt/pull/19269)
- bithumb: add apis, update api params [#19268](https://github.com/ccxt/ccxt/pull/19268)
- feat(latoken): fetchBalance - type of "funding" accepted [#19265](https://github.com/ccxt/ccxt/pull/19265)
- fix(gate): order status [#19270](https://github.com/ccxt/ccxt/pull/19270)
- Bigone stop orders, postOnly, timeInForce [#19242](https://github.com/ccxt/ccxt/pull/19242)
- Bitmart: private contract endpoints [#19274](https://github.com/ccxt/ccxt/pull/19274)
- fix(probit) - bug in fetchCurrencies (QUICK) [#19272](https://github.com/ccxt/ccxt/pull/19272)


## 4.0.96

- fix(deribit) - max trade limit (QUICK) [#19256](https://github.com/ccxt/ccxt/pull/19256)
- fix(bitvavo) - trades max limit (QUICK) [#19254](https://github.com/ccxt/ccxt/pull/19254)
- fix(bitmex) - trade limit max (QUICK) [#19253](https://github.com/ccxt/ccxt/pull/19253)
- fix(kucoinfutures): fetchFundingRateHistory error handling and others [#19251](https://github.com/ccxt/ccxt/pull/19251)
- fix(bitfinex2) - max trade limit (QUICK) [#19248](https://github.com/ccxt/ccxt/pull/19248)
- bybit: migrate to v5 [ci deploy] [#18556](https://github.com/ccxt/ccxt/pull/18556)


## 4.0.95

- fix(digifinex) - trade max limit for swap (QUICK) [#19241](https://github.com/ccxt/ccxt/pull/19241)
- fix(bequant,hitbtc,fmfw) - fix max trade limit (QUICK) [#19246](https://github.com/ccxt/ccxt/pull/19246)
- fix(latoken) - min/max trade (QUICK) [#19240](https://github.com/ccxt/ccxt/pull/19240)
- fix(btctradeua) - comments (QUICK) [ci skip] [#19163](https://github.com/ccxt/ccxt/pull/19163)
- fix(bitso) - side & takerOrMaker [#19151](https://github.com/ccxt/ccxt/pull/19151)
- fix(wazirx) - max trade limit (QUICK) [#19263](https://github.com/ccxt/ccxt/pull/19263)
- fix(probit) - trades max limit (QUICK) [#19262](https://github.com/ccxt/ccxt/pull/19262)


## 4.0.94

- Bitmart: fetchOpenInterest [#19245](https://github.com/ccxt/ccxt/pull/19245)


## 4.0.93

- bigone.transfer add fund type, docstring update [#19232](https://github.com/ccxt/ccxt/pull/19232)
- fix(bigone): parseTransaction deposit/withdrawal type fix [#19231](https://github.com/ccxt/ccxt/pull/19231)
- feat(okx): set default value for tpTriggerPxType and slTriggerPxType [#19230](https://github.com/ccxt/ccxt/pull/19230)
- hollaex.has: createPostOnlyOrder, createOrder docstrings [#19228](https://github.com/ccxt/ccxt/pull/19228)
- bitopro: update rl [#19224](https://github.com/ccxt/ccxt/pull/19224)
- fix(huobi): fix contract clientOrderId type [#19238](https://github.com/ccxt/ccxt/pull/19238)
- fix(binance): watchOrderBookForSymbols scope var [ci deploy] [#19237](https://github.com/ccxt/ccxt/pull/19237)


## 4.0.91

- feat(manual): fetchSettlementHistory [ci skip] [#19223](https://github.com/ccxt/ccxt/pull/19223)
- feat(hitbtc): websockets class updated from V1 to V3 [#18027](https://github.com/ccxt/ccxt/pull/18027)
- gate: add apis [#19235](https://github.com/ccxt/ccxt/pull/19235)


## 4.0.90

- do export for position type [#19179](https://github.com/ccxt/ccxt/pull/19179)
- binance: add apis [#19222](https://github.com/ccxt/ccxt/pull/19222)
- Fix array length (QUICK) [#19225](https://github.com/ccxt/ccxt/pull/19225)
- OKX(ws): should login business url [#19186](https://github.com/ccxt/ccxt/pull/19186)
- fix(exchange.php): is empty return true for countable objects with length 0 [#19173](https://github.com/ccxt/ccxt/pull/19173)


## 4.0.89

- feat(safePosition): get contract size from market when undefined [#19174](https://github.com/ccxt/ccxt/pull/19174)
- fix(bitmex): add reverse to fetchFundingRateHistory [#19178](https://github.com/ccxt/ccxt/pull/19178)
- feat(ws): add watchTradesForSymbols, watchOrderBookForSymbols and watchOHLCVForSymbols [ci deploy] [#18739](https://github.com/ccxt/ccxt/pull/18739)


## 4.0.88

- update changelog [ci skip] [#19154](https://github.com/ccxt/ccxt/pull/19154)
- fix(bingx) - public trade limit (QUICK) [#19142](https://github.com/ccxt/ccxt/pull/19142)
- fix bybit watchMyTrades should filter by symbol [#19128](https://github.com/ccxt/ccxt/pull/19128)


## 4.0.87

- fetchUnderlyingAssets: new options method [#19118](https://github.com/ccxt/ccxt/pull/19118)
- Composer - remove extra (QUICK) [#19114](https://github.com/ccxt/ccxt/pull/19114)
- feat(exmo): fetchMyTrades - margin [#19107](https://github.com/ccxt/ccxt/pull/19107)


## 4.0.86

- bitget: add new market apis [#19126](https://github.com/ccxt/ccxt/pull/19126)
- feat(tests) - better output [#19124](https://github.com/ccxt/ccxt/pull/19124)
- fix(bequant) - public trade takerOrMaker [#19123](https://github.com/ccxt/ccxt/pull/19123)
- feat(exmo): fetchOrderTrades - margin [#19120](https://github.com/ccxt/ccxt/pull/19120)
- fix(base) - avoid `const array` issue (QUICK) [#19049](https://github.com/ccxt/ccxt/pull/19049)
- fix(test) - PHP typo mistake (QUICK) [#19132](https://github.com/ccxt/ccxt/pull/19132)


## 4.0.85

- feat(kucoin) - triggerPriceType (QUICK) [#19115](https://github.com/ccxt/ccxt/pull/19115)
- fix(bitget): fetchBalance, adjust swap free balance [#19127](https://github.com/ccxt/ccxt/pull/19127)


## 4.0.84

- fix(latoken): parseTicker response values corrected [#19109](https://github.com/ccxt/ccxt/pull/19109)
- fix(binance): bookTicker swap subscription [#19112](https://github.com/ccxt/ccxt/pull/19112)


## 4.0.83

- fix(base): typo inside Position type [#19104](https://github.com/ccxt/ccxt/pull/19104)
- fix(base): remove BCHABC from Exchange.py/php [ci deploy] [#19111](https://github.com/ccxt/ccxt/pull/19111)


## 4.0.82

- feat(exmo): fetchMarkets - margin info [#19074](https://github.com/ccxt/ccxt/pull/19074)
- fix(base): BCH override [#19097](https://github.com/ccxt/ccxt/pull/19097)
- fix(yobit): remove PRS override [#19099](https://github.com/ccxt/ccxt/pull/19099)
- fix(gate): order status [#19098](https://github.com/ccxt/ccxt/pull/19098)
- fix(bitmart): change method to v3 endpoint [#19101](https://github.com/ccxt/ccxt/pull/19101)
- binance: update api rate limit [#19102](https://github.com/ccxt/ccxt/pull/19102)
- Bybit: update stopLoss, takeProfit implementation [#19062](https://github.com/ccxt/ccxt/pull/19062)
- unification - currency `type` [#19094](https://github.com/ccxt/ccxt/pull/19094)


## 4.0.81

- binance: add apis [#19095](https://github.com/ccxt/ccxt/pull/19095)


## 4.0.80

- update changelog [ci skip] [#19064](https://github.com/ccxt/ccxt/pull/19064)
- gate: add apis [#19060](https://github.com/ccxt/ccxt/pull/19060)
- binance: add apis [#19058](https://github.com/ccxt/ccxt/pull/19058)
- bitget: update fetchMyTrades [#19057](https://github.com/ccxt/ccxt/pull/19057)
- huobi: add apis [#19061](https://github.com/ccxt/ccxt/pull/19061)
- different exchanges - fix `.length >` transpiling for array [#19051](https://github.com/ccxt/ccxt/pull/19051)
- Update manual.rst [ci skip] [#19053](https://github.com/ccxt/ccxt/pull/19053)
- fix(okx): ws sandbox [#19076](https://github.com/ccxt/ccxt/pull/19076)
- feat(exmo): fetchBalance - margin wallet balance [#19075](https://github.com/ccxt/ccxt/pull/19075)
- fix(bequant): USD no longer has its currencyId changed to USDT [#19072](https://github.com/ccxt/ccxt/pull/19072)
- fix(bitmex): fetchFundingRates filtering [#19077](https://github.com/ccxt/ccxt/pull/19077)
- fix(kucoin): add proper fetchCurrencies [#19068](https://github.com/ccxt/ccxt/pull/19068)
- fix(kucoin) - active fields [#19081](https://github.com/ccxt/ccxt/pull/19081)
- fix(base): duplicated markets with different ids [#19084](https://github.com/ccxt/ccxt/pull/19084)
- fix(bybit): remove editOrder check [#19090](https://github.com/ccxt/ccxt/pull/19090)
- add: [upbit] Add network as required parameter for withdrawals of digital assets [#19088](https://github.com/ccxt/ccxt/pull/19088)
- build: skip bigone check [#19091](https://github.com/ccxt/ccxt/pull/19091)
- build: skip bithumb [#19093](https://github.com/ccxt/ccxt/pull/19093)


## 4.0.79

- composer: require react/promise-timer [#19046](https://github.com/ccxt/ccxt/pull/19046)
- fix(bitget): handle ws error [#19041](https://github.com/ccxt/ccxt/pull/19041)
- fix `string` variable (QUICK) [#19050](https://github.com/ccxt/ccxt/pull/19050)
- fix(wazirx): createOrder - stopPrice orders reduce stopPrice to allowed precision [#19039](https://github.com/ccxt/ccxt/pull/19039)
- Strlen - php fix (QUICK?) [#19029](https://github.com/ccxt/ccxt/pull/19029)
- fix(bitmex): base/quote volume inside ticker [#19052](https://github.com/ccxt/ccxt/pull/19052)
- fix(gate): watchOHLCV return [#19054](https://github.com/ccxt/ccxt/pull/19054)
- bybit: add apis [#19059](https://github.com/ccxt/ccxt/pull/19059)


## 4.0.78

- bithumb fetchTrades fix  [#19033](https://github.com/ccxt/ccxt/pull/19033)
- fix(phemex): side and price fix [#19036](https://github.com/ccxt/ccxt/pull/19036)
- fix(poloniex): format comments [#19035](https://github.com/ccxt/ccxt/pull/19035)
- Binance: spot rateLimit changes [#18995](https://github.com/ccxt/ccxt/pull/18995)
- mexc: add apis [#19044](https://github.com/ccxt/ccxt/pull/19044)


## 4.0.77

- feat(bingx): add spot support to fetchTickers [#19021](https://github.com/ccxt/ccxt/pull/19021)
- fix(test) - skip for auth [QUICK] [#19008](https://github.com/ccxt/ccxt/pull/19008)
- fix(test) - python exception [#19007](https://github.com/ccxt/ccxt/pull/19007)
- fix(test) - array length [QUICK] [#19018](https://github.com/ccxt/ccxt/pull/19018)
- fix(base) - currencyToprecision force string [#18942](https://github.com/ccxt/ccxt/pull/18942)
- okx: add apis [#19022](https://github.com/ccxt/ccxt/pull/19022)
- fix(bingx): spot ticker is public [#19027](https://github.com/ccxt/ccxt/pull/19027)
- fix(transpile): snakecase handleTriggerPrices [#19028](https://github.com/ccxt/ccxt/pull/19028)
- bingx: patch signature [#19032](https://github.com/ccxt/ccxt/pull/19032)


## 4.0.76

- fix(okx): watchTickers require list of symbols [#19014](https://github.com/ccxt/ccxt/pull/19014)
- fix(bingx): fetchTicker fix [#19017](https://github.com/ccxt/ccxt/pull/19017)
- gate: add apis [#19019](https://github.com/ccxt/ccxt/pull/19019)


## 4.0.75

- coinsph: add apis [#18993](https://github.com/ccxt/ccxt/pull/18993)
- fix(base) - missing `accountsById` member [QUICK] [#18992](https://github.com/ccxt/ccxt/pull/18992)
- fix(base) - missing badResponse, badRequest [QUICK] [#18991](https://github.com/ccxt/ccxt/pull/18991)
- Poloniex trigger orders [#18928](https://github.com/ccxt/ccxt/pull/18928)
- bingx: add apis [#18972](https://github.com/ccxt/ccxt/pull/18972)
- feat(coinex): improve parseTicker to handle buy_amount and sell_amount [#19002](https://github.com/ccxt/ccxt/pull/19002)
- fix(bybit) - remove skip for tests [#19001](https://github.com/ccxt/ccxt/pull/19001)
- feat(bitfinex2): improve parseTicker to handle BID_SIZE and ASK_SIZE [#19003](https://github.com/ccxt/ccxt/pull/19003)
- fix(kucoinfutures): add loadMarkets to watchBalance [#19006](https://github.com/ccxt/ccxt/pull/19006)


## 4.0.74

- fix(base): filterByArrayPositions name transpiling [#18979](https://github.com/ccxt/ccxt/pull/18979)
- bitopro: patch signature [#18982](https://github.com/ccxt/ccxt/pull/18982)
- price argument in createOrder docstrings is optional [#18980](https://github.com/ccxt/ccxt/pull/18980)
- bybit: add apis, update limit rate [#18983](https://github.com/ccxt/ccxt/pull/18983)
- fix(lbank2): python error mapping [#18985](https://github.com/ccxt/ccxt/pull/18985)
- feat(coinex): add support for financial account balance [#18984](https://github.com/ccxt/ccxt/pull/18984)
- fix(okx): ws auth [#18923](https://github.com/ccxt/ccxt/pull/18923)
- woo: add apis [#18858](https://github.com/ccxt/ccxt/pull/18858)
- fix(poloniex): handle new ticker structure [#18987](https://github.com/ccxt/ccxt/pull/18987)
- bitmart: add apis [#18994](https://github.com/ccxt/ccxt/pull/18994)


## 4.0.73

- fix(bingx) - trade side & taker/maker [QUICK] [#18968](https://github.com/ccxt/ccxt/pull/18968)
- fix(bybit): ws auth [#18917](https://github.com/ccxt/ccxt/pull/18917)


## 4.0.72

- fix(bitmex): ws auth [#18914](https://github.com/ccxt/ccxt/pull/18914)
- exchange.parseWsOHLCVs [#18258](https://github.com/ccxt/ccxt/pull/18258)
- Lbank2: add contract API endpoints [#18835](https://github.com/ccxt/ccxt/pull/18835)
- fetchMySettlementHistory: new options method [#18973](https://github.com/ccxt/ccxt/pull/18973)


## 4.0.71

- binance: add apis [#18961](https://github.com/ccxt/ccxt/pull/18961)
- fix(exchange): await ws close [#18949](https://github.com/ccxt/ccxt/pull/18949)
- fix(cryptocom): ws auth [#18919](https://github.com/ccxt/ccxt/pull/18919)


## 4.0.70

- Kucoinfutures doesn't have a setLeverage method [#18965](https://github.com/ccxt/ccxt/pull/18965)
- feat(coinbasepro): improve watchTicker parsing [#18966](https://github.com/ccxt/ccxt/pull/18966)
- bitget: add apis [#18962](https://github.com/ccxt/ccxt/pull/18962)


## 4.0.69



## 4.0.68

- feat(binance) - error msg [QUICK] [#18947](https://github.com/ccxt/ccxt/pull/18947)
- Bitget: fetchTrades add 'endTime' support [#18940](https://github.com/ccxt/ccxt/pull/18940)
- Bitget set margin mode unified names [#18948](https://github.com/ccxt/ccxt/pull/18948)
- update changelog [ci skip] [#18956](https://github.com/ccxt/ccxt/pull/18956)
- fix(okx): add new bussiness url to pro [#18957](https://github.com/ccxt/ccxt/pull/18957)


## 4.0.67

- fix(binance) - add error code [#18937](https://github.com/ccxt/ccxt/pull/18937)
- fix(phemex): fetchPosition - marginMode is parsed from response [#18939](https://github.com/ccxt/ccxt/pull/18939)
- `tests` - failed loadMarkets fix [#18895](https://github.com/ccxt/ccxt/pull/18895)
- fix(bitmart): ws auth [#18909](https://github.com/ccxt/ccxt/pull/18909)
- fix(bitget): ws auth [#18910](https://github.com/ccxt/ccxt/pull/18910)
- huobi & bittrex - option name change (simple) [#18848](https://github.com/ccxt/ccxt/pull/18848)
- fix(test) - allow empty value for lastTradeTimestamp [#18943](https://github.com/ccxt/ccxt/pull/18943)
- wavesexchange string math [#18245](https://github.com/ccxt/ccxt/pull/18245)
- fix(bitfinex2): ws auth [#18911](https://github.com/ccxt/ccxt/pull/18911)
- fix(bybit): market() override [#18945](https://github.com/ccxt/ccxt/pull/18945)
- feat(coinbasepro): add watchTickers [#18951](https://github.com/ccxt/ccxt/pull/18951)


## 4.0.66

- base - remove emulated ohlcv [#18933](https://github.com/ccxt/ccxt/pull/18933)
- fix(bybit): watchTickers market selection [#18935](https://github.com/ccxt/ccxt/pull/18935)
- fix(bitget): default ohlcv limit [#18903](https://github.com/ccxt/ccxt/pull/18903)


## 4.0.65

- fix(tokocrypto): add type 2 support for public methods [#18932](https://github.com/ccxt/ccxt/pull/18932)
- `exchange.php` - add async fetch_markets [#18906](https://github.com/ccxt/ccxt/pull/18906)
- Bitget: fetchTrades 'since' support [#18890](https://github.com/ccxt/ccxt/pull/18890)
- Bitget: fetchMarkOHLCV, fetchIndexOHLCV [#18929](https://github.com/ccxt/ccxt/pull/18929)
- feat(hitbtc): params["triggerPrice"] unified [#18885](https://github.com/ccxt/ccxt/pull/18885)
- fix(ascendex) - skip low [#18934](https://github.com/ccxt/ccxt/pull/18934)


## 4.0.64

- okx: update apis [#18900](https://github.com/ccxt/ccxt/pull/18900)
- bug - editOrder amount not required [#18897](https://github.com/ccxt/ccxt/pull/18897)
- Fix bithumb handle errors [#18891](https://github.com/ccxt/ccxt/pull/18891)
- fix(alpaca): authenticate [#18898](https://github.com/ccxt/ccxt/pull/18898)
- Idex string math [#18894](https://github.com/ccxt/ccxt/pull/18894)
- fix(cryptocom): update id [#18908](https://github.com/ccxt/ccxt/pull/18908)
- has[ws] == false [#18816](https://github.com/ccxt/ccxt/pull/18816)


## 4.0.62

- wavesexchange conditional orders [#18578](https://github.com/ccxt/ccxt/pull/18578)


## 4.0.61

- fix(test) - datetime assertion accuracy [#18887](https://github.com/ccxt/ccxt/pull/18887)
- bingx: add apis [#18892](https://github.com/ccxt/ccxt/pull/18892)
- fix!(exmo): createOrder can place market orders, response is parsed using parseOrder  [#18884](https://github.com/ccxt/ccxt/pull/18884)
- fix(skip-tests) - return skipped-exchanges [#18851](https://github.com/ccxt/ccxt/pull/18851)


## 4.0.60

- feat(bitpanda): createOrder - unified params["triggerPrice"] [#18882](https://github.com/ccxt/ccxt/pull/18882)
- tokocrypto: createOrder - docstring and has updates [#18886](https://github.com/ccxt/ccxt/pull/18886)
- fix(kucoin): ws error handling [#18889](https://github.com/ccxt/ccxt/pull/18889)


## 4.0.59

- feat(binance): add sor support for createOrder [#18883](https://github.com/ccxt/ccxt/pull/18883)


## 4.0.58

- fix!(bitfinex2): unify fetchPositions response [#18868](https://github.com/ccxt/ccxt/pull/18868)
- fix(gate): parseOrder fixes related to filled and cost being set to 0 [#18866](https://github.com/ccxt/ccxt/pull/18866)
- update changelog [ci skip] [#18873](https://github.com/ccxt/ccxt/pull/18873)
- fix(bybit): crash when fetchPosition array is empty [#18875](https://github.com/ccxt/ccxt/pull/18875)


## 4.0.57

- ci: patch link of troubleshooting [#18856](https://github.com/ccxt/ccxt/pull/18856)
- Ndax triggerPrice [#18845](https://github.com/ccxt/ccxt/pull/18845)
- Fetch position stop loss take profit [#18841](https://github.com/ccxt/ccxt/pull/18841)
- fix(whitebit): add loadMarkets to fetchTradingFees [#18862](https://github.com/ccxt/ccxt/pull/18862)
- Tokocrypto string math [#18413](https://github.com/ccxt/ccxt/pull/18413)
- Lbank: sign error for private methods [#18855](https://github.com/ccxt/ccxt/pull/18855)


## 4.0.56

- fix(bingx): signature fix [#18849](https://github.com/ccxt/ccxt/pull/18849)
- cex Math -> Precise [#14858](https://github.com/ccxt/ccxt/pull/14858)


## 4.0.55

- bingx: update [#18836](https://github.com/ccxt/ccxt/pull/18836)
- fix(gemini): fix indexOf for php [#18834](https://github.com/ccxt/ccxt/pull/18834)
- bingx: patch parseTrade [#18833](https://github.com/ccxt/ccxt/pull/18833)
- fix(upbit): parseOrder - precise math [#18832](https://github.com/ccxt/ccxt/pull/18832)
- fix build: bingx python linting [#18838](https://github.com/ccxt/ccxt/pull/18838)
- fix(coinbasepro): add watchOrderBook authentication [#18837](https://github.com/ccxt/ccxt/pull/18837)
- different exchanges - Fetch order book snapshot retries [#18795](https://github.com/ccxt/ccxt/pull/18795)
- build: skip bingx orderbook check [#18839](https://github.com/ccxt/ccxt/pull/18839)
- fix(bug): python pong [#18843](https://github.com/ccxt/ccxt/pull/18843)
- fix(multiple-exchanges) - rename of maxRetries into snapshotMaxRetries [#18842](https://github.com/ccxt/ccxt/pull/18842)


## 4.0.54

- fix(huobi): authenticate [#18819](https://github.com/ccxt/ccxt/pull/18819)


## 4.0.53

- binance: add apis [#18821](https://github.com/ccxt/ccxt/pull/18821)
- bitget: add apis [#18820](https://github.com/ccxt/ccxt/pull/18820)
- fix(tests) - load markets [#18811](https://github.com/ccxt/ccxt/pull/18811)
- bit2c.createOrder string math [#14893](https://github.com/ccxt/ccxt/pull/14893)
- feat(binance): update id [#18823](https://github.com/ccxt/ccxt/pull/18823)
- fix(test) - markets [#18822](https://github.com/ccxt/ccxt/pull/18822)
- fix(bingx) - remove skip for loadmarkets [#18824](https://github.com/ccxt/ccxt/pull/18824)
- fix(bybit): postOnly handling [#18829](https://github.com/ccxt/ccxt/pull/18829)
- fix(test) - handling the temporary connectivity exception [#18825](https://github.com/ccxt/ccxt/pull/18825)


## 4.0.52

- Poloniex - allow multiple subscriptions [#18803](https://github.com/ccxt/ccxt/pull/18803)
- fix(tests) - exchangeId typo [#18802](https://github.com/ccxt/ccxt/pull/18802)
- feat(bingx): add spot ohlcv [#18807](https://github.com/ccxt/ccxt/pull/18807)
- fix(bkex) - error exchange not available [#18810](https://github.com/ccxt/ccxt/pull/18810)
- fix(coinex): parse timestamp with type int [#18813](https://github.com/ccxt/ccxt/pull/18813)
- fix(HuobiWs): authenticated streams in php [#18812](https://github.com/ccxt/ccxt/pull/18812)
- fix(tests) - remove percentage from trading fees [#18808](https://github.com/ccxt/ccxt/pull/18808)


## 4.0.50

- Mexc: update rateLimit weights [#18796](https://github.com/ccxt/ccxt/pull/18796)
- huobi: add apis [#18793](https://github.com/ccxt/ccxt/pull/18793)
- CANCELED order status fixed parse bingx.py [#18798](https://github.com/ccxt/ccxt/pull/18798)
- update changelog [ci skip] [#18801](https://github.com/ccxt/ccxt/pull/18801)
- base - move methods into transpilable area [#18790](https://github.com/ccxt/ccxt/pull/18790)
- fix(bittrex) - cosmetical changes to watchOrderBook [#18779](https://github.com/ccxt/ccxt/pull/18779)


## 4.0.49

- ContractUnavailable error type [#18674](https://github.com/ccxt/ccxt/pull/18674)
- fix(bitget): orderbook checksum [#18763](https://github.com/ccxt/ccxt/pull/18763)
- fix(bingx): add GTC by default for swap markets [#18765](https://github.com/ccxt/ccxt/pull/18765)
- fix(bittrex) - missing ohlcv [#18764](https://github.com/ccxt/ccxt/pull/18764)
- fix(bingx): default spot tif [#18773](https://github.com/ccxt/ccxt/pull/18773)
- woo: add apis [#18772](https://github.com/ccxt/ccxt/pull/18772)
- fix(delta): fundingRate scale [#18774](https://github.com/ccxt/ccxt/pull/18774)
- huobi: update fetchMyTrades [#18770](https://github.com/ccxt/ccxt/pull/18770)
- Bitget: update stopLoss and takeProfit implementation [#18760](https://github.com/ccxt/ccxt/pull/18760)
- fix(bitvavo): currency precision [#18777](https://github.com/ccxt/ccxt/pull/18777)
- feat(bingx): add standard futures [#18776](https://github.com/ccxt/ccxt/pull/18776)
- feat(deribit): add fetchFundingRate and fetchFundingRateHistory [#18781](https://github.com/ccxt/ccxt/pull/18781)
- build: skip bkex [#18784](https://github.com/ccxt/ccxt/pull/18784)
- feat(whitebit): add fundingRate methods [#18783](https://github.com/ccxt/ccxt/pull/18783)
- kucoin - has == false for unimplementable methods [#18788](https://github.com/ccxt/ccxt/pull/18788)
- feat(bitfinex2): add funding rate methods [#18782](https://github.com/ccxt/ccxt/pull/18782)
- fix(poloniex): cancelOrder error [#18792](https://github.com/ccxt/ccxt/pull/18792)
- build: skip coinbasepro/coinbaseprime watchOrderBook [#18791](https://github.com/ccxt/ccxt/pull/18791)


## 4.0.48

- kraken: add BalanceEx api [#18751](https://github.com/ccxt/ccxt/pull/18751)
- binance: add /papi/v1/asset-collection [#18750](https://github.com/ccxt/ccxt/pull/18750)
- Huobijp parseTrade string math [#18744](https://github.com/ccxt/ccxt/pull/18744)
- fix(kucoin) - networks re-enable with 1 retry [#18754](https://github.com/ccxt/ccxt/pull/18754)
- Okx limits [#18428](https://github.com/ccxt/ccxt/pull/18428)
- Bitfinex2 string math [#18415](https://github.com/ccxt/ccxt/pull/18415)
- bitget: add apis for copy trading [#18761](https://github.com/ccxt/ccxt/pull/18761)
- fix(bitfinex): handleOrderBook - string math [#18758](https://github.com/ccxt/ccxt/pull/18758)
- fix(gate): php parseOrder - fix  [#18757](https://github.com/ccxt/ccxt/pull/18757)


## 4.0.47

- fix(kucoin): orders using params["triggerPrice"] can be properly placed [#18745](https://github.com/ccxt/ccxt/pull/18745)
- Bitfinex pro parse trade string math [#18742](https://github.com/ccxt/ccxt/pull/18742)
- fix(blockchaincom): explicit types import [#18752](https://github.com/ccxt/ccxt/pull/18752)
- fix(bitmexWs): normalize orderbook amounts [#18753](https://github.com/ccxt/ccxt/pull/18753)


## 4.0.46

- feat(krakenfutures): add setLeverage and fetchLeverage [#18735](https://github.com/ccxt/ccxt/pull/18735)
- Paymium Add Currencies Endpoint [#18734](https://github.com/ccxt/ccxt/pull/18734)
- probit.createOrder string math [#18730](https://github.com/ccxt/ccxt/pull/18730)
- coinex withdraw takes params["network"] [#18729](https://github.com/ccxt/ccxt/pull/18729)
- fix(base): implicit TS imports [#18737](https://github.com/ccxt/ccxt/pull/18737)
- Bybit: createExpiredOptionMarket [#18731](https://github.com/ccxt/ccxt/pull/18731)
- fix(kucoin): disable webApi currencies endpoint [ci deploy] [#18738](https://github.com/ccxt/ccxt/pull/18738)


## 4.0.45

- feat(base): add position type [#18723](https://github.com/ccxt/ccxt/pull/18723)
- bitflyer.parseTransaction string math [#18728](https://github.com/ccxt/ccxt/pull/18728)


## 4.0.44

- feat(manual) - invalid api key errors [#18678](https://github.com/ccxt/ccxt/pull/18678)
- feat(kucoin) - standalone stop-loss & take-profit unification [#18694](https://github.com/ccxt/ccxt/pull/18694)
- fix(bitget): reapply historical positions changes [#18718](https://github.com/ccxt/ccxt/pull/18718)
- feat(lbank2) - withdraw true [#18720](https://github.com/ccxt/ccxt/pull/18720)
- feat(examples) - compare two exchange functionalities [#18719](https://github.com/ccxt/ccxt/pull/18719)
- feat(base) - fetchPositions for/by symbol - init [#18709](https://github.com/ccxt/ccxt/pull/18709)


## 4.0.43

- travis: add new proxy [#18696](https://github.com/ccxt/ccxt/pull/18696)
- feat(coinbasepro): add sandbox mode [#18701](https://github.com/ccxt/ccxt/pull/18701)
- update changelog [ci skip] [#18704](https://github.com/ccxt/ccxt/pull/18704)
- Bybit: fetchVolatilityHistory [#18695](https://github.com/ccxt/ccxt/pull/18695)
- docs: update instructions on how to check if postOnly orders are available [#18693](https://github.com/ccxt/ccxt/pull/18693)
- fix(binanceWs): fetchOpenOrdersWs symbol requirement removal [#18706](https://github.com/ccxt/ccxt/pull/18706)
- fix(bitfinex): signature [#18707](https://github.com/ccxt/ccxt/pull/18707)


## 4.0.42

- fix(bybit): ws spot orders parsing [#18692](https://github.com/ccxt/ccxt/pull/18692)
- fix(binance): orders trade fee for one order with multiple trades [#18686](https://github.com/ccxt/ccxt/pull/18686)
- pong-error handling for cryptocom [#18691](https://github.com/ccxt/ccxt/pull/18691)
- fix(bybit): update order status [#18697](https://github.com/ccxt/ccxt/pull/18697)


## 4.0.41

- removed delisted exchanges from manual [ci skip] [#18684](https://github.com/ccxt/ccxt/pull/18684)
- fix(test) - add code [#18689](https://github.com/ccxt/ccxt/pull/18689)
- Delta: finish swap and option support [#18687](https://github.com/ccxt/ccxt/pull/18687)


## 4.0.40

- fix(phemex): add contract size [#18670](https://github.com/ccxt/ccxt/pull/18670)
- fix(base) - badResponse [#18677](https://github.com/ccxt/ccxt/pull/18677)
- Delta: fetchSettlementHistory, createExpiredOptionMarket [#18675](https://github.com/ccxt/ccxt/pull/18675)
- fix(bequant) - add skip currency id [#18673](https://github.com/ccxt/ccxt/pull/18673)
- fix(binance) - editOrder for spot [#18672](https://github.com/ccxt/ccxt/pull/18672)
- feat(bitget): add history OHLCV candles [#18679](https://github.com/ccxt/ccxt/pull/18679)
- tests - with multiple retries [#18448](https://github.com/ccxt/ccxt/pull/18448)
- build: remove bybit proxy [#18680](https://github.com/ccxt/ccxt/pull/18680)


## 4.0.39

- feat(bitget): add privateMixGetPositionHistoryPosition [#18651](https://github.com/ccxt/ccxt/pull/18651)
- fix(bitstamp): 3d timeframe [#18652](https://github.com/ccxt/ccxt/pull/18652)
- fix(github-template) - short url [#18639](https://github.com/ccxt/ccxt/pull/18639)
- fix!(hitbtc): hitbtc3 renamed to hitbtc [#18658](https://github.com/ccxt/ccxt/pull/18658)
- Delta: fetchLeverage [#18661](https://github.com/ccxt/ccxt/pull/18661)
- feat(errors): added error type NoChange [#18660](https://github.com/ccxt/ccxt/pull/18660)
- gate setPositionMode implementation [#18659](https://github.com/ccxt/ccxt/pull/18659)
- feat(fmfwio): upgrade to v3 api [#18666](https://github.com/ccxt/ccxt/pull/18666)
- feat(base): add remaining and filled for closed orders [#18657](https://github.com/ccxt/ccxt/pull/18657)
- fix(base) - minor comment [#18656](https://github.com/ccxt/ccxt/pull/18656)
- Delta: setLeverage [#18655](https://github.com/ccxt/ccxt/pull/18655)
- feat(bequant): upgrade to v3 [#18669](https://github.com/ccxt/ccxt/pull/18669)


## 4.0.38

- Delta: fetchMarkOHLCV, fetchIndexOHLCV [#18644](https://github.com/ccxt/ccxt/pull/18644)
- update changelog [ci skip] [#18648](https://github.com/ccxt/ccxt/pull/18648)
- fix(python-base) - error badresponse [#18646](https://github.com/ccxt/ccxt/pull/18646)


## 4.0.36

- fix(coinex): setLeverage limits and refactor [#18635](https://github.com/ccxt/ccxt/pull/18635)
- feat(gate) - rate limit err [#18636](https://github.com/ccxt/ccxt/pull/18636)
- gate: add apis [#18632](https://github.com/ccxt/ccxt/pull/18632)
- binance: add apis [#18631](https://github.com/ccxt/ccxt/pull/18631)
- fix(base): protect filterBy agains undefined limit [#18628](https://github.com/ccxt/ccxt/pull/18628)
- github template - remove duplicate [ci skip] [#18638](https://github.com/ccxt/ccxt/pull/18638)


## 4.0.35

- coinex - ws - fetchOHLCV [#16517](https://github.com/ccxt/ccxt/pull/16517)
- okx: add apis [#18634](https://github.com/ccxt/ccxt/pull/18634)


## 4.0.34

- fix(okx): open interest timestamp [#18612](https://github.com/ccxt/ccxt/pull/18612)
- fix(base): emulated fetchMarketLeverageTiers [#18614](https://github.com/ccxt/ccxt/pull/18614)
- blockchaincom - unified networks list [#18563](https://github.com/ccxt/ccxt/pull/18563)
- bingx - skip [#18623](https://github.com/ccxt/ccxt/pull/18623)
- okx - deposit tag added [#18622](https://github.com/ccxt/ccxt/pull/18622)


## 4.0.33

- update changelog [ci skip] [#18610](https://github.com/ccxt/ccxt/pull/18610)
- feat(huobi): fetchOpenInterestHistory default required value [#18613](https://github.com/ccxt/ccxt/pull/18613)


## 4.0.32

- binance: add apis [#18603](https://github.com/ccxt/ccxt/pull/18603)
- Delta: fetchOpenInterest [#18605](https://github.com/ccxt/ccxt/pull/18605)
- Delta: addMargin, reduceMargin [#18604](https://github.com/ccxt/ccxt/pull/18604)
- bitget: add convert apis [#18602](https://github.com/ccxt/ccxt/pull/18602)
- mexc - unfied networks list [#18596](https://github.com/ccxt/ccxt/pull/18596)
- fix(kucoin): add kyc error [#18608](https://github.com/ccxt/ccxt/pull/18608)
- hollaex - fetchDepositWithdrawFees [#18560](https://github.com/ccxt/ccxt/pull/18560)


## 4.0.31

- hitbtc3 - removal trx [#18595](https://github.com/ccxt/ccxt/pull/18595)
- fix(bitfinex2): protect handleErrors [#18601](https://github.com/ccxt/ccxt/pull/18601)


## 4.0.30

- bitmex - networks list [#18574](https://github.com/ccxt/ccxt/pull/18574)
- bigone - networks list [#18573](https://github.com/ccxt/ccxt/pull/18573)
- okx - networks list [#18565](https://github.com/ccxt/ccxt/pull/18565)
- update changelog [ci skip] [#18589](https://github.com/ccxt/ccxt/pull/18589)
- mexc error remapping [#18588](https://github.com/ccxt/ccxt/pull/18588)
- bitmart - networks list [#18568](https://github.com/ccxt/ccxt/pull/18568)
- hitbtc3 - all networks list [#18567](https://github.com/ccxt/ccxt/pull/18567)
- fix(base): python exchange ws close [ci deploy] [#18591](https://github.com/ccxt/ccxt/pull/18591)
- Bump word-wrap from 1.2.3 to 1.2.4 [#18597](https://github.com/ccxt/ccxt/pull/18597)


## 4.0.29

- fix(bitget): margin account endpoints [#18581](https://github.com/ccxt/ccxt/pull/18581)
- base - missing python error [#18572](https://github.com/ccxt/ccxt/pull/18572)
- base - minor corrections [#18569](https://github.com/ccxt/ccxt/pull/18569)
- Fetch transactions deposits withdrawals name swap [#18466](https://github.com/ccxt/ccxt/pull/18466)
- tests - simplify run-tests [#18449](https://github.com/ccxt/ccxt/pull/18449)
- fix(Bitbay,bitcoincom): set correct name [#18585](https://github.com/ccxt/ccxt/pull/18585)
- Okx: fetchSettlementHistory, handle expired market id [#18587](https://github.com/ccxt/ccxt/pull/18587)
- multiple exchanges - removal of networksById [#18575](https://github.com/ccxt/ccxt/pull/18575)


## 4.0.28

- update changelog [ci skip] [#18570](https://github.com/ccxt/ccxt/pull/18570)
- huobi: add apis [#18579](https://github.com/ccxt/ccxt/pull/18579)
- binance: add apis [#18577](https://github.com/ccxt/ccxt/pull/18577)


## 4.0.27



## 4.0.26

- networks by id autogenerate [#18525](https://github.com/ccxt/ccxt/pull/18525)
- fix(gate) - remove createDepositAddress [#18562](https://github.com/ccxt/ccxt/pull/18562)
- Okx: editOrder, remove market type restriction [#18564](https://github.com/ccxt/ccxt/pull/18564)
- kucoin: update margin trading / lending to v3 [#18545](https://github.com/ccxt/ccxt/pull/18545)


## 4.0.24



## 4.0.23

- BingX Integration [ci deploy] [#17924](https://github.com/ccxt/ccxt/pull/17924)


## 4.0.22

- feat(okx): watchTickers, watchMyTrades, createOrderWs, cancelOrderWs,… [ci deploy] [#18558](https://github.com/ccxt/ccxt/pull/18558)


## 4.0.21

- added coinbase advanced trade websocket class [#16871](https://github.com/ccxt/ccxt/pull/16871)
- Delta: fetchFundingRate, fetchFundingRates [#18554](https://github.com/ccxt/ccxt/pull/18554)
- bitget: patch fetchPosition ccxt/ccxt#18546 [#18553](https://github.com/ccxt/ccxt/pull/18553)
- kucoin - correction of networknames [#18548](https://github.com/ccxt/ccxt/pull/18548)
- bitget fetchCurrencies enhancement [#18531](https://github.com/ccxt/ccxt/pull/18531)
- Coinbase advanced trade web sockets [#18518](https://github.com/ccxt/ccxt/pull/18518)
- feat(okx): add eth options [#18557](https://github.com/ccxt/ccxt/pull/18557)


## 4.0.19

- fix(bitmex): parseTransaction network parsing [#18538](https://github.com/ccxt/ccxt/pull/18538)
- kucoinfutures certified = true [#18540](https://github.com/ccxt/ccxt/pull/18540)
- Delta: adjust option naming [#18537](https://github.com/ccxt/ccxt/pull/18537)
- fix(bybit): fetchPosition crash [#18544](https://github.com/ccxt/ccxt/pull/18544)
- feat(base) - mute web api failure (includes kucoin) [#18534](https://github.com/ccxt/ccxt/pull/18534)
- Delta: fetchTicker, fetchTickers, add bid and ask data [#18542](https://github.com/ccxt/ccxt/pull/18542)


## 4.0.18

- Bybit: fetchSettlementHistory [#18520](https://github.com/ccxt/ccxt/pull/18520)
- fix(huobi): remove fetchOrders/fetchClosedOrders dynamic calls [#18526](https://github.com/ccxt/ccxt/pull/18526)
- update changelog [ci skip] [#18529](https://github.com/ccxt/ccxt/pull/18529)
- bitfinex2 transaction status [#18528](https://github.com/ccxt/ccxt/pull/18528)


## 4.0.17

- binance: update apis [#18505](https://github.com/ccxt/ccxt/pull/18505)
- feat(kraken): add transfer and transferOut [#18517](https://github.com/ccxt/ccxt/pull/18517)
- Bybit: option support [#18521](https://github.com/ccxt/ccxt/pull/18521)


## 4.0.16

- fix(huobi): createContractOrder and createSpotOrder casing [#18514](https://github.com/ccxt/ccxt/pull/18514)
- fix(bybit): v5 :: creatOrder :: option markets [#18516](https://github.com/ccxt/ccxt/pull/18516)
- fix(Exchange.php): filterByLimit fix [ci deploy] [#18515](https://github.com/ccxt/ccxt/pull/18515)


## 4.0.15

- update changelog [ci skip] [#18513](https://github.com/ccxt/ccxt/pull/18513)
- okx: add apis [#18512](https://github.com/ccxt/ccxt/pull/18512)
- huobi: add apis [#18511](https://github.com/ccxt/ccxt/pull/18511)
- bybit: add apis [#18509](https://github.com/ccxt/ccxt/pull/18509)
- bitget: add apis [#18508](https://github.com/ccxt/ccxt/pull/18508)
- Bybit: fetchMarkets, add ETH and SOL option markets [#18502](https://github.com/ccxt/ccxt/pull/18502)


## 4.0.14

- fix(base): add fetchOpenInterest [#18504](https://github.com/ccxt/ccxt/pull/18504)
- feat(cryptocom): add ws trading api [#18485](https://github.com/ccxt/ccxt/pull/18485)


## 4.0.13

- add errors [#18488](https://github.com/ccxt/ccxt/pull/18488)
- deribit - fetchCurrencies [#18483](https://github.com/ccxt/ccxt/pull/18483)
- docs: add pro functions to api spec [#18476](https://github.com/ccxt/ccxt/pull/18476)
- fix(Exchange.py): fix camelCase props merging [ci deploy] [#18499](https://github.com/ccxt/ccxt/pull/18499)
- Crypto.com: migrate websockets to the unified API [#18492](https://github.com/ccxt/ccxt/pull/18492)
- Huobi create order for margin orders [#18457](https://github.com/ccxt/ccxt/pull/18457)


## 4.0.12

- update changelog [ci skip] [#18493](https://github.com/ccxt/ccxt/pull/18493)
- Crypto.com: fetchDeposits, migrate to the unified API [#18490](https://github.com/ccxt/ccxt/pull/18490)


## 4.0.11

- deribit - fetchDepositWithdrawFees [#18482](https://github.com/ccxt/ccxt/pull/18482)
- update manual fee section [#18472](https://github.com/ccxt/ccxt/pull/18472)
- kucoin - add chains in fetchCurrencies  [#18470](https://github.com/ccxt/ccxt/pull/18470)
- fix(base): ffilterBySinceLimit [ci deploy] [#18486](https://github.com/ccxt/ccxt/pull/18486)


## 4.0.10

- Luno update API [#18399](https://github.com/ccxt/ccxt/pull/18399)
- fix(base): fix uncatchable error in ws - fix #18445 [#18479](https://github.com/ccxt/ccxt/pull/18479)
- kucoin - networks unification [#16237](https://github.com/ccxt/ccxt/pull/16237)
- fix(base): protect filterByValueSinceLimit and protect filterBySinceLimit [ci deploy] [#18480](https://github.com/ccxt/ccxt/pull/18480)


## 4.0.9

- Crypto.com: fetchWithdrawals, migrate to the unified API [#18477](https://github.com/ccxt/ccxt/pull/18477)
- okx: add apis [#18442](https://github.com/ccxt/ccxt/pull/18442)


## 4.0.8

- woo: remove apis GET /v1/client/info [#18469](https://github.com/ccxt/ccxt/pull/18469)
- novadax: update jsdoc [#18468](https://github.com/ccxt/ccxt/pull/18468)
- oceanex: update jsdoc [#18467](https://github.com/ccxt/ccxt/pull/18467)
- bitget parseTransaction edits [#18463](https://github.com/ccxt/ccxt/pull/18463)
- gate: add apis [#18392](https://github.com/ccxt/ccxt/pull/18392)
- bitvavo - networks unification [#16526](https://github.com/ccxt/ccxt/pull/16526)
- feat(binance): add support for websocket trading [#18339](https://github.com/ccxt/ccxt/pull/18339)
- Revert "multilang-edit" [#18453](https://github.com/ccxt/ccxt/pull/18453)


## 4.0.7

- add changelog [ci skip] [#18460](https://github.com/ccxt/ccxt/pull/18460)
- fix(throttler) - unified names in php [#18436](https://github.com/ccxt/ccxt/pull/18436)
- probit fetchDepositsWithdrawals true [#18461](https://github.com/ccxt/ccxt/pull/18461)


## 4.0.6

- bitget: add apis [#18458](https://github.com/ccxt/ccxt/pull/18458)


## 4.0.5

- Coinbase: fetchBidsAsks [#18455](https://github.com/ccxt/ccxt/pull/18455)


## 4.0.4

- alpaca - skip [#18444](https://github.com/ccxt/ccxt/pull/18444)
- fix(base): fetchTime -> fetch_Time [#18443](https://github.com/ccxt/ccxt/pull/18443)
- bitget: add apis [#18440](https://github.com/ccxt/ccxt/pull/18440)
- binance: add apis [#18439](https://github.com/ccxt/ccxt/pull/18439)
- okx - add method for fetchTrades [#18435](https://github.com/ccxt/ccxt/pull/18435)
- fix(bybit): watchOrders [ci deploy] [#18447](https://github.com/ccxt/ccxt/pull/18447)
- fix(base): fix handleOptionAndParams [#18446](https://github.com/ccxt/ccxt/pull/18446)
- bigone - fetchDepositAddress & withdraw [#18316](https://github.com/ccxt/ccxt/pull/18316)
- bitstamp - skip bid ask [#18451](https://github.com/ccxt/ccxt/pull/18451)
- build: disable ascendex [#18452](https://github.com/ccxt/ccxt/pull/18452)
- fix(watchOrders): filterBySymbolSinceLimit call [#18450](https://github.com/ccxt/ccxt/pull/18450)


## 4.0.3

- Crypto.com: set swap, future and option to true [#18430](https://github.com/ccxt/ccxt/pull/18430)
- feat(huobi): add id to implicit calls [#18426](https://github.com/ccxt/ccxt/pull/18426)
- Crypto.com: withdraw, migrate to the unified API [#18429](https://github.com/ccxt/ccxt/pull/18429)
- base-  remove old build remnants [ci skip] [#18423](https://github.com/ccxt/ccxt/pull/18423)
- add changelog manually [ci skip] [#18432](https://github.com/ccxt/ccxt/pull/18432)
- coinph: add apis [#18397](https://github.com/ccxt/ccxt/pull/18397)
- feat(gate): fix fetchOpenInterestHistory [#18433](https://github.com/ccxt/ccxt/pull/18433)
- Proxy  - reorganization [ci skip] [#18409](https://github.com/ccxt/ccxt/pull/18409)
- Bigone - fetch currencies (+networks unification) [#18299](https://github.com/ccxt/ccxt/pull/18299)


## 3.1.60



## 3.1.59

- phemex parseTicker fix [#18424](https://github.com/ccxt/ccxt/pull/18424)
- Generate docs markdown for each exchange [#18061](https://github.com/ccxt/ccxt/pull/18061)


## 3.1.58

- probit fetchMyTrades fix [#18404](https://github.com/ccxt/ccxt/pull/18404)
- delta: add apis [#18417](https://github.com/ccxt/ccxt/pull/18417)
- Coinbase: fetchOrderBook [#18414](https://github.com/ccxt/ccxt/pull/18414)
- lbank2 fetchMyTrades fix [#18407](https://github.com/ccxt/ccxt/pull/18407)
- Update Private API Menu Manual [ci skip] [#18418](https://github.com/ccxt/ccxt/pull/18418)
- Latoken parse transaction [#18410](https://github.com/ccxt/ccxt/pull/18410)
- base - python proxies  fix [#18419](https://github.com/ccxt/ccxt/pull/18419)
- fix(okx): signature id fix [ci deploy] [#18421](https://github.com/ccxt/ccxt/pull/18421)
- feat(base) - transpiler add startsWith endsWith [#18422](https://github.com/ccxt/ccxt/pull/18422)


## 3.1.56

- examples - proxy edit [ci skip] [#18395](https://github.com/ccxt/ccxt/pull/18395)
- Crypto.com: fetchPosition, fetchPositions [#18396](https://github.com/ccxt/ccxt/pull/18396)
- coinbase: add apis [#18398](https://github.com/ccxt/ccxt/pull/18398)
- phemex parseTrade fix [#18400](https://github.com/ccxt/ccxt/pull/18400)
- Luno use this.parseNumber in parseLedgerEntry  [#18401](https://github.com/ccxt/ccxt/pull/18401)
- fix(binance): id fix [ci deploy] [#18403](https://github.com/ccxt/ccxt/pull/18403)
- build: disable huobijp [ci deploy] [#18405](https://github.com/ccxt/ccxt/pull/18405)
- fix(okx): add id to sign [ci deploy] [#18406](https://github.com/ccxt/ccxt/pull/18406)


## 3.1.55

- TRACE commonCurrencies conflict [#18388](https://github.com/ccxt/ccxt/pull/18388)
- okx - fix limited premature ending [#18264](https://github.com/ccxt/ccxt/pull/18264)
- build: fix python formatting [#18391](https://github.com/ccxt/ccxt/pull/18391)


## 3.1.54

- examples: all_open_rders => all_open_orders [#18357](https://github.com/ccxt/ccxt/pull/18357)
- kraken: add create / close a position example [#18356](https://github.com/ccxt/ccxt/pull/18356)
- examples - stop-loss/take-profit minor correction [#18323](https://github.com/ccxt/ccxt/pull/18323)
- Woo: add stopOrders support  [#18379](https://github.com/ccxt/ccxt/pull/18379)
- Wavesexchange - fetchDepositWithdrawFees [#18383](https://github.com/ccxt/ccxt/pull/18383)
- Crypto.com: fetchFundingRateHistory [#18384](https://github.com/ccxt/ccxt/pull/18384)
- feat(kraken): add postOnly support [#18389](https://github.com/ccxt/ccxt/pull/18389)


## 3.1.53

- Update luno.ts fetchTradingFee [#18353](https://github.com/ccxt/ccxt/pull/18353)
- bybit: add apis [#18352](https://github.com/ccxt/ccxt/pull/18352)
- okx - add endpoints [#18350](https://github.com/ccxt/ccxt/pull/18350)
- Crypto.com: fetchSettlementHistory [#18333](https://github.com/ccxt/ccxt/pull/18333)
- bitmex-fetchDepositWithdrawFees [#18324](https://github.com/ccxt/ccxt/pull/18324)
- fix(bitmex): spot/currencies precisions [ci deploy] [#18089](https://github.com/ccxt/ccxt/pull/18089)


## 3.1.52

- fix(deribit): removed spot duplicated markets [#18348](https://github.com/ccxt/ccxt/pull/18348)
- kucoin-fetchDepositWithdrawFees [#18326](https://github.com/ccxt/ccxt/pull/18326)
- fix(Exchange): remove conflicting error message [#18355](https://github.com/ccxt/ccxt/pull/18355)


## 3.1.51

- feat(krakenfutures): add lastUpdateTimestamp [#18341](https://github.com/ccxt/ccxt/pull/18341)
- fix(mexc): change marginType to marginMode [#18345](https://github.com/ccxt/ccxt/pull/18345)
- Gemini -  fetchDepositAddress [w] (+ networks) [#18317](https://github.com/ccxt/ccxt/pull/18317)


## 3.1.50

- fetchDepositWithdrawFees params typo fix [#18327](https://github.com/ccxt/ccxt/pull/18327)
- add codes type fetchDepositWithdrawFees [#18325](https://github.com/ccxt/ccxt/pull/18325)
- gemini - fetchCurrencies (+networks unification) [#18235](https://github.com/ccxt/ccxt/pull/18235)
- Crypto.com: fetchDepositAddressesByNetwork, migrate to the unified API [#18332](https://github.com/ccxt/ccxt/pull/18332)
- build: update decimalToPrecision links [#18336](https://github.com/ccxt/ccxt/pull/18336)
- fix(krakenfutures): charts sandbox api [#18337](https://github.com/ccxt/ccxt/pull/18337)


## 3.1.49

- Proxies Unification [#16987](https://github.com/ccxt/ccxt/pull/16987)
- Crypto.com: fetchOrderBook, migrate to the unified API [#18321](https://github.com/ccxt/ccxt/pull/18321)
- Crypto.com: fetchAccounts [#18318](https://github.com/ccxt/ccxt/pull/18318)
- Crypto.com: createOrder, migrate to the unified API [#18230](https://github.com/ccxt/ccxt/pull/18230)
- base - setSandboxMode transpilation [#18250](https://github.com/ccxt/ccxt/pull/18250)
- bitget: add tax apis [#18320](https://github.com/ccxt/ccxt/pull/18320)
- binance: add new apis [#18319](https://github.com/ccxt/ccxt/pull/18319)


## 3.1.48

- okx - createOrder js doc update type 3 [#18302](https://github.com/ccxt/ccxt/pull/18302)
- phemex createOrder - type 3 [#18282](https://github.com/ccxt/ccxt/pull/18282)
- Crypto.com: fetchTickers, migrate to the unified API [#18306](https://github.com/ccxt/ccxt/pull/18306)
- Crypto.com: fetchLedger [#18307](https://github.com/ccxt/ccxt/pull/18307)
- bybit - fetchDepositWithdrawFees [#18308](https://github.com/ccxt/ccxt/pull/18308)
- Bittrex fetchDepositWithdrawFees [#18295](https://github.com/ccxt/ccxt/pull/18295)
- Zonda fetch ticker v2 [#18273](https://github.com/ccxt/ccxt/pull/18273)


## 3.1.47

- feat(bitget,bybit,kucoinfutures,okx): add lastUpdateTimestamp to order [#18287](https://github.com/ccxt/ccxt/pull/18287)
- binance: add apis [#18292](https://github.com/ccxt/ccxt/pull/18292)
- docs: add ws trading functions [#18288](https://github.com/ccxt/ccxt/pull/18288)
- bybit: add apis [#18283](https://github.com/ccxt/ccxt/pull/18283)
- update has bitopro fetchDepositWithdrawFees [#18298](https://github.com/ccxt/ccxt/pull/18298)
- fetchDepositsWithdrawals [#18291](https://github.com/ccxt/ccxt/pull/18291)
- bitvavo-fetchDepositWithdrawFees [#18297](https://github.com/ccxt/ccxt/pull/18297)
- fix(pro): base exchange import [#18301](https://github.com/ccxt/ccxt/pull/18301)
- feat(xt): add lastUpdateTimestamp [#18303](https://github.com/ccxt/ccxt/pull/18303)
- hitbtc/3 - skip id code [#18300](https://github.com/ccxt/ccxt/pull/18300)


## 3.1.46

- Crypto.com: fetchOHLCV, migrate to the unified API [#18279](https://github.com/ccxt/ccxt/pull/18279)
- okx: add apis [#18277](https://github.com/ccxt/ccxt/pull/18277)
- Poloniex watch tickers [#18276](https://github.com/ccxt/ccxt/pull/18276)
- fix(binance): handle ws order's updateTimestamp [#18275](https://github.com/ccxt/ccxt/pull/18275)
- added skips [ci skip] [#18255](https://github.com/ccxt/ccxt/pull/18255)
- examples - stoploss & takeprofit - transpilable [#18280](https://github.com/ccxt/ccxt/pull/18280)
- bitget: add apis [#18284](https://github.com/ccxt/ccxt/pull/18284)
- base - NUMBER CONSTANTS [#17032](https://github.com/ccxt/ccxt/pull/17032)
- github: remove default assignment [ci skip] [#18286](https://github.com/ccxt/ccxt/pull/18286)
- temporary enable of debug [ci skip] [#18285](https://github.com/ccxt/ccxt/pull/18285)
- poloniex error mapping [#18293](https://github.com/ccxt/ccxt/pull/18293)
- Crypto.com: fetchBalance, migrate to the unified API [#18289](https://github.com/ccxt/ccxt/pull/18289)
- Bitopro fetchDepositWithdrawFees [#18294](https://github.com/ccxt/ccxt/pull/18294)


## 3.1.45

- feat(binance): cancelAllOrders jsdoc [ci skip] [#18270](https://github.com/ccxt/ccxt/pull/18270)
- Crypto.com: fetchTrades, fetchMyTrades, migrate to the unified API [#18256](https://github.com/ccxt/ccxt/pull/18256)
- Update types.py [#18261](https://github.com/ccxt/ccxt/pull/18261)
- bitget-fetchDepositWithdrawFees [#18272](https://github.com/ccxt/ccxt/pull/18272)
- ascendex `fetchDepositWithdrawFees` [#18271](https://github.com/ccxt/ccxt/pull/18271)
- kraken - ws - place orders [#16567](https://github.com/ccxt/ccxt/pull/16567)
- ascendex: add apis [#18278](https://github.com/ccxt/ccxt/pull/18278)


## 3.1.44

- Crypto.com: fetchOrders, migrate to the unified API [#18241](https://github.com/ccxt/ccxt/pull/18241)
- Crypto.com: fetchOrder, migrate to the unified API [#18239](https://github.com/ccxt/ccxt/pull/18239)
- fix(binance): php testnet [#18266](https://github.com/ccxt/ccxt/pull/18266)


## 3.1.43

- huobi: add error code [#18262](https://github.com/ccxt/ccxt/pull/18262)


## 3.1.42

- Exmo fetchCurrencies string math [#18244](https://github.com/ccxt/ccxt/pull/18244)
- Crypto.com: cancelAllOrders, migrate to the unified API [#18243](https://github.com/ccxt/ccxt/pull/18243)
- Crypto.com: fetchOpenOrders, migrate to the unified API [#18238](https://github.com/ccxt/ccxt/pull/18238)
- Crypto.com: cancelOrder, migrate to the unified API [#18242](https://github.com/ccxt/ccxt/pull/18242)
- Ws method stubs [#18081](https://github.com/ccxt/ccxt/pull/18081)
- build: disable currencycom [#18260](https://github.com/ccxt/ccxt/pull/18260)


## 3.1.41

- transpiler makes decision to transpile based on mtime difference in seconds instead of milliseconds [#18229](https://github.com/ccxt/ccxt/pull/18229)
- [krakenfutures] fix fundingRate to return relative value [#18218](https://github.com/ccxt/ccxt/pull/18218)
- okx - fetchTransfers [#18213](https://github.com/ccxt/ccxt/pull/18213)
- xt - fetch currencies [#18202](https://github.com/ccxt/ccxt/pull/18202)
- bitmex: add apis [#18201](https://github.com/ccxt/ccxt/pull/18201)
- lbank fetchMarkets fix [#18236](https://github.com/ccxt/ccxt/pull/18236)


## 3.1.40

- bybit: use start in ws ohlcv stream [#18186](https://github.com/ccxt/ccxt/pull/18186)
- Gate: fetchOHLCV, add option support [#18129](https://github.com/ccxt/ccxt/pull/18129)
- Probit fetchTransactions, fetchDeposits, fetchWithdrawals according to pr#18210 [#18228](https://github.com/ccxt/ccxt/pull/18228)
- feat(probit): add flags [#18231](https://github.com/ccxt/ccxt/pull/18231)
- bybit: patch fetchOrders ccxt/ccxt#18234 [#18240](https://github.com/ccxt/ccxt/pull/18240)
- base transpile - replaceAll & trim [#18237](https://github.com/ccxt/ccxt/pull/18237)
- fix(xt): error handling when response is undefined [#18249](https://github.com/ccxt/ccxt/pull/18249)
- currencycom & gemini - skip-tests  [#18248](https://github.com/ccxt/ccxt/pull/18248)
- bybit: add broker api [#18246](https://github.com/ccxt/ccxt/pull/18246)


## 3.1.38

- base  - async python math import [#18214](https://github.com/ccxt/ccxt/pull/18214)
- private tests: fix runtime errors for Python and PHP. [#18220](https://github.com/ccxt/ccxt/pull/18220)
- build: fix WS regular transpiling [ci skip] [#18224](https://github.com/ccxt/ccxt/pull/18224)
- fix(bybit): fetchTickers parsing [#18223](https://github.com/ccxt/ccxt/pull/18223)
- fix(cli.py): support sync calls [ci skip] [#18225](https://github.com/ccxt/ccxt/pull/18225)
- feat(Crypto.com): fetchMarkets, migrate to the unified API [#18203](https://github.com/ccxt/ccxt/pull/18203)


## 3.1.37

- probit new endpoint [#18210](https://github.com/ccxt/ccxt/pull/18210)


## 3.1.36

- wavesexchange - add precision mode [#18197](https://github.com/ccxt/ccxt/pull/18197)
- [krakenfutures] fetchFundingRate(s) [#18191](https://github.com/ccxt/ccxt/pull/18191)
- [base] Exchange.fetchFundingRate normalize symbol [#18205](https://github.com/ccxt/ccxt/pull/18205)
- fix(bitget): fetchTickers parsing [#18207](https://github.com/ccxt/ccxt/pull/18207)
- Add status for bitso [#18206](https://github.com/ccxt/ccxt/pull/18206)
- Added support for LDO and DGLD [#18204](https://github.com/ccxt/ccxt/pull/18204)
- fix(bitfinex2): fix #18169 - fix partially filled status [#18170](https://github.com/ccxt/ccxt/pull/18170)
- fix(bitget): executePrice not required when type is market [ci deploy] [#18212](https://github.com/ccxt/ccxt/pull/18212)


## 3.1.35

- woo: add apis [#18188](https://github.com/ccxt/ccxt/pull/18188)
- Gate: change option websocket URL values [#18198](https://github.com/ccxt/ccxt/pull/18198)


## 3.1.34

- binance - fetchLastPrices fix [#18182](https://github.com/ccxt/ccxt/pull/18182)
- fix(binance): handle order's timestamp properly [#18175](https://github.com/ccxt/ccxt/pull/18175)
- bitbank: add apis [#18190](https://github.com/ccxt/ccxt/pull/18190)
- binance: add apis [#18189](https://github.com/ccxt/ccxt/pull/18189)


## 3.1.33

- Gate: add option support [#18172](https://github.com/ccxt/ccxt/pull/18172)
- feat(gate): add networks [#18137](https://github.com/ccxt/ccxt/pull/18137)
- Fix: mexc broker api url in js [#18179](https://github.com/ccxt/ccxt/pull/18179)
- binance - fetchLastPrices remove bv & qv [#18184](https://github.com/ccxt/ccxt/pull/18184)


## 3.1.32

- Correct FAQ to cite TS as source language [#18173](https://github.com/ccxt/ccxt/pull/18173)
- feat(bybit): add pagination cursor  [#18174](https://github.com/ccxt/ccxt/pull/18174)


## 3.1.31

- fix(build): take exchanges.cfg into consideration [#18156](https://github.com/ccxt/ccxt/pull/18156)
- bybit: add get affiliate user info api [#18159](https://github.com/ccxt/ccxt/pull/18159)
- fix(gate): fix status for partially filled [#18157](https://github.com/ccxt/ccxt/pull/18157)
- Gate: fetchTicker, fetchTickers, add option support [#18158](https://github.com/ccxt/ccxt/pull/18158)
- binance.addMargin amountToPrecision changed to costToPrecision [#18163](https://github.com/ccxt/ccxt/pull/18163)


## 3.1.30

- bitforex fetchMyTrades since edit [#18141](https://github.com/ccxt/ccxt/pull/18141)
- bitstamp fetchTickers [#18140](https://github.com/ccxt/ccxt/pull/18140)
- feat(bybit): add clientOrderId support to fetchOrderTrades [#18149](https://github.com/ccxt/ccxt/pull/18149)
- waves  - precision prop fix [#14910](https://github.com/ccxt/ccxt/pull/14910)
- bitmex - fetchticker [#18153](https://github.com/ccxt/ccxt/pull/18153)
- fix(bybit): restore options loading [#18151](https://github.com/ccxt/ccxt/pull/18151)


## 3.1.29

- binance: update apis [#18144](https://github.com/ccxt/ccxt/pull/18144)


## 3.1.28

- Fix private tests args. [#18138](https://github.com/ccxt/ccxt/pull/18138)
- bitforex new endpoints, fetchMyTrades [#18139](https://github.com/ccxt/ccxt/pull/18139)
- Gate: fetchLedger [#18145](https://github.com/ccxt/ccxt/pull/18145)


## 3.1.27

- fix(base): several typescript types fixes  [#18136](https://github.com/ccxt/ccxt/pull/18136)


## 3.1.26

- feat(base): watchTicker emulate from watchTickers [#18126](https://github.com/ccxt/ccxt/pull/18126)


## 3.1.25

- Gate: fetchSettlementHistory [#18132](https://github.com/ccxt/ccxt/pull/18132)


## 3.1.24

- fix(xt): swap orders amount precision [#18124](https://github.com/ccxt/ccxt/pull/18124)
- fix(binance): watchTickers non recurssion [#18123](https://github.com/ccxt/ccxt/pull/18123)
- bitget: add mix apis [#18119](https://github.com/ccxt/ccxt/pull/18119)


## 3.1.23

- bybit: add api privateGetV5CustomerInfo [#18118](https://github.com/ccxt/ccxt/pull/18118)
- fix(xt): body id [#18121](https://github.com/ccxt/ccxt/pull/18121)
- base - emulated fetch ohlcv removal [#17966](https://github.com/ccxt/ccxt/pull/17966)
- poloniex fetchCurrencies networks added [#18098](https://github.com/ccxt/ccxt/pull/18098)
- currencycom - fetch order [#18120](https://github.com/ccxt/ccxt/pull/18120)
- bitget: add swap order fee [#18070](https://github.com/ccxt/ccxt/pull/18070)


## 3.1.21

- examples: fix ccxt and ologog import [ci skip] [#18115](https://github.com/ccxt/ccxt/pull/18115)
- bitstamp new endpoints [#18116](https://github.com/ccxt/ccxt/pull/18116)


## 3.1.20

- Delist Stex.com [#18110](https://github.com/ccxt/ccxt/pull/18110)
- Coinsph: skip quoteVolume check [#18111](https://github.com/ccxt/ccxt/pull/18111)
- fix(binance): fix #18078 canceled timestamp [#18107](https://github.com/ccxt/ccxt/pull/18107)
- Typo at okex-transfer.py [#18114](https://github.com/ccxt/ccxt/pull/18114)
- eslint produces errors accoding to its smart rules [ci skip] [#18090](https://github.com/ccxt/ccxt/pull/18090)
- binance convert/tradeFlow API weigth cost fix. [#18113](https://github.com/ccxt/ccxt/pull/18113)


## 3.1.19

- base - build ohlcvc [#14844](https://github.com/ccxt/ccxt/pull/14844)
- bitmex - comments [ci skip] [#18103](https://github.com/ccxt/ccxt/pull/18103)
- bitget: update timeInForce in createOrder [#18067](https://github.com/ccxt/ccxt/pull/18067)
- Gate: fetchOrderBook, add option support [#18106](https://github.com/ccxt/ccxt/pull/18106)
- bitmex - deposit in parseTransaction [#18105](https://github.com/ccxt/ccxt/pull/18105)


## 3.1.18

- Gate: fetchMyTrades, add option support [#18102](https://github.com/ccxt/ccxt/pull/18102)
- Gate: fetchPosition, fetchPositions, add option support [#18092](https://github.com/ccxt/ccxt/pull/18092)


## 3.1.17

- kucoin: update hf apis [ci deploy] [#18095](https://github.com/ccxt/ccxt/pull/18095)


## 3.1.16

- fix(whitebit): add pro flag [#18094](https://github.com/ccxt/ccxt/pull/18094)
- base - missing name [#18093](https://github.com/ccxt/ccxt/pull/18093)


## 3.1.15

- bitopro: update signature ccxt/ccxt#17404 [#18069](https://github.com/ccxt/ccxt/pull/18069)
- bitget: add swap apis [#18068](https://github.com/ccxt/ccxt/pull/18068)
- Gate: fetchBalance, add option support [#18065](https://github.com/ccxt/ccxt/pull/18065)
- fix(Readme): update nuget link [ci skip] [#18075](https://github.com/ccxt/ccxt/pull/18075)
- python base - fix [#18080](https://github.com/ccxt/ccxt/pull/18080)
- bitrue fetchCurrencies enhancement [#18077](https://github.com/ccxt/ccxt/pull/18077)
- Gate: cancelOrder, cancelAllOrders, add option support [#18086](https://github.com/ccxt/ccxt/pull/18086)
- Gate: createOrder, add option support [#18083](https://github.com/ccxt/ccxt/pull/18083)
- Gate: fetchOrder, fetchOrdersByStatus, add option support [#18085](https://github.com/ccxt/ccxt/pull/18085)
- mexc: add broker api [#18087](https://github.com/ccxt/ccxt/pull/18087)
- build: disable stex [ci skip] [#18088](https://github.com/ccxt/ccxt/pull/18088)
- feat(coinone):  replace endpoint for fetch orders to use query order instead of deprecated endpoint [#17205](https://github.com/ccxt/ccxt/pull/17205)
- woo: add broker id [#18084](https://github.com/ccxt/ccxt/pull/18084)


## 3.1.14

- fix(filterByLimit): restore tail argument in the PRO side [#18058](https://github.com/ccxt/ccxt/pull/18058)
- fix(huobi) - add tx 0x to eth network withdrawals [#18050](https://github.com/ccxt/ccxt/pull/18050)
- fix(krakenfutures): handle pong event properly [#18062](https://github.com/ccxt/ccxt/pull/18062)
- poloniex web sockets [ci deploy] [#16886](https://github.com/ccxt/ccxt/pull/16886)
- fix #17686 [#18063](https://github.com/ccxt/ccxt/pull/18063)
- build: okx skip quoteVolume check [#18071](https://github.com/ccxt/ccxt/pull/18071)
- build: disable ace [#18072](https://github.com/ccxt/ccxt/pull/18072)


## 3.1.13

- fix(coinex): watchTickers - new watchTickers implementation [#18023](https://github.com/ccxt/ccxt/pull/18023)
- feat: allow check for market type of symbols [#18052](https://github.com/ccxt/ccxt/pull/18052)
- fix(binance): editOrder ws timestamp, fix #18051 [#18055](https://github.com/ccxt/ccxt/pull/18055)
- test - typo fixes [#18021](https://github.com/ccxt/ccxt/pull/18021)
- fix #17749: `watchOHLCV` don't have `timeFrame` param in docs [#18057](https://github.com/ccxt/ccxt/pull/18057)


## 3.1.10

- fix(binance): fix editOrder timestamp update, fix #18028 [#18046](https://github.com/ccxt/ccxt/pull/18046)
- Gate: parseTradingFee, add discount support [#18045](https://github.com/ccxt/ccxt/pull/18045)
- bitget- fix ohlcv timeframes [#18048](https://github.com/ccxt/ccxt/pull/18048)
- yobit - fetchtickers [#18047](https://github.com/ccxt/ccxt/pull/18047)


## 3.1.9

- xt - params copy [#18034](https://github.com/ccxt/ccxt/pull/18034)
- Gate: transfer, accountsByType, support options [#18026](https://github.com/ccxt/ccxt/pull/18026)
- bybit: update pagination for fetchOrders [#18029](https://github.com/ccxt/ccxt/pull/18029)
- phemex - params [#18039](https://github.com/ccxt/ccxt/pull/18039)
- fix(bitget): watchBalance fix [#18043](https://github.com/ccxt/ccxt/pull/18043)
- fix(phemex): ohlcv emulated since [#18044](https://github.com/ccxt/ccxt/pull/18044)
- chore: update readme [ci skip] [#18042](https://github.com/ccxt/ccxt/pull/18042)


## 3.1.8

- fix(huobi): ohlcv spot 1M and 1y period fix [#18014](https://github.com/ccxt/ccxt/pull/18014)
- Update nonce for bitso [#18016](https://github.com/ccxt/ccxt/pull/18016)
- Okx: add fetchSettlementHistory & support expired options [#18000](https://github.com/ccxt/ccxt/pull/18000)
- fix(mexc): fix watchOrders [#18017](https://github.com/ccxt/ccxt/pull/18017)
- hitbtc options['networks'] bug fix [#18018](https://github.com/ccxt/ccxt/pull/18018)
- fix(Exchange.py): proper filter_by_limit casing [#18019](https://github.com/ccxt/ccxt/pull/18019)
- coinex fetchCurrencies enhancement [#17949](https://github.com/ccxt/ccxt/pull/17949)
- fix(bybit): remove expiry from swap markets [#18022](https://github.com/ccxt/ccxt/pull/18022)
- fix(cryptocom): update id [#18024](https://github.com/ccxt/ccxt/pull/18024)
- huobi - copy params [#18038](https://github.com/ccxt/ccxt/pull/18038)
- mexc - params copy [#18036](https://github.com/ccxt/ccxt/pull/18036)
- build: change cjs test target [ci skip] [#18040](https://github.com/ccxt/ccxt/pull/18040)
- bybit - copy params [#18035](https://github.com/ccxt/ccxt/pull/18035)


## 3.1.7

- fix(woo): ws order cost - fix #17996 [#18008](https://github.com/ccxt/ccxt/pull/18008)
- fix(bitfinex2): watchOrders timestamp - fix #18001 [#18009](https://github.com/ccxt/ccxt/pull/18009)
- appveyor & travis - build.sh updates [#17976](https://github.com/ccxt/ccxt/pull/17976)
- okx- skip bid [#18012](https://github.com/ccxt/ccxt/pull/18012)
- Okx: set option support to true [#18010](https://github.com/ccxt/ccxt/pull/18010)


## 3.1.6

- fix #17749 [#17995](https://github.com/ccxt/ccxt/pull/17995)
- Phemex set leverage hedged [#17998](https://github.com/ccxt/ccxt/pull/17998)
- typescript compile time error by overriden fetchTickers method [ci deploy] [#17997](https://github.com/ccxt/ccxt/pull/17997)
- build: disable btctradeua [ci deploy] [#18003](https://github.com/ccxt/ccxt/pull/18003)
- bybit: update fetchOpenInterestHistory [#18002](https://github.com/ccxt/ccxt/pull/18002)
- fix(mexc): fix #17511 increase default snapshotDelay [#17569](https://github.com/ccxt/ccxt/pull/17569)
- added skips - failing build [#18007](https://github.com/ccxt/ccxt/pull/18007)


## 3.1.5

- binance: add api sapiPostCapitalDepositCreditApply [#17984](https://github.com/ccxt/ccxt/pull/17984)
- paymium: update jsdoc [ci skip] [#17987](https://github.com/ccxt/ccxt/pull/17987)
- poloniex: update jsdoc [ci skip] [#17986](https://github.com/ccxt/ccxt/pull/17986)
- remove - networkCodesToIds [#17970](https://github.com/ccxt/ccxt/pull/17970)
- fix(kucoinfutures): add throw to fetchTickers [ci skip] [#17989](https://github.com/ccxt/ccxt/pull/17989)
- chore: changelog update [ci skip] [#17990](https://github.com/ccxt/ccxt/pull/17990)
- Poloniexfutures sockets [#17324](https://github.com/ccxt/ccxt/pull/17324)
- binance: trailing stop orders don't require stopPrice. [#17978](https://github.com/ccxt/ccxt/pull/17978)
- build: fix change.sh permissions [#17994](https://github.com/ccxt/ccxt/pull/17994)


## 3.1.4

- fix(coinex): ws authentication flow + watchOrders [ci deploy] [#17981](https://github.com/ccxt/ccxt/pull/17981)


## 3.1.3

- bitmart - add endpoint [#17969](https://github.com/ccxt/ccxt/pull/17969)
- fix(mexc): remove await from checkRequiredCredentials [#17972](https://github.com/ccxt/ccxt/pull/17972)
- Okx: fetchOpenInterestHistory, add option support [#17963](https://github.com/ccxt/ccxt/pull/17963)
- fix(okx): fetchOpenInterestHistory in operator [#17974](https://github.com/ccxt/ccxt/pull/17974)
- build: improve linting time [#17968](https://github.com/ccxt/ccxt/pull/17968)
- bybit: update setPositionMode [#17977](https://github.com/ccxt/ccxt/pull/17977)


## 3.1.2

- build: fix return code [ci skip] [#17957](https://github.com/ccxt/ccxt/pull/17957)
- Bitget: createOrder, add position stop-loss and take-profit [#17944](https://github.com/ccxt/ccxt/pull/17944)
- bybit: add new position apis [#17965](https://github.com/ccxt/ccxt/pull/17965)


## 3.1.1

- Build: atomic builds and tests inside PR [ci skip] [#17933](https://github.com/ccxt/ccxt/pull/17933)
- Okx: fetchTrades, add option support [#17954](https://github.com/ccxt/ccxt/pull/17954)
- Binance: editOrder, add swap and future support [#17936](https://github.com/ccxt/ccxt/pull/17936)


## 3.0.107

- Fix field name [#17946](https://github.com/ccxt/ccxt/pull/17946)
- feat(gate): fetchMyTrades, replace swap endpoint [#17945](https://github.com/ccxt/ccxt/pull/17945)
- bitget: patch returned order is defined [#17942](https://github.com/ccxt/ccxt/pull/17942)
- fix(whitebit): nonce granularity [#17950](https://github.com/ccxt/ccxt/pull/17950)
- Bump react/http from 1.8.0 to 1.9.0 [#17941](https://github.com/ccxt/ccxt/pull/17941)
- Bump guzzlehttp/psr7 from 2.4.3 to 2.5.0 [#17611](https://github.com/ccxt/ccxt/pull/17611)


## 3.0.106

- base - precision mode instance methods [#17888](https://github.com/ccxt/ccxt/pull/17888)
- bitget update apis [#17943](https://github.com/ccxt/ccxt/pull/17943)


## 3.0.105

- bitpanda - websockets [#15286](https://github.com/ccxt/ccxt/pull/15286)
- xt parseTransaction fixes [#17931](https://github.com/ccxt/ccxt/pull/17931)
- bitget: add user apis [#17935](https://github.com/ccxt/ccxt/pull/17935)


## 3.0.104

- feat(bybit): fetchCurrencies enhancement [#17903](https://github.com/ccxt/ccxt/pull/17903)
- New and deleted generated files do not committing to ccxt git repository [ci skip] [#17870](https://github.com/ccxt/ccxt/pull/17870)
- filterByLimit is descending by default [#17927](https://github.com/ccxt/ccxt/pull/17927)
- base - isInteger [#17925](https://github.com/ccxt/ccxt/pull/17925)
- build: bitso skip fetchOHLCV [ci skip] [#17930](https://github.com/ccxt/ccxt/pull/17930)
- bitget: update transfer / withdraw to v2 api [#17928](https://github.com/ccxt/ccxt/pull/17928)


## 3.0.103

- fix(phemex): ping pong handling [#17921](https://github.com/ccxt/ccxt/pull/17921)


## 3.0.102

- fix(coinex): fetchTradingFee market handling [#17912](https://github.com/ccxt/ccxt/pull/17912)
- kucoinfutures: fetchPosition [#17908](https://github.com/ccxt/ccxt/pull/17908)
- bitget: ws subscribe stop orders channel 'ordersAlgo' [#17906](https://github.com/ccxt/ccxt/pull/17906)
- fix(bitfinex): parseTicker marketId [#17914](https://github.com/ccxt/ccxt/pull/17914)
- fix(gate): fix status for partial orders and canceled orders [#17913](https://github.com/ccxt/ccxt/pull/17913)


## 3.0.101

- Gate: fetchTrades add option support [#17889](https://github.com/ccxt/ccxt/pull/17889)
- feat(xt): add networkError [#17892](https://github.com/ccxt/ccxt/pull/17892)
- xt parseMarket fixes [#17887](https://github.com/ccxt/ccxt/pull/17887)
- exchange.currencyStructure -> exchange.safeCurrencyStructure [#17871](https://github.com/ccxt/ccxt/pull/17871)
- fix build: add safeCurrencyStructure snake case [#17896](https://github.com/ccxt/ccxt/pull/17896)
- binance: add porfolio margin apis [#17898](https://github.com/ccxt/ccxt/pull/17898)
- fix(huobi): fetchBalance:  add unified account support [#17894](https://github.com/ccxt/ccxt/pull/17894)
- coinmate parseTransaction unification [#16152](https://github.com/ccxt/ccxt/pull/16152)
- tests - precision [#17658](https://github.com/ccxt/ccxt/pull/17658)
- kucoinfutures: add missing endpoints [#17904](https://github.com/ccxt/ccxt/pull/17904)
- ascendex parseOrder fix [#17901](https://github.com/ccxt/ccxt/pull/17901)


## 3.0.100

- fix(bitget): remove symbol requirement from fetchOpenOrders [#17881](https://github.com/ccxt/ccxt/pull/17881)
- binance: add new fapis [#17885](https://github.com/ccxt/ccxt/pull/17885)
- probit fetchCurrencies network precision fix [#17884](https://github.com/ccxt/ccxt/pull/17884)
- xt new endpoints [#17883](https://github.com/ccxt/ccxt/pull/17883)
- fix client race condition - move client subscription check before connection and handle rollback [#17723](https://github.com/ccxt/ccxt/pull/17723)
- xt fetchCurrencies enhancement [#17886](https://github.com/ccxt/ccxt/pull/17886)
- Coinbase: fetchOrders, fetchOrdersByStatus, fix since [#17890](https://github.com/ccxt/ccxt/pull/17890)


## 3.0.99

- fix(coinex): parse cfx deposit address correctly. fix #17197 [#17225](https://github.com/ccxt/ccxt/pull/17225)
- Exchange.js unified currency structure [#16349](https://github.com/ccxt/ccxt/pull/16349)
- coinex new endpoint [#17865](https://github.com/ccxt/ccxt/pull/17865)
- krakenfutures transfer remove amountToPrecision [#17866](https://github.com/ccxt/ccxt/pull/17866)
- Binance: update python option examples [ci skip] [#17868](https://github.com/ccxt/ccxt/pull/17868)
- feat(cryptocom): add since to cryptocom [#17879](https://github.com/ccxt/ccxt/pull/17879)
- blockchaincom - ws [#15664](https://github.com/ccxt/ccxt/pull/15664)


## 3.0.98

- bybit: remove exceptions.ws [#17849](https://github.com/ccxt/ccxt/pull/17849)
- coinbasepro: handle error message for ws [#17848](https://github.com/ccxt/ccxt/pull/17848)
- btcalpha - trade ts int [#17843](https://github.com/ccxt/ccxt/pull/17843)
- okx - funding rate integer [#17840](https://github.com/ccxt/ccxt/pull/17840)
- bitmart - product integer [#17839](https://github.com/ccxt/ccxt/pull/17839)
- mexc error remapping [#17851](https://github.com/ccxt/ccxt/pull/17851)
- fix(phemex): v2 sandbox url [#17852](https://github.com/ccxt/ccxt/pull/17852)
- binance: add sapiGetPortfolioAssetIndexPrice [#17859](https://github.com/ccxt/ccxt/pull/17859)
- bybit: add new apis [#17858](https://github.com/ccxt/ccxt/pull/17858)
- bybit: update fetchOpenInterestHistory [#17860](https://github.com/ccxt/ccxt/pull/17860)
- Binance: fetchTicker, fetchTickers, add option support [#17857](https://github.com/ccxt/ccxt/pull/17857)


## 3.0.97

- Tests: move proxy to skip-tests.json [ci skip] [#17823](https://github.com/ccxt/ccxt/pull/17823)
- fix(Coinex): Required positionId for reduceOnly orders [#17832](https://github.com/ccxt/ccxt/pull/17832)
- fix:php ArrayCache use in watchOrders and watchTrades [#17825](https://github.com/ccxt/ccxt/pull/17825)
- Huobi: cancelAllOrders, trigger stop-loss and take-profit support [#17821](https://github.com/ccxt/ccxt/pull/17821)
- Huobi: cancelOrders, trigger, stop-loss and take-profit support [#17820](https://github.com/ccxt/ccxt/pull/17820)
- fix(bitfinex2): checksum when length < 25 [#17834](https://github.com/ccxt/ccxt/pull/17834)
- fix(phemex): update posSide doc [ci skip] [#17838](https://github.com/ccxt/ccxt/pull/17838)
- base - async fetch currecnies [#17836](https://github.com/ccxt/ccxt/pull/17836)


## 3.0.96

- Huobi: cancelOrder, trigger, stop-loss and take-profit support [#17813](https://github.com/ccxt/ccxt/pull/17813)
- fix: transpile python IndexType [ci skip] [#17819](https://github.com/ccxt/ccxt/pull/17819)
- Fix build_ohlcvc with single trade [ci skip] [#17816](https://github.com/ccxt/ccxt/pull/17816)
- fix(deribit): fix #17729 [#17829](https://github.com/ccxt/ccxt/pull/17829)


## 3.0.95

- bitget - fix milliseconds [#17811](https://github.com/ccxt/ccxt/pull/17811)
- Currencycom - fix margin [#17807](https://github.com/ccxt/ccxt/pull/17807)
- bitmart - fix expiry [#17805](https://github.com/ccxt/ccxt/pull/17805)
- probit: update links for jsdoc [ci skip] [#17808](https://github.com/ccxt/ccxt/pull/17808)
- fix(bybit): USDC market orders v1 [#17815](https://github.com/ccxt/ccxt/pull/17815)


## 3.0.94

- feat(xt): remove bigInt usage [#17804](https://github.com/ccxt/ccxt/pull/17804)
- fix(xt): php signing [ci deploy] [#17809](https://github.com/ccxt/ccxt/pull/17809)


## 3.0.93

- bitget timeframes [#17792](https://github.com/ccxt/ccxt/pull/17792)
- fix(probit): fetchCurrencies networks [#17799](https://github.com/ccxt/ccxt/pull/17799)
- fix(whitebit): signing in Python [ci deploy] [#17806](https://github.com/ccxt/ccxt/pull/17806)


## 3.0.92

- stex: update links for jsdoc [#17798](https://github.com/ccxt/ccxt/pull/17798)
- Huobi: fetchOrders, fetchOpenOrders, add trigger, stop-loss and take-profit support [#17795](https://github.com/ccxt/ccxt/pull/17795)
- huobi fetchCurrencies fix [#17785](https://github.com/ccxt/ccxt/pull/17785)


## 3.0.91

- fix: filterByLimit [#17775](https://github.com/ccxt/ccxt/pull/17775)
- binance parseWsOrder add reduceOnly.  [#17770](https://github.com/ccxt/ccxt/pull/17770)
- fix(XT): fix active market [#17777](https://github.com/ccxt/ccxt/pull/17777)
- bitget: update position api [#17746](https://github.com/ccxt/ccxt/pull/17746)
- feat(Phemex): add USD support to fetchFundingRateHistory [#17778](https://github.com/ccxt/ccxt/pull/17778)
- feat: transpile filterBySinceLimit/Value [#17779](https://github.com/ccxt/ccxt/pull/17779)
- fix(huobi): fetchOHLCV since/limit usage [ci deploy] [#17783](https://github.com/ccxt/ccxt/pull/17783)
- krakenfutures - fix contract [#17781](https://github.com/ccxt/ccxt/pull/17781)
- build: disable btcmarkets [ci deploy] [#17787](https://github.com/ccxt/ccxt/pull/17787)
- bitget - expiry 0 missing [#17790](https://github.com/ccxt/ccxt/pull/17790)
- bitmart - settleId [#17789](https://github.com/ccxt/ccxt/pull/17789)
- ast-transpiler update [#17786](https://github.com/ccxt/ccxt/pull/17786)
- currencycom - type fix [#17788](https://github.com/ccxt/ccxt/pull/17788)


## 3.0.90

- Align ascii [#17761](https://github.com/ccxt/ccxt/pull/17761)
- Binance: fetchCanceledOrders [#17759](https://github.com/ccxt/ccxt/pull/17759)
- base - add info [#17758](https://github.com/ccxt/ccxt/pull/17758)
- fix(Krakenfutures): fix postOnly [#17764](https://github.com/ccxt/ccxt/pull/17764)
- fix(Idex): fechTransactionHelper calls [#17765](https://github.com/ccxt/ccxt/pull/17765)
- Krakenfutures sockets [#17503](https://github.com/ccxt/ccxt/pull/17503)
- fix(binance): fetchCanceledOrders options support [#17766](https://github.com/ccxt/ccxt/pull/17766)
- huobi createOrder default stopOperator for stop orders [#17760](https://github.com/ccxt/ccxt/pull/17760)
- bitget fetchOHLCV docstring @see [#17772](https://github.com/ccxt/ccxt/pull/17772)


## 3.0.89

- CCXT - postinstall ascii art change [#17757](https://github.com/ccxt/ccxt/pull/17757)


## 3.0.88

- Build: fix __init__ inside abstract/ [ci deploy] [#17752](https://github.com/ccxt/ccxt/pull/17752)


## 3.0.87

- Update huobi.ts [#17737](https://github.com/ccxt/ccxt/pull/17737)
- filterBySinceLimit and filterByValueSinceLimit both sort before filtering [#17705](https://github.com/ccxt/ccxt/pull/17705)
- build: fix huobi linting and abstract packaging [ci deploy] [#17751](https://github.com/ccxt/ccxt/pull/17751)


## 3.0.86

- different exchanges - simple fix strings [#17738](https://github.com/ccxt/ccxt/pull/17738)
- okx: add apis [#17747](https://github.com/ccxt/ccxt/pull/17747)
- kucoinfutures: adjust parseOrder cost [#17742](https://github.com/ccxt/ccxt/pull/17742)
- mexc.parseTrade 1,2 -> buy/sell [#17740](https://github.com/ccxt/ccxt/pull/17740)
- appveyor - use node v16 instead of v14 [#17748](https://github.com/ccxt/ccxt/pull/17748)
- bitget: add p2p apis [#17745](https://github.com/ccxt/ccxt/pull/17745)


## 3.0.85

- feat(xt): add adjustForTimeDifference option [#17731](https://github.com/ccxt/ccxt/pull/17731)
- fix(phemex): fix market loading inside setPositionMode [#17732](https://github.com/ccxt/ccxt/pull/17732)
- fix(xt): add adjustForTimeDifference inside options [#17734](https://github.com/ccxt/ccxt/pull/17734)
- ccxt.pro manual removed duplicate watchOrders [#17739](https://github.com/ccxt/ccxt/pull/17739)


## 3.0.84

- bithumb: use currency code rather than currency object [#17714](https://github.com/ccxt/ccxt/pull/17714)
- bitso: use currency rather than currency code for parseLedger () [#17715](https://github.com/ccxt/ccxt/pull/17715)
- hitbtc: createDepositAddress () returns a DepositAddressResponse [#17717](https://github.com/ccxt/ccxt/pull/17717)


## 3.0.83

- kucoin parseOrder fix [#17659](https://github.com/ccxt/ccxt/pull/17659)
- fix(bitget): watchOrders multiple spot sub [#17711](https://github.com/ccxt/ccxt/pull/17711)
- fix OrderType and OrderSide [#17712](https://github.com/ccxt/ccxt/pull/17712)
- tokocrypto: add links to jsdoc [#17709](https://github.com/ccxt/ccxt/pull/17709)
- wazirx: add links to jsdoc [#17708](https://github.com/ccxt/ccxt/pull/17708)
- yobit: add links to jsdoc [#17707](https://github.com/ccxt/ccxt/pull/17707)
- zaif: add links to jsdoc  [#17706](https://github.com/ccxt/ccxt/pull/17706)
- fix - test issues [ci skip] [#17696](https://github.com/ccxt/ccxt/pull/17696)
- huobi: safeCurrencyCode ()'s second argument is a Currency [#17716](https://github.com/ccxt/ccxt/pull/17716)


## 3.0.82

- Binance: fetchPosition, option support [#17674](https://github.com/ccxt/ccxt/pull/17674)


## 3.0.81

- Huobi: add contract trigger, stop-loss and take-profit orders [#17633](https://github.com/ccxt/ccxt/pull/17633)
- fix(phemex): watchOrders [ci deploy] [#17702](https://github.com/ccxt/ccxt/pull/17702)


## 3.0.80

- Fixing URL for sandbox [#17692](https://github.com/ccxt/ccxt/pull/17692)
- zonda: add links to jsdoc [#17700](https://github.com/ccxt/ccxt/pull/17700)
- woo: update watchOrders price & filled ccxt/ccxt#17652 [#17688](https://github.com/ccxt/ccxt/pull/17688)
- [bybit] Fix watch_ticker to use symbol in same way as other exchanges [#17682](https://github.com/ccxt/ccxt/pull/17682)
- upbit: add links to jsdoc [#17698](https://github.com/ccxt/ccxt/pull/17698)
- [base] .calculateFee not to return quote currency when feeSide=base [#17683](https://github.com/ccxt/ccxt/pull/17683)
- chore: route bybit through eu proxy [#17701](https://github.com/ccxt/ccxt/pull/17701)


## 3.0.79

- add missing `networks` across currencies [#17687](https://github.com/ccxt/ccxt/pull/17687)
- chore: update error codes for binanceusdm.ts [ccxt-pro] [#17677](https://github.com/ccxt/ccxt/pull/17677)
- fix(webpack): webworkers usage [ci deploy] [#17690](https://github.com/ccxt/ccxt/pull/17690)


## 3.0.78

- bybit: add spot-cross-margin-trade apis ccxt/ccxt#17655 [#17675](https://github.com/ccxt/ccxt/pull/17675)
- tests - this/$this fix in php sync [#17676](https://github.com/ccxt/ccxt/pull/17676)
- mexc: update deposit address [#17673](https://github.com/ccxt/ccxt/pull/17673)
- poloniex error mapping [#17669](https://github.com/ccxt/ccxt/pull/17669)
- coinbasepro.fetchOHLCV limit behavior fix when since is not on a timeframe boundary [#17646](https://github.com/ccxt/ccxt/pull/17646)
- Fix TypeScript emitting updated types into Exchange.d.ts. [#17645](https://github.com/ccxt/ccxt/pull/17645)
- fix(deribit): duplicated spot markets [#17680](https://github.com/ccxt/ccxt/pull/17680)
- yobit - fix arr [#17623](https://github.com/ccxt/ccxt/pull/17623)
- merge-derived-csharp-files [#17684](https://github.com/ccxt/ccxt/pull/17684)
- tests - fix `run-tests` skip [#17678](https://github.com/ccxt/ccxt/pull/17678)


## 3.0.77

- okx fetchCurrencies fix [#17671](https://github.com/ccxt/ccxt/pull/17671)


## 3.0.76

- Ascendex fetch closed orders v2 [#17662](https://github.com/ccxt/ccxt/pull/17662)
- phemex fetchTickers [#17660](https://github.com/ccxt/ccxt/pull/17660)
- phemex : skip fetchTickers [#17666](https://github.com/ccxt/ccxt/pull/17666)
- Binance: add option support to transfer [#17663](https://github.com/ccxt/ccxt/pull/17663)
- disable btctradeua [#17668](https://github.com/ccxt/ccxt/pull/17668)


## 3.0.75

- fix(bigone): fetchBalance [#17644](https://github.com/ccxt/ccxt/pull/17644)
- fix(bybit): fetchPositions USDC [#17648](https://github.com/ccxt/ccxt/pull/17648)
- binance: add api managed-subaccount/deposit/address [#17649](https://github.com/ccxt/ccxt/pull/17649)
- feat(Deribit): add spot markets [#17654](https://github.com/ccxt/ccxt/pull/17654)


## 3.0.74

- test cleanup [#17605](https://github.com/ccxt/ccxt/pull/17605)
- feat(phemex): add fetchFundingRateHistory [#17626](https://github.com/ccxt/ccxt/pull/17626)
- fix(gemini): pro authenticate [#17636](https://github.com/ccxt/ccxt/pull/17636)
- fix test: protect access [#17641](https://github.com/ccxt/ccxt/pull/17641)
- [Binance-USDM] Update error codes [#17640](https://github.com/ccxt/ccxt/pull/17640)
- tests - fix extend [#17629](https://github.com/ccxt/ccxt/pull/17629)


## 3.0.73

- novadax parseTransaction unification [#17612](https://github.com/ccxt/ccxt/pull/17612)
- poloniex parseTransaction unification [#17610](https://github.com/ccxt/ccxt/pull/17610)
- Fix watch_order_book bug on testnet spot  [#17614](https://github.com/ccxt/ccxt/pull/17614)
- fix(phemex): fetchOHLCV [#17618](https://github.com/ccxt/ccxt/pull/17618)
- fix incorrect content in dist/cjs/package.json [ci deploy] [#17624](https://github.com/ccxt/ccxt/pull/17624)
- python: fix urlencode bug ccxt/ccxt#17550 [#17586](https://github.com/ccxt/ccxt/pull/17586)
- fix: ws client send [#17570](https://github.com/ccxt/ccxt/pull/17570)


## 3.0.72

- bitmart: patch parseInt [#17601](https://github.com/ccxt/ccxt/pull/17601)
- gate add methods to has [#16512](https://github.com/ccxt/ccxt/pull/16512)
- woo parseTransaction unification [#17613](https://github.com/ccxt/ccxt/pull/17613)


## 3.0.71

- ndax: patch parseInt [#17602](https://github.com/ccxt/ccxt/pull/17602)
- bittrex: patch parseInt [#17600](https://github.com/ccxt/ccxt/pull/17600)
- hollaex: patch parseInt ccxt/ccxt#17597 [#17599](https://github.com/ccxt/ccxt/pull/17599)
- Bitget: change fetchOpenInterest error type [#17598](https://github.com/ccxt/ccxt/pull/17598)


## 3.0.70

- fix binance: parseOpenInterest [#17583](https://github.com/ccxt/ccxt/pull/17583)
- Idex: change rateLimit [#17582](https://github.com/ccxt/ccxt/pull/17582)
- fix export-exchanges: alias [#17585](https://github.com/ccxt/ccxt/pull/17585)
- Wazirx: update rateLimit weights [#17581](https://github.com/ccxt/ccxt/pull/17581)
- feat(phemex):websockets support USDT using hedged perpetual API [#16932](https://github.com/ccxt/ccxt/pull/16932)
- Transpile tests [#17075](https://github.com/ccxt/ccxt/pull/17075)
- add tests to push.sh [#17587](https://github.com/ccxt/ccxt/pull/17587)
- fix mercado & paymium [#17589](https://github.com/ccxt/ccxt/pull/17589)
- Skip Exchanges [#17590](https://github.com/ccxt/ccxt/pull/17590)
- mercado - skip [#17591](https://github.com/ccxt/ccxt/pull/17591)
- Skip delta [#17593](https://github.com/ccxt/ccxt/pull/17593)
- update push.sh [#17596](https://github.com/ccxt/ccxt/pull/17596)


## 3.0.69

- fix xt: logo [ci skip] [#17578](https://github.com/ccxt/ccxt/pull/17578)
- mexc - fix OHLCV intervals [#17579](https://github.com/ccxt/ccxt/pull/17579)
- kucoin: add hf [#17538](https://github.com/ccxt/ccxt/pull/17538)


## 3.0.68

- build: patch php extends for ccxt pro ccxt/ccxt#17573 [#17575](https://github.com/ccxt/ccxt/pull/17575)
- feat(examples): add html example for ccxt pro [ci skip] [#17571](https://github.com/ccxt/ccxt/pull/17571)
- fix(examples): fix html examples [ci skip] [#17574](https://github.com/ccxt/ccxt/pull/17574)
- [Binance] Modify error codes [#17566](https://github.com/ccxt/ccxt/pull/17566)
- New Exchange - XT [ci deploy] [#17118](https://github.com/ccxt/ccxt/pull/17118)


## 3.0.67

- fix(bitfinex2): fix #17540 - bitfinex2 orderbook checksum [#17562](https://github.com/ccxt/ccxt/pull/17562)


## 3.0.66

- poloniex.fetchTrades: side added for public trades [#17565](https://github.com/ccxt/ccxt/pull/17565)
- bitrue.parseTrade: sanitize input, skip wrong data [#17564](https://github.com/ccxt/ccxt/pull/17564)


## 3.0.65

- fix(bybit): createOrder v3 stopPrice [ci deploy] [#17563](https://github.com/ccxt/ccxt/pull/17563)


## 3.0.64

- mexc: parse trade-side as bool not string [#17559](https://github.com/ccxt/ccxt/pull/17559)
- binance: fix fetchOpenInterestHistory [#17560](https://github.com/ccxt/ccxt/pull/17560)
- types.ts formatting [#17558](https://github.com/ccxt/ccxt/pull/17558)
- fix build: skip cex [#17561](https://github.com/ccxt/ccxt/pull/17561)


## 3.0.63

- fix(okx): protect withdraw [#17555](https://github.com/ccxt/ccxt/pull/17555)
- Bybit - postonly fix [#17398](https://github.com/ccxt/ccxt/pull/17398)
- fix php: WS client [ci deploy] [#17556](https://github.com/ccxt/ccxt/pull/17556)


## 3.0.62

- fix(binance): notional spot testnet [#17546](https://github.com/ccxt/ccxt/pull/17546)
- fix(bitget): handle future markets [#17548](https://github.com/ccxt/ccxt/pull/17548)
- fix(gemini): signing [#17553](https://github.com/ccxt/ccxt/pull/17553)


## 3.0.61

- woo: make some apis public [#17530](https://github.com/ccxt/ccxt/pull/17530)
- fix(deribit): authenticate ws [#17533](https://github.com/ccxt/ccxt/pull/17533)
- pushback abstract/src/ts [ci skip] [#17534](https://github.com/ccxt/ccxt/pull/17534)
- fix(poloniex): fix fetchTransactionsHelper [#17536](https://github.com/ccxt/ccxt/pull/17536)
- fix(bybit): createMarketBuyOrderRequiresPrice [#17539](https://github.com/ccxt/ccxt/pull/17539)


## 3.0.60

- mexc: add new api (capital/transfer/tranId) [#17529](https://github.com/ccxt/ccxt/pull/17529)
- bybit: update fetchBalance ccxt/ccxt#17520 [#17528](https://github.com/ccxt/ccxt/pull/17528)
- fix key_exists: exception handling [ci deploy] [#17531](https://github.com/ccxt/ccxt/pull/17531)


## 3.0.59

- mexc: use market id ccxt/ccxt#17515 [#17517](https://github.com/ccxt/ccxt/pull/17517)
- bybit: update editOrder [#17505](https://github.com/ccxt/ccxt/pull/17505)
- fix(bitget): canceledAndClosed default [#17524](https://github.com/ccxt/ccxt/pull/17524)


## 3.0.58

- [krakenfutures] sign url generation for python [#17519](https://github.com/ccxt/ccxt/pull/17519)


## 3.0.57

- fixes #17508 [#17509](https://github.com/ccxt/ccxt/pull/17509)


## 3.0.56

- bitrue has watchOrderBook [#17501](https://github.com/ccxt/ccxt/pull/17501)
- Websocket Client - arrayBuffer decode take into account byte length [#17510](https://github.com/ccxt/ccxt/pull/17510)


## 3.0.55

- bybit: update fetchOrders [#17497](https://github.com/ccxt/ccxt/pull/17497)
- binance docstring @see [#17494](https://github.com/ccxt/ccxt/pull/17494)
- bybit: set endTime when since is not empty [#17486](https://github.com/ccxt/ccxt/pull/17486)
- bybit: omit prices when create order [#17499](https://github.com/ccxt/ccxt/pull/17499)
- fix python: 3.7 types [#17500](https://github.com/ccxt/ccxt/pull/17500)
- Revert "fix(kucoin & mexc): removed commonCurrency BiFi->BIFIF" [#17502](https://github.com/ccxt/ccxt/pull/17502)


## 3.0.54

- kucoinfutures - postonly [#17475](https://github.com/ccxt/ccxt/pull/17475)
- kucoin - postonly [#17474](https://github.com/ccxt/ccxt/pull/17474)
- postonly - mexc [#17473](https://github.com/ccxt/ccxt/pull/17473)
- huobi - spot po [#17471](https://github.com/ccxt/ccxt/pull/17471)
- okx - postonly [#17470](https://github.com/ccxt/ccxt/pull/17470)
- fix kucoin deposit withdraw fee [#17463](https://github.com/ccxt/ccxt/pull/17463)
- krakenfutures - remove force stp type if stopPrice exists [#17472](https://github.com/ccxt/ccxt/pull/17472)
- Fix wrong mexc "has" flags [#17491](https://github.com/ccxt/ccxt/pull/17491)
- fix(kucoin & mexc): removed commonCurrency BiFi->BIFIF [#17493](https://github.com/ccxt/ccxt/pull/17493)
- binance.fetchTrades add until and fetchTradesMethod param, docstring [#17495](https://github.com/ccxt/ccxt/pull/17495)


## 3.0.53

- feat(coinbase): add bid and ask to fetchTicker [#17480](https://github.com/ccxt/ccxt/pull/17480)
- bitmart - postonly [#17477](https://github.com/ccxt/ccxt/pull/17477)
- woo: update [#17481](https://github.com/ccxt/ccxt/pull/17481)
- bitget: update apis [#17484](https://github.com/ccxt/ccxt/pull/17484)
- po bitget [#17476](https://github.com/ccxt/ccxt/pull/17476)


## 3.0.52

- bybit: omit tp/sl and triggerPrice [#17461](https://github.com/ccxt/ccxt/pull/17461)
- coinex editOrder fix [#17454](https://github.com/ccxt/ccxt/pull/17454)
- fix(gate): fetchOHLCV limit switched to 999 [#17468](https://github.com/ccxt/ccxt/pull/17468)
- latoken AccountSuspended error [#17467](https://github.com/ccxt/ccxt/pull/17467)
- fix(poloniex): poloniex transfer update to new response format [#17459](https://github.com/ccxt/ccxt/pull/17459)
- hitbtc3 includeFee [#17452](https://github.com/ccxt/ccxt/pull/17452)
- hitbtc includeFee [#17451](https://github.com/ccxt/ccxt/pull/17451)
- bitfinex2 withdraw edits [#17426](https://github.com/ccxt/ccxt/pull/17426)
- Examples - polish & linting [#17412](https://github.com/ccxt/ccxt/pull/17412)


## 3.0.51

- bigone - fix [#17449](https://github.com/ccxt/ccxt/pull/17449)
- poloniex handleErrors [#17441](https://github.com/ccxt/ccxt/pull/17441)


## 3.0.50

- coinex has editOrder [#17450](https://github.com/ccxt/ccxt/pull/17450)


## 3.0.49

- fix(gate): fix #17443 [#17445](https://github.com/ccxt/ccxt/pull/17445)
- Add return types to a few fetch* methods. [#17438](https://github.com/ccxt/ccxt/pull/17438)


## 3.0.48

- bybit: update timestamp of position [#17429](https://github.com/ccxt/ccxt/pull/17429)
- bybit: use updatedTime ccxt/ccxt#17427 [#17428](https://github.com/ccxt/ccxt/pull/17428)
- coinex editOrder [#17411](https://github.com/ccxt/ccxt/pull/17411)
- fix(phemex): usd markets handling [#17435](https://github.com/ccxt/ccxt/pull/17435)
- fix(binance): setMarginMod exception [#17433](https://github.com/ccxt/ccxt/pull/17433)
- fix(Phemex): sandbox v2 [#17440](https://github.com/ccxt/ccxt/pull/17440)


## 3.0.47

- krakenfutures: fix signing for private endpoints [#17424](https://github.com/ccxt/ccxt/pull/17424)
- fix(gate): watchOrders and watchMyTrades  [#17431](https://github.com/ccxt/ccxt/pull/17431)


## 3.0.46

- ascendex parseTransaction fee [#17415](https://github.com/ccxt/ccxt/pull/17415)
- fix travis: remove server request [ci skip] [#17421](https://github.com/ccxt/ccxt/pull/17421)
- safeCurrency - string type fix [#17420](https://github.com/ccxt/ccxt/pull/17420)
- bitmart: update fetchContractMarkets ccxt/ccxt#17416 [#17419](https://github.com/ccxt/ccxt/pull/17419)


## 3.0.45

- fix(lbank): signature [#17408](https://github.com/ccxt/ccxt/pull/17408)
- simple typo at huobi.ts [ci skip] [#17400](https://github.com/ccxt/ccxt/pull/17400)
- Transpile examples [#14798](https://github.com/ccxt/ccxt/pull/14798)
- fix(kucoin): watchOrders timestamp [#17409](https://github.com/ccxt/ccxt/pull/17409)
- base - safePosition & parsePosition updates [#15128](https://github.com/ccxt/ccxt/pull/15128)
- bitget cancelOrders, fetchOpenOrders edits [#17387](https://github.com/ccxt/ccxt/pull/17387)
- fix(krakenfutures): fix markets clash [#17414](https://github.com/ccxt/ccxt/pull/17414)


## 3.0.44

- fix(types): python3.7 support [ci deploy] [#17407](https://github.com/ccxt/ccxt/pull/17407)


## 3.0.43

- feat(mexc3): add mexc3 websockets [#17138](https://github.com/ccxt/ccxt/pull/17138)
- phemex - Update usdt settled endpoints [#17396](https://github.com/ccxt/ccxt/pull/17396)
- kraken new endpoints [#17391](https://github.com/ccxt/ccxt/pull/17391)
- fix(ts): remove MessageEvent type due to incompatibility with ts5 [#17402](https://github.com/ccxt/ccxt/pull/17402)


## 3.0.41

- btcex ALT -> ArchLoot [#17378](https://github.com/ccxt/ccxt/pull/17378)
- phemex fetchSpotMarkets fix [#17376](https://github.com/ccxt/ccxt/pull/17376)
- mexc3 parseTransaction fixes [#17394](https://github.com/ccxt/ccxt/pull/17394)


## 3.0.40

- probit - websockets [#15667](https://github.com/ccxt/ccxt/pull/15667)
- fix(kucoin): privatePostAccounts endpoint version [#17371](https://github.com/ccxt/ccxt/pull/17371)
- bybit: add 140001 ccxt/ccxt#17372 [#17377](https://github.com/ccxt/ccxt/pull/17377)
- phemex - update rate limits [#17374](https://github.com/ccxt/ccxt/pull/17374)
- mexc3 fetchDeposits/fetchWithdrawals fixes [#17119](https://github.com/ccxt/ccxt/pull/17119)
- bybit: add rsa signature [#17381](https://github.com/ccxt/ccxt/pull/17381)
- bithumb ALT -> ArchLoot [#17379](https://github.com/ccxt/ccxt/pull/17379)


## 3.0.39



## 3.0.38



## 3.0.37

- bybit: add get announcement api [#17359](https://github.com/ccxt/ccxt/pull/17359)
- okx: update saving apis [#17360](https://github.com/ccxt/ccxt/pull/17360)
- binance: add apis [#17358](https://github.com/ccxt/ccxt/pull/17358)
- binance: patch ccxt/ccxt#17326 [#17357](https://github.com/ccxt/ccxt/pull/17357)
- fix(bitmex): fetchMarkets [#17356](https://github.com/ccxt/ccxt/pull/17356)
- fix(bitmex): fix #17313 [#17355](https://github.com/ccxt/ccxt/pull/17355)
- Exhange#setMarkets: Currency.numericId is a number and not a string. [#17347](https://github.com/ccxt/ccxt/pull/17347)
- okx editOrder [#17316](https://github.com/ccxt/ccxt/pull/17316)
- cryptocom - `fetchDepositWithdrawFees` [#17156](https://github.com/ccxt/ccxt/pull/17156)
- fix(ts): abstract implicit API [ci deploy] [#17366](https://github.com/ccxt/ccxt/pull/17366)


## 3.0.36

- ignore binance in test [#17363](https://github.com/ccxt/ccxt/pull/17363)


## 3.0.35

- bybit: add institutional loan apis ccxt/ccxt#17285 [#17338](https://github.com/ccxt/ccxt/pull/17338)
- fix(cryptocom): add clientOrderId support [#17350](https://github.com/ccxt/ccxt/pull/17350)


## 3.0.34

- feat(bybit): increase positions limit [ci skip] [#17343](https://github.com/ccxt/ccxt/pull/17343)
- Add OHLCVC type and typings for parseTimeframe() and buildOHLCVC(). [#17342](https://github.com/ccxt/ccxt/pull/17342)
- Add Exchang#fetchTime return type. [#17341](https://github.com/ccxt/ccxt/pull/17341)
- Fix ZB and Hitbtc signing [ci deploy] [#17345](https://github.com/ccxt/ccxt/pull/17345)


## 3.0.33



## 3.0.32

- fix coinex: signature [ci deploy] [#17328](https://github.com/ccxt/ccxt/pull/17328)


## 3.0.31

- build: improve implicit api methods [ci skip] [#17322](https://github.com/ccxt/ccxt/pull/17322)
- Exchange: add types from pre-TypeScript conversion ccxt.d.ts. [#17319](https://github.com/ccxt/ccxt/pull/17319)
- huobijp hostname update [#17321](https://github.com/ccxt/ccxt/pull/17321)
- binance: Market['strike'] is a number, not a string [#17318](https://github.com/ccxt/ccxt/pull/17318)


## 3.0.30

- okx fetchCurrencies fix [#17314](https://github.com/ccxt/ccxt/pull/17314)
- Dockerfile nodejs 16 [#17311](https://github.com/ccxt/ccxt/pull/17311)
- Feat: add implicit methods to type definitions [#17317](https://github.com/ccxt/ccxt/pull/17317)
- [WIP] reduce browser bundle size [#17181](https://github.com/ccxt/ccxt/pull/17181)
- idex handleTicker string math [#17094](https://github.com/ccxt/ccxt/pull/17094)


## 3.0.29

- fix Exchange: safeMarket [#17310](https://github.com/ccxt/ccxt/pull/17310)
- fix(bybit,gate): polluting markets loading [#17315](https://github.com/ccxt/ccxt/pull/17315)


## 3.0.27

- Binance, Bybit: fetchOHLCV inverse markets volume [#17297](https://github.com/ccxt/ccxt/pull/17297)
- coinex parseTransaction fix [#17294](https://github.com/ccxt/ccxt/pull/17294)
- bitmart cancelAllOrders enhancement [#17287](https://github.com/ccxt/ccxt/pull/17287)
- fix(binance): parse deposit status, fix #17218 [#17224](https://github.com/ccxt/ccxt/pull/17224)
- handle with tif [#17282](https://github.com/ccxt/ccxt/pull/17282)
- bybit: patch order fee [#17302](https://github.com/ccxt/ccxt/pull/17302)
- fix(OKX): demo trading [#17301](https://github.com/ccxt/ccxt/pull/17301)
- gate - update createMarketOrder flag [#17306](https://github.com/ccxt/ccxt/pull/17306)
- typo orderStatus bybit [#17305](https://github.com/ccxt/ccxt/pull/17305)
- fixed bybit stop_loss triggerDirection for Shorts order [#17262](https://github.com/ccxt/ccxt/pull/17262)
- Export-exchanges: remove ccxt import dependency [ci skip] [#17186](https://github.com/ccxt/ccxt/pull/17186)


## 3.0.26

- Ascendex parse position string math [#17280](https://github.com/ccxt/ccxt/pull/17280)
- fix ts: add some more prop types [#17288](https://github.com/ccxt/ccxt/pull/17288)
- fix: parsePrecision [#17289](https://github.com/ccxt/ccxt/pull/17289)
- kraken handleTicker string math [#17093](https://github.com/ccxt/ccxt/pull/17093)
- fix(bitpro,bitget): fix parseOHLCV and fetchOrderTrades [ci skip] [#17292](https://github.com/ccxt/ccxt/pull/17292)
- zb parseOrder side fix [#17291](https://github.com/ccxt/ccxt/pull/17291)
- ccxt.ts: also export Dictionary and MinMax. [#17298](https://github.com/ccxt/ccxt/pull/17298)


## 3.0.25

- fix(kucoin): handlePong [#17286](https://github.com/ccxt/ccxt/pull/17286)


## 3.0.24

- fix(ascendex): fix #17256 python handle ping await error [#17265](https://github.com/ccxt/ccxt/pull/17265)
- fix(bybit): add symbol to fetchPositions [#17278](https://github.com/ccxt/ccxt/pull/17278)
- bitstamp parseTrade fix [#17277](https://github.com/ccxt/ccxt/pull/17277)
- fix: Remove setTimeout_safe [ci deploy] [#17274](https://github.com/ccxt/ccxt/pull/17274)


## 3.0.23

- fix(mexc): GASNEO name as GAS [#17268](https://github.com/ccxt/ccxt/pull/17268)
- fix(bybit): v5 does not require symbol for spot trades [#17272](https://github.com/ccxt/ccxt/pull/17272)
- docs: update required node version to 15 to support AbortController [ci skip] [#17267](https://github.com/ccxt/ccxt/pull/17267)
- gate: add apis [#17247](https://github.com/ccxt/ccxt/pull/17247)


## 3.0.22

- fix(binance): postOnly Orders [ci deploy] [#17264](https://github.com/ccxt/ccxt/pull/17264)


## 3.0.21

- build :: add missing package.json [ci deploy] [#17250](https://github.com/ccxt/ccxt/pull/17250)


## 3.0.20

- okx.ts transfer fix [#17237](https://github.com/ccxt/ccxt/pull/17237)
- feat(TS): add watchTicker and watchTickers type [#17243](https://github.com/ccxt/ccxt/pull/17243)
- feat: add 1:1 CommonJS structure instead of bundle [ci skip] [#17232](https://github.com/ccxt/ccxt/pull/17232)
- bitrue - `fetchDepositWithdrawFees` [#17157](https://github.com/ccxt/ccxt/pull/17157)
- build: pushback cjs files and more ts types [ci deploy] [#17245](https://github.com/ccxt/ccxt/pull/17245)


## 3.0.19

- fix(ts): add default types [ci skip] [#17233](https://github.com/ccxt/ccxt/pull/17233)


## 3.0.18

- fix(Exchange): markets type and sign discrepancy [ci deploy] [#17222](https://github.com/ccxt/ccxt/pull/17222)
- fix(abortError): store it as prop [ci deploy] [#17230](https://github.com/ccxt/ccxt/pull/17230)


## 3.0.17

- docs: update docs to new docsify links [#17226](https://github.com/ccxt/ccxt/pull/17226)
- [krakenfutures] Add `params.clientOrderId` to createOrder [#17229](https://github.com/ccxt/ccxt/pull/17229)
- exmo order status [#17215](https://github.com/ccxt/ccxt/pull/17215)


## 3.0.16

- Coinsph.ts  [#17217](https://github.com/ccxt/ccxt/pull/17217)


## 3.0.15

- feat(okx): fetchOHLCV retrieve base volume [#17198](https://github.com/ccxt/ccxt/pull/17198)
- parseDepositAddresses undefined result fix [ci deploy] [#17219](https://github.com/ccxt/ccxt/pull/17219)


## 3.0.14

- kucoin parseTransactionStatus [#17206](https://github.com/ccxt/ccxt/pull/17206)
- fix(kraken): watchOrderbook handleDeltas [ci deploy] [#17214](https://github.com/ccxt/ccxt/pull/17214)


## 3.0.13

- feat(TS): type optional parameters and missing ws methods [ci deploy] [#17211](https://github.com/ccxt/ccxt/pull/17211)


## 3.0.11

- poloniexfutures.fetchOpenOrders fix to fetch open orders [#17200](https://github.com/ccxt/ccxt/pull/17200)
- Poloniexfutures parse order cost [#17199](https://github.com/ccxt/ccxt/pull/17199)
- feat(build): add cjs test [ci skip] [#17204](https://github.com/ccxt/ccxt/pull/17204)


## 3.0.10

- fix(Binance): default settle value [#17192](https://github.com/ccxt/ccxt/pull/17192)
- fix(PRO): restore exchange export [#17195](https://github.com/ccxt/ccxt/pull/17195)
- fix: parsePrecision returns precision as a string number that is not scientific notation [#17115](https://github.com/ccxt/ccxt/pull/17115)


## 3.0.9

- bybit: update contract v3 signature ccxt/ccxt#17172 [#17182](https://github.com/ccxt/ccxt/pull/17182)
- fix(TS): init values for ws structures [ci deploy] [#17188](https://github.com/ccxt/ccxt/pull/17188)


## 3.0.8

- fix - emitTypes [#17168](https://github.com/ccxt/ccxt/pull/17168)


## 3.0.7



## 3.0.6

- package.json: set node version to 15.0.0 in engines [#17161](https://github.com/ccxt/ccxt/pull/17161)
- feat(TS): add more types and stub methods [ci deploy] [#17171](https://github.com/ccxt/ccxt/pull/17171)


## 3.0.5

- fix(bybit): v5 uta spot market buy [#17165](https://github.com/ccxt/ccxt/pull/17165)
- feat(TS): improve types [ci deploy] [#17169](https://github.com/ccxt/ccxt/pull/17169)


## 3.0.4

- docs: docstring links updated to new documentation links [#17159](https://github.com/ccxt/ccxt/pull/17159)
- fix(Phemex): add default posSide to editOrder [#17163](https://github.com/ccxt/ccxt/pull/17163)
- fetch: fix webworker usage [#17166](https://github.com/ccxt/ccxt/pull/17166)


## 3.0.3



## 3.0.2



## 3.0.1



## 2.9.16

- bitforex error mapping [#17154](https://github.com/ccxt/ccxt/pull/17154)
- woo: add average price ccxt/ccxt#17143 [#17152](https://github.com/ccxt/ccxt/pull/17152)
- update node fetch v3 with esm support [#17141](https://github.com/ccxt/ccxt/pull/17141)


## 2.9.15

- fix(bybit,gate): sync market loading + postinstall fix + safeOrder [ci deploy] [#17151](https://github.com/ccxt/ccxt/pull/17151)


## 2.9.14

- okx: patch ccxt/ccxt#17125 [#17137](https://github.com/ccxt/ccxt/pull/17137)
- fix: add ts-node to dev dependencies [#17136](https://github.com/ccxt/ccxt/pull/17136)
- Fix build/cleanup-old-tags + npmignore update [#17145](https://github.com/ccxt/ccxt/pull/17145)
- fix(luno): cleanup unused parameter from orderbook limit [#17132](https://github.com/ccxt/ccxt/pull/17132)
- Update ccxt.bundle.cjs [#17147](https://github.com/ccxt/ccxt/pull/17147)
- Add types and fix npm command [ci deploy] [#17148](https://github.com/ccxt/ccxt/pull/17148)


## 2.9.13

- fix(cex): fix uncatchable error [#17124](https://github.com/ccxt/ccxt/pull/17124)
- Typescript migration (with esm) + architecture refactor  [#14282](https://github.com/ccxt/ccxt/pull/14282)
- TS : fix build scripts [#17135](https://github.com/ccxt/ccxt/pull/17135)
- sh: update cleanup.sh [#17139](https://github.com/ccxt/ccxt/pull/17139)
- npm: update package.json [#17140](https://github.com/ccxt/ccxt/pull/17140)
- feat: add docsify [#17126](https://github.com/ccxt/ccxt/pull/17126)


## 2.9.12

- kucoin withdraw includeFee [#17028](https://github.com/ccxt/ccxt/pull/17028)
- gate remove TON mapping [#17122](https://github.com/ccxt/ccxt/pull/17122)
- fix(Bybit): add reduceOnly to parseOrder [#17129](https://github.com/ccxt/ccxt/pull/17129)
- fix(Phemex): createOrder usd settled contracts [ci deploy] [#17128](https://github.com/ccxt/ccxt/pull/17128)


## 2.9.11

- novadax.has["fetchDepositAddress"] == false [#17107](https://github.com/ccxt/ccxt/pull/17107)
- Bybit: update stopLoss and takeProfit [#17100](https://github.com/ccxt/ccxt/pull/17100)
- bybit fetchSpotMarkets fix [#17111](https://github.com/ccxt/ccxt/pull/17111)
- okx: update parseOrder ccxt/ccxt#15618 [#17109](https://github.com/ccxt/ccxt/pull/17109)
- bybit: upgrade pro to v5 [#17068](https://github.com/ccxt/ccxt/pull/17068)
- binance.parseWsTrade string math [#17091](https://github.com/ccxt/ccxt/pull/17091)


## 2.9.10

- fix(Bitfinex2): authenticate and watchOrders [#17104](https://github.com/ccxt/ccxt/pull/17104)
- bitget: add vip level apis [#17108](https://github.com/ccxt/ccxt/pull/17108)


## 2.9.9

- fix(bybit): spot order amount precision [#17087](https://github.com/ccxt/ccxt/pull/17087)
- feat(bybit):: add v5 endpoint to fetchBalance [ci deploy] [#17102](https://github.com/ccxt/ccxt/pull/17102)


## 2.9.8

- okx withdraw enhancement [#17074](https://github.com/ccxt/ccxt/pull/17074)
- btcex error mapping [#17082](https://github.com/ccxt/ccxt/pull/17082)
- Gate docs [#17089](https://github.com/ccxt/ccxt/pull/17089)


## 2.9.7

- fix(huobi): catch watchOrderBookSnapshot uncatchable error [#17077](https://github.com/ccxt/ccxt/pull/17077)
- base - ignore `build` folder in flake qa [#17079](https://github.com/ccxt/ccxt/pull/17079)
- fix(huobijp): catch watchOrderBookSnapshot uncatchable error [#17076](https://github.com/ccxt/ccxt/pull/17076)
- fix(Exchange): fetchstatus info key [#17080](https://github.com/ccxt/ccxt/pull/17080)
- bithumb fetchTickers fix [#17073](https://github.com/ccxt/ccxt/pull/17073)
- bitget parseTrade negative fee fix [#17083](https://github.com/ccxt/ccxt/pull/17083)


## 2.9.6

- bitget - fetchOHLCV for spot [#17065](https://github.com/ccxt/ccxt/pull/17065)
- fix(Bybit): spot market status [#17070](https://github.com/ccxt/ccxt/pull/17070)
- fix(binance): increase default keep alive to 180000 [#17067](https://github.com/ccxt/ccxt/pull/17067)
- Exchange#safeOrder: remove no-op code. [#17059](https://github.com/ccxt/ccxt/pull/17059)
- [krakenfutures] fix amount precision [#17049](https://github.com/ccxt/ccxt/pull/17049)
- fix(binance): uncatchable error in fetchOrderBookSnapshot [#17066](https://github.com/ccxt/ccxt/pull/17066)
- gate withdraw, parseTransactions fix [#17071](https://github.com/ccxt/ccxt/pull/17071)
- exchange - Flake8 fix qa [#17078](https://github.com/ccxt/ccxt/pull/17078)


## 2.9.4



## 2.9.3



## 2.9.2



## 2.9.1



## 2.8.99



## 2.8.98



## 2.8.97

- bybit: patch fetchMarketLeverageTiers ccxt/ccxt#17055 [#17061](https://github.com/ccxt/ccxt/pull/17061)


## 2.8.96

- CONTRIBUTING.md: spelling fixes. [#17060](https://github.com/ccxt/ccxt/pull/17060)


## 2.8.95



## 2.8.94



## 2.8.93

- fix(bybit): parseTicker default type [#17056](https://github.com/ccxt/ccxt/pull/17056)


## 2.8.92

- fix(binance): stream reconnect [#17044](https://github.com/ccxt/ccxt/pull/17044)


## 2.8.91



## 2.8.90



## 2.8.89



## 2.8.88



## 2.8.87

- Coinbase Pro: Add bidVolume and askVolume to watchTicker [#17047](https://github.com/ccxt/ccxt/pull/17047)


## 2.8.86



## 2.8.85



## 2.8.84

- gate: Add mapping for invalid stop order pricing [#17048](https://github.com/ccxt/ccxt/pull/17048)


## 2.8.83

- Bybit balance fix [#17043](https://github.com/ccxt/ccxt/pull/17043)


## 2.8.82

- fix(bybit): setMarginMode leverage type [#17042](https://github.com/ccxt/ccxt/pull/17042)


## 2.8.81

- bybit: update fetchBalance [#17033](https://github.com/ccxt/ccxt/pull/17033)


## 2.8.80

- Bybit and phemex fix [#17039](https://github.com/ccxt/ccxt/pull/17039)


## 2.8.79



## 2.8.78

- feat(bybit): v5 add funding balance [#17029](https://github.com/ccxt/ccxt/pull/17029)


## 2.8.77

- fix(whitebit): handle authenticate error [#17018](https://github.com/ccxt/ccxt/pull/17018)


## 2.8.76

- okx: add v5/trade/order-algo [#17022](https://github.com/ccxt/ccxt/pull/17022)


## 2.8.75

- fix(Gate): sandbox markets loading [#17026](https://github.com/ccxt/ccxt/pull/17026)


## 2.8.74

- Fix Dockerfile [#17014](https://github.com/ccxt/ccxt/pull/17014)


## 2.8.73

- cex - incorrect currency precision parsing [#17015](https://github.com/ccxt/ccxt/pull/17015)


## 2.8.72

- fix(ascendex): fix #17010 [#17017](https://github.com/ccxt/ccxt/pull/17017)


## 2.8.71

- bybit: add fetchCanceledOrders [#17020](https://github.com/ccxt/ccxt/pull/17020)


## 2.8.70

- fix(Bybit): add account type options [#17025](https://github.com/ccxt/ccxt/pull/17025)


## 2.8.69

- bybit: update entry price ccxt/ccxt#17021 [#17023](https://github.com/ccxt/ccxt/pull/17023)


## 2.8.68

- base - restore base options [#17016](https://github.com/ccxt/ccxt/pull/17016)


## 2.8.67

- WIP - Phemex swap USDT [#16911](https://github.com/ccxt/ccxt/pull/16911)


## 2.8.66

- fix(Bybit): timeframe parsing [#17012](https://github.com/ccxt/ccxt/pull/17012)


## 2.8.65

- fix(bybit): remove isUnifiedMarginEnabled from ws [#17009](https://github.com/ccxt/ccxt/pull/17009)


## 2.8.64

- fix(bybit): fix fetchOHLCV since [#17008](https://github.com/ccxt/ccxt/pull/17008)


## 2.8.63

- fix(ascendex):make handlePing error catchable [#17001](https://github.com/ccxt/ccxt/pull/17001)


## 2.8.62

- Binance: fetchLedger [#17002](https://github.com/ccxt/ccxt/pull/17002)


## 2.8.61

- coinex - contract markets precisions [#17005](https://github.com/ccxt/ccxt/pull/17005)


## 2.8.60

- bybit: upgrade to v5 api [#16699](https://github.com/ccxt/ccxt/pull/16699)


## 2.8.59

- fix(exmo): watchBalance info [#17000](https://github.com/ccxt/ccxt/pull/17000)


## 2.8.58

- fix(bitrue):watchBalance add info to balance structure [#16970](https://github.com/ccxt/ccxt/pull/16970)


## 2.8.57

- fix(huobi): unhandled errors [#16990](https://github.com/ccxt/ccxt/pull/16990)


## 2.8.56

- binance: add new sapis [#16992](https://github.com/ccxt/ccxt/pull/16992)


## 2.8.55

- fix(gate): reset correctly orderbook after invalid nonce error [#16991](https://github.com/ccxt/ccxt/pull/16991)


## 2.8.54

- fix(Gate): watchOrders without symbol [#16995](https://github.com/ccxt/ccxt/pull/16995)
- ccxt.d.ts: add setSandboxMode(). [#16993](https://github.com/ccxt/ccxt/pull/16993)


## 2.8.53

- fix(hollaex):watchBalance add info to balance structure [#16965](https://github.com/ccxt/ccxt/pull/16965)


## 2.8.52

- fix(phemex):watchBalance add info to balance structure [#16968](https://github.com/ccxt/ccxt/pull/16968)


## 2.8.51

- fix(coinex):watchBalance add info to balance structure [#16969](https://github.com/ccxt/ccxt/pull/16969)


## 2.8.50

- [krakenfutures] Fix fetchTicker to take market id [#16981](https://github.com/ccxt/ccxt/pull/16981)


## 2.8.49

- fix(cryptocom):watchBalance add info to balance structure [#16966](https://github.com/ccxt/ccxt/pull/16966)


## 2.8.48

- fix(okcoin):watchBalance add info to balance structure [#16967](https://github.com/ccxt/ccxt/pull/16967)


## 2.8.47

- fix(whitebit):watchBalance add info to balance structure [#16973](https://github.com/ccxt/ccxt/pull/16973)


## 2.8.46

- fix(mexc):watchBalance add info to balance structure [#16964](https://github.com/ccxt/ccxt/pull/16964)


## 2.8.45

- fix(wazirx):watchBalance add info to balance structure [#16974](https://github.com/ccxt/ccxt/pull/16974)


## 2.8.44

- fix(gate):watchBalance add info to balance structure [#16975](https://github.com/ccxt/ccxt/pull/16975)


## 2.8.43

- Binance: fetchOpenInterest [#16976](https://github.com/ccxt/ccxt/pull/16976)


## 2.8.42

- fix(bittrex):watchBalance add info to balance structure [#16957](https://github.com/ccxt/ccxt/pull/16957)


## 2.8.41

- fix(deribit):watchBalance add info to balance structure [#16960](https://github.com/ccxt/ccxt/pull/16960)
- fix(huobi):watchBalance add info to balance structure [#16961](https://github.com/ccxt/ccxt/pull/16961)
- fix(exmo,deribit): watchBalance add info to balance structure [#16958](https://github.com/ccxt/ccxt/pull/16958)


## 2.8.40

- Binance: fetchSettlementHistory [#16946](https://github.com/ccxt/ccxt/pull/16946)


## 2.8.39

- fix(kucoin): watchBalance add info and time to balance structure [#16953](https://github.com/ccxt/ccxt/pull/16953)


## 2.8.38

- bitget.fetchMarkets contract size is 1 [#16954](https://github.com/ccxt/ccxt/pull/16954)


## 2.8.37

- fix(cex):watchBalance add info to balance structure [#16959](https://github.com/ccxt/ccxt/pull/16959)
- fix(Krakenfutures): fix parseTicker [#16971](https://github.com/ccxt/ccxt/pull/16971)
- fix(kucoinfutures):watchBalance add info to balance structure [#16963](https://github.com/ccxt/ccxt/pull/16963)
- fix(bitopro):watchBalance add info, timestamp and datetime to balance structure [#16956](https://github.com/ccxt/ccxt/pull/16956)
- krakenfutures : fix build [#16972](https://github.com/ccxt/ccxt/pull/16972)


## 2.8.36

- fix(Kucoin): fix transaction status [#16951](https://github.com/ccxt/ccxt/pull/16951)


## 2.8.35

- fix(Binance): fix parseTrades margin [#16950](https://github.com/ccxt/ccxt/pull/16950)


## 2.8.34

- coinex update rate limit [#16936](https://github.com/ccxt/ccxt/pull/16936)


## 2.8.33

- feat(ccxt.d.ts): add transfer and setLeverage types [#16948](https://github.com/ccxt/ccxt/pull/16948)


## 2.8.32

- bybit: patch fetchTransfers ccxt/ccxt#16945 [#16947](https://github.com/ccxt/ccxt/pull/16947)


## 2.8.31

- Binance: fetchMyTrades, add option support [#16864](https://github.com/ccxt/ccxt/pull/16864)
- Binance: fetchOHLCV, add option support [#16931](https://github.com/ccxt/ccxt/pull/16931)
- btcex fetchMyTrades fix [#16934](https://github.com/ccxt/ccxt/pull/16934)
- Binance: fetchOrderBook, add option support [#16895](https://github.com/ccxt/ccxt/pull/16895)


## 2.8.30

- [new exchange] krakenfutures (re-added PR) [#15133](https://github.com/ccxt/ccxt/pull/15133)
- fix(Binance): parseTrade spot margin trades [#16927](https://github.com/ccxt/ccxt/pull/16927)
- feat(Okx): add positions history method [#16928](https://github.com/ccxt/ccxt/pull/16928)


## 2.8.29



## 2.8.28



## 2.8.27



## 2.8.26



## 2.8.25



## 2.8.24

- fix(Bybit): fetchSpotOpenOrders symbol [#16921](https://github.com/ccxt/ccxt/pull/16921)
- okx: add new api [#16924](https://github.com/ccxt/ccxt/pull/16924)
- coinbase: fix quote size for market buy order ccxt/ccxt#16918 [#16922](https://github.com/ccxt/ccxt/pull/16922)
- code - fixes for deposit address [#16923](https://github.com/ccxt/ccxt/pull/16923)


## 2.8.23

- Origin/exbugs [#16916](https://github.com/ccxt/ccxt/pull/16916)


## 2.8.22



## 2.8.21

- feat(Binance): add mark/index stream to watchOHLCV [#16917](https://github.com/ccxt/ccxt/pull/16917)


## 2.8.17

- fix(Bybit): fetchWithdrawals since param [#16903](https://github.com/ccxt/ccxt/pull/16903)
- fix(Phemex): fetchOHLCV spot and contract [#16904](https://github.com/ccxt/ccxt/pull/16904)
- poloniex - fix rest endpoint to allow for ws [#16905](https://github.com/ccxt/ccxt/pull/16905)
- fix(Bitfinex2): fetchTrades symbol parsing [#16908](https://github.com/ccxt/ccxt/pull/16908)
- fix(Bitfinex2): await client send [#16910](https://github.com/ccxt/ccxt/pull/16910)


## 2.8.16



## 2.8.15

- Bitmex : authenticate ws fix [#16891](https://github.com/ccxt/ccxt/pull/16891)


## 2.8.14

- feat(Binance): support different ids in editOrder [#16892](https://github.com/ccxt/ccxt/pull/16892)


## 2.8.13

- Bitget fetchLeverage fetch private account data for market [#16888](https://github.com/ccxt/ccxt/pull/16888)


## 2.8.12

- feat: Add auto Changelog.md [#16792](https://github.com/ccxt/ccxt/pull/16792)


## 2.8.11

- Build : Disable therock [#16889](https://github.com/ccxt/ccxt/pull/16889)


## 2.8.10

- fix: bitget watchBalance swap [#16885](https://github.com/ccxt/ccxt/pull/16885)


## 2.8.9

- Fix bug bitget sandbox mode [#16882](https://github.com/ccxt/ccxt/pull/16882)


## 2.8.8

- hitbtc remove BIT mapping [#16877](https://github.com/ccxt/ccxt/pull/16877)


## 2.8.7

- Update mexc3 [#16874](https://github.com/ccxt/ccxt/pull/16874)


## 2.8.6

- bitflyer: fix markets conflict [#16872](https://github.com/ccxt/ccxt/pull/16872)


## 2.8.5

- okx: add error codes [#16870](https://github.com/ccxt/ccxt/pull/16870)


## 2.8.4

- Vss global flag [#16869](https://github.com/ccxt/ccxt/pull/16869)


## 2.8.3

- Fix browserified version [#16868](https://github.com/ccxt/ccxt/pull/16868)


## 2.8.2

- huobi.fetchFundingHistory: all endpoints can take market symbol [#16863](https://github.com/ccxt/ccxt/pull/16863)


## 2.8.1

- Ndax fetch deposits [#15193](https://github.com/ccxt/ccxt/pull/15193)


## 2.7.108



## 2.7.107

- Binance: fetchTrades, add option support [#16852](https://github.com/ccxt/ccxt/pull/16852)


## 2.7.106

- Binance: parseOrder, fix options bug [#16859](https://github.com/ccxt/ccxt/pull/16859)


## 2.7.105

- Binance: fetchBalance, add option support [#16844](https://github.com/ccxt/ccxt/pull/16844)


## 2.7.104

- binance - fix watchOrderbook in testnet [#16861](https://github.com/ccxt/ccxt/pull/16861)


## 2.7.103

- Binance: fetchOpenOrders, add option support [#16819](https://github.com/ccxt/ccxt/pull/16819)


## 2.7.102

- Binance: fetchOrders, add option support [#16820](https://github.com/ccxt/ccxt/pull/16820)


## 2.7.101

- binance & cryptocom - `fetchLastPrices` [#14190](https://github.com/ccxt/ccxt/pull/14190)
- binance: add v4/sub-account/assets [#16837](https://github.com/ccxt/ccxt/pull/16837)
- Independentreserve - websockets [#16831](https://github.com/ccxt/ccxt/pull/16831)


## 2.7.100

- Binance: cancelAllOrders, add option support [#16829](https://github.com/ccxt/ccxt/pull/16829)


## 2.7.99

- Binance: fetchOrder, add option support [#16817](https://github.com/ccxt/ccxt/pull/16817)


## 2.7.98

- Binance: cancelOrder, add option support [#16828](https://github.com/ccxt/ccxt/pull/16828)


## 2.7.97

- Binance: createOrder, option support [#16816](https://github.com/ccxt/ccxt/pull/16816)


## 2.7.96

- bitget.fetchDepositAddress add network param [#16851](https://github.com/ccxt/ccxt/pull/16851)


## 2.7.95

- okx: support authenticate for public ws ccxt/ccxt#16853 [#16854](https://github.com/ccxt/ccxt/pull/16854)


## 2.7.94

- Bybit :: fix signature [#16850](https://github.com/ccxt/ccxt/pull/16850)


## 2.7.93

- deribit: check whether price is market_price ccxt/ccxt#16842 [#16846](https://github.com/ccxt/ccxt/pull/16846)


## 2.7.92

- Binance :: fix fetchMarkets [#16840](https://github.com/ccxt/ccxt/pull/16840)


## 2.7.91

- woo: update some endpoints to v3 [#16833](https://github.com/ccxt/ccxt/pull/16833)
- PublicApi / PrivateApi - removal [#16832](https://github.com/ccxt/ccxt/pull/16832)
- coinex - watchTrades - allow subscribe to several symbols [#16810](https://github.com/ccxt/ccxt/pull/16810)
- Proxy Binance US [#16838](https://github.com/ccxt/ccxt/pull/16838)


## 2.7.90

- Binance: remove options testnet URLS [#16825](https://github.com/ccxt/ccxt/pull/16825)


## 2.7.89

- Coinex :: fix fetchMyTrades [#16826](https://github.com/ccxt/ccxt/pull/16826)


## 2.7.88

- coinex - watchOrderBook - allow multiple subscriptions [#16811](https://github.com/ccxt/ccxt/pull/16811)


## 2.7.87

- Tests :: remove duplicated fetchBorrowInterest entry [#16824](https://github.com/ccxt/ccxt/pull/16824)


## 2.7.86

- docstring - fetchTickers and watchTickers fix to return dictionary [#16809](https://github.com/ccxt/ccxt/pull/16809)


## 2.7.85

- Coinbase: fetchMyTrades, fix since [#16821](https://github.com/ccxt/ccxt/pull/16821)


## 2.7.84

- bybit - fetchOrders - fix #16822 [#16823](https://github.com/ccxt/ccxt/pull/16823)


## 2.7.83

- coinex - watchTickers, fix watchTicker  [#16807](https://github.com/ccxt/ccxt/pull/16807)


## 2.7.82

- docstring - replace array for [string] or [object] [#16808](https://github.com/ccxt/ccxt/pull/16808)


## 2.7.81

- transfer method does not add data via extend [#16814](https://github.com/ccxt/ccxt/pull/16814)


## 2.7.80

- huobi.fetchPositions check params for subType [#16815](https://github.com/ccxt/ccxt/pull/16815)


## 2.7.79

- gate: add price_type ccxt/ccxt#16749 [#16806](https://github.com/ccxt/ccxt/pull/16806)


## 2.7.78

- test - reorganize for pre-transpilation stage [#15521](https://github.com/ccxt/ccxt/pull/15521)


## 2.7.77

- Woo :: fix createMarketBuyRequiresPrice [#16804](https://github.com/ccxt/ccxt/pull/16804)


## 2.7.76

- Huobi transfer margin [#16795](https://github.com/ccxt/ccxt/pull/16795)
- Gate: fetchMarkets, option support [#16798](https://github.com/ccxt/ccxt/pull/16798)


## 2.7.75

- gate: fix parse_order for spot orders [#16793](https://github.com/ccxt/ccxt/pull/16793)


## 2.7.74



## 2.7.73

- Binance: fetchMarkets, add option support [#16787](https://github.com/ccxt/ccxt/pull/16787)


## 2.7.72



## 2.7.71



## 2.7.70



## 2.7.69



## 2.7.68

- Moved parseIncomes from binance to base exchange [#16764](https://github.com/ccxt/ccxt/pull/16764)


## 2.7.67

- Bitget Websocket private : updated to handle SUMCBL [#16789](https://github.com/ccxt/ccxt/pull/16789)


## 2.7.66

- Add max retries option [#16788](https://github.com/ccxt/ccxt/pull/16788)


## 2.7.65

- Phemex perp hedged - public functions [#16762](https://github.com/ccxt/ccxt/pull/16762)


## 2.7.64

- Probit fetch transaction fee(s) [#16533](https://github.com/ccxt/ccxt/pull/16533)


## 2.7.63

- Bitget : Simulated SUSDT [#16779](https://github.com/ccxt/ccxt/pull/16779)


## 2.7.62

- okx: Fix validation of posSide in setLeverage [#16781](https://github.com/ccxt/ccxt/pull/16781)


## 2.7.60



## 2.7.59

- Typo in line 152 fixed [#16772](https://github.com/ccxt/ccxt/pull/16772)


## 2.7.58

- Tests manager :: test [#16759](https://github.com/ccxt/ccxt/pull/16759)


## 2.7.57

- Fix fetchOHLCV [#16778](https://github.com/ccxt/ccxt/pull/16778)


## 2.7.56

- Bitget: createOrder, market trigger order [#16768](https://github.com/ccxt/ccxt/pull/16768)


## 2.7.55

- Typo in comment in line 134 fixed [#16774](https://github.com/ccxt/ccxt/pull/16774)


## 2.7.54

- Woo :: fix swap market orders [#16775](https://github.com/ccxt/ccxt/pull/16775)


## 2.7.53

- JS: private tests fix [#16771](https://github.com/ccxt/ccxt/pull/16771)


## 2.7.52

- Bybit :: add missing order status [#16773](https://github.com/ccxt/ccxt/pull/16773)


## 2.7.51

- Tests python :: restore orders line [#16763](https://github.com/ccxt/ccxt/pull/16763)


## 2.7.50

- Btcex: fetchOrder, swap support [#16658](https://github.com/ccxt/ccxt/pull/16658)


## 2.7.49

- exchange pro base - fix delay to match js [#16751](https://github.com/ccxt/ccxt/pull/16751)


## 2.7.48

- Bitget: fetchCanceledOrders [#16742](https://github.com/ccxt/ccxt/pull/16742)


## 2.7.47

- bitget: fetchFundingHistory [#16745](https://github.com/ccxt/ccxt/pull/16745)


## 2.7.46

- detla - zero fix [#16758](https://github.com/ccxt/ccxt/pull/16758)


## 2.7.45

- ace: new exchange [#15903](https://github.com/ccxt/ccxt/pull/15903)


## 2.7.44

- bybit.createReduceOnlyOrder["has"] === true [#16736](https://github.com/ccxt/ccxt/pull/16736)
- bitcoincom fees uses parseNumber [#16734](https://github.com/ccxt/ccxt/pull/16734)
- delta["options"]["fees"] uses string numbers [#16728](https://github.com/ccxt/ccxt/pull/16728)
- Btcex: createOrder, add swap and stop order support [#16657](https://github.com/ccxt/ccxt/pull/16657)


## 2.7.43

- Bybit fetchDeposits, add until parameter, docstring edits [#16735](https://github.com/ccxt/ccxt/pull/16735)


## 2.7.42

- delta - fix position [#16733](https://github.com/ccxt/ccxt/pull/16733)


## 2.7.41

- binance: update apis [#16740](https://github.com/ccxt/ccxt/pull/16740)


## 2.7.40

- binance: patch ccxt/ccxt#16702 [#16741](https://github.com/ccxt/ccxt/pull/16741)


## 2.7.39

- Tests fix [#16744](https://github.com/ccxt/ccxt/pull/16744)


## 2.7.38

- huobi - fix balance [#16729](https://github.com/ccxt/ccxt/pull/16729)


## 2.7.37

- cli.py -  unicode support [#16730](https://github.com/ccxt/ccxt/pull/16730)


## 2.7.36

- okx - fetchPosition fix [#16731](https://github.com/ccxt/ccxt/pull/16731)


## 2.7.35

- Kucoinfutures fetchFundingRateHistory [#16687](https://github.com/ccxt/ccxt/pull/16687)


## 2.7.34

- fetchcurrencies - removal of address  [#16722](https://github.com/ccxt/ccxt/pull/16722)


## 2.7.33

- Mexc3 fetch ticker precise [#16725](https://github.com/ccxt/ccxt/pull/16725)


## 2.7.32



## 2.7.31

- huobi - implicit api [#16715](https://github.com/ccxt/ccxt/pull/16715)


## 2.7.30

- Run-tests :: options forwarding + old bug fix [#16714](https://github.com/ccxt/ccxt/pull/16714)


## 2.7.29

- Bitmex :: add broker id [#16717](https://github.com/ccxt/ccxt/pull/16717)


## 2.7.28

- fix ParseOrder missing information (related to #14925) [#16703](https://github.com/ccxt/ccxt/pull/16703)


## 2.7.27

- Tests :: small refactor and improvements  [#16711](https://github.com/ccxt/ccxt/pull/16711)


## 2.7.26

- binance pro parseTrade string math [#16705](https://github.com/ccxt/ccxt/pull/16705)


## 2.7.25

- coinbasepro parseNumber for describe fees [#16706](https://github.com/ccxt/ccxt/pull/16706)


## 2.7.24

- Bitget :: fix parseBalance [#16712](https://github.com/ccxt/ccxt/pull/16712)


## 2.7.23

- bitbns: removed empty timeframes object [#16704](https://github.com/ccxt/ccxt/pull/16704)
- Bitget :: improve parseOrder [#16713](https://github.com/ccxt/ccxt/pull/16713)


## 2.7.22

- New updates :: initialization fix [#16700](https://github.com/ccxt/ccxt/pull/16700)


## 2.7.21

- fetchOHLCV - accept timeframeId [#16675](https://github.com/ccxt/ccxt/pull/16675)


## 2.7.20

- bybit - fix array [#16694](https://github.com/ccxt/ccxt/pull/16694)


## 2.7.19

- [binance] URL encode RSA signatures [#16634](https://github.com/ccxt/ccxt/pull/16634)


## 2.7.18

- Btcex: fetchOpenInterest [#16690](https://github.com/ccxt/ccxt/pull/16690)


## 2.7.17

- bitget - fetchOHLCV - accept timeframeId [#16665](https://github.com/ccxt/ccxt/pull/16665)


## 2.7.16

- bitget: add fetchTransfers [#16677](https://github.com/ccxt/ccxt/pull/16677)


## 2.7.15

- Btcex: fetchFundingRate, fetchFundingRates [#16678](https://github.com/ccxt/ccxt/pull/16678)


## 2.7.14

- Btcex: transfer [#16664](https://github.com/ccxt/ccxt/pull/16664)


## 2.7.13

- Deribit :: triggerPrice fix [#16681](https://github.com/ccxt/ccxt/pull/16681)


## 2.7.12

- Gate :: fix watchBalance [#16680](https://github.com/ccxt/ccxt/pull/16680)


## 2.7.11

- Kucoin :: fix parseOrder [#16674](https://github.com/ccxt/ccxt/pull/16674)


## 2.7.10

- binance: update parseTransaction ccxt/ccxt#16666 [#16668](https://github.com/ccxt/ccxt/pull/16668)


## 2.7.9

- added 6H timeframe for bitget pro [#16670](https://github.com/ccxt/ccxt/pull/16670)


## 2.7.8

- reenable fetchTickers on binance.us [#16671](https://github.com/ccxt/ccxt/pull/16671)


## 2.7.7

- Btcex: setLeverage [#16659](https://github.com/ccxt/ccxt/pull/16659)


## 2.7.6

- Btcex: setMarginMode [#16660](https://github.com/ccxt/ccxt/pull/16660)


## 2.7.5

- update bit2c fees [#16662](https://github.com/ccxt/ccxt/pull/16662)


## 2.7.4

- Align bybit fetchOrder for futures to other exchanges [#16655](https://github.com/ccxt/ccxt/pull/16655)


## 2.7.3

- has["method"] === undefined mostly replaced with has["method"] === false [#16647](https://github.com/ccxt/ccxt/pull/16647)


## 2.7.1



## 2.6.1

- [binance] Fix RSA key signatures [#16530](https://github.com/ccxt/ccxt/pull/16530)
- Gate pro :: fix multiple subscription [#16539](https://github.com/ccxt/ccxt/pull/16539)
- mexc3: fix fetchOrdersByState() returning Promise of Promise [#16538](https://github.com/ccxt/ccxt/pull/16538)
- safeOrder has all fields [#16510](https://github.com/ccxt/ccxt/pull/16510)
- Bybit :: fix fetchFundingRate [#16541](https://github.com/ccxt/ccxt/pull/16541)
- Coinbase: createOrder [#16468](https://github.com/ccxt/ccxt/pull/16468)
- bitget: add spot plan order [#16433](https://github.com/ccxt/ccxt/pull/16433)
- OKX :: fix contracts field [#16542](https://github.com/ccxt/ccxt/pull/16542)
- gate fetchOpenInterestHistory [#16531](https://github.com/ccxt/ccxt/pull/16531)
- binance: add self trade prevention [#16547](https://github.com/ccxt/ccxt/pull/16547)
- Poloniex fetch deposit withdraw fee(s) [#16532](https://github.com/ccxt/ccxt/pull/16532)
- Bitfinex2 :: fix symbol [#16558](https://github.com/ccxt/ccxt/pull/16558)
- Wavesexchange :: fix fetchTicker [#16557](https://github.com/ccxt/ccxt/pull/16557)
- Bug template :: remove auto assign [#16559](https://github.com/ccxt/ccxt/pull/16559)
- Coinbase: fetchOHLCV [#16548](https://github.com/ccxt/ccxt/pull/16548)
- zipmex-delist [#16566](https://github.com/ccxt/ccxt/pull/16566)
- bitget: update jsdoc [#16565](https://github.com/ccxt/ccxt/pull/16565)
- bybit: add unified account apis [#16568](https://github.com/ccxt/ccxt/pull/16568)
- Kucoin cancel all margin orders [#16564](https://github.com/ccxt/ccxt/pull/16564)
- Kucoin fetch margin orders [#16562](https://github.com/ccxt/ccxt/pull/16562)
- Coinbase: fetchAccounts [#16546](https://github.com/ccxt/ccxt/pull/16546)
- Okx fetch deposit withdraw fee(s) [#16397](https://github.com/ccxt/ccxt/pull/16397)
- bitget added account/accountBill endpoint [#16570](https://github.com/ccxt/ccxt/pull/16570)
- bybit: remove 1y from timeframe ccxt/ccxt#16582 [#16583](https://github.com/ccxt/ccxt/pull/16583)
- Fix timestamp and datetime fields in \ccxt\async\Exchange.php [#16580](https://github.com/ccxt/ccxt/pull/16580)
- [binance] In `create_order()`, set `uppercaseType` correctly [#16589](https://github.com/ccxt/ccxt/pull/16589)
- bitget: add plan/placeTrailStop [#16584](https://github.com/ccxt/ccxt/pull/16584)
- Coinbase: cancelOrders, BadRequest [#16571](https://github.com/ccxt/ccxt/pull/16571)
- [gateio] Fix bugs in watchOrderBook [#16595](https://github.com/ccxt/ccxt/pull/16595)
- binance: update postOnly in editOrder [#16592](https://github.com/ccxt/ccxt/pull/16592)
- Kucoin create order margin stop [#16553](https://github.com/ccxt/ccxt/pull/16553)
- bitopro: add postonly order [#16594](https://github.com/ccxt/ccxt/pull/16594)
- examples: remove ftx related examples [#16593](https://github.com/ccxt/ccxt/pull/16593)
- Binance: fix balances [#16609](https://github.com/ccxt/ccxt/pull/16609)
- [binance] Fix crash in fee parsing logic [#16588](https://github.com/ccxt/ccxt/pull/16588)
- Btcex: fetchLeverage, fetchMarketLeverageTiers, fetchLeverageTiers [#16585](https://github.com/ccxt/ccxt/pull/16585)
- [binance] Normalize symbol in `watchTrades()` [#16608](https://github.com/ccxt/ccxt/pull/16608)
- Coinbase: fetchOrder, fetchOrders, fetchOrdersByStatus [#16524](https://github.com/ccxt/ccxt/pull/16524)
- gemini.fetchTicker docstring for params.fetchTickerMethod [#16613](https://github.com/ccxt/ccxt/pull/16613)
- zonda parseLedgerEntry amount returned as number [#16612](https://github.com/ccxt/ccxt/pull/16612)
- huobi -fix links cn to en [#16611](https://github.com/ccxt/ccxt/pull/16611)
- bit2c - added support for 'fetchOrder' [#14925](https://github.com/ccxt/ccxt/pull/14925)
- Coinbase: fetchTrades, fetchMyTrades [#16537](https://github.com/ccxt/ccxt/pull/16537)
- fix: okx subaccount transfer out setting endpoint [#16601](https://github.com/ccxt/ccxt/pull/16601)
- Php :: React\Http\Browser::request() [#16624](https://github.com/ccxt/ccxt/pull/16624)
- base/functions/misc eslint error fixes [#16615](https://github.com/ccxt/ccxt/pull/16615)
- bybit.has["createPostOnlyOrder"] === true [#16626](https://github.com/ccxt/ccxt/pull/16626)
- mexc3 - has [#16622](https://github.com/ccxt/ccxt/pull/16622)
- Bitget :: business bill endpoint [#16627](https://github.com/ccxt/ccxt/pull/16627)
- btcalpha fetchTicker and fetchTickers [#16625](https://github.com/ccxt/ccxt/pull/16625)
- Huobi :: add position bbo example [#16628](https://github.com/ccxt/ccxt/pull/16628)
- Huobi :: update transfer [#16630](https://github.com/ccxt/ccxt/pull/16630)
- Coinbase: advanced trade examples [#16631](https://github.com/ccxt/ccxt/pull/16631)
- kucoinfutures stopPrice order bug fix [#16619](https://github.com/ccxt/ccxt/pull/16619)
- Binance spot trailing fix and examples [#16637](https://github.com/ccxt/ccxt/pull/16637)
- bybit - spot market buy order quantity - fix #16600 [#16635](https://github.com/ccxt/ccxt/pull/16635)
- Coinbase: fetchOHLCV, fix python type error [#16648](https://github.com/ccxt/ccxt/pull/16648)
- length fixes [#16645](https://github.com/ccxt/ccxt/pull/16645)
- mercado removed invalid api doc link [#16643](https://github.com/ccxt/ccxt/pull/16643)
- huobi - new links [#16642](https://github.com/ccxt/ccxt/pull/16642)
- Gemini :: fix sandbox markets loading [#16653](https://github.com/ccxt/ccxt/pull/16653)
- bybit: Add PARTIALLY_FILLED_CANCELLED to bybit order stati [#16639](https://github.com/ccxt/ccxt/pull/16639)
- bit2c - updated 'parseTrade' to support added field 'isMaker' [#16641](https://github.com/ccxt/ccxt/pull/16641)


## 2.5.1

- refactor gateio pro [#16366](https://github.com/ccxt/ccxt/pull/16366)
- bybit - use tradeId isntead of id - fix #16364 [#16368](https://github.com/ccxt/ccxt/pull/16368)
- gemini - add staking and earn api endpoints [#16367](https://github.com/ccxt/ccxt/pull/16367)
- gemini - ws - fix build [#16374](https://github.com/ccxt/ccxt/pull/16374)
- gateio fix params mutation [#16372](https://github.com/ccxt/ccxt/pull/16372)
- Docker :: add php8.1 support [#16380](https://github.com/ccxt/ccxt/pull/16380)
- Bybit :: fix fetchTickers [#16383](https://github.com/ccxt/ccxt/pull/16383)
- Improve cli parsing [#16382](https://github.com/ccxt/ccxt/pull/16382)
- Bitget fetchPositions [#16384](https://github.com/ccxt/ccxt/pull/16384)
- Cli parsing: identation [#16390](https://github.com/ccxt/ccxt/pull/16390)
- bybit: check limit in watchOrderBook [#16391](https://github.com/ccxt/ccxt/pull/16391)
- type: remove space [#16394](https://github.com/ccxt/ccxt/pull/16394)
- Ccxt.js :: expose PRO [#16395](https://github.com/ccxt/ccxt/pull/16395)
- okx: checkout whether tag is not empty ccxt/ccxt#16389 [#16393](https://github.com/ccxt/ccxt/pull/16393)
- docs: update the Python proxy docs [#16304](https://github.com/ccxt/ccxt/pull/16304)
- indodax parseTransaction unification min changes [#16267](https://github.com/ccxt/ccxt/pull/16267)
- Bitfinex :: fix swap orders placement [#16399](https://github.com/ccxt/ccxt/pull/16399)
- bitget - timeframes [#16250](https://github.com/ccxt/ccxt/pull/16250)
- hitbtc3-fetchDepositWithdrawFee(s) [#16363](https://github.com/ccxt/ccxt/pull/16363)
- fix build - remove whitespace [#16400](https://github.com/ccxt/ccxt/pull/16400)
- Woox: withdraw [#14839](https://github.com/ccxt/ccxt/pull/14839)
- Binance :: unify symbols in a backwards compatible way [WIP] [#16227](https://github.com/ccxt/ccxt/pull/16227)
- bybit: use tradeMode ccxt/ccxt#16402 [#16407](https://github.com/ccxt/ccxt/pull/16407)
- Binance :: fix watchTickers [#16411](https://github.com/ccxt/ccxt/pull/16411)
- wavesexchange: update fetchTickers ccxt/ccxt#16229 [#16410](https://github.com/ccxt/ccxt/pull/16410)
- coinex.parseTransaction string math / updates [#16409](https://github.com/ccxt/ccxt/pull/16409)
- wazirx pro - string math [#16404](https://github.com/ccxt/ccxt/pull/16404)
- Bitget: fix spot fetchTickers  [#16418](https://github.com/ccxt/ccxt/pull/16418)
- Added support for FLR [#16420](https://github.com/ccxt/ccxt/pull/16420)
- Bybit :: fix default position side [#16424](https://github.com/ccxt/ccxt/pull/16424)
- ccxt.pro :: update docs [#16421](https://github.com/ccxt/ccxt/pull/16421)
- cryptocom errors mapping [#16417](https://github.com/ccxt/ccxt/pull/16417)
- kucoin BIFI -> BIFIF [#16413](https://github.com/ccxt/ccxt/pull/16413)
- huobi: add mapping for "order would trigger immediately". [#16425](https://github.com/ccxt/ccxt/pull/16425)
- Kucoin pro refactor [#16430](https://github.com/ccxt/ccxt/pull/16430)
- kucoin.transfer removed fields that are filled in when theres an error [#16427](https://github.com/ccxt/ccxt/pull/16427)
- Kucoin pro :: fix limit type [#16435](https://github.com/ccxt/ccxt/pull/16435)
- bybit: update side of position ccxt/ccxt#16429 [#16432](https://github.com/ccxt/ccxt/pull/16432)
- kucoin createOrder isolated margin [#16426](https://github.com/ccxt/ccxt/pull/16426)
- bitstamp parseTransaction unification [#16132](https://github.com/ccxt/ccxt/pull/16132)
- unify spawn [#16437](https://github.com/ccxt/ccxt/pull/16437)
- coinex: added fetchFundingRates method [#16436](https://github.com/ccxt/ccxt/pull/16436)
- Coinex :: fix build and safeMarket [#16439](https://github.com/ccxt/ccxt/pull/16439)
- bitget: added volume for watchOHLCV [#16438](https://github.com/ccxt/ccxt/pull/16438)
- Delta unified networks [#16449](https://github.com/ccxt/ccxt/pull/16449)
- delta fetchLedger string math [#16448](https://github.com/ccxt/ccxt/pull/16448)
- Cryptocom: add v1 endpoints [#16446](https://github.com/ccxt/ccxt/pull/16446)
- Coinbase: Advanced Trade, fetchMarkets [#16322](https://github.com/ccxt/ccxt/pull/16322)
- Phemex :: fix fetchTicker [#16455](https://github.com/ccxt/ccxt/pull/16455)
- [binance] restore withdrawal timestamp parsing [#16452](https://github.com/ccxt/ccxt/pull/16452)
- Gemini :: fix markets [#16457](https://github.com/ccxt/ccxt/pull/16457)
- Build :: disable gemini [#16460](https://github.com/ccxt/ccxt/pull/16460)
- coinex: fix parseFundingRate [#16459](https://github.com/ccxt/ccxt/pull/16459)


## 2.4.1

- delist qtrade [#16211](https://github.com/ccxt/ccxt/pull/16211)
- remove markets_by_id deprecated usage in derived classes [#16218](https://github.com/ccxt/ccxt/pull/16218)
- examples - php cancel orders duplicated [#16214](https://github.com/ccxt/ccxt/pull/16214)
- phemex: added v2 endpoints [#16192](https://github.com/ccxt/ccxt/pull/16192)
- watchTicker - unify name option [#16204](https://github.com/ccxt/ccxt/pull/16204)
- Fix/phemex fetch ticker [#16195](https://github.com/ccxt/ccxt/pull/16195)
- fix market conflicts [#16197](https://github.com/ccxt/ccxt/pull/16197)
- stop loading bybit options [#16225](https://github.com/ccxt/ccxt/pull/16225)
- market conflicts rewrite [#16226](https://github.com/ccxt/ccxt/pull/16226)
- okx - fix side position [#16228](https://github.com/ccxt/ccxt/pull/16228)
- gateio unified symbols [#16230](https://github.com/ccxt/ccxt/pull/16230)
- bitget speedup loading markets [#16231](https://github.com/ccxt/ccxt/pull/16231)
- examples - balance php fix [#16213](https://github.com/ccxt/ccxt/pull/16213)
- Exmo string math fix [#16232](https://github.com/ccxt/ccxt/pull/16232)
- examples - ohlcv and balance [#16216](https://github.com/ccxt/ccxt/pull/16216)
- examples - duplicated ticker examples remove from php [#16212](https://github.com/ccxt/ccxt/pull/16212)
- alpaca - ws [#16115](https://github.com/ccxt/ccxt/pull/16115)
- Build:: disable Alpaca tests requires auth [#16238](https://github.com/ccxt/ccxt/pull/16238)
- keys.json - remove & add `skip` [#16239](https://github.com/ccxt/ccxt/pull/16239)
- gateio implement safeSymbol like safeMarket [#16242](https://github.com/ccxt/ccxt/pull/16242)
- skip bithumb [#16243](https://github.com/ccxt/ccxt/pull/16243)
- close #16233 [#16244](https://github.com/ccxt/ccxt/pull/16244)
- bitget simulated trading edit [#16245](https://github.com/ccxt/ccxt/pull/16245)
- Bitmex :: temporary balance fix [#16249](https://github.com/ccxt/ccxt/pull/16249)
- base - handleoption replacements [#15041](https://github.com/ccxt/ccxt/pull/15041)
- Bithumb :: fix build [#16251](https://github.com/ccxt/ccxt/pull/16251)
- btcex error mapping [#16248](https://github.com/ccxt/ccxt/pull/16248)
- btcex-build-fix [#16254](https://github.com/ccxt/ccxt/pull/16254)
- latoken parseTransactionStatus [#16247](https://github.com/ccxt/ccxt/pull/16247)
- bybit GAS -> GASDAO [#15322](https://github.com/ccxt/ccxt/pull/15322)
- mexc GAS -> GASDAO [#15321](https://github.com/ccxt/ccxt/pull/15321)
- bkex SHINJA -> SHINJA(1M) [#15319](https://github.com/ccxt/ccxt/pull/15319)
- skip ascendex ws [#16257](https://github.com/ccxt/ccxt/pull/16257)
- travis skip tests [#16256](https://github.com/ccxt/ccxt/pull/16256)
- coinex - `fetchDepositWithdrawFees()` [#15599](https://github.com/ccxt/ccxt/pull/15599)
- btcmarkets parseTransaction unification minimum changes [#16150](https://github.com/ccxt/ccxt/pull/16150)
- Travis :: Optimize tests  [#16260](https://github.com/ccxt/ccxt/pull/16260)
- gateio-pro [#16269](https://github.com/ccxt/ccxt/pull/16269)
- Exmo parseTransaction unification [#16263](https://github.com/ccxt/ccxt/pull/16263)
- alpaca- py comments fix [#16273](https://github.com/ccxt/ccxt/pull/16273)
- tests-edit [#16275](https://github.com/ccxt/ccxt/pull/16275)
- hitbtc3 parseTransaction unification [#16265](https://github.com/ccxt/ccxt/pull/16265)
- hitbtc unify parseTransaction [#16266](https://github.com/ccxt/ccxt/pull/16266)
- Coinbasepro parse transaction [#16151](https://github.com/ccxt/ccxt/pull/16151)
- bitopro.parseTransaction unification [#16147](https://github.com/ccxt/ccxt/pull/16147)
- currencycom.parseTransaction unification [#16133](https://github.com/ccxt/ccxt/pull/16133)
- edit-exchange-tests [#16262](https://github.com/ccxt/ccxt/pull/16262)
- Issue Templates [#16105](https://github.com/ccxt/ccxt/pull/16105)
- travis-tests-timeout [#16277](https://github.com/ccxt/ccxt/pull/16277)
- bybit: Support exchange.fetch_position([]) [#16278](https://github.com/ccxt/ccxt/pull/16278)
- ws - pass proxy agent and headers [#16274](https://github.com/ccxt/ccxt/pull/16274)
- python - ws - headers [#16203](https://github.com/ccxt/ccxt/pull/16203)
- Poloniex: editOrder [#16276](https://github.com/ccxt/ccxt/pull/16276)
- bitget-test-tests [#16279](https://github.com/ccxt/ccxt/pull/16279)
- binance support for RSA API keys [#16280](https://github.com/ccxt/ccxt/pull/16280)
- binance stopLoss & takeProfit unification [#13920](https://github.com/ccxt/ccxt/pull/13920)


## 2.2.1

- Bybit :: fix fetchPosition [#15928](https://github.com/ccxt/ccxt/pull/15928)
- Bybit :: add spot balance [#15932](https://github.com/ccxt/ccxt/pull/15932)
- fix cli.php bug [#15935](https://github.com/ccxt/ccxt/pull/15935)
- bybit better error handling [#15936](https://github.com/ccxt/ccxt/pull/15936)
- whitebit.parseTrade amount key uses correct value for fetchTrades [#15933](https://github.com/ccxt/ccxt/pull/15933)
- Ascendex: fetchTrades, adjust side response [#15934](https://github.com/ccxt/ccxt/pull/15934)
- Bitso deposit withdraw fees [#15798](https://github.com/ccxt/ccxt/pull/15798)
- bitrue - websockets [#15668](https://github.com/ccxt/ccxt/pull/15668)
- aax - delist (exchange is shutting down …) [#15856](https://github.com/ccxt/ccxt/pull/15856)
- delist bytetrade [#15943](https://github.com/ccxt/ccxt/pull/15943)
- delist crex24 [#15944](https://github.com/ccxt/ccxt/pull/15944)
- Bitmart: fetchBalance, add margin support [#15945](https://github.com/ccxt/ccxt/pull/15945)
- bybit trigger orders [#15946](https://github.com/ccxt/ccxt/pull/15946)
- precision (TICK_SIZE) updates - changing numbers to sc.notation [#13950](https://github.com/ccxt/ccxt/pull/13950)
- Poloniex :: fix build [#15950](https://github.com/ccxt/ccxt/pull/15950)
- Bitget :: pro implementation  [#15380](https://github.com/ccxt/ccxt/pull/15380)
- Bitfinex2 :: fix handleMyTrade [#15951](https://github.com/ccxt/ccxt/pull/15951)
- bybit fetchSpotOpenOrders fix [#15953](https://github.com/ccxt/ccxt/pull/15953)
- Bitmart :: fix spot balance [#15966](https://github.com/ccxt/ccxt/pull/15966)
- Cex :: fix handleOrderUpdate crash [#15969](https://github.com/ccxt/ccxt/pull/15969)
- Bybit :: fix fetchTickers [#15968](https://github.com/ccxt/ccxt/pull/15968)
- Build :: skip bkex [#15970](https://github.com/ccxt/ccxt/pull/15970)
- Bybit :: Add pagination to fetchMarkets [#15965](https://github.com/ccxt/ccxt/pull/15965)
- Add woox pro [#15762](https://github.com/ccxt/ccxt/pull/15762)
- Bitmart :: margin and signature fix [#15971](https://github.com/ccxt/ccxt/pull/15971)
- bybit fetchSpotOpenOrders bug [#15976](https://github.com/ccxt/ccxt/pull/15976)
- bybit: make fetchFundingRateHistory public ccxt/ccxt#15974 [#15977](https://github.com/ccxt/ccxt/pull/15977)
- Hitbtc :: fix client_order_id [#15975](https://github.com/ccxt/ccxt/pull/15975)
- bybit: set networkId to uppercase [#15982](https://github.com/ccxt/ccxt/pull/15982)
- woo: update rate limit & api [#15979](https://github.com/ccxt/ccxt/pull/15979)
- Binance - Adding two implicit sapiV2 endpoints (sub-account methods) [#15963](https://github.com/ccxt/ccxt/pull/15963)
- bitget new endpoint [#15985](https://github.com/ccxt/ccxt/pull/15985)
- binance: add error code -1135 [#15986](https://github.com/ccxt/ccxt/pull/15986)
- [Bybit] set price if provided in edit_contract_v3_order [#15992](https://github.com/ccxt/ccxt/pull/15992)
- bybit - ws - upgrade to v3 [#15958](https://github.com/ccxt/ccxt/pull/15958)
- Fix appveyor [#15998](https://github.com/ccxt/ccxt/pull/15998)
- Bybit Pro :: bug fixes [#16005](https://github.com/ccxt/ccxt/pull/16005)
- Cryptocom :: add limit to ohlcv [#16008](https://github.com/ccxt/ccxt/pull/16008)
- Deribit :: fix fetchMyTrades [#16002](https://github.com/ccxt/ccxt/pull/16002)
- Digifinex :: fix parseTicker [#15999](https://github.com/ccxt/ccxt/pull/15999)
- A typo error fixed [#15994](https://github.com/ccxt/ccxt/pull/15994)
- Bkex: fetchMarkets, add swap support [#15993](https://github.com/ccxt/ccxt/pull/15993)
- huobi - rework for networks [#15885](https://github.com/ccxt/ccxt/pull/15885)
- Binance fetch deposit withdraw fee [#15775](https://github.com/ccxt/ccxt/pull/15775)
- Binance :: fix precision type [#16001](https://github.com/ccxt/ccxt/pull/16001)
- Bkex: fetchOrderBook, add swap support [#16018](https://github.com/ccxt/ccxt/pull/16018)
- Bkex: fetchOHLCV, add swap support [#16015](https://github.com/ccxt/ccxt/pull/16015)
- Binance :: fix parseBorrowRateHistory call [#16003](https://github.com/ccxt/ccxt/pull/16003)
- Bybit :: fix spot trades [#16026](https://github.com/ccxt/ccxt/pull/16026)
- btcex: update timeframes ccxt/ccxt#16025 [#16028](https://github.com/ccxt/ccxt/pull/16028)
- huobi: fix withdraw ccxt/ccxt#16016 [#16023](https://github.com/ccxt/ccxt/pull/16023)
- Bkex :: fix fetchMarkets [#16035](https://github.com/ccxt/ccxt/pull/16035)
- Base - cronos / crc20 [#16039](https://github.com/ccxt/ccxt/pull/16039)
- Bkex: fetchFundingRateHistory [#16038](https://github.com/ccxt/ccxt/pull/16038)
- Bkex: fetchTrades, add swap support [#16037](https://github.com/ccxt/ccxt/pull/16037)
- Add 407 status code [bad proxy auth] to httpExceptions in Exchange base class for the error to be thrown [#16053](https://github.com/ccxt/ccxt/pull/16053)
- Fix memory leaks in stream(...) function in \ccxt\pro\binance [#16042](https://github.com/ccxt/ccxt/pull/16042)
- gate new endpoint (editOrder) [#16063](https://github.com/ccxt/ccxt/pull/16063)
- binance new endpoint (editOrder) [#16062](https://github.com/ccxt/ccxt/pull/16062)
- binance - bookticker [#16069](https://github.com/ccxt/ccxt/pull/16069)
- Binance :: route requests through proxy [#15938](https://github.com/ccxt/ccxt/pull/15938)
- Gate: editOrder [#16070](https://github.com/ccxt/ccxt/pull/16070)
- kraken new endpoints (editOrder) [#16072](https://github.com/ccxt/ccxt/pull/16072)
- Bkex: fetchTicker, fetchTickers, add swap support [#16057](https://github.com/ccxt/ccxt/pull/16057)
- exchange.assignDefaultDepositWithdrawFees created [#15867](https://github.com/ccxt/ccxt/pull/15867)
- digifinex - currency precision [#15379](https://github.com/ccxt/ccxt/pull/15379)
- exmo fetchMarkets active key set to undefined instead of true [#16065](https://github.com/ccxt/ccxt/pull/16065)


## 2.1.1

- bkex - `fetchTransactionFees` [#15596](https://github.com/ccxt/ccxt/pull/15596)
- deribit - parseOrder and parseTrade [#15566](https://github.com/ccxt/ccxt/pull/15566)
- crex24-fetchTransactionFees [#15442](https://github.com/ccxt/ccxt/pull/15442)
- Bybit :: fix watchMyTrades [#15628](https://github.com/ccxt/ccxt/pull/15628)
- bitstamp - fetchTransactionFees [#15393](https://github.com/ccxt/ccxt/pull/15393)
- bybit - v1 update to v3 [#15402](https://github.com/ccxt/ccxt/pull/15402)
- tests - fetchMarketLeverageTiers fix [#15631](https://github.com/ccxt/ccxt/pull/15631)
- HUOBI: fix `handleBalance` for linear cross swap [#15617](https://github.com/ccxt/ccxt/pull/15617)
- kuna - fix ticker test [#15636](https://github.com/ccxt/ccxt/pull/15636)
- Update transfer examples [#15644](https://github.com/ccxt/ccxt/pull/15644)
- bitget transfer [#15639](https://github.com/ccxt/ccxt/pull/15639)
- test- fix fetchFundingRateHistory [#15637](https://github.com/ccxt/ccxt/pull/15637)
- deribit - fetchStatus fix (`tests` related) [#15633](https://github.com/ccxt/ccxt/pull/15633)
- Digifinex: fetchTradingFee [#15621](https://github.com/ccxt/ccxt/pull/15621)
- test - skip broken exchanges [#15638](https://github.com/ccxt/ccxt/pull/15638)
- Bybit :: fix cancelOrder [#15647](https://github.com/ccxt/ccxt/pull/15647)
- HUOBI: simple typo on comment [#15643](https://github.com/ccxt/ccxt/pull/15643)
- btcex - stex - double parseTrades [#15567](https://github.com/ccxt/ccxt/pull/15567)
- binanceus - fix private status check [#15649](https://github.com/ccxt/ccxt/pull/15649)
- bittrex - fix trade side [#15655](https://github.com/ccxt/ccxt/pull/15655)
- exchange.marketCodes [#15653](https://github.com/ccxt/ccxt/pull/15653)
- huobi - watchOrderBook [#15661](https://github.com/ccxt/ccxt/pull/15661)
- aax - skip testing [#15670](https://github.com/ccxt/ccxt/pull/15670)
- delist ftx [#15671](https://github.com/ccxt/ccxt/pull/15671)
- Certify kucoin & uncertify waves [#15673](https://github.com/ccxt/ccxt/pull/15673)
- fix urls and delist tidebit [#15674](https://github.com/ccxt/ccxt/pull/15674)
- Bybit :: fix parseWsTicker [#15675](https://github.com/ccxt/ccxt/pull/15675)
- gate POINT -> GatePoint [#15496](https://github.com/ccxt/ccxt/pull/15496)
- coinex-fetchTickers [#15679](https://github.com/ccxt/ccxt/pull/15679)
- cryptocom-fetchTickers [#15684](https://github.com/ccxt/ccxt/pull/15684)
- improve margin apis repay and borrow [#15689](https://github.com/ccxt/ccxt/pull/15689)
- Kraken fetchTickers without symbols [#15687](https://github.com/ccxt/ccxt/pull/15687)
- Skip crex24 [#15695](https://github.com/ccxt/ccxt/pull/15695)
- restore method and fix url [#15694](https://github.com/ccxt/ccxt/pull/15694)
- binance: add vip loan endpoints [#15690](https://github.com/ccxt/ccxt/pull/15690)
- bibox fetchTrades and fetchMyTrades upgrade to v4, fixes: #14095 [#15340](https://github.com/ccxt/ccxt/pull/15340)
- Bibox :: fix trades [#15699](https://github.com/ccxt/ccxt/pull/15699)
- bybit -fix [#15697](https://github.com/ccxt/ccxt/pull/15697)
- bitrue withdraw fix [#15698](https://github.com/ccxt/ccxt/pull/15698)
- mexc3 error handling [#15701](https://github.com/ccxt/ccxt/pull/15701)
- remove alias exchanges from test [#15703](https://github.com/ccxt/ccxt/pull/15703)
- tests - fix alias [#15706](https://github.com/ccxt/ccxt/pull/15706)
- Fix doc building error [#15274](https://github.com/ccxt/ccxt/pull/15274)
- `Skipped` in uppercase [#15708](https://github.com/ccxt/ccxt/pull/15708)
- Digifinex: createOrder, fetchOrder, cancelOrder swap order support [#15642](https://github.com/ccxt/ccxt/pull/15642)
- kucoin - params `chain` fix `fetchTransactionFee` [#15710](https://github.com/ccxt/ccxt/pull/15710)
- Kucoin :: fix fetchTransactionFee [#15713](https://github.com/ccxt/ccxt/pull/15713)
- bigone & bitforex - has fetchTransactionFees false [#15595](https://github.com/ccxt/ccxt/pull/15595)
- base WS - fix headers [#15719](https://github.com/ccxt/ccxt/pull/15719)
- Kucoin: createDepositAddress, fetchDepositAddressesByNetwork [#15705](https://github.com/ccxt/ccxt/pull/15705)
- Build :: disable cex [#15721](https://github.com/ccxt/ccxt/pull/15721)
- coinspot-fetchTickers [#15680](https://github.com/ccxt/ccxt/pull/15680)
- Build :: skip ascendex [#15725](https://github.com/ccxt/ccxt/pull/15725)
- Crypto.com :: fix test urls [#15726](https://github.com/ccxt/ccxt/pull/15726)
- Add pro exchange-capabilities.js [#15730](https://github.com/ccxt/ccxt/pull/15730)
- Build :: disable btcex [#15729](https://github.com/ccxt/ccxt/pull/15729)
- cryptocom endpoints changes [#15724](https://github.com/ccxt/ccxt/pull/15724)
- Kucoin: fetchAllDepositAddressesByNetwork Example [#15733](https://github.com/ccxt/ccxt/pull/15733)
- ccxt.d.ts :: fix fetchMarkets [#15735](https://github.com/ccxt/ccxt/pull/15735)
- Poloniex : : fix parseTicker [#15736](https://github.com/ccxt/ccxt/pull/15736)
- Bibox: fetchTrades, change size to limit [#15742](https://github.com/ccxt/ccxt/pull/15742)
- Digifinex: fetchPosition, fetchPositions [#15607](https://github.com/ccxt/ccxt/pull/15607)
- Digifinex: setLeverage [#15744](https://github.com/ccxt/ccxt/pull/15744)
- better isolated margin support [#15751](https://github.com/ccxt/ccxt/pull/15751)
- parseBalance debt support [#15757](https://github.com/ccxt/ccxt/pull/15757)
- Remove FTX in text and example [#15747](https://github.com/ccxt/ccxt/pull/15747)
- kucoin fetchBalance margin support [#15758](https://github.com/ccxt/ccxt/pull/15758)
- kucoin debt calculation [#15760](https://github.com/ccxt/ccxt/pull/15760)
- various margin edits [#15759](https://github.com/ccxt/ccxt/pull/15759)
- Update margin-borrow-buy-sell-repay-example.js [#15749](https://github.com/ccxt/ccxt/pull/15749)
- whitebit postOnly support [#15761](https://github.com/ccxt/ccxt/pull/15761)
- Gemini :: improve fetchTrades [#15765](https://github.com/ccxt/ccxt/pull/15765)
- binance: add new apis [#15763](https://github.com/ccxt/ccxt/pull/15763)
- Digifinex: fetchTicker, fetchTickers, add swap support [#15008](https://github.com/ccxt/ccxt/pull/15008)
- mexc3 - `commonCurrencies` update [#15773](https://github.com/ccxt/ccxt/pull/15773)
- binance - add streams [#15737](https://github.com/ccxt/ccxt/pull/15737)


## 2.0.1

- okx: update order tag ccxt/ccxt#15367 [#15372](https://github.com/ccxt/ccxt/pull/15372)
- Bitso `fetchTransactionFees` [#15366](https://github.com/ccxt/ccxt/pull/15366)
- bitfinex - `fetchTransactionFees` [#15365](https://github.com/ccxt/ccxt/pull/15365)
- bibox fetchBalance v4 [#15369](https://github.com/ccxt/ccxt/pull/15369)
- docstrings - added docstrings to watch functions [#15368](https://github.com/ccxt/ccxt/pull/15368)
- bybit added options["networks"] [#15386](https://github.com/ccxt/ccxt/pull/15386)
- gate - watchOrders for all symbols [#15297](https://github.com/ccxt/ccxt/pull/15297)
- bibox transfer edit [#15378](https://github.com/ccxt/ccxt/pull/15378)
- okx: minor update [#15371](https://github.com/ccxt/ccxt/pull/15371)
- Add gateio sub accounts [#15240](https://github.com/ccxt/ccxt/pull/15240)
- binance - watchOrders - unify symbol, handleMarketTypeAndParams and doc string [#15315](https://github.com/ccxt/ccxt/pull/15315)
- Bybit: fetchOpenInterest [#15134](https://github.com/ccxt/ccxt/pull/15134)
- fetchOpenInterestHistory: adjust open interest structure [#15088](https://github.com/ccxt/ccxt/pull/15088)
- examples - margin buy/sell update [#15014](https://github.com/ccxt/ccxt/pull/15014)
- bitfinex2 parseTransaction string math [#15000](https://github.com/ccxt/ccxt/pull/15000)
- lbank2.createOrder market buy string math [#14980](https://github.com/ccxt/ccxt/pull/14980)
- Bibox fetch ledger [#15370](https://github.com/ccxt/ccxt/pull/15370)
- ftx - conditional orders [#15375](https://github.com/ccxt/ccxt/pull/15375)
- Binance: European Options API Paths [#15387](https://github.com/ccxt/ccxt/pull/15387)
- deribit - websockets [#15285](https://github.com/ccxt/ccxt/pull/15285)
- kucoin parseDepositAddress unification [#15401](https://github.com/ccxt/ccxt/pull/15401)
- gateio: missing assignment in gate.handleMyTrades [#15411](https://github.com/ccxt/ccxt/pull/15411)
- Typescript fixes [#15410](https://github.com/ccxt/ccxt/pull/15410)
- mexc3: update for wallet endpoints [#15412](https://github.com/ccxt/ccxt/pull/15412)
- bitget: remove testnet ccxt/ccxt#15415 [#15419](https://github.com/ccxt/ccxt/pull/15419)
- example for fetching all deposit addresses asynchronously with fetchDepositAddress on coinex [#15408](https://github.com/ccxt/ccxt/pull/15408)
- gate: fix api path for withdrawals/sub_accounts [#15426](https://github.com/ccxt/ccxt/pull/15426)
- Bibox sort params [#15418](https://github.com/ccxt/ccxt/pull/15418)
- Gate `fetchTransactionFees` [#15428](https://github.com/ccxt/ccxt/pull/15428)
- gateio: order book subscription bug [#15423](https://github.com/ccxt/ccxt/pull/15423)
- Bibox fetch cancel orders v4 [#15382](https://github.com/ccxt/ccxt/pull/15382)
- bybit: update edit contract order [#14853](https://github.com/ccxt/ccxt/pull/14853)
- Push.sh :: add pro/ back to git after build [#15436](https://github.com/ccxt/ccxt/pull/15436)
- Push.sh :: add pro tests dir [#15437](https://github.com/ccxt/ccxt/pull/15437)
- ftx: add exception "Order took too long to process" [#15433](https://github.com/ccxt/ccxt/pull/15433)
- okx.has fetchTradingLimits: false [#15339](https://github.com/ccxt/ccxt/pull/15339)
- Update codes param description [#15440](https://github.com/ccxt/ccxt/pull/15440)
- bitget: add wallet subTransfer [#15421](https://github.com/ccxt/ccxt/pull/15421)
- bitvavo - unify symbol [#15460](https://github.com/ccxt/ccxt/pull/15460)
- bitstamp - unify symbol [#15457](https://github.com/ccxt/ccxt/pull/15457)
- bitopro - unify symbol [#15455](https://github.com/ccxt/ccxt/pull/15455)
- bitmex - unify symbol [#15454](https://github.com/ccxt/ccxt/pull/15454)
- bitmart - unify symbol [#15453](https://github.com/ccxt/ccxt/pull/15453)
- ascendex - unify symbol [#15451](https://github.com/ccxt/ccxt/pull/15451)
- aax - unify symbol [#15450](https://github.com/ccxt/ccxt/pull/15450)
- Fix webWorker usage [#15485](https://github.com/ccxt/ccxt/pull/15485)
- postinstall - script update [#15480](https://github.com/ccxt/ccxt/pull/15480)
- okx: fix ccxt/ccxt#15468 [#15469](https://github.com/ccxt/ccxt/pull/15469)
- kucoin: use v2 symbols [#15474](https://github.com/ccxt/ccxt/pull/15474)
- Bitget :: fix timeframes [#15497](https://github.com/ccxt/ccxt/pull/15497)
- kraken - unify symbol [#15488](https://github.com/ccxt/ccxt/pull/15488)
- idex - unify symbol [#15478](https://github.com/ccxt/ccxt/pull/15478)
- huobijp - unify symbol [#15477](https://github.com/ccxt/ccxt/pull/15477)
- exmo - unify symbol [#15475](https://github.com/ccxt/ccxt/pull/15475)
- currencycom - unify symbol [#15473](https://github.com/ccxt/ccxt/pull/15473)
- cryptocom - unify symbol [#15472](https://github.com/ccxt/ccxt/pull/15472)
- coinex - unify symbol [#15471](https://github.com/ccxt/ccxt/pull/15471)
- coinbasepro - unify symbol [#15470](https://github.com/ccxt/ccxt/pull/15470)
- biitrex - unify symbol [#15459](https://github.com/ccxt/ccxt/pull/15459)
- bitfinex - unify symbol [#15452](https://github.com/ccxt/ccxt/pull/15452)
- tests - semicolon [#15501](https://github.com/ccxt/ccxt/pull/15501)
- upbit - unify symbol [#15493](https://github.com/ccxt/ccxt/pull/15493)
- phemex - unify symbol [#15491](https://github.com/ccxt/ccxt/pull/15491)
- zb - unify symbol [#15495](https://github.com/ccxt/ccxt/pull/15495)
- okx - unify symbol [#15490](https://github.com/ccxt/ccxt/pull/15490)
- okcoin - unify symbol [#15489](https://github.com/ccxt/ccxt/pull/15489)
- mexc3 SOUL -> Soul Swap [#15505](https://github.com/ccxt/ccxt/pull/15505)
- huobi SOUL -> Soulsaver [#15504](https://github.com/ccxt/ccxt/pull/15504)
- huobi parseTrade fix [#15503](https://github.com/ccxt/ccxt/pull/15503)
- cryptocom error mapping [#15511](https://github.com/ccxt/ccxt/pull/15511)
- cryptocom - fix watchOrderBook limit issue and marketId clash [#15515](https://github.com/ccxt/ccxt/pull/15515)


## 1.95.1

- huobi.createOrder market buy string math [#14930](https://github.com/ccxt/ccxt/pull/14930)
- bitmart.createOrder string math [#14895](https://github.com/ccxt/ccxt/pull/14895)
- binance.createOrder market buy string math [#14892](https://github.com/ccxt/ccxt/pull/14892)
- AAX: fetchOpenInterest [#15150](https://github.com/ccxt/ccxt/pull/15150)
- Huobi: fetchOpenInterest [#15125](https://github.com/ccxt/ccxt/pull/15125)
- Missing import :: add ccxt.pro.base.exchange [#15191](https://github.com/ccxt/ccxt/pull/15191)
- gate - watchOrderBook - reset subscription on error [#15186](https://github.com/ccxt/ccxt/pull/15186)
- FTX: fetchOpenInterest [#15156](https://github.com/ccxt/ccxt/pull/15156)
- Ccxt.pro :: Fix ts declarations [#15190](https://github.com/ccxt/ccxt/pull/15190)
- bybit new v3 signature [#15175](https://github.com/ccxt/ccxt/pull/15175)
- poloniex deposit address networks [#15180](https://github.com/ccxt/ccxt/pull/15180)
- Bybit :: watchTicker :: fix timestamp [#15205](https://github.com/ccxt/ccxt/pull/15205)
- digifinex - fetchCurrencies [#15054](https://github.com/ccxt/ccxt/pull/15054)
- OKX :: fix orderbook checksum [#15213](https://github.com/ccxt/ccxt/pull/15213)
- bybit: use premiumIndex instead premium [#15211](https://github.com/ccxt/ccxt/pull/15211)
- binance: update sapi api endpoints [#15203](https://github.com/ccxt/ccxt/pull/15203)
- Bitget :: add missing endpoint [#15217](https://github.com/ccxt/ccxt/pull/15217)
- Okx: fetchOpenInterest [#15099](https://github.com/ccxt/ccxt/pull/15099)
- digifinex - use min_withdraw_fee as network fee [#15215](https://github.com/ccxt/ccxt/pull/15215)
- ftx fix fetchPositions [#15226](https://github.com/ccxt/ccxt/pull/15226)
- Ftx edit fetchPositions calculations [#15227](https://github.com/ccxt/ccxt/pull/15227)
- updated ftxus fees [#15228](https://github.com/ccxt/ccxt/pull/15228)
- yarl python [#15229](https://github.com/ccxt/ccxt/pull/15229)
- Bitmart: fetchBalance, add swap support [#15209](https://github.com/ccxt/ccxt/pull/15209)
- Exchange :: add missing await [#15230](https://github.com/ccxt/ccxt/pull/15230)
- Bybit :: fix tp sl orders [#15237](https://github.com/ccxt/ccxt/pull/15237)
- mercado - fetchOHLCV [#15137](https://github.com/ccxt/ccxt/pull/15137)
- Bitmart: fetchOHLCV, add swap support [#15198](https://github.com/ccxt/ccxt/pull/15198)
- bitget - wallet endpoints [#15163](https://github.com/ccxt/ccxt/pull/15163)
- Bybit :: fix load markets placement [#15243](https://github.com/ccxt/ccxt/pull/15243)
- Cli :: remove duplicated output [#15241](https://github.com/ccxt/ccxt/pull/15241)
- TS :: fix pro types [#15248](https://github.com/ccxt/ccxt/pull/15248)
- currencycom.fetchMarkets string math [#15017](https://github.com/ccxt/ccxt/pull/15017)
- mexc networks updated to working values [#15252](https://github.com/ccxt/ccxt/pull/15252)
- fetchOpenInterest: add edits to Manual.md [#15254](https://github.com/ccxt/ccxt/pull/15254)
- ndax.has["fetchTickers"] == false [#15253](https://github.com/ccxt/ccxt/pull/15253)
- Build :: disable bitfinex temporarily  [#15257](https://github.com/ccxt/ccxt/pull/15257)
- huobi - new endpoints [#15152](https://github.com/ccxt/ccxt/pull/15152)
- Kraken :: add symbol to WS orderbook [#15255](https://github.com/ccxt/ccxt/pull/15255)
- multiple exchanges - currency-wide precisions [#15132](https://github.com/ccxt/ccxt/pull/15132)
- Build :: fix build [#15261](https://github.com/ccxt/ccxt/pull/15261)
- okx.createOrder market buy string math [#14966](https://github.com/ccxt/ccxt/pull/14966)
- bybit createSpotOrder & parseLedgerEntry string math [#14915](https://github.com/ccxt/ccxt/pull/14915)


## 1.93.1

- binance new endpoints [#15084](https://github.com/ccxt/ccxt/pull/15084)
- types: add position related function [#15060](https://github.com/ccxt/ccxt/pull/15060)
- transfer example updates [#15031](https://github.com/ccxt/ccxt/pull/15031)
- base - undefined string in findBroadlyMatchedKey exception [#14582](https://github.com/ccxt/ccxt/pull/14582)
- bybit - omit base_price from params fix #15070 [#15111](https://github.com/ccxt/ccxt/pull/15111)
- bybit: add spot v3 api endpoints [#15117](https://github.com/ccxt/ccxt/pull/15117)
- huobi error mapping [#15120](https://github.com/ccxt/ccxt/pull/15120)
- Mexc3: cancelOrder add margin support [#14845](https://github.com/ccxt/ccxt/pull/14845)
- binance error mapping [#15123](https://github.com/ccxt/ccxt/pull/15123)
- yobit fetchDepositAddress networks [#15119](https://github.com/ccxt/ccxt/pull/15119)
- bitmart remove delisted commonCurrencies [#14598](https://github.com/ccxt/ccxt/pull/14598)
- binance: add pmAccountInfo api [#15138](https://github.com/ccxt/ccxt/pull/15138)
- `fetchOHLCV` - normalization of required arguments across exchanges [#15122](https://github.com/ccxt/ccxt/pull/15122)
- Fix: minor typo [#15140](https://github.com/ccxt/ccxt/pull/15140)
- Luno: replace fetchTradingFees [#15104](https://github.com/ccxt/ccxt/pull/15104)
- Mexc3: fetchOrders margin support [#15127](https://github.com/ccxt/ccxt/pull/15127)
- bitmart fetchOHLCV fix [#15142](https://github.com/ccxt/ccxt/pull/15142)
- binance error mapping [#15145](https://github.com/ccxt/ccxt/pull/15145)
- bitmart: update spot endpoints [#15147](https://github.com/ccxt/ccxt/pull/15147)
- Bybit order link id [#15151](https://github.com/ccxt/ccxt/pull/15151)
- binance.fetchMarkets: removed duplicate code [#15149](https://github.com/ccxt/ccxt/pull/15149)
- Btcturk fetchOHLCV new endpont [#15135](https://github.com/ccxt/ccxt/pull/15135)
- Hitbtc3: handleMarginModeAndParams [#14806](https://github.com/ccxt/ccxt/pull/14806)
- okcoin added main to account types [#15114](https://github.com/ccxt/ccxt/pull/15114)
- exchange.calculateFee string math [#15028](https://github.com/ccxt/ccxt/pull/15028)
- Bl3p precise [#14904](https://github.com/ccxt/ccxt/pull/14904)
- coinbase.parseLedgerEntry string math [#15020](https://github.com/ccxt/ccxt/pull/15020)
- Bitstamp fetchOrder string math [#15019](https://github.com/ccxt/ccxt/pull/15019)
- Fix build :: formatting [#15155](https://github.com/ccxt/ccxt/pull/15155)
- python decimal_to_precision checks for decimal type in assertions [#15115](https://github.com/ccxt/ccxt/pull/15115)
- bitmart: add api endpoints for contract (futures) [#15159](https://github.com/ccxt/ccxt/pull/15159)
- bitmart: add fetchTradingFee [#15158](https://github.com/ccxt/ccxt/pull/15158)
- lbank2 - network related fixes [#15012](https://github.com/ccxt/ccxt/pull/15012)
- The Merge - CCXT PRO integration into CCXT free 🔥 [#15085](https://github.com/ccxt/ccxt/pull/15085)
- Revert "The Merge - CCXT PRO integration into CCXT free 🔥" [#15167](https://github.com/ccxt/ccxt/pull/15167)
- The Merge - CCXT PRO  [#15170](https://github.com/ccxt/ccxt/pull/15170)
- Fix vss path [#15172](https://github.com/ccxt/ccxt/pull/15172)


## 1.92.1

- poloniex - fix base volume [#14758](https://github.com/ccxt/ccxt/pull/14758)
- gate - fix base volume [#14757](https://github.com/ccxt/ccxt/pull/14757)
- aax - fix volume [#14756](https://github.com/ccxt/ccxt/pull/14756)
- bw - add missing timeframe [#14737](https://github.com/ccxt/ccxt/pull/14737)
- OKX: Hongkong time [#14703](https://github.com/ccxt/ccxt/pull/14703)
- Fix `margin/borrow/repaid` endpoint for kucoin [#14764](https://github.com/ccxt/ccxt/pull/14764)
- Update ftx network mapping [#14770](https://github.com/ccxt/ccxt/pull/14770)
- woo: update ratelimit for get positions / get position [#14768](https://github.com/ccxt/ccxt/pull/14768)
- kraken - ratelimits [#14688](https://github.com/ccxt/ccxt/pull/14688)
- Okx: handleMarginModeAndParams - setLeverage, fetchMarketLeverageTiers [#14739](https://github.com/ccxt/ccxt/pull/14739)
- bitmart error mapping [#14777](https://github.com/ccxt/ccxt/pull/14777)
- Fix `margin/trade/last` endpoint's scope for kucoin [#14778](https://github.com/ccxt/ccxt/pull/14778)
- Mexc3 :: fix fetchMyTrades [#14774](https://github.com/ccxt/ccxt/pull/14774)
- Okx: fetchLedger unify marginMode [#14267](https://github.com/ccxt/ccxt/pull/14267)
- phemex  - fix order-types comment [#14258](https://github.com/ccxt/ccxt/pull/14258)
- ftx.has["createPostOnlyOrder"] added. fixes:#14742 [#14785](https://github.com/ccxt/ccxt/pull/14785)
- huobi Math.whatever -> Precise [#14715](https://github.com/ccxt/ccxt/pull/14715)
- Zb: handleMarginModeAndParams [#14752](https://github.com/ccxt/ccxt/pull/14752)
- Crypto.com: add handleMarginModeAndParams [#14661](https://github.com/ccxt/ccxt/pull/14661)
- binance: send `isIsolated` param for isolated margin mode on `fetchMyTrades` [#14788](https://github.com/ccxt/ccxt/pull/14788)
- poloniex parseTransactionStatus update [#14789](https://github.com/ccxt/ccxt/pull/14789)
- Added support for SOL and DOT [#14784](https://github.com/ccxt/ccxt/pull/14784)
- Hitbtc3 :: fix fee key [#14781](https://github.com/ccxt/ccxt/pull/14781)
- bitmex: fix ccxt/ccxt#14775 [#14779](https://github.com/ccxt/ccxt/pull/14779)
- mexc3: add new api endpoints [#14792](https://github.com/ccxt/ccxt/pull/14792)
- [FIX] kraken.py: fixing amount variable type convertion [#14796](https://github.com/ccxt/ccxt/pull/14796)
- okx fetchCurrencies Math.whatever -> Precise [#14714](https://github.com/ccxt/ccxt/pull/14714)
- Okx: Adjust stop handling for fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders [#14713](https://github.com/ccxt/ccxt/pull/14713)
- Bitmart: handleMarginModeAndParams [#14738](https://github.com/ccxt/ccxt/pull/14738)
- bybit: add derivatives v3 apis [#14805](https://github.com/ccxt/ccxt/pull/14805)
- bybit.parseOrderStaus added PartiallyFilled: "open" [#14803](https://github.com/ccxt/ccxt/pull/14803)
- Bitget add createMarketBuyRequiresPrice and stop-order error catching [#14773](https://github.com/ccxt/ccxt/pull/14773)
- bitfinex2 replace Math.whatever with Precise [#14712](https://github.com/ccxt/ccxt/pull/14712)
- bitmex describe updates [#14795](https://github.com/ccxt/ccxt/pull/14795)
- binanceusdm and binancecoinm has["spot"] == false, and has["swap"] == true. fixes:#14760 [#14783](https://github.com/ccxt/ccxt/pull/14783)
- php 5.5+ [#14640](https://github.com/ccxt/ccxt/pull/14640)
- Kucoin: handleMarginModeAndParams [#14782](https://github.com/ccxt/ccxt/pull/14782)
- Binance :: fix fetchMyTrades [#14818](https://github.com/ccxt/ccxt/pull/14818)
- [huobi] default subtype as linear [#14817](https://github.com/ccxt/ccxt/pull/14817)
- Adds Alpaca Crypto Exchange [#10625](https://github.com/ccxt/ccxt/pull/10625)
- Exchange :: Alpaca [#13918](https://github.com/ccxt/ccxt/pull/13918)
- ascendex - fix capitalize [#14827](https://github.com/ccxt/ccxt/pull/14827)
- Tests :: read api keys from environment [#14822](https://github.com/ccxt/ccxt/pull/14822)
- Bibox v4 markets [#14216](https://github.com/ccxt/ccxt/pull/14216)
- Huobi :: change defaultSubType value [#14821](https://github.com/ccxt/ccxt/pull/14821)
- Binance transfer isolated margin [#14519](https://github.com/ccxt/ccxt/pull/14519)
- base - throttler capacity message [#14546](https://github.com/ccxt/ccxt/pull/14546)
- uncertify exchanges [#14831](https://github.com/ccxt/ccxt/pull/14831)
- poloniex: fix ccxt/ccxt#14829 [#14830](https://github.com/ccxt/ccxt/pull/14830)
- Bitmex :: protect convertValue [#14834](https://github.com/ccxt/ccxt/pull/14834)
- binance - fix isolated transfer [#14840](https://github.com/ccxt/ccxt/pull/14840)
- whitebit - fix markets [#14852](https://github.com/ccxt/ccxt/pull/14852)
- base - expose throttle queue [#14848](https://github.com/ccxt/ccxt/pull/14848)
- Mexc3: borrowMargin [#14832](https://github.com/ccxt/ccxt/pull/14832)
- example for binance margin sell [#14843](https://github.com/ccxt/ccxt/pull/14843)
- hollaex add triggerPrice and omit params [#14842](https://github.com/ccxt/ccxt/pull/14842)


## 1.91.1

- bybit - error codes [#14545](https://github.com/ccxt/ccxt/pull/14545)
- huobi: patch ccxt/ccxt#14553 [#14555](https://github.com/ccxt/ccxt/pull/14555)
- bybit parseTrade fee on spot [#14551](https://github.com/ccxt/ccxt/pull/14551)
- buda - fix parseOrder cost [#14548](https://github.com/ccxt/ccxt/pull/14548)
- bitget - fix transaction type [#14547](https://github.com/ccxt/ccxt/pull/14547)
- crc32 signed and unsigned support [#14543](https://github.com/ccxt/ccxt/pull/14543)
- coinbasepro - add endpoint for fetching conversion by id [#14541](https://github.com/ccxt/ccxt/pull/14541)
- Reset package-lock.json yarn.lock when cleanup [#14539](https://github.com/ccxt/ccxt/pull/14539)
- bitbns - fix withdrawal different date field [#14549](https://github.com/ccxt/ccxt/pull/14549)
- gate - fix fetchMytrades null fees [#14525](https://github.com/ccxt/ccxt/pull/14525)
- Kucoin: borrowMargin, repayMargin [#14493](https://github.com/ccxt/ccxt/pull/14493)
- Ignore netrc [#14561](https://github.com/ccxt/ccxt/pull/14561)
- transpiler edits [#14562](https://github.com/ccxt/ccxt/pull/14562)
- Crypto.com: fetchOrder margin bug [#14576](https://github.com/ccxt/ccxt/pull/14576)
- Whitebit: add margin support to fetchMarkets [#14564](https://github.com/ccxt/ccxt/pull/14564)
- bithumb - fix comma number [#14542](https://github.com/ccxt/ccxt/pull/14542)
- bitbns - add withdrawal type detection [#14550](https://github.com/ccxt/ccxt/pull/14550)
- aax.createOrder postOnly bug [#14577](https://github.com/ccxt/ccxt/pull/14577)
- Binance cancel all orders - isolated margin [#14521](https://github.com/ccxt/ccxt/pull/14521)
- minor transpiler edit [#14580](https://github.com/ccxt/ccxt/pull/14580)
- Build :: skip btcalpha [#14585](https://github.com/ccxt/ccxt/pull/14585)
- whitebit: stop orders (clean) [#14583](https://github.com/ccxt/ccxt/pull/14583)
- bitmex - fetch_transactions return all transactions + fix fee decimal places [#14485](https://github.com/ccxt/ccxt/pull/14485)
- Bitmart: add fetchBorrowRates [#14487](https://github.com/ccxt/ccxt/pull/14487)
- base - handleSubTypeAndParams [#14535](https://github.com/ccxt/ccxt/pull/14535)
- Bitmart: add fetchBorrowInterest [#14488](https://github.com/ccxt/ccxt/pull/14488)
- bibox - v4 private endpoints fix [#14281](https://github.com/ccxt/ccxt/pull/14281)
- bitcoincom - `alias:true` [#14220](https://github.com/ccxt/ccxt/pull/14220)
- binance: add more portfolio margin apis [#14480](https://github.com/ccxt/ccxt/pull/14480)
- cryptocom: update safeNetwork [#14511](https://github.com/ccxt/ccxt/pull/14511)
- Blockchaincom add withdrawal example [#14484](https://github.com/ccxt/ccxt/pull/14484)
- Bybit: fetchBorrowRate [#14406](https://github.com/ccxt/ccxt/pull/14406)
- Binance isolated fetch order [#14396](https://github.com/ccxt/ccxt/pull/14396)
- gemini - fix nonce error [#14602](https://github.com/ccxt/ccxt/pull/14602)
- Huobi :: small improvements [#14601](https://github.com/ccxt/ccxt/pull/14601)
- gate: fix tag error [#14606](https://github.com/ccxt/ccxt/pull/14606)
- Binance fetch orders - isolated marginMode [#14399](https://github.com/ccxt/ccxt/pull/14399)
- Binance cancel order isolated [#14397](https://github.com/ccxt/ccxt/pull/14397)
- Binance fetchOpenOrders isolated [#14395](https://github.com/ccxt/ccxt/pull/14395)
- base - `undefined` for  `createMarketOrder`  price [#14255](https://github.com/ccxt/ccxt/pull/14255)
- binance.createOrder, can specify cross or isolated for marginMode [#14390](https://github.com/ccxt/ccxt/pull/14390)
- gate: fix ccxt/ccxt#14611 [#14612](https://github.com/ccxt/ccxt/pull/14612)
- bitflyer: add count when fetch trades [#14616](https://github.com/ccxt/ccxt/pull/14616)
- Kucoin: Add isolated margin endpoints [#14466](https://github.com/ccxt/ccxt/pull/14466)
- Okcoin: set margin to false [#14563](https://github.com/ccxt/ccxt/pull/14563)
- Kucoin: add isolated margin to transfer [#14520](https://github.com/ccxt/ccxt/pull/14520)
- gemini - small fix when to throw error message [#14620](https://github.com/ccxt/ccxt/pull/14620)
- Bitmart: createOrder add margin support [#14486](https://github.com/ccxt/ccxt/pull/14486)
- safeValue calcRateLimiterCost [#14629](https://github.com/ccxt/ccxt/pull/14629)
- huobipro exchange has name "Huobi Pro". fixes:14570 [#14604](https://github.com/ccxt/ccxt/pull/14604)
- okx edit ratelimit [#14632](https://github.com/ccxt/ccxt/pull/14632)
- poloniex: new spot api [#14592](https://github.com/ccxt/ccxt/pull/14592)


## 1.90.1

- Okx :: fix createOrder [#14246](https://github.com/ccxt/ccxt/pull/14246)
- Manual: borrowMargin, repayMargin [#14238](https://github.com/ccxt/ccxt/pull/14238)
- ftx - unrealizedPnl fix [#14254](https://github.com/ccxt/ccxt/pull/14254)
- test.Orderbook :: fix assertion [#14261](https://github.com/ccxt/ccxt/pull/14261)
- Tidex :: fix missing argument [#14260](https://github.com/ccxt/ccxt/pull/14260)
- gate - fix cost strings [#14259](https://github.com/ccxt/ccxt/pull/14259)
- Fix test.OpenInterest assertion [#14270](https://github.com/ccxt/ccxt/pull/14270)
- FetchTradingFee :: fix exchange parameter [#14274](https://github.com/ccxt/ccxt/pull/14274)
- ftx - remove `recentPnl` [#14272](https://github.com/ccxt/ccxt/pull/14272)
- Okx :: fix margin check [#14285](https://github.com/ccxt/ccxt/pull/14285)
- Ftx :: fix parsePosition  [#14283](https://github.com/ccxt/ccxt/pull/14283)
- Binance :: fix parseMarketLeverageTiers [#14301](https://github.com/ccxt/ccxt/pull/14301)
- add ltc for kucoin [#14298](https://github.com/ccxt/ccxt/pull/14298)
- Hollaex :: fix fetchOrderBooks [#14302](https://github.com/ccxt/ccxt/pull/14302)
- Woo :: fix parseLedgerEntry [#14300](https://github.com/ccxt/ccxt/pull/14300)
- Bybit :: fee fix [#14299](https://github.com/ccxt/ccxt/pull/14299)
- Bitfinex :: fix withdraw [#14304](https://github.com/ccxt/ccxt/pull/14304)
- Deribit :: fix fetchStatus [#14306](https://github.com/ccxt/ccxt/pull/14306)
- Bitmart :: fix parseTicker [#14305](https://github.com/ccxt/ccxt/pull/14305)
- Mexc :: fix parseMarginModification [#14309](https://github.com/ccxt/ccxt/pull/14309)
- Bytetrade :: fix safeString call [#14310](https://github.com/ccxt/ccxt/pull/14310)
- Independentreserver :: fix parseOrder [#14308](https://github.com/ccxt/ccxt/pull/14308)
- Upbit :: fix timestamp [#14312](https://github.com/ccxt/ccxt/pull/14312)
- Gate :: fix fetchBalance [#14311](https://github.com/ccxt/ccxt/pull/14311)
- Latoken :: fix handleErrors [#14307](https://github.com/ccxt/ccxt/pull/14307)
- Btcalpha :: fix timestamp [#14313](https://github.com/ccxt/ccxt/pull/14313)
- zb fetchOpenOrders fix [#14314](https://github.com/ccxt/ccxt/pull/14314)
- bibox fetchOrderBook fix [#14315](https://github.com/ccxt/ccxt/pull/14315)
- bitfinex2 createOrder fix [#14316](https://github.com/ccxt/ccxt/pull/14316)
- Bitmart: borrowMargin, repayMargin [#14278](https://github.com/ccxt/ccxt/pull/14278)
- bittrex - fix milliseconds precision [#14317](https://github.com/ccxt/ccxt/pull/14317)
- Okx: fetchMarketLeverageTiers unify marginMode [#14277](https://github.com/ccxt/ccxt/pull/14277)
- mexc error mapping [#14321](https://github.com/ccxt/ccxt/pull/14321)
- zb fetchClosedOrders fix for spot [#14323](https://github.com/ccxt/ccxt/pull/14323)
- Crypto.com Margin [#14107](https://github.com/ccxt/ccxt/pull/14107)
- Whitebit :: fix handleErrors [#14332](https://github.com/ccxt/ccxt/pull/14332)
- Update gate orderStatus for for futures trigger orders [#14341](https://github.com/ccxt/ccxt/pull/14341)
- Binance :: fix timestamp [#14339](https://github.com/ccxt/ccxt/pull/14339)
- Bitrue :: fix parseBalance [#14338](https://github.com/ccxt/ccxt/pull/14338)
- Zb :: fix fetchCanceledOrders [#14334](https://github.com/ccxt/ccxt/pull/14334)
- sort-swap-markets-by-hourly-price-change uses latest unfinished candle instead of penultimate candle [#14329](https://github.com/ccxt/ccxt/pull/14329)
- Bitmart: fetchBorrowRate [#14345](https://github.com/ccxt/ccxt/pull/14345)
- Huobi :: fix php signing [#14356](https://github.com/ccxt/ccxt/pull/14356)
- Bybit :: fix positions filtering [#14353](https://github.com/ccxt/ccxt/pull/14353)
- Huobi :: fix market order parsing [#14351](https://github.com/ccxt/ccxt/pull/14351)
- probit fetchDepositAddress networks [#14364](https://github.com/ccxt/ccxt/pull/14364)
- Btcturk :: fix parseOrder [#14363](https://github.com/ccxt/ccxt/pull/14363)
- FundingFee(s) - > TransactionFee(s) [#14362](https://github.com/ccxt/ccxt/pull/14362)
- ascendex fetchMarkets leveraged tokens [#14359](https://github.com/ccxt/ccxt/pull/14359)
- Bybit :: fix stop orders [#14354](https://github.com/ccxt/ccxt/pull/14354)
- Binance fetch balance isolated [#14346](https://github.com/ccxt/ccxt/pull/14346)
- Bitmart :: fix orderId type [#14370](https://github.com/ccxt/ccxt/pull/14370)
- Update bitmart API and ratelimits [#14319](https://github.com/ccxt/ccxt/pull/14319)
- docstrings - close bracket [#14374](https://github.com/ccxt/ccxt/pull/14374)
- Bybit :: take timeDifference into consideration [#14106](https://github.com/ccxt/ccxt/pull/14106)
- binance: fix data not found with symbols ccxt/ccxt#14384 [#14391](https://github.com/ccxt/ccxt/pull/14391)
- ftx: add api endpoints for twap ccxt/ccxt#14402 [#14403](https://github.com/ccxt/ccxt/pull/14403)
- nest urls [#14330](https://github.com/ccxt/ccxt/pull/14330)
- huobi: fix ccxt/ccxt#14387 [#14394](https://github.com/ccxt/ccxt/pull/14394)
- bybit - fix missing loadmarkets [#14379](https://github.com/ccxt/ccxt/pull/14379)
- spelling error in coinbase.py [#14414](https://github.com/ccxt/ccxt/pull/14414)
- Bybit :: fix ticker volume [#14408](https://github.com/ccxt/ccxt/pull/14408)
- Fix fetchFundingRates issues [#14419](https://github.com/ccxt/ccxt/pull/14419)
- binance: fix wrong signature when calling staking ccxt/ccxt#14417 [#14418](https://github.com/ccxt/ccxt/pull/14418)
- Woo :: fix parseOrder [#14427](https://github.com/ccxt/ccxt/pull/14427)
- safeOrder omit zero fee currencies [#14422](https://github.com/ccxt/ccxt/pull/14422)


## 1.89.1

- bittrex: unify market [#14118](https://github.com/ccxt/ccxt/pull/14118)
- bitvavo: unify market [#14119](https://github.com/ccxt/ccxt/pull/14119)
- safeBalance :: small improvement [#14102](https://github.com/ccxt/ccxt/pull/14102)
- bitfinex2: unify market [#14140](https://github.com/ccxt/ccxt/pull/14140)
- bigone: use market['symbol'] [#14135](https://github.com/ccxt/ccxt/pull/14135)
- huobi - when sending an order which would end up above limit [#14103](https://github.com/ccxt/ccxt/pull/14103)
- gemini: unify market [#14122](https://github.com/ccxt/ccxt/pull/14122)
- therock: unify market [#14184](https://github.com/ccxt/ccxt/pull/14184)
- hitbtc: unify market [#14124](https://github.com/ccxt/ccxt/pull/14124)
- kucoin: unify market [#14126](https://github.com/ccxt/ccxt/pull/14126)
- btcturk: use market['symbol'] [#14155](https://github.com/ccxt/ccxt/pull/14155)
- Bitget :: fix php request [#14123](https://github.com/ccxt/ccxt/pull/14123)
- delta: unify market [#14164](https://github.com/ccxt/ccxt/pull/14164)
- ripio: unify market [#14128](https://github.com/ccxt/ccxt/pull/14128)
- poloniex: unify market [#14129](https://github.com/ccxt/ccxt/pull/14129)
- hollaex: unify market [#14125](https://github.com/ccxt/ccxt/pull/14125)
- ascendex.fetchTime implemented [#14111](https://github.com/ccxt/ccxt/pull/14111)
- Bibox v3 [#12562](https://github.com/ccxt/ccxt/pull/12562)
- okx.fetchDeposit [#14132](https://github.com/ccxt/ccxt/pull/14132)
- Zonda :: fix api call [#14191](https://github.com/ccxt/ccxt/pull/14191)
- qtrade: unify market [#14188](https://github.com/ccxt/ccxt/pull/14188)
- zaif: unify market [#14186](https://github.com/ccxt/ccxt/pull/14186)
- novadax: unify market [#14181](https://github.com/ccxt/ccxt/pull/14181)
- mercado: unify market [#14180](https://github.com/ccxt/ccxt/pull/14180)
- kuna: unify market [#14178](https://github.com/ccxt/ccxt/pull/14178)
- itbit: unify market [#14169](https://github.com/ccxt/ccxt/pull/14169)
- eqonex: use market['symbol'] [#14168](https://github.com/ccxt/ccxt/pull/14168)
- okx.fetchWithdrawal [#14131](https://github.com/ccxt/ccxt/pull/14131)
- indodax: unify market [#14170](https://github.com/ccxt/ccxt/pull/14170)
- xena: unify market [#14182](https://github.com/ccxt/ccxt/pull/14182)
- cex: unify market [#14157](https://github.com/ccxt/ccxt/pull/14157)
- deribit: use market['symbol'] [#14166](https://github.com/ccxt/ccxt/pull/14166)
- coinspot: unify market [#14163](https://github.com/ccxt/ccxt/pull/14163)
- blockchaincom: unify market [#14147](https://github.com/ccxt/ccxt/pull/14147)
- bkex: use market['symbol'] [#14145](https://github.com/ccxt/ccxt/pull/14145)
- bitpanda: unify market [#14144](https://github.com/ccxt/ccxt/pull/14144)
- independentreserve: use market['symbol'] [#14171](https://github.com/ccxt/ccxt/pull/14171)
- digifinex: use market['symbol'] [#14167](https://github.com/ccxt/ccxt/pull/14167)
- crex24: use market['symbol'] [#14161](https://github.com/ccxt/ccxt/pull/14161)
- coinfalcon: unify market [#14159](https://github.com/ccxt/ccxt/pull/14159)
- coincheck: unify market [#14156](https://github.com/ccxt/ccxt/pull/14156)
- buda: unify market [#14154](https://github.com/ccxt/ccxt/pull/14154)
- btctradeua: use market['symbol'] [#14153](https://github.com/ccxt/ccxt/pull/14153)
- btcbox: use market['symbol'] [#14149](https://github.com/ccxt/ccxt/pull/14149)
- btcalpha: unify market [#14148](https://github.com/ccxt/ccxt/pull/14148)
- bl3p: use market['symbol'] [#14146](https://github.com/ccxt/ccxt/pull/14146)
- bitbank: unify market [#14139](https://github.com/ccxt/ccxt/pull/14139)
- bitforex: unify market [#14142](https://github.com/ccxt/ccxt/pull/14142)
- btcex: use market['symbol'] [#14150](https://github.com/ccxt/ccxt/pull/14150)
- bitso: unify market [#14143](https://github.com/ccxt/ccxt/pull/14143)
- liquid: unify market [#14172](https://github.com/ccxt/ccxt/pull/14172)
- cdax: use market['symbol'] [#14158](https://github.com/ccxt/ccxt/pull/14158)
- bw: use market['symbol'] [#14152](https://github.com/ccxt/ccxt/pull/14152)
- bitbns: use market['symbol'] [#14138](https://github.com/ccxt/ccxt/pull/14138)
- bit2c: unify market [#14137](https://github.com/ccxt/ccxt/pull/14137)
- probit: use market['symbol'] [#14187](https://github.com/ccxt/ccxt/pull/14187)
- zonda: unify market [#14185](https://github.com/ccxt/ccxt/pull/14185)
- kucoinfutures: unify market [#14179](https://github.com/ccxt/ccxt/pull/14179)
- luno: unify market [#14174](https://github.com/ccxt/ccxt/pull/14174)
- lykke: unify market [#14173](https://github.com/ccxt/ccxt/pull/14173)
- bytetrade: use market['symbol'] [#14151](https://github.com/ccxt/ccxt/pull/14151)
- coinone: unify market [#14162](https://github.com/ccxt/ccxt/pull/14162)
- bitflyer: unify market [#14141](https://github.com/ccxt/ccxt/pull/14141)
- bibox: use market['symbol'] [#14136](https://github.com/ccxt/ccxt/pull/14136)
- Bitbank :: fix fetchMyTrades [#14197](https://github.com/ccxt/ccxt/pull/14197)
- paymium: unify market [#14189](https://github.com/ccxt/ccxt/pull/14189)
- setMargin docstrings [#14134](https://github.com/ccxt/ccxt/pull/14134)
- huobi - precision (TICK_SIZE) shorten [#14105](https://github.com/ccxt/ccxt/pull/14105)
- ZB borrowMargin [#13735](https://github.com/ccxt/ccxt/pull/13735)
- Add woox apis [#13454](https://github.com/ccxt/ccxt/pull/13454)
- lbank2: use market['symbol'] [#14175](https://github.com/ccxt/ccxt/pull/14175)
- latoken: use market['symbol'] [#14177](https://github.com/ccxt/ccxt/pull/14177)
- exmo: use market['symbol'] [#14165](https://github.com/ccxt/ccxt/pull/14165)
- tidebit: unify market [#14183](https://github.com/ccxt/ccxt/pull/14183)
- lbank: unify market [#14176](https://github.com/ccxt/ccxt/pull/14176)
- coinmate: unify market [#14160](https://github.com/ccxt/ccxt/pull/14160)
- Woox repayMargin [#14044](https://github.com/ccxt/ccxt/pull/14044)
- delta: add fetch position / margin mode [#13992](https://github.com/ccxt/ccxt/pull/13992)
- fetchMyBuys and fetchMySells removed from has [#14194](https://github.com/ccxt/ccxt/pull/14194)
- gate: add fetch position / margin mode [#13998](https://github.com/ccxt/ccxt/pull/13998)
- Gate borrowMargin, repayMargin [#14043](https://github.com/ccxt/ccxt/pull/14043)
- mexc3: add fetchPositionMode & fetchMarginMode & setPositionMode [#14056](https://github.com/ccxt/ccxt/pull/14056)
- TICK_SIZE - bytetrade [#13580](https://github.com/ccxt/ccxt/pull/13580)
- binance.has false methods [#14205](https://github.com/ccxt/ccxt/pull/14205)


## 1.88.1

- latoken error mapping [#13987](https://github.com/ccxt/ccxt/pull/13987)
- Bump shell-quote from 1.6.1 to 1.7.3 [#14006](https://github.com/ccxt/ccxt/pull/14006)
- Ascendex fetchBalance [#14008](https://github.com/ccxt/ccxt/pull/14008)
- exmo: add fetch position / margin mode [#13995](https://github.com/ccxt/ccxt/pull/13995)
- ftx: add fetch position / margin mode [#13997](https://github.com/ccxt/ccxt/pull/13997)
- eqonex: add fetch position / margin mode [#13996](https://github.com/ccxt/ccxt/pull/13996)
- digifinex: add fetch position / margin mode [#13994](https://github.com/ccxt/ccxt/pull/13994)
- gemini: add fetch position / margin mode [#13999](https://github.com/ccxt/ccxt/pull/13999)
- coinbasepro: remove deprecated market fields [#14015](https://github.com/ccxt/ccxt/pull/14015)
- hollaex: add fetch position / margin mode [#14000](https://github.com/ccxt/ccxt/pull/14000)
- deribit: add fetch position / margin mode [#13993](https://github.com/ccxt/ccxt/pull/13993)
- coinbasepro: add fetchPositionMode & fetchMarginMode [#13936](https://github.com/ccxt/ccxt/pull/13936)
- Coinex: adding SL / TP orders [#13981](https://github.com/ccxt/ccxt/pull/13981)
- cryptocom: add otc endpoints [#13947](https://github.com/ccxt/ccxt/pull/13947)
- wavesexchange - precision fixes #13880 [#14021](https://github.com/ccxt/ccxt/pull/14021)
- Binance borrowMargin [#13732](https://github.com/ccxt/ccxt/pull/13732)
- bittrex fixes #14003, fetchDeposit and fetchWithdrawal [#14020](https://github.com/ccxt/ccxt/pull/14020)
- currencycom: add fetchPositionMode & fetchMarginMode [#13946](https://github.com/ccxt/ccxt/pull/13946)
- Adding EUROC [#14022](https://github.com/ccxt/ccxt/pull/14022)
- Bittrex: fetch pending transactions [#14023](https://github.com/ccxt/ccxt/pull/14023)
- Exchange.php.safeValue: array_key_exists swapped for isset. fixes:#13986 [#14027](https://github.com/ccxt/ccxt/pull/14027)
- Binance repayMargin [#13723](https://github.com/ccxt/ccxt/pull/13723)
- ndax.parseOrder code reduction [#14028](https://github.com/ccxt/ccxt/pull/14028)
- js/base/functions/generic.js linting [#14029](https://github.com/ccxt/ccxt/pull/14029)
- independentreserve: add fetchPositionMode & fetchMarginMode [#14034](https://github.com/ccxt/ccxt/pull/14034)
- Bybit fetchFundingRate [#14032](https://github.com/ccxt/ccxt/pull/14032)
- correction of mistakes [#14039](https://github.com/ccxt/ccxt/pull/14039)
- itbit: add fetchPositionMode & fetchMarginMode [#14037](https://github.com/ccxt/ccxt/pull/14037)
- indodax: add fetchPositionMode & fetchMarginMode [#14036](https://github.com/ccxt/ccxt/pull/14036)
- idex: add fetchPositionMode & fetchMarginMode [#14035](https://github.com/ccxt/ccxt/pull/14035)
- kucoin add fetchOrderTrades [#14040](https://github.com/ccxt/ccxt/pull/14040)
- Whitebit :: add missing endpoint [#14041](https://github.com/ccxt/ccxt/pull/14041)
- Okx borrowMargin, repayMargin [#14010](https://github.com/ccxt/ccxt/pull/14010)
- kraken - cancelOrders [#13964](https://github.com/ccxt/ccxt/pull/13964)
- Coinex borrowMargin, repayMargin [#13724](https://github.com/ccxt/ccxt/pull/13724)
- kuna: add fetchPositionMode & fetchMarginMode [#14047](https://github.com/ccxt/ccxt/pull/14047)
- lbank: add fetchPositionMode & fetchMarginMode [#14049](https://github.com/ccxt/ccxt/pull/14049)
- mercado: add fetchPositionMode & fetchMarginMode [#14054](https://github.com/ccxt/ccxt/pull/14054)
- lbank2: add fetchPositionMode & fetchMarginMode [#14050](https://github.com/ccxt/ccxt/pull/14050)
- lykke: add fetchPositionMode & fetchMarginMode [#14051](https://github.com/ccxt/ccxt/pull/14051)
- liquid: add fetchPositionMode & fetchMarginMode [#14053](https://github.com/ccxt/ccxt/pull/14053)
- luno: add fetchPositionMode & fetchMarginMode [#14052](https://github.com/ccxt/ccxt/pull/14052)
- latoken: add fetchPositionMode & fetchMarginMode [#14048](https://github.com/ccxt/ccxt/pull/14048)
- mexc: add fetchPositionMode & fetchMarginMode [#14055](https://github.com/ccxt/ccxt/pull/14055)
- mexc: add setPositionMode [#14057](https://github.com/ccxt/ccxt/pull/14057)
- kucoin: add fetchPositionMode & fetchMarginMode [#14045](https://github.com/ccxt/ccxt/pull/14045)
- kucoinfutures: add fetchPositionMode & fetchMarginMode [#14046](https://github.com/ccxt/ccxt/pull/14046)
- bybit: add setPositionMode [#13919](https://github.com/ccxt/ccxt/pull/13919)
- Bitmex fetchMarkets (positionCurrency) [#14030](https://github.com/ccxt/ccxt/pull/14030)
- therock: add fetchPositionMode & fetchMarginMode [#14065](https://github.com/ccxt/ccxt/pull/14065)
- stex: add fetchPositionMode & fetchMarginMode [#14066](https://github.com/ccxt/ccxt/pull/14066)
- timex: add fetchPositionMode & fetchMarginMode [#14064](https://github.com/ccxt/ccxt/pull/14064)
- Huobi borrowMargin, repayMargin [#14012](https://github.com/ccxt/ccxt/pull/14012)


## 1.87.1

- Manual.md - rename funding fee to transaction fee [#13852](https://github.com/ccxt/ccxt/pull/13852)
- createOrder price parameter is float|undefined [#13851](https://github.com/ccxt/ccxt/pull/13851)
- bitso: add fetchPositionMode & fetchMarginMode [#13841](https://github.com/ccxt/ccxt/pull/13841)
- bitrue: add fetchPositionMode & fetchMarginMode [#13840](https://github.com/ccxt/ccxt/pull/13840)
- bitopro: add fetchPositionMode & fetchMarginMode [#13837](https://github.com/ccxt/ccxt/pull/13837)
- bitflyer: add fetchPositionMode & fetchMarginMode [#13800](https://github.com/ccxt/ccxt/pull/13800)
- bitbns: add fetchPositionMode & fetchMarginMode [#13783](https://github.com/ccxt/ccxt/pull/13783)
- bitstamp1: add fetchPositionMode & fetchMarginMode [#13843](https://github.com/ccxt/ccxt/pull/13843)
- bitbank: add fetchPositionMode & fetchMarginMode [#13778](https://github.com/ccxt/ccxt/pull/13778)
- bitforex: add fetchPositionMode & fetchMarginMode [#13802](https://github.com/ccxt/ccxt/pull/13802)
- bitstamp: add fetchPositionMode & fetchMarginMode [#13842](https://github.com/ccxt/ccxt/pull/13842)
- bitmart: add fetchPositionMode & fetchMarginMode [#13835](https://github.com/ccxt/ccxt/pull/13835)
- ZB takeProfitPrice, stopLossPrice [#13834](https://github.com/ccxt/ccxt/pull/13834)
- bit2c: add fetchPositionMode & fetchMarginMode [#13777](https://github.com/ccxt/ccxt/pull/13777)
- gate & gateio aliases [#13775](https://github.com/ccxt/ccxt/pull/13775)
- bibox: add fetchPositionMode & fetchMarginMode [#13748](https://github.com/ccxt/ccxt/pull/13748)
- aax: add fetchPositionMode & fetchMarginMode [#13743](https://github.com/ccxt/ccxt/pull/13743)
- throttler linting [#13850](https://github.com/ccxt/ccxt/pull/13850)
- bkex: add fetchPositionMode & fetchMarginMode [#13846](https://github.com/ccxt/ccxt/pull/13846)
- bittrex: add fetchPositionMode & fetchMarginMode [#13844](https://github.com/ccxt/ccxt/pull/13844)
- therock - nest api url [#13861](https://github.com/ccxt/ccxt/pull/13861)
- deribit - api url [#13860](https://github.com/ccxt/ccxt/pull/13860)
- ftx.fetchOHLCV params.until [#13878](https://github.com/ccxt/ccxt/pull/13878)
- gateio stop price [#13864](https://github.com/ccxt/ccxt/pull/13864)
- [okx] Correct parsing of OKX fees [#13884](https://github.com/ccxt/ccxt/pull/13884)
- minor line displacements for precision (1) [#13871](https://github.com/ccxt/ccxt/pull/13871)
- precision line changes (2) [#13873](https://github.com/ccxt/ccxt/pull/13873)
- precision line updates (4) [#13877](https://github.com/ccxt/ccxt/pull/13877)
- precision line changes (3) [#13875](https://github.com/ccxt/ccxt/pull/13875)
- huobi - precision fix [#13874](https://github.com/ccxt/ccxt/pull/13874)
- ftx funding history - fix start_time and end_time [#13894](https://github.com/ccxt/ccxt/pull/13894)
- indodax - describe, fetchTransactionFee  [#13863](https://github.com/ccxt/ccxt/pull/13863)
- changed params.till -> params.until [#13872](https://github.com/ccxt/ccxt/pull/13872)
- okx.fetchOHLCV params.until [#13876](https://github.com/ccxt/ccxt/pull/13876)
- deribit - parseBalance [#13900](https://github.com/ccxt/ccxt/pull/13900)
- gateio.fetchOHLCV added params.until [#13862](https://github.com/ccxt/ccxt/pull/13862)
- lbank update referral url [#13904](https://github.com/ccxt/ccxt/pull/13904)
- has.createStopOrder false [#13906](https://github.com/ccxt/ccxt/pull/13906)
- Added params.till to binance.fetchOHLCV [#13858](https://github.com/ccxt/ccxt/pull/13858)
- bl3p: add fetchPositionMode & fetchMarginMode [#13907](https://github.com/ccxt/ccxt/pull/13907)
- blockchaincom: add fetchPositionMode & fetchMarginMode [#13908](https://github.com/ccxt/ccxt/pull/13908)
- Bybit createOrder (stopLossPrice, takeProfitPrice) [#13859](https://github.com/ccxt/ccxt/pull/13859)
- btcex: add fetchPositionMode & fetchMarginMode [#13911](https://github.com/ccxt/ccxt/pull/13911)
- buda: add fetchPositionMode & fetchMarginMode [#13915](https://github.com/ccxt/ccxt/pull/13915)
- btcturk: add fetchPositionMode & fetchMarginMode [#13914](https://github.com/ccxt/ccxt/pull/13914)
- btctradeua: add fetchPositionMode & fetchMarginMode [#13913](https://github.com/ccxt/ccxt/pull/13913)
- btcbox: add fetchPositionMode & fetchMarginMode [#13910](https://github.com/ccxt/ccxt/pull/13910)
- bw: add fetchPositionMode & fetchMarginMode [#13916](https://github.com/ccxt/ccxt/pull/13916)
- bytetrade: add fetchPositionMode & fetchMarginMode [#13917](https://github.com/ccxt/ccxt/pull/13917)
- btcmarkets: add fetchPositionMode & fetchMarginMode [#13912](https://github.com/ccxt/ccxt/pull/13912)
- btcalpha: add fetchPositionMode & fetchMarginMode [#13909](https://github.com/ccxt/ccxt/pull/13909)
- idex - describe, cancelAllOrders, fetchDeposit, fetchWithdrawal, parseTransaction fix, fetchTime [#13879](https://github.com/ccxt/ccxt/pull/13879)
- Fix doc code error [#13925](https://github.com/ccxt/ccxt/pull/13925)
- gateio add fetchOrderTrades [#13924](https://github.com/ccxt/ccxt/pull/13924)
- ftx.cancelOrder params.stop for stop orders. fixes:#13922 [#13929](https://github.com/ccxt/ccxt/pull/13929)
- bitso - describe, cancelAllOrders, cancelOrders, fetchDeposit, fetchDeposits, fetchLedger [#13810](https://github.com/ccxt/ccxt/pull/13810)
- Fetch ohlcv quote volume [#13930](https://github.com/ccxt/ccxt/pull/13930)
- delta - precisions update [#13932](https://github.com/ccxt/ccxt/pull/13932)
- okx - ticksize precision [#13952](https://github.com/ccxt/ccxt/pull/13952)
- coinmate: add fetchPositionMode & fetchMarginMode [#13941](https://github.com/ccxt/ccxt/pull/13941)
- coinfalcon: add fetchPositionMode & fetchMarginMode [#13938](https://github.com/ccxt/ccxt/pull/13938)


## 1.86.1

- TICK_SIZE - bitforex [#13564](https://github.com/ccxt/ccxt/pull/13564)
- TICK_SIZE - bitflyer [#13563](https://github.com/ccxt/ccxt/pull/13563)
- TICK_SIZE - bitopro [#13568](https://github.com/ccxt/ccxt/pull/13568)
- coinbase fetchMySells and fetchMyBuys docstrings [#13758](https://github.com/ccxt/ccxt/pull/13758)
- TICK_SIZE - btcmarkets [#13575](https://github.com/ccxt/ccxt/pull/13575)
- fetchLedger docstrings [#13757](https://github.com/ccxt/ccxt/pull/13757)
- TICK_SIZE - btcturk [#13577](https://github.com/ccxt/ccxt/pull/13577)
- TICK_SIZE - btctradeua [#13576](https://github.com/ccxt/ccxt/pull/13576)
- TICK_SIZE - bl3p [#13572](https://github.com/ccxt/ccxt/pull/13572)
- TICK_SIZE - bkex [#13571](https://github.com/ccxt/ccxt/pull/13571)
- TICK_SIZE - bw [#13579](https://github.com/ccxt/ccxt/pull/13579)
- cancelOrders docstrings [#13759](https://github.com/ccxt/ccxt/pull/13759)
- fetchL3OrderBook docstrings [#13754](https://github.com/ccxt/ccxt/pull/13754)
- fetchDeposit docstrings [#13753](https://github.com/ccxt/ccxt/pull/13753)
- fetchCanceledOrders docstrings [#13751](https://github.com/ccxt/ccxt/pull/13751)
- fetchTransfers docstrings [#13761](https://github.com/ccxt/ccxt/pull/13761)
- huobi.fetchBorrowRatesPerSymbol docstring [#13755](https://github.com/ccxt/ccxt/pull/13755)
- fetchClosedOrders docstrings [#13749](https://github.com/ccxt/ccxt/pull/13749)
- TICK_SIZE - cryptocom [#13596](https://github.com/ccxt/ccxt/pull/13596)
- TICK_SIZE - bitso updates [#13756](https://github.com/ccxt/ccxt/pull/13756)
- TICK_SIZE - delta [#13602](https://github.com/ccxt/ccxt/pull/13602)
- TICK_SIZE - currencycom [#13597](https://github.com/ccxt/ccxt/pull/13597)
- fetchDepositAddresses docstrings [#13740](https://github.com/ccxt/ccxt/pull/13740)
- fetchDepositAddressesByNetwork docstrings [#13762](https://github.com/ccxt/ccxt/pull/13762)
- TICK_SIZE - crex24 [#13595](https://github.com/ccxt/ccxt/pull/13595)
- TICK_SIZE - coinspot [#13594](https://github.com/ccxt/ccxt/pull/13594)
- TICK_SIZE - coinone [#13773](https://github.com/ccxt/ccxt/pull/13773)
- TICK_SIZE - coinmate [#13593](https://github.com/ccxt/ccxt/pull/13593)
- TICK_SIZE - coinex [#13589](https://github.com/ccxt/ccxt/pull/13589)
- TICK_SIZE - coincheck [#13588](https://github.com/ccxt/ccxt/pull/13588)
- TICK_SIZE - coinbase [#13587](https://github.com/ccxt/ccxt/pull/13587)
- TICK_SIZE - bitpanda [#13569](https://github.com/ccxt/ccxt/pull/13569)
- TICK_SIZE - bitstamp [#13570](https://github.com/ccxt/ccxt/pull/13570)
- TICK_SIZE - bigone [#13558](https://github.com/ccxt/ccxt/pull/13558)
- TICK_SIZE - bibox [#13556](https://github.com/ccxt/ccxt/pull/13556)
- TICK_SIZE - digifinex [#13604](https://github.com/ccxt/ccxt/pull/13604)
- TICK_SIZE - buda [#13578](https://github.com/ccxt/ccxt/pull/13578)
- TICK_SIZE - btcbox [#13574](https://github.com/ccxt/ccxt/pull/13574)
- TICK_SIZE - btcalpha [#13573](https://github.com/ccxt/ccxt/pull/13573)
- TICK_SIZE - bitget [#13565](https://github.com/ccxt/ccxt/pull/13565)
- Add `parseTradingFee` on FTX [#13680](https://github.com/ccxt/ccxt/pull/13680)
- TICK_SIZE - bitbank [#13561](https://github.com/ccxt/ccxt/pull/13561)
- binance missing the new keyword on throwing exceptions [#13774](https://github.com/ccxt/ccxt/pull/13774)
- @see transpile to python [#13765](https://github.com/ccxt/ccxt/pull/13765)
- Fetch borrow rate histories docs [#13741](https://github.com/ccxt/ccxt/pull/13741)
- Bitvavo: adding stop-orders [#13729](https://github.com/ccxt/ccxt/pull/13729)
- TICK_SIZE - idex  [#13619](https://github.com/ccxt/ccxt/pull/13619)
- TICK_SIZE - bit2c [#13560](https://github.com/ccxt/ccxt/pull/13560)
- TICK_SIZE - coinflex [#13592](https://github.com/ccxt/ccxt/pull/13592)
- TICK_SIZE - kraken [#13624](https://github.com/ccxt/ccxt/pull/13624)
- TICK_SIZE - coinfalcon [#13591](https://github.com/ccxt/ccxt/pull/13591)
- TICK_SIZE - cdax [#13585](https://github.com/ccxt/ccxt/pull/13585)
- TICK_SIZE - bitmart [#13566](https://github.com/ccxt/ccxt/pull/13566)
- TICK_SIZE - coinex bugfix [#13779](https://github.com/ccxt/ccxt/pull/13779)
- CONTRIBUTING.md docstring rules [#13776](https://github.com/ccxt/ccxt/pull/13776)
- Binance `precisionMode` setting [#13772](https://github.com/ccxt/ccxt/pull/13772)
- TICK_SIZE - coinone fix [#13780](https://github.com/ccxt/ccxt/pull/13780)
- Bitfinex2 :: fix precision [#13793](https://github.com/ccxt/ccxt/pull/13793)
- Coinex :: fix fetchMyTrades [#13794](https://github.com/ccxt/ccxt/pull/13794)
- precision corrections across different exchanges [#13786](https://github.com/ccxt/ccxt/pull/13786)
- TICK_SIZE - hitbtc [#13791](https://github.com/ccxt/ccxt/pull/13791)
- TICK_SIZE - huobijp [#13792](https://github.com/ccxt/ccxt/pull/13792)
- TICK_SIZE - bitrue [#13746](https://github.com/ccxt/ccxt/pull/13746)
- correcting some `max` values and removal of unnecessary variables [#13796](https://github.com/ccxt/ccxt/pull/13796)
- bitget: add fetchPositionMode & fetchMarginMode [#13803](https://github.com/ccxt/ccxt/pull/13803)
- bitget: update doc links [#13804](https://github.com/ccxt/ccxt/pull/13804)
- ascendex: add fetchPositionMode & fetchMarginMode [#13745](https://github.com/ccxt/ccxt/pull/13745)
- ftx unify stop orders [#13621](https://github.com/ccxt/ccxt/pull/13621)


## 1.85.1

- TICK_SIZE - luno [#13658](https://github.com/ccxt/ccxt/pull/13658)
- Bitmex: added error [#13673](https://github.com/ccxt/ccxt/pull/13673)
- therock - fetchOHLCV [#13671](https://github.com/ccxt/ccxt/pull/13671)
- TICK_SIZE - ripio [#13670](https://github.com/ccxt/ccxt/pull/13670)
- TICK_SIZE - qtrade [#13669](https://github.com/ccxt/ccxt/pull/13669)
- TICK_SIZE- probit [#13668](https://github.com/ccxt/ccxt/pull/13668)
- TICK_SIZE - poloniex [#13667](https://github.com/ccxt/ccxt/pull/13667)
- TICK_SIZE - okcoin [#13664](https://github.com/ccxt/ccxt/pull/13664)
- TICK_SIZE - oceanex [#13663](https://github.com/ccxt/ccxt/pull/13663)
- TICK_SIZE - lbank2 [#13651](https://github.com/ccxt/ccxt/pull/13651)
- fetchTransactionFees docstrings [#13650](https://github.com/ccxt/ccxt/pull/13650)
- withdraw docstrings [#13647](https://github.com/ccxt/ccxt/pull/13647)
- fetchTradingFee docstrings [#13646](https://github.com/ccxt/ccxt/pull/13646)
- fetchFundingRate docstrings [#13643](https://github.com/ccxt/ccxt/pull/13643)
- Digifinex fetchBorrowInterest [#13674](https://github.com/ccxt/ccxt/pull/13674)
- TICK_SIZE - paymium [#13665](https://github.com/ccxt/ccxt/pull/13665)
- fetchTradingFees docstrings [#13645](https://github.com/ccxt/ccxt/pull/13645)
- setMarginMode docstrings [#13635](https://github.com/ccxt/ccxt/pull/13635)
- TICK_SIZE - novadax [#13662](https://github.com/ccxt/ccxt/pull/13662)
- TICK_SIZE - lykke [#13659](https://github.com/ccxt/ccxt/pull/13659)
- setPositionMode docstrings [#13634](https://github.com/ccxt/ccxt/pull/13634)
- reduce margin docstrings [#13633](https://github.com/ccxt/ccxt/pull/13633)
- fetchBorrowInterest docstrings [#13628](https://github.com/ccxt/ccxt/pull/13628)
- fetchPositionsRisk docstrings [#13638](https://github.com/ccxt/ccxt/pull/13638)
- add margin docstrings [#13632](https://github.com/ccxt/ccxt/pull/13632)
- fetchBorrowRate docstrings [#13631](https://github.com/ccxt/ccxt/pull/13631)
- binance giftCode method docstrings [#13629](https://github.com/ccxt/ccxt/pull/13629)
- Coinflex :: fix sandbox authentication [#13677](https://github.com/ccxt/ccxt/pull/13677)
- fetchLeverageTiers docstrings [#13641](https://github.com/ccxt/ccxt/pull/13641)
- fetchPositions docstrings [#13640](https://github.com/ccxt/ccxt/pull/13640)
- fetchAccountPositions docstrings [#13639](https://github.com/ccxt/ccxt/pull/13639)
- fetchFundingHistory docstrings [#13637](https://github.com/ccxt/ccxt/pull/13637)
- fetchFundingRates docstrings [#13642](https://github.com/ccxt/ccxt/pull/13642)
- TICK_SIZE - stex [#13679](https://github.com/ccxt/ccxt/pull/13679)
- Flip sign for OKX fees [#13681](https://github.com/ccxt/ccxt/pull/13681)
- TICK_SIZE - tidebit [#13683](https://github.com/ccxt/ccxt/pull/13683)
- TICK_SIZE - tidex [#13684](https://github.com/ccxt/ccxt/pull/13684)
- TICK_SIZE - zb [#13696](https://github.com/ccxt/ccxt/pull/13696)
- TICK_SIZE - zonda [#13697](https://github.com/ccxt/ccxt/pull/13697)
- TICK_SIZE - zaif [#13695](https://github.com/ccxt/ccxt/pull/13695)
- TICK_SIZE - yobit [#13694](https://github.com/ccxt/ccxt/pull/13694)
- TICK_SIZE - woo [#13692](https://github.com/ccxt/ccxt/pull/13692)
- TICK_SIZE - whitebit [#13691](https://github.com/ccxt/ccxt/pull/13691)
- ticksize - wazirx [#13690](https://github.com/ccxt/ccxt/pull/13690)
- TICK_SIZE - vcc [#13688](https://github.com/ccxt/ccxt/pull/13688)
- TICK_SIZE- upbit [#13687](https://github.com/ccxt/ccxt/pull/13687)
- TICK_SIZE - timex [#13685](https://github.com/ccxt/ccxt/pull/13685)
- fetchMyTrades docstrings [#13698](https://github.com/ccxt/ccxt/pull/13698)
- fetchOrderTrades docstrings [#13699](https://github.com/ccxt/ccxt/pull/13699)
- cancelAllOrders docstrings [#13700](https://github.com/ccxt/ccxt/pull/13700)
- TICK_SIZE - xena [#13693](https://github.com/ccxt/ccxt/pull/13693)
- TICK_SIZE - therock [#13682](https://github.com/ccxt/ccxt/pull/13682)
- fetchDeposits docstrings [#13656](https://github.com/ccxt/ccxt/pull/13656)
- fetchWithdrawals docstrings [#13655](https://github.com/ccxt/ccxt/pull/13655)
- fetchWithdrawal docstrings [#13711](https://github.com/ccxt/ccxt/pull/13711)
- signIn docstrings [#13709](https://github.com/ccxt/ccxt/pull/13709)
- blockchaincom.fetchWithdrawalWhitelist docstring [#13710](https://github.com/ccxt/ccxt/pull/13710)
- Digifinex fetchBorrowRate, fetchBorrowRates [#13703](https://github.com/ccxt/ccxt/pull/13703)
- Ascendex: stopPrice + Trigger + timeInForce + postOnly  [#13676](https://github.com/ccxt/ccxt/pull/13676)
- fetchDepositAddress docstrings [#13652](https://github.com/ccxt/ccxt/pull/13652)
- fetchTransactionFee docstrings [#13715](https://github.com/ccxt/ccxt/pull/13715)
- fetchTransactions docstrings [#13714](https://github.com/ccxt/ccxt/pull/13714)
- Coinex fetchBorrowInterest [#13539](https://github.com/ccxt/ccxt/pull/13539)
- fetchPosition docstrings [#13716](https://github.com/ccxt/ccxt/pull/13716)
- fetchLeverage docstrings [#13717](https://github.com/ccxt/ccxt/pull/13717)
- fetchMarketLeverageTiers docstrings [#13718](https://github.com/ccxt/ccxt/pull/13718)
- TICK_SIZE - eqonex [#13606](https://github.com/ccxt/ccxt/pull/13606)
- ticksize - hitbtc3 updates [#13612](https://github.com/ccxt/ccxt/pull/13612)
- TICK_SIZE - mexc3 [#13678](https://github.com/ccxt/ccxt/pull/13678)
- fetchOpenOrder docstrings [#13720](https://github.com/ccxt/ccxt/pull/13720)
- fetchOpenOrders docstrings [#13721](https://github.com/ccxt/ccxt/pull/13721)
- fetchBorrowRates docstrings [#13722](https://github.com/ccxt/ccxt/pull/13722)
- Transpile base methods [#13457](https://github.com/ccxt/ccxt/pull/13457)


## 1.84.1

- Found Incorrect Indexing [#13496](https://github.com/ccxt/ccxt/pull/13496)
- ftx - fetchTrades pagination [#13497](https://github.com/ccxt/ccxt/pull/13497)
- Hollaex: postOnly and stopPrice [#13502](https://github.com/ccxt/ccxt/pull/13502)
- Coinex createOrder [#13506](https://github.com/ccxt/ccxt/pull/13506)
- Coinex transfer [#13500](https://github.com/ccxt/ccxt/pull/13500)
- Coinex fetchBorrowRate [#13504](https://github.com/ccxt/ccxt/pull/13504)
- Bybit :: contractOrder :: add amount to precision [#13509](https://github.com/ccxt/ccxt/pull/13509)
- bitforex endpoints update [#13511](https://github.com/ccxt/ccxt/pull/13511)
- Bybit :: add price to precision [#13515](https://github.com/ccxt/ccxt/pull/13515)
- bitmart: unify postOnly and IOC [#13514](https://github.com/ccxt/ccxt/pull/13514)
- FetchTicker :: fix types [#13517](https://github.com/ccxt/ccxt/pull/13517)
- remove fetchStatus updated timestamp [#13528](https://github.com/ccxt/ccxt/pull/13528)
- safeTicker - use safeString for Precise values [#13516](https://github.com/ccxt/ccxt/pull/13516)
- bibox createStopOrder: false [#13527](https://github.com/ccxt/ccxt/pull/13527)
- Coinex cancelOrder [#13526](https://github.com/ccxt/ccxt/pull/13526)
- Coinex cancelAllOrders [#13529](https://github.com/ccxt/ccxt/pull/13529)
- Coinex fetchMyTrades [#13522](https://github.com/ccxt/ccxt/pull/13522)
- Fix limits for coinflex [#13535](https://github.com/ccxt/ccxt/pull/13535)
- bybit - order status [#13536](https://github.com/ccxt/ccxt/pull/13536)
- removal of crossorigin.me [#13491](https://github.com/ccxt/ccxt/pull/13491)
- Bitget fetchOHLCV since fix [#13540](https://github.com/ccxt/ccxt/pull/13540)
- Update kucoin.js [#13542](https://github.com/ccxt/ccxt/pull/13542)
- mexc fetchOrder parser - dealAvgPrice used for average and no longer used for cost [#13549](https://github.com/ccxt/ccxt/pull/13549)
- aax margin edits & remove marginType [#13550](https://github.com/ccxt/ccxt/pull/13550)
- mexc3 - fix precision, commission and other things [#13534](https://github.com/ccxt/ccxt/pull/13534)
- poloniex UST mapping [#13583](https://github.com/ccxt/ccxt/pull/13583)
- bitfinex LUNA, UST mapping [#13582](https://github.com/ccxt/ccxt/pull/13582)
- kucoin: update request stop in stop order [#13599](https://github.com/ccxt/ccxt/pull/13599)
- kraken LUNA, UST mapping [#13581](https://github.com/ccxt/ccxt/pull/13581)
- binance: update api endpoints and ratelimit [#13601](https://github.com/ccxt/ccxt/pull/13601)
- bitstamp UST mapping [#13584](https://github.com/ccxt/ccxt/pull/13584)
- fix kucoinfutures fetch_trades missing timestamp [#13559](https://github.com/ccxt/ccxt/pull/13559)
- Huobi fetchSettlementHistory [#13523](https://github.com/ccxt/ccxt/pull/13523)
- createOrder docstrings [#13524](https://github.com/ccxt/ccxt/pull/13524)
- cancelOrder docstrings [#13548](https://github.com/ccxt/ccxt/pull/13548)
- Coinex fetchOpenOrders, fetchClosedOrders [#13538](https://github.com/ccxt/ccxt/pull/13538)
- fetchOrder docstrings [#13525](https://github.com/ccxt/ccxt/pull/13525)
- Fixed Coinbase Pro's `fetchDeposits()` and `fetchWithdrawals()` [#13608](https://github.com/ccxt/ccxt/pull/13608)
- okx stop orders [#13617](https://github.com/ccxt/ccxt/pull/13617)
- markets response sample for gemini [#13611](https://github.com/ccxt/ccxt/pull/13611)
- TICK_SIZE - exmo [#13607](https://github.com/ccxt/ccxt/pull/13607)
- Digifinex fetchMarkets [#13546](https://github.com/ccxt/ccxt/pull/13546)
- TICK_SIZE - gateio [#13609](https://github.com/ccxt/ccxt/pull/13609)
- TICK_SIZE - itbit [#13616](https://github.com/ccxt/ccxt/pull/13616)
- TICK_SIZE - indodax [#13615](https://github.com/ccxt/ccxt/pull/13615)


## 1.83.1

- fetchAccounts unification [#13291](https://github.com/ccxt/ccxt/pull/13291)
- aax - fetchAccounts [#13361](https://github.com/ccxt/ccxt/pull/13361)
- Bitmex parse positions [#13377](https://github.com/ccxt/ccxt/pull/13377)
- [DOCS] typo on javascripts' load markets function [#13385](https://github.com/ccxt/ccxt/pull/13385)
- idex: fix ccxt/ccxt#13367 [#13378](https://github.com/ccxt/ccxt/pull/13378)
- lbank2: fix market buy orders [#13389](https://github.com/ccxt/ccxt/pull/13389)
- lbank2: fix amount market buys parseOrder  [#13390](https://github.com/ccxt/ccxt/pull/13390)
- lbank2: change fetchOrderBook endpoint [#13391](https://github.com/ccxt/ccxt/pull/13391)
- bybit: add new api endpoints [#13384](https://github.com/ccxt/ccxt/pull/13384)
- liquid update order parsing [#13380](https://github.com/ccxt/ccxt/pull/13380)
- Bybit :: updated examples and small fixes [#13366](https://github.com/ccxt/ccxt/pull/13366)
- cex - update describe [#13393](https://github.com/ccxt/ccxt/pull/13393)
- coinex - fetchTime [#13394](https://github.com/ccxt/ccxt/pull/13394)
- Add parsing of fiat INR in bitbns [#13403](https://github.com/ccxt/ccxt/pull/13403)
- bitopro CCXT Pro flag [#13404](https://github.com/ccxt/ccxt/pull/13404)
- bybit: add fetchCurrencies [#13396](https://github.com/ccxt/ccxt/pull/13396)
- Lbank2: use non aggregated orderbook [#13406](https://github.com/ccxt/ccxt/pull/13406)
- Tests :: fix build [#13412](https://github.com/ccxt/ccxt/pull/13412)
- Wazrix rate limit 1000 [#13408](https://github.com/ccxt/ccxt/pull/13408)
- fetchTime docStrings [#13417](https://github.com/ccxt/ccxt/pull/13417)
- Bybit :: small adjustments [#13413](https://github.com/ccxt/ccxt/pull/13413)
- fetchStatus docstrings [#13419](https://github.com/ccxt/ccxt/pull/13419)
- fetchBidsAsks docstrings [#13420](https://github.com/ccxt/ccxt/pull/13420)
- fetchCurrencies docstrings [#13418](https://github.com/ccxt/ccxt/pull/13418)
- Bitmex setMarginMode [#13410](https://github.com/ccxt/ccxt/pull/13410)
- Bitfinex2: unify create order [#13405](https://github.com/ccxt/ccxt/pull/13405)
- Bitmex setLeverage [#13411](https://github.com/ccxt/ccxt/pull/13411)
- Bit2c nonce = milliseconds() [#13409](https://github.com/ccxt/ccxt/pull/13409)
- Huobi fetchOpenInterestHistory [#12687](https://github.com/ccxt/ccxt/pull/12687)
- moved fetchMarkOHLCV, fetchIndexOHLCV and fetchPremiumIndexOHLCV to base/Exchange [#13422](https://github.com/ccxt/ccxt/pull/13422)
- Okx fetch open interest history [#12689](https://github.com/ccxt/ccxt/pull/12689)
- exmo - describe, fetchCanceledOrders , fetchDeposit, fetchDeposits, fetchWithdrawal, fix typo in Manual.md [#13421](https://github.com/ccxt/ccxt/pull/13421)
- coinex - fetchCurrencies, fetchDepositAddress, createDepositAddress [#13395](https://github.com/ccxt/ccxt/pull/13395)
- exmo - margin [#13423](https://github.com/ccxt/ccxt/pull/13423)
- Bybit :: fix watchMyTrades timestamp [#13429](https://github.com/ccxt/ccxt/pull/13429)
- huobi - parseorder date fix [#13430](https://github.com/ccxt/ccxt/pull/13430)
- python sort-swap-markets-by-hourly-price-change example asyncio.run_until_complete -> asyncio.run [#13427](https://github.com/ccxt/ccxt/pull/13427)
- [ftx, okx] Correctly classify server errors [#13433](https://github.com/ccxt/ccxt/pull/13433)
- phemex - python transfer example [#13435](https://github.com/ccxt/ccxt/pull/13435)
- manual fetchOpenInterestHistory note for okx users [#13425](https://github.com/ccxt/ccxt/pull/13425)
- woo - fetchAccounts, add name to account structure [#13434](https://github.com/ccxt/ccxt/pull/13434)


## 1.82.1

- CONTRIBUTING.md add safeMethodN reference [#13247](https://github.com/ccxt/ccxt/pull/13247)
- Bybit :: fetchBalance update and openapi signing [#13163](https://github.com/ccxt/ccxt/pull/13163)
- Fix main function [#13258](https://github.com/ccxt/ccxt/pull/13258)
- Fix import [#13259](https://github.com/ccxt/ccxt/pull/13259)
- Update bitstamp.js [#13268](https://github.com/ccxt/ccxt/pull/13268)
- cex error mapping [#13272](https://github.com/ccxt/ccxt/pull/13272)
- fix fetchOrderBook [#13290](https://github.com/ccxt/ccxt/pull/13290)
- deribit - update describe [#13289](https://github.com/ccxt/ccxt/pull/13289)
- mexc3: add amount precision to markets [#13288](https://github.com/ccxt/ccxt/pull/13288)
- huobi: update entryPrice in parsePosition [#13297](https://github.com/ccxt/ccxt/pull/13297)
- Bitget cancelOrder [#13282](https://github.com/ccxt/ccxt/pull/13282)
- stex - createMarketOrder [#13281](https://github.com/ccxt/ccxt/pull/13281)
- btcbox - transfer, withdraw, fetchTransactions [#13277](https://github.com/ccxt/ccxt/pull/13277)
- Bitget fetchOpenOrders [#13296](https://github.com/ccxt/ccxt/pull/13296)
- Bitmex fetch funding rate history [#13293](https://github.com/ccxt/ccxt/pull/13293)
- btcmarkets - withdraw [#13280](https://github.com/ccxt/ccxt/pull/13280)
- Bybit  :: setLeverage update [#13262](https://github.com/ccxt/ccxt/pull/13262)
- huobi fetchBalance params marginMode [#13283](https://github.com/ccxt/ccxt/pull/13283)
- Bitmex fetchFundingRates [#13295](https://github.com/ccxt/ccxt/pull/13295)
- Bybit :: fetchPositions update [#13264](https://github.com/ccxt/ccxt/pull/13264)
- stex - fetchDeposit, fetchWithdrawal [#13285](https://github.com/ccxt/ccxt/pull/13285)
- stex - transfer [#13276](https://github.com/ccxt/ccxt/pull/13276)
- Allow to filter exchange-capabilities by exchange [#13287](https://github.com/ccxt/ccxt/pull/13287)
- indodax - fetchTransactions [#13269](https://github.com/ccxt/ccxt/pull/13269)
- kucoinfutures parseMargin [#12356](https://github.com/ccxt/ccxt/pull/12356)
- rename `parseModifyMargin` > `parseMarginModification` [#13300](https://github.com/ccxt/ccxt/pull/13300)
- `currencyToPrecision` update with networkCode [#13299](https://github.com/ccxt/ccxt/pull/13299)
- Bybit :: fetchDeposits/fetchLedger update [#13304](https://github.com/ccxt/ccxt/pull/13304)
- Update okx.php [#13303](https://github.com/ccxt/ccxt/pull/13303)
- bkex: patch percentage in ticker [#13306](https://github.com/ccxt/ccxt/pull/13306)
- coinmate - withdraw [#12814](https://github.com/ccxt/ccxt/pull/12814)
- Add bit2c.fetchDepositAddress [#13271](https://github.com/ccxt/ccxt/pull/13271)
- Phemex fetchLeverageTiers, fetchMarketLeverageTiers [#13308](https://github.com/ccxt/ccxt/pull/13308)
- therock - withdraw [#13219](https://github.com/ccxt/ccxt/pull/13219)
- Phemex fetchTransfers [#13310](https://github.com/ccxt/ccxt/pull/13310)
- New exchange - CoinFLEX [#13048](https://github.com/ccxt/ccxt/pull/13048)
- Add CoinFLEX exchange [#6296](https://github.com/ccxt/ccxt/pull/6296)
- Coinex fetchLeverageTiers, fetchMarketLeverageTiers [#13121](https://github.com/ccxt/ccxt/pull/13121)
- Ftx fetchMyTrades till param, default till removed [#13312](https://github.com/ccxt/ccxt/pull/13312)
- Cryptocom :: fix fetchTickers [#13323](https://github.com/ccxt/ccxt/pull/13323)
- isPostOnly fixes [#13317](https://github.com/ccxt/ccxt/pull/13317)
- coinex fetchOrderBook no merging [#13316](https://github.com/ccxt/ccxt/pull/13316)
- deribit - transfer, fetchTransfer [#13198](https://github.com/ccxt/ccxt/pull/13198)
- added huobi error codes [#13331](https://github.com/ccxt/ccxt/pull/13331)
- fetchFundingFee(s) into fetchTransactionFee(s) [#13327](https://github.com/ccxt/ccxt/pull/13327)


## 1.81.1

- gateio comment styling [#13108](https://github.com/ccxt/ccxt/pull/13108)
- Gateio transfer margin symbol [#13102](https://github.com/ccxt/ccxt/pull/13102)
- Whitebit parse ticker [#13107](https://github.com/ccxt/ccxt/pull/13107)
- Filter `fetchPositions` by input symbols [#13115](https://github.com/ccxt/ccxt/pull/13115)
- Gateio margin fetch order [#13103](https://github.com/ccxt/ccxt/pull/13103)
- Coinex fetchTransfers [#13106](https://github.com/ccxt/ccxt/pull/13106)
- Coinex transfer [#13105](https://github.com/ccxt/ccxt/pull/13105)
- Bybit cancelAllOrders [#13116](https://github.com/ccxt/ccxt/pull/13116)
- gateio.prepareRequest accepts type and params as parameters, gateio.multiOrderSpotPrepareRequest [#13104](https://github.com/ccxt/ccxt/pull/13104)
- ftx: add stopPrice, timeInForce, and postOnly [#13119](https://github.com/ccxt/ccxt/pull/13119)
- removal of fetchFundingRateHistories [#13120](https://github.com/ccxt/ccxt/pull/13120)
- bitmart: add throw errors for unavailable contract endpoints [#13099](https://github.com/ccxt/ccxt/pull/13099)
- hollaex - fetchWithdrawal, transfer [#13019](https://github.com/ccxt/ccxt/pull/13019)
- Gateio fetch tickers [#13113](https://github.com/ccxt/ccxt/pull/13113)
- Gateio fetch order book [#13112](https://github.com/ccxt/ccxt/pull/13112)
- Gateio fetch funding history [#13110](https://github.com/ccxt/ccxt/pull/13110)
- Gateio fetch funding rates [#13109](https://github.com/ccxt/ccxt/pull/13109)
- gateio.fetchOrder docstring minor change [#13128](https://github.com/ccxt/ccxt/pull/13128)
- Gateio fetch balance new prepare request [#13125](https://github.com/ccxt/ccxt/pull/13125)
- gateio.fetchFundingRateHistory new prepareRequest [#13126](https://github.com/ccxt/ccxt/pull/13126)
- Gateio get margin type params account omitted [#13127](https://github.com/ccxt/ccxt/pull/13127)
- gateio.setLeverage marginType can be cross_margin [#13129](https://github.com/ccxt/ccxt/pull/13129)
- gateio.fetchPositions new prepareRequest [#13130](https://github.com/ccxt/ccxt/pull/13130)
- gateio.cancelAllOrders new prepareRequest, accepts cross margin type [#13132](https://github.com/ccxt/ccxt/pull/13132)
- gateio.fetchLeverageTiers new prepareRequest [#13131](https://github.com/ccxt/ccxt/pull/13131)
- Bybit :: fetchMarkets update [#13138](https://github.com/ccxt/ccxt/pull/13138)
- createStopOrder: false [#13137](https://github.com/ccxt/ccxt/pull/13137)
- okx: add new endpoints [#13139](https://github.com/ccxt/ccxt/pull/13139)
- Bybit :: fix fetchSpotMarkets [#13145](https://github.com/ccxt/ccxt/pull/13145)
- Bybit ::  fetchTrades update [#13142](https://github.com/ccxt/ccxt/pull/13142)
- Bybit :: fetchOhlcv update [#13143](https://github.com/ccxt/ccxt/pull/13143)
- Phemex createReduceOnlyOrder [#13148](https://github.com/ccxt/ccxt/pull/13148)
- Phemex fetchFundingRate [#13149](https://github.com/ccxt/ccxt/pull/13149)
- Bybit :: fetchTicker and fetchTickers update [#13144](https://github.com/ccxt/ccxt/pull/13144)
- Bybit :: USDC markets update [#13154](https://github.com/ccxt/ccxt/pull/13154)
- Bybit :: fetchMyTrades update [#13156](https://github.com/ccxt/ccxt/pull/13156)
- Phemex fetchFundingHistory [#13150](https://github.com/ccxt/ccxt/pull/13150)
- Bybit :: fetchMarketLeverageTiers update [#13172](https://github.com/ccxt/ccxt/pull/13172)
- zb: cant make swap orders in python [#13182](https://github.com/ccxt/ccxt/pull/13182)
- send params to gemini postV1Orders [#13179](https://github.com/ccxt/ccxt/pull/13179)
- buda - transfer [#13177](https://github.com/ccxt/ccxt/pull/13177)
- ndax - transfer [#13176](https://github.com/ccxt/ccxt/pull/13176)
- probit - transfer [#13175](https://github.com/ccxt/ccxt/pull/13175)
- xena transfer [#13174](https://github.com/ccxt/ccxt/pull/13174)
- qtrade - fetchTransfer [#13173](https://github.com/ccxt/ccxt/pull/13173)
- Gateio cancel order [#13133](https://github.com/ccxt/ccxt/pull/13133)
- Bybit :: fetchFundingRate update [#13169](https://github.com/ccxt/ccxt/pull/13169)
- zb: update ratelimits [#13178](https://github.com/ccxt/ccxt/pull/13178)
- BKEX fetchStatus [#13164](https://github.com/ccxt/ccxt/pull/13164)
- lbank v2 [#8221](https://github.com/ccxt/ccxt/pull/8221)
- lbank v2 [#12920](https://github.com/ccxt/ccxt/pull/12920)
- currencycom error mapping [#13190](https://github.com/ccxt/ccxt/pull/13190)
- Remove DRK as common currency for DASH #13157 [#13196](https://github.com/ccxt/ccxt/pull/13196)
- Bybit :: fetchOrderBook update [#13146](https://github.com/ccxt/ccxt/pull/13146)
- kucoin: patch error code InvalidOrder [#13195](https://github.com/ccxt/ccxt/pull/13195)


## 1.80.1

- `fetchStatus` for bitmart [#12955](https://github.com/ccxt/ccxt/pull/12955)
- hitbtc3 - transfer refactor [#12952](https://github.com/ccxt/ccxt/pull/12952)
- huobi - transfer refactor [#12951](https://github.com/ccxt/ccxt/pull/12951)
- cryptocom - transfer refactor [#12954](https://github.com/ccxt/ccxt/pull/12954)
- hitbtc - transfer refactor [#12953](https://github.com/ccxt/ccxt/pull/12953)
- `fetchStatus` for bitfinex2 [#12950](https://github.com/ccxt/ccxt/pull/12950)
- `fetchStatus` for delta [#12964](https://github.com/ccxt/ccxt/pull/12964)
- btcalpha - fetchDeposits and fetchWithdrawals [#12961](https://github.com/ccxt/ccxt/pull/12961)
- kucoin - transfer refactor [#12949](https://github.com/ccxt/ccxt/pull/12949)
- `fetchStatus` for deribit [#12965](https://github.com/ccxt/ccxt/pull/12965)
- `fetchStatus` for mexc [#12969](https://github.com/ccxt/ccxt/pull/12969)
- createStopOrder, createStopLimitOrder, and createStopMarketOrder [#12932](https://github.com/ccxt/ccxt/pull/12932)
- `fetchStatus` for whitebit [#12972](https://github.com/ccxt/ccxt/pull/12972)
- `fetchStatus` for wazirx [#12971](https://github.com/ccxt/ccxt/pull/12971)
- `fetchStatus` for okx [#12970](https://github.com/ccxt/ccxt/pull/12970)
- `fetchStatus` for kucoin [#12968](https://github.com/ccxt/ccxt/pull/12968)
- Coinex fetchFundingRate [#12976](https://github.com/ccxt/ccxt/pull/12976)
- aax fetchLeverageTiers and fetchMarketLeverageTiers removed [#12973](https://github.com/ccxt/ccxt/pull/12973)
- `fetchStatus` for kucoinfutures [#12967](https://github.com/ccxt/ccxt/pull/12967)
- Coinex fetchFundingRateHistory [#12977](https://github.com/ccxt/ccxt/pull/12977)
- gemini - fix transaction parsing [#12901](https://github.com/ccxt/ccxt/pull/12901)
- `fetchStatus` for digifinex [#12966](https://github.com/ccxt/ccxt/pull/12966)
- Coinex fetchMyTrades [#12978](https://github.com/ccxt/ccxt/pull/12978)
- okx - transfer [#12947](https://github.com/ccxt/ccxt/pull/12947)
- `urlencodeNested` & kraken updates [#12900](https://github.com/ccxt/ccxt/pull/12900)
- Export ROUND_UP and ROUND_DOWN constants [#12991](https://github.com/ccxt/ccxt/pull/12991)
- Kucoin:  new base URL [#12994](https://github.com/ccxt/ccxt/pull/12994)
- aax: update ratelimits [#12993](https://github.com/ccxt/ccxt/pull/12993)
- Coinex fetchTrades [#12997](https://github.com/ccxt/ccxt/pull/12997)
- more clear instructions for coroutine exchange.close [#13001](https://github.com/ccxt/ccxt/pull/13001)
- ftx.fetchBorrowRateHistories can fetch up to 5000 when fetching a single currency [#13003](https://github.com/ccxt/ccxt/pull/13003)
- ascendex - describe [#13002](https://github.com/ccxt/ccxt/pull/13002)
- Ftx parse borrow rate history python array includes fix, docstrings [#13004](https://github.com/ccxt/ccxt/pull/13004)
- Sort swap markets by hourly price change example [#12998](https://github.com/ccxt/ccxt/pull/12998)
- Coinex fetchFundingHistory [#12982](https://github.com/ccxt/ccxt/pull/12982)
- woo - transfer [#12743](https://github.com/ccxt/ccxt/pull/12743)
- bkex - transfer and withdraw [#13012](https://github.com/ccxt/ccxt/pull/13012)
- latoken error mapping [#13016](https://github.com/ccxt/ccxt/pull/13016)
- bitopro - transfer [#13010](https://github.com/ccxt/ccxt/pull/13010)
- latoken error mapping [#13017](https://github.com/ccxt/ccxt/pull/13017)
- Coinex createOrder: unify swap 'stopPrice' [#13013](https://github.com/ccxt/ccxt/pull/13013)
- Coinex cancelOrder [#13014](https://github.com/ccxt/ccxt/pull/13014)
- phemex - transfer between sub accounts [#13020](https://github.com/ccxt/ccxt/pull/13020)
- Coinex cancelAllOrders [#13025](https://github.com/ccxt/ccxt/pull/13025)
- Coinex fetchOrder [#13026](https://github.com/ccxt/ccxt/pull/13026)
- ascendex: add postOnly and fix params [#13024](https://github.com/ccxt/ccxt/pull/13024)
- unified 'addMargin/reduceMargin' responses [#12930](https://github.com/ccxt/ccxt/pull/12930)
- gateio comment styling [#13027](https://github.com/ccxt/ccxt/pull/13027)
- Gateio docstrings [#13028](https://github.com/ccxt/ccxt/pull/13028)
- gateio.fetchSpotMarkets max cost [#13031](https://github.com/ccxt/ccxt/pull/13031)
- manual - transfer can also be done to emails in certain exchanges [#13036](https://github.com/ccxt/ccxt/pull/13036)
- paymium - transfer [#13037](https://github.com/ccxt/ccxt/pull/13037)
- gateio.has[option] = false [#13030](https://github.com/ccxt/ccxt/pull/13030)
- ascendex: update ratelimits  [#13035](https://github.com/ccxt/ccxt/pull/13035)
- Coinex fetchBalance [#13039](https://github.com/ccxt/ccxt/pull/13039)
- paymium - createDepositAddress, fetchDepositAddress and fetchDepositAddresses [#13038](https://github.com/ccxt/ccxt/pull/13038)
- latoken - transfer [#13021](https://github.com/ccxt/ccxt/pull/13021)


## 1.79.1

- [kraken] withdraw parse [#12841](https://github.com/ccxt/ccxt/pull/12841)
- [indodax] withdraw parse [#12840](https://github.com/ccxt/ccxt/pull/12840)
- [idex] withdraw parse [#12839](https://github.com/ccxt/ccxt/pull/12839)
- [huobijp] withdraw parse [#12838](https://github.com/ccxt/ccxt/pull/12838)
- [hitbtc3] withdraw parse [#12834](https://github.com/ccxt/ccxt/pull/12834)
- [hitbtc] withdraw parse [#12833](https://github.com/ccxt/ccxt/pull/12833)
- ZB fetchCanceledOrders 'stop' [#12832](https://github.com/ccxt/ccxt/pull/12832)
- [huobi] withdraw parse [#12837](https://github.com/ccxt/ccxt/pull/12837)
- ZB fetchOpenOrders 'stop' [#12830](https://github.com/ccxt/ccxt/pull/12830)
- [gemini] withdraw parse [#12827](https://github.com/ccxt/ccxt/pull/12827)
- [gateio] withdraw parse [#12826](https://github.com/ccxt/ccxt/pull/12826)
- [exmo] withdraw parse [#12825](https://github.com/ccxt/ccxt/pull/12825)
- [deribit] withdraw parse [#12824](https://github.com/ccxt/ccxt/pull/12824)
- [cryptocom] withdraw parse [#12823](https://github.com/ccxt/ccxt/pull/12823)
- [bibox] withdraw parse [#12804](https://github.com/ccxt/ccxt/pull/12804)
- ZB cancelAllOrders 'stop' [#12860](https://github.com/ccxt/ccxt/pull/12860)
- docs minor fix [#12862](https://github.com/ccxt/ccxt/pull/12862)
- yobit cancelOrder cleanup [#12793](https://github.com/ccxt/ccxt/pull/12793)
- ZB fetchOrder 'stop' [#12858](https://github.com/ccxt/ccxt/pull/12858)
- [ndax] withdraw parse [#12845](https://github.com/ccxt/ccxt/pull/12845)
- ZB fetchOrders 'stop' [#12792](https://github.com/ccxt/ccxt/pull/12792)
- [bitso] withdraw parse [#12813](https://github.com/ccxt/ccxt/pull/12813)
- Manual update - transfer [#12738](https://github.com/ccxt/ccxt/pull/12738)
- bigone - transfer [#12706](https://github.com/ccxt/ccxt/pull/12706)
- bigone sub_account optional [#12867](https://github.com/ccxt/ccxt/pull/12867)
- [bitbank] withdraw parse [#12806](https://github.com/ccxt/ccxt/pull/12806)
- ascendex - refactor transfer [#12800](https://github.com/ccxt/ccxt/pull/12800)
- binance - refactor transfer [#12801](https://github.com/ccxt/ccxt/pull/12801)
- leverageTiers.notionalCap renamed to maxNotional and leverageTiers.notionalFloor renamed to minNotional [#12873](https://github.com/ccxt/ccxt/pull/12873)
- okx - `fetchTransfer` fix from plural to singular [#12876](https://github.com/ccxt/ccxt/pull/12876)
- mexc & okex  -  `fetchTransfer` signature [#12877](https://github.com/ccxt/ccxt/pull/12877)
- ascendex - `parseTransfer` for `transfer` [#12878](https://github.com/ccxt/ccxt/pull/12878)
- cryptocom - parseTransfers [#12874](https://github.com/ccxt/ccxt/pull/12874)
- hitbtc3 - `parseTransfer` for `transfer` [#12883](https://github.com/ccxt/ccxt/pull/12883)
- zb - `parseTransfer` for `transfer` [#12886](https://github.com/ccxt/ccxt/pull/12886)
- kucoinfutures - `parseTransfer` for `transfer` [#12885](https://github.com/ccxt/ccxt/pull/12885)
- hitbtc - `parseTransfer` for `transfer` [#12882](https://github.com/ccxt/ccxt/pull/12882)
- gateio - `parseTransfer` for `transfer` [#12881](https://github.com/ccxt/ccxt/pull/12881)
- Yobit: order parsing tweaks [#12869](https://github.com/ccxt/ccxt/pull/12869)
- bitmart - fetchWithdrawal [#12859](https://github.com/ccxt/ccxt/pull/12859)
- aax - refactor transfer [#12799](https://github.com/ccxt/ccxt/pull/12799)
- okcoin - transfer [#12722](https://github.com/ccxt/ccxt/pull/12722)
- whitebit - transfer [#12606](https://github.com/ccxt/ccxt/pull/12606)
- kucoin - `parseTransfer` for `transfer` [#12884](https://github.com/ccxt/ccxt/pull/12884)
- exchange.php - change `decimalToPrecision` to `decimal_to_precision` [#12889](https://github.com/ccxt/ccxt/pull/12889)
- `currencyToPrecision`: argument name change from `currency` to `currencyCode` [#12888](https://github.com/ccxt/ccxt/pull/12888)
- bitfinex - refactor transfer [#12802](https://github.com/ccxt/ccxt/pull/12802)
- bitfinex- `parseTransfer` for `transfer` [#12879](https://github.com/ccxt/ccxt/pull/12879)
- moving examples from  `async-php` into `php` [#12897](https://github.com/ccxt/ccxt/pull/12897)
- oceanex: add safeTrade [#12902](https://github.com/ccxt/ccxt/pull/12902)
- gemini: add createOrder and cancelOrder to parseOrder [#12903](https://github.com/ccxt/ccxt/pull/12903)
- bybit.fetchMarkets unified [#12864](https://github.com/ccxt/ccxt/pull/12864)
- Kucoin stop price [#12836](https://github.com/ccxt/ccxt/pull/12836)
- Gateio post only [#12267](https://github.com/ccxt/ccxt/pull/12267)
- Tests fetch trading fee [#12336](https://github.com/ccxt/ccxt/pull/12336)
- Bittrex createOrder: unify 'stopPrice' [#12904](https://github.com/ccxt/ccxt/pull/12904)


## 1.78.1

- hollaex withdraw [#12691](https://github.com/ccxt/ccxt/pull/12691)
- Edit bitvavo comment on rateLimit [#12699](https://github.com/ccxt/ccxt/pull/12699)
- minor typescript edit [#12700](https://github.com/ccxt/ccxt/pull/12700)
- Mexc cancelAllOrders [#12690](https://github.com/ccxt/ccxt/pull/12690)
- liquid - transfer [#12705](https://github.com/ccxt/ccxt/pull/12705)
- coinmate - transfer [#12704](https://github.com/ccxt/ccxt/pull/12704)
- Build OHLCVC examples :: CompleteCandles option [#12693](https://github.com/ccxt/ccxt/pull/12693)
- Mexc fetchOrder [#12680](https://github.com/ccxt/ccxt/pull/12680)
- coinfalcon - fetchDepositAddress, transfer functions [#12703](https://github.com/ccxt/ccxt/pull/12703)
- coinbasepro.deposit docstring @returns link syntax update [#12713](https://github.com/ccxt/ccxt/pull/12713)
- Mexc fetchClosedOrders, fetchCanceledOrders [#12701](https://github.com/ccxt/ccxt/pull/12701)
- xena: add safeTrade [#12714](https://github.com/ccxt/ccxt/pull/12714)
- ftx - transfer [#12554](https://github.com/ccxt/ccxt/pull/12554)
- php&python docstring transpiler regexes [#12627](https://github.com/ccxt/ccxt/pull/12627)
- additional error-code [#12717](https://github.com/ccxt/ccxt/pull/12717)
- Support for SAPIV3 methods [#12626](https://github.com/ccxt/ccxt/pull/12626)
- Borrow Rate parsers separated [#12301](https://github.com/ccxt/ccxt/pull/12301)
- Transpiler modify to accept argument from `pro` [#12720](https://github.com/ccxt/ccxt/pull/12720)
- additional error-code [#12726](https://github.com/ccxt/ccxt/pull/12726)
- Hollaex :: change api object [#12724](https://github.com/ccxt/ccxt/pull/12724)
- Xena: ratelimits [#12716](https://github.com/ccxt/ccxt/pull/12716)
- Okx fetchOrder 'stop' [#12715](https://github.com/ccxt/ccxt/pull/12715)
- Fetch borrow interest new fields [#12725](https://github.com/ccxt/ccxt/pull/12725)
- bitbns - transfer [#12736](https://github.com/ccxt/ccxt/pull/12736)
- bit2c - transfer [#12735](https://github.com/ccxt/ccxt/pull/12735)
- bitforex - transfer [#12739](https://github.com/ccxt/ccxt/pull/12739)
- upbit - transfer [#12744](https://github.com/ccxt/ccxt/pull/12744)
- bithumb - transfer [#12741](https://github.com/ccxt/ccxt/pull/12741)
- bitstamp: fix #12718 [#12732](https://github.com/ccxt/ccxt/pull/12732)
- Okx fetchCanceledOrders 'stop' [#12737](https://github.com/ccxt/ccxt/pull/12737)
- Fix Binance trade sell/buy side parsing [#12746](https://github.com/ccxt/ccxt/pull/12746)
- `fetchPermissions` in base [#12733](https://github.com/ccxt/ccxt/pull/12733)
- Mexc cancelOrder [#12745](https://github.com/ccxt/ccxt/pull/12745)
- Bitstamp: update ratelimits [#12771](https://github.com/ccxt/ccxt/pull/12771)
- kuna: add safeTrade [#12754](https://github.com/ccxt/ccxt/pull/12754)
- Kucoinfutures cancel all stop orders, fetch all stop orders [#12770](https://github.com/ccxt/ccxt/pull/12770)
- kucoin - createOrder support margin api changes [#12773](https://github.com/ccxt/ccxt/pull/12773)
- Gateio :: add nonce to orderBook [#12747](https://github.com/ccxt/ccxt/pull/12747)
- yobit: add safeTrade [#12782](https://github.com/ccxt/ccxt/pull/12782)
- ZB createOrder: unify 'stopPrice' [#12772](https://github.com/ccxt/ccxt/pull/12772)
- `safeTransaction` (for `fetchTransactions`) [#12755](https://github.com/ccxt/ccxt/pull/12755)
- `fetchStatus` added `info` [#12783](https://github.com/ccxt/ccxt/pull/12783)
- Browser bundle :: allow webworker usage [#12677](https://github.com/ccxt/ccxt/pull/12677)
- safeStatus [#12766](https://github.com/ccxt/ccxt/pull/12766)
- `safeTransfer` for `fetchTransfers` [#12756](https://github.com/ccxt/ccxt/pull/12756)
- `safeStatus` in `transpile.js` [#12786](https://github.com/ccxt/ccxt/pull/12786)
- yobit: add ratelimits  [#12789](https://github.com/ccxt/ccxt/pull/12789)
- bitmex - transfer [#12788](https://github.com/ccxt/ccxt/pull/12788)
- Bitfinex2 markets [#12784](https://github.com/ccxt/ccxt/pull/12784)
- novadax - transfer [#12707](https://github.com/ccxt/ccxt/pull/12707)
- bitget - transfer [#12740](https://github.com/ccxt/ccxt/pull/12740)
- zonda - transfer [#12742](https://github.com/ccxt/ccxt/pull/12742)
- binance.createOrder stoploss unification [#11852](https://github.com/ccxt/ccxt/pull/11852)


## 1.77.1

- probit coins mapping [#12522](https://github.com/ccxt/ccxt/pull/12522)
- bitfinex2 IDX -> ID [#12521](https://github.com/ccxt/ccxt/pull/12521)
- Added support for CTSI, CVX, IMX, NEXO and UST [#12520](https://github.com/ccxt/ccxt/pull/12520)
- Zaif: add safeTrade [#12538](https://github.com/ccxt/ccxt/pull/12538)
- Hitbtc3 new endpoints [#12531](https://github.com/ccxt/ccxt/pull/12531)
- Gateio :: contract example [#12541](https://github.com/ccxt/ccxt/pull/12541)
- Add missing methods to docs [#12261](https://github.com/ccxt/ccxt/pull/12261)
- mexc - transfer functions [#12500](https://github.com/ccxt/ccxt/pull/12500)
- bitpanda - transfer functions [#12508](https://github.com/ccxt/ccxt/pull/12508)
- ftx: don't crash while concatenating str and None in Python [#12549](https://github.com/ccxt/ccxt/pull/12549)
- liquid withdraw enhancement [#12560](https://github.com/ccxt/ccxt/pull/12560)
- Probit: add safeTrade [#12556](https://github.com/ccxt/ccxt/pull/12556)
- fix(lbank): add `market.amount.min` [#12553](https://github.com/ccxt/ccxt/pull/12553)
- ascendex: update doc link [#12551](https://github.com/ccxt/ccxt/pull/12551)
- Hitbtc3 fetchLeverage [#12546](https://github.com/ccxt/ccxt/pull/12546)
- ascendex - fetchTransfers [#12503](https://github.com/ccxt/ccxt/pull/12503)
- blockchaincom - transfer, fetchTransfer, fetchTransfers [#12559](https://github.com/ccxt/ccxt/pull/12559)
- cex - transfer, fetchTransfer, fetchTransfers [#12561](https://github.com/ccxt/ccxt/pull/12561)
- Ftx borrow interest [#12568](https://github.com/ccxt/ccxt/pull/12568)
- Hitbtc3 addMargin, reduceMargin [#12564](https://github.com/ccxt/ccxt/pull/12564)
- luno: add safeTrade [#12577](https://github.com/ccxt/ccxt/pull/12577)
- removed aax from certified exchanges in exchange-capabilities [#12580](https://github.com/ccxt/ccxt/pull/12580)
- Transpile Precise.stringEq to php [#12575](https://github.com/ccxt/ccxt/pull/12575)
- blockchaincom createOrder fix [#12571](https://github.com/ccxt/ccxt/pull/12571)
- gemini update fees [#12570](https://github.com/ccxt/ccxt/pull/12570)
- Binance methods [#12579](https://github.com/ccxt/ccxt/pull/12579)
- has methods [#12578](https://github.com/ccxt/ccxt/pull/12578)
- hollaex - fix fetchOrder [#12574](https://github.com/ccxt/ccxt/pull/12574)
- Binance fetchBorrowInterest [#12567](https://github.com/ccxt/ccxt/pull/12567)
- ascendex: update metadata [#12565](https://github.com/ccxt/ccxt/pull/12565)
- Hitbtc3 fetchPositions [#12530](https://github.com/ccxt/ccxt/pull/12530)
- bitvavo - transfer functions [#12552](https://github.com/ccxt/ccxt/pull/12552)
- exmo - transfer [#12573](https://github.com/ccxt/ccxt/pull/12573)
- ascendex - transfer [#12497](https://github.com/ccxt/ccxt/pull/12497)
- luno: update ratelimits [#12582](https://github.com/ccxt/ccxt/pull/12582)
- novadax: add safeTrades [#12585](https://github.com/ccxt/ccxt/pull/12585)
- Hitbtc3 setLeverage [#12581](https://github.com/ccxt/ccxt/pull/12581)
- Fetch isolated positions [#12590](https://github.com/ccxt/ccxt/pull/12590)
- bitrue fetchWithdrawals fix [#12601](https://github.com/ccxt/ccxt/pull/12601)
- Fixes #12409 (deribit crash on stop-market orders) [#12607](https://github.com/ccxt/ccxt/pull/12607)
- ascendex - transfer describe [#12602](https://github.com/ccxt/ccxt/pull/12602)
- Hitbtc3 fetchPosition [#12599](https://github.com/ccxt/ccxt/pull/12599)
- Hitbtc3 fetchMarkOHLCV, fetchIndexOHLCV, fetchPremiumIndexOHLCV [#12584](https://github.com/ccxt/ccxt/pull/12584)
- aax - fetchTransfers [#12502](https://github.com/ccxt/ccxt/pull/12502)
- novadax: update ratelimits [#12596](https://github.com/ccxt/ccxt/pull/12596)
- Hitbtc3 'has' [#12611](https://github.com/ccxt/ccxt/pull/12611)
- vcc - transfer [#12608](https://github.com/ccxt/ccxt/pull/12608)
- Update python's Precise class to allow native comparisons [#12615](https://github.com/ccxt/ccxt/pull/12615)
- bybit: add trading fee rate api [#12614](https://github.com/ccxt/ccxt/pull/12614)
- gateio.createReduceOnlyOrder [#12587](https://github.com/ccxt/ccxt/pull/12587)
- Borrow Interest docs [#12589](https://github.com/ccxt/ccxt/pull/12589)
- waves exchange - transfer, fetchTransfer, fetchTransfers [#12555](https://github.com/ccxt/ccxt/pull/12555)
- poloniex - transfer [#12609](https://github.com/ccxt/ccxt/pull/12609)
- JS base tests fix removed mocha [#12566](https://github.com/ccxt/ccxt/pull/12566)


## 1.76.1

- Okx :: fix ticker volume / add safeTicker volume calculation [#12358](https://github.com/ccxt/ccxt/pull/12358)
- cex error mapping [#12359](https://github.com/ccxt/ccxt/pull/12359)
- crex24 - fetchTradingFees [#12333](https://github.com/ccxt/ccxt/pull/12333)
- yobit GMR -> Gimmer [#12361](https://github.com/ccxt/ccxt/pull/12361)
- Hitbtc3 createOrder [#12357](https://github.com/ccxt/ccxt/pull/12357)
- Okx createOrder: unify 'stopPrice' [#12316](https://github.com/ccxt/ccxt/pull/12316)
- Ascendex :: restructure api [#12372](https://github.com/ccxt/ccxt/pull/12372)
- Hitbtc3 fetchTradingFee [#12365](https://github.com/ccxt/ccxt/pull/12365)
- Hitbtc3 fetchTradingFees [#12364](https://github.com/ccxt/ccxt/pull/12364)
- bitrue MIM -> MIM Swarm [#12374](https://github.com/ccxt/ccxt/pull/12374)
- remove `includes` [#12121](https://github.com/ccxt/ccxt/pull/12121)
- mexc- remove `fetchMarketsByType` [#12373](https://github.com/ccxt/ccxt/pull/12373)
- probit - fetchTradingFee [#12387](https://github.com/ccxt/ccxt/pull/12387)
- kuna - fetchTradingFees [#12386](https://github.com/ccxt/ccxt/pull/12386)
- qtrade - fetchTradingFees [#12385](https://github.com/ccxt/ccxt/pull/12385)
- Hitbtc3 cancelAllOrders [#12389](https://github.com/ccxt/ccxt/pull/12389)
- Hitbtc3 cancelOrder [#12388](https://github.com/ccxt/ccxt/pull/12388)
- lbank - fetchTradingFees [#12384](https://github.com/ccxt/ccxt/pull/12384)
- zb - fetchTradingFees [#12383](https://github.com/ccxt/ccxt/pull/12383)
- Hitbtc3 fetchMyTrades [#12371](https://github.com/ccxt/ccxt/pull/12371)
- Hitbtc3 fetchOrderTrades [#12370](https://github.com/ccxt/ccxt/pull/12370)
- Hitbtc3 fetchOrder [#12368](https://github.com/ccxt/ccxt/pull/12368)
- Multilang k and t flags [#12391](https://github.com/ccxt/ccxt/pull/12391)
- Hitbtc3 fetchClosedOrders [#12369](https://github.com/ccxt/ccxt/pull/12369)
- Hitbtc3 fetchOpenOrder [#12367](https://github.com/ccxt/ccxt/pull/12367)
- Hitbtc3 fetchOpenOrders [#12366](https://github.com/ccxt/ccxt/pull/12366)
- poloniex error mapping [#12395](https://github.com/ccxt/ccxt/pull/12395)
- Bitstamp: added error for "Wrong API key format" [#12396](https://github.com/ccxt/ccxt/pull/12396)
- currencycom AMC mapping [#12398](https://github.com/ccxt/ccxt/pull/12398)
- Hitbtc3 createReduceOnlyOrder [#12392](https://github.com/ccxt/ccxt/pull/12392)
- ftx AMC mapping [#12397](https://github.com/ccxt/ccxt/pull/12397)
- Hitbtc3 editOrder [#12401](https://github.com/ccxt/ccxt/pull/12401)
- mexc new endpoints [#12404](https://github.com/ccxt/ccxt/pull/12404)
- okx: switch all futures -> future [#12400](https://github.com/ccxt/ccxt/pull/12400)
- currencycom - fetchMarkets [#12049](https://github.com/ccxt/ccxt/pull/12049)
- currencycom - `fetchAccounts` change of `info` [#12411](https://github.com/ccxt/ccxt/pull/12411)
- Poloniex: error "This account is closed" [#12416](https://github.com/ccxt/ccxt/pull/12416)
- Gateio :: fix setLeverage [#12417](https://github.com/ccxt/ccxt/pull/12417)
- bitmart - fix `private` signature [#12420](https://github.com/ccxt/ccxt/pull/12420)
- Phemex - new public api end point to fetch funding rates [#12419](https://github.com/ccxt/ccxt/pull/12419)
- FTX: add "Get deposit address list" API endpoint [#12415](https://github.com/ccxt/ccxt/pull/12415)
- Ascendex is now part of CCXT.Pro 🙂  [#12422](https://github.com/ccxt/ccxt/pull/12422)
- deribit.fetchMarkets symbol fix [#12426](https://github.com/ccxt/ccxt/pull/12426)
- okx fetchPositions fix [#12434](https://github.com/ccxt/ccxt/pull/12434)
- okx fetchFundingHistory fixes [#12435](https://github.com/ccxt/ccxt/pull/12435)
- hitbtc error mapping [#12438](https://github.com/ccxt/ccxt/pull/12438)
- hitbtc3 error mapping [#12439](https://github.com/ccxt/ccxt/pull/12439)
- gateio added new api endpoints [#12425](https://github.com/ccxt/ccxt/pull/12425)
- bitopro - fetchTradingFee [#12446](https://github.com/ccxt/ccxt/pull/12446)
- novadax - fetchTradingFees [#12447](https://github.com/ccxt/ccxt/pull/12447)
- bibox - tradingFees [#12444](https://github.com/ccxt/ccxt/pull/12444)
- huobi - fetchTradingFees [#12443](https://github.com/ccxt/ccxt/pull/12443)
- oceanex - fetchTradingFee [#12448](https://github.com/ccxt/ccxt/pull/12448)
- phemex - fetchTradingFees [#12449](https://github.com/ccxt/ccxt/pull/12449)
- Hitbtc3 fetchFundingRate [#12430](https://github.com/ccxt/ccxt/pull/12430)
- tidebit - fetchTradingFee [#12450](https://github.com/ccxt/ccxt/pull/12450)
- Hitbtc3 adjust 'has' for swap methods [#12453](https://github.com/ccxt/ccxt/pull/12453)
- currencycom - stopPrice unification [#12410](https://github.com/ccxt/ccxt/pull/12410)
- Hitbtc3 fetchPositions [#12428](https://github.com/ccxt/ccxt/pull/12428)
- Mexc createOrder (stopLoss, takeProfit) [#12302](https://github.com/ccxt/ccxt/pull/12302)
- gateio.cancelAllOrders futures [#12424](https://github.com/ccxt/ccxt/pull/12424)
- binance fetchMarkets enhancement [#12456](https://github.com/ccxt/ccxt/pull/12456)
- eqonex - fetchTradingFee [#12290](https://github.com/ccxt/ccxt/pull/12290)
- Mexc createOrder [#12463](https://github.com/ccxt/ccxt/pull/12463)
- Hitbtc3 fetchMyTrades [#12459](https://github.com/ccxt/ccxt/pull/12459)
- Hitbtc3 fetchOpenOrders [#12460](https://github.com/ccxt/ccxt/pull/12460)
- Hitbtc3 fetchOrderTrades [#12461](https://github.com/ccxt/ccxt/pull/12461)


## 1.75.1

- gateio.stoploss rule fix [#12260](https://github.com/ccxt/ccxt/pull/12260)
- ZB fetchBalance [#12249](https://github.com/ccxt/ccxt/pull/12249)
- therock - fetchTradingFees [#12216](https://github.com/ccxt/ccxt/pull/12216)
- Revert "gateio.stoploss rule fix" [#12263](https://github.com/ccxt/ccxt/pull/12263)
- lbank: patch fetchClosedOrders [#12247](https://github.com/ccxt/ccxt/pull/12247)
- qa stuff [#12264](https://github.com/ccxt/ccxt/pull/12264)
- ZB transfer [#12251](https://github.com/ccxt/ccxt/pull/12251)
- binance - deprecate safeFloat2 [#12075](https://github.com/ccxt/ccxt/pull/12075)
- bitso - fees [#12266](https://github.com/ccxt/ccxt/pull/12266)
- btctradeua - fetchTradingFees [#12270](https://github.com/ccxt/ccxt/pull/12270)
- buda - fetchTradingFee [#12271](https://github.com/ccxt/ccxt/pull/12271)
- bl3p - fetchTradingFees [#12269](https://github.com/ccxt/ccxt/pull/12269)
- gateio.fetchPosition num contracts absolute value [#12268](https://github.com/ccxt/ccxt/pull/12268)
- Added support for AVAX and WBTC to Bitstamp [#12274](https://github.com/ccxt/ccxt/pull/12274)
- Okx Added Missing Endpoints [#12278](https://github.com/ccxt/ccxt/pull/12278)
- Phemex :: stop-orders example [#12277](https://github.com/ccxt/ccxt/pull/12277)
- bw - fetchTradingFees [#12272](https://github.com/ccxt/ccxt/pull/12272)
- coinfalcon - fetchTradingFees [#12273](https://github.com/ccxt/ccxt/pull/12273)
- WhiteBIT: fix error message for error [#12282](https://github.com/ccxt/ccxt/pull/12282)
- okx: fix return by network [#12280](https://github.com/ccxt/ccxt/pull/12280)
- added `react/http` in instructions [#12285](https://github.com/ccxt/ccxt/pull/12285)
- ZB fetchBorrowRates [#12276](https://github.com/ccxt/ccxt/pull/12276)
- hitbtc - fetchTradingFee [#12292](https://github.com/ccxt/ccxt/pull/12292)
- hollaex - fetchTradingFees [#12294](https://github.com/ccxt/ccxt/pull/12294)
- kucoin - fetchTradingFees [#12298](https://github.com/ccxt/ccxt/pull/12298)
- itbit - fetchTradingFees [#12297](https://github.com/ccxt/ccxt/pull/12297)
- indodax - fetchTradingFees [#12296](https://github.com/ccxt/ccxt/pull/12296)
- gateio fetchFundingHistory fixes [#12293](https://github.com/ccxt/ccxt/pull/12293)
- coinbasepro - fetchTradingFees [#12288](https://github.com/ccxt/ccxt/pull/12288)
- bitflyer - fetchTradingFee [#12286](https://github.com/ccxt/ccxt/pull/12286)
- gateio.transfer unified response [#12300](https://github.com/ccxt/ccxt/pull/12300)
- unify accountType names "funding", "spot", "margin", and "future" [#12299](https://github.com/ccxt/ccxt/pull/12299)
- Gateio ::  fetchMarkets refactor [#12283](https://github.com/ccxt/ccxt/pull/12283)
- ZB createOrder [#12275](https://github.com/ccxt/ccxt/pull/12275)
- independent reserve - fetchTradingFees [#12295](https://github.com/ccxt/ccxt/pull/12295)
- okcoin: update ratelimits [#12224](https://github.com/ccxt/ccxt/pull/12224)
- latoken - fetchTradingFees [#12305](https://github.com/ccxt/ccxt/pull/12305)
- added `react/http` in composer [#12307](https://github.com/ccxt/ccxt/pull/12307)
- Bitflyer: fix futures market parsing without alias [#12308](https://github.com/ccxt/ccxt/pull/12308)
- Base  - flag for ssl validation  [#12306](https://github.com/ccxt/ccxt/pull/12306)
- exmo - fetchTradingFees [#12291](https://github.com/ccxt/ccxt/pull/12291)
- gateio.fetchMarkets php fix [#12314](https://github.com/ccxt/ccxt/pull/12314)
- fetch_leverage_tiers fix (python) [#12313](https://github.com/ccxt/ccxt/pull/12313)
- Bybit fetchFundingRate: fundingTimestamp [#12312](https://github.com/ccxt/ccxt/pull/12312)
- multilang.sh [#12315](https://github.com/ccxt/ccxt/pull/12315)
- multilang.sh edits [#12317](https://github.com/ccxt/ccxt/pull/12317)
- multilang.sh minor edits [#12325](https://github.com/ccxt/ccxt/pull/12325)
- Gateio :: fix fetchMarkets [#12322](https://github.com/ccxt/ccxt/pull/12322)
- Gateio :: futures testnet and examples [#12310](https://github.com/ccxt/ccxt/pull/12310)
- New exchange - bkex [#12139](https://github.com/ccxt/ccxt/pull/12139)
- gateio cancelOrder stop order matches fetchOrder [#12329](https://github.com/ccxt/ccxt/pull/12329)


## 1.74.1

- Gateio stop loss [#11844](https://github.com/ccxt/ccxt/pull/11844)
- ZB fetchPosition, fetchPositions [#12106](https://github.com/ccxt/ccxt/pull/12106)
- currencycom - Positions [#12054](https://github.com/ccxt/ccxt/pull/12054)
- EUR/USD priority added [#12122](https://github.com/ccxt/ccxt/pull/12122)
- Add timeframes options in poloniex [#12124](https://github.com/ccxt/ccxt/pull/12124)
- bitget v1 api update [#12125](https://github.com/ccxt/ccxt/pull/12125)
- gateio - stringEq correction [#12130](https://github.com/ccxt/ccxt/pull/12130)
- Huobi orderbook add "depth" support [#12126](https://github.com/ccxt/ccxt/pull/12126)
- [gateio] Restore `clientOrderId` parsing on gate.io [#12132](https://github.com/ccxt/ccxt/pull/12132)
- [gateio] Correctly parse order status [#12135](https://github.com/ccxt/ccxt/pull/12135)
- [gateio] Use "PO" as timeInForce instead of "POC" [#12134](https://github.com/ccxt/ccxt/pull/12134)
- gateio - fetchTradingFee [#12138](https://github.com/ccxt/ccxt/pull/12138)
- ZB fetchTrades [#12119](https://github.com/ccxt/ccxt/pull/12119)
- Mexc: contracts error: AccountNotEnabled [#12144](https://github.com/ccxt/ccxt/pull/12144)
- Bitfinex2 - fetchTradingFees [#12088](https://github.com/ccxt/ccxt/pull/12088)
- kraken - fetchTradingFee [#12148](https://github.com/ccxt/ccxt/pull/12148)
- Fix wrong order ID parsing in gate.io [#12158](https://github.com/ccxt/ccxt/pull/12158)
- Bitmart - fetchTradingFees [#12153](https://github.com/ccxt/ccxt/pull/12153)
- blockchaincom: update rate limits [#12150](https://github.com/ccxt/ccxt/pull/12150)
- blockchaincom: add safeTrade [#12151](https://github.com/ccxt/ccxt/pull/12151)
- Bitbank - fetchTradingFees [#12152](https://github.com/ccxt/ccxt/pull/12152)
- idex - fetchTradingFees [#12159](https://github.com/ccxt/ccxt/pull/12159)
- poloniex: add safeTrade [#12157](https://github.com/ccxt/ccxt/pull/12157)
- mexc - fetchTradingFees [#12156](https://github.com/ccxt/ccxt/pull/12156)
- ZB fetchFundingRates [#12143](https://github.com/ccxt/ccxt/pull/12143)
- lykke: add new impletation for lykke v2 api [#11689](https://github.com/ccxt/ccxt/pull/11689)
- blockchaincom: unify 'stopPrice' [#12149](https://github.com/ccxt/ccxt/pull/12149)
- ZB cancelOrder [#12161](https://github.com/ccxt/ccxt/pull/12161)
- ZB fetchOrder [#12162](https://github.com/ccxt/ccxt/pull/12162)
- poloniex: update rate limits [#12166](https://github.com/ccxt/ccxt/pull/12166)
- ftx - fetchTradingFees [#12167](https://github.com/ccxt/ccxt/pull/12167)
- bitvavo - fetchTradingFees [#12154](https://github.com/ccxt/ccxt/pull/12154)
- gemini - fetchTradingFees [#12160](https://github.com/ccxt/ccxt/pull/12160)
- ZB addMargin, reduceMargin [#12165](https://github.com/ccxt/ccxt/pull/12165)
- run-tests for individual languages [#12171](https://github.com/ccxt/ccxt/pull/12171)
- bitget - fetchTradingFees [#12170](https://github.com/ccxt/ccxt/pull/12170)
- coinspot - fetchTradingFee [#12169](https://github.com/ccxt/ccxt/pull/12169)
- coinmate - fetchTradingFee [#12168](https://github.com/ccxt/ccxt/pull/12168)
- blockchaincom: fix fee parsing [#12174](https://github.com/ccxt/ccxt/pull/12174)
- bitpanda - fetchTradingFees [#12113](https://github.com/ccxt/ccxt/pull/12113)
- BTC-Alpha  fetchTradingFees [#12178](https://github.com/ccxt/ccxt/pull/12178)
- Php Exchange :: Add sleep method [#12176](https://github.com/ccxt/ccxt/pull/12176)
- bitbns - fetchTradingFee [#12184](https://github.com/ccxt/ccxt/pull/12184)
- bybit - fetchTradingFees [#12183](https://github.com/ccxt/ccxt/pull/12183)
- bigone - fetchTradingFees [#12182](https://github.com/ccxt/ccxt/pull/12182)
- coinex - fetchTradingFees [#12181](https://github.com/ccxt/ccxt/pull/12181)
- coincheck - fetchTradingFees [#12179](https://github.com/ccxt/ccxt/pull/12179)
- cdax - fetchTradingFees [#12186](https://github.com/ccxt/ccxt/pull/12186)
- cex - fetchTradingFee [#12187](https://github.com/ccxt/ccxt/pull/12187)
- bytetrade - fetchTradingFees [#12185](https://github.com/ccxt/ccxt/pull/12185)
- Bitmex :: fetchTickers and sign fixes [#12190](https://github.com/ccxt/ccxt/pull/12190)
- Okcoin: add  safeTrade [#12177](https://github.com/ccxt/ccxt/pull/12177)
- ZB fetchOHLCV [#12172](https://github.com/ccxt/ccxt/pull/12172)
- zonda - fetchTradingFees [#12191](https://github.com/ccxt/ccxt/pull/12191)
- zaif - fetchTradingFees [#12192](https://github.com/ccxt/ccxt/pull/12192)
- Yobit - fetchTradingFees [#12194](https://github.com/ccxt/ccxt/pull/12194)
- xena - fetchTradingFees [#12195](https://github.com/ccxt/ccxt/pull/12195)
- Woo - fetchTradingFees [#12196](https://github.com/ccxt/ccxt/pull/12196)
- ZB fetchMarkOHLCV, fetchIndexOHLCV [#12197](https://github.com/ccxt/ccxt/pull/12197)
- aax.fetchLeverageTiers [#12094](https://github.com/ccxt/ccxt/pull/12094)


## 1.73.1

- yobit AUR -> AuroraCoin [#12028](https://github.com/ccxt/ccxt/pull/12028)
- gateio AXIS -> Axis DeFi [#12027](https://github.com/ccxt/ccxt/pull/12027)
- bitmart GLD -> Goldario [#12025](https://github.com/ccxt/ccxt/pull/12025)
- Just correction of existing implicit calls to v2 [#12029](https://github.com/ccxt/ccxt/pull/12029)
- liquid BIFI -> BIFIF [#12023](https://github.com/ccxt/ccxt/pull/12023)
- market tests [#11837](https://github.com/ccxt/ccxt/pull/11837)
- Bitvavo: fix trade and transactions parsing [#12038](https://github.com/ccxt/ccxt/pull/12038)
- DigiFinex: parse correct trade side when *_market trade [#12039](https://github.com/ccxt/ccxt/pull/12039)
- bitget: clientOrderId for spot createOrder [#12040](https://github.com/ccxt/ccxt/pull/12040)
- Update bitget.js [#12041](https://github.com/ccxt/ccxt/pull/12041)
- DigiFinex: update transaction states parsing [#12042](https://github.com/ccxt/ccxt/pull/12042)
- Wavesexchange :: New fees mechanism  [#11905](https://github.com/ccxt/ccxt/pull/11905)
- okcoin typo fix [#12045](https://github.com/ccxt/ccxt/pull/12045)
- currencycom - fetchCurrencies [#12050](https://github.com/ccxt/ccxt/pull/12050)
- currencycom - minor comments [#12051](https://github.com/ccxt/ccxt/pull/12051)
- currencycom - transactions [#12047](https://github.com/ccxt/ccxt/pull/12047)
- currencycom - Leverage methods [#12053](https://github.com/ccxt/ccxt/pull/12053)
- Wazirx :: fix createOrder [#12063](https://github.com/ccxt/ccxt/pull/12063)
- fix bitmart fetchContractMarkets [#12065](https://github.com/ccxt/ccxt/pull/12065)
- bybit.fetchFundingRate next funding rate fix [#12060](https://github.com/ccxt/ccxt/pull/12060)
- Rename fetchAllTradingFees to fetchTradingFees [#12074](https://github.com/ccxt/ccxt/pull/12074)
- currencycom - fetchDepositAddress [#12048](https://github.com/ccxt/ccxt/pull/12048)
- kucoin fetchTradingFee [#12070](https://github.com/ccxt/ccxt/pull/12070)
- hollaex - deprecate safeFloat [#12076](https://github.com/ccxt/ccxt/pull/12076)
- bittrex fetchTradingFee, fetchTradingFees [#12062](https://github.com/ccxt/ccxt/pull/12062)
- Huobi :: fix fetchPosition [#12046](https://github.com/ccxt/ccxt/pull/12046)
- gateio: issues with parsing by limit with swap markets [#12061](https://github.com/ccxt/ccxt/pull/12061)
- latoken GEC -> Geco One [#12084](https://github.com/ccxt/ccxt/pull/12084)
- fetchLeverageTiers.notionalCurrency renamed to currency [#12083](https://github.com/ccxt/ccxt/pull/12083)
- gateio.fetchMarkets margin markets fix #12020 [#12079](https://github.com/ccxt/ccxt/pull/12079)


## 1.72.1

- fix `code` undefined [#11874](https://github.com/ccxt/ccxt/pull/11874)
- bitforex.fetchMarkets unified [#11881](https://github.com/ccxt/ccxt/pull/11881)
- bittrex.fetchMarkets - sort fetchMarkets, code reduction [#11884](https://github.com/ccxt/ccxt/pull/11884)
- bitget.fetchMarkets unified fetchMarket [#11883](https://github.com/ccxt/ccxt/pull/11883)
- okx.fetchMarkets swap symbol fix [#11891](https://github.com/ccxt/ccxt/pull/11891)
- bitstamp.fetchMarkets code reduction/sort [#11890](https://github.com/ccxt/ccxt/pull/11890)
- bitso.fetchMarkets sort [#11889](https://github.com/ccxt/ccxt/pull/11889)
- bitrue.fetchMarkets code reduction, sort, unification [#11888](https://github.com/ccxt/ccxt/pull/11888)
- bitpanda.fetchMarkets sort, removed withdraw and deposit from markets [#11887](https://github.com/ccxt/ccxt/pull/11887)
- bitmex.fetchMarkets code reduction, unification [#11886](https://github.com/ccxt/ccxt/pull/11886)
- bithumb.fetchMarkets unified [#11885](https://github.com/ccxt/ccxt/pull/11885)
- currency might be undefined in some cases [#11875](https://github.com/ccxt/ccxt/pull/11875)
- unique keywords (remove duplicates) [#11870](https://github.com/ccxt/ccxt/pull/11870)
- bitflyer.fetchMarkets [#11882](https://github.com/ccxt/ccxt/pull/11882)
- [Binance] Convert 'GTX' timeInForce to 'PO' [#11893](https://github.com/ccxt/ccxt/pull/11893)
- bw.fetchMarkets unified [#11901](https://github.com/ccxt/ccxt/pull/11901)
- cex.fetchMakets stringSub [#11900](https://github.com/ccxt/ccxt/pull/11900)
- buda.fetchMarkets unified [#11903](https://github.com/ccxt/ccxt/pull/11903)
- Add maintenanceMarginRate to fetchMarkets [#11860](https://github.com/ccxt/ccxt/pull/11860)
- Php cli :: add test option [#11908](https://github.com/ccxt/ccxt/pull/11908)
- fetchMarkets sort, parse numbers [#11904](https://github.com/ccxt/ccxt/pull/11904)
- Update ascendex.js [#11919](https://github.com/ccxt/ccxt/pull/11919)
- incorrect params for parseOrderBook [#11915](https://github.com/ccxt/ccxt/pull/11915)
- Maintenance margin rate added to rest of exchange markets [#11910](https://github.com/ccxt/ccxt/pull/11910)
- delta.fetchMarkets maintenanceMarginRate [#11912](https://github.com/ccxt/ccxt/pull/11912)
- Gate.io: added parsing for GateCode transfer [#11924](https://github.com/ccxt/ccxt/pull/11924)
- luno add default fees for maker and taker [#11916](https://github.com/ccxt/ccxt/pull/11916)
- cryptocom.fetchMarkets response comment update, max leverage [#11911](https://github.com/ccxt/ccxt/pull/11911)
- Add while loop transpile regex to build/transpile.js [#11927](https://github.com/ccxt/ccxt/pull/11927)
- Kucoin: update ratelimits [#11922](https://github.com/ccxt/ccxt/pull/11922)
- Gate.io: fix GateCode redemption [#11930](https://github.com/ccxt/ccxt/pull/11930)
- Mexc parsePosition, parsePositions [#11926](https://github.com/ccxt/ccxt/pull/11926)
- Bybit :: add error mapping [#11932](https://github.com/ccxt/ccxt/pull/11932)
- Docstrings are transpiled from Javascript to Python [#11928](https://github.com/ccxt/ccxt/pull/11928)
- currencycom OSK -> Oshkosh [#11934](https://github.com/ccxt/ccxt/pull/11934)
- poloniex error mapping [#11935](https://github.com/ccxt/ccxt/pull/11935)
- ftx-close-position-reduceOnly removed safeValue [#11949](https://github.com/ccxt/ccxt/pull/11949)
- kucoin add an exception [#11955](https://github.com/ccxt/ccxt/pull/11955)
- Kucoin: update fetchOrderBook [#11933](https://github.com/ccxt/ccxt/pull/11933)
- okex notional [#11956](https://github.com/ccxt/ccxt/pull/11956)
- fix zaif btc/jpy fee [#11958](https://github.com/ccxt/ccxt/pull/11958)
- coincheck.fetchWithdrawals coincheck.fetchDeposits  [#11951](https://github.com/ccxt/ccxt/pull/11951)
- feat: bitflyer.fetchWithdrawals, bitflyer.fetchDeposits [#11959](https://github.com/ccxt/ccxt/pull/11959)
- binance.fetchLeverageTiers [#11937](https://github.com/ccxt/ccxt/pull/11937)
- Kucoinfutures lev tiers [#11943](https://github.com/ccxt/ccxt/pull/11943)
- fetchLeverageTiers documentation [#11941](https://github.com/ccxt/ccxt/pull/11941)
- Okx fetchLeverageTiers [#11938](https://github.com/ccxt/ccxt/pull/11938)
- has.fetchLeverageTiers: false on spot exchanges [#11946](https://github.com/ccxt/ccxt/pull/11946)
- fix: coincheck fetchDeposits, fetchWithdrawals, fetchMyTrades [#11962](https://github.com/ccxt/ccxt/pull/11962)


## 1.71.1

- huobi.fetchLedger [#11749](https://github.com/ccxt/ccxt/pull/11749)
- Fixed fetching OHLC for Waves  [#11754](https://github.com/ccxt/ccxt/pull/11754)
- fix[Gate.io]: extract settle currency from the correct variable [#11759](https://github.com/ccxt/ccxt/pull/11759)
- gateio precision fix [#11761](https://github.com/ccxt/ccxt/pull/11761)
- fix[Gate.io]: assign average cost value to correct variable [#11760](https://github.com/ccxt/ccxt/pull/11760)
- fix[Gate.io]: prevent crash when parsing fees [#11758](https://github.com/ccxt/ccxt/pull/11758)
- Update market type definition [#11762](https://github.com/ccxt/ccxt/pull/11762)
- Fixed a few problems with Waves.exchange in regards to fees and pointed the matcher to a SSL connection [#11767](https://github.com/ccxt/ccxt/pull/11767)
- bytetrade maxAmount, maxPrice fix [#11766](https://github.com/ccxt/ccxt/pull/11766)
- digifinex fetchMarketsV1 unified, has leverage methods removed [#11768](https://github.com/ccxt/ccxt/pull/11768)
- currencycom.has futures methods [#11771](https://github.com/ccxt/ccxt/pull/11771)
- FTX createReduceOnlyOrder [#11772](https://github.com/ccxt/ccxt/pull/11772)
- Aax & ascendex fetchMarkets, has [#11774](https://github.com/ccxt/ccxt/pull/11774)
- deribit.fetchMarkets fix options symbols, deribit.has fix [#11769](https://github.com/ccxt/ccxt/pull/11769)
- huobi parseTrade feeCurrency [#11773](https://github.com/ccxt/ccxt/pull/11773)
- cryptocom.fetchMarkets code reduction, sort [#11775](https://github.com/ccxt/ccxt/pull/11775)
- Crex24 fetchMarkets unified, has leverage methods [#11776](https://github.com/ccxt/ccxt/pull/11776)
- AAX.has futures methods false [#11785](https://github.com/ccxt/ccxt/pull/11785)
- mercado: update response for fetchTicker [#11787](https://github.com/ccxt/ccxt/pull/11787)
- Okex.has futures methods false [#11786](https://github.com/ccxt/ccxt/pull/11786)
- coinbasepro.fetchMarkets sorted, a few properties fixed [#11784](https://github.com/ccxt/ccxt/pull/11784)
- Coinbase.fetchMarkets sort, small fixes. has leverage methods [#11783](https://github.com/ccxt/ccxt/pull/11783)
- coincheck.has leverage methods [#11782](https://github.com/ccxt/ccxt/pull/11782)
- Coinex.fetchMarkets unified [#11781](https://github.com/ccxt/ccxt/pull/11781)
- Coinfalcon markets [#11780](https://github.com/ccxt/ccxt/pull/11780)
- Coinmate markets [#11779](https://github.com/ccxt/ccxt/pull/11779)
- Crypto.com :: fix create order bug [#11791](https://github.com/ccxt/ccxt/pull/11791)
- Coinone markets [#11778](https://github.com/ccxt/ccxt/pull/11778)
- coinspot.has leverage methods [#11777](https://github.com/ccxt/ccxt/pull/11777)
- Manual :: Update market type docs [#11790](https://github.com/ccxt/ccxt/pull/11790)
- delta.fetchMarkets unified [#11770](https://github.com/ccxt/ccxt/pull/11770)
- hitbtc error mapping [#11795](https://github.com/ccxt/ccxt/pull/11795)
- bitfinex2.fetchLedger [#11796](https://github.com/ccxt/ccxt/pull/11796)
- bitmex.fetchMarkets unified structure [#11341](https://github.com/ccxt/ccxt/pull/11341)
- cdax.fetchMarkets unified and has futures methods [#11799](https://github.com/ccxt/ccxt/pull/11799)
- Bytetrade markets [#11800](https://github.com/ccxt/ccxt/pull/11800)
- blockchaincom has leverage methods fix [#11801](https://github.com/ccxt/ccxt/pull/11801)
- cexio market sort and has futures methods [#11798](https://github.com/ccxt/ccxt/pull/11798)
- has leverage methods for exchanges starting with b [#11802](https://github.com/ccxt/ccxt/pull/11802)
- Has leverage methods and market types [#11803](https://github.com/ccxt/ccxt/pull/11803)
- Xena :: Protect orderbook code [#11812](https://github.com/ccxt/ccxt/pull/11812)
- Woo - set `margin` to true [#11807](https://github.com/ccxt/ccxt/pull/11807)
- Huobi :: improve error mapping [#11810](https://github.com/ccxt/ccxt/pull/11810)
- update binance giftcard api [#11817](https://github.com/ccxt/ccxt/pull/11817)
- 'no-unused-vars' : priceKey & amountKey [#11818](https://github.com/ccxt/ccxt/pull/11818)
- Bitfinex2 change future to swap [#11820](https://github.com/ccxt/ccxt/pull/11820)
- Margin mode types [#11806](https://github.com/ccxt/ccxt/pull/11806)
- Fix kucoin trigger order status [#11824](https://github.com/ccxt/ccxt/pull/11824)


## 1.70.1

- bitforex error mapping [#11636](https://github.com/ccxt/ccxt/pull/11636)
- Qtrade unified fetchMarkets, has leverage methods [#11628](https://github.com/ccxt/ccxt/pull/11628)
- Ripio fetchMarkets unified, has leverage methods [#11627](https://github.com/ccxt/ccxt/pull/11627)
- stex.fetchMarkets unified, has leverage methods [#11626](https://github.com/ccxt/ccxt/pull/11626)
- therock.has futures methods, fetchMarkets ordering, string math, leverage, margin [#11625](https://github.com/ccxt/ccxt/pull/11625)
- gemini: update-ratelimits [#11638](https://github.com/ccxt/ccxt/pull/11638)
- bybit.setMarginMode catch error and throw BadRequest when marginType set to current marginType [#11624](https://github.com/ccxt/ccxt/pull/11624)
- fix[Gate.io]: change position sides from buy/sell to long/short [#11637](https://github.com/ccxt/ccxt/pull/11637)
- Tidebit markets [#11605](https://github.com/ccxt/ccxt/pull/11605)
- Gemini: add safeTrade [#11639](https://github.com/ccxt/ccxt/pull/11639)
- Ascendex createReduceOnlyOrder [#11641](https://github.com/ccxt/ccxt/pull/11641)
- Ascendex update has for excluded futures methods [#11642](https://github.com/ccxt/ccxt/pull/11642)
- Updated manual.rst for date-based pagination [#11640](https://github.com/ccxt/ccxt/pull/11640)
- zb error mapping [#11646](https://github.com/ccxt/ccxt/pull/11646)
- Hitbtc v2 : update-ratelimits [#11648](https://github.com/ccxt/ccxt/pull/11648)
- feat[Gate.io]: add marginType when parsing positions [#11647](https://github.com/ccxt/ccxt/pull/11647)
- hitbtc v2: update-safeTrade [#11651](https://github.com/ccxt/ccxt/pull/11651)
- poloniex createDepositAddress fix [#11650](https://github.com/ccxt/ccxt/pull/11650)
- Build :: Add step to order exchange capabilities/meta info [#11351](https://github.com/ccxt/ccxt/pull/11351)
- hitbtc v3: update-ratelimits [#11654](https://github.com/ccxt/ccxt/pull/11654)
- hitbtc v3: add safeTrade [#11657](https://github.com/ccxt/ccxt/pull/11657)
- ftx.fetchBorrowRateHistory and ftx.fetchBorrowRateHistories [#11629](https://github.com/ccxt/ccxt/pull/11629)
- Removed excessive whitespaces from error codes [#11668](https://github.com/ccxt/ccxt/pull/11668)
- AAX fetchIndexOHLCV [#11660](https://github.com/ccxt/ccxt/pull/11660)
- AAX fetchPremiumIndexOHLCV [#11666](https://github.com/ccxt/ccxt/pull/11666)
- AAX fetchMarkOHLCV [#11665](https://github.com/ccxt/ccxt/pull/11665)
- hollaex: update ratelimits [#11669](https://github.com/ccxt/ccxt/pull/11669)
- AAX setLeverage [#11661](https://github.com/ccxt/ccxt/pull/11661)
- New exchange - Woo [#11114](https://github.com/ccxt/ccxt/pull/11114)
- hollaex: add safeTrade [#11670](https://github.com/ccxt/ccxt/pull/11670)
- okex3.fetchMarkets unified [#11664](https://github.com/ccxt/ccxt/pull/11664)
- okex.fetchMarkets unified [#11658](https://github.com/ccxt/ccxt/pull/11658)
- oceanex.fetchMarkets sorted [#11672](https://github.com/ccxt/ccxt/pull/11672)
- kucoinfutures.fetchMarkets unified [#11686](https://github.com/ccxt/ccxt/pull/11686)
- Luno markets [#11681](https://github.com/ccxt/ccxt/pull/11681)
- Lykke.fetchMarkets unified [#11680](https://github.com/ccxt/ccxt/pull/11680)
- Mercado.fetchMarkets unified. Has leverage methods. [#11679](https://github.com/ccxt/ccxt/pull/11679)
- mexc.fetchContractMarkets sort [#11677](https://github.com/ccxt/ccxt/pull/11677)
- Ndax has leverage methods, fetchMarkets sort [#11675](https://github.com/ccxt/ccxt/pull/11675)
- Mexc fetchFundingRate [#11674](https://github.com/ccxt/ccxt/pull/11674)
- Novadax.fetchMarkets sorted, has leverage methods [#11673](https://github.com/ccxt/ccxt/pull/11673)
- Bump cached-path-relative from 1.0.2 to 1.1.0 [#11688](https://github.com/ccxt/ccxt/pull/11688)
- hitbtc3.fetchMarkets sort [#11707](https://github.com/ccxt/ccxt/pull/11707)
- bitget: parse_ticker should pass number to vwap [#11699](https://github.com/ccxt/ccxt/pull/11699)
- Idex markets, has leverage methods [#11704](https://github.com/ccxt/ccxt/pull/11704)
- Mexc fetchMarkOHLCV [#11708](https://github.com/ccxt/ccxt/pull/11708)
- Huobijp markets [#11705](https://github.com/ccxt/ccxt/pull/11705)
- Mexc fetchIndexOHLCV [#11709](https://github.com/ccxt/ccxt/pull/11709)
- independentreserve.has leverage methods [#11703](https://github.com/ccxt/ccxt/pull/11703)
- bitstamp: use string in safeTicker ccxt/ccxt#11379 [#11714](https://github.com/ccxt/ccxt/pull/11714)
- bitso: use string in safeTicker ccxt/ccxt#11379 [#11713](https://github.com/ccxt/ccxt/pull/11713)
- bitforex: use string in safeTicker ccxt/ccxt#11379 [#11712](https://github.com/ccxt/ccxt/pull/11712)
- Mexc fetchPremiumIndexOHLCV [#11710](https://github.com/ccxt/ccxt/pull/11710)
- bitstamp1: use string in safeTicker ccxt/ccxt#11379 [#11715](https://github.com/ccxt/ccxt/pull/11715)
- Indodax markets unfied [#11702](https://github.com/ccxt/ccxt/pull/11702)
- Latoken markets [#11701](https://github.com/ccxt/ccxt/pull/11701)


## 1.69.1

- oceanex markets [#11438](https://github.com/ccxt/ccxt/pull/11438)
- Kraken markets has [#11585](https://github.com/ccxt/ccxt/pull/11585)
- probit markets [#11439](https://github.com/ccxt/ccxt/pull/11439)
- wazirx markets [#11440](https://github.com/ccxt/ccxt/pull/11440)
- timex markets [#11441](https://github.com/ccxt/ccxt/pull/11441)
- upbit markets [#11442](https://github.com/ccxt/ccxt/pull/11442)
- the rock markets [#11443](https://github.com/ccxt/ccxt/pull/11443)
- ripio markets [#11444](https://github.com/ccxt/ccxt/pull/11444)
- Okex fetchBalance : handleMarketTypeAndParams [#11445](https://github.com/ccxt/ccxt/pull/11445)
- bitmart: use string in safeTicker ccxt/ccxt#11379 [#11448](https://github.com/ccxt/ccxt/pull/11448)
- bitget: use string in safeTicker ccxt/ccxt#11379 [#11449](https://github.com/ccxt/ccxt/pull/11449)
- bitpanda: use string in safeTicker ccxt/ccxt#11379 [#11453](https://github.com/ccxt/ccxt/pull/11453)
- probit GM -> GM Holding [#11592](https://github.com/ccxt/ccxt/pull/11592)
- crex24 GM -> GM Holding [#11593](https://github.com/ccxt/ccxt/pull/11593)
- currencycom GM -> General Motors Co [#11594](https://github.com/ccxt/ccxt/pull/11594)
- bitmart $GM -> GOLDMINER [#11595](https://github.com/ccxt/ccxt/pull/11595)
- bitmex: use string in safeTicker ccxt/ccxt#11379 [#11451](https://github.com/ccxt/ccxt/pull/11451)
- bitvavo: use string in safeTicker ccxt/ccxt#11379 [#11454](https://github.com/ccxt/ccxt/pull/11454)
- fix ticker.bid in Exchange#safeTicker [#11599](https://github.com/ccxt/ccxt/pull/11599)
- CryptoCom: added auth error [#11603](https://github.com/ccxt/ccxt/pull/11603)
- yobit BAN -> BANcoin [#11596](https://github.com/ccxt/ccxt/pull/11596)
- Huobi ::  Spot stop limit orders (buy and sell) example [#11602](https://github.com/ccxt/ccxt/pull/11602)
- bittrex: use string in safeTicker ccxt/ccxt#11379 [#11456](https://github.com/ccxt/ccxt/pull/11456)
- bytetrade: use string in safeTicker ccxt/ccxt#11379 [#11457](https://github.com/ccxt/ccxt/pull/11457)
- btcturk: use string in safeTicker ccxt/ccxt#11379 [#11459](https://github.com/ccxt/ccxt/pull/11459)
- btcmarkets: use string in safeTicker ccxt/ccxt#11379 [#11460](https://github.com/ccxt/ccxt/pull/11460)
- blockchaincom: use string in safeTicker ccxt/ccxt#11379 [#11464](https://github.com/ccxt/ccxt/pull/11464)
- btcbox: use string in safeTicker ccxt/ccxt#11379 [#11461](https://github.com/ccxt/ccxt/pull/11461)
- currencycom: use string in safeTicker ccxt/ccxt#11379 [#11466](https://github.com/ccxt/ccxt/pull/11466)
- coinfalcon: use string in safeTicker ccxt/ccxt#11379 [#11468](https://github.com/ccxt/ccxt/pull/11468)
- coinbasepro: use string in safeTicker ccxt/ccxt#11379 [#11470](https://github.com/ccxt/ccxt/pull/11470)
- coinbase: use string in safeTicker ccxt/ccxt#11379 [#11471](https://github.com/ccxt/ccxt/pull/11471)
- cdax: use string in safeTicker ccxt/ccxt#11379 [#11473](https://github.com/ccxt/ccxt/pull/11473)
- digifinex: use string in safeTicker ccxt/ccxt#11379 [#11478](https://github.com/ccxt/ccxt/pull/11478)
- zaif.fetchMarkets unified [#11487](https://github.com/ccxt/ccxt/pull/11487)
- Bitmart fetchBalance : handleMarketTypeAndParams [#11483](https://github.com/ccxt/ccxt/pull/11483)
- Yobit fetchMarkets unified and futures has methods [#11488](https://github.com/ccxt/ccxt/pull/11488)
- AAX fetchOpenOrders : handleMarketTypeAndParams [#11496](https://github.com/ccxt/ccxt/pull/11496)
- Whitebit markets [#11497](https://github.com/ccxt/ccxt/pull/11497)
- AAX fetchOrders : handleMarketTypeAndParams [#11493](https://github.com/ccxt/ccxt/pull/11493)
- xena.fetchMarkets unified [#11494](https://github.com/ccxt/ccxt/pull/11494)
- AAX fetchMyTrades : handleMarketTypeAndParams [#11489](https://github.com/ccxt/ccxt/pull/11489)
- exmo: use string in safeTicker ccxt/ccxt#11379 [#11479](https://github.com/ccxt/ccxt/pull/11479)
- deribit: use string in safeTicker ccxt/ccxt#11379 [#11477](https://github.com/ccxt/ccxt/pull/11477)
- delta: use string in safeTicker ccxt/ccxt#11379 [#11476](https://github.com/ccxt/ccxt/pull/11476)
- xena.has swap and future [#11608](https://github.com/ccxt/ccxt/pull/11608)
- cryptocom: use string in safeTicker ccxt/ccxt#11379 [#11475](https://github.com/ccxt/ccxt/pull/11475)
- crex24: use string in safeTicker ccxt/ccxt#11379 [#11474](https://github.com/ccxt/ccxt/pull/11474)
- Btcturk markets ordering, has leverage methods [#11501](https://github.com/ccxt/ccxt/pull/11501)
- Timex markets [#11587](https://github.com/ccxt/ccxt/pull/11587)
- Tidex markets [#11604](https://github.com/ccxt/ccxt/pull/11604)
- zb: use string in safeTicker ccxt/ccxt#11379 [#11564](https://github.com/ccxt/ccxt/pull/11564)
- okex3: use string in safeTicker ccxt/ccxt#11379 [#11560](https://github.com/ccxt/ccxt/pull/11560)
- poloniex: use string in safeTicker ccxt/ccxt#11379 [#11559](https://github.com/ccxt/ccxt/pull/11559)
- ripio: use string in safeTicker ccxt/ccxt#11379 [#11556](https://github.com/ccxt/ccxt/pull/11556)
- stex: use string in safeTicker ccxt/ccxt#11379 [#11555](https://github.com/ccxt/ccxt/pull/11555)
- added new implicit API endpoints [#11609](https://github.com/ccxt/ccxt/pull/11609)
- therock: use string in safeTicker ccxt/ccxt#11379 [#11554](https://github.com/ccxt/ccxt/pull/11554)
- tidebit: use string in safeTicker ccxt/ccxt#11379 [#11553](https://github.com/ccxt/ccxt/pull/11553)
- tidex: use string in safeTicker ccxt/ccxt#11379 [#11552](https://github.com/ccxt/ccxt/pull/11552)
- timex: use string in safeTicker ccxt/ccxt#11379 [#11551](https://github.com/ccxt/ccxt/pull/11551)
- OKEX - Implicit API for broker endpoints [#11612](https://github.com/ccxt/ccxt/pull/11612)
- upbit: use string in safeTicker ccxt/ccxt#11379 [#11550](https://github.com/ccxt/ccxt/pull/11550)
- vcc: use string in safeTicker ccxt/ccxt#11379 [#11549](https://github.com/ccxt/ccxt/pull/11549)
- wazirx: use string in safeTicker ccxt/ccxt#11379 [#11547](https://github.com/ccxt/ccxt/pull/11547)
- xena: use string in safeTicker ccxt/ccxt#11379 [#11546](https://github.com/ccxt/ccxt/pull/11546)
- idex: use string in safeTicker ccxt/ccxt#11379 [#11541](https://github.com/ccxt/ccxt/pull/11541)
- kucoin: use string in safeTicker ccxt/ccxt#11379 [#11539](https://github.com/ccxt/ccxt/pull/11539)
- lykke: use string in safeTicker ccxt/ccxt#11379 [#11538](https://github.com/ccxt/ccxt/pull/11538)
- mexc: use string in safeTicker ccxt/ccxt#11379 [#11537](https://github.com/ccxt/ccxt/pull/11537)
- kucoinfutures: use string in safeTicker ccxt/ccxt#11379 [#11536](https://github.com/ccxt/ccxt/pull/11536)
- kuna: use string in safeTicker ccxt/ccxt#11379 [#11535](https://github.com/ccxt/ccxt/pull/11535)
- latoken: use string in safeTicker ccxt/ccxt#11379 [#11534](https://github.com/ccxt/ccxt/pull/11534)
- latoken1: use string in safeTicker ccxt/ccxt#11379 [#11533](https://github.com/ccxt/ccxt/pull/11533)
- lbank: use string in safeTicker ccxt/ccxt#11379 [#11532](https://github.com/ccxt/ccxt/pull/11532)
- liquid: use string in safeTicker ccxt/ccxt#11379 [#11531](https://github.com/ccxt/ccxt/pull/11531)
- luno: use string in safeTicker ccxt/ccxt#11379 [#11530](https://github.com/ccxt/ccxt/pull/11530)
- huobijp: use string in safeTicker ccxt/ccxt#11379 [#11528](https://github.com/ccxt/ccxt/pull/11528)
- huobi: use string in safeTicker ccxt/ccxt#11379 [#11527](https://github.com/ccxt/ccxt/pull/11527)
- ftx: use string in safeTicker ccxt/ccxt#11379 [#11526](https://github.com/ccxt/ccxt/pull/11526)
- gemini: use string in safeTicker ccxt/ccxt#11379 [#11524](https://github.com/ccxt/ccxt/pull/11524)
- hitbtc: use string in safeTicker ccxt/ccxt#11379 [#11523](https://github.com/ccxt/ccxt/pull/11523)
- hitbtc3: use string in safeTicker ccxt/ccxt#11379 [#11522](https://github.com/ccxt/ccxt/pull/11522)
- hollaex: use string in safeTicker ccxt/ccxt#11379 [#11521](https://github.com/ccxt/ccxt/pull/11521)
- Bitget fetchClosedOrders : handleMarketTypeAndParams [#11518](https://github.com/ccxt/ccxt/pull/11518)
- Bitget fetchOpenOrders : handleMarketTypeAndParams [#11517](https://github.com/ccxt/ccxt/pull/11517)
- Bitmart fetchOrdersByStatus : handleMarketTypeAndParams [#11516](https://github.com/ccxt/ccxt/pull/11516)
- Bitmart fetchOrder : handleMarketTypeAndParams [#11515](https://github.com/ccxt/ccxt/pull/11515)
- Bitmart fetchOrderTrades : handleMarketTypeAndParams [#11514](https://github.com/ccxt/ccxt/pull/11514)
- Bitmart fetchMyTrades : handleMarketTypeAndParams [#11513](https://github.com/ccxt/ccxt/pull/11513)
- mexc withdraw fixes [#11611](https://github.com/ccxt/ccxt/pull/11611)
- fix php safeTicker bug [#11617](https://github.com/ccxt/ccxt/pull/11617)
- independentreserve: use string in safeTicker ccxt/ccxt#11379 [#11542](https://github.com/ccxt/ccxt/pull/11542)
- Mexc fetchBalance : adjust handleMarketTypeAndParams [#11512](https://github.com/ccxt/ccxt/pull/11512)
- Mexc fetchTickers : handleMarketTypeAndParams [#11510](https://github.com/ccxt/ccxt/pull/11510)
- Mexc fetchTime : handleMarketTypeAndParams [#11508](https://github.com/ccxt/ccxt/pull/11508)
- Bybit fetchMyTrades : handleMarketTypeAndParams [#11507](https://github.com/ccxt/ccxt/pull/11507)
- Bitmart fetchTickers : handleMarketTypeAndParams [#11506](https://github.com/ccxt/ccxt/pull/11506)
- Bitget fetchBalance : handleMarketTypeAndParams [#11505](https://github.com/ccxt/ccxt/pull/11505)
- Ascendex fetchBalance : handleMarketTypeAndParams [#11504](https://github.com/ccxt/ccxt/pull/11504)


## 1.68.1

- blockchaincom.fetchMarkets unified [#11388](https://github.com/ccxt/ccxt/pull/11388)
- aax safeTicker [#11377](https://github.com/ccxt/ccxt/pull/11377)
- bit2c: use string in safeTicker ccxt/ccxt#11379 [#11400](https://github.com/ccxt/ccxt/pull/11400)
- bitbank: use string in safeTicker ccxt/ccxt#11379 [#11401](https://github.com/ccxt/ccxt/pull/11401)
- bitfinex: use string in safeTicker ccxt/ccxt#11379 [#11403](https://github.com/ccxt/ccxt/pull/11403)
- bitfinex2: use string in safeTicker ccxt/ccxt#11379 [#11404](https://github.com/ccxt/ccxt/pull/11404)
- paymium has futures methods [#11408](https://github.com/ccxt/ccxt/pull/11408)
- Huobi :: derivatives examples and cancelOrder fix [#11409](https://github.com/ccxt/ccxt/pull/11409)
- bitflyer: use string in safeTicker ccxt/ccxt#11379 [#11405](https://github.com/ccxt/ccxt/pull/11405)
- Bybit fetchMyTrades : handleMarketTypeAndParams [#11410](https://github.com/ccxt/ccxt/pull/11410)
- Bitfinex2 add safeTrade [#11394](https://github.com/ccxt/ccxt/pull/11394)
- Bybit fetchOrders : handleMarketTypeAndParams [#11411](https://github.com/ccxt/ccxt/pull/11411)
- bitpanda has leverage methods, reorder fetchMarkets [#11413](https://github.com/ccxt/ccxt/pull/11413)
- btcalpha fetchMarkets unified and has leverage methods [#11414](https://github.com/ccxt/ccxt/pull/11414)
- btcbox.has futures methods [#11415](https://github.com/ccxt/ccxt/pull/11415)
- typo [#11481](https://github.com/ccxt/ccxt/pull/11481)
- fundingRate, previousFundingRate and nextFundingRate naming fix #11298 [#11368](https://github.com/ccxt/ccxt/pull/11368)
- phemex error mapping [#11480](https://github.com/ccxt/ccxt/pull/11480)
- rewording a sentence [#11482](https://github.com/ccxt/ccxt/pull/11482)
- btcmarkets.fetchMarkets unified, has leverage methods [#11417](https://github.com/ccxt/ccxt/pull/11417)
- exchange-capabilities, colors, windows, spot and option at front [#11416](https://github.com/ccxt/ccxt/pull/11416)
- btctradeua.has leverage methods [#11418](https://github.com/ccxt/ccxt/pull/11418)
- Bitmart fetchTickers : handleMarketTypeAndParams [#11419](https://github.com/ccxt/ccxt/pull/11419)
- btcturk markets [#11420](https://github.com/ccxt/ccxt/pull/11420)
- bitfinex markets [#11422](https://github.com/ccxt/ccxt/pull/11422)
- ftx.fetchMarkets swap value fix [#11484](https://github.com/ccxt/ccxt/pull/11484)
- yobit BAB -> Babel [#11486](https://github.com/ccxt/ccxt/pull/11486)
- mexc DFI -> DfiStarter [#11490](https://github.com/ccxt/ccxt/pull/11490)
- Huobi :: examples improvement and fixes [#11495](https://github.com/ccxt/ccxt/pull/11495)
- Bibox markets [#11423](https://github.com/ccxt/ccxt/pull/11423)
- cdax markets [#11424](https://github.com/ccxt/ccxt/pull/11424)
- Added more timeframes to Hollaex exchange class [#11447](https://github.com/ccxt/ccxt/pull/11447)
- coinbase markets [#11425](https://github.com/ccxt/ccxt/pull/11425)
- bw markets [#11426](https://github.com/ccxt/ccxt/pull/11426)
- coinbasepro markets [#11427](https://github.com/ccxt/ccxt/pull/11427)
- Update crex24.js [#11491](https://github.com/ccxt/ccxt/pull/11491)
- bithumb: use string in safeTicker ccxt/ccxt#11379 [#11450](https://github.com/ccxt/ccxt/pull/11450)
- latoken GDX, WAR, IMC mapping [#11492](https://github.com/ccxt/ccxt/pull/11492)
- cancelOrders type fix [#11520](https://github.com/ccxt/ccxt/pull/11520)
- gateio: use string in safeTicker ccxt/ccxt#11379 [#11525](https://github.com/ccxt/ccxt/pull/11525)
- kraken markets [#11435](https://github.com/ccxt/ccxt/pull/11435)
- bitrue: use string in safeTicker ccxt/ccxt#11379 [#11452](https://github.com/ccxt/ccxt/pull/11452)
- cex markets [#11428](https://github.com/ccxt/ccxt/pull/11428)
- exmo markets [#11431](https://github.com/ccxt/ccxt/pull/11431)
- ftx STARS -> StarLaunch [#11566](https://github.com/ccxt/ccxt/pull/11566)
- blockchaincom markets [#11430](https://github.com/ccxt/ccxt/pull/11430)
- blockchaincom: fix fetchBalance bug [#11573](https://github.com/ccxt/ccxt/pull/11573)
- blockchaincom: rename safeOrder2 [#11577](https://github.com/ccxt/ccxt/pull/11577)
- Huobi :: several fixes [#11581](https://github.com/ccxt/ccxt/pull/11581)
- bitfinex update-ratelimits [#11565](https://github.com/ccxt/ccxt/pull/11565)
- yobit PURE -> PurePOS [#11567](https://github.com/ccxt/ccxt/pull/11567)
- latoken CBT, FREN, UNO, GEM, BUX, DMD mapping [#11569](https://github.com/ccxt/ccxt/pull/11569)
- binance.parsePositions contractSize key error fix [#11582](https://github.com/ccxt/ccxt/pull/11582)
- bibox STAR -> Starbase [#11570](https://github.com/ccxt/ccxt/pull/11570)
- bigone FREE -> FreeRossDAO [#11571](https://github.com/ccxt/ccxt/pull/11571)
- okex fetchMarkets linear/inverse undefined for spot [#11583](https://github.com/ccxt/ccxt/pull/11583)
- digifinex FREE -> FreeRossDAO [#11572](https://github.com/ccxt/ccxt/pull/11572)
- Zonda unified fetchMarkets [#11485](https://github.com/ccxt/ccxt/pull/11485)
- cryptocom markets [#11432](https://github.com/ccxt/ccxt/pull/11432)
- indodax markets [#11434](https://github.com/ccxt/ccxt/pull/11434)
- novadax markets [#11436](https://github.com/ccxt/ccxt/pull/11436)
- luno markets [#11437](https://github.com/ccxt/ccxt/pull/11437)


## 1.67.1

- IDEX update ratelimits [#11308](https://github.com/ccxt/ccxt/pull/11308)
- zb: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11284](https://github.com/ccxt/ccxt/pull/11284)
- Kucoin: added error "The interface has been deprecated" [#11307](https://github.com/ccxt/ccxt/pull/11307)
- huobijp: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11267](https://github.com/ccxt/ccxt/pull/11267)
- stex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11273](https://github.com/ccxt/ccxt/pull/11273)
- Kraken safeTicker [#11252](https://github.com/ccxt/ccxt/pull/11252)
- Coinex safeTicker [#11249](https://github.com/ccxt/ccxt/pull/11249)
- xena: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11283](https://github.com/ccxt/ccxt/pull/11283)
- ndax: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11281](https://github.com/ccxt/ccxt/pull/11281)
- phemex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11278](https://github.com/ccxt/ccxt/pull/11278)
- poloniex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11277](https://github.com/ccxt/ccxt/pull/11277)
- ripio: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11274](https://github.com/ccxt/ccxt/pull/11274)
- okex errors remapping [#11320](https://github.com/ccxt/ccxt/pull/11320)
- probit EGC -> EcoG9coin [#11321](https://github.com/ccxt/ccxt/pull/11321)
- mexc EGC -> Egoras Credit [#11322](https://github.com/ccxt/ccxt/pull/11322)
- yobit EGC -> EverGreenCoin [#11323](https://github.com/ccxt/ccxt/pull/11323)
- qtrade: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11275](https://github.com/ccxt/ccxt/pull/11275)
- hitbtc3: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11258](https://github.com/ccxt/ccxt/pull/11258)
- huobi: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11259](https://github.com/ccxt/ccxt/pull/11259)
- liquid: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11261](https://github.com/ccxt/ccxt/pull/11261)
- Bitmart safeTicker [#11247](https://github.com/ccxt/ccxt/pull/11247)
- timex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11271](https://github.com/ccxt/ccxt/pull/11271)
- vcc: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11270](https://github.com/ccxt/ccxt/pull/11270)
- latoken CTC -> CyberTronchain [#11324](https://github.com/ccxt/ccxt/pull/11324)
- Hollaex :: add safeTicker [#11286](https://github.com/ccxt/ccxt/pull/11286)
- okex3: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11279](https://github.com/ccxt/ccxt/pull/11279)
- Ripio :: add safeTicker [#11319](https://github.com/ccxt/ccxt/pull/11319)
- Phemex :: add safeTicker [#11317](https://github.com/ccxt/ccxt/pull/11317)
- Okex3 :: add safeTicker [#11316](https://github.com/ccxt/ccxt/pull/11316)
- Okex :: add safeTicker [#11315](https://github.com/ccxt/ccxt/pull/11315)
- okex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11313](https://github.com/ccxt/ccxt/pull/11313)
- Bitbank fetchMarkets unified response [#11304](https://github.com/ccxt/ccxt/pull/11304)
- Mexc fetchTickers : handleMarketTypeAndParams [#11327](https://github.com/ccxt/ccxt/pull/11327)
- Oceanex :: add safeTicker [#11295](https://github.com/ccxt/ccxt/pull/11295)
- bw: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11202](https://github.com/ccxt/ccxt/pull/11202)
- Idex safe trade [#11311](https://github.com/ccxt/ccxt/pull/11311)
- Latoken1 :: add safeTicker [#11290](https://github.com/ccxt/ccxt/pull/11290)
- add type hinting for variants of create_order [#11329](https://github.com/ccxt/ccxt/pull/11329)
- Kucoin type uni [#11299](https://github.com/ccxt/ccxt/pull/11299)
- Kuna :: add safeTicker [#11289](https://github.com/ccxt/ccxt/pull/11289)
- hollaex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11260](https://github.com/ccxt/ccxt/pull/11260)
- Buda safeTicker [#11248](https://github.com/ccxt/ccxt/pull/11248)
- binance error mapping [#11332](https://github.com/ccxt/ccxt/pull/11332)
- ascendex PLN mapping [#11334](https://github.com/ccxt/ccxt/pull/11334)
- Idex safeTicker [#11312](https://github.com/ccxt/ccxt/pull/11312)
- add missing Gate.io error [#11335](https://github.com/ccxt/ccxt/pull/11335)
- Binance:new endpoint for mining payments [#11342](https://github.com/ccxt/ccxt/pull/11342)
- Binance: new bswap endpoints [#11343](https://github.com/ccxt/ccxt/pull/11343)
- bittrex fetchMarkets unified structure [#11302](https://github.com/ccxt/ccxt/pull/11302)
- KuCoin broad exceptions [#11340](https://github.com/ccxt/ccxt/pull/11340)
- exmo: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11216](https://github.com/ccxt/ccxt/pull/11216)
- reflink readd [#11348](https://github.com/ccxt/ccxt/pull/11348)
- Mexc fetchTime : handleMarketTypeAndParams [#11349](https://github.com/ccxt/ccxt/pull/11349)
- Independentreserve :: add safeTicker [#11288](https://github.com/ccxt/ccxt/pull/11288)
- Lbank :: add safeTicker [#11291](https://github.com/ccxt/ccxt/pull/11291)
- mexc add safeTrade [#11336](https://github.com/ccxt/ccxt/pull/11336)
- Bitbns fetchMarkets unified [#11310](https://github.com/ccxt/ccxt/pull/11310)
- Mexc fetchBalance : handleMarketTypeAndParams [#11350](https://github.com/ccxt/ccxt/pull/11350)
- Phemex fetchMarkets unified structure [#11338](https://github.com/ccxt/ccxt/pull/11338)
- Ndax :: add safeTicker [#11294](https://github.com/ccxt/ccxt/pull/11294)
- Ndax fetchMarkets unified response [#11303](https://github.com/ccxt/ccxt/pull/11303)
- eqonex.fetchMarkets unified structure [#11339](https://github.com/ccxt/ccxt/pull/11339)
- removed transferOut from has [#11337](https://github.com/ccxt/ccxt/pull/11337)
- Rename bitcoin.com to FMFW.io [#11256](https://github.com/ccxt/ccxt/pull/11256)
- Deribit fetchPositions / parsePositions [#11221](https://github.com/ccxt/ccxt/pull/11221)
- Luno :: add safeTicker [#11292](https://github.com/ccxt/ccxt/pull/11292)
- Lykke :: add safeTicker [#11293](https://github.com/ccxt/ccxt/pull/11293)


## 1.66.1

- Added has[swap] true to ascendex, ftx, kucoinfutures, mexc [#11156](https://github.com/ccxt/ccxt/pull/11156)
- Added exchange methods to transpile [#11158](https://github.com/ccxt/ccxt/pull/11158)
- precisionMode examples [#11135](https://github.com/ccxt/ccxt/pull/11135)
- Contract size number [#11154](https://github.com/ccxt/ccxt/pull/11154)
- Phemex parsePosition [#11164](https://github.com/ccxt/ccxt/pull/11164)
- loadTimeDifference moved to base.exchange [#11125](https://github.com/ccxt/ccxt/pull/11125)
- mexc type unification [#11165](https://github.com/ccxt/ccxt/pull/11165)
- idex type unification [#11166](https://github.com/ccxt/ccxt/pull/11166)
- bitget type unification [#11167](https://github.com/ccxt/ccxt/pull/11167)
- bitfinex type unification [#11168](https://github.com/ccxt/ccxt/pull/11168)
- Deribit parsePosition and safeTicker [#11173](https://github.com/ccxt/ccxt/pull/11173)
- Added fetch-funding-rate-history-example [#11171](https://github.com/ccxt/ccxt/pull/11171)
- Deribit Historical Volatility [#11152](https://github.com/ccxt/ccxt/pull/11152)
- test.fetchFundingRateHistory [#11170](https://github.com/ccxt/ccxt/pull/11170)
- Add fetchDeposits to AAX exchange [#11172](https://github.com/ccxt/ccxt/pull/11172)
- Apply array-bracket-spacing lint rule for exchange classes [#11174](https://github.com/ccxt/ccxt/pull/11174)
- implement getNetwork [#11133](https://github.com/ccxt/ccxt/pull/11133)
- AAX fetchwidrawals, remove duplicate line in bitget [#11180](https://github.com/ccxt/ccxt/pull/11180)
- aax: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11184](https://github.com/ccxt/ccxt/pull/11184)
- ascendex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11185](https://github.com/ccxt/ccxt/pull/11185)
- bibox: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11189](https://github.com/ccxt/ccxt/pull/11189)
- bitmart: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11190](https://github.com/ccxt/ccxt/pull/11190)
- cryptocom fixbug [#11197](https://github.com/ccxt/ccxt/pull/11197)
- Added support for AMP to Bitstamp [#11196](https://github.com/ccxt/ccxt/pull/11196)
- binance: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11191](https://github.com/ccxt/ccxt/pull/11191)
- bitpanda: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11192](https://github.com/ccxt/ccxt/pull/11192)
- bitrue: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11193](https://github.com/ccxt/ccxt/pull/11193)
- Ftx update ratelimiter [#11198](https://github.com/ccxt/ccxt/pull/11198)
- bittrex: update deposit/withdraw flags ccxt/ccxt#11107 [#11194](https://github.com/ccxt/ccxt/pull/11194)
- bitfinex2: update deposit/withdraw flags ccxt/ccxt#11107 [#11195](https://github.com/ccxt/ccxt/pull/11195)
- bitget: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11199](https://github.com/ccxt/ccxt/pull/11199)
- bitvavo: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11200](https://github.com/ccxt/ccxt/pull/11200)
- buda: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11201](https://github.com/ccxt/ccxt/pull/11201)
- bitstamp: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11206](https://github.com/ccxt/ccxt/pull/11206)
- cex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11203](https://github.com/ccxt/ccxt/pull/11203)
- coinbase: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11204](https://github.com/ccxt/ccxt/pull/11204)
- coinbasepro: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11205](https://github.com/ccxt/ccxt/pull/11205)
- cdax: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11208](https://github.com/ccxt/ccxt/pull/11208)
- hitbtc: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11211](https://github.com/ccxt/ccxt/pull/11211)
- ftx: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11213](https://github.com/ccxt/ccxt/pull/11213)
- delta: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11215](https://github.com/ccxt/ccxt/pull/11215)
- Gate.io add safeTrade [#11209](https://github.com/ccxt/ccxt/pull/11209)
- Gateio handleMarketTypeAndParams [#11219](https://github.com/ccxt/ccxt/pull/11219)
- digifinex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11214](https://github.com/ccxt/ccxt/pull/11214)
- eqonex: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11217](https://github.com/ccxt/ccxt/pull/11217)
- crex24: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11218](https://github.com/ccxt/ccxt/pull/11218)
- bytetrade: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11207](https://github.com/ccxt/ccxt/pull/11207)
- Exchange :: Wazirx :: implementation [#11137](https://github.com/ccxt/ccxt/pull/11137)
- gateio: add deposit/withdraw flag in currencies ccxt/ccxt#11107 [#11212](https://github.com/ccxt/ccxt/pull/11212)


## 1.65.1

- Fix Phemex-positions and clean examples [#11042](https://github.com/ccxt/ccxt/pull/11042)
- yobit SMC -> SmartCoin [#11044](https://github.com/ccxt/ccxt/pull/11044)
- kucoinfutures fetchPositions [#11049](https://github.com/ccxt/ccxt/pull/11049)
- Binance: add error 'Verification failed' [#11052](https://github.com/ccxt/ccxt/pull/11052)
- Phemex :: add setLeverage and example [#11050](https://github.com/ccxt/ccxt/pull/11050)
- Phemex: Add trailing order example [#11053](https://github.com/ccxt/ccxt/pull/11053)
- Phemex :: TakeProfit and StopLoss support when creating orders [#11046](https://github.com/ccxt/ccxt/pull/11046)
- Currencycom markets [#10971](https://github.com/ccxt/ccxt/pull/10971)
- kucoinfutures add average to order info [#11056](https://github.com/ccxt/ccxt/pull/11056)
- gateio parsePosition fixup [#11058](https://github.com/ccxt/ccxt/pull/11058)
- Move parseBalance logic [#11064](https://github.com/ccxt/ccxt/pull/11064)
- Coinspot :: Add missing markets and small sign fix [#11066](https://github.com/ccxt/ccxt/pull/11066)
- fix python bug  [#11072](https://github.com/ccxt/ccxt/pull/11072)
- ability for fetchCurrencies like in original [#11071](https://github.com/ccxt/ccxt/pull/11071)
- Ascendex createOrder() Perpetual Swaps [#11073](https://github.com/ccxt/ccxt/pull/11073)
- parseBalance edits [#11070](https://github.com/ccxt/ccxt/pull/11070)
- bytetrade remove toWei [#11076](https://github.com/ccxt/ccxt/pull/11076)
- huobi postOnly limit-maker [#11077](https://github.com/ccxt/ccxt/pull/11077)
- Added error codes [#11068](https://github.com/ccxt/ccxt/pull/11068)
- Bitmex ::  Add cancelOrders, fix cancelOrder and example [#11081](https://github.com/ccxt/ccxt/pull/11081)
- Remove colors [#11082](https://github.com/ccxt/ccxt/pull/11082)
- utf8 encoding support for keys.json [#11084](https://github.com/ccxt/ccxt/pull/11084)
- implement cryptocom [#11011](https://github.com/ccxt/ccxt/pull/11011)
- add support to crypto.com exchange [#9610](https://github.com/ccxt/ccxt/pull/9610)
- mexc postOnly spot [#11085](https://github.com/ccxt/ccxt/pull/11085)
- mexc swap postOnly [#11087](https://github.com/ccxt/ccxt/pull/11087)
- Added gateio options endpoints [#11086](https://github.com/ccxt/ccxt/pull/11086)
- Add fetchAssetValuation for okex [#11090](https://github.com/ccxt/ccxt/pull/11090)
- aax.fetchFundingRateHistory [#11089](https://github.com/ccxt/ccxt/pull/11089)
- Binance :: Fix fetchStatus permission [#11091](https://github.com/ccxt/ccxt/pull/11091)
- aax.fetchTime [#11095](https://github.com/ccxt/ccxt/pull/11095)
- aax.fetchFundingRate [#11094](https://github.com/ccxt/ccxt/pull/11094)
- Hitbtc3 fetchFundingRateHistory [#11088](https://github.com/ccxt/ccxt/pull/11088)
- aax.fetchFundingHistory [#11093](https://github.com/ccxt/ccxt/pull/11093)
- cryptocom add futures api [#11092](https://github.com/ccxt/ccxt/pull/11092)
- cryptocom style edits [#11097](https://github.com/ccxt/ccxt/pull/11097)
- remove deprecated futures property derivative [#11098](https://github.com/ccxt/ccxt/pull/11098)


## 1.64.1

- removed manually calculated previousFundingRate timestamps from fetchFundingRate [#10968](https://github.com/ccxt/ccxt/pull/10968)
- Gateio markets, futures -> future [#10970](https://github.com/ccxt/ccxt/pull/10970)
- Huobi withdraw address [#10967](https://github.com/ccxt/ccxt/pull/10967)
- php unescaped slashes [#10974](https://github.com/ccxt/ccxt/pull/10974)
- mercado safeOrder2 [#10979](https://github.com/ccxt/ccxt/pull/10979)
- btcbox safeOrder2 [#10978](https://github.com/ccxt/ccxt/pull/10978)
- qtrade safeOrder2 [#10976](https://github.com/ccxt/ccxt/pull/10976)
- bithumb safeOrder2 [#10977](https://github.com/ccxt/ccxt/pull/10977)
- kraken safeOrder [#10975](https://github.com/ccxt/ccxt/pull/10975)
- Ascendex fetchFundingRate() [#10965](https://github.com/ccxt/ccxt/pull/10965)
- removed instructions to an obsolete script of git ignore files [#10985](https://github.com/ccxt/ccxt/pull/10985)
- CLI :: Feature :: Allow authentication using environment variables  [#10981](https://github.com/ccxt/ccxt/pull/10981)
- ndax safeOrder2 [#10989](https://github.com/ccxt/ccxt/pull/10989)
- crex24 safeOrder2 [#10990](https://github.com/ccxt/ccxt/pull/10990)
- wavesexchange.fetchMarkets matches unified structure, added response output [#10992](https://github.com/ccxt/ccxt/pull/10992)
- currencycom safeOrder2 [#10988](https://github.com/ccxt/ccxt/pull/10988)
- Idex.fetchMarkets matches unified structure [#10991](https://github.com/ccxt/ccxt/pull/10991)
- zb.fetchMarkets unified structure [#10993](https://github.com/ccxt/ccxt/pull/10993)
- Whitebit private API: Error handling and minor fixes [#10964](https://github.com/ccxt/ccxt/pull/10964)
- Bitvavo.fetchMarkets properties match unified structure [#10958](https://github.com/ccxt/ccxt/pull/10958)
- timex safeOrder2 [#10998](https://github.com/ccxt/ccxt/pull/10998)
- Binance: added rebate/taxQuery endpoint [#11002](https://github.com/ccxt/ccxt/pull/11002)
- Idex fix createOrder [#11003](https://github.com/ccxt/ccxt/pull/11003)
- Bistamp safeOrder2 [#10956](https://github.com/ccxt/ccxt/pull/10956)
- Bitmart markets [#10957](https://github.com/ccxt/ccxt/pull/10957)
- Ascendex fetchClosedOrders() Swap Functionality [#10995](https://github.com/ccxt/ccxt/pull/10995)
- Move balance parse logic into parseBalance [#10980](https://github.com/ccxt/ccxt/pull/10980)
- remove safeBalance legacy flag [#11009](https://github.com/ccxt/ccxt/pull/11009)
- hitbtc2 safeOrder2 [#11015](https://github.com/ccxt/ccxt/pull/11015)
- ascendex parse network [#11013](https://github.com/ccxt/ccxt/pull/11013)
- Ascendex fetchOpenOrders() added functionality for swaps [#10994](https://github.com/ccxt/ccxt/pull/10994)
- poloniex safeOrder2-2 [#11014](https://github.com/ccxt/ccxt/pull/11014)
- Ascendex cancelAllOrders() Swap Functionality [#10997](https://github.com/ccxt/ccxt/pull/10997)


## 1.63.1

- bitmart error handling [#10841](https://github.com/ccxt/ccxt/pull/10841)
- bitmart FOX -> Fox Finance [#10842](https://github.com/ccxt/ccxt/pull/10842)
- coinex add safeValue to fetchMarginBalance [#10847](https://github.com/ccxt/ccxt/pull/10847)
- currencycom FOX -> Fox Corporation [#10843](https://github.com/ccxt/ccxt/pull/10843)
- Crex24 safe trade [#10840](https://github.com/ccxt/ccxt/pull/10840)
- hitbtc XMT -> MTL [#10844](https://github.com/ccxt/ccxt/pull/10844)
- bitmart fetchSpotMarkets precisions [#10848](https://github.com/ccxt/ccxt/pull/10848)
- yobit XMT -> SummitCoin [#10845](https://github.com/ccxt/ccxt/pull/10845)
-  description change about 'unavailable' methods. [#10850](https://github.com/ccxt/ccxt/pull/10850)
- datacenter sentence [#10851](https://github.com/ccxt/ccxt/pull/10851)
- Replacing verbal repeating of numerical examples [#10856](https://github.com/ccxt/ccxt/pull/10856)
- Change in "currency VS market" description; also about ip-restrictions [#10852](https://github.com/ccxt/ccxt/pull/10852)
- Combining duplicated precision-mode sentences [#10857](https://github.com/ccxt/ccxt/pull/10857)
- Fixed 404 [#10861](https://github.com/ccxt/ccxt/pull/10861)
- Exchange base classes updates for FetchCurrencies = emulated & better capability outputs [#10829](https://github.com/ccxt/ccxt/pull/10829)
- Currency & Markets re-sorting [#10860](https://github.com/ccxt/ccxt/pull/10860)
- Coinbase: fetchTickers & parseTicker methods [#10846](https://github.com/ccxt/ccxt/pull/10846)
- IDEX: fix sandbox URL [#10863](https://github.com/ccxt/ccxt/pull/10863)
- huobi has:fetchBorrowRate, has:fetchBorrowRatesPerSymbol [#10868](https://github.com/ccxt/ccxt/pull/10868)
- question about CCXT pro installation issues [#10866](https://github.com/ccxt/ccxt/pull/10866)
- currencycom add safeTrade [#10869](https://github.com/ccxt/ccxt/pull/10869)
- Bitstamp 'fetchFees' removal [#10872](https://github.com/ccxt/ccxt/pull/10872)
- typo correction of https [#10873](https://github.com/ccxt/ccxt/pull/10873)
- exmo - country change [#10876](https://github.com/ccxt/ccxt/pull/10876)
- Coinbase endpoints - set to false for 'for-sure unexistent' ones [#10882](https://github.com/ccxt/ccxt/pull/10882)
- composer-install [#10888](https://github.com/ccxt/ccxt/pull/10888)
- Incorrect flags fixed for bibox & bw [#10885](https://github.com/ccxt/ccxt/pull/10885)
- Delta safeTrade [#10878](https://github.com/ccxt/ccxt/pull/10878)
- Country code fixes [#10879](https://github.com/ccxt/ccxt/pull/10879)
- phemex minor bugfix [#10887](https://github.com/ccxt/ccxt/pull/10887)
- Mexc fetchFundingRateHistory [#10849](https://github.com/ccxt/ccxt/pull/10849)
- travis-ci changed location [#10895](https://github.com/ccxt/ccxt/pull/10895)
- Digifinex safeTrade [#10898](https://github.com/ccxt/ccxt/pull/10898)
- Removing unused V1 api url [#10899](https://github.com/ccxt/ccxt/pull/10899)
- Reference PR for Exchange-Specific DOCS creation [#10902](https://github.com/ccxt/ccxt/pull/10902)
- mexc.fetchContractMarkets symbols are correct, added market properties [#10906](https://github.com/ccxt/ccxt/pull/10906)
- ftx.com is in BS not HK [#10905](https://github.com/ccxt/ccxt/pull/10905)
- CoinbasePro  - fetchTickers [#10892](https://github.com/ccxt/ccxt/pull/10892)
- Eqonex safeTrade [#10907](https://github.com/ccxt/ccxt/pull/10907)
- More details about 'exchange specific params' [#10903](https://github.com/ccxt/ccxt/pull/10903)
- Has fix [#10877](https://github.com/ccxt/ccxt/pull/10877)
- Exmo safeTrade [#10913](https://github.com/ccxt/ccxt/pull/10913)
- mexc fetchTickers fix #10837 [#10897](https://github.com/ccxt/ccxt/pull/10897)
- Added properties margin, swap, and future to has [#10910](https://github.com/ccxt/ccxt/pull/10910)
- Adding CLI shorthands & capabilities shorthand [#10904](https://github.com/ccxt/ccxt/pull/10904)


## 1.62.1

- phemex safeTrade [#10731](https://github.com/ccxt/ccxt/pull/10731)
- btcbox add safeTrade and examples [#10730](https://github.com/ccxt/ccxt/pull/10730)
- update docs url [#10732](https://github.com/ccxt/ccxt/pull/10732)
- Bitbns safe trade fetchtrades support fix [#10630](https://github.com/ccxt/ccxt/pull/10630)
- mexc public api url [#10743](https://github.com/ccxt/ccxt/pull/10743)
- coincheck AuthenticationError exception handling fix #10734 [#10739](https://github.com/ccxt/ccxt/pull/10739)
- fix: update fetchTickers for Gate.io to prevent python KeyError [#10742](https://github.com/ccxt/ccxt/pull/10742)
- kraken max amount [#10744](https://github.com/ccxt/ccxt/pull/10744)
- bw add safeTrade [#10745](https://github.com/ccxt/ccxt/pull/10745)
- more links to docs.ccxt.com [#10735](https://github.com/ccxt/ccxt/pull/10735)
- add some css edits to docs [#10746](https://github.com/ccxt/ccxt/pull/10746)
- fetchBorrowRate, fetchBorrowRates [#10629](https://github.com/ccxt/ccxt/pull/10629)
- bitmart error mapping [#10752](https://github.com/ccxt/ccxt/pull/10752)
- buda add safeTrade and feeCost to string [#10755](https://github.com/ccxt/ccxt/pull/10755)
- Huobi fetchBorrowRates [#10676](https://github.com/ccxt/ccxt/pull/10676)
- added trigger check to gateio stop order [#10718](https://github.com/ccxt/ccxt/pull/10718)
- fix typo for cancelAllOrders in gateio.has [#10757](https://github.com/ccxt/ccxt/pull/10757)
- cex ohlcv timeframes [#10762](https://github.com/ccxt/ccxt/pull/10762)
- cdax add safeTrade and feeCostString in safeOrder2 [#10764](https://github.com/ccxt/ccxt/pull/10764)
- Fix timeOut  MAX INTEGER issue [#10763](https://github.com/ccxt/ccxt/pull/10763)
- bybit add safeTrade and feeCost to string for safeOrder2 [#10756](https://github.com/ccxt/ccxt/pull/10756)
- idex MATIC network [#10775](https://github.com/ccxt/ccxt/pull/10775)
- cex add safeTrade [#10774](https://github.com/ccxt/ccxt/pull/10774)
- Binance: added P2P order history endpoint [#10770](https://github.com/ccxt/ccxt/pull/10770)
- update api urls [#10773](https://github.com/ccxt/ccxt/pull/10773)
- Added index.html stub for GitHub pages [#10780](https://github.com/ccxt/ccxt/pull/10780)
- Added fetchPositions to gateio [#10383](https://github.com/ccxt/ccxt/pull/10383)
- coinex add cancelAllOrders fix #10738 [#10753](https://github.com/ccxt/ccxt/pull/10753)
- bitmex safeTrade [#10610](https://github.com/ccxt/ccxt/pull/10610)
- CDAX api incorrect amount for buy-market orders fix  [#10772](https://github.com/ccxt/ccxt/pull/10772)


## 1.61.1

- bitflyer safeTrade [#10596](https://github.com/ccxt/ccxt/pull/10596)
- bitmart safeTrade [#10607](https://github.com/ccxt/ccxt/pull/10607)
- bitbns safeTrade [#10594](https://github.com/ccxt/ccxt/pull/10594)
- bitforex safeTrade [#10603](https://github.com/ccxt/ccxt/pull/10603)
- aofex safeTrade [#10583](https://github.com/ccxt/ccxt/pull/10583)
- bigone safeTrade [#10587](https://github.com/ccxt/ccxt/pull/10587)
- ascendex safeTrade [#10584](https://github.com/ccxt/ccxt/pull/10584)
- bitget safeTrade [#10604](https://github.com/ccxt/ccxt/pull/10604)
- bitfinex safeTrade [#10595](https://github.com/ccxt/ccxt/pull/10595)
- bitrue safeTrade [#10612](https://github.com/ccxt/ccxt/pull/10612)
- bithumb safeTrade [#10606](https://github.com/ccxt/ccxt/pull/10606)
- binance coinm fix #10623 [#10624](https://github.com/ccxt/ccxt/pull/10624)
- bit2c safeTrade [#10588](https://github.com/ccxt/ccxt/pull/10588)
- bitbay safeTrade [#10609](https://github.com/ccxt/ccxt/pull/10609)
- FTX: added PnL endpoint [#10626](https://github.com/ccxt/ccxt/pull/10626)
- kucoin error mapping [#10631](https://github.com/ccxt/ccxt/pull/10631)
- Fix typos in CONTRIBUTING.md [#10633](https://github.com/ccxt/ccxt/pull/10633)
- Bump aiohttp version to aiohttp>=3.8 [#10634](https://github.com/ccxt/ccxt/pull/10634)
- add bitfinex parseTrade examples [#10632](https://github.com/ccxt/ccxt/pull/10632)
- binance add support for unified postOnly flag [#10635](https://github.com/ccxt/ccxt/pull/10635)
- Bitstamp - Return withdrawal id as string [#10637](https://github.com/ccxt/ccxt/pull/10637)
- Fix gateio fetch_ticker for linear/delivery type [#10638](https://github.com/ccxt/ccxt/pull/10638)
- latoken1 TRADE -> Smart Trade Coin [#10642](https://github.com/ccxt/ccxt/pull/10642)
- latoken TRADE -> Smart Trade Coin [#10643](https://github.com/ccxt/ccxt/pull/10643)
- poloniex TRADE -> Unitrade [#10644](https://github.com/ccxt/ccxt/pull/10644)
- okex3 TRADE -> Unitrade [#10645](https://github.com/ccxt/ccxt/pull/10645)
- latoken createOrder, cancelOrder true [#10648](https://github.com/ccxt/ccxt/pull/10648)
- okex TRADE -> Unitrade [#10646](https://github.com/ccxt/ccxt/pull/10646)
- add example responses [#10647](https://github.com/ccxt/ccxt/pull/10647)
- Gateio stoploss  [#10489](https://github.com/ccxt/ccxt/pull/10489)
- Added argumentsrequired for gateio limit orders without price [#10649](https://github.com/ccxt/ccxt/pull/10649)
- bitfinex1 postOnly [#10651](https://github.com/ccxt/ccxt/pull/10651)
- bitfinex2 postOnly [#10652](https://github.com/ccxt/ccxt/pull/10652)
- coinbasepro postOnly [#10653](https://github.com/ccxt/ccxt/pull/10653)
- relist btcalpha [#10655](https://github.com/ccxt/ccxt/pull/10655)
- latoken fetchTrades fix [#10657](https://github.com/ccxt/ccxt/pull/10657)
- latoken InsufficientFunds mapping [#10658](https://github.com/ccxt/ccxt/pull/10658)
- kraken network parsing [#10656](https://github.com/ccxt/ccxt/pull/10656)
- bitget fix market status parsing  [#10665](https://github.com/ccxt/ccxt/pull/10665)
- gateio STX remove mapping [#10666](https://github.com/ccxt/ccxt/pull/10666)
- hitbtc STX remapping [#10667](https://github.com/ccxt/ccxt/pull/10667)
- ascendex BYN remapping [#10668](https://github.com/ccxt/ccxt/pull/10668)
- mexc BYN mapping [#10669](https://github.com/ccxt/ccxt/pull/10669)
- gateio BYN remapping [#10670](https://github.com/ccxt/ccxt/pull/10670)
- gemini fix #10540 [#10671](https://github.com/ccxt/ccxt/pull/10671)


## 1.60.1

- hitbtc3 minor fix [#10481](https://github.com/ccxt/ccxt/pull/10481)
- Fixed parse order gateio [#10482](https://github.com/ccxt/ccxt/pull/10482)
- oceanex safeOrder2 [#10471](https://github.com/ccxt/ccxt/pull/10471)
- gateio edits [#10462](https://github.com/ccxt/ccxt/pull/10462)
- probit rate limits [#10474](https://github.com/ccxt/ccxt/pull/10474)
- tidex safeOrder2 [#10490](https://github.com/ccxt/ccxt/pull/10490)
- change Cyrillic "С" to latin "C" to avoid problem [#10497](https://github.com/ccxt/ccxt/pull/10497)
- itbit safeOrder2 [#10465](https://github.com/ccxt/ccxt/pull/10465)
- bitmart error mapping [#10486](https://github.com/ccxt/ccxt/pull/10486)
- lbank safeOrder2 [#10467](https://github.com/ccxt/ccxt/pull/10467)
- luno safeOrder2 [#10468](https://github.com/ccxt/ccxt/pull/10468)
- zb safeOrder [#10500](https://github.com/ccxt/ccxt/pull/10500)
- yobit safeOrder2 [#10499](https://github.com/ccxt/ccxt/pull/10499)
- properly parse cost in safeOrder with contractSize [#10479](https://github.com/ccxt/ccxt/pull/10479)
- novadax safeOrder2 [#10470](https://github.com/ccxt/ccxt/pull/10470)
- okex safeOrder2 [#10472](https://github.com/ccxt/ccxt/pull/10472)
- vcc safeOrder2 [#10491](https://github.com/ccxt/ccxt/pull/10491)
- fetchFundingRateHistory not available on bybit [#10502](https://github.com/ccxt/ccxt/pull/10502)
- fix for gateio.fetchFundingRateHistory [#10492](https://github.com/ccxt/ccxt/pull/10492)
- okex3 safeOrder2 [#10473](https://github.com/ccxt/ccxt/pull/10473)
- Added fetchFundingHistory to okex [#10493](https://github.com/ccxt/ccxt/pull/10493)
- wavesexchange safeOrder2 [#10494](https://github.com/ccxt/ccxt/pull/10494)
- tidebit safeOrder2 [#10507](https://github.com/ccxt/ccxt/pull/10507)
- probit safeOrder2 [#10506](https://github.com/ccxt/ccxt/pull/10506)
- gateio fetchDepositAddress -> true [#10510](https://github.com/ccxt/ccxt/pull/10510)
- okex fundingRate fixes [#10512](https://github.com/ccxt/ccxt/pull/10512)
- okex sort fundingRate [#10514](https://github.com/ccxt/ccxt/pull/10514)
- binance fetchPositions accept a list of symbols argument [#10513](https://github.com/ccxt/ccxt/pull/10513)
- gateio average fix [#10521](https://github.com/ccxt/ccxt/pull/10521)
- add market to safeOrder2 [#10519](https://github.com/ccxt/ccxt/pull/10519)
- add settle and settleId binance okex [#10515](https://github.com/ccxt/ccxt/pull/10515)
- fix hitbtc3 balance type [#10516](https://github.com/ccxt/ccxt/pull/10516)
- Adding support for CEL and SXP to Bitstamp [#10522](https://github.com/ccxt/ccxt/pull/10522)
- change error 500000 to ExchangeNotAvailable [#10523](https://github.com/ccxt/ccxt/pull/10523)
- okex fetchFundingHistoryFixes [#10527](https://github.com/ccxt/ccxt/pull/10527)
- okex typo [#10530](https://github.com/ccxt/ccxt/pull/10530)
- okex contractSize parsing [#10532](https://github.com/ccxt/ccxt/pull/10532)
- FTX: Not logged in: Invalid API key [#10535](https://github.com/ccxt/ccxt/pull/10535)
- okex fix since param [#10541](https://github.com/ccxt/ccxt/pull/10541)
- okex addMargin & reduceMargin [#10544](https://github.com/ccxt/ccxt/pull/10544)
- Bifrost Finance commonCurrencies [#10542](https://github.com/ccxt/ccxt/pull/10542)
- qtrade BTM commonCurrencies update [#10550](https://github.com/ccxt/ccxt/pull/10550)
- FTX: add status 'cancelled' [#10553](https://github.com/ccxt/ccxt/pull/10553)
- PROS mexc commonCurrency clash Pros.Finance [#10548](https://github.com/ccxt/ccxt/pull/10548)
- [binance] Return unified symbol name from fetchFundingRateHistory() [#10554](https://github.com/ccxt/ccxt/pull/10554)
- okex fetchPositions updates [#10560](https://github.com/ccxt/ccxt/pull/10560)
- PROS commonCurrency bittrex [#10545](https://github.com/ccxt/ccxt/pull/10545)
- gateio fix candlesticks bug for 1000 candles [#10562](https://github.com/ccxt/ccxt/pull/10562)


## 1.59.1

- hitbtc3 implementation [#10327](https://github.com/ccxt/ccxt/pull/10327)
- bfx2 safeOrder2 [#10338](https://github.com/ccxt/ccxt/pull/10338)
- btcalpha parseOrder fixes [#10372](https://github.com/ccxt/ccxt/pull/10372)
- delist coinegg [#10373](https://github.com/ccxt/ccxt/pull/10373)
- Added contract property to markets [#10357](https://github.com/ccxt/ccxt/pull/10357)
- base class cleanup [#10375](https://github.com/ccxt/ccxt/pull/10375)
- fetchFundingHistory for gateio [#10154](https://github.com/ccxt/ccxt/pull/10154)
- Liquidation price shows for cross trades is parseRisk on Binance [#10376](https://github.com/ccxt/ccxt/pull/10376)
- fetchDepositAddress network edits [#10378](https://github.com/ccxt/ccxt/pull/10378)
- poloniex error mapping [#10382](https://github.com/ccxt/ccxt/pull/10382)
- market['contract'] insertions gateio [#10381](https://github.com/ccxt/ccxt/pull/10381)
- Add bitrue exchange API implementation (python) [#7148](https://github.com/ccxt/ccxt/pull/7148)
- Add new exchange Bitrue [#7943](https://github.com/ccxt/ccxt/pull/7943)
- Add exchange bitrue [#9837](https://github.com/ccxt/ccxt/pull/9837)
- bitrue fetchOHLCV emulated [#10389](https://github.com/ccxt/ccxt/pull/10389)
- aofex AQT mapping [#10388](https://github.com/ccxt/ccxt/pull/10388)
- probit LBK -> Legal Block [#10390](https://github.com/ccxt/ccxt/pull/10390)
- Kucoin fetchLedger update fix #10302 [#10379](https://github.com/ccxt/ccxt/pull/10379)
- Added fetchLedger to coinbasepro [#10391](https://github.com/ccxt/ccxt/pull/10391)
- bitbay safeOrder2 [#10394](https://github.com/ccxt/ccxt/pull/10394)
- bitbns safeOrder2 [#10395](https://github.com/ccxt/ccxt/pull/10395)
- binance fetchPositions edits use positionRisk endpoint [#10393](https://github.com/ccxt/ccxt/pull/10393)
- binance parsePosition minor edits and set margin mode edits [#10399](https://github.com/ccxt/ccxt/pull/10399)
- gateio fetchFundingHistory minor edits [#10397](https://github.com/ccxt/ccxt/pull/10397)
- fetchFundingRateHistory unification edits [#10398](https://github.com/ccxt/ccxt/pull/10398)
- fix #10402 [#10403](https://github.com/ccxt/ccxt/pull/10403)
- yobit SOLO -> SoloCoin [#10404](https://github.com/ccxt/ccxt/pull/10404)
- bitforex NOAI -> METANOIA [#10406](https://github.com/ccxt/ccxt/pull/10406)
- bitmart safeOrder2 [#10409](https://github.com/ccxt/ccxt/pull/10409)
- bitmart safeOrder2 [#10410](https://github.com/ccxt/ccxt/pull/10410)
- bibox-safeOrder2 [#10411](https://github.com/ccxt/ccxt/pull/10411)
- bigone safeOrder2 [#10412](https://github.com/ccxt/ccxt/pull/10412)
- bit2c safeOrder2 [#10413](https://github.com/ccxt/ccxt/pull/10413)
- bitflyer safeOrder2 [#10414](https://github.com/ccxt/ccxt/pull/10414)
- bitforex safeOrder2 [#10416](https://github.com/ccxt/ccxt/pull/10416)
- Fixes two breaking errors in coinbasepro fetchLedgerEntry method [#10419](https://github.com/ccxt/ccxt/pull/10419)
- bitget safeOrder2 [#10417](https://github.com/ccxt/ccxt/pull/10417)
- gateio EGG -> Goose Finance [#10420](https://github.com/ccxt/ccxt/pull/10420)
- crex24 EGG -> NestEGG Coin [#10421](https://github.com/ccxt/ccxt/pull/10421)
- wavesexchange EGG -> Waves Ducks [#10422](https://github.com/ccxt/ccxt/pull/10422)
- currencycom coins mapping [#10423](https://github.com/ccxt/ccxt/pull/10423)
- yobit EGG -> EggCoin [#10424](https://github.com/ccxt/ccxt/pull/10424)
- btcmarkets safeOrder2 [#10425](https://github.com/ccxt/ccxt/pull/10425)
- Gate.io fetchOHLCV fixes [#10407](https://github.com/ccxt/ccxt/pull/10407)
- Remove fee discount from readme [#10427](https://github.com/ccxt/ccxt/pull/10427)
- okex implement setLeverage setMarginMode setPositionMode  [#10405](https://github.com/ccxt/ccxt/pull/10405)


## 1.58.1

- fix bitstamp parseTradingFee [#10247](https://github.com/ccxt/ccxt/pull/10247)
- delist mixcoins [#10236](https://github.com/ccxt/ccxt/pull/10236)
- mexc SIN -> Sin City Token [#10250](https://github.com/ccxt/ccxt/pull/10250)
- yobit FX -> FCoin [#10251](https://github.com/ccxt/ccxt/pull/10251)
- bitmart GDT -> Gorilla Diamond [#10252](https://github.com/ccxt/ccxt/pull/10252)
- probit coins mapping [#10253](https://github.com/ccxt/ccxt/pull/10253)
- binance exact error fix [#10254](https://github.com/ccxt/ccxt/pull/10254)
- code parameter is optional in fetchTransfers method [#10260](https://github.com/ccxt/ccxt/pull/10260)
- ascendex sign enhancement [#10259](https://github.com/ccxt/ccxt/pull/10259)
- Added fetchTrades. Made some endpoints available through public API. [#10263](https://github.com/ccxt/ccxt/pull/10263)
- Gateio order book futures [#10240](https://github.com/ccxt/ccxt/pull/10240)
- mexc parseOrder fix [#10266](https://github.com/ccxt/ccxt/pull/10266)
- Added swap and future to gateio fetchOHLCV [#10269](https://github.com/ccxt/ccxt/pull/10269)
- Gateio futures fetchTrades [#10270](https://github.com/ccxt/ccxt/pull/10270)
- Fix retrieval of amount/cost for Binance dust trades [#10272](https://github.com/ccxt/ccxt/pull/10272)
- Added swap and futures support to gateio getBalance [#10268](https://github.com/ccxt/ccxt/pull/10268)
- gateio correct fees for swap and future markets [#10274](https://github.com/ccxt/ccxt/pull/10274)
- Added method getSupportedMapping to base/Exchange [#10264](https://github.com/ccxt/ccxt/pull/10264)
- huobi propagate network data to top level [#10279](https://github.com/ccxt/ccxt/pull/10279)
- describe.limits.leverage added to bittrex, bybit, coinbase, kucoin, huobi, okex [#10275](https://github.com/ccxt/ccxt/pull/10275)
- Gateio fetch trades market['delivery'] -> market['futures'] fix [#10287](https://github.com/ccxt/ccxt/pull/10287)
- Added margin to gateio fetchMarkets [#10286](https://github.com/ccxt/ccxt/pull/10286)
- gateio requiredCredentials [#10292](https://github.com/ccxt/ccxt/pull/10292)
- Gateio get supported mapping [#10290](https://github.com/ccxt/ccxt/pull/10290)
- ftx error mapping [#10295](https://github.com/ccxt/ccxt/pull/10295)
- Gateio fetchMyTrades [#10285](https://github.com/ccxt/ccxt/pull/10285)
- add php error handling [#10281](https://github.com/ccxt/ccxt/pull/10281)
- delist exx [#10300](https://github.com/ccxt/ccxt/pull/10300)
- waves exchange add support for networks [#10304](https://github.com/ccxt/ccxt/pull/10304)
- binance networks fix for eth [#10305](https://github.com/ccxt/ccxt/pull/10305)
- waves testnet minor fix [#10307](https://github.com/ccxt/ccxt/pull/10307)


## 1.57.1

- bithumb FCT -> FCT2 [#10140](https://github.com/ccxt/ccxt/pull/10140)
- fix #10146 [#10147](https://github.com/ccxt/ccxt/pull/10147)
- aax networks [#10149](https://github.com/ccxt/ccxt/pull/10149)
- Fetch time [#10157](https://github.com/ccxt/ccxt/pull/10157)
- binance safeOrder2 bug  [#10161](https://github.com/ccxt/ccxt/pull/10161)
- delist coinfloor [#10144](https://github.com/ccxt/ccxt/pull/10144)
- binance reverse network parsing [#10151](https://github.com/ccxt/ccxt/pull/10151)
- Bybit setLeverage [#10167](https://github.com/ccxt/ccxt/pull/10167)
- Bybit setMarginMode [#10164](https://github.com/ccxt/ccxt/pull/10164)
- bitvavo safeOrder2 [#10168](https://github.com/ccxt/ccxt/pull/10168)
- crex24 error mapping [#10171](https://github.com/ccxt/ccxt/pull/10171)
- add remaining binance reverse networks [#10173](https://github.com/ccxt/ccxt/pull/10173)
- liquid TON -> Tokamak Network [#10177](https://github.com/ccxt/ccxt/pull/10177)
- bitforex TON -> To The Moon [#10175](https://github.com/ccxt/ccxt/pull/10175)
- bittrex TON -> Tokamak Network [#10176](https://github.com/ccxt/ccxt/pull/10176)
- gateio TON -> TONToken [#10178](https://github.com/ccxt/ccxt/pull/10178)
- matic currency network is called polygon [#10183](https://github.com/ccxt/ccxt/pull/10183)
- safeOrder2 edit [#10185](https://github.com/ccxt/ccxt/pull/10185)
- Ascendex fetchPositions, setLeverage, setMarginMode [#10159](https://github.com/ccxt/ccxt/pull/10159)
- ftx fetchFundingHistory bug  [#10193](https://github.com/ccxt/ccxt/pull/10193)
- okex fetchDepositAddressesByNetwork [#10182](https://github.com/ccxt/ccxt/pull/10182)
- Adding HBAR support for Bitstamp [#10197](https://github.com/ccxt/ccxt/pull/10197)
- ftx fetchPositons [#10203](https://github.com/ccxt/ccxt/pull/10203)
- ftx fetchPostions showAvgPrice [#10213](https://github.com/ccxt/ccxt/pull/10213)


## 1.56.1

- Remove cloudflare examples [#9990](https://github.com/ccxt/ccxt/pull/9990)
- coinex fetchBalance empty response fix #9088 [#9991](https://github.com/ccxt/ccxt/pull/9991)
- delist braziliex [#9988](https://github.com/ccxt/ccxt/pull/9988)
- binance reduceOnly alias [#9994](https://github.com/ccxt/ccxt/pull/9994)
- crex24 CLC -> CaluraCoin [#9998](https://github.com/ccxt/ccxt/pull/9998)
- Kraken: added endpoints costs [#9995](https://github.com/ccxt/ccxt/pull/9995)
- FIX: okcoinusd doesn't exist [#9999](https://github.com/ccxt/ccxt/pull/9999)
- crex24 error mapping [#10002](https://github.com/ccxt/ccxt/pull/10002)
- Check for availability of currency precision in Binance [#10001](https://github.com/ccxt/ccxt/pull/10001)
- tidex withdraw rewrite, new endpoints [#10000](https://github.com/ccxt/ccxt/pull/10000)
- implement bitvavo ratelimits [#10003](https://github.com/ccxt/ccxt/pull/10003)
- bitmart fetchOrderBook enhancement [#10004](https://github.com/ccxt/ccxt/pull/10004)
- increase coinbasepro ratelimit [#10007](https://github.com/ccxt/ccxt/pull/10007)
- increase bitmart ratelimit [#10006](https://github.com/ccxt/ccxt/pull/10006)
- increase gateio ratelimit [#9977](https://github.com/ccxt/ccxt/pull/9977)
- Update zb fetchClosedOrders [#10015](https://github.com/ccxt/ccxt/pull/10015)
- Adding support for AXS and SAND for Bitstamp [#10018](https://github.com/ccxt/ccxt/pull/10018)
- FTX: increase rate limit (100ms) to match lowest tier [#10019](https://github.com/ccxt/ccxt/pull/10019)
- ClientOrderId support for Bitstamp and Bittrex [#10020](https://github.com/ccxt/ccxt/pull/10020)
- binance implement withdraw with multiple networks [#10022](https://github.com/ccxt/ccxt/pull/10022)
- Binance network [#10024](https://github.com/ccxt/ccxt/pull/10024)
- binance  add support for network aliases to fetchDepositAddress [#10026](https://github.com/ccxt/ccxt/pull/10026)
- bitforex rate limits [#10025](https://github.com/ccxt/ccxt/pull/10025)
- uncertify kraken and certify okex [#10023](https://github.com/ccxt/ccxt/pull/10023)
- Hide okex5 from tables [#10029](https://github.com/ccxt/ccxt/pull/10029)
- poloniex implement withdraw with multiple networks  [#10028](https://github.com/ccxt/ccxt/pull/10028)
- Allow Kraken ClientOrderId on fetching open/closed orders and cancelOrder [#10030](https://github.com/ccxt/ccxt/pull/10030)
- crex24 implement withdraw with multiple networks [#10031](https://github.com/ccxt/ccxt/pull/10031)
- Fix parsing Deribit balance (use snake case for properties) [#10032](https://github.com/ccxt/ccxt/pull/10032)
- okex implement withdraw with multiple networks  [#10034](https://github.com/ccxt/ccxt/pull/10034)
- Okex networks [#10035](https://github.com/ccxt/ccxt/pull/10035)
- relist bytetrade [#10036](https://github.com/ccxt/ccxt/pull/10036)
- add support for networks to huobi [#10037](https://github.com/ccxt/ccxt/pull/10037)
- improve withdraw params handling [#10027](https://github.com/ccxt/ccxt/pull/10027)
- hitbtc convertCurrencyNetwork [#10038](https://github.com/ccxt/ccxt/pull/10038)
- stex rate limits [#10039](https://github.com/ccxt/ccxt/pull/10039)
- hitbtc implement withdraw with multiple networks [#10040](https://github.com/ccxt/ccxt/pull/10040)
- handleWithdrawTagAndParams [#10042](https://github.com/ccxt/ccxt/pull/10042)
- hitbtc fix convertCurrencyNetwork #10038 [#10041](https://github.com/ccxt/ccxt/pull/10041)
- gateio implement withdraw with multiple networks [#10046](https://github.com/ccxt/ccxt/pull/10046)
- kucoin network unification [#10052](https://github.com/ccxt/ccxt/pull/10052)
- add networks to ftx [#10053](https://github.com/ccxt/ccxt/pull/10053)
- huobi fix bug in chain parsing [#10054](https://github.com/ccxt/ccxt/pull/10054)
- add docs on withdrawal networks [#10059](https://github.com/ccxt/ccxt/pull/10059)
- Manual fix table for readthedocs [#10060](https://github.com/ccxt/ccxt/pull/10060)
- binance portal stop sliding [#10061](https://github.com/ccxt/ccxt/pull/10061)
- minor docs edit [#10062](https://github.com/ccxt/ccxt/pull/10062)


## 1.55.1

- binance add new api url [#9860](https://github.com/ccxt/ccxt/pull/9860)
- probit GRB -> Global Reward Bank [#9863](https://github.com/ccxt/ccxt/pull/9863)
- hitbtc BIT -> BitRewards [#9864](https://github.com/ccxt/ccxt/pull/9864)
- camel case fix [#9875](https://github.com/ccxt/ccxt/pull/9875)
- bittrex: map NOT_FOUND to OrderNotFound exception [#9872](https://github.com/ccxt/ccxt/pull/9872)
- Added fetch_funding_history parse_incomes and parse_income to ftx [#9878](https://github.com/ccxt/ccxt/pull/9878)
- crex24 fetchMarkets fees [#9881](https://github.com/ccxt/ccxt/pull/9881)
- bitmart TCT -> TacoCat Token [#9887](https://github.com/ccxt/ccxt/pull/9887)
- probit TCT -> Top Coin Token [#9888](https://github.com/ccxt/ccxt/pull/9888)
- bitz XBT mapping [#9900](https://github.com/ccxt/ccxt/pull/9900)
- bibox fetchMarkets enhancement [#9897](https://github.com/ccxt/ccxt/pull/9897)
- liquid new endpoints [#9899](https://github.com/ccxt/ccxt/pull/9899)
- zb new hostname [#9909](https://github.com/ccxt/ccxt/pull/9909)
- FTX - adjust market ticker, more intervals [#9914](https://github.com/ccxt/ccxt/pull/9914)
- Kraken: added more exceptions [#9924](https://github.com/ccxt/ccxt/pull/9924)
- [Binance] Fix parsing timestamp for dust trades [#9927](https://github.com/ccxt/ccxt/pull/9927)
- okex v5 add new api [#9930](https://github.com/ccxt/ccxt/pull/9930)
- Bitstamp: add new exception for "Invalid offset." [#9935](https://github.com/ccxt/ccxt/pull/9935)
- bibox REVO -> Revo Network [#9936](https://github.com/ccxt/ccxt/pull/9936)
- coinex error handle [#9938](https://github.com/ccxt/ccxt/pull/9938)
- zb fetchMarkets enhancement [#9939](https://github.com/ccxt/ccxt/pull/9939)
- Kraken: added error EAPI:Invalid nonce [#9940](https://github.com/ccxt/ccxt/pull/9940)
- certify huobi [#9750](https://github.com/ccxt/ccxt/pull/9750)
- Adding ALPHA, FTT and STORJ support for Bitstamp [#9942](https://github.com/ccxt/ccxt/pull/9942)
- edit manual positions [#9947](https://github.com/ccxt/ccxt/pull/9947)
- update toPrecision methods for marketIds [#9949](https://github.com/ccxt/ccxt/pull/9949)
- fix okex create swap order [#9952](https://github.com/ccxt/ccxt/pull/9952)
- implement dynamic rate limit for huobi [#9950](https://github.com/ccxt/ccxt/pull/9950)
- Poloniex: fix Permission denied error [#9954](https://github.com/ccxt/ccxt/pull/9954)
- okex5 set alias property [#9956](https://github.com/ccxt/ccxt/pull/9956)


## 1.54.1

- ftx errors mapping [#9721](https://github.com/ccxt/ccxt/pull/9721)
- BITMART: calculate wrong price precision for markets with price_max_precision > 10 [#9722](https://github.com/ccxt/ccxt/pull/9722)
- liquid parseTransaction edit [#9723](https://github.com/ccxt/ccxt/pull/9723)
- more parseNumber fees [#9726](https://github.com/ccxt/ccxt/pull/9726)
- gateio fetchTickers fix [#9732](https://github.com/ccxt/ccxt/pull/9732)
- liquid parseTransaction refix [#9730](https://github.com/ccxt/ccxt/pull/9730)
- hitbtc more accountsByType mapping [#9735](https://github.com/ccxt/ccxt/pull/9735)
- Deprecate v1 auth for Bitstamp [#9731](https://github.com/ccxt/ccxt/pull/9731)
- kraken withdraw parsing [#9736](https://github.com/ccxt/ccxt/pull/9736)
- hitbtc more account types mapping [#9737](https://github.com/ccxt/ccxt/pull/9737)
- bibox error mapping [#9738](https://github.com/ccxt/ccxt/pull/9738)
- binance add support for fiat to fetchDeposits/fetchWithdrawals [#9674](https://github.com/ccxt/ccxt/pull/9674)
- add .codes (mirror .symbols) [#9748](https://github.com/ccxt/ccxt/pull/9748)
- [binance] Add missing error codes for borrowing and repaying in margin account [#9756](https://github.com/ccxt/ccxt/pull/9756)
- minor docs edit [#9747](https://github.com/ccxt/ccxt/pull/9747)
- [Python][Throttler] Reapply an old workaround [#9760](https://github.com/ccxt/ccxt/pull/9760)
- binance remove remaining wapi endpoints [#9749](https://github.com/ccxt/ccxt/pull/9749)
- binance fetchBalance support binance pay [#9751](https://github.com/ccxt/ccxt/pull/9751)
- Exchange convert print -> log [#9759](https://github.com/ccxt/ccxt/pull/9759)
- readthedocs sidebar fix [#9762](https://github.com/ccxt/ccxt/pull/9762)
- Calculate stop order operators for Novadax [#9764](https://github.com/ccxt/ccxt/pull/9764)
- Fix sending the stop price for a VCC stop orders [#9765](https://github.com/ccxt/ccxt/pull/9765)
- huobi fetchOpenOrders without symbol [#9766](https://github.com/ccxt/ccxt/pull/9766)
- gateio php fix [#9770](https://github.com/ccxt/ccxt/pull/9770)
- fix typo [#9776](https://github.com/ccxt/ccxt/pull/9776)
- fix btctradeua parseTrade [#8944](https://github.com/ccxt/ccxt/pull/8944)
- Adding support for SUSHI and MATIC to Bitstamp [#9780](https://github.com/ccxt/ccxt/pull/9780)
- add fetch_balance to exchange.py [#9787](https://github.com/ccxt/ccxt/pull/9787)
- Novadax: fix changing order type to stop if stop price is set [#9788](https://github.com/ccxt/ccxt/pull/9788)
- Bump path-parse from 1.0.5 to 1.0.7 [#9789](https://github.com/ccxt/ccxt/pull/9789)
- exmo new coins [#9798](https://github.com/ccxt/ccxt/pull/9798)
- php async deps add versions [#9795](https://github.com/ccxt/ccxt/pull/9795)
- exmo error mapping [#9804](https://github.com/ccxt/ccxt/pull/9804)
- binance costToPrecision and currencyToPrecision [#9796](https://github.com/ccxt/ccxt/pull/9796)
- Fix gateIO fetchOHLCV [#9807](https://github.com/ccxt/ccxt/pull/9807)
- bitforex error mapping [#9809](https://github.com/ccxt/ccxt/pull/9809)
- Binance implement add and reduce margin [#9793](https://github.com/ccxt/ccxt/pull/9793)
- exmo transaction statuses [#9814](https://github.com/ccxt/ccxt/pull/9814)
- idex fetchMarkets enhancement [#9815](https://github.com/ccxt/ccxt/pull/9815)


## 1.53.1

- exmo add fetchWithdrawals [#9615](https://github.com/ccxt/ccxt/pull/9615)
- okex v5 add new api url [#9616](https://github.com/ccxt/ccxt/pull/9616)
- binance add new api url [#9618](https://github.com/ccxt/ccxt/pull/9618)
- Okex Use fillsHistory endpoint [#9621](https://github.com/ccxt/ccxt/pull/9621)
- okex v5 add new api url [#9624](https://github.com/ccxt/ccxt/pull/9624)
- add bitpanda example [#9627](https://github.com/ccxt/ccxt/pull/9627)
- test.trade.js also test cost field [#9630](https://github.com/ccxt/ccxt/pull/9630)
- Precise edit [#9631](https://github.com/ccxt/ccxt/pull/9631)
- bigone fetchMarkets fix [#9633](https://github.com/ccxt/ccxt/pull/9633)
- okex v5 add new api url [#9635](https://github.com/ccxt/ccxt/pull/9635)
- transpile.js fix bugs in !== number translation regexes [#9640](https://github.com/ccxt/ccxt/pull/9640)
- package.json change npm test-base to use python3 instead of python [#9646](https://github.com/ccxt/ccxt/pull/9646)
- implement binance unified endpoint fetchSavings [#9587](https://github.com/ccxt/ccxt/pull/9587)
- migrate to gateiov4 [#9649](https://github.com/ccxt/ccxt/pull/9649)
- Precise php 2x faster [#9651](https://github.com/ccxt/ccxt/pull/9651)
- add parseTrade field of pro [#9650](https://github.com/ccxt/ccxt/pull/9650)
- implement okex parsePosition [#9654](https://github.com/ccxt/ccxt/pull/9654)
- Remove .currencyId [#9655](https://github.com/ccxt/ccxt/pull/9655)
- add bybit new symbols [#9657](https://github.com/ccxt/ccxt/pull/9657)
- accept marketId in .market [#9656](https://github.com/ccxt/ccxt/pull/9656)
- ccxtpro travis fix [#9664](https://github.com/ccxt/ccxt/pull/9664)
- bitbank: fix createOrder parameter validation [#9672](https://github.com/ccxt/ccxt/pull/9672)
- Duplicated code in gateio.js [#9667](https://github.com/ccxt/ccxt/pull/9667)
- fix readthedocs travis build warnings [#9670](https://github.com/ccxt/ccxt/pull/9670)
- Throttle v2 [#9658](https://github.com/ccxt/ccxt/pull/9658)
- binance number as string fixes and additions [#9632](https://github.com/ccxt/ccxt/pull/9632)
- gateio fetchOrderBook limit [#9677](https://github.com/ccxt/ccxt/pull/9677)
- totp fix [#9679](https://github.com/ccxt/ccxt/pull/9679)
- bigone FXT -> FXTTOKEN [#9680](https://github.com/ccxt/ccxt/pull/9680)
- Add checkRequiredCredentials Override for Exchanges that Support HTTP Authentication [#9645](https://github.com/ccxt/ccxt/pull/9645)
- gateio fetchMyTrades limit [#9684](https://github.com/ccxt/ccxt/pull/9684)
- parseNumber to fees [#9673](https://github.com/ccxt/ccxt/pull/9673)
- exmo update currencies [#9685](https://github.com/ccxt/ccxt/pull/9685)
- liquid fetchCurrencies name [#9687](https://github.com/ccxt/ccxt/pull/9687)
- gateio typo fix [#9688](https://github.com/ccxt/ccxt/pull/9688)
- okex fetchPositions fix contracts field  [#9693](https://github.com/ccxt/ccxt/pull/9693)
- remove hardcoded fees [#9671](https://github.com/ccxt/ccxt/pull/9671)


## 1.52.1

- independentreserve update exchange endpoints - add limits to fetchMarkets() [#9501](https://github.com/ccxt/ccxt/pull/9501)
- Poloniex: implement fetchClosedOrder [#9498](https://github.com/ccxt/ccxt/pull/9498)
- numberToString bugfix [#9506](https://github.com/ccxt/ccxt/pull/9506)
- Bytetrade edits remove integerPow methods [#9508](https://github.com/ccxt/ccxt/pull/9508)
- Update ccxt.d.ts [#9507](https://github.com/ccxt/ccxt/pull/9507)
- unify positive feeside okex [#9515](https://github.com/ccxt/ccxt/pull/9515)
- remove duplicate field marketsById [#9509](https://github.com/ccxt/ccxt/pull/9509)
- Add Binance dust log and sub-account SAPI endpoints [#9521](https://github.com/ccxt/ccxt/pull/9521)
- gateio BYN -> Beyond Finance [#9527](https://github.com/ccxt/ccxt/pull/9527)
- binance invalidOrder [#9530](https://github.com/ccxt/ccxt/pull/9530)
- kuna undefined precisions and limits [#9528](https://github.com/ccxt/ccxt/pull/9528)
- delist bytetrade [#9529](https://github.com/ccxt/ccxt/pull/9529)
- delist southxchange [#9275](https://github.com/ccxt/ccxt/pull/9275)
- crex24 fetchMarkets enchancement [#9535](https://github.com/ccxt/ccxt/pull/9535)
- bitforex error mapping [#9536](https://github.com/ccxt/ccxt/pull/9536)
- bibox fetchMarkets with right precisions [#9538](https://github.com/ccxt/ccxt/pull/9538)
- bitmart parseTransaction typo fix [#9542](https://github.com/ccxt/ccxt/pull/9542)
- phemex fix minor bug [#9544](https://github.com/ccxt/ccxt/pull/9544)
- currency EDU mapping [#9545](https://github.com/ccxt/ccxt/pull/9545)
- liquid withdraw fix [#9548](https://github.com/ccxt/ccxt/pull/9548)
- edit eqonex remove toWei [#9550](https://github.com/ccxt/ccxt/pull/9550)
- modify waves.exchange [#9551](https://github.com/ccxt/ccxt/pull/9551)
- coinmarketcap remove precision [#9552](https://github.com/ccxt/ccxt/pull/9552)
- ascendex remove Math.pow [#9553](https://github.com/ccxt/ccxt/pull/9553)
- remove toWei and fromWei [#9554](https://github.com/ccxt/ccxt/pull/9554)
- bigone parseTransactionStatus new statuses [#9560](https://github.com/ccxt/ccxt/pull/9560)
- Create SECURITY.md [#9559](https://github.com/ccxt/ccxt/pull/9559)
- kucoin accountsByType [#9561](https://github.com/ccxt/ccxt/pull/9561)
- hbtc accountsByType [#9562](https://github.com/ccxt/ccxt/pull/9562)
- okex5-balance-edit [#9563](https://github.com/ccxt/ccxt/pull/9563)
- probit withdraw fix [#9567](https://github.com/ccxt/ccxt/pull/9567)
- poloniex parseTransactionStatus statuses [#9570](https://github.com/ccxt/ccxt/pull/9570)
- probit withdraw refix [#9568](https://github.com/ccxt/ccxt/pull/9568)


## 1.51.1

- bitforex new endpoints [#9367](https://github.com/ccxt/ccxt/pull/9367)
- coinfalcon new endpoints [#9366](https://github.com/ccxt/ccxt/pull/9366)
- add coinex perpetual [#9373](https://github.com/ccxt/ccxt/pull/9373)
- minor binance leveragebrackets edit [#9376](https://github.com/ccxt/ccxt/pull/9376)
- Adding support for COMP, GRT and USDT for Bitstamp [#9377](https://github.com/ccxt/ccxt/pull/9377)
- fix parsePosition [#9379](https://github.com/ccxt/ccxt/pull/9379)
- Export Precise for use in ccxtpro [#9380](https://github.com/ccxt/ccxt/pull/9380)
- php minor omit_zero bug [#9384](https://github.com/ccxt/ccxt/pull/9384)
- Improved readthedocs [#9368](https://github.com/ccxt/ccxt/pull/9368)
- read the docs add deps [#9387](https://github.com/ccxt/ccxt/pull/9387)
- bigone ANG -> Anagram [#9395](https://github.com/ccxt/ccxt/pull/9395)
- huobipro HIT -> HitChain [#9393](https://github.com/ccxt/ccxt/pull/9393)
- gateio HIT -> HitChain [#9394](https://github.com/ccxt/ccxt/pull/9394)
- poloniex error handle [#9403](https://github.com/ccxt/ccxt/pull/9403)
- fix js/coinone parseOrder return value [#9404](https://github.com/ccxt/ccxt/pull/9404)
- currencycom BNS -> Bank of Nova Scotia [#9406](https://github.com/ccxt/ccxt/pull/9406)
- Update yobit.js [#9405](https://github.com/ccxt/ccxt/pull/9405)
- Read the docs update readme and other minor edits [#9396](https://github.com/ccxt/ccxt/pull/9396)
- readthedocs binance broker portal sdk css edit [#9408](https://github.com/ccxt/ccxt/pull/9408)
- Update ftx-fetch-all-my-trades.py to avoid potential incomplete results [#9409](https://github.com/ccxt/ccxt/pull/9409)
- equos.io has moved to eqonex.com [#9415](https://github.com/ccxt/ccxt/pull/9415)
- update setup.py for pypi [#9417](https://github.com/ccxt/ccxt/pull/9417)
- project_links -> project_urls [#9419](https://github.com/ccxt/ccxt/pull/9419)
- Install composer during docker build [#9416](https://github.com/ccxt/ccxt/pull/9416)
- Edit readthedocs css [#9426](https://github.com/ccxt/ccxt/pull/9426)
- fix badges [#9427](https://github.com/ccxt/ccxt/pull/9427)
- update waves url [#9430](https://github.com/ccxt/ccxt/pull/9430)
- binance update fetchFundingFee to reflect multiple networks [#9431](https://github.com/ccxt/ccxt/pull/9431)
- gateio fetchFundingFees [#9433](https://github.com/ccxt/ccxt/pull/9433)
- eqonex .number [#9435](https://github.com/ccxt/ccxt/pull/9435)
- precise BN -> BigInt [#9439](https://github.com/ccxt/ccxt/pull/9439)
- ascendex fetchMarkets fees [#9450](https://github.com/ccxt/ccxt/pull/9450)


## 1.50.1

- huobipro error mapping [#9230](https://github.com/ccxt/ccxt/pull/9230)
- [cex] added undocumented api call [#9229](https://github.com/ccxt/ccxt/pull/9229)
- binance fetch trading fee fix [#9239](https://github.com/ccxt/ccxt/pull/9239)
- binance futures add support for changing leverage and mode [#9238](https://github.com/ccxt/ccxt/pull/9238)
- binance futures minor bugs [#9244](https://github.com/ccxt/ccxt/pull/9244)
- okex tagfix [#9245](https://github.com/ccxt/ccxt/pull/9245)
- binance futures fetchFundingRate bug [#9247](https://github.com/ccxt/ccxt/pull/9247)
- binance futures fetchFundingRate -> fetchFundingRates [#9250](https://github.com/ccxt/ccxt/pull/9250)
- transpile binance future methods [#9256](https://github.com/ccxt/ccxt/pull/9256)
- binance add liquidation price to usdm futures [#9253](https://github.com/ccxt/ccxt/pull/9253)
- binance coinm futures fix fetchTicker [#9258](https://github.com/ccxt/ccxt/pull/9258)
- ftx, add fetchPosititons to has [#9262](https://github.com/ccxt/ccxt/pull/9262)
- Add Binance margin interestRateHistory endpoint [#9264](https://github.com/ccxt/ccxt/pull/9264)
- delist coingi [#9274](https://github.com/ccxt/ccxt/pull/9274)
- delist xbtce [#9277](https://github.com/ccxt/ccxt/pull/9277)
- Bybit inverse futures [#9180](https://github.com/ccxt/ccxt/pull/9180)
- add omit_zero to binance [#9283](https://github.com/ccxt/ccxt/pull/9283)
- binance .markets edits [#9249](https://github.com/ccxt/ccxt/pull/9249)
- delist lakebtc [#9278](https://github.com/ccxt/ccxt/pull/9278)
- Add futures urls to KuCoin + fetchTickers [#9284](https://github.com/ccxt/ccxt/pull/9284)
- probit SOC mapping [#9303](https://github.com/ccxt/ccxt/pull/9303)
- coinone SOC mapping [#9304](https://github.com/ccxt/ccxt/pull/9304)
- bithumb SOC mapping [#9305](https://github.com/ccxt/ccxt/pull/9305)
- hbtc maxAmount undefined [#9306](https://github.com/ccxt/ccxt/pull/9306)
- Add more specific exceptions for FTX [#9315](https://github.com/ccxt/ccxt/pull/9315)
- FTX: raise ExchangeNotAvailable on "Try again" [#9317](https://github.com/ccxt/ccxt/pull/9317)
- fix time parameters for fetchOHLCV function [#9322](https://github.com/ccxt/ccxt/pull/9322)


## 1.49.1

- Update poll-multiple-exchange-orderbooks-yield.php [#9106](https://github.com/ccxt/ccxt/pull/9106)
- bithumb: fix fetch_order_book, xxx/BTC returned xxx/KRW [#9107](https://github.com/ccxt/ccxt/pull/9107)
- Fix for EQUOS's parseOrderBook [#9108](https://github.com/ccxt/ccxt/pull/9108)
- Fix bybit order_parse() error [#9111](https://github.com/ccxt/ccxt/pull/9111)
- fix manual links [#9093](https://github.com/ccxt/ccxt/pull/9093)
- Bump y18n from 4.0.0 to 4.0.1 [#9114](https://github.com/ccxt/ccxt/pull/9114)
- Add hold-balances endpoint for Coinbase Pro [#9116](https://github.com/ccxt/ccxt/pull/9116)
- Adding support for SNX, UNI and YFI on Bitstamp [#9117](https://github.com/ccxt/ccxt/pull/9117)
- bithumb: reset precision of BTC price (to 4), set BTC costs [#9119](https://github.com/ccxt/ccxt/pull/9119)
- bitfinex min cost fix [#9122](https://github.com/ccxt/ccxt/pull/9122)
- hbtc precisions fix [#9123](https://github.com/ccxt/ccxt/pull/9123)
- bitfinex2 min cost fix [#9124](https://github.com/ccxt/ccxt/pull/9124)
- liquid min/max price [#9125](https://github.com/ccxt/ccxt/pull/9125)
- Fix poloniex error to actually be OrderNotFound [#9126](https://github.com/ccxt/ccxt/pull/9126)
- Remove six [#9130](https://github.com/ccxt/ccxt/pull/9130)
- remove soliditySha3 function in js and php [#9132](https://github.com/ccxt/ccxt/pull/9132)
- delist all blinktrade exchanges: vtbc, foxbit, surbitcoin [#9131](https://github.com/ccxt/ccxt/pull/9131)
- Coinbase Prime Deprecating old API URLs [#9138](https://github.com/ccxt/ccxt/pull/9138)
- delist pionex add bitcoinpoint to see also [#9140](https://github.com/ccxt/ccxt/pull/9140)
- Bump lodash from 4.17.19 to 4.17.21 [#9143](https://github.com/ccxt/ccxt/pull/9143)
- exx fetchMarkets [#9144](https://github.com/ccxt/ccxt/pull/9144)
- Bump hosted-git-info from 2.8.8 to 2.8.9 [#9146](https://github.com/ccxt/ccxt/pull/9146)
- Tidex remove pow [#9147](https://github.com/ccxt/ccxt/pull/9147)
- crex24 FUND mapping [#9156](https://github.com/ccxt/ccxt/pull/9156)
- bitfinex2 error handle [#9152](https://github.com/ccxt/ccxt/pull/9152)
- yobit LUNA mapping [#9154](https://github.com/ccxt/ccxt/pull/9154)
- bitforex GOT mapping [#9155](https://github.com/ccxt/ccxt/pull/9155)
- bitz fetchMarkets [#9157](https://github.com/ccxt/ccxt/pull/9157)
- bitfinex BCHN, BCHABC mapping [#9153](https://github.com/ccxt/ccxt/pull/9153)
- default enableRateLimit to true [#9167](https://github.com/ccxt/ccxt/pull/9167)
- create binance usdm and coinm exchange classes [#9168](https://github.com/ccxt/ccxt/pull/9168)
- okex minCost [#9161](https://github.com/ccxt/ccxt/pull/9161)
- uncertify bittrex [#9172](https://github.com/ccxt/ccxt/pull/9172)
- Remove old files [#9171](https://github.com/ccxt/ccxt/pull/9171)
- add binance futures fetchTradingFees [#9169](https://github.com/ccxt/ccxt/pull/9169)
- remove outdated dependencies from the manual [#9175](https://github.com/ccxt/ccxt/pull/9175)
- binance transfer between spot and futures account support [#9177](https://github.com/ccxt/ccxt/pull/9177)


## 1.48.1

- foxbit fetchBalance [#9007](https://github.com/ccxt/ccxt/pull/9007)
- coinfloor uk fetchBalance [#9008](https://github.com/ccxt/ccxt/pull/9008)
- btcmarkets fetchMarkets [#9016](https://github.com/ccxt/ccxt/pull/9016)
- poloniex fetchCurrencies [#9015](https://github.com/ccxt/ccxt/pull/9015)
- rightbtc fetchMarkets [#9014](https://github.com/ccxt/ccxt/pull/9014)
- lykke fetchMarkets [#9013](https://github.com/ccxt/ccxt/pull/9013)
- stex fetchCurrencies [#9011](https://github.com/ccxt/ccxt/pull/9011)
- bigone fetchMarkets [#9009](https://github.com/ccxt/ccxt/pull/9009)
- Fix empty bids list in python for NDAX exchange https://github.com/ccxt/ccxt/issues/9019 [#9020](https://github.com/ccxt/ccxt/pull/9020)
- parse precision helper method [#9023](https://github.com/ccxt/ccxt/pull/9023)
- Adding support for AAVE, BAT and UMA on Bitstamp [#9025](https://github.com/ccxt/ccxt/pull/9025)
- gateio VAI mapping [#9030](https://github.com/ccxt/ccxt/pull/9030)
- ascendex BYN mapping [#9036](https://github.com/ccxt/ccxt/pull/9036)
- kucoin VAI mapping [#9031](https://github.com/ccxt/ccxt/pull/9031)
- parsePrecision derived classes [#9034](https://github.com/ccxt/ccxt/pull/9034)
- byteTrade parseTrade, parseOrder fix [#9035](https://github.com/ccxt/ccxt/pull/9035)
- probit fetchMarkets [#9012](https://github.com/ccxt/ccxt/pull/9012)
- implement btcturk v2 [#9029](https://github.com/ccxt/ccxt/pull/9029)
- Lykke CAN mapping [#9039](https://github.com/ccxt/ccxt/pull/9039)
- hollaex add fees [#9043](https://github.com/ccxt/ccxt/pull/9043)
- Removed unused market check in huobipro fee parsing [#9047](https://github.com/ccxt/ccxt/pull/9047)
- hbtc parseMarket enhancement [#9048](https://github.com/ccxt/ccxt/pull/9048)
- bitforex error mapping [#9051](https://github.com/ccxt/ccxt/pull/9051)
- close php memory leak [#9041](https://github.com/ccxt/ccxt/pull/9041)
- add symbol field to orderbooks [#9054](https://github.com/ccxt/ccxt/pull/9054)
- binance fetchBalance timestamp [#9056](https://github.com/ccxt/ccxt/pull/9056)
- Fix async Exchange.php fetch() return [#9058](https://github.com/ccxt/ccxt/pull/9058)
- bigone timestamp [#9059](https://github.com/ccxt/ccxt/pull/9059)
- ascendex fetchbalance timestamp [#9060](https://github.com/ccxt/ccxt/pull/9060)
- aofex fetchBalance timestamp [#9061](https://github.com/ccxt/ccxt/pull/9061)
- aax fetchBalance timestamp [#9062](https://github.com/ccxt/ccxt/pull/9062)
- bitmart fetchBalance [#9063](https://github.com/ccxt/ccxt/pull/9063)
- bitbank timestamp [#9064](https://github.com/ccxt/ccxt/pull/9064)
- bitc2c timestamp [#9065](https://github.com/ccxt/ccxt/pull/9065)
- bitstamp timestamp [#9066](https://github.com/ccxt/ccxt/pull/9066)
- bitvavo timestamp [#9067](https://github.com/ccxt/ccxt/pull/9067)
- bitz timestamp [#9068](https://github.com/ccxt/ccxt/pull/9068)
- btcturk timestamp [#9071](https://github.com/ccxt/ccxt/pull/9071)
- bitso timestamp [#9069](https://github.com/ccxt/ccxt/pull/9069)
- bleutrade delist for no volume [#9070](https://github.com/ccxt/ccxt/pull/9070)
- ftx error mapping [#9074](https://github.com/ccxt/ccxt/pull/9074)


## 1.47.1

- fetchBalance edits [#8914](https://github.com/ccxt/ccxt/pull/8914)
- fetchBalance edits [#8915](https://github.com/ccxt/ccxt/pull/8915)
- fetchBalance edits [#8916](https://github.com/ccxt/ccxt/pull/8916)
- fetchBalance edits [#8917](https://github.com/ccxt/ccxt/pull/8917)
- fetchBalance edits [#8918](https://github.com/ccxt/ccxt/pull/8918)
- binance fetchBalance edits [#8919](https://github.com/ccxt/ccxt/pull/8919)
- Precise string add behaviour [#8920](https://github.com/ccxt/ccxt/pull/8920)
- bibox fetchBalance bugfix [#8922](https://github.com/ccxt/ccxt/pull/8922)
- fetchBalance edits [#8923](https://github.com/ccxt/ccxt/pull/8923)
- Fix precise division [#8927](https://github.com/ccxt/ccxt/pull/8927)
- Fetch balance edits [#8924](https://github.com/ccxt/ccxt/pull/8924)
- btcbox precise [#8930](https://github.com/ccxt/ccxt/pull/8930)
- ndax precise [#8931](https://github.com/ccxt/ccxt/pull/8931)
- fetchBalance edits [#8933](https://github.com/ccxt/ccxt/pull/8933)
- buda precise [#8932](https://github.com/ccxt/ccxt/pull/8932)
- digifinex EPS mapping [#8934](https://github.com/ccxt/ccxt/pull/8934)
- bitget parseTrade precise [#8938](https://github.com/ccxt/ccxt/pull/8938)
- btcmarkets parseTrade precise [#8942](https://github.com/ccxt/ccxt/pull/8942)
- Precise abs and neg [#8941](https://github.com/ccxt/ccxt/pull/8941)
- bitz parseTrade precise [#8943](https://github.com/ccxt/ccxt/pull/8943)
- bitfinex2 parseTrade precise [#8939](https://github.com/ccxt/ccxt/pull/8939)
- bybit parseTrade precise [#8945](https://github.com/ccxt/ccxt/pull/8945)
- yobit fetchMarkets precise [#8948](https://github.com/ccxt/ccxt/pull/8948)
- aofex fetchMarkets precise [#8946](https://github.com/ccxt/ccxt/pull/8946)
- bitso fetchMarkets precise [#8947](https://github.com/ccxt/ccxt/pull/8947)
- tidex fetchMarkets precise [#8950](https://github.com/ccxt/ccxt/pull/8950)
- python silence web3 warning [#8949](https://github.com/ccxt/ccxt/pull/8949)
- Fixed Typo [#8951](https://github.com/ccxt/ccxt/pull/8951)
- fix safeOrder bug [#8955](https://github.com/ccxt/ccxt/pull/8955)
- kuna update quotes [#8963](https://github.com/ccxt/ccxt/pull/8963)
- indodax parseOrders fix [#8958](https://github.com/ccxt/ccxt/pull/8958)
- hitbtc fetchMarkets precise [#8959](https://github.com/ccxt/ccxt/pull/8959)
- gopax fetchMarkets precise [#8960](https://github.com/ccxt/ccxt/pull/8960)
- exmo fetchMarkets precise [#8961](https://github.com/ccxt/ccxt/pull/8961)
- aofex safeOrder [#8965](https://github.com/ccxt/ccxt/pull/8965)
- btcbox safeOrder [#8966](https://github.com/ccxt/ccxt/pull/8966)
- btcmarkets safeOrder [#8967](https://github.com/ccxt/ccxt/pull/8967)
- idex fetchCurrencies fix [#8981](https://github.com/ccxt/ccxt/pull/8981)
- idex remove redundant code [#8969](https://github.com/ccxt/ccxt/pull/8969)
- yobit COIN, JWL mapping [#8974](https://github.com/ccxt/ccxt/pull/8974)
- buda safeOrder [#8968](https://github.com/ccxt/ccxt/pull/8968)
- coinmate safeOrder [#8970](https://github.com/ccxt/ccxt/pull/8970)
- Binance deprecate some wapi endpoints [#8953](https://github.com/ccxt/ccxt/pull/8953)
- gateio new endpoints [#8976](https://github.com/ccxt/ccxt/pull/8976)
- cex parseTrade precise [#8978](https://github.com/ccxt/ccxt/pull/8978)
- zb fetchMarkets number [#8979](https://github.com/ccxt/ccxt/pull/8979)
- wavesexchange parseTrade precise [#8975](https://github.com/ccxt/ccxt/pull/8975)
- mercado priceLimit fix [#8983](https://github.com/ccxt/ccxt/pull/8983)
- bitstamp fetchMarkets number [#8980](https://github.com/ccxt/ccxt/pull/8980)
- travis skip braziliex [#8989](https://github.com/ccxt/ccxt/pull/8989)
- fix safeOrder bug in php [#8990](https://github.com/ccxt/ccxt/pull/8990)
- latoken-fetchMarkets [#8982](https://github.com/ccxt/ccxt/pull/8982)
- implement bitbank fetchMarkets [#8985](https://github.com/ccxt/ccxt/pull/8985)
- binance fetchMarkets String number support [#8962](https://github.com/ccxt/ccxt/pull/8962)
- gateio fetchMarkets [#8991](https://github.com/ccxt/ccxt/pull/8991)
- yobit MIS mapping [#8992](https://github.com/ccxt/ccxt/pull/8992)
- hbtc MIS mapping [#8993](https://github.com/ccxt/ccxt/pull/8993)
- remove price and cost limits from fetchCurrencies [#8984](https://github.com/ccxt/ccxt/pull/8984)
- binance withdraw deprecate wapi [#8987](https://github.com/ccxt/ccxt/pull/8987)
- binance fetchWithdrawals and fetchDeposits wapi deprecated [#8988](https://github.com/ccxt/ccxt/pull/8988)
- Update binance.js [#8997](https://github.com/ccxt/ccxt/pull/8997)
- qtrade error handle [#8998](https://github.com/ccxt/ccxt/pull/8998)


## 1.46.1

- fix minPrice type in crex24 fetch_markets [#8805](https://github.com/ccxt/ccxt/pull/8805)
- update composer.lock (remove react) [#8807](https://github.com/ccxt/ccxt/pull/8807)
- poloniex precise [#8811](https://github.com/ccxt/ccxt/pull/8811)
- probit precise [#8812](https://github.com/ccxt/ccxt/pull/8812)
- qtrade precise [#8813](https://github.com/ccxt/ccxt/pull/8813)
- bitfinex2 safeOrder [#8815](https://github.com/ccxt/ccxt/pull/8815)
- python3 appveyor [#8810](https://github.com/ccxt/ccxt/pull/8810)
- bitpanda-safeOrder [#8817](https://github.com/ccxt/ccxt/pull/8817)
- bitvavo safeOrder [#8819](https://github.com/ccxt/ccxt/pull/8819)
- Precise fix for zero [#8825](https://github.com/ccxt/ccxt/pull/8825)
- bitz safeOrder [#8823](https://github.com/ccxt/ccxt/pull/8823)
- aax parseTrade fix [#8826](https://github.com/ccxt/ccxt/pull/8826)
- aofex precise [#8827](https://github.com/ccxt/ccxt/pull/8827)
- bibox precise [#8828](https://github.com/ccxt/ccxt/pull/8828)
- bigone precise [#8830](https://github.com/ccxt/ccxt/pull/8830)
- ascendex precise [#8831](https://github.com/ccxt/ccxt/pull/8831)
- bit2c precise [#8832](https://github.com/ccxt/ccxt/pull/8832)
- bitbank precise [#8833](https://github.com/ccxt/ccxt/pull/8833)
- bitfinex precise [#8834](https://github.com/ccxt/ccxt/pull/8834)
- bitflyer precise [#8835](https://github.com/ccxt/ccxt/pull/8835)
- bitforex precise [#8836](https://github.com/ccxt/ccxt/pull/8836)
- btctradeua precise [#8839](https://github.com/ccxt/ccxt/pull/8839)
- brazillex precise [#8837](https://github.com/ccxt/ccxt/pull/8837)
- bl3p precise [#8838](https://github.com/ccxt/ccxt/pull/8838)
- coingi precise [#8847](https://github.com/ccxt/ccxt/pull/8847)
- fcoin precise [#8865](https://github.com/ccxt/ccxt/pull/8865)
- foxbit precise [#8863](https://github.com/ccxt/ccxt/pull/8863)
- flowbtc precise [#8864](https://github.com/ccxt/ccxt/pull/8864)
- coinmate precise [#8848](https://github.com/ccxt/ccxt/pull/8848)
- coinone precise [#8853](https://github.com/ccxt/ccxt/pull/8853)
- coincheck precise [#8845](https://github.com/ccxt/ccxt/pull/8845)
- coinfalcon precise [#8850](https://github.com/ccxt/ccxt/pull/8850)
- coinex precise [#8851](https://github.com/ccxt/ccxt/pull/8851)
- crex24 precise [#8859](https://github.com/ccxt/ccxt/pull/8859)
- exx precise [#8861](https://github.com/ccxt/ccxt/pull/8861)
- coinspot precise [#8854](https://github.com/ccxt/ccxt/pull/8854)
- coinegg precise [#8852](https://github.com/ccxt/ccxt/pull/8852)
- coinbase precise [#8843](https://github.com/ccxt/ccxt/pull/8843)
- delta precise [#8857](https://github.com/ccxt/ccxt/pull/8857)
- bw precise [#8841](https://github.com/ccxt/ccxt/pull/8841)
- coinfloor precise [#8849](https://github.com/ccxt/ccxt/pull/8849)
- deribit precise [#8856](https://github.com/ccxt/ccxt/pull/8856)
- btcalpha precise [#8840](https://github.com/ccxt/ccxt/pull/8840)
- eterbase precise [#8866](https://github.com/ccxt/ccxt/pull/8866)
- ftx precise [#8862](https://github.com/ccxt/ccxt/pull/8862)
- currencycom precise [#8858](https://github.com/ccxt/ccxt/pull/8858)
- digifinex precise [#8855](https://github.com/ccxt/ccxt/pull/8855)
- coinbasepro precise [#8844](https://github.com/ccxt/ccxt/pull/8844)
- binance precise [#8829](https://github.com/ccxt/ccxt/pull/8829)
- fix php autoloading psr4 [#8808](https://github.com/ccxt/ccxt/pull/8808)
- hbtc precise [#8870](https://github.com/ccxt/ccxt/pull/8870)
- hollaex precise [#8871](https://github.com/ccxt/ccxt/pull/8871)
- lbank precise [#8884](https://github.com/ccxt/ccxt/pull/8884)
- kuna precise [#8882](https://github.com/ccxt/ccxt/pull/8882)
- liquid precise [#8883](https://github.com/ccxt/ccxt/pull/8883)
- bitz new endpoints [#8888](https://github.com/ccxt/ccxt/pull/8888)
- gemini precise [#8874](https://github.com/ccxt/ccxt/pull/8874)
- indodax precise [#8879](https://github.com/ccxt/ccxt/pull/8879)
- hitbtc precise [#8872](https://github.com/ccxt/ccxt/pull/8872)
- independentreserve precise [#8880](https://github.com/ccxt/ccxt/pull/8880)


## 1.45.1

- Fix to transpile.js for indexOf [#8738](https://github.com/ccxt/ccxt/pull/8738)
- [Hitbtc] Fix order avgPrice parsing [#8744](https://github.com/ccxt/ccxt/pull/8744)
- gateio safeInteger [#8745](https://github.com/ccxt/ccxt/pull/8745)
- delist chilebit [#8743](https://github.com/ccxt/ccxt/pull/8743)
- gateio BIFI mapping [#8746](https://github.com/ccxt/ccxt/pull/8746)
- Bump y18n from 4.0.0 to 4.0.1 [#8747](https://github.com/ccxt/ccxt/pull/8747)
- add new linear symbols [#8753](https://github.com/ccxt/ccxt/pull/8753)
- parseBidAsk use safeNumber [#8755](https://github.com/ccxt/ccxt/pull/8755)
- huobipro-safeOrder [#8758](https://github.com/ccxt/ccxt/pull/8758)
- digifinex is_allow [#8761](https://github.com/ccxt/ccxt/pull/8761)
- bybit-safeOrder [#8757](https://github.com/ccxt/ccxt/pull/8757)
- Bitstamp safeOrder [#8756](https://github.com/ccxt/ccxt/pull/8756)
- liquid error handling [#8764](https://github.com/ccxt/ccxt/pull/8764)
- binance-safeOrder [#8763](https://github.com/ccxt/ccxt/pull/8763)
- Fix composer issues [#8765](https://github.com/ccxt/ccxt/pull/8765)
- tidex safeOrder [#8771](https://github.com/ccxt/ccxt/pull/8771)
- phemex active markets [#8770](https://github.com/ccxt/ccxt/pull/8770)
- Mercado safe order [#8768](https://github.com/ccxt/ccxt/pull/8768)
- Precise number representation [#8630](https://github.com/ccxt/ccxt/pull/8630)
- Precise transpile [#8775](https://github.com/ccxt/ccxt/pull/8775)
- minor transpile edit [#8776](https://github.com/ccxt/ccxt/pull/8776)
- xena precise [#8774](https://github.com/ccxt/ccxt/pull/8774)
- zb change hostname [#8779](https://github.com/ccxt/ccxt/pull/8779)
- fix-build [#8780](https://github.com/ccxt/ccxt/pull/8780)
- fix travis php [#8782](https://github.com/ccxt/ccxt/pull/8782)
- zaif-precise [#8773](https://github.com/ccxt/ccxt/pull/8773)
- probit AUTO mapping [#8796](https://github.com/ccxt/ccxt/pull/8796)
- yobit ONX mapping [#8797](https://github.com/ccxt/ccxt/pull/8797)


## 1.44.1

- kucoin implement transfer [#8701](https://github.com/ccxt/ccxt/pull/8701)
- fix: TypeError count(): Argument #1 ($value) must be of type Countabl… [#8703](https://github.com/ccxt/ccxt/pull/8703)
- fix ftx stop safeFloat [#8708](https://github.com/ccxt/ccxt/pull/8708)
- add has transfer to kucoin [#8709](https://github.com/ccxt/ccxt/pull/8709)
- parse floats as strings [#8628](https://github.com/ccxt/ccxt/pull/8628)
- fix fix !== [#8712](https://github.com/ccxt/ccxt/pull/8712)
- remove unused method unjson [#8716](https://github.com/ccxt/ccxt/pull/8716)
- add number factory [#8710](https://github.com/ccxt/ccxt/pull/8710)
- orderbook parse numbers with indirection [#8718](https://github.com/ccxt/ccxt/pull/8718)
- add default kwarg to safeNumber [#8728](https://github.com/ccxt/ccxt/pull/8728)
- Delist acx [#8727](https://github.com/ccxt/ccxt/pull/8727)
- transpile safeNumber2 -> safe_number_2 [#8729](https://github.com/ccxt/ccxt/pull/8729)
- binance listenKey edits in sign [#8730](https://github.com/ccxt/ccxt/pull/8730)
- bitbank-safeNumber [#8721](https://github.com/ccxt/ccxt/pull/8721)
- bit2c-safeNumber [#8723](https://github.com/ccxt/ccxt/pull/8723)
- bibox-safeNumber [#8724](https://github.com/ccxt/ccxt/pull/8724)
- ascendex-safeNumber [#8725](https://github.com/ccxt/ccxt/pull/8725)
- bigone-safeNumber [#8722](https://github.com/ccxt/ccxt/pull/8722)
- aofex-safeNumber [#8726](https://github.com/ccxt/ccxt/pull/8726)
- aax safeNumber [#8731](https://github.com/ccxt/ccxt/pull/8731)
- bitbay safeNumber [#8732](https://github.com/ccxt/ccxt/pull/8732)
- stex MPH mapping [#8734](https://github.com/ccxt/ccxt/pull/8734)


## 1.43.1

- add binance endpoints [#8632](https://github.com/ccxt/ccxt/pull/8632)
- Added support for new coins on Bitstamp [#8631](https://github.com/ccxt/ccxt/pull/8631)
- crex24 error handling [#8633](https://github.com/ccxt/ccxt/pull/8633)
- safeOrder add price check [#8637](https://github.com/ccxt/ccxt/pull/8637)
- Safe order fees load from fee [#8658](https://github.com/ccxt/ccxt/pull/8658)
- coinex safeOrder [#8638](https://github.com/ccxt/ccxt/pull/8638)
- coincheck safeOrder [#8639](https://github.com/ccxt/ccxt/pull/8639)
- coinegg safeOrder [#8640](https://github.com/ccxt/ccxt/pull/8640)
- coinfalcon safeOrder [#8641](https://github.com/ccxt/ccxt/pull/8641)
- coinone safeOrder [#8642](https://github.com/ccxt/ccxt/pull/8642)
- binance fetchPositions default to futures [#8661](https://github.com/ccxt/ccxt/pull/8661)
- crex24 safeOrder [#8643](https://github.com/ccxt/ccxt/pull/8643)
- coinbase safeOrder [#8645](https://github.com/ccxt/ccxt/pull/8645)
- hollaex safeOrder [#8646](https://github.com/ccxt/ccxt/pull/8646)
- bw safeOrder [#8648](https://github.com/ccxt/ccxt/pull/8648)
- reduce fees default to true [#8663](https://github.com/ccxt/ccxt/pull/8663)
- deribit safeOrder [#8649](https://github.com/ccxt/ccxt/pull/8649)
- exx safeOrder [#8650](https://github.com/ccxt/ccxt/pull/8650)
- gateio safeOrder [#8651](https://github.com/ccxt/ccxt/pull/8651)
- gemini safeOrder [#8652](https://github.com/ccxt/ccxt/pull/8652)
- gopax safeOrder [#8655](https://github.com/ccxt/ccxt/pull/8655)
- fcoin safeOrder [#8653](https://github.com/ccxt/ccxt/pull/8653)
- independentreserve safeOrder [#8654](https://github.com/ccxt/ccxt/pull/8654)
- kraken safeOrder [#8657](https://github.com/ccxt/ccxt/pull/8657)
- delist ice3x [#8660](https://github.com/ccxt/ccxt/pull/8660)
- currencycom safeOrder [#8644](https://github.com/ccxt/ccxt/pull/8644)
- qtrade safeOrder [#8659](https://github.com/ccxt/ccxt/pull/8659)
- hitbtc safeOrder [#8647](https://github.com/ccxt/ccxt/pull/8647)
- add python ccxtpro example [#8668](https://github.com/ccxt/ccxt/pull/8668)
- binance support internal transfers [#8675](https://github.com/ccxt/ccxt/pull/8675)
- add internal transfer hitbtc [#8682](https://github.com/ccxt/ccxt/pull/8682)
- fixed nonce error on every private api call [#8683](https://github.com/ccxt/ccxt/pull/8683)
- change fetchPositions signature [#8687](https://github.com/ccxt/ccxt/pull/8687)
- bibox safeOrder fixes [#8688](https://github.com/ccxt/ccxt/pull/8688)
- coinfloor safeOrder [#8691](https://github.com/ccxt/ccxt/pull/8691)
- bitfinex safeOrder [#8689](https://github.com/ccxt/ccxt/pull/8689)
- add bybit fetchPositions [#8690](https://github.com/ccxt/ccxt/pull/8690)
- delist dsx [#8692](https://github.com/ccxt/ccxt/pull/8692)
- Bitfinex v1 implement transfer [#8693](https://github.com/ccxt/ccxt/pull/8693)


## 1.42.1

- bitmart CPC mapping [#8518](https://github.com/ccxt/ccxt/pull/8518)
- aofex CPC mapping [#8519](https://github.com/ccxt/ccxt/pull/8519)
- [binance] error mapping [#8520](https://github.com/ccxt/ccxt/pull/8520)
- change behaviour of tail with since + limit defined in pro [#8521](https://github.com/ccxt/ccxt/pull/8521)
- zb new endpoints [#8527](https://github.com/ccxt/ccxt/pull/8527)
- php base class methods [#8528](https://github.com/ccxt/ccxt/pull/8528)
- probit error handle [#8531](https://github.com/ccxt/ccxt/pull/8531)
- zb fetchClosedOrders [#8530](https://github.com/ccxt/ccxt/pull/8530)
- Add snapshot endopoint on bitfinex2 [#8535](https://github.com/ccxt/ccxt/pull/8535)
- bithumb add tag for EOS and STEEM [#8545](https://github.com/ccxt/ccxt/pull/8545)
- rewrite parseOhlcvs and fix #8445 [#8548](https://github.com/ccxt/ccxt/pull/8548)
- Make other methods follow rule in #8548 [#8549](https://github.com/ccxt/ccxt/pull/8549)
- Fix eslint error (arrow function argument parenteses) [#8550](https://github.com/ccxt/ccxt/pull/8550)
- IndependentReserve - fix symbol in trade parse [#8551](https://github.com/ccxt/ccxt/pull/8551)
- [bybit] Comment fix on time difference [#8555](https://github.com/ccxt/ccxt/pull/8555)
- bitkk BCH conflict [#8556](https://github.com/ccxt/ccxt/pull/8556)
- Poloniex remove outdated orders cache [#8557](https://github.com/ccxt/ccxt/pull/8557)
- Bump elliptic from 6.5.3 to 6.5.4 [#8562](https://github.com/ccxt/ccxt/pull/8562)
- timex createOrder type [#8564](https://github.com/ccxt/ccxt/pull/8564)
- Add Trigger price too high/low to FTX exceptions [#8566](https://github.com/ccxt/ccxt/pull/8566)
- add documentation for newUpdates mode [#8568](https://github.com/ccxt/ccxt/pull/8568)
- Safe Order [#8559](https://github.com/ccxt/ccxt/pull/8559)
- Add ExchangeId type to ccxt.d.ts [#8542](https://github.com/ccxt/ccxt/pull/8542)
- kucoin safeOrder [#8573](https://github.com/ccxt/ccxt/pull/8573)
- acx safeOrder [#8575](https://github.com/ccxt/ccxt/pull/8575)
- Bigone safeOrder [#8577](https://github.com/ccxt/ccxt/pull/8577)
- Bitbank safeOrder [#8578](https://github.com/ccxt/ccxt/pull/8578)
- bitflyer safeOrder [#8579](https://github.com/ccxt/ccxt/pull/8579)
- bitbay safeOrder [#8580](https://github.com/ccxt/ccxt/pull/8580)
- bitmex safeOrder [#8581](https://github.com/ccxt/ccxt/pull/8581)
- bitso safeOrder [#8582](https://github.com/ccxt/ccxt/pull/8582)
- bitget safeOrder [#8583](https://github.com/ccxt/ccxt/pull/8583)
- bitforex safeOrder [#8585](https://github.com/ccxt/ccxt/pull/8585)
- bittrex safeOrder [#8584](https://github.com/ccxt/ccxt/pull/8584)
- delta safeOrder [#8586](https://github.com/ccxt/ccxt/pull/8586)
- Digifinex safeOrder [#8588](https://github.com/ccxt/ccxt/pull/8588)
- equos safeOrder [#8589](https://github.com/ccxt/ccxt/pull/8589)
- delist vaultoro [#8591](https://github.com/ccxt/ccxt/pull/8591)
- zb safeOrder [#8595](https://github.com/ccxt/ccxt/pull/8595)
- zaif safeOrder [#8596](https://github.com/ccxt/ccxt/pull/8596)
- yobit safeOrder [#8597](https://github.com/ccxt/ccxt/pull/8597)
- digifinex: update ticker api to v3 [#8593](https://github.com/ccxt/ccxt/pull/8593)
- add support for postionRisk to fetchPositions binance [#8600](https://github.com/ccxt/ccxt/pull/8600)


## 1.41.1

- [okex] error mapping [#8389](https://github.com/ccxt/ccxt/pull/8389)
- binance fetch deposit address [#8393](https://github.com/ccxt/ccxt/pull/8393)
- ftx parseTransactions internal transfer [#8394](https://github.com/ccxt/ccxt/pull/8394)
- [bitbank] Support new pair & bug fix [#8395](https://github.com/ccxt/ccxt/pull/8395)
- IDEX support BSC [#8405](https://github.com/ccxt/ccxt/pull/8405)
- kucoin: switch to api v2 for orderbook [#8407](https://github.com/ccxt/ccxt/pull/8407)
- Phemex - new private API end point [#8432](https://github.com/ccxt/ccxt/pull/8432)
- coinbasepro add destination tag to withdraw [#8421](https://github.com/ccxt/ccxt/pull/8421)
- gateio fix queryDepositAddress for currencies with a tag [#8435](https://github.com/ccxt/ccxt/pull/8435)
- kucoin NIM address error [#8434](https://github.com/ccxt/ccxt/pull/8434)
- createOrder better signature [#8425](https://github.com/ccxt/ccxt/pull/8425)
- ccxt.pro php update examples [#8422](https://github.com/ccxt/ccxt/pull/8422)
- update ccxtpro php docs [#8433](https://github.com/ccxt/ccxt/pull/8433)
- Bibox error handling [#8440](https://github.com/ccxt/ccxt/pull/8440)
- Bitfinex balance type matches walletselected type in fetchDepositAddress [#8413](https://github.com/ccxt/ccxt/pull/8413)
- coinex new endpoints [#8453](https://github.com/ccxt/ccxt/pull/8453)
- [binance] fix makerOrTaker in parseTrade [#8417](https://github.com/ccxt/ccxt/pull/8417)
- Update kucoin fetch closed orders example [#8460](https://github.com/ccxt/ccxt/pull/8460)
- Add REST response intercept [#8459](https://github.com/ccxt/ccxt/pull/8459)
- timeframe 4h for bitfinex [#8470](https://github.com/ccxt/ccxt/pull/8470)
- Update bitfinex.js  [#8469](https://github.com/ccxt/ccxt/pull/8469)
- filterBySymbolSinceLimit propagate tail [#8474](https://github.com/ccxt/ccxt/pull/8474)
- export python tests for ccxtpro [#8472](https://github.com/ccxt/ccxt/pull/8472)
- [okex] improved error mapping [#8477](https://github.com/ccxt/ccxt/pull/8477)


## 1.40.1

- [ftx] error mapping [#8237](https://github.com/ccxt/ccxt/pull/8237)
- [hitbtc] symbol mapping [#8267](https://github.com/ccxt/ccxt/pull/8267)
- [yobit] symbol mapping [#8266](https://github.com/ccxt/ccxt/pull/8266)
- [ftx] error mapping [#8279](https://github.com/ccxt/ccxt/pull/8279)
- [huobi] added missing path [#8283](https://github.com/ccxt/ccxt/pull/8283)
- Fix Windows build [#8288](https://github.com/ccxt/ccxt/pull/8288)
- Only transpile files which have changed [#8291](https://github.com/ccxt/ccxt/pull/8291)
- huobi error handling [#8314](https://github.com/ccxt/ccxt/pull/8314)
- remove unused php method [#8323](https://github.com/ccxt/ccxt/pull/8323)
- SBTC mapping [#8318](https://github.com/ccxt/ccxt/pull/8318)
- delist bcex [#8319](https://github.com/ccxt/ccxt/pull/8319)
- bitmart update fees [#8336](https://github.com/ccxt/ccxt/pull/8336)
- [gateio] added fee to parseTransaction [#8335](https://github.com/ccxt/ccxt/pull/8335)
- Bittrex fee update [#8337](https://github.com/ccxt/ccxt/pull/8337)
- bitmart COT mapping [#8341](https://github.com/ccxt/ccxt/pull/8341)


## 1.39.1

- Bitmart improvements [#8123](https://github.com/ccxt/ccxt/pull/8123)
- bitmart: cancelOrder: fix alternative spot response [#8130](https://github.com/ccxt/ccxt/pull/8130)
- transpile: fix is not True in python [#8131](https://github.com/ccxt/ccxt/pull/8131)
- Adding Gopax exchange to CCXT [#8065](https://github.com/ccxt/ccxt/pull/8065)
- positions manual [#8128](https://github.com/ccxt/ccxt/pull/8128)
- Binance leveraged tokens and universal transfer implicit methods [#8147](https://github.com/ccxt/ccxt/pull/8147)
- Updata bibox fetchCurrencies [#8153](https://github.com/ccxt/ccxt/pull/8153)
- manual changes [#8157](https://github.com/ccxt/ccxt/pull/8157)
- add autogenerating links to the manual [#8158](https://github.com/ccxt/ccxt/pull/8158)
- Add BCH into the linear asset list in bybit python file. [#8167](https://github.com/ccxt/ccxt/pull/8167)
- use expired status in binance order statuses [#8170](https://github.com/ccxt/ccxt/pull/8170)
- bitforex HBC mapping [#8168](https://github.com/ccxt/ccxt/pull/8168)
- probit HBC mapping [#8169](https://github.com/ccxt/ccxt/pull/8169)
- mercado trades/orders methods [#8166](https://github.com/ccxt/ccxt/pull/8166)
- Implement coinspot cancelOrder [#8188](https://github.com/ccxt/ccxt/pull/8188)
- Add fetchOHLCV to bithumb [#8189](https://github.com/ccxt/ccxt/pull/8189)


## 1.38.1

- fix asyncio.TimeoutError being thrown [#8060](https://github.com/ccxt/ccxt/pull/8060)
- Add new exchange vcc.exchange [#7984](https://github.com/ccxt/ccxt/pull/7984)
- Change node url for waves.exchange [#8066](https://github.com/ccxt/ccxt/pull/8066)
- Bybit clientOrderId on createOrder [#8071](https://github.com/ccxt/ccxt/pull/8071)
- bitforex error mapping [#8075](https://github.com/ccxt/ccxt/pull/8075)
- phemex typo fix [#8076](https://github.com/ccxt/ccxt/pull/8076)
- bibox TERN mapping [#8081](https://github.com/ccxt/ccxt/pull/8081)
- Fix ZeroDivisionError in async python throttle when ratelimit is 0 [#8085](https://github.com/ccxt/ccxt/pull/8085)
- Kraken - Throw rate limit error [#8087](https://github.com/ccxt/ccxt/pull/8087)
- livecoin TCT mapping [#8101](https://github.com/ccxt/ccxt/pull/8101)


## 1.37.1

- [btcmarkets] fixed net amount for transactions [#7948](https://github.com/ccxt/ccxt/pull/7948)
- stronghold exchange delisted [#7959](https://github.com/ccxt/ccxt/pull/7959)
- Update bytetrade.js [#7966](https://github.com/ccxt/ccxt/pull/7966)
- bytetrade move precision [#7973](https://github.com/ccxt/ccxt/pull/7973)
- fix hasFetchBalance return value for bitfinex2 [#7974](https://github.com/ccxt/ccxt/pull/7974)
- [coinmate] fix parse transaction [#7976](https://github.com/ccxt/ccxt/pull/7976)
- Coinspot: add missing read-only endpoints [#7980](https://github.com/ccxt/ccxt/pull/7980)
- Making all the options optional for Exchange class in type definitions file [#7983](https://github.com/ccxt/ccxt/pull/7983)


## 1.36.1

- stex safeSymbol [#7794](https://github.com/ccxt/ccxt/pull/7794)
- hollaex safeSymbol [#7795](https://github.com/ccxt/ccxt/pull/7795)
- travis fix [#7800](https://github.com/ccxt/ccxt/pull/7800)
- Bitfinex RBT mapping [#7798](https://github.com/ccxt/ccxt/pull/7798)
- huobipro safeSymbol [#7796](https://github.com/ccxt/ccxt/pull/7796)
- remove unused file [#7793](https://github.com/ccxt/ccxt/pull/7793)
- poloniex remove order cache [#7792](https://github.com/ccxt/ccxt/pull/7792)
- remove purgeCachedOrders [#7797](https://github.com/ccxt/ccxt/pull/7797)
- Coins mapping [#7802](https://github.com/ccxt/ccxt/pull/7802)
- Bitfinex - Add COMP LINK and TUSD [#7803](https://github.com/ccxt/ccxt/pull/7803)
- Bibox BOX mapping [#7804](https://github.com/ccxt/ccxt/pull/7804)
- Currency.com IQ mapping [#7805](https://github.com/ccxt/ccxt/pull/7805)
- Okex BOX mapping [#7806](https://github.com/ccxt/ccxt/pull/7806)
- [bittrex] fixed transaction status [#7807](https://github.com/ccxt/ccxt/pull/7807)
- ZB errors [#7808](https://github.com/ccxt/ccxt/pull/7808)
- hitbtc safeSymbol [#7810](https://github.com/ccxt/ccxt/pull/7810)
- fcoin safeSymbol [#7811](https://github.com/ccxt/ccxt/pull/7811)
- bitmart safeSymbol [#7812](https://github.com/ccxt/ccxt/pull/7812)
- bluetrade safeSymbol [#7813](https://github.com/ccxt/ccxt/pull/7813)
- HitBTC coins mapping [#7814](https://github.com/ccxt/ccxt/pull/7814)
- bitbay safeMarket [#7815](https://github.com/ccxt/ccxt/pull/7815)
- Coinfalcon fetchOpenOrders fix [#7820](https://github.com/ccxt/ccxt/pull/7820)
- lakebtc safeMarket [#7817](https://github.com/ccxt/ccxt/pull/7817)
- UNI, PUT mapping [#7818](https://github.com/ccxt/ccxt/pull/7818)
- save baseid info in safeMarket [#7816](https://github.com/ccxt/ccxt/pull/7816)
- cleanup base class fetch a little bit [#7824](https://github.com/ccxt/ccxt/pull/7824)
- Update python version in tox and pypi classifiers [#7828](https://github.com/ccxt/ccxt/pull/7828)
- remove idex v1 and add support for idex.io mainnet [#7838](https://github.com/ccxt/ccxt/pull/7838)
- Probit CBC mapping [#7841](https://github.com/ccxt/ccxt/pull/7841)
- Add USDC and LINK address and withdrawal to Bitstamp [#7836](https://github.com/ccxt/ccxt/pull/7836)
- fix idex associateWallet bug #7842 [#7843](https://github.com/ccxt/ccxt/pull/7843)
- async py tests on travis [#7835](https://github.com/ccxt/ccxt/pull/7835)
- Lykke precisions [#7846](https://github.com/ccxt/ccxt/pull/7846)
- Binance BSWAP support [#7852](https://github.com/ccxt/ccxt/pull/7852)
- Fix PSR-4 erros reports for php [#7832](https://github.com/ccxt/ccxt/pull/7832)
- Okex parseMyTrade fix rebate case [#7856](https://github.com/ccxt/ccxt/pull/7856)
- Update README.md [#7857](https://github.com/ccxt/ccxt/pull/7857)
- Bump aiohttp version [#7859](https://github.com/ccxt/ccxt/pull/7859)
- IDEX add support for client order id [#7862](https://github.com/ccxt/ccxt/pull/7862)
- Fix hitbtc createOrder  response parsing field feeCurrencyCode [#7866](https://github.com/ccxt/ccxt/pull/7866)
- Add OMG support [#7869](https://github.com/ccxt/ccxt/pull/7869)
- make the fee rate configurable [#7870](https://github.com/ccxt/ccxt/pull/7870)
- Okex parseMyTrade refix [#7860](https://github.com/ccxt/ccxt/pull/7860)
- Add bitcoincom exchange [#7868](https://github.com/ccxt/ccxt/pull/7868)
- Bump aiohttp version [#7872](https://github.com/ccxt/ccxt/pull/7872)
- coinbase pro fetchTransactions code undefined [#7877](https://github.com/ccxt/ccxt/pull/7877)
- [hitbtc] fix missing fee currency [#7879](https://github.com/ccxt/ccxt/pull/7879)
- Allow never versions of aiodns [#7880](https://github.com/ccxt/ccxt/pull/7880)
- coinbase pro - add support for fetchWithdrawals and fetchDeposits [#7881](https://github.com/ccxt/ccxt/pull/7881)


## 1.35.1

- zb safeSymbol [#7695](https://github.com/ccxt/ccxt/pull/7695)
- zaif safeSymbol [#7696](https://github.com/ccxt/ccxt/pull/7696)
- xena safeSymbol [#7697](https://github.com/ccxt/ccxt/pull/7697)
- yobit safeSymbol [#7698](https://github.com/ccxt/ccxt/pull/7698)
- timex safeSymbol [#7699](https://github.com/ccxt/ccxt/pull/7699)
- therock safeSymbol [#7701](https://github.com/ccxt/ccxt/pull/7701)
- qtrade safeSymbol [#7702](https://github.com/ccxt/ccxt/pull/7702)
- phemex safeSymbol [#7703](https://github.com/ccxt/ccxt/pull/7703)
- [kucoin] fetchCurrencies active flag [#7706](https://github.com/ccxt/ccxt/pull/7706)
- probit safeSymbol [#7705](https://github.com/ccxt/ccxt/pull/7705)
- novadax safeSymbol [#7704](https://github.com/ccxt/ccxt/pull/7704)
- safeSymbol support returning market structure [#7693](https://github.com/ccxt/ccxt/pull/7693)
- GHOSTPRISM mapping [#7711](https://github.com/ccxt/ccxt/pull/7711)
- ripio safeMarket [#7714](https://github.com/ccxt/ccxt/pull/7714)
- coincheck safeSymbol [#7715](https://github.com/ccxt/ccxt/pull/7715)
- rightbtc safeSymbol [#7716](https://github.com/ccxt/ccxt/pull/7716)
- coinfalcon safeSymbol [#7717](https://github.com/ccxt/ccxt/pull/7717)
- coinbasepro safeSymbol [#7719](https://github.com/ccxt/ccxt/pull/7719)
- whitebit safeMarket [#7720](https://github.com/ccxt/ccxt/pull/7720)
- bw safeSymbol [#7721](https://github.com/ccxt/ccxt/pull/7721)
- coinex safeMarket [#7722](https://github.com/ccxt/ccxt/pull/7722)
- eterbase safeSymbol [#7724](https://github.com/ccxt/ccxt/pull/7724)
- livecoin safeMarket [#7725](https://github.com/ccxt/ccxt/pull/7725)
- upbit safeMarket [#7726](https://github.com/ccxt/ccxt/pull/7726)
- deribit safeMarket [#7727](https://github.com/ccxt/ccxt/pull/7727)
- coss safeSymbol [#7728](https://github.com/ccxt/ccxt/pull/7728)
- buda safeSymbol [#7729](https://github.com/ccxt/ccxt/pull/7729)
- mercado safeSymbol [#7730](https://github.com/ccxt/ccxt/pull/7730)
- bitflyer safeSymbol [#7731](https://github.com/ccxt/ccxt/pull/7731)
- coinmate safeSymbol [#7737](https://github.com/ccxt/ccxt/pull/7737)
- digifinex safeSymbol [#7732](https://github.com/ccxt/ccxt/pull/7732)
- oceanex safeSymbol [#7736](https://github.com/ccxt/ccxt/pull/7736)
- aofex safeMarket [#7735](https://github.com/ccxt/ccxt/pull/7735)
- Add API end point for Deposits at Phemex [#7738](https://github.com/ccxt/ccxt/pull/7738)
- braziliex safeMarket [#7733](https://github.com/ccxt/ccxt/pull/7733)
- Poloniex safeSymbol (and yobit) [#7734](https://github.com/ccxt/ccxt/pull/7734)
- Add new Phemex API private endpoint [#7741](https://github.com/ccxt/ccxt/pull/7741)
- Bitstamp upgrade [#7613](https://github.com/ccxt/ccxt/pull/7613)
- there are maybe '@' in symbol, so split with @Id [#7746](https://github.com/ccxt/ccxt/pull/7746)
- [kucoin] added withdrawal fee [#7750](https://github.com/ccxt/ccxt/pull/7750)
- Coinfalcon filterOrdersByStatus [#7751](https://github.com/ccxt/ccxt/pull/7751)


## 1.34.1

- Add BadSymbol to manual error hierarchy [#7615](https://github.com/ccxt/ccxt/pull/7615)
- Digifinex fetchTicker/fetchTickers fix, new v3 endpoint [#7617](https://github.com/ccxt/ccxt/pull/7617)
- Fix bmex stop order issue. [#7616](https://github.com/ccxt/ccxt/pull/7616)
- fix for pro idexv2 [#7621](https://github.com/ccxt/ccxt/pull/7621)
- Add BSV to Bitfinex supported currency names [#7622](https://github.com/ccxt/ccxt/pull/7622)
- Improve error matches [#7623](https://github.com/ccxt/ccxt/pull/7623)
- add base method findTimeframe [#7626](https://github.com/ccxt/ccxt/pull/7626)
- CREDIT coin mapping [#7628](https://github.com/ccxt/ccxt/pull/7628)
- Handle additional python requests library errors [#7625](https://github.com/ccxt/ccxt/pull/7625)
- EXX DOS mapping [#7629](https://github.com/ccxt/ccxt/pull/7629)
- Upbit TON mapping [#7631](https://github.com/ccxt/ccxt/pull/7631)
- remove unnecessary decode when base64 encoding [#7634](https://github.com/ccxt/ccxt/pull/7634)
- Fixed spelling of Symbols [#7638](https://github.com/ccxt/ccxt/pull/7638)
- python remove handle_rest_response [#7635](https://github.com/ccxt/ccxt/pull/7635)
- idex2 logo updated [#7640](https://github.com/ccxt/ccxt/pull/7640)
- delegate fetchMyTrades method gateio [#7642](https://github.com/ccxt/ccxt/pull/7642)
- Bittrex api v3 [#7519](https://github.com/ccxt/ccxt/pull/7519)
- undo while loop transpilation [#7649](https://github.com/ccxt/ccxt/pull/7649)
- safeSymbol implementation [#7600](https://github.com/ccxt/ccxt/pull/7600)
- bigone safeSymbol [#7652](https://github.com/ccxt/ccxt/pull/7652)
- Okex 33085 handling [#7651](https://github.com/ccxt/ccxt/pull/7651)
- bitso safeSymbol [#7660](https://github.com/ccxt/ccxt/pull/7660)
- acx safeSymbol [#7654](https://github.com/ccxt/ccxt/pull/7654)
- bitbay safeSymbol [#7655](https://github.com/ccxt/ccxt/pull/7655)
- bitpanda safeSymbol [#7659](https://github.com/ccxt/ccxt/pull/7659)
- bitmax safeSymbol [#7657](https://github.com/ccxt/ccxt/pull/7657)
- bitmart safeSymbol [#7656](https://github.com/ccxt/ccxt/pull/7656)
- bitmex safeSymbol [#7658](https://github.com/ccxt/ccxt/pull/7658)
- braziliex safeSymbol [#7663](https://github.com/ccxt/ccxt/pull/7663)
- bitz safeSymbol [#7664](https://github.com/ccxt/ccxt/pull/7664)
- bitvavo safeSymbol [#7665](https://github.com/ccxt/ccxt/pull/7665)
- crex24 safeSymbol [#7669](https://github.com/ccxt/ccxt/pull/7669)
- coingi safeSymbol [#7668](https://github.com/ccxt/ccxt/pull/7668)
- coinbase safeSymbol [#7667](https://github.com/ccxt/ccxt/pull/7667)
- binance safeSymbol [#7653](https://github.com/ccxt/ccxt/pull/7653)
- lykke safeSymbol [#7678](https://github.com/ccxt/ccxt/pull/7678)
- gateio safeSymbol [#7674](https://github.com/ccxt/ccxt/pull/7674)
- [cex] fix order status [#7672](https://github.com/ccxt/ccxt/pull/7672)
- luno safeSymbol [#7680](https://github.com/ccxt/ccxt/pull/7680)
- latoken safeSymbol [#7675](https://github.com/ccxt/ccxt/pull/7675)
- hollaex safeSymbol [#7676](https://github.com/ccxt/ccxt/pull/7676)
- livecoin safeSymbol [#7679](https://github.com/ccxt/ccxt/pull/7679)
- hbtc safeSymbol [#7677](https://github.com/ccxt/ccxt/pull/7677)


## 1.33.1

- huobipro parseTrade enhancement [#7489](https://github.com/ccxt/ccxt/pull/7489)
- Fix a few typos on CONTRIBUTING.md [#7490](https://github.com/ccxt/ccxt/pull/7490)
- Orders cache [#7492](https://github.com/ccxt/ccxt/pull/7492)
- kucoin invalid type [#7495](https://github.com/ccxt/ccxt/pull/7495)
- liquid new endpoint [#7493](https://github.com/ccxt/ccxt/pull/7493)
- more transpiled tests [#7485](https://github.com/ccxt/ccxt/pull/7485)
- Edit order for Bybit linear [#7499](https://github.com/ccxt/ccxt/pull/7499)
- bitmart: specify min cost [#7517](https://github.com/ccxt/ccxt/pull/7517)
- parse "triggered" order status as "closed" in FTX [#7525](https://github.com/ccxt/ccxt/pull/7525)
- fix httpAgentKeepAlive [#7531](https://github.com/ccxt/ccxt/pull/7531)
- qTrade fetchMyTrades fix [#7532](https://github.com/ccxt/ccxt/pull/7532)
- Add XRP/BTC pair to bitbank [#7535](https://github.com/ccxt/ccxt/pull/7535)
- eterbase BadSymbol handle [#7536](https://github.com/ccxt/ccxt/pull/7536)
- Bitbay GGC mapping [#7538](https://github.com/ccxt/ccxt/pull/7538)
- Handle OKEx request timeout errors (30044) [#7549](https://github.com/ccxt/ccxt/pull/7549)
- Bibox parseTrade feeCost fix [#7553](https://github.com/ccxt/ccxt/pull/7553)
- bybit parse conditional order status [#7555](https://github.com/ccxt/ccxt/pull/7555)
- Fix typo README.md [#7558](https://github.com/ccxt/ccxt/pull/7558)


## 1.32.1

- Metainfo updates [#7396](https://github.com/ccxt/ccxt/pull/7396)
- adds "futures/data" endpoint to the Binance futures API [#7395](https://github.com/ccxt/ccxt/pull/7395)
- Metainfo updates [#7400](https://github.com/ccxt/ccxt/pull/7400)
- Metainfo updates [#7409](https://github.com/ccxt/ccxt/pull/7409)
- Metainfo updates [#7410](https://github.com/ccxt/ccxt/pull/7410)
- New Exchange: bitget.com [#7203](https://github.com/ccxt/ccxt/pull/7203)
- PNT mapping [#7417](https://github.com/ccxt/ccxt/pull/7417)
- digifinex typo fix [#7418](https://github.com/ccxt/ccxt/pull/7418)
- fix: Okex parseFuturesAccount for free balance [#7419](https://github.com/ccxt/ccxt/pull/7419)
- Metainfo updates [#7420](https://github.com/ccxt/ccxt/pull/7420)
- idex FTT mapping [#7422](https://github.com/ccxt/ccxt/pull/7422)
- poloniex metainfo updates [#7424](https://github.com/ccxt/ccxt/pull/7424)
- fybse delisted [#7421](https://github.com/ccxt/ccxt/pull/7421)
- Create binance_futures_change_leverage.py [#7428](https://github.com/ccxt/ccxt/pull/7428)
- btcmarkets fetchTime, logo updated [#7434](https://github.com/ccxt/ccxt/pull/7434)
- [btcmarkets] new api (work in progress) [#7372](https://github.com/ccxt/ccxt/pull/7372)
- add python/php test_order tests [#7436](https://github.com/ccxt/ccxt/pull/7436)
- digifinex fetchStatus [#7438](https://github.com/ccxt/ccxt/pull/7438)
- kraken: fetchTickers: only query server for requested symbols [#7446](https://github.com/ccxt/ccxt/pull/7446)
- only allow some assets in waves.exchange fetchBalance [#7448](https://github.com/ccxt/ccxt/pull/7448)
- bithumb: use safeCurrencyCode in fetchMarkets [#7447](https://github.com/ccxt/ccxt/pull/7447)
- Fix typo in pro.manual [#7449](https://github.com/ccxt/ccxt/pull/7449)
- fix a numberToString bug [#7442](https://github.com/ccxt/ccxt/pull/7442)


## 1.31.1

- whitebit doc updated [#7280](https://github.com/ccxt/ccxt/pull/7280)
- coolcoin delisted [#7279](https://github.com/ccxt/ccxt/pull/7279)
- digifinex fetchTime [#7284](https://github.com/ccxt/ccxt/pull/7284)
- Coinbasepro endpoints [#7286](https://github.com/ccxt/ccxt/pull/7286)
- acx fetchTime [#7292](https://github.com/ccxt/ccxt/pull/7292)
- Lykke API V2 requests compatability support [#7274](https://github.com/ccxt/ccxt/pull/7274)
- gemini fetchTickers, adjust fetchTicker [#7188](https://github.com/ccxt/ccxt/pull/7188)
- stex fetchTime [#7297](https://github.com/ccxt/ccxt/pull/7297)
- acx metainfo updates [#7299](https://github.com/ccxt/ccxt/pull/7299)
- a couple of minor waves.exchange fixes [#7301](https://github.com/ccxt/ccxt/pull/7301)
- waves.exchange fee fixes for createOrder [#7302](https://github.com/ccxt/ccxt/pull/7302)
- Add fetchMarkets to indodax exchange, update url indodax documentation [#7182](https://github.com/ccxt/ccxt/pull/7182)
- anxpro metainfo updates [#7305](https://github.com/ccxt/ccxt/pull/7305)
- bigone metainfo updates [#7307](https://github.com/ccxt/ccxt/pull/7307)
- Adds build steps [#7124](https://github.com/ccxt/ccxt/pull/7124)
- Document average in the order structure [#7308](https://github.com/ccxt/ccxt/pull/7308)
- bibox metainfo updates [#7311](https://github.com/ccxt/ccxt/pull/7311)
- probit currencies mapping [#7321](https://github.com/ccxt/ccxt/pull/7321)
- binance metainfo updates [#7322](https://github.com/ccxt/ccxt/pull/7322)
- bitmax parseTicker fix [#7324](https://github.com/ccxt/ccxt/pull/7324)
- bit2c metainfo updates [#7323](https://github.com/ccxt/ccxt/pull/7323)
- waves.exchange fix withdraw fee [#7326](https://github.com/ccxt/ccxt/pull/7326)
- bitbank metainfo updates [#7325](https://github.com/ccxt/ccxt/pull/7325)
- bitbay metainfo updates [#7327](https://github.com/ccxt/ccxt/pull/7327)
- binance add errors [#7328](https://github.com/ccxt/ccxt/pull/7328)
- bitfinex metainfo updates [#7331](https://github.com/ccxt/ccxt/pull/7331)
- bitflyer metainfo updates [#7332](https://github.com/ccxt/ccxt/pull/7332)
- bitforex metainfo updates [#7333](https://github.com/ccxt/ccxt/pull/7333)
- bithumb metainfo updates [#7334](https://github.com/ccxt/ccxt/pull/7334)
- bitso metainfo updates [#7335](https://github.com/ccxt/ccxt/pull/7335)
- bitmex metainfo updates [#7336](https://github.com/ccxt/ccxt/pull/7336)
- bitstamp metainfo updates [#7340](https://github.com/ccxt/ccxt/pull/7340)
- bitstamp1 metainfo updates [#7341](https://github.com/ccxt/ccxt/pull/7341)
- okex market order for futures [#7343](https://github.com/ccxt/ccxt/pull/7343)
- bittrex metainfo updates [#7344](https://github.com/ccxt/ccxt/pull/7344)
- bitz metainfo updates [#7345](https://github.com/ccxt/ccxt/pull/7345)
- bl3p metainfo updates [#7346](https://github.com/ccxt/ccxt/pull/7346)
- bleutrade metainfo updates [#7348](https://github.com/ccxt/ccxt/pull/7348)
- braziliex metainfo updates [#7349](https://github.com/ccxt/ccxt/pull/7349)
- btcalpha metainfo updates [#7350](https://github.com/ccxt/ccxt/pull/7350)
- btcbox metainfo updates [#7354](https://github.com/ccxt/ccxt/pull/7354)
- btcmarkets metainfo updates [#7355](https://github.com/ccxt/ccxt/pull/7355)
- btctradeua metainfo updates [#7356](https://github.com/ccxt/ccxt/pull/7356)
- btcturk metainfo updates [#7357](https://github.com/ccxt/ccxt/pull/7357)


## 1.30.1

- [coinbasepro] error mappings [#7174](https://github.com/ccxt/ccxt/pull/7174)
- phemex fix typo [#7177](https://github.com/ccxt/ccxt/pull/7177)
- remove topq [#7185](https://github.com/ccxt/ccxt/pull/7185)
- Huobi Japan [#7184](https://github.com/ccxt/ccxt/pull/7184)
- bitmart: use milliseconds for expires calculation [#7189](https://github.com/ccxt/ccxt/pull/7189)
- Base classes: add signIn to has property with default value false [#7191](https://github.com/ccxt/ccxt/pull/7191)
- fix divide by zero error [#7197](https://github.com/ccxt/ccxt/pull/7197)
- fix for waves.exchange orders [#7200](https://github.com/ccxt/ccxt/pull/7200)
- _1btcxe delisted [#7206](https://github.com/ccxt/ccxt/pull/7206)
- huobi OnMaintenance handle [#7210](https://github.com/ccxt/ccxt/pull/7210)
- Digifinex change urls [#7216](https://github.com/ccxt/ccxt/pull/7216)
- Luno fetchAccounts and fetchLedger function calls defined [#7208](https://github.com/ccxt/ccxt/pull/7208)
- Update bitstamp.js [#7225](https://github.com/ccxt/ccxt/pull/7225)
- bitmart: add AuthenticationError error handling [#7228](https://github.com/ccxt/ccxt/pull/7228)
- wavesexchange edits [#7245](https://github.com/ccxt/ccxt/pull/7245)
- Logo updated [#7250](https://github.com/ccxt/ccxt/pull/7250)
- waves balance fix [#7251](https://github.com/ccxt/ccxt/pull/7251)
- Logo updated [#7252](https://github.com/ccxt/ccxt/pull/7252)
- waves cancel order edits [#7253](https://github.com/ccxt/ccxt/pull/7253)
- bigone fetchTime [#7256](https://github.com/ccxt/ccxt/pull/7256)
- bittrex fetchTime [#7257](https://github.com/ccxt/ccxt/pull/7257)
- Update Luno.js API [#7258](https://github.com/ccxt/ccxt/pull/7258)
- Logo updated [#7259](https://github.com/ccxt/ccxt/pull/7259)
- bitz fetchTime [#7261](https://github.com/ccxt/ccxt/pull/7261)
- btcbox doc and logo updated [#7265](https://github.com/ccxt/ccxt/pull/7265)


## 1.29.1

- fix symbol typo from 'BTC/USD' to 'ETH/EUR' [#7085](https://github.com/ccxt/ccxt/pull/7085)
- update to bitmax new api [#6609](https://github.com/ccxt/ccxt/pull/6609)
- The meaning of transferPrecision returned by the server has changed, … [#7092](https://github.com/ccxt/ccxt/pull/7092)
- [exmo] order status could be incorrectly reported when amount is undefined [#7094](https://github.com/ccxt/ccxt/pull/7094)
- Implement coinone retrieving my orders [#7067](https://github.com/ccxt/ccxt/pull/7067)
- Add sub account transfer history [#7103](https://github.com/ccxt/ccxt/pull/7103)
- Bitmex: fix missing orderID field [#7105](https://github.com/ccxt/ccxt/pull/7105)
- BitMax parseOrder fix [#7106](https://github.com/ccxt/ccxt/pull/7106)
- New Exchange: Waves.Exchange implementation WIP [#7012](https://github.com/ccxt/ccxt/pull/7012)
- Kraken API now exposes 'ordermin' in AssetPairs [#7108](https://github.com/ccxt/ccxt/pull/7108)
- Update parseOrder of zaif.js [#7112](https://github.com/ccxt/ccxt/pull/7112)
- waves alternate fetchDepositAddress implementation [#7114](https://github.com/ccxt/ccxt/pull/7114)


## 1.28.1

- ccxt.d.ts: add parseTimeframe(). [#7005](https://github.com/ccxt/ccxt/pull/7005)
- Exmo add BCH fees [#7007](https://github.com/ccxt/ccxt/pull/7007)
- binance future fetchOpenOrders type bug fix (futures should be future) [#7008](https://github.com/ccxt/ccxt/pull/7008)
- qTrade fetchBalance fix [#7016](https://github.com/ccxt/ccxt/pull/7016)
- qTrade parseOHLCV fix [#7017](https://github.com/ccxt/ccxt/pull/7017)
- Sort kraken orders by timestamp [#7020](https://github.com/ccxt/ccxt/pull/7020)
- Update luno.js with new supported API calls [#7026](https://github.com/ccxt/ccxt/pull/7026)
- [dsx] metadata [#7041](https://github.com/ccxt/ccxt/pull/7041)
- A bug in loadMarkets() for Kuna Exchange fixed (GOL quote coin added) [#7046](https://github.com/ccxt/ccxt/pull/7046)


## 1.27.1

- [yobit] error msg [#6902](https://github.com/ccxt/ccxt/pull/6902)
- [yobit] revert accidental commit [#6904](https://github.com/ccxt/ccxt/pull/6904)
- Bitbay OnMaintenance handle [#6906](https://github.com/ccxt/ccxt/pull/6906)
- New Exchange: HBTC [#6803](https://github.com/ccxt/ccxt/pull/6803)
- fix: bitbay fees #5917 [#6909](https://github.com/ccxt/ccxt/pull/6909)
- fix: adding new kucoin endpoints in preperation for #6665 [#6912](https://github.com/ccxt/ccxt/pull/6912)
- fix: Dockerfile dependencies version bump, tox version bump; tests - remove python2 [#6913](https://github.com/ccxt/ccxt/pull/6913)
- Huobi fetchTicker / fetchTickers bid, ask, bidVolume, askVolume fix [#6914](https://github.com/ccxt/ccxt/pull/6914)
- Poloniex editOrder trades fixup [#6916](https://github.com/ccxt/ccxt/pull/6916)
- [bitbay] error handling [#6926](https://github.com/ccxt/ccxt/pull/6926)
- coinbasepro: fetchTime(): use epoch instead of iso property. [#6929](https://github.com/ccxt/ccxt/pull/6929)
- Add ProBit exchange [#5608](https://github.com/ccxt/ccxt/pull/5608)
- coinbase: fetchTime(): use epoch instead of iso property. [#6932](https://github.com/ccxt/ccxt/pull/6932)
- HBTC fee correction [#6940](https://github.com/ccxt/ccxt/pull/6940)
- [yobit] error mapping [#6942](https://github.com/ccxt/ccxt/pull/6942)
- CBC mapping [#6943](https://github.com/ccxt/ccxt/pull/6943)
- gemini avoid making wrong symbols [#6937](https://github.com/ccxt/ccxt/pull/6937)
- New Exchange: Eterbase [#5904](https://github.com/ccxt/ccxt/pull/5904)
- feat: test markets for taker and maker fees & some small docker fixes [#6936](https://github.com/ccxt/ccxt/pull/6936)
- [dsx] parseTransaction v3 api fix [#6949](https://github.com/ccxt/ccxt/pull/6949)
- Lykke new endpoints, timeframes [#6950](https://github.com/ccxt/ccxt/pull/6950)
- Exchange qTrade.io [#6187](https://github.com/ccxt/ccxt/pull/6187)
- fix to_wei [#6971](https://github.com/ccxt/ccxt/pull/6971)
- Bithumb: limits and precision [#6963](https://github.com/ccxt/ccxt/pull/6963)
- Lykke parseOrder fix [#6973](https://github.com/ccxt/ccxt/pull/6973)
- Eterbase fees [#6974](https://github.com/ccxt/ccxt/pull/6974)


## 1.26.1

- [bitbay] added url [#6793](https://github.com/ccxt/ccxt/pull/6793)
- added missing curly brace [#6801](https://github.com/ccxt/ccxt/pull/6801)
- [kraken] fix: change from webpage to zendesk api to fetch minOrderAmounts [#6810](https://github.com/ccxt/ccxt/pull/6810)
- transpile Object.values [#6816](https://github.com/ccxt/ccxt/pull/6816)
- Add Poloniex Maintenance Error [#6824](https://github.com/ccxt/ccxt/pull/6824)
- exmo fetchOHLCV fix [#6826](https://github.com/ccxt/ccxt/pull/6826)
- [kraken] added fetchOrderTrades [#6804](https://github.com/ccxt/ccxt/pull/6804)
- add missing PHP methods for bytetrade [#6829](https://github.com/ccxt/ccxt/pull/6829)
- exmo fetchOHLCV fix [#6833](https://github.com/ccxt/ccxt/pull/6833)
- Bithumb createOrder return structure [#6837](https://github.com/ccxt/ccxt/pull/6837)
- fix minor bug in php bytetrade withdraw [#6839](https://github.com/ccxt/ccxt/pull/6839)
- [okex] add testnet support [#6840](https://github.com/ccxt/ccxt/pull/6840)
- Bithumb fetchOrder, fetchOpenOrders [#6842](https://github.com/ccxt/ccxt/pull/6842)
- bithumb: minor fixes [#6845](https://github.com/ccxt/ccxt/pull/6845)
- Implement cancelUnifiedOrder and fetchUnifiedOrder [#6843](https://github.com/ccxt/ccxt/pull/6843)
- EXMO update fees and limits [#6849](https://github.com/ccxt/ccxt/pull/6849)


## 1.25.1

- relocation verbose [#6688](https://github.com/ccxt/ccxt/pull/6688)
- Prepare Hitbtc2 exchange for ws in ccxt.pro [#6693](https://github.com/ccxt/ccxt/pull/6693)
- BitMax BadSymbol handling [#6695](https://github.com/ccxt/ccxt/pull/6695)
- Delist bitlish [#6626](https://github.com/ccxt/ccxt/pull/6626)
- add some missing fields using a mystery script [#6694](https://github.com/ccxt/ccxt/pull/6694)
- Use the latest domain name [#6698](https://github.com/ccxt/ccxt/pull/6698)
- Update okex.js [#6705](https://github.com/ccxt/ccxt/pull/6705)
- coinmate - error handling for InsufficientFunds [#6706](https://github.com/ccxt/ccxt/pull/6706)
- exchange.py verbosity fixup [#6702](https://github.com/ccxt/ccxt/pull/6702)
- deribit: fetch_deposits: update exception text [#6709](https://github.com/ccxt/ccxt/pull/6709)
- deribit: refactor options into method [#6710](https://github.com/ccxt/ccxt/pull/6710)
- bittrex: createOrderV3: fix market ceiling order [#6711](https://github.com/ccxt/ccxt/pull/6711)
- okex: fix typo [#6714](https://github.com/ccxt/ccxt/pull/6714)
- hollaex cancelOrder variable name fix [#6715](https://github.com/ccxt/ccxt/pull/6715)
- Update deribit.js [#6718](https://github.com/ccxt/ccxt/pull/6718)
- Remove cobinhood [#6720](https://github.com/ccxt/ccxt/pull/6720)
- [bitfinex2] parseOrderStatus fix [#6730](https://github.com/ccxt/ccxt/pull/6730)
- Bybit: fix edit order price [#6734](https://github.com/ccxt/ccxt/pull/6734)
- [bleutrade] fetchOpenOrders 'has'-> true [#6735](https://github.com/ccxt/ccxt/pull/6735)
- Huobi handle order-limitorder-amount-max-error [#6738](https://github.com/ccxt/ccxt/pull/6738)
- [bitfinex] parseOrderStatus fix [#6744](https://github.com/ccxt/ccxt/pull/6744)
- [coinmate] parse order status fix [#6741](https://github.com/ccxt/ccxt/pull/6741)
- [deribit] wrong fee field in trades [#6752](https://github.com/ccxt/ccxt/pull/6752)
- [bluetrade] added api call [#6756](https://github.com/ccxt/ccxt/pull/6756)
- [bleutrade] [fetchMarkets] change in response [#6761](https://github.com/ccxt/ccxt/pull/6761)
- [gateio] parse order fix [#6764](https://github.com/ccxt/ccxt/pull/6764)
- kucoin add new endpoints [#6767](https://github.com/ccxt/ccxt/pull/6767)
- aofex add fetchOrderTrades [#6768](https://github.com/ccxt/ccxt/pull/6768)
- aofex parseOrder, parseTrade, foWithMethod fixes [#6770](https://github.com/ccxt/ccxt/pull/6770)


## 1.24.1

- Okex referral url [#6625](https://github.com/ccxt/ccxt/pull/6625)
- Fix bitmax signature encoding [#6624](https://github.com/ccxt/ccxt/pull/6624)
- Bit-Z LeoCoin mapping [#6628](https://github.com/ccxt/ccxt/pull/6628)
- bitbay error handling [#6630](https://github.com/ccxt/ccxt/pull/6630)
- Fix: py3 unicode error at braziliex sign method [#6629](https://github.com/ccxt/ccxt/pull/6629)
- [coinmate] fetchOrders, fetchOpenOrders, fetchMyTrades, error handling [#6633](https://github.com/ccxt/ccxt/pull/6633)
- [coinmate] improved fetchOrder [#6635](https://github.com/ccxt/ccxt/pull/6635)
- logo dsx [#6636](https://github.com/ccxt/ccxt/pull/6636)
- support witness dappId customization [#6640](https://github.com/ccxt/ccxt/pull/6640)
- upbit urls [#6639](https://github.com/ccxt/ccxt/pull/6639)
- fix minor filter_by_since_limit bug in python [#6643](https://github.com/ccxt/ccxt/pull/6643)
- [coinmate] more error handling [#6642](https://github.com/ccxt/ccxt/pull/6642)
- Gate.io BEAR, BULL mapping [#6649](https://github.com/ccxt/ccxt/pull/6649)
- Crex24 BULL mapping [#6650](https://github.com/ccxt/ccxt/pull/6650)
- modify getBaseMethods [#6656](https://github.com/ccxt/ccxt/pull/6656)
- bcex fees and logo updated [#6661](https://github.com/ccxt/ccxt/pull/6661)
- ftx support pro [#6662](https://github.com/ccxt/ccxt/pull/6662)
- adhere to php style guides [#6657](https://github.com/ccxt/ccxt/pull/6657)
- bibox fees, logo and referral url updated [#6664](https://github.com/ccxt/ccxt/pull/6664)
- bitmex referral url [#6670](https://github.com/ccxt/ccxt/pull/6670)
- Delist btcchina [#6671](https://github.com/ccxt/ccxt/pull/6671)


## 1.23.1

- Gate.io parseTrade enhancement [#6560](https://github.com/ccxt/ccxt/pull/6560)
- Gate.io new endpoints [#6565](https://github.com/ccxt/ccxt/pull/6565)
- Python: fix tick size problems due to modulo [#6567](https://github.com/ccxt/ccxt/pull/6567)
- whitebit: Add ExchangeNotAvailable [#6568](https://github.com/ccxt/ccxt/pull/6568)
- Binance market closed exception [#6570](https://github.com/ccxt/ccxt/pull/6570)
- add some info to python networkErrors [#6571](https://github.com/ccxt/ccxt/pull/6571)
- bw: add RateLimitExceeded exception [#6569](https://github.com/ccxt/ccxt/pull/6569)
- quoted property in ccxt.js [#6572](https://github.com/ccxt/ccxt/pull/6572)
- new exchange: hollaex [#5495](https://github.com/ccxt/ccxt/pull/5495)
- add a keyword [#6585](https://github.com/ccxt/ccxt/pull/6585)
- kraken logo [#6593](https://github.com/ccxt/ccxt/pull/6593)
- BitMax commonCurrencies [#6596](https://github.com/ccxt/ccxt/pull/6596)
- make one http request in an async context [#6597](https://github.com/ccxt/ccxt/pull/6597)
- python base exchange: expose lists of base and quote currencies [#6519](https://github.com/ccxt/ccxt/pull/6519)
- [WIP] [Deribit] Implementation for version 2 API [#5546](https://github.com/ccxt/ccxt/pull/5546)
- [coinfloor] removed old market [#6605](https://github.com/ccxt/ccxt/pull/6605)
- Fix python async load_markets [#6606](https://github.com/ccxt/ccxt/pull/6606)
- OKEX new endpoints [#6607](https://github.com/ccxt/ccxt/pull/6607)


## 1.22.1

- when create market order, set the price to default 0 [#6482](https://github.com/ccxt/ccxt/pull/6482)
- Travis: try to prevent log truncation for failed python tests [#6475](https://github.com/ccxt/ccxt/pull/6475)
- XTZ (Tezos) description in bitfinex.js updated [#6485](https://github.com/ccxt/ccxt/pull/6485)
- PLA coin conflict [#6489](https://github.com/ccxt/ccxt/pull/6489)
- Fix TICK_SIZE floating point error [#6486](https://github.com/ccxt/ccxt/pull/6486)
- Add topq exchange [#6455](https://github.com/ccxt/ccxt/pull/6455)
- bw: fix fetch balance [#6493](https://github.com/ccxt/ccxt/pull/6493)
- bleutrade v3 implemention [#6371](https://github.com/ccxt/ccxt/pull/6371)
- [bleutrade] remove unwanted leading space on reference id [#6494](https://github.com/ccxt/ccxt/pull/6494)
- Bitfinex ZBT -> ZB [#6504](https://github.com/ccxt/ccxt/pull/6504)
- Add public, private and web URLs for Gemini's test API [#6505](https://github.com/ccxt/ccxt/pull/6505)
- WAX/WAXP coin conflict [#6514](https://github.com/ccxt/ccxt/pull/6514)
- Exchange.indexBy : accept elements that are array in Python [#6454](https://github.com/ccxt/ccxt/pull/6454)
- Bitforex UOS -> UOS Network [#6515](https://github.com/ccxt/ccxt/pull/6515)
- bitfinex2: Implement some methods [#6369](https://github.com/ccxt/ccxt/pull/6369)
- generate errors in transpile for intellisense [#6516](https://github.com/ccxt/ccxt/pull/6516)
- remove javascript dependencies [#6312](https://github.com/ccxt/ccxt/pull/6312)
- BitBay add fetchOHLCV, fix error types [#6517](https://github.com/ccxt/ccxt/pull/6517)
- Bugfix okex loadmarkets [#6521](https://github.com/ccxt/ccxt/pull/6521)
- Support for carrying messages when transferring asset [#6526](https://github.com/ccxt/ccxt/pull/6526)


## 1.21.1

- Adding account history endpoint [#6336](https://github.com/ccxt/ccxt/pull/6336)
- add a transpile rule for MAX_SAFE_INTEGER [#6343](https://github.com/ccxt/ccxt/pull/6343)
- Parse binance withdrawal fees [#6344](https://github.com/ccxt/ccxt/pull/6344)
- bitstamp prepare for pro [#6346](https://github.com/ccxt/ccxt/pull/6346)
- Kraken: Add BadSymbol [#6353](https://github.com/ccxt/ccxt/pull/6353)
- add a rule so that this.call is redundant [#6351](https://github.com/ccxt/ccxt/pull/6351)
- gateio parser methods support for pro [#6363](https://github.com/ccxt/ccxt/pull/6363)
- parseOrder changes for gateio [#6365](https://github.com/ccxt/ccxt/pull/6365)
- Minor: Fix typo in the manual [#6366](https://github.com/ccxt/ccxt/pull/6366)
- return an int from php milliseconds not a string [#6370](https://github.com/ccxt/ccxt/pull/6370)
- Bigone: has fetchOrder [#6381](https://github.com/ccxt/ccxt/pull/6381)
- [coinbase] use the correct value to get the withdrawal amount [#6386](https://github.com/ccxt/ccxt/pull/6386)
- Added 'fetchOrderTrades': false [#6387](https://github.com/ccxt/ccxt/pull/6387)
- parseBalance edits for pro [#6383](https://github.com/ccxt/ccxt/pull/6383)
- ohlcvs edit [#6397](https://github.com/ccxt/ccxt/pull/6397)
- #6404 Fix cached markets (Proposal 2) [#6406](https://github.com/ccxt/ccxt/pull/6406)
- Change manual references from gdax to coinbasepro [#6422](https://github.com/ccxt/ccxt/pull/6422)


## 1.20.1

- [kucoin] handle new error message seen today when cancelling an order that's already canceled [#6224](https://github.com/ccxt/ccxt/pull/6224)
- ONE ticker conflict  [#6232](https://github.com/ccxt/ccxt/pull/6232)
- add intellisense to python with errorName = None in transpiled error class [#6231](https://github.com/ccxt/ccxt/pull/6231)
- [poloniex] fixed missing fees bug in fetchMyTrades [#6237](https://github.com/ccxt/ccxt/pull/6237)
- latoken fetchBalance cleanup [#6240](https://github.com/ccxt/ccxt/pull/6240)
- Huobi base-symbol-trade-disabled handle [#6241](https://github.com/ccxt/ccxt/pull/6241)
- Update bibox API doc URL [#6242](https://github.com/ccxt/ccxt/pull/6242)
- [kucoin] trying out alternative error message [#6251](https://github.com/ccxt/ccxt/pull/6251)
- [coinbasepro, gemini] added missing fees api calls [#6259](https://github.com/ccxt/ccxt/pull/6259)
- IDEX commonCurrencies FT [#6260](https://github.com/ccxt/ccxt/pull/6260)
- [coinbasepro] api fix - oops, i did not read the docs carfeully enough [#6263](https://github.com/ccxt/ccxt/pull/6263)
- FCoin parse orders with rebate [#6264](https://github.com/ccxt/ccxt/pull/6264)
- Timex parseOHLCV fix [#6265](https://github.com/ccxt/ccxt/pull/6265)
- Support BCH/BSV/LTC/EOS/DASH/DOGE/ETC coin withdraw [#6266](https://github.com/ccxt/ccxt/pull/6266)
- Add binance futures listenKey endpoints [#6276](https://github.com/ccxt/ccxt/pull/6276)
- Add exceptions [#6281](https://github.com/ccxt/ccxt/pull/6281)
- Stex: Fix safe_* accessors [#6282](https://github.com/ccxt/ccxt/pull/6282)
- zb: Invalid parameter should be BadRequest [#6283](https://github.com/ccxt/ccxt/pull/6283)
- bitMart fetchMyTrades limit fix [#6285](https://github.com/ccxt/ccxt/pull/6285)


## 1.19.1

- [gateio] added transaction status [#6154](https://github.com/ccxt/ccxt/pull/6154)
- transpile all exchanges if exchanges.json not found (when installing ccxt via npm install)  [#6156](https://github.com/ccxt/ccxt/pull/6156)
- add space to delete transpile php [#6160](https://github.com/ccxt/ccxt/pull/6160)
- Exmo new markets [#6159](https://github.com/ccxt/ccxt/pull/6159)
- Add BigONE V3 API [#5951](https://github.com/ccxt/ccxt/pull/5951)
- [coinbasepro] fix parse order (for some very old data) [#6166](https://github.com/ccxt/ccxt/pull/6166)
- coinone: BadSymbol [#6167](https://github.com/ccxt/ccxt/pull/6167)
- coinone: OnMaintenance [#6168](https://github.com/ccxt/ccxt/pull/6168)
- fetchMyTrades, parseTrade fixes [#6169](https://github.com/ccxt/ccxt/pull/6169)
- Exmo update EXM limits [#6170](https://github.com/ccxt/ccxt/pull/6170)
- Add exchange: bw.com [#5757](https://github.com/ccxt/ccxt/pull/5757)
- [cex] infer order type using price field [#6172](https://github.com/ccxt/ccxt/pull/6172)
- bigONE parseTrade improvement [#6174](https://github.com/ccxt/ccxt/pull/6174)
- change if x in list(dict.keys()) to if x in dict [#6179](https://github.com/ccxt/ccxt/pull/6179)
- bitMart createOrder fix [#6181](https://github.com/ccxt/ccxt/pull/6181)
- bw.com: use safe* accessors [#6183](https://github.com/ccxt/ccxt/pull/6183)
- Fix: Add bw.com base files [#6190](https://github.com/ccxt/ccxt/pull/6190)
- build/push.sh: Add generated php/python files [#6191](https://github.com/ccxt/ccxt/pull/6191)
- Stex parseTicker fix [#6195](https://github.com/ccxt/ccxt/pull/6195)
- Update Exchange.js on HttpsProxyAgent usage (the proxy `agent` property) [#6188](https://github.com/ccxt/ccxt/pull/6188)


## 1.18.1

- Fix market buy order amount issue for huobipro [#6013](https://github.com/ccxt/ccxt/pull/6013)
- [cex] improved error handling [#6015](https://github.com/ccxt/ccxt/pull/6015)
- [new exchange] Bytetrade [#5784](https://github.com/ccxt/ccxt/pull/5784)
- [cex] improved error handling [#6020](https://github.com/ccxt/ccxt/pull/6020)
- Fix: transpile removed space between not and the following bracket [#6028](https://github.com/ccxt/ccxt/pull/6028)
- Bytetrade: parseTransactionStatusByType more readable [#6027](https://github.com/ccxt/ccxt/pull/6027)
- Rename pow/modulo/divide through integer* [#6026](https://github.com/ccxt/ccxt/pull/6026)
- whitebit: fix handle_error error [#6030](https://github.com/ccxt/ccxt/pull/6030)
- Bytetrade: remove redundant safe*2 [#6025](https://github.com/ccxt/ccxt/pull/6025)
- Binary concat array [#6029](https://github.com/ccxt/ccxt/pull/6029)
- [gateio] removed duplicate error handling, and added a mapping for invalid order (when the placing an order that is too small for example) [#6031](https://github.com/ccxt/ccxt/pull/6031)
- Indodax: BadSymbol [#6033](https://github.com/ccxt/ccxt/pull/6033)
- Kucoin close two minor issues ) [#6035](https://github.com/ccxt/ccxt/pull/6035)
- BitMax fetchClosedOrders limit fix [#6037](https://github.com/ccxt/ccxt/pull/6037)
- [gateio] fixed the price in parseOrder [#6041](https://github.com/ccxt/ccxt/pull/6041)
- Add URL for Submitting Order [#6046](https://github.com/ccxt/ccxt/pull/6046)
- fix async python examples [#6048](https://github.com/ccxt/ccxt/pull/6048)
- fix aiohttp deprecation issues [#6049](https://github.com/ccxt/ccxt/pull/6049)
- [okex] added fee ccy [#6051](https://github.com/ccxt/ccxt/pull/6051)
- Minor Fixes in latoken  [#6052](https://github.com/ccxt/ccxt/pull/6052)
- update import [#6054](https://github.com/ccxt/ccxt/pull/6054)
- [anxpro] parse order status fix [#6056](https://github.com/ccxt/ccxt/pull/6056)
- php store cookies in cookiejar without calling curl_close [#6060](https://github.com/ccxt/ccxt/pull/6060)
- [cex] error handling for RateLimitExceeded [#6061](https://github.com/ccxt/ccxt/pull/6061)
- fix: futures's judgment after okex updated api [#6069](https://github.com/ccxt/ccxt/pull/6069)
- [ByteTrade] fetchBalance and createOrder update [#6068](https://github.com/ccxt/ccxt/pull/6068)


## 1.17.1

- Added custom params parameter to fetchMarkets and loadMarkets everywhere [#4214](https://github.com/ccxt/ccxt/pull/4214)
- change signature of handleErrors - (pre changing callchains in py/php) [#4213](https://github.com/ccxt/ccxt/pull/4213)
- Add HitBTC deposits and withdrawals [#4161](https://github.com/ccxt/ccxt/pull/4161)
- [BUGFIX] Bitstamp: OrderNotFound for cancelOrder [#4223](https://github.com/ccxt/ccxt/pull/4223)
- sprintf format string f is locale dependent, should use F instead [#4233](https://github.com/ccxt/ccxt/pull/4233)
- [theocean] Fix special character ‘с’ [#4235](https://github.com/ccxt/ccxt/pull/4235)
- like #4169 but2c can have undefined base volume/averagePrice [#4240](https://github.com/ccxt/ccxt/pull/4240)
- BitMEX: Add more exception. [#4241](https://github.com/ccxt/ccxt/pull/4241)
- remove GNTBTC from anxpro [#4242](https://github.com/ccxt/ccxt/pull/4242)
- Handle cointiger rate limit errors as DDoSProtection [#4243](https://github.com/ccxt/ccxt/pull/4243)
- remove huobi like said #2420 [#4244](https://github.com/ccxt/ccxt/pull/4244)
- when called from fetchL2OrderBook limit is undefined by default [#4245](https://github.com/ccxt/ccxt/pull/4245)
- btcalpha parseTrade fix [#4246](https://github.com/ccxt/ccxt/pull/4246)
- bibox fetchMyTrades fix [#4247](https://github.com/ccxt/ccxt/pull/4247)
- update python callchain so json is passed to handleErrors [#4227](https://github.com/ccxt/ccxt/pull/4227)
- The Rock: Add fetchMyTrades [#4208](https://github.com/ccxt/ccxt/pull/4208)
- add ethfinex v2 and fix yobit max url length [#4131](https://github.com/ccxt/ccxt/pull/4131)
- Safefloat trade and order prices and amounts in exchanges [#4269](https://github.com/ccxt/ccxt/pull/4269)
- Change WEX url to use new domain [#4271](https://github.com/ccxt/ccxt/pull/4271)
- Fix bit2c [#4278](https://github.com/ccxt/ccxt/pull/4278)
- Don't attempt to parse unparsable strings in base exchange parse functions [#4282](https://github.com/ccxt/ccxt/pull/4282)
- Parse bleutrade trade IDs [#4284](https://github.com/ccxt/ccxt/pull/4284)
- Missing XTZ (Tezos) cryptocurrency from Bitfinex and Kraken [#4283](https://github.com/ccxt/ccxt/pull/4283)


## 1.16.1

- fix fetch_ohlcv of bitz [#3413](https://github.com/ccxt/ccxt/pull/3413)
- kraken: Support more parseTrade formats. [#3415](https://github.com/ccxt/ccxt/pull/3415)
- cli: fixed a bug with 'printSupportedExchanges' not called on unknown exchange [#3418](https://github.com/ccxt/ccxt/pull/3418)
- Add fetchOpenOrders for Gemini [#3419](https://github.com/ccxt/ccxt/pull/3419)
- Added some cryptocurrency + self.orders['status'] = 'canceled' when we cancel.  [#3420](https://github.com/ccxt/ccxt/pull/3420)
- Fixup fetchOpenOrders when filtering [#3423](https://github.com/ccxt/ccxt/pull/3423)
- Add fetchMyTrades to Huobi Pro [#3422](https://github.com/ccxt/ccxt/pull/3422)
- okex: arg name fix in fetchTickers [#3438](https://github.com/ccxt/ccxt/pull/3438)
- Removed local variable fetchImplementation [#3439](https://github.com/ccxt/ccxt/pull/3439)
- Second naming example should have a space in it [#3449](https://github.com/ccxt/ccxt/pull/3449)
- RightBTC: Rewrite XRB to NANO. [#3467](https://github.com/ccxt/ccxt/pull/3467)


## 1.15.1

- add new exchange fcoin [#3225](https://github.com/ccxt/ccxt/pull/3225)
- coinex: fetchMarkets: properly set market['active'] flag [#3326](https://github.com/ccxt/ccxt/pull/3326)
- Cobinhood order cost should respect filled amount [#3334](https://github.com/ccxt/ccxt/pull/3334)
- [coinex] parse trade according to latest spec [#3303](https://github.com/ccxt/ccxt/pull/3303)
- Fix currency conversion in bitfinex2.fetchBalance [#3339](https://github.com/ccxt/ccxt/pull/3339)
- Add check for symbol on Bitfinex fetchMyTrades [#3348](https://github.com/ccxt/ccxt/pull/3348)
- Fix fcoin fetch_order_book() limit bug. [#3342](https://github.com/ccxt/ccxt/pull/3342)
- Python 3.7 support [#3281](https://github.com/ccxt/ccxt/pull/3281)
- ParseOrder, FetchOrder, EOS added.  [#3335](https://github.com/ccxt/ccxt/pull/3335)
- Fix kucoin order status. [#3356](https://github.com/ccxt/ccxt/pull/3356)
- okcoinusd (and okex): decode more error codes [#3368](https://github.com/ccxt/ccxt/pull/3368)
- yobit: better handle some InvalidOrder errors [#3372](https://github.com/ccxt/ccxt/pull/3372)
- cryptopia: map some error messages to InvalidOrder [#3369](https://github.com/ccxt/ccxt/pull/3369)
- cobinhood: map "invalid_order_size" error [#3370](https://github.com/ccxt/ccxt/pull/3370)
- huobipro: map 'invalid-amount' to InvalidOrder [#3371](https://github.com/ccxt/ccxt/pull/3371)
- livecoin: map errors to InvalidOrder [#3373](https://github.com/ccxt/ccxt/pull/3373)
- gateio: require symbol in cancelOrder [#3375](https://github.com/ccxt/ccxt/pull/3375)


## 1.14.1

- huobi: min price error [#3209](https://github.com/ccxt/ccxt/pull/3209)
- add gemini fetch order [#3213](https://github.com/ccxt/ccxt/pull/3213)
- New Exchange: Coinbase Pro [#3214](https://github.com/ccxt/ccxt/pull/3214)
- Fix gateio order id in parseTrade [#3219](https://github.com/ccxt/ccxt/pull/3219)
- Coinone requires symbol to be in its cancelOrder request. [#3233](https://github.com/ccxt/ccxt/pull/3233)
- bitfinex2: Do not return null in balance response. [#3220](https://github.com/ccxt/ccxt/pull/3220)
- definition of cost, esp. on bittrex [#3234](https://github.com/ccxt/ccxt/pull/3234)
- add usdt quote [#3235](https://github.com/ccxt/ccxt/pull/3235)
- allow use all regions for coinegg [#3236](https://github.com/ccxt/ccxt/pull/3236)
- [Bibox] fetchOrder to call loadMarkets [#3237](https://github.com/ccxt/ccxt/pull/3237)
- Declare fetchOrderTrades in poloniex. [#3238](https://github.com/ccxt/ccxt/pull/3238)
- Timestamp in python3 - not sure why it works, but it does [#3247](https://github.com/ccxt/ccxt/pull/3247)
- Millisecond's leading zeros [#3250](https://github.com/ccxt/ccxt/pull/3250)
- Fix #3250: the .iso8601() millisecond's leading zeros [#3251](https://github.com/ccxt/ccxt/pull/3251)
- added alot of commonCurrencies from #3077, yobit is still missing some [#3258](https://github.com/ccxt/ccxt/pull/3258)
- huobi pro add "signature check failed" to errors [#3267](https://github.com/ccxt/ccxt/pull/3267)
- bittrex cancellation exception [#3272](https://github.com/ccxt/ccxt/pull/3272)
- Exchange.countries always as a list [#3276](https://github.com/ccxt/ccxt/pull/3276)
- fixed typo in bibox supported timeframes [#3279](https://github.com/ccxt/ccxt/pull/3279)
- fixed inconsistent timeframe keys for cobinhood [#3280](https://github.com/ccxt/ccxt/pull/3280)
- cex disabled XLM fetchDepositAddress [#3274](https://github.com/ccxt/ccxt/pull/3274)
- Fixes gemini argument mapping for fetchMyTrades [#3296](https://github.com/ccxt/ccxt/pull/3296)
- binance proper cost [#3288](https://github.com/ccxt/ccxt/pull/3288)


## 1.13.1

- gateio: fetchMarkets: precision [#2761](https://github.com/ccxt/ccxt/pull/2761)
- It is not necessary to specify symbol to fetch orders in cryptopia [#2765](https://github.com/ccxt/ccxt/pull/2765)
- kuna: parseTrade: unified for both fetchTrades and fetchMyTrades [#2766](https://github.com/ccxt/ccxt/pull/2766)
- kucoin: handleErrors: more cases [#2767](https://github.com/ccxt/ccxt/pull/2767)
- examples: typo [#2772](https://github.com/ccxt/ccxt/pull/2772)
- Fix for fetch_orders marking as closed all orders with other symbols [#2773](https://github.com/ccxt/ccxt/pull/2773)
- Fixed signing issue and implemented new methods [#2771](https://github.com/ccxt/ccxt/pull/2771)
- Binance- createOrder- support "limit maker" orders [#2785](https://github.com/ccxt/ccxt/pull/2785)
- Bitfinex IOST symbol correction [#2788](https://github.com/ccxt/ccxt/pull/2788)
- Fix when an order fills immediately, 'filled' should be set to the amount. [#2789](https://github.com/ccxt/ccxt/pull/2789)
- bitfinex add missing currency names (they have random naming conventions [#2795](https://github.com/ccxt/ccxt/pull/2795)
- fix huobipro limits [#2670](https://github.com/ccxt/ccxt/pull/2670)
- bibox: timestamp should be in milliseconds [#2811](https://github.com/ccxt/ccxt/pull/2811)
- zb: remove average from parseOrder [#2812](https://github.com/ccxt/ccxt/pull/2812)
- bittrex parseOrder datetime fix [#2817](https://github.com/ccxt/ccxt/pull/2817)
- new coin listing on coinone --- OMG [#2822](https://github.com/ccxt/ccxt/pull/2822)
- bithumb cancelOrder fix [#2827](https://github.com/ccxt/ccxt/pull/2827)
- cobinhood: properly throw InsufficientFunds exception [#2837](https://github.com/ccxt/ccxt/pull/2837)
- gatecoin: properly throw InsufficientFunds [#2838](https://github.com/ccxt/ccxt/pull/2838)
- lbank: fetchTicker: quote volume [#2834](https://github.com/ccxt/ccxt/pull/2834)
- base: number: better logging [#2839](https://github.com/ccxt/ccxt/pull/2839)
- Add STORJ currency fix [#2840](https://github.com/ccxt/ccxt/pull/2840)
- lbank not all markets have timestamp data - keyerror in python [#2846](https://github.com/ccxt/ccxt/pull/2846)
- remove duplicated exchanges [#2847](https://github.com/ccxt/ccxt/pull/2847)


## 1.12.1

- gemini add createDepositAddress method [#2519](https://github.com/ccxt/ccxt/pull/2519)
- gateio: 'rate' cast to float type from str in 'fetch_trades' [#2523](https://github.com/ccxt/ccxt/pull/2523)
- bibox withdrawal fees and refactor request [#2509](https://github.com/ccxt/ccxt/pull/2509)
- massive metainfo update [#2525](https://github.com/ccxt/ccxt/pull/2525)
- sometimes this fails due to binance sending invalid json like '' [#2527](https://github.com/ccxt/ccxt/pull/2527)
- updates were made to bit2c exchange API that broke some methods. [#2528](https://github.com/ccxt/ccxt/pull/2528)
- added fetchOpenOrders [#2533](https://github.com/ccxt/ccxt/pull/2533)
- Add endpoint to retrieve deposit/withdrawal records from Huobipro [#2540](https://github.com/ccxt/ccxt/pull/2540)
- Update bitfinex withdraw addr [#2542](https://github.com/ccxt/ccxt/pull/2542)
- flowbtc: fees [#2543](https://github.com/ccxt/ccxt/pull/2543)
- bibox fix fetch_my_trades [#2551](https://github.com/ccxt/ccxt/pull/2551)
- yobit request -> handleErrors | "error" -> "error_log" [#2560](https://github.com/ccxt/ccxt/pull/2560)
- livecoin - capricoin [#2571](https://github.com/ccxt/ccxt/pull/2571)
- add capri [#2588](https://github.com/ccxt/ccxt/pull/2588)
- qryptos: parseTrade: takerOrMaker [#2582](https://github.com/ccxt/ccxt/pull/2582)
- On Vaultoro, GLD is actual Gold, not GoldCoin. [#2602](https://github.com/ccxt/ccxt/pull/2602)


## 1.11.1

- Gemini: Fix trade order ID [#2310](https://github.com/ccxt/ccxt/pull/2310)
- hitbtc2 load withdrawal fees [#2316](https://github.com/ccxt/ccxt/pull/2316)
- Parse ask and bid values out of ticker information for bitlish [#2319](https://github.com/ccxt/ccxt/pull/2319)
- Throw ExchangeError instead of returning them. [#2322](https://github.com/ccxt/ccxt/pull/2322)
- bitbay: sign: account for url params [#2323](https://github.com/ccxt/ccxt/pull/2323)
- add fetchDepositAddress [#2327](https://github.com/ccxt/ccxt/pull/2327)
- Feature/cobinhood [#2329](https://github.com/ccxt/ccxt/pull/2329)
- Fix bitmex fetch_orders functions [#2332](https://github.com/ccxt/ccxt/pull/2332)
- bitflyer: added fetchMyTrades() [#2335](https://github.com/ccxt/ccxt/pull/2335)
- related to #2241 and #2249 [#2337](https://github.com/ccxt/ccxt/pull/2337)
- cobinhood: fix fetchOrderTrades to get trade list for parsing trades [#2345](https://github.com/ccxt/ccxt/pull/2345)
- Added fetchMyTrades for qryptos/quoinex [#2354](https://github.com/ccxt/ccxt/pull/2354)
- bitcoin.co.id → indodax fix #2244 [#2267](https://github.com/ccxt/ccxt/pull/2267)


## 1.10.1

- fix bittrex cancel_order [#2055](https://github.com/ccxt/ccxt/pull/2055)
- update binance ratelimit [#2068](https://github.com/ccxt/ccxt/pull/2068)
- Throw OrderNotFound if order not found in fetchOrderTrades [#2069](https://github.com/ccxt/ccxt/pull/2069)
- js/test/test.js: linting [#2071](https://github.com/ccxt/ccxt/pull/2071)
- Only close aiohttp session if it is owned by the ccxt exchange object [#2076](https://github.com/ccxt/ccxt/pull/2076)
- Add Huobipro fetchDepositAddress functionality [#2081](https://github.com/ccxt/ccxt/pull/2081)
- bitcoincoid: Fix taker fee to use percentage [#2084](https://github.com/ccxt/ccxt/pull/2084)
- Bitflyer added fetchOrder and fetchOrders capabilities [#2089](https://github.com/ccxt/ccxt/pull/2089)
- kucoin deposit fee struct [#2091](https://github.com/ccxt/ccxt/pull/2091)
- btcturk: new: XRP/TRY market [#2100](https://github.com/ccxt/ccxt/pull/2100)
- PHP: Exchange: fix typo (fethc > fetch) [#2110](https://github.com/ccxt/ccxt/pull/2110)


## 1.9.1

- Fix typo in bter [#442](https://github.com/ccxt/ccxt/pull/442)
- Add fetchTickers for bitfinex2 [#446](https://github.com/ccxt/ccxt/pull/446)
- Fix used/unused error-class variables [#450](https://github.com/ccxt/ccxt/pull/450)
- Update binance withdraw fees [#458](https://github.com/ccxt/ccxt/pull/458)
- Update public get methods on binance.js [#462](https://github.com/ccxt/ccxt/pull/462)
- bitfinex2: trading fees added [#463](https://github.com/ccxt/ccxt/pull/463)
- Fix hasFetchTickers for btcturk, cex [#459](https://github.com/ccxt/ccxt/pull/459)
- Add markets, fees for bitfinex2, fix binance typo [#468](https://github.com/ccxt/ccxt/pull/468)


## 1.8.1

- Fix issue 250 cex optional params [#251](https://github.com/ccxt/ccxt/pull/251)
- throttle() correction [#254](https://github.com/ccxt/ccxt/pull/254)
- duplicit ccxt\Exchange::request() removed [#256](https://github.com/ccxt/ccxt/pull/256)
- fetch_balance() correct arguments [#257](https://github.com/ccxt/ccxt/pull/257)
- parse_orders() update [#258](https://github.com/ccxt/ccxt/pull/258)


## 1.7.1

- Add new symbol for bitcoincoid markets [#228](https://github.com/ccxt/ccxt/pull/228)


## 1.6.1

- mktime parameters depend on PHP version [#174](https://github.com/ccxt/ccxt/pull/174)
- use python3.5 for flake8 [#180](https://github.com/ccxt/ccxt/pull/180)
- travis should use python3.5 only [#181](https://github.com/ccxt/ccxt/pull/181)
- Fixed bitflyer request using query parameters [#187](https://github.com/ccxt/ccxt/pull/187)
- Use python as main language on travis [#191](https://github.com/ccxt/ccxt/pull/191)
- travis build config update [#201](https://github.com/ccxt/ccxt/pull/201)



<?php

// *********************************
// ***** AUTO-TRANSPILER-START *****
function config($symbol = 'BTC/USDT', $code = 'USDT', $is_spot = true) {
    return (array(
    'exchange' => array(
        'loadMarkets' => array(
            'testFile' => 'loadMarkets',
            'args' => [],
            'isWs' => false,
            'public' => true,
        ),
        'fetchTicker' => array(
            'testFile' => 'fetchTicker',
            'isWs' => false,
            'public' => true,
            'args' => [$symbol],
        ),
        'fetchTickers' => array(
            'testFile' => 'fetchTickers',
            'isWs' => false,
            'public' => true,
            'args' => [$symbol],
        ),
        'fetchOHLCV' => array(
            'testFile' => 'fetchOHLCV',
            'isWs' => false,
            'public' => true,
            'args' => [$symbol],
        ),
        'fetchTrades' => array(
            'testFile' => 'fetchTrades',
            'isWs' => false,
            'public' => true,
            'args' => [$symbol],
        ),
        'fetchOrderBook' => array(
            'testFile' => 'fetchOrderBook',
            'isWs' => false,
            'public' => true,
            'args' => [$symbol],
        ),
        'fetchL2OrderBook' => array(
            'testFile' => 'fetchL2OrderBook',
            'isWs' => false,
            'public' => true,
            'args' => [$symbol],
        ),
        'fetchOrderBooks' => array(
            'testFile' => 'fetchOrderBooks',
            'isWs' => false,
            'public' => true,
            'args' => [],
        ),
        'fetchBidsAsks' => array(
            'testFile' => 'fetchBidsAsks',
            'isWs' => false,
            'public' => true,
            'args' => [],
        ),
        'fetchTime' => array(
            'testFile' => 'fetchTime',
            'isWs' => false,
            'public' => true,
            'args' => [],
        ),
        'fetchCurrencies - public' => array(
            'testFile' => 'fetchCurrencies',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? null : 'only run for swap markets',
        ),
        'fetchFundingRates' => array(
            'testFile' => 'fetchFundingRates',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchFundingRate' => array(
            'testFile' => 'fetchFundingRate',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchFundingRateHistory - public' => array(
            'testFile' => 'fetchFundingRateHistory',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchIndexOHLCV' => array(
            'testFile' => 'fetchIndexOHLCV',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchMarkOHLCV' => array(
            'testFile' => 'fetchMarkOHLCV',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchPremiumIndexOHLCV' => array(
            'testFile' => 'fetchPremiumIndexOHLCV',
            'isWs' => false,
            'public' => true,
            'args' => [],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'signIn' => array(
            'testFile' => 'signIn',
            'isWs' => false,
            'public' => false,
            'args' => [],
        ),
        'fetchBalance' => array(
            'testFile' => 'fetchBalance',
            'isWs' => false,
            'public' => false,
            'args' => [],
        ),
        'fetchAccounts' => array(
            'testFile' => 'fetchAccounts',
            'isWs' => false,
            'public' => false,
            'args' => [],
        ),
        'fetchTransactionFees' => array(
            'testFile' => 'fetchTransactionFees',
            'isWs' => false,
            'public' => false,
            'args' => [],
        ),
        'fetchTradingFees' => array(
            'testFile' => 'fetchTradingFees',
            'isWs' => false,
            'public' => false,
            'args' => [],
        ),
        'fetchStatus' => array(
            'testFile' => 'fetchStatus',
            'isWs' => false,
            'public' => false,
            'args' => [],
        ),
        'fetchOrders' => array(
            'testFile' => 'fetchOrders',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
        ),
        'fetchOpenOrders' => array(
            'testFile' => 'fetchOpenOrders',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
        ),
        'fetchClosedOrders' => array(
            'testFile' => 'fetchClosedOrders',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
        ),
        'fetchMyTrades' => array(
            'testFile' => 'fetchMyTrades',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
        ),
        'fetchLeverageTiers' => array(
            'testFile' => 'fetchLeverageTiers',
            'isWs' => false,
            'public' => false,
            'args' => [[$symbol]],
        ),
        'fetchLedger' => array(
            'testFile' => 'fetchLedger',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchTransactions' => array(
            'testFile' => 'fetchTransactions',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchDeposits' => array(
            'testFile' => 'fetchDeposits',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchWithdrawals' => array(
            'testFile' => 'fetchWithdrawals',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchBorrowInterest' => array(
            'testFile' => 'fetchBorrowInterest',
            'isWs' => false,
            'public' => false,
            'args' => [$code, $symbol],
        ),
        'addMargin' => array(
            'testFile' => 'addMargin',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'reduceMargin' => array(
            'testFile' => 'reduceMargin',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'setMargin' => array(
            'testFile' => 'setMargin',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'setMarginMode' => array(
            'testFile' => 'setMarginMode',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'setLeverage' => array(
            'testFile' => 'setLeverage',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'cancelAllOrders' => array(
            'testFile' => 'cancelAllOrders',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
        ),
        'cancelOrder' => array(
            'testFile' => 'cancelOrder',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'cancelOrders' => array(
            'testFile' => 'cancelOrders',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchCanceledOrders' => array(
            'testFile' => 'fetchCanceledOrders',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
        ),
        'fetchClosedOrder' => array(
            'testFile' => 'fetchClosedOrder',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchOpenOrder' => array(
            'testFile' => 'fetchOpenOrder',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchOrder' => array(
            'testFile' => 'fetchOrder',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchOrderTrades' => array(
            'testFile' => 'fetchOrderTrades',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchDeposit' => array(
            'testFile' => 'fetchDeposit',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'createDepositAddress' => array(
            'testFile' => 'createDepositAddress',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchDepositAddress' => array(
            'testFile' => 'fetchDepositAddress',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchDepositAddresses' => array(
            'testFile' => 'fetchDepositAddresses',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchDepositAddressesByNetwork' => array(
            'testFile' => 'fetchDepositAddressesByNetwork',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'editOrder' => array(
            'testFile' => 'editOrder',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchBorrowRateHistory' => array(
            'testFile' => 'fetchBorrowRateHistory',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchLedgerEntry' => array(
            'testFile' => 'fetchLedgerEntry',
            'isWs' => false,
            'public' => false,
            'args' => [$code],
        ),
        'fetchWithdrawal' => array(
            'testFile' => 'fetchWithdrawal',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'transfer' => array(
            'testFile' => 'transfer',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'withdraw' => array(
            'testFile' => 'withdraw',
            'isWs' => false,
            'public' => false,
            'args' => [],
            'skip' => true,
        ),
        'fetchPositions' => array(
            'testFile' => 'fetchPositions',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchPosition' => array(
            'testFile' => 'fetchPosition',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchPositionRisk' => array(
            'testFile' => 'fetchPositionRisk',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'setPositionMode' => array(
            'testFile' => 'setPositionMode',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchOpenInterestHistory' => array(
            'testFile' => 'fetchOpenInterestHistory',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchFundingRateHistory - private' => array(
            'testFile' => 'fetchFundingRateHistory',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'fetchFundingHistory' => array(
            'testFile' => 'fetchFundingHistory',
            'isWs' => false,
            'public' => false,
            'args' => [$symbol],
            'skip' => $is_spot ? 'only run for swap markets' : null,
        ),
        'watchOHLCV' => array(
            'testFile' => 'watchOHLCV',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol],
        ),
        'watchTicker' => array(
            'testFile' => 'watchTicker',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol],
        ),
        'watchOrderBook' => array(
            'testFile' => 'watchOrderBook',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol],
        ),
        'watchTrades' => array(
            'testFile' => 'watchTrades',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol],
        ),
        'watchTickers with symbol' => array(
            'testFile' => 'watchTickers',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol],
        ),
        'watchTickers with symbol channel name' => array(
            'testFile' => 'watchTickers',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol, array(
    'name' => 'ticker',
)],
        ),
        'watchTickers with symbol channel bookTicker' => array(
            'testFile' => 'watchTickers',
            'isWs' => true,
            'public' => true,
            'args' => [$symbol, array(
    'name' => 'bookTicker',
)],
        ),
        'watchBalance' => array(
            'testFile' => 'watchBalance',
            'isWs' => true,
            'public' => false,
            'args' => [$code],
        ),
        'watchMyTrades' => array(
            'testFile' => 'watchMyTrades',
            'isWs' => true,
            'public' => false,
            'args' => [$symbol],
        ),
        'watchOrders' => array(
            'testFile' => 'watchOrders',
            'isWs' => true,
            'public' => false,
            'args' => [$symbol],
        ),
        'watchPosition' => array(
            'testFile' => 'watchPosition',
            'isWs' => true,
            'public' => false,
            'args' => [$symbol],
        ),
        'watchPositions' => array(
            'testFile' => 'watchPositions',
            'isWs' => true,
            'public' => false,
            'args' => [$symbol],
        ),
    ),
    'ace' => array(
        'skip' => 'temp',
        'skipWs' => true,
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'temporary skip, because ids are numeric and we are in wip for numeric id tests',
                'quoteId' => 'numeric',
                'quote' => 'numeric',
                'baseId' => 'numeric',
                'base' => 'numeric',
                'settleId' => 'numeric',
                'settle' => 'numeric',
                'active' => 'is undefined',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'needs reversion of amount/price',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
    ),
    'alpaca' => array(
        'skip' => 'private endpoints',
        'skipWs' => 'private endpoints',
    ),
    'ascendex' => array(
        'skipWs' => 'unknown https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L2416',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken currencies',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'low' => '16 Aug - happened weird negative 24hr low',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
    ),
    'bequant' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/264802937#L2194',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'broken bid-ask',
                'ask' => 'broken bid-ask',
            ),
        ),
    ),
    'binance' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
        'wsProxy' => 'http://5.75.153.75:8002',
        'fetchStatus' => array(
            'skip' => 'temporarily failing',
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'i.e. binance does not have currency code BCC',
                'expiry' => 'expiry not set for future markets',
                'expiryDatetime' => 'expiry not set for future markets',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided in public api',
                'networks' => 'not yet unified',
            ),
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L2466',
            ),
        ),
    ),
    'binanceus' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'expiry' => 'expiry not set for future markets',
                'expiryDatetime' => 'expiry not set for future markets',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchStatus' => array(
            'skip' => 'private endpoints',
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L2466',
            ),
        ),
    ),
    'binancecoinm' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'expiry' => 'expiry not set for future markets',
                'expiryDatetime' => 'expiry not set for future markets',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L2466',
            ),
        ),
        'watchOrderBook' => array(
            'skip' => 'out of order update',
        ),
    ),
    'binanceusdm' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchPositions' => array(
            'skip' => 'currently returns a lot of default/non open positions',
        ),
        'fetchLedger' => array(
            'skippedProperties' => array(
                'account' => 'empty',
                'status' => 'not provided',
                'before' => 'not provided',
                'after' => 'not provided',
                'fee' => 'not provided',
                'code' => 'not provided',
                'referenceId' => 'not provided',
            ),
        ),
        'fetchBalance' => array(
            'skip' => 'tmp skip',
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L2466',
            ),
        ),
    ),
    'bit2c' => array(
        'skip' => 'temporary certificate issues',
        'until' => '2023-11-25',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'active' => 'not provided',
                'taker' => 'not provided',
                'maker' => 'not provided',
                'info' => 'null',
            ),
        ),
        'fetchOrderBook' => array(
            'skippedProperties' => array(
                'bid' => 'sometimes equals to zero: https://app.travis-ci.com/github/ccxt/ccxt/builds/267809189#L2540',
                'ask' => 'same',
            ),
        ),
    ),
    'tokocrypto' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
    ),
    'bitbank' => array(),
    'bitbay' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'expiry' => 'expiry not set for future markets',
                'expiryDatetime' => 'expiry not set for future markets',
            ),
        ),
    ),
    'bitbns' => array(
        'skip' => 'temp',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'limits' => 'only one market has min>max limit',
                'active' => 'not provided',
                'currencyIdAndCode' => 'broken',
            ),
        ),
        'fetchTickers' => array(
            'skip' => 'unknown symbol might be returned',
        ),
    ),
    'bitcoincom' => array(
        'skipWs' => true,
    ),
    'bitfinex' => array(
        'loadMarkets' => array(
            'skip' => 'linear and inverse values are same',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'symbol' => 'something broken with symbol',
                'ask' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/262965121#L3179',
                'bid' => 'same',
            ),
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'symbol' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L3846',
            ),
        ),
    ),
    'bitfinex2' => array(
        'skipWs' => true,
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken currencies',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'multiple bids might have same value',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'fetchTickers' => array(
            'skip' => 'negative values',
        ),
    ),
    'bitflyer' => array(
        'loadMarkets' => array(
            'skip' => 'contract is true, but contractSize is undefined',
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'side key has an null value, but is expected to have a value',
            ),
        ),
    ),
    'bitget' => array(
        'skipWs' => true,
        'loadMarkets' => array(
            'skippedProperties' => array(
                'precision' => 'broken precision',
                'limits' => 'limit max value is zero, lwer than min',
                'contractSize' => 'not defined when contract',
                'currencyIdAndCode' => 'broken currencies',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'broken bid-ask',
                'ask' => 'broken bid-ask',
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'watchTrades' => array(
            'skippedProperties' => array(
                'timestamp' => 'ts order is reverted (descending)',
            ),
        ),
    ),
    'bithumb' => array(
        'skip' => 'fetchMarkets returning undefined',
        'until' => '2023-09-05',
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'bitmart' => array(
        'skipWs' => true,
        'loadMarkets' => array(
            'skippedProperties' => array(
                'expiry' => 'expiry is expected to be > 0',
                'settle' => 'not defined when contract',
                'settleId' => 'not defined when contract',
                'currencyIdAndCode' => 'broken currencies',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'networks' => 'missing',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'same',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'same',
            ),
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'bid==ask , https://app.travis-ci.com/github/ccxt/ccxt/builds/263304041#L2170',
        ),
        'fetchLOrderBook' => array(
            'skip' => 'same',
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4256',
                'bid' => 'wrong data https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4325',
            ),
        ),
        'watchTrades' => array(
            'skippedProperties' => array(
                'side' => 'not set https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4312',
            ),
        ),
    ),
    'bitmex' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skip' => 'some market types are out of expected market-types',
        ),
        'fetchOHLCV' => array(
            'skip' => 'open might be greater than high',
        ),
        'fetchTickers' => array(
            'skip' => 'negative values',
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'stopLossPrice' => 'undefined',
                'takeProfitPrice' => 'undefined',
                'marginRatio' => 'undefined',
                'lastPrice' => 'undefined',
                'collateral' => 'undefined',
                'hedged' => 'undefined',
                'lastUpdateTimestamp' => 'undefined',
                'entryPrice' => 'undefined',
                'markPrice' => 'undefined',
                'leverage' => 'undefined',
                'initialMargin' => 'undefined',
                'maintenanceMargin' => 'can be zero for default position',
                'notional' => 'can be zero for default position',
                'contracts' => 'contracts',
                'unrealizedPnl' => 'undefined',
                'realizedPnl' => 'undefined',
                'liquidationPrice' => 'can be 0',
                'percentage' => 'might be 0',
            ),
        ),
        'fetchMyTrades' => array(
            'skippedProperties' => array(
                'side' => 'sometimes side is not available',
            ),
        ),
        'fetchLedger' => array(
            'skippedProperties' => array(
                'referenceId' => 'undefined',
                'amount' => 'undefined',
                'before' => 'not provided',
                'tag' => 'undefined',
                'tagFrom' => 'undefined',
                'tagTo' => 'undefined',
                'type' => 'unmapped types',
                'timestamp' => 'default value might be invalid',
            ),
        ),
        'fetchDepositsWithdrawals' => array(
            'skippedProperties' => array(
                'currency' => 'undefined',
                'currencyIdAndCode' => 'messes codes',
            ),
        ),
        'fetchTransactions' => array(
            'skip' => 'skip',
        ),
    ),
    'bitopro' => array(
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'networks' => 'missing',
            ),
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken currencies',
            ),
        ),
        'watchTicker' => array(
            'skip' => 'datetime error: https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4373',
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4373',
            ),
        ),
    ),
    'bitpanda' => array(
        'skipWs' => true,
        'fetchOrderBook' => array(
            'skip' => 'some bid might be lower than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
    ),
    'bitrue' => array(
        'skipWs' => true,
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken currencies',
                'limits' => 'max is below min',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'not set',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'bid ask crossed',
                'ask' => 'bid ask crossed',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'bitso' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'not provided',
            ),
        ),
        'fetchOHLCV' => array(
            'skip' => 'randomly failing with 404 not found',
        ),
    ),
    'bitstamp' => array(
        'fetchOrderBook' => array(
            'skip' => 'bid/ask might be 0',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'bid' => 'greater than ask https://app.travis-ci.com/github/ccxt/ccxt/builds/264241638#L3027',
                'baseVolume' => 'baseVolume * low = 8.43e-6 * 3692.59081464 = 0.03112854056 < 0.0311285405674152',
                'quoteVolume' => 'quoteVolume >= baseVolume * low <<< bitstamp fetchTickers',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'same',
                'baseVolume' => 'same',
                'quoteVolume' => 'same',
            ),
        ),
        'watchOrderBook' => array(
            'skip' => 'something broken https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4473 and https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4504',
        ),
    ),
    'bitstamp1' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'info' => 'null',
                'precision' => 'not provided',
                'active' => 'not provided',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid/ask might be 0',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'bid' => 'greater than ask https://app.travis-ci.com/github/ccxt/ccxt/builds/264241638#L3027',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'same',
            ),
        ),
    ),
    'bl3p' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'active' => 'not provided',
                'info' => 'null',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'side is undefined',
            ),
        ),
    ),
    'bitvavo' => array(
        'skip' => 'temp',
        'httpsProxy' => 'http://51.83.140.52:11230',
        'skipWs' => 'temp',
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'networks' => 'missing',
            ),
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken currencies',
                'taker' => 'is undefined',
                'maker' => 'is undefined',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'broken bid-ask',
                'ask' => 'broken bid-ask',
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing https://app.travis-ci.com/github/ccxt/ccxt/builds/266144312#L2220',
            ),
        ),
    ),
    'blockchaincom' => array(
        'skipWs' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/265225134#L2304',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'taker' => 'not provided',
                'maker' => 'not provided',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid should be greater than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4517 and https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4562',
            ),
        ),
    ),
    'bkex' => array(
        'fetchOrderBook' => array(
            'skip' => 'system busy',
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken currencies',
                'contractSize' => 'broken for some markets',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'networks' => 'missing',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchOHLCV' => array(
            'skip' => 'open might be greater than high',
        ),
    ),
    'btcbox' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'precision' => 'is undefined',
                'active' => 'is undefined',
                'info' => 'null',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bids[0][0] (3787971.0) should be < than asks[0][0] (3787971.0) <<< btcbox ',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'bids[0][0] (3787971.0) should be < than asks[0][0] (3787971.0) <<< btcbox ',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'broken bid-ask',
                'ask' => 'broken bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'bid' => 'broken bid-ask',
                'ask' => 'broken bid-ask',
            ),
        ),
    ),
    'btcex' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
                'limits' => 'sometimes \'max\' value is zero, lower than \'min\'',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'messed bid-ask : https://app.travis-ci.com/github/ccxt/ccxt/builds/263319874#L2090',
                'ask' => 'same as above',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'bid' => 'same as above',
                'ask' => 'same as above',
            ),
        ),
    ),
    'btcalpha' => array(
        'skip' => true,
        'fetchOrderBook' => array(
            'skip' => 'bids[0][0] is not < asks[0][0]',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'symbol' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/265171549#L2518',
                'percentage' => 'broken',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'percentage' => '',
                'symbol' => '',
                'bid' => '',
                'ask' => '',
            ),
        ),
    ),
    'btcmarkets' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid should be greater than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
    ),
    'btctradeua' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'precision' => 'is undefined',
                'active' => 'is undefined',
                'taker' => 'is undefined',
                'maker' => 'is undefined',
                'info' => 'null',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid should be greater than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
    ),
    'btcturk' => array(
        'fetchOrderBook' => array(
            'skip' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/263287870#L2201',
        ),
    ),
    'bybit' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
        'wsProxy' => 'http://5.75.153.75:8002',
        'fetchTickers' => array(
            'skippedProperties' => array(
                'symbol' => 'returned symbol is not same as requested symbol. i.e. symbol:code vs symbol',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'symbol' => 'same',
            ),
        ),
        'fetchTrades' => array(
            'skip' => 'endpoint return Internal System Error',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'temp skip',
            ),
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'temp skip',
            ),
        ),
        'fetchPositions' => array(
            'skip' => 'currently returns a lot of default/non open positions',
        ),
        'fetchLedger' => array(
            'skippedProperties' => array(
                'account' => 'account is not provided',
                'status' => 'status is not provided',
                'fee' => 'undefined',
            ),
        ),
        'fetchOpenInterestHistory' => array(
            'skippedProperties' => array(
                'openInterestAmount' => 'openInterestAmount is not provided',
            ),
        ),
        'fetchBorrowRate' => array(
            'skip' => 'does not work with unified account',
        ),
    ),
    'buda' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
    ),
    'bigone' => array(
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'broken bid-ask',
                'ask' => 'broken bid-ask',
                'baseVolume' => 'negative value',
            ),
        ),
    ),
    'coincheck' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'info' => 'not provided',
                'precision' => 'not provided',
                'active' => 'is undefined',
                'taker' => 'is undefined',
                'maker' => 'is undefined',
            ),
        ),
    ),
    'coinbase' => array(
        'skip' => 'private endpoints',
        'skipWs' => 'needs auth',
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
            ),
        ),
        'fetchTrades' => array(
            'skip' => 'datetime is not same as timestamp',
        ),
    ),
    'coinbasepro' => array(
        'skipWs' => 'needs auth',
        'fetchStatus' => array(
            'skip' => 'request timeout',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
    ),
    'coinbaseprime' => array(
        'fetchStatus' => array(
            'skip' => 'request timeout',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
    ),
    'coinone' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quote scale isn\'t right',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quote scale isn\'t right',
            ),
        ),
    ),
    'coinspot' => array(
        'skip' => 'temp',
        'loadMarkets' => array(
            'skip' => 'precision key has an null value, but is expected to have a value| taker key missing from structure (markets are created from constructor .options, so needs to fill with default values in base)',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'ask' => 'broken bid-ask',
                'bid' => 'broken bid-ask',
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'coinsph' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'taker' => 'messed',
                'maker' => 'messed',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'cex' => array(
        'skipWs' => 'timeouts',
        'proxies' => array(
            'skip' => 'probably they do not permit our proxy location',
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
                'currencyIdAndCode' => 'messes codes',
            ),
        ),
        'fetchOHLCV' => array(
            'skip' => 'unexpected issue',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'limits' => 'min is negative',
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
                'networks' => 'missing',
            ),
        ),
    ),
    'coinex' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'broken',
                'active' => 'is undefined',
            ),
        ),
    ),
    'coinmate' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'ask should be less than next ask',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
    ),
    'cryptocom' => array(
        'skipWs' => 'timeout',
        'proxies' => array(
            'skip' => 'probably they do not permit our proxy',
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'limits' => 'max is below min',
                'active' => 'is undefined',
                'currencyIdAndCode' => 'from travis location (USA) these webapi endpoints cant be loaded',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'timestamp' => 'timestamp might be of 1970-01-01T00:00:00.000Z',
                'quoteVolume' => 'can\'t be infered',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'timestamp' => 'timestamp might be of 1970-01-01T00:00:00.000Z',
                'quoteVolume' => 'can\'t be infered',
            ),
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'entryPrice' => 'entryPrice is not provided',
                'markPrice' => 'undefined',
                'notional' => 'undefined',
                'leverage' => 'undefined',
                'liquidationPrice' => 'undefined',
                'marginMode' => 'undefined',
                'percentage' => 'undefined',
                'marginRatio' => 'undefined',
                'stopLossPrice' => 'undefined',
                'takeProfitPrice' => 'undefined',
                'maintenanceMargin' => 'undefined',
                'initialMarginPercentage' => 'undefined',
                'maintenanceMarginPercentage' => 'undefined',
                'hedged' => 'undefined',
                'side' => 'undefined',
                'contracts' => 'undefined',
            ),
        ),
        'fetchAccounts' => array(
            'skippedProperties' => array(
                'type' => 'type is not provided',
                'code' => 'not provided',
            ),
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4756',
            ),
        ),
    ),
    'currencycom' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'type' => 'unexpected market type',
                'contractSize' => 'not defined when contract',
                'settle' => 'not defined when contract',
                'settleId' => 'not defined when contract',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'ask' => 'not above bid https://app.travis-ci.com/github/ccxt/ccxt/builds/263871244#L2163',
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'ask' => 'not above bid https://app.travis-ci.com/github/ccxt/ccxt/builds/263871244#L2163',
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'delta' => array(
        'loadMarkets' => array(
            'skip' => 'expiryDatetime must be equal to expiry in iso8601 format',
        ),
        'fetchOrderBook' => array(
            'skip' => 'ask crossing bids test failing',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'failing the test',
                'bid' => 'failing the test',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'failing the test',
                'bid' => 'failing the test',
            ),
        ),
    ),
    'deribit' => array(
        'skipWs' => 'timeouts',
        'fetchCurrencies' => array(
            'skip' => 'deposit/withdraw not provided',
        ),
        'loadMarkets' => array(
            'skip' => 'strike is set when option is not true',
        ),
        'fetchTickers' => array(
            'skip' => 'something wrong',
        ),
        'fetchBalance' => array(
            'skip' => 'does not add up',
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'percentage' => 'undefined',
                'hedged' => 'undefined',
                'stopLossPrice' => 'undefined',
                'takeProfitPrice' => 'undefined',
                'lastPrice' => 'undefined',
                'collateral' => 'undefined',
                'marginMode' => 'undefined',
                'marginRatio' => 'undefined',
                'contracts' => 'undefined',
                'id' => 'undefined',
            ),
        ),
        'fetchDeposits' => array(
            'skippedProperties' => array(
                'id' => 'undefined',
                'network' => 'undefined',
                'addressFrom' => 'undefined',
                'tag' => 'undefined',
                'tagTo' => 'undefined',
                'tagFrom' => 'undefined',
                'fee' => 'undefined',
            ),
        ),
    ),
    'flowbtc' => array(
        'fetchTrades' => array(
            'skip' => 'timestamp is more than current utc timestamp',
        ),
        'fetchOHLCV' => array(
            'skip' => 'same',
        ),
    ),
    'fmfwio' => array(
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'fee' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
    ),
    'gemini' => array(
        'skipWs' => 'temporary',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed codes',
                'active' => 'not provided',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4833',
            ),
        ),
    ),
    'hitbtc' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed codes',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'fee' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
    ),
    'hitbtc3' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'limits' => 'messed min max',
                'currencyIdAndCode' => 'messed codes',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'fee' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
    ),
    'digifinex' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed codes',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'messed',
            ),
        ),
        'fetchTicker' => array(
            'skip' => 'unexpected symbol is being returned | safeMarket() requires a fourth argument for BTC_code to disambiguate between different markets with the same market id',
        ),
        'fetchTickers' => array(
            'skip' => 'unexpected symbol is being returned | safeMarket() requires a fourth argument for BTC_code to disambiguate between different markets with the same market id',
        ),
        'fetchLeverageTiers' => array(
            'skippedProperties' => array(
                'minNotional' => 'undefined',
                'currencyIdAndCode' => 'messed codes',
                'currency' => 'messed',
            ),
        ),
        'fetchBorrowRates' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed codes',
                'currency' => 'messed',
            ),
        ),
        'fetchBorrowInterest' => array(
            'skip' => 'symbol is messed',
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'percentage' => 'undefined',
                'stopLossPrice' => 'undefined',
                'takeProfitPrice' => 'undefined',
                'collateral' => 'undefined',
                'initialMargin' => 'undefined',
                'initialMarginPercentage' => 'undefined',
                'hedged' => 'undefined',
                'id' => 'undefined',
                'notional' => 'undefined',
            ),
        ),
        'fetchBalance' => array(
            'skip' => 'tmp skip',
        ),
    ),
    'gate' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed codes',
                'fetchCurrencies' => array(
                    'fee' => 'not provided',
                ),
                'limits' => 'max should be above min',
                'contractSize' => 'broken for some markets',
                'strike' => 'incorrect number type',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'timestamp' => 'timestamp is in decimals',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/262963390#L3138',
                'baseVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/262963390#L3138',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'bid' => 'same',
                'ask' => 'same',
                'quoteVolume' => 'same',
                'baseVolume' => 'same',
            ),
        ),
        'fetchPositions' => array(
            'skip' => 'currently returns a lot of default/non open positions',
        ),
        'fetchLedger' => array(
            'skippedProperties' => array(
                'currency' => 'undefined',
                'status' => 'undefined',
                'fee' => 'undefined',
                'account' => 'undefined',
                'referenceAccount' => 'undefined',
                'referenceId' => 'undefined',
            ),
        ),
        'fetchTradingFees' => array(
            'skip' => 'sandbox does not have this endpoint',
        ),
        'fetchDeposits' => array(
            'skip' => 'sandbox does not have this endpoint',
        ),
        'fetchWithdrawals' => array(
            'skip' => 'sandbox does not have this endpoint',
        ),
    ),
    'hollaex' => array(
        'skipWs' => 'temp',
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4957',
            ),
        ),
    ),
    'htx' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'limits' => 'messed',
                'currencyIdAndCode' => 'messed codes',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
                'precision' => 'is undefined',
                'limits' => 'broken somewhere',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4860',
            ),
        ),
    ),
    'huobijp' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'limits' => 'messed',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'fee' => 'not defined',
                'networks' => 'missing',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'fees' => 'missing',
            ),
        ),
    ),
    'stex' => array(
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
    ),
    'probit' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skip' => 'needs fixing',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'limits' => 'messed',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'idex' => array(
        'skipWs' => 'timeouts',
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
                'networks' => 'missing',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'messed bid-ask',
                'bid' => 'messed bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'messed bid-ask',
                'bid' => 'messed bid-ask',
            ),
        ),
    ),
    'independentreserve' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'side is undefined',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid should be greater than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
    ),
    'coinfalcon' => array(
        'fetchTickers' => array(
            'skip' => 'negative values',
        ),
    ),
    'kuna' => array(
        'skip' => 'temporary glitches with this exchange: https://app.travis-ci.com/github/ccxt/ccxt/builds/267517440#L2304',
        'httpsProxy' => 'http://5.75.153.75:8002',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'deposit' => 'is undefined',
                'withdraw' => 'is undefined',
                'active' => 'is undefined',
                'precision' => 'somewhat strange atm https://app.travis-ci.com/github/ccxt/ccxt/builds/267515280#L2337',
            ),
        ),
    ),
    'kucoin' => array(
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'depositForNonCrypto' => 'not provided',
                'withdrawForNonCrypto' => 'not provided',
            ),
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
                'quoteVolume' => 'quoteVolume <= baseVolume * high https://app.travis-ci.com/github/ccxt/ccxt/builds/263304041#L2190',
                'baseVolume' => 'same',
            ),
        ),
    ),
    'kucoinfutures' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'percentage' => 'percentage is not provided',
            ),
        ),
    ),
    'latoken' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skip' => 'negative values',
        ),
    ),
    'luno' => array(
        'skipWs' => 'temp',
        'fetchOrderBook' => array(
            'skip' => 'bid should be greater than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
    ),
    'lbank' => array(
        'loadMarkets' => array(
            'skip' => 'settle must be defined when contract is true',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'lykke' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed codes',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'fee' => 'not provided',
            ),
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid should be greater than next bid',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'same',
        ),
        'fetchTickers' => array(
            'skip' => 'negative values',
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'mercado' => array(
        'loadMarkets' => array(
            'skip' => 'needs migration to v4, as raw info is not being used. granular can be used for skipping \'info\'',
        ),
        'fetchOrderBook' => array(
            'skip' => 'bid > ask',
        ),
        'fetchL2OrderBook' => array(
            'skip' => 'bid > ask',
        ),
        'fetchTickers' => array(
            'skip' => 'bid > ask',
        ),
        'fetchTicker' => array(
            'skip' => 'bid > ask',
        ),
        'fetchCurrencies' => array(
            'skip' => 'info key is missing',
        ),
    ),
    'novadax' => array(
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/266029139',
                'bid' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/266029139',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'ndax' => array(
        'skipWs' => 'timeouts',
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
    ),
    'mexc' => array(
        'skipWs' => 'temp',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'is undefined',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'side is not buy/sell',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'bid' => 'messed bid-ask',
                'ask' => 'messed bid-ask',
            ),
        ),
        'fetchAccounts' => array(
            'skippedProperties' => array(
                'type' => 'type is not provided',
            ),
        ),
        'fetchLeverageTiers' => array(
            'skip' => 'swap only supported',
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L6610',
            ),
        ),
    ),
    'oceanex' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchOrderBooks' => array(
            'skip' => 'fetchOrderBooks returned 0 length',
        ),
    ),
    'p2b' => array(
        'skip' => 'temp issues',
        'httpsProxy' => 'http://51.83.140.52:11230',
        'loadMarkets' => array(
            'skip' => 'invalid URL',
        ),
        'fetchTrades' => array(
            'skip' => 'requires order id',
        ),
    ),
    'paymium' => array(
        'skip' => 'exchange is down',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'precision' => 'not provided',
                'active' => 'not provided',
                'info' => 'null',
                'taker' => 'is undefined',
                'maker' => 'is undefined',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'phemex' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'contractSize' => 'broken for some markets',
                'active' => 'not provided',
                'currencyIdAndCode' => 'messed',
                'taker' => 'null',
                'maker' => 'null',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'messed bid-ask',
                'bid' => 'messed bid-ask',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
                'ask' => 'messed bid-ask',
                'bid' => 'messed bid-ask',
            ),
        ),
    ),
    'okcoin' => array(
        'skipWs' => 'temp',
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'watchTicker' => array(
            'skippedProperties' => array(
                'symbol' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L6721',
            ),
        ),
    ),
    'exmo' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'info' => 'null',
                'withdraw' => 'not provided',
                'deposit' => 'not provided',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L4807',
            ),
        ),
    ),
    'poloniex' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'some currencies does not exist in currencies',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'undefined',
                'deposit' => 'undefined',
                'networks' => 'networks key is missing',
                'precision' => 'not provided',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'side is not buy/sell',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume <= baseVolume * high | https://app.travis-ci.com/github/ccxt/ccxt/builds/263884643#L2462',
                'baseVolume' => 'same',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'same',
                'baseVolume' => 'same',
            ),
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L6909',
            ),
        ),
    ),
    'okx' => array(
        'loadMarkets' => array(
            'skip' => 'linear & inverse must not be same',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'info' => 'null',
                'currencyIdAndCode' => 'temp skip',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume <= baseVolume * high : https://app.travis-ci.com/github/ccxt/ccxt/builds/263319874#L2132',
                'baseVolume' => 'same',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume <= baseVolume * high <<< okx fetchTicker',
            ),
        ),
        'fetchBorrowRate' => array(
            'skip' => 'some fields that we can\'t skip missing',
        ),
        'fetchBorrowRates' => array(
            'skip' => 'same',
        ),
        'watchOrderBook' => array(
            'skippedProperties' => array(
                'nonce' => 'missing https://app.travis-ci.com/github/ccxt/ccxt/builds/267900037#L6721',
            ),
        ),
    ),
    'tidex' => array(
        'skip' => 'exchange unavailable, probably api upgrade needed',
    ),
    'kraken' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'https://app.travis-ci.com/github/ccxt/ccxt/builds/267515280#L2314',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'undefined',
                'deposit' => 'undefined',
                'currencyIdAndCode' => 'same as in loadMarkets',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume <= baseVolume * high is failing',
                'baseVolume' => 'quoteVolume <= baseVolume * high is failing',
            ),
        ),
    ),
    'krakenfutures' => array(
        'skip' => 'continious timeouts https://app.travis-ci.com/github/ccxt/ccxt/builds/265225134#L2431',
        'timeout' => 120000,
        'loadMarkets' => array(
            'skip' => 'skip loadMarkets',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'undefined',
                'deposit' => 'undefined',
            ),
        ),
        'fetchTickers' => array(
            'skip' => 'timeouts this call specifically',
        ),
        'fetchTicker' => array(
            'skip' => 'timeouts this call specifically',
        ),
        'watchTrades' => array(
            'skip' => 'reverse timestamps',
        ),
    ),
    'upbit' => array(
        'skipWs' => 'timeouts',
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'ripio' => array(
        'httpsProxy' => 'http://5.75.153.75:8002',
    ),
    'timex' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'fee' => 'is undefined',
                'networks' => 'key not present',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'fees' => 'missingn from structure',
            ),
        ),
        'fetchTickers' => array(
            'skip' => 'temporary issues',
        ),
    ),
    'wavesexchange' => array(
        'loadMarkets' => array(
            'skip' => 'missing key',
        ),
        'fetchOHLCV' => array(
            'skip' => 'index 1 (open price) is undefined',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low is failing',
                'baseVolume' => 'quoteVolume >= baseVolume * low is failing',
            ),
        ),
    ),
    'whitebit' => array(
        'skipWs' => 'timeouts',
        'loadMarkets' => array(
            'skip' => 'contractSize must be undefined when contract is false',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'info' => 'missing key',
                'precision' => 'not provided',
                'fee' => 'is undefined',
                'networks' => 'missing',
                'limits' => 'broken for some markets',
            ),
        ),
    ),
    'woo' => array(
        'skipWs' => 'requires auth',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'undefined',
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'withdraw' => 'undefined',
                'deposit' => 'undefined',
            ),
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'leverage' => 'undefined',
                'percentage' => 'undefined',
                'hedged' => 'undefined',
                'stopLossPrice' => 'undefined',
                'takeProfitPrice' => 'undefined',
                'id' => 'undefined',
                'marginRatio' => 'undefined',
                'collateral' => 'undefined',
            ),
        ),
    ),
    'xt' => array(
        'loadMarkets' => array(
            'skip' => 'expiry and expiryDatetime are defined for non future/options markets',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'precision' => 'is undefined',
                'withdraw' => 'undefined',
                'deposit' => 'undefined',
                'fee' => 'undefined',
            ),
        ),
        'fetchTickers' => array(
            'skip' => 'some outaded contracts, eg RICHARLISONGBALL2022/code:code-221219 return bid > ask',
        ),
        'fetchTicker' => array(
            'skip' => 'same',
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'messed',
            ),
        ),
    ),
    'yobit' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'currencyIdAndCode' => 'messed',
            ),
        ),
        'fetchTickers' => array(
            'skip' => 'all tickers request exceedes max url length',
        ),
    ),
    'zaif' => array(
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'info' => 'key is missing',
            ),
        ),
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
    ),
    'zonda' => array(
        'loadMarkets' => array(
            'skippedProperties' => array(
                'active' => 'is undefined',
            ),
        ),
    ),
    'bingx' => array(
        'skipWs' => 'broken symbols returned',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'taker' => 'is undefined',
                'maker' => 'is undefined',
                'currencyIdAndCode' => 'not all currencies are available',
            ),
        ),
        'fetchTrades' => array(
            'skippedProperties' => array(
                'side' => 'undefined',
            ),
        ),
        'fetchTicker' => array(
            'skip' => 'spot not supported',
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'not supported',
            ),
        ),
        'fetchOHLCV' => array(
            'skip' => 'spot not supported',
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'deposit' => 'not provided',
                'precision' => 'not provided',
            ),
        ),
        'fetchOrderBook' => array(
            'skippedProperties' => array(
                'ask' => 'multiple ask prices are equal in ob https://app.travis-ci.com/github/ccxt/ccxt/builds/264706670#L2228',
                'bid' => 'multiple bid prices are equal https://app.travis-ci.com/github/ccxt/ccxt/builds/265172859#L2745',
            ),
        ),
        'watchTrades' => array(
            'skippedProperties' => array(
                'side' => 'undefined',
            ),
        ),
        'fetchPositions' => array(
            'skippedProperties' => array(
                'marginRatio' => 'undefined',
                'stopLossPrice' => 'undefined',
                'takeProfitPrice' => 'undefined',
                'initialMarginPercentage' => 'undefined',
                'hedged' => 'undefined',
                'timestamp' => 'undefined',
                'datetime' => 'undefined',
                'lastUpdateTimestamp' => 'undefined',
                'maintenanceMargin' => 'undefined',
                'contractSize' => 'undefined',
                'markPrice' => 'undefined',
                'lastPrice' => 'undefined',
                'percentage' => 'undefined',
                'liquidationPrice' => 'undefined',
            ),
        ),
    ),
    'wazirx' => array(
        'skipWs' => 'timeouts',
    ),
    'coinlist' => array(
        'fetchTicker' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low  is failing',
            ),
        ),
        'fetchTickers' => array(
            'skippedProperties' => array(
                'quoteVolume' => 'quoteVolume >= baseVolume * low  is failing',
                'ask' => 'invalid',
            ),
        ),
    ),
    'bitteam' => array(
        'skip' => 'tmp timeout',
        'loadMarkets' => array(
            'skippedProperties' => array(
                'taker' => 'is undefined',
                'maker' => 'is undefined',
            ),
        ),
        'fetchCurrencies' => array(
            'skippedProperties' => array(
                'deposit' => 'not provided',
                'withdraw' => 'not provided',
            ),
        ),
    ),
));
}

// ***** AUTO-TRANSPILER-END *****

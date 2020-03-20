# -*- coding: utf-8 -*-

__all__ = ['test_trade']


def test_trade(exchange, trade, method, symbol):

    trade_keys = [
        'info',
        'id',
        'timestamp',
        'datetime',
        'symbol',
        'order',
        'type',
        'side',
        'takerOrMaker',
        'price',
        'amount',
        'cost',
    ]

    for key in trade_keys:
        assert key in trade

    assert ('fee' in trade) or ('fees' in trade)

    fee_keys = ['cost', 'currency']

    if ('fee' in trade) and (trade['fee'] is not None):
        assert isinstance(trade['fee'], dict)
        for key in fee_keys:
            assert key in trade['fee']

    if ('fees' in trade) and (trade['fees'] is not None):
        assert isinstance(trade['fees'], list)
        for fee in trade['fees']:
            for key in fee_keys:
                assert key in fee

    assert (trade['id'] is None) or isinstance(trade['id'], str)
    assert (trade['timestamp'] is None) or isinstance(trade['timestamp'], int)

    if trade['timestamp'] is not None:
        assert trade['timestamp'] > 1230940800000  # 03 Jan 2009 - first block
        assert trade['timestamp'] < 2147483648000  # 19 Jan 2038 - int32 overflows

    # //------------------------------------------------------------------

    # const adjustedNow = now + 60000

    # const exchangesExcludedFromTimestampCheck = [
    #     'coinbasepro',
    #     'coinbaseprime', // ... as well, probably
    #     'kucoin2',
    # ]

    # if (trade.timestamp) {
    #     if (!exchangesExcludedFromTimestampCheck.includes (exchange.id)) {
    #         assert (trade.timestamp < adjustedNow, 'trade.timestamp is greater than or equal to current time: trade: ' + exchange.iso8601 (trade.timestamp) + ' now: ' + exchange.iso8601 (now))
    #     }
    # }

    # //------------------------------------------------------------------

    assert trade['datetime'] == exchange.iso8601(trade['timestamp'])

    # const isExchangeLackingFilteringTradesBySymbol = [
    #     'kraken', // override for kraken and possibly other exchanges as well, can't return private trades per symbol at all
    # ].includes (exchange.id)
    # if (!isExchangeLackingFilteringTradesBySymbol)
    #     assert (trade.symbol === symbol, 'trade symbol is not equal to requested symbol: trade: ' + trade.symbol + ' reqeusted: ' + symbol)

    assert (trade['type'] is None) or isinstance(trade['type'], str)
    assert (trade['side'] is None) or (trade['side'] == 'buy') or (trade['side'] == 'sell')
    assert (trade['order'] is None) or isinstance(trade['order'], str)
    assert isinstance(trade['price'], float)
    assert trade['price'] > 0
    assert isinstance(trade['amount'], float)
    assert trade['amount'] >= 0
    assert (trade['takerOrMaker'] is None) or (trade['takerOrMaker'] == 'taker') or (trade['takerOrMaker'] == 'maker')

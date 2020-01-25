# -*- coding: utf-8 -*-

__all__ = ['test_order_book']


def test_order_book(exchange, orderbook, method, symbol):
    print(
        exchange.id,
        symbol,
        method,
        orderbook['nonce'] if orderbook['nonce'] else orderbook['datetime'],
        len(orderbook['bids']), 'bids', str(orderbook['bids'][0] if len(orderbook['bids']) else 'N/A'),
        len(orderbook['asks']), 'asks', str(orderbook['asks'][0] if len(orderbook['asks']) else 'N/A'))
    # const format = {
    #     'bids': [],
    #     'asks': [],
    #     'timestamp': 1234567890,
    #     'datetime': '2017-09-01T00:00:00',
    #     'nonce': 134234234,
    #     // 'info': {},
    # }
    # expect (orderbook).to.have.all.keys (format)
    # const bids = orderbook.bids
    # const asks = orderbook.asks
    # for (let i = 0; i < bids.length; i++) {
    #     if (bids.length > (i + 1)) {
    #         assert (bids[i][0] >= bids[i + 1][0])
    #     }
    #     assert (typeof bids[i][0] === 'number')
    #     assert (typeof bids[i][1] === 'number')
    # }
    # for (let i = 0; i < asks.length; i++) {
    #     if (asks.length > (i + 1)) {
    #         assert (asks[i][0] <= asks[i + 1][0])
    #     }
    #     assert (typeof asks[i][0] === 'number')
    #     assert (typeof asks[i][1] === 'number')
    # }
    # if (![
    #     'coinmarketcap',
    #     'xbtce',
    #     'coinsecure',
    #     'upbit', // an orderbook might have a 0-price ask occasionally
    # ].includes (exchange.id)) {
    #     if (bids.length && asks.length)
    #         assert (bids[0][0] <= asks[0][0],
    #             `bids[0][0]: ${bids[0][0]} (of ${bids.length}); asks[0][0]:${asks[0][0]} (of ${asks.length})`)
    # }
    # printOrderBookOneLiner (orderbook, method, symbol)

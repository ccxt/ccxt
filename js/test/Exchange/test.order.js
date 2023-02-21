'use strict';

const sharedMethods = require ('./test.sharedMethods.js');
const testTrade = require ('./test.trade.js');

function testOrder (exchange, method, entry, symbol, now) {
    const format = {
        'info': {},
        'id': '123',
        'clientOrderId': '1234',
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'lastTradeTimestamp': 1649373610000,
        'symbol': 'XYZ/USDT',
        'type': 'limit',
        'timeInForce': 'GTC',
        'postOnly': true,
        'side': 'sell',
        'price': exchange.parseNumber ('1.23456'),
        'stopPrice': exchange.parseNumber ('1.1111'),
        'amount': exchange.parseNumber ('1.23'),
        'cost': exchange.parseNumber ('2.34'),
        'average': exchange.parseNumber ('1.234'),
        'filled': exchange.parseNumber ('1.23'),
        'remaining': exchange.parseNumber ('0.123'),
        'status': 'ok',
        'fee': {},
        'trades': [],
    };
    const emptyNotAllowedFor = [ 'id' ];
    // todo: skip some exchanges
    // const emptyNotAllowedFor = [ 'id', 'timestamp', 'symbol', 'type', 'side', 'price' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCommonTimestamp (exchange, method, entry, now);
    //
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'timeInForce', [ 'GTC', 'GTK', 'IOC', 'FOK' ]);
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'status', [ 'open', 'closed', 'canceled' ]);
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'side', [ 'buy', 'sell' ]);
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'postOnly', [ true, false ]);
    sharedMethods.reviseSymbol (exchange, method, entry, 'symbol', symbol);
    sharedMethods.Gt (exchange, method, entry, 'price', '0');
    sharedMethods.Gt (exchange, method, entry, 'stopPrice', '0');
    sharedMethods.Gt (exchange, method, entry, 'cost', '0');
    sharedMethods.Gt (exchange, method, entry, 'average', '0');
    sharedMethods.Gt (exchange, method, entry, 'average', '0');
    sharedMethods.Ge (exchange, method, entry, 'filled', '0');
    sharedMethods.Ge (exchange, method, entry, 'remaining', '0');
    sharedMethods.Ge (exchange, method, entry, 'amount', '0');
    sharedMethods.Ge (exchange, method, entry, 'amount', exchange.safeString (entry, 'remaining'));
    sharedMethods.Ge (exchange, method, entry, 'amount', exchange.safeString (entry, 'filled'));
    if (entry['trades'] !== undefined) {
        for (let i = 0; i < entry['trades'].length; i++) {
            testTrade (exchange, method, entry['trades'][i], symbol, now);
        }
    }
    sharedMethods.reviseFeeObject (exchange, method, entry['fee']);
}

module.exports = testOrder;

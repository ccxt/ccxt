import assert from 'assert';
import ccxt from '../../../ccxt.js';

function getGateContractMarket (name, orderSizeMin, enableDecimal = false, contractSize = '1') {
    return {
        'name': name,
        'type': 'direct',
        'quanto_multiplier': contractSize,
        'order_price_deviate': '0.5',
        'mark_price': '10',
        'order_price_round': '0.1',
        'order_size_min': orderSizeMin,
        'order_size_max': '1000000',
        'leverage_min': '1',
        'leverage_max': '100',
        'create_time': 1609800048,
        'enable_decimal': enableDecimal,
    };
}

function setGateContractMarket (exchange, rawMarket) {
    const market = exchange.parseContractMarket (rawMarket, 'usdt');
    const markets = {};
    markets[market['symbol']] = market;
    exchange.setMarkets (markets);
    return market['symbol'];
}

function testGate () {
    const exchange = new ccxt.gate ({
        'apiKey': 'test',
        'secret': 'test',
    });

    const decimalSymbol = setGateContractMarket (exchange, getGateContractMarket ('RAVE_USDT', '0.1', true, '10'));
    const decimalMarket = exchange.market (decimalSymbol);
    assert (exchange.numberToString (decimalMarket['precision']['amount']) === '0.1');
    assert (exchange.amountToPrecision (decimalSymbol, 1.4) === '1.4');
    assert (exchange.amountToPrecision (decimalSymbol, 0.49) === '0.4');

    const limitOrderRequest = exchange.createOrderRequest (decimalSymbol, 'limit', 'buy', 1.4, 1);
    assert (exchange.safeString (limitOrderRequest, 'size') === '1.4');

    const residualOrderRequest = exchange.createOrderRequest (decimalSymbol, 'limit', 'sell', 0.49, 1);
    assert (exchange.safeString (residualOrderRequest, 'size') === '-0.4');

    const triggerOrderRequest = exchange.createOrderRequest (decimalSymbol, 'limit', 'sell', 0.4, 1, {
        'stopLossPrice': 0.9,
    });
    assert (exchange.safeString (triggerOrderRequest['initial'], 'size') === '-0.4');
    assert (exchange.safeString (triggerOrderRequest['initial'], 'amount') === '-0.4');

    const editOrderRequest = exchange.editOrderRequest ('12345', decimalSymbol, 'limit', 'sell', 0.4, 1);
    assert (exchange.safeString (editOrderRequest, 'size') === '-0.4');

    const publicFuturesRequest = exchange.sign ('usdt/contracts', [ 'public', 'futures' ], 'GET', {});
    assert (exchange.safeString (publicFuturesRequest['headers'], 'X-Gate-Size-Decimal') === '1');

    const privateDeliveryRequest = exchange.sign ('usdt/orders', [ 'private', 'delivery' ], 'POST', {
        'contract': 'RAVE_USDT',
    });
    assert (exchange.safeString (privateDeliveryRequest['headers'], 'X-Gate-Size-Decimal') === '1');

    const publicSpotRequest = exchange.sign ('currency_pairs', [ 'public', 'spot' ], 'GET', {});
    const spotHeaders = exchange.safeDict (publicSpotRequest, 'headers');
    assert ((spotHeaders === undefined) || (exchange.safeValue (spotHeaders, 'X-Gate-Size-Decimal') === undefined));

    const integerExchange = new ccxt.gate ();
    const integerSymbol = setGateContractMarket (integerExchange, getGateContractMarket ('BTC_USDT', '1', false, '1'));
    const integerMarket = integerExchange.market (integerSymbol);
    assert (integerExchange.numberToString (integerMarket['precision']['amount']) === '1');
    assert (integerExchange.amountToPrecision (integerSymbol, 1.4) === '1');
}

export default testGate;

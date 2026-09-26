import assert from 'assert';

async function testExchangeSpecificWatchBalance (exchange: any) {
    if ((exchange.id !== 'okx') && (exchange.id !== 'myokx')) {
        return true;
    }
    exchange.balance = {};
    const client = exchange.client ('test-watch-balance');
    const initialMessage = {
        'arg': { 'channel': 'account' },
        'eventType': 'snapshot',
        'data': [
            {
                'uTime': '1752243427000',
                'details': [
                    { 'ccy': 'BTC', 'eq': '1', 'availEq': '0.75' },
                ],
            },
        ],
    };
    const initialFuture = client.future ('account');
    exchange.handleBalance (client, initialMessage);
    const initialBalance = await initialFuture;
    assert (initialBalance['BTC']['free'] === 0.75, exchange.id + ' handleBalance must resolve the initial snapshot');
    const duplicateMessage = {
        'arg': { 'channel': 'account' },
        'eventType': 'update',
        'data': [
            {
                'uTime': '1752243428000',
                'details': [
                    { 'ccy': 'BTC', 'eq': '1', 'availEq': '0.75', 'coinUsdPrice': '100001' },
                ],
            },
        ],
    };
    client.future ('account');
    exchange.handleBalance (client, duplicateMessage);
    assert ('account' in client.futures, exchange.id + ' handleBalance must not resolve a metadata-only update');
    assert (exchange.balance['timestamp'] === 1752243428000, exchange.id + ' handleBalance must cache the latest metadata');
    assert (exchange.balance['info']['eventType'] === 'update', exchange.id + ' handleBalance must cache the latest raw info');
    const changedMessage = {
        'arg': { 'channel': 'account' },
        'eventType': 'update',
        'data': [
            {
                'uTime': '1752243429000',
                'details': [
                    { 'ccy': 'BTC', 'eq': '1.25', 'availEq': '1' },
                ],
            },
        ],
    };
    const changedFuture = client.future ('account');
    exchange.handleBalance (client, changedMessage);
    const changedBalance = await changedFuture;
    assert (changedBalance['BTC']['free'] === 1, exchange.id + ' handleBalance must resolve a changed balance');
    assert (changedBalance['BTC']['total'] === 1.25, exchange.id + ' handleBalance must merge changed totals');
    const newCurrencyMessage = {
        'arg': { 'channel': 'account' },
        'eventType': 'update',
        'data': [
            {
                'uTime': '1752243430000',
                'details': [
                    { 'ccy': 'ETH', 'eq': '2', 'availEq': '1.5' },
                ],
            },
        ],
    };
    const newCurrencyFuture = client.future ('account');
    exchange.handleBalance (client, newCurrencyMessage);
    const newCurrencyBalance = await newCurrencyFuture;
    assert (newCurrencyBalance['BTC']['total'] === 1.25, exchange.id + ' handleBalance must preserve cached currencies');
    assert (newCurrencyBalance['ETH']['total'] === 2, exchange.id + ' handleBalance must resolve a newly introduced currency');
    exchange.balance = {};
    return true;
}

export default testExchangeSpecificWatchBalance;

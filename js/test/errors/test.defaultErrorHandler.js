const ccxt = require ('../../../ccxt' );

function testDefaultErrorHandler (errorClass, httpStatusCode, httpStatusText, body, url, method) {
    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });
    try {
        exchange.defaultErrorHandler (httpStatusCode, httpStatusText, body, url, method);
        throw new ccxt.ArgumentsRequired ('No error was thrown 0:');
    } catch (e) {
        if (e instanceof ccxt.ArgumentsRequired) {
            throw e;
        } else if (!(errorClass instanceof e)) {
            throw new ccxt.BaseError (errorClass + 'raised instead of ' + e);
        }
    }
}

// ------------------------------------------------

testDefaultErrorHandler (ccxt.ExchangeError, 200, 'OK', 'maintenance', 'http://lol.com', 'GET');
testDefaultErrorHandler (ccxt.DDoSProtection, 200, 'OK', 'ddos', 'http://lol.com', 'GET');
testDefaultErrorHandler (ccxt.DDoSProtection, 200, 'OK', 'ddos maintenance', 'http://lol.com', 'GET');
testDefaultErrorHandler (ccxt.DDoSProtection, 69, '6ix9ine', 'ddos', 'http://lol.com', 'GET');

testDefaultErrorHandler (ccxt.ExchangeError, 666, 'evil', 'maintenance', 'http://lol.com', 'GET');
testDefaultErrorHandler (ccxt.ExchangeNotAvailable, 404, 'Not Found', 'maintenance', 'http://lol.com', 'GET');
testDefaultErrorHandler (ccxt.ExchangeNotAvailable, 520, 'Bad Gateway', 'maintenance', 'http://lol.com', 'GET');

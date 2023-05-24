'use strict'

// ----------------------------------------------------------------------------

const jest = require('jest-mock')
const binance = require('../../binance.js')
const expect = require('expect');

// ----------------------------------------------------------------------------

// Setup tests
this.valuesOfInterest = {
    sign: {
        params: {}
    },
    fetch: {
        url: ''
    }
}


jest.spyOn(binance.prototype, 'sign').mockImplementation((path, api, method, params, headers, body) => {
    this.valuesOfInterest.sign.params = params;
    return {
        url: 'fakeUrl',
        method: 'fakeMethod',
        headers: headers,
        body: body
    }
});
jest.spyOn(binance.prototype, 'loadMarkets').mockImplementation(() => {});
jest.spyOn(binance.prototype, 'currency').mockImplementation(() => ({id: 'BTC'}));
jest.spyOn(binance.prototype, 'fetch').mockImplementation((url) => (this.valuesOfInterest.fetch.url = url));


// Test withdraw
const testWithdraw = async () => {
    const exchange = new binance({
        forcedProxy: 'https://fakeProxy.com/',
    });

    await exchange.withdraw("BTC", 500, "0xFakeAddressOfSomeoneRich");

    // No forcedProxy param is passed
    expect.expect(this.valuesOfInterest.sign.params).toEqual({coin: 'BTC', address: '0xFakeAddressOfSomeoneRich', amount: 500});

    //When using withdraw, the forcedProxy is used
    expect.expect(this.valuesOfInterest.fetch.url).toEqual('https://fakeProxy.com/fakeUrl');
}

testWithdraw();

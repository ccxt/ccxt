
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';



function helperTestHandleMarketTypeAndParams () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            'defaultType': 'valueFromOptions',
            'fetchX': {
                'defaultType': 'valueFromMethodOptions',
            },
        },
    });
    const initialParams = { 'defaultType': 'valueFromParam' };
    const market = exchange.safeMarket ('TEST1/TEST2');
    market['type'] = 'spot';
    // ########### test different variations ###########
    // case #1, should prevail: param
    const [ marketType1, params1 ] = exchange.handleMarketTypeAndParams ('fetchX', market, initialParams, 'valueDefault');
    assert ('defaultType' in initialParams);
    assert (!('defaultType' in params1));
    assert (marketType1 === 'valueFromParam');
    // case #2, should prevail: market.type
    const [ marketType2, params2 ] = exchange.handleMarketTypeAndParams ('fetchX', market, {}, 'valueDefault');
    assert ('defaultType' in initialParams);
    assert (!('defaultType' in params2));
    assert (marketType2 === 'spot');
    // case #3, should prevail: valueDefault
    const [ marketType3, params3 ] = exchange.handleMarketTypeAndParams ('fetchX', undefined, {}, 'valueDefault');
    assert ('defaultType' in initialParams);
    assert (!('defaultType' in params3));
    assert (marketType3 === 'valueDefault');
    // case #4, should prevail: method options
    const [ marketType4, params4 ] = exchange.handleMarketTypeAndParams ('fetchX', undefined, {});
    assert ('defaultType' in initialParams);
    assert (!('defaultType' in params4));
    assert (marketType4 === 'valueFromMethodOptions');
    // case #5, should prevail: options
    exchange['options']['defaultType'] = undefined;
    const [ marketType5, params5 ] = exchange.handleMarketTypeAndParams ('fetchY', undefined, {}, undefined);
    assert ('defaultType' in initialParams);
    assert (!('defaultType' in params5));
    assert (marketType5 === 'valueFromOptions');
}


function testHandleMethods () {
    helperTestHandleMarketTypeAndParams ();
}

export default testHandleMethods;


import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


function testAggregate () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const bids = [
        [ 789.1, 123.0 ],
        [ 789.100, 123.0 ],
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.10, 123.0 ],
    ];

    const asks = [
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.10, 123.0 ],
    ];

    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate (exchange.sortBy (bids, 0)), [
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.1, 369.0 ],
    ]);

    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate (exchange.sortBy (asks, 0)), [
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.10, 123.0 ],
    ]);

    testSharedMethods.deepEqual (exchange.aggregate ([]), []);
}

export default testAggregate;

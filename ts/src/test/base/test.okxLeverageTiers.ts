import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testOkxLeverageTiers () {
    const exchange = new ccxt.okx ();
    const info = [
        {
            'tier': '1',
            'instId': 'TEST',
            'minSz': '10',
            'maxSz': '20',
            'mmr': '0.01',
            'maxLever': '5',
        },
    ];
    const linearMarket = {
        'id': 'TEST',
        'symbol': 'LLY/USDT:USDT',
        'quote': 'USDT',
        'swap': true,
        'linear': true,
        'contractSize': 1,
    };
    const inverseMarket = {
        'id': 'TEST',
        'symbol': 'BTC/USD:BTC-260925',
        'quote': 'USD',
        'future': true,
        'inverse': true,
        'contractSize': 100,
    };
    const optionMarket = {
        'id': 'TEST',
        'symbol': 'BTC/USD:BTC-OPTION',
        'quote': 'USD',
        'option': true,
        'inverse': true,
        'contractSize': 1,
    };
    const marginMarket = {
        'id': 'TEST',
        'symbol': 'ETH/USDT',
        'quote': 'USDT',
        'margin': true,
    };

    const linearTier = exchange.parseMarketLeverageTiers (info, linearMarket as any, '1167')[0];
    assert (linearTier['minNotional'] === exchange.parseNumber ('11670'));
    assert (linearTier['maxNotional'] === exchange.parseNumber ('23340'));
    assert (linearTier['currency'] === 'USDT');

    const inverseInfo = exchange.deepExtend (info, [ { 'minSz': '1000', 'maxSz': '2000' } ]);
    const inverseTier = exchange.parseMarketLeverageTiers (inverseInfo, inverseMarket as any)[0];
    assert (inverseTier['minNotional'] === exchange.parseNumber ('100000'));
    assert (inverseTier['maxNotional'] === exchange.parseNumber ('200000'));
    assert (inverseTier['currency'] === 'USD');

    const optionInfo = exchange.deepExtend (info, [ { 'maxSz': '10000' } ]);
    const optionTier = exchange.parseMarketLeverageTiers (optionInfo, optionMarket as any)[0];
    assert (optionTier['maxNotional'] === exchange.parseNumber ('10000'));

    const marginInfo = exchange.deepExtend (info, [ { 'maxSz': '500' } ]);
    const marginTier = exchange.parseMarketLeverageTiers (marginInfo, marginMarket as any)[0];
    assert (marginTier['maxNotional'] === exchange.parseNumber ('500'));
}

export default testOkxLeverageTiers;
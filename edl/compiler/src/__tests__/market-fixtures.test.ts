import { test } from 'node:test';
import assert from 'node:assert';
import {
    loadMarketFixtures,
    getMarketFixture,
    validateMarketStructure,
    compareMarkets,
    getAvailableExchanges,
    getAvailableMarketTypes,
    type CCXTMarketFixture
} from '../fixtures/market-fixtures.js';

test('market-fixtures: load Binance spot fixtures', () => {
    const markets = loadMarketFixtures('binance', 'spot');

    assert.ok(Array.isArray(markets), 'Should return an array');
    assert.ok(markets.length >= 3, 'Should have at least 3 spot markets');

    // Check for expected markets
    const symbols = markets.map(m => m.symbol);
    assert.ok(symbols.includes('BTC/USDT'), 'Should include BTC/USDT');
    assert.ok(symbols.includes('ETH/BTC'), 'Should include ETH/BTC');
    assert.ok(symbols.includes('BNB/USDT'), 'Should include BNB/USDT');

    // Check market structure
    const btcMarket = markets.find(m => m.symbol === 'BTC/USDT');
    assert.ok(btcMarket, 'BTC/USDT market should exist');
    assert.strictEqual(btcMarket.type, 'spot', 'Should be spot type');
    assert.strictEqual(btcMarket.spot, true, 'Should have spot=true');
    assert.strictEqual(btcMarket.contract, false, 'Should have contract=false');
});

test('market-fixtures: load Binance futures fixtures', () => {
    const markets = loadMarketFixtures('binance', 'futures');

    assert.ok(Array.isArray(markets), 'Should return an array');
    assert.ok(markets.length >= 3, 'Should have at least 3 futures markets');

    // Check for expected markets
    const symbols = markets.map(m => m.symbol);
    assert.ok(symbols.includes('BTC/USDT:USDT'), 'Should include BTC/USDT:USDT');
    assert.ok(symbols.includes('ETH/USD:ETH'), 'Should include ETH/USD:ETH');

    // Check linear perpetual
    const btcPerp = markets.find(m => m.symbol === 'BTC/USDT:USDT');
    assert.ok(btcPerp, 'BTC/USDT:USDT market should exist');
    assert.strictEqual(btcPerp.type, 'swap', 'Should be swap type');
    assert.strictEqual(btcPerp.contract, true, 'Should have contract=true');
    assert.strictEqual(btcPerp.linear, true, 'Should be linear');
    assert.strictEqual(btcPerp.settle, 'USDT', 'Should settle in USDT');
    assert.ok(btcPerp.contractSize, 'Should have contractSize');

    // Check inverse perpetual
    const ethPerp = markets.find(m => m.symbol === 'ETH/USD:ETH');
    assert.ok(ethPerp, 'ETH/USD:ETH market should exist');
    assert.strictEqual(ethPerp.inverse, true, 'Should be inverse');
    assert.strictEqual(ethPerp.settle, 'ETH', 'Should settle in ETH');

    // Check quarterly future
    const btcQuarterly = markets.find(m => m.symbol === 'BTC/USDT:USDT-240329');
    assert.ok(btcQuarterly, 'BTC quarterly future should exist');
    assert.strictEqual(btcQuarterly.type, 'future', 'Should be future type');
    assert.strictEqual(btcQuarterly.future, true, 'Should have future=true');
    assert.ok(btcQuarterly.expiry, 'Should have expiry timestamp');
    assert.ok(btcQuarterly.expiryDatetime, 'Should have expiryDatetime');
});

test('market-fixtures: load Kraken spot fixtures', () => {
    const markets = loadMarketFixtures('kraken', 'spot');

    assert.ok(Array.isArray(markets), 'Should return an array');
    assert.ok(markets.length >= 3, 'Should have at least 3 spot markets');

    // Check for expected markets (Kraken uses XBT for BTC)
    const symbols = markets.map(m => m.symbol);
    assert.ok(symbols.includes('XBT/USD'), 'Should include XBT/USD');
    assert.ok(symbols.includes('ETH/EUR'), 'Should include ETH/EUR');
    assert.ok(symbols.includes('DOT/USD'), 'Should include DOT/USD');

    // Check Kraken-specific naming
    const xbtMarket = markets.find(m => m.symbol === 'XBT/USD');
    assert.ok(xbtMarket, 'XBT/USD market should exist');
    assert.strictEqual(xbtMarket.base, 'XBT', 'Base should be XBT');
    assert.strictEqual(xbtMarket.baseId, 'XXBT', 'BaseId should be XXBT (Kraken format)');
    assert.strictEqual(xbtMarket.type, 'spot', 'Should be spot type');
});

test('market-fixtures: load Kraken futures fixtures', () => {
    const markets = loadMarketFixtures('kraken', 'futures');

    assert.ok(Array.isArray(markets), 'Should return an array');
    assert.ok(markets.length >= 3, 'Should have at least 3 futures markets');

    // Check for expected markets
    const symbols = markets.map(m => m.symbol);
    assert.ok(symbols.includes('XBT/USD:XBT'), 'Should include XBT/USD:XBT');
    assert.ok(symbols.includes('ETH/USD:ETH'), 'Should include ETH/USD:ETH');

    // Check inverse perpetual
    const xbtPerp = markets.find(m => m.symbol === 'XBT/USD:XBT');
    assert.ok(xbtPerp, 'XBT/USD:XBT market should exist');
    assert.strictEqual(xbtPerp.id, 'PI_XBTUSD', 'Should have correct Kraken ID');
    assert.strictEqual(xbtPerp.type, 'swap', 'Should be swap type');
    assert.strictEqual(xbtPerp.inverse, true, 'Should be inverse');
    assert.strictEqual(xbtPerp.settle, 'XBT', 'Should settle in XBT');

    // Check future with expiry
    const xbtFuture = markets.find(m => m.symbol === 'XBT/USD:XBT-240329');
    assert.ok(xbtFuture, 'XBT future should exist');
    assert.strictEqual(xbtFuture.type, 'future', 'Should be future type');
    assert.ok(xbtFuture.expiry, 'Should have expiry timestamp');
});

test('market-fixtures: getMarketFixture retrieves specific market', () => {
    // Test spot market
    const btcUsdt = getMarketFixture('binance', 'BTC/USDT');
    assert.ok(btcUsdt, 'Should find BTC/USDT');
    assert.strictEqual(btcUsdt.symbol, 'BTC/USDT');

    // Test futures market
    const btcPerp = getMarketFixture('binance', 'BTC/USDT:USDT');
    assert.ok(btcPerp, 'Should find BTC/USDT:USDT');
    assert.strictEqual(btcPerp.symbol, 'BTC/USDT:USDT');

    // Test Kraken market
    const xbtUsd = getMarketFixture('kraken', 'XBT/USD');
    assert.ok(xbtUsd, 'Should find XBT/USD');
    assert.strictEqual(xbtUsd.base, 'XBT');

    // Test non-existent market
    const nonExistent = getMarketFixture('binance', 'NONEXISTENT/PAIR');
    assert.strictEqual(nonExistent, undefined, 'Should return undefined for non-existent market');
});

test('market-fixtures: validateMarketStructure validates correct markets', () => {
    const btcMarket = getMarketFixture('binance', 'BTC/USDT');
    assert.ok(btcMarket, 'Market should exist');

    const result = validateMarketStructure(btcMarket);
    assert.strictEqual(result.valid, true, 'Valid market should pass validation');
    assert.strictEqual(result.errors.length, 0, 'Should have no errors');
});

test('market-fixtures: validateMarketStructure detects missing fields', () => {
    const invalidMarket = {
        // Missing required fields
        quote: 'USDT',
        type: 'spot'
    };

    const result = validateMarketStructure(invalidMarket);
    assert.strictEqual(result.valid, false, 'Invalid market should fail validation');
    assert.ok(result.errors.length > 0, 'Should have errors');
    assert.ok(result.errors.some(e => e.includes('symbol')), 'Should report missing symbol');
    assert.ok(result.errors.some(e => e.includes('base')), 'Should report missing base');
});

test('market-fixtures: validateMarketStructure detects invalid type', () => {
    const invalidMarket = {
        symbol: 'BTC/USDT',
        base: 'BTC',
        quote: 'USDT',
        type: 'invalid-type' as any,
        precision: { amount: 0.01, price: 0.01 },
        limits: {}
    };

    const result = validateMarketStructure(invalidMarket);
    assert.strictEqual(result.valid, false, 'Should fail validation');
    assert.ok(result.errors.some(e => e.includes('Invalid type')), 'Should report invalid type');
});

test('market-fixtures: validateMarketStructure validates contract markets', () => {
    const contractMarket = getMarketFixture('binance', 'BTC/USDT:USDT');
    assert.ok(contractMarket, 'Contract market should exist');

    const result = validateMarketStructure(contractMarket);
    assert.strictEqual(result.valid, true, 'Valid contract market should pass');
    assert.strictEqual(result.errors.length, 0, 'Should have no errors');
});

test('market-fixtures: validateMarketStructure validates future markets', () => {
    const futureMarket = getMarketFixture('binance', 'BTC/USDT:USDT-240329');
    assert.ok(futureMarket, 'Future market should exist');

    const result = validateMarketStructure(futureMarket);
    assert.strictEqual(result.valid, true, 'Valid future market should pass');
    assert.strictEqual(result.errors.length, 0, 'Should have no errors');
});

test('market-fixtures: compareMarkets detects identical markets', () => {
    const market1 = getMarketFixture('binance', 'BTC/USDT');
    const market2 = getMarketFixture('binance', 'BTC/USDT');

    assert.ok(market1 && market2, 'Markets should exist');

    const result = compareMarkets(market1, market2);
    assert.strictEqual(result.equal, true, 'Identical markets should be equal');
    assert.strictEqual(result.differences.length, 0, 'Should have no differences');
});

test('market-fixtures: compareMarkets detects differences', () => {
    const market1 = getMarketFixture('binance', 'BTC/USDT');
    const market2 = getMarketFixture('binance', 'ETH/BTC');

    assert.ok(market1 && market2, 'Markets should exist');

    const result = compareMarkets(market1, market2);
    assert.strictEqual(result.equal, false, 'Different markets should not be equal');
    assert.ok(result.differences.length > 0, 'Should have differences');
    assert.ok(
        result.differences.some(d => d.includes('symbol')),
        'Should detect symbol difference'
    );
});

test('market-fixtures: compareMarkets detects precision differences', () => {
    const market1 = getMarketFixture('binance', 'BTC/USDT');
    assert.ok(market1, 'Market should exist');

    const market2: CCXTMarketFixture = {
        ...market1,
        precision: {
            amount: 0.001, // Different from market1
            price: market1.precision.price
        }
    };

    const result = compareMarkets(market1, market2);
    assert.strictEqual(result.equal, false, 'Should detect precision difference');
    assert.ok(
        result.differences.some(d => d.includes('precision.amount')),
        'Should report precision.amount difference'
    );
});

test('market-fixtures: compareMarkets detects limit differences', () => {
    const market1 = getMarketFixture('binance', 'BTC/USDT');
    assert.ok(market1, 'Market should exist');

    const market2: CCXTMarketFixture = {
        ...market1,
        limits: {
            ...market1.limits,
            amount: {
                min: 0.001, // Different from market1
                max: market1.limits.amount?.max
            }
        }
    };

    const result = compareMarkets(market1, market2);
    assert.strictEqual(result.equal, false, 'Should detect limit difference');
    assert.ok(
        result.differences.some(d => d.includes('limits.amount.min')),
        'Should report limits.amount.min difference'
    );
});

test('market-fixtures: getAvailableExchanges returns supported exchanges', () => {
    const exchanges = getAvailableExchanges();
    assert.ok(Array.isArray(exchanges), 'Should return an array');
    assert.ok(exchanges.includes('binance'), 'Should include binance');
    assert.ok(exchanges.includes('kraken'), 'Should include kraken');
});

test('market-fixtures: getAvailableMarketTypes returns supported types', () => {
    const types = getAvailableMarketTypes('binance');
    assert.ok(Array.isArray(types), 'Should return an array');
    assert.ok(types.includes('spot'), 'Should include spot');
    assert.ok(types.includes('futures'), 'Should include futures');
});

test('market-fixtures: all fixtures have required fee fields', () => {
    const exchanges = ['binance', 'kraken'];
    const types: ('spot' | 'futures')[] = ['spot', 'futures'];

    for (const exchange of exchanges) {
        for (const type of types) {
            const markets = loadMarketFixtures(exchange, type);
            for (const market of markets) {
                assert.ok(
                    market.taker !== undefined || market.maker !== undefined,
                    `${exchange} ${type} market ${market.symbol} should have fee information`
                );
            }
        }
    }
});

test('market-fixtures: all contract markets have settlement currency', () => {
    const exchanges = ['binance', 'kraken'];

    for (const exchange of exchanges) {
        const markets = loadMarketFixtures(exchange, 'futures');
        for (const market of markets) {
            if (market.contract) {
                assert.ok(
                    market.settle,
                    `${exchange} contract market ${market.symbol} should have settle currency`
                );
                assert.ok(
                    market.contractSize !== undefined,
                    `${exchange} contract market ${market.symbol} should have contractSize`
                );
            }
        }
    }
});

test('market-fixtures: precision values are reasonable', () => {
    const btcMarket = getMarketFixture('binance', 'BTC/USDT');
    assert.ok(btcMarket, 'Market should exist');

    assert.ok(
        btcMarket.precision.amount && btcMarket.precision.amount > 0,
        'Amount precision should be positive'
    );
    assert.ok(
        btcMarket.precision.price && btcMarket.precision.price > 0,
        'Price precision should be positive'
    );
});

test('market-fixtures: limit values are reasonable', () => {
    const btcMarket = getMarketFixture('binance', 'BTC/USDT');
    assert.ok(btcMarket, 'Market should exist');

    if (btcMarket.limits.amount?.min && btcMarket.limits.amount?.max) {
        assert.ok(
            btcMarket.limits.amount.min <= btcMarket.limits.amount.max,
            'Min amount should be <= max amount'
        );
    }

    if (btcMarket.limits.price?.min && btcMarket.limits.price?.max) {
        assert.ok(
            btcMarket.limits.price.min <= btcMarket.limits.price.max,
            'Min price should be <= max price'
        );
    }
});

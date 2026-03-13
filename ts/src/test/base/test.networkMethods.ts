
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function helperTestNetworkProtocolCorrector () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // for ETH
    assert (exchange.networkCodeProtocolCorrector ('USDC', 'ERC20') === 'ERC20');
    assert (exchange.networkCodeProtocolCorrector ('USDC', 'ETH') === 'ERC20');
    assert (exchange.networkCodeProtocolCorrector ('ETH', 'ERC20') === 'ETH');
    assert (exchange.networkCodeProtocolCorrector ('ETH', 'ETH') === 'ETH');

    // for TRX
    assert (exchange.networkCodeProtocolCorrector ('USDC', 'TRC20') === 'TRC20');
    assert (exchange.networkCodeProtocolCorrector ('USDC', 'TRX') === 'TRC20');
    assert (exchange.networkCodeProtocolCorrector ('TRX', 'TRC20') === 'TRX');
    assert (exchange.networkCodeProtocolCorrector ('TRX', 'TRX') === 'TRX');

    // for CRONOS
    assert (exchange.networkCodeProtocolCorrector ('USDC', 'CRC20') === 'CRC20');
    assert (exchange.networkCodeProtocolCorrector ('USDC', 'CRONOS') === 'CRC20');
    assert (exchange.networkCodeProtocolCorrector ('CRO', 'CRC20') === 'CRONOS');
    assert (exchange.networkCodeProtocolCorrector ('CRO', 'CRONOS') === 'CRONOS');

    // for BTC
    assert (exchange.networkCodeProtocolCorrector ('MEMECOIN', 'BRC20') === 'BRC20');
    assert (exchange.networkCodeProtocolCorrector ('MEMECOIN', 'BTC') === 'BRC20');
    assert (exchange.networkCodeProtocolCorrector ('BTC', 'BRC20') === 'BTC');
    assert (exchange.networkCodeProtocolCorrector ('BTC', 'BTC') === 'BTC');
}

function helperTestNetworkCodeToId () {
    // we should conduct tests with such example configuration
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            // test all different key variations
            'networks': {
                'ETH': 'Ether', // with mainnet key
                'TRC20': 'Tron', // with protocol key
                'BTC': 'Bitcoin', // with exclusive mainnet key
                'BRC20': 'Brc', // with exclusive protocol key
            },
        },
    });
    exchange.currencies = exchange.mapToSafeMap ({}); // go fix + c# uninitialized prop fix
    //
    //
    // CASE #1 : with mainnet key
    //
    //
    assert (exchange.networkCodeToId ('ETH'), 'Ether');
    assert (exchange.networkCodeToId ('ERC20'), 'Ether'); // inexistent secondary networkCode should match
    // with currencyCode
    assert (exchange.networkCodeToId ('ETH', 'USDC'), 'Ether');
    assert (exchange.networkCodeToId ('ETH', 'ETH'), 'Ether');
    assert (exchange.networkCodeToId ('ERC20', 'USDC'), 'Ether');
    assert (exchange.networkCodeToId ('ERC20', 'ETH'), 'Ether');
    //
    //
    // CASE #2 : with mainnet key
    //
    //
    assert (exchange.networkCodeToId ('TRX'), 'Tron'); // inexistent primary networkCode should match
    assert (exchange.networkCodeToId ('TRC20'), 'Tron');
    // with currencyCode
    assert (exchange.networkCodeToId ('TRX', 'USDC'), 'Tron');
    assert (exchange.networkCodeToId ('TRX', 'TRX'), 'Tron');
    assert (exchange.networkCodeToId ('TRC20', 'USDC'), 'Tron');
    assert (exchange.networkCodeToId ('TRC20', 'TRX'), 'Tron');
    //
    //
    // Case #3
    //
    //
    assert (exchange.networkCodeToId ('BTC'), 'Bitcoin'); // exclusive match
    assert (exchange.networkCodeToId ('BRC20'), 'Brc'); // exclusive match
    // with currencyCode
    assert (exchange.networkCodeToId ('BTC', 'USDC'), 'Brc');
    assert (exchange.networkCodeToId ('BTC', 'BTC'), 'Bitcoin');
    assert (exchange.networkCodeToId ('BRC20', 'USDC'), 'Brc');
    assert (exchange.networkCodeToId ('BRC20', 'BTC'), 'Bitcoin');
    //
    //
    // Case #4: unknown networkCode
    //
    //
    assert (exchange.networkCodeToId ('Xyz'), 'Xyz');
    assert (exchange.networkCodeToId ('Xyz', 'SAMPLECOIN'), 'Xyz');
}

function helperTestNetworkIdToCode () {
    // we should conduct tests with such example configuration
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            // test all different key variations
            'networks': {
                'ETH': 'Ether', // with mainnet key
                'TRC20': 'Tron', // with protocol key
                'BTC': 'Bitcoin', // with exclusive mainnet key
                'BRC20': 'Brc', // with exclusive protocol key
            },
        },
    });
    exchange.currencies = exchange.mapToSafeMap ({}); // go fix + c# uninitialized prop fix
    //
    //
    // CASE #1 : with mainnet key
    //
    //
    assert (exchange.networkIdToCode ('Ether'), 'ETH');
    // with currencyCode
    assert (exchange.networkIdToCode ('Ether', 'USDC'), 'ERC20');
    assert (exchange.networkIdToCode ('Ether', 'ETH'), 'ETH');
    //
    //
    // CASE #2 : with mainnet key
    //
    //
    assert (exchange.networkIdToCode ('Tron'), 'TRX');
    // with currencyCode
    assert (exchange.networkIdToCode ('Tron', 'USDC'), 'TRC20');
    assert (exchange.networkIdToCode ('Tron', 'TRX'), 'TRX');
    //
    //
    // Case #3
    //
    //
    assert (exchange.networkIdToCode ('Bitcoin'), 'BTC'); // exclusive match
    assert (exchange.networkIdToCode ('Brc'), 'BRC20'); // exclusive match
    // with currencyCode
    assert (exchange.networkIdToCode ('Bitcoin', 'USDC'), 'BRC20');
    assert (exchange.networkIdToCode ('Bitcoin', 'BTC'), 'BTC');
    assert (exchange.networkIdToCode ('Brc', 'USDC'), 'BRC20');
    assert (exchange.networkIdToCode ('Brc', 'BTC'), 'BTC');
    //
    //
    // Case #4: unknown networkCode
    //
    //
    assert (exchange.networkIdToCode ('Xyz'), 'Xyz');
    assert (exchange.networkIdToCode ('Xyz', 'SAMPLECOIN'), 'Xyz');
}

function testNetworkMethods () {
    helperTestNetworkProtocolCorrector ();
    // below two methods have same options
    helperTestNetworkCodeToId ();
    helperTestNetworkIdToCode ();
}

export default testNetworkMethods;

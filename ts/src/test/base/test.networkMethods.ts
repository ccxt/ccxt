
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function helperTestNetworkCodeToId (networksMap: any) {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            'networks': networksMap,
        },
    });
    exchange.currencies = exchange.mapToSafeMap ({}); // go fix + c# uninitialized prop fix
    // unified code and its alias resolve to the same id, regardless of which one options.networks uses
    assert (exchange.networkCodeToId ('ERC20') === 'Ether');
    assert (exchange.networkCodeToId ('ETH') === 'Ether');
    assert (exchange.networkCodeToId ('ERC20', 'ETH') === 'Ether');
    assert (exchange.networkCodeToId ('ETH', 'USDC') === 'Ether');
    assert (exchange.networkCodeToId ('TRC20') === 'Tron');
    assert (exchange.networkCodeToId ('TRX') === 'Tron');
    assert (exchange.networkCodeToId ('TRX', 'TRX') === 'Tron');
    assert (exchange.networkCodeToId ('BEP20') === 'Bsc');
    assert (exchange.networkCodeToId ('BSC') === 'Bsc');
    // BTC and BRC20 are distinct networks, not aliases
    assert (exchange.networkCodeToId ('BTC') === 'Bitcoin');
    assert (exchange.networkCodeToId ('BRC20') === 'Brc_20');
    assert (exchange.networkCodeToId ('BTC', 'USDC') === 'Bitcoin');
    // backward-supported aliases
    assert (exchange.networkCodeToId ('ARB') === 'Arb');
    assert (exchange.networkCodeToId ('ARBONE') === 'Arb');
    // unknown network code passes through
    assert (exchange.networkCodeToId ('Xyz') === 'Xyz');
    assert (exchange.networkCodeToId ('Xyz', 'SAMPLECOIN') === 'Xyz');
}

function helperTestNetworkIdToCode (networksMap: any) {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            'networks': networksMap,
        },
    });
    exchange.currencies = exchange.mapToSafeMap ({}); // go fix + c# uninitialized prop fix
    // always the unified code, never an alias, regardless of currency
    assert (exchange.networkIdToCode ('Ether') === 'ERC20');
    assert (exchange.networkIdToCode ('Ether', 'USDC') === 'ERC20');
    assert (exchange.networkIdToCode ('Ether', 'ETH') === 'ERC20');
    assert (exchange.networkIdToCode ('Tron') === 'TRC20');
    assert (exchange.networkIdToCode ('Tron', 'TRX') === 'TRC20');
    assert (exchange.networkIdToCode ('Bsc') === 'BEP20');
    assert (exchange.networkIdToCode ('Bsc', 'BNB') === 'BEP20');
    assert (exchange.networkIdToCode ('Arb') === 'ARBITRUM');
    assert (exchange.networkIdToCode ('Bitcoin') === 'BTC');
    assert (exchange.networkIdToCode ('Bitcoin', 'BTC') === 'BTC');
    assert (exchange.networkIdToCode ('Brc_20') === 'BRC20');
    // ids missing from options.networks still get unified when they spell an alias
    assert (exchange.networkIdToCode ('ETH') === 'ERC20');
    assert (exchange.networkIdToCode ('CRONOS') === 'CRC20');
    assert (exchange.networkIdToCode ('Xyz') === 'Xyz');
    assert (exchange.networkIdToCode ('Xyz', 'SAMPLECOIN') === 'Xyz');
}

function helperTestUnifiedNetworkCode () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'options': {
            'networks': {},
        },
    });
    exchange.currencies = exchange.mapToSafeMap ({}); // go fix + c# uninitialized prop fix
    const aliases = {
        'ETH': 'ERC20',
        'TRX': 'TRC20',
        'BSC': 'BEP20',
        'BSC20': 'BEP20',
        'CRONOS': 'CRC20',
        'ARB': 'ARBITRUM',
        'ARBONE': 'ARBITRUM',
        'ARBNOVA': 'ARBITRUM_NOVA',
    };
    const keys = Object.keys (aliases);
    for (let i = 0; i < keys.length; i++) {
        const unified = exchange.unifiedNetworkCode (keys[i]);
        assert (unified === aliases[keys[i]]);
        // unified codes are fixed points
        assert (exchange.unifiedNetworkCode (unified) === unified);
    }
    assert (exchange.unifiedNetworkCode ('BTC') === 'BTC');
}

function testNetworkMethods () {
    // keyed by alias vs keyed by unified code: both must behave identically
    const dict1 = {
        'BTC': 'Bitcoin',
        'BRC20': 'Brc_20',
        'ETH': 'Ether',
        'TRX': 'Tron',
        'BSC': 'Bsc',
        'ARB': 'Arb',
    };
    const dict2 = {
        'BTC': 'Bitcoin',
        'BRC20': 'Brc_20',
        'ERC20': 'Ether',
        'TRC20': 'Tron',
        'BEP20': 'Bsc',
        'ARBITRUM': 'Arb',
    };
    helperTestNetworkCodeToId (dict1);
    helperTestNetworkCodeToId (dict2);
    helperTestNetworkIdToCode (dict1);
    helperTestNetworkIdToCode (dict2);
    helperTestUnifiedNetworkCode ();
}

export default testNetworkMethods;

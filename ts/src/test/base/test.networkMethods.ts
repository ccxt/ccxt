
import assert from 'assert';
import ccxt from '../../../ccxt.js';


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


function helperSampleNetworkCodes () {
    return [ 'ETH', 'ERC20', 'TRON', 'TRX', 'TRC20', 'SOL', 'BSC', 'ARBONE', 'AVAXC', 'POL', 'BASE', 'SUI', 'OPTIMISM', 'OP', 'NEAR', 'CRO', 'CRONOS', 'BTC', 'APT', 'SCR', 'KAVA', 'TON', 'Cardano', 'ADA', 'HECO', 'HT', 'MNT', 'ALGO', 'RUNE', 'OSMO', 'CELO', 'HBAR', 'FTM', 'zkSync', 'EraZK', 'KLAY', 'ACA', 'STX', 'XTZ', 'NEO', 'METIS' ];
}

function helperSampleCurrencyCodes () {
    return [ 'Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Tether', 'USDT', 'BNB', 'BNB', 'XRP', 'XRP', 'USDC', 'USDC', 'Solana', 'SOL', 'TRON', 'TRX', 'Dogecoin', 'DOGE', 'Hyperliquid', 'HYPE', 'Bitcoin', 'Cash', 'BCH', 'Cardano', 'ADA', 'UNUS', 'SED', 'LEO', 'Chainlink', 'LINK', 'Ethena', 'USDe', 'USDe', 'Monero', 'XMR', 'Stellar', 'XLM', 'Dai', 'DAI', 'Litecoin', 'LTC', 'PayPal', 'USD', 'PYUSD', 'Hedera', 'HBAR', 'Avalanche', 'AVAX', 'Zcash', 'ZEC', 'Bittensor', 'TAO', 'Sui', 'SUI', 'Shiba', 'Inu', 'SHIB', 'Cronos', 'CRO', 'Toncoin', 'TON', 'WLFI', 'Tether', 'Gold', 'XAUt', '', 'PAX', 'Gold', 'PAXG', 'Mantle', 'MNT', 'Uniswap', 'UNI', 'Polkadot', 'DOT', 'Global', 'Dollar', 'USDG', 'OKB', 'OKB', 'Aster', 'ASTER', 'Aave', 'AAVE', 'NEAR', 'Protocol', 'NEAR', 'Ripple', 'USD', 'RLUSD', 'Polygon', 'POL' ];
}

function helperBatchNetworkTests () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    //
    // check batch
    //
    const exchangeDefaultOpts = exchange.getDefaultOptions ();
    const chainMappings = exchangeDefaultOpts['chainMappings'];

    const allNetworkCodes = helperSampleNetworkCodes ();
    const allCurrencyCodes = helperSampleCurrencyCodes ();
    for (let i = 0; i < allNetworkCodes.length; i++) {
        const randomNetworkCode = allNetworkCodes[i];
        for (let j = 0; j < allCurrencyCodes.length; j++) {
            const randomCurrencyCode = allCurrencyCodes[j];
            const result = exchange.networkIdToCode (randomNetworkCode, randomCurrencyCode);
            for (let k = 0; k < chainMappings.length; k++) {
                const chainMapping = chainMappings[k];
                const baseCoin = chainMapping['baseCoin'];
                const primaryNetworkCode = chainMapping['primary'];
                const secondaryNetworkCode = chainMapping['secondary'];
                const msg = 'network protocol test failed for networkCode:' + randomNetworkCode + ' & currencyCode: ' + randomCurrencyCode + ', result: ' + result + ', expected: ';
                if (randomNetworkCode === primaryNetworkCode && randomCurrencyCode === baseCoin) {
                    assert (result === primaryNetworkCode, msg + primaryNetworkCode);
                } else if (randomNetworkCode === primaryNetworkCode && randomCurrencyCode !== baseCoin) {
                    assert (result === secondaryNetworkCode, msg + secondaryNetworkCode);
                } else if (randomNetworkCode === secondaryNetworkCode && randomCurrencyCode === baseCoin) {
                    assert (result === primaryNetworkCode, msg + primaryNetworkCode);
                } else if (randomNetworkCode === secondaryNetworkCode && randomCurrencyCode !== baseCoin) {
                    assert (result === secondaryNetworkCode, msg + secondaryNetworkCode);
                }
            }
        }
    }
}


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

function testNetworkMethods () {
    helperTestNetworkProtocolCorrector ();
    helperTestNetworkCodeToId ();
    helperTestNetworkIdToCode ();
    helperBatchNetworkTests ();
}

export default testNetworkMethods;

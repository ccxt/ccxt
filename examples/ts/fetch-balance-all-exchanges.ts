import * as fs from 'fs';
import ccxt from '../../js/ccxt.js';

interface ExchangeConfig {
    apiKey: string;
    secret: string;
    options?: {
        [key: string]: any;
    };
    [key: string]: any;
}

interface KeysConfig {
    [exchangeId: string]: ExchangeConfig;
}

/**
 * @description Helper function to compare two balance objects
 * @param bal1
 * @param bal2
 * @returns {boolean} true if balances are equal
 */
function balancesEqual (bal1: { [currency: string]: string }, bal2: { [currency: string]: string }): boolean {
    const keys1 = Object.keys (bal1).sort ();
    const keys2 = Object.keys (bal2).sort ();
    if (JSON.stringify (keys1) !== JSON.stringify (keys2)) {
        return false;
    }
    for (let i = 0; i < keys1.length; i++) {
        const key = keys1[i];
        if (bal1[key] !== bal2[key]) {
            return false;
        }
    }
    return true;
}

async function fetchAllBalances () {
    try {
        // Read keys from keys.local.json
        const keysData = fs.readFileSync ('keys.local.json', 'utf-8');
        const keys: KeysConfig = JSON.parse (keysData);
        const validExchanges = Object.entries (keys);
        // Define market types to fetch
        const marketTypes = [
            { 'type': 'spot', 'params': {}},
            { 'type': 'margin', 'params': { 'type': 'margin' }},
            { 'type': 'swap', 'params': { 'type': 'swap' }},
            { 'type': 'swap', 'params': { 'type': 'swap', 'subType': 'linear' }},
            { 'type': 'swap', 'params': { 'type': 'swap', 'subType': 'inverse' }},
            { 'type': 'derivatives', 'params': { 'type': 'derivatives' }},
            { 'type': 'funding', 'params': { 'type': 'funding' }},
            { 'type': 'main', 'params': { 'type': 'main' }},
            { 'type': 'cross', 'params': { 'marginMode': 'cross' }},
            { 'type': 'isolated', 'params': { 'marginMode': 'isolated' }},
            { 'type': 'trading', 'params': { 'marginMode': 'trading' }},
            { 'type': 'cash', 'params': { 'type': 'cash' }},
            { 'type': 'future', 'params': { 'type': 'future' }},
            { 'type': 'account', 'params': { 'type': 'account' }},
            { 'type': 'financial', 'params': { 'type': 'financial' }},
            { 'type': 'wallet', 'params': { 'type': 'wallet' }},
        ];
        // Create exchange instances and fetch balances in parallel
        const balancePromises = validExchanges.map (async ([ exchangeId, config ]) => {
            try {
                const CCXT = ccxt as any;
                const ExchangeClass = CCXT[exchangeId];
                if (!ExchangeClass) {
                    throw new Error (`Exchange ${exchangeId} not found in CCXT`);
                }
                const exchange = new ExchangeClass ({
                    'apiKey': config.apiKey,
                    'secret': config.secret,
                    'options': config.options,
                    'enableRateLimit': true,
                    'timeout': 30000,
                });
                // Fetch balances for all market types
                const balanceResults = await Promise.allSettled (
                    marketTypes.map (async ({ type, params }) => {
                        try {
                            const balance = await exchange.fetchBalance (params);
                            return {
                                'marketType': type,
                                'success': true,
                                'balance': balance,
                                'error': null,
                            };
                        } catch (error) {
                            return {
                                'marketType': type,
                                'success': false,
                                'balance': null,
                                'error': error instanceof Error ? error.message : String (error),
                            };
                        }
                    })
                );
                // Extract results from Promise.allSettled
                const balances = [];
                for (let i = 0; i < balanceResults.length; i++) {
                    const result = balanceResults[i];
                    if (result.status === 'fulfilled') {
                        balances.push (result.value);
                    } else {
                        balances.push ({
                            'marketType': 'unknown',
                            'success': false,
                            'balance': null,
                            'error': 'Promise rejected',
                        });
                    }
                }
                return {
                    'exchangeId': exchangeId,
                    'success': true,
                    'balances': balances,
                    'error': null,
                };
            } catch (error) {
                return {
                    exchangeId,
                    'success': false,
                    'balances': null,
                    'error': (error instanceof Error) ? error.message : String (error),
                };
            }
        });
        // Wait for all balance fetches to complete
        const results = await Promise.all (balancePromises);
        // Build nested object structure
        const balanceObject: { [exchangeId: string]: { [marketType: string]: { [currency: string]: string }}} = {};
        for (let k = 0; k < results.length; k++) {
            const result = results[k];
            const success = result['success'];
            const exchangeId = result['exchangeId'];
            const balances = result['balances'];
            if (success && balances) {
                // First, collect all balances for each market type
                const marketBalances: { [marketType: string]: { [currency: string]: string }} = {};
                for (let j = 0; j < balances.length; j++) {
                    const balancej = balances[j];
                    const marketType = balancej['marketType'];
                    const balanceSuccess = balancej['success'];
                    const balance = balancej['balance'];
                    if (balanceSuccess && balance) {
                        marketBalances[marketType] = {};
                        const balanceKeys = Object.keys (balance);
                        for (let i = 0; i < balanceKeys.length; i++) {
                            const currency = balanceKeys[i];
                            const info = balance[currency];
                            if (typeof info === 'object' && info !== null && parseFloat (info.total || '0') > 0) {
                                marketBalances[marketType][currency] = info.total;
                            }
                        }
                    }
                }
                // Filter out empty market types (no balances > 0)
                const nonEmptyMarketTypes = [];
                const marketTypes = Object.keys (marketBalances);
                for (let i = 0; i < marketTypes.length; i++) {
                    const marketType = marketTypes[i];
                    const balances = marketBalances[marketType];
                    if (balances && Object.keys (balances).length > 0) {
                        nonEmptyMarketTypes.push (marketType);
                    }
                }
                // Find unique market types (remove duplicates)
                const uniqueMarketTypes: string[] = [];
                const seenBalances: { [key: string]: string }[] = [];
                for (let i = 0; i < nonEmptyMarketTypes.length; i++) {
                    const marketType = nonEmptyMarketTypes[i];
                    const balances = marketBalances[marketType];
                    let isDuplicate = false;
                    for (let i = 0; i < seenBalances.length; i++) {
                        const seenBalance = seenBalances[i];
                        if (balancesEqual (seenBalance, balances)) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        uniqueMarketTypes.push (marketType);
                        seenBalances.push (balances);
                    }
                }
                // Add to result object
                balanceObject[exchangeId] = {};
                for (let i = 0; i < uniqueMarketTypes.length; i++) {
                    const marketType = uniqueMarketTypes[i];
                    balanceObject[exchangeId][marketType] = marketBalances[marketType];
                }
            }
        }
        console.log (JSON.stringify (balanceObject));
    } catch (error) {
        console.error ('Error reading keys file:', error);
    }
}

try {
    fetchAllBalances ().catch ();
} catch (error) {
    console.error (error);
}

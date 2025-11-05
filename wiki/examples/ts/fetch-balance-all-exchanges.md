- [Fetch Balance All Exchanges](./examples/ts/)


 ```javascript
 import * as fs from 'fs';
import ccxt from '../../js/ccxt.js';

// Fetch balances for all exchanges, all accounts, asynchronously and output a consolidated balance object

interface ExchangeConfig {
    apiKey: string;
    secret: string;
    options?: {
        owner?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

interface KeysConfig {
    [exchangeId: string]: ExchangeConfig;
}

interface Balance {
    [exchangeId: string]: {
        [marketType: string]: {
            [currency: string]: string;
        };
    };
}

interface MarketBalances {
    [marketType: string]: {
        [currency: string]: string
    }
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
        const keysData = fs.readFileSync ('keys.local.json', 'utf-8');
        const exchanges: [string, KeysConfig][] = Object.entries (JSON.parse (keysData));

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

        // create exchange instances and fetch balances in parallel
        const balancePromises = exchanges.map (async ([ exchangeId, config ]) => {
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

                // fetch balances for all market types
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

                const balances = balanceResults.map ((result) => (result.status === 'fulfilled' ? result.value : {
                    'marketType': 'unknown',
                    'success': false,
                    'balance': null,
                    'error': 'Promise rejected',
                }));

                return {
                    'exchangeId': exchangeId,
                    'success': true,
                    'balances': balances,
                    'error': null,
                };
            } catch (error) {
                return {
                    'exchangeId': exchangeId,
                    'success': false,
                    'balances': null,
                    'error': error instanceof Error ? error.message : String (error),
                };
            }
        });

        const results = await Promise.all (balancePromises);

        const balanceObject: Balance = {};

        results.forEach (({ exchangeId, success, balances }) => {
            if (success && balances) {
                // collect all balances for each market type
                const marketBalances: MarketBalances = {};

                balances.forEach (({ marketType, 'success': balanceSuccess, balance }) => {
                    if (balanceSuccess && balance) {
                        marketBalances[marketType] = {};

                        Object.entries (balance).forEach (([ currency, info ]: [string, any]) => {
                            if (typeof info === 'object' && info !== null && parseFloat (info.total || '0') > 0) {
                                marketBalances[marketType][currency] = info.total;
                            }
                        });
                    }
                });

                // Filter out empty market types (no balances > 0)
                const nonEmptyMarketTypes = Object.keys (marketBalances).filter ((marketType) => {
                    const balances = marketBalances[marketType];
                    return balances && Object.keys (balances).length > 0;
                });

                // Find unique market types (remove duplicates)
                const uniqueMarketTypes: string[] = [];
                const seenBalances: { [key: string]: string }[] = [];

                nonEmptyMarketTypes.forEach ((marketType) => {
                    const balances = marketBalances[marketType];
                    const isDuplicate = seenBalances.some ((seenBalance) => balancesEqual (seenBalance, balances));

                    if (!isDuplicate) {
                        uniqueMarketTypes.push (marketType);
                        seenBalances.push (balances);
                    }
                });

                balanceObject[exchangeId] = {};
                uniqueMarketTypes.forEach ((marketType) => {
                    balanceObject[exchangeId][marketType] = marketBalances[marketType];
                });
            }
        });

        console.log (JSON.stringify (balanceObject, null, 2));
    } catch (error) {
        console.error ('Error reading keys file:', error);
    }
}

try {
    fetchAllBalances ();
} catch (error) {
    console.error (error);
}
 
```
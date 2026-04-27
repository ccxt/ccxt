
import { Dictionary, Str } from '../types.js';

export type SymbolFormat = 'standard' | 'binance' | 'kucoin' | 'kraken' | 'bitfinex' | 'bithumb' | 'upbit' | 'gate' | 'mexc' | 'okx' | 'bybit' | 'huobi' | 'custom';

export interface SymbolFormatConfig {
    separator: string;
    uppercase: boolean;
    baseFirst: boolean;
    includePrefix?: boolean;
    includeSuffix?: boolean;
}

export const EXCHANGE_SYMBOL_FORMATS: Dictionary<SymbolFormatConfig> = {
    standard: {
        separator: '/',
        uppercase: true,
        baseFirst: true,
    },
    binance: {
        separator: '',
        uppercase: true,
        baseFirst: true,
    },
    kucoin: {
        separator: '-',
        uppercase: true,
        baseFirst: true,
    },
    kraken: {
        separator: '/',
        uppercase: true,
        baseFirst: true,
    },
    bitfinex: {
        separator: '',
        uppercase: true,
        baseFirst: true,
    },
    bithumb: {
        separator: '_',
        uppercase: true,
        baseFirst: false,
    },
    upbit: {
        separator: '-',
        uppercase: true,
        baseFirst: false,
    },
    gate: {
        separator: '_',
        uppercase: true,
        baseFirst: true,
    },
    mexc: {
        separator: '',
        uppercase: true,
        baseFirst: true,
    },
    okx: {
        separator: '-',
        uppercase: true,
        baseFirst: true,
    },
    bybit: {
        separator: '',
        uppercase: true,
        baseFirst: true,
    },
    huobi: {
        separator: '',
        uppercase: false,
        baseFirst: true,
    },
};

export const COMMON_QUOTE_CURRENCIES = [
    'USDT', 'USDC', 'BUSD', 'USDD', 'TUSD', 'DAI', 'FRAX', 'USDP',
    'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX',
    'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD',
    'TRY', 'RUB', 'INR', 'BRL', 'MXN', 'ARS', 'UAH', 'PLN', 'SEK', 'NOK',
    'DKK', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'ISK', 'PHP', 'THB', 'VND',
    'IDR', 'MYR', 'ZAR', 'NGN', 'EGP', 'SAR', 'AED', 'CLP', 'COP', 'PEN',
];

export const COMMON_BASE_CURRENCIES = [
    'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX',
    'LTC', 'BCH', 'LINK', 'ATOM', 'UNI', 'XLM', 'ETC', 'FIL', 'THETA', 'TRX',
    'XMR', 'EOS', 'NEO', 'VET', 'FTM', 'AAVE', 'ALGO', 'XTZ', 'SAND', 'MANA',
    'SHIB', 'GRT', 'CHZ', 'RUNE', 'SUSHI', 'CRV', 'MKR', 'COMP', 'YFI', 'SNX',
];

const SEPARATORS = ['/', '-', '_', ':', '.', '@'];

function hasSeparator(symbol: string): boolean {
    for (const sep of SEPARATORS) {
        if (symbol.includes(sep)) {
            return true;
        }
    }
    return false;
}

function splitBySeparator(symbol: string): [string, string, string] | undefined {
    for (const sep of SEPARATORS) {
        const parts = symbol.split(sep);
        if (parts.length === 2) {
            return [parts[0], parts[1], sep];
        }
    }
    return undefined;
}

function detectSeparator(symbol: string): string | undefined {
    for (const sep of SEPARATORS) {
        if (symbol.includes(sep)) {
            const parts = symbol.split(sep);
            if (parts.length === 2) {
                return sep;
            }
        }
    }
    return undefined;
}

function guessQuoteCurrency(symbol: string, quoteCurrencies: string[] = COMMON_QUOTE_CURRENCIES): string | undefined {
    const upperSymbol = symbol.toUpperCase();
    for (const quote of quoteCurrencies) {
        if (upperSymbol.endsWith(quote)) {
            return quote;
        }
    }
    return undefined;
}

function guessBaseCurrency(symbol: string, baseCurrencies: string[] = COMMON_BASE_CURRENCIES): string | undefined {
    const upperSymbol = symbol.toUpperCase();
    for (const base of baseCurrencies) {
        if (upperSymbol.startsWith(base)) {
            return base;
        }
    }
    return undefined;
}

export interface ParseSymbolResult {
    base: string;
    quote: string;
    separator?: string;
    format: SymbolFormat;
    baseFirst: boolean;
}

export function parseSymbol(symbol: string, options: {
    quoteCurrencies?: string[];
    baseCurrencies?: string[];
    defaultQuote?: string;
} = {}): ParseSymbolResult | undefined {
    if (!symbol || symbol.length === 0) {
        return undefined;
    }

    const upperSymbol = symbol.toUpperCase();
    const separator = detectSeparator(upperSymbol);

    if (separator) {
        const parts = upperSymbol.split(separator);
        if (parts.length === 2) {
            const [part1, part2] = parts;
            const quoteCurrencies = options.quoteCurrencies || COMMON_QUOTE_CURRENCIES;
            
            const baseFirst = !quoteCurrencies.includes(part1) || quoteCurrencies.includes(part2);
            
            return {
                base: baseFirst ? part1 : part2,
                quote: baseFirst ? part2 : part1,
                separator: separator,
                format: detectFormatFromSeparator(separator),
                baseFirst: baseFirst,
            };
        }
    }

    const quoteCurrencies = options.quoteCurrencies || COMMON_QUOTE_CURRENCIES;
    const baseCurrencies = options.baseCurrencies || COMMON_BASE_CURRENCIES;
    
    const quote = guessQuoteCurrency(upperSymbol, quoteCurrencies);
    if (quote) {
        const base = upperSymbol.slice(0, upperSymbol.length - quote.length);
        if (base.length > 0) {
            return {
                base: base,
                quote: quote,
                separator: '',
                format: 'binance',
                baseFirst: true,
            };
        }
    }

    const base = guessBaseCurrency(upperSymbol, baseCurrencies);
    if (base) {
        const quote = upperSymbol.slice(base.length);
        if (quote.length > 0) {
            return {
                base: base,
                quote: quote,
                separator: '',
                format: 'binance',
                baseFirst: true,
            };
        }
    }

    if (options.defaultQuote) {
        const defaultQuote = options.defaultQuote.toUpperCase();
        if (upperSymbol.length > defaultQuote.length) {
            if (upperSymbol.endsWith(defaultQuote)) {
                const base = upperSymbol.slice(0, upperSymbol.length - defaultQuote.length);
                if (base.length > 0) {
                    return {
                        base: base,
                        quote: defaultQuote,
                        separator: '',
                        format: 'binance',
                        baseFirst: true,
                    };
                }
            }
            if (upperSymbol.startsWith(defaultQuote)) {
                const quote = upperSymbol.slice(defaultQuote.length);
                if (quote.length > 0) {
                    return {
                        base: defaultQuote,
                        quote: quote,
                        separator: '',
                        format: 'bithumb',
                        baseFirst: false,
                    };
                }
            }
        }
    }

    return undefined;
}

function detectFormatFromSeparator(separator: string): SymbolFormat {
    switch (separator) {
        case '/':
            return 'standard';
        case '-':
            return 'kucoin';
        case '_':
            return 'gate';
        default:
            return 'standard';
    }
}

export function symbolToStandard(symbol: string, options: {
    quoteCurrencies?: string[];
    baseCurrencies?: string[];
    defaultQuote?: string;
} = {}): string | undefined {
    const parsed = parseSymbol(symbol, options);
    if (!parsed) {
        return undefined;
    }
    return `${parsed.base}/${parsed.quote}`;
}

export function symbolFromStandard(symbol: string, format: SymbolFormat | SymbolFormatConfig): string | undefined {
    if (!symbol || !symbol.includes('/')) {
        return symbol;
    }

    const [base, quote] = symbol.split('/');
    if (!base || !quote) {
        return undefined;
    }

    let config: SymbolFormatConfig;
    if (typeof format === 'string') {
        config = EXCHANGE_SYMBOL_FORMATS[format] || EXCHANGE_SYMBOL_FORMATS.standard;
    } else {
        config = format;
    }

    const formattedBase = config.uppercase ? base.toUpperCase() : base.toLowerCase();
    const formattedQuote = config.uppercase ? quote.toUpperCase() : quote.toLowerCase();

    if (config.baseFirst) {
        return `${formattedBase}${config.separator}${formattedQuote}`;
    } else {
        return `${formattedQuote}${config.separator}${formattedBase}`;
    }
}

export function convertSymbol(symbol: string, targetFormat: SymbolFormat | SymbolFormatConfig, options: {
    quoteCurrencies?: string[];
    baseCurrencies?: string[];
    defaultQuote?: string;
} = {}): string | undefined {
    let base: string;
    let quote: string;

    if (symbol.includes('/')) {
        const parts = symbol.split('/');
        base = parts[0].toUpperCase();
        quote = parts[1].toUpperCase();
    } else {
        const parsed = parseSymbol(symbol, options);
        if (!parsed) {
            return undefined;
        }
        base = parsed.base;
        quote = parsed.quote;
    }

    return symbolFromStandard(`${base}/${quote}`, targetFormat);
}

export function detectSymbolFormat(symbol: string): SymbolFormat | undefined {
    const separator = detectSeparator(symbol);
    if (separator) {
        if (separator === '/') return 'standard';
        if (separator === '-') return 'kucoin';
        if (separator === '_') return 'gate';
        return 'standard';
    }

    if (symbol === symbol.toUpperCase()) {
        return 'binance';
    }
    if (symbol === symbol.toLowerCase()) {
        return 'huobi';
    }

    return undefined;
}

export function getExchangeFormatConfig(exchangeId: string): SymbolFormatConfig | undefined {
    const formatMap: Dictionary<SymbolFormat> = {
        'binance': 'binance',
        'binanceus': 'binance',
        'binanceusdm': 'binance',
        'binancecoinm': 'binance',
        'kucoin': 'kucoin',
        'kucoinfutures': 'kucoin',
        'kraken': 'kraken',
        'krakenfutures': 'kraken',
        'bitfinex': 'bitfinex',
        'bitfinex2': 'bitfinex',
        'bithumb': 'bithumb',
        'upbit': 'upbit',
        'gate': 'gate',
        'gateio': 'gate',
        'mexc': 'mexc',
        'mexc3': 'mexc',
        'okx': 'okx',
        'okex': 'okx',
        'okex5': 'okx',
        'bybit': 'bybit',
        'huobi': 'huobi',
        'htx': 'huobi',
    };

    const format = formatMap[exchangeId] || 'standard';
    return EXCHANGE_SYMBOL_FORMATS[format];
}

export function reverseSymbol(symbol: string, options: {
    quoteCurrencies?: string[];
    baseCurrencies?: string[];
} = {}): string | undefined {
    const parsed = parseSymbol(symbol, options);
    if (!parsed) {
        return undefined;
    }
    return `${parsed.quote}/${parsed.base}`;
}

export function isValidSymbol(symbol: string, options: {
    quoteCurrencies?: string[];
    baseCurrencies?: string[];
} = {}): boolean {
    const parsed = parseSymbol(symbol, options);
    return parsed !== undefined && parsed.base.length > 0 && parsed.quote.length > 0;
}

export {
    COMMON_QUOTE_CURRENCIES,
    COMMON_BASE_CURRENCIES,
    EXCHANGE_SYMBOL_FORMATS,
};

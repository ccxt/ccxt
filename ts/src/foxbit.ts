import Exchange from './abstract/foxbit';
import type { Currencies, Market, OrderBook, Dict, Ticker, TradingFees, Int, Str, Num, Dictionary, Trade, OHLCV, Balances, Order, Account, OrderType, OrderSide } from './base/types.js';

/**
 * @class foxbit
 * @augments Exchange
 */
export default class foxbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'foxbit',
            'name': 'Foxbit',
            'country': [ 'pt-BR' ],
            'rateLimit': 1000,
            'version': '1',
            'comment': 'Foxbit Exchange',
            'urls': {
                'logo': 'https://foxbit.com.br/wp-content/uploads/2024/05/Logo_Foxbit.png',
                'api': 'https://api.foxbit.com.br',
                'www': 'https://app.foxbit.com.br',
                'doc': [
                    'https://docs.foxbit.com.br',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'v3': {
                    'public': {
                        'get': [
                            'rest/v3/currencies',
                            'rest/v3/markets',
                            'rest/v3/markets/{market}/orderbook',
                            'rest/v3/markets/{market}/ticker/24hr',
                            'rest/v3/markets/{market}/orderbook?depth={depth}',
                        ],
                    },
                },
            },
            'has': {
                'CORS': true,
                'fetchOrderBooks': false,
                'fetchOrderBook': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fecthOrderBook': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '2w': '2w',
                '1M': '1M',
            },
            'markets': {
                'BTC/BRL': this.safeMarketStructure ({ 'id': 'btc', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'baseId': 'btc', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ETH/BRL': this.safeMarketStructure ({ 'id': 'eth', 'symbol': 'ETH/BRL', 'base': 'ETH', 'quote': 'BRL', 'baseId': 'eth', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'USDT/BRL': this.safeMarketStructure ({ 'id': 'usdt', 'symbol': 'USDT/BRL', 'base': 'USDT', 'quote': 'BRL', 'baseId': 'usdt', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'USDC/BRL': this.safeMarketStructure ({ 'id': 'usdc', 'symbol': 'USDC/BRL', 'base': 'USDC', 'quote': 'BRL', 'baseId': 'usdc', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SOL/BRL': this.safeMarketStructure ({ 'id': 'sol', 'symbol': 'SOL/BRL', 'base': 'SOL', 'quote': 'BRL', 'baseId': 'sol', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'XRP/BRL': this.safeMarketStructure ({ 'id': 'xrp', 'symbol': 'XRP/BRL', 'base': 'XRP', 'quote': 'BRL', 'baseId': 'xrp', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ADA/BRL': this.safeMarketStructure ({ 'id': 'ada', 'symbol': 'ADA/BRL', 'base': 'ADA', 'quote': 'BRL', 'baseId': 'ada', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'DOGE/BRL': this.safeMarketStructure ({ 'id': 'doge', 'symbol': 'DOGE/BRL', 'base': 'DOGE', 'quote': 'BRL', 'baseId': 'doge', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'DOT/BRL': this.safeMarketStructure ({ 'id': 'dot', 'symbol': 'DOT/BRL', 'base': 'DOT', 'quote': 'BRL', 'baseId': 'dot', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'AVAX/BRL': this.safeMarketStructure ({ 'id': 'avax', 'symbol': 'AVAX/BRL', 'base': 'AVAX', 'quote': 'BRL', 'baseId': 'avax', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SHIB/BRL': this.safeMarketStructure ({ 'id': 'shib', 'symbol': 'SHIB/BRL', 'base': 'SHIB', 'quote': 'BRL', 'baseId': 'shib', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'MATIC/BRL': this.safeMarketStructure ({ 'id': 'matic', 'symbol': 'MATIC/BRL', 'base': 'MATIC', 'quote': 'BRL', 'baseId': 'matic', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'DAI/BRL': this.safeMarketStructure ({ 'id': 'dai', 'symbol': 'DAI/BRL', 'base': 'DAI', 'quote': 'BRL', 'baseId': 'dai', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'LTC/BRL': this.safeMarketStructure ({ 'id': 'ltc', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'baseId': 'ltc', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'LINK/BRL': this.safeMarketStructure ({ 'id': 'link', 'symbol': 'LINK/BRL', 'base': 'LINK', 'quote': 'BRL', 'baseId': 'link', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'UNI/BRL': this.safeMarketStructure ({ 'id': 'uni', 'symbol': 'UNI/BRL', 'base': 'UNI', 'quote': 'BRL', 'baseId': 'uni', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'XLM/BRL': this.safeMarketStructure ({ 'id': 'xlm', 'symbol': 'XLM/BRL', 'base': 'XLM', 'quote': 'BRL', 'baseId': 'xlm', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'APE/BRL': this.safeMarketStructure ({ 'id': 'ape', 'symbol': 'APE/BRL', 'base': 'APE', 'quote': 'BRL', 'baseId': 'ape', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'MANA/BRL': this.safeMarketStructure ({ 'id': 'mana', 'symbol': 'MANA/BRL', 'base': 'MANA', 'quote': 'BRL', 'baseId': 'mana', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SAND/BRL': this.safeMarketStructure ({ 'id': 'sand', 'symbol': 'SAND/BRL', 'base': 'SAND', 'quote': 'BRL', 'baseId': 'sand', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'FTM/BRL': this.safeMarketStructure ({ 'id': 'ftm', 'symbol': 'FTM/BRL', 'base': 'FTM', 'quote': 'BRL', 'baseId': 'ftm', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'XTZ/BRL': this.safeMarketStructure ({ 'id': 'xtz', 'symbol': 'XTZ/BRL', 'base': 'XTZ', 'quote': 'BRL', 'baseId': 'xtz', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'AXS/BRL': this.safeMarketStructure ({ 'id': 'axs', 'symbol': 'AXS/BRL', 'base': 'AXS', 'quote': 'BRL', 'baseId': 'axs', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'AAVE/BRL': this.safeMarketStructure ({ 'id': 'aave', 'symbol': 'AAVE/BRL', 'base': 'AAVE', 'quote': 'BRL', 'baseId': 'aave', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'EOS/BRL': this.safeMarketStructure ({ 'id': 'eos', 'symbol': 'EOS/BRL', 'base': 'EOS', 'quote': 'BRL', 'baseId': 'eos', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'GRT/BRL': this.safeMarketStructure ({ 'id': 'grt', 'symbol': 'GRT/BRL', 'base': 'GRT', 'quote': 'BRL', 'baseId': 'grt', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'MKR/BRL': this.safeMarketStructure ({ 'id': 'mkr', 'symbol': 'MKR/BRL', 'base': 'MKR', 'quote': 'BRL', 'baseId': 'mkr', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'TUSD/BRL': this.safeMarketStructure ({ 'id': 'tusd', 'symbol': 'TUSD/BRL', 'base': 'TUSD', 'quote': 'BRL', 'baseId': 'tusd', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'NEXO/BRL': this.safeMarketStructure ({ 'id': 'nexo', 'symbol': 'NEXO/BRL', 'base': 'NEXO', 'quote': 'BRL', 'baseId': 'nexo', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'CHZ/BRL': this.safeMarketStructure ({ 'id': 'chz', 'symbol': 'CHZ/BRL', 'base': 'CHZ', 'quote': 'BRL', 'baseId': 'chz', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'QNT/BRL': this.safeMarketStructure ({ 'id': 'qnt', 'symbol': 'QNT/BRL', 'base': 'QNT', 'quote': 'BRL', 'baseId': 'qnt', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'OKB/BRL': this.safeMarketStructure ({ 'id': 'okb', 'symbol': 'OKB/BRL', 'base': 'OKB', 'quote': 'BRL', 'baseId': 'okb', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'CRV/BRL': this.safeMarketStructure ({ 'id': 'crv', 'symbol': 'CRV/BRL', 'base': 'CRV', 'quote': 'BRL', 'baseId': 'crv', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BAT/BRL': this.safeMarketStructure ({ 'id': 'bat', 'symbol': 'BAT/BRL', 'base': 'BAT', 'quote': 'BRL', 'baseId': 'bat', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'COMP/BRL': this.safeMarketStructure ({ 'id': 'comp', 'symbol': 'COMP/BRL', 'base': 'COMP', 'quote': 'BRL', 'baseId': 'comp', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'KNC/BRL': this.safeMarketStructure ({ 'id': 'knc', 'symbol': 'KNC/BRL', 'base': 'KNC', 'quote': 'BRL', 'baseId': 'knc', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'AMP/BRL': this.safeMarketStructure ({ 'id': 'amp', 'symbol': 'AMP/BRL', 'base': 'AMP', 'quote': 'BRL', 'baseId': 'amp', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ZRX/BRL': this.safeMarketStructure ({ 'id': 'zrx', 'symbol': 'ZRX/BRL', 'base': 'ZRX', 'quote': 'BRL', 'baseId': 'zrx', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'AUDIO/BRL': this.safeMarketStructure ({ 'id': 'audio', 'symbol': 'AUDIO/BRL', 'base': 'AUDIO', 'quote': 'BRL', 'baseId': 'audio', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'YFI/BRL': this.safeMarketStructure ({ 'id': 'yfi', 'symbol': 'YFI/BRL', 'base': 'YFI', 'quote': 'BRL', 'baseId': 'yfi', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SNX/BRL': this.safeMarketStructure ({ 'id': 'snx', 'symbol': 'SNX/BRL', 'base': 'SNX', 'quote': 'BRL', 'baseId': 'snx', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'STORJ/BRL': this.safeMarketStructure ({ 'id': 'storj', 'symbol': 'STORJ/BRL', 'base': 'STORJ', 'quote': 'BRL', 'baseId': 'storj', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SUSHI/BRL': this.safeMarketStructure ({ 'id': 'sushi', 'symbol': 'SUSHI/BRL', 'base': 'SUSHI', 'quote': 'BRL', 'baseId': 'sushi', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ILV/BRL': this.safeMarketStructure ({ 'id': 'ilv', 'symbol': 'ILV/BRL', 'base': 'ILV', 'quote': 'BRL', 'baseId': 'ilv', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'DYDX/BRL': this.safeMarketStructure ({ 'id': 'dydx', 'symbol': 'DYDX/BRL', 'base': 'DYDX', 'quote': 'BRL', 'baseId': 'dydx', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'YGG/BRL': this.safeMarketStructure ({ 'id': 'ygg', 'symbol': 'YGG/BRL', 'base': 'YGG', 'quote': 'BRL', 'baseId': 'ygg', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ALICE/BRL': this.safeMarketStructure ({ 'id': 'alice', 'symbol': 'ALICE/BRL', 'base': 'ALICE', 'quote': 'BRL', 'baseId': 'alice', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ALPHA/BRL': this.safeMarketStructure ({ 'id': 'alpha', 'symbol': 'ALPHA/BRL', 'base': 'ALPHA', 'quote': 'BRL', 'baseId': 'alpha', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'HTR/BRL': this.safeMarketStructure ({ 'id': 'htr', 'symbol': 'HTR/BRL', 'base': 'HTR', 'quote': 'BRL', 'baseId': 'htr', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SLP/BRL': this.safeMarketStructure ({ 'id': 'slp', 'symbol': 'SLP/BRL', 'base': 'SLP', 'quote': 'BRL', 'baseId': 'slp', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'LOOKS/BRL': this.safeMarketStructure ({ 'id': 'looks', 'symbol': 'LOOKS/BRL', 'base': 'LOOKS', 'quote': 'BRL', 'baseId': 'looks', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ABFY/BRL': this.safeMarketStructure ({ 'id': 'abfy', 'symbol': 'ABFY/BRL', 'base': 'ABFY', 'quote': 'BRL', 'baseId': 'abfy', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'MCO2/BRL': this.safeMarketStructure ({ 'id': 'mco2', 'symbol': 'MCO2/BRL', 'base': 'MCO2', 'quote': 'BRL', 'baseId': 'mco2', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'COFBR/BRL': this.safeMarketStructure ({ 'id': 'cofbr', 'symbol': 'COFBR/BRL', 'base': 'COFBR', 'quote': 'BRL', 'baseId': 'cofbr', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'LRC/BRL': this.safeMarketStructure ({ 'id': 'lrc', 'symbol': 'LRC/BRL', 'base': 'LRC', 'quote': 'BRL', 'baseId': 'lrc', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                '1INCH/BRL': this.safeMarketStructure ({ 'id': '1inch', 'symbol': '1INCH/BRL', 'base': '1INCH', 'quote': 'BRL', 'baseId': '1inch', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'RSR/BRL': this.safeMarketStructure ({ 'id': 'rsr', 'symbol': 'RSR/BRL', 'base': 'RSR', 'quote': 'BRL', 'baseId': 'rsr', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'LPT/BRL': this.safeMarketStructure ({ 'id': 'lpt', 'symbol': 'LPT/BRL', 'base': 'LPT', 'quote': 'BRL', 'baseId': 'lpt', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BAL/BRL': this.safeMarketStructure ({ 'id': 'bal', 'symbol': 'BAL/BRL', 'base': 'BAL', 'quote': 'BRL', 'baseId': 'bal', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'IMX/BRL': this.safeMarketStructure ({ 'id': 'imx', 'symbol': 'IMX/BRL', 'base': 'IMX', 'quote': 'BRL', 'baseId': 'imx', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'UMA/BRL': this.safeMarketStructure ({ 'id': 'uma', 'symbol': 'UMA/BRL', 'base': 'UMA', 'quote': 'BRL', 'baseId': 'uma', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SKL/BRL': this.safeMarketStructure ({ 'id': 'skl', 'symbol': 'SKL/BRL', 'base': 'SKL', 'quote': 'BRL', 'baseId': 'skl', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'CVC/BRL': this.safeMarketStructure ({ 'id': 'cvc', 'symbol': 'CVC/BRL', 'base': 'CVC', 'quote': 'BRL', 'baseId': 'cvc', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'CELR/BRL': this.safeMarketStructure ({ 'id': 'celr', 'symbol': 'CELR/BRL', 'base': 'CELR', 'quote': 'BRL', 'baseId': 'celr', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BTC/USDT': this.safeMarketStructure ({ 'id': 'btc', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT', 'baseId': 'btc', 'quoteId': 'usdt', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'FUREA/BRL': this.safeMarketStructure ({ 'id': 'furea', 'symbol': 'FUREA/BRL', 'base': 'FUREA', 'quote': 'BRL', 'baseId': 'furea', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ETH/USDT': this.safeMarketStructure ({ 'id': 'eth', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT', 'baseId': 'eth', 'quoteId': 'usdt', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'FMAP/BRL': this.safeMarketStructure ({ 'id': 'fmap', 'symbol': 'FMAP/BRL', 'base': 'FMAP', 'quote': 'BRL', 'baseId': 'fmap', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'FKCL/BRL': this.safeMarketStructure ({ 'id': 'fkcl', 'symbol': 'FKCL/BRL', 'base': 'FKCL', 'quote': 'BRL', 'baseId': 'fkcl', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BNB/BRL': this.safeMarketStructure ({ 'id': 'bnb', 'symbol': 'BNB/BRL', 'base': 'BNB', 'quote': 'BRL', 'baseId': 'bnb', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'CAKE/BRL': this.safeMarketStructure ({ 'id': 'cake', 'symbol': 'CAKE/BRL', 'base': 'CAKE', 'quote': 'BRL', 'baseId': 'cake', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ATOM/BRL': this.safeMarketStructure ({ 'id': 'atom', 'symbol': 'ATOM/BRL', 'base': 'ATOM', 'quote': 'BRL', 'baseId': 'atom', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BUDDHA/BRL': this.safeMarketStructure ({ 'id': 'buddha', 'symbol': 'BUDDHA/BRL', 'base': 'BUDDHA', 'quote': 'BRL', 'baseId': 'buddha', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'DOGE/USDT': this.safeMarketStructure ({ 'id': 'doge', 'symbol': 'DOGE/USDT', 'base': 'DOGE', 'quote': 'USDT', 'baseId': 'doge', 'quoteId': 'usdt', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BTC/USDC': this.safeMarketStructure ({ 'id': 'btc', 'symbol': 'BTC/USDC', 'base': 'BTC', 'quote': 'USDC', 'baseId': 'btc', 'quoteId': 'usdc', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ETH/USDC': this.safeMarketStructure ({ 'id': 'eth', 'symbol': 'ETH/USDC', 'base': 'ETH', 'quote': 'USDC', 'baseId': 'eth', 'quoteId': 'usdc', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'DOGE/USDC': this.safeMarketStructure ({ 'id': 'doge', 'symbol': 'DOGE/USDC', 'base': 'DOGE', 'quote': 'USDC', 'baseId': 'doge', 'quoteId': 'usdc', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ETH/BTC': this.safeMarketStructure ({ 'id': 'eth', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'GALA2/BRL': this.safeMarketStructure ({ 'id': 'gala2', 'symbol': 'GALA2/BRL', 'base': 'GALA2', 'quote': 'BRL', 'baseId': 'gala2', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'TRX/BRL': this.safeMarketStructure ({ 'id': 'trx', 'symbol': 'TRX/BRL', 'base': 'TRX', 'quote': 'BRL', 'baseId': 'trx', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'WLD/BRL': this.safeMarketStructure ({ 'id': 'wld', 'symbol': 'WLD/BRL', 'base': 'WLD', 'quote': 'BRL', 'baseId': 'wld', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SEI/BRL': this.safeMarketStructure ({ 'id': 'sei', 'symbol': 'SEI/BRL', 'base': 'SEI', 'quote': 'BRL', 'baseId': 'sei', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'PYUSD/BRL': this.safeMarketStructure ({ 'id': 'pyusd', 'symbol': 'PYUSD/BRL', 'base': 'PYUSD', 'quote': 'BRL', 'baseId': 'pyusd', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BCH/BRL': this.safeMarketStructure ({ 'id': 'bch', 'symbol': 'BCH/BRL', 'base': 'BCH', 'quote': 'BRL', 'baseId': 'bch', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'USDP/BRL': this.safeMarketStructure ({ 'id': 'usdp', 'symbol': 'USDP/BRL', 'base': 'USDP', 'quote': 'BRL', 'baseId': 'usdp', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'OP/BRL': this.safeMarketStructure ({ 'id': 'op', 'symbol': 'OP/BRL', 'base': 'OP', 'quote': 'BRL', 'baseId': 'op', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ALGO/BRL': this.safeMarketStructure ({ 'id': 'algo', 'symbol': 'ALGO/BRL', 'base': 'ALGO', 'quote': 'BRL', 'baseId': 'algo', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'ARB/BRL': this.safeMarketStructure ({ 'id': 'arb', 'symbol': 'ARB/BRL', 'base': 'ARB', 'quote': 'BRL', 'baseId': 'arb', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'NEAR/BRL': this.safeMarketStructure ({ 'id': 'near', 'symbol': 'NEAR/BRL', 'base': 'NEAR', 'quote': 'BRL', 'baseId': 'near', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'LDO/BRL': this.safeMarketStructure ({ 'id': 'ldo', 'symbol': 'LDO/BRL', 'base': 'LDO', 'quote': 'BRL', 'baseId': 'ldo', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'TIA/BRL': this.safeMarketStructure ({ 'id': 'tia', 'symbol': 'TIA/BRL', 'base': 'TIA', 'quote': 'BRL', 'baseId': 'tia', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'PEPE/BRL': this.safeMarketStructure ({ 'id': 'pepe', 'symbol': 'PEPE/BRL', 'base': 'PEPE', 'quote': 'BRL', 'baseId': 'pepe', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BONK/BRL': this.safeMarketStructure ({ 'id': 'bonk', 'symbol': 'BONK/BRL', 'base': 'BONK', 'quote': 'BRL', 'baseId': 'bonk', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'WIF/BRL': this.safeMarketStructure ({ 'id': 'wif', 'symbol': 'WIF/BRL', 'base': 'WIF', 'quote': 'BRL', 'baseId': 'wif', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'TON/BRL': this.safeMarketStructure ({ 'id': 'ton', 'symbol': 'TON/BRL', 'base': 'TON', 'quote': 'BRL', 'baseId': 'ton', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'RON/BRL': this.safeMarketStructure ({ 'id': 'ron', 'symbol': 'RON/BRL', 'base': 'RON', 'quote': 'BRL', 'baseId': 'ron', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'BLUR/BRL': this.safeMarketStructure ({ 'id': 'blur', 'symbol': 'BLUR/BRL', 'base': 'BLUR', 'quote': 'BRL', 'baseId': 'blur', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'HBAR/BRL': this.safeMarketStructure ({ 'id': 'hbar', 'symbol': 'HBAR/BRL', 'base': 'HBAR', 'quote': 'BRL', 'baseId': 'hbar', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'STX/BRL': this.safeMarketStructure ({ 'id': 'stx', 'symbol': 'STX/BRL', 'base': 'STX', 'quote': 'BRL', 'baseId': 'stx', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'SUI/BRL': this.safeMarketStructure ({ 'id': 'sui', 'symbol': 'SUI/BRL', 'base': 'SUI', 'quote': 'BRL', 'baseId': 'sui', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'FIL/BRL': this.safeMarketStructure ({ 'id': 'fil', 'symbol': 'FIL/BRL', 'base': 'FIL', 'quote': 'BRL', 'baseId': 'fil', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'RNDR/BRL': this.safeMarketStructure ({ 'id': 'rndr', 'symbol': 'RNDR/BRL', 'base': 'RNDR', 'quote': 'BRL', 'baseId': 'rndr', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'FET/BRL': this.safeMarketStructure ({ 'id': 'fet', 'symbol': 'FET/BRL', 'base': 'FET', 'quote': 'BRL', 'baseId': 'fet', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'INJ/BRL': this.safeMarketStructure ({ 'id': 'inj', 'symbol': 'INJ/BRL', 'base': 'INJ', 'quote': 'BRL', 'baseId': 'inj', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'RUNE/BRL': this.safeMarketStructure ({ 'id': 'rune', 'symbol': 'RUNE/BRL', 'base': 'RUNE', 'quote': 'BRL', 'baseId': 'rune', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
                'JUP/BRL': this.safeMarketStructure ({ 'id': 'jup', 'symbol': 'JUP/BRL', 'base': 'JUP', 'quote': 'BRL', 'baseId': 'jup', 'quoteId': 'brl', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true }),
            },
            'symbols': [
                '1INCH/BRL',
                'AAVE/BRL',
                'ABFY/BRL',
                'ADA/BRL',
                'ALGO/BRL',
                'ALICE/BRL',
                'ALPHA/BRL',
                'AMP/BRL',
                'APE/BRL',
                'ARB/BRL',
                'ATOM/BRL',
                'AUDIO/BRL',
                'AVAX/BRL',
                'AXS/BRL',
                'BAL/BRL',
                'BAT/BRL',
                'BCH/BRL',
                'BLUR/BRL',
                'BNB/BRL',
                'BONK/BRL',
                'BTC/BRL',
                'BTC/USDC',
                'BTC/USDT',
                'BUDDHA/BRL',
                'CAKE/BRL',
                'CELR/BRL',
                'CHZ/BRL',
                'COFBR/BRL',
                'COMP/BRL',
                'CRV/BRL',
                'CVC/BRL',
                'DAI/BRL',
                'DOGE/BRL',
                'DOGE/USDC',
                'DOGE/USDT',
                'DOT/BRL',
                'DYDX/BRL',
                'EOS/BRL',
                'ETH/BRL',
                'ETH/BTC',
                'ETH/USDC',
                'ETH/USDT',
                'FET/BRL',
                'FIL/BRL',
                'FKCL/BRL',
                'FMAP/BRL',
                'FTM/BRL',
                'FUREA/BRL',
                'GALA2/BRL',
                'GRT/BRL',
                'HBAR/BRL',
                'HTR/BRL',
                'ILV/BRL',
                'IMX/BRL',
                'INJ/BRL',
                'JUP/BRL',
                'KNC/BRL',
                'LDO/BRL',
                'LINK/BRL',
                'LOOKS/BRL',
                'LPT/BRL',
                'LRC/BRL',
                'LTC/BRL',
                'MANA/BRL',
                'MATIC/BRL',
                'MCO2/BRL',
                'MKR/BRL',
                'NEAR/BRL',
                'NEXO/BRL',
                'OKB/BRL',
                'OP/BRL',
                'PEPE/BRL',
                'PYUSD/BRL',
                'QNT/BRL',
                'RNDR/BRL',
                'RON/BRL',
                'RSR/BRL',
                'RUNE/BRL',
                'SAND/BRL',
                'SEI/BRL',
                'SHIB/BRL',
                'SKL/BRL',
                'SLP/BRL',
                'SNX/BRL',
                'SOL/BRL',
                'STORJ/BRL',
                'STX/BRL',
                'SUI/BRL',
                'SUSHI/BRL',
                'TIA/BRL',
                'TON/BRL',
                'TRX/BRL',
                'TUSD/BRL',
                'UMA/BRL',
                'UNI/BRL',
                'USDC/BRL',
                'USDP/BRL',
                'USDT/BRL',
                'WIF/BRL',
                'WLD/BRL',
                'XLM/BRL',
                'XRP/BRL',
                'XTZ/BRL',
                'YFI/BRL',
                'YGG/BRL',
                'ZRX/BRL',
            ],
            'currencies': [
                'BTC',
                'ETH',
                'USDT',
                'USDC',
                'SOL',
                'XRP',
                'ADA',
                'DOGE',
                'DOT',
                'AVAX',
                'SHIB',
                'MATIC',
                'DAI',
                'LTC',
                'LINK',
                'UNI',
                'XLM',
                'APE',
                'MANA',
                'SAND',
                'FTM',
                'XTZ',
                'AXS',
                'AAVE',
                'EOS',
                'GRT',
                'MKR',
                'TUSD',
                'NEXO',
                'CHZ',
                'QNT',
                'OKB',
                'CRV',
                'BAT',
                'COMP',
                'KNC',
                'AMP',
                'ZRX',
                'AUDIO',
                'YFI',
                'SNX',
                'STORJ',
                'SUSHI',
                'ILV',
                'DYDX',
                'YGG',
                'ALICE',
                'ALPHA',
                'HTR',
                'SLP',
                'LOOKS',
                'ABFY',
                'MCO2',
                'COFBR',
                'LRC',
                '1INCH',
                'RSR',
                'LPT',
                'BAL',
                'IMX',
                'UMA',
                'SKL',
                'CVC',
                'CELR',
                'BTC',
                'FUREA',
                'ETH',
                'FMAP',
                'FKCL',
                'BNB',
                'CAKE',
                'ATOM',
                'BUDDHA',
                'DOGE',
                'BTC',
                'ETH',
                'DOGE',
                'ETH',
                'GALA2',
                'TRX',
                'WLD',
                'SEI',
                'PYUSD',
                'BCH',
                'USDP',
                'OP',
                'ALGO',
                'ARB',
                'NEAR',
                'LDO',
                'TIA',
                'PEPE',
                'BONK',
                'WIF',
                'TON',
                'RON',
                'BLUR',
                'HBAR',
                'STX',
                'SUI',
                'FIL',
                'RNDR',
                'FET',
                'INJ',
                'RUNE',
                'JUP',
            ],
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        await this.loadMarkets ();
        const response = await this.v3PublicGetRestV3Currencies (params);
        // {
        //   "data": [
        //     {
        //       "symbol": "btc",
        //       "name": "Bitcoin",
        //       "type": "CRYPTO",
        //       "precision": 8,
        //       "deposit_info": {
        //         "min_to_confirm": "1",
        //         "min_amount": "0.0001"
        //       },
        //       "withdraw_info": {
        //         "enabled": true,
        //         "min_amount": "0.0001",
        //         "fee": "0.0001"
        //       },
        //       "category": {
        //           "code": "cripto",
        //         "name": "Cripto"
        //       }
        //     }
        //   ]
        // }
        const data = this.safeValue (response, 'data', []);
        const coins = Object.keys (data);
        const result: Dict = {};
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const currency = data[coin];
            const precison = this.safeString (currency, 'precision');
            const currencyId = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (currencyId);
            if (this.safeValue (result, code) === undefined) {
                result[code] = {
                    'id': currencyId,
                    'numericId': undefined,
                    'code': code,
                    'info': undefined,
                    'name': name,
                    'active': true,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': precison,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
        }
        return result;
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        await this.loadMarkets ();
        const response = await this.v3PublicGetRestV3Markets (params);
        //  {
        //    "data": [
        //      {
        //        "symbol": "usdtbrl",
        //        "quantity_min": "0.00002",
        //        "quantity_increment": "0.00001",
        //        "price_min": "1.0",
        //        "price_increment": "0.0001",
        //        "base": {
        //          "symbol": "btc",
        //          "name": "Bitcoin",
        //          "type": "CRYPTO",
        //          "precision": 8,
        //          "deposit_info": {
        //            "min_to_confirm": "1",
        //            "min_amount": "0.0001"
        //          },
        //          "withdraw_info": {
        //            "enabled": true,
        //            "min_amount": "0.0001",
        //            "fee": "0.0001"
        //          },
        //          "category": {
        //            "code": "cripto",
        //            "name": "Cripto"
        //          }
        //        },
        //        "quote": {
        //          "symbol": "btc",
        //          "name": "Bitcoin",
        //          "type": "CRYPTO",
        //          "precision": 8,
        //          "deposit_info": {
        //            "min_to_confirm": "1",
        //            "min_amount": "0.0001"
        //          },
        //          "withdraw_info": {
        //            "enabled": true,
        //            "min_amount": "0.0001",
        //            "fee": "0.0001"
        //          },
        //          "category": {
        //            "code": "cripto",
        //            "name": "Cripto"
        //          }
        //        }
        //      }
        //    ]
        //  }
        const markets = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseAssets = this.safeValue (market, 'base');
            const baseId = this.safeString (baseAssets, 'symbol');
            const quoteAssets = this.safeValue (market, 'quote');
            const quoteId = this.safeString2 (quoteAssets, 'quote', 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'future': undefined,
                'swap': undefined,
                'option': undefined,
                'contract': undefined,
                'settle': undefined,
                'settleId': undefined,
                'contractSize': undefined,
                'linear': undefined,
                'inverse': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'taker': undefined,
                'maker': undefined,
                'percentage': true,
                'tierBased': false,
                'feeSide': 'get',
                'precision': {
                    'price': undefined,
                    'amount': undefined,
                    'cost': undefined,
                },
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {},
                    'cost': {},
                    'leverage': {},
                },
                'info': {},
            });
        }
        return result;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['baseId'] + market['quoteId'],
        };
        const response = await this.v3PublicGetRestV3MarketsMarketTicker24hr (this.extend (request, params));
        //  {
        //    "data": [
        //      {
        //        "market_symbol": "btcbrl",
        //        "last_trade": {
        //          "price": "358504.69340000",
        //          "volume": "0.00027893",
        //          "date": "2024-01-01T00:00:00.000Z"
        //        },
        //        "rolling_24h": {
        //          "price_change": "3211.87290000",
        //          "price_change_percent": "0.90400726",
        //          "volume": "20.03206866",
        //          "trades_count": "4376",
        //          "open": "355292.82050000",
        //          "high": "362999.99990000",
        //          "low": "355002.88880000"
        //        },
        //        "best": {
        //          "ask": {
        //            "price": "358504.69340000",
        //            "volume": "0.00027893"
        //          },
        //          "bid": {
        //            "price": "358504.69340000",
        //            "volume": "0.00027893"
        //          }
        //        }
        //      }
        //    ]
        //  }
        const data = this.safeList (response, 'data', []);
        const result = this.safeDict (data, 0, {});
        return this.parseTicker (result, market);
    }

    async fetchTradingLimits (symbols: string[], params: {}): Promise<{}> {
        return [];
    }

    async fetchTradingFees (params: {}): Promise<TradingFees> {
        return {};
    }

    async fetchOrderBook (symbol: string, params: {}, limit: Int = 20): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 20;
        }
        const request: Dict = {
            'market': market['baseId'] + market['quoteId'],
            'depth': limit,
        };
        const response = await this.v3PublicGetRestV3MarketsMarketOrderbookDepthDepth (this.extend (request, params));
        //  {
        //    "sequence_id": 1234567890,
        //    "timestamp": 1713187921336,
        //    "bids": [
        //      [
        //        "3.00000000",
        //        "300.00000000"
        //      ],
        //      [
        //        "1.70000000",
        //        "310.00000000"
        //      ]
        //    ],
        //    "asks": [
        //      [
        //        "3.00000000",
        //        "300.00000000"
        //      ],
        //      [
        //        "2.00000000",
        //        "321.00000000"
        //      ]
        //    ]
        //  }
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchOrderBooks (symbols: string[], limit?: number, params?: {}): Promise<Dictionary<OrderBook>> {
        // NAO TEMOS ENDPOINT
        return undefined;
    }

    async fetchTrades (symbol: string, since?: number, limit?: number, params?: {}): Promise<Trade[]> {
        return [];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return [];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        return undefined;
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return [];
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        return [];
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return undefined;
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<{}> {
        return {};
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        return undefined;
    }

    async fetchOrders (symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]> {
        return []; // Coinex não possui essa function
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return [];
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        const url = this.urls['api'] + '/' + path;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, undefined, 'spot');
        const rolling_24h = ticker['rolling_24h'];
        const bestAsk = ticker['best']['ask'];
        const bestBid = ticker['best']['bid'];
        const lastTrade = ticker['last_trade'];
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': this.safeInteger (ticker, 'timestamp'),
            'datetime': this.iso8601 (this.safeInteger (lastTrade, 'date')),
            'high': this.safeNumber (rolling_24h, 'high'),
            'low': this.safeNumber (rolling_24h, 'low'),
            'bid': this.safeNumber (bestBid, 'price'),
            'bidVolume': this.safeNumber (bestBid, 'volume'),
            'ask': this.safeNumber (bestAsk, 'price'),
            'askVolume': this.safeNumber (bestAsk, 'volume'),
            'vwap': undefined,
            'open': this.safeNumber (rolling_24h, 'open'),
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (rolling_24h, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
}


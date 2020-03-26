'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bcex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bcex',
            'name': 'BCEX',
            'countries': [ 'CN', 'CA' ],
            'version': '1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchTradingLimits': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/77231516-851c6900-6bac-11ea-8fd6-ee5c23eddbd4.jpg',
                'api': 'https://www.bcex.top',
                'www': 'https://www.bcex.top',
                'doc': 'https://github.com/BCEX-TECHNOLOGY-LIMITED/API_Docs/wiki/Interface',
                'fees': 'https://bcex.udesk.cn/hc/articles/57085',
                'referral': 'https://www.bcex.top/register?invite_code=758978&lang=en',
            },
            'status': {
                'status': 'error',
                'updated': undefined,
                'eta': undefined,
                'url': undefined,
            },
            'api': {
                'public': {
                    'get': [
                        'Api_Market/getPriceList', // tickers
                        'Api_Order/ticker', // last ohlcv candle (ticker)
                        'Api_Order/depth', // orderbook
                        'Api_Market/getCoinTrade', // ticker
                        'Api_Order/marketOrder', // trades...
                    ],
                    'post': [
                        'Api_Market/getPriceList', // tickers
                        'Api_Order/ticker', // last ohlcv candle (ticker)
                        'Api_Order/depth', // orderbook
                        'Api_Market/getCoinTrade', // ticker
                        'Api_Order/marketOrder', // trades...
                    ],
                },
                'private': {
                    'post': [
                        'Api_Order/cancel',
                        'Api_Order/coinTrust', // limit order
                        'Api_Order/orderList', // open / all orders (my trades?)
                        'Api_Order/orderInfo',
                        'Api_Order/tradeList', // open / all orders
                        'Api_Order/trustList', // ?
                        'Api_User/userBalance',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ckusd': 0.0,
                        'other': 0.05 / 100,
                    },
                    'deposit': {},
                },
            },
            'exceptions': {
                '该币不存在,非法操作': ExchangeError, // { code: 1, msg: "该币不存在,非法操作" } - returned when a required symbol parameter is missing in the request (also, maybe on other types of errors as well)
                '公钥不合法': AuthenticationError, // { code: 1, msg: '公钥不合法' } - wrong public key
                '您的可用余额不足': InsufficientFunds, // { code: 1, msg: '您的可用余额不足' } - your available balance is insufficient
                '您的btc不足': InsufficientFunds, // { code: 1, msg: '您的btc不足' } - your btc is insufficient
                '参数非法': InvalidOrder, // {'code': 1, 'msg': '参数非法'} - 'Parameter illegal'
                '订单信息不存在': OrderNotFound, // {'code': 1, 'msg': '订单信息不存在'} - 'Order information does not exist'
            },
            'options': {
                'limits': {
                    // hardcoding is deprecated, using these predefined values is not recommended, use loadTradingLimits instead
                    'AFC/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 6, 'max': 120000 }}},
                    'AFC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 6, 'max': 120000 }}},
                    'AFT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 15, 'max': 300000 }}},
                    'AICC/CNET': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 5, 'max': 50000 }}},
                    'AIDOC/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 5, 'max': 100000 }}},
                    'AISI/ETH': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.001, 'max': 500 }}},
                    'AIT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 20, 'max': 400000 }}},
                    'ANS/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.1, 'max': 500 }}},
                    'ANS/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.1, 'max': 1000 }}},
                    'ARC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 60, 'max': 600000 }}},
                    'AXF/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 100, 'max': 1000000 }}},
                    'BASH/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 250, 'max': 3000000 }}},
                    'BATT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 60, 'max': 1500000 }}},
                    'BCD/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 0.3, 'max': 7000 }}},
                    'BHPC/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 2, 'max': 70000 }}},
                    'BHPC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 2, 'max': 60000 }}},
                    'BOPO/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 100, 'max': 2000000 }}},
                    'BOPO/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 100, 'max': 10000000 }}},
                    'BTC/CKUSD': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.001, 'max': 10 }}},
                    'BTC/CNET': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.0005, 'max': 5 }}},
                    'BTC/USDT': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.0002, 'max': 4 }}},
                    'BTE/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 25, 'max': 250000 }}},
                    'BU/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 20, 'max': 400000 }}},
                    'CIC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 3000, 'max': 30000000 }}},
                    'CIT/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 4, 'max': 40000 }}},
                    'CIT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 4, 'max': 40000 }}},
                    'CMT/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 5, 'max': 2500000 }}},
                    'CNET/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 12, 'max': 120000 }}},
                    'CNMC/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 4, 'max': 50000 }}},
                    'CTC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 5, 'max': 550000 }}},
                    'CZR/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 12, 'max': 500000 }}},
                    'DCON/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 8, 'max': 300000 }}},
                    'DCT/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 2, 'max': 40000 }}},
                    'DCT/CKUSD': { 'precision': { 'amount': 2, 'price': 3 }, 'limits': { 'amount': { 'min': 2, 'max': 2000 }}},
                    'DOGE/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 3000, 'max': 14000000 }}},
                    'DOGE/CKUSD': { 'precision': { 'amount': 2, 'price': 6 }, 'limits': { 'amount': { 'min': 500, 'max': 2000000 }}},
                    'DRCT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 16, 'max': 190000 }}},
                    'ELA/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 0.02, 'max': 500 }}},
                    'ELF/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 0.1, 'max': 100000 }}},
                    'ELF/CKUSD': { 'precision': { 'amount': 2, 'price': 3 }, 'limits': { 'amount': { 'min': 0.01, 'max': 100000 }}},
                    'EOS/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.5, 'max': 5000 }}},
                    'EOS/CNET': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 2.5, 'max': 30000 }}},
                    'EOS/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 0.18, 'max': 1800 }}},
                    'ETC/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.2, 'max': 2500 }}},
                    'ETC/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.2, 'max': 2500 }}},
                    'ETF/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 7, 'max': 150000 }}},
                    'ETH/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.015, 'max': 100 }}},
                    'ETH/CKUSD': { 'precision': { 'amount': 4, 'price': 4 }, 'limits': { 'amount': { 'min': 0.005, 'max': 100 }}},
                    'ETH/USDT': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.005, 'max': 100 }}},
                    'FCT/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.24, 'max': 1000 }}},
                    'FCT/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.24, 'max': 1000 }}},
                    'GAME/CNET': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 1, 'max': 10000 }}},
                    'GOOC/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 200, 'max': 2000000 }}},
                    'GP/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 600, 'max': 6000000 }}},
                    'HSC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 1000, 'max': 20000000 }}},
                    'IFISH/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 300, 'max': 8000000 }}},
                    'IIC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 50, 'max': 4000000 }}},
                    'IMOS/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 15, 'max': 300000 }}},
                    'JC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 300, 'max': 3000000 }}},
                    'LBTC/BTC': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 0.1, 'max': 3000 }}},
                    'LEC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 500, 'max': 5000000 }}},
                    'LKY/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 10, 'max': 70000 }}},
                    'LKY/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 10, 'max': 100000 }}},
                    'LMC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 25, 'max': 250000 }}},
                    'LSK/CNET': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.3, 'max': 3000 }}},
                    'LTC/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': 500 }}},
                    'LTC/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.01, 'max': 500 }}},
                    'LTC/USDT': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.02, 'max': 450 }}},
                    'MC/CNET': { 'precision': { 'amount': 2, 'price': 6 }, 'limits': { 'amount': { 'min': 10000, 'max': 100000000 }}},
                    'MCC/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 30, 'max': 350000 }}},
                    'MOC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 25, 'max': 600000 }}},
                    'MRYC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 300, 'max': 3000000 }}},
                    'MT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 200, 'max': 6000000 }}},
                    'MXI/CNET': { 'precision': { 'amount': 2, 'price': 6 }, 'limits': { 'amount': { 'min': 5000, 'max': 60000000 }}},
                    'NAI/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 10, 'max': 100000 }}},
                    'NAS/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.2, 'max': 15000 }}},
                    'NAS/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.5, 'max': 5000 }}},
                    'NEWOS/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 65, 'max': 700000 }}},
                    'NKN/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 3, 'max': 350000 }}},
                    'NTK/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 2, 'max': 30000 }}},
                    'ONT/CKUSD': { 'precision': { 'amount': 2, 'price': 3 }, 'limits': { 'amount': { 'min': 0.2, 'max': 2000 }}},
                    'ONT/ETH': { 'precision': { 'amount': 3, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': 1000 }}},
                    'PNT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 80, 'max': 800000 }}},
                    'PST/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 5, 'max': 100000 }}},
                    'PTT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 450, 'max': 10000000 }}},
                    'QTUM/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.4, 'max': 2800 }}},
                    'QTUM/CKUSD': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 0.1, 'max': 1000 }}},
                    'RATING/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 500, 'max': 10000000 }}},
                    'RHC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 1000, 'max': 10000000 }}},
                    'SDA/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 20, 'max': 500000 }}},
                    'SDD/CKUSD': { 'precision': { 'amount': 2, 'price': 3 }, 'limits': { 'amount': { 'min': 10, 'max': 100000 }}},
                    'SHC/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 250, 'max': 2500000 }}},
                    'SHE/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 100, 'max': 5000000 }}},
                    'SMC/CNET': { 'precision': { 'amount': 2, 'price': 6 }, 'limits': { 'amount': { 'min': 1000, 'max': 10000000 }}},
                    'SOP/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 50, 'max': 1000000 }}},
                    'TAC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 35, 'max': 800000 }}},
                    'TIP/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 7, 'max': 200000 }}},
                    'TKT/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 40, 'max': 400000 }}},
                    'TLC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 500, 'max': 10000000 }}},
                    'TNC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 10, 'max': 110000 }}},
                    'TUB/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 200, 'max': 8000000 }}},
                    'UC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 100, 'max': 3000000 }}},
                    'UDB/CNET': { 'precision': { 'amount': 2, 'price': 6 }, 'limits': { 'amount': { 'min': 2000, 'max': 40000000 }}},
                    'UIC/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 5, 'max': 150000 }}},
                    'VAAC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 10, 'max': 250000 }}},
                    'VPN/CNET': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 200, 'max': 2000000 }}},
                    'VSC/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 30, 'max': 650000 }}},
                    'WAVES/CKUSD': { 'precision': { 'amount': 2, 'price': 3 }, 'limits': { 'amount': { 'min': 0.15, 'max': 1500 }}},
                    'WDNA/ETH': { 'precision': { 'amount': 2, 'price': 8 }, 'limits': { 'amount': { 'min': 100, 'max': 250000 }}},
                    'WIC/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 3, 'max': 30000 }}},
                    'XAS/CNET': { 'precision': { 'amount': 2, 'price': 2 }, 'limits': { 'amount': { 'min': 2.5, 'max': 25000 }}},
                    'XLM/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 10, 'max': 300000 }}},
                    'XLM/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 1, 'max': 300000 }}},
                    'XLM/USDT': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 5, 'max': 150000 }}},
                    'XRP/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 24, 'max': 100000 }}},
                    'XRP/CKUSD': { 'precision': { 'amount': 2, 'price': 3 }, 'limits': { 'amount': { 'min': 5, 'max': 50000 }}},
                    'YBCT/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 15, 'max': 200000 }}},
                    'YBCT/CKUSD': { 'precision': { 'amount': 2, 'price': 4 }, 'limits': { 'amount': { 'min': 10, 'max': 200000 }}},
                    'YBY/CNET': { 'precision': { 'amount': 2, 'price': 6 }, 'limits': { 'amount': { 'min': 25000, 'max': 250000000 }}},
                    'ZEC/BTC': { 'precision': { 'amount': 4, 'price': 8 }, 'limits': { 'amount': { 'min': 0.02, 'max': 100 }}},
                    'ZEC/CKUSD': { 'precision': { 'amount': 4, 'price': 2 }, 'limits': { 'amount': { 'min': 0.02, 'max': 100 }}},
                },
            },
        });
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        // by default it will try load withdrawal fees of all currencies (with separate requests, sequentially)
        // however if you define symbols = [ 'ETH/BTC', 'LTC/BTC' ] in args it will only load those
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const result = {};
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            result[symbol] = await this.fetchTradingLimitsById (this.marketId (symbol), params);
        }
        return result;
    }

    async fetchTradingLimitsById (id, params = {}) {
        const request = {
            'symbol': id,
        };
        const response = await this.publicPostApiOrderTicker (this.extend (request, params));
        //
        //     {  code:    0,
        //         msg:   "获取牌价信息成功",
        //        data: {         high:  0.03721392,
        //                         low:  0.03335362,
        //                         buy: "0.03525757",
        //                        sell: "0.03531160",
        //                        last:  0.0352634,
        //                         vol: "184742.4176",
        //                   min_trade: "0.01500000",
        //                   max_trade: "100.00000000",
        //                number_float: "4",
        //                 price_float: "8"             } } }
        //
        return this.parseTradingLimits (this.safeValue (response, 'data', {}));
    }

    parseTradingLimits (limits, symbol = undefined, params = {}) {
        //
        //  {         high:  0.03721392,
        //             low:  0.03335362,
        //             buy: "0.03525757",
        //            sell: "0.03531160",
        //            last:  0.0352634,
        //             vol: "184742.4176",
        //       min_trade: "0.01500000",
        //       max_trade: "100.00000000",
        //    number_float: "4",
        //     price_float: "8"             }
        //
        return {
            'info': limits,
            'precision': {
                'amount': this.safeInteger (limits, 'number_float'),
                'price': this.safeInteger (limits, 'price_float'),
            },
            'limits': {
                'amount': {
                    'min': this.safeFloat (limits, 'min_trade'),
                    'max': this.safeFloat (limits, 'max_trade'),
                },
            },
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetApiMarketGetPriceList (params);
        const result = [];
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const currentMarketId = keys[i];
            const currentMarkets = response[currentMarketId];
            for (let j = 0; j < currentMarkets.length; j++) {
                const market = currentMarkets[j];
                const baseId = this.safeString (market, 'coin_from');
                const quoteId = this.safeString (market, 'coin_to');
                let base = baseId.toUpperCase ();
                let quote = quoteId.toUpperCase ();
                base = this.safeCurrencyCode (base);
                quote = this.safeCurrencyCode (quote);
                const id = baseId + '2' + quoteId;
                const symbol = base + '/' + quote;
                const active = true;
                const defaults = this.safeValue (this.options['limits'], symbol, {});
                result.push (this.extend ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': active,
                    // overrided by defaults from this.options['limits']
                    'precision': {
                        'amount': undefined,
                        'price': undefined,
                    },
                    // overrided by defaults from this.options['limits']
                    'limits': {
                        'amount': { 'min': undefined, 'max': undefined },
                        'price': { 'min': undefined, 'max': undefined },
                        'cost': { 'min': undefined, 'max': undefined },
                    },
                    'info': market,
                }, defaults));
            }
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp2 (trade, 'date', 'created');
        const id = this.safeString (trade, 'tid');
        const orderId = this.safeString (trade, 'order_id');
        const amount = this.safeFloat2 (trade, 'number', 'amount');
        const price = this.safeFloat (trade, 'price');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let side = this.safeString (trade, 'side');
        if (side === 'sale') {
            side = 'sell';
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': orderId,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const market = this.market (symbol);
        const response = await this.publicPostApiOrderMarketOrder (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostApiUserUserBalance (params);
        const data = this.safeValue (response, 'data');
        let keys = Object.keys (data);
        const result = { };
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const amount = this.safeFloat (data, key);
            const parts = key.split ('_');
            const currencyId = parts[0];
            const lockOrOver = parts[1];
            const code = this.safeCurrencyCode (currencyId);
            if (!(code in result)) {
                result[code] = this.account ();
            }
            if (lockOrOver === 'lock') {
                result[code]['used'] = parseFloat (amount);
            } else {
                result[code]['free'] = parseFloat (amount);
            }
        }
        keys = Object.keys (result);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const total = this.sum (result[key]['used'], result[key]['free']);
            result[key]['total'] = total;
        }
        result['info'] = data;
        return this.parseBalance (result);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.markets[symbol];
        const request = {
            'part': market['quoteId'],
            'coin': market['baseId'],
        };
        const response = await this.publicPostApiMarketGetCoinTrade (this.extend (request, params));
        const timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (response, 'max'),
            'low': this.safeFloat (response, 'min'),
            'bid': this.safeFloat (response, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (response, 'sale'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (response, 'price'),
            'last': this.safeFloat (response, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (response, 'change_24h'),
            'average': undefined,
            'baseVolume': this.safeFloat (response, 'volume_24h'),
            'quoteVolume': undefined,
            'info': response,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
        };
        const response = await this.publicPostApiOrderDepth (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeTimestamp (data, 'date');
        return this.parseOrderBook (data, timestamp);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostApiOrderOrderList (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed',
            '3': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'trust_id': id,
        };
        const response = await this.privatePostApiOrderOrderInfo (this.extend (request, params));
        const order = this.safeValue (response, 'data');
        const timestamp = this.safeTimestamp (order, 'created');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let side = this.safeString (order, 'flag');
        if (side === 'sale') {
            side = 'sell';
        }
        // Can't use parseOrder because the data format is different btw endpoint for fetchOrder and fetchOrders
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'cost': undefined,
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'number'),
            'filled': this.safeFloat (order, 'numberdeal'),
            'remaining': this.safeFloat (order, 'numberover'),
            'status': status,
            'fee': undefined,
        };
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const timestamp = this.safeTimestamp (order, 'datetime');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = undefined;
        let side = this.safeString (order, 'type');
        if (side === 'sale') {
            side = 'sell';
        }
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'avg_price');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'amount_outstanding');
        const filled = amount - remaining;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const cost = filled * price;
        const fee = undefined;
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'type': type,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privatePostApiOrderTradeList (this.extend (request, params));
        if ('data' in response) {
            return this.parseOrders (response['data'], market, since, limit);
        }
        return [];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByType ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByType ('all', symbol, since, limit, params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'type': side,
            'price': this.priceToPrecision (symbol, price),
            'number': this.amountToPrecision (symbol, amount),
        };
        const response = await this.privatePostApiOrderCoinTrust (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const id = this.safeString (data, 'order_id');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        if (id !== undefined) {
            request['order_id'] = id;
        }
        return await this.privatePostApiOrderCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let payload = this.urlencode ({ 'api_key': this.apiKey });
            if (Object.keys (query).length) {
                payload += '&' + this.urlencode (this.keysort (query));
            }
            const auth = payload + '&secret_key=' + this.secret;
            const signature = this.hash (this.encode (auth));
            body = payload + '&sign=' + signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const errorCode = this.safeValue (response, 'code');
        if (errorCode !== undefined) {
            if (errorCode !== 0) {
                //
                // { code: 1, msg: "该币不存在,非法操作" } - returned when a required symbol parameter is missing in the request (also, maybe on other types of errors as well)
                // { code: 1, msg: '公钥不合法' } - wrong public key
                // { code: 1, msg: '价格输入有误，请检查你的数值精度' } - 'The price input is incorrect, please check your numerical accuracy'
                // { code: 1, msg: '单笔最小交易数量不能小于0.00100000,请您重新挂单'} -
                //                  'The minimum number of single transactions cannot be less than 0.00100000. Please re-post the order'
                //
                const message = this.safeString (response, 'msg');
                const feedback = this.id + ' ' + message;
                this.throwExactlyMatchedException (this.exceptions, message, feedback);
                if (message.indexOf ('请您重新挂单') >= 0) {  // minimum limit
                    throw new InvalidOrder (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};

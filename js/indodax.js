'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class indodax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'indodax',
            'name': 'INDODAX',
            'countries': [ 'ID' ], // Indonesia
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': false,
                'fetchCurrencies': false,
                'withdraw': true,
            },
            'version': '1.8', // as of 9 April 2018
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37443283-2fddd0e4-281c-11e8-9741-b4f1419001b5.jpg',
                'api': {
                    'public': 'https://indodax.com/api',
                    'private': 'https://indodax.com/tapi',
                },
                'www': 'https://www.indodax.com',
                'doc': 'https://indodax.com/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                'referral': 'https://indodax.com/ref/testbitcoincoid/1',
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'getOrder',
                        'openOrders',
                        'cancelOrder',
                        'orderHistory',
                        'withdrawCoin',
                    ],
                },
            },
            'markets': {
                // HARDCODING IS DEPRECATED
                // but they don't have a corresponding endpoint in their API
                // IDR markets
                'BTC/IDR': { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.0001, 'max': undefined }}},
                'TEN/IDR': { 'id': 'ten_idr', 'symbol': 'TEN/IDR', 'base': 'TEN', 'quote': 'IDR', 'baseId': 'ten', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'ABYSS/IDR': { 'id': 'abyss_idr', 'symbol': 'ABYSS/IDR', 'base': 'ABYSS', 'quote': 'IDR', 'baseId': 'abyss', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'ACT/IDR': { 'id': 'act_idr', 'symbol': 'ACT/IDR', 'base': 'ACT', 'quote': 'IDR', 'baseId': 'act', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'ADA/IDR': { 'id': 'ada_idr', 'symbol': 'ADA/IDR', 'base': 'ADA', 'quote': 'IDR', 'baseId': 'ada', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'AOA/IDR': { 'id': 'aoa_idr', 'symbol': 'AOA/IDR', 'base': 'AOA', 'quote': 'IDR', 'baseId': 'aoa', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'ATOM/IDR': { 'id': 'atom_idr', 'symbol': 'ATOM/IDR', 'base': 'ATOM', 'quote': 'IDR', 'baseId': 'atom', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'BAT/IDR': { 'id': 'bat_idr', 'symbol': 'BAT/IDR', 'base': 'BAT', 'quote': 'IDR', 'baseId': 'bat', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'BCD/IDR': { 'id': 'bcd_idr', 'symbol': 'BCD/IDR', 'base': 'BCD', 'quote': 'IDR', 'baseId': 'bcd', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'BCH/IDR': { 'id': 'bchabc_idr', 'symbol': 'BCH/IDR', 'base': 'BCH', 'quote': 'IDR', 'baseId': 'bchabc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'BSV/IDR': { 'id': 'bchsv_idr', 'symbol': 'BSV/IDR', 'base': 'BSV', 'quote': 'IDR', 'baseId': 'bchsv', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'BNB/IDR': { 'id': 'bnb_idr', 'symbol': 'BNB/IDR', 'base': 'BNB', 'quote': 'IDR', 'baseId': 'bnb', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'BTG/IDR': { 'id': 'btg_idr', 'symbol': 'BTG/IDR', 'base': 'BTG', 'quote': 'IDR', 'baseId': 'btg', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'BTS/IDR': { 'id': 'bts_idr', 'symbol': 'BTS/IDR', 'base': 'BTS', 'quote': 'IDR', 'baseId': 'bts', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'BTT/IDR': { 'id': 'btt_idr', 'symbol': 'BTT/IDR', 'base': 'BTT', 'quote': 'IDR', 'baseId': 'btt', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1000, 'max': undefined }}},
                'COAL/IDR': { 'id': 'coal_idr', 'symbol': 'COAL/IDR', 'base': 'COAL', 'quote': 'IDR', 'baseId': 'coal', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 50, 'max': undefined }}},
                'CRO/IDR': { 'id': 'cro_idr', 'symbol': 'CRO/IDR', 'base': 'CRO', 'quote': 'IDR', 'baseId': 'cro', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DASH/IDR': { 'id': 'drk_idr', 'symbol': 'DASH/IDR', 'base': 'DASH', 'quote': 'IDR', 'baseId': 'drk', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DAX/IDR': { 'id': 'dax_idr', 'symbol': 'DAX/IDR', 'base': 'DAX', 'quote': 'IDR', 'baseId': 'dax', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DOGE/IDR': { 'id': 'doge_idr', 'symbol': 'DOGE/IDR', 'base': 'DOGE', 'quote': 'IDR', 'baseId': 'doge', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1000, 'max': undefined }}},
                'ETH/IDR': { 'id': 'eth_idr', 'symbol': 'ETH/IDR', 'base': 'ETH', 'quote': 'IDR', 'baseId': 'eth', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'EOS/IDR': { 'id': 'eos_idr', 'symbol': 'EOS/IDR', 'base': 'EOS', 'quote': 'IDR', 'baseId': 'eos', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'ETC/IDR': { 'id': 'etc_idr', 'symbol': 'ETC/IDR', 'base': 'ETC', 'quote': 'IDR', 'baseId': 'etc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'GARD/IDR': { 'id': 'gard_idr', 'symbol': 'GARD/IDR', 'base': 'GARD', 'quote': 'IDR', 'baseId': 'gard', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'GSC/IDR': { 'id': 'gsc_idr', 'symbol': 'GSC/IDR', 'base': 'GSC', 'quote': 'IDR', 'baseId': 'gsc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'GXC/IDR': { 'id': 'gxs_idr', 'symbol': 'GXC/IDR', 'base': 'GXC', 'quote': 'IDR', 'baseId': 'gxs', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'HPB/IDR': { 'id': 'hpb_idr', 'symbol': 'HPB/IDR', 'base': 'HPB', 'quote': 'IDR', 'baseId': 'hpb', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'IGNIS/IDR': { 'id': 'ignis_idr', 'symbol': 'IGNIS/IDR', 'base': 'IGNIS', 'quote': 'IDR', 'baseId': 'ignis', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'INX/IDR': { 'id': 'inx_idr', 'symbol': 'INX/IDR', 'base': 'INX', 'quote': 'IDR', 'baseId': 'inx', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'IOTA/IDR': { 'id': 'iota_idr', 'symbol': 'IOTA/IDR', 'base': 'IOTA', 'quote': 'IDR', 'baseId': 'iota', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'LINK/IDR': { 'id': 'link_idr', 'symbol': 'LINK/IDR', 'base': 'LINK', 'quote': 'IDR', 'baseId': 'link', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'LTC/IDR': { 'id': 'ltc_idr', 'symbol': 'LTC/IDR', 'base': 'LTC', 'quote': 'IDR', 'baseId': 'ltc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'MBL/IDR': { 'id': 'mbl_idr', 'symbol': 'MBL/IDR', 'base': 'MBL', 'quote': 'IDR', 'baseId': 'mbl', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'NEO/IDR': { 'id': 'neo_idr', 'symbol': 'NEO/IDR', 'base': 'NEO', 'quote': 'IDR', 'baseId': 'neo', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'NPXS/IDR': { 'id': 'npxs_idr', 'symbol': 'NPXS/IDR', 'base': 'NPXS', 'quote': 'IDR', 'baseId': 'npxs', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'NXT/IDR': { 'id': 'nxt_idr', 'symbol': 'NXT/IDR', 'base': 'NXT', 'quote': 'IDR', 'baseId': 'nxt', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'OKB/IDR': { 'id': 'okb_idr', 'symbol': 'OKB/IDR', 'base': 'OKB', 'quote': 'IDR', 'baseId': 'okb', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.5, 'max': undefined }}},
                'ONT/IDR': { 'id': 'ont_idr', 'symbol': 'ONT/IDR', 'base': 'ONT', 'quote': 'IDR', 'baseId': 'ont', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'PXG/IDR': { 'id': 'pxg_idr', 'symbol': 'PXG/IDR', 'base': 'PXG', 'quote': 'IDR', 'baseId': 'pxg', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'QTUM/IDR': { 'id': 'qtum_idr', 'symbol': 'QTUM/IDR', 'base': 'QTUM', 'quote': 'IDR', 'baseId': 'qtum', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'RVN/IDR': { 'id': 'rvn_idr', 'symbol': 'RVN/IDR', 'base': 'RVN', 'quote': 'IDR', 'baseId': 'rvn', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'SSP/IDR': { 'id': 'ssp_idr', 'symbol': 'SSP/IDR', 'base': 'SSP', 'quote': 'IDR', 'baseId': 'ssp', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                'SUMO/IDR': { 'id': 'sumo_idr', 'symbol': 'SUMO/IDR', 'base': 'SUMO', 'quote': 'IDR', 'baseId': 'sumo', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 5, 'max': undefined }}},
                // 'STQ/IDR': { 'id': 'stq_idr', 'symbol': 'STQ/IDR', 'base': 'STQ', 'quote': 'IDR', 'baseId': 'stq', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'TRX/IDR': { 'id': 'trx_idr', 'symbol': 'TRX/IDR', 'base': 'TRX', 'quote': 'IDR', 'baseId': 'trx', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'USDC/IDR': { 'id': 'usdc_idr', 'symbol': 'USDC/IDR', 'base': 'USDC', 'quote': 'IDR', 'baseId': 'usdc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'USDT/IDR': { 'id': 'usdt_idr', 'symbol': 'USDT/IDR', 'base': 'USDT', 'quote': 'IDR', 'baseId': 'usdt', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'VEX/IDR': { 'id': 'vex_idr', 'symbol': 'VEX/IDR', 'base': 'VEX', 'quote': 'IDR', 'baseId': 'vex', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': undefined, 'max': undefined }}},
                'VIDY/IDR': { 'id': 'vidy_idr', 'symbol': 'VIDY/IDR', 'base': 'VIDY', 'quote': 'IDR', 'baseId': 'vidy', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 100, 'max': undefined }}},
                'WAVES/IDR': { 'id': 'waves_idr', 'symbol': 'WAVES/IDR', 'base': 'WAVES', 'quote': 'IDR', 'baseId': 'waves', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'XEM/IDR': { 'id': 'nem_idr', 'symbol': 'XEM/IDR', 'base': 'XEM', 'quote': 'IDR', 'baseId': 'nem', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'XLM/IDR': { 'id': 'str_idr', 'symbol': 'XLM/IDR', 'base': 'XLM', 'quote': 'IDR', 'baseId': 'str', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 20, 'max': undefined }}},
                'XDCE/IDR': { 'id': 'xdce_idr', 'symbol': 'XDCE/IDR', 'base': 'XDCE', 'quote': 'IDR', 'baseId': 'xdce', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 10, 'max': undefined }}},
                'XMR/IDR': { 'id': 'xmr_idr', 'symbol': 'XMR/IDR', 'base': 'XMR', 'quote': 'IDR', 'baseId': 'xmr', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'XRP/IDR': { 'id': 'xrp_idr', 'symbol': 'XRP/IDR', 'base': 'XRP', 'quote': 'IDR', 'baseId': 'xrp', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 10, 'max': undefined }}},
                'XZC/IDR': { 'id': 'xzc_idr', 'symbol': 'XZC/IDR', 'base': 'XZC', 'quote': 'IDR', 'baseId': 'xzc', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'VSYS/IDR': { 'id': 'vsys_idr', 'symbol': 'VSYS/IDR', 'base': 'VSYS', 'quote': 'IDR', 'baseId': 'vsys', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }}},
                'ZEC/IDR': { 'id': 'zec_idr', 'symbol': 'ZEC/IDR', 'base': 'ZEC', 'quote': 'IDR', 'baseId': 'zec', 'quoteId': 'idr', 'precision': { 'amount': 8, 'price': 0 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                // BTC markets
                'BTS/BTC': { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 6 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 5 }, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }}},
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 6 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'NXT/BTC': { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'SUMO/BTC': { 'id': 'sumo_btc', 'symbol': 'SUMO/BTC', 'base': 'SUMO', 'quote': 'BTC', 'baseId': 'sumo', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'TEN/BTC': { 'id': 'ten_btc', 'symbol': 'TEN/BTC', 'base': 'TEN', 'quote': 'BTC', 'baseId': 'ten', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'XEM/BTC': { 'id': 'nem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 1, 'max': undefined }}},
                'XLM/BTC': { 'id': 'str_btc', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
                'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc', 'precision': { 'amount': 8, 'price': 8 }, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }}},
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'invalid_pair': BadSymbol, // {"error":"invalid_pair","error_description":"Invalid Pair"}
                    'Insufficient balance.': InsufficientFunds,
                    'invalid order.': OrderNotFound,
                    'Invalid credentials. API not found or session has expired.': AuthenticationError,
                    'Invalid credentials. Bad sign.': AuthenticationError,
                },
                'broad': {
                    'Minimum price': InvalidOrder,
                    'Minimum order': InvalidOrder,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        const balances = this.safeValue (response, 'return', {});
        const free = this.safeValue (balances, 'balance', {});
        const used = this.safeValue (balances, 'balance_hold', {});
        const result = { 'info': response };
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (free, currencyId);
            account['used'] = this.safeFloat (used, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const orderbook = await this.publicGetPairDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTicker (this.extend (request, params));
        //
        //     {
        //         "ticker": {
        //             "high":"0.01951",
        //             "low":"0.01877",
        //             "vol_eth":"39.38839319",
        //             "vol_btc":"0.75320886",
        //             "last":"0.01896",
        //             "buy":"0.01896",
        //             "sell":"0.019",
        //             "server_time":1565248908
        //         }
        //     }
        //
        const ticker = response['ticker'];
        const timestamp = this.safeTimestamp (ticker, 'server_time');
        const baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        const quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, baseVolume),
            'quoteVolume': this.safeFloat (ticker, quoteVolume),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'tid');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = undefined;
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "order_id": "12345",
        //         "submit_time": "1392228122",
        //         "price": "8000000",
        //         "type": "sell",
        //         "order_ltc": "100000000",
        //         "remain_ltc": "100000000"
        //     }
        //
        let side = undefined;
        if ('type' in order) {
            side = order['type'];
        }
        let status = this.safeString (order, 'status', 'open');
        if (status === 'filled') {
            status = 'closed';
        } else if (status === 'cancelled') {
            status = 'canceled';
        }
        let symbol = undefined;
        let cost = undefined;
        const price = this.safeFloat (order, 'price');
        let amount = undefined;
        let remaining = undefined;
        let filled = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            let quoteId = market['quoteId'];
            let baseId = market['baseId'];
            if ((market['quoteId'] === 'idr') && ('order_rp' in order)) {
                quoteId = 'rp';
            }
            if ((market['baseId'] === 'idr') && ('remain_rp' in order)) {
                baseId = 'rp';
            }
            cost = this.safeFloat (order, 'order_' + quoteId);
            if (cost) {
                amount = cost / price;
                const remainingCost = this.safeFloat (order, 'remain_' + quoteId);
                if (remainingCost !== undefined) {
                    remaining = remainingCost / price;
                    filled = amount - remaining;
                }
            } else {
                amount = this.safeFloat (order, 'order_' + baseId);
                cost = price * amount;
                remaining = this.safeFloat (order, 'remain_' + baseId);
                filled = amount - remaining;
            }
        }
        let average = undefined;
        if (filled) {
            average = cost / filled;
        }
        const timestamp = this.safeInteger (order, 'submit_time');
        const fee = undefined;
        const id = this.safeString (order, 'order_id');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
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
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        const orders = response['return'];
        const order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        return this.extend ({ 'info': response }, order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const rawOrders = response['return']['orders'];
        // { success: 1, return: { orders: null }} if no orders
        if (!rawOrders) {
            return [];
        }
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (symbol !== undefined) {
            return this.parseOrders (rawOrders, market, since, limit);
        }
        // { success: 1, return: { orders: { marketid: [ ... objects ] }}} if all orders are fetched
        const marketIds = Object.keys (rawOrders);
        let exchangeOrders = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketOrders = rawOrders[marketId];
            market = this.markets_by_id[marketId];
            const parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            exchangeOrders = this.arrayConcat (exchangeOrders, parsedOrders);
        }
        return exchangeOrders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol');
        }
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market, since, limit);
        orders = this.filterBy (orders, 'status', 'closed');
        if (symbol !== undefined) {
            return this.filterBySymbol (orders, symbol);
        }
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        const currency = market['baseId'];
        if (side === 'buy') {
            request[market['quoteId']] = amount * price;
        } else {
            request[market['baseId']] = amount;
        }
        request[currency] = amount;
        const result = await this.privatePostTrade (this.extend (request, params));
        return {
            'info': result,
            'id': result['return']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        const side = this.safeValue (params, 'side');
        if (side === undefined) {
            throw new ExchangeError (this.id + ' cancelOrder requires an extra "side" param');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'pair': market['id'],
            'type': side,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // Custom string you need to provide to identify each withdrawal.
        // Will be passed to callback URL (assigned via website to the API key)
        // so your system can identify the request and confirm it.
        // Alphanumeric, max length 255.
        const requestId = this.milliseconds ();
        // Alternatively:
        // let requestId = this.uuid ();
        const request = {
            'currency': currency['id'],
            'withdraw_amount': amount,
            'withdraw_address': address,
            'request_id': requestId.toString (),
        };
        if (tag) {
            request['withdraw_memo'] = tag;
        }
        const response = await this.privatePostWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        let id = undefined;
        if (('txid' in response) && (response['txid'].length > 0)) {
            id = response['txid'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // { success: 0, error: "invalid order." }
        // or
        // [{ data, ... }, { ... }, ... ]
        if (Array.isArray (response)) {
            return; // public endpoints may return []-arrays
        }
        const error = this.safeValue (response, 'error', '');
        if (!('success' in response) && error === '') {
            return; // no 'success' property on public responses
        }
        if (this.safeInteger (response, 'success', 0) === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response)) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            } else {
                return;
            }
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
};

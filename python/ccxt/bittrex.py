# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound


class bittrex (Exchange):

    def describe(self):
        return self.deep_extend(super(bittrex, self).describe(), {
            'id': 'bittrex',
            'name': 'Bittrex',
            'countries': 'US',
            'version': 'v1.1',
            'rateLimit': 1500,
            'hasCORS': False,
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchMyTrades': False,
            'hasWithdraw': True,
            'timeframes': {
                '1m': 'oneMin',
                '5m': 'fiveMin',
                '30m': 'thirtyMin',
                '1h': 'hour',
                '1d': 'day',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': {
                    'public': 'https://bittrex.com/api',
                    'account': 'https://bittrex.com/api',
                    'market': 'https://bittrex.com/api',
                    'v2': 'https://bittrex.com/api/v2.0/pub',
                },
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ],
                'fees': [
                    'https://bittrex.com/Fees',
                    'https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ],
            },
            'api': {
                'v2': {
                    'get': [
                        'currencies/GetBTCPrice',
                        'market/GetTicks',
                        'market/GetLatestTick',
                        'Markets/GetMarketSummaries',
                        'market/GetLatestTick',
                    ],
                },
                'public': {
                    'get': [
                        'currencies',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ],
                },
                'account': {
                    'get': [
                        'balance',
                        'balances',
                        'depositaddress',
                        'deposithistory',
                        'order',
                        'orderhistory',
                        'withdrawalhistory',
                        'withdraw',
                    ],
                },
                'market': {
                    'get': [
                        'buylimit',
                        'buymarket',
                        'cancel',
                        'openorders',
                        'selllimit',
                        'sellmarket',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
            },
            'markets': {
                'LTC/BTC': {'id': 'BTC-LTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'DOGE/BTC': {'id': 'BTC-DOGE', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC'},
                'VTC/BTC': {'id': 'BTC-VTC', 'symbol': 'VTC/BTC', 'base': 'VTC', 'quote': 'BTC'},
                'PPC/BTC': {'id': 'BTC-PPC', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC'},
                'FTC/BTC': {'id': 'BTC-FTC', 'symbol': 'FTC/BTC', 'base': 'FTC', 'quote': 'BTC'},
                'RDD/BTC': {'id': 'BTC-RDD', 'symbol': 'RDD/BTC', 'base': 'RDD', 'quote': 'BTC'},
                'NXT/BTC': {'id': 'BTC-NXT', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC'},
                'DASH/BTC': {'id': 'BTC-DASH', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC'},
                'POT/BTC': {'id': 'BTC-POT', 'symbol': 'POT/BTC', 'base': 'POT', 'quote': 'BTC'},
                'BLK/BTC': {'id': 'BTC-BLK', 'symbol': 'BLK/BTC', 'base': 'BLK', 'quote': 'BTC'},
                'EMC2/BTC': {'id': 'BTC-EMC2', 'symbol': 'EMC2/BTC', 'base': 'EMC2', 'quote': 'BTC'},
                'XMY/BTC': {'id': 'BTC-XMY', 'symbol': 'XMY/BTC', 'base': 'XMY', 'quote': 'BTC'},
                'AUR/BTC': {'id': 'BTC-AUR', 'symbol': 'AUR/BTC', 'base': 'AUR', 'quote': 'BTC'},
                'EFL/BTC': {'id': 'BTC-EFL', 'symbol': 'EFL/BTC', 'base': 'EFL', 'quote': 'BTC'},
                'GLD/BTC': {'id': 'BTC-GLD', 'symbol': 'GLD/BTC', 'base': 'GLD', 'quote': 'BTC'},
                'SLR/BTC': {'id': 'BTC-SLR', 'symbol': 'SLR/BTC', 'base': 'SLR', 'quote': 'BTC'},
                'PTC/BTC': {'id': 'BTC-PTC', 'symbol': 'PTC/BTC', 'base': 'PTC', 'quote': 'BTC'},
                'GRS/BTC': {'id': 'BTC-GRS', 'symbol': 'GRS/BTC', 'base': 'GRS', 'quote': 'BTC'},
                'NLG/BTC': {'id': 'BTC-NLG', 'symbol': 'NLG/BTC', 'base': 'NLG', 'quote': 'BTC'},
                'RBY/BTC': {'id': 'BTC-RBY', 'symbol': 'RBY/BTC', 'base': 'RBY', 'quote': 'BTC'},
                'XWC/BTC': {'id': 'BTC-XWC', 'symbol': 'XWC/BTC', 'base': 'XWC', 'quote': 'BTC'},
                'MONA/BTC': {'id': 'BTC-MONA', 'symbol': 'MONA/BTC', 'base': 'MONA', 'quote': 'BTC'},
                'THC/BTC': {'id': 'BTC-THC', 'symbol': 'THC/BTC', 'base': 'THC', 'quote': 'BTC'},
                'ENRG/BTC': {'id': 'BTC-ENRG', 'symbol': 'ENRG/BTC', 'base': 'ENRG', 'quote': 'BTC'},
                'ERC/BTC': {'id': 'BTC-ERC', 'symbol': 'ERC/BTC', 'base': 'ERC', 'quote': 'BTC'},
                'VRC/BTC': {'id': 'BTC-VRC', 'symbol': 'VRC/BTC', 'base': 'VRC', 'quote': 'BTC'},
                'CURE/BTC': {'id': 'BTC-CURE', 'symbol': 'CURE/BTC', 'base': 'CURE', 'quote': 'BTC'},
                'XMR/BTC': {'id': 'BTC-XMR', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC'},
                'CLOAK/BTC': {'id': 'BTC-CLOAK', 'symbol': 'CLOAK/BTC', 'base': 'CLOAK', 'quote': 'BTC'},
                'START/BTC': {'id': 'BTC-START', 'symbol': 'START/BTC', 'base': 'START', 'quote': 'BTC'},
                'KORE/BTC': {'id': 'BTC-KORE', 'symbol': 'KORE/BTC', 'base': 'KORE', 'quote': 'BTC'},
                'XDN/BTC': {'id': 'BTC-XDN', 'symbol': 'XDN/BTC', 'base': 'XDN', 'quote': 'BTC'},
                'TRUST/BTC': {'id': 'BTC-TRUST', 'symbol': 'TRUST/BTC', 'base': 'TRUST', 'quote': 'BTC'},
                'NAV/BTC': {'id': 'BTC-NAV', 'symbol': 'NAV/BTC', 'base': 'NAV', 'quote': 'BTC'},
                'XST/BTC': {'id': 'BTC-XST', 'symbol': 'XST/BTC', 'base': 'XST', 'quote': 'BTC'},
                'BTCD/BTC': {'id': 'BTC-BTCD', 'symbol': 'BTCD/BTC', 'base': 'BTCD', 'quote': 'BTC'},
                'VIA/BTC': {'id': 'BTC-VIA', 'symbol': 'VIA/BTC', 'base': 'VIA', 'quote': 'BTC'},
                'PINK/BTC': {'id': 'BTC-PINK', 'symbol': 'PINK/BTC', 'base': 'PINK', 'quote': 'BTC'},
                'IOC/BTC': {'id': 'BTC-IOC', 'symbol': 'IOC/BTC', 'base': 'IOC', 'quote': 'BTC'},
                'CANN/BTC': {'id': 'BTC-CANN', 'symbol': 'CANN/BTC', 'base': 'CANN', 'quote': 'BTC'},
                'SYS/BTC': {'id': 'BTC-SYS', 'symbol': 'SYS/BTC', 'base': 'SYS', 'quote': 'BTC'},
                'NEOS/BTC': {'id': 'BTC-NEOS', 'symbol': 'NEOS/BTC', 'base': 'NEOS', 'quote': 'BTC'},
                'DGB/BTC': {'id': 'BTC-DGB', 'symbol': 'DGB/BTC', 'base': 'DGB', 'quote': 'BTC'},
                'BURST/BTC': {'id': 'BTC-BURST', 'symbol': 'BURST/BTC', 'base': 'BURST', 'quote': 'BTC'},
                'EXCL/BTC': {'id': 'BTC-EXCL', 'symbol': 'EXCL/BTC', 'base': 'EXCL', 'quote': 'BTC'},
                'SWIFT/BTC': {'id': 'BTC-SWIFT', 'symbol': 'SWIFT/BTC', 'base': 'SWIFT', 'quote': 'BTC'},
                'DOPE/BTC': {'id': 'BTC-DOPE', 'symbol': 'DOPE/BTC', 'base': 'DOPE', 'quote': 'BTC'},
                'BLOCK/BTC': {'id': 'BTC-BLOCK', 'symbol': 'BLOCK/BTC', 'base': 'BLOCK', 'quote': 'BTC'},
                'ABY/BTC': {'id': 'BTC-ABY', 'symbol': 'ABY/BTC', 'base': 'ABY', 'quote': 'BTC'},
                'BYC/BTC': {'id': 'BTC-BYC', 'symbol': 'BYC/BTC', 'base': 'BYC', 'quote': 'BTC'},
                'XMG/BTC': {'id': 'BTC-XMG', 'symbol': 'XMG/BTC', 'base': 'XMG', 'quote': 'BTC'},
                'BLITZ/BTC': {'id': 'BTC-BLITZ', 'symbol': 'BLITZ/BTC', 'base': 'BLITZ', 'quote': 'BTC'},
                'BAY/BTC': {'id': 'BTC-BAY', 'symbol': 'BAY/BTC', 'base': 'BAY', 'quote': 'BTC'},
                'BTS/BTC': {'id': 'BTC-BTS', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC'},
                'FAIR/BTC': {'id': 'BTC-FAIR', 'symbol': 'FAIR/BTC', 'base': 'FAIR', 'quote': 'BTC'},
                'SPR/BTC': {'id': 'BTC-SPR', 'symbol': 'SPR/BTC', 'base': 'SPR', 'quote': 'BTC'},
                'VTR/BTC': {'id': 'BTC-VTR', 'symbol': 'VTR/BTC', 'base': 'VTR', 'quote': 'BTC'},
                'XRP/BTC': {'id': 'BTC-XRP', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC'},
                'GAME/BTC': {'id': 'BTC-GAME', 'symbol': 'GAME/BTC', 'base': 'GAME', 'quote': 'BTC'},
                'COVAL/BTC': {'id': 'BTC-COVAL', 'symbol': 'COVAL/BTC', 'base': 'COVAL', 'quote': 'BTC'},
                'NXS/BTC': {'id': 'BTC-NXS', 'symbol': 'NXS/BTC', 'base': 'NXS', 'quote': 'BTC'},
                'XCP/BTC': {'id': 'BTC-XCP', 'symbol': 'XCP/BTC', 'base': 'XCP', 'quote': 'BTC'},
                'BITB/BTC': {'id': 'BTC-BITB', 'symbol': 'BITB/BTC', 'base': 'BITB', 'quote': 'BTC'},
                'GEO/BTC': {'id': 'BTC-GEO', 'symbol': 'GEO/BTC', 'base': 'GEO', 'quote': 'BTC'},
                'FLDC/BTC': {'id': 'BTC-FLDC', 'symbol': 'FLDC/BTC', 'base': 'FLDC', 'quote': 'BTC'},
                'GRC/BTC': {'id': 'BTC-GRC', 'symbol': 'GRC/BTC', 'base': 'GRC', 'quote': 'BTC'},
                'FLO/BTC': {'id': 'BTC-FLO', 'symbol': 'FLO/BTC', 'base': 'FLO', 'quote': 'BTC'},
                'NBT/BTC': {'id': 'BTC-NBT', 'symbol': 'NBT/BTC', 'base': 'NBT', 'quote': 'BTC'},
                'MUE/BTC': {'id': 'BTC-MUE', 'symbol': 'MUE/BTC', 'base': 'MUE', 'quote': 'BTC'},
                'XEM/BTC': {'id': 'BTC-XEM', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC'},
                'CLAM/BTC': {'id': 'BTC-CLAM', 'symbol': 'CLAM/BTC', 'base': 'CLAM', 'quote': 'BTC'},
                'DMD/BTC': {'id': 'BTC-DMD', 'symbol': 'DMD/BTC', 'base': 'DMD', 'quote': 'BTC'},
                'GAM/BTC': {'id': 'BTC-GAM', 'symbol': 'GAM/BTC', 'base': 'GAM', 'quote': 'BTC'},
                'SPHR/BTC': {'id': 'BTC-SPHR', 'symbol': 'SPHR/BTC', 'base': 'SPHR', 'quote': 'BTC'},
                'OK/BTC': {'id': 'BTC-OK', 'symbol': 'OK/BTC', 'base': 'OK', 'quote': 'BTC'},
                'SNRG/BTC': {'id': 'BTC-SNRG', 'symbol': 'SNRG/BTC', 'base': 'SNRG', 'quote': 'BTC'},
                'PKB/BTC': {'id': 'BTC-PKB', 'symbol': 'PKB/BTC', 'base': 'PKB', 'quote': 'BTC'},
                'CPC/BTC': {'id': 'BTC-CPC', 'symbol': 'CPC/BTC', 'base': 'CPC', 'quote': 'BTC'},
                'AEON/BTC': {'id': 'BTC-AEON', 'symbol': 'AEON/BTC', 'base': 'AEON', 'quote': 'BTC'},
                'ETH/BTC': {'id': 'BTC-ETH', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                'GCR/BTC': {'id': 'BTC-GCR', 'symbol': 'GCR/BTC', 'base': 'GCR', 'quote': 'BTC'},
                'TX/BTC': {'id': 'BTC-TX', 'symbol': 'TX/BTC', 'base': 'TX', 'quote': 'BTC'},
                'BCY/BTC': {'id': 'BTC-BCY', 'symbol': 'BCY/BTC', 'base': 'BCY', 'quote': 'BTC'},
                'EXP/BTC': {'id': 'BTC-EXP', 'symbol': 'EXP/BTC', 'base': 'EXP', 'quote': 'BTC'},
                'INFX/BTC': {'id': 'BTC-INFX', 'symbol': 'INFX/BTC', 'base': 'INFX', 'quote': 'BTC'},
                'OMNI/BTC': {'id': 'BTC-OMNI', 'symbol': 'OMNI/BTC', 'base': 'OMNI', 'quote': 'BTC'},
                'AMP/BTC': {'id': 'BTC-AMP', 'symbol': 'AMP/BTC', 'base': 'AMP', 'quote': 'BTC'},
                'AGRS/BTC': {'id': 'BTC-AGRS', 'symbol': 'AGRS/BTC', 'base': 'AGRS', 'quote': 'BTC'},
                'XLM/BTC': {'id': 'BTC-XLM', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC'},
                'BTC/USD': {'id': 'USDT-BTC', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USDT'},
                'CLUB/BTC': {'id': 'BTC-CLUB', 'symbol': 'CLUB/BTC', 'base': 'CLUB', 'quote': 'BTC'},
                'VOX/BTC': {'id': 'BTC-VOX', 'symbol': 'VOX/BTC', 'base': 'VOX', 'quote': 'BTC'},
                'EMC/BTC': {'id': 'BTC-EMC', 'symbol': 'EMC/BTC', 'base': 'EMC', 'quote': 'BTC'},
                'FCT/BTC': {'id': 'BTC-FCT', 'symbol': 'FCT/BTC', 'base': 'FCT', 'quote': 'BTC'},
                'MAID/BTC': {'id': 'BTC-MAID', 'symbol': 'MAID/BTC', 'base': 'MAID', 'quote': 'BTC'},
                'EGC/BTC': {'id': 'BTC-EGC', 'symbol': 'EGC/BTC', 'base': 'EGC', 'quote': 'BTC'},
                'SLS/BTC': {'id': 'BTC-SLS', 'symbol': 'SLS/BTC', 'base': 'SLS', 'quote': 'BTC'},
                'RADS/BTC': {'id': 'BTC-RADS', 'symbol': 'RADS/BTC', 'base': 'RADS', 'quote': 'BTC'},
                'DCR/BTC': {'id': 'BTC-DCR', 'symbol': 'DCR/BTC', 'base': 'DCR', 'quote': 'BTC'},
                'SAFEX/BTC': {'id': 'BTC-SAFEX', 'symbol': 'SAFEX/BTC', 'base': 'SAFEX', 'quote': 'BTC'},
                'BSD/BTC': {'id': 'BTC-BSD', 'symbol': 'BSD/BTC', 'base': 'BSD', 'quote': 'BTC'},
                'XVG/BTC': {'id': 'BTC-XVG', 'symbol': 'XVG/BTC', 'base': 'XVG', 'quote': 'BTC'},
                'PIVX/BTC': {'id': 'BTC-PIVX', 'symbol': 'PIVX/BTC', 'base': 'PIVX', 'quote': 'BTC'},
                'XVC/BTC': {'id': 'BTC-XVC', 'symbol': 'XVC/BTC', 'base': 'XVC', 'quote': 'BTC'},
                'MEME/BTC': {'id': 'BTC-MEME', 'symbol': 'MEME/BTC', 'base': 'MEME', 'quote': 'BTC'},
                'STEEM/BTC': {'id': 'BTC-STEEM', 'symbol': 'STEEM/BTC', 'base': 'STEEM', 'quote': 'BTC'},
                '2GIVE/BTC': {'id': 'BTC-2GIVE', 'symbol': '2GIVE/BTC', 'base': '2GIVE', 'quote': 'BTC'},
                'LSK/BTC': {'id': 'BTC-LSK', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC'},
                'PDC/BTC': {'id': 'BTC-PDC', 'symbol': 'PDC/BTC', 'base': 'PDC', 'quote': 'BTC'},
                'BRK/BTC': {'id': 'BTC-BRK', 'symbol': 'BRK/BTC', 'base': 'BRK', 'quote': 'BTC'},
                'DGD/BTC': {'id': 'BTC-DGD', 'symbol': 'DGD/BTC', 'base': 'DGD', 'quote': 'BTC'},
                'DGD/ETH': {'id': 'ETH-DGD', 'symbol': 'DGD/ETH', 'base': 'DGD', 'quote': 'ETH'},
                'WAVES/BTC': {'id': 'BTC-WAVES', 'symbol': 'WAVES/BTC', 'base': 'WAVES', 'quote': 'BTC'},
                'RISE/BTC': {'id': 'BTC-RISE', 'symbol': 'RISE/BTC', 'base': 'RISE', 'quote': 'BTC'},
                'LBC/BTC': {'id': 'BTC-LBC', 'symbol': 'LBC/BTC', 'base': 'LBC', 'quote': 'BTC'},
                'SBD/BTC': {'id': 'BTC-SBD', 'symbol': 'SBD/BTC', 'base': 'SBD', 'quote': 'BTC'},
                'BRX/BTC': {'id': 'BTC-BRX', 'symbol': 'BRX/BTC', 'base': 'BRX', 'quote': 'BTC'},
                'ETC/BTC': {'id': 'BTC-ETC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC'},
                'ETC/ETH': {'id': 'ETH-ETC', 'symbol': 'ETC/ETH', 'base': 'ETC', 'quote': 'ETH'},
                'STRAT/BTC': {'id': 'BTC-STRAT', 'symbol': 'STRAT/BTC', 'base': 'STRAT', 'quote': 'BTC'},
                'UNB/BTC': {'id': 'BTC-UNB', 'symbol': 'UNB/BTC', 'base': 'UNB', 'quote': 'BTC'},
                'SYNX/BTC': {'id': 'BTC-SYNX', 'symbol': 'SYNX/BTC', 'base': 'SYNX', 'quote': 'BTC'},
                'TRIG/BTC': {'id': 'BTC-TRIG', 'symbol': 'TRIG/BTC', 'base': 'TRIG', 'quote': 'BTC'},
                'EBST/BTC': {'id': 'BTC-EBST', 'symbol': 'EBST/BTC', 'base': 'EBST', 'quote': 'BTC'},
                'VRM/BTC': {'id': 'BTC-VRM', 'symbol': 'VRM/BTC', 'base': 'VRM', 'quote': 'BTC'},
                'SEQ/BTC': {'id': 'BTC-SEQ', 'symbol': 'SEQ/BTC', 'base': 'SEQ', 'quote': 'BTC'},
                'XAUR/BTC': {'id': 'BTC-XAUR', 'symbol': 'XAUR/BTC', 'base': 'XAUR', 'quote': 'BTC'},
                'SNGLS/BTC': {'id': 'BTC-SNGLS', 'symbol': 'SNGLS/BTC', 'base': 'SNGLS', 'quote': 'BTC'},
                'REP/BTC': {'id': 'BTC-REP', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC'},
                'SHIFT/BTC': {'id': 'BTC-SHIFT', 'symbol': 'SHIFT/BTC', 'base': 'SHIFT', 'quote': 'BTC'},
                'ARDR/BTC': {'id': 'BTC-ARDR', 'symbol': 'ARDR/BTC', 'base': 'ARDR', 'quote': 'BTC'},
                'XZC/BTC': {'id': 'BTC-XZC', 'symbol': 'XZC/BTC', 'base': 'XZC', 'quote': 'BTC'},
                'NEO/BTC': {'id': 'BTC-NEO', 'symbol': 'NEO/BTC', 'base': 'NEO', 'quote': 'BTC'},
                'ZEC/BTC': {'id': 'BTC-ZEC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC'},
                'ZCL/BTC': {'id': 'BTC-ZCL', 'symbol': 'ZCL/BTC', 'base': 'ZCL', 'quote': 'BTC'},
                'IOP/BTC': {'id': 'BTC-IOP', 'symbol': 'IOP/BTC', 'base': 'IOP', 'quote': 'BTC'},
                'GOLOS/BTC': {'id': 'BTC-GOLOS', 'symbol': 'GOLOS/BTC', 'base': 'GOLOS', 'quote': 'BTC'},
                'UBQ/BTC': {'id': 'BTC-UBQ', 'symbol': 'UBQ/BTC', 'base': 'UBQ', 'quote': 'BTC'},
                'KMD/BTC': {'id': 'BTC-KMD', 'symbol': 'KMD/BTC', 'base': 'KMD', 'quote': 'BTC'},
                'GBG/BTC': {'id': 'BTC-GBG', 'symbol': 'GBG/BTC', 'base': 'GBG', 'quote': 'BTC'},
                'SIB/BTC': {'id': 'BTC-SIB', 'symbol': 'SIB/BTC', 'base': 'SIB', 'quote': 'BTC'},
                'ION/BTC': {'id': 'BTC-ION', 'symbol': 'ION/BTC', 'base': 'ION', 'quote': 'BTC'},
                'LMC/BTC': {'id': 'BTC-LMC', 'symbol': 'LMC/BTC', 'base': 'LMC', 'quote': 'BTC'},
                'QWARK/BTC': {'id': 'BTC-QWARK', 'symbol': 'QWARK/BTC', 'base': 'QWARK', 'quote': 'BTC'},
                'CRW/BTC': {'id': 'BTC-CRW', 'symbol': 'CRW/BTC', 'base': 'CRW', 'quote': 'BTC'},
                'SWT/BTC': {'id': 'BTC-SWT', 'symbol': 'SWT/BTC', 'base': 'SWT', 'quote': 'BTC'},
                'TIME/BTC': {'id': 'BTC-TIME', 'symbol': 'TIME/BTC', 'base': 'TIME', 'quote': 'BTC'},
                'MLN/BTC': {'id': 'BTC-MLN', 'symbol': 'MLN/BTC', 'base': 'MLN', 'quote': 'BTC'},
                'ARK/BTC': {'id': 'BTC-ARK', 'symbol': 'ARK/BTC', 'base': 'ARK', 'quote': 'BTC'},
                'DYN/BTC': {'id': 'BTC-DYN', 'symbol': 'DYN/BTC', 'base': 'DYN', 'quote': 'BTC'},
                'TKS/BTC': {'id': 'BTC-TKS', 'symbol': 'TKS/BTC', 'base': 'TKS', 'quote': 'BTC'},
                'MUSIC/BTC': {'id': 'BTC-MUSIC', 'symbol': 'MUSIC/BTC', 'base': 'MUSIC', 'quote': 'BTC'},
                'DTB/BTC': {'id': 'BTC-DTB', 'symbol': 'DTB/BTC', 'base': 'DTB', 'quote': 'BTC'},
                'INCNT/BTC': {'id': 'BTC-INCNT', 'symbol': 'INCNT/BTC', 'base': 'INCNT', 'quote': 'BTC'},
                'GBYTE/BTC': {'id': 'BTC-GBYTE', 'symbol': 'GBYTE/BTC', 'base': 'GBYTE', 'quote': 'BTC'},
                'GNT/BTC': {'id': 'BTC-GNT', 'symbol': 'GNT/BTC', 'base': 'GNT', 'quote': 'BTC'},
                'NXC/BTC': {'id': 'BTC-NXC', 'symbol': 'NXC/BTC', 'base': 'NXC', 'quote': 'BTC'},
                'EDG/BTC': {'id': 'BTC-EDG', 'symbol': 'EDG/BTC', 'base': 'EDG', 'quote': 'BTC'},
                'LGD/BTC': {'id': 'BTC-LGD', 'symbol': 'LGD/BTC', 'base': 'LGD', 'quote': 'BTC'},
                'TRST/BTC': {'id': 'BTC-TRST', 'symbol': 'TRST/BTC', 'base': 'TRST', 'quote': 'BTC'},
                'GNT/ETH': {'id': 'ETH-GNT', 'symbol': 'GNT/ETH', 'base': 'GNT', 'quote': 'ETH'},
                'REP/ETH': {'id': 'ETH-REP', 'symbol': 'REP/ETH', 'base': 'REP', 'quote': 'ETH'},
                'ETH/USD': {'id': 'USDT-ETH', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USDT'},
                'WINGS/ETH': {'id': 'ETH-WINGS', 'symbol': 'WINGS/ETH', 'base': 'WINGS', 'quote': 'ETH'},
                'WINGS/BTC': {'id': 'BTC-WINGS', 'symbol': 'WINGS/BTC', 'base': 'WINGS', 'quote': 'BTC'},
                'RLC/BTC': {'id': 'BTC-RLC', 'symbol': 'RLC/BTC', 'base': 'RLC', 'quote': 'BTC'},
                'GNO/BTC': {'id': 'BTC-GNO', 'symbol': 'GNO/BTC', 'base': 'GNO', 'quote': 'BTC'},
                'GUP/BTC': {'id': 'BTC-GUP', 'symbol': 'GUP/BTC', 'base': 'GUP', 'quote': 'BTC'},
                'LUN/BTC': {'id': 'BTC-LUN', 'symbol': 'LUN/BTC', 'base': 'LUN', 'quote': 'BTC'},
                'GUP/ETH': {'id': 'ETH-GUP', 'symbol': 'GUP/ETH', 'base': 'GUP', 'quote': 'ETH'},
                'RLC/ETH': {'id': 'ETH-RLC', 'symbol': 'RLC/ETH', 'base': 'RLC', 'quote': 'ETH'},
                'LUN/ETH': {'id': 'ETH-LUN', 'symbol': 'LUN/ETH', 'base': 'LUN', 'quote': 'ETH'},
                'SNGLS/ETH': {'id': 'ETH-SNGLS', 'symbol': 'SNGLS/ETH', 'base': 'SNGLS', 'quote': 'ETH'},
                'GNO/ETH': {'id': 'ETH-GNO', 'symbol': 'GNO/ETH', 'base': 'GNO', 'quote': 'ETH'},
                'APX/BTC': {'id': 'BTC-APX', 'symbol': 'APX/BTC', 'base': 'APX', 'quote': 'BTC'},
                'TKN/BTC': {'id': 'BTC-TKN', 'symbol': 'TKN/BTC', 'base': 'TKN', 'quote': 'BTC'},
                'TKN/ETH': {'id': 'ETH-TKN', 'symbol': 'TKN/ETH', 'base': 'TKN', 'quote': 'ETH'},
                'HMQ/BTC': {'id': 'BTC-HMQ', 'symbol': 'HMQ/BTC', 'base': 'HMQ', 'quote': 'BTC'},
                'HMQ/ETH': {'id': 'ETH-HMQ', 'symbol': 'HMQ/ETH', 'base': 'HMQ', 'quote': 'ETH'},
                'ANT/BTC': {'id': 'BTC-ANT', 'symbol': 'ANT/BTC', 'base': 'ANT', 'quote': 'BTC'},
                'TRST/ETH': {'id': 'ETH-TRST', 'symbol': 'TRST/ETH', 'base': 'TRST', 'quote': 'ETH'},
                'ANT/ETH': {'id': 'ETH-ANT', 'symbol': 'ANT/ETH', 'base': 'ANT', 'quote': 'ETH'},
                'SC/BTC': {'id': 'BTC-SC', 'symbol': 'SC/BTC', 'base': 'SC', 'quote': 'BTC'},
                'BAT/ETH': {'id': 'ETH-BAT', 'symbol': 'BAT/ETH', 'base': 'BAT', 'quote': 'ETH'},
                'BAT/BTC': {'id': 'BTC-BAT', 'symbol': 'BAT/BTC', 'base': 'BAT', 'quote': 'BTC'},
                'ZEN/BTC': {'id': 'BTC-ZEN', 'symbol': 'ZEN/BTC', 'base': 'ZEN', 'quote': 'BTC'},
                '1ST/BTC': {'id': 'BTC-1ST', 'symbol': '1ST/BTC', 'base': '1ST', 'quote': 'BTC'},
                'QRL/BTC': {'id': 'BTC-QRL', 'symbol': 'QRL/BTC', 'base': 'QRL', 'quote': 'BTC'},
                '1ST/ETH': {'id': 'ETH-1ST', 'symbol': '1ST/ETH', 'base': '1ST', 'quote': 'ETH'},
                'QRL/ETH': {'id': 'ETH-QRL', 'symbol': 'QRL/ETH', 'base': 'QRL', 'quote': 'ETH'},
                'CRB/BTC': {'id': 'BTC-CRB', 'symbol': 'CRB/BTC', 'base': 'CRB', 'quote': 'BTC'},
                'CRB/ETH': {'id': 'ETH-CRB', 'symbol': 'CRB/ETH', 'base': 'CRB', 'quote': 'ETH'},
                'LGD/ETH': {'id': 'ETH-LGD', 'symbol': 'LGD/ETH', 'base': 'LGD', 'quote': 'ETH'},
                'PTOY/BTC': {'id': 'BTC-PTOY', 'symbol': 'PTOY/BTC', 'base': 'PTOY', 'quote': 'BTC'},
                'PTOY/ETH': {'id': 'ETH-PTOY', 'symbol': 'PTOY/ETH', 'base': 'PTOY', 'quote': 'ETH'},
                'MYST/BTC': {'id': 'BTC-MYST', 'symbol': 'MYST/BTC', 'base': 'MYST', 'quote': 'BTC'},
                'MYST/ETH': {'id': 'ETH-MYST', 'symbol': 'MYST/ETH', 'base': 'MYST', 'quote': 'ETH'},
                'CFI/BTC': {'id': 'BTC-CFI', 'symbol': 'CFI/BTC', 'base': 'CFI', 'quote': 'BTC'},
                'CFI/ETH': {'id': 'ETH-CFI', 'symbol': 'CFI/ETH', 'base': 'CFI', 'quote': 'ETH'},
                'BNT/BTC': {'id': 'BTC-BNT', 'symbol': 'BNT/BTC', 'base': 'BNT', 'quote': 'BTC'},
                'BNT/ETH': {'id': 'ETH-BNT', 'symbol': 'BNT/ETH', 'base': 'BNT', 'quote': 'ETH'},
                'NMR/BTC': {'id': 'BTC-NMR', 'symbol': 'NMR/BTC', 'base': 'NMR', 'quote': 'BTC'},
                'NMR/ETH': {'id': 'ETH-NMR', 'symbol': 'NMR/ETH', 'base': 'NMR', 'quote': 'ETH'},
                'TIME/ETH': {'id': 'ETH-TIME', 'symbol': 'TIME/ETH', 'base': 'TIME', 'quote': 'ETH'},
                'LTC/ETH': {'id': 'ETH-LTC', 'symbol': 'LTC/ETH', 'base': 'LTC', 'quote': 'ETH'},
                'XRP/ETH': {'id': 'ETH-XRP', 'symbol': 'XRP/ETH', 'base': 'XRP', 'quote': 'ETH'},
                'SNT/BTC': {'id': 'BTC-SNT', 'symbol': 'SNT/BTC', 'base': 'SNT', 'quote': 'BTC'},
                'SNT/ETH': {'id': 'ETH-SNT', 'symbol': 'SNT/ETH', 'base': 'SNT', 'quote': 'ETH'},
                'DCT/BTC': {'id': 'BTC-DCT', 'symbol': 'DCT/BTC', 'base': 'DCT', 'quote': 'BTC'},
                'XEL/BTC': {'id': 'BTC-XEL', 'symbol': 'XEL/BTC', 'base': 'XEL', 'quote': 'BTC'},
                'MCO/BTC': {'id': 'BTC-MCO', 'symbol': 'MCO/BTC', 'base': 'MCO', 'quote': 'BTC'},
                'MCO/ETH': {'id': 'ETH-MCO', 'symbol': 'MCO/ETH', 'base': 'MCO', 'quote': 'ETH'},
                'ADT/BTC': {'id': 'BTC-ADT', 'symbol': 'ADT/BTC', 'base': 'ADT', 'quote': 'BTC'},
                'ADT/ETH': {'id': 'ETH-ADT', 'symbol': 'ADT/ETH', 'base': 'ADT', 'quote': 'ETH'},
                'FUN/BTC': {'id': 'BTC-FUN', 'symbol': 'FUN/BTC', 'base': 'FUN', 'quote': 'BTC'},
                'FUN/ETH': {'id': 'ETH-FUN', 'symbol': 'FUN/ETH', 'base': 'FUN', 'quote': 'ETH'},
                'PAY/BTC': {'id': 'BTC-PAY', 'symbol': 'PAY/BTC', 'base': 'PAY', 'quote': 'BTC'},
                'PAY/ETH': {'id': 'ETH-PAY', 'symbol': 'PAY/ETH', 'base': 'PAY', 'quote': 'ETH'},
                'MTL/BTC': {'id': 'BTC-MTL', 'symbol': 'MTL/BTC', 'base': 'MTL', 'quote': 'BTC'},
                'MTL/ETH': {'id': 'ETH-MTL', 'symbol': 'MTL/ETH', 'base': 'MTL', 'quote': 'ETH'},
                'STORJ/BTC': {'id': 'BTC-STORJ', 'symbol': 'STORJ/BTC', 'base': 'STORJ', 'quote': 'BTC'},
                'STORJ/ETH': {'id': 'ETH-STORJ', 'symbol': 'STORJ/ETH', 'base': 'STORJ', 'quote': 'ETH'},
                'ADX/BTC': {'id': 'BTC-ADX', 'symbol': 'ADX/BTC', 'base': 'ADX', 'quote': 'BTC'},
                'ADX/ETH': {'id': 'ETH-ADX', 'symbol': 'ADX/ETH', 'base': 'ADX', 'quote': 'ETH'},
                'DASH/ETH': {'id': 'ETH-DASH', 'symbol': 'DASH/ETH', 'base': 'DASH', 'quote': 'ETH'},
                'SC/ETH': {'id': 'ETH-SC', 'symbol': 'SC/ETH', 'base': 'SC', 'quote': 'ETH'},
                'ZEC/ETH': {'id': 'ETH-ZEC', 'symbol': 'ZEC/ETH', 'base': 'ZEC', 'quote': 'ETH'},
                'ZEC/USD': {'id': 'USDT-ZEC', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USDT'},
                'LTC/USD': {'id': 'USDT-LTC', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USDT'},
                'ETC/USD': {'id': 'USDT-ETC', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USDT'},
                'XRP/USD': {'id': 'USDT-XRP', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USDT'},
                'OMG/BTC': {'id': 'BTC-OMG', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC'},
                'OMG/ETH': {'id': 'ETH-OMG', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH'},
                'CVC/BTC': {'id': 'BTC-CVC', 'symbol': 'CVC/BTC', 'base': 'CVC', 'quote': 'BTC'},
                'CVC/ETH': {'id': 'ETH-CVC', 'symbol': 'CVC/ETH', 'base': 'CVC', 'quote': 'ETH'},
                'PART/BTC': {'id': 'BTC-PART', 'symbol': 'PART/BTC', 'base': 'PART', 'quote': 'BTC'},
                'QTUM/BTC': {'id': 'BTC-QTUM', 'symbol': 'QTUM/BTC', 'base': 'QTUM', 'quote': 'BTC'},
                'QTUM/ETH': {'id': 'ETH-QTUM', 'symbol': 'QTUM/ETH', 'base': 'QTUM', 'quote': 'ETH'},
                'XMR/ETH': {'id': 'ETH-XMR', 'symbol': 'XMR/ETH', 'base': 'XMR', 'quote': 'ETH'},
                'XEM/ETH': {'id': 'ETH-XEM', 'symbol': 'XEM/ETH', 'base': 'XEM', 'quote': 'ETH'},
                'XLM/ETH': {'id': 'ETH-XLM', 'symbol': 'XLM/ETH', 'base': 'XLM', 'quote': 'ETH'},
                'NEO/ETH': {'id': 'ETH-NEO', 'symbol': 'NEO/ETH', 'base': 'NEO', 'quote': 'ETH'},
                'XMR/USD': {'id': 'USDT-XMR', 'symbol': 'XMR/USD', 'base': 'XMR', 'quote': 'USDT'},
                'DASH/USD': {'id': 'USDT-DASH', 'symbol': 'DASH/USD', 'base': 'DASH', 'quote': 'USDT'},
                'BCH/ETH': {'id': 'ETH-BCC', 'symbol': 'BCH/ETH', 'base': 'BCH', 'quote': 'ETH'},
                'BCH/USD': {'id': 'USDT-BCC', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USDT'},
                'BCH/BTC': {'id': 'BTC-BCC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC'},
                'DNT/BTC': {'id': 'BTC-DNT', 'symbol': 'DNT/BTC', 'base': 'DNT', 'quote': 'BTC'},
                'DNT/ETH': {'id': 'ETH-DNT', 'symbol': 'DNT/ETH', 'base': 'DNT', 'quote': 'ETH'},
                'NEO/USD': {'id': 'USDT-NEO', 'symbol': 'NEO/USD', 'base': 'NEO', 'quote': 'USDT'},
                'WAVES/ETH': {'id': 'ETH-WAVES', 'symbol': 'WAVES/ETH', 'base': 'WAVES', 'quote': 'ETH'},
                'STRAT/ETH': {'id': 'ETH-STRAT', 'symbol': 'STRAT/ETH', 'base': 'STRAT', 'quote': 'ETH'},
                'DGB/ETH': {'id': 'ETH-DGB', 'symbol': 'DGB/ETH', 'base': 'DGB', 'quote': 'ETH'},
                'FCT/ETH': {'id': 'ETH-FCT', 'symbol': 'FCT/ETH', 'base': 'FCT', 'quote': 'ETH'},
                'BTS/ETH': {'id': 'ETH-BTS', 'symbol': 'BTS/ETH', 'base': 'BTS', 'quote': 'ETH'},
                'OMG/USD': {'id': 'USDT-OMG', 'symbol': 'OMG/USD', 'base': 'OMG', 'quote': 'USDT'},
                'ADA/BTC': {'id': 'BTC-ADA', 'symbol': 'ADA/BTC', 'base': 'ADA', 'quote': 'BTC'},
                'MANA/BTC': {'id': 'BTC-MANA', 'symbol': 'MANA/BTC', 'base': 'MANA', 'quote': 'BTC'},
                'MANA/ETH': {'id': 'ETH-MANA', 'symbol': 'MANA/ETH', 'base': 'MANA', 'quote': 'ETH'},
                'SALT/BTC': {'id': 'BTC-SALT', 'symbol': 'SALT/BTC', 'base': 'SALT', 'quote': 'BTC'},
                'SALT/ETH': {'id': 'ETH-SALT', 'symbol': 'SALT/ETH', 'base': 'SALT', 'quote': 'ETH'},
                'TIX/BTC': {'id': 'BTC-TIX', 'symbol': 'TIX/BTC', 'base': 'TIX', 'quote': 'BTC'},
                'TIX/ETH': {'id': 'ETH-TIX', 'symbol': 'TIX/ETH', 'base': 'TIX', 'quote': 'ETH'},
            },
        })

    def cost_to_precision(self, symbol, cost):
        return self.truncate(float(cost), self.markets[symbol].precision.price)

    def fee_to_precision(self, symbol, fee):
        return self.truncate(float(fee), self.markets[symbol]['precision']['price'])

    def fetch_markets(self):
        markets = self.publicGetMarkets()
        result = []
        for p in range(0, len(markets['result'])):
            market = markets['result'][p]
            id = market['MarketName']
            base = market['MarketCurrency']
            quote = market['BaseCurrency']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            amountLimits = {
                'min': market['MinTradeSize'],
                'max': None,
            }
            priceLimits = {'min': None, 'max': None}
            limits = {
                'amount': amountLimits,
                'price': priceLimits,
            }
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'lot': amountLimits['min'],
                'precision': precision,
                'limits': limits,
            }))
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.accountGetBalances()
        balances = response['result']
        result = {'info': balances}
        indexed = self.index_by(balances, 'Currency')
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            account = self.account()
            if currency in indexed:
                balance = indexed[currency]
                free = float(balance['Available'])
                total = float(balance['Balance'])
                used = total - free
                account['free'] = free
                account['used'] = used
                account['total'] = total
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        response = self.publicGetOrderbook(self.extend({
            'market': self.market_id(symbol),
            'type': 'both',
            'depth': 50,
        }, params))
        orderbook = response['result']
        return self.parse_order_book(orderbook, None, 'buy', 'sell', 'Rate', 'Quantity')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.parse8601(ticker['TimeStamp'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'High'),
            'low': self.safe_float(ticker, 'Low'),
            'bid': self.safe_float(ticker, 'Bid'),
            'ask': self.safe_float(ticker, 'Ask'),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'Last'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'Volume'),
            'quoteVolume': self.safe_float(ticker, 'BaseVolume'),
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        response = self.publicGetMarketsummaries(params)
        tickers = response['result']
        result = {}
        for t in range(0, len(tickers)):
            ticker = tickers[t]
            id = ticker['MarketName']
            market = None
            symbol = id
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
            else:
                quote, base = id.split('-')
                base = self.common_currency_code(base)
                quote = self.common_currency_code(quote)
                symbol = base + '/' + quote
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetMarketsummary(self.extend({
            'market': market['id'],
        }, params))
        ticker = response['result'][0]
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = self.parse8601(trade['TimeStamp'])
        side = None
        if trade['OrderType'] == 'BUY':
            side = 'buy'
        elif trade['OrderType'] == 'SELL':
            side = 'sell'
        id = None
        if 'Id' in trade:
            id = str(trade['Id'])
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': trade['Price'],
            'amount': trade['Quantity'],
        }

    def fetch_trades(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetMarkethistory(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_trades(response['result'], market)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1d', since=None, limit=None):
        timestamp = self.parse8601(ohlcv['T'])
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ]

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'tickInterval': self.timeframes[timeframe],
            'marketName': market['id'],
        }
        response = self.v2GetMarketGetTicks(self.extend(request, params))
        return self.parse_ohlcvs(response['result'], market, timeframe, since, limit)

    def fetch_open_orders(self, symbol=None, params={}):
        self.load_markets()
        request = {}
        market = None
        if symbol:
            market = self.market(symbol)
            request['market'] = market['id']
        response = self.marketGetOpenorders(self.extend(request, params))
        orders = self.parse_orders(response['result'], market)
        return self.filter_orders_by_symbol(orders, symbol)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        method = 'marketGet' + self.capitalize(side) + type
        order = {
            'market': market['id'],
            'quantity': self.amount_to_precision(symbol, amount),
        }
        if type == 'limit':
            order['rate'] = self.price_to_precision(symbol, price)
        response = getattr(self, method)(self.extend(order, params))
        result = {
            'info': response,
            'id': response['result']['uuid'],
        }
        return result

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        response = None
        try:
            response = self.marketGetCancel(self.extend({
                'uuid': id,
            }, params))
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'message')
                if message == 'ORDER_NOT_OPEN':
                    raise InvalidOrder(self.id + ' cancelOrder() error: ' + self.last_http_response)
                if message == 'UUID_INVALID':
                    raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    def parse_order(self, order, market=None):
        side = None
        if 'OrderType' in order:
            side = 'buy' if (order['OrderType'] == 'LIMIT_BUY') else 'sell'
        if 'Type' in order:
            side = 'buy' if (order['Type'] == 'LIMIT_BUY') else 'sell'
        status = 'open'
        if order['Closed']:
            status = 'closed'
        elif order['CancelInitiated']:
            status = 'canceled'
        symbol = None
        if not market:
            if 'Exchange' in order:
                if order['Exchange'] in self.markets_by_id:
                    market = self.markets_by_id[order['Exchange']]
        if market:
            symbol = market['symbol']
        timestamp = None
        if 'Opened' in order:
            timestamp = self.parse8601(order['Opened'])
        if 'TimeStamp' in order:
            timestamp = self.parse8601(order['TimeStamp'])
        fee = None
        commission = None
        if 'Commission' in order:
            commission = 'Commission'
        elif 'CommissionPaid' in order:
            commission = 'CommissionPaid'
        if commission:
            fee = {
                'cost': float(order[commission]),
                'currency': market['quote'],
            }
        price = self.safe_float(order, 'Limit')
        cost = self.safe_float(order, 'Price')
        amount = self.safe_float(order, 'Quantity')
        remaining = self.safe_float(order, 'QuantityRemaining', 0.0)
        filled = amount - remaining
        if not cost:
            if price and amount:
                cost = price * amount
        if not price:
            if cost and filled:
                price = cost / filled
        average = self.safe_float(order, 'PricePerUnit')
        result = {
            'info': order,
            'id': order['OrderUuid'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
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
        }
        return result

    def fetch_order(self, id, symbol=None, params={}):
        self.load_markets()
        response = None
        try:
            response = self.accountGetOrder({'uuid': id})
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'message')
                if message == 'UUID_INVALID':
                    raise OrderNotFound(self.id + ' fetchOrder() error: ' + self.last_http_response)
            raise e
        return self.parse_order(response['result'])

    def fetch_orders(self, symbol=None, params={}):
        self.load_markets()
        request = {}
        market = None
        if symbol:
            market = self.market(symbol)
            request['market'] = market['id']
        response = self.accountGetOrderhistory(self.extend(request, params))
        orders = self.parse_orders(response['result'], market)
        return self.filter_orders_by_symbol(orders, symbol)

    def withdraw(self, currency, amount, address, params={}):
        self.load_markets()
        response = self.accountGetWithdraw(self.extend({
            'currency': currency,
            'quantity': amount,
            'address': address,
        }, params))
        id = None
        if 'result' in response:
            if 'uuid' in response['result']:
                id = response['result']['uuid']
        return {
            'info': response,
            'id': id,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api] + '/'
        if api != 'v2':
            url += self.version + '/'
        if api == 'public':
            url += api + '/' + method.lower() + path
            if params:
                url += '?' + self.urlencode(params)
        elif api == 'v2':
            url += path
            if params:
                url += '?' + self.urlencode(params)
        else:
            nonce = self.nonce()
            url += api + '/'
            if ((api == 'account') and(path != 'withdraw')) or (path == 'openorders'):
                url += method.lower()
            url += path + '?' + self.urlencode(self.extend({
                'nonce': nonce,
                'apikey': self.apiKey,
            }, params))
            signature = self.hmac(self.encode(url), self.encode(self.secret), hashlib.sha512)
            headers = {'apisign': signature}
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if response['success']:
                return response
        if 'message' in response:
            if response['message'] == "INSUFFICIENT_FUNDS":
                raise InsufficientFunds(self.id + ' ' + self.json(response))
        raise ExchangeError(self.id + ' ' + self.json(response))

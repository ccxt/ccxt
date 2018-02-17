# -*- coding: utf-8 -*-

import asyncio
import aiohttp
import hashlib
import sys
import collections
import ujson
from copy import deepcopy
import time
import datetime

# -----------------------------------------------------------------------------

from ccxt.async.ws.base.exchange import Exchange

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import InsufficientFunds

# -----------------------------------------------------------------------------


class bitfinex (Exchange):

    def describe(self):
        return self.deep_extend(super(bitfinex, self).describe(), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': 'US',
            'version': 'v1',
            'rateLimit': 1500,
            'hasCORS': False,
            # old metainfo interface
            'hasFetchOrder': True,
            'hasFetchTickers': True,
            'hasDeposit': True,
            'hasWithdraw': True,
            'hasFetchOHLCV': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            # new metainfo interface
            'has': {
                'fetchOHLCV': True,
                'fetchTickers': True,
                'fetchOrder': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'withdraw': True,
                'deposit': True,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': 'https://bitfinex.readme.io/v1/docs',
                'ws': 'wss://api.bitfinex.com/ws',
            },
            'api': {
                'public': {
                    'request': {
                        'order_book': {
                            'event': 'subscribe',
                            'channel': 'book',
                            'pair': 'pair',
                            'prec': 'P0',
                            'freq': 'F0',
                            'len': '100',
                        },
                        'raw_oder_book': {
                            'event': 'subscribe',
                            'channel': 'book',
                            'pair': 'pair',
                            'prec': 'R0',
                        },
                        'trades': {
                            'event': 'subscribe',
                            'channel': 'trades',
                            'pair': 'pair',
                        },
                        'ticker': {
                            'event': 'subscribe',
                            'channel': 'ticker',
                            'pair': 'pair',
                        },
                        'ping': {
                            'event': 'ping'
                        },
                        'response': {
                            'ping': {
                                'event': 'pong'
                            }
                        }
                    },
                },
            },
            'markets': {
                'XRP/USD': {'id': 'XRPUSD', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD'},
                'BTC/USD': {'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'LTC/USD': {'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD'},
                'LTC/BTC': {'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'ETH/USD': {'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD'},
                'ETH/BTC': {'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                'ETC/USD': {'id': 'ETCUSD', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD'},
                'ETC/BTC': {'id': 'ETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC'},
                'BFX/USD': {'id': 'BFXUSD', 'symbol': 'BFX/USD', 'base': 'BFX', 'quote': 'USD'},
                'BFX/BTC': {'id': 'BFXBTC', 'symbol': 'BFX/BTC', 'base': 'BFX', 'quote': 'BTC'},
                'RRT/USD': {'id': 'RRTUSD', 'symbol': 'RRT/USD', 'base': 'RRT', 'quote': 'USD'},
                'RRT/BTC': {'id': 'RRTBTC', 'symbol': 'RRT/BTC', 'base': 'RRT', 'quote': 'BTC'},
                'ZEC/USD': {'id': 'ZECUSD', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USD'},
                'ZEC/BTC': {'id': 'ZECBTC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC'}
            },
        })

    async def event_handler(self, response):
        """ Handles the incoming responses"""
        data = ujson.loads(response.data)
        if isinstance(data, dict):
            if data['event'] == 'subscribed':
                print('Subscribed to channel: {0}, for pair: {1}, on channel ID: {2}'.format(data['channel'], data['pair'], data['chanId']))
                self.channel_mapping[data['chanId']] = (data['channel'], data['pair'])
            elif data['event'] == 'info':
                print('Exchange: {0} Websocket version: {1}'.format(self.id, data['version']))
        elif isinstance(data, list):
            if isinstance(data[1], str):
                print('Heartbeat on channel {0}'.format(data[0]))
            else:
                # Published data, time stamp and send to appropriate queue
                timestamp = self.microseconds() / 1000
                datetime = self.iso8601(timestamp)
                if self.channel_mapping[data[0]][0] == 'book':
                    pair_id = self.channel_mapping[data[0]][1]
                    await self.queues['orderbooks'][pair_id].put((data, timestamp, datetime))

    def subscribe_order_book_request_packet(self, pair_id):
        """ Return the request packet"""
        request_packet = deepcopy(self.api['public']['request']['order_book'])
        request_packet.update({'pair': pair_id})
        return request_packet

    def order_book_builder(self, data, timestamp, datetime, symbol):
        """ Build and update the order book """
        if isinstance(data[1], list):
            data = data[1]
            # Price, Count, Amount
            bids = {
                str(level[0]): [str(level[1]), str(level[2])]
                for level in data if level[2] > 0
            }
            asks = {
                str(level[0]): [str(level[1]), str(abs(level[2]))]
                for level in data if level[2] < 0
            }
            self.orderbooks[symbol].update({'bids': bids})
            self.orderbooks[symbol].update({'asks': asks})
            self.orderbooks[symbol].update({'timestamp': timestamp})
            self.orderbooks[symbol].update({'datetime': datetime})

        else:
            # Example update message structure [1765.2, 0, 1] where we have [price, count, amount].
            # Update algorithm pseudocode from Bitfinex documentation:
            # 1. - When count > 0 then you have to add or update the price level.
            #   1.1- If amount > 0 then add/update bids.
            #   1.2- If amount < 0 then add/update asks.
            # 2. - When count = 0 then you have to delete the price level.
            #   2.1- If amount = 1 then remove from bids
            #   2.2- If amount = -1 then remove from asks
            data = data[1:]
            data = [str(data[0]), str(data[1]), str(data[2])]
            if int(data[1]) > 0:  # 1.

                if float(data[2]) > 0:  # 1.1
                    self.orderbooks[symbol]['bids'].update({data[0]: [data[1], data[2]]})

                elif float(data[2]) < 0:  # 1.2
                    self.orderbooks[symbol]['asks'].update({data[0]: [data[1], str(abs(float(data[2])))]})

            elif data[1] == '0':  # 2.

                if data[2] == '1':  # 2.1
                    if self.orderbooks[symbol]['bids'].get(data[0]):
                        del self.orderbooks[symbol]['bids'][data[0]]

                elif data[2] == '-1':  # 2.2
                    if self.orderbooks[symbol]['asks'].get(data[0]):
                        del self.orderbooks[symbol]['asks'][data[0]]

    def order_book_fetch(self, symbol):
        """ process in memory order book to standard ccxt order book format"""
        orderbook = self.orderbooks[symbol]
        asks = [[float(price), float(stats[0]) * float(stats[1])] for price, stats in orderbook['asks'].items()]
        bids = [[float(price), float(stats[0]) * float(stats[1])] for price, stats in orderbook['bids'].items()]
        return asks, bids, orderbook

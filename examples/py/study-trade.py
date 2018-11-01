import ccxt
import time
import os
import asyncio
import socket

# good_exchange_name = ['binance', 'fcoin', 'gateio', 'huobipro', 'kucoin', 'okex','bcex','bibox','bigone','bitfinex','bitforex',
#                       'bithumb','bitkk','cex','coinbase','coinex','cointiger','exx','gdax','gemini','hitbtc','rightbtc',
#                       'theocean','uex']
# good_exchange_name = ['kucoin', 'okex', 'bcex', 'bibox', 'bigone']
good_exchange_name = ['uex']
good_coin = ['ETH', 'XRP', 'BCH', 'EOS', 'XLM', 'LTC', 'ADA', 'XMR', 'TRX', 'BNB', 'ONT', 'NEO', 'DCR', 'LBA', 'RATING']

has_config_exchange = ['okex','uex']
config_key = dict()
config_key['okex'] = ['okex_key','okex_secret']
config_key['uex'] = ['uex_key','uex_secret']

# 订单交易量吃单比例
order_ratio = 0.5
# 价格滑点比例
slippage = 0.000

delay = 2


print('config_key is {}'.format(config_key))

def set_proxy():
    os.environ.setdefault('http_proxy', 'http://127.0.0.1:1080')
    os.environ.setdefault('https_proxy', 'http://127.0.0.1:1080')


# 获取指定交易所列表
def get_exchange_list(good_list):
    exchange_list = []
    for exchange_name in good_list:
        exchange = getattr(ccxt,exchange_name)()
        if exchange :
            exchange_list.append(exchange)
    return exchange_list


# 设置交易所key
def set_exchange_key(exchange):
    if exchange.id in has_config_exchange:
        exchange.apiKey = config_key[exchange.id][0]
        exchange.secret = config_key[exchange.id][1]
        print('set_exchange_key name is {},key is {},secret is {}'.format(exchange.name,exchange.apiKey,exchange.secret))
    else:
        print('set_exchange_key name is {} no key'.format(exchange.name))


def get_host_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return ip

if __name__ == '__main__':

    print('before proxy ip is {}'.format(get_host_ip()))
    set_proxy()
    print('after proxy ip is {}'.format(get_host_ip()))
    good_exchange_list = get_exchange_list(good_exchange_name)
    for exchange in good_exchange_list:
        set_exchange_key(exchange)
    for exchange in good_exchange_list:
        print('exchange name is {},key is {},secret is {}'.format(exchange.name,exchange.apiKey,exchange.secret))
        print('exchange has {}'.format(exchange.has))
        try:
            base = 'RATING'
            quote = 'ETH'
            symbol = base+'/'+quote
            default_amount = 0.0001
            default_price = 0
            balance = exchange.fetch_balance()
            orderbook = exchange.fetch_order_book(symbol)

            buy_price = orderbook['bids'][0][0] if len (orderbook['bids']) > 0 else None
            buy_amount = orderbook['bids'][0][1] if len(orderbook['bids']) > 0 else None
            sell_price = orderbook['asks'][0][0] if len (orderbook['asks']) > 0 else None
            sell_amount = orderbook['asks'][0][1] if len(orderbook['asks']) > 0 else None

            quote_free = balance[quote]['free'] if balance[quote]['free'] else 0
            quote_used = balance[quote]['used'] if balance[quote]['used'] else 0
            quote_total = balance[quote]['total'] if balance[quote]['total'] else 0

            base_free = balance[base]['free'] if balance[base]['free'] else 0
            base_used = balance[base]['used'] if balance[base]['used'] else 0
            base_total = balance[base]['total'] if balance[base]['total'] else 0

            # 买操作
            if quote_free > sell_price*sell_amount*order_ratio:
                ret_buy = exchange.create_order(symbol,'limit','buy',sell_amount*order_ratio,sell_price*(1-slippage))
                order = exchange.fetch_order(ret_buy['id'],symbol)
                print('do buy ret_buy is {},order is {},amount {},filled {},remaining {}'.format(ret_buy,order,ret_buy['amount'],ret_buy['filled'],ret_buy['remaining']))
            else:
                print('do buy quote_free <  sell_price*sell_amount InsufficientFunds {},{}'.format(quote_free,sell_price*sell_amount))

            # 卖操作
            if base_free >= buy_amount*order_ratio:
                ret_sell = exchange.create_order(symbol, 'limit', 'sell', buy_amount*order_ratio, buy_price*(1+slippage))
                order = exchange.fetch_order(ret_sell['id'],symbol)
                print('do sell ret_sell is {},order is {},amount {},filled {},remaining {}'.format(ret_sell,order,ret_sell['amount'],ret_sell['filled'],ret_sell['remaining']))
            else:
                print('do sell base_free > buy_amount {},{}'.format(base_free,buy_amount))

            # 卖
            # if base_free > 0:
            #     ret_sell = exchange.create_order(symbol, 'limit', 'sell', base_free, buy_price*(1+slippage))
            #     order = exchange.fetch_order(ret_sell['id'],symbol)
            #     filled = order['filled']
            #     remaining = order['remaining']
            #     cost = order['cost']
            #     fee = order['fee']
            #     print('do sell ret_sell is {},order is {},amount {},filled {},remaining {}'.format(ret_sell,order,ret_sell['amount'],ret_sell['filled'],ret_sell['remaining']))
            #     print('order amount is {},filled is {},remaining is {},cost is {},fee is {}'.format(ret_sell['amount'],filled,remaining,cost,fee))
            # else:
            #     print('do sell base_free > buy_amount {},{}'.format(base_free,buy_amount))

            # 轮询3次取消尚未成交的订单
            open_order_list = exchange.fetch_open_orders(symbol)
            for open_order in open_order_list:
                id = open_order['id']
                retry = 0
                while retry < 3:
                    if retry == 2:
                        exchange.cancel_order(id, symbol)
                    time.sleep(delay)
                    order = exchange.fetch_order(id, symbol)
                    filled = order['filled']
                    remaining = order['remaining']
                    amount = order['amount']
                    if filled/amount < order_ratio:
                        retry += 1
                        continue
                    #TODO 对冲操作

        except Exception as e:
            print('balance exception is {}'.format(e))

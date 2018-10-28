import ccxt
import time
import os
good_coin = ['BTC', 'ETH', 'XRP', 'BCH', 'EOS', 'XLM', 'LTC', 'ADA', 'XMR', 'TRX', 'BNB', 'ONT', 'NEO', 'DCR']
# good_coin = ['BTC', 'ETH', 'XRP']
good_exchange_name = ['binance', 'fcoin', 'gateio', 'huobipro', 'kucoin', 'okex']
# good_exchange_name = ['huobipro', 'kucoin', 'okex']

def_quote = 'USDT'
# delay 2 seconds
delay = 2

all_exchange = ccxt.exchanges
gate = ccxt.gateio()
gate_markets = gate.load_markets()
# print ('gateio markets is {}'.format(gate.markets))


# test demo
def test_demo():
    # from variable id
    exchange_id = 'binance'
    os.environ.setdefault('http_proxy', 'http://127.0.0.1:1080')
    os.environ.setdefault('https_proxy', 'http://127.0.0.1:1080')
    print('http_proxy is {},https_proxy is {}'.format(os.environ.get('http_proxy'), os.environ.get('https_proxy')))
    binance = getattr(ccxt, exchange_id)()
    binance_markets = binance.load_markets()
    # print ('gateio markets is {}'.format(binance_markets))
    # print ('gateio all tickers is {}'.format(gate.fetch_tickers()))
    # print ('BTC/USDT is {},\n ETH/USDT is {},\n ETH/BTC is {}'.format(gate_markets['BTC/USDT'],
    # gate_markets['ETH/USDT'],gate_markets['ETH/BTC']))
    # print('exchange gate is {}'.format(dir(gate)))

    for symbol in gate.markets:
        # print(symbol)
        base = str(symbol).split('/')[0]
        quote = str(symbol).split('/')[1]
        if base in good_coin and quote == def_quote:
            orderbook = gate.fetch_order_book(symbol)
            bid1 = orderbook['bids'][0][0] if len (orderbook['bids']) > 0 else None
            ask1 = orderbook['asks'][0][0] if len (orderbook['asks']) > 0 else None
            spread = (ask1 - bid1) if (bid1 and ask1) else None
            print('symbol is {},bid1 is {},ask1 is {},spread is {}'.format(symbol,bid1,ask1,spread))
        # print ('symbol is {},\n order_book is {}'.format(symbol,gate.fetch_order_book (symbol)))
        time.sleep (delay) # rate limit


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


# 低买高卖，获取指定交易对的潜在套利最大化的2个交易所，理论上先去ask1卖一最低（卖的最便宜的bid1）的买入，立刻去bid1买一最高（买起来最贵的bid1）卖出
def find_trade_object(in_symbol,exchange_list):
    pass
    #最贵的买一 初始化为一个较小值
    max_bid1 = 0
    #最便宜的卖一 初始化为一个较大值
    min_ask1 = 10000
    bid_exchange = None
    ask_exchange = None
    bid_time = None
    ask_time = None
    bid_amount = None
    ask_amount = None
    print ('current symbol is {}'.format(in_symbol))
    for exchange in exchange_list:
        #获取市场交易对数据
        try:
            exchange.load_markets()
        except Exception as e:
            print('-------XXXXXX11111 load_markets exception is {},exchange is {},symbol is {}'.format(e.args[0],exchange.name,symbol))
            continue
        if exchange.markets is None:
            print('exchange markets {} is None'.format(exchange))
            continue
        
        try:
            orderbook = exchange.fetch_order_book(symbol)
        except Exception as e:
            print('-------XXXXXX22222 fetch_order_book exception is {},exchange is {},symbol is {}'.format(e.args[0], exchange.name, symbol))
            continue
        date_time = exchange.last_response_headers['Date']
        bid1 = orderbook['bids'][0][0] if len(orderbook['bids']) > 0 else None
        bid1_amount = orderbook['bids'][0][1] if len(orderbook['bids']) > 0 else None
        ask1 = orderbook['asks'][0][0] if len(orderbook['asks']) > 0 else None
        ask1_amount = orderbook['asks'][0][1] if len(orderbook['asks']) > 0 else None
        print('exchange {} bid1 ask1 is \n---- {},{},   {},{},date_time is {}'.format(exchange.name, bid1, bid1_amount,
                                                                                      ask1, ask1_amount, date_time))
        #比较价格并保存 最低卖一价和最高买一价
        #找到最贵的买一，进行卖操作
        if bid1 and (bid1 > max_bid1):
            max_bid1 = bid1
            bid_exchange = exchange
            bid_time = date_time
            bid_amount = bid1_amount
            print('get new max_bid1 is {},exchange is {},date_time is {}'.format(max_bid1, exchange.name, date_time))
        #找到最便宜的卖一，进行买操作
        if ask1 and (ask1 < min_ask1):
            min_ask1 = ask1
            ask_exchange = exchange
            ask_time = date_time
            ask_amount = ask1_amount
            print('get new min_ask1 is {},exchange is {},date_time is {}'.format(min_ask1, exchange.name, date_time))
        time.sleep(delay)
                
    if bid_exchange and ask_exchange:
        price_diff = max_bid1 - min_ask1
        percent = price_diff / min_ask1 * 100
        trade_volume = min(ask_amount,bid_amount)
        profits = min_ask1 * trade_volume * percent/100
        print('\n\n****** symbol {} find good exchange,\n percent {}%,price_diff {},trade_volume {},profits {},'
              '\nbuy at {},{},{},{},\nsell at {},{},{},{}'.
              format(in_symbol,percent,price_diff,trade_volume,profits, min_ask1,ask_amount,min_ask1*ask_amount,ask_exchange.name,
                     max_bid1,bid_amount,max_bid1*bid_amount,bid_exchange.name))
        if price_diff < 0:
            print('oooooooo unlucky symbol {},no pair to make money'.format(symbol))
        return percent,price_diff,trade_volume,profits, min_ask1,ask_amount,min_ask1*ask_amount, ask_exchange.name,ask_time,\
               max_bid1,bid_amount,max_bid1*bid_amount,bid_exchange.name,bid_time
    else :
        print('\n\n******------ symbol {} not find good exchange'.format(in_symbol))
        return min_ask1,None,max_bid1,None

if __name__ == '__main__':

    set_proxy()
    good_exchange_list = get_exchange_list(good_exchange_name)

    print('exchange list is {},\ncoin list is {},\nquote is {}'.format(good_exchange_name,good_coin,def_quote))

    # 找出每个指定交易对在指定交易所中价差最大的2个，可以在这2个交易所进行搬砖套利
    for base in good_coin:
        symbol = base + '/' + def_quote
        print('-------start base is {},symbol is {}'.format(base,symbol))
        print(find_trade_object(symbol,good_exchange_list))
        print('+++++++end this symbol \n\n\n')

    print('-----------all over---------------')


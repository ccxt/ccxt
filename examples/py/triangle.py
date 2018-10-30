import ccxt
import time
import os
good_exchange_name = ['binance', 'fcoin', 'gateio', 'huobipro', 'kucoin', 'okex']
good_coin = ['ETH', 'XRP', 'BCH', 'EOS', 'XLM', 'LTC', 'ADA', 'XMR', 'TRX', 'BNB', 'ONT', 'NEO', 'DCR']
"""
    交易对：用一种资产（quote currency）去定价另一种资产（base currency）,比如用比特币（BTC）去定价莱特币（LTC），
    就形成了一个LTC/BTC的交易对，
    交易对的价格代表的是买入1单位的base currency（比如LTC）
    需要支付多少单位的quote currency（比如BTC），
    或者卖出一个单位的base currency（比如LTC）
    可以获得多少单位的quote currency（比如BTC）。
    中间资产mid currency可以是USDT等稳定币
"""
# P1 quote_mid BTC/USDT
# P2 base_mid LTC/USDT
# P3 base_quote LTC/BTC
default_base_cur = 'LTC'
default_quote_cur = 'BTC'
default_mid_cur = 'USDT'
#delay 2 second
delay = 2


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


# 在指定交易所寻找三角套利机会，根据P3与P2/P1大小关系进行套利，暂不考虑滑点和手续费，目标保持base,quote数量不变，使mid数量增多
def find_trade_chance(exchange,base='LTC',quote='BTC',mid='USDT'):
    try:
        exchange.load_markets()
    except Exception as e:
        print('load_markets e is {} ,exchange is {}'.format(e.args[0],exchange.name))
        return
    cur_quote_mid = quote + '/' + mid
    cur_base_mid = base+'/'+mid
    cur_base_quote = base + '/' + quote

    try:
        book_quote_mid = exchange.fetch_order_book(cur_quote_mid)
        time.sleep(delay)
        book_base_mid = exchange.fetch_order_book(cur_base_mid)
        time.sleep(delay)
        book_base_quote = exchange.fetch_order_book(cur_base_quote)
    except Exception as e:
        print('fetch_order_book e is {} ,exchange is {}'.format(e.args[0],exchange.name))
        return

    # P1
    price_quote_mid_bid1 = book_quote_mid['bids'][0][0] if len(book_quote_mid['bids']) > 0 else None
    price_quote_mid_ask1 = book_quote_mid['asks'][0][0] if len(book_quote_mid['asks']) > 0 else None
    size_quote_mid_bid1 = book_quote_mid['bids'][0][1] if len(book_quote_mid['bids']) > 0 else None
    size_quote_mid_ask1 = book_quote_mid['asks'][0][1] if len(book_quote_mid['asks']) > 0 else None
    # P2
    price_base_mid_bid1 = book_base_mid['bids'][0][0] if len(book_base_mid['bids']) > 0 else None
    price_base_mid_ask1 = book_base_mid['asks'][0][0] if len(book_base_mid['asks']) > 0 else None
    size_base_mid_bid1 = book_base_mid['bids'][0][1] if len(book_base_mid['bids']) > 0 else None
    size_base_mid_ask1 = book_base_mid['asks'][0][1] if len(book_base_mid['asks']) > 0 else None
    # P3
    price_base_quote_bid1 = book_base_quote['bids'][0][0] if len(book_base_quote['bids']) > 0 else None
    price_base_quote_ask1 = book_base_quote['asks'][0][0] if len(book_base_quote['asks']) > 0 else None
    size_base_quote_bid1 = book_base_quote['bids'][0][1] if len(book_base_quote['bids']) > 0 else None
    size_base_quote_ask1 = book_base_quote['asks'][0][1] if len(book_base_quote['asks']) > 0 else None
    date_time = exchange.last_response_headers['Date']
    print('-----find_trade_chance开始在交易所{}寻找三角套利机会,base:{},quote:{},mid:{},time:{}'.format(exchange.name,base,quote,mid,date_time))
    print('P1: buy1:{},{},sell1:{},{}'.format(price_quote_mid_bid1,size_quote_mid_bid1,price_quote_mid_ask1,size_quote_mid_ask1))
    print('P2: buy1:{},{},sell1:{},{}'.format(price_base_mid_bid1, size_base_mid_bid1, price_base_mid_ask1,size_base_mid_ask1))
    print('P3: buy1:{},{},sell1:{},{}'.format(price_base_quote_bid1, size_base_quote_bid1, price_base_quote_ask1,size_base_quote_ask1))
    #检查正循环套利
    '''
        三角套利的基本思路是，用两个市场（比如BTC/CNY，LTC/CNY）的价格（分别记为P1，P2），
        计算出一个公允的LTC/BTC价格（P2/P1），如果该公允价格跟实际的LTC/BTC市场价格（记为P3）不一致，
        就产生了套利机会
        P3<P2/P1
        操作：买-卖/买
        价格条件提交：base_quote_ask1卖1 < base_mid_bid1买1/quote_mid_ask1卖1
        交易量Q3:三者中取最小下单量，单位要统一为P3交易对的个数
        利润：Q3*P1*(P2/P1-P3)
    '''
    if price_base_quote_ask1 < price_base_mid_bid1/price_quote_mid_ask1:
        trade_size = min(size_base_quote_ask1,size_base_mid_bid1,size_quote_mid_ask1/price_base_quote_ask1)
        price_diff = price_quote_mid_ask1*(price_base_mid_bid1/price_quote_mid_ask1 - price_base_quote_ask1)
        profit = trade_size*price_diff
        print('++++++发现正套利机会 profit is {},price_diff is {},trade_size is {},P3: {} < P2/P1: {},time:{}\n\n'.format(
            profit, price_diff,trade_size, price_base_quote_ask1, price_base_mid_bid1/price_quote_mid_ask1, date_time))
        # 检查逆循环套利
        '''
            P3>P2/P1
            操作：卖-买/卖
            价格条件：base_quote_bid1买1 > base_mid_ask1卖1/quote_mid_bid1买1
            交易量Q3:三者中取最小下单量
            利润：Q3*P1*(P3-P2/P1)
        '''
    elif price_base_quote_bid1 > price_base_mid_ask1/price_quote_mid_bid1:
        trade_size = min(size_base_quote_bid1,size_base_mid_ask1,size_quote_mid_bid1/price_base_quote_bid1)
        price_diff = price_quote_mid_bid1*(price_base_quote_bid1-price_base_mid_ask1/price_quote_mid_bid1)
        profit = trade_size*price_diff
        print('++++++发现逆套利机会 profit is {},price_diff is {},trade_size is {},P3: {} > P2/P1: {},time:{}\n\n'.format(
            profit, price_diff, trade_size, price_base_quote_bid1, price_base_mid_ask1/price_quote_mid_bid1, date_time))
    else:
        print('在交易所{}没有找到三角套利机会,time:{}\n\n'.format(exchange.name,date_time))

if __name__ == '__main__':
    set_proxy()
    good_exchange_list = get_exchange_list(good_exchange_name)
    # 在good_coin作为base，quote=BTC,mid=USDT 在good_exchange_list交易所列表中寻找套利机会
    for symbol in good_coin:
        for exchange in good_exchange_list:
            find_trade_chance(exchange, symbol, default_quote_cur, default_mid_cur)


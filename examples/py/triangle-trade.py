import ccxt
import time
import os
"""
    三角套利demo2：寻找三角套利空间，包含下单模块
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

# delay 2 second
delay = 2
# 轮询订单次数query_times 3
query_times = 3

# good_exchange_name = ['binance', 'fcoin', 'gateio', 'huobipro', 'kucoin', 'okex']
# good_exchange_name = ['binance', 'fcoin', 'gateio', 'huobipro', 'kucoin', 'okex','bcex','bibox','bigone','bitfinex','bitforex',
#                       'bithumb','bitkk','cex','coinbase','coinex','cointiger','exx','gdax','gemini','hitbtc','rightbtc',
#                       'theocean','uex']
# good_coin = ['ETH', 'XRP', 'BCH', 'EOS', 'XLM', 'LTC', 'ADA', 'XMR', 'TRX', 'BNB', 'ONT', 'NEO', 'DCR']

good_exchange_name = ['uex']
good_coin = ['ETH', 'XRP', 'BCH', 'EOS', 'XLM', 'LTC', 'ADA', 'XMR', 'TRX', 'BNB', 'ONT', 'NEO', 'DCR', 'LBA', 'RATING']

has_config_exchange = ['uex']
config_key = dict()
config_key['okex'] = ['okex_key','okex_secret']
config_key['uex'] = ['uex_key','uex_secret']

# 交易相关常量
# 订单交易量吃单比例
order_ratio = 0.5
# 账户资金保留比例
reserve_ratio_base = 0.3
reserve_ratio_quote = 0.3
reserve_ratio_mid = 0.3

# 最小成交量比例设定
min_trade_unit = 0.2


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
        三角套利的基本思路是，用两个市场（比如BTC/USDT，LTC/USDT）的价格（分别记为P1，P2），
        计算出一个公允的LTC/BTC价格（P2/P1），如果该公允价格跟实际的LTC/BTC市场价格（记为P3）不一致，
        就产生了套利机会
        P3<P2/P1
        操作：买-卖/买
        价格条件提交：base_quote_ask1卖1 < base_mid_bid1买1/quote_mid_ask1卖1
        交易量Q3:三者中取最小下单量，单位要统一为P3交易对的个数
        利润：Q3*P1*(P2/P1-P3)
    '''
    balance = exchange.fetch_balance()
    free_base = balance[base]['free'] if balance[base]['free'] else 0
    free_quote = balance[quote]['free'] if balance[quote]['free'] else 0
    free_mid = balance[mid]['free'] if balance[mid]['free'] else 0
    if price_base_quote_ask1 < price_base_mid_bid1/price_quote_mid_ask1:
        # trade_size = min(size_base_quote_ask1,size_base_mid_bid1,size_quote_mid_ask1/price_base_quote_ask1)
        trade_size = get_buy_size(free_base, free_quote, free_mid, size_base_quote_ask1, size_quote_mid_ask1, 
                                  price_base_quote_ask1, price_quote_mid_ask1)
        price_diff = price_quote_mid_ask1*(price_base_mid_bid1/price_quote_mid_ask1 - price_base_quote_ask1)
        profit = trade_size*price_diff
        print('++++++发现正套利机会 profit is {},price_diff is {},trade_size is {},P3: {} < P2/P1: {},time:{}\n\n'.format(
            profit, price_diff,trade_size, price_base_quote_ask1, price_base_mid_bid1/price_quote_mid_ask1, date_time))
        # 开始正循环套利
        postive_trade(exchange,cur_base_quote,cur_base_mid,cur_quote_mid,trade_size,price_base_quote_ask1, price_base_mid_bid1, price_quote_mid_ask1)
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
        # 开始逆循环套利
        negative_trade()
    else:
        print('在交易所{}没有找到三角套利机会,time:{}\n\n'.format(exchange.name,date_time))


# 正循环套利
'''
    正循环套利
    正循环套利的顺序如下：
    先去LTC/BTC吃单买入LTC，卖出BTC，然后根据LTC/BTC的成交量，使用多线程，
    同时在LTC/USDT和BTC/USDT市场进行对冲。LTC/USDT市场吃单卖出LTC，BTC/USDT市场吃单买入BTC。
    P3<P2/P1
    base_quote<quote_mid/quote_mid
    操作：买-卖/买

'''


def postive_trade(exchange, base_quote, base_mid, quote_mid, trade_size, price_base_quote_ask1, price_base_mid_bid1, price_quote_mid_ask1):
    print('开始正向套利 postive_trade base_quote:{}, base_mid:{}, quote_mid:{}, trade_size:{}, '
          'price_base_quote_ask1:{}, price_base_mid_bid1:{}, price_quote_mid_ask1:{}'
          .format(base_quote, base_mid, quote_mid, trade_size, price_base_quote_ask1, price_base_mid_bid1, price_quote_mid_ask1))
    # 买入P3 base_quote
    result = exchange.create_order(base_quote, 'limit', 'buy', trade_size, price_base_quote_ask1)

    retry = 0
    already_hedged_amount = 0
    while retry <= query_times:
        if retry == query_times:
            # cancel order
            print('正向套利 postive_trade，达到轮询上限仍未完成交易，取消订单')
            exchange.cancel_order(result['id'], base_quote)
            break
        time.sleep(delay)
        # 延时delay后查询订单成交量
        order = exchange.fetch_order(result['id'], base_quote)
        filled = order['filled']
        amount = order['amount']
        already_hedged_amount = filled
        # 实际成交比例小于设定比例
        if filled/amount < min_trade_unit:
            retry += 1
            continue
        # 对冲卖P2 base_mid
        hedge_sell(exchange, base_mid, filled, price_base_mid_bid1)
        # 对冲买P1 quote_mid
        hedge_buy(exchange, quote_mid, filled, price_quote_mid_ask1)

        # 实际成交量完成目标，退出轮询
        if already_hedged_amount >= trade_size:
            print('正向套利 postive_trade 实际成交量完成目标，退出轮询')
            break
        else:
            retry += 1
    print('结束正向套利 postive_trade already_hedged_amount is {},trade_size is {}'.format(already_hedged_amount,trade_size))


# 对冲卖
def hedge_sell(exchange, symbol, sell_size, price):
    print('开始对冲卖 hedge_sell symbol:{},sell_size:{},price:{}'.format(symbol, sell_size, price))
    result = exchange.create_order(symbol, 'limit', 'sell', sell_size, price)
    time.sleep(delay/10)
    # 延时delay/10秒后查询订单成交量
    order = exchange.fetch_order(result['id'], symbol)
    filled = order['filled']
    remaining = order['remaining']
    # 未成交的市价交易
    if filled < sell_size:
        exchange.create_order(symbol, 'market', 'sell', remaining)
        print('对冲卖---- hedge_sell filled < sell_size 市价交易 symbol:{},filled:{},sell_size:{},remaining:{}'.format(symbol, filled, sell_size, remaining))


# 对冲买
def hedge_buy(exchange, symbol, buy_size, price):
    print('开始对冲买 hedge_buy symbol:{},buy_size:{},price:{}'.format(symbol, buy_size, price))
    result = exchange.create_order(symbol, 'limit', 'buy', buy_size, price)
    time.sleep(delay/10)
    # 延时delay/10秒后查询订单成交量
    order = exchange.fetch_order(result['id'], symbol)
    filled = order['filled']
    remaining = order['remaining']
    # 未成交的市价交易
    if filled < buy_size:
        exchange.create_order(symbol, 'market', 'buy', remaining)
        print('对冲买---- hedge_buy filled < sell_size 市价交易 symbol:{},filled:{},buy_size:{},remaining:{}'.format(symbol, filled, buy_size, remaining))


'''
        P3<P2/P1
        操作：买-卖/买
        base:LTC, quote:BTC, mid:USDT
        1.	LTC/BTC卖方盘口吃单数量：ltc_btc_sell1_quantity*order_ratio_ltc_btc，其中ltc_btc_sell1_quantity 代表LTC/BTC卖一档的数量，
            order_ratio_ltc_btc代表本策略在LTC/BTC盘口的吃单比例
        2.	LTC/USDT买方盘口吃单数量：ltc_cny_buy1_quantity*order_ratio_ltc_cny，其中order_ratio_ltc_cny代表本策略在LTC/USDT盘口的吃单比例
        3.	LTC/BTC账户中可以用来买LTC的BTC额度及可以置换的LTC个数：
            btc_available - btc_reserve，可以置换成
            (btc_available – btc_reserve)/ltc_btc_sell1_price个LTC
            其中，btc_available表示该账户中可用的BTC数量，btc_reserve表示该账户中应该最少预留的BTC数量
            （这个数值由用户根据自己的风险偏好来设置，越高代表用户风险偏好越低）。
        4.	BTC/USDT账户中可以用来买BTC的USDT额度及可以置换的BTC个数和对应的LTC个数：
            cny_available - cny_reserve, 可以置换成
            (cny_available-cny_reserve)/btc_cny_sell1_price个BTC，
            相当于
            (cny_available-cny_reserve)/btc_cny_sell1_price/ltc_btc_sell1_price
            个LTC
            其中：cny_available表示该账户中可用的人民币数量，cny_reserve表示该账户中应该最少预留的人民币数量
            （这个数值由用户根据自己的风险偏好来设置，越高代表用户风险偏好越低）。
        5.	LTC/USDT账户中可以用来卖的LTC额度：
            ltc_available – ltc_reserve
            其中，ltc_available表示该账户中可用的LTC数量，ltc_reserve表示该账户中应该最少预留的LTC数量
            （这个数值由用户根据自己的风险偏好来设置，越高代表用户风险偏好越低）。
'''


# 获取下单买入数量 需要跟账户可用余额结合起来，数量单位统一使用base(P3:LTC）来计算
def get_buy_size(free_base, free_quote, free_mid, size_base_quote_ask1, size_base_mid_bid1, price_base_quote_ask1, price_quote_mid_ask1):

    # 1. LTC/BTC卖方盘口吃单数量 P3
    base_quote_to_buy_size = size_base_quote_ask1 * order_ratio
    # 2. LTC/USDT买方盘口吃单数量 P2
    base_mid_to_sell_size = size_base_mid_bid1 * order_ratio
    # 3. LTC/BTC账户中可以用来买LTC的BTC额度及可以置换的LTC个数 P3
    base_quote_can_buy_size = free_quote*(1-reserve_ratio_quote)/price_base_quote_ask1
    # 4. BTC/USDT账户中可以用来买BTC的USDT额度及可以置换的BTC个数和对应的LTC个数 P1
    quote_mid_can_buy_size = free_mid*(1-reserve_ratio_mid)/price_quote_mid_ask1
    # 5. LTC/USDT账户中可以用来卖的LTC额度
    base_mid_can_sell_size = free_base*(1-reserve_ratio_base)
    return min(base_quote_to_buy_size, base_mid_to_sell_size, base_quote_can_buy_size, quote_mid_can_buy_size, 
               base_mid_can_sell_size)

'''
    逆循环套利
    逆循环套利的顺序如下：
    先去LTC/BTC吃单卖出LTC，买入BTC，然后根据LTC/BTC的成交量，使用多线程，
    同时在LTC/USDT和BTC/USDT市场进行对冲。
    LTC/USDT市场吃单买入LTC，BTC/USDT市场吃单卖出BTC。
    P3>P2/P1
    操作：卖-买/卖

'''


# TODO 逆循环套利
def negative_trade():
    pass


# TODO 获取下单卖出数量 需要跟账户可用余额结合起来
def get_sell_size():
    pass


if __name__ == '__main__':
    set_proxy()
    good_exchange_list = get_exchange_list(good_exchange_name)
    # 在good_coin作为base，quote=BTC,mid=USDT 在good_exchange_list交易所列表中寻找套利机会
    for symbol in good_coin:
        for exchange in good_exchange_list:
            find_trade_chance(exchange, symbol, default_quote_cur, default_mid_cur)


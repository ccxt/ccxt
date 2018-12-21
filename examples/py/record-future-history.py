import ccxt
import time
import datetime
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String,Float,DateTime
from sqlalchemy.orm import sessionmaker

#https://www.bitmex.com/api/explorer/#/Trade
#https://www.bitmex.com/app/contract/XBTUSD

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s',
                    datefmt='%a, %d %b %Y %H:%M:%S',
                    filename='./log.txt',
                    filemode='w')
logger = logging.getLogger(__name__)

engine1 = create_engine("")
# 创建会话
session = sessionmaker(engine)
mySession = session()

Base = declarative_base()


class History(Base):
    __tablename__='history'
    id = Column(Integer,primary_key=True,autoincrement=True)
    symbol = Column(String(255))
    timestamp = Column(Integer)
    time_cn = Column(DateTime)
    time_utc = Column(DateTime)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Float)
    time_frame = Column(String)
    gmt_create = Column(DateTime)


exchange_name = 'bitmex'
exchange = getattr(ccxt,exchange_name)()
exchange.load_markets()
rateLimit = exchange.rateLimit
# timeframes: daily, weekly, monthly, quarterly, and biquarterly
# 1m,1h,1d,
timeframe = '1m'
limit = 2
# limit * 60 second
time_interval = limit*60

symbols = exchange.symbols
print('symbols : {}'.format(symbols))
xbt_symbols = ['BTC/USD']
# xbt_symbols.append('BTC/USD')

for symbol in symbols:
    if(symbol.startswith('XBT') & ("_" not in symbol)):
        xbt_symbols.append(symbol)
print('xbt_symbols :{}'.format(xbt_symbols))

while True:

    try:
        for symbol in xbt_symbols:
            # 1min
            since = exchange.milliseconds() - limit * 60 * 1000
            # timeframes: daily, weekly, monthly, quarterly, and biquarterly
            #本地环境需要limit*2，否则条数不够
            candles = exchange.fetch_ohlcv(symbol,timeframe,since,limit*2)
            #服务器不用limit*2
            # candles = exchange.fetch_ohlcv(symbol,timeframe,since,limit)
            # exchange.get_trade(symbol)
            for candle in candles:
                print('symbol {} timestamp {} gmt+8 {} utctime {} open {} high {} low {} close {} volume {}'.format(symbol,candle[0],datetime.datetime.fromtimestamp(candle[0]/1000),exchange.ymdhms(candle[0]),
                                                                                                                    candle[1],candle[2],candle[3],candle[4],candle[5]))
                logger.info('symbol {} timestamp {} gmt+8 {} utctime {} open {} high {} low {} close {} volume {}'.format(symbol,candle[0],datetime.datetime.fromtimestamp(candle[0]/1000),exchange.ymdhms(candle[0]),
                                                                                                   candle[1],candle[2],candle[3],candle[4],candle[5]))
                open = candle[1]
                high = candle[2]
                low = candle[3]
                close = candle[4]
                volume = candle[5]
                timestamp = candle[0]
                time_cn = datetime.datetime.fromtimestamp(candle[0]/1000)
                time_utc = exchange.ymdhms(candle[0])
                gmt_create = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                history = History(symbol=symbol,timestamp=timestamp,time_cn=time_cn,time_utc=time_utc,open=open,high=high,low=low,close=close,volume=volume,time_frame=timeframe,gmt_create=gmt_create)
                # history = History(symbol=symbol,open=open,high=high,low=low,close=close,volume=volume,time_frame=timeframe)
                # print('history is {}'.format(history))
                # logging.info('history is {}'.format(history))
                mySession.add(history)
                mySession.commit()
            print('\n')
            logger.info('\n')
        time.sleep(time_interval)
        # time.sleep(10)
    except (ccxt.ExchangeError, ccxt.AuthenticationError, ccxt.ExchangeNotAvailable, ccxt.RequestTimeout) as error:

        print('Got an error', type(error).__name__, error.args, ', retrying in', time_interval, 'seconds...')
        logger.error('Got an error', type(error).__name__, error.args, ', retrying in', time_interval, 'seconds...')
        time.sleep(time_interval)
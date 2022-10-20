 try:
    # logger.debug("before fetch_ohlc : " + str(sarAge) )
    data = exchange.fetch_ohlcv(
        coin_pair, timeframe, limit=settings.limit_cycle
    # logger.debug("after fetch_ohlc : " + str(sarAge) )
        except:
            logger.debug("fetch_ohlcv error")
            # traceback.print_exception(*sys.exc_info())
            return False,0
        # update timestamp to human readable timestamp
        data = [[excha.iso8601(candle[0])] + candle[1:] for candle in data]
       
        header = ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume']
        historical_data = pd.DataFrame(data, columns=header)

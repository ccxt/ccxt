# frozen_string_literal: true

require 'ccxt'

def style(s, style)
  return style + s + "\033[0m"
end

def green(s)
  return style(s, "\033[92m")
end

def blue(s)
  return style(s, "\033[94m")
end

def yellow(s)
  return style(s, "\033[93m")
end

def red(s)
  return style(s, "\033[91m")
end

def pink(s)
  return style(s, "\033[95m")
end

def bold(s)
  return style(s, "\033[1m")
end

def underline(s)
  return style(s, "\033[4m")
end

bitmex = Ccxt.bitmex()

# params:
symbol = 'BTC/USD'
timeframe = '1m'
limit = 100
params = {'partial' => false}  # ←--------  no reversal

while true
  # pay attention to since with respect to limit if you're doing it in a loop
  since = bitmex.class.milliseconds - limit * 60 * 1000

  candles = bitmex.fetch_ohlcv(symbol, timeframe, since, limit, params)
  num_candles = candles.count
  
  printf( '%s: O:%s H:%s L:%s C:%s', 
    bitmex.class.iso8601(candles[num_candles - 1][0]),
    
    candles[num_candles - 1][1],
    candles[num_candles - 1][2],
    candles[num_candles - 1][3],
    candles[num_candles - 1][4]
  )
  
  # * 5 to make distinct delay and to avoid too much load
  # / 1000 to convert milliseconds to fractional seconds
  sleep(bitmex.rateLimit * 5 / 1000)
end
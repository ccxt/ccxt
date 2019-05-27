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

def print_supported_exchanges
  puts 'Supported exchanges: ' + green(Ccxt.exchanges.join(', '))
end

def dump(*args)
  puts args.collect{ |arg| arg.to_s }.join(' ')
end

def print_usage
  dump("Usage: ruby #{$0}", green('id'), yellow('[symbol]'))
  dump("Symbol is optiona, for example:")
  dump("ruby " + $0, green('kraken'))
  dump("ruby " + $0, green('gdax'), yellow('BTC/USD'))
  print_supported_exchanges()
end

def print_ticker(exchange, symbol)
  ticker = exchange.fetch_ticker(symbol.upcase)
  puts ticker
  dump(
    green(exchange.id),
    yellow(symbol),
    'ticker',
    ticker['datetime'],
    'high: ' + ticker['high'].to_s,
    'low: ' + ticker['low'].to_s,
    'bid: ' + ticker['bid'].to_s,
    'ask: ' + ticker['ask'].to_s,
    'volume: ' + ticker['quoteVolume'].to_s
  )
end
  
begin

  id = ARGV[0]  # get exchange id from command line arguments

  unless id.nil?
    # check if the exchange is supported by ccxt
    if Ccxt.exchanges.include?(id)

      dump('Instantiating', green(id), 'exchange')

      # instantiate the exchange by id
      exchange = Ccxt[id].new

      # load all markets from the exchange
      markets = exchange.load_markets()

      # output a list of all market symbols
      dump(green(id), 'has', exchange.symbols.count, 'symbols.')

      begin
        if ARGV.size > 1
          symbol = ARGV[1]
          print_ticker exchange, symbol
        
        else
        
          delay = exchange.rateLimit / 1000 # delay in between requests
          exchange.symbols.each do |symbol|
            puts "SYMBOL: #{symbol}"
            # suffix '.d' means 'darkpool' on some exchanges
            unless symbol.include?('.d')

              # sleep to remain under the rateLimit
              puts "Sleeping for #{delay} seconds."
              sleep(delay)
 
              # fetch and print ticker
              print_ticker(exchange, symbol)
            end
          end
        end
      rescue Ccxt::DDoSProtection => e
        dump( 'DDoS Protection (ignoring)' ) 
      rescue Ccxt::RequestTimeout => e
        dump ('Request Timeout (ignoring)')
      rescue Ccxt::ExchangeNotAvailable => e
        dump ('Exchange Not Available due to downtime or maintenance (ignoring)')
      rescue Ccxt::AuthenticationError => e
        dump ('Authentication Error (missing API keys, ignoring)')
      rescue StandardError => e
        dump (e.message)
        dump (e.backtrace)
      end    
    else 
      dump('Exchange ' + red(id) + ' not found')
      print_supported_exchanges
    end
  else
    print_usage
  end  
rescue StandardError => e
  dump(e.message)
  print_usage
end

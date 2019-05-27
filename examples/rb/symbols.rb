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
  dump("Usage: ruby #{$0}", green('id'))
  print_supported_exchanges()
end

begin

  id = ARGV[0]  # get exchange id from command line arguments

  unless id.nil?
    # check if the exchange is supported by ccxt
    if Ccxt.exchanges.include?(id)

      dump('Instantiating', green(id), 'exchange')

      # instantiate the exchange by id
      exchange = Ccxt[id]

      # load all markets from the exchange
      markets = exchange.load_markets()

      # output a list of all market symbols
      dump(green(id), 'has', exchange.symbols.count)

      # debug
      # Exchange.keysort(markets).each do |k,v|
      #   puts v
      # end
    
      # output a table of all markets
      dump(pink( sprintf('%15s %15s %15s %15s', 'id', 'symbol', 'base', 'quote')))

      Ccxt::Exchange.keysort(markets).each do |k, v|      
        dump( sprintf('%15s %15s %15s %15s', v['id'], v['symbol'], v['base'], v['quote']))
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

require 'ccxt'

def style(s, style)
  return style + s.to_s + "\033[0m"
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
  dump("Usage: ruby #{$0}", green('id1'), yellow('id2'), blue('id3'), '...')
  print_supported_exchanges()
end

proxies = [
    '',  # no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
]

if !ARGV.empty?
  exchanges = {}
  ids = ARGV

  ids.each do |id|
    exchange = Ccxt[id].new
    exchanges[id] = exchange

    # load all markets from the exchange
    markets = exchange.load_markets()

    exchange.load_markets()
    dump(green(id), 'loaded', green(exchange.symbols.count), 'markets')
  end
  
  dump(green('Loaded all markets'))

  # allSymbols = [symbol for id in ids for symbol in exchanges[id].symbols]
  allSymbols = exchanges.collect{ |k,v| v.symbols }.flatten
  
  # get all unique symbols
  uniqueSymbols = allSymbols.sort.uniq

  # filter out symbols that are not present on at least two exchanges
  arbitrableSymbols = uniqueSymbols.select{|symbol| allSymbols.count(symbol) > 1}

  dump(green("There are #{arbitrableSymbols.count.to_s} symbols."))

  # print a table of arbitrable symbols
  table = []
  dump(green(' symbol          |' + ids.collect{ |id| " %15s |" % id }.join('')))
  dump(green('-----------------+' * (ids.count + 1)))

  arbitrableSymbols.each do |symbol|
    string = " %15s |" % symbol
    ids.each do |id|        
      # if a symbol is present on a exchange print that exchange's id in the row
      string += " %15s |" % ( exchanges[id].symbols.include?(symbol) ? id : '' )
    end
    dump(string)
  end
else
  print_usage
end

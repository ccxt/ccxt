module Ccxt
include("CCXTBase.jl")
include("BaseMethods.jl")
include("exchanges.jl")
export Exchange, Binance, Kraken
end

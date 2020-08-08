# Change Initial Leverage (TRADE)
# Example - Set Leverage of 40 for symbol 'ADAUSDT'
# Assumes you know how to set exchange object

symbol = 'ADAUSDT'
leverage =  40
lev = exchange.fapiPrivate_post_leverage({
    'symbol': symbol,
    'leverage': leverage
})

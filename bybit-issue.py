# success{
# 	"symbol": "ETHUSD",
# 	"side": "Sell",
# 	"order_type": "Limit",
# 	"time_in_force": "GoodTillCancel",
# 	"qty": 1,
# 	"price": 1327.2,
# 	"trigger_by": "LastPrice",
# 	"stop_px": 1327.2,
# 	"base_price": "1328.22",
# 	"reduce_only": true,
# 	"api_key": "kmtaoTzMeaQMBEURYt",
# 	"recv_window": 5000,
# 	"timestamp": "1664220330896",
# 	"sign": "e620141955a42325a5af9767d4b3e4337eb716094eb1047a3d32441ede15929e"
# }
## success
# {
# 	"symbol": "ETHUSD",
# 	"side": "Sell",
# 	"order_type": "Limit",
# 	"time_in_force": "GoodTillCancel",
# 	"qty": 1,
# 	"price": 1331.6,
# 	"trigger_by": "LastPrice",
# 	"stop_px": 1331.6,
# 	"base_price": "1332.60011039",
# 	"reduce_only": true,
# 	"api_key": "kmtaoTzMeaQMBEURYt",
# 	"recv_window": 5000,
# 	"timestamp": "1664220767889",
# 	"sign": "2d6036e99b7a239c9948ea994e50753ff9d6dc92dc8ef5c3712a3f3c96997c3d"
# }
#error

import ccxt
symbol = 'ETHUSD'
pos_size = 1
params = {"type":"swap","code":"ETH"}
long = True

bybit = ccxt.bybit({
  "apiKey": "kmtaoTzMeaQMBEURYt",
  "secret": "qNZv5h32QuKgBy1TQE1dY09oxOk2et845vbx"
})
bybit.verbose = True
bybit_pos = bybit.fetch_positions([symbol], params=params)
bybit_pos = bybit_pos[0]['info']
entryprice = float(bybit_pos['entry_price'])
stop_price = entryprice 

paramslong={'basePrice': stop_price+1, 
              'stop_px': stop_price-1,
              'reduce_only': True
              }   

paramsshort={'basePrice': stop_price-1,
              'stop_px': stop_price+1,
              'reduce_only': True}
if long == False:
    bybit.create_stop_limit_order(symbol, side='buy', amount=pos_size, price=stop_price, stopPrice=stop_price, params=paramsshort)
elif long == True:
    bybit.create_stop_limit_order(symbol, side='sell', amount=pos_size, price=stop_price, stopPrice=stop_price, params=paramslong)
else:
    print('+++++++++ SOMETHING I DIDNT EXCPECT HAPPENS')    

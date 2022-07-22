import ccxt

exchange = ccxt.blockchaincom({
    'secret': 'YOUR_SECRET_KEY',
    'timeout': 30000,
})

symbol = 'BTC/USDT'
type = 'limit' #or 'market', or 'Stop' or 'StopLimit'
side = 'buy'
amount = 0.01
price = 2000

withdrawal_beneficiary = 'BENEFICIARY'

fees = exchange.fetch_trading_fees()
print(fees)

print("\n")

mytrades = exchange.fetch_my_trades(symbol)
print(mytrades)

print("\n")

deposits = exchange.fetch_deposits()
print(deposits)

print("\n")

balance = exchange.fetch_balance()
print(balance)

print("\n")

withdrawals = exchange.fetch_withdrawals()
print(withdrawals)

print("\n")

address = exchange.fetch_deposit_address("XLM")
print(address)

print("\n")

new_order = exchange.create_order(symbol, type, side, amount, price)
print(new_order)

print("\n")

open_orders = exchange.fetch_open_orders()
print(open_orders)

print("\n")

cancel_order = exchange.cancel_order(new_order['id'])
print(cancel_order)

print("\n")

closed_orders = exchange.fetch_closed_orders()
print(closed_orders)

print("\n")

orders_by_state = exchange.fetch_orders_by_state("CANCELED")
print(orders_by_state)

print("\n")

white_list = exchange.fetch_withdrawal_whitelist()
print(white_list)

print("\n")

white_list_by_currency = exchange.fetch_withdrawal_whitelist_by_currency('BTC')
print(white_list_by_currency)

print("\n")

canceledOrders = exchange.cancel_orders(None)
print(canceledOrders)

print("\n")

params = { 'beneficiary': withdrawal_beneficiary }
btcWithdraw = exchange.withdraw("BTC", amount, None, None, params)
print(btcWithdraw)
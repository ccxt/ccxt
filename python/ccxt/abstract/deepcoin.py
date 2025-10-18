from ccxt.base.types import Entry


class ImplicitAPI:
    v1_private_post_deepcoin_trade_cancel_order = v1PrivatePostDeepcoinTradeCancelOrder = Entry('deepcoin/trade/cancel-order', ['v1', 'private'], 'POST', {})
    v1_private_post_deepcoin_trade_order = v1PrivatePostDeepcoinTradeOrder = Entry('deepcoin/trade/order', ['v1', 'private'], 'POST', {})
    v1_private_get_deepcoin_trade_orders_pending = v1PrivateGetDeepcoinTradeOrdersPending = Entry('deepcoin/trade/orders-pending', ['v1', 'private'], 'GET', {})
    v1_private_get_deepcoin_trade_orders_history = v1PrivateGetDeepcoinTradeOrdersHistory = Entry('deepcoin/trade/orders-history', ['v1', 'private'], 'GET', {})
    v1_private_get_deepcoin_trade_order = v1PrivateGetDeepcoinTradeOrder = Entry('deepcoin/trade/order', ['v1', 'private'], 'GET', {})
    v1_private_get_deepcoin_trade_fills = v1PrivateGetDeepcoinTradeFills = Entry('deepcoin/trade/fills', ['v1', 'private'], 'GET', {})
    v1_private_get_deepcoin_account_balances = v1PrivateGetDeepcoinAccountBalances = Entry('deepcoin/account/balances', ['v1', 'private'], 'GET', {})
    v1_public_get_deepcoin_market_instruments = v1PublicGetDeepcoinMarketInstruments = Entry('deepcoin/market/instruments', ['v1', 'public'], 'GET', {})
    v1_public_get_deepcoin_market_tickers = v1PublicGetDeepcoinMarketTickers = Entry('deepcoin/market/tickers', ['v1', 'public'], 'GET', {})
    v1_public_get_deepcoin_market_books = v1PublicGetDeepcoinMarketBooks = Entry('deepcoin/market/books', ['v1', 'public'], 'GET', {})
    v1_public_get_deepcoin_market_candles = v1PublicGetDeepcoinMarketCandles = Entry('deepcoin/market/candles', ['v1', 'public'], 'GET', {})

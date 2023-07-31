from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_ticker = publicGetTicker = Entry('ticker', 'public', 'GET', {})
    public_get_ticker_hour = publicGetTickerHour = Entry('ticker_hour', 'public', 'GET', {})
    public_get_order_book = publicGetOrderBook = Entry('order_book', 'public', 'GET', {})
    public_get_transactions = publicGetTransactions = Entry('transactions', 'public', 'GET', {})
    public_get_eur_usd = publicGetEurUsd = Entry('eur_usd', 'public', 'GET', {})
    private_post_balance = privatePostBalance = Entry('balance', 'private', 'POST', {})
    private_post_user_transactions = privatePostUserTransactions = Entry('user_transactions', 'private', 'POST', {})
    private_post_open_orders = privatePostOpenOrders = Entry('open_orders', 'private', 'POST', {})
    private_post_order_status = privatePostOrderStatus = Entry('order_status', 'private', 'POST', {})
    private_post_cancel_order = privatePostCancelOrder = Entry('cancel_order', 'private', 'POST', {})
    private_post_cancel_all_orders = privatePostCancelAllOrders = Entry('cancel_all_orders', 'private', 'POST', {})
    private_post_buy = privatePostBuy = Entry('buy', 'private', 'POST', {})
    private_post_sell = privatePostSell = Entry('sell', 'private', 'POST', {})
    private_post_bitcoin_deposit_address = privatePostBitcoinDepositAddress = Entry('bitcoin_deposit_address', 'private', 'POST', {})
    private_post_unconfirmed_btc = privatePostUnconfirmedBtc = Entry('unconfirmed_btc', 'private', 'POST', {})
    private_post_ripple_withdrawal = privatePostRippleWithdrawal = Entry('ripple_withdrawal', 'private', 'POST', {})
    private_post_ripple_address = privatePostRippleAddress = Entry('ripple_address', 'private', 'POST', {})
    private_post_withdrawal_requests = privatePostWithdrawalRequests = Entry('withdrawal_requests', 'private', 'POST', {})
    private_post_bitcoin_withdrawal = privatePostBitcoinWithdrawal = Entry('bitcoin_withdrawal', 'private', 'POST', {})

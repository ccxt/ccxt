from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_markets = publicGetMarkets = Entry('markets', 'public', 'GET', {})
    public_get_markets_market = publicGetMarketsMarket = Entry('markets/{market}', 'public', 'GET', {})
    public_get_markets_market_orders = publicGetMarketsMarketOrders = Entry('markets/{market}/orders', 'public', 'GET', {})
    public_get_markets_market_trades = publicGetMarketsMarketTrades = Entry('markets/{market}/trades', 'public', 'GET', {})
    private_get_user_accounts = privateGetUserAccounts = Entry('user/accounts', 'private', 'GET', {})
    private_get_user_orders = privateGetUserOrders = Entry('user/orders', 'private', 'GET', {})
    private_get_user_orders_id = privateGetUserOrdersId = Entry('user/orders/{id}', 'private', 'GET', {})
    private_get_user_orders_id_trades = privateGetUserOrdersIdTrades = Entry('user/orders/{id}/trades', 'private', 'GET', {})
    private_get_user_trades = privateGetUserTrades = Entry('user/trades', 'private', 'GET', {})
    private_get_user_fees = privateGetUserFees = Entry('user/fees', 'private', 'GET', {})
    private_get_account_withdrawals_id = privateGetAccountWithdrawalsId = Entry('account/withdrawals/{id}', 'private', 'GET', {})
    private_get_account_withdrawals = privateGetAccountWithdrawals = Entry('account/withdrawals', 'private', 'GET', {})
    private_get_account_deposit_id = privateGetAccountDepositId = Entry('account/deposit/{id}', 'private', 'GET', {})
    private_get_account_deposits = privateGetAccountDeposits = Entry('account/deposits', 'private', 'GET', {})
    private_get_account_deposit_address = privateGetAccountDepositAddress = Entry('account/deposit_address', 'private', 'GET', {})
    private_post_user_orders = privatePostUserOrders = Entry('user/orders', 'private', 'POST', {})
    private_post_account_withdraw = privatePostAccountWithdraw = Entry('account/withdraw', 'private', 'POST', {})
    private_delete_user_orders_id = privateDeleteUserOrdersId = Entry('user/orders/{id}', 'private', 'DELETE', {})
    private_delete_account_withdrawals_id = privateDeleteAccountWithdrawalsId = Entry('account/withdrawals/{id}', 'private', 'DELETE', {})

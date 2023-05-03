from ccxt.base.types import Entry


class ImplicitAPI:
    markets_get_assets_public_beta = marketsGetAssetsPublicBeta = Entry('assets/public/beta', 'markets', 'GET', {})
    private_get_account = privateGetAccount = Entry('account', 'private', 'GET', {})
    private_get_orders = privateGetOrders = Entry('orders', 'private', 'GET', {})
    private_get_orders_order_id = privateGetOrdersOrderId = Entry('orders/{order_id}', 'private', 'GET', {})
    private_get_positions = privateGetPositions = Entry('positions', 'private', 'GET', {})
    private_get_positions_symbol = privateGetPositionsSymbol = Entry('positions/{symbol}', 'private', 'GET', {})
    private_get_account_activities_activity_type = privateGetAccountActivitiesActivityType = Entry('account/activities/{activity_type}', 'private', 'GET', {})
    private_post_orders = privatePostOrders = Entry('orders', 'private', 'POST', {})
    private_delete_orders = privateDeleteOrders = Entry('orders', 'private', 'DELETE', {})
    private_delete_orders_order_id = privateDeleteOrdersOrderId = Entry('orders/{order_id}', 'private', 'DELETE', {})
    cryptopublic_get_crypto_latest_orderbooks = cryptoPublicGetCryptoLatestOrderbooks = Entry('crypto/latest/orderbooks', 'cryptoPublic', 'GET', {})
    cryptopublic_get_crypto_trades = cryptoPublicGetCryptoTrades = Entry('crypto/trades', 'cryptoPublic', 'GET', {})
    cryptopublic_get_crypto_quotes = cryptoPublicGetCryptoQuotes = Entry('crypto/quotes', 'cryptoPublic', 'GET', {})
    cryptopublic_get_crypto_latest_quotes = cryptoPublicGetCryptoLatestQuotes = Entry('crypto/latest/quotes', 'cryptoPublic', 'GET', {})
    cryptopublic_get_crypto_bars = cryptoPublicGetCryptoBars = Entry('crypto/bars', 'cryptoPublic', 'GET', {})
    cryptopublic_get_crypto_snapshots = cryptoPublicGetCryptoSnapshots = Entry('crypto/snapshots', 'cryptoPublic', 'GET', {})

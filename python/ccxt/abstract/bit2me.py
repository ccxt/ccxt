from ccxt.base.types import Entry
_List = list[object]
_Dict = dict[str, object]


class ImplicitAPI:
    public_get_v2_trading_market_config = publicGetV2TradingMarketConfig = Entry[_List]('v2/trading/market-config', ['public'], 'GET', {'cost': 1})
    public_get_v2_trading_tickers = publicGetV2TradingTickers = Entry[_List]('v2/trading/tickers', ['public'], 'GET', {'cost': 1})
    public_get_v2_trading_order_book = publicGetV2TradingOrderBook = Entry[_Dict]('v2/trading/order-book', ['public'], 'GET', {'cost': 1})
    public_get_v1_trading_candle = publicGetV1TradingCandle = Entry[_List]('v1/trading/candle', ['public'], 'GET', {'cost': 1})
    public_get_v1_trading_trade_last = publicGetV1TradingTradeLast = Entry[_List]('v1/trading/trade/last', ['public'], 'GET', {'cost': 1})
    public_get_v2_currency_assets = publicGetV2CurrencyAssets = Entry[_Dict]('v2/currency/assets', ['public'], 'GET', {'cost': 1})
    public_get_v2_currency_assets_symbol = publicGetV2CurrencyAssetsSymbol = Entry[_Dict]('v2/currency/assets/{symbol}', ['public'], 'GET', {'cost': 1})
    public_get_v1_wallet_settings_assets = publicGetV1WalletSettingsAssets = Entry[_List]('v1/wallet/settings/assets', ['public'], 'GET', {'cost': 1})
    private_get_v1_trading_order = privateGetV1TradingOrder = Entry[_List]('v1/trading/order', ['private'], 'GET', {'cost': 1})
    private_get_v1_trading_order_id = privateGetV1TradingOrderId = Entry[_Dict]('v1/trading/order/{id}', ['private'], 'GET', {'cost': 1})
    private_get_v1_trading_order_id_trades = privateGetV1TradingOrderIdTrades = Entry[_List]('v1/trading/order/{id}/trades', ['private'], 'GET', {'cost': 1})
    private_get_v1_trading_trade = privateGetV1TradingTrade = Entry[_Dict]('v1/trading/trade', ['private'], 'GET', {'cost': 1})
    private_get_v1_trading_wallet_balance = privateGetV1TradingWalletBalance = Entry[_List]('v1/trading/wallet/balance', ['private'], 'GET', {'cost': 1})
    private_get_v1_trading_working_capital = privateGetV1TradingWorkingCapital = Entry[_List]('v1/trading/working-capital', ['private'], 'GET', {'cost': 1})
    private_get_v1_trading_movement = privateGetV1TradingMovement = Entry[_List]('v1/trading/movement', ['private'], 'GET', {'cost': 1})
    private_post_v1_trading_order = privatePostV1TradingOrder = Entry[_Dict | _List]('v1/trading/order', ['private'], 'POST', {'cost': 1})
    private_post_v1_trading_wallet_deposit = privatePostV1TradingWalletDeposit = Entry[_Dict]('v1/trading/wallet/deposit', ['private'], 'POST', {'cost': 1})
    private_post_v1_trading_wallet_withdraw = privatePostV1TradingWalletWithdraw = Entry[_Dict]('v1/trading/wallet/withdraw', ['private'], 'POST', {'cost': 1})
    private_post_v1_signin_apikey = privatePostV1SigninApikey = Entry[_Dict]('v1/signin/apikey', ['private'], 'POST', {'cost': 1})
    private_delete_v1_trading_order_id = privateDeleteV1TradingOrderId = Entry[_Dict]('v1/trading/order/{id}', ['private'], 'DELETE', {'cost': 1})

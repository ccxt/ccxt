from ccxt.base.types import Entry
_Dict = dict[str, object]
_List = list[object]


class ImplicitAPI:
    opinion_public_get_market = opinionPublicGetMarket = Entry[_Dict | _List]('market', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_market_marketid = opinionPublicGetMarketMarketId = Entry[_Dict | _List]('market/{marketId}', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_market_categorical_marketid = opinionPublicGetMarketCategoricalMarketId = Entry[_Dict | _List]('market/categorical/{marketId}', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_market_slug_slug = opinionPublicGetMarketSlugSlug = Entry[_Dict | _List]('market/slug/{slug}', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_label = opinionPublicGetLabel = Entry[_Dict | _List]('label', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_token_latest_price = opinionPublicGetTokenLatestPrice = Entry[_Dict | _List]('token/latest-price', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_token_orderbook = opinionPublicGetTokenOrderbook = Entry[_Dict | _List]('token/orderbook', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_token_price_history = opinionPublicGetTokenPriceHistory = Entry[_Dict | _List]('token/price-history', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_public_get_quotetoken = opinionPublicGetQuoteToken = Entry[_Dict | _List]('quoteToken', ['opinion', 'public'], 'GET', {'cost': 1})
    opinion_private_get_order = opinionPrivateGetOrder = Entry[_Dict | _List]('order', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_get_order_orderid = opinionPrivateGetOrderOrderId = Entry[_Dict | _List]('order/{orderId}', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_get_positions_user_walletaddress = opinionPrivateGetPositionsUserWalletAddress = Entry[_Dict | _List]('positions/user/{walletAddress}', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_get_trade_user_walletaddress = opinionPrivateGetTradeUserWalletAddress = Entry[_Dict | _List]('trade/user/{walletAddress}', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_get_auth_api_key = opinionPrivateGetAuthApiKey = Entry[_Dict | _List]('auth/api-key', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_get_user_auth = opinionPrivateGetUserAuth = Entry[_Dict | _List]('user/auth', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_get_user_balance = opinionPrivateGetUserBalance = Entry[_Dict | _List]('user/balance', ['opinion', 'private'], 'GET', {'cost': 1})
    opinion_private_post_auth_api_key = opinionPrivatePostAuthApiKey = Entry[_Dict | _List]('auth/api-key', ['opinion', 'private'], 'POST', {'cost': 1})
    opinion_private_post_order = opinionPrivatePostOrder = Entry[_Dict | _List]('order', ['opinion', 'private'], 'POST', {'cost': 1})
    opinion_private_post_order_cancel = opinionPrivatePostOrderCancel = Entry[_Dict | _List]('order/cancel', ['opinion', 'private'], 'POST', {'cost': 1})
    opinion_private_delete_auth_api_key = opinionPrivateDeleteAuthApiKey = Entry[_Dict | _List]('auth/api-key', ['opinion', 'private'], 'DELETE', {'cost': 1})

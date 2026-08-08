from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_Dict = Dict[str, PythonAny]
_List = List[PythonAny]

class ImplicitAPI:
    myriad_public_get_questions = myriadPublicGetQuestions = Entry[_Dict]('questions', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_questions_id = myriadPublicGetQuestionsId = Entry[_Dict]('questions/{id}', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets = myriadPublicGetMarkets = Entry[_Dict]('markets', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_id = myriadPublicGetMarketsId = Entry[_Dict]('markets/{id}', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_networkid_id = myriadPublicGetMarketsNetworkIdId = Entry[_Dict]('markets/{networkId}/{id}', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_id_events = myriadPublicGetMarketsIdEvents = Entry[_Dict]('markets/{id}/events', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_id_orderbook = myriadPublicGetMarketsIdOrderbook = Entry[_Dict]('markets/{id}/orderbook', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_id_trades = myriadPublicGetMarketsIdTrades = Entry[_List]('markets/{id}/trades', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_id_holders = myriadPublicGetMarketsIdHolders = Entry[_Dict]('markets/{id}/holders', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_markets_id_referrals = myriadPublicGetMarketsIdReferrals = Entry[_Dict]('markets/{id}/referrals', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_events = myriadPublicGetEvents = Entry[_Dict]('events', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_orders = myriadPublicGetOrders = Entry[_Dict]('orders', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_orders_hash = myriadPublicGetOrdersHash = Entry[_Dict]('orders/{hash}', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_users_address_events = myriadPublicGetUsersAddressEvents = Entry[_Dict]('users/{address}/events', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_users_address_referrals = myriadPublicGetUsersAddressReferrals = Entry[_Dict]('users/{address}/referrals', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_users_address_portfolio = myriadPublicGetUsersAddressPortfolio = Entry[_Dict]('users/{address}/portfolio', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_users_address_markets = myriadPublicGetUsersAddressMarkets = Entry[_Dict]('users/{address}/markets', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_tags = myriadPublicGetTags = Entry[_Dict]('tags', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_get_topics = myriadPublicGetTopics = Entry[_Dict]('topics', ['myriad', 'public'], 'GET', {'cost': 1})
    myriad_public_post_markets_quote = myriadPublicPostMarketsQuote = Entry[_Dict]('markets/quote', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_markets_claim = myriadPublicPostMarketsClaim = Entry[_Dict]('markets/claim', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_orders = myriadPublicPostOrders = Entry[_Dict]('orders', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_orders_cancel_batch = myriadPublicPostOrdersCancelBatch = Entry[_Dict]('orders/cancel-batch', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_orders_cancel_all = myriadPublicPostOrdersCancelAll = Entry[_Dict]('orders/cancel-all', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_positions_split = myriadPublicPostPositionsSplit = Entry[_Dict]('positions/split', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_positions_merge = myriadPublicPostPositionsMerge = Entry[_Dict]('positions/merge', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_positions_redeem = myriadPublicPostPositionsRedeem = Entry[_Dict]('positions/redeem', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_positions_redeem_voided = myriadPublicPostPositionsRedeemVoided = Entry[_Dict]('positions/redeem-voided', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_positions_neg_risk_split = myriadPublicPostPositionsNegRiskSplit = Entry[_Dict]('positions/neg-risk/split', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_post_positions_neg_risk_merge = myriadPublicPostPositionsNegRiskMerge = Entry[_Dict]('positions/neg-risk/merge', ['myriad', 'public'], 'POST', {'cost': 1})
    myriad_public_delete_orders_hash = myriadPublicDeleteOrdersHash = Entry[_Dict]('orders/{hash}', ['myriad', 'public'], 'DELETE', {'cost': 1})
    myriad_private_post_markets_quote_with_fee = myriadPrivatePostMarketsQuoteWithFee = Entry[_Dict]('markets/quote_with_fee', ['myriad', 'private'], 'POST', {'cost': 1})

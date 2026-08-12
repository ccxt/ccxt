from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_List = List[PythonAny]
_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_countries = publicGetCountries = Entry[_List]('countries', 'public', 'GET', {'cost': 1})
    public_get_currencies = publicGetCurrencies = Entry[_List]('currencies', 'public', 'GET', {'cost': 1})
    public_get_data_currency_ticker = publicGetDataCurrencyTicker = Entry[_Dict]('data/{currency}/ticker', 'public', 'GET', {'cost': 1})
    public_get_data_currency_trades = publicGetDataCurrencyTrades = Entry[_List]('data/{currency}/trades', 'public', 'GET', {'cost': 1})
    public_get_data_currency_depth = publicGetDataCurrencyDepth = Entry[_Dict]('data/{currency}/depth', 'public', 'GET', {'cost': 1})
    public_get_bitcoin_charts_id_trades = publicGetBitcoinChartsIdTrades = Entry[_List]('bitcoin_charts/{id}/trades', 'public', 'GET', {'cost': 1})
    public_get_bitcoin_charts_id_depth = publicGetBitcoinChartsIdDepth = Entry[_Dict]('bitcoin_charts/{id}/depth', 'public', 'GET', {'cost': 1})
    private_get_user = privateGetUser = Entry[_Dict]('user', 'private', 'GET', {'cost': 1})
    private_get_user_addresses = privateGetUserAddresses = Entry[_List]('user/addresses', 'private', 'GET', {'cost': 1})
    private_get_user_addresses_address = privateGetUserAddressesAddress = Entry[_Dict]('user/addresses/{address}', 'private', 'GET', {'cost': 1})
    private_get_user_orders = privateGetUserOrders = Entry[_List]('user/orders', 'private', 'GET', {'cost': 1})
    private_get_user_orders_uuid = privateGetUserOrdersUuid = Entry[_Dict]('user/orders/{uuid}', 'private', 'GET', {'cost': 1})
    private_get_user_price_alerts = privateGetUserPriceAlerts = Entry[_List]('user/price_alerts', 'private', 'GET', {'cost': 1})
    private_get_merchant_get_payment_uuid = privateGetMerchantGetPaymentUuid = Entry[_Dict]('merchant/get_payment/{uuid}', 'private', 'GET', {'cost': 1})
    private_post_user_addresses = privatePostUserAddresses = Entry[_Dict]('user/addresses', 'private', 'POST', {'cost': 1})
    private_post_user_orders = privatePostUserOrders = Entry[_Dict]('user/orders', 'private', 'POST', {'cost': 1})
    private_post_user_withdrawals = privatePostUserWithdrawals = Entry[_Dict]('user/withdrawals', 'private', 'POST', {'cost': 1})
    private_post_user_email_transfers = privatePostUserEmailTransfers = Entry[_Dict]('user/email_transfers', 'private', 'POST', {'cost': 1})
    private_post_user_payment_requests = privatePostUserPaymentRequests = Entry[_List]('user/payment_requests', 'private', 'POST', {'cost': 1})
    private_post_user_price_alerts = privatePostUserPriceAlerts = Entry[_Dict]('user/price_alerts', 'private', 'POST', {'cost': 1})
    private_post_merchant_create_payment = privatePostMerchantCreatePayment = Entry[_Dict]('merchant/create_payment', 'private', 'POST', {'cost': 1})
    private_delete_user_orders_uuid = privateDeleteUserOrdersUuid = Entry[_Dict]('user/orders/{uuid}', 'private', 'DELETE', {'cost': 1})
    private_delete_user_orders_uuid_cancel = privateDeleteUserOrdersUuidCancel = Entry[_Dict]('user/orders/{uuid}/cancel', 'private', 'DELETE', {'cost': 1})
    private_delete_user_price_alerts_id = privateDeleteUserPriceAlertsId = Entry[_Dict]('user/price_alerts/{id}', 'private', 'DELETE', {'cost': 1})

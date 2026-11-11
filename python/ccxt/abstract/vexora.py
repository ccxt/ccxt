from ccxt.base.types import Entry
_Dict = dict[str, object]
_List = list[object]


class ImplicitAPI:
    public_get_products = publicGetProducts = Entry[_Dict | _List]('products', ['public'], 'GET', {'cost': 1})
    public_get_products_id_book = publicGetProductsIdBook = Entry[_Dict | _List]('products/{id}/book', ['public'], 'GET', {'cost': 1})
    public_get_products_id_trades = publicGetProductsIdTrades = Entry[_Dict | _List]('products/{id}/trades', ['public'], 'GET', {'cost': 1})
    public_get_products_id_candles = publicGetProductsIdCandles = Entry[_Dict | _List]('products/{id}/candles', ['public'], 'GET', {'cost': 1})

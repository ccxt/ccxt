from ccxt.base.types import Entry


class ImplicitAPI:
    public_post_info = publicPostInfo = Entry('info', 'public', 'POST', {'cost': 1})
    private_post_exchange = privatePostExchange = Entry('exchange', 'private', 'POST', {'cost': 1})

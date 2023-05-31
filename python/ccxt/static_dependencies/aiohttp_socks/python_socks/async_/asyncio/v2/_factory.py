from ...._proxy_factory import ProxyFactory
from ...._types import ProxyType
from ._proxy import Socks5Proxy, Socks4Proxy, HttpProxy, AsyncioProxy


class Proxy(ProxyFactory[AsyncioProxy]):
    types = {
        ProxyType.SOCKS4: Socks4Proxy,
        ProxyType.SOCKS5: Socks5Proxy,
        ProxyType.HTTP: HttpProxy,
    }

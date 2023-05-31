from ._chain import ProxyChain

from .._types import ProxyType
from .._proxy_factory import ProxyFactory
from ._proxy import Socks5Proxy, Socks4Proxy, HttpProxy, SyncProxy


class Proxy(ProxyFactory[SyncProxy]):
    types = {
        ProxyType.SOCKS4: Socks4Proxy,
        ProxyType.SOCKS5: Socks5Proxy,
        ProxyType.HTTP: HttpProxy,
    }


__all__ = ('Proxy', 'ProxyChain')

from typing import Type, Dict, Any, TypeVar, Generic

from ._helpers import parse_proxy_url
from ._types import ProxyType

T = TypeVar('T')


class ProxyFactory(Generic[T]):
    types: Dict[ProxyType, Type[Any]]

    @classmethod
    def create(
        cls,
        proxy_type: ProxyType,
        host: str,
        port: int,
        username: str = None,
        password: str = None,
        rdns: bool = None,
        **kwargs,
    ) -> T:

        proxy_cls = cls.types.get(proxy_type)

        if proxy_type == ProxyType.SOCKS4:
            return proxy_cls(
                proxy_host=host, proxy_port=port, user_id=username, rdns=rdns, **kwargs
            )

        if proxy_type == ProxyType.SOCKS5:
            return proxy_cls(
                proxy_host=host,
                proxy_port=port,
                username=username,
                password=password,
                rdns=rdns,
                **kwargs,
            )

        if proxy_type == ProxyType.HTTP:
            return proxy_cls(
                proxy_host=host,
                proxy_port=port,
                username=username,
                password=password,
                **kwargs,
            )

        raise ValueError('Invalid proxy type: {}'.format(proxy_type))

    @classmethod
    def from_url(cls, url: str, **kwargs) -> T:
        proxy_type, host, port, username, password = parse_proxy_url(url)
        return cls.create(
            proxy_type=proxy_type,
            host=host,
            port=port,
            username=username,
            password=password,
            **kwargs,
        )

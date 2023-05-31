import socket
import typing
from typing import Iterable
from asyncio import BaseTransport

from aiohttp import TCPConnector
from aiohttp.abc import AbstractResolver
from aiohttp.client_proto import ResponseHandler
from .python_socks import ProxyType, parse_proxy_url
from .python_socks.async_.asyncio.v2 import Proxy
from .python_socks.async_.asyncio.v2 import ProxyChain


class NoResolver(AbstractResolver):
    async def resolve(self, host, port=0, family=socket.AF_INET):
        return [
            {
                'hostname': host,
                'host': host,
                'port': port,
                'family': family,
                'proto': 0,
                'flags': 0,
            }
        ]

    async def close(self):
        pass  # pragma: no cover


class ProxyConnector(TCPConnector):
    def __init__(
        self,
        proxy_type=ProxyType.SOCKS5,
        host=None,
        port=None,
        username=None,
        password=None,
        rdns=None,
        proxy_ssl=None,
        **kwargs,
    ):
        kwargs['resolver'] = NoResolver()
        super().__init__(**kwargs)

        self._proxy_type = proxy_type
        self._proxy_host = host
        self._proxy_port = port
        self._proxy_username = username
        self._proxy_password = password
        self._rdns = rdns
        self._proxy_ssl = proxy_ssl

    # noinspection PyMethodOverriding
    async def _wrap_create_connection(self, protocol_factory, host, port, *, ssl, **kwargs):
        proxy = Proxy.create(
            proxy_type=self._proxy_type,
            host=self._proxy_host,
            port=self._proxy_port,
            username=self._proxy_username,
            password=self._proxy_password,
            rdns=self._rdns,
            proxy_ssl=self._proxy_ssl,
        )

        connect_timeout = None

        timeout = kwargs.get('timeout')
        if timeout is not None:
            connect_timeout = getattr(timeout, 'sock_connect', None)

        stream = await proxy.connect(
            dest_host=host,
            dest_port=port,
            dest_ssl=ssl,
            timeout=connect_timeout,
        )

        transport: BaseTransport = stream.writer.transport
        protocol: ResponseHandler = protocol_factory()

        transport.set_protocol(protocol)
        protocol.connection_made(transport)

        return transport, protocol

    @classmethod
    def from_url(cls, url, **kwargs):
        proxy_type, host, port, username, password = parse_proxy_url(url)
        return cls(
            proxy_type=proxy_type,
            host=host,
            port=port,
            username=username,
            password=password,
            **kwargs,
        )


class ProxyInfo(typing.NamedTuple):
    proxy_type: ProxyType
    host: str
    port: int
    username: typing.Optional[str] = None
    password: typing.Optional[str] = None
    rdns: typing.Optional[bool] = None


class ChainProxyConnector(TCPConnector):
    def __init__(self, proxy_infos: Iterable[ProxyInfo], **kwargs):
        kwargs['resolver'] = NoResolver()
        super().__init__(**kwargs)

        self._proxy_infos = proxy_infos

    # noinspection PyMethodOverriding
    async def _wrap_create_connection(self, protocol_factory, host, port, *, ssl, **kwargs):
        proxies = []
        for info in self._proxy_infos:
            proxy = Proxy.create(
                proxy_type=info.proxy_type,
                host=info.host,
                port=info.port,
                username=info.username,
                password=info.password,
                rdns=info.rdns,
            )
            proxies.append(proxy)

        proxy = ProxyChain(proxies)

        connect_timeout = None

        timeout = kwargs.get('timeout')
        if timeout is not None:
            connect_timeout = getattr(timeout, 'sock_connect', None)

        stream = await proxy.connect(
            dest_host=host,
            dest_port=port,
            dest_ssl=ssl,
            timeout=connect_timeout,
        )

        transport: BaseTransport = stream.writer.transport
        protocol: ResponseHandler = protocol_factory()

        transport.set_protocol(protocol)
        protocol.connection_made(transport)

        return transport, protocol

    @classmethod
    def from_urls(cls, urls: Iterable[str], **kwargs):
        infos = []
        for url in urls:
            proxy_type, host, port, username, password = parse_proxy_url(url)
            proxy_info = ProxyInfo(
                proxy_type=proxy_type,
                host=host,
                port=port,
                username=username,
                password=password,
            )
            infos.append(proxy_info)

        return cls(infos, **kwargs)

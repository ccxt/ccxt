import asyncio
import warnings

from .python_socks import ProxyType, parse_proxy_url
from .python_socks.async_.asyncio import Proxy


async def open_connection(
    proxy_url=None,
    host=None,
    port=None,
    *,
    proxy_type=ProxyType.SOCKS5,
    proxy_host='127.0.0.1',
    proxy_port=1080,
    username=None,
    password=None,
    rdns=True,
    loop=None,
    **kwargs,
):
    warnings.warn(
        'open_connection is deprecated. '
        'Use https://github.com/romis2012/python-socks directly instead.',
        DeprecationWarning,
        stacklevel=2,
    )

    if host is None or port is None:
        raise ValueError('host and port must be specified')  # pragma: no cover

    if loop is None:
        loop = asyncio.get_event_loop()

    if proxy_url is not None:
        proxy_type, proxy_host, proxy_port, username, password = parse_proxy_url(proxy_url)

    proxy = Proxy.create(
        proxy_type=proxy_type,
        host=proxy_host,
        port=proxy_port,
        username=username,
        password=password,
        rdns=rdns,
        loop=loop,
    )

    sock = await proxy.connect(host, port)

    # noinspection PyTypeChecker
    return await asyncio.open_connection(host=None, port=None, sock=sock, **kwargs)


async def create_connection(
    proxy_url=None,
    protocol_factory=None,
    host=None,
    port=None,
    *,
    proxy_type=ProxyType.SOCKS5,
    proxy_host='127.0.0.1',
    proxy_port=1080,
    username=None,
    password=None,
    rdns=True,
    loop=None,
    **kwargs,
):
    warnings.warn(
        'create_connection is deprecated. '
        'Use https://github.com/romis2012/python-socks directly instead.',
        DeprecationWarning,
        stacklevel=2,
    )

    if protocol_factory is None:
        raise ValueError('protocol_factory must be specified')  # pragma: no cover

    if host is None or port is None:
        raise ValueError('host and port must be specified')  # pragma: no cover

    if loop is None:
        loop = asyncio.get_event_loop()

    if proxy_url is not None:
        proxy_type, proxy_host, proxy_port, username, password = parse_proxy_url(proxy_url)

    proxy = Proxy.create(
        proxy_type=proxy_type,
        host=proxy_host,
        port=proxy_port,
        username=username,
        password=password,
        rdns=rdns,
        loop=loop,
    )

    sock = await proxy.connect(host, port)

    return await loop.create_connection(
        protocol_factory=protocol_factory, host=None, port=None, sock=sock, **kwargs
    )

import asyncio
import ssl
import warnings

import async_timeout

from ...._errors import ProxyConnectionError, ProxyTimeoutError
from ...._proto.http_async import HttpProto
from ...._proto.socks4_async import Socks4Proto
from ...._proto.socks5_async import Socks5Proto

from .._resolver import Resolver
from ._stream import AsyncioSocketStream
from ._connect import connect_tcp

DEFAULT_TIMEOUT = 60


class AsyncioProxy:
    def __init__(
        self,
        proxy_host: str,
        proxy_port: int,
        proxy_ssl: ssl.SSLContext = None,
        forward: 'AsyncioProxy' = None,
        loop: asyncio.AbstractEventLoop = None,
    ):
        if loop is not None:  # pragma: no cover
            warnings.warn(
                'The loop argument is deprecated and scheduled for removal in the future.',
                DeprecationWarning,
                stacklevel=2,
            )

        if loop is None:
            loop = asyncio.get_event_loop()

        self._loop = loop

        self._proxy_host = proxy_host
        self._proxy_port = proxy_port
        self._proxy_ssl = proxy_ssl
        self._forward = forward

        self._resolver = Resolver(loop=loop)

    async def connect(
        self,
        dest_host: str,
        dest_port: int,
        dest_ssl: ssl.SSLContext = None,
        timeout: float = None,
    ) -> AsyncioSocketStream:
        if timeout is None:
            timeout = DEFAULT_TIMEOUT

        try:
            async with async_timeout.timeout(timeout):
                return await self._connect(
                    dest_host=dest_host,
                    dest_port=dest_port,
                    dest_ssl=dest_ssl,
                )
        except asyncio.TimeoutError as e:
            raise ProxyTimeoutError('Proxy connection timed out: {}'.format(timeout)) from e

    async def _connect(
        self,
        dest_host: str,
        dest_port: int,
        dest_ssl: ssl.SSLContext = None,
    ) -> AsyncioSocketStream:
        try:
            if self._forward is None:
                stream = await connect_tcp(
                    host=self._proxy_host,
                    port=self._proxy_port,
                    loop=self._loop,
                )
            else:
                stream = await self._forward.connect(
                    dest_host=self._proxy_host,
                    dest_port=self._proxy_port,
                )
        except OSError as e:
            raise ProxyConnectionError(
                e.errno,
                f"Couldn't connect to proxy {self._proxy_host}:{self._proxy_port} [{e.strerror}]",
            ) from e
        except (asyncio.CancelledError, Exception):
            raise

        try:
            if self._proxy_ssl is not None:  # pragma: no cover
                stream = await stream.start_tls(
                    hostname=self._proxy_host,
                    ssl_context=self._proxy_ssl,
                )

            await self._negotiate(
                stream=stream,
                dest_host=dest_host,
                dest_port=dest_port,
            )

            if dest_ssl is not None:
                stream = await stream.start_tls(
                    hostname=dest_host,
                    ssl_context=dest_ssl,
                )
        except (asyncio.CancelledError, Exception):
            await stream.close()
            raise

        return stream

    async def _negotiate(
        self,
        stream: AsyncioSocketStream,
        dest_host: str,
        dest_port: int,
    ):
        raise NotImplementedError()


class Socks5Proxy(AsyncioProxy):
    def __init__(
        self,
        proxy_host,
        proxy_port,
        username=None,
        password=None,
        rdns=None,
        proxy_ssl=None,
        forward: 'AsyncioProxy' = None,
        loop: asyncio.AbstractEventLoop = None,
    ):
        super().__init__(
            proxy_host=proxy_host,
            proxy_port=proxy_port,
            proxy_ssl=proxy_ssl,
            forward=forward,
            loop=loop,
        )
        self._username = username
        self._password = password
        self._rdns = rdns

    async def _negotiate(
        self,
        stream: AsyncioSocketStream,
        dest_host: str,
        dest_port: int,
    ):
        proto = Socks5Proto(
            stream=stream,
            resolver=self._resolver,
            dest_host=dest_host,
            dest_port=dest_port,
            username=self._username,
            password=self._password,
            rdns=self._rdns,
        )
        await proto.negotiate()


class Socks4Proxy(AsyncioProxy):
    def __init__(
        self,
        proxy_host,
        proxy_port,
        user_id=None,
        rdns=None,
        proxy_ssl=None,
        forward: 'AsyncioProxy' = None,
        loop: asyncio.AbstractEventLoop = None,
    ):
        super().__init__(
            proxy_host=proxy_host,
            proxy_port=proxy_port,
            proxy_ssl=proxy_ssl,
            forward=forward,
            loop=loop,
        )
        self._user_id = user_id
        self._rdns = rdns

    async def _negotiate(
        self,
        stream: AsyncioSocketStream,
        dest_host: str,
        dest_port: int,
    ):
        proto = Socks4Proto(
            stream=stream,
            resolver=self._resolver,
            dest_host=dest_host,
            dest_port=dest_port,
            user_id=self._user_id,
            rdns=self._rdns,
        )
        await proto.negotiate()


class HttpProxy(AsyncioProxy):
    def __init__(
        self,
        proxy_host,
        proxy_port,
        username=None,
        password=None,
        proxy_ssl=None,
        forward: 'AsyncioProxy' = None,
        loop: asyncio.AbstractEventLoop = None,
    ):
        super().__init__(
            proxy_host=proxy_host,
            proxy_port=proxy_port,
            proxy_ssl=proxy_ssl,
            forward=forward,
            loop=loop,
        )
        self._username = username
        self._password = password

    async def _negotiate(
        self,
        stream: AsyncioSocketStream,
        dest_host: str,
        dest_port: int,
    ):
        proto = HttpProto(
            stream=stream,
            dest_host=dest_host,
            dest_port=dest_port,
            username=self._username,
            password=self._password,
        )
        await proto.negotiate()

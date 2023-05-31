import asyncio
import ssl

from .... import _abc as abc

DEFAULT_RECEIVE_SIZE = 65536


# noinspection PyUnusedLocal
async def backport_start_tls(
    transport,
    protocol,
    ssl_context,
    *,
    server_side=False,
    server_hostname=None,
    ssl_handshake_timeout=None,
):  # pragma: no cover
    """
    Python 3.6 asyncio doesn't have a start_tls() method on the loop,
    so we use this function in place of the loop's start_tls() method.
    Adapted from this comment:
    https://github.com/urllib3/urllib3/issues/1323#issuecomment-362494839
    """
    import asyncio.sslproto

    loop = asyncio.get_event_loop()
    waiter = loop.create_future()
    ssl_protocol = asyncio.sslproto.SSLProtocol(
        loop,
        protocol,
        ssl_context,
        waiter,
        server_side=False,
        server_hostname=server_hostname,
        call_connection_made=False,
    )

    transport.set_protocol(ssl_protocol)
    loop.call_soon(ssl_protocol.connection_made, transport)
    loop.call_soon(transport.resume_reading)  # type: ignore

    await waiter
    return ssl_protocol._app_transport  # noqa


class AsyncioSocketStream(abc.AsyncSocketStream):
    _loop: asyncio.AbstractEventLoop = None
    _reader: asyncio.StreamReader = None
    _writer: asyncio.StreamWriter = None

    def __init__(
        self,
        loop: asyncio.AbstractEventLoop,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ):
        self._loop = loop
        self._reader = reader
        self._writer = writer

    async def write_all(self, data):
        self._writer.write(data)
        await self._writer.drain()

    async def read(self, max_bytes=DEFAULT_RECEIVE_SIZE):
        return await self._reader.read(max_bytes)

    async def read_exact(self, n):
        return await self._reader.readexactly(n)

    async def start_tls(
        self,
        hostname: str,
        ssl_context: ssl.SSLContext,
    ) -> 'AsyncioSocketStream':
        reader = asyncio.StreamReader()
        protocol = asyncio.StreamReaderProtocol(reader)

        loop_start_tls = getattr(self._loop, 'start_tls', backport_start_tls)

        transport = await loop_start_tls(
            self._writer.transport,  # type: ignore
            protocol,
            ssl_context,
            server_side=False,
            server_hostname=hostname,
        )

        # reader.set_transport(transport)

        # Initialize the protocol, so it is made aware of being tied to
        # a TLS connection.
        # See: https://github.com/encode/httpx/issues/859
        protocol.connection_made(transport)

        writer = asyncio.StreamWriter(
            transport=transport,
            protocol=protocol,
            reader=reader,
            loop=self._loop,
        )

        stream = AsyncioSocketStream(loop=self._loop, reader=reader, writer=writer)
        # When we return a new SocketStream with new StreamReader/StreamWriter instances
        # we need to keep references to the old StreamReader/StreamWriter so that they
        # are not garbage collected and closed while we're still using them.
        stream._inner = self  # type: ignore
        return stream

    async def close(self):
        self._writer.close()
        self._writer.transport.abort()  # noqa

    @property
    def reader(self):
        return self._reader  # pragma: no cover

    @property
    def writer(self):
        return self._writer  # pragma: no cover

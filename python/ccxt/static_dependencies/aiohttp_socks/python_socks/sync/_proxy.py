import socket

from .._errors import ProxyConnectionError, ProxyTimeoutError
from .._proto.http_sync import HttpProto
from .._proto.socks4_sync import Socks4Proto
from .._proto.socks5_sync import Socks5Proto

from ._stream import SyncSocketStream
from ._resolver import SyncResolver
from ._connect import connect_tcp

from .. import _abc as abc

DEFAULT_TIMEOUT = 60


class SyncProxy(abc.SyncProxy):
    def __init__(self, proxy_host, proxy_port):
        self._proxy_host = proxy_host
        self._proxy_port = proxy_port

        self._dest_host = None
        self._dest_port = None
        self._timeout = None

        self._stream = None
        self._resolver = SyncResolver()

    def connect(
        self,
        dest_host: str,
        dest_port: int,
        timeout: float = None,
        _socket=None,
    ) -> socket.socket:

        if timeout is None:
            timeout = DEFAULT_TIMEOUT

        self._dest_host = dest_host
        self._dest_port = dest_port
        self._timeout = timeout

        try:
            if _socket is None:
                _socket = connect_tcp(
                    host=self._proxy_host,
                    port=self._proxy_port,
                    timeout=timeout,
                )

            self._stream = SyncSocketStream(_socket)
            self._negotiate()
            return _socket
        except socket.timeout as e:
            self._close()
            raise ProxyTimeoutError('Proxy connection timed out: {}'.format(self._timeout)) from e
        except OSError as e:
            self._close()
            msg = 'Could not connect to proxy {}:{} [{}]'.format(
                self._proxy_host,
                self._proxy_port,
                e.strerror,
            )
            raise ProxyConnectionError(e.errno, msg) from e
        except Exception:
            self._close()
            raise

    def _negotiate(self):
        raise NotImplementedError

    def _close(self):
        if self._stream is not None:
            self._stream.close()

    @property
    def proxy_host(self):
        return self._proxy_host

    @property
    def proxy_port(self):
        return self._proxy_port


class Socks5Proxy(SyncProxy):
    def __init__(self, proxy_host, proxy_port, username=None, password=None, rdns=None):
        super().__init__(proxy_host=proxy_host, proxy_port=proxy_port)
        self._username = username
        self._password = password
        self._rdns = rdns

    def _negotiate(self):
        proto = Socks5Proto(
            stream=self._stream,
            resolver=self._resolver,
            dest_host=self._dest_host,
            dest_port=self._dest_port,
            username=self._username,
            password=self._password,
            rdns=self._rdns,
        )
        proto.negotiate()


class Socks4Proxy(SyncProxy):
    def __init__(self, proxy_host, proxy_port, user_id=None, rdns=None):
        super().__init__(proxy_host=proxy_host, proxy_port=proxy_port)
        self._user_id = user_id
        self._rdns = rdns

    def _negotiate(self):
        proto = Socks4Proto(
            stream=self._stream,
            resolver=self._resolver,
            dest_host=self._dest_host,
            dest_port=self._dest_port,
            user_id=self._user_id,
            rdns=self._rdns,
        )
        proto.negotiate()


class HttpProxy(SyncProxy):
    def __init__(self, proxy_host, proxy_port, username=None, password=None):
        super().__init__(proxy_host=proxy_host, proxy_port=proxy_port)
        self._username = username
        self._password = password

    def _negotiate(self):
        proto = HttpProto(
            stream=self._stream,
            dest_host=self._dest_host,
            dest_port=self._dest_port,
            username=self._username,
            password=self._password,
        )
        proto.negotiate()

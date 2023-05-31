import socket

from .socks5 import (
    AuthMethod,
    AddressType,
    AuthMethodsRequest,
    AuthMethodsResponse,
    AuthRequest,
    AuthResponse,
    ConnectRequest,
    ConnectResponse,
)
from .. import _abc as abc
from .._errors import ProxyError


class Socks5Proto:
    def __init__(
        self,
        stream: abc.SyncSocketStream,
        resolver: abc.SyncResolver,
        dest_host,
        dest_port,
        username=None,
        password=None,
        rdns=None,
    ):
        if rdns is None:
            rdns = True

        self._dest_port = dest_port
        self._dest_host = dest_host
        self._username = username
        self._password = password
        self._rdns = rdns

        self._stream = stream
        self._resolver = resolver

    def negotiate(self):
        self._socks_auth()
        self._socks_connect()

    def _socks_auth(self):
        auth_method = self._choose_auth_method()

        # authenticate
        if auth_method == AuthMethod.USERNAME_PASSWORD:
            req = AuthRequest(username=self._username, password=self._password)

            self._stream.write_all(bytes(req))

            res = AuthResponse(self._stream.read_exact(2))
            res.validate()

    def _choose_auth_method(self) -> AuthMethod:
        req = AuthMethodsRequest(username=self._username, password=self._password)

        self._stream.write_all(bytes(req))

        res = AuthMethodsResponse(self._stream.read_exact(2))
        res.validate(request=req)
        return res.auth_method

    def _socks_connect(self):
        req = ConnectRequest(host=self._dest_host, port=self._dest_port, rdns=self._rdns)

        if req.need_resolve:
            _, addr = self._resolver.resolve(req.host, family=socket.AF_UNSPEC)
            req.set_resolved_host(addr)

        self._stream.write_all(bytes(req))

        res = ConnectResponse(self._stream.read_exact(3))
        res.validate()

        # read remaining data (server bound address)
        # self._stream.read()
        self._read_bound_address()

    def _read_bound_address(self):
        addr_type, *_ = self._stream.read_exact(1)
        if addr_type == AddressType.IPV4:
            host = self._stream.read_exact(4)
            host = socket.inet_ntop(socket.AF_INET, host)
        elif addr_type == AddressType.IPV6:
            host = self._stream.read_exact(16)
            host = socket.inet_ntop(socket.AF_INET6, host)
        elif addr_type == AddressType.DOMAIN:  # pragma: no cover
            host_len, *_ = self._stream.read_exact(1)
            host = self._stream.read_exact(host_len)
            host = host.decode()
        else:  # pragma: no cover
            raise ProxyError('Invalid address type: {:#02X}'.format(addr_type))

        port = self._stream.read_exact(2)
        port = int.from_bytes(port, 'big')

        return host, port

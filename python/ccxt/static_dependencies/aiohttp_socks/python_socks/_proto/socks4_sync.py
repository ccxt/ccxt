import socket

from .socks4 import ConnectRequest, ConnectResponse
from .. import _abc as abc


class Socks4Proto:
    def __init__(
        self,
        stream: abc.SyncSocketStream,
        resolver: abc.SyncResolver,
        dest_host,
        dest_port,
        user_id=None,
        rdns=None,
    ):

        if rdns is None:
            rdns = False

        self._dest_host = dest_host
        self._dest_port = dest_port

        self._user_id = user_id
        self._rdns = rdns

        self._stream = stream
        self._resolver = resolver

    def negotiate(self):
        self._socks_connect()

    def _socks_connect(self):
        req = ConnectRequest(
            host=self._dest_host, port=self._dest_port, user_id=self._user_id, rdns=self._rdns
        )

        if req.need_resolve:
            _, addr = self._resolver.resolve(req.host, family=socket.AF_INET)
            req.set_resolved_host(addr)

        self._stream.write_all(bytes(req))

        data = self._stream.read_exact(8)

        res = ConnectResponse(data[:2])
        res.validate()

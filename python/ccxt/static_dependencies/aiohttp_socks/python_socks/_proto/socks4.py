import enum
import ipaddress

from .._helpers import is_ipv4_address
from .._errors import ProxyError

RSV = NULL = 0x00
SOCKS_VER = 0x04


class Command(enum.IntEnum):
    CONNECT = 0x01
    BIND = 0x02


class ReplyCode(enum.IntEnum):
    REQUEST_GRANTED = 0x5A
    REQUEST_REJECTED_OR_FAILED = 0x5B
    CONNECTION_FAILED = 0x5C
    AUTHENTICATION_FAILED = 0x5D


ReplyMessages = {
    ReplyCode.REQUEST_GRANTED: 'Request granted',
    ReplyCode.REQUEST_REJECTED_OR_FAILED: 'Request rejected or failed',
    ReplyCode.CONNECTION_FAILED: 'Request rejected because SOCKS server '
                                 'cannot connect to identd on the client',
    ReplyCode.AUTHENTICATION_FAILED: 'Request rejected because '
                                     'the client program '
                                     'and identd report different user-ids'
}


class ConnectRequest:
    def __init__(self, host: str, port: int, user_id: str, rdns: bool):
        self.host = host
        self.port = port
        self.user_id = user_id
        self.rdns = rdns
        self._resolved_host = None

    @property
    def need_resolve(self):
        return not is_ipv4_address(self.host) and not self.rdns

    def set_resolved_host(self, value):
        self._resolved_host = value

    def __bytes__(self):
        port_bytes = self.port.to_bytes(2, 'big')
        include_hostname = False

        if is_ipv4_address(self.host):
            host_bytes = ipaddress.IPv4Address(self.host).packed
        else:
            # not IP address, probably a DNS name
            if self.rdns:
                # remote resolve (SOCKS4a)
                include_hostname = True
                host_bytes = bytes([NULL, NULL, NULL, 1])
            else:
                # resolve locally
                assert self._resolved_host is not None
                addr = self._resolved_host
                host_bytes = ipaddress.IPv4Address(addr).packed

        data = bytearray([SOCKS_VER, Command.CONNECT])
        data += port_bytes
        data += host_bytes

        if self.user_id:
            data += self.user_id.encode('ascii')

        data.append(NULL)

        if include_hostname:
            data += self.host.encode('idna')
            data.append(NULL)

        return bytes(data)


class ConnectResponse:
    rsv: int
    reply: ReplyCode

    def __init__(self, data: bytes):
        assert len(data) == 2
        self.rsv = data[0]
        self.reply = data[1]  # noqa

    def validate(self):
        if self.rsv != RSV:  # pragma: no cover
            raise ProxyError('SOCKS4 proxy server sent invalid data')

        if self.reply != ReplyCode.REQUEST_GRANTED:  # pragma: no cover
            msg = ReplyMessages.get(self.reply, 'Unknown error')
            raise ProxyError(msg, self.reply)

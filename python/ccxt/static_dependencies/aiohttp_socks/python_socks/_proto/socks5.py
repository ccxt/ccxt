import enum
import ipaddress
import typing
from .._helpers import is_ip_address
from .._errors import ProxyError

RSV = NULL = 0x00
SOCKS_VER = 0x05


class AuthMethod(enum.IntEnum):
    ANONYMOUS = 0x00
    GSSAPI = 0x01
    USERNAME_PASSWORD = 0x02
    NO_ACCEPTABLE = 0xff


class AddressType(enum.IntEnum):
    IPV4 = 0x01
    DOMAIN = 0x03
    IPV6 = 0x04

    @classmethod
    def from_ip_ver(cls, ver: int):
        if ver == 4:
            return cls.IPV4
        if ver == 6:
            return cls.IPV6

        raise ValueError('Invalid IP version')


class Command(enum.IntEnum):
    CONNECT = 0x01
    BIND = 0x02
    UDP_ASSOCIATE = 0x03


class ReplyCode(enum.IntEnum):
    GRANTED = 0x00
    GENERAL_FAILURE = 0x01
    CONNECTION_NOT_ALLOWED = 0x02
    NETWORK_UNREACHABLE = 0x03
    HOST_UNREACHABLE = 0x04
    CONNECTION_REFUSED = 0x05
    TTL_EXPIRED = 0x06
    COMMAND_NOT_SUPPORTED = 0x07
    ADDRESS_TYPE_NOT_SUPPORTED = 0x08


ReplyMessages = {
    ReplyCode.GRANTED: 'Request granted',
    ReplyCode.GENERAL_FAILURE: 'General SOCKS server failure',
    ReplyCode.CONNECTION_NOT_ALLOWED: 'Connection not allowed by ruleset',
    ReplyCode.NETWORK_UNREACHABLE: 'Network unreachable',
    ReplyCode.HOST_UNREACHABLE: 'Host unreachable',
    ReplyCode.CONNECTION_REFUSED: 'Connection refused by destination host',
    ReplyCode.TTL_EXPIRED: 'TTL expired',
    ReplyCode.COMMAND_NOT_SUPPORTED: 'Command not supported or protocol error',
    ReplyCode.ADDRESS_TYPE_NOT_SUPPORTED: 'Address type not supported'
}


class AuthMethodsRequest:
    def __init__(self, username: str, password: str):
        auth_methods = bytearray([AuthMethod.ANONYMOUS])

        if username and password:
            auth_methods.append(AuthMethod.USERNAME_PASSWORD)

        self.auth_methods = auth_methods

    def __bytes__(self):
        return bytes([SOCKS_VER, len(self.auth_methods)]) + self.auth_methods


class AuthMethodsResponse:
    socks_ver: int
    auth_method: AuthMethod

    def __init__(self, data: bytes):
        assert len(data) == 2
        self.socks_ver = data[0]
        self.auth_method = data[1]  # noqa

    def validate(self, request: AuthMethodsRequest):
        if self.socks_ver != SOCKS_VER:
            raise ProxyError('Unexpected '  # pragma: no cover
                             'SOCKS version number: '
                             '{}'.format(self.socks_ver))

        if self.auth_method == AuthMethod.NO_ACCEPTABLE:
            raise ProxyError('No acceptable '  # pragma: no cover
                             'authentication methods were offered')

        if self.auth_method not in request.auth_methods:
            raise ProxyError('Unexpected SOCKS '  # pragma: no cover
                             'authentication method: '
                             '{}'.format(self.auth_method))


class AuthRequest(typing.SupportsBytes):
    VER = 0x01

    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

    def __bytes__(self):
        data = bytearray()
        data.append(self.VER)
        data.append(len(self.username))
        data += self.username.encode('ascii')
        data.append(len(self.password))
        data += self.password.encode('ascii')
        return bytes(data)


class AuthResponse:
    ver: int
    reply: ReplyCode

    def __init__(self, data: bytes):
        assert len(data) == 2
        self.ver = data[0]
        self.reply = data[1]  # noqa

    def validate(self):
        if self.ver != AuthRequest.VER:
            raise ProxyError('Invalid '  # pragma: no cover
                             'authentication response')

        if self.reply != ReplyCode.GRANTED:
            raise ProxyError('Username and password '  # pragma: no cover
                             'authentication failure')


class ConnectRequest:
    def __init__(self, host: str, port: int, rdns: bool):
        self.host = host
        self.port = port
        self.rdns = rdns
        self._resolved_host = None

    def __bytes__(self):
        data = bytearray([SOCKS_VER, Command.CONNECT, RSV])
        data += self._build_addr_request()
        return bytes(data)

    @property
    def need_resolve(self):
        return not is_ip_address(self.host) and not self.rdns

    def set_resolved_host(self, value):
        self._resolved_host = value

    def _build_addr_request(self) -> bytes:
        port = self.port.to_bytes(2, 'big')

        # destination address provided is an IPv4 or IPv6 address
        if is_ip_address(self.host):
            ip = ipaddress.ip_address(self.host)
            address_type = AddressType.from_ip_ver(ip.version)
            return bytes([address_type]) + ip.packed + port

        # not IP address, probably a DNS name
        if self.rdns:
            # resolve remotely
            address_type = AddressType.DOMAIN
            host = self.host.encode('idna')
            host_len = len(host)
            return bytes([address_type, host_len]) + host + port
        else:
            assert self._resolved_host is not None
            addr = self._resolved_host
            ip = ipaddress.ip_address(addr)
            address_type = AddressType.from_ip_ver(ip.version)
            return bytes([address_type]) + ip.packed + port


class ConnectResponse:
    socks_ver: int
    reply: ReplyCode
    rsv: int

    def __init__(self, data: bytes):
        assert len(data) == 3
        self.socks_ver = data[0]
        self.reply = data[1]  # noqa
        self.rsv = data[2]

    def validate(self):
        if self.socks_ver != SOCKS_VER:
            raise ProxyError('Unexpected SOCKS '  # pragma: no cover
                             'version number: {:#02X}'.format(self.socks_ver))

        if self.reply != ReplyCode.GRANTED:  # pragma: no cover
            msg = ReplyMessages.get(self.reply, 'Unknown error')
            raise ProxyError(msg, self.reply)

        if self.rsv != RSV:
            raise ProxyError('The reserved byte '  # pragma: no cover
                             'must be {:#02X}'.format(RSV))

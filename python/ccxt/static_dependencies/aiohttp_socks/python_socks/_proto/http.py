import sys

from .._basic_auth import BasicAuth
from .._errors import ProxyError
from .._version import __title__, __version__

DEFAULT_USER_AGENT = 'Python/{0[0]}.{0[1]} {1}/{2}'.format(
    sys.version_info, __title__, __version__)

CRLF = '\r\n'


class ConnectRequest:
    def __init__(self, host: str, port: int, login: str, password: str):
        self.host = host
        self.port = port
        self.login = login
        self.password = password

    def __bytes__(self):
        req = [
            'CONNECT {}:{} HTTP/1.1'.format(self.host, self.port),
            'Host: {}:{}'.format(self.host, self.port),
            'User-Agent: {}'.format(DEFAULT_USER_AGENT),
        ]

        if self.login and self.password:
            auth = BasicAuth(self.login, self.password)
            req.append('Proxy-Authorization: {}'.format(auth.encode()))

        req.append(CRLF)

        data = CRLF.join(req).encode('ascii')
        return data


class ConnectResponse:
    def __init__(self, data: bytes):
        self.data = data

    def validate(self):
        data = self.data

        if not data:
            raise ProxyError('Invalid proxy response')  # pragma: no cover'

        line = data.split(CRLF.encode('ascii'), 1)[0]
        line = line.decode('utf-8', 'surrogateescape')

        try:
            version, code, *reason = line.split()
        except ValueError:  # pragma: no cover
            raise ProxyError('Invalid status line: {}'.format(line))

        try:
            status_code = int(code)
        except ValueError:  # pragma: no cover
            raise ProxyError('Invalid status code: {}'.format(code))

        if status_code != 200:
            msg = 'Proxy error: {} {}'.format(status_code, ' '.join(reason))
            raise ProxyError(msg, status_code)

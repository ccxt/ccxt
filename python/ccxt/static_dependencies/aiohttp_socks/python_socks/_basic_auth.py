import base64
import binascii
from collections import namedtuple


class BasicAuth(namedtuple('BasicAuth', ['login', 'password', 'encoding'])):
    """Http basic authentication helper."""

    def __new__(cls, login: str,
                password: str = '',
                encoding: str = 'latin1') -> 'BasicAuth':
        if login is None:
            raise ValueError('None is not allowed as login value')

        if password is None:
            raise ValueError('None is not allowed as password value')

        if ':' in login:
            raise ValueError(
                'A ":" is not allowed in login (RFC 1945#section-11.1)')

        # noinspection PyTypeChecker,PyArgumentList
        return super().__new__(cls, login, password, encoding)

    @classmethod
    def decode(cls, auth_header: str, encoding: str = 'latin1') -> 'BasicAuth':
        """Create a BasicAuth object from an Authorization HTTP header."""
        try:
            auth_type, encoded_credentials = auth_header.split(' ', 1)
        except ValueError:
            raise ValueError('Could not parse authorization header.')

        if auth_type.lower() != 'basic':
            raise ValueError('Unknown authorization method %s' % auth_type)

        try:
            decoded = base64.b64decode(
                encoded_credentials.encode('ascii'), validate=True
            ).decode(encoding)
        except binascii.Error:
            raise ValueError('Invalid base64 encoding.')

        try:
            # RFC 2617 HTTP Authentication
            # https://www.ietf.org/rfc/rfc2617.txt
            # the colon must be present, but the username and password may be
            # otherwise blank.
            username, password = decoded.split(':', 1)
        except ValueError:
            raise ValueError('Invalid credentials.')

        # noinspection PyTypeChecker
        return cls(username, password, encoding=encoding)

    def encode(self) -> str:
        """Encode credentials."""
        creds = ('%s:%s' % (self.login, self.password)).encode(self.encoding)
        return 'Basic %s' % base64.b64encode(creds).decode(self.encoding)

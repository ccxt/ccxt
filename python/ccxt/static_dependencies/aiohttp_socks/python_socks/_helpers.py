import functools
import re
from urllib.parse import urlparse, unquote

from ._types import ProxyType

_ipv4_pattern = (r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}'
                 r'(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')

_ipv6_pattern = (
    r'^(?:(?:(?:[A-F0-9]{1,4}:){6}|(?=(?:[A-F0-9]{0,4}:){0,6}'
    r'(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(([0-9A-F]{1,4}:){0,5}|:)'
    r'((:[0-9A-F]{1,4}){1,5}:|:)|::(?:[A-F0-9]{1,4}:){5})'
    r'(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}'
    r'(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])|(?:[A-F0-9]{1,4}:){7}'
    r'[A-F0-9]{1,4}|(?=(?:[A-F0-9]{0,4}:){0,7}[A-F0-9]{0,4}$)'
    r'(([0-9A-F]{1,4}:){1,7}|:)((:[0-9A-F]{1,4}){1,7}|:)|(?:[A-F0-9]{1,4}:){7}'
    r':|:(:[A-F0-9]{1,4}){7})$')

_ipv4_regex = re.compile(_ipv4_pattern)
_ipv6_regex = re.compile(_ipv6_pattern, flags=re.IGNORECASE)
_ipv4_regexb = re.compile(_ipv4_pattern.encode('ascii'))
_ipv6_regexb = re.compile(_ipv6_pattern.encode('ascii'), flags=re.IGNORECASE)


def _is_ip_address(regex, regexb, host):
    # if host is None:
    #     return False
    if isinstance(host, str):
        return bool(regex.match(host))
    elif isinstance(host, (bytes, bytearray, memoryview)):
        return bool(regexb.match(host))
    else:
        raise TypeError('{} [{}] is not a str or bytes'  # pragma: no cover
                        .format(host, type(host)))


is_ipv4_address = functools.partial(_is_ip_address, _ipv4_regex, _ipv4_regexb)
is_ipv6_address = functools.partial(_is_ip_address, _ipv6_regex, _ipv6_regexb)


def is_ip_address(host):
    return is_ipv4_address(host) or is_ipv6_address(host)


def parse_proxy_url(url):
    parsed = urlparse(url)

    scheme = parsed.scheme
    if scheme == 'socks5':
        proxy_type = ProxyType.SOCKS5
    elif scheme == 'socks4':
        proxy_type = ProxyType.SOCKS4
    elif scheme == 'http':
        proxy_type = ProxyType.HTTP
    else:
        raise ValueError('Invalid scheme component: %s'
                         % scheme)  # pragma: no cover

    host = parsed.hostname
    if not host:
        raise ValueError('Empty host component')  # pragma: no cover

    try:
        port = parsed.port
    except (ValueError, TypeError):  # pragma: no cover
        raise ValueError('Invalid port component')

    try:
        username, password = (unquote(parsed.username),
                              unquote(parsed.password))
    except (AttributeError, TypeError):
        username, password = '', ''

    return proxy_type, host, port, username, password

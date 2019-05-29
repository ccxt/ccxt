"""
The `compat` module provides support for backwards compatibility with older
versions of python, and compatibility wrappers around optional packages.
"""
# flake8: noqa
import hmac
import struct
import sys


PY3 = sys.version_info[0] == 3


if PY3:
    text_type = str
    binary_type = bytes
else:
    text_type = unicode
    binary_type = str

string_types = (text_type, binary_type)

try:
    # Importing ABCs from collections will be removed in PY3.8
    from collections.abc import Iterable, Mapping
except ImportError:
    from collections import Iterable, Mapping

try:
    constant_time_compare = hmac.compare_digest
except AttributeError:
    # Fallback for Python < 2.7
    def constant_time_compare(val1, val2):
        """
        Returns True if the two strings are equal, False otherwise.

        The time taken is independent of the number of characters that match.
        """
        if len(val1) != len(val2):
            return False

        result = 0

        for x, y in zip(val1, val2):
            result |= ord(x) ^ ord(y)

        return result == 0

# Use int.to_bytes if it exists (Python 3)
if getattr(int, 'to_bytes', None):
    def bytes_from_int(val):
        remaining = val
        byte_length = 0

        while remaining != 0:
            remaining = remaining >> 8
            byte_length += 1

        return val.to_bytes(byte_length, 'big', signed=False)
else:
    def bytes_from_int(val):
        buf = []
        while val:
            val, remainder = divmod(val, 256)
            buf.append(remainder)

        buf.reverse()
        return struct.pack('%sB' % len(buf), *buf)

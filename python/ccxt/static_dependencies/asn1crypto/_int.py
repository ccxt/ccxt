# coding: utf-8

"""
Function for calculating the modular inverse. Exports the following items:

 - inverse_mod()

Source code is derived from
http://webpages.charter.net/curryfans/peter/downloads.html, but has been heavily
modified to fit into this projects lint settings. The original project license
is listed below:

Copyright (c) 2014 Peter Pearson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
"""

from __future__ import unicode_literals, division, absolute_import, print_function

import math
import platform

from .util import int_to_bytes, int_from_bytes

# First try to use ctypes with OpenSSL for better performance
try:
    from ._ffi import (
        buffer_from_bytes,
        bytes_from_buffer,
        FFIEngineError,
        LibraryNotFoundError,
        null,
    )

    # Some versions of PyPy have segfault issues, so we just punt on PyPy
    if platform.python_implementation() == 'PyPy':
        raise EnvironmentError()

    try:
        from ._perf._big_num_ctypes import libcrypto

        def inverse_mod(a, p):
            """
            Compute the modular inverse of a (mod p)

            :param a:
                An integer

            :param p:
                An integer

            :return:
                An integer
            """

            ctx = libcrypto.BN_CTX_new()

            a_bytes = int_to_bytes(abs(a))
            p_bytes = int_to_bytes(abs(p))

            a_buf = buffer_from_bytes(a_bytes)
            a_bn = libcrypto.BN_bin2bn(a_buf, len(a_bytes), null())
            if a < 0:
                libcrypto.BN_set_negative(a_bn, 1)

            p_buf = buffer_from_bytes(p_bytes)
            p_bn = libcrypto.BN_bin2bn(p_buf, len(p_bytes), null())
            if p < 0:
                libcrypto.BN_set_negative(p_bn, 1)

            r_bn = libcrypto.BN_mod_inverse(null(), a_bn, p_bn, ctx)
            r_len_bits = libcrypto.BN_num_bits(r_bn)
            r_len = int(math.ceil(r_len_bits / 8))
            r_buf = buffer_from_bytes(r_len)
            libcrypto.BN_bn2bin(r_bn, r_buf)
            r_bytes = bytes_from_buffer(r_buf, r_len)
            result = int_from_bytes(r_bytes)

            libcrypto.BN_free(a_bn)
            libcrypto.BN_free(p_bn)
            libcrypto.BN_free(r_bn)
            libcrypto.BN_CTX_free(ctx)

            return result
    except (LibraryNotFoundError, FFIEngineError):
        raise EnvironmentError()

# If there was an issue using ctypes or OpenSSL, we fall back to pure python
except (EnvironmentError, ImportError):

    def inverse_mod(a, p):
        """
        Compute the modular inverse of a (mod p)

        :param a:
            An integer

        :param p:
            An integer

        :return:
            An integer
        """

        if a < 0 or p <= a:
            a = a % p

        # From Ferguson and Schneier, roughly:

        c, d = a, p
        uc, vc, ud, vd = 1, 0, 0, 1
        while c != 0:
            q, c, d = divmod(d, c) + (c,)
            uc, vc, ud, vd = ud - q * uc, vd - q * vc, uc, vc

        # At this point, d is the GCD, and ud*a+vd*p = d.
        # If d == 1, this means that ud is a inverse.

        assert d == 1
        if ud > 0:
            return ud
        else:
            return ud + p


def fill_width(bytes_, width):
    """
    Ensure a byte string representing a positive integer is a specific width
    (in bytes)

    :param bytes_:
        The integer byte string

    :param width:
        The desired width as an integer

    :return:
        A byte string of the width specified
    """

    while len(bytes_) < width:
        bytes_ = b'\x00' + bytes_
    return bytes_

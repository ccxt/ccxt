# coding: utf-8

"""
ctypes interface for BN_mod_inverse() function from OpenSSL. Exports the
following items:

 - libcrypto
    - BN_bn2bin()
    - BN_CTX_free()
    - BN_CTX_new()
    - BN_free()
    - BN_mod_inverse()
    - BN_new()
    - BN_num_bits()
    - BN_set_negative()

Will raise asn1crypto._ffi.LibraryNotFoundError() if libcrypto can not be
found. Will raise asn1crypto._ffi.FFIEngineError() if there is an error
interfacing with libcrypto.
"""

from __future__ import unicode_literals, division, absolute_import, print_function

import sys

from ctypes import CDLL, c_int, c_char_p, c_void_p
from ctypes.util import find_library

from .._ffi import LibraryNotFoundError, FFIEngineError


try:
    # On Python 2, the unicode string here may raise a UnicodeDecodeError as it
    # tries to join a bytestring path to the unicode name "crypto"
    libcrypto_path = find_library(b'crypto' if sys.version_info < (3,) else 'crypto')
    if not libcrypto_path:
        raise LibraryNotFoundError('The library libcrypto could not be found')

    libcrypto = CDLL(libcrypto_path)

    libcrypto.BN_new.argtypes = []
    libcrypto.BN_new.restype = c_void_p

    libcrypto.BN_bin2bn.argtypes = [c_char_p, c_int, c_void_p]
    libcrypto.BN_bin2bn.restype = c_void_p

    libcrypto.BN_bn2bin.argtypes = [c_void_p, c_char_p]
    libcrypto.BN_bn2bin.restype = c_int

    libcrypto.BN_set_negative.argtypes = [c_void_p, c_int]
    libcrypto.BN_set_negative.restype = None

    libcrypto.BN_num_bits.argtypes = [c_void_p]
    libcrypto.BN_num_bits.restype = c_int

    libcrypto.BN_free.argtypes = [c_void_p]
    libcrypto.BN_free.restype = None

    libcrypto.BN_CTX_new.argtypes = []
    libcrypto.BN_CTX_new.restype = c_void_p

    libcrypto.BN_CTX_free.argtypes = [c_void_p]
    libcrypto.BN_CTX_free.restype = None

    libcrypto.BN_mod_inverse.argtypes = [c_void_p, c_void_p, c_void_p, c_void_p]
    libcrypto.BN_mod_inverse.restype = c_void_p

except (AttributeError):
    raise FFIEngineError('Error initializing ctypes')

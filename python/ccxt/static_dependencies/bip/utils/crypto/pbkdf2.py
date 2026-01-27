# Copyright (c) 2022 Emanuele Bellocchia
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

"""Module for PBKDF2 algorithm."""

# Imports
import hashlib
from typing import Optional, Union

from Crypto.Hash import SHA512
from Crypto.Protocol.KDF import PBKDF2

from ..misc import AlgoUtils


HASHLIB_USE_PBKDF2_SHA512: bool = hasattr(hashlib, "pbkdf2_hmac")   # For future changes


class Pbkdf2HmacSha512:
    """
    PBKDF2 HMAC-SHA512 class.
    It derives keys using PBKDF2 HMAC-SHA512 algorithm.
    """

    @staticmethod
    def DeriveKey(password: Union[bytes, str],
                  salt: Union[bytes, str],
                  itr_num: int,
                  dklen: Optional[int] = None) -> bytes:
        """
        Derive a key.

        Args:
            password (str or bytes): Password
            salt (str or bytes)    : Salt
            itr_num (int)          : Iteration number
            dklen (int, optional)  : Length of the derived key (default: SHA-512 output length)

        Returns:
            bytes: Computed result
        """
        if HASHLIB_USE_PBKDF2_SHA512:
            return hashlib.pbkdf2_hmac("sha512", AlgoUtils.Encode(password), AlgoUtils.Encode(salt), itr_num, dklen)
        # Use Cryptodome if not implemented in hashlib
        return PBKDF2(AlgoUtils.Encode(password),  # type: ignore [arg-type]
                      AlgoUtils.Encode(salt),
                      dklen or SHA512.digest_size,
                      count=itr_num,
                      hmac_hash_module=SHA512)

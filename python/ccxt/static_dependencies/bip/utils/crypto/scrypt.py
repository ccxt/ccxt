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

"""Module for Scrypt algorithm."""

# Imports
from typing import Union

from Crypto.Protocol.KDF import scrypt

from ..misc import AlgoUtils


class Scrypt:
    """
    Scrypt class.
    It derives key using Scrypt algorithm.
    """

    @staticmethod
    def DeriveKey(password: Union[bytes, str],  # pylint: disable=too-many-arguments
                  salt: Union[bytes, str],
                  key_len: int,
                  n: int,
                  r: int,
                  p: int) -> bytes:
        """
        Derive a key.

        Args:
            password (str or bytes): Password
            salt (str or bytes)    : Salt
            key_len (int)          : Length of the derived key
            n (int)                : CPU/Memory cost parameter
            r (int)                : Block size parameter
            p (int)                : Parallelization parameter

        Returns:
            bytes: Computed result
        """

        # Type for password and salt should be Union[bytes, str] in pycryptodome, but it's only str
        # So, we ignore the mypy warning
        return scrypt(AlgoUtils.Encode(password),   # type: ignore [arg-type, return-value]
                      AlgoUtils.Encode(salt),       # type: ignore [arg-type]
                      key_len=key_len,
                      N=n,
                      r=r,
                      p=p)

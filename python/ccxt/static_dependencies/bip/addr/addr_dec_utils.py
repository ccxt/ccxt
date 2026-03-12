# Copyright (c) 2021 Emanuele Bellocchia
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

"""Module with utility functions for address decoding."""

# Imports
from typing import Callable, Tuple, Type, TypeVar, Union

from ..ecc import IPublicKey
from ..utils.misc import BytesUtils


BytesOrStr = TypeVar("BytesOrStr", bytes, str)


class AddrDecUtils:
    """Class container for address decoding utility functions."""

    @staticmethod
    def ValidateAndRemovePrefix(addr: BytesOrStr,
                                prefix: BytesOrStr) -> BytesOrStr:
        """
        Validate and remove prefix from an address.

        Args:
            addr (bytes or str)  : Address string or bytes
            prefix (bytes or str): Address prefix

        Returns:
            bytes or str: Address string or bytes with prefix removed

        Raises:
            ValueError: If the prefix is not valid
        """
        prefix_got = addr[:len(prefix)]
        if prefix != prefix_got:
            raise ValueError(f"Invalid prefix (expected {prefix!r}, got {prefix_got!r})")
        return addr[len(prefix):]

    @staticmethod
    def ValidateLength(addr: Union[bytes, str],
                       len_exp: int) -> None:
        """
        Validate address length.

        Args:
            addr (str)   : Address string or bytes
            len_exp (int): Expected address length

        Raises:
            ValueError: If the length is not valid
        """
        if len(addr) != len_exp:
            raise ValueError(f"Invalid length (expected {len_exp}, got {len(addr)})")

    @staticmethod
    def ValidatePubKey(pub_key_bytes: bytes,
                       pub_key_cls: Type[IPublicKey]) -> None:
        """
        Validate address length.

        Args:
            pub_key_bytes (bytes)   : Public key bytes
            pub_key_cls (IPublicKey): Public key class type

        Raises:
            ValueError: If the public key is not valid
        """
        if not pub_key_cls.IsValidBytes(pub_key_bytes):
            raise ValueError(f"Invalid {pub_key_cls.CurveType()} "
                             f"public key {BytesUtils.ToHexString(pub_key_bytes)}")

    @staticmethod
    def ValidateChecksum(payload_bytes: bytes,
                         checksum_bytes_exp: bytes,
                         checksum_fct: Callable[[bytes], bytes]) -> None:
        """
        Validate address checksum.

        Args:
            payload_bytes (bytes)     : Payload bytes
            checksum_bytes_exp (bytes): Expected checksum bytes
            checksum_fct (function)   : Function for computing checksum

        Raises:
            ValueError: If the computed checksum is not equal tot he specified one
        """
        checksum_bytes_got = checksum_fct(payload_bytes)
        if checksum_bytes_exp != checksum_bytes_got:
            raise ValueError(f"Invalid checksum (expected {BytesUtils.ToHexString(checksum_bytes_exp)}, "
                             f"got {BytesUtils.ToHexString(checksum_bytes_got)})")

    @staticmethod
    def SplitPartsByChecksum(addr_bytes: bytes,
                             checksum_len: int) -> Tuple[bytes, bytes]:
        """
        Split address in two parts, considering the checksum at the end of it.

        Args:
            addr_bytes (bytes): Address bytes
            checksum_len (int): Checksum length

        Returns:
            tuple[bytes, bytes]: Payload bytes (index 0) and checksum bytes (index 1)
        """
        checksum_bytes = addr_bytes[-1 * checksum_len:]
        payload_bytes = addr_bytes[:-1 * checksum_len]
        return payload_bytes, checksum_bytes

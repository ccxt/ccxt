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

"""Module for base58 decoding/encoding."""

# Imports
from enum import Enum, auto, unique
from typing import Dict

from .base58_ex import Base58ChecksumError
from ..utils.crypto import DoubleSha256
from ..utils.misc import BytesUtils


@unique
class Base58Alphabets(Enum):
    """Enumerative for Base58 alphabet."""

    BITCOIN = auto()
    RIPPLE = auto()


class Base58Const:
    """Class container for Base58 constants."""

    # Base58 radix
    RADIX: int = 58
    # Checksum length in bytes
    CHECKSUM_BYTE_LEN: int = 4
    # Alphabets
    ALPHABETS: Dict[Base58Alphabets, str] = {
        Base58Alphabets.BITCOIN: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
        Base58Alphabets.RIPPLE: "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz",
    }


class Base58Utils:
    """Class container for Base58 utility functions."""

    @staticmethod
    def ComputeChecksum(data_bytes: bytes) -> bytes:
        """
        Compute Base58 checksum.

        Args:
            data_bytes (bytes): Data bytes

        Returns:
            bytes: Computed checksum
        """
        return DoubleSha256.QuickDigest(data_bytes)[:Base58Const.CHECKSUM_BYTE_LEN]


class Base58Encoder:
    """Base58 encoder class. It provides methods for encoding and checksum encoding to Base58 format."""

    @staticmethod
    def Encode(data_bytes: bytes,
               alph_idx: Base58Alphabets = Base58Alphabets.BITCOIN) -> str:
        """
        Encode bytes into a Base58 string.

        Args:
            data_bytes (bytes)                  : Data bytes
            alph_idx (Base58Alphabets, optional): Alphabet index, Bitcoin by default

        Returns:
            str: Encoded string

        Raises:
            TypeError: If alphabet index is not a Base58Alphabets enumerative
        """
        if not isinstance(alph_idx, Base58Alphabets):
            raise TypeError("Alphabet index is not an enumerative of Base58Alphabets")

        enc = ""

        # Get alphabet
        alphabet = Base58Const.ALPHABETS[alph_idx]

        # Convert bytes to integer
        val = BytesUtils.ToInteger(data_bytes)

        # Algorithm implementation
        while val > 0:
            val, mod = divmod(val, Base58Const.RADIX)
            enc = alphabet[mod] + enc

        # Get number of leading zeros
        n = len(data_bytes) - len(data_bytes.lstrip(b"\x00"))
        # Add padding
        return (alphabet[0] * n) + enc

    @staticmethod
    def CheckEncode(data_bytes: bytes,
                    alph_idx: Base58Alphabets = Base58Alphabets.BITCOIN) -> str:
        """
        Encode bytes into Base58 string with checksum.

        Args:
            data_bytes (bytes)                  : Data bytes
            alph_idx (Base58Alphabets, optional): Alphabet index, Bitcoin by default

        Returns:
            str: Encoded string with checksum

        Raises:
            TypeError: If alphabet index is not a Base58Alphabets enumerative
        """

        # Append checksum and encode all together
        return Base58Encoder.Encode(data_bytes + Base58Utils.ComputeChecksum(data_bytes), alph_idx)


class Base58Decoder:
    """Base58 decoder class. It provides methods for decoding and checksum decoding Base58 format."""

    @staticmethod
    def Decode(data_str: str,
               alph_idx: Base58Alphabets = Base58Alphabets.BITCOIN) -> bytes:
        """
        Decode bytes from a Base58 string.

        Args:
            data_str (str)                      : Data string
            alph_idx (Base58Alphabets, optional): Alphabet index, Bitcoin by default

        Returns:
            bytes: Decoded bytes

        Raises:
            TypeError: If alphabet index is not a Base58Alphabets enumerative
        """
        if not isinstance(alph_idx, Base58Alphabets):
            raise TypeError("Alphabet index is not an enumerative of Base58Alphabets")

        # Get alphabet
        alphabet = Base58Const.ALPHABETS[alph_idx]

        # Convert string to integer
        val = 0
        for i, c in enumerate(data_str[::-1]):
            val += alphabet.index(c) * (Base58Const.RADIX ** i)

        dec = bytearray()
        while val > 0:
            val, mod = divmod(val, 2**8)
            dec.append(mod)

        # Get padding length
        pad_len = len(data_str) - len(data_str.lstrip(alphabet[0]))
        # Add padding
        return (b"\x00" * pad_len) + bytes(dec[::-1])

    @staticmethod
    def CheckDecode(data_str: str,
                    alph_idx: Base58Alphabets = Base58Alphabets.BITCOIN) -> bytes:
        """
        Decode bytes from a Base58 string with checksum.

        Args:
            data_str (str)                      : Data string
            alph_idx (Base58Alphabets, optional): Alphabet index, Bitcoin by default

        Returns:
            bytes: Decoded bytes (checksum removed)

        Raises:
            ValueError: If the string is not a valid Base58 format
            TypeError: If alphabet index is not a Base58Alphabets enumerative
            Base58ChecksumError: If checksum is not valid
        """

        # Decode string
        dec_bytes = Base58Decoder.Decode(data_str, alph_idx)
        # Get data and checksum bytes
        data_bytes = dec_bytes[:-Base58Const.CHECKSUM_BYTE_LEN]
        checksum_bytes = dec_bytes[-Base58Const.CHECKSUM_BYTE_LEN:]

        # Compute checksum
        checksum_bytes_got = Base58Utils.ComputeChecksum(data_bytes)

        # Verify checksum
        if checksum_bytes != checksum_bytes_got:
            raise Base58ChecksumError(
                f"Invalid checksum (expected {BytesUtils.ToHexString(checksum_bytes_got)}, "
                f"got {BytesUtils.ToHexString(checksum_bytes)})"
            )

        return data_bytes

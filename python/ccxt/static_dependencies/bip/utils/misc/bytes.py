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

"""Module with some bytes utility functions."""

# Imports
import binascii
from typing import List, Union

from .algo import AlgoUtils
from .integer import IntegerUtils
from ..typing import Literal


class BytesUtils:
    """Class container for bytes utility functions."""

    @staticmethod
    def Reverse(data_bytes: bytes) -> bytes:
        """
        Reverse the specified bytes.

        Args:
            data_bytes (bytes): Data bytes

        Returns:
            bytes: Original bytes in the reverse order
        """
        tmp = bytearray(data_bytes)
        tmp.reverse()
        return bytes(tmp)

    @staticmethod
    def Xor(data_bytes_1: bytes,
            data_bytes_2: bytes) -> bytes:
        """
        XOR the specified bytes.

        Args:
            data_bytes_1 (bytes): Data bytes 1
            data_bytes_2 (bytes): Data bytes 2

        Returns:
            bytes: XORed bytes
        """
        return bytes(
            [b1 ^ b2 for b1, b2 in zip(data_bytes_1, data_bytes_2)]
        )

    @staticmethod
    def AddNoCarry(data_bytes_1: bytes,
                   data_bytes_2: bytes) -> bytes:
        """
        Add the specified bytes (byte-by-byte, no carry).

        Args:
            data_bytes_1 (bytes): Data bytes 1
            data_bytes_2 (bytes): Data bytes 2

        Returns:
            bytes: XORed bytes
        """
        return bytes(
            [(b1 + b2) & 0xFF for b1, b2 in zip(data_bytes_1, data_bytes_2)]
        )

    @staticmethod
    def MultiplyScalarNoCarry(data_bytes: bytes,
                              scalar: int) -> bytes:
        """
        Multiply the specified bytes with the specified scalar (byte-by-byte, no carry).

        Args:
            data_bytes (bytes): Data bytes
            scalar (int)      : Scalar

        Returns:
            bytes: XORed bytes
        """
        return bytes(
            [(b * scalar) & 0xFF for b in data_bytes]
        )

    @staticmethod
    def ToBinaryStr(data_bytes: bytes,
                    zero_pad_bit_len: int = 0) -> str:
        """
        Convert the specified bytes to a binary string.

        Args:
            data_bytes (bytes)              : Data bytes
            zero_pad_bit_len (int, optional): Zero pad length in bits, 0 if not specified

        Returns:
            str: Binary string
        """
        return IntegerUtils.ToBinaryStr(BytesUtils.ToInteger(data_bytes), zero_pad_bit_len)

    @staticmethod
    def ToInteger(data_bytes: bytes,
                  endianness: Literal["little", "big"] = "big",
                  signed: bool = False) -> int:
        """
        Convert the specified bytes to integer.

        Args:
            data_bytes (bytes)                      : Data bytes
            endianness ("big" or "little", optional): Endianness (default: big)
            signed (bool, optional)                 : True if signed, false otherwise (default: false)

        Returns:
            int: Integer representation
        """
        return int.from_bytes(data_bytes, byteorder=endianness, signed=signed)

    @staticmethod
    def FromBinaryStr(data: Union[bytes, str],
                      zero_pad_byte_len: int = 0) -> bytes:
        """
        Convert the specified binary string to bytes.

        Args:
            data (str or bytes)              : Data
            zero_pad_byte_len (int, optional): Zero pad length in bytes, 0 if not specified

        Returns:
            bytes: Bytes representation
        """
        return binascii.unhexlify(hex(IntegerUtils.FromBinaryStr(data))[2:].zfill(zero_pad_byte_len))

    @staticmethod
    def ToHexString(data_bytes: bytes,
                    encoding: str = "utf-8") -> str:
        """
        Convert bytes to hex string.

        Args:
            data_bytes (bytes)      : Data bytes
            encoding (str, optional): Encoding type, utf-8 by default

        Returns:
            str: Bytes converted to hex string
        """
        return AlgoUtils.Decode(binascii.hexlify(data_bytes), encoding)

    @staticmethod
    def FromHexString(data: Union[bytes, str]) -> bytes:
        """
        Convert hex string to bytes.

        Args:
            data (str or bytes): Data bytes

        Returns
            bytes: Hex string converted to bytes
        """
        return binascii.unhexlify(AlgoUtils.Encode(data))

    @staticmethod
    def FromList(data_list: List[int]) -> bytes:
        """
        Convert the specified list of integers to bytes.

        Args:
            data_list (list[int]): List of integers

        Returns:
            bytes: Bytes representation
        """
        return bytes(data_list)

    @staticmethod
    def ToList(data_bytes: bytes) -> List[int]:
        """
        Convert the specified bytes to a list of integers.

        Args:
            data_bytes (bytes): Data bytes

        Returns:
            list[int]: List of integers
        """
        return list(data_bytes)

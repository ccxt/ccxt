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

"""Module with some integer utility functions."""

# Imports
from typing import Optional, Union

from .algo import AlgoUtils
from ..typing import Literal


class IntegerUtils:
    """Class container for integer utility functions."""

    @staticmethod
    def GetBytesNumber(data_int: int) -> int:
        """
        Get the number of bytes of the specified integer.

        Args:
            data_int (int): Data integer

        Returns:
            int: Number of bytes
        """
        return ((data_int.bit_length() if data_int > 0 else 1) + 7) // 8

    @staticmethod
    def ToBytes(data_int: int,
                bytes_num: Optional[int] = None,
                endianness: Literal["little", "big"] = "big",
                signed: bool = False) -> bytes:
        """
        Convert integer to bytes.

        Args:
            data_int (int)                          : Data integer
            bytes_num (int, optional)               : Number of bytes, automatic if None
            endianness ("big" or "little", optional): Endianness (default: big)
            signed (bool, optional)                 : True if signed, false otherwise (default: false)

        Returns:
            bytes: Bytes representation
        """

        # In case gmpy is used
        if data_int.__class__.__name__ == "mpz":
            data_int = int(data_int)

        bytes_num = bytes_num or IntegerUtils.GetBytesNumber(data_int)
        return data_int.to_bytes(bytes_num, byteorder=endianness, signed=signed)

    @staticmethod
    def FromBinaryStr(data: Union[bytes, str]) -> int:
        """
        Convert the specified binary string to integer.

        Args:
            data (str or bytes): Data

        Returns:
            int: Integer representation
        """
        return int(AlgoUtils.Encode(data), 2)

    @staticmethod
    def ToBinaryStr(data_int: int,
                    zero_pad_bit_len: int = 0) -> str:
        """
        Convert the specified integer to a binary string.

        Args:
            data_int (int)                  : Data integer
            zero_pad_bit_len (int, optional): Zero pad length in bits, 0 if not specified

        Returns:
            str: Binary string
        """
        return bin(data_int)[2:].zfill(zero_pad_bit_len)

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

"""Module for base bech32 decoding/encoding."""

# Imports
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple, Union

from .bech32_ex import Bech32ChecksumError
from ..utils.misc import AlgoUtils


class Bech32BaseConst:
    """Class container for Bech32 constants."""

    # Character set
    CHARSET: str = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"


class Bech32BaseUtils:
    """Class container for Bech32 utility functions."""

    @staticmethod
    def ConvertToBase32(data: Union[List[int], bytes]) -> List[int]:
        """
        Convert data to base32.

        Args:
            data (list[int] or bytes): Data to be converted

        Returns:
            list[int]: Converted data

        Raises:
            ValueError: If the string is not valid
        """

        # Convert to base32
        conv_data = Bech32BaseUtils.ConvertBits(data, 8, 5)
        if conv_data is None:
            raise ValueError("Invalid data, cannot perform conversion to base32")

        return conv_data

    @staticmethod
    def ConvertFromBase32(data: Union[List[int], bytes]) -> List[int]:
        """
        Convert data from base32.

        Args:
            data (list[int] or bytes): Data to be converted

        Returns:
            list[int]: Converted data

        Raises:
            ValueError: If the string is not valid
        """

        # Convert from base32
        conv_data = Bech32BaseUtils.ConvertBits(data, 5, 8, False)
        if conv_data is None:
            raise ValueError("Invalid data, cannot perform conversion from base32")

        return conv_data

    @staticmethod
    def ConvertBits(data: Union[bytes, List[int]],
                    from_bits: int,
                    to_bits: int,
                    pad: bool = True) -> Optional[List[int]]:
        """
        Perform bit conversion.
        The function takes the input data (list of integers or byte sequence) and convert every value from
        the specified number of bits to the specified one.
        It returns a list of integer where every number is less than 2^to_bits.

        Args:
            data (list[int] or bytes): Data to be converted
            from_bits (int)          : Number of bits to start from
            to_bits (int)            : Number of bits to end with
            pad (bool, optional)     : True if data must be padded with zeros, false otherwise

        Returns:
            list[int]: List of converted values, None in case of errors
        """
        max_out_val = (1 << to_bits) - 1
        max_acc = (1 << (from_bits + to_bits - 1)) - 1

        acc = 0
        bits = 0
        ret = []

        for value in data:
            # Value shall not be less than zero or greater than 2^from_bits
            if value < 0 or (value >> from_bits):
                return None
            # Continue accumulating until greater than to_bits
            acc = ((acc << from_bits) | value) & max_acc
            bits += from_bits
            while bits >= to_bits:
                bits -= to_bits
                ret.append((acc >> bits) & max_out_val)
        if pad:
            if bits:
                # Pad the value with zeros to reach to_bits
                ret.append((acc << (to_bits - bits)) & max_out_val)
        elif bits >= from_bits or ((acc << (to_bits - bits)) & max_out_val):
            return None

        return ret


class Bech32EncoderBase(ABC):
    """
    Bech32 encoder base class.
    It provides methods for encoding to Bech32 format.
    """

    @classmethod
    def _EncodeBech32(cls,
                      hrp: str,
                      data: List[int],
                      sep: str) -> str:
        """
        Encode a Bech32 string from the specified HRP and data.

        Args:
            hrp (str)       : HRP
            data (list[int]): Data part
            sep (str)       : Bech32 separator

        Returns:
            str: Encoded data
        """

        # Add checksum to data
        data += cls._ComputeChecksum(hrp, data)
        # Encode to alphabet
        return hrp + sep + "".join([Bech32BaseConst.CHARSET[d] for d in data])

    @staticmethod
    @abstractmethod
    def _ComputeChecksum(hrp: str,
                         data: List[int]) -> List[int]:
        """
        Compute the checksum from the specified HRP and data.

        Args:
            hrp (str)       : HRP
            data (list[int]): Data part

        Returns:
            list[int]: Computed checksum
        """


class Bech32DecoderBase(ABC):
    """
    Bech32 decoder base class.
    It provides methods for decoding Bech32 format.
    """

    @classmethod
    def _DecodeBech32(cls,
                      bech_str: str,
                      sep: str,
                      checksum_len: int) -> Tuple[str, List[int]]:
        """
        Decode and validate a Bech32 string, determining its HRP and data.

        Args:
            bech_str (str)    : Bech32 string
            sep (str)         : Bech32 separator
            checksum_len (int): Checksum length

        Returns:
            tuple[str, list[int]]: HRP (index 0) and data part (index 1)

        Raises:
            ValueError: If the string is not valid
            Bech32ChecksumError: If the checksum is not valid
        """

        # Check string length and case
        if AlgoUtils.IsStringMixed(bech_str):
            raise ValueError("Invalid bech32 format (string is mixed case)")

        # Lower string
        bech_str = bech_str.lower()

        # Find separator and check its position
        sep_pos = bech_str.rfind(sep)
        if sep_pos == -1:
            raise ValueError("Invalid bech32 format (no separator found)")

        # Get HRP and check it
        hrp = bech_str[:sep_pos]
        if len(hrp) == 0 or any(ord(x) < 33 or ord(x) > 126 for x in hrp):
            raise ValueError(f"Invalid bech32 format (HRP not valid: {hrp})")

        # Get data and check it
        data_part = bech_str[sep_pos + 1:]
        if (len(data_part) < (checksum_len + 1)
                or not all(x in Bech32BaseConst.CHARSET for x in data_part)):
            raise ValueError("Invalid bech32 format (data part not valid)")

        # Convert back from alphabet and verify checksum
        int_data = [Bech32BaseConst.CHARSET.find(x) for x in data_part]
        if not cls._VerifyChecksum(hrp, int_data):
            raise Bech32ChecksumError("Invalid bech32 checksum")

        return hrp, int_data[:-checksum_len]

    @staticmethod
    @abstractmethod
    def _VerifyChecksum(hrp: str,
                        data: List[int]) -> bool:
        """
        Verify the checksum from the specified HRP and converted data characters.

        Args:
            hrp  (str)      : HRP
            data (list[int]): Data part

        Returns:
            bool: True if valid, false otherwise
        """

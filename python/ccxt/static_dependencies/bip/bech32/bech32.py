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

"""
Module for bech32/bech32m decoding/encoding.

References:
    https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
    https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki
    https://github.com/sipa/bech32/blob/master/ref/python/segwit_addr.py
"""

# Imports
from enum import Enum, auto, unique
from typing import Dict, List

from .bech32_base import Bech32BaseUtils, Bech32DecoderBase, Bech32EncoderBase
from ..utils.misc import BytesUtils


@unique
class Bech32Encodings(Enum):
    """Enumerative for Bech32 encoding types."""

    BECH32 = auto()
    BECH32M = auto()


class Bech32Const:
    """Class container for Bech32 constants."""

    # Separator
    SEPARATOR: str = "1"
    # Checksum length
    CHECKSUM_STR_LEN: int = 6
    # Encoding checksum constants
    ENCODING_CHECKSUM_CONST: Dict[Bech32Encodings, int] = {
        Bech32Encodings.BECH32: 1,
        Bech32Encodings.BECH32M: 0x2bc830a3,
    }


class Bech32Utils:
    """Class container for Bech32 utility functions."""

    @staticmethod
    def PolyMod(values: List[int]) -> int:
        """
        Computes the polynomial modulus.

        Args:
            values (list[int]): List of polynomial coefficients

        Returns:
            int: Computed modulus
        """

        # Generator polynomial
        generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

        # Compute modulus
        chk = 1
        for value in values:
            top = chk >> 25
            chk = (chk & 0x1ffffff) << 5 ^ value
            for i in range(5):
                chk ^= generator[i] if ((top >> i) & 1) else 0
        return chk

    @staticmethod
    def HrpExpand(hrp: str) -> List[int]:
        """
        Expand the HRP into values for checksum computation.

        Args:
            hrp (str): HRP

        Returns:
            list[int]: Expanded HRP values
        """
        # [upper 3 bits of each character] + [0] + [lower 5 bits of each character]
        return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 0x1f for x in hrp]

    @staticmethod
    def ComputeChecksum(hrp: str,
                        data: List[int],
                        encoding: Bech32Encodings = Bech32Encodings.BECH32) -> List[int]:
        """
        Compute the checksum from the specified HRP and data.

        Args:
            hrp (str)                           : HRP
            data (list[int])                    : Data part
            encoding (Bech32Encodings, optional): Encoding type (BECH32 by default)

        Returns:
            list[int]: Computed checksum
        """
        values = Bech32Utils.HrpExpand(hrp) + data
        polymod = Bech32Utils.PolyMod(values + [0, 0, 0, 0, 0, 0]) ^ Bech32Const.ENCODING_CHECKSUM_CONST[encoding]
        return [(polymod >> 5 * (5 - i)) & 0x1f for i in range(Bech32Const.CHECKSUM_STR_LEN)]

    @staticmethod
    def VerifyChecksum(hrp: str,
                       data: List[int],
                       encoding: Bech32Encodings = Bech32Encodings.BECH32) -> bool:
        """
        Verify the checksum from the specified HRP and converted data characters.

        Args:
            hrp  (str)                          : HRP
            data (list[int])                    : Data part
            encoding (Bech32Encodings, optional): Encoding type (BECH32 by default)

        Returns:
            bool: True if valid, false otherwise
        """
        polymod = Bech32Utils.PolyMod(Bech32Utils.HrpExpand(hrp) + data)
        return polymod == Bech32Const.ENCODING_CHECKSUM_CONST[encoding]


class Bech32Encoder(Bech32EncoderBase):
    """
    Bech32 encoder class.
    It provides methods for encoding to Bech32 format.
    """

    @classmethod
    def Encode(cls,
               hrp: str,
               data: bytes) -> str:
        """
        Encode to Bech32.

        Args:
            hrp (str)   : HRP
            data (bytes): Data

        Returns:
            str: Encoded address

        Raises:
            ValueError: If the data is not valid
        """
        return cls._EncodeBech32(hrp,
                                 Bech32BaseUtils.ConvertToBase32(data),
                                 Bech32Const.SEPARATOR)

    @staticmethod
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

        # Same as Segwit
        return Bech32Utils.ComputeChecksum(hrp, data)


class Bech32Decoder(Bech32DecoderBase):
    """
    Bech32 decoder class.
    It provides methods for decoding  Bech32 format.
    """

    @classmethod
    def Decode(cls,
               hrp: str,
               addr: str) -> bytes:
        """
        Decode from Bech32.

        Args:
            hrp (str) : Human readable part
            addr (str): Address

        Returns:
            bytes: Decoded address

        Raises:
            ValueError: If the bech32 string is not valid
            Bech32ChecksumError: If the checksum is not valid
        """

        # Decode string
        hrp_got, data = cls._DecodeBech32(addr,
                                          Bech32Const.SEPARATOR,
                                          Bech32Const.CHECKSUM_STR_LEN)
        # Check HRP
        if hrp != hrp_got:
            raise ValueError(f"Invalid format (HRP not valid, expected {hrp}, got {hrp_got})")

        # Convert back from base32
        return BytesUtils.FromList(
            Bech32BaseUtils.ConvertFromBase32(data)
        )

    @staticmethod
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
        return Bech32Utils.VerifyChecksum(hrp, data)

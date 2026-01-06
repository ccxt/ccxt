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
Module for segwit bech32/bech32m decoding/encoding.

References:
    https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
    https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki
"""

# Imports
from typing import List, Tuple

from .bech32 import Bech32Const, Bech32Encodings, Bech32Utils
from .bech32_base import Bech32BaseUtils, Bech32DecoderBase, Bech32EncoderBase
from ..utils.misc import BytesUtils


class SegwitBech32Const:
    """Class container for Segwit Bech32 constants."""

    # Separator
    SEPARATOR: str = Bech32Const.SEPARATOR
    # Checksum length
    CHECKSUM_STR_LEN: int = Bech32Const.CHECKSUM_STR_LEN
    # Minimum witness program length in bytes
    WITNESS_PROG_MIN_BYTE_LEN: int = 2
    # Maximum witness program length in bytes
    WITNESS_PROG_MAX_BYTE_LEN: int = 40
    # Witness version for Bech32 encoding
    WITNESS_VER_BECH32: int = 0
    # Witness version maximum value
    WITNESS_VER_MAX_VAL: int = 16
    # Accepted data lengths when witness version is zero
    WITNESS_VER_ZERO_DATA_BYTE_LEN: Tuple[int, int] = (20, 32)


class SegwitBech32Encoder(Bech32EncoderBase):
    """
    Segwit Bech32 encoder class.
    It provides methods for encoding to Segwit Bech32 format.
    """

    @classmethod
    def Encode(cls,
               hrp: str,
               wit_ver: int,
               wit_prog: bytes) -> str:
        """
        Encode to Segwit Bech32.

        Args:
            hrp (str)       : HRP
            wit_ver (int)   : Witness version
            wit_prog (bytes): Witness program

        Returns:
            str: Encoded address

        Raises:
            ValueError: If the data is not valid
        """
        return cls._EncodeBech32(hrp,
                                 [wit_ver] + Bech32BaseUtils.ConvertToBase32(wit_prog),
                                 SegwitBech32Const.SEPARATOR)

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
        encoding = (Bech32Encodings.BECH32
                    if data[0] == SegwitBech32Const.WITNESS_VER_BECH32
                    else Bech32Encodings.BECH32M)

        return Bech32Utils.ComputeChecksum(hrp, data, encoding)


class SegwitBech32Decoder(Bech32DecoderBase):
    """
    Segwit Bech32 decoder class.
    It provides methods for decoding Segwit Bech32 format.
    """

    @classmethod
    def Decode(cls,
               hrp: str,
               addr: str) -> Tuple[int, bytes]:
        """
        Decode from Segwit Bech32.

        Args:
            hrp (str) : Human readable part
            addr (str): Address

        Returns:
            tuple[int, bytes]: Witness version (index 0) and witness program (index 1)

        Raises:
            Bech32ChecksumError: If the checksum is not valid
            ValueError: If the bech32 string is not valid
        """

        # Decode string
        hrp_got, data = cls._DecodeBech32(addr,
                                          SegwitBech32Const.SEPARATOR,
                                          SegwitBech32Const.CHECKSUM_STR_LEN)
        # Check HRP
        if hrp != hrp_got:
            raise ValueError(
                f"Invalid format (HRP not valid, expected {hrp}, got {hrp_got})"
            )

        # Convert back from base32 (remove witness version)
        conv_data = Bech32BaseUtils.ConvertFromBase32(data[1:])

        # Check data length
        if (len(conv_data) < SegwitBech32Const.WITNESS_PROG_MIN_BYTE_LEN
                or len(conv_data) > SegwitBech32Const.WITNESS_PROG_MAX_BYTE_LEN):
            raise ValueError(f"Invalid format (witness program length not valid: {len(conv_data)})")
        # Check witness version
        wit_ver = data[0]
        if wit_ver > SegwitBech32Const.WITNESS_VER_MAX_VAL:
            raise ValueError(f"Invalid format (witness version not valid: {wit_ver})")
        if wit_ver == 0 and not len(conv_data) in SegwitBech32Const.WITNESS_VER_ZERO_DATA_BYTE_LEN:
            raise ValueError(f"Invalid format (length not valid: {len(conv_data)})")

        return wit_ver, BytesUtils.FromList(conv_data)

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
        encoding = (Bech32Encodings.BECH32
                    if data[0] == SegwitBech32Const.WITNESS_VER_BECH32
                    else Bech32Encodings.BECH32M)

        return Bech32Utils.VerifyChecksum(hrp, data, encoding)

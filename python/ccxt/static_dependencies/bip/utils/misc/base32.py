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

"""Module with helper class for Base32."""

# Imports
import base64
import binascii
from typing import Optional, Union

from .algo import AlgoUtils


class Base32Const:
    """Class container for Base32 constants."""

    # Alphabet
    ALPHABET: str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    # Padding character
    PADDING_CHAR: str = "="


class _Base32Utils:
    """
    Base32 utility class.
    It provides some helper methods for decoding/encoding Base32 format.
    """

    @staticmethod
    def AddPadding(data: str) -> str:
        """
        Add padding to an encoded Base32 string.
        Used if the string was encoded with Base32Encoder.EncodeNoPadding

        Args:
            data (str): Data

        Returns:
            str: Padded string
        """
        last_block_width = len(data) % 8
        if last_block_width != 0:
            data += (8 - last_block_width) * Base32Const.PADDING_CHAR
        return data

    @staticmethod
    def TranslateAlphabet(data: str,
                          from_alphabet: str,
                          to_alphabet: str) -> str:
        """
        Translate the standard Base32 alphabet to a custom one.

        Args:
            data (str)         : Data
            from_alphabet (str): Starting alphabet string
            to_alphabet (str)  : Final alphabet string

        Returns:
            str: String with translated alphabet
        """
        return data.translate(str.maketrans(from_alphabet, to_alphabet))


class Base32Decoder:
    """
    Base32 decoder class.
    It provides methods for decoding to Base32 format.
    """

    @staticmethod
    def Decode(data: str,
               custom_alphabet: Optional[str] = None) -> bytes:
        """
        Decode from Base32.

        Args:
            data (str)                     : Data
            custom_alphabet (str, optional): Custom alphabet string

        Returns:
            bytes: Decoded bytes

        Raises:
            ValueError: If the Base32 string is not valid
        """
        try:
            data_dec = _Base32Utils.AddPadding(data)
            if custom_alphabet is not None:
                data_dec = _Base32Utils.TranslateAlphabet(data_dec, custom_alphabet, Base32Const.ALPHABET)

            return base64.b32decode(data_dec)
        except binascii.Error as ex:
            raise ValueError("Invalid Base32 string") from ex


class Base32Encoder:
    """
    Base32 encoder class.
    It provides methods for encoding to Base32 format.
    """

    @staticmethod
    def Encode(data: Union[bytes, str],
               custom_alphabet: Optional[str] = None) -> str:
        """
        Encode to Base32.

        Args:
            data (str or bytes)            : Data
            custom_alphabet (str, optional): Custom alphabet string

        Returns:
            str: Encoded string
        """
        b32_enc = AlgoUtils.Decode(base64.b32encode(AlgoUtils.Encode(data)))
        if custom_alphabet is not None:
            b32_enc = _Base32Utils.TranslateAlphabet(b32_enc, Base32Const.ALPHABET, custom_alphabet)

        return b32_enc

    @staticmethod
    def EncodeNoPadding(data: Union[bytes, str],
                        custom_alphabet: Optional[str] = None) -> str:
        """
        Encode to Base32 by removing the final padding.

        Args:
            data (str or bytes)            : Data
            custom_alphabet (str, optional): Custom alphabet string

        Returns:
            str: Encoded string
        """
        return Base32Encoder.Encode(data, custom_alphabet).rstrip(Base32Const.PADDING_CHAR)

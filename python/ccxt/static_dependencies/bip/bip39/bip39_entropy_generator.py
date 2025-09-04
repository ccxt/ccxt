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

"""Module for BIP39 mnemonic entropy generation."""

# Imports
from enum import IntEnum, unique
from typing import List, Union

from ..utils.mnemonic import EntropyGenerator


@unique
class Bip39EntropyBitLen(IntEnum):
    """Enumerative for BIP39 entropy bit lengths."""

    BIT_LEN_128 = 128
    BIT_LEN_160 = 160
    BIT_LEN_192 = 192
    BIT_LEN_224 = 224
    BIT_LEN_256 = 256


class Bip39EntropyGeneratorConst:
    """Class container for BIP39 entropy generator constants."""

    # Accepted entropy lengths in bit
    ENTROPY_BIT_LEN: List[Bip39EntropyBitLen] = [
        Bip39EntropyBitLen.BIT_LEN_128,
        Bip39EntropyBitLen.BIT_LEN_160,
        Bip39EntropyBitLen.BIT_LEN_192,
        Bip39EntropyBitLen.BIT_LEN_224,
        Bip39EntropyBitLen.BIT_LEN_256,
    ]


class Bip39EntropyGenerator(EntropyGenerator):
    """
    BIP39 entropy generator class.
    It generates random entropy bytes with the specified length.
    """

    def __init__(self,
                 bit_len: Union[int, Bip39EntropyBitLen]) -> None:
        """
        Construct class.

        Args:
            bit_len (int or Bip39EntropyBitLen): Entropy length in bits

        Raises:
            ValueError: If the bit length is not valid
        """
        if not self.IsValidEntropyBitLen(bit_len):
            raise ValueError(f"Entropy bit length is not valid ({bit_len})")
        super().__init__(bit_len)

    @staticmethod
    def IsValidEntropyBitLen(bit_len: Union[int, Bip39EntropyBitLen]) -> bool:
        """
        Get if the specified entropy bit length is valid.

        Args:
            bit_len (int or Bip39EntropyBitLen): Entropy length in bits

        Returns:
            bool: True if valid, false otherwise
        """
        return bit_len in Bip39EntropyGeneratorConst.ENTROPY_BIT_LEN

    @staticmethod
    def IsValidEntropyByteLen(byte_len: int) -> bool:
        """
        Get if the specified entropy byte length is valid.

        Args:
            byte_len (int): Entropy length in bytes

        Returns:
            bool: True if valid, false otherwise
        """
        return Bip39EntropyGenerator.IsValidEntropyBitLen(byte_len * 8)

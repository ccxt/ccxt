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

"""Module for BIP39 mnemonic generation."""

# Imports
from typing import Union

from .bip39_entropy_generator import Bip39EntropyGenerator
from .bip39_mnemonic import Bip39Languages, Bip39MnemonicConst, Bip39WordsNum
from .bip39_mnemonic_encoder import Bip39MnemonicEncoder
from ..utils.mnemonic import Mnemonic


class Bip39MnemonicGenerator:
    """
    BIP39 mnemonic generator class. It generates mnemonics in according to BIP39.
    Mnemonic can be generated randomly from words number or from a specified entropy.
    """

    m_mnemonic_encoder: Bip39MnemonicEncoder

    def __init__(self,
                 lang: Bip39Languages = Bip39Languages.ENGLISH) -> None:
        """
        Construct class.

        Args:
            lang (Bip39Languages, optional): Language (default: English)

        Raises:
            TypeError: If the language is not a Bip39Languages enum
            ValueError: If language words list is not valid
        """
        self.m_mnemonic_encoder = Bip39MnemonicEncoder(lang)

    def FromWordsNumber(self,
                        words_num: Union[int, Bip39WordsNum]) -> Mnemonic:
        """
        Generate mnemonic with the specified words number from random entropy.

        Args:
            words_num (int or Bip39WordsNum): Number of words (12, 15, 18, 21, 24)

        Returns:
            Mnemonic object: Generated mnemonic

        Raises:
            ValueError: If words number is not valid
        """

        # Check words number
        if words_num not in Bip39MnemonicConst.MNEMONIC_WORD_NUM:
            raise ValueError(f"Words number for mnemonic ({words_num}) is not valid")

        # Get entropy length in bit from words number
        entropy_bit_len = self.__EntropyBitLenFromWordsNum(words_num)
        # Generate entropy
        entropy_bytes = Bip39EntropyGenerator(entropy_bit_len).Generate()

        return self.FromEntropy(entropy_bytes)

    def FromEntropy(self,
                    entropy_bytes: bytes) -> Mnemonic:
        """
        Generate mnemonic from the specified entropy bytes.

        Args:
            entropy_bytes (bytes): Entropy bytes (accepted lengths in bits: 128, 160, 192, 224, 256)

        Returns:
            Mnemonic object: Generated mnemonic

        Raises:
            ValueError: If entropy byte length is not valid
        """
        return self.m_mnemonic_encoder.Encode(entropy_bytes)

    @staticmethod
    def __EntropyBitLenFromWordsNum(words_num: int) -> int:
        """
        Get entropy length from words number.

        Args:
            words_num (int): Words number

        Returns:
            int: Correspondent entropy length
        """
        return (words_num * Bip39MnemonicConst.WORD_BIT_LEN) - (words_num // 3)

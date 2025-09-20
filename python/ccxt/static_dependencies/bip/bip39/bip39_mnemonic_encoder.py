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
Module for BIP39 mnemonic encoding.
Reference: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
"""

# Imports
from .bip39_entropy_generator import Bip39EntropyGenerator
from .bip39_mnemonic import Bip39Languages, Bip39Mnemonic, Bip39MnemonicConst
from .bip39_mnemonic_utils import Bip39WordsListGetter
from ..utils.crypto import Sha256
from ..utils.misc import BytesUtils, IntegerUtils
from ..utils.mnemonic import Mnemonic, MnemonicEncoderBase


class Bip39MnemonicEncoder(MnemonicEncoderBase):
    """
    BIP39 mnemonic encoder class.
    It encodes bytes to the mnemonic phrase.
    """

    def __init__(self,
                 lang: Bip39Languages = Bip39Languages.ENGLISH) -> None:
        """
        Construct class.

        Args:
            lang (Bip39Languages, optional): Language (default: English)

        Raises:
            TypeError: If the language is not a Bip39Languages enum
            ValueError: If loaded words list is not valid
        """
        super().__init__(lang, Bip39WordsListGetter)

    def Encode(self,
               entropy_bytes: bytes) -> Mnemonic:
        """
        Encode bytes to mnemonic phrase.

        Args:
            entropy_bytes (bytes): Entropy bytes (accepted lengths in bits: 128, 160, 192, 224, 256)

        Returns:
            Mnemonic object: Encoded mnemonic

        Raises:
            ValueError: If entropy is not valid
        """

        # Check entropy length
        entropy_byte_len = len(entropy_bytes)
        if not Bip39EntropyGenerator.IsValidEntropyByteLen(entropy_byte_len):
            raise ValueError(f"Entropy byte length ({entropy_byte_len}) is not valid")

        # Convert entropy to binary string
        entropy_bin_str = BytesUtils.ToBinaryStr(entropy_bytes, entropy_byte_len * 8)
        # Get entropy hash as binary string
        entropy_hash_bin_str = BytesUtils.ToBinaryStr(Sha256.QuickDigest(entropy_bytes),
                                                      Sha256.DigestSize() * 8)
        # Get mnemonic binary string by concatenating entropy and checksum
        mnemonic_bin_str = entropy_bin_str + entropy_hash_bin_str[:entropy_byte_len // 4]

        # Get mnemonic from entropy
        mnemonic = []
        for i in range(len(mnemonic_bin_str) // Bip39MnemonicConst.WORD_BIT_LEN):
            # Get current word index
            word_bin_str = (mnemonic_bin_str[i * Bip39MnemonicConst.WORD_BIT_LEN:(i + 1)
                            * Bip39MnemonicConst.WORD_BIT_LEN])
            word_idx = IntegerUtils.FromBinaryStr(word_bin_str)
            # Get word at given index
            mnemonic.append(self.m_words_list.GetWordAtIdx(word_idx))

        return Bip39Mnemonic.FromList(mnemonic)

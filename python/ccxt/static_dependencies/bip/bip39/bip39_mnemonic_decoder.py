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
Module for BIP39 mnemonic decoding.
Reference: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
"""

# Imports
from typing import Optional, Union

from .bip39_mnemonic import Bip39Languages, Bip39Mnemonic, Bip39MnemonicConst
from .bip39_mnemonic_utils import Bip39WordsListFinder, Bip39WordsListGetter
from ..utils.crypto import Sha256
from ..utils.misc import BytesUtils, IntegerUtils
from ..utils.mnemonic import Mnemonic, MnemonicChecksumError, MnemonicDecoderBase, MnemonicWordsList


class Bip39MnemonicDecoder(MnemonicDecoderBase):
    """
    BIP39 mnemonic decoder class.
    It decodes a mnemonic phrase to bytes.
    """

    def __init__(self,
                 lang: Optional[Bip39Languages] = None) -> None:
        """
        Construct class.

        Args:
            lang (Bip39Languages, optional): Language, None for automatic detection

        Raises:
            TypeError: If the language is not a Bip39Languages enum
            ValueError: If loaded words list is not valid
        """
        super().__init__(lang, Bip39WordsListFinder, Bip39WordsListGetter)

    def Decode(self,
               mnemonic: Union[str, Mnemonic]) -> bytes:
        """
        Decode a mnemonic phrase to bytes (no checksum).

        Args:
            mnemonic (str or Mnemonic object): Mnemonic

        Returns:
            bytes: Decoded bytes (no checksum)

        Raises:
            MnemonicChecksumError: If checksum is not valid
            ValueError: If mnemonic is not valid
        """
        mnemonic_bin_str = self.__DecodeAndVerifyBinaryStr(mnemonic)

        return self.__EntropyBytesFromBinaryStr(mnemonic_bin_str)

    def DecodeWithChecksum(self,
                           mnemonic: Union[str, Mnemonic]) -> bytes:
        """
        Decode a mnemonic phrase to bytes (with checksum).

        Args:
            mnemonic (str or Mnemonic object): Mnemonic

        Returns:
            bytes: Decoded bytes (with checksum)

        Raises:
            MnemonicChecksumError: If checksum is not valid
            ValueError: If mnemonic is not valid
        """
        mnemonic_bin_str = self.__DecodeAndVerifyBinaryStr(mnemonic)

        # Compute pad bit length
        mnemonic_bit_len = len(mnemonic_bin_str)
        pad_bit_len = (mnemonic_bit_len
                       if mnemonic_bit_len % 8 == 0
                       else mnemonic_bit_len + (8 - mnemonic_bit_len % 8))

        return BytesUtils.FromBinaryStr(mnemonic_bin_str, pad_bit_len // 4)

    def __DecodeAndVerifyBinaryStr(self,
                                   mnemonic: Union[str, Mnemonic]) -> str:
        """
        Decode a mnemonic phrase to its mnemonic binary string by verifying the checksum.

        Args:
            mnemonic (str or Mnemonic object): Mnemonic

        Returns:
            str: Mnemonic binary string

        Raises:
            MnemonicChecksumError: If checksum is not valid
            ValueError: If mnemonic is not valid
        """
        mnemonic_obj = Bip39Mnemonic.FromString(mnemonic) if isinstance(mnemonic, str) else mnemonic

        # Check mnemonic length
        if mnemonic_obj.WordsCount() not in Bip39MnemonicConst.MNEMONIC_WORD_NUM:
            raise ValueError(f"Mnemonic words count is not valid ({mnemonic_obj.WordsCount()})")

        # Detect language if it was not specified at construction
        words_list, _ = self._FindLanguage(mnemonic_obj)

        # Get back mnemonic binary string
        mnemonic_bin_str = self.__MnemonicToBinaryStr(mnemonic_obj, words_list)

        # Verify checksum
        checksum_bin_str = mnemonic_bin_str[-self.__GetChecksumLen(mnemonic_bin_str):]
        checksum_bin_str_got = self.__ComputeChecksumBinaryStr(mnemonic_bin_str)

        if checksum_bin_str != checksum_bin_str_got:
            raise MnemonicChecksumError(
                f"Invalid checksum (expected {checksum_bin_str}, got {checksum_bin_str_got})"
            )

        return mnemonic_bin_str

    def __ComputeChecksumBinaryStr(self,
                                   mnemonic_bin_str: str) -> str:
        """
        Compute checksum from mnemonic binary string.

        Args:
            mnemonic_bin_str (str): Mnemonic binary string

        Returns:
           str: Computed checksum binary string
        """

        # Get entropy bytes
        entropy_bytes = self.__EntropyBytesFromBinaryStr(mnemonic_bin_str)
        # Convert entropy hash to binary string
        entropy_hash_bin_str = BytesUtils.ToBinaryStr(Sha256.QuickDigest(entropy_bytes),
                                                      Sha256.DigestSize() * 8)

        # Return checksum
        return entropy_hash_bin_str[:self.__GetChecksumLen(mnemonic_bin_str)]

    def __EntropyBytesFromBinaryStr(self,
                                    mnemonic_bin_str: str) -> bytes:
        """
        Get entropy bytes from mnemonic binary string.

        Args:
            mnemonic_bin_str (str): Mnemonic binary string

        Returns:
           bytes: Entropy bytes
        """

        # Get checksum length
        checksum_len = self.__GetChecksumLen(mnemonic_bin_str)
        # Get back entropy binary string
        entropy_bin_str = mnemonic_bin_str[:-checksum_len]

        # Get entropy bytes from binary string
        return BytesUtils.FromBinaryStr(entropy_bin_str, checksum_len * 8)

    @staticmethod
    def __MnemonicToBinaryStr(mnemonic: Mnemonic,
                              words_list: MnemonicWordsList) -> str:
        """
        Get mnemonic binary string from mnemonic phrase.

        Args:
            mnemonic (Mnemonic object)           : Mnemonic object
            words_list (MnemonicWordsList object): Words list object

        Returns:
           str: Mnemonic binary string

        Raises:
            ValueError: If the one of the mnemonic word is not valid
        """

        # Convert each word to its index in binary format
        mnemonic_bin_str = map(lambda word: IntegerUtils.ToBinaryStr(words_list.GetWordIdx(word),
                                                                     Bip39MnemonicConst.WORD_BIT_LEN),
                               mnemonic.ToList())

        return "".join(mnemonic_bin_str)

    @staticmethod
    def __GetChecksumLen(mnemonic_bin_str: str) -> int:
        """
        Get checksum length from mnemonic binary string.

        Args:
            mnemonic_bin_str (str): Mnemonic binary string

        Returns:
           int: Checksum length
        """
        return len(mnemonic_bin_str) // 33

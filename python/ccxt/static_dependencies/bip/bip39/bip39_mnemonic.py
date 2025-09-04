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

"""Module for BIP39 mnemonic."""

# Imports
from enum import IntEnum, auto, unique
from typing import Dict, List, Union

from ..utils.misc import StringUtils
from ..utils.mnemonic import Mnemonic, MnemonicLanguages


@unique
class Bip39WordsNum(IntEnum):
    """Enumerative for BIP39 words number."""

    WORDS_NUM_12 = 12
    WORDS_NUM_15 = 15
    WORDS_NUM_18 = 18
    WORDS_NUM_21 = 21
    WORDS_NUM_24 = 24


@unique
class Bip39Languages(MnemonicLanguages):
    """Enumerative for BIP39 languages."""

    CHINESE_SIMPLIFIED = auto()
    CHINESE_TRADITIONAL = auto()
    CZECH = auto()
    ENGLISH = auto()
    FRENCH = auto()
    ITALIAN = auto()
    KOREAN = auto()
    PORTUGUESE = auto()
    SPANISH = auto()


class Bip39MnemonicConst:
    """Class container for BIP39 mnemonic constants."""

    # Accepted mnemonic word numbers
    MNEMONIC_WORD_NUM: List[Bip39WordsNum] = [
        Bip39WordsNum.WORDS_NUM_12,
        Bip39WordsNum.WORDS_NUM_15,
        Bip39WordsNum.WORDS_NUM_18,
        Bip39WordsNum.WORDS_NUM_21,
        Bip39WordsNum.WORDS_NUM_24,
    ]

    # Language files
    LANGUAGE_FILES: Dict[MnemonicLanguages, str] = {
        Bip39Languages.ENGLISH: "wordlist/english.txt",
        Bip39Languages.ITALIAN: "wordlist/italian.txt",
        Bip39Languages.FRENCH: "wordlist/french.txt",
        Bip39Languages.SPANISH: "wordlist/spanish.txt",
        Bip39Languages.PORTUGUESE: "wordlist/portuguese.txt",
        Bip39Languages.CZECH: "wordlist/czech.txt",
        Bip39Languages.CHINESE_SIMPLIFIED: "wordlist/chinese_simplified.txt",
        Bip39Languages.CHINESE_TRADITIONAL: "wordlist/chinese_traditional.txt",
        Bip39Languages.KOREAN: "wordlist/korean.txt",
    }

    # Total number of words
    WORDS_LIST_NUM: int = 2048
    # Word length in bit
    WORD_BIT_LEN: int = 11


class Bip39Mnemonic(Mnemonic):
    """
    BIP39 mnemonic class.
    It adds NFKD normalization to mnemonic.
    """

    @staticmethod
    def _Normalize(mnemonic: Union[str, List[str]]) -> List[str]:
        """
        Normalize mnemonic list.

        Args:
            mnemonic (str or list[str]): Mnemonic

        Returns:
            list[str]: Normalized mnemonic list
        """
        mnemonic = Mnemonic._Normalize(mnemonic)
        return list(map(lambda s: StringUtils.NormalizeNfkd(s.lower()), mnemonic))

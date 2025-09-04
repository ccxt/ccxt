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

"""Module containing common utility classes for mnemonic."""

# Imports
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Type

from ..misc import BytesUtils, IntegerUtils
from .mnemonic import Mnemonic, MnemonicLanguages
from ..typing import Literal


class MnemonicUtils:
    """Class container for mnemonic utility functions."""

    @staticmethod
    def BytesChunkToWords(bytes_chunk: bytes,
                          words_list: MnemonicWordsList,
                          endianness: Literal["little", "big"]) -> List[str]:
        """
        Get words from a bytes chunk.

        Args:
            bytes_chunk (bytes)                  : Bytes chunk
            words_list (MnemonicWordsList object): Mnemonic list
            endianness ("big" or "little")       : Bytes endianness

        Returns:
            list[str]: 3 word indexes
        """
        n = words_list.Length()

        int_chunk = BytesUtils.ToInteger(bytes_chunk, endianness=endianness)

        word1_idx = int_chunk % n
        word2_idx = ((int_chunk // n) + word1_idx) % n
        word3_idx = ((int_chunk // n // n) + word2_idx) % n

        return [words_list.GetWordAtIdx(w) for w in (word1_idx, word2_idx, word3_idx)]

    @staticmethod
    def WordsToBytesChunk(word1: str,
                          word2: str,
                          word3: str,
                          words_list: MnemonicWordsList,
                          endianness: Literal["little", "big"]) -> bytes:
        """
        Get bytes chunk from words.

        Args:
            word1 (str)                          : Word 1
            word2 (str)                          : Word 2
            word3 (str)                          : Word 3
            words_list (MnemonicWordsList object): Mnemonic list
            endianness ("big" or "little")       : Bytes endianness

        Returns:
            bytes: Bytes chunk
        """
        n = words_list.Length()

        # Get the word indexes
        word1_idx = words_list.GetWordIdx(word1)
        word2_idx = words_list.GetWordIdx(word2) % n
        word3_idx = words_list.GetWordIdx(word3) % n

        # Get back the bytes chunk
        int_chunk = word1_idx + (n * ((word2_idx - word1_idx) % n)) + (n * n * ((word3_idx - word2_idx) % n))

        if IntegerUtils.GetBytesNumber(int_chunk) > 3:
            return IntegerUtils.ToBytes(int_chunk, endianness=endianness)
        # The chunk shall be at least 4-byte long
        return IntegerUtils.ToBytes(int_chunk, bytes_num=4, endianness=endianness)


class MnemonicWordsList:
    """Mnemonic words list class."""

    m_idx_to_words: List[str]
    m_words_to_idx: Dict[str, int]

    def __init__(self,
                 words_list: List[str]) -> None:
        """
        Construct class.

        Args:
            words_list (list[str]): Words list
        """
        self.m_idx_to_words = words_list
        # Map strings to indexes as well for a quick word searching
        self.m_words_to_idx = {words_list[i]: i for i in range(len(words_list))}

    def Length(self) -> int:
        """
        Get the length of the words list.

        Returns:
            int: Words list length
        """
        return len(self.m_idx_to_words)

    def GetWordIdx(self,
                   word: str) -> int:
        """
        Get the index of the specified word.

        Args:
            word (str): Word to be searched

        Returns:
            int: Word index

        Raises:
            ValueError: If the word is not found
        """
        try:
            return self.m_words_to_idx[word]
        except KeyError as ex:
            raise ValueError(f"Unable to find word {word}") from ex

    def GetWordAtIdx(self,
                     word_idx: int) -> str:
        """
        Get the word at the specified index.

        Args:
            word_idx (int): Word index

        Returns:
            str: Word at the specified index
        """
        return self.m_idx_to_words[word_idx]


class MnemonicWordsListFileReader:
    """
    Mnemonic words list file reader class.
    It reads the words list from a file.
    """

    @staticmethod
    def LoadFile(file_path: str,
                 words_num: int) -> MnemonicWordsList:
        """
        Load words list file correspondent to the specified language.

        Args:
            file_path (str): File name
            words_num (int): Number of expected words

        Returns:
            MnemonicWordsList: MnemonicWordsList object

        Raises:
            ValueError: If loaded words list is not valid
        """

        # Read file
        with open(file_path, "r", encoding="utf-8") as fin:
            words_list = [word.strip()
                          for word in fin.readlines()
                          if word.strip() != "" and not word.startswith("#")]

        # Check words list count
        if len(words_list) != words_num:
            raise ValueError(f"Number of loaded words list ({len(words_list)}) is not valid")

        return MnemonicWordsList(words_list)


class MnemonicWordsListGetterBase(ABC):
    """Mnemonic words list getter base class."""

    m_words_lists: Dict[MnemonicLanguages, MnemonicWordsList]

    # Global instance
    __instance: Optional[MnemonicWordsListGetterBase] = None

    def __init__(self) -> None:
        """Construct class."""
        self.m_words_lists = {}

    @abstractmethod
    def GetByLanguage(self,
                      lang: MnemonicLanguages) -> MnemonicWordsList:
        """
        Get words list by language.
        Words list of a specific language are loaded from file only the first time they are requested.

        Args:
            lang (MnemonicLanguages): Language

        Returns:
            MnemonicWordsList object: MnemonicWordsList object

        Raises:
            TypeError: If the language is not of the correct enumerative
            ValueError: If loaded words list is not valid
        """

    def _LoadWordsList(self,
                       lang: MnemonicLanguages,
                       file_name: str,
                       words_num: int) -> MnemonicWordsList:
        """
        Load words list.

        Args:
            lang (MnemonicLanguages): Language
            file_name (str)         : File name
            words_num (int)         : Number of expected words

        Returns:
            MnemonicWordsList object: MnemonicWordsList object

        Raises:
            ValueError: If loaded words list is not valid
        """

        # Only load words list for a specific language the first time it is requested
        try:
            return self.m_words_lists[lang]
        except KeyError:
            self.m_words_lists[lang] = MnemonicWordsListFileReader.LoadFile(file_name,
                                                                            words_num)

            return self.m_words_lists[lang]

    @classmethod
    def Instance(cls) -> MnemonicWordsListGetterBase:
        """
        Get the global class instance.

        Returns:
            MnemonicWordsListGetterBase object: MnemonicWordsListGetterBase object
        """
        if cls.__instance is None:
            cls.__instance = cls()
        return cls.__instance


class MnemonicWordsListFinderBase(ABC):
    """
    Mnemonic words list finder base class.
    It automatically finds the correct words list from a mnemonic.
    """

    @classmethod
    @abstractmethod
    def FindLanguage(cls,
                     mnemonic: Mnemonic) -> Tuple[MnemonicWordsList, MnemonicLanguages]:
        """
        Automatically find the language of the specified mnemonic and get the correct MnemonicWordsList class for it.

        Args:
            mnemonic (Mnemonic object): Mnemonic object

        Returns:
           tuple[MnemonicWordsList, MnemonicLanguages]: MnemonicWordsList object (index 0), mnemonic language (index 1)

        Raises:
            ValueError: If the mnemonic language cannot be found
        """

    @staticmethod
    def _FindLanguageGeneric(
            mnemonic: Mnemonic,
            langs_enum: Type[MnemonicLanguages],
            words_list_getter_cls: Type[MnemonicWordsListGetterBase]
    ) -> Tuple[MnemonicWordsList, MnemonicLanguages]:
        """
        Automatically find the language of the specified mnemonic and get the correct MnemonicWordsList class for it.
        Generic version that doesn't depending on a specific mnemonic type.

        Args:
            mnemonic (Mnemonic object)                         : Mnemonic object
            langs_enum (MnemonicLanguages class)               : Language class
            words_list_getter_cls (MnemonicWordsListGetterBase): Word list getter class type

        Returns:
           tuple[MnemonicWordsList, MnemonicLanguages]: MnemonicWordsList object (index 0), mnemonic language (index 1)

        Raises:
            ValueError: If the mnemonic language cannot be found
        """
        for lang in langs_enum:
            # Search all the words because some languages have words in common
            # (e.g. 'fatigue' both in English and French)
            # It's more time consuming, but considering only the first word can detect the wrong language sometimes
            try:
                words_list = words_list_getter_cls.Instance().GetByLanguage(lang)
                for word in mnemonic.ToList():
                    words_list.GetWordIdx(word)
                return words_list, lang
            except ValueError:
                continue

        # Language not found
        raise ValueError(f"Invalid language for mnemonic '{mnemonic.ToStr()}'")

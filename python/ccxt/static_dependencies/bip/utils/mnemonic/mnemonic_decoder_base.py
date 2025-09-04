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

"""Module for mnemonic decoder base class."""

# Imports
from abc import ABC, abstractmethod
from typing import Optional, Tuple, Type, Union

from .mnemonic import Mnemonic, MnemonicLanguages
from .mnemonic_utils import (
    MnemonicWordsList, MnemonicWordsListFinderBase, MnemonicWordsListGetterBase
)


class MnemonicDecoderBase(ABC):
    """
    Mnemonic decoder base class.
    It decodes a mnemonic phrase to bytes.
    """

    m_lang: Optional[MnemonicLanguages]
    m_words_list: Optional[MnemonicWordsList]
    m_words_list_finder_cls: Type[MnemonicWordsListFinderBase]

    def __init__(self,
                 lang: Optional[MnemonicLanguages],
                 words_list_finder_cls: Type[MnemonicWordsListFinderBase],
                 words_list_getter_cls: Type[MnemonicWordsListGetterBase]) -> None:
        """
        Construct class.

        Args:
            lang (MoneroLanguages, optional)                   : Language, None for automatic detection
            words_list_finder_cls (MnemonicWordsListFinderBase): Words list finder class type
            words_list_getter_cls (MnemonicWordsListGetterBase): Words list getter class type

        Raises:
            TypeError: If the language is not of the correct enum
            ValueError: If loaded words list is not valid
        """
        self.m_lang = lang
        self.m_words_list = (words_list_getter_cls.Instance().GetByLanguage(lang)
                             if lang is not None
                             else None)
        self.m_words_list_finder_cls = words_list_finder_cls

    @abstractmethod
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

    def _FindLanguage(self,
                      mnemonic: Mnemonic) -> Tuple[MnemonicWordsList, MnemonicLanguages]:
        """
        Find mnemonic language.

        Args:
            mnemonic (Mnemonic object): Mnemonic

        Returns:
           tuple[MnemonicWordsList, MnemonicLanguages]: MnemonicWordsList object (index 0), mnemonic language (index 1)

        Raises:
            ValueError: If the mnemonic language cannot be found
        """
        if self.m_lang is None or self.m_words_list is None:
            return self.m_words_list_finder_cls.FindLanguage(mnemonic)
        return self.m_words_list, self.m_lang

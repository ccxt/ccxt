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

"""Module for mnemonic encoder base class."""

# Imports
from abc import ABC, abstractmethod
from typing import Type

from .mnemonic import Mnemonic, MnemonicLanguages
from .mnemonic_utils import MnemonicWordsList, MnemonicWordsListGetterBase


class MnemonicEncoderBase(ABC):
    """
    Mnemonic encoder base class.
    It encodes bytes to the mnemonic phrase.
    """

    m_words_list: MnemonicWordsList

    def __init__(self,
                 lang: MnemonicLanguages,
                 words_list_getter_cls: Type[MnemonicWordsListGetterBase]) -> None:
        """
        Construct class.

        Args:
            lang (MnemonicLanguages)                           : Language
            words_list_getter_cls (MnemonicWordsListGetterBase): Words list getter class type

        Raises:
            TypeError: If the language is not of the correct enum
            ValueError: If loaded words list is not valid
        """
        self.m_words_list = words_list_getter_cls.Instance().GetByLanguage(lang)

    @abstractmethod
    def Encode(self,
               entropy_bytes: bytes) -> Mnemonic:
        """
        Encode bytes to mnemonic phrase.

        Args:
            entropy_bytes (bytes): Entropy bytes

        Returns:
            Mnemonic object: Encoded mnemonic

        Raises:
            ValueError: If entropy is not valid
        """

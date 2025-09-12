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

"""Module for BIP39 mnemonic utility classes."""

# Imports
import os
from typing import Tuple

from .bip39_mnemonic import Bip39Languages, Bip39MnemonicConst
from ..utils.mnemonic import (
    Mnemonic, MnemonicLanguages, MnemonicWordsList, MnemonicWordsListFinderBase, MnemonicWordsListGetterBase
)


class Bip39WordsListGetter(MnemonicWordsListGetterBase):
    """
    BIP39 words list getter class.
    It allows to get words list by language so that they are loaded from file only once per language.
    """

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
            TypeError: If the language is not a Bip39Languages enum
            ValueError: If loaded words list is not valid
        """
        if not isinstance(lang, Bip39Languages):
            raise TypeError("Language is not an enumerative of Bip39Languages")

        return self._LoadWordsList(lang,
                                   self.__GetLanguageFile(lang),
                                   Bip39MnemonicConst.WORDS_LIST_NUM)

    @staticmethod
    def __GetLanguageFile(lang: MnemonicLanguages) -> str:
        """
        Get the specified language file name.

        Args:
            lang (MnemonicLanguages): Language

        Returns:
            str: Language file name
        """
        return os.path.join(os.path.dirname(__file__),
                            Bip39MnemonicConst.LANGUAGE_FILES[lang])


class Bip39WordsListFinder(MnemonicWordsListFinderBase):
    """
    BIP39 words list finder class.
    It automatically finds the correct words list from a mnemonic.
    """

    @classmethod
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
        return cls._FindLanguageGeneric(mnemonic, Bip39Languages, Bip39WordsListGetter)

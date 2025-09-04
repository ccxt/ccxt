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

"""Module containing common classes for mnemonic."""

# Imports
from __future__ import annotations

from enum import Enum
from typing import List, Union


class MnemonicLanguages(Enum):
    """Base enum for mnemonic languages."""


class Mnemonic:
    """
    Mnemonic class. It represents a generic mnemonic phrase.
    It acts as a simple container with some helper functions, so it doesn't validate the given mnemonic.
    """

    m_mnemonic_list: List[str]

    @classmethod
    def FromString(cls,
                   mnemonic_str: str) -> Mnemonic:
        """
        Create a class from mnemonic string.

        Args:
            mnemonic_str (str): Mnemonic string

        Returns:
            Mnemonic: Mnemonic object
        """
        return cls.FromList(cls._Normalize(mnemonic_str))

    @classmethod
    def FromList(cls,
                 mnemonic_list: List[str]) -> Mnemonic:
        """
        Create a class from mnemonic list.

        Args:
            mnemonic_list (list[str]): Mnemonic list

        Returns:
            Mnemonic: Mnemonic object
        """
        return cls(cls._Normalize(mnemonic_list))

    def __init__(self,
                 mnemonic_list: List[str]) -> None:
        """
        Construct class.

        Args:
            mnemonic_list (list[str]): Mnemonic list
        """
        self.m_mnemonic_list = mnemonic_list

    def WordsCount(self) -> int:
        """
        Get the words count.

        Returns:
            int: Words count
        """
        return len(self.m_mnemonic_list)

    def ToList(self) -> List[str]:
        """
        Get the mnemonic as a list.

        Returns:
            list[str]: Mnemonic as a list
        """
        return self.m_mnemonic_list

    def ToStr(self) -> str:
        """
        Get the mnemonic as a string.

        Returns:
            str: Mnemonic as a string
        """
        return " ".join(self.m_mnemonic_list)

    def __str__(self) -> str:
        """
        Get the mnemonic as a string.

        Returns:
            str: Mnemonic as a string
        """
        return self.ToStr()

    @staticmethod
    def _Normalize(mnemonic: Union[str, List[str]]) -> List[str]:
        """
        Normalize mnemonic list.

        Args:
            mnemonic (str or list[str]): Mnemonic

        Returns:
            list[str]: Normalized mnemonic list
        """
        if isinstance(mnemonic, str):
            mnemonic = mnemonic.split()
        return mnemonic

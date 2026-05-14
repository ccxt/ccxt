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

"""Module with BIP32 utility functions."""

# Imports
from .bip32_key_data import Bip32KeyIndex


class Bip32Utils:
    """
    BIP32 utility class.
    It contains some helper methods for Bip32 indexes.

    Deprecated: only for compatibility, methods were moved to Bip32KeyIndex.
    """

    @staticmethod
    def HardenIndex(index: int) -> int:
        """
        Harden the specified index and return it.

        Args:
            index (int): Index

        Returns:
            int: Hardened index
        """
        return Bip32KeyIndex.HardenIndex(index)

    @staticmethod
    def UnhardenIndex(index: int) -> int:
        """
        Unharden the specified index and return it.

        Args:
            index (int): Index

        Returns:
            int: Unhardened index
        """
        return Bip32KeyIndex.UnhardenIndex(index)

    @staticmethod
    def IsHardenedIndex(index: int) -> bool:
        """
        Get if the specified index is hardened.

        Args:
            index (int): Index

        Returns:
            bool: True if hardened, false otherwise
        """
        return Bip32KeyIndex.IsHardenedIndex(index)

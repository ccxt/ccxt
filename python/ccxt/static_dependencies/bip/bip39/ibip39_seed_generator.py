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

"""Module with interface for BIP39 seed generation classes."""

# Imports
from abc import ABC, abstractmethod
from typing import Optional, Union

from .bip39_mnemonic import Bip39Languages
from ..utils.mnemonic import Mnemonic


class IBip39SeedGenerator(ABC):
    """BIP39 seed generator interface."""

    @abstractmethod
    def __init__(self,
                 mnemonic: Union[str, Mnemonic],
                 lang: Optional[Bip39Languages]) -> None:
        """
        Construct class.

        Args:
            mnemonic (str or Mnemonic object): Mnemonic
            lang (Bip39Languages, optional)  : Language, None for automatic detection

        Raises:
            ValueError: If the mnemonic is not valid
        """

    @abstractmethod
    def Generate(self,
                 passphrase: str) -> bytes:
        """
        Generate the seed using the specified passphrase.

        Args:
            passphrase (str, optional): Passphrase, empty if not specified

        Returns:
            bytes: Generated seed
        """

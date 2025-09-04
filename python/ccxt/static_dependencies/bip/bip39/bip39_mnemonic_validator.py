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

"""Module for BIP39 mnemonic validation."""

# Imports
from typing import Optional

from .bip39_mnemonic import Bip39Languages
from .bip39_mnemonic_decoder import Bip39MnemonicDecoder
from ..utils.mnemonic import MnemonicValidator


class Bip39MnemonicValidator(MnemonicValidator):
    """
    BIP39 mnemonic validator class.
    It validates a mnemonic phrase.
    """

    def __init__(self,
                 lang: Optional[Bip39Languages] = None) -> None:
        """
        Construct class.

        Args:
            lang (Bip39Languages, optional): Language, None for automatic detection
        """
        super().__init__(Bip39MnemonicDecoder(lang))

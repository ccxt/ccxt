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

"""Module for generic mnemonic validation."""

# Imports
from typing import Union

from .mnemonic import Mnemonic
from .mnemonic_decoder_base import MnemonicDecoderBase
from .mnemonic_ex import MnemonicChecksumError


class MnemonicValidator:
    """Mnemonic validator class."""

    m_mnemonic_decoder: MnemonicDecoderBase

    def __init__(self,
                 mnemonic_decoder: MnemonicDecoderBase) -> None:
        """
        Construct class.

        Args:
            mnemonic_decoder (MnemonicDecoderBase object): Mnemonic decoder class instance
        """
        self.m_mnemonic_decoder = mnemonic_decoder

    def Validate(self,
                 mnemonic: Union[str, Mnemonic]) -> None:
        """
        Validate the mnemonic specified at construction.

        Args:
            mnemonic (str or Mnemonic object): Mnemonic

        Raises:
            MnemonicChecksumError: If checksum is not valid
            ValueError: If mnemonic is not valid
        """

        # Just get entropy bytes without returning it, since it will validate the mnemonic
        self.m_mnemonic_decoder.Decode(mnemonic)

    def IsValid(self,
                mnemonic: Union[str, Mnemonic]) -> bool:
        """
        Get if the mnemonic specified at construction is valid.

        Args:
            mnemonic (str or Mnemonic object): Mnemonic

        Returns:
            bool: True if valid, False otherwise
        """

        # Simply try to validate
        try:
            self.Validate(mnemonic)
            return True
        except (ValueError, MnemonicChecksumError):
            return False

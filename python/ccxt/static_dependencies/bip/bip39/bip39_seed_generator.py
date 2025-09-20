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

"""
Module for BIP39 mnemonic seed generation.
Reference: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
"""

# Imports
from typing import Optional, Union

from .bip39_mnemonic import Bip39Languages, Bip39Mnemonic
from .bip39_mnemonic_validator import Bip39MnemonicValidator
from .ibip39_seed_generator import IBip39SeedGenerator
from ..utils.crypto import Pbkdf2HmacSha512
from ..utils.misc import StringUtils
from ..utils.mnemonic import Mnemonic


class Bip39SeedGeneratorConst:
    """Class container for BIP39 seed generator constants."""

    # Salt modifier for seed generation
    SEED_SALT_MOD: str = "mnemonic"
    # PBKDF2 round for seed generation
    SEED_PBKDF2_ROUNDS: int = 2048


class Bip39SeedGenerator(IBip39SeedGenerator):
    """
    BIP39 seed generator class.
    It generates the seed from a mnemonic in according to BIP39.
    """

    m_mnemonic: Mnemonic

    def __init__(self,
                 mnemonic: Union[str, Mnemonic],
                 lang: Optional[Bip39Languages] = None) -> None:
        """
        Construct class.

        Args:
            mnemonic (str or Mnemonic object): Mnemonic
            lang (Bip39Languages, optional)  : Language, None for automatic detection

        Raises:
            ValueError: If the mnemonic is not valid
        """

        # Make sure that the given mnemonic is valid
        Bip39MnemonicValidator(lang).Validate(mnemonic)

        self.m_mnemonic = (Bip39Mnemonic.FromString(mnemonic)
                           if isinstance(mnemonic, str)
                           else mnemonic)

    def Generate(self,
                 passphrase: str = "") -> bytes:
        """
        Generate the seed using the specified passphrase.

        Args:
            passphrase (str, optional): Passphrase, empty if not specified

        Returns:
            bytes: Generated seed
        """
        salt = StringUtils.NormalizeNfkd(Bip39SeedGeneratorConst.SEED_SALT_MOD + passphrase)
        return Pbkdf2HmacSha512.DeriveKey(self.m_mnemonic.ToStr(),
                                          salt,
                                          Bip39SeedGeneratorConst.SEED_PBKDF2_ROUNDS)

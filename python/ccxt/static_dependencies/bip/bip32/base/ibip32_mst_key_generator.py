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

"""Module for BIP32 SLIP-0010 keys derivation."""

# Imports
from abc import ABC, abstractmethod
from typing import Tuple


class IBip32MstKeyGenerator(ABC):
    """Interface for generic BIP32 master key generator."""

    @classmethod
    @abstractmethod
    def GenerateFromSeed(cls,
                         seed_bytes: bytes) -> Tuple[bytes, bytes]:
        """
        Generate a master key from the specified seed.

        Args:
            seed_bytes (bytes): Seed bytes

        Returns:
            tuple[bytes, bytes]: Private key bytes (index 0) and chain code bytes (index 1)

        Raises:
            Bip32KeyError: If the seed is not suitable for master key generation
            ValueError: If seed length is not valid
        """

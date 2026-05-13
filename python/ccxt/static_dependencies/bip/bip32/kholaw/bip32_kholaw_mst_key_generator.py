# Copyright (c) 2022 Emanuele Bellocchia
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
Module for BIP32 Khovratovich/Law master key generation.
Reference: https://github.com/LedgerHQ/orakolo/blob/master/papers/Ed25519_BIP%20Final.pdf
"""

# Imports
from typing import Tuple

from .base import IBip32MstKeyGenerator
from .slip10.bip32_slip10_mst_key_generator import Bip32Slip10MstKeyGeneratorConst
from ..utils.crypto import HmacSha256, HmacSha512
from ..utils.misc import BitUtils


class Bip32KholawMstKeyGeneratorConst:
    """Class container for BIP32 Khovratovich/Law master key generator constants."""

    # Minimum length in bytes for seed
    SEED_MIN_BYTE_LEN: int = Bip32Slip10MstKeyGeneratorConst.SEED_MIN_BYTE_LEN
    # HMAC key for generating master key
    MASTER_KEY_HMAC_KEY: bytes = Bip32Slip10MstKeyGeneratorConst.HMAC_KEY_ED25519_BYTES


class Bip32KholawEd25519MstKeyGenerator(IBip32MstKeyGenerator):
    """
    BIP32 Khovratovich/Law ed25519 master key generator class.
    It allows master keys generation in according to BIP32 Khovratovich/Law for ed25519 curve.
    """

    @classmethod
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
        if len(seed_bytes) < Bip32KholawMstKeyGeneratorConst.SEED_MIN_BYTE_LEN:
            raise ValueError(f"Invalid seed length ({len(seed_bytes)})")

        # Compute kL and kR
        kl_bytes, kr_bytes = cls.__HashRepeatedly(seed_bytes, Bip32KholawMstKeyGeneratorConst.MASTER_KEY_HMAC_KEY)
        # Tweak kL bytes
        kl_bytes = cls.__TweakMasterKeyBits(kl_bytes)

        # Compute chain code
        chain_code_bytes = HmacSha256.QuickDigest(Bip32KholawMstKeyGeneratorConst.MASTER_KEY_HMAC_KEY,
                                                  b"\x01" + seed_bytes)

        return kl_bytes + kr_bytes, chain_code_bytes

    @classmethod
    def __HashRepeatedly(cls,
                         data_bytes: bytes,
                         hmac_key_bytes: bytes) -> Tuple[bytes, bytes]:
        """
        Continue to hash the data bytes until the third-highest bit of the last byte is not zero.

        Args:
            data_bytes (bytes)    : Data bytes
            hmac_key_bytes (bytes): HMAC key bytes

        Returns:
            tuple[bytes, bytes]: Two halves of the computed hash
        """
        kl_bytes, kr_bytes = HmacSha512.QuickDigestHalves(hmac_key_bytes,
                                                          data_bytes)
        if BitUtils.AreBitsSet(kl_bytes[31], 0x20):
            return cls.__HashRepeatedly(kl_bytes + kr_bytes, hmac_key_bytes)
        return kl_bytes, kr_bytes

    @staticmethod
    def __TweakMasterKeyBits(key_bytes: bytes) -> bytes:
        """
        Tweak master key bits.

        Args:
            key_bytes (bytes): Key bytes

        Returns:
            bytes: Tweaked key bytes
        """
        key_bytes = bytearray(key_bytes)
        # Clear the lowest 3 bits of the first byte of kL
        key_bytes[0] = BitUtils.ResetBits(key_bytes[0], 0x07)
        # Clear the highest bit of the last byte of kL
        key_bytes[31] = BitUtils.ResetBits(key_bytes[31], 0x80)
        # Set the second-highest bit of the last byte of kL
        key_bytes[31] = BitUtils.SetBits(key_bytes[31], 0x40)

        return bytes(key_bytes)

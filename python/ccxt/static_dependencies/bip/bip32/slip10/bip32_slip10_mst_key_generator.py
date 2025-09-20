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
Module for BIP32 SLIP-0010 master key generation.
Reference: https://github.com/satoshilabs/slips/blob/master/slip-0010.md
"""

# Imports
from typing import Tuple

from ..base import IBip32MstKeyGenerator
from ...ecc import EllipticCurveGetter, EllipticCurveTypes
from ...utils.crypto import HmacSha512


class Bip32Slip10MstKeyGeneratorConst:
    """Class container for BIP32 SLIP-0010 master key generator constants."""

    # Minimum length in bytes for seed
    SEED_MIN_BYTE_LEN: int = 16
    # HMAC keys for different curves
    HMAC_KEY_ED25519_BYTES: bytes = b"ed25519 seed"
    HMAC_KEY_NIST256P1_BYTES: bytes = b"Nist256p1 seed"
    HMAC_KEY_SECP256K1_BYTES: bytes = b"Bitcoin seed"


class _Bip32Slip10MstKeyGenerator:
    """
    BIP32 SLIP-0010 generic master key generator class.
    It allows master keys generation in according to BIP32 SLIP-0010.
    """

    @staticmethod
    def GenerateFromSeed(seed_bytes: bytes,
                         hmac_key_bytes: bytes,
                         curve_type: EllipticCurveTypes) -> Tuple[bytes, bytes]:
        """
        Generate a master key from the specified seed and return a Bip32Base object.

        Args:
            seed_bytes (bytes)                      : Seed bytes
            hmac_key_bytes (bytes)                  : HMAC key bytes

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the seed is not suitable for master key generation
            ValueError: If seed length is not valid
        """
        if len(seed_bytes) < Bip32Slip10MstKeyGeneratorConst.SEED_MIN_BYTE_LEN:
            raise ValueError(f"Invalid seed length ({len(seed_bytes)})")

        hmac_half_len = HmacSha512.DigestSize() // 2
        priv_key_cls = EllipticCurveGetter.FromType(curve_type).PrivateKeyClass()

        # Compute HMAC, retry if the resulting private key is not valid
        hmac = b""
        hmac_data = seed_bytes
        success = False

        while not success:
            hmac = HmacSha512.QuickDigest(hmac_key_bytes, hmac_data)
            # If private key is not valid, the new HMAC data is the current HMAC
            success = priv_key_cls.IsValidBytes(hmac[:hmac_half_len])
            if not success:
                hmac_data = hmac

        return hmac[:hmac_half_len], hmac[hmac_half_len:]


class Bip32Slip10Ed2519MstKeyGenerator(IBip32MstKeyGenerator):
    """
    BIP32 SLIP-0010 ed25519 master key generator class.
    It allows master keys generation in according to BIP32 SLIP-0010 for ed25519 curve.
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
        return _Bip32Slip10MstKeyGenerator.GenerateFromSeed(seed_bytes,
                                                            Bip32Slip10MstKeyGeneratorConst.HMAC_KEY_ED25519_BYTES,
                                                            EllipticCurveTypes.ED25519)


class Bip32Slip10Nist256p1MstKeyGenerator(IBip32MstKeyGenerator):
    """
    BIP32 SLIP-0010 nist256p1 master key generator class.
    It allows master keys generation in according to BIP32 SLIP-0010 for nist256p1 curve.
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
        return _Bip32Slip10MstKeyGenerator.GenerateFromSeed(seed_bytes,
                                                            Bip32Slip10MstKeyGeneratorConst.HMAC_KEY_NIST256P1_BYTES,
                                                            EllipticCurveTypes.NIST256P1)


class Bip32Slip10Secp256k1MstKeyGenerator(IBip32MstKeyGenerator):
    """
    BIP32 SLIP-0010 secp256k1 master key generator class.
    It allows master keys generation in according to BIP32 SLIP-0010 for secp256k1 curve.
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
        return _Bip32Slip10MstKeyGenerator.GenerateFromSeed(seed_bytes,
                                                            Bip32Slip10MstKeyGeneratorConst.HMAC_KEY_SECP256K1_BYTES,
                                                            EllipticCurveTypes.SECP256K1)

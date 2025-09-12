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
Module for P2TR address encoding/decoding.

References:
    https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
    https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
"""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.bech32 import Bech32ChecksumError, SegwitBech32Decoder, SegwitBech32Encoder
from bip_utils.ecc import IPoint, IPublicKey, Secp256k1, Secp256k1Point, Secp256k1PublicKey
from bip_utils.utils.crypto import Sha256
from bip_utils.utils.misc import BytesUtils, IntegerUtils


class P2TRConst:
    """Class container for P2TR constants."""

    # Secp256k1 field size
    FIELD_SIZE: int = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    # SHA256 of "TapTweak"
    TAP_TWEAK_SHA256: bytes = BytesUtils.FromHexString(
        "e80fe1639c9ca050e3af1b39c143c63e429cbceb15d940fbb5c5a1f4af57c5e9"
    )
    # Witness version is fixed to one for P2TR
    WITNESS_VER: int = 1


class _P2TRUtils:
    """Class container for P2TR utility functions."""

    @staticmethod
    def TaggedHash(tag: Union[bytes, str],
                   data_bytes: bytes) -> bytes:
        """
        Implementation of the hash tag function as defined by BIP-0340.
        Tagged hash = SHA256(SHA256(tag) || SHA256(tag) || data)

        Args:
            tag (bytes or str): Tag, if bytes it'll be considered already hashed
            data_bytes (bytes): Data bytes

        Returns:
            bytes: Tagged hash
        """
        tag_hash = Sha256.QuickDigest(tag) if isinstance(tag, str) else tag
        return Sha256.QuickDigest(tag_hash + tag_hash + data_bytes)

    @staticmethod
    def HashTapTweak(pub_key: IPublicKey) -> bytes:
        """
        Compute the HashTapTweak of the specified public key.

        Args:
            pub_key (IPublicKey object): Public key

        Returns:
            bytes: Computed hash
        """

        # Use the pre-computed SHA256 of "TapTweak" for speeding up
        return _P2TRUtils.TaggedHash(
            P2TRConst.TAP_TWEAK_SHA256,
            IntegerUtils.ToBytes(pub_key.Point().X(),
                                 bytes_num=Secp256k1Point.CoordinateLength())
        )

    @staticmethod
    def LiftX(pub_key: IPublicKey) -> IPoint:
        """
        Implementation of the lift_x function as defined by BIP-0340.
        It computes the point P for which P.X() = pub_key.X() and has_even_y(P).

        Args:
            pub_key (IPublicKey object): Public key

        Returns:
            IPoint: Computed point

        Raises:
            ValueError: If the point doesn't exist
        """
        p = P2TRConst.FIELD_SIZE
        x = pub_key.Point().X()
        if x >= p:
            raise ValueError("Unable to compute LiftX point")
        c = (pow(x, 3, p) + 7) % p
        y = pow(c, (p + 1) // 4, p)
        if c != pow(y, 2, p):
            raise ValueError("Unable to compute LiftX point")
        return Secp256k1Point.FromCoordinates(x, y if y % 2 == 0 else p - y)

    @staticmethod
    def TweakPublicKey(pub_key: IPublicKey) -> bytes:
        """
        Tweak a public key as defined by BIP-0086.
        tweaked_pub_key = lift_x(pub_key.X()) + int(HashTapTweak(bytes(pub_key.X()))) * G

        Args:
            pub_key (IPublicKey object): Public key

        Returns:
            bytes: X coordinate of the tweaked public key
        """
        h = _P2TRUtils.HashTapTweak(pub_key)
        out_point = _P2TRUtils.LiftX(pub_key) + (BytesUtils.ToInteger(h) * Secp256k1.Generator())
        return IntegerUtils.ToBytes(out_point.X(),
                                    bytes_num=Secp256k1Point.CoordinateLength())


class P2TRAddrDecoder(IAddrDecoder):
    """
    P2WPKH address decoder class.
    It allows the Pay-to-Witness-Public-Key-Hash address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a P2TR address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            hrp (str): Expected HRP

        Returns:
            bytes: X coordinate of the tweaked public key

        Raises:
            ValueError: If the address encoding is not valid
        """
        hrp = kwargs["hrp"]

        try:
            wit_ver_got, addr_dec_bytes = SegwitBech32Decoder.Decode(hrp, addr)
        except Bech32ChecksumError as ex:
            raise ValueError("Invalid bech32 checksum") from ex

        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes, Secp256k1PublicKey.CompressedLength() - 1)
        # Check witness version
        if wit_ver_got != P2TRConst.WITNESS_VER:
            raise ValueError(f"Invalid witness version (expected {P2TRConst.WITNESS_VER}, got {wit_ver_got})")
        return addr_dec_bytes


class P2TRAddrEncoder(IAddrEncoder):
    """
    P2TR address encoder class.
    It allows the Pay-to-Taproot address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to P2TR address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            hrp (str): HRP

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid or cannot be tweaked
            TypeError: If the public key is not secp256k1
        """
        hrp = kwargs["hrp"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        return SegwitBech32Encoder.Encode(hrp,
                                          P2TRConst.WITNESS_VER,
                                          _P2TRUtils.TweakPublicKey(pub_key_obj))


# Deprecated: only for compatibility, Encoder class shall be used instead
P2TRAddr = P2TRAddrEncoder

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

"""Module for WIF encoding/decoding."""

# Imports
from typing import Tuple, Union

from ..addr import P2PKHPubKeyModes
from ..base58 import Base58Decoder, Base58Encoder
from ..coin_conf import CoinsConf
from ..ecc import IPrivateKey, Secp256k1PrivateKey
from ..utils.misc import BytesUtils


# Alias for P2PKHPubKeyModes
WifPubKeyModes = P2PKHPubKeyModes


class WifConst:
    """Class container for WIF constants."""

    # Suffix to be added if the private key correspond to a compressed public key
    COMPR_PUB_KEY_SUFFIX: bytes = b"\x01"


class WifEncoder:
    """
    WIF encoder class.
    It provides methods for encoding to WIF format.
    """

    @staticmethod
    def Encode(priv_key: Union[bytes, IPrivateKey],
               net_ver: bytes = CoinsConf.BitcoinMainNet.ParamByKey("wif_net_ver"),
               pub_key_mode: WifPubKeyModes = WifPubKeyModes.COMPRESSED) -> str:
        """
        Encode key bytes into a WIF string.

        Args:
            priv_key (bytes or IPrivateKey)        : Private key bytes or object
            net_ver (bytes, optional)              : Net version (Bitcoin main net by default)
            pub_key_mode (WifPubKeyModes, optional): Specify if the private key corresponds to a compressed public key

        Returns:
            str: WIF encoded string

        Raises:
            TypeError: If pub_key_mode is not a WifPubKeyModes enum or
                       the private key is not a valid Secp256k1PrivateKey
            ValueError: If the key is not valid
        """
        if not isinstance(pub_key_mode, WifPubKeyModes):
            raise TypeError("Public key mode is not an enumerative of WifPubKeyModes")

        # Convert to private key to check if bytes are valid
        if isinstance(priv_key, bytes):
            priv_key = Secp256k1PrivateKey.FromBytes(priv_key)
        elif not isinstance(priv_key, Secp256k1PrivateKey):
            raise TypeError("A secp256k1 private key is required")

        priv_key = priv_key.Raw().ToBytes()

        # Add suffix if correspond to a compressed public key
        if pub_key_mode == WifPubKeyModes.COMPRESSED:
            priv_key += WifConst.COMPR_PUB_KEY_SUFFIX

        # Add net address version
        priv_key = net_ver + priv_key

        # Encode key
        return Base58Encoder.CheckEncode(priv_key)


class WifDecoder:
    """
    WIF encoder class.
    It provides methods for encoding to WIF format.
    """

    @staticmethod
    def Decode(wif_str: str,
               net_ver: bytes = CoinsConf.BitcoinMainNet.ParamByKey("wif_net_ver")) -> Tuple[bytes, WifPubKeyModes]:
        """
        Decode key bytes from a WIF string.

        Args:
            wif_str (str)            : WIF string
            net_ver (bytes, optional): Net version (Bitcoin main net by default)

        Returns:
            tuple[bytes, WifPubKeyModes]: Key bytes (index 0), public key mode (index 1)

        Raises:
            Base58ChecksumError: If the base58 checksum is not valid
            ValueError: If the resulting key is not valid
        """

        # Decode string
        priv_key_bytes = Base58Decoder.CheckDecode(wif_str)

        # Check net version
        if priv_key_bytes[0] != ord(net_ver):
            raise ValueError(
                f"Invalid net version (expected 0x{ord(net_ver):02X}, got 0x{priv_key_bytes[0]:02X})"
            )

        # Remove net version
        priv_key_bytes = priv_key_bytes[1:]

        # Remove suffix if correspond to a compressed public key
        if Secp256k1PrivateKey.IsValidBytes(priv_key_bytes[:-1]):
            # Check the compressed public key suffix
            if priv_key_bytes[-1] != ord(WifConst.COMPR_PUB_KEY_SUFFIX):
                raise ValueError(
                    f"Invalid compressed public key suffix (expected 0x{ord(WifConst.COMPR_PUB_KEY_SUFFIX):02X}, "
                    f"got 0x{priv_key_bytes[-1]:02X})"
                )
            # Remove it
            priv_key_bytes = priv_key_bytes[:-1]
            pub_key_mode = WifPubKeyModes.COMPRESSED
        else:
            if not Secp256k1PrivateKey.IsValidBytes(priv_key_bytes):
                raise ValueError(f"Invalid decoded key ({BytesUtils.ToHexString(priv_key_bytes)})")
            pub_key_mode = WifPubKeyModes.UNCOMPRESSED

        return priv_key_bytes, pub_key_mode

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

"""Module for Aptos address encoding/decoding."""

# Imports
import binascii
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Sha3_256
from bip_utils.utils.misc import BytesUtils


class AptosAddrConst:
    """Class container for Aptos address constants."""

    # Suffix byte for single signature
    SINGLE_SIG_SUFFIX_BYTE: bytes = b"\x00"


class AptosAddrDecoder(IAddrDecoder):
    """
    Aptos address decoder class.
    It allows the Aptos address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an Aptos address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # Validate and remove prefix
        addr_no_prefix = AddrDecUtils.ValidateAndRemovePrefix(addr,
                                                              CoinsConf.Aptos.ParamByKey("addr_prefix"))
        addr_no_prefix = addr_no_prefix.rjust(Sha3_256.DigestSize() * 2, "0")
        # Validate length
        AddrDecUtils.ValidateLength(addr_no_prefix, Sha3_256.DigestSize() * 2)

        try:
            return BytesUtils.FromHexString(addr_no_prefix)
        except binascii.Error as ex:
            raise ValueError("Invalid hex encoding") from ex


class AptosAddrEncoder(IAddrEncoder):
    """
    Aptos address encoder class.
    It allows the Aptos address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Aptos address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            trim_zeroes (bool, optional): True to trim left zeroes from the address string, false otherwise (default)

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519
        """
        trim_zeroes = kwargs.get("trim_zeroes", False)

        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)

        payload_bytes = pub_key_obj.RawCompressed().ToBytes()[1:] + AptosAddrConst.SINGLE_SIG_SUFFIX_BYTE
        key_hash_str = BytesUtils.ToHexString(Sha3_256.QuickDigest(payload_bytes))

        return CoinsConf.Aptos.ParamByKey("addr_prefix") + (key_hash_str.lstrip("0") if trim_zeroes else key_hash_str)


# Deprecated: only for compatibility, Encoder class shall be used instead
AptosAddr = AptosAddrEncoder

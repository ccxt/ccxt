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

"""Module for Icon address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Sha3_256
from bip_utils.utils.misc import BytesUtils


class IcxAddrConst:
    """Class container for Icon address constants."""

    # Key hash length in bytes
    KEY_HASH_BYTE_LEN: int = 20


class IcxAddrDecoder(IAddrDecoder):
    """
    Icon address decoder class.
    It allows the Icon address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an Icon address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # Validate and remove prefix
        addr_no_prefix = AddrDecUtils.ValidateAndRemovePrefix(addr,
                                                              CoinsConf.Icon.ParamByKey("addr_prefix"))
        # Validate length
        pub_key_hash_bytes = BytesUtils.FromHexString(addr_no_prefix)
        AddrDecUtils.ValidateLength(pub_key_hash_bytes, IcxAddrConst.KEY_HASH_BYTE_LEN)

        return pub_key_hash_bytes


class IcxAddrEncoder(IAddrEncoder):
    """
    Icon address encoder class.
    It allows the Icon address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Icon address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raised:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)

        pub_key_hash_bytes = Sha3_256.QuickDigest(
            pub_key_obj.RawUncompressed().ToBytes()[1:]
        )[-IcxAddrConst.KEY_HASH_BYTE_LEN:]
        return CoinsConf.Icon.ParamByKey("addr_prefix") + BytesUtils.ToHexString(pub_key_hash_bytes)


# Deprecated: only for compatibility, Encoder class shall be used instead
IcxAddr = IcxAddrEncoder

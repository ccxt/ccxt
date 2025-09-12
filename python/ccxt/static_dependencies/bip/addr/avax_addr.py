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

"""Module for Avax address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.atom_addr import AtomAddrDecoder, AtomAddrEncoder
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey


class _AvaxAddrUtils:
    """Avax address utility class."""

    @staticmethod
    def DecodeAddr(addr: str,
                   prefix: str,
                   hrp: str) -> bytes:
        """
        Decode an Avax address to bytes.

        Args:
            addr (str)  : Address string
            prefix (str): Address prefix
            hrp (str)   : Address HRP

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        addr_no_prefix = AddrDecUtils.ValidateAndRemovePrefix(addr, prefix)
        return AtomAddrDecoder.DecodeAddr(addr_no_prefix, hrp=hrp)


class AvaxPChainAddrDecoder(IAddrDecoder):
    """
    Avax P-Chain address decoder class.
    It allows the Avax P-Chain address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an Avax P-Chain address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        return _AvaxAddrUtils.DecodeAddr(addr,
                                         CoinsConf.AvaxPChain.ParamByKey("addr_prefix"),
                                         CoinsConf.AvaxPChain.ParamByKey("addr_hrp"))


class AvaxPChainAddrEncoder(IAddrEncoder):
    """
    Avax P-Chain address encoder class.
    It allows the Avax P-Chain address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Avax P-Chain address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        prefix = CoinsConf.AvaxPChain.ParamByKey("addr_prefix")
        return prefix + AtomAddrEncoder.EncodeKey(pub_key,
                                                  hrp=CoinsConf.AvaxPChain.ParamByKey("addr_hrp"))


class AvaxXChainAddrDecoder(IAddrDecoder):
    """
    Avax X-Chain address decoder class.
    It allows the Avax X-Chain address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an Avax X-Chain address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        return _AvaxAddrUtils.DecodeAddr(addr,
                                         CoinsConf.AvaxXChain.ParamByKey("addr_prefix"),
                                         CoinsConf.AvaxXChain.ParamByKey("addr_hrp"))


class AvaxXChainAddrEncoder(IAddrEncoder):
    """
    Avax X-Chain address encoder class.
    It allows the Avax X-Chain address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Avax X-Chain address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        prefix = CoinsConf.AvaxXChain.ParamByKey("addr_prefix")
        return prefix + AtomAddrEncoder.EncodeKey(pub_key,
                                                  hrp=CoinsConf.AvaxXChain.ParamByKey("addr_hrp"))


# Deprecated: only for compatibility, Encoder classes shall be used instead
AvaxPChainAddr = AvaxPChainAddrEncoder
AvaxXChainAddr = AvaxXChainAddrEncoder

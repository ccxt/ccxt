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
Module for Cardano Byron address encoding/decoding. Both legacy and Icarus addresses are supported.

References:
    https://cips.cardano.org/cips/cip19
    https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0019/CIP-0019-byron-addresses.cddl
"""

# Imports
from __future__ import annotations

from enum import IntEnum, unique
from typing import Any, Dict, NamedTuple, Optional, Tuple, Union

import cbor2

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.base58 import Base58Decoder, Base58Encoder
from bip_utils.bip.bip32 import Bip32ChainCode, Bip32Path, Bip32PathParser
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Blake2b224, ChaCha20Poly1305, Crc32, Sha3_256
from bip_utils.utils.misc import CborIndefiniteLenArrayDecoder, CborIndefiniteLenArrayEncoder


@unique
class AdaByronAddrTypes(IntEnum):
    """Enumerative for Cardano Byron address types."""

    PUBLIC_KEY = 0
    REDEMPTION = 2


class AdaByronAddrConst:
    """Class container for Cardano Byron address constants."""

    # ChaCha20-Poly1305 associated data for HD path decryption/encryption
    CHACHA20_POLY1305_ASSOC_DATA: bytes = b""
    # ChaCha20-Poly1305 nonce for HD path decryption/encryption
    CHACHA20_POLY1305_NONCE: bytes = b"serokellfore"
    # Payload tag
    PAYLOAD_TAG: int = 24


class _AdaByronAddrHdPath:
    """Cardano Byron address HD path class."""

    @staticmethod
    def Decrypt(hd_path_enc_bytes: bytes,
                hd_path_key_bytes: bytes) -> Bip32Path:
        """
        Encrypt the HD path.

        Args:
            hd_path_enc_bytes (bytes): Encrypted HD path bytes
            hd_path_key_bytes (bytes): HD path key bytes

        Returns:
            Bip32Path object: Bip32Path object

        Raises:
            ValueError: If the decryption fails or the path cannot be decoded
        """
        plain_text_bytes = ChaCha20Poly1305.Decrypt(
            key=hd_path_key_bytes,
            nonce=AdaByronAddrConst.CHACHA20_POLY1305_NONCE,
            assoc_data=AdaByronAddrConst.CHACHA20_POLY1305_ASSOC_DATA,
            cipher_text=hd_path_enc_bytes[:-ChaCha20Poly1305.TagSize()],
            tag=hd_path_enc_bytes[-ChaCha20Poly1305.TagSize():]
        )
        return Bip32Path(CborIndefiniteLenArrayDecoder.Decode(plain_text_bytes),
                         True)

    @staticmethod
    def Encrypt(hd_path: Bip32Path,
                hd_path_key_bytes: bytes) -> bytes:
        """
        Encrypt the HD path.

        Args:
            hd_path (Bip32Path object): HD path
            hd_path_key_bytes (bytes) : HD path key bytes

        Returns:
            bytes: Computed key bytes
        """
        cipher_text_bytes, tag_bytes = ChaCha20Poly1305.Encrypt(
            key=hd_path_key_bytes,
            nonce=AdaByronAddrConst.CHACHA20_POLY1305_NONCE,
            assoc_data=AdaByronAddrConst.CHACHA20_POLY1305_ASSOC_DATA,
            plain_text=CborIndefiniteLenArrayEncoder.Encode(hd_path.ToList())
        )
        return cipher_text_bytes + tag_bytes


class _AdaByronAddrAttrs(NamedTuple):
    """Utility class for Cardano Byron address attributes."""

    hd_path_enc_bytes: Optional[bytes]
    network_magic: Optional[int]

    @classmethod
    def FromDict(cls,
                 attrs_dict: Dict[int, bytes]) -> _AdaByronAddrAttrs:
        """
        Create from dictionary.

        Args:
            attrs_dict (dict[int, bytes]): Attributes dictionary

        Returns:
            _AdaByronAddrAttrs object: _AdaByronAddrAttrs object

        Raises:
            ValueError: If the dictionary is not valid
        """
        if (len(attrs_dict) > 2
                or (len(attrs_dict) != 0 and 1 not in attrs_dict and 2 not in attrs_dict)):
            raise ValueError("Invalid address attributes")
        return cls(
            cbor2.loads(attrs_dict[1]) if 1 in attrs_dict else None,    # type: ignore [arg-type]
            cbor2.loads(attrs_dict[2]) if 2 in attrs_dict else None     # type: ignore [arg-type]
        )

    def ToDict(self) -> Dict[int, bytes]:
        """
        Get as a dictionary.

        Returns:
            dict[int, bytes]: Attributes dictionary
        """
        attrs = {}
        if self.hd_path_enc_bytes is not None:
            attrs[1] = cbor2.dumps(self.hd_path_enc_bytes)
        if self.network_magic:
            attrs[2] = cbor2.dumps(self.network_magic)
        return attrs


class _AdaByronAddrSpendingData(NamedTuple):
    """Utility class for Cardano Byron address spending data."""

    type: AdaByronAddrTypes
    key_bytes: bytes


class _AdaByronAddrRoot(NamedTuple):
    """Utility class for Cardano Byron address root."""

    type: AdaByronAddrTypes
    spending_data: _AdaByronAddrSpendingData
    attrs: _AdaByronAddrAttrs

    def Hash(self) -> bytes:
        """
        Get the address root hash.

        Returns:
            bytes: Address root hash bytes
        """
        return Blake2b224.QuickDigest(Sha3_256.QuickDigest(self.Serialize()))

    def Serialize(self) -> bytes:
        """
        Serialize the address root.

        Returns:
            bytes: Serialized address root bytes
        """
        return cbor2.dumps([
            self.type,
            tuple(self.spending_data),
            self.attrs.ToDict(),
        ])


class _AdaByronAddrPayload(NamedTuple):
    """Utility class for Cardano Byron address payload."""

    root_hash_bytes: bytes
    attrs: _AdaByronAddrAttrs
    type: AdaByronAddrTypes

    @classmethod
    def Deserialize(cls,
                    ser_payload_bytes: bytes) -> _AdaByronAddrPayload:
        """
        Deserialize from payload bytes.

        Args:
            ser_payload_bytes (bytes): Serialized payload bytes

        Returns:
            _AdaByronAddrPayload object: _AdaByronAddrPayload object

        Raises:
            ValueError: If the serialization is not valid
        """
        addr_payload: Tuple[bytes, Dict[int, bytes], int] = cbor2.loads(ser_payload_bytes)  # type: ignore [assignment]
        if (len(addr_payload) != 3
                or not isinstance(addr_payload[0], bytes)
                or not isinstance(addr_payload[1], dict)
                or not isinstance(addr_payload[2], int)):
            raise ValueError("Invalid address payload")
        # Check key hash length
        AddrDecUtils.ValidateLength(addr_payload[0],
                                    Blake2b224.DigestSize())

        return cls(
            addr_payload[0],
            _AdaByronAddrAttrs.FromDict(addr_payload[1]),
            AdaByronAddrTypes(addr_payload[2])
        )

    def Serialize(self) -> bytes:
        """
        Serialize the address payload.

        Returns:
            bytes: Serialized address payload bytes
        """
        return cbor2.dumps([
            self.root_hash_bytes,
            self.attrs.ToDict(),
            self.type,
        ])


class _AdaByronAddr(NamedTuple):
    """Utility class for Cardano Byron address."""

    payload: _AdaByronAddrPayload

    @classmethod
    def Decode(cls,
               addr: str) -> _AdaByronAddr:
        """
        Decode address.

        Args:
            addr (str): Address string

        Returns:
            _AdaByronAddr object: _AdaByronAddr object

        Raises:
            ValueError: If the serialization is not valid
        """
        return cls.Deserialize(Base58Decoder.Decode(addr))

    def Encode(self) -> str:
        """
        Encode address.

        Returns:
            str: Encoded address string
        """
        return Base58Encoder.Encode(self.Serialize())

    @classmethod
    def Deserialize(cls,
                    ser_addr_bytes: bytes) -> _AdaByronAddr:
        """
        Deserialize from address bytes.

        Args:
            ser_addr_bytes (bytes): Serialized address bytes

        Returns:
            _AdaByronAddrPayload object: _AdaByronAddrPayload object

        Raises:
            ValueError: If the serialization is not valid
        """
        addr_bytes: Tuple[cbor2.CBORTag, int] = cbor2.loads(ser_addr_bytes)     # type: ignore [assignment]
        if (len(addr_bytes) != 2
                or not isinstance(addr_bytes[0], cbor2.CBORTag)
                or not isinstance(addr_bytes[1], int)):
            raise ValueError("Invalid address encoding")
        # Get and check CBOR tag
        cbor_tag = addr_bytes[0]
        if cbor_tag.tag != AdaByronAddrConst.PAYLOAD_TAG:
            raise ValueError(f"Invalid CBOR tag ({cbor_tag.tag})")
        # Check CRC
        crc32_got = Crc32.QuickIntDigest(cbor_tag.value)
        if crc32_got != addr_bytes[1]:
            raise ValueError(f"Invalid CRC (expected: {addr_bytes[1]}, got: {crc32_got})")

        return cls(_AdaByronAddrPayload.Deserialize(cbor_tag.value))

    def Serialize(self) -> bytes:
        """
        Serialize the address.

        Returns:
            bytes: Serialized address bytes
        """
        ser_payload = self.payload.Serialize()
        return cbor2.dumps([
            cbor2.CBORTag(AdaByronAddrConst.PAYLOAD_TAG, ser_payload),
            Crc32.QuickIntDigest(ser_payload),
        ])


class _AdaByronAddrUtils:
    """Cardano Byron address utility class."""

    @staticmethod
    def EncodeKey(pub_key_bytes: bytes,
                  chain_code_bytes: bytes,
                  addr_type: AdaByronAddrTypes,
                  hd_path_enc_bytes: Optional[bytes] = None) -> str:
        """
        Encode a public key to Cardano Byron address.

        Args:
            pub_key_bytes (bytes)              : Public key bytes
            chain_code_bytes (bytes)           : Chain code bytes
            addr_type (AdaByronAddrTypes)      : Address type
            hd_path_enc_bytes (bytes, optional): Encrypted HD path bytes

        Returns:
            str: Address string
        """
        addr_attrs = _AdaByronAddrAttrs(hd_path_enc_bytes, None)

        # Get address root
        addr_root = _AdaByronAddrRoot(addr_type,
                                      _AdaByronAddrSpendingData(addr_type, pub_key_bytes[1:] + chain_code_bytes),
                                      addr_attrs)
        # Get address payload
        addr_payload = _AdaByronAddrPayload(addr_root.Hash(), addr_attrs, addr_type)

        # Add CRC32 and encode to base58
        return _AdaByronAddr(addr_payload).Encode()


class AdaByronAddrDecoder(IAddrDecoder):
    """
    Cardano Byron address decoder class.
    It allows the Cardano Byron address decoding.
    """

    @staticmethod
    def DecryptHdPath(hd_path_enc_bytes: bytes,
                      hd_path_key_bytes: bytes) -> Bip32Path:
        """
        Decrypt an HD path using the specified key.

        Args:
            hd_path_enc_bytes (bytes): Encrypted HD path bytes
            hd_path_key_bytes (bytes): HD path key bytes

        Returns:
            Bip32Path object: Bip32Path object

        Raises:
            ValueError: If the decryption fails
        """
        return _AdaByronAddrHdPath.Decrypt(hd_path_enc_bytes, hd_path_key_bytes)

    @staticmethod
    def SplitDecodedBytes(dec_bytes: bytes) -> Tuple[bytes, bytes]:
        """
        Split the decoded bytes into address root hash and encrypted HD path.

        Args:
            dec_bytes (bytes): Decoded bytes

        Returns:
            tuple[bytes, bytes]: Address root hash (index 0), encrypted HD path (index 1)
        """
        return (dec_bytes[:Blake2b224.DigestSize()],
                dec_bytes[Blake2b224.DigestSize():])

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Cardano Byron address (either legacy or Icarus) to bytes.
        The result can be split with SplitDecodedBytes if needed, to get the address root hash and
        encrypted HD path separately.

        Args:
            addr (str): Address string

        Other Parameters:
            addr_type (AdaByronAddrTypes): Expected address type (default: public key)

        Returns:
            bytes: Address root hash bytes (first 28-byte) and encrypted HD path (following bytes, if present)

        Raises:
            ValueError: If the address encoding is not valid
            TypeError: If the address type is not a AdaByronAddrTypes enum
        """
        addr_type = kwargs.get("addr_type", AdaByronAddrTypes.PUBLIC_KEY)
        if not isinstance(addr_type, AdaByronAddrTypes):
            raise TypeError("Address type is not an enumerative of AdaByronAddrTypes")

        try:
            dec_addr = _AdaByronAddr.Decode(addr)
            # Check address type
            if dec_addr.payload.type != addr_type:
                raise ValueError(f"Invalid address type (expected: {addr_type}, got: {dec_addr.payload.type})")

            return dec_addr.payload.root_hash_bytes + (dec_addr.payload.attrs.hd_path_enc_bytes
                                                       if dec_addr.payload.attrs.hd_path_enc_bytes is not None
                                                       else b"")
        except cbor2.CBORDecodeValueError as ex:
            raise ValueError("Invalid CBOR encoding") from ex


class AdaByronIcarusAddrEncoder(IAddrEncoder):
    """
    Cardano Byron Icarus address encoder class.
    It allows the Cardano Byron Icarus address encoding (i.e. without the encrypted derivation path, format Ae2...).
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Cardano Byron address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            chain_code (bytes or Bip32ChainCode object): Chain code bytes or object

        Returns:
            str: Address string

        Raises:
            Bip32PathError: If the path indexes are not valid
            ValueError: If the public key, the chain code or the HD path key is not valid
            TypeError: If the public key is not ed25519
        """

        # Get chain code (creating a Bip32ChainCode object checks for its validity)
        chain_code = kwargs["chain_code"]
        chain_code_bytes = (Bip32ChainCode(chain_code).ToBytes()
                            if isinstance(chain_code, bytes)
                            else chain_code.ToBytes())

        return _AdaByronAddrUtils.EncodeKey(
            AddrKeyValidator.ValidateAndGetEd25519Key(pub_key).RawCompressed().ToBytes(),
            chain_code_bytes,
            AdaByronAddrTypes.PUBLIC_KEY
        )


class AdaByronLegacyAddrEncoder(IAddrEncoder):
    """
    Cardano Byron legacy address encoder class.
    It allows the Cardano Byron legacy address encoding (i.e. containing the encrypted derivation path, format Ddz...).
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Cardano Byron address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            chain_code (bytes or Bip32ChainCode object): Chain code bytes or object
            hd_path (str or Bip32Path object)          : HD path
            hd_path_key (bytes)                        : HD path key bytes, shall be 32-byte long

        Returns:
            str: Address string

        Raises:
            Bip32PathError: If the path indexes are not valid
            ValueError: If the public key, the chain code or the HD path key is not valid
            TypeError: If the public key is not ed25519
        """

        # Get HD path
        hd_path = kwargs["hd_path"]
        if isinstance(hd_path, str):
            hd_path = Bip32PathParser.Parse(hd_path)

        # Get HD path key
        hd_path_key_bytes = kwargs["hd_path_key"]
        if hd_path_key_bytes is not None and len(hd_path_key_bytes) != ChaCha20Poly1305.KeySize():
            raise ValueError("HD path key shall be 32-byte long")

        # Get chain code (creating a Bip32ChainCode object checks for its validity)
        chain_code = kwargs["chain_code"]
        chain_code_bytes = (Bip32ChainCode(chain_code).ToBytes()
                            if isinstance(chain_code, bytes)
                            else chain_code.ToBytes())

        return _AdaByronAddrUtils.EncodeKey(
            AddrKeyValidator.ValidateAndGetEd25519Key(pub_key).RawCompressed().ToBytes(),
            chain_code_bytes,
            AdaByronAddrTypes.PUBLIC_KEY,
            _AdaByronAddrHdPath.Encrypt(hd_path, hd_path_key_bytes) if hd_path_key_bytes is not None else None
        )


# Deprecated: only for compatibility, Encoder class shall be used instead
AdaByronIcarusAddr = AdaByronIcarusAddrEncoder
AdaByronLegacyAddr = AdaByronLegacyAddrEncoder

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

"""Module for BIP32 extended key serialization/deserialization."""

# Imports
from typing import Tuple

from ..base58 import Base58Decoder, Base58Encoder
from .bip32_const import Bip32Const
from .bip32_ex import Bip32KeyError
from .bip32_key_data import Bip32ChainCode, Bip32Depth, Bip32FingerPrint, Bip32KeyData, Bip32KeyIndex
from .bip32_key_net_ver import Bip32KeyNetVersions
from ..ecc import IPrivateKey, IPublicKey
from ..utils.misc import BytesUtils


class Bip32KeySerConst:
    """Class container for BIP32 key serialize constants."""

    # Serialized public key length in bytes
    SERIALIZED_PUB_KEY_BYTE_LEN: int = 78
    # Serialized private key length in bytes
    SERIALIZED_PRIV_KEY_BYTE_LEN: Tuple[int, int] = (78, 110)


class _Bip32KeySerializer:
    """
    BIP32 key serializer class.
    It serializes private/public keys.
    """

    @staticmethod
    def Serialize(key_bytes: bytes,
                  key_data: Bip32KeyData,
                  key_net_ver_bytes: bytes) -> str:
        """
        Serialize the specified key bytes.

        Args:
            key_bytes (bytes)           : Key bytes
            key_data (BipKeyData object): Key data
            key_net_ver_bytes (bytes)   : Key net version bytes

        Returns:
            str: Serialized key
        """

        # Serialize key
        ser_key = (
            key_net_ver_bytes
            + bytes(key_data.Depth()) + bytes(key_data.ParentFingerPrint()) + bytes(key_data.Index())
            + bytes(key_data.ChainCode()) + key_bytes
        )
        # Encode it
        return Base58Encoder.CheckEncode(ser_key)


class Bip32PrivateKeySerializer:
    """
    BIP32 private key serializer class.
    It serializes private keys.
    """

    @staticmethod
    def Serialize(priv_key: IPrivateKey,
                  key_data: Bip32KeyData,
                  key_net_ver: Bip32KeyNetVersions = Bip32Const.MAIN_NET_KEY_NET_VERSIONS) -> str:
        """
        Serialize a private key.

        Args:
            priv_key (IPrivateKey object)                     : IPrivateKey object
            key_data (BipKeyData object)                      : Key data
            key_net_ver (Bip32KeyNetVersions object, optional): Key net versions (BIP32 main net version by default)

        Returns:
            str: Serialized private key
        """
        return _Bip32KeySerializer.Serialize(b"\x00" + priv_key.Raw().ToBytes(),
                                             key_data,
                                             key_net_ver.Private())


class Bip32PublicKeySerializer:
    """
    BIP32 public key serializer class.
    It serializes public keys.
    """

    @staticmethod
    def Serialize(pub_key: IPublicKey,
                  key_data: Bip32KeyData,
                  key_net_ver: Bip32KeyNetVersions = Bip32Const.MAIN_NET_KEY_NET_VERSIONS) -> str:
        """
        Serialize a public key.

        Args:
            pub_key (IPublicKey object)                       : IPublicKey object
            key_data (BipKeyData object)                      : Key data
            key_net_ver (Bip32KeyNetVersions object, optional): Key net versions (BIP32 main net version by default)

        Returns:
            str: Serialized public key
        """
        return _Bip32KeySerializer.Serialize(pub_key.RawCompressed().ToBytes(),
                                             key_data,
                                             key_net_ver.Public())


class Bip32DeserializedKey:
    """
    BIP32 deserialized key class.
    It represents a key deserialized with the Bip32KeyDeserializer.
    """

    m_key_bytes: bytes
    m_key_data: Bip32KeyData
    m_is_public: bool

    def __init__(self,
                 key_bytes: bytes,
                 key_data: Bip32KeyData,
                 is_public: bool) -> None:
        """
        Construct class.

        Args:
            key_bytes (bytes)           : Key bytes
            key_data (BipKeyData object): Key data
            is_public (bool)            : True if the key is public, false otherwise

        Returns:
            str: Serialized public key
        """
        self.m_key_bytes = key_bytes
        self.m_key_data = key_data
        self.m_is_public = is_public

    def KeyBytes(self) -> bytes:
        """
        Get key bytes.

        Returns:
            bytes: Key bytes
        """
        return self.m_key_bytes

    def KeyData(self) -> Bip32KeyData:
        """
        Get key data.

        Returns:
            Bip32KeyData object: Bip32KeyData object
        """
        return self.m_key_data

    def IsPublic(self) -> bool:
        """
        Get if public.

        Returns:
            bool: True if the key is public, false otherwise
        """
        return self.m_is_public


class Bip32KeyDeserializer:
    """
    BIP32 key deserializer class.
    It deserializes an extended key.
    """

    @classmethod
    def DeserializeKey(cls,
                       ser_key_str: str,
                       key_net_ver: Bip32KeyNetVersions = Bip32Const.MAIN_NET_KEY_NET_VERSIONS) -> Bip32DeserializedKey:
        """
        Deserialize a key.

        Args:
            ser_key_str (str)                                 : Serialized key string
            key_net_ver (Bip32KeyNetVersions object, optional): Key net versions (BIP32 main net version by default)

        Returns:
            Bip32DeserializedKey object: Bip32DeserializedKey object

        Raises:
            Bip32KeyError: If the key is not valid
        """

        # Decode key
        ser_key_bytes = Base58Decoder.CheckDecode(ser_key_str)

        # Get if key is public/private depending on the net version
        is_public = cls.__GetIfPublic(ser_key_bytes, key_net_ver)

        # Validate length
        if is_public and len(ser_key_bytes) != Bip32KeySerConst.SERIALIZED_PUB_KEY_BYTE_LEN:
            raise Bip32KeyError(f"Invalid extended public key (wrong length: {len(ser_key_bytes)})")
        if not is_public and len(ser_key_bytes) not in Bip32KeySerConst.SERIALIZED_PRIV_KEY_BYTE_LEN:
            raise Bip32KeyError(f"Invalid extended private key (wrong length: {len(ser_key_bytes)})")

        # Get parts back
        key_bytes, key_data = cls.__GetPartsFromBytes(ser_key_bytes, is_public)

        return Bip32DeserializedKey(key_bytes, key_data, is_public)

    @staticmethod
    def __GetIfPublic(ser_key_bytes: bytes,
                      key_net_ver: Bip32KeyNetVersions) -> bool:
        """
        Get if the key is public.

        Args:
            ser_key_bytes (bytes)                   : Serialized key bytes
            key_net_ver (Bip32KeyNetVersions object): Key net versions

        Returns:
            bool: True if public, false otherwise

        Raises:
            Bip32KeyError: If the key net version is not valid
        """
        key_net_ver_got = ser_key_bytes[:Bip32KeyNetVersions.Length()]
        if key_net_ver_got == key_net_ver.Public():
            is_public = True
        elif key_net_ver_got == key_net_ver.Private():
            is_public = False
        else:
            raise Bip32KeyError(
                f"Invalid extended key (wrong net version: {BytesUtils.ToHexString(key_net_ver_got)})"
            )
        return is_public

    @staticmethod
    def __GetPartsFromBytes(ser_key_bytes: bytes,
                            is_public: bool) -> Tuple[bytes, Bip32KeyData]:
        """
        Get back key parts from serialized key bytes.

        Args:
            ser_key_bytes (bytes): Serialized key bytes
            is_public (bool)     : True if the key is public, false otherwise

        Returns:
            tuple[bytes, Bip32KeyData]: key bytes (index 0) and key data (index 1)

        Raises:
            Bip32KeyError: If the private key first byte is not zero
        """

        # Compute indexes
        depth_idx = Bip32KeyNetVersions.Length()
        fprint_idx = depth_idx + Bip32Depth.FixedLength()
        key_index_idx = fprint_idx + Bip32FingerPrint.FixedLength()
        chain_code_idx = key_index_idx + Bip32KeyIndex.FixedLength()
        key_idx = chain_code_idx + Bip32ChainCode.FixedLength()

        # Get parts
        depth = ser_key_bytes[depth_idx]
        fprint_bytes = ser_key_bytes[fprint_idx:key_index_idx]
        key_index_bytes = ser_key_bytes[key_index_idx:chain_code_idx]
        chain_code_bytes = ser_key_bytes[chain_code_idx:key_idx]
        key_bytes = ser_key_bytes[key_idx:]
        key_data = Bip32KeyData(Bip32Depth(depth),
                                Bip32KeyIndex.FromBytes(key_index_bytes),
                                Bip32ChainCode(chain_code_bytes),
                                Bip32FingerPrint(fprint_bytes))

        # If private key, the first byte shall be zero and shall be removed
        if not is_public:
            if key_bytes[0] != 0:
                raise Bip32KeyError(f"Invalid extended private key (wrong secret: {key_bytes[0]})")
            key_bytes = key_bytes[1:]

        return key_bytes, key_data

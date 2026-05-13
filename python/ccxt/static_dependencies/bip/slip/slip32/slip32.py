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
Module for SLIP32 extended key serialization/deserialization.
Reference: https://github.com/satoshilabs/slips/blob/master/slip-0032.md
"""

# Imports
from typing import Tuple, Union

from bip_utils.bech32 import Bech32Decoder, Bech32Encoder
from bip_utils.bip.bip32 import Bip32ChainCode, Bip32Depth, Bip32KeyIndex, Bip32Path, Bip32PathParser
from bip_utils.ecc import IPrivateKey, IPublicKey
from bip_utils.slip.slip32.slip32_key_net_ver import Slip32KeyNetVersions


class Slip32KeySerConst:
    """Class container for SLIP32 key serialize constants."""

    # Standard key net versions
    STD_KEY_NET_VERSIONS: Slip32KeyNetVersions = Slip32KeyNetVersions("xpub", "xprv")


class _Slip32KeySerializer:
    """
    SLIP32 key serializer class.
    It serializes private/public keys.
    """

    @classmethod
    def Serialize(cls,
                  key_bytes: bytes,
                  path: Union[str, Bip32Path],
                  chain_code: Union[bytes, Bip32ChainCode],
                  key_net_ver_str: str) -> str:
        """
        Serialize the specified key bytes.

        Args:
            key_bytes (bytes)                          : Key bytes
            path (str or Bip32Path object)             : BIP32 path
            chain_code (bytes or Bip32ChainCode object): Chain code
            key_net_ver_str (str)                      : Key net version string

        Returns:
            str: Serialized key
        """
        if isinstance(path, str):
            path = Bip32PathParser.Parse(path)
        if isinstance(chain_code, bytes):
            chain_code = Bip32ChainCode(chain_code)

        # Serialize key
        ser_key = (
            bytes(Bip32Depth(path.Length())) + cls.__SerializePath(path) + bytes(chain_code) + key_bytes
        )
        # Encode it
        return Bech32Encoder.Encode(key_net_ver_str, ser_key)

    @staticmethod
    def __SerializePath(path: Bip32Path) -> bytes:
        """
        Serialize BIP32 path.

        Args:
            path (Bip32Path object): BIP32 path

        Returns:
            bytes: Serialized path
        """
        path_bytes = b""
        for path_elem in path:
            path_bytes += path_elem.ToBytes()

        return path_bytes


class Slip32PrivateKeySerializer:
    """
    SLIP32 private key serializer class.
    It serializes private keys.
    """

    @staticmethod
    def Serialize(priv_key: IPrivateKey,
                  path: Union[str, Bip32Path],
                  chain_code: Union[bytes, Bip32ChainCode],
                  key_net_ver: Slip32KeyNetVersions = Slip32KeySerConst.STD_KEY_NET_VERSIONS) -> str:
        """
        Serialize a private key.

        Args:
            priv_key (IPrivateKey object)                      : IPrivateKey object
            path (str or Bip32Path object)                     : BIP32 path
            chain_code (bytes or Bip32ChainCode object)        : Chain code
            key_net_ver (Slip32KeyNetVersions object, optional): Key net versions (SLIP32 net version by default)

        Returns:
            str: Serialized private key
        """
        return _Slip32KeySerializer.Serialize(b"\x00" + priv_key.Raw().ToBytes(),
                                              path,
                                              chain_code,
                                              key_net_ver.Private())


class Slip32PublicKeySerializer:
    """
    SLIP32 public key serializer class.
    It serializes public keys.
    """

    @staticmethod
    def Serialize(pub_key: IPublicKey,
                  path: Union[str, Bip32Path],
                  chain_code: Union[bytes, Bip32ChainCode],
                  key_net_ver: Slip32KeyNetVersions = Slip32KeySerConst.STD_KEY_NET_VERSIONS) -> str:
        """
        Serialize a public key.

        Args:
            pub_key (IPublicKey object)                        : IPublicKey object
            path (str or Bip32Path object)                     : BIP32 path
            chain_code (bytes or Bip32ChainCode object)        : Chain code
            key_net_ver (Slip32KeyNetVersions object, optional): Key net versions (SLIP32 net version by default)

        Returns:
            str: Serialized public key
        """
        return _Slip32KeySerializer.Serialize(pub_key.RawCompressed().ToBytes(),
                                              path,
                                              chain_code,
                                              key_net_ver.Public())


class Slip32DeserializedKey:
    """
    SLIP32 deserialized key class.
    It represents a key deserialized with the Slip32KeyDeserializer.
    """

    m_key_bytes: bytes
    m_path: Bip32Path
    m_chain_code: Bip32ChainCode
    m_is_public: bool

    def __init__(self,
                 key_bytes: bytes,
                 path: Bip32Path,
                 chain_code: Bip32ChainCode,
                 is_public: bool) -> None:
        """
        Construct class.

        Args:
            key_bytes (bytes)                 : Key bytes
            path (Bip32Path object)           : BIP32 path
            chain_code (Bip32ChainCode object): Chain code
            is_public (bool)                  : True if the key is public, false otherwise

        Returns:
            str: Serialized public key
        """
        self.m_key_bytes = key_bytes
        self.m_path = path
        self.m_chain_code = chain_code
        self.m_is_public = is_public

    def KeyBytes(self) -> bytes:
        """
        Get key bytes.

        Returns:
            bytes: Key bytes
        """
        return self.m_key_bytes

    def Path(self) -> Bip32Path:
        """
        Get path.

        Returns:
            Bip32Path object: Bip32Path object
        """
        return self.m_path

    def ChainCode(self) -> Bip32ChainCode:
        """
        Get chain code.

        Returns:
            Bip32ChainCode object: Bip32ChainCode object
        """
        return self.m_chain_code

    def IsPublic(self) -> bool:
        """
        Get if public.

        Returns:
            bool: True if the key is public, false otherwise
        """
        return self.m_is_public


class Slip32KeyDeserializer:
    """
    SLIP32 key deserializer class.
    It deserializes an extended key.
    """

    @classmethod
    def DeserializeKey(
            cls,
            ser_key_str: str,
            key_net_ver: Slip32KeyNetVersions = Slip32KeySerConst.STD_KEY_NET_VERSIONS
    ) -> Slip32DeserializedKey:
        """
        Deserialize a key.

        Args:
            ser_key_str (str)                                  : Serialized key string
            key_net_ver (Slip32KeyNetVersions object, optional): Key net versions (SLIP32 net version by default)

        Returns:
            Slip32DeserializedKey object: Slip32DeserializedKey object

        Raises:
            ValueError: If the key net version is not valid
        """

        # Get if key is public/private depending on the net version
        is_public = cls.__GetIfPublic(ser_key_str, key_net_ver)

        # Decode key
        ser_key_bytes = Bech32Decoder.Decode(
            key_net_ver.Public() if is_public else key_net_ver.Private(),
            ser_key_str
        )

        # Get parts back
        key_bytes, path, chain_code = cls.__GetPartsFromBytes(ser_key_bytes, is_public)

        return Slip32DeserializedKey(key_bytes, path, chain_code, is_public)

    @staticmethod
    def __GetIfPublic(ser_key_str: str,
                      key_net_ver: Slip32KeyNetVersions) -> bool:
        """
        Get if the key is public.

        Args:
            ser_key_str (str)                        : Serialized key string
            key_net_ver (Slip32KeyNetVersions object): Key net versions

        Returns:
            bool: True if public, false otherwise
        """
        if ser_key_str[:len(key_net_ver.Public())] == key_net_ver.Public():
            is_public = True
        elif ser_key_str[:len(key_net_ver.Private())] == key_net_ver.Private():
            is_public = False
        else:
            raise ValueError("Invalid extended key (wrong net version)")
        return is_public

    @staticmethod
    def __GetPartsFromBytes(ser_key_bytes: bytes,
                            is_public: bool) -> Tuple[bytes, Bip32Path, Bip32ChainCode]:
        """
        Get back key parts from serialized key bytes.

        Args:
            ser_key_bytes (bytes): Serialized key bytes
            is_public (bool)     : True if the key is public, false otherwise

        Returns:
            Tuple[bytes, Bip32Path, Bip32ChainCode]: key bytes (index 0), BIP32 path (index 1) and chain code (index 2)
        """
        depth_idx = 0
        path_idx = depth_idx + Bip32Depth.FixedLength()

        # Get back depth and path
        depth = ser_key_bytes[depth_idx]
        path = Bip32Path()
        for i in range(depth):
            key_index_bytes = ser_key_bytes[path_idx + (i * Bip32KeyIndex.FixedLength()):
                                            path_idx + ((i + 1) * Bip32KeyIndex.FixedLength())]
            path = path.AddElem(Bip32KeyIndex.FromBytes(key_index_bytes))

        # Get back chain code and key
        chain_code_idx = path_idx + (depth * Bip32KeyIndex.FixedLength())
        key_idx = chain_code_idx + Bip32ChainCode.FixedLength()

        chain_code_bytes = ser_key_bytes[chain_code_idx:key_idx]
        key_bytes = ser_key_bytes[key_idx:]

        # If private key, the first byte shall be zero and shall be removed
        if not is_public:
            if key_bytes[0] != 0:
                raise ValueError(f"Invalid extended private key (wrong secret: {key_bytes[0]})")
            key_bytes = key_bytes[1:]

        return key_bytes, path, Bip32ChainCode(chain_code_bytes)

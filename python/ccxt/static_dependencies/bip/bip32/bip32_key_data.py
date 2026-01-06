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

"""Module with helper classes for BIP32 key data."""

# Imports
from __future__ import annotations

from typing import Union

from ..utils.misc import BitUtils, BytesUtils, DataBytes, IntegerUtils
from ..utils.typing import Literal


class Bip32KeyDataConst:
    """Class container for BIP32 key data constants."""

    # Chaincode length in bytes
    CHAINCODE_BYTE_LEN: int = 32
    # Depth length in bytes
    DEPTH_BYTE_LEN: int = 1
    # Fingerprint length in bytes
    FINGERPRINT_BYTE_LEN: int = 4
    # Fingerprint of master key
    FINGERPRINT_MASTER_KEY: bytes = b"\x00\x00\x00\x00"
    # Key index length in bytes
    KEY_INDEX_BYTE_LEN: int = 4
    # Key index maximum value
    KEY_INDEX_MAX_VAL: int = 2**32 - 1
    # Key index hardened bit number
    KEY_INDEX_HARDENED_BIT_NUM: int = 31


class Bip32ChainCode(DataBytes):
    """
    BIP32 chaincode class.
    It represents a BIP32 chaincode.
    """

    def __init__(self,
                 chaincode: bytes = b"\x00" * Bip32KeyDataConst.CHAINCODE_BYTE_LEN) -> None:
        """
        Construct class.

        Args:
            chaincode (bytes, optional): Fingerprint bytes (default: zero)

        Raises:
            ValueError: If the chain code length is not valid
        """
        if len(chaincode) != self.FixedLength():
            raise ValueError(f"Invalid chaincode length ({len(chaincode)})")
        super().__init__(chaincode)

    @staticmethod
    def FixedLength() -> int:
        """
        Get the fixed length in bytes.

        Returns:
            int: Length in bytes
        """
        return Bip32KeyDataConst.CHAINCODE_BYTE_LEN


class Bip32FingerPrint(DataBytes):
    """
    BIP32 fingerprint class.
    It represents a BIP32 fingerprint.
    """

    def __init__(self,
                 fprint: bytes = Bip32KeyDataConst.FINGERPRINT_MASTER_KEY) -> None:
        """
        Construct class.

        Args:
            fprint (bytes, optional): Fingerprint bytes (default: master key)

        Raises:
            ValueError: If the chain code length is not valid
        """
        if len(fprint) < self.FixedLength():
            raise ValueError(f"Invalid fingerprint length ({len(fprint)})")
        super().__init__(fprint[:Bip32KeyDataConst.FINGERPRINT_BYTE_LEN])

    @staticmethod
    def FixedLength() -> int:
        """
        Get the fixed length in bytes.

        Returns:
            int: Length in bytes
        """
        return Bip32KeyDataConst.FINGERPRINT_BYTE_LEN

    def IsMasterKey(self) -> bool:
        """
        Get if the fingerprint corresponds to a master key.

        Returns:
            bool: True if it corresponds to a master key, false otherwise
        """
        return self.ToBytes() == Bip32KeyDataConst.FINGERPRINT_MASTER_KEY


class Bip32Depth:
    """
    BIP32 depth class.
    It represents a BIP32 depth.
    """

    m_depth: int

    def __init__(self,
                 depth: int) -> None:
        """
        Construct class.

        Args:
            depth (int): Depth

        Raises:
            ValueError: If the depth value is not valid
        """
        if depth < 0:
            raise ValueError(f"Invalid depth ({depth})")
        self.m_depth = depth

    @staticmethod
    def FixedLength() -> int:
        """
        Get the fixed length in bytes.

        Returns:
            int: Length in bytes
        """
        return Bip32KeyDataConst.DEPTH_BYTE_LEN

    def Increase(self) -> Bip32Depth:
        """
        Get a new object with increased depth.

        Returns:
            Bip32Depth object: Bip32Depth object
        """
        return Bip32Depth(self.m_depth + 1)

    def ToBytes(self) -> bytes:
        """
        Get the depth as bytes.

        Returns:
            bytes: Depth bytes
        """
        return IntegerUtils.ToBytes(self.m_depth, bytes_num=self.FixedLength())

    def ToInt(self) -> int:
        """
        Get the depth as integer.

        Returns:
            int: Depth index
        """
        return int(self.m_depth)

    def __int__(self) -> int:
        """
        Get the depth as integer.

        Returns:
            int: Depth index
        """
        return self.ToInt()

    def __bytes__(self) -> bytes:
        """
        Get the depth as bytes.

        Returns:
            bytes: Depth bytes
        """
        return self.ToBytes()

    def __eq__(self,
               other: object) -> bool:
        """
        Equality operator.

        Args:
            other (int or Bip32Depth object): Other object to compare

        Returns:
            bool: True if equal false otherwise

        Raises:
            TypeError: If the other object is not of the correct type
        """
        if not isinstance(other, (int, Bip32Depth)):
            raise TypeError(f"Invalid type for checking equality ({type(other)})")

        if isinstance(other, int):
            return self.m_depth == other
        return self.m_depth == other.m_depth

    def __gt__(self,
               other: Union[int, Bip32Depth]) -> bool:
        """
        Greater than operator.

        Args:
            other (int or Bip32Depth object): Other value to compare

        Returns:
            bool: True if greater false otherwise
        """
        if isinstance(other, int):
            return self.m_depth > other
        return self.m_depth > other.m_depth

    def __lt__(self,
               other: Union[int, Bip32Depth]) -> bool:
        """
        Lower than operator.

        Args:
            other (int or Bip32Depth object): Other value to compare

        Returns:
            bool: True if lower false otherwise
        """
        if isinstance(other, int):
            return self.m_depth < other
        return self.m_depth < other.m_depth


class Bip32KeyIndex:
    """
    BIP32 key index class.
    It represents a BIP32 key index.
    """

    m_idx: int

    @staticmethod
    def HardenIndex(index: int) -> int:
        """
        Harden the specified index and return it.

        Args:
            index (int): Index

        Returns:
            int: Hardened index
        """
        return BitUtils.SetBit(index, Bip32KeyDataConst.KEY_INDEX_HARDENED_BIT_NUM)

    @staticmethod
    def UnhardenIndex(index: int) -> int:
        """
        Unharden the specified index and return it.

        Args:
            index (int): Index

        Returns:
            int: Unhardened index
        """
        return BitUtils.ResetBit(index, Bip32KeyDataConst.KEY_INDEX_HARDENED_BIT_NUM)

    @staticmethod
    def IsHardenedIndex(index: int) -> bool:
        """
        Get if the specified index is hardened.

        Args:
            index (int): Index

        Returns:
            bool: True if hardened, false otherwise
        """
        return BitUtils.IsBitSet(index, Bip32KeyDataConst.KEY_INDEX_HARDENED_BIT_NUM)

    @classmethod
    def FromBytes(cls,
                  index_bytes: bytes) -> Bip32KeyIndex:
        """
        Construct class from bytes.

        Args:
            index_bytes (bytes): Key index bytes

        Returns:
            Bip32KeyIndex object: Bip32KeyIndex object

        Raises:
            ValueError: If the index is not valid
        """
        return cls(BytesUtils.ToInteger(index_bytes))

    def __init__(self,
                 idx: int) -> None:
        """
        Construct class.

        Args:
            idx (int): Key index

        Raises:
            ValueError: If the index value is not valid
        """
        if idx < 0 or idx > Bip32KeyDataConst.KEY_INDEX_MAX_VAL:
            raise ValueError(f"Invalid key index ({idx})")
        self.m_idx = idx

    @staticmethod
    def FixedLength() -> int:
        """
        Get the fixed length in bytes.

        Returns:
            int: Length in bytes
        """
        return Bip32KeyDataConst.KEY_INDEX_BYTE_LEN

    def Harden(self) -> Bip32KeyIndex:
        """
        Get a new Bip32KeyIndex object with the current key index hardened.

        Returns:
            Bip32KeyIndex object: Bip32KeyIndex object
        """
        return Bip32KeyIndex(self.HardenIndex(self.m_idx))

    def Unharden(self) -> Bip32KeyIndex:
        """
        Get a new Bip32KeyIndex object with the current key index unhardened.

        Returns:
            Bip32KeyIndex object: Bip32KeyIndex object
        """
        return Bip32KeyIndex(self.UnhardenIndex(self.m_idx))

    def IsHardened(self) -> bool:
        """
        Get if the key index is hardened.

        Returns:
            bool: True if hardened, false otherwise
        """
        return self.IsHardenedIndex(self.m_idx)

    def ToBytes(self,
                endianness: Literal["little", "big"] = "big") -> bytes:
        """
        Get the key index as bytes.

        Args:
            endianness ("big" or "little", optional): Endianness (default: big)

        Returns:
            bytes: Key bytes
        """
        return IntegerUtils.ToBytes(self.m_idx,
                                    bytes_num=self.FixedLength(),
                                    endianness=endianness)

    def ToInt(self) -> int:
        """
        Get the key index as integer.

        Returns:
            int: Key index
        """
        return int(self.m_idx)

    def __int__(self) -> int:
        """
        Get the key index as integer.

        Returns:
            int: Key index
        """
        return self.ToInt()

    def __bytes__(self) -> bytes:
        """
        Get the key index as bytes.

        Returns:
            bytes: Key bytes
        """
        return self.ToBytes()

    def __eq__(self,
               other: object) -> bool:
        """
        Equality operator.

        Args:
            other (int or Bip32KeyIndex object): Other value to compare

        Returns:
            bool: True if equal false otherwise

        Raises:
            TypeError: If the object is not of the correct type
        """
        if not isinstance(other, (int, Bip32KeyIndex)):
            raise TypeError(f"Invalid type for checking equality ({type(other)})")

        if isinstance(other, int):
            return self.m_idx == other
        return self.m_idx == other.m_idx


class Bip32KeyData:
    """
    BIP32 key data class.
    It contains all additional data related to a BIP32 key (e.g. depth, chain code, etc...).
    """

    m_depth: Bip32Depth
    m_index: Bip32KeyIndex
    m_chain_code: Bip32ChainCode
    m_parent_fprint: Bip32FingerPrint

    def __init__(self,
                 depth: Union[int, Bip32Depth] = Bip32Depth(0),
                 index: Union[int, Bip32KeyIndex] = Bip32KeyIndex(0),
                 chain_code: Union[bytes, Bip32ChainCode] = Bip32ChainCode(),
                 parent_fprint: Union[bytes, Bip32FingerPrint] = Bip32FingerPrint()) -> None:
        """
        Construct class.

        Args:
            depth (Bip32Depth object)               : Key depth
            index (Bip32KeyIndex object)            : Key index
            chain_code (Bip32ChainCode object)      : Key chain code
            parent_fprint (Bip32FingerPrint object) : Key parent fingerprint
        """
        self.m_depth = depth if isinstance(depth, Bip32Depth) else Bip32Depth(depth)
        self.m_index = index if isinstance(index, Bip32KeyIndex) else Bip32KeyIndex(index)
        self.m_chain_code = chain_code if isinstance(chain_code, Bip32ChainCode) else Bip32ChainCode(chain_code)
        self.m_parent_fprint = (parent_fprint
                                if isinstance(parent_fprint, Bip32FingerPrint)
                                else Bip32FingerPrint(parent_fprint))

    def Depth(self) -> Bip32Depth:
        """
        Get current depth.

        Returns:
            Bip32Depth object: Current depth
        """
        return self.m_depth

    def Index(self) -> Bip32KeyIndex:
        """
        Get current index.

        Returns:
            Bip32KeyIndex object: Current index
        """
        return self.m_index

    def ChainCode(self) -> Bip32ChainCode:
        """
        Get current chain code.

        Returns:
            Bip32ChainCode object: Chain code
        """
        return self.m_chain_code

    def ParentFingerPrint(self) -> Bip32FingerPrint:
        """
        Get parent fingerprint.

        Returns:
            Bip32FingerPrint object: Parent fingerprint
        """
        return self.m_parent_fprint

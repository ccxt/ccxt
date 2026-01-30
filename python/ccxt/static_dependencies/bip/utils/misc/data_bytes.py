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

"""Module with helper class for data bytes."""

# Imports
from typing import Iterator

from .bytes import BytesUtils
from ..typing import Literal


class DataBytes:
    """
    Data bytes class.
    It allows to get bytes in different formats.
    """

    m_data_bytes: bytes

    def __init__(self,
                 data_bytes: bytes) -> None:
        """
        Construct class.

        Args:
            data_bytes (bytes): Data bytes
        """
        self.m_data_bytes = data_bytes

    def Length(self) -> int:
        """
        Get length in bytes.

        Returns:
            int: Length in bytes
        """
        return len(self.m_data_bytes)

    def Size(self) -> int:
        """
        Get length in bytes (same of Length()).

        Returns:
            int: Length in bytes
        """
        return self.Length()

    def ToBytes(self) -> bytes:
        """
        Get data bytes.

        Returns:
            bytes: Data bytes
        """
        return self.m_data_bytes

    def ToHex(self) -> str:
        """
        Get data bytes in hex format.

        Returns:
            str: Data bytes in hex format
        """
        return BytesUtils.ToHexString(self.m_data_bytes)

    def ToInt(self,
              endianness: Literal["little", "big"] = "big") -> int:
        """
        Get data bytes as an integer.

        Args:
            endianness ("big" or "little", optional): Endianness (default: big)

        Returns:
            int: Data bytes as an integer
        """
        return BytesUtils.ToInteger(self.m_data_bytes, endianness)

    def __len__(self) -> int:
        """
        Get length in bytes.

        Returns:
            int: Length in bytes
        """
        return self.Length()

    def __bytes__(self) -> bytes:
        """
        Get data bytes.

        Returns:
            bytes: Data bytes
        """
        return self.ToBytes()

    def __int__(self) -> int:
        """
        Get data bytes as integer.

        Returns:
            bytes: Data bytes as integer
        """
        return self.ToInt()

    def __repr__(self) -> str:
        """
        Get data bytes representation.

        Returns:
            str: Data bytes representation
        """
        return self.ToHex()

    def __getitem__(self,
                    idx: int) -> int:
        """
        Get the element with the specified index.

        Args:
            idx (int): Index

        Returns:
            int: Element

        Raises:
            IndexError: If the index is not valid
        """
        return self.m_data_bytes[idx]

    def __iter__(self) -> Iterator[int]:
        """
        Get the iterator to the current element.

        Returns:
            Iterator object: Iterator to the current element
        """
        yield from self.m_data_bytes

    def __eq__(self,
               other: object) -> bool:
        """
        Equality operator.

        Args:
            other (bytes, str, int or DataBytes object): Other object to compare

        Returns:
            bool: True if equal false otherwise

        Raises:
            TypeError: If the other object is not of the correct type
        """
        if not isinstance(other, (bytes, int, str, DataBytes)):
            raise TypeError(f"Invalid type for checking equality ({type(other)})")

        if isinstance(other, bytes):
            return other == bytes(self)
        if isinstance(other, int):
            return other == int(self)
        if isinstance(other, str):
            return other == str(self)
        return bytes(other) == bytes(self)

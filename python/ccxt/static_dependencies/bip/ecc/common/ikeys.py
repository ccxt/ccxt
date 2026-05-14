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

"""Module with interfaces for public/private keys classes."""

# Imports
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from .ipoint import IPoint
from ..curve.elliptic_curve_types import EllipticCurveTypes
from ...utils.misc import DataBytes


class IPublicKey(ABC):
    """
    Interface for a generic elliptic curve public key.
    Verify method is missing because not needed.
    """

    @classmethod
    @abstractmethod
    def FromBytes(cls,
                  key_bytes: bytes) -> IPublicKey:
        """
        Construct class from key bytes.

        Args:
            key_bytes (bytes): Key bytes

        Returns:
            IPublicKey: IPublicKey object

        Raises:
            ValueError: If key bytes are not valid
        """

    @classmethod
    @abstractmethod
    def FromPoint(cls,
                  key_point: IPoint) -> IPublicKey:
        """
        Construct class from key point.

        Args:
            key_point (IPoint object): Key point

        Returns:
            IPublicKey: IPublicKey object

        Raises:
            ValueError: If key point is not valid
        """

    @staticmethod
    @abstractmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Get the elliptic curve type.

        Returns:
           EllipticCurveTypes: Elliptic curve type
        """

    @classmethod
    def IsValidBytes(cls,
                     key_bytes: bytes) -> bool:
        """
        Return if the specified bytes represents a valid public key.

        Args:
            key_bytes (bytes): Key bytes

        Returns:
            bool: True if valid, false otherwise
        """
        try:
            cls.FromBytes(key_bytes)
            return True
        except ValueError:
            return False

    @classmethod
    def IsValidPoint(cls,
                     key_point: IPoint) -> bool:
        """
        Return if the specified point represents a valid public key.

        Args:
            key_point (IPoint object): Key point

        Returns:
            bool: True if valid, false otherwise
        """
        try:
            cls.FromPoint(key_point)
            return True
        except ValueError:
            return False

    @staticmethod
    @abstractmethod
    def CompressedLength() -> int:
        """
        Get the compressed key length.

        Returns:
           int: Compressed key length
        """

    @staticmethod
    @abstractmethod
    def UncompressedLength() -> int:
        """
        Get the uncompressed key length.

        Returns:
           int: Uncompressed key length
        """

    @abstractmethod
    def UnderlyingObject(self) -> Any:
        """
        Get the underlying object.

        Returns:
           Any: Underlying object
        """

    @abstractmethod
    def RawCompressed(self) -> DataBytes:
        """
        Return raw compressed public key.

        Returns:
            DataBytes object: DataBytes object
        """

    @abstractmethod
    def RawUncompressed(self) -> DataBytes:
        """
        Return raw uncompressed public key.

        Returns:
            DataBytes object: DataBytes object
        """

    @abstractmethod
    def Point(self) -> IPoint:
        """
        Return the public key point.

        Returns:
            IPoint object: IPoint object
        """


class IPrivateKey(ABC):
    """
    Interface for a generic elliptic curve private key.
    Sign method is missing because not needed.
    """

    @classmethod
    @abstractmethod
    def FromBytes(cls,
                  key_bytes: bytes) -> IPrivateKey:
        """
        Construct class from key bytes.

        Args:
            key_bytes (bytes): Key bytes

        Returns:
            IPrivateKey: IPrivateKey object

        Raises:
            ValueError: If key bytes are not valid
        """

    @staticmethod
    @abstractmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Get the elliptic curve type.

        Returns:
           EllipticCurveTypes: Elliptic curve type
        """

    @classmethod
    def IsValidBytes(cls,
                     key_bytes: bytes) -> bool:
        """
        Return if the specified bytes represent a valid private key.

        Args:
            key_bytes (bytes): key bytes

        Returns:
            bool: True if valid, false otherwise
        """
        try:
            cls.FromBytes(key_bytes)
            return True
        except ValueError:
            return False

    @staticmethod
    @abstractmethod
    def Length() -> int:
        """
        Get the key length.

        Returns:
           int: Key length
        """

    @abstractmethod
    def UnderlyingObject(self) -> Any:
        """
        Get the underlying object.

        Returns:
           Any: Underlying object
        """

    @abstractmethod
    def Raw(self) -> DataBytes:
        """
        Return raw private key.

        Returns:
            DataBytes object: DataBytes object
        """

    @abstractmethod
    def PublicKey(self) -> IPublicKey:
        """
        Get the public key correspondent to the private one.

        Returns:
            IPublicKey object: IPublicKey object
        """

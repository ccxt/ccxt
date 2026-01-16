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

"""Module for secp256k1 point based on ecdsa library."""

# Imports
from typing import Any

from ....ecdsa import ellipticcurve, keys
from ....ecdsa.ecdsa import curve_secp256k1

from ..common.ipoint import IPoint
from ..curve.elliptic_curve_types import EllipticCurveTypes
from ..ecdsa.ecdsa_keys import EcdsaKeysConst
from ...utils.misc import BytesUtils, DataBytes, IntegerUtils


class Secp256k1PointEcdsa(IPoint):
    """Secp256k1 point class."""

    m_point: ellipticcurve.PointJacobi

    @classmethod
    def FromBytes(cls,
                  point_bytes: bytes) -> IPoint:
        """
        Construct class from point bytes.

        Args:
            point_bytes (bytes): Point bytes

        Returns:
            IPoint: IPoint object
        """
        try:
            return cls(ellipticcurve.PointJacobi.from_bytes(curve_secp256k1,
                                                            point_bytes))
        except keys.MalformedPointError as ex:
            raise ValueError("Invalid point key bytes") from ex
        # ECDSA < 0.17 doesn't have from_bytes method for PointJacobi
        except AttributeError:
            return cls.FromCoordinates(
                BytesUtils.ToInteger(point_bytes[:EcdsaKeysConst.POINT_COORD_BYTE_LEN]),
                BytesUtils.ToInteger(point_bytes[EcdsaKeysConst.POINT_COORD_BYTE_LEN:])
            )

    @classmethod
    def FromCoordinates(cls,
                        x: int,
                        y: int) -> IPoint:
        """
        Construct class from point coordinates.

        Args:
            x (int): X coordinate of the point
            y (int): Y coordinate of the point

        Returns:
            IPoint: IPoint object
        """
        return cls(
            ellipticcurve.PointJacobi.from_affine(
                ellipticcurve.Point(curve_secp256k1, x, y)
            )
        )

    def __init__(self,
                 point_obj: ellipticcurve.PointJacobi) -> None:
        """
        Construct class from point object.

        Args:
            point_obj (ellipticcurve.PointJacobi): Point object
        """
        self.m_point = point_obj

    @staticmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Get the elliptic curve type.

        Returns:
           EllipticCurveTypes: Elliptic curve type
        """
        return EllipticCurveTypes.SECP256K1

    @staticmethod
    def CoordinateLength() -> int:
        """
        Get the coordinate length.

        Returns:
           int: Coordinate key length
        """
        return EcdsaKeysConst.POINT_COORD_BYTE_LEN

    def UnderlyingObject(self) -> Any:
        """
        Get the underlying object.

        Returns:
           Any: Underlying object
        """
        return self.m_point

    def X(self) -> int:
        """
        Get point X coordinate.

        Returns:
           int: Point X coordinate
        """
        return self.m_point.x()

    def Y(self) -> int:
        """
        Get point Y coordinate.

        Returns:
           int: Point Y coordinate
        """
        return self.m_point.y()

    def Raw(self) -> DataBytes:
        """
        Return the point raw bytes.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.RawDecoded()

    def RawEncoded(self) -> DataBytes:
        """
        Return the encoded point raw bytes.

        Returns:
            DataBytes object: DataBytes object
        """
        try:
            return DataBytes(self.m_point.to_bytes("compressed"))
        # ECDSA < 0.17 doesn't have to_bytes method for PointJacobi
        except AttributeError:
            x_bytes = IntegerUtils.ToBytes(self.m_point.x(), EcdsaKeysConst.POINT_COORD_BYTE_LEN)
            if self.m_point.y() & 1:
                enc_bytes = b"\x03" + x_bytes
            else:
                enc_bytes = b"\x02" + x_bytes
            return DataBytes(enc_bytes)

    def RawDecoded(self) -> DataBytes:
        """
        Return the decoded point raw bytes.

        Returns:
            DataBytes object: DataBytes object
        """
        try:
            return DataBytes(self.m_point.to_bytes())
        # ECDSA < 0.17 doesn't have to_bytes method for PointJacobi
        except AttributeError:
            x_bytes = IntegerUtils.ToBytes(self.m_point.x(), EcdsaKeysConst.POINT_COORD_BYTE_LEN)
            y_bytes = IntegerUtils.ToBytes(self.m_point.y(), EcdsaKeysConst.POINT_COORD_BYTE_LEN)

            return DataBytes(x_bytes + y_bytes)

    def __add__(self,
                point: IPoint) -> IPoint:
        """
        Add point to another point.

        Args:
            point (IPoint object): IPoint object

        Returns:
            IPoint object: IPoint object
        """
        return self.__class__(self.m_point + point.UnderlyingObject())

    def __radd__(self,
                 point: IPoint) -> IPoint:
        """
        Add point to another point.

        Args:
            point (IPoint object): IPoint object

        Returns:
            IPoint object: IPoint object
        """
        return self + point

    def __mul__(self,
                scalar: int) -> IPoint:
        """
        Multiply point by a scalar.

        Args:
            scalar (int): scalar

        Returns:
            IPoint object: IPoint object
        """
        return self.__class__(self.m_point * scalar)

    def __rmul__(self,
                 scalar: int) -> IPoint:
        """
        Multiply point by a scalar.

        Args:
            scalar (int): scalar

        Returns:
            IPoint object: IPoint object
        """
        return self * scalar

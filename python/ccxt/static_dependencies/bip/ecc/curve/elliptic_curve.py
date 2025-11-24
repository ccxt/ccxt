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

"""Module with helper class for elliptic curves."""

# Imports
from typing import Type

from ..common.ikeys import IPrivateKey, IPublicKey
from ..common.ipoint import IPoint


class EllipticCurve:
    """
    Class for a generic elliptic curve.
    This is not meant to be complete but just the minimum required to abstract the bip module from
    the specific ECC library.
    """

    m_name: str
    m_order: int
    m_generator: IPoint
    m_point_cls: Type[IPoint]
    m_pub_key_cls: Type[IPublicKey]
    m_priv_key_cls: Type[IPrivateKey]

    def __init__(self,  # pylint: disable=too-many-arguments
                 name: str,
                 order: int,
                 generator: IPoint,
                 point_cls: Type[IPoint],
                 pub_key_cls: Type[IPublicKey],
                 priv_key_cls: Type[IPrivateKey]):
        """
        Construct class.

        Args:
            name (str)                      : Curve name
            order (int)                     : Curve order
            generator (IPoint object)       : Curve generator point
            point_cls (IPoint class)        : Point class
            pub_key_cls (IPublicKey class)  : Public key class
            priv_key_cls (IPrivateKey class): Private key class
        """
        self.m_name = name
        self.m_order = order
        self.m_generator = generator
        self.m_point_cls = point_cls
        self.m_pub_key_cls = pub_key_cls
        self.m_priv_key_cls = priv_key_cls

    def Name(self) -> str:
        """
        Return the curve name.

        Returns:
            str: Curve name
        """
        return self.m_name

    def Order(self) -> int:
        """
        Return the curve order.

        Returns:
            int: Curve order
        """
        return self.m_order

    def Generator(self) -> IPoint:
        """
        Get the curve generator point.

        Returns:
            IPoint object: IPoint object
        """
        return self.m_generator

    def PointClass(self) -> Type[IPoint]:
        """
        Return the point class.

        Returns:
            IPoint class: Point class
        """
        return self.m_point_cls

    def PublicKeyClass(self) -> Type[IPublicKey]:
        """
        Return the public key class.

        Returns:
            IPublicKey class: Public key class
        """
        return self.m_pub_key_cls

    def PrivateKeyClass(self) -> Type[IPrivateKey]:
        """
        Return the private key class.

        Returns:
            IPrivateKey class: Private key class
        """
        return self.m_priv_key_cls

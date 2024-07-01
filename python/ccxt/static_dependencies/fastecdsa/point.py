from fastecdsa import curvemath
from .curve import P256
from .util import validate_type


class CurveMismatchError(Exception):
    def __init__(self, curve1, curve2):
        self.msg = 'Tried to add points on two different curves <{}> & <{}>'.format(
            curve1.name, curve2.name)


class Point:
    """Representation of a point on an elliptic curve.

    Attributes:
        |  x (int): The x coordinate of the point.
        |  y (int): The y coordinate of the point.
        |  curve (:class:`Curve`): The curve that the point lies on.
    """

    def __init__(self, x: int, y: int, curve=P256):
        r"""Initialize a point on an elliptic curve.

        The x and y parameters must satisfy the equation :math:`y^2 \equiv x^3 + ax + b \pmod{p}`,
        where a, b, and p are attributes of the curve parameter.

        Args:
            |  x (int): The x coordinate of the point.
            |  y (int): The y coordinate of the point.
            |  curve (:class:`Curve`): The curve that the point lies on.
        """

        # Reduce numbers before computation to avoid errors and limit computations.
        if curve is not None:
            x = x % curve.p
            y = y % curve.p

        if not (x == 0 and y == 0 and curve is None) and not curve.is_point_on_curve((x, y)):
            raise ValueError(
                'coordinates are not on curve <{}>\n\tx={:x}\n\ty={:x}'.format(curve.name, x, y))
        else:
            self.x = x
            self.y = y
            self.curve = curve

    def __str__(self):
        if self == self.IDENTITY_ELEMENT:
            return '<POINT AT INFINITY>'
        else:
            return 'X: 0x{:x}\nY: 0x{:x}\n(On curve <{}>)'.format(self.x, self.y, self.curve.name)

    def __unicode__(self) -> str:
        return self.__str__()

    def __repr__(self) -> str:
        return self.__str__()

    def __eq__(self, other) -> bool:
        validate_type(other, Point)
        return self.x == other.x and self.y == other.y and self.curve is other.curve

    def __add__(self, other):
        """Add two points on the same elliptic curve.

        Args:
            | self (:class:`Point`): a point :math:`P` on the curve
            | other (:class:`Point`): a point :math:`Q` on the curve

        Returns:
            :class:`Point`: A point :math:`R` such that :math:`R = P + Q`
        """
        validate_type(other, Point)

        if self == self.IDENTITY_ELEMENT:
            return other
        elif other == self.IDENTITY_ELEMENT:
            return self
        elif self.curve is not other.curve:
            raise CurveMismatchError(self.curve, other.curve)
        elif self == -other:
            return self.IDENTITY_ELEMENT
        else:
            x, y = curvemath.add(
                str(self.x),
                str(self.y),
                str(other.x),
                str(other.y),
                str(self.curve.p),
                str(self.curve.a),
                str(self.curve.b),
                str(self.curve.q),
                str(self.curve.gx),
                str(self.curve.gy)
            )
            return Point(int(x), int(y), self.curve)

    def __radd__(self, other):
        """Add two points on the same elliptic curve.

        Args:
            | self (:class:`Point`): a point :math:`P` on the curve
            | other (:class:`Point`): a point :math:`Q` on the curve

        Returns:
            :class:`Point`: A point :math:`R` such that :math:`R = R + Q`
        """
        validate_type(other, Point)
        return self.__add__(other)

    def __sub__(self, other):
        """Subtract two points on the same elliptic curve.

        Args:
            | self (:class:`Point`): a point :math:`P` on the curve
            | other (:class:`Point`): a point :math:`Q` on the curve

        Returns:
            :class:`Point`: A point :math:`R` such that :math:`R = P - Q`
        """
        validate_type(other, Point)

        if self == other:
            return self.IDENTITY_ELEMENT
        elif other == self.IDENTITY_ELEMENT:
            return self

        negative = Point(other.x, -other.y % other.curve.p, other.curve)
        return self.__add__(negative)

    def __mul__(self, scalar: int):
        r"""Multiply a :class:`Point` on an elliptic curve by an integer.

        Args:
            | self (:class:`Point`): a point :math:`P` on the curve
            | other (int): an integer :math:`d \in \mathbb{Z_q}` where :math:`q` is the order of
                the curve that :math:`P` is on

        Returns:
            :class:`Point`: A point :math:`R` such that :math:`R = P * d`
        """
        validate_type(scalar, int)

        if scalar == 0:
            return self.IDENTITY_ELEMENT

        x, y = curvemath.mul(
            str(self.x),
            str(self.y),
            str(abs(scalar)),
            str(self.curve.p),
            str(self.curve.a),
            str(self.curve.b),
            str(self.curve.q),
            str(self.curve.gx),
            str(self.curve.gy)
        )
        x = int(x)
        y = int(y)
        if x == 0 and y == 0:
            return self.IDENTITY_ELEMENT
        return Point(x, y, self.curve) if scalar > 0 else -Point(x, y, self.curve)

    def __rmul__(self, scalar: int):
        r"""Multiply a :class:`Point` on an elliptic curve by an integer.

        Args:
            | self (:class:`Point`): a point :math:`P` on the curve
            | other (long): an integer :math:`d \in \mathbb{Z_q}` where :math:`q` is the order of
                the curve that :math:`P` is on

        Returns:
            :class:`Point`: A point :math:`R` such that :math:`R = d * P`
        """
        return self.__mul__(scalar)

    def __neg__(self):
        """Return the negation of a :class:`Point` i.e. the points reflection over the x-axis.

        Args:
            | self (:class:`Point`): a point :math:`P` on the curve

        Returns:
            :class:`Point`: A point :math:`R = (P_x, -P_y)`
        """
        if self == self.IDENTITY_ELEMENT:
            return self

        return Point(self.x, -self.y % self.curve.p, self.curve)


Point.IDENTITY_ELEMENT = Point(0, 0, curve=None)  # also known as the point at infinity

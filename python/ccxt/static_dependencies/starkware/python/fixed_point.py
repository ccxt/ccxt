from sympy import Rational


class FixedPoint(object):
    """
    Represents a binary rational number.
    E.g., FixedPointNum(75, 4) represents 0100.1011 == 75 / (2**4).
    Supports comparison and arithmetics (excluding division) without reducing the fraction.
    """

    def __init__(self, rep: int, precision_bits: int):
        assert isinstance(rep, int), "rep must be of type int."
        assert isinstance(precision_bits, int), "precision_bits must be of type int."
        assert precision_bits >= 0, "precision_bits cannot be negative."

        self._rep = rep
        # Number of bits of precision, i.e., log2(denominator).
        self.precision_bits = precision_bits

    def rep_with(self, precision_bits: int) -> int:
        """
        A safe way to get to the representation of the fixed point number
        that ensures the precision is as expected.
        """
        assert self.precision_bits == precision_bits, (
            "Precision verification failed: "
            f"got {precision_bits}, expected {self.precision_bits}."
        )
        return self._rep

    def __add__(self, other):
        if isinstance(other, int):
            return FixedPoint(
                rep=self._rep + (other << self.precision_bits), precision_bits=self.precision_bits
            )
        if not isinstance(other, FixedPoint):
            return NotImplemented

        if self.precision_bits < other.precision_bits:
            return other + self
        return FixedPoint(
            rep=self._rep + other.extend(self.precision_bits - other.precision_bits)._rep,
            precision_bits=self.precision_bits,
        )

    def __radd__(self, other):
        return self + other

    def __sub__(self, other):
        return self + (-other)

    def __rsub__(self, other):
        return (-self) + other

    def __mul__(self, other):
        if isinstance(other, int):
            return FixedPoint(rep=self._rep * other, precision_bits=self.precision_bits)
        if not isinstance(other, FixedPoint):
            return NotImplemented

        return FixedPoint(
            rep=self._rep * other._rep, precision_bits=self.precision_bits + other.precision_bits
        )

    def __rmul__(self, other):
        return self * other

    def __neg__(self):
        return self * -1

    def __eq__(self, other):
        return (self - other)._rep == 0

    def __lt__(self, other):
        # Note: this could have been implemented using __le__ (by swapping other and self),
        # but will require additional instance checks, as this class supports comparison with int.
        return (self - other)._rep < 0

    def __le__(self, other):
        return (self - other)._rep <= 0

    def __ne__(self, other):
        return not self == other

    def __gt__(self, other):
        return not self <= other

    def __ge__(self, other):
        return not self < other

    def __abs__(self):
        return FixedPoint(rep=abs(self._rep), precision_bits=self.precision_bits)

    def extend(self, n: int):
        """
        Extends the precision of the representation by n.
        """
        assert n >= 0, f"Cannot extend by a negative factor: got {n}."

        return FixedPoint(rep=self._rep << n, precision_bits=self.precision_bits + n)

    def reduce(self, n: int):
        """
        Reduces the precision of the representation by n.
        """
        assert self.precision_bits >= n, f"Cannot reduce to a negative precision: got {n}."

        return FixedPoint(rep=self._rep >> n, precision_bits=self.precision_bits - n)

    def to_int(self) -> int:
        # Rounds down.
        return self._rep >> self.precision_bits

    def to_float(self) -> float:
        return self._rep / (1 << self.precision_bits)

    def to_rational(self) -> Rational:
        return Rational(self._rep, 1 << self.precision_bits)

    def __str__(self):
        return f"{self._rep}/2**{self.precision_bits}"

import math
import random
from hashlib import sha256
from typing import List, Optional, Tuple, Union

import numpy as np
import sympy
from sympy.core.numbers import igcdex


def safe_div(x: int, y: int):
    """
    Computes x / y and fails if x is not divisible by y.
    """
    assert isinstance(x, int) and isinstance(y, int)
    assert y != 0
    assert x % y == 0, f"{x} is not divisible by {y}."
    return x // y


def div_ceil(x, y):
    assert isinstance(x, int) and isinstance(y, int)
    return -((-x) // y)


def div_mod(n, m, p):
    """
    Finds a nonnegative integer x < p such that (m * x) % p == n.
    """
    a, b, c = igcdex(m, p)
    assert c == 1
    return (n * a) % p


def pow_mod(vector, exponent, p):
    """
    Returns a numpy array which, in index i, will be equal to (vector[i] ** exponent % p), where
    '**' is the power operator.
    vector: numpy array
    exponent: int
    p: int
    """
    return np.vectorize(lambda x: pow(x, exponent, p))(vector)


def next_power_of_2(x: int):
    """
    Returns the smallest power of two which is >= x.
    """
    assert isinstance(x, int) and x > 0
    res = 2 ** (x - 1).bit_length()
    assert x <= res < 2 * x, f"{x}, {res}"
    return res


def is_power_of_2(x: int) -> bool:
    return isinstance(x, int) and x > 0 and x & (x - 1) == 0


def prev_power_of_2(x: int):
    """
    Returns the maximal power of two which is <= x.
    """
    assert isinstance(x, int) and x > 0
    return next_power_of_2(x + 1) // 2


def is_quad_residue(n, p):
    """
    Returns True if n is a quadratic residue mod p.
    """
    return sympy.ntheory.residue_ntheory.is_quad_residue(n, p)


def safe_log2(x: int):
    """
    Computes log2(x) where x is a power of 2. This function fails if x is not a power of 2.
    """
    assert x > 0
    res = int(math.log(x, 2))
    assert 2**res == x
    return res


def exponent_to_numerator_denominator(exponent: int) -> Tuple[int, int]:
    """
    Returns the numerator and denominator of 2**exponent.
    """
    numerator = 2**exponent if exponent >= 0 else 1
    denominator = 1 if exponent >= 0 else 2 ** (-exponent)
    return numerator, denominator


def sqrt(n, p):
    """
    Finds the minimum non-negative integer m such that (m*m) % p == n.
    """
    return min(sympy.ntheory.residue_ntheory.sqrt_mod(n, p, all_roots=True))


def isqrt(n: int) -> int:
    """
    Returns the integer square root of the nonnegative integer n. This is the floor of the exact
    square root of n.
    Unlike math.sqrt(), this function doesn't have rounding error issues.
    """
    assert n >= 0

    # The following algorithm was copied from
    # https://stackoverflow.com/questions/15390807/integer-square-root-in-python.
    x = n
    y = (x + 1) // 2
    while y < x:
        x = y
        y = (x + n // x) // 2
    assert x**2 <= n < (x + 1) ** 2
    return x


# Elliptic curve functions.
class EcInfinity:
    pass


EC_INFINITY = EcInfinity()

EcPoint = Union[Tuple[int, int], EcInfinity]


def line_slope(point1: Tuple[int, int], point2: Tuple[int, int], p: int) -> int:
    """
    Computes the slope of the line connecting the two given EC points over the field GF(p).
    Assumes the points are given in affine form (x, y) and have different x coordinates.
    """
    assert (point1[0] - point2[0]) % p != 0
    return div_mod(point1[1] - point2[1], point1[0] - point2[0], p)


def ec_add(point1: Tuple[int, int], point2: Tuple[int, int], p: int) -> Tuple[int, int]:
    """
    Gets two points on an elliptic curve mod p and returns their sum.
    Assumes the points are given in affine form (x, y) and have different x coordinates.
    """
    m = line_slope(point1=point1, point2=point2, p=p)
    x = (m * m - point1[0] - point2[0]) % p
    y = (m * (point1[0] - x) - point1[1]) % p
    return x, y



def ec_double_slope(point: Tuple[int, int], alpha: int, p: int) -> int:
    """
    Computes the slope of an elliptic curve with the equation y^2 = x^3 + alpha*x + beta mod p, at
    the given point.
    Assumes the point is given in affine form (x, y) and has y != 0.
    """
    assert point[1] % p != 0
    return div_mod(3 * point[0] * point[0] + alpha, 2 * point[1], p)


def ec_double(point: Tuple[int, int], alpha: int, p: int) -> Tuple[int, int]:
    """
    Doubles a point on an elliptic curve with the equation y^2 = x^3 + alpha*x + beta mod p.
    Assumes the point is given in affine form (x, y) and has y != 0.
    """
    m = ec_double_slope(point=point, alpha=alpha, p=p)
    x = (m * m - 2 * point[0]) % p
    y = (m * (point[0] - x) - point[1]) % p
    return x, y


def ec_safe_add(point1, point2, alpha, p):
    """
    Gets two points on an elliptic curve mod p and returns their sum.
    Safe to use always. May get or return the point at infinity, represented as EC_INFINITY.
    """
    if point1 == EC_INFINITY:
        return point2
    if point2 == EC_INFINITY:
        return point1
    x1, y1 = point1[0] % p, point1[1] % p
    x2, y2 = point2[0] % p, point2[1] % p
    if x1 == x2:
        if y1 == (p - y2) % p:
            return EC_INFINITY
        else:
            return ec_double((x1, y1), alpha, p)
    else:
        return ec_add((x1, y1), (x2, y2), p)


def ec_mult(m, point, alpha, p):
    """
    Multiplies by m a point on the elliptic curve with equation y^2 = x^3 + alpha*x + beta mod p.
    Assumes the point is given in affine form (x, y) and that 0 < m < order(point).
    """
    if m == 1:
        return point
    if m % 2 == 0:
        return ec_mult(m // 2, ec_double(point, alpha, p), alpha, p)
    return ec_add(ec_mult(m - 1, point, alpha, p), point, p)


def ec_safe_mult(m: int, point: EcPoint, alpha: int, p: int) -> EcPoint:
    """
    Multiplies by m a point on the elliptic curve with equation y^2 = x^3 + alpha*x + beta mod p.
    Assumes the point is given in affine form (x, y).
    Safe to use always. May get or return the point at infinity, represented as EC_INFINITY.
    """
    if m == 0:
        return EC_INFINITY
    if m == 1:
        return point
    if m % 2 == 0:
        return ec_safe_mult(m // 2, ec_safe_add(point, point, alpha, p), alpha, p)
    return ec_safe_add(ec_safe_mult(m - 1, point, alpha, p), point, alpha, p)


def horner_eval(coefs, point, prime):
    """
    Computes the evaluation of a polynomial on the given point in the field GF(prime).
    """
    res = 0
    for coef in coefs[::-1]:
        res = (res * point + coef) % prime
    return res


class NotOnCurveException(Exception):
    pass


def y_squared_from_x(x: int, alpha: int, beta: int, field_prime: int) -> int:
    """
    Computes y^2 using the curve equation:
    y^2 = x^3 + alpha * x + beta (mod field_prime)
    """
    return (pow(x, 3, field_prime) + alpha * x + beta) % field_prime


def recover_y(x: int, alpha: int, beta: int, field_prime: int) -> int:
    """
    Recovers the corresponding y coordinate on the elliptic curve
    y^2 = x^3 + alpha * x + beta (mod field_prime)
    of a given x coordinate.
    """
    y_squared = y_squared_from_x(x, alpha, beta, field_prime)
    if is_quad_residue(y_squared, field_prime):
        return sqrt(y_squared, field_prime)
    raise NotOnCurveException(f"{x} does not represent the x coordinate of a point on the curve.")


def random_ec_point(
    field_prime: int, alpha: int, beta: int, seed: Optional[bytes] = None
) -> Tuple[int, int]:
    """
    Returns a random non-zero point on the elliptic curve
      y^2 = x^3 + alpha * x + beta (mod field_prime).
    If `seed` is not None, the point is created deterministically from the seed.
    """
    if seed is not None:
        # If a seed is given, the function currently only extracts a 256-bit number from it.
        assert field_prime < 2**256, "Field prime must be less than 2^256."
        seed = sha256(seed).digest()
    for i in range(100):
        x = (
            random.randrange(field_prime)
            if seed is None
            else int(sha256(seed[1:] + i.to_bytes(10, "little")).hexdigest(), 16)
        )
        y_coef = (-1) ** (seed[0] & 1 if seed is not None else random.randrange(2))
        try:
            y = recover_y(x, alpha, beta, field_prime)
            return x, (y_coef * y) % field_prime
        except NotOnCurveException:
            continue
    raise Exception("Could not find a point on the curve.")


def safe_random_ec_point(
    prime: int, alpha: int, generator: Tuple[int, int], curve_order: int
) -> Tuple[int, int]:
    """
    A version of `random_ec_point` that never raises an exception.
    Assumptions:
        * `generator` is a generator point of a curve y^2 = x^3 + alpha * x + beta, for some beta.
        * `curve_order` is the order of the same curve.
    """
    res = ec_safe_mult(m=random.randrange(1, curve_order), point=generator, alpha=alpha, p=prime)
    assert not isinstance(res, EcInfinity)
    return res


def fft(coeffs: List[int], generator: int, prime: int, bit_reversed: bool = False) -> List[int]:
    """
    Computes the FFT of `coeffs`, assuming the size of the coefficient array is a power of two
    and equals to the generator's multiplicative order.
    """

    def _fft(coeffs: np.ndarray, group: np.ndarray) -> np.ndarray:
        if len(coeffs) == 1:
            return np.array(coeffs)

        f_even = _fft(coeffs=coeffs[::2], group=group[::2])
        f_odd = _fft(coeffs=coeffs[1::2], group=group[::2])

        group_mul_f_odd = (group[: len(f_odd)] * f_odd) % prime
        return np.concatenate(
            (
                (f_even + group_mul_f_odd) % prime,
                (f_even - group_mul_f_odd) % prime,
            )
        )

    if len(coeffs) == 0:
        return []

    coeffs_len = len(coeffs)
    assert is_power_of_2(coeffs_len), "Length is not a power of two."

    # Prepare sample points.
    group = [1]
    for _ in range(coeffs_len - 1):
        group.append((group[-1] * generator) % prime)

    # Evaluate.
    values = list(_fft(coeffs=np.array(coeffs), group=np.array(group)))

    if bit_reversed:
        width = coeffs_len.bit_length() - 1
        perm = [int("{:0{width}b}".format(i, width=width)[::-1], 2) for i in range(coeffs_len)]
        return [values[i] for i in perm]

    return values

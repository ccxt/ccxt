from .math_utils import ec_add, ec_double, ec_mult

from .signature import (
    ALPHA,
    CONSTANT_POINTS,
    EC_ORDER,
    FIELD_PRIME,
    N_ELEMENT_BITS_HASH,
    SHIFT_POINT,
)
from .utils import from_bytes, to_bytes

LOW_PART_BITS = 248
LOW_PART_MASK = 2**248 - 1
HASH_SHIFT_POINT = (SHIFT_POINT[0], SHIFT_POINT[1])
P_0 = (CONSTANT_POINTS[2][0], CONSTANT_POINTS[2][1])
P_1 = (CONSTANT_POINTS[2 + LOW_PART_BITS][0], CONSTANT_POINTS[2 + LOW_PART_BITS][1])
P_2 = (CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH][0], CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH][1])
P_3 = (
    CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH + LOW_PART_BITS][0],
    CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH + LOW_PART_BITS][1],
)

# 'None' is used to represent the point at infinity (the identity element).


def _add(point1, point2):
    """
    Adds two points on the STARK curve, handling the point at infinity and
    point doubling (unlike the raw math_utils.ec_add).
    """
    if point1 is None:
        return point2
    if point2 is None:
        return point1
    if (point1[0] - point2[0]) % FIELD_PRIME == 0:
        if (point1[1] + point2[1]) % FIELD_PRIME == 0:
            # point2 == -point1
            return None
        return ec_double(point1, ALPHA, FIELD_PRIME)
    return ec_add(point1, point2, FIELD_PRIME)


def _mult(m, point):
    """
    Multiplies a point on the STARK curve by the scalar m, handling the zero
    scalar (unlike the raw math_utils.ec_mult which requires 0 < m).
    """
    m %= EC_ORDER
    if m == 0 or point is None:
        return None
    return ec_mult(m, point, ALPHA, FIELD_PRIME)


def process_single_element(element: int, p1, p2):
    assert 0 <= element < FIELD_PRIME, "Element integer value is out of range"

    high_nibble = element >> LOW_PART_BITS
    low_part = element & LOW_PART_MASK
    return _add(_mult(low_part, p1), _mult(high_nibble, p2))


def pedersen_hash(x: int, y: int) -> int:
    """
    Computes the Starkware version of the Pedersen hash of x and y.
    The hash is defined by:
        shift_point + x_low * P_0 + x_high * P1 + y_low * P2  + y_high * P3
    where x_low is the 248 low bits of x, x_high is the 4 high bits of x and similarly for y.
    shift_point, P_0, P_1, P_2, P_3 are constant points generated from the digits of pi.
    """
    point = _add(HASH_SHIFT_POINT, process_single_element(x, P_0, P_1))
    point = _add(point, process_single_element(y, P_2, P_3))
    assert point is not None, "Pedersen hash evaluated to the point at infinity"
    return point[0]


def pedersen_hash_func(x: bytes, y: bytes) -> bytes:
    """
    A variant of 'pedersen_hash', where the elements and their resulting hash are in bytes.
    """
    assert len(x) == len(y) == 32, "Unexpected element length."
    return to_bytes(pedersen_hash(*(from_bytes(element) for element in (x, y))))

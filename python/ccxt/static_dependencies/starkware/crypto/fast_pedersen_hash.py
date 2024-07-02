from ...ecdsa.curves import Curve
from ...ecdsa.ellipticcurve import CurveFp, Point

from .signature import (
    ALPHA,
    BETA,
    CONSTANT_POINTS,
    EC_ORDER,
    FIELD_PRIME,
    N_ELEMENT_BITS_HASH,
    SHIFT_POINT,
)
from .utils import from_bytes, to_bytes

curve_stark = CurveFp(FIELD_PRIME, ALPHA, BETA)
LOW_PART_BITS = 248
LOW_PART_MASK = 2**248 - 1
HASH_SHIFT_POINT = Point(curve_stark, SHIFT_POINT[0], SHIFT_POINT[1], EC_ORDER)
P_0 = Point(curve_stark, CONSTANT_POINTS[2][0], CONSTANT_POINTS[2][1], EC_ORDER)
P_1 = Point(curve_stark, CONSTANT_POINTS[2 + LOW_PART_BITS][0], CONSTANT_POINTS[2 + LOW_PART_BITS][1], EC_ORDER)
P_2 = Point(curve_stark, CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH][0], CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH][1], EC_ORDER)
P_3 = Point(curve_stark, CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH + LOW_PART_BITS][0], CONSTANT_POINTS[2 + N_ELEMENT_BITS_HASH + LOW_PART_BITS][1], EC_ORDER)

def process_single_element(element: int, p1, p2) -> Point:
    assert 0 <= element < FIELD_PRIME, "Element integer value is out of range"

    high_nibble = element >> LOW_PART_BITS
    low_part = element & LOW_PART_MASK
    return low_part * p1 + high_nibble * p2


def pedersen_hash(x: int, y: int) -> int:
    """
    Computes the Starkware version of the Pedersen hash of x and y.
    The hash is defined by:
        shift_point + x_low * P_0 + x_high * P1 + y_low * P2  + y_high * P3
    where x_low is the 248 low bits of x, x_high is the 4 high bits of x and similarly for y.
    shift_point, P_0, P_1, P_2, P_3 are constant points generated from the digits of pi.
    """
    return (
        HASH_SHIFT_POINT + process_single_element(x, P_0, P_1) + process_single_element(y, P_2, P_3)
    ).x()


def pedersen_hash_func(x: bytes, y: bytes) -> bytes:
    """
    A variant of 'pedersen_hash', where the elements and their resulting hash are in bytes.
    """
    assert len(x) == len(y) == 32, "Unexpected element length."
    return to_bytes(pedersen_hash(*(from_bytes(element) for element in (x, y))))

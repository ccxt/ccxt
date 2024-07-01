from typing import List

from starkware.cairo.common.math_utils import as_int
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME

# The base of the representation.
BASE = 2**86

# The bls12-381 F_r field prime. F_r - the scalar field of the bls12-381 elliptic curve.
BLS_PRIME = 52435875175126190479447740508185965837690552500527637822603658699938581184513


def split(num: int) -> List[int]:
    """
    Takes an integer and returns its canonical representation as:
        d0 + d1 * BASE + d2 * BASE**2.
    d2 can be in the range (-2**127, 2**127).
    """
    a = []
    for _ in range(2):
        num, residue = divmod(num, BASE)
        a.append(residue)
    a.append(num)
    assert abs(num) < 2**127
    return a


def pack(z, prime=DEFAULT_PRIME):
    """
    Takes a BigInt3 struct which represents a triple of limbs (d0, d1, d2) of field
    elements and reconstructs the corresponding integer (see split()).
    Note that the limbs do not have to be in the range [0, BASE).
    Prime should be the Cairo field, and it is used to handle negative values of the limbs.
    """
    limbs = z.d0, z.d1, z.d2
    return sum(as_int(limb, prime) * (BASE**i) for i, limb in enumerate(limbs))

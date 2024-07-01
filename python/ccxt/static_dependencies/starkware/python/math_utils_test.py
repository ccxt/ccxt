import math
import random
from typing import List

import numpy as np
import pytest

from starkware.python.math_utils import (
    div_ceil,
    div_mod,
    ec_add,
    ec_double,
    ec_mult,
    fft,
    horner_eval,
    is_power_of_2,
    is_quad_residue,
    isqrt,
    next_power_of_2,
    prev_power_of_2,
    random_ec_point,
    safe_div,
    safe_log2,
    safe_random_ec_point,
    sqrt,
)


def test_ec_add():
    # Checked using sage.
    # E = EllipticCurve(GF(331),[0,0,0,-1,1])
    # print E(279, 293) + E(66, 192)
    assert ec_add((279, 293), (66, 192), 331) == (224, 33)
    with pytest.raises(AssertionError):
        # x coordinates are equal - should throw an AssertionError.
        ec_add((279, 293), (279, 38), 331)


def test_ec_double():
    # Checked using sage.
    # E = EllipticCurve(GF(3331),[0,0,0,-1,1])
    # print 2 * E(2817, 1099)
    assert ec_double((2817, 1099), -1, 3331) == (1166, 3163)
    with pytest.raises(AssertionError):
        # Should throw an AssertionError since y == 0.
        ec_double((1, 0), -1, 3331)


def test_ec_mult():
    # Checked using sage.
    # E = EllipticCurve(GF(33331),[0,0,0,2,1])
    # print 123 * E(25078, 18096)
    assert ec_mult(123, (25078, 18096), 2, 33331) == (12009, 15845)


def test_safe_div():
    for x in [2, 3, 5, 6, 10, 12, -2, -3, -10]:
        assert safe_div(60, x) * x == 60
    for val in [0, 7, 120]:
        with pytest.raises(AssertionError):
            safe_div(60, val)


def test_div_ceil():
    assert div_ceil(7, 3) == 3
    assert div_ceil(8, 2) == 4
    assert div_ceil(9, 2) == 5


def test_safe_log2():
    for i in range(0, 64):
        assert safe_log2(2**i) == i
    for val in [-1, 0, 3]:
        with pytest.raises(AssertionError):
            safe_log2(val)


def test_next_power_of_2():
    assert next_power_of_2(1) == 1
    assert next_power_of_2(2) == 2
    assert next_power_of_2(3) == 4
    assert next_power_of_2(4) == 4
    assert next_power_of_2(5) == 8
    assert next_power_of_2(2**128) == 2**128
    assert next_power_of_2(2**128 + 1) == 2**129
    assert next_power_of_2(2**129 - 1) == 2**129
    assert next_power_of_2(2**129) == 2**129
    with pytest.raises(AssertionError):
        next_power_of_2(-2)


def test_prev_power_of_2():
    assert prev_power_of_2(1) == 1
    assert prev_power_of_2(2) == 2
    assert prev_power_of_2(3) == 2
    assert prev_power_of_2(4) == 4
    assert prev_power_of_2(5) == 4
    assert prev_power_of_2(2**128) == 2**128
    assert prev_power_of_2(2**128 + 1) == 2**128
    assert prev_power_of_2(2**129 - 1) == 2**128
    assert prev_power_of_2(2**129) == 2**129
    with pytest.raises(AssertionError):
        next_power_of_2(0)
    with pytest.raises(AssertionError):
        next_power_of_2(-2)


def test_div_mod():
    assert div_mod(2, 3, 5) == 4
    with pytest.raises(AssertionError):
        div_mod(8, 10, 5)


def test_is_quad_residue():
    assert is_quad_residue(2, 7)
    assert not is_quad_residue(3, 7)


def test_sqrt():
    assert sqrt(2, 7) == 3


def test_isqrt():
    for x in range(100):
        assert isqrt(x) == int(math.sqrt(x))
    assert isqrt(2**60) == 2**30
    assert isqrt(2**60 + 1) == 2**30
    assert isqrt(2**60 - 1) == 2**30 - 1
    assert isqrt(3**100) == 3**50
    assert isqrt(3**100 + 1) == 3**50
    assert isqrt(3**100 - 1) == 3**50 - 1


def test_is_power_of_2():
    assert not is_power_of_2(0)
    assert is_power_of_2(1)
    assert is_power_of_2(8)
    assert not is_power_of_2(3)
    assert is_power_of_2(2**129)
    assert not is_power_of_2(2**129 + 1)


def test_horner_eval():
    PRIME = (1 << 251) + (17 << 192) + 1
    N = 16
    coefs = [random.randint(0, PRIME - 1) for i in range(N)]
    point = random.randint(0, PRIME - 1)
    assert sum(coef * pow(point, i, PRIME) for i, coef in enumerate(coefs)) % PRIME == horner_eval(
        coefs, point, PRIME
    )


def test_random_ec_point():
    PRIME = (1 << 251) + (17 << 192) + 1
    ALPHA = 1
    BETA = 3141592653589793238462643383279502884197169399375105820974944592307816406665
    seed = random.randrange(1 << 256).to_bytes(32, "little")
    ec_point = random_ec_point(field_prime=PRIME, alpha=ALPHA, beta=BETA, seed=seed)
    x, y = ec_point
    # Check that the returned point is on the curve.
    assert pow(y, 2, PRIME) == (pow(x, 3, PRIME) + x * ALPHA + BETA) % PRIME
    # Make sure the returned point is deterministic when the seed is constant.
    for i in range(10):
        assert ec_point == random_ec_point(PRIME, ALPHA, BETA, seed)


def test_safe_random_ec_point():
    PRIME = (1 << 251) + (17 << 192) + 1
    ALPHA = 1
    BETA = 3141592653589793238462643383279502884197169399375105820974944592307816406665
    EC_ORDER = 3618502788666131213697322783095070105526743751716087489154079457884512865583
    # Pick a random EC point and use it as the generator.
    generator = random_ec_point(field_prime=PRIME, alpha=ALPHA, beta=BETA)
    x, y = safe_random_ec_point(prime=PRIME, alpha=ALPHA, generator=generator, curve_order=EC_ORDER)
    # Check that the returned point is on the curve.
    assert pow(y, 2, PRIME) == (pow(x, 3, PRIME) + x * ALPHA + BETA) % PRIME


@pytest.mark.parametrize("bit_reversed", [True, False])
def test_fft(bit_reversed: bool):
    PRIME = 52435875175126190479447740508185965837690552500527637822603658699938581184513
    GENERATOR = 39033254847818212395286706435128746857159659164139250548781411570340225835782
    WIDTH = 12
    ORDER = 2**WIDTH

    def generate(generator: int) -> List[int]:
        array = [1]
        for _ in range(ORDER - 1):
            array.append((generator * array[-1]) % PRIME)

        return array

    subgroup = generate(GENERATOR)
    if bit_reversed:
        perm = [int("{:0{width}b}".format(i, width=WIDTH)[::-1], 2) for i in range(ORDER)]
        subgroup = [subgroup[i] for i in perm]

    # Sanity checks.
    assert (GENERATOR**ORDER) % PRIME == 1
    assert len(set(subgroup)) == len(subgroup)

    coeffs = [random.randint(0, PRIME) for _ in range(ORDER)]

    # Evaluate naively.
    expexted_eval = [0] * ORDER
    for i, x in enumerate(subgroup):
        expexted_eval[i] = np.dot(coeffs, generate(x)) % PRIME

    # Evaluate using FFT.
    actual_eval = fft(coeffs=coeffs, generator=GENERATOR, prime=PRIME, bit_reversed=bit_reversed)

    assert actual_eval == expexted_eval

    # Trivial cases.
    assert actual_eval[0] == sum(coeffs) % PRIME
    assert (
        fft(coeffs=[0] * ORDER, generator=GENERATOR, prime=PRIME, bit_reversed=bit_reversed)
        == [0] * ORDER
    )
    assert fft(coeffs=[121212], generator=1, prime=PRIME, bit_reversed=bit_reversed) == [121212]

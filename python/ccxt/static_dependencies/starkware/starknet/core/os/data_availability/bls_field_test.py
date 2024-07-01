import os
import random
from typing import List

import pytest

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.common.structs import CairoStructFactory, CairoStructProxy
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo_files
from starkware.cairo.lang.compiler.program import Program
from starkware.python.random_test_utils import random_test
from starkware.starknet.core.os.data_availability.bls_utils import BASE, BLS_PRIME, pack, split

CAIRO_FILE = os.path.join(os.path.dirname(__file__), "bls_field.cairo")


@pytest.fixture(scope="session")
def program() -> Program:
    return compile_cairo_files([CAIRO_FILE], prime=DEFAULT_PRIME)


@pytest.fixture(scope="session")
def structs(program: Program):
    return CairoStructFactory.from_program(program).structs


def random_bigint3_element(structs: CairoStructProxy, limb_bound: int = 2**104):
    """
    Returns a random BigInt3 in the given range.
    """
    d0, d1, d2 = [random.randrange(-limb_bound, limb_bound) for _ in range(3)]
    return structs.BigInt3(d0=d0, d1=d1, d2=d2)


def bigint3_element_from_limbs(structs: CairoStructProxy, limbs: List[int]):
    """
    Returns an BigInt3 from a list of limbs.
    """
    assert len(limbs) == 3
    return structs.BigInt3(d0=limbs[0], d1=limbs[1], d2=limbs[2])


def bigint3_element_from_int(structs: CairoStructProxy, val: int):
    """
    Returns an BigInt3 from int.
    """
    d0, d1, d2 = split(val)
    return structs.BigInt3(d0=d0, d1=d1, d2=d2)


def test_bls_prime_value(program: Program):
    p0 = program.get_const(name="P0")
    p1 = program.get_const(name="P1")
    p2 = program.get_const(name="P2")

    assert [p0, p1, p2] == split(BLS_PRIME)


@pytest.mark.parametrize(
    "a_limbs, b_limbs",
    [
        (
            [2**104 - 1, 2**104 - 1, 2**104 - 1],
            [2**104 - 1, 2**104 - 1, 2**104 - 1],
        ),
        (
            [-(2**104) + 1, -(2**104) + 1, -(2**104) + 1],
            [-(2**104) + 1, -(2**104) + 1, -(2**104) + 1],
        ),
        (
            [-1, 0, 0],
            [1, 0, 0],
        ),
        (
            [1, 2, 3],
            [0, 0, 0],
        ),
    ],
)
def test_reduced_mul_parameterized(
    program: Program, structs: CairoStructProxy, a_limbs: List[int], b_limbs: List[int]
):
    runner = CairoFunctionRunner(program)

    a = bigint3_element_from_limbs(structs=structs, limbs=a_limbs)
    b = bigint3_element_from_limbs(structs=structs, limbs=b_limbs)

    runner.run(
        "reduced_mul",
        range_check_ptr=runner.range_check_builtin.base,
        a=a,
        b=b,
    )

    range_check_ptr, *res_limbs = runner.get_return_values(4)
    assert range_check_ptr == runner.range_check_builtin.base + 11
    assert res_limbs == split((pack(a) * pack(b)) % BLS_PRIME)


@random_test()
def test_reduced_mul_random(program: Program, structs: CairoStructProxy, seed: int):
    runner = CairoFunctionRunner(program)

    a = random_bigint3_element(structs=structs)
    b = random_bigint3_element(structs=structs)

    runner.run(
        "reduced_mul",
        range_check_ptr=runner.range_check_builtin.base,
        a=a,
        b=b,
    )

    range_check_ptr, *res_limbs = runner.get_return_values(4)
    assert range_check_ptr == runner.range_check_builtin.base + 11
    assert res_limbs == split((pack(a) * pack(b)) % BLS_PRIME)


@random_test()
@pytest.mark.parametrize("n", [0, 100, 4096])
def test_horner_eval(program: Program, structs: CairoStructProxy, n: int, seed: int):
    runner = CairoFunctionRunner(program)

    coefficients = [random.randrange(DEFAULT_PRIME) for _ in range(n)]
    point = random.randrange(BLS_PRIME)

    runner.run(
        "horner_eval",
        range_check_ptr=runner.range_check_builtin.base,
        n_coefficients=n,
        coefficients=coefficients,
        point=bigint3_element_from_int(structs=structs, val=point),
    )

    res_d0, res_d1, res_d2 = runner.get_return_values(3)
    expected_result = (
        sum(coef * pow(point, i, BLS_PRIME) for i, coef in enumerate(coefficients)) % BLS_PRIME
    )
    assert res_d0 + res_d1 * BASE + res_d2 * (BASE**2) == expected_result


@pytest.mark.parametrize(
    "value",
    [
        0,
        1,
        DEFAULT_PRIME - 1,
        DEFAULT_PRIME - 2,
        BASE - 1,
        BASE,
        BASE**2 - 1,
        BASE**2,
        DEFAULT_PRIME // 2,
    ],
)
def test_felt_to_bigint3(program: Program, value: int):
    runner = CairoFunctionRunner(program)

    runner.run(
        "felt_to_bigint3",
        range_check_ptr=runner.range_check_builtin.base,
        value=value,
    )

    range_check_ptr, *res_limbs = runner.get_return_values(4)

    assert res_limbs == split(value)

    n_range_checks = 0 if value == DEFAULT_PRIME - 1 else 6
    assert range_check_ptr == runner.range_check_builtin.base + n_range_checks


@random_test()
def test_bigint3_to_uint256(program: Program, structs: CairoStructProxy, seed: int):
    runner = CairoFunctionRunner(program)

    value = bigint3_element_from_int(structs=structs, val=random.randrange(2**256))

    runner.run("bigint3_to_uint256", runner.range_check_builtin.base, value=value)

    range_check_ptr, low, high = runner.get_return_values(3)

    assert low == pack(value) % 2**128
    assert high == pack(value) >> 128
    assert range_check_ptr == runner.range_check_builtin.base + 4

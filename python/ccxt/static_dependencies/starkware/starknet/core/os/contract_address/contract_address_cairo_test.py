import os
from typing import List, Sequence

import pytest

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo_files
from starkware.cairo.lang.compiler.program import Program
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.definitions.general_config import STARKNET_LAYOUT_INSTANCE

CAIRO_FILE = os.path.join(os.path.dirname(__file__), "contract_address.cairo")


@pytest.fixture(scope="module")
def program() -> Program:
    return compile_cairo_files(files=[CAIRO_FILE], prime=DEFAULT_PRIME)


def run_cairo_contract_address(
    program: Program,
    salt: int,
    class_hash: int,
    constructor_calldata: Sequence[int],
    deployer_address: int,
) -> int:
    runner = CairoFunctionRunner(program, layout=STARKNET_LAYOUT_INSTANCE.layout_name)
    runner.run(
        func_name="get_contract_address",
        hash_ptr=runner.pedersen_builtin.base,
        range_check_ptr=runner.range_check_builtin.base,
        salt=salt,
        class_hash=class_hash,
        constructor_calldata_size=len(constructor_calldata),
        constructor_calldata=constructor_calldata,
        deployer_address=deployer_address,
    )
    pedersen_ptr, range_check_ptr_end, contract_address = runner.get_return_values(3)

    assert pedersen_ptr == runner.pedersen_builtin.base + (
        runner.pedersen_builtin.cells_per_instance * (7 + len(constructor_calldata))
    )
    assert range_check_ptr_end.segment_index == runner.range_check_builtin.base.segment_index
    return contract_address


@pytest.mark.parametrize("constructor_calldata", [[], [73, 443, 234, 350, 841]])
@pytest.mark.parametrize("class_hash", [142, 134])
@pytest.mark.parametrize("salt", [3, 14159])
@pytest.mark.parametrize("deployer_address", [66, 132])
def test_cairo_get_contract_address(
    program: Program,
    constructor_calldata: List[int],
    class_hash: int,
    salt: int,
    deployer_address: int,
):
    """
    Tests that the Python and Cairo contract_address implementations return the same value.
    """
    contract_address = calculate_contract_address_from_hash(
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        deployer_address=deployer_address,
    )
    assert contract_address == run_cairo_contract_address(
        program=program,
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        deployer_address=deployer_address,
    )

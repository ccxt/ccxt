import os

import pytest

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo_files
from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.vm.vm_exceptions import VmException
from starkware.python.test_utils import maybe_raises

CAIRO_FILE = os.path.join(os.path.dirname(__file__), "eth_utils.cairo")


@pytest.fixture(scope="module")
def program() -> Program:
    return compile_cairo_files([CAIRO_FILE], prime=DEFAULT_PRIME)


@pytest.fixture
def runner(program: Program) -> CairoFunctionRunner:
    return CairoFunctionRunner(program)


@pytest.mark.parametrize(
    "address,error_message",
    [
        (0, "Invalid Ethereum address - value is zero"),
        (1, None),
        (2**160 - 1, None),
        (2**160, "Invalid Ethereum address - value is more than 160 bits"),
        (DEFAULT_PRIME - 1, "Invalid Ethereum address - value is more than 160 bits"),
    ],
)
def test_assert_eth_address_range(runner: CairoFunctionRunner, address, error_message):
    with maybe_raises(expected_exception=VmException, error_message=error_message):
        runner.run(
            "assert_eth_address_range",
            range_check_ptr=runner.range_check_builtin.base,
            address=address,
            verify_implicit_args_segment=True,
        )

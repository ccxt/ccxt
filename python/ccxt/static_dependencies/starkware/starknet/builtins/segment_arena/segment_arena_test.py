import os

import pytest

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo_files
from starkware.cairo.lang.compiler.program import Program

CAIRO_TEST_FILE = os.path.join(os.path.dirname(__file__), "segment_arena_test.cairo")


@pytest.fixture(scope="session")
def program() -> Program:
    return compile_cairo_files([CAIRO_TEST_FILE], prime=DEFAULT_PRIME, debug_info=True)


def test_dict_simple(program):
    runner = CairoFunctionRunner(program)
    runner.run("test_segment_arena")
    (concat_segments, infos) = runner.get_return_values(2)

    concat_segments_data = [runner.vm_memory.get(concat_segments + i) for i in range(10)]
    assert concat_segments_data == [1, 2, None, 3, 4, None, 5, None, 6, 7]

    infos_data = [runner.vm_memory.get(infos + i) for i in range(12)]
    assert infos_data == [
        # segment0.
        concat_segments,
        concat_segments + 2,
        0,
        # segment1.
        concat_segments + 3,
        concat_segments + 5,
        1,
        # segment2.
        concat_segments + 6,
        concat_segments + 7,
        3,
        # segment3.
        concat_segments + 8,
        concat_segments + 10,
        2,
    ]

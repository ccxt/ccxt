from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
from starkware.starknet.cli.reconstruct_starknet_traceback import reconstruct_starknet_traceback


def test_reconstruct_traceback():
    code1 = """
func main() {
    assert 1 = 2;
    return ();
}
"""

    code2 = """
func main() {
    assert 2 = 3;
    return ();
}
"""

    traceback_txt = """
Error at pc=0:0:
Error message 1
Error in the called contract (0x1234):
Error at pc=0:0:
Error message 2
Error in the called contract (0x5678):
Error at pc=0:0:
Error message 3
"""

    program_with_debug_info1 = compile_cairo(
        code=[(code1, "filename")], prime=DEFAULT_PRIME, debug_info=True
    )
    program_with_debug_info2 = compile_cairo(
        code=[(code2, "filename")], prime=DEFAULT_PRIME, debug_info=True
    )

    # Fix the first contract and 0x5678.
    res = reconstruct_starknet_traceback(
        contracts={None: program_with_debug_info1, 0x5678: program_with_debug_info2},
        traceback_txt=traceback_txt,
    )
    expected_res = """
filename:3:16: Error at pc=0:0:
    assert 1 = 2;
               ^
Error message 1
Error in the called contract (0x1234):
Error at pc=0:0:
Error message 2
Error in the called contract (0x5678):
filename:3:16: Error at pc=0:0:
    assert 2 = 3;
               ^
Error message 3
"""
    assert res == expected_res

    # Fix 0x1234.
    res = reconstruct_starknet_traceback(
        contracts={0x1234: program_with_debug_info1},
        traceback_txt=traceback_txt,
    )
    expected_res = """
Error at pc=0:0:
Error message 1
Error in the called contract (0x1234):
filename:3:16: Error at pc=0:0:
    assert 1 = 2;
               ^
Error message 2
Error in the called contract (0x5678):
Error at pc=0:0:
Error message 3
"""
    assert res == expected_res

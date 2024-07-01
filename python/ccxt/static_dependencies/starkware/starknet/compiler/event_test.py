from starkware.starknet.compiler.test_utils import preprocess_str, verify_exception
from starkware.starknet.public.abi import get_selector_from_name


def test_event_success():
    usage_code = """
func main{syscall_ptr: felt*, range_check_ptr}() {
    foo.emit(arr_len=0, arr=cast(0, felt*), x=0);
    return ();
}
"""

    code = f"""
%lang starknet
{usage_code}
@event
func foo(arr_len: felt, arr: felt*, x: felt) {{
}}
"""

    expected_emit_function_code = f"""
namespace foo {{
    func emit{{syscall_ptr: felt*, range_check_ptr}}(arr_len: felt, arr: felt*, x: felt) {{
        alloc_locals;

        let (local __keys_ptr: felt*) = alloc();
        assert [__keys_ptr] = {get_selector_from_name("foo")};
        let (local __data_ptr: felt*) = alloc();
        let __calldata_ptr = __data_ptr;
        assert [__calldata_ptr] = arr_len;
        let __calldata_ptr = __calldata_ptr + 1;

        // Check that the length is non-negative.
        assert [range_check_ptr] = arr_len;
        // Store the updated range_check_ptr as a local variable to keep it available after
        // the memcpy.
        local range_check_ptr = range_check_ptr + 1;
        // Keep a reference to __calldata_ptr.
        let __calldata_ptr_copy = __calldata_ptr;
        // Store the updated __calldata_ptr as a local variable to keep it available after
        // the memcpy.
        local __calldata_ptr: felt* = __calldata_ptr + arr_len;
        memcpy(dst=__calldata_ptr_copy, src=arr, len=arr_len);

        assert [__calldata_ptr] = x;
        let __calldata_ptr = __calldata_ptr + 1;

        emit_event(
            keys_len=1, keys=__keys_ptr, data_len=__calldata_ptr - __data_ptr, data=__data_ptr);
        return ();
    }}
}}
"""

    expected_code = f"""
%lang starknet

// Dummy library functions.
func alloc() -> (ptr: felt*) {{
    ret;
}}
func memcpy(dst: felt*, src: felt*, len) {{
    ap += [ap];
    ret;
}}
func emit_event{{syscall_ptr: felt*}}(
        keys_len: felt, keys: felt*, data_len: felt, data: felt*) {{
    ret;
}}

{usage_code}

{expected_emit_function_code}
"""
    program = preprocess_str(code)
    expected_program = preprocess_str(expected_code)

    assert program.format() == expected_program.format()


def test_event_declaration_failures():
    verify_exception(
        """
@event
func f() {
}
""",
        """
file:?:?: @event can only be used in source files that contain the \
"%lang starknet" directive.
@event
 ^***^
""",
    )
    verify_exception(
        """
%lang starknet
@event
namespace f {
}
""",
        """
file:?:?: @event can only be used with functions.
namespace f {
          ^
""",
    )
    verify_exception(
        """
%lang starknet
@event
@another_decorator
func f() {
}
""",
        """
file:?:?: Unexpected decorator for an event.
@another_decorator
 ^***************^
""",
    )

    verify_exception(
        """
%lang starknet
@event
func f() {
    // Empty line.
    const X = 0;
}
""",
        """
file:?:?: Events must have an empty body.
    const X = 0;
    ^**********^
""",
    )
    verify_exception(
        """
%lang starknet
@event
func f{x}() {
}
""",
        """
file:?:?: Events must have no implicit arguments.
func f{x}() {
       ^
""",
    )
    verify_exception(
        """
%lang starknet
@event
func f() -> (res: felt) {
}
""",
        """
file:?:?: Events must have no return values.
func f() -> (res: felt) {
            ^*********^
""",
    )

    verify_exception(
        """
%lang starknet

@event
func f() -> (res: felt) {
}
""",
        """
file:?:?: Events must have no return values.
func f() -> (res: felt) {
            ^*********^
""",
    )

    verify_exception(
        """
%lang starknet

@event
func f() -> felt {
}
""",
        """
file:?:?: Events must have no return values.
func f() -> felt {
            ^**^
""",
    )


def test_event_implementation_failures():
    verify_exception(
        """
%lang starknet
@event
func f(arr: felt*) {
}
""",
        """
file:?:?: Array argument "arr" must be preceded by a length argument named "arr_len" of type felt.
func f(arr: felt*) {
       ^*^
""",
    )

    verify_exception(
        """\
%lang starknet
@event
func foo() {
}
func test{syscall_ptr: felt*}() {
    foo.emit();
    return ();
}
""",
        """
file:?:?: While trying to retrieve the implicit argument 'range_check_ptr' in:
    foo.emit();
    ^********^
file:?:?: While handling event:
func foo() {
     ^*^
file:?:?: Unknown identifier 'range_check_ptr'.
func emit{syscall_ptr: felt*, range_check_ptr}() {
                              ^*************^
""",
    )


def test_event_preprocessor_failures():
    verify_exception(
        """
%lang starknet

namespace foo {
    @event
    func bar() {
    }
}
""",
        """
file:?:?: Unsupported decorator: 'event'.
    @event
     ^***^
""",
    )

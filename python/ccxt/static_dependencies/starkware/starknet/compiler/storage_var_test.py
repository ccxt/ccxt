import re

from starkware.cairo.lang.compiler.preprocessor.preprocessor_test_utils import (
    strip_comments_and_linebreaks,
)
from starkware.starknet.compiler.test_utils import preprocess_str, verify_exception
from starkware.starknet.public.abi import starknet_keccak


def test_storage_var_success():
    program = preprocess_str(
        """
%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin

struct A {
    x: felt,
}

struct B {
    a: A,
    y: felt,
}

func g{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    alloc_locals;
    let (x) = my_var.read();
    my_var.write(value=x + 1);
    local syscall_ptr: felt* = syscall_ptr;
    let (my_var2_addr) = my_var2.addr(B(A(0), 1), 2);
    my_var2.write(B(A(0), 1), 2, value=B(A(3), 4));
    let a = my_var2.read(B(A(0), 1), 2);
    return ();
}

@storage_var
func my_var() -> (res: felt) {
    // Comment.
}

@storage_var
func my_var2(x: B, y) -> (res: B) {
}
"""
    )
    addr = starknet_keccak(b"my_var")
    addr2 = starknet_keccak(b"my_var2")
    expected_result = f"""\
%builtins range_check

// Code for the dummy modules.
ret;
ret;
ret;
ret;

// Implementation of g.
ap += 1;
[ap] = [fp + (-5)], ap++;       // Push syscall_ptr.
[ap] = [fp + (-4)], ap++;       // Push pedersen_ptr.
[ap] = [fp + (-3)], ap++;       // Push range_check_ptr.
call rel ???;                   // Call my_var.read.
[ap] = [ap + (-4)], ap++;       // Push (updated) syscall_ptr.
[ap] = [ap + (-4)], ap++;       // Push (updated) pedersen_ptr.
[ap] = [ap + (-4)], ap++;       // Push (updated) range_check_ptr.
[ap] = [ap + (-4)] + 1, ap++;   // Push value.
call rel ???;                   // Call my_var.write.
[fp] = [ap + (-3)];             // Copy syscall_ptr to a local variable.
[ap] = 0, ap++;                 // Push 0.
[ap] = 1, ap++;                 // Push 1.
[ap] = 2, ap++;                 // Push 2.
call rel ???;                   // Call my_var2.addr.
[ap] = [fp], ap++;              // Push syscall_ptr.
[ap] = [ap + (-4)], ap++;       // Push pedersen_ptr.
[ap] = [ap + (-4)], ap++;       // Push range_check_ptr.
[ap] = 0, ap++;                 // Push 0.
[ap] = 1, ap++;                 // Push 1.
[ap] = 2, ap++;                 // Push 2.
[ap] = 3, ap++;                 // Push 3.
[ap] = 4, ap++;                 // Push 4.
call rel ???;                   // Call my_var2.write.
[ap] = 0, ap++;                 // Push 0.
[ap] = 1, ap++;                 // Push 1.
[ap] = 2, ap++;                 // Push 2.
call rel ???;                   // Call my_var2.read.
[ap] = [ap + (-5)], ap++;       // Return (updated) syscall_ptr.
[ap] = [ap + (-5)], ap++;       // Return (updated) pedersen_ptr.
[ap] = [ap + (-5)], ap++;       // Return (updated) range_check_ptr.
ret;

// Implementation of my_var.addr.
[ap] = [fp + (-4)], ap++;       // Return pedersen_ptr.
[ap] = [fp + (-3)], ap++;       // Return range_check_ptr.
[ap] = {addr}, ap++;            // Return address.
ret;

// Implementation of my_var.read.
[ap] = [fp + (-4)], ap++;       // Push pedersen_ptr.
[ap] = [fp + (-3)], ap++;       // Push range_check_ptr.
call rel ???;                   // Call my_var.addr().
[ap] = [fp + (-5)], ap++;       // Push syscall_ptr.
[ap] = [ap + (-2)], ap++;       // Push address.
call rel ???;                   // Call storage_read().
[ap] = [ap + (-2)], ap++;       // Return (updated) syscall_ptr.
[ap] = [ap + (-8)], ap++;       // Return (updated) pedersen_ptr.
[ap] = [ap + (-8)], ap++;       // Return (updated) range_check_ptr.
[ap] = [ap + (-4)], ap++;       // Return value.
ret;

// Implementation of my_var.write.
[ap] = [fp + (-5)], ap++;       // Push range_check_ptr.
[ap] = [fp + (-4)], ap++;       // Push pedersen_ptr.
call rel ???;                   // Call my_var.addr().
[ap] = [fp + (-6)], ap++;       // Push syscall_ptr.
[ap] = [ap + (-2)], ap++;       // Push address.
[ap] = [fp + (-3)], ap++;       // Push value.
call rel ???;                   // Call storage_write().
[ap] = [ap + (-8)], ap++;       // Return (updated) range_check_ptr.
[ap] = [ap + (-8)], ap++;       // Return (updated) pedersen_ptr.
ret;

// Implementation of my_var2.addr.
[ap] = [fp + (-7)], ap++;       // Push pedersen_ptr.
[ap] = {addr2}, ap++;           // Push address.
[ap] = [fp + (-5)], ap++;       // Push x.a.x.
call rel ???;                   // Call hash2(res, x.a.x).
[ap] = [fp + (-4)], ap++;       // Push x.y.
call rel ???;                   // Call hash2(res, x.y).
[ap] = [fp + (-3)], ap++;       // Push y.
call rel ???;                   // Call hash2(res, y).
[ap] = [fp + (-6)], ap++;       // Push range_check_ptr.
[ap] = [ap + (-2)], ap++;       // Push res.
call rel ???;                   // Call normalize_address(res).
[ap] = [ap + (-6)], ap++;       // Return (updated) pedersen_ptr.
[ap] = [ap + (-3)], ap++;       // Return (updated) range_check_ptr.
[ap] = [ap + (-3)], ap++;       // Return res.
ret;

// Implementation of my_var2.read.
[ap] = [fp + (-7)], ap++;       // Push pedersen_ptr .
[ap] = [fp + (-6)], ap++;       // Push range_check_ptr.
[ap] = [fp + (-5)], ap++;       // Push x.a.x.
[ap] = [fp + (-4)], ap++;       // Push x.y.
[ap] = [fp + (-3)], ap++;       // Push y.
call rel ???;                   // Call my_var.addr().
[ap] = [fp + (-8)], ap++;       // Push syscall_ptr.
[ap] = [ap + (-2)], ap++;       // Push address.
call rel ???;                   // Call storage_read().
[ap] = [ap + (-2)], ap++;       // Push (updated) syscall_ptr.
[ap] = [ap + (-6)] + 1, ap++;   // Push address + 1.
call rel ???;                   // Call storage_read().
[ap] = [ap + (-2)], ap++;       // Return (updated) syscall_ptr.
[ap] = [ap + (-12)], ap++;      // Return (updated) pedersen_ptr.
[ap] = [ap + (-12)], ap++;      // Return (updated) range_check_ptr.
[ap] = [ap + (-8)], ap++;       // Return value (B.a.x).
[ap] = [ap + (-5)], ap++;       // Return value (B.y).
ret;

// Implementation of my_var2.write.
[ap] = [fp + (-9)], ap++;       // Push pedersen_ptr.
[ap] = [fp + (-8)], ap++;       // Push range_check_ptr.
[ap] = [fp + (-7)], ap++;       // Push x.a.x.
[ap] = [fp + (-6)], ap++;       // Push x.y.
[ap] = [fp + (-5)], ap++;       // Push y.
call rel ???;                   // Call my_var.addr().
[ap] = [fp + (-10)], ap++;      // Push syscall_ptr.
[ap] = [ap + (-2)], ap++;       // Push address.
[ap] = [fp + (-4)], ap++;       // Push value.
call rel ???;                   // Call storage_write().
[ap] = [ap + (-6)] + 1, ap++;   // Push address.
[ap] = [fp + (-3)], ap++;       // Push value.
call rel ???;                   // Call storage_write().
[ap] = [ap + (-12)], ap++;      // Return (updated) pedersen_ptr.
[ap] = [ap + (-12)], ap++;      // Return (updated) range_check_ptr.
ret;
"""
    assert re.sub(
        "call rel -?[0-9]+", "call rel ???", strip_comments_and_linebreaks(program.format())
    ) == strip_comments_and_linebreaks(expected_result)


def test_storage_var_failures():
    verify_exception(
        """
@storage_var
func f() -> (res: felt) {
}
""",
        """
file:?:?: @storage_var can only be used in source files that contain the "%lang starknet" directive.
@storage_var
 ^*********^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f() -> (res: felt) {
    return ();  // Comment.
}
""",
        """
file:?:?: Storage variables must have an empty body.
    return ();  // Comment.
    ^********^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f() -> (res: felt) {
    0 = 1;  // Comment.
}
""",
        """
file:?:?: Storage variables must have an empty body.
    0 = 1;  // Comment.
    ^*****************^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f{x, y}() -> (res: felt) {
}
""",
        """
file:?:?: Storage variables must have no implicit arguments.
func f{x, y}() -> (res: felt) {
       ^**^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
@invalid_decorator
func f() -> (res: felt) {
}
""",
        """
file:?:?: Unexpected decorator for a storage variable.
@invalid_decorator
 ^***************^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f(x, y: felt*) -> (res: felt) {
}
""",
        """
file:?:?: Arguments of storage variables must be a felts-only type (cannot contain pointers).
func f(x, y: felt*) -> (res: felt) {
             ^***^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f(addr: felt) -> (res: felt) {
}
""",
        """
file:?:?: 'addr' cannot be used as a storage variable argument name.
func f(addr: felt) -> (res: felt) {
       ^**^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f() {
}
""",
        """
file:?:?: Storage variables must return exactly one value.
func f() {
     ^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f() -> (x: felt, y: felt) {
}
""",
        """
file:?:?: Storage variables must return exactly one value.
func f() -> (x: felt, y: felt) {
            ^****************^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f() -> felt {
}
""",
        """
file:?:?: Only tuple types are currently supported for storage variables.
func f() -> felt {
            ^**^
""",
    )
    verify_exception(
        """
%lang starknet
@storage_var
func f() -> (x: felt*) {
}
""",
        """
file:?:?: The return type of storage variables must be a felts-only type (cannot contain pointers).
func f() -> (x: felt*) {
            ^********^
""",
    )
    verify_exception(
        """
%lang starknet

// A struct of size 10.
struct A {
    x: (felt, felt, felt, felt, felt, felt, felt, felt, felt, felt),
}

// A struct of size 300.
struct B {
    x: (A, A, A, A, A, A, A, A, A, A),
    y: (A, A, A, A, A, A, A, A, A, A),
    z: (A, A, A, A, A, A, A, A, A, A),
}

@storage_var
func f() -> (x: B) {
}
""",
        """
file:?:?: The storage variable size (300) exceeds the maximum value (256).
func f() -> (x: B) {
            ^****^
""",
    )
    verify_exception(
        """
%lang starknet

@storage_var
func f() -> (res: felt) {
}

@storage_var
func f(x: felt) -> (y: felt) {
}
""",
        """
file:?:?: Found more than one storage variable with the same name ('f').
func f(x: felt) -> (y: felt) {
     ^
file:?:?: Note: another definition appears here.
func f() -> (res: felt) {
     ^
""",
    )


def test_storage_var_tail_call_failure():
    verify_exception(
        """
%lang starknet
%builtins pedersen range_check
from starkware.cairo.common.cairo_builtins import HashBuiltin

@storage_var
func f() -> (x: felt) {
}

@external
func test{syscall_ptr: felt*, range_check_ptr, pedersen_ptr: HashBuiltin*}() -> (x: felt) {
    return f.read();
}
""",
        """
file:?:?: Tail calls require the implicit arguments of the callee to match the caller. \
Consider separating the function call and the return statement.
    return f.read();
    ^**************^
The implicit arguments of 'f.read' were defined here:
file:?:?
    func read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (x: felt) {
              ^*************************************************************^
The implicit arguments of 'test' were defined here:
file:?:?
func test{syscall_ptr: felt*, range_check_ptr, pedersen_ptr: HashBuiltin*}() -> (x: felt) {
          ^*************************************************************^
""",
    )

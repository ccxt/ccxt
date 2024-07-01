from starkware.starknet.compiler.test_utils import preprocess_str, verify_exception
from starkware.starknet.services.api.contract_class.contract_class import SUPPORTED_BUILTINS


def test_builtin_directive_after_external():
    verify_exception(
        """
%lang starknet
@external
func f{}() {
    return ();
}
%builtins pedersen range_check ecdsa
""",
        """
file:?:?: Directives must appear at the top of the file.
%builtins pedersen range_check ecdsa
^**********************************^
""",
    )


def test_storage_in_builtin_directive():
    verify_exception(
        """
%builtins storage
""",
        f"""
file:?:?: ['storage'] is not a subsequence of {SUPPORTED_BUILTINS}.
%builtins storage
^***************^
""",
    )


def test_output_in_builtin_directive():
    verify_exception(
        """
%builtins output range_check
""",
        f"""
file:?:?: ['output', 'range_check'] is not a subsequence of {SUPPORTED_BUILTINS}.
%builtins output range_check
^**************************^
""",
    )


def test_missing_lang_directive():
    verify_exception(
        """
@external
func f{}() {
    return ();
}
""",
        """
file:?:?: External decorators can only be used in source files that contain the \
"%lang starknet" directive.
@external
 ^******^
""",
    )


def test_lang_directive():
    verify_exception(
        """
%lang abc
""",
        """
file:?:?: Unsupported %lang directive. Are you using the correct compiler?
%lang abc
^*******^
""",
    )


def test_invalid_hint():
    verify_exception(
        """
%lang starknet
@external
func fc() {
    %{ __storage.commitment_update() %}
    return ();
}
""",
        """
file:?:?: Hint is not whitelisted.
This may indicate that this library function cannot be used in StarkNet contracts.
    %{ __storage.commitment_update() %}
    ^*********************************^
""",
    )


def test_abi_basic():
    program = preprocess_str(
        """
%lang starknet
%builtins range_check

namespace MyNamespace {
    struct ExternalStruct {
        y: (x: felt, y: felt),
    }
}

struct ExternalStruct2 {
    x: (felt, MyNamespace.ExternalStruct),
}

struct NonExternalStruct {
}

struct ExternalStruct3 {
    x: felt,
}

@constructor
func constructor{syscall_ptr}() {
    return ();
}

@external
func f(a: (x: felt, y: felt), arr_len: felt, arr: felt*) -> (b: felt, c: felt) {
    return (0, 1);
}

@view
func g() -> (a: ExternalStruct3) {
    return (a=ExternalStruct3(0));
}

@l1_handler
func handler(from_address, a: ExternalStruct2) {
    return ();
}

struct ExternalStruct4 {
}

@event
func status(a: felt, arr_len: felt, arr: felt*, external_struct: ExternalStruct4) {
}
"""
    )

    assert program.abi == [
        {
            "type": "struct",
            "name": "ExternalStruct3",
            "members": [{"name": "x", "offset": 0, "type": "felt"}],
            "size": 1,
        },
        {
            "type": "struct",
            "name": "ExternalStruct2",
            "members": [{"name": "x", "offset": 0, "type": "(felt, ExternalStruct)"}],
            "size": 3,
        },
        {
            "type": "struct",
            "name": "ExternalStruct",
            "members": [{"name": "y", "offset": 0, "type": "(x: felt, y: felt)"}],
            "size": 2,
        },
        {
            "type": "struct",
            "name": "ExternalStruct4",
            "members": [],
            "size": 0,
        },
        {
            "inputs": [],
            "name": "constructor",
            "outputs": [],
            "type": "constructor",
        },
        {
            "inputs": [
                {"name": "a", "type": "(x: felt, y: felt)"},
                {"name": "arr_len", "type": "felt"},
                {"name": "arr", "type": "felt*"},
            ],
            "name": "f",
            "outputs": [
                {"name": "b", "type": "felt"},
                {"name": "c", "type": "felt"},
            ],
            "type": "function",
        },
        {
            "inputs": [],
            "name": "g",
            "outputs": [
                {"name": "a", "type": "ExternalStruct3"},
            ],
            "type": "function",
            "stateMutability": "view",
        },
        {
            "inputs": [
                {"name": "from_address", "type": "felt"},
                {"name": "a", "type": "ExternalStruct2"},
            ],
            "name": "handler",
            "outputs": [],
            "type": "l1_handler",
        },
        {
            "name": "status",
            "type": "event",
            "keys": [],
            "data": [
                {"name": "a", "type": "felt"},
                {"name": "arr_len", "type": "felt"},
                {"name": "arr", "type": "felt*"},
                {"name": "external_struct", "type": "ExternalStruct4"},
            ],
        },
    ]


def test_abi_failures():
    verify_exception(
        """
%lang starknet

namespace a {
    struct MyStruct {
    }
}

namespace b {
    struct MyStruct {
    }

    struct MyStruct2 {
        x: ((MyStruct, MyStruct), felt),
    }
}

@external
func f(x: (felt, a.MyStruct)) {
    return ();
}

@view
func g(y: b.MyStruct2) {
    return ();
}
""",
        """
file:?:?: Found two external structs named MyStruct: test_scope.a.MyStruct, test_scope.b.MyStruct.
    struct MyStruct {
           ^******^
""",
    )

from starkware.cairo.lang.compiler.identifier_definition import MemberDefinition, StructDefinition
from starkware.cairo.lang.compiler.parser import parse_type
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.cairo.lang.compiler.type_system import mark_type_resolved
from starkware.starknet.public.abi_structs import (
    AbiTypeInfo,
    prepare_type_for_abi,
    struct_definition_from_abi_entry,
    struct_definition_to_abi_entry,
)


def test_prepare_type_for_abi():
    cairo_type = mark_type_resolved(parse_type("(felt, (a.b.c.MyStruct*, T)**)"))
    expected_modified_type = mark_type_resolved(parse_type("(felt, (MyStruct*, T)**)"))
    assert prepare_type_for_abi(cairo_type) == AbiTypeInfo(
        modified_type=expected_modified_type,
        structs={ScopedName.from_string("a.b.c.MyStruct"), ScopedName.from_string("T")},
    )


def test_struct_definition_to_abi_entry():
    struct_definition = StructDefinition(
        full_name=ScopedName.from_string("a.b.c.MyStruct"),
        members={
            "x": MemberDefinition(offset=7, cairo_type=mark_type_resolved(parse_type("a.b.c.T*"))),
        },
        size=1,
        location=None,
    )
    new_abi_entry, structs = struct_definition_to_abi_entry(struct_definition=struct_definition)
    assert new_abi_entry == {
        "type": "struct",
        "name": "MyStruct",
        "members": [
            {
                "name": "x",
                "offset": 7,
                "type": "T*",
            }
        ],
        "size": 1,
    }
    assert structs == {ScopedName.from_string("a.b.c.T")}


def test_abi_structs_both_directions():
    abi_entry = {
        "name": "MyStruct",
        "type": "struct",
        "members": [
            {
                "name": "x",
                "type": "felt**",
                "offset": 0,
            },
            {
                "name": "y",
                "type": "(felt, MyStruct*)",
                "offset": 1,
            },
        ],
        "size": 12,
    }
    struct_definition = struct_definition_from_abi_entry(abi_entry)
    new_abi_entry, structs = struct_definition_to_abi_entry(struct_definition=struct_definition)
    assert new_abi_entry == abi_entry
    assert structs == {ScopedName.from_string("MyStruct")}

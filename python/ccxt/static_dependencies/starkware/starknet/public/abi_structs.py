import dataclasses
from typing import Set, Tuple

from starkware.cairo.lang.compiler.ast.cairo_types import (
    CairoType,
    TypeFelt,
    TypePointer,
    TypeStruct,
    TypeTuple,
)
from starkware.cairo.lang.compiler.identifier_definition import MemberDefinition, StructDefinition
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.parser import parse_type
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.cairo.lang.compiler.type_system import mark_type_resolved
from starkware.starknet.public.abi import AbiType


@dataclasses.dataclass
class AbiTypeInfo:
    # The type after removing type qualification (for example, a.b.c.T -> T).
    modified_type: CairoType
    # All structs that appear inside the type.
    structs: Set[ScopedName]


def prepare_type_for_abi(cairo_type: CairoType) -> AbiTypeInfo:
    """
    Recursively visits the given type and returns an AbiTypeInfo instance.
    """
    if isinstance(cairo_type, TypeTuple):
        new_members = []
        structs = set()
        for inner_type in cairo_type.members:
            res = prepare_type_for_abi(inner_type.typ)
            structs |= res.structs
            new_members.append(dataclasses.replace(inner_type, typ=res.modified_type))

        return AbiTypeInfo(
            modified_type=dataclasses.replace(cairo_type, members=new_members),
            structs=structs,
        )
    elif isinstance(cairo_type, TypeStruct):
        struct_name = cairo_type.scope.path[-1]

        return AbiTypeInfo(
            modified_type=dataclasses.replace(
                cairo_type, scope=ScopedName.from_string(struct_name)
            ),
            structs={cairo_type.scope},
        )
    elif isinstance(cairo_type, TypeFelt):
        return AbiTypeInfo(modified_type=cairo_type, structs=set())
    elif isinstance(cairo_type, TypePointer):
        res = prepare_type_for_abi(cairo_type=cairo_type.pointee)
        return AbiTypeInfo(
            modified_type=dataclasses.replace(cairo_type, pointee=res.modified_type),
            structs=res.structs,
        )
    else:
        raise NotImplementedError(f"Unexpected type: {cairo_type.format()}.")


def struct_definition_to_abi_entry(
    struct_definition: StructDefinition,
) -> Tuple[dict, Set[ScopedName]]:
    """
    Returns a tuple with:
    1. An ABI entry describing the given struct.
    2. A set of struct names that are used inside the struct members.
    """
    members = []
    structs = set()
    for name, member_definition in struct_definition.members.items():
        abi_type_info = prepare_type_for_abi(member_definition.cairo_type)
        members.append(
            {
                "name": name,
                "type": abi_type_info.modified_type.format(),
                "offset": member_definition.offset,
            }
        )
        structs |= abi_type_info.structs
    abi_entry = {
        "name": struct_definition.full_name.path[-1],
        "type": "struct",
        "members": members,
        "size": struct_definition.size,
    }
    return abi_entry, structs


def struct_definition_from_abi_entry(abi_entry: dict) -> StructDefinition:
    """
    Converts an ABI entry of a struct to StructDefinition.
    """
    assert (
        abi_entry["type"] == "struct"
    ), f"Expected an entry of type 'struct'. Got: '{abi_entry['type']}'."
    member_definitions = {}
    for member in abi_entry["members"]:
        member_definitions[member["name"]] = MemberDefinition(
            cairo_type=mark_type_resolved(parse_type(member["type"])),
            offset=member["offset"],
        )
    return StructDefinition(
        full_name=ScopedName.from_string(abi_entry["name"]),
        members=member_definitions,
        size=abi_entry["size"],
        location=None,
    )


def identifier_manager_from_abi(abi: AbiType) -> IdentifierManager:
    """
    Returns an IdentifierManager object which contains all struct definitions found in the ABI.
    """
    identifier_manager = IdentifierManager()
    for abi_entry in abi:
        if abi_entry["type"] == "struct":
            struct_definition = struct_definition_from_abi_entry(abi_entry=abi_entry)
            identifier_manager.add_identifier(
                name=struct_definition.full_name, definition=struct_definition
            )
    return identifier_manager

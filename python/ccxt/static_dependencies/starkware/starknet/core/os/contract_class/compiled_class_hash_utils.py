import itertools
import os
from functools import lru_cache
from typing import List

from starkware.cairo.common.structs import CairoStructFactory, CairoStructProxy
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo_files
from starkware.cairo.lang.compiler.identifier_definition import ConstDefinition
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.python.utils import as_non_optional, from_bytes
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    EntryPointType,
)

CAIRO_FILE = os.path.join(os.path.dirname(__file__), "compiled_class.cairo")
COMPILED_CLASS_MODULE = "starkware.starknet.core.os.contract_class.compiled_class"


@lru_cache()
def load_compiled_class_cairo_program() -> Program:
    return compile_cairo_files(
        [CAIRO_FILE],
        prime=DEFAULT_PRIME,
        main_scope=ScopedName.from_string(COMPILED_CLASS_MODULE),
    )


@lru_cache()
def _get_empty_compiled_class_structs() -> CairoStructProxy:
    program = load_compiled_class_cairo_program()
    return CairoStructFactory(
        identifiers=program.identifiers,
        additional_imports=[
            f"{COMPILED_CLASS_MODULE}.CompiledClass",
            f"{COMPILED_CLASS_MODULE}.CompiledClassEntryPoint",
        ],
    ).structs


def _get_contract_entry_points(
    structs: CairoStructProxy,
    compiled_class: CompiledClass,
    entry_point_type: EntryPointType,
) -> List[CairoStructProxy]:
    # Check validity of entry points.
    program_length = len(compiled_class.bytecode)
    entry_points = compiled_class.entry_points_by_type[entry_point_type]
    for entry_point in entry_points:
        assert (
            0 <= entry_point.offset < program_length
        ), f"Invalid entry point offset {entry_point.offset}, len(program_data)={program_length}."

    return [
        structs.CompiledClassEntryPoint(
            selector=entry_point.selector,
            offset=entry_point.offset,
            n_builtins=len(as_non_optional(entry_point.builtins)),
            builtin_list=[
                from_bytes(builtin.encode("ascii"))
                for builtin in as_non_optional(entry_point.builtins)
            ],
        )
        for entry_point in entry_points
    ]


def get_compiled_class_struct(
    identifiers: IdentifierManager, compiled_class: CompiledClass, bytecode: List[int]
) -> CairoStructProxy:
    """
    Returns the serialization of a compiled class as a list of field elements.
    Note that the bytecode is passed explicitly (rather than taken from the compiled class) to
    allow skipping some code segments.
    """
    structs = _get_empty_compiled_class_structs()

    COMPILED_CLASS_VERSION_IDENT = identifiers.get_by_full_name(
        ScopedName.from_string(
            "starkware.starknet.core.os.contract_class.compiled_class.COMPILED_CLASS_VERSION"
        )
    )
    assert isinstance(COMPILED_CLASS_VERSION_IDENT, ConstDefinition)

    external_functions, l1_handlers, constructors = (
        _get_contract_entry_points(
            structs=structs,
            compiled_class=compiled_class,
            entry_point_type=entry_point_type,
        )
        for entry_point_type in (
            EntryPointType.EXTERNAL,
            EntryPointType.L1_HANDLER,
            EntryPointType.CONSTRUCTOR,
        )
    )
    flat_external_functions, flat_l1_handlers, flat_constructors = (
        list(itertools.chain.from_iterable(entry_points))
        for entry_points in (external_functions, l1_handlers, constructors)
    )

    assert len(bytecode) == len(compiled_class.bytecode)

    return structs.CompiledClass(
        compiled_class_version=COMPILED_CLASS_VERSION_IDENT.value,
        n_external_functions=len(external_functions),
        external_functions=flat_external_functions,
        n_l1_handlers=len(l1_handlers),
        l1_handlers=flat_l1_handlers,
        n_constructors=len(constructors),
        constructors=flat_constructors,
        bytecode_length=len(bytecode),
        bytecode_ptr=bytecode,
    )

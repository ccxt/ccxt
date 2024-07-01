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
from starkware.python.utils import to_bytes
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.public.abi import starknet_keccak
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    EntryPointType,
)
from starkware.starkware_utils.error_handling import StarkException

CAIRO_FILE = os.path.join(os.path.dirname(__file__), "contract_class.cairo")
CONTRACT_CLASS_MODULE = "starkware.starknet.core.os.contract_class.contract_class"


@lru_cache()
def load_contract_class_cairo_program() -> Program:
    return compile_cairo_files(
        [CAIRO_FILE],
        prime=DEFAULT_PRIME,
        main_scope=ScopedName.from_string(CONTRACT_CLASS_MODULE),
    )


@lru_cache()
def _get_empty_contract_class_structs() -> CairoStructProxy:
    program = load_contract_class_cairo_program()
    return CairoStructFactory(
        identifiers=program.identifiers,
        additional_imports=[
            f"{CONTRACT_CLASS_MODULE}.ContractClass",
            f"{CONTRACT_CLASS_MODULE}.ContractEntryPoint",
        ],
    ).structs


def _get_contract_entry_points(
    structs: CairoStructProxy,
    contract_class: ContractClass,
    entry_point_type: EntryPointType,
) -> List[CairoStructProxy]:
    entry_points = contract_class.entry_points_by_type[entry_point_type]
    return [
        structs.ContractEntryPoint(
            selector=entry_point.selector, function_idx=entry_point.function_idx
        )
        for entry_point in entry_points
    ]


def get_contract_class_struct(
    identifiers: IdentifierManager, contract_class: ContractClass
) -> CairoStructProxy:
    """
    Returns the serialization of a contract class as the 'ContractClass' Cairo struct.
    """
    structs = _get_empty_contract_class_structs()

    CONTRACT_CLASS_VERSION_IDENT = identifiers.get_by_full_name(
        ScopedName.from_string(f"{CONTRACT_CLASS_MODULE}.CONTRACT_CLASS_VERSION")
    )
    assert isinstance(CONTRACT_CLASS_VERSION_IDENT, ConstDefinition)
    contract_class_version_ident_str = (
        to_bytes(CONTRACT_CLASS_VERSION_IDENT.value).decode("ascii").lstrip("\x00")
    )
    if contract_class_version_ident_str != (
        "CONTRACT_CLASS_V" + contract_class.contract_class_version
    ):
        raise StarkException(
            code=StarknetErrorCode.INVALID_CONTRACT_CLASS_VERSION,
            message=(
                "Unexpected contract class version. "
                f"Expected {contract_class_version_ident_str}; "
                f"got CONTRACT_CLASS_V{contract_class.contract_class_version}."
            ),
        )

    external_functions, l1_handlers, constructors = (
        _get_contract_entry_points(
            structs=structs,
            contract_class=contract_class,
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

    return structs.ContractClass(
        contract_class_version=CONTRACT_CLASS_VERSION_IDENT.value,
        n_external_functions=len(external_functions),
        external_functions=flat_external_functions,
        n_l1_handlers=len(l1_handlers),
        l1_handlers=flat_l1_handlers,
        n_constructors=len(constructors),
        constructors=flat_constructors,
        abi_hash=starknet_keccak(data=bytes(contract_class.abi, encoding="UTF-8")),
        sierra_program_length=len(contract_class.sierra_program),
        sierra_program_ptr=contract_class.sierra_program,
    )

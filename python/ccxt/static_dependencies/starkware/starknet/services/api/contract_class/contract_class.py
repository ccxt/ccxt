import dataclasses
import json
import re
from abc import abstractmethod
from dataclasses import field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Union

import marshmallow
import marshmallow.fields as mfields
import marshmallow_dataclass

from services.everest.definitions import fields as everest_fields
from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.preprocessor.flow import ReferenceManager
from starkware.cairo.lang.compiler.program import CairoHint, Program
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.python.utils import as_non_optional
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.public.abi import AbiType
from starkware.starkware_utils.error_handling import stark_assert
from starkware.starkware_utils.marshmallow_dataclass_fields import IntAsHex, additional_metadata
from starkware.starkware_utils.subsequence import is_subsequence
from starkware.starkware_utils.validated_dataclass import (
    ValidatedDataclass,
    ValidatedMarshmallowDataclass,
)

# An ordered list of the supported builtins.
SUPPORTED_BUILTINS = [
    "pedersen",
    "range_check",
    "ecdsa",
    "bitwise",
    "ec_op",
    "poseidon",
    "segment_arena",
]

# Utilites.


def validate_builtins(builtins: Optional[List[str]]):
    if builtins is None:
        return

    stark_assert(
        is_subsequence(builtins, SUPPORTED_BUILTINS),
        code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
        message=f"{builtins} is not a subsequence of {SUPPORTED_BUILTINS}.",
    )


# Objects.


class EntryPointType(Enum):
    EXTERNAL = 0
    L1_HANDLER = auto()
    CONSTRUCTOR = auto()


@dataclasses.dataclass(frozen=True)
class ContractEntryPoint(ValidatedDataclass):
    # A field element that encodes the signature of the called function.
    selector: int = field(metadata=fields.entry_point_selector_metadata)
    function_idx: int = field(metadata=fields.entry_point_function_idx_metadata)


@marshmallow_dataclass.dataclass(frozen=True)
class ContractClass(ValidatedMarshmallowDataclass):
    """
    Represents a contract class in the StarkNet network.
    """

    contract_class_version: str
    sierra_program: List[int] = field(metadata=everest_fields.felt_as_hex_list_metadata)
    entry_points_by_type: Dict[EntryPointType, List[ContractEntryPoint]]
    abi: str

    def get_bytecode_size(self) -> int:
        return len(self.sierra_program)

    def get_abi_size(self) -> int:
        return len(self.abi)


@marshmallow_dataclass.dataclass(frozen=True)
class CompiledClassEntryPoint(ValidatedDataclass):
    # A field element that encodes the signature of the called function.
    selector: int = field(metadata=fields.entry_point_selector_metadata)
    # The offset of the instruction that should be called within the contract bytecode.
    offset: int = field(metadata=fields.entry_point_offset_metadata)
    # Builtins used by the entry point.
    builtins: Optional[List[str]]

    @marshmallow.decorators.pre_load
    def load_offset_formatted_as_hex(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        offset = data["offset"]
        if isinstance(offset, str):
            assert (
                re.match("^0x[0-9a-f]+$", offset) is not None
            ), f"offset field is of unexpected format: {offset}."
            data["offset"] = int(offset, 16)

        return data


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@marshmallow_dataclass.dataclass(frozen=True)  # type: ignore[misc]
class CompiledClassBase(ValidatedMarshmallowDataclass):
    entry_points_by_type: Dict[EntryPointType, List[CompiledClassEntryPoint]]

    @abstractmethod
    def get_builtins(self) -> List[str]:
        """
        Returns the "builtins" attribute of the compiled class.
        """

    @abstractmethod
    def get_prime(self) -> int:
        """
        Returns the "prime" attribute of the compiled class.
        """

    @abstractmethod
    def get_bytecode(self) -> List[int]:
        """
        Returns the "bytecode" attribute of the compiled class.
        """

    def __post_init__(self):
        super().__post_init__()

        for entry_points in self.entry_points_by_type.values():
            stark_assert(
                all(
                    entry_points[i].selector < entry_points[i + 1].selector
                    for i in range(len(entry_points) - 1)
                ),
                code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
                message="Entry points must be unique and sorted.",
            )

        constructor_eps = self.entry_points_by_type.get(EntryPointType.CONSTRUCTOR)
        stark_assert(
            constructor_eps is not None,
            code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
            message="The contract is missing constructor endpoints. Wrong compiler version?",
        )

        stark_assert(
            len(as_non_optional(constructor_eps)) <= 1,
            code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
            message="A contract may have at most 1 constructor.",
        )

    def validate(self):
        validate_builtins(builtins=self.get_builtins())
        for entry_points in self.entry_points_by_type.values():
            for entry_point in entry_points:
                validate_builtins(builtins=entry_point.builtins)

        stark_assert(
            self.get_prime() == DEFAULT_PRIME,
            code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
            message=(
                f"Invalid value for field prime: {self.get_prime()}. Expected: {DEFAULT_PRIME}."
            ),
        )

    @property
    def n_entry_points(self) -> int:
        """
        Returns the number of entry points (note that functions with multiple decorators are
        counted more than once).
        """
        return sum(len(eps) for eps in self.entry_points_by_type.values())


# Represents a nested list of integers. E.g., [1, [2, [3], 4], 5, 6].
NestedIntList = Union[int, List[Any]]


@marshmallow_dataclass.dataclass(frozen=True)
class CompiledClass(CompiledClassBase):
    """
    Represents a compiled contract class in the Starknet network.
    """

    prime: int = field(metadata=additional_metadata(marshmallow_field=IntAsHex(required=True)))
    bytecode: List[int] = field(
        metadata=additional_metadata(marshmallow_field=mfields.List(IntAsHex(), required=True))
    )
    # Represents the structure of the bytecode segments, using a nested list of segment lengths.
    # For example, [2, [3, 4]] represents a bytecode with 2 segments, the first is a leaf of length
    # 2 and the second is a node with 2 children of lengths 3 and 4.
    bytecode_segment_lengths: NestedIntList = field(
        metadata=additional_metadata(marshmallow_field=fields.NestedIntListField())
    )
    # Rust hints.
    hints: List[Any]
    pythonic_hints: Dict[int, List[CairoHint]]
    compiler_version: str = field(
        metadata=dict(marshmallow_field=mfields.String(required=False, load_default=None))
    )

    def get_builtins(self) -> List[str]:
        return []

    def get_prime(self) -> int:
        return self.prime

    def get_bytecode(self) -> List[int]:
        return self.bytecode

    def get_bytecode_size(self) -> int:
        return len(self.get_bytecode())

    @marshmallow.decorators.pre_load
    def parse_pythonic_hints(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        """
        Parses Cairo 1.0 casm hints.
        Each hint comprises a two-item List: an ID (int) and a List of hint codes (strings).
        The returned CairoHint object takes empty "accessible_scopes" and "flow_tracking_data"
        values as these are only relevant to Cairo 0 programs.
        """
        # Invalidate 0.11.0-pre-release compiled classes.
        stark_assert(
            "program" not in data,
            code=StarknetErrorCode.INVALID_COMPILED_CLASS,
            message="Unsupported compiled class format. "
            "Cairo 1.0 compiled class must not contain the attribute `program`.",
        )
        # Invalidate compiled classes without pythonic hints.
        stark_assert(
            "pythonic_hints" in data,
            code=StarknetErrorCode.INVALID_COMPILED_CLASS,
            message="Unsupported compiled class format. "
            "Cairo 1.0 compiled class must contain the attribute `pythonic_hints`.",
        )

        pythonic_hints = data["pythonic_hints"]
        empty_accessible_scope: List = []
        empty_flow_tracking_data: Dict[str, Any] = {
            "ap_tracking": {"group": 0, "offset": 0},
            "reference_ids": {},
        }

        data["pythonic_hints"] = {
            hint_id: [
                {
                    "code": hint_code,
                    "accessible_scopes": empty_accessible_scope,
                    "flow_tracking_data": empty_flow_tracking_data,
                }
                for hint_code in hint_codes
            ]
            for hint_id, hint_codes in pythonic_hints
        }

        return data

    @marshmallow.decorators.pre_load
    def default_bytecode_segment_lengths(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        # If bytecode_segment_lengths is missing, use a single leaf (which forces loading the entire
        # program).
        if "bytecode_segment_lengths" not in data:
            data["bytecode_segment_lengths"] = len(data["bytecode"])
        return data

    @marshmallow.decorators.post_dump
    def dump_pythonic_hints(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        data["pythonic_hints"] = [
            [hint_id, [hint_obj["code"] for hint_obj in hint_obj_list]]
            for hint_id, hint_obj_list in data["pythonic_hints"].items()
        ]
        return data

    def __post_init__(self):
        super().__post_init__()

        for entry_points in self.entry_points_by_type.values():
            for entry_point in entry_points:
                stark_assert(
                    entry_point.builtins is not None,
                    code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
                    message=f"Missing builtins for entry point {entry_point.selector}.",
                )

    def get_runnable_program(self, entrypoint_builtins: List[str]) -> Program:
        """
        Converts the HintedProgram into a Program object that can be run by the Python CairoRunner.
        """
        return Program(
            prime=self.prime,
            data=self.bytecode,
            # Buitlins for the entrypoint to execute.
            builtins=entrypoint_builtins,
            hints=self.pythonic_hints,
            compiler_version=self.compiler_version,
            # Fill missing fields with empty values.
            main_scope=ScopedName(),
            identifiers=IdentifierManager(),
            reference_manager=ReferenceManager(),
            attributes=[],
            debug_info=None,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedCompiledClass(CompiledClassBase):
    """
    Represents a contract in the StarkNet network that was compiled by the old (pythonic) compiler.
    """

    program: Program
    abi: Optional[AbiType] = None

    def get_builtins(self) -> List[str]:
        return self.program.builtins

    def get_prime(self) -> int:
        return self.program.prime

    def get_bytecode(self) -> List[int]:
        return self.program.data

    def get_bytecode_size(self) -> int:
        return len(self.get_bytecode())

    def get_abi_size(self) -> int:
        return len(json.dumps(self.abi)) if self.abi is not None else 0

    @marshmallow.decorators.post_dump
    def remove_none_builtins(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        """
        Needed for backward compatibility of hash computation for deprecated contracts.
        """
        for entry_points in data["entry_points_by_type"].values():
            for entry_point in entry_points:
                # Verify that builtins is None and remove it.
                stark_assert(
                    entry_point.pop("builtins") is None,
                    code=StarknetErrorCode.INVALID_CONTRACT_CLASS,
                    message="Entry point should not have builtins in deprecated contracts.",
                )

        return data

    def remove_debug_info(self) -> "DeprecatedCompiledClass":
        """
        Sets debug_info in the Cairo contract program to None.
        Returns an altered DeprecatedCompiledClass instance.
        """
        altered_program = dataclasses.replace(self.program, debug_info=None)
        return dataclasses.replace(self, program=altered_program)


@dataclasses.dataclass(frozen=True)
class RawCompiledClass:
    """
    Represents a raw compiled contract class in the Starknet network.
    """

    raw_compiled_class: str
    version: int

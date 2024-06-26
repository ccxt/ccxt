import json

from ....marshmallow import Schema, ValidationError, fields, post_load

from ..client_models import (
    CasmClass,
    CasmClassEntryPoint,
    CasmClassEntryPointsByType,
    CompiledContract,
    ContractClass,
    EntryPoint,
    EntryPointsByType,
    SierraCompiledContract,
    SierraContractClass,
    SierraEntryPoint,
    SierraEntryPointsByType,
)
from .common import Felt

# pylint: disable=unused-argument, no-self-use


class EntryPointSchema(Schema):
    offset = Felt(data_key="offset", required=True)
    selector = Felt(data_key="selector", required=True)

    @post_load
    def make_dataclass(self, data, **kwargs) -> EntryPoint:
        return EntryPoint(**data)


class EntryPointsByTypeSchema(Schema):
    constructor = fields.List(
        fields.Nested(EntryPointSchema()), data_key="CONSTRUCTOR", required=True
    )
    external = fields.List(
        fields.Nested(EntryPointSchema()), data_key="EXTERNAL", required=True
    )
    l1_handler = fields.List(
        fields.Nested(EntryPointSchema()), data_key="L1_HANDLER", required=True
    )

    @post_load
    def make_dataclass(self, data, **kwargs) -> EntryPointsByType:
        return EntryPointsByType(**data)


class ContractClassSchema(Schema):
    program = fields.Dict(
        keys=fields.String(),
        values=fields.Raw(allow_none=True),
        data_key="program",
        required=True,
    )
    entry_points_by_type = fields.Nested(
        EntryPointsByTypeSchema(), data_key="entry_points_by_type", required=True
    )
    abi = fields.List(fields.Dict(), data_key="abi")

    @post_load
    def make_dataclass(self, data, **kwargs) -> ContractClass:
        return ContractClass(**data)


class SierraEntryPointSchema(Schema):
    function_idx = fields.Integer(data_key="function_idx", required=True)
    selector = Felt(data_key="selector", required=True)

    @post_load
    def make_dataclass(self, data, **kwargs) -> SierraEntryPoint:
        return SierraEntryPoint(**data)


class SierraEntryPointsByTypeSchema(Schema):
    constructor = fields.List(
        fields.Nested(SierraEntryPointSchema()), data_key="CONSTRUCTOR", required=True
    )
    external = fields.List(
        fields.Nested(SierraEntryPointSchema()), data_key="EXTERNAL", required=True
    )
    l1_handler = fields.List(
        fields.Nested(SierraEntryPointSchema()), data_key="L1_HANDLER", required=True
    )

    @post_load
    def make_dataclass(self, data, **kwargs) -> SierraEntryPointsByType:
        return SierraEntryPointsByType(**data)


class SierraContractClassSchema(Schema):
    contract_class_version = fields.String(
        data_key="contract_class_version", required=True
    )
    sierra_program = fields.List(
        fields.String(),
        data_key="sierra_program",
        required=True,
    )
    entry_points_by_type = fields.Nested(
        SierraEntryPointsByTypeSchema(), data_key="entry_points_by_type", required=True
    )
    abi = fields.String(data_key="abi")

    @post_load
    def make_dataclass(self, data, **kwargs) -> SierraContractClass:
        return SierraContractClass(**data)


class AbiField(fields.Field):
    def _deserialize(self, value, attr, data, **kwargs):
        if isinstance(value, str):
            return value
        if isinstance(value, list) and all(isinstance(item, dict) for item in value):
            return json.dumps(value)
        raise ValidationError("Field should be str or list[dict].")


class SierraCompiledContractSchema(SierraContractClassSchema):
    abi = AbiField(data_key="abi", required=True)

    @post_load
    def make_dataclass(self, data, **kwargs) -> SierraCompiledContract:
        return SierraCompiledContract(**data)


class CompiledContractSchema(ContractClassSchema):
    abi = fields.List(fields.Dict(), data_key="abi", required=True)

    @post_load
    def make_dataclass(self, data, **kwargs) -> CompiledContract:
        return CompiledContract(**data)


class CasmClassEntryPointSchema(Schema):
    selector = Felt(data_key="selector", required=True)
    offset = fields.Integer(data_key="offset", required=True)
    builtins = fields.List(fields.String(), data_key="builtins")

    @post_load
    def make_dataclass(self, data, **kwargs) -> CasmClassEntryPoint:
        return CasmClassEntryPoint(**data)


class CasmClassEntryPointsByTypeSchema(Schema):
    constructor = fields.List(
        fields.Nested(CasmClassEntryPointSchema()),
        data_key="CONSTRUCTOR",
        required=True,
    )
    external = fields.List(
        fields.Nested(CasmClassEntryPointSchema()),
        data_key="EXTERNAL",
        required=True,
    )
    l1_handler = fields.List(
        fields.Nested(CasmClassEntryPointSchema()),
        data_key="L1_HANDLER",
        required=True,
    )

    @post_load
    def make_dataclass(self, data, **kwargs) -> CasmClassEntryPointsByType:
        return CasmClassEntryPointsByType(**data)


class CasmClassSchema(Schema):
    prime = Felt(data_key="prime", required=True)
    bytecode = fields.List(Felt(), data_key="bytecode", required=True)
    bytecode_segment_lengths = fields.List(
        Felt(), data_key="bytecode_segment_lengths", load_default=None
    )
    hints = fields.List(fields.Raw(), data_key="hints", required=True)
    pythonic_hints = fields.List(fields.Raw(), data_key="pythonic_hints", required=True)
    compiler_version = fields.String(data_key="compiler_version", required=True)
    entry_points_by_type = fields.Nested(
        CasmClassEntryPointsByTypeSchema(),
        data_key="entry_points_by_type",
        required=True,
    )

    @post_load
    def make_dataclass(self, data, **kwargs) -> CasmClass:
        return CasmClass(**data)

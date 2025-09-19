from ....marshmallow import Schema, fields
from ....marshmallow_oneofschema import OneOfSchema

from .shape import (
    ENUM_ENTRY,
    EVENT_ENTRY,
    FUNCTION_ENTRY,
    STRUCT_ENTRY,
)


class TypeSchema(Schema):
    type = fields.String(data_key="type", required=True)


class TypedParameterSchema(TypeSchema):
    name = fields.String(data_key="name", required=True)


class FunctionBaseSchema(Schema):
    name = fields.String(data_key="name", required=True)
    inputs = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="inputs", required=True
    )
    outputs = fields.List(
        fields.Nested(TypeSchema()), data_key="outputs", required=True
    )
    state_mutability = fields.String(data_key="state_mutability", default=None)


class FunctionAbiEntrySchema(FunctionBaseSchema):
    type = fields.Constant(FUNCTION_ENTRY, data_key="type", required=True)


class EventAbiEntrySchema(Schema):
    type = fields.Constant(EVENT_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    inputs = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="inputs", required=True
    )


class StructAbiEntrySchema(Schema):
    type = fields.Constant(STRUCT_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    members = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="members", required=True
    )


class EnumAbiEntrySchema(Schema):
    type = fields.Constant(ENUM_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    variants = fields.List(
        fields.Nested(TypedParameterSchema(), data_key="variants", required=True)
    )


class ContractAbiEntrySchema(OneOfSchema):
    type_field_remove = False
    type_schemas = {
        FUNCTION_ENTRY: FunctionAbiEntrySchema,
        EVENT_ENTRY: EventAbiEntrySchema,
        STRUCT_ENTRY: StructAbiEntrySchema,
        ENUM_ENTRY: EnumAbiEntrySchema,
    }

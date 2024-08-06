from ....marshmallow import Schema, fields
from ....marshmallow_oneofschema import OneOfSchema

from .shape import (
    CONSTRUCTOR_ENTRY,
    EVENT_ENTRY,
    FUNCTION_ENTRY,
    L1_HANDLER_ENTRY,
    STRUCT_ENTRY,
)


class TypedParameterSchema(Schema):
    name = fields.String(data_key="name", required=True)
    type = fields.String(data_key="type", required=True)


class StructMemberSchema(TypedParameterSchema):
    offset = fields.Integer(data_key="offset", required=False)


class FunctionBaseSchema(Schema):
    name = fields.String(data_key="name", required=True)
    inputs = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="inputs", required=True
    )
    outputs = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="outputs", required=True
    )


class FunctionAbiEntrySchema(FunctionBaseSchema):
    type = fields.Constant(FUNCTION_ENTRY, data_key="type", required=True)


class ConstructorAbiEntrySchema(FunctionBaseSchema):
    type = fields.Constant(CONSTRUCTOR_ENTRY, data_key="type", required=True)


class L1HandlerAbiEntrySchema(FunctionBaseSchema):
    type = fields.Constant(L1_HANDLER_ENTRY, data_key="type", required=True)


class EventAbiEntrySchema(Schema):
    type = fields.Constant(EVENT_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    keys = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="keys", required=True
    )
    data = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="data", required=True
    )


class StructAbiEntrySchema(Schema):
    type = fields.Constant(STRUCT_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    size = fields.Integer(data_key="size", required=True)
    members = fields.List(
        fields.Nested(StructMemberSchema()), data_key="members", required=True
    )


class ContractAbiEntrySchema(OneOfSchema):
    type_field_remove = False
    type_schemas = {
        FUNCTION_ENTRY: FunctionAbiEntrySchema,
        L1_HANDLER_ENTRY: L1HandlerAbiEntrySchema,
        CONSTRUCTOR_ENTRY: ConstructorAbiEntrySchema,
        EVENT_ENTRY: EventAbiEntrySchema,
        STRUCT_ENTRY: StructAbiEntrySchema,
    }

from ....marshmallow import Schema, fields
from ....marshmallow_oneofschema import OneOfSchema

from .shape import (
    CONSTRUCTOR_ENTRY,
    DATA_KIND,
    ENUM_ENTRY,
    EVENT_ENTRY,
    FUNCTION_ENTRY,
    IMPL_ENTRY,
    INTERFACE_ENTRY,
    L1_HANDLER_ENTRY,
    NESTED_KIND,
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


class ConstructorAbiEntrySchema(Schema):
    type = fields.Constant(CONSTRUCTOR_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    inputs = fields.List(
        fields.Nested(TypedParameterSchema()), data_key="inputs", required=True
    )


class L1HandlerAbiEntrySchema(FunctionBaseSchema):
    type = fields.Constant(L1_HANDLER_ENTRY, data_key="type", required=True)


class EventStructMemberSchema(TypedParameterSchema):
    kind = fields.Constant(DATA_KIND, data_key="kind", required=True)


class EventStructAbiEntrySchema(Schema):
    type = fields.Constant(EVENT_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    kind = fields.Constant(STRUCT_ENTRY, data_key="kind", required=True)
    members = fields.List(
        fields.Nested(EventStructMemberSchema()), data_key="members", required=True
    )


class EventEnumVariantSchema(TypedParameterSchema):
    kind = fields.Constant(NESTED_KIND, data_key="kind", required=True)


class EventEnumAbiEntrySchema(Schema):
    type = fields.Constant(EVENT_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    kind = fields.Constant(ENUM_ENTRY, data_key="kind", required=True)
    variants = fields.List(
        fields.Nested(EventEnumVariantSchema()), data_key="variants", required=True
    )


class EventAbiEntrySchema(OneOfSchema):
    type_field = "kind"
    type_field_remove = False
    type_schemas = {
        STRUCT_ENTRY: EventStructAbiEntrySchema,
        ENUM_ENTRY: EventEnumAbiEntrySchema,
    }


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


class ImplAbiEntrySchema(Schema):
    type = fields.Constant(IMPL_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)
    interface_name = fields.String(data_key="interface_name", required=True)


class InterfaceAbiEntrySchema(Schema):
    type = fields.Constant(INTERFACE_ENTRY, data_key="type", required=True)
    name = fields.String(data_key="name", required=True)

    items = fields.List(
        fields.Nested(
            FunctionAbiEntrySchema(), data_key="items", required=True
        )  # for now only functions can be defined here
    )


class ContractAbiEntrySchema(OneOfSchema):
    type_field_remove = False
    type_schemas = {
        FUNCTION_ENTRY: FunctionAbiEntrySchema,
        EVENT_ENTRY: EventAbiEntrySchema,
        STRUCT_ENTRY: StructAbiEntrySchema,
        ENUM_ENTRY: EnumAbiEntrySchema,
        CONSTRUCTOR_ENTRY: ConstructorAbiEntrySchema,
        L1_HANDLER_ENTRY: L1HandlerAbiEntrySchema,
        IMPL_ENTRY: ImplAbiEntrySchema,
        INTERFACE_ENTRY: InterfaceAbiEntrySchema,
    }

from marshmallow import fields, post_dump, pre_load
from marshmallow_oneofschema import OneOfSchema

from net.client_models import TransactionType
from net.models.transaction import compress_program, decompress_program
from net.schemas.gateway import (
    ContractClassSchema,
    SierraCompiledContractSchema,
)
from net.schemas.rpc import (
    DeclareTransactionV1Schema,
    DeclareTransactionV2Schema,
    DeclareTransactionV3Schema,
    DeployAccountTransactionSchema,
    InvokeTransactionSchema,
)
from net.schemas.utils import _extract_tx_version


class BroadcastedDeclareV3Schema(DeclareTransactionV3Schema):
    contract_class = fields.Nested(
        SierraCompiledContractSchema(), data_key="contract_class", required=True
    )


class BroadcastedDeclareV2Schema(DeclareTransactionV2Schema):
    contract_class = fields.Nested(
        SierraCompiledContractSchema(), data_key="contract_class", required=True
    )


class BroadcastedDeclareV1Schema(DeclareTransactionV1Schema):
    contract_class = fields.Nested(
        ContractClassSchema(), data_key="contract_class", required=True
    )

    @post_dump
    def post_dump(self, data, **kwargs):
        # Allowing **kwargs is needed here because marshmallow is passing additional parameters here
        # along with data, which we don't handle.
        # pylint: disable=unused-argument, no-self-use
        return compress_program(data)

    @pre_load
    def decompress_program(self, data, **kwargs):
        # pylint: disable=unused-argument, no-self-use
        return decompress_program(data)


class BroadcastedDeclareSchema(OneOfSchema):
    type_schemas = {
        1: BroadcastedDeclareV1Schema,
        2: BroadcastedDeclareV2Schema,
        3: BroadcastedDeclareV3Schema,
    }

    def get_obj_type(self, obj):
        return _extract_tx_version(obj.version)


class BroadcastedTransactionSchema(OneOfSchema):
    type_schemas = {
        TransactionType.INVOKE.name: InvokeTransactionSchema(),
        TransactionType.DECLARE.name: BroadcastedDeclareSchema(),
        TransactionType.DEPLOY_ACCOUNT.name: DeployAccountTransactionSchema(),
    }

    def get_obj_type(self, obj):
        return obj.type.name

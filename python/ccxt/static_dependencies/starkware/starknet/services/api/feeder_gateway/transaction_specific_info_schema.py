from typing import Any, Dict, Type, cast

import marshmallow
import marshmallow.exceptions
import marshmallow.utils
from marshmallow_oneofschema import OneOfSchema

from starkware.starknet.definitions import fields
from starkware.starknet.definitions.transaction_type import (
    DEPRECATED_DECLARE_SCHEMA_NAME,
    DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME,
    DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME,
    TransactionType,
)
from starkware.starknet.services.api.feeder_gateway.account_transaction_specific_info import (
    DeclareSpecificInfo,
    DeployAccountSpecificInfo,
    InvokeSpecificInfo,
)
from starkware.starknet.services.api.feeder_gateway.deprecated_transaction_specific_info import (
    DeploySpecificInfo,
    DeprecatedDeclareSpecificInfo,
    DeprecatedDeployAccountSpecificInfo,
    DeprecatedInvokeSpecificInfo,
    L1HandlerSpecificInfo,
)
from starkware.starknet.services.api.feeder_gateway.transaction_specific_info import (
    TransactionSpecificInfo,
)
from starkware.starknet.services.api.gateway.transaction_utils import is_deprecated_tx


class BaseTransactionSpecificInfoSchema(OneOfSchema):
    """
    Represents the base class of Starknet response transaction marshmallow schema class.
    Contains custom logic of selecting the appropriate transaction class to de/serialize from/into.

    Note that externally there are four transaction types, even though internally there are more.
    Hence, we need to manually “wire” the given transaction data to the corresponding type.
    """

    def get_obj_type(self, obj: TransactionSpecificInfo) -> str:
        """
        Returns the name of key of type-to-schema mapping,
        which will be used while loading the object currently dumped.
        """
        if is_deprecated_tx(raw_tx_type=obj.tx_type.name, version=obj.version):
            return f"DEPRECATED_{obj.tx_type.name}"

        return obj.tx_type.name

    def get_data_type(self, data: Dict[str, Any]) -> str:
        """
        Returns the name of key of type-to-schema mapping,
        for the raw data currently being loaded into an object.
        """
        raw_tx_type = cast(str, data.get(self.type_field))

        # Version field may be missing in old transactions.
        raw_version = data.get("version", "0x0")
        version = fields.TransactionVersionField.load_value(raw_version)

        if is_deprecated_tx(raw_tx_type=raw_tx_type, version=version):
            data.pop(self.type_field)
            return f"DEPRECATED_{raw_tx_type}"

        return super().get_data_type(data=data)

    def _dump(self, obj, *, update_fields=True, **kwargs):
        result = super()._dump(obj, update_fields=update_fields, **kwargs)
        if result is not None:
            type_value: str = result[self.type_field]
            if type_value.startswith("DEPRECATED_"):
                result[self.type_field] = type_value[len("DEPRECATED_") :]

        return result

    def _load(self, data, *, partial=None, unknown=None, **kwargs):
        version = int(data["version"], 16)
        type_value: str = data[self.type_field]

        if is_deprecated_tx(raw_tx_type=type_value, version=version):
            data[self.type_field] = f"DEPRECATED_{type_value}"

        return super()._load(data, partial=partial, unknown=unknown, **kwargs)


class AccountTransactionSpecificInfoSchema(BaseTransactionSpecificInfoSchema):
    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        TransactionType.DECLARE.name: DeclareSpecificInfo.Schema,
        TransactionType.DEPLOY_ACCOUNT.name: DeployAccountSpecificInfo.Schema,
        TransactionType.INVOKE_FUNCTION.name: InvokeSpecificInfo.Schema,
    }


class DeprecatedTransactionSpecificInfoSchema(BaseTransactionSpecificInfoSchema):
    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        DEPRECATED_DECLARE_SCHEMA_NAME: DeprecatedDeclareSpecificInfo.Schema,
        DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME: DeprecatedDeployAccountSpecificInfo.Schema,
        DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME: DeprecatedInvokeSpecificInfo.Schema,
        TransactionType.DEPLOY.name: DeploySpecificInfo.Schema,
        TransactionType.L1_HANDLER.name: L1HandlerSpecificInfo.Schema,
    }


class TransactionSpecificInfoSchema(BaseTransactionSpecificInfoSchema):
    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        **AccountTransactionSpecificInfoSchema.type_schemas,
        **DeprecatedTransactionSpecificInfoSchema.type_schemas,
    }

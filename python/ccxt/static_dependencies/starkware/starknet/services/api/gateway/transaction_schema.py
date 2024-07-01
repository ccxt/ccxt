from typing import Any, Dict, Type, cast

import marshmallow
import marshmallow.decorators
import marshmallow.exceptions
from marshmallow_oneofschema import OneOfSchema

from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.transaction_type import (
    DEPRECATED_DECLARE_SCHEMA_NAME,
    DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME,
    DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME,
    DEPRECATED_OLD_DECLARE_SCHEMA_NAME,
    TransactionType,
)
from starkware.starknet.services.api.gateway.account_transaction import (
    Declare,
    DeployAccount,
    InvokeFunction,
)
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    Deploy,
    DeprecatedDeclare,
    DeprecatedDeployAccount,
    DeprecatedInvokeFunction,
    DeprecatedOldDeclare,
)
from starkware.starknet.services.api.gateway.transaction import Transaction
from starkware.starknet.services.api.gateway.transaction_utils import is_deprecated_tx


class BaseTransactionSchema(OneOfSchema):
    """
    Represents the base class of Starknet transaction marshmallow schema class.
    Contains custom logic of selecting the appropriate transaction class to de/serialize from/into.

    Note that externally there are four transaction types, even though internally there are more.
    Hence, we need to manually “wire” the given transaction data to the corresponding type.
    """

    def get_obj_type(self, obj: Transaction) -> str:
        """
        Returns the name of key of type-to-schema mapping,
        which will be used while loading the object currently dumped.
        """
        if (
            obj.tx_type is TransactionType.DECLARE
            and obj.version in constants.DEPRECATED_OLD_DECLARE_VERSIONS
        ):
            return DEPRECATED_OLD_DECLARE_SCHEMA_NAME

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

        if (
            raw_tx_type == TransactionType.DECLARE.name
            and version in constants.DEPRECATED_OLD_DECLARE_VERSIONS
        ):
            data.pop(self.type_field)
            return DEPRECATED_OLD_DECLARE_SCHEMA_NAME

        if is_deprecated_tx(raw_tx_type=raw_tx_type, version=version):
            data.pop(self.type_field)
            return f"DEPRECATED_{raw_tx_type}"

        return super().get_data_type(data=data)


class DeprecatedAccountTransactionSchema(BaseTransactionSchema):
    """
    Schema for account transaction.
    OneOfSchema adds a "type" field.
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        DEPRECATED_DECLARE_SCHEMA_NAME: DeprecatedDeclare.Schema,
        DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME: DeprecatedDeployAccount.Schema,
        DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME: DeprecatedInvokeFunction.Schema,
        DEPRECATED_OLD_DECLARE_SCHEMA_NAME: DeprecatedOldDeclare.Schema,
    }


class DeprecatedTransactionSchema(BaseTransactionSchema):
    """
    Schema for transaction.
    OneOfSchema adds a "type" field.

    Allows the use of load/dump of different transaction type data uniformally via this class
    (e.g., `DeprecatedTransactionSchema().load(invoke_function_dict)`, where
    {"type": "INVOKE_FUNCTION"} is in `invoke_function_dict`, will produce a
    `DeprecatedInvokeFunction` object).
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        **DeprecatedAccountTransactionSchema.type_schemas,
        TransactionType.DEPLOY.name: Deploy.Schema,
    }


class AccountTransactionSchema(BaseTransactionSchema):
    """
    Schema for account transaction.
    OneOfSchema adds a "type" field.
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        TransactionType.DECLARE.name: Declare.Schema,
        TransactionType.DEPLOY_ACCOUNT.name: DeployAccount.Schema,
        TransactionType.INVOKE_FUNCTION.name: InvokeFunction.Schema,
    }


class TransactionSchema(BaseTransactionSchema):
    """
    Schema for transaction.
    OneOfSchema adds a "type" field.

    Allows the use of load/dump of different transaction type data uniformally via this class
    (e.g., `DeprecatedTransactionSchema().load(invoke_function_dict)`, where
    {"type": "INVOKE_FUNCTION"} is in `invoke_function_dict`, will produce a
    `DeprecatedInvokeFunction` object).
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        **AccountTransactionSchema.type_schemas,
        **DeprecatedTransactionSchema.type_schemas,
    }

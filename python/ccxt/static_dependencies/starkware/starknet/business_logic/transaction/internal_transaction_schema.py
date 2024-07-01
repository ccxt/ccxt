from typing import Any, Dict, Type, cast

import marshmallow
import marshmallow.fields as mfields
from marshmallow_oneofschema import OneOfSchema

from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalDeclare,
    DeprecatedInternalDeployAccount,
    DeprecatedInternalInvokeFunction,
    InitializeBlockInfo,
    InternalDeploy,
    InternalL1Handler,
    SyntheticTransaction,
)
from starkware.starknet.business_logic.transaction.internal_account_transaction import (
    InternalDeclare,
    InternalDeployAccount,
    InternalInvokeFunction,
)
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.transaction_type import (
    DEPRECATED_DECLARE_SCHEMA_NAME,
    DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME,
    DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME,
    TransactionType,
)
from starkware.starknet.services.api.gateway.transaction_utils import (
    DEPRECATED_TX_TYPES_FOR_SCHEMA,
    is_deprecated_tx,
)
from starkware.starkware_utils.marshmallow_dataclass_fields import additional_metadata


class BaseInternalTransactionSchema(OneOfSchema):
    """
    Represents the base class of Starknet internal transaction marshmallow schema class.
    Contains custom logic of selecting the appropriate transaction class to de/serialize from/into.

    Note that externally there are four transaction types, even though internally there are more.
    Hence, we need to manually “wire” the given transaction data to the corresponding type.
    """

    def get_obj_type(self, obj: InternalTransaction) -> str:
        """
        Returns the name of key of type-to-schema mapping,
        which will be used while loading the object currently dumped.
        """
        obj_type = obj.tx_type.name

        if obj_type in DEPRECATED_TX_TYPES_FOR_SCHEMA and type(obj).__name__.startswith(
            "Deprecated"
        ):
            return f"DEPRECATED_{obj_type}"

        return obj_type

    def get_data_type(self, data: Dict[str, Any]) -> str:
        """
        Returns the name of key of type-to-schema mapping,
        for the raw data currently being loaded into an object.
        """
        raw_tx_type = cast(str, data.get(self.type_field))

        # Version field may be missing in old transactions.
        raw_version = data.get("version", "0x0")
        version = fields.TransactionVersionField.load_value(value=raw_version)

        if (
            raw_tx_type == TransactionType.INVOKE_FUNCTION.name
            and data.get("entry_point_type") == TransactionType.L1_HANDLER.name
        ):
            data.pop(self.type_field)
            return TransactionType.L1_HANDLER.name

        if is_deprecated_tx(raw_tx_type=raw_tx_type, version=version):
            data.pop(self.type_field)
            return f"DEPRECATED_{raw_tx_type}"

        return super().get_data_type(data=data)


class DeprecatedInternalTransactionSchema(BaseInternalTransactionSchema):
    """
    Schema for transaction.
    OneOfSchema adds a "type" field.

    Allows the use of load / dump of different transaction type data directly via the
    `DeprecatedInternalTransaction` class (e.g.,
    `DeprecatedInternalTransaction.load(invoke_function_dict)`,
    where {"type": "INVOKE_FUNCTION"} is in `invoke_function_dict`, will produce a
    `DeprecatedInternalInvokeFunction` object).
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        DEPRECATED_DECLARE_SCHEMA_NAME: DeprecatedInternalDeclare.Schema,
        DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME: DeprecatedInternalDeployAccount.Schema,
        DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME: DeprecatedInternalInvokeFunction.Schema,
        TransactionType.DEPLOY.name: InternalDeploy.Schema,
        TransactionType.L1_HANDLER.name: InternalL1Handler.Schema,
    }


class SyntheticTransactionSchema(OneOfSchema):
    """
    Schema for synthetic transaction.
    OneOfSchema adds a "type" field.

    Allows the use of load / dump of different transaction type data directly via the
    DeprecatedTransaction class.
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        TransactionType.INITIALIZE_BLOCK_INFO.name: InitializeBlockInfo.Schema
    }

    def get_obj_type(self, obj: SyntheticTransaction) -> str:
        return obj.tx_type.name


class InternalAccountTransactionSchema(BaseInternalTransactionSchema):

    """
    Schema for transaction.
    OneOfSchema adds a "type" field.

    Allows the use of load / dump of different transaction type data directly via the
    `InternalAccountTransaction` class (e.g.,
    `InternalAccountTransaction.load(invoke_function_dict)`,
    where {"type": "INVOKE_FUNCTION"} is in `invoke_function_dict`, will produce a
    `InternalInvokeFunction` object).
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        TransactionType.DECLARE.name: InternalDeclare.Schema,
        TransactionType.DEPLOY_ACCOUNT.name: InternalDeployAccount.Schema,
        TransactionType.INVOKE_FUNCTION.name: InternalInvokeFunction.Schema,
    }


class InternalTransactionSchema(BaseInternalTransactionSchema):

    """
    Schema for transaction.
    OneOfSchema adds a "type" field.

    Allows the use of load / dump of different transaction type data directly via the
    `InternalAccountTransaction` class (e.g.,
    `InternalAccountTransaction.load(invoke_function_dict)`,
    where {"type": "INVOKE_FUNCTION"} is in `invoke_function_dict`, will produce a
    `InternalInvokeFunction` object).
    """

    type_schemas: Dict[str, Type[marshmallow.Schema]] = {
        **DeprecatedInternalTransactionSchema.type_schemas,
        **InternalAccountTransactionSchema.type_schemas,
    }


# Marshmallow fields metadata.

internal_transaction_metadata = additional_metadata(
    marshmallow_field=mfields.Nested(InternalTransactionSchema)
)
synthetic_transaction_metadata = additional_metadata(
    marshmallow_field=mfields.Nested(SyntheticTransactionSchema)
)

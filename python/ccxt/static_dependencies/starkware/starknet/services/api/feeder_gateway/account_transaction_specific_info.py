from dataclasses import field
from typing import ClassVar, List

import marshmallow_dataclass

from starkware.starknet.business_logic.transaction.internal_account_transaction import (
    InternalDeclare,
    InternalDeployAccount,
    InternalInvokeFunction,
)
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.services.api.feeder_gateway.transaction_specific_info import (
    TransactionSpecificInfo,
)


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@marshmallow_dataclass.dataclass(frozen=True)  # type: ignore[misc]
class AccountTransactionSpecificInfo(TransactionSpecificInfo):
    """
    See the external transaction class for fields documentation.
    """

    signature: List[int] = field(metadata=fields.signature_metadata)
    nonce: int = field(metadata=fields.nonce_metadata)
    nonce_data_availability_mode: int = field(metadata=fields.data_availability_mode_metadata)
    fee_data_availability_mode: int = field(metadata=fields.data_availability_mode_metadata)
    resource_bounds: fields.ResourceBoundsMapping = field(
        metadata=fields.resource_bounds_mapping_metadata
    )
    tip: int = field(metadata=fields.tip_metadata)
    paymaster_data: List[int] = field(metadata=fields.paymaster_data_metadata)
    sender_address: int = field(metadata=fields.contract_address_metadata)

    @property
    def account_contract_address(self) -> int:
        """
        The address of the account contract initiating this transaction.
        """
        return self.sender_address

    @classmethod
    def from_internal(cls, internal_tx: InternalTransaction) -> "TransactionSpecificInfo":
        if isinstance(internal_tx, InternalDeclare):
            return DeclareSpecificInfo.from_internal_declare(internal_tx=internal_tx)
        elif isinstance(internal_tx, InternalDeployAccount):
            return DeployAccountSpecificInfo.from_internal_deploy_account(internal_tx=internal_tx)
        elif isinstance(internal_tx, InternalInvokeFunction):
            return InvokeSpecificInfo.from_internal_invoke(internal_tx=internal_tx)
        else:
            raise NotImplementedError(f"No response object for {internal_tx}.")


@marshmallow_dataclass.dataclass(frozen=True)
class DeclareSpecificInfo(AccountTransactionSpecificInfo):
    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    compiled_class_hash: int = field(metadata=fields.compiled_class_hash_metadata)
    account_deployment_data: List[int] = field(metadata=fields.account_deployment_data_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE

    @classmethod
    def from_internal_declare(cls, internal_tx: InternalDeclare) -> "DeclareSpecificInfo":
        return cls(
            version=internal_tx.version,
            transaction_hash=internal_tx.hash_value,
            signature=internal_tx.signature,
            nonce=internal_tx.nonce,
            nonce_data_availability_mode=internal_tx.nonce_data_availability_mode,
            fee_data_availability_mode=internal_tx.fee_data_availability_mode,
            resource_bounds=internal_tx.resource_bounds,
            tip=internal_tx.tip,
            paymaster_data=internal_tx.paymaster_data,
            class_hash=internal_tx.class_hash,
            compiled_class_hash=internal_tx.compiled_class_hash,
            account_deployment_data=internal_tx.account_deployment_data,
            sender_address=internal_tx.sender_address,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeployAccountSpecificInfo(AccountTransactionSpecificInfo):
    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    constructor_calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY_ACCOUNT

    @classmethod
    def from_internal_deploy_account(
        cls, internal_tx: InternalDeployAccount
    ) -> "DeployAccountSpecificInfo":
        return cls(
            version=internal_tx.version,
            transaction_hash=internal_tx.hash_value,
            signature=internal_tx.signature,
            nonce=internal_tx.nonce,
            nonce_data_availability_mode=internal_tx.nonce_data_availability_mode,
            fee_data_availability_mode=internal_tx.fee_data_availability_mode,
            resource_bounds=internal_tx.resource_bounds,
            tip=internal_tx.tip,
            paymaster_data=internal_tx.paymaster_data,
            sender_address=internal_tx.sender_address,
            contract_address_salt=internal_tx.contract_address_salt,
            class_hash=internal_tx.class_hash,
            constructor_calldata=internal_tx.constructor_calldata,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class InvokeSpecificInfo(AccountTransactionSpecificInfo):
    calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)
    account_deployment_data: List[int] = field(metadata=fields.account_deployment_data_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.INVOKE_FUNCTION

    @classmethod
    def from_internal_invoke(cls, internal_tx: InternalInvokeFunction) -> "InvokeSpecificInfo":
        return cls(
            version=internal_tx.version,
            transaction_hash=internal_tx.hash_value,
            signature=internal_tx.signature,
            nonce=internal_tx.nonce,
            nonce_data_availability_mode=internal_tx.nonce_data_availability_mode,
            fee_data_availability_mode=internal_tx.fee_data_availability_mode,
            resource_bounds=internal_tx.resource_bounds,
            tip=internal_tx.tip,
            paymaster_data=internal_tx.paymaster_data,
            sender_address=internal_tx.sender_address,
            calldata=internal_tx.calldata,
            account_deployment_data=internal_tx.account_deployment_data,
        )

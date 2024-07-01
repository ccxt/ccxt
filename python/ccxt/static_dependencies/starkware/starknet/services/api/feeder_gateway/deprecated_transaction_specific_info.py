from abc import abstractmethod
from dataclasses import field
from typing import Any, ClassVar, Dict, List, Optional

import marshmallow_dataclass
from marshmallow.decorators import post_dump, pre_load

from starkware.python.utils import as_non_optional, from_bytes
from starkware.starknet.business_logic.transaction.deprecated_objects import (
    DeprecatedInternalDeclare,
    DeprecatedInternalDeployAccount,
    DeprecatedInternalInvokeFunction,
    DeprecatedInternalTransaction,
    InternalDeploy,
    InternalL1Handler,
)
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starknet.services.api.feeder_gateway.transaction_specific_info import (
    TransactionSpecificInfo,
)
from starkware.starknet.services.api.gateway.transaction_utils import (
    rename_contract_address_to_sender_address_pre_load,
)


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedTransactionSpecificInfo(TransactionSpecificInfo):
    # Version; the version field's metadata overrides the metadata of this field in the base class.
    version: int = field(metadata=fields.non_required_tx_version_metadata)

    @classmethod
    def from_internal(
        cls, internal_tx: DeprecatedInternalTransaction
    ) -> "DeprecatedTransactionSpecificInfo":
        if isinstance(internal_tx, DeprecatedInternalDeclare):
            return DeprecatedDeclareSpecificInfo.from_internal_declare(internal_tx=internal_tx)
        elif isinstance(internal_tx, InternalDeploy):
            return DeploySpecificInfo.from_internal_deploy(internal_tx=internal_tx)
        elif isinstance(internal_tx, DeprecatedInternalDeployAccount):
            return DeprecatedDeployAccountSpecificInfo.from_internal_deploy_account(
                internal_tx=internal_tx
            )
        elif isinstance(internal_tx, DeprecatedInternalInvokeFunction):
            if internal_tx.entry_point_type is EntryPointType.L1_HANDLER:
                return L1HandlerSpecificInfo.from_internal_invoke(internal_tx=internal_tx)
            assert (
                internal_tx.entry_point_type is EntryPointType.EXTERNAL
            ), "An invoke transaction must have EXTERNAL entry point type."
            return DeprecatedInvokeSpecificInfo.from_internal_invoke(internal_tx=internal_tx)
        elif isinstance(internal_tx, InternalL1Handler):
            return L1HandlerSpecificInfo.from_internal_l1_handler(internal_tx=internal_tx)
        else:
            raise NotImplementedError(f"No response object for {internal_tx}.")


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@marshmallow_dataclass.dataclass(frozen=True)  # type: ignore[misc]
class DeprecatedAccountTransactionSpecificInfo(DeprecatedTransactionSpecificInfo):
    max_fee: int = field(metadata=fields.fee_metadata)
    signature: List[int] = field(metadata=fields.deprecated_signature_metadata)
    nonce: Optional[int] = field(metadata=fields.optional_nonce_metadata)

    @property
    @abstractmethod
    def account_contract_address(self) -> int:
        """
        The address of the account contract initiating this transaction.
        """


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedDeclareSpecificInfo(DeprecatedAccountTransactionSpecificInfo):
    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    compiled_class_hash: Optional[int] = field(
        metadata=fields.optional_compiled_class_hash_metadata
    )
    sender_address: int = field(metadata=fields.contract_address_metadata)
    # Repeat `nonce` to narrow its type to non-optional int.
    nonce: int = field(metadata=fields.nonce_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE

    @property
    def account_contract_address(self) -> int:
        return self.sender_address

    @classmethod
    def from_internal_declare(
        cls, internal_tx: DeprecatedInternalDeclare
    ) -> "DeprecatedDeclareSpecificInfo":
        return cls(
            class_hash=internal_tx.class_hash,
            compiled_class_hash=internal_tx.compiled_class_hash,
            sender_address=internal_tx.sender_address,
            nonce=as_non_optional(internal_tx.nonce),
            max_fee=internal_tx.max_fee,
            version=internal_tx.version,
            transaction_hash=internal_tx.hash_value,
            signature=internal_tx.signature,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeploySpecificInfo(DeprecatedTransactionSpecificInfo):
    contract_address: int = field(metadata=fields.contract_address_metadata)
    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    class_hash: Optional[int] = field(metadata=fields.optional_new_class_hash_metadata)
    constructor_calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY

    @classmethod
    def from_internal_deploy(cls, internal_tx: InternalDeploy) -> "DeploySpecificInfo":
        return cls(
            contract_address=internal_tx.contract_address,
            contract_address_salt=internal_tx.contract_address_salt,
            class_hash=from_bytes(internal_tx.contract_hash),
            constructor_calldata=internal_tx.constructor_calldata,
            version=internal_tx.version,
            transaction_hash=internal_tx.hash_value,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedDeployAccountSpecificInfo(DeprecatedAccountTransactionSpecificInfo):
    contract_address: int = field(metadata=fields.contract_address_metadata)
    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    constructor_calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)
    version: int = field(metadata=fields.tx_version_metadata)
    # Repeat `nonce` to narrow its type to non-optional int.
    nonce: int = field(metadata=fields.nonce_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY_ACCOUNT

    @property
    def account_contract_address(self) -> int:
        return self.contract_address

    @classmethod
    def from_internal_deploy_account(
        cls, internal_tx: DeprecatedInternalDeployAccount
    ) -> "DeprecatedDeployAccountSpecificInfo":
        return cls(
            # Currently, we keep the old field name `contract_address` in the response object to not
            # break API.
            contract_address=internal_tx.sender_address,
            contract_address_salt=internal_tx.contract_address_salt,
            class_hash=internal_tx.class_hash,
            constructor_calldata=internal_tx.constructor_calldata,
            nonce=internal_tx.nonce,
            max_fee=internal_tx.max_fee,
            version=internal_tx.version,
            transaction_hash=internal_tx.hash_value,
            signature=internal_tx.signature,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedInvokeSpecificInfo(DeprecatedAccountTransactionSpecificInfo):
    sender_address: int = field(metadata=fields.contract_address_metadata)
    entry_point_selector: Optional[int] = field(
        metadata=fields.optional_entry_point_selector_metadata
    )
    calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.INVOKE_FUNCTION

    @property
    def account_contract_address(self) -> int:
        return self.sender_address

    @pre_load
    def remove_entry_point_type_and_make_selector_optional(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, List[str]]:
        if "entry_point_type" in data:
            del data["entry_point_type"]

        # Version field may be missing in old transactions.
        raw_version = data.get("version", "0x0")
        version = fields.TransactionVersionField.load_value(raw_version)
        if version != 0:
            data["entry_point_selector"] = None
        return data

    @pre_load
    def rename_contract_address_to_sender_address(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, List[str]]:
        return rename_contract_address_to_sender_address_pre_load(data=data)

    @post_dump
    def rename_sender_address_for_old_versions(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        version = fields.TransactionVersionField.load_value(data["version"])
        if version == 0 and "sender_address" in data:
            assert "contract_address" not in data
            data["contract_address"] = data.pop("sender_address")
        return data

    @classmethod
    def from_internal_invoke(
        cls, internal_tx: DeprecatedInternalInvokeFunction
    ) -> "DeprecatedInvokeSpecificInfo":
        return cls(
            sender_address=internal_tx.sender_address,
            entry_point_selector=(
                None if internal_tx.version != 0 else internal_tx.entry_point_selector
            ),
            nonce=internal_tx.nonce,
            calldata=internal_tx.calldata,
            version=internal_tx.version,
            signature=internal_tx.signature,
            transaction_hash=internal_tx.hash_value,
            max_fee=internal_tx.max_fee,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class L1HandlerSpecificInfo(DeprecatedTransactionSpecificInfo):
    contract_address: int = field(metadata=fields.contract_address_metadata)
    entry_point_selector: int = field(metadata=fields.entry_point_selector_metadata)
    nonce: Optional[int] = field(metadata=fields.optional_nonce_metadata)
    calldata: List[int] = field(metadata=fields.calldata_as_hex_metadata)

    tx_type: ClassVar[TransactionType] = TransactionType.L1_HANDLER

    @classmethod
    def from_internal_l1_handler(cls, internal_tx: InternalL1Handler) -> "L1HandlerSpecificInfo":
        return cls(
            contract_address=internal_tx.contract_address,
            entry_point_selector=internal_tx.entry_point_selector,
            nonce=internal_tx.nonce,
            calldata=internal_tx.calldata,
            version=constants.L1_HANDLER_VERSION,
            transaction_hash=internal_tx.hash_value,
        )

    @classmethod
    def from_internal_invoke(
        cls, internal_tx: DeprecatedInternalInvokeFunction
    ) -> "L1HandlerSpecificInfo":
        assert (
            internal_tx.entry_point_type is EntryPointType.L1_HANDLER
        ), "This method only accepts an invoke transaction that represents L1 Handlers."
        return cls(
            contract_address=internal_tx.sender_address,
            entry_point_selector=internal_tx.entry_point_selector,
            nonce=internal_tx.nonce,
            calldata=internal_tx.calldata,
            version=constants.L1_HANDLER_VERSION,
            transaction_hash=internal_tx.hash_value,
        )

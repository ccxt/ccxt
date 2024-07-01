import dataclasses
import json
import logging
from abc import abstractmethod
from dataclasses import field
from typing import Any, ClassVar, Dict, List, Optional, Tuple, Type, cast

import marshmallow
import marshmallow_dataclass

from services.everest.api.gateway.transaction import EverestTransaction
from services.everest.business_logic.state_api import StateProxy
from services.everest.definitions.fields import format_felt_list
from starkware.python.utils import as_non_optional, from_bytes, to_bytes
from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.execute_entry_point import ExecuteEntryPoint
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    ResourcesMapping,
    TransactionExecutionContext,
    TransactionExecutionInfo,
)
from starkware.starknet.business_logic.state.state import UpdatesTrackerState
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.business_logic.state.state_api_objects import BlockInfo
from starkware.starknet.business_logic.transaction.fee import calculate_tx_fee, execute_fee_transfer
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.business_logic.transaction.state_objects import (
    FeeInfo,
    InternalStateTransaction,
)
from starkware.starknet.business_logic.utils import (
    calculate_tx_resources,
    validate_selector_for_fee,
    verify_version,
    write_deprecated_compiled_class_fact,
)
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.deprecated_class_hash import (
    compute_deprecated_class_hash,
)
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    deprecated_calculate_declare_transaction_hash,
    deprecated_calculate_deploy_account_transaction_hash,
    deprecated_calculate_deploy_transaction_hash,
    deprecated_calculate_invoke_transaction_hash,
    deprecated_calculate_l1_handler_transaction_hash,
    deprecated_calculate_old_declare_transaction_hash,
)
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.execution_mode import ExecutionMode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.public import abi as starknet_abi
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClassBase,
    ContractClass,
    DeprecatedCompiledClass,
    EntryPointType,
)
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    DEFAULT_DECLARE_SENDER_ADDRESS,
    Deploy,
    DeprecatedAccountTransaction,
    DeprecatedDeclare,
    DeprecatedDeployAccount,
    DeprecatedInvokeFunction,
    DeprecatedOldDeclare,
    DeprecatedTransaction,
)
from starkware.starknet.services.api.gateway.transaction import Transaction
from starkware.starknet.services.api.gateway.transaction_utils import (
    rename_contract_address_to_sender_address_pre_load,
)
from starkware.starkware_utils.config_base import Config
from starkware.starkware_utils.error_handling import stark_assert, stark_assert_eq
from starkware.storage.storage import FactFetchingContext

logger = logging.getLogger(__name__)


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class DeprecatedInternalTransaction(InternalStateTransaction, InternalTransaction):
    """
    StarkNet deprecated internal transaction base class.
    """

    @classmethod
    def from_external(
        cls, external_tx: EverestTransaction, general_config: Config
    ) -> "DeprecatedInternalTransaction":
        internal_tx = super().from_external(external_tx=external_tx, general_config=general_config)
        return cast(DeprecatedInternalTransaction, internal_tx)

    @classmethod
    @abstractmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "DeprecatedInternalTransaction":
        """
        See base class for documentation.
        Declared here for return type downcast.
        """

    async def apply_state_updates(
        self, state: StateProxy, general_config: Config
    ) -> TransactionExecutionInfo:
        # super().apply_state_updates calls InternalStateTransaction.apply_state_updates
        # that calls self._apply_specific_state_updates and therefore does not return None.
        tx_execution_info = await super().apply_state_updates(
            state=state, general_config=general_config
        )
        assert isinstance(tx_execution_info, TransactionExecutionInfo)
        return tx_execution_info


class SyntheticTransaction(InternalStateTransaction):
    """
    StarkNet synthetic transaction base class.
    These transactions appear in the beginning of a batch,
    and are used to update the state,
    in a way that is not initiated by the user.
    See for example, InitializeBlockInfo.
    """

    @property
    @classmethod
    @abstractmethod
    def tx_type(cls) -> TransactionType:
        """
        Returns the corresponding TransactionType enum. Used in DeprecatedTransactionSchema.
        Subclasses should define it as a class variable.
        """


@marshmallow_dataclass.dataclass(frozen=True)
class InitializeBlockInfo(SyntheticTransaction):
    """
    A synthetic transaction that initializes entire block-related information.
    """

    block_info: BlockInfo
    # A (block number, block hash) pair that should be written to the block number -> block hash
    # mapping. This pair corresponds to the n-th block from the current block, where n is specified
    # in constants.STORED_BLOCK_HASH_BUFFER.
    old_block_number_and_hash: Optional[Tuple[int, int]]
    tx_type: ClassVar[TransactionType] = TransactionType.INITIALIZE_BLOCK_INFO

    def sync_apply_state_updates(self, state: StateProxy, general_config: Config) -> None:
        # Downcast arguments to application-specific types.
        assert isinstance(state, SyncState)

        # Validate progress is legal.
        state.block_info.validate_legal_progress(next_block_info=self.block_info)

        # Update entire block-related information.
        state.update_block_info(block_info=self.block_info)

        # Write block number -> block hash mapping.
        if self.old_block_number_and_hash is not None:
            block_number, block_hash = self.old_block_number_and_hash
            state.set_storage_at(
                data_availability_mode=DataAvailabilityMode.L1,
                contract_address=constants.BLOCK_HASH_CONTRACT_ADDRESS,
                key=block_number,
                value=block_hash,
            )
        return None

    def _apply_specific_sequential_changes(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        actual_resources: ResourcesMapping,
    ) -> FeeInfo:
        raise NotImplementedError(
            f"_apply_specific_sequential_changes is not implemented for {type(self).__name__}."
        )

    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        raise NotImplementedError(
            f"_apply_specific_concurrent_changes is not implemented for {type(self).__name__}."
        )


@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class DeprecatedInternalAccountTransaction(DeprecatedInternalTransaction):
    """
    Represents a transaction that originated from an action of an account.
    """

    # The version of the transaction. It is fixed in the OS, and should be
    # signed by the account contract.
    # This field allows invalidating old transactions, whenever the meaning of the other
    # transaction fields is changed (in the OS).
    version: int = field(metadata=fields.non_required_tx_version_metadata)
    signature: List[int] = field(metadata=fields.deprecated_signature_metadata)
    # The nonce of the transaction, a sequential number attached to the account contract. Guarantees
    # a unique hash_value of transactions.
    nonce: Optional[int] = field(metadata=fields.optional_nonce_metadata)
    # The address of the account contract who sent the transaction.
    sender_address: int = field(metadata=fields.contract_address_metadata)

    # Fee related fields.
    # The maximal fee to be paid in Wei for the execution.
    max_fee: int = field(metadata=fields.fee_metadata)

    # Forbid by default query-version transactions.
    only_query: ClassVar[bool] = False

    @property
    def zero_max_fee(self) -> bool:
        return self.max_fee == 0

    @property
    @abstractmethod
    def validate_entrypoint_calldata(self) -> List[int]:
        """
        The calldata input to the transaction-specific validation function.
        """

    @property
    @classmethod
    @abstractmethod
    def validate_entry_point_selector(cls) -> int:
        """
        The entry point selector of the transaction-specific validation function.
        """

    @abstractmethod
    def to_external(self) -> DeprecatedAccountTransaction:
        """
        Returns an external transaction generated based on an internal one.
        """

    def verify_version(self):
        expected_transaction_version_constant = 1
        assert constants.DEPRECATED_TRANSACTION_VERSION == expected_transaction_version_constant, (
            f"Unexpected constant value. Expected {expected_transaction_version_constant}; "
            f"got {constants.DEPRECATED_TRANSACTION_VERSION}."
        )
        verify_version(
            version=self.version,
            expected_version=constants.DEPRECATED_TRANSACTION_VERSION,
            only_query=self.only_query,
            old_supported_versions=[0],
        )

    def run_validate_entrypoint(
        self,
        remaining_gas: int,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        general_config: StarknetGeneralConfig,
    ) -> Tuple[Optional[CallInfo], int]:
        """
        Runs the transaction-specific validation function.
        """
        if self.version in [0, constants.QUERY_VERSION_BASE]:
            return None, remaining_gas

        call = ExecuteEntryPoint.create(
            contract_address=self.sender_address,
            entry_point_selector=self.validate_entry_point_selector,
            initial_gas=remaining_gas,
            entry_point_type=EntryPointType.EXTERNAL,
            calldata=self.validate_entrypoint_calldata,
            caller_address=0,
        )

        call_info = call.execute(
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
            tx_execution_context=self.get_execution_context(
                n_steps=general_config.validate_max_n_steps, execution_mode=ExecutionMode.VALIDATE
            ),
        )

        class_hash = state.get_class_hash_at(contract_address=self.sender_address)
        compiled_class_hash = state.get_compiled_class_hash(class_hash=class_hash)
        if compiled_class_hash != 0:
            # The account contract class is a Cairo 1.0 contract; the 'validate' entry point
            # should return 'VALID'.
            stark_assert(
                call_info.retdata == constants.VALIDATE_RETDATA,
                code=StarknetErrorCode.INVALID_RETURN_DATA,
                message=(
                    "Invalid 'validate' return values. "
                    f"Expected: {format_felt_list(constants.VALIDATE_RETDATA)}, "
                    f"got: {format_felt_list(call_info.retdata)}."
                ),
            )

        remaining_gas -= call_info.gas_consumed

        return call_info, remaining_gas

    def get_execution_context(
        self, n_steps: int, execution_mode: ExecutionMode
    ) -> TransactionExecutionContext:
        return TransactionExecutionContext.create(
            account_contract_address=self.sender_address,
            transaction_hash=self.hash_value,
            signature=self.signature,
            max_fee=self.max_fee,
            nonce=self.nonce,
            n_steps=n_steps,
            version=self.version,
            execution_mode=execution_mode,
        )

    def charge_fee(
        self, state: SyncState, resources: ResourcesMapping, general_config: StarknetGeneralConfig
    ) -> FeeInfo:
        """
        Calculates and charges the actual fee.
        """
        if self.zero_max_fee:
            # Fee charging is not enforced in some tests.
            return None, 0

        actual_fee = calculate_tx_fee(
            l1_gas_price=state.block_info.l1_gas_price.price_in_wei, resources=resources
        )
        fee_transfer_info = execute_fee_transfer(
            general_config=general_config,
            state=state,
            tx_execution_context=self.get_execution_context(
                n_steps=general_config.invoke_tx_max_n_steps, execution_mode=ExecutionMode.EXECUTE
            ),
            actual_fee=actual_fee,
        )

        return fee_transfer_info, actual_fee

    def _handle_nonce(self, state: SyncState):
        """
        Verifies that the transaction's nonce matches the contract's nonce and increments the
        latter (modifies state).
        """
        # Don't handle nonce for version 0.
        if self.version in [0, constants.QUERY_VERSION_BASE]:
            return

        current_nonce = state.get_nonce_at(
            data_availability_mode=DataAvailabilityMode.L1, contract_address=self.sender_address
        )
        stark_assert(
            current_nonce == self.nonce,
            code=StarknetErrorCode.INVALID_TRANSACTION_NONCE,
            message=f"Invalid transaction nonce. Expected: {current_nonce}, got: {self.nonce}.",
        )

        # Increment nonce.
        # Note that changing contract_state.nonce directly will bypass the proxy used to revert
        # transactions.
        state.increment_nonce(
            data_availability_mode=DataAvailabilityMode.L1, contract_address=self.sender_address
        )

    def _apply_specific_sequential_changes(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        actual_resources: ResourcesMapping,
    ) -> FeeInfo:
        self._handle_nonce(state=state)

        return self.charge_fee(
            state=state, resources=actual_resources, general_config=general_config
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedInternalDeclare(DeprecatedInternalAccountTransaction):
    """
    Represents an internal transaction in the StarkNet network that is a declaration of a Cairo
    contract class.
    """

    # The hash of the declared class.
    class_hash: int = field(metadata=fields.new_class_hash_metadata)
    compiled_class_hash: Optional[int] = field(
        metadata=fields.optional_compiled_class_hash_metadata
    )
    sierra_program_size: int = field(metadata=fields.sierra_program_size_metadata)
    abi_size: int = field(metadata=fields.abi_size_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE
    related_external_cls: ClassVar[Type[DeprecatedTransaction]] = DeprecatedDeclare
    validate_entry_point_selector: ClassVar[
        int
    ] = starknet_abi.VALIDATE_DECLARE_ENTRY_POINT_SELECTOR

    @property
    def validate_entrypoint_calldata(self) -> List[int]:
        # '__validate_declare__' is expected to get one parameter: 'class_hash'.
        return [self.class_hash]

    def verify_version(self):
        expected_declare_version_constant = 2
        assert constants.DEPRECATED_DECLARE_VERSION == expected_declare_version_constant, (
            f"Unexpected constant value. Expected {expected_declare_version_constant}; "
            f"got {constants.DEPRECATED_DECLARE_VERSION}."
        )
        verify_version(
            version=self.version,
            expected_version=constants.DEPRECATED_DECLARE_VERSION,
            only_query=self.only_query,
            old_supported_versions=[0, 1],
        )
        if self.version not in constants.DEPRECATED_OLD_DECLARE_VERSIONS:
            assert (
                self.compiled_class_hash is not None
            ), "The compiled_class_hash field must not be None for Cairo 1.0 declare."
        else:
            assert (
                self.compiled_class_hash is None
            ), "The compiled_class_hash field must be None for deprecated declare."

        if self.version in [0, constants.QUERY_VERSION_BASE]:
            stark_assert_eq(
                DEFAULT_DECLARE_SENDER_ADDRESS,
                self.sender_address,
                code=StarknetErrorCode.OUT_OF_RANGE_CONTRACT_ADDRESS,
                message=(
                    "The sender address field in declare transactions of version 0 "
                    f"must be {DEFAULT_DECLARE_SENDER_ADDRESS}."
                ),
            )
            stark_assert_eq(
                0,
                self.max_fee,
                code=StarknetErrorCode.OUT_OF_RANGE_FEE,
                message="The max fee field in declare transactions of version 0 must be 0.",
            )
            stark_assert_eq(
                0,
                self.nonce,
                code=StarknetErrorCode.OUT_OF_RANGE_NONCE,
                message="The nonce field in declare transactions of version 0 must be 0.",
            )
            stark_assert_eq(
                0,
                len(self.signature),
                code=StarknetErrorCode.NON_EMPTY_SIGNATURE,
                message="The signature field in declare transactions must be an empty list.",
            )

    @classmethod
    def create(
        cls,
        contract_class: ContractClass,
        compiled_class_hash: int,
        chain_id: int,
        sender_address: int,
        max_fee: int,
        version: int,
        signature: List[int],
        nonce: int,
    ):
        class_hash = compute_class_hash(contract_class=contract_class)
        internal_declare = cls(
            class_hash=class_hash,
            compiled_class_hash=compiled_class_hash,
            sierra_program_size=contract_class.get_bytecode_size(),
            abi_size=contract_class.get_abi_size(),
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            signature=signature,
            nonce=nonce,
            hash_value=deprecated_calculate_declare_transaction_hash(
                contract_class=contract_class,
                compiled_class_hash=compiled_class_hash,
                chain_id=chain_id,
                sender_address=sender_address,
                max_fee=max_fee,
                version=version,
                nonce=nonce,
            ),
        )
        internal_declare.verify_version()
        return internal_declare

    @classmethod
    def create_deprecated(
        cls,
        contract_class: DeprecatedCompiledClass,
        chain_id: int,
        sender_address: int,
        max_fee: int,
        version: int,
        signature: List[int],
        nonce: int,
    ):
        class_hash = compute_deprecated_class_hash(contract_class=contract_class)
        abi_size = len(json.dumps(contract_class.abi)) if contract_class.abi is not None else 0
        internal_declare = cls(
            class_hash=class_hash,
            compiled_class_hash=None,
            sierra_program_size=0,
            abi_size=abi_size,
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            signature=signature,
            nonce=nonce,
            hash_value=deprecated_calculate_old_declare_transaction_hash(
                contract_class=contract_class,
                chain_id=chain_id,
                sender_address=sender_address,
                max_fee=max_fee,
                version=version,
                nonce=nonce,
            ),
        )
        internal_declare.verify_version()
        return internal_declare

    @classmethod
    async def create_for_testing(
        cls,
        ffc: FactFetchingContext,
        contract_class: DeprecatedCompiledClass,
        sender_address: int,
        chain_id: Optional[int] = None,
        max_fee: int = 0,
        version: int = constants.DEPRECATED_TRANSACTION_VERSION,
        signature: Optional[List[int]] = None,
        nonce: int = 0,
    ) -> "DeprecatedInternalDeclare":
        """
        Creates a declare transaction and writes its contract class to the DB.
        This constructor should only be used in tests.
        """
        await write_deprecated_compiled_class_fact(
            deprecated_compiled_class=contract_class, ffc=ffc
        )
        return DeprecatedInternalDeclare.create_deprecated(
            contract_class=contract_class,
            chain_id=0 if chain_id is None else chain_id,
            sender_address=sender_address,
            max_fee=max_fee,
            version=version,
            signature=[] if signature is None else signature,
            nonce=nonce,
        )

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "DeprecatedInternalDeclare":
        if isinstance(external_tx, DeprecatedOldDeclare):
            return cls.create_deprecated(
                contract_class=external_tx.contract_class,
                chain_id=general_config.chain_id.value,
                sender_address=external_tx.sender_address,
                max_fee=external_tx.max_fee,
                version=external_tx.version,
                signature=external_tx.signature,
                nonce=external_tx.nonce,
            )

        assert isinstance(external_tx, DeprecatedDeclare)
        return cls.create(
            contract_class=external_tx.contract_class,
            compiled_class_hash=external_tx.compiled_class_hash,
            chain_id=general_config.chain_id.value,
            sender_address=external_tx.sender_address,
            max_fee=external_tx.max_fee,
            version=external_tx.version,
            signature=external_tx.signature,
            nonce=external_tx.nonce,
        )

    def to_external(self) -> DeprecatedOldDeclare:
        raise NotImplementedError("Cannot convert internal declare transaction to external object.")

    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        # Reject unsupported versions. This is necessary (in addition to the gateway's check)
        # since an old transaction might still reach here, e.g., in case of a re-org.
        self.verify_version()

        # Validate transaction.
        resources_manager = ExecutionResourcesManager.empty()
        validate_info, remaining_gas = self.run_validate_entrypoint(
            remaining_gas=remaining_gas,
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
        )

        # Declare the class by setting the compiled hash under the class hash.
        if self.version not in constants.DEPRECATED_OLD_DECLARE_VERSIONS:
            stark_assert_eq(
                state.get_compiled_class_hash(class_hash=self.class_hash),
                0,
                code=StarknetErrorCode.CLASS_ALREADY_DECLARED,
                message=(
                    f"Class with hash {fields.ClassHashIntField.format(self.class_hash)} "
                    "is already declared."
                ),
            )
            state.set_compiled_class_hash(
                class_hash=self.class_hash,
                compiled_class_hash=as_non_optional(self.compiled_class_hash),
            )

        # Handle fee.
        actual_resources = calculate_tx_resources(
            state=state,
            resources_manager=resources_manager,
            call_infos=[validate_info],
            tx_type=self.tx_type,
            fee_token_address=general_config.deprecated_fee_token_address,
            is_nonce_increment=self.version not in [0, constants.QUERY_VERSION_BASE],
            sender_address=self.sender_address,
        )

        return TransactionExecutionInfo.create_concurrent_stage_execution_info(
            validate_info=validate_info,
            call_info=None,
            actual_resources=actual_resources,
            tx_type=self.tx_type,
            revert_error=None,
        )


# Internal declare is the internal representation of two external classes; register the second one.
# This global assignment is not ideal, but there is no post-class definition hook without inheriting
# from it.
DeprecatedInternalTransaction.external_to_internal_cls[
    DeprecatedOldDeclare
] = DeprecatedInternalDeclare


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedInternalDeployAccount(DeprecatedInternalAccountTransaction):
    """
    Internal version of the deploy account transaction (deployment of StarkNet
    account contracts).
    """

    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    class_hash: int = field(metadata=fields.new_class_hash_metadata)
    constructor_calldata: List[int] = field(metadata=fields.calldata_metadata)
    version: int = field(metadata=fields.tx_version_metadata)
    # Repeat `nonce` to narrow its type to non-optional int.
    nonce: int = field(metadata=fields.nonce_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY_ACCOUNT
    related_external_cls: ClassVar[Type[DeprecatedTransaction]] = DeprecatedDeployAccount
    validate_entry_point_selector: ClassVar[int] = starknet_abi.VALIDATE_DEPLOY_ENTRY_POINT_SELECTOR

    @property
    def validate_entrypoint_calldata(self) -> List[int]:
        # '__validate_deploy__' is expected to get the arguments:
        # class_hash, salt, constructor_calldata.
        return [
            self.class_hash,
            self.contract_address_salt,
            *self.constructor_calldata,
        ]

    @marshmallow.decorators.pre_load
    def rename_contract_address_to_sender_address(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        return rename_contract_address_to_sender_address_pre_load(data=data)

    def verify_version(self):
        verify_version(
            version=self.version,
            expected_version=constants.DEPRECATED_TRANSACTION_VERSION,
            only_query=self.only_query,
            old_supported_versions=[],
        )

    @classmethod
    def create(
        cls,
        class_hash: int,
        max_fee: int,
        version: int,
        nonce: int,
        constructor_calldata: List[int],
        signature: List[int],
        contract_address_salt: int,
        chain_id: int,
    ) -> "DeprecatedInternalDeployAccount":
        contract_address = calculate_contract_address_from_hash(
            salt=contract_address_salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=0,
        )
        internal_deploy_account = cls(
            sender_address=contract_address,
            contract_address_salt=contract_address_salt,
            constructor_calldata=constructor_calldata,
            class_hash=class_hash,
            version=version,
            max_fee=max_fee,
            signature=signature,
            nonce=nonce,
            hash_value=deprecated_calculate_deploy_account_transaction_hash(
                version=version,
                contract_address=contract_address,
                class_hash=class_hash,
                constructor_calldata=constructor_calldata,
                max_fee=max_fee,
                nonce=nonce,
                salt=contract_address_salt,
                chain_id=chain_id,
            ),
        )
        internal_deploy_account.verify_version()
        return internal_deploy_account

    @classmethod
    def create_for_testing(
        cls,
        contract_class: DeprecatedCompiledClass,
        max_fee: int,
        contract_address_salt: int = 0,
        constructor_calldata: Optional[List[int]] = None,
        chain_id: int = 0,
        signature: Optional[List[int]] = None,
    ) -> "DeprecatedInternalDeployAccount":
        return DeprecatedInternalDeployAccount.create(
            class_hash=compute_deprecated_class_hash(contract_class=contract_class),
            contract_address_salt=contract_address_salt,
            constructor_calldata=[] if constructor_calldata is None else constructor_calldata,
            nonce=0,
            max_fee=max_fee,
            version=constants.DEPRECATED_TRANSACTION_VERSION,
            signature=[] if signature is None else signature,
            chain_id=chain_id,
        )

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "DeprecatedInternalDeployAccount":
        assert isinstance(external_tx, DeprecatedDeployAccount)
        return cls.create(
            class_hash=external_tx.class_hash,
            max_fee=external_tx.max_fee,
            version=external_tx.version,
            nonce=external_tx.nonce,
            constructor_calldata=external_tx.constructor_calldata,
            signature=external_tx.signature,
            contract_address_salt=external_tx.contract_address_salt,
            chain_id=general_config.chain_id.value,
        )

    def to_external(self) -> DeprecatedDeployAccount:
        return DeprecatedDeployAccount(
            version=self.version,
            max_fee=self.max_fee,
            signature=self.signature,
            nonce=self.nonce,
            contract_address_salt=self.contract_address_salt,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
        )

    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        """
        Adds the deployed contract to the global commitment tree state.
        """
        # Reject unsupported versions. This is necessary (in addition to the gateway's check)
        # since an old transaction might still reach here, e.g., in case of a re-org.
        self.verify_version()

        # Ensure the class is declared (by reading it).
        contract_class = state.get_compiled_class_by_class_hash(class_hash=self.class_hash)

        # Deploy.
        state.deploy_contract(contract_address=self.sender_address, class_hash=self.class_hash)

        # Run the constructor.
        resources_manager = ExecutionResourcesManager.empty()
        constructor_call_info, remaining_gas = self.handle_constructor(
            remaining_gas=remaining_gas,
            contract_class=contract_class,
            state=state,
            general_config=general_config,
            resources_manager=resources_manager,
        )

        # Validate transaction.
        validate_info, remaining_gas = self.run_validate_entrypoint(
            remaining_gas=remaining_gas,
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
        )

        actual_resources = calculate_tx_resources(
            state=state,
            resources_manager=resources_manager,
            call_infos=[constructor_call_info, validate_info],
            tx_type=self.tx_type,
            fee_token_address=general_config.deprecated_fee_token_address,
            is_nonce_increment=True,
            sender_address=self.sender_address,
        )

        return TransactionExecutionInfo.create_concurrent_stage_execution_info(
            validate_info=validate_info,
            call_info=constructor_call_info,
            actual_resources=actual_resources,
            tx_type=self.tx_type,
            revert_error=None,
        )

    def handle_constructor(
        self,
        remaining_gas: int,
        contract_class: CompiledClassBase,
        state: UpdatesTrackerState,
        general_config: StarknetGeneralConfig,
        resources_manager: ExecutionResourcesManager,
    ) -> Tuple[CallInfo, int]:
        n_ctors = len(contract_class.entry_points_by_type[EntryPointType.CONSTRUCTOR])
        if n_ctors == 0:
            stark_assert(
                len(self.constructor_calldata) == 0,
                code=StarknetErrorCode.TRANSACTION_FAILED,
                message="Cannot pass calldata to a contract with no constructor.",
            )
            call_info = CallInfo.empty_constructor_call(
                contract_address=self.sender_address,
                caller_address=0,
                class_hash=self.class_hash,
            )
        else:
            call_info = self.run_constructor_entrypoint(
                remaining_gas=remaining_gas,
                state=state,
                general_config=general_config,
                resources_manager=resources_manager,
            )

        remaining_gas -= call_info.gas_consumed
        return call_info, remaining_gas

    def run_constructor_entrypoint(
        self,
        remaining_gas: int,
        state: UpdatesTrackerState,
        general_config: StarknetGeneralConfig,
        resources_manager: ExecutionResourcesManager,
    ) -> CallInfo:
        call = ExecuteEntryPoint.create(
            contract_address=self.sender_address,
            entry_point_selector=starknet_abi.CONSTRUCTOR_ENTRY_POINT_SELECTOR,
            initial_gas=remaining_gas,
            entry_point_type=EntryPointType.CONSTRUCTOR,
            calldata=self.constructor_calldata,
            caller_address=0,
        )
        constructor_call_info = call.execute(
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
            tx_execution_context=self.get_execution_context(
                n_steps=general_config.validate_max_n_steps, execution_mode=ExecutionMode.VALIDATE
            ),
        )

        return constructor_call_info


@marshmallow_dataclass.dataclass(frozen=True)
class InternalDeploy(DeprecatedInternalTransaction):
    """
    Represents an internal transaction in the StarkNet network that is a deployment of a Cairo
    contract.
    """

    # The version of the transaction. It is fixed (currently, 1) in the OS, and should be
    # signed by the account contract.
    # This field allows invalidating old transactions, whenever the meaning of the other
    # transaction fields is changed (in the OS).
    version: int = field(metadata=fields.non_required_tx_version_metadata)
    contract_address: int = field(metadata=fields.contract_address_metadata)
    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    # The member 'contract_hash' is of type 'bytes' for backward compatibility. Whenever this field
    # is accessed as an integer, the property 'class_hash' is used.
    contract_hash: bytes = field(metadata=fields.non_required_class_hash_metadata)

    constructor_calldata: List[int] = field(metadata=fields.calldata_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY
    related_external_cls: ClassVar[Type[DeprecatedTransaction]] = Deploy

    @marshmallow.decorators.pre_load
    def replace_contract_definition_with_contract_hash(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        if "contract_hash" in data:
            return data

        contract_definition_json = data.pop("contract_definition")
        contract_definition = DeprecatedCompiledClass.load(data=contract_definition_json)
        class_hash = compute_deprecated_class_hash(contract_class=contract_definition)
        data["contract_hash"] = to_bytes(class_hash).hex()

        return data

    @classmethod
    def create(
        cls,
        contract_address_salt: int,
        contract_class: DeprecatedCompiledClass,
        constructor_calldata: List[int],
        chain_id: int,
        version: int,
    ):
        verify_version(
            version=version,
            expected_version=constants.DEPRECATED_TRANSACTION_VERSION,
            only_query=False,
            old_supported_versions=[0],
        )

        class_hash = compute_deprecated_class_hash(contract_class=contract_class)
        contract_address = calculate_contract_address_from_hash(
            salt=contract_address_salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=0,
        )
        return cls(
            contract_address=contract_address,
            contract_address_salt=contract_address_salt,
            contract_hash=to_bytes(class_hash),
            constructor_calldata=constructor_calldata,
            version=version,
            hash_value=deprecated_calculate_deploy_transaction_hash(
                version=version,
                contract_address=contract_address,
                constructor_calldata=constructor_calldata,
                chain_id=chain_id,
            ),
        )

    @classmethod
    async def create_for_testing(
        cls,
        ffc: FactFetchingContext,
        contract_class: DeprecatedCompiledClass,
        contract_address_salt: int,
        constructor_calldata: List[int],
        chain_id: Optional[int] = None,
    ) -> "InternalDeploy":
        """
        Creates a deploy transaction and writes its contract class to the DB.
        This constructor should only be used in tests.
        """
        await write_deprecated_compiled_class_fact(
            deprecated_compiled_class=contract_class, ffc=ffc
        )
        return InternalDeploy.create(
            contract_address_salt=contract_address_salt,
            contract_class=contract_class,
            constructor_calldata=constructor_calldata,
            chain_id=0 if chain_id is None else chain_id,
            version=constants.DEPRECATED_TRANSACTION_VERSION,
        )

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "InternalDeploy":
        assert isinstance(external_tx, Deploy)
        return cls.create(
            contract_address_salt=external_tx.contract_address_salt,
            contract_class=external_tx.contract_definition,
            constructor_calldata=external_tx.constructor_calldata,
            chain_id=general_config.chain_id.value,
            version=external_tx.version,
        )

    @property
    def class_hash(self) -> int:
        return from_bytes(self.contract_hash)

    def to_external(self) -> Deploy:
        raise NotImplementedError("Cannot convert internal deploy transaction to external object.")

    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        """
        Adds the deployed contract to the global commitment tree state.
        """
        # Reject unsupported versions. This is necessary (in addition to the gateway's check)
        # since an old transaction might still reach here, e.g., in case of a re-org.
        verify_version(
            version=self.version,
            expected_version=constants.DEPRECATED_TRANSACTION_VERSION,
            only_query=False,
            old_supported_versions=[0],
        )

        # Execute transaction.
        state.deploy_contract(contract_address=self.contract_address, class_hash=self.class_hash)
        contract_class = state.get_compiled_class_by_class_hash(class_hash=self.class_hash)

        n_ctors = len(contract_class.entry_points_by_type[EntryPointType.CONSTRUCTOR])
        if n_ctors == 0:
            return self.handle_empty_constructor(state=state, general_config=general_config)
        else:
            return self.invoke_constructor(
                state=state, general_config=general_config, remaining_gas=remaining_gas
            )

    def _apply_specific_sequential_changes(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        actual_resources: ResourcesMapping,
    ) -> FeeInfo:
        fee_transfer_info, actual_fee = None, 0
        return fee_transfer_info, actual_fee

    def handle_empty_constructor(
        self,
        state: UpdatesTrackerState,
        general_config: StarknetGeneralConfig,
    ) -> TransactionExecutionInfo:
        stark_assert(
            len(self.constructor_calldata) == 0,
            code=StarknetErrorCode.TRANSACTION_FAILED,
            message="Cannot pass calldata to a contract with no constructor.",
        )

        call_info = CallInfo.empty_constructor_call(
            contract_address=self.contract_address,
            caller_address=0,
            class_hash=self.class_hash,
        )
        resources_manager = ExecutionResourcesManager.empty()
        actual_resources = calculate_tx_resources(
            state=state,
            resources_manager=resources_manager,
            call_infos=[call_info],
            tx_type=self.tx_type,
            fee_token_address=general_config.deprecated_fee_token_address,
            is_nonce_increment=False,
            sender_address=None,
        )

        return TransactionExecutionInfo.create_concurrent_stage_execution_info(
            validate_info=None,
            call_info=call_info,
            actual_resources=actual_resources,
            tx_type=self.tx_type,
            revert_error=None,
        )

    def invoke_constructor(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        call = ExecuteEntryPoint.create(
            contract_address=self.contract_address,
            entry_point_selector=starknet_abi.CONSTRUCTOR_ENTRY_POINT_SELECTOR,
            initial_gas=remaining_gas,
            entry_point_type=EntryPointType.CONSTRUCTOR,
            calldata=self.constructor_calldata,
            caller_address=0,
        )
        tx_execution_context = TransactionExecutionContext.create(
            account_contract_address=0,
            transaction_hash=self.hash_value,
            signature=[],
            max_fee=0,
            nonce=0,
            n_steps=general_config.invoke_tx_max_n_steps,
            version=self.version,
            execution_mode=ExecutionMode.EXECUTE,
        )

        resources_manager = ExecutionResourcesManager.empty()
        call_info = call.execute(
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
            tx_execution_context=tx_execution_context,
        )
        actual_resources = calculate_tx_resources(
            state=state,
            resources_manager=resources_manager,
            call_infos=[call_info],
            tx_type=self.tx_type,
            fee_token_address=general_config.deprecated_fee_token_address,
            is_nonce_increment=False,
            sender_address=None,
        )

        return TransactionExecutionInfo.create_concurrent_stage_execution_info(
            validate_info=None,
            call_info=call_info,
            actual_resources=actual_resources,
            tx_type=self.tx_type,
            revert_error=None,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedInternalInvokeFunction(DeprecatedInternalAccountTransaction):
    """
    Represents an internal transaction in the StarkNet network that is an invocation of a Cairo
    contract function.
    """

    entry_point_selector: int = field(metadata=fields.entry_point_selector_metadata)
    # The decorator type of the called function. Note that a single function may be decorated with
    # multiple decorators and this member specifies which one.
    entry_point_type: EntryPointType
    calldata: List[int] = field(metadata=fields.calldata_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.INVOKE_FUNCTION
    related_external_cls: ClassVar[Type[DeprecatedTransaction]] = DeprecatedInvokeFunction
    validate_entry_point_selector: ClassVar[int] = starknet_abi.VALIDATE_ENTRY_POINT_SELECTOR

    @property
    def validate_entrypoint_calldata(self) -> List[int]:
        # '__validate__' is expected to get the same calldata as '__execute__'.
        return self.calldata

    def verify_version(self):
        super().verify_version()

        if self.version not in [0, constants.QUERY_VERSION_BASE]:
            stark_assert_eq(
                self.entry_point_selector,
                starknet_abi.EXECUTE_ENTRY_POINT_SELECTOR,
                code=StarknetErrorCode.UNAUTHORIZED_ENTRY_POINT_FOR_INVOKE,
                message=(
                    "The entry_point_selector field in invoke transactions "
                    f"must be {starknet_abi.EXECUTE_ENTRY_POINT_NAME}."
                ),
            )

    @marshmallow.decorators.pre_load
    def handle_deprecated_fields(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        data = rename_contract_address_to_sender_address_pre_load(data=data)

        if "code_address" in data:
            assert data["code_address"] == data["sender_address"]
            del data["code_address"]

        if "caller_address" in data:
            assert data["caller_address"] == fields.AddressField.format(
                0
            ), "The `caller_address` of an external transaction must be 0."
            del data["caller_address"]

        return data

    @classmethod
    def create_for_testing(
        cls,
        sender_address: int,
        calldata: List[int],
        nonce: int,
        signature: Optional[List[int]] = None,
        max_fee: Optional[int] = None,
        chain_id: Optional[int] = None,
    ):
        return cls.create(
            sender_address=sender_address,
            max_fee=0 if max_fee is None else max_fee,
            version=constants.DEPRECATED_TRANSACTION_VERSION,
            calldata=calldata,
            nonce=nonce,
            signature=[] if signature is None else signature,
            chain_id=0 if chain_id is None else chain_id,
        )

    @classmethod
    def create_wrapped_with_account(
        cls,
        account_address: int,
        contract_address: int,
        calldata: List[int],
        entry_point_selector: int,
        max_fee: int,
        nonce: Optional[int],
        signature: Optional[List[int]] = None,
        chain_id: Optional[int] = None,
        version: Optional[int] = None,
    ):
        """
        Creates an account contract invocation to the 'dummy_account'
        test contract at address 'account_address'; should only be used in tests.
        """

        return cls.create(
            sender_address=account_address,
            max_fee=max_fee,
            entry_point_selector=(
                starknet_abi.EXECUTE_ENTRY_POINT_SELECTOR
                if version in [0, constants.QUERY_VERSION_BASE]
                else None
            ),
            version=constants.DEPRECATED_TRANSACTION_VERSION if version is None else version,
            calldata=[contract_address, entry_point_selector, len(calldata), *calldata],
            nonce=nonce,
            signature=[] if signature is None else signature,
            chain_id=0 if chain_id is None else chain_id,
        )

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "DeprecatedInternalInvokeFunction":
        assert isinstance(external_tx, DeprecatedInvokeFunction)
        validate_selector_for_fee(tx=external_tx)

        return cls.create(
            sender_address=external_tx.sender_address,
            entry_point_selector=external_tx.entry_point_selector,
            max_fee=external_tx.max_fee,
            calldata=external_tx.calldata,
            nonce=external_tx.nonce,
            signature=external_tx.signature,
            chain_id=general_config.chain_id.value,
            version=external_tx.version,
        )

    @classmethod
    def create(
        cls,
        sender_address: int,
        max_fee: int,
        calldata: List[int],
        signature: List[int],
        nonce: Optional[int],
        chain_id: int,
        version: int,
        entry_point_selector: Optional[int] = None,
    ) -> "DeprecatedInternalInvokeFunction":
        hash_value = deprecated_calculate_invoke_transaction_hash(
            version=version,
            sender_address=sender_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            max_fee=max_fee,
            chain_id=chain_id,
            nonce=nonce,
        )

        internal_invoke = cls(
            sender_address=sender_address,
            entry_point_selector=(
                starknet_abi.EXECUTE_ENTRY_POINT_SELECTOR
                if entry_point_selector is None
                else entry_point_selector
            ),
            max_fee=max_fee,
            version=version,
            entry_point_type=EntryPointType.EXTERNAL,
            calldata=calldata,
            nonce=nonce,
            signature=signature,
            hash_value=hash_value,
        )
        internal_invoke.verify_version()
        return internal_invoke

    def to_external(self) -> DeprecatedInvokeFunction:
        assert self.entry_point_type is EntryPointType.EXTERNAL, (
            "It it illegal to convert to external an invoke transaction of a "
            f"non-external Cairo contract function; got: {self.entry_point_type.name}."
        )

        return DeprecatedInvokeFunction(
            sender_address=self.sender_address,
            entry_point_selector=(
                self.entry_point_selector
                if self.version in [0, constants.QUERY_VERSION_BASE]
                else None
            ),
            calldata=self.calldata,
            max_fee=self.max_fee,
            version=self.version,
            nonce=self.nonce,
            signature=self.signature,
        )

    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        """
        Applies self to 'state' by executing the entry point and charging fee for it (if needed).
        """
        # Reject unsupported versions. This is necessary (in addition to the gateway's check)
        # since an old transaction might still reach here, e.g., in case of a re-org.
        self.verify_version()

        # Validate transaction.
        resources_manager = ExecutionResourcesManager.empty()
        validate_info, remaining_gas = self.run_validate_entrypoint(
            remaining_gas=remaining_gas,
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
        )

        # Execute transaction.
        call_info, remaining_gas = self.run_execute_entrypoint(
            remaining_gas=remaining_gas,
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
        )

        # Handle fee.
        actual_resources = calculate_tx_resources(
            state=state,
            resources_manager=resources_manager,
            call_infos=[call_info, validate_info],
            tx_type=self.tx_type,
            fee_token_address=general_config.deprecated_fee_token_address,
            is_nonce_increment=self.version not in [0, constants.QUERY_VERSION_BASE],
            sender_address=self.sender_address,
        )

        return TransactionExecutionInfo.create_concurrent_stage_execution_info(
            validate_info=validate_info,
            call_info=call_info,
            actual_resources=actual_resources,
            tx_type=self.tx_type,
            revert_error=None,
        )

    def run_execute_entrypoint(
        self,
        remaining_gas: int,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        general_config: StarknetGeneralConfig,
    ) -> Tuple[CallInfo, int]:
        """
        Builds the transaction execution context and executes the entry point.
        Returns the CallInfo.
        """
        call = ExecuteEntryPoint.create(
            contract_address=self.sender_address,
            entry_point_selector=self.entry_point_selector,
            initial_gas=remaining_gas,
            entry_point_type=EntryPointType.EXTERNAL,
            calldata=self.calldata,
            caller_address=0,
        )

        call_info = call.execute(
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
            tx_execution_context=self.get_execution_context(
                n_steps=general_config.invoke_tx_max_n_steps,
                execution_mode=ExecutionMode.EXECUTE,
            ),
        )
        remaining_gas -= call_info.gas_consumed

        return call_info, remaining_gas


@marshmallow_dataclass.dataclass(frozen=True)
class InternalL1Handler(DeprecatedInternalTransaction):
    """
    Represents an internal transaction in the StarkNet network that is an invocation of a Cairo
    contract L1 handler.
    """

    contract_address: int = field(metadata=fields.contract_address_metadata)
    entry_point_selector: int = field(metadata=fields.entry_point_selector_metadata)
    calldata: List[int] = field(metadata=fields.calldata_metadata)
    # A unique nonce, added by the StarkNet core contract on L1. Guarantees a unique
    # hash_value of transactions.
    nonce: Optional[int] = field(metadata=fields.optional_nonce_metadata)
    # The actual fee paid by the L1 contract; used to enforce fee payment.
    paid_fee_on_l1: Optional[int] = field(metadata=fields.optional_fee_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.L1_HANDLER

    @property
    @classmethod
    def related_external_cls(cls) -> Type[DeprecatedTransaction]:
        raise NotImplementedError("InternalL1Handler does not have a corresponding external class.")

    @marshmallow.decorators.pre_load
    def remove_deprecated_fields(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        for deprecated_field in (
            "entry_point_type",
            "max_fee",
            "signature",
            "version",
            "caller_address",
            "code_address",
        ):
            data.pop(deprecated_field, None)

        return data

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "DeprecatedInternalTransaction":
        raise NotImplementedError("InternalL1Handler does not have a corresponding external class.")

    def to_external(self) -> DeprecatedTransaction:
        raise NotImplementedError("InternalL1Handler does not have a corresponding external class.")

    @classmethod
    def create_for_testing(
        cls,
        contract_address: int,
        calldata: List[int],
        entry_point_selector: int,
        nonce: int,
        chain_id: Optional[int] = None,
        paid_fee_on_l1: Optional[int] = None,
    ):
        return cls.create(
            contract_address=contract_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            nonce=nonce,
            chain_id=0 if chain_id is None else chain_id,
            paid_fee_on_l1=paid_fee_on_l1,
        )

    @classmethod
    def create(
        cls,
        contract_address: int,
        entry_point_selector: int,
        calldata: List[int],
        nonce: int,
        chain_id: int,
        paid_fee_on_l1: Optional[int],
    ) -> "InternalL1Handler":
        hash_value = deprecated_calculate_l1_handler_transaction_hash(
            contract_address=contract_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            chain_id=chain_id,
            nonce=nonce,
        )

        return cls(
            contract_address=contract_address,
            entry_point_selector=entry_point_selector,
            calldata=calldata,
            nonce=nonce,
            hash_value=hash_value,
            paid_fee_on_l1=paid_fee_on_l1,
        )

    def _apply_specific_concurrent_changes(
        self, state: UpdatesTrackerState, general_config: StarknetGeneralConfig, remaining_gas: int
    ) -> TransactionExecutionInfo:
        """
        Applies self to 'state' by executing the L1-handler entry point.
        """
        call = ExecuteEntryPoint.create(
            contract_address=self.contract_address,
            entry_point_selector=self.entry_point_selector,
            initial_gas=remaining_gas,
            entry_point_type=EntryPointType.L1_HANDLER,
            calldata=self.calldata,
            caller_address=0,
        )

        # Execute transaction.
        resources_manager = ExecutionResourcesManager.empty()
        call_info = call.execute(
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
            tx_execution_context=self.get_execution_context(
                n_steps=general_config.invoke_tx_max_n_steps
            ),
        )

        actual_resources = calculate_tx_resources(
            state=state,
            resources_manager=resources_manager,
            call_infos=[call_info],
            tx_type=self.tx_type,
            fee_token_address=general_config.deprecated_fee_token_address,
            l1_handler_payload_size=self.get_payload_size(),
            is_nonce_increment=False,
            sender_address=None,
        )

        # Enforce L1 fees.

        if general_config.enforce_l1_handler_fee:
            # Backward compatibility; Continue running the transaction even when
            # L1 handler fee is enforced, and paid_fee_on_l1 is None; If this is the case,
            # the transaction is an old transaction.
            if self.paid_fee_on_l1 is not None:
                required_fee = calculate_tx_fee(
                    l1_gas_price=state.block_info.l1_gas_price.price_in_wei,
                    resources=actual_resources,
                )
                # For now, assert only that any amount of fee was paid.
                # The error message still indicates the required fee.
                stark_assert(
                    self.paid_fee_on_l1 > 0,
                    code=StarknetErrorCode.L1_TO_L2_MESSAGE_INSUFFICIENT_FEE,
                    message=(
                        f"Insufficient fee was paid. Expected: {required_fee};"
                        f" got: {self.paid_fee_on_l1}."
                    ),
                )

        return TransactionExecutionInfo.create_concurrent_stage_execution_info(
            validate_info=None,
            call_info=call_info,
            actual_resources=actual_resources,
            tx_type=self.tx_type,
            revert_error=None,
        )

    def _apply_specific_sequential_changes(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        actual_resources: ResourcesMapping,
    ) -> FeeInfo:
        # For L1 handlers, users pay directly to the L1 contract.
        # The term actual_fee denotes the actual worth of the transaction and refers to the
        # fee transferred to the sequencer in L2; This number is zero in this case.
        fee_transfer_info, actual_fee = None, 0
        return fee_transfer_info, actual_fee

    def get_execution_context(self, n_steps: int) -> TransactionExecutionContext:
        return TransactionExecutionContext.create(
            account_contract_address=self.contract_address,
            transaction_hash=self.hash_value,
            signature=[],
            max_fee=0,
            nonce=as_non_optional(self.nonce),
            n_steps=n_steps,
            version=constants.L1_HANDLER_VERSION,
            execution_mode=ExecutionMode.EXECUTE,
        )

    def get_payload_size(self) -> int:
        """
        Returns the payload size of the corresponding L1-to-L2 message.
        """
        # The calldata includes the "from" field, which is not a part of the payload.
        # We thus subtract 1.
        return len(self.calldata) - 1

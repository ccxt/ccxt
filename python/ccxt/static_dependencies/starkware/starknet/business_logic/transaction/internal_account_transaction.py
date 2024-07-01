import dataclasses
from abc import abstractmethod
from dataclasses import field
from typing import ClassVar, List, Optional, Type

import marshmallow_dataclass

import starkware.starknet.public.abi as abi_constants
from services.everest.business_logic.state_api import StateProxy
from services.everest.business_logic.transaction_execution_objects import TransactionExecutionInfo
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.business_logic.utils import verify_version, write_class_facts
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.contract_class.class_hash import compute_class_hash
from starkware.starknet.core.os.contract_class.compiled_class_hash import (
    compute_compiled_class_hash,
)
from starkware.starknet.core.os.transaction_hash.transaction_hash import (
    calculate_declare_transaction_hash,
    calculate_deploy_account_transaction_hash,
    calculate_invoke_transaction_hash,
)
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.fields import Resource, ResourceBounds, ResourceBoundsMapping
from starkware.starknet.definitions.general_config import (
    DEFAULT_MAX_FRI_L1_GAS_PRICE,
    StarknetGeneralConfig,
)
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    ContractClass,
)
from starkware.starknet.services.api.gateway.account_transaction import (
    AccountTransaction,
    Declare,
    DeployAccount,
    InvokeFunction,
)
from starkware.starknet.services.api.gateway.transaction import Transaction
from starkware.starkware_utils.config_base import Config
from starkware.storage.storage import FactFetchingContext

TRIVIAL_RESOURCE_BOUNDS = {
    Resource.L1_GAS: ResourceBounds(max_amount=0, max_price_per_unit=DEFAULT_MAX_FRI_L1_GAS_PRICE),
    Resource.L2_GAS: ResourceBounds(max_amount=0, max_price_per_unit=0),
}


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class InternalAccountTransaction(InternalTransaction):
    """
    Represents a transaction that originated from an action of an account.
    See the external class for field documentation.
    """

    version: int = field(metadata=fields.tx_version_metadata)
    signature: List[int] = field(metadata=fields.signature_metadata)
    nonce: int = field(metadata=fields.nonce_metadata)
    sender_address: int = field(metadata=fields.contract_address_metadata)

    # Data availability.
    nonce_data_availability_mode: int = field(metadata=fields.data_availability_mode_metadata)
    fee_data_availability_mode: int = field(metadata=fields.data_availability_mode_metadata)

    # Fee-related fields.
    resource_bounds: fields.ResourceBoundsMapping = field(
        metadata=fields.resource_bounds_mapping_metadata
    )
    tip: int = field(metadata=fields.tip_metadata)
    paymaster_data: List[int] = field(metadata=fields.paymaster_data_metadata)

    @property
    def zero_max_fee(self) -> bool:
        """
        Returns whether the indicated max fee user committed on is zero.
        Currently takes only L1 gas into account, since L2 is not yet in use.
        """
        l1_bounds = self.resource_bounds[fields.Resource.L1_GAS]
        return l1_bounds.max_amount * l1_bounds.max_price_per_unit == 0

    def verify_version(self):
        expected_transaction_version_constant = 3
        assert constants.TRANSACTION_VERSION == expected_transaction_version_constant, (
            f"Unexpected constant value. Expected {expected_transaction_version_constant}; "
            f"got {constants.TRANSACTION_VERSION}."
        )
        verify_version(
            version=self.version,
            expected_version=constants.TRANSACTION_VERSION,
            only_query=False,
            old_supported_versions=[],
        )

    @classmethod
    @abstractmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "InternalAccountTransaction":
        """
        Returns an internal transaction generated based on an external one, where the input
        arguments are downcasted to application-specific types.
        """

    # The following state API functions are not in use.
    # They are implemented to fulfill the requirements for making the class concrete.

    async def apply_state_updates(
        self, _state: StateProxy, _general_config: Config
    ) -> Optional[TransactionExecutionInfo]:
        raise NotImplementedError(
            f"We do not support Python execution of transactions with version >= "
            f"{constants.TRANSACTION_VERSION}."
        )


@marshmallow_dataclass.dataclass(frozen=True)
class InternalDeclare(InternalAccountTransaction):
    """
    Represents an internal transaction in the StarkNet network that is a declaration of a Cairo
    contract class.
    See the external class for field documentation.
    """

    class_hash: int = field(metadata=fields.new_class_hash_metadata)
    compiled_class_hash: int = field(metadata=fields.compiled_class_hash_metadata)
    sierra_program_size: int = field(metadata=fields.sierra_program_size_metadata)
    abi_size: int = field(metadata=fields.abi_size_metadata)
    account_deployment_data: List[int] = field(metadata=fields.account_deployment_data_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE
    related_external_cls: ClassVar[Type[AccountTransaction]] = Declare

    @classmethod
    def create(
        cls,
        version: int,
        signature: List[int],
        nonce: int,
        sender_address: int,
        resource_bounds: ResourceBoundsMapping,
        compiled_class_hash: int,
        contract_class: ContractClass,
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ):
        paymaster_data = [] if paymaster_data is None else paymaster_data
        class_hash = compute_class_hash(contract_class=contract_class)
        hash_value = calculate_declare_transaction_hash(
            version=version,
            nonce=nonce,
            sender_address=sender_address,
            fee_data_availability_mode=fee_data_availability_mode,
            nonce_data_availability_mode=nonce_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            compiled_class_hash=compiled_class_hash,
            account_deployment_data=[]
            if account_deployment_data is None
            else account_deployment_data,
            contract_class=contract_class,
            chain_id=chain_id,
        )

        internal_declare = cls(
            hash_value=hash_value,
            version=version,
            signature=signature,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            class_hash=class_hash,
            compiled_class_hash=compiled_class_hash,
            sierra_program_size=contract_class.get_bytecode_size(),
            abi_size=contract_class.get_abi_size(),
            account_deployment_data=[]
            if account_deployment_data is None
            else account_deployment_data,
        )
        internal_declare.verify_version()
        return internal_declare

    @classmethod
    async def create_for_testing(
        cls,
        ffc: FactFetchingContext,
        sender_address: int,
        resource_bounds: ResourceBoundsMapping,
        compiled_class_hash: int,
        contract_class: ContractClass,
        compiled_class: CompiledClass,
        version: int = constants.TRANSACTION_VERSION,
        signature: Optional[List[int]] = None,
        nonce: int = 0,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
        chain_id: int = 0,
    ) -> "InternalDeclare":
        """
        Creates a declare transaction and writes its contract class to the DB.
        This constructor should only be used in tests.
        """
        await write_class_facts(
            contract_class=contract_class, compiled_class=compiled_class, ffc=ffc
        )
        return cls.create(
            version=version,
            signature=[] if signature is None else signature,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            compiled_class_hash=compiled_class_hash,
            account_deployment_data=account_deployment_data,
            contract_class=contract_class,
            chain_id=chain_id,
        )

    def to_external(self) -> Declare:
        raise NotImplementedError("Cannot convert internal declare transaction to external object.")

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "InternalDeclare":
        assert isinstance(external_tx, Declare)
        return cls.create(
            version=external_tx.version,
            signature=external_tx.signature,
            nonce=external_tx.nonce,
            sender_address=external_tx.sender_address,
            nonce_data_availability_mode=external_tx.nonce_data_availability_mode,
            fee_data_availability_mode=external_tx.fee_data_availability_mode,
            resource_bounds=external_tx.resource_bounds,
            tip=external_tx.tip,
            paymaster_data=external_tx.paymaster_data,
            compiled_class_hash=external_tx.compiled_class_hash,
            account_deployment_data=external_tx.account_deployment_data,
            chain_id=general_config.chain_id.value,
            contract_class=external_tx.contract_class,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class InternalDeployAccount(InternalAccountTransaction):
    """
    Internal version of the deploy account transaction (deployment of StarkNet
    account contracts).
    See the external class for field documentation.
    """

    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    class_hash: int = field(metadata=fields.new_class_hash_metadata)
    constructor_calldata: List[int] = field(metadata=fields.calldata_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY_ACCOUNT
    related_external_cls: ClassVar[Type[AccountTransaction]] = DeployAccount

    @classmethod
    def create(
        cls,
        version: int,
        signature: List[int],
        nonce: int,
        resource_bounds: ResourceBoundsMapping,
        contract_address_salt: int,
        class_hash: int,
        constructor_calldata: List[int],
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
    ) -> "InternalDeployAccount":
        paymaster_data = [] if paymaster_data is None else paymaster_data
        contract_address = calculate_contract_address_from_hash(
            salt=contract_address_salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=0,
        )
        hash_value = calculate_deploy_account_transaction_hash(
            version=version,
            nonce=nonce,
            contract_address=contract_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            salt=contract_address_salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            chain_id=chain_id,
        )

        internal_deploy_account = cls(
            hash_value=hash_value,
            version=version,
            signature=signature,
            nonce=nonce,
            sender_address=contract_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            contract_address_salt=contract_address_salt,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
        )
        internal_deploy_account.verify_version()
        return internal_deploy_account

    @classmethod
    def create_for_testing(
        cls,
        contract_class: CompiledClass,
        resource_bounds: ResourceBoundsMapping,
        signature: Optional[List[int]] = None,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        contract_address_salt: int = 0,
        constructor_calldata: Optional[List[int]] = None,
        chain_id: int = 0,
    ) -> "InternalDeployAccount":
        return cls.create(
            version=constants.TRANSACTION_VERSION,
            signature=[] if signature is None else signature,
            nonce=0,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            contract_address_salt=contract_address_salt,
            class_hash=compute_compiled_class_hash(compiled_class=contract_class),
            constructor_calldata=[] if constructor_calldata is None else constructor_calldata,
            chain_id=chain_id,
        )

    def to_external(self) -> DeployAccount:
        return DeployAccount(
            version=self.version,
            signature=self.signature,
            nonce=self.nonce,
            contract_address_salt=self.contract_address_salt,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            nonce_data_availability_mode=self.nonce_data_availability_mode,
            fee_data_availability_mode=self.fee_data_availability_mode,
            resource_bounds=self.resource_bounds,
            paymaster_data=self.paymaster_data,
            tip=self.tip,
        )

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "InternalDeployAccount":
        assert isinstance(external_tx, DeployAccount)
        return cls.create(
            class_hash=external_tx.class_hash,
            version=external_tx.version,
            nonce=external_tx.nonce,
            constructor_calldata=external_tx.constructor_calldata,
            signature=external_tx.signature,
            contract_address_salt=external_tx.contract_address_salt,
            chain_id=general_config.chain_id.value,
            nonce_data_availability_mode=external_tx.nonce_data_availability_mode,
            fee_data_availability_mode=external_tx.fee_data_availability_mode,
            resource_bounds=external_tx.resource_bounds,
            paymaster_data=external_tx.paymaster_data,
            tip=external_tx.tip,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class InternalInvokeFunction(InternalAccountTransaction):
    """
    Represents an internal transaction in the StarkNet network that is an invocation of a Cairo
    contract function.
    See the external class for field documentation.
    """

    calldata: List[int] = field(metadata=fields.calldata_metadata)
    account_deployment_data: List[int] = field(metadata=fields.account_deployment_data_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.INVOKE_FUNCTION
    related_external_cls: ClassVar[Type[AccountTransaction]] = InvokeFunction

    @classmethod
    def create(
        cls,
        version: int,
        signature: List[int],
        nonce: int,
        sender_address: int,
        resource_bounds: ResourceBoundsMapping,
        calldata: List[int],
        chain_id: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ) -> "InternalInvokeFunction":
        paymaster_data = [] if paymaster_data is None else paymaster_data
        hash_value = calculate_invoke_transaction_hash(
            version=version,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            calldata=calldata,
            account_deployment_data=[]
            if account_deployment_data is None
            else account_deployment_data,
            chain_id=chain_id,
        )

        internal_invoke = cls(
            hash_value=hash_value,
            version=version,
            signature=signature,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            calldata=calldata,
            account_deployment_data=[]
            if account_deployment_data is None
            else account_deployment_data,
        )
        internal_invoke.verify_version()
        return internal_invoke

    @classmethod
    def create_for_testing(
        cls,
        nonce: int,
        sender_address: int,
        calldata: List[int],
        signature: Optional[List[int]] = None,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        resource_bounds: Optional[ResourceBoundsMapping] = None,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
        chain_id: int = 0,
    ):
        return cls.create(
            version=constants.TRANSACTION_VERSION,
            signature=[] if signature is None else signature,
            nonce=nonce,
            sender_address=sender_address,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=TRIVIAL_RESOURCE_BOUNDS if resource_bounds is None else resource_bounds,
            tip=tip,
            paymaster_data=paymaster_data,
            calldata=calldata,
            account_deployment_data=account_deployment_data,
            chain_id=chain_id,
        )

    @classmethod
    def create_wrapped_with_account(
        cls,
        nonce: int,
        account_address: int,
        resource_bounds: ResourceBoundsMapping,
        contract_address: int,
        entry_point_selector: int,
        calldata: List[int],
        signature: Optional[List[int]] = None,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
        chain_id: int = 0,
    ):
        """
        Creates an account contract invocation to the 'dummy_account'
        test contract at address 'account_address'.
        The arguments `contract_address`, `entry_point_selector` and `calldata`
        are included as part of the calldata of the account contract invocation as follows:
        ```
            calldata=[contract_address, entry_point_selector, len(calldata), *calldata]
        ```
        This method should only be used in tests.
        """

        return cls.create_for_testing(
            signature=[] if signature is None else signature,
            nonce=nonce,
            sender_address=account_address,
            resource_bounds=resource_bounds,
            calldata=[contract_address, entry_point_selector, len(calldata), *calldata],
            chain_id=chain_id,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            tip=tip,
            paymaster_data=paymaster_data,
            account_deployment_data=account_deployment_data,
        )

    def to_external(self) -> InvokeFunction:
        return InvokeFunction(
            sender_address=self.sender_address,
            calldata=self.calldata,
            version=self.version,
            nonce=self.nonce,
            signature=self.signature,
            resource_bounds=self.resource_bounds,
            nonce_data_availability_mode=self.nonce_data_availability_mode,
            fee_data_availability_mode=self.fee_data_availability_mode,
            paymaster_data=self.paymaster_data,
            tip=self.tip,
            account_deployment_data=self.account_deployment_data,
        )

    @classmethod
    def _specific_from_external(
        cls, external_tx: Transaction, general_config: StarknetGeneralConfig
    ) -> "InternalInvokeFunction":
        assert isinstance(external_tx, InvokeFunction)

        return cls.create(
            sender_address=external_tx.sender_address,
            calldata=external_tx.calldata,
            nonce=external_tx.nonce,
            signature=external_tx.signature,
            chain_id=general_config.chain_id.value,
            version=external_tx.version,
            resource_bounds=external_tx.resource_bounds,
            nonce_data_availability_mode=external_tx.nonce_data_availability_mode,
            fee_data_availability_mode=external_tx.fee_data_availability_mode,
            paymaster_data=external_tx.paymaster_data,
            tip=external_tx.tip,
            account_deployment_data=external_tx.account_deployment_data,
        )

    @property
    def entry_point_selector(self) -> int:
        return abi_constants.EXECUTE_ENTRY_POINT_SELECTOR

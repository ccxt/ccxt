import dataclasses
from dataclasses import field
from typing import Any, ClassVar, Dict, List, Optional

import marshmallow
import marshmallow.decorators
import marshmallow.exceptions
import marshmallow_dataclass

from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.transaction_hash.transaction_hash import (
    calculate_declare_transaction_hash,
    calculate_deploy_account_transaction_hash,
    calculate_invoke_transaction_hash,
)
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.services.api.contract_class.contract_class import ContractClass
from starkware.starknet.services.api.gateway.transaction import Transaction
from starkware.starknet.services.api.gateway.transaction_utils import (
    compress_program_post_dump,
    decompress_program_pre_load,
)


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class AccountTransaction(Transaction):
    """
    Represents a transaction in the Starknet network that is originated from an action of an
    account.
    """

    # The signature of the transaction.
    # The exact way this field is handled is defined by the called contract's function,
    # similar to calldata.
    signature: List[int] = field(metadata=fields.signature_metadata)
    # The nonce of the transaction.
    # A sequential number attached to the account contract, that prevents transaction replay
    # and guarantees the order of execution and uniqueness of the transaction hash.
    nonce: int = field(metadata=fields.nonce_metadata)
    # Data availability.
    nonce_data_availability_mode: int = field(metadata=fields.data_availability_mode_metadata)
    fee_data_availability_mode: int = field(metadata=fields.data_availability_mode_metadata)
    # Fee-related fields.
    # Mapping from a resource to its usage bounds for fee charge.
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


@marshmallow_dataclass.dataclass(frozen=True)
class Declare(AccountTransaction):
    """
    Represents a transaction in the Starknet network that is a declaration of a Starknet contract
    class.
    """

    contract_class: ContractClass
    # This is provided as it must be signed by the user (at this point, the Sierra --> Casm
    # compilation is not proven in the OS, so unless this is signed on, we may effectively run any
    # code that we want).
    compiled_class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    # The address of the account contract sending the declaration transaction.
    sender_address: int = field(metadata=fields.contract_address_metadata)
    # If nonempty, will contain the required data for deploying and initializing an account
    # contract: its class hash, address salt and constructor calldata.
    account_deployment_data: List[int] = field(metadata=fields.account_deployment_data_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE

    @marshmallow.decorators.post_dump
    def compress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return compress_program_post_dump(data=data, program_attr_name="sierra_program")

    @marshmallow.decorators.pre_load
    def decompress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return decompress_program_pre_load(data=data, program_attr_name="sierra_program")

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        return calculate_declare_transaction_hash(
            contract_class=self.contract_class,
            compiled_class_hash=self.compiled_class_hash,
            chain_id=general_config.chain_id.value,
            sender_address=self.sender_address,
            version=self.version,
            nonce=self.nonce,
            account_deployment_data=self.account_deployment_data,
            tip=self.tip,
            paymaster_data=self.paymaster_data,
            fee_data_availability_mode=self.fee_data_availability_mode,
            nonce_data_availability_mode=self.nonce_data_availability_mode,
            resource_bounds=self.resource_bounds,
        )

    @classmethod
    def create(
        cls,
        version: int,
        signature: List[int],
        nonce: int,
        resource_bounds: fields.ResourceBoundsMapping,
        contract_class: ContractClass,
        compiled_class_hash: int,
        sender_address: int,
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ) -> "Declare":
        return cls(
            version=version,
            signature=signature,
            nonce=nonce,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=[] if paymaster_data is None else paymaster_data,
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            sender_address=sender_address,
            account_deployment_data=[]
            if account_deployment_data is None
            else account_deployment_data,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeployAccount(AccountTransaction):
    """
    Represents a transaction in the Starknet network that is a deployment of a Starknet account
    contract.
    """

    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    constructor_calldata: List[int] = field(metadata=fields.calldata_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY_ACCOUNT

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        contract_address = calculate_contract_address_from_hash(
            salt=self.contract_address_salt,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            deployer_address=0,
        )
        return calculate_deploy_account_transaction_hash(
            version=self.version,
            contract_address=contract_address,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            nonce=self.nonce,
            salt=self.contract_address_salt,
            chain_id=general_config.chain_id.value,
            tip=self.tip,
            paymaster_data=self.paymaster_data,
            nonce_data_availability_mode=self.nonce_data_availability_mode,
            fee_data_availability_mode=self.fee_data_availability_mode,
            resource_bounds=self.resource_bounds,
        )

    @classmethod
    def create(
        cls,
        version: int,
        signature: List[int],
        nonce: int,
        resource_bounds: fields.ResourceBoundsMapping,
        class_hash: int,
        contract_address_salt: int,
        constructor_calldata: List[int],
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
    ) -> "DeployAccount":
        return cls(
            version=version,
            signature=signature,
            nonce=nonce,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=[] if paymaster_data is None else paymaster_data,
            class_hash=class_hash,
            contract_address_salt=contract_address_salt,
            constructor_calldata=constructor_calldata,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class InvokeFunction(AccountTransaction):
    """
    Represents a transaction in the Starknet network that is an invocation of a Cairo contract
    function.
    """

    sender_address: int = field(metadata=fields.contract_address_metadata)
    calldata: List[int] = field(metadata=fields.calldata_metadata)
    # If nonempty, will contain the required data for deploying and initializing an account
    # contract: its class hash, address salt and constructor calldata.
    account_deployment_data: List[int] = field(metadata=fields.account_deployment_data_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.INVOKE_FUNCTION

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        return calculate_invoke_transaction_hash(
            version=self.version,
            sender_address=self.sender_address,
            calldata=self.calldata,
            chain_id=general_config.chain_id.value,
            nonce=self.nonce,
            account_deployment_data=self.account_deployment_data,
            tip=self.tip,
            paymaster_data=self.paymaster_data,
            fee_data_availability_mode=self.fee_data_availability_mode,
            nonce_data_availability_mode=self.nonce_data_availability_mode,
            resource_bounds=self.resource_bounds,
        )

    @classmethod
    def create(
        cls,
        version: int,
        signature: List[int],
        nonce: int,
        resource_bounds: fields.ResourceBoundsMapping,
        sender_address: int,
        calldata: List[int],
        nonce_data_availability_mode: int = DataAvailabilityMode.L1.value,
        fee_data_availability_mode: int = DataAvailabilityMode.L1.value,
        tip: int = 0,
        paymaster_data: Optional[List[int]] = None,
        account_deployment_data: Optional[List[int]] = None,
    ) -> "InvokeFunction":
        return cls(
            version=version,
            signature=signature,
            nonce=nonce,
            nonce_data_availability_mode=nonce_data_availability_mode,
            fee_data_availability_mode=fee_data_availability_mode,
            resource_bounds=resource_bounds,
            tip=tip,
            paymaster_data=[] if paymaster_data is None else paymaster_data,
            sender_address=sender_address,
            calldata=calldata,
            account_deployment_data=[]
            if account_deployment_data is None
            else account_deployment_data,
        )

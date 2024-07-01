import dataclasses
from dataclasses import field
from typing import Any, ClassVar, Dict, List, Optional

import marshmallow
import marshmallow.decorators
import marshmallow.exceptions
import marshmallow_dataclass

from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address,
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    deprecated_calculate_declare_transaction_hash,
    deprecated_calculate_deploy_account_transaction_hash,
    deprecated_calculate_deploy_transaction_hash,
    deprecated_calculate_invoke_transaction_hash,
    deprecated_calculate_old_declare_transaction_hash,
)
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.services.api.gateway.transaction import Transaction
from starkware.starknet.services.api.gateway.transaction_utils import (
    compress_program_post_dump,
    decompress_program_pre_load,
    rename_contract_address_to_sender_address_pre_load,
)

# The sender address used by default in declare transactions of version 0.
DEFAULT_DECLARE_SENDER_ADDRESS = 1


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class DeprecatedTransaction(Transaction):
    """
    Represents the deprecated Starknet transaction base class.
    """

    # This repetition overrides the metadata of Transaction class to ensure backward compatibility.
    version: int = field(metadata=fields.non_required_tx_version_metadata)


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class DeprecatedAccountTransaction(DeprecatedTransaction):
    """
    Represents a transaction in the Starknet network that is originated from an action of an
    account.
    """

    # The signature of the transaction.
    # The exact way this field is handled is defined by the called contract's function,
    # similar to calldata.
    signature: List[int] = field(metadata=fields.deprecated_signature_metadata)
    # The nonce of the transaction.
    # A sequential number attached to the account contract, that prevents transaction replay
    # and guarantees the order of execution and uniqueness of the transaction hash.
    nonce: Optional[int] = field(metadata=fields.optional_nonce_metadata)
    # Fee related fields.
    # The maximal fee to be paid in Wei for executing the transaction.
    max_fee: int = field(metadata=fields.fee_metadata)

    @property
    def zero_max_fee(self) -> bool:
        """
        Returns whether the indicated max fee user committed on is zero.
        """
        return self.max_fee == 0


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedDeclare(DeprecatedAccountTransaction):
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
    # Repeat `nonce` to narrow its type to non-optional int.
    nonce: int = field(metadata=fields.nonce_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE

    @marshmallow.decorators.post_dump
    def compress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return compress_program_post_dump(data=data, program_attr_name="sierra_program")

    @marshmallow.decorators.pre_load
    def decompress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return decompress_program_pre_load(data=data, program_attr_name="sierra_program")

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        return deprecated_calculate_declare_transaction_hash(
            contract_class=self.contract_class,
            compiled_class_hash=self.compiled_class_hash,
            chain_id=general_config.chain_id.value,
            sender_address=self.sender_address,
            max_fee=self.max_fee,
            version=self.version,
            nonce=self.nonce,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedOldDeclare(DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is a declaration of a Starknet contract
    class that was compiled by the old (pythonic) compiler.
    """

    contract_class: DeprecatedCompiledClass
    # The address of the account contract sending the declaration transaction.
    sender_address: int = field(metadata=fields.contract_address_metadata)
    # Repeat `nonce` to narrow its type to non-optional int.
    nonce: int = field(metadata=fields.nonce_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DECLARE

    @marshmallow.decorators.post_dump
    def compress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return compress_program_post_dump(data=data, program_attr_name="program")

    @marshmallow.decorators.pre_load
    def decompress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return decompress_program_pre_load(data=data, program_attr_name="program")

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        return deprecated_calculate_old_declare_transaction_hash(
            contract_class=self.contract_class,
            chain_id=general_config.chain_id.value,
            sender_address=self.sender_address,
            max_fee=self.max_fee,
            version=self.version,
            nonce=self.nonce,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class Deploy(DeprecatedTransaction):
    """
    Represents a transaction in the Starknet network that is a deployment of a Starknet contract.
    """

    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    contract_definition: DeprecatedCompiledClass
    constructor_calldata: List[int] = field(metadata=fields.calldata_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY

    @marshmallow.decorators.post_dump
    def compress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return compress_program_post_dump(data=data, program_attr_name="program")

    @marshmallow.decorators.pre_load
    def decompress_program(self, data: Dict[str, Any], many: bool, **kwargs) -> Dict[str, Any]:
        return decompress_program_pre_load(data=data, program_attr_name="program")

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        contract_address = calculate_contract_address(
            salt=self.contract_address_salt,
            contract_class=self.contract_definition,
            constructor_calldata=self.constructor_calldata,
            deployer_address=0,
        )
        return deprecated_calculate_deploy_transaction_hash(
            contract_address=contract_address,
            constructor_calldata=self.constructor_calldata,
            chain_id=general_config.chain_id.value,
            version=self.version,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedDeployAccount(DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is a deployment of a Starknet account
    contract.
    """

    class_hash: int = field(metadata=fields.ClassHashIntField.metadata())
    contract_address_salt: int = field(metadata=fields.contract_address_salt_metadata)
    constructor_calldata: List[int] = field(metadata=fields.calldata_metadata)
    version: int = field(metadata=fields.tx_version_metadata)
    # Repeat `nonce` to narrow its type to non-optional int.
    nonce: int = field(metadata=fields.nonce_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.DEPLOY_ACCOUNT

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        contract_address = calculate_contract_address_from_hash(
            salt=self.contract_address_salt,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            deployer_address=0,
        )
        return deprecated_calculate_deploy_account_transaction_hash(
            version=self.version,
            contract_address=contract_address,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            max_fee=self.max_fee,
            nonce=self.nonce,
            salt=self.contract_address_salt,
            chain_id=general_config.chain_id.value,
        )


@marshmallow_dataclass.dataclass(frozen=True)
class DeprecatedInvokeFunction(DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is an invocation of a Cairo contract
    function.
    """

    sender_address: int = field(metadata=fields.contract_address_metadata)
    calldata: List[int] = field(metadata=fields.calldata_metadata)

    # Class variables.
    tx_type: ClassVar[TransactionType] = TransactionType.INVOKE_FUNCTION

    # A field element that encodes the signature of the invoked function.
    # The entry_point_selector is deprecated for version 1 and above (transactions
    # should go through the '__execute__' entry point).
    entry_point_selector: Optional[int] = field(
        default=None, metadata=fields.optional_entry_point_selector_metadata
    )

    @marshmallow.decorators.pre_load
    def rename_contract_address_to_sender_address(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        return rename_contract_address_to_sender_address_pre_load(data=data)

    @marshmallow.decorators.post_dump
    def remove_entry_point_selector(
        self, data: Dict[str, Any], many: bool, **kwargs
    ) -> Dict[str, Any]:
        version = fields.TransactionVersionField.load_value(data["version"])
        if version in (0, constants.QUERY_VERSION_BASE):
            return data

        assert (
            data["entry_point_selector"] is None
        ), f"entry_point_selector should be None in version {version}."
        del data["entry_point_selector"]

        return data

    def calculate_hash(self, general_config: StarknetGeneralConfig) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        return deprecated_calculate_invoke_transaction_hash(
            version=self.version,
            sender_address=self.sender_address,
            entry_point_selector=self.entry_point_selector,
            calldata=self.calldata,
            max_fee=self.max_fee,
            chain_id=general_config.chain_id.value,
            nonce=self.nonce,
        )

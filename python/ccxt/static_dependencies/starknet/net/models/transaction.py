"""
Dataclasses representing Transactions for library use, most often
when sending a transaction to Starknet.
They should be compliant with the latest Starknet version.
"""

import base64
import dataclasses
import gzip
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, TypeVar, Union

import marshmallow
import marshmallow_dataclass
from marshmallow import fields

from hash.address import compute_address
from hash.transaction import (
    CommonTransactionV3Fields,
    TransactionHashPrefix,
    compute_declare_transaction_hash,
    compute_declare_v2_transaction_hash,
    compute_declare_v3_transaction_hash,
    compute_deploy_account_transaction_hash,
    compute_deploy_account_v3_transaction_hash,
    compute_invoke_transaction_hash,
    compute_invoke_v3_transaction_hash,
)
from net.client_models import (
    ContractClass,
    DAMode,
    ResourceBoundsMapping,
    SierraContractClass,
    TransactionType,
)
from net.schemas.common import Felt, TransactionTypeField
from net.schemas.gateway import (
    ContractClassSchema,
    SierraContractClassSchema,
)

# TODO (#1219):
#  consider unifying these classes with client_models
#  remove marshmallow logic if not needed


@dataclass(frozen=True)
class Transaction(ABC):
    """
    Starknet transaction base class.
    """

    version: int = field(metadata={"marshmallow_field": Felt()})

    @property
    @abstractmethod
    def type(self) -> TransactionType:
        """
        Returns the corresponding TransactionType enum.
        """

    @abstractmethod
    def calculate_hash(self, chain_id: int) -> int:
        """
        Calculates the transaction hash in the Starknet network - a unique identifier of the
        transaction. See :py:meth:`~starknet_py.hash.transaction.compute_transaction_hash` docstring for more details.
        """


@dataclass(frozen=True)
class AccountTransaction(Transaction, ABC):
    """
    Represents a transaction in the Starknet network that is originated from an action of an
    account.
    """

    signature: List[int] = field(
        metadata={"marshmallow_field": fields.List(fields.String())}
    )
    nonce: int = field(metadata={"marshmallow_field": Felt()})


# Used instead of Union[Invoke, Declare, DeployAccount]
TypeAccountTransaction = TypeVar("TypeAccountTransaction", bound=AccountTransaction)


@dataclass(frozen=True)
class _DeprecatedAccountTransaction(AccountTransaction, ABC):
    max_fee: int = field(metadata={"marshmallow_field": Felt()})


@dataclass(frozen=True)
class _AccountTransactionV3(AccountTransaction, ABC):
    resource_bounds: ResourceBoundsMapping
    tip: int = field(init=False, default=0)
    nonce_data_availability_mode: DAMode = field(init=False, default=DAMode.L1)
    fee_data_availability_mode: DAMode = field(init=False, default=DAMode.L1)
    paymaster_data: List[int] = field(init=False, default_factory=list)

    def get_common_fields(
        self,
        tx_prefix: TransactionHashPrefix,
        address: int,
        chain_id: int,
    ) -> CommonTransactionV3Fields:
        common_fields = [f.name for f in dataclasses.fields(_AccountTransactionV3)]

        # this is a helper function in a process to compute transaction hash
        # therefore signature is not included at this point
        common_fields.remove("signature")

        common_fields_with_values = {
            field_name: getattr(self, field_name) for field_name in common_fields
        }

        return CommonTransactionV3Fields(
            tx_prefix=tx_prefix,
            address=address,
            chain_id=chain_id,
            **common_fields_with_values,
        )


@dataclass(frozen=True)
class DeclareV3(_AccountTransactionV3):
    """
    Represents a transaction in the Starknet network that is a version 3 declaration of a Starknet contract
    class. Supports only sierra compiled contracts.
    """

    sender_address: int
    compiled_class_hash: int
    contract_class: SierraContractClass
    account_deployment_data: List[int] = field(default_factory=list)
    type: TransactionType = TransactionType.DECLARE

    def calculate_hash(self, chain_id: int) -> int:
        return compute_declare_v3_transaction_hash(
            account_deployment_data=self.account_deployment_data,
            contract_class=self.contract_class,
            compiled_class_hash=self.compiled_class_hash,
            common_fields=self.get_common_fields(
                tx_prefix=TransactionHashPrefix.DECLARE,
                address=self.sender_address,
                chain_id=chain_id,
            ),
        )


@dataclass(frozen=True)
class DeclareV2(_DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is a version 2 declaration of a Starknet contract
    class. Supports only sierra compiled contracts.
    """

    contract_class: SierraContractClass = field(
        metadata={"marshmallow_field": fields.Nested(SierraContractClassSchema())}
    )
    compiled_class_hash: int = field(metadata={"marshmallow_field": Felt()})
    sender_address: int = field(metadata={"marshmallow_field": Felt()})
    type: TransactionType = field(
        metadata={"marshmallow_field": TransactionTypeField()},
        default=TransactionType.DECLARE,
    )

    def calculate_hash(self, chain_id: int) -> int:
        return compute_declare_v2_transaction_hash(
            contract_class=self.contract_class,
            compiled_class_hash=self.compiled_class_hash,
            chain_id=chain_id,
            sender_address=self.sender_address,
            max_fee=self.max_fee,
            version=self.version,
            nonce=self.nonce,
        )


@dataclass(frozen=True)
class DeclareV1(_DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is a declaration of a Starknet contract
    class.
    """

    # The class to be declared, included for all methods involving execution (estimateFee, simulateTransactions)
    contract_class: ContractClass = field(
        metadata={"marshmallow_field": fields.Nested(ContractClassSchema())}
    )
    # The address of the account contract sending the declaration transaction.
    sender_address: int = field(metadata={"marshmallow_field": Felt()})
    type: TransactionType = field(
        metadata={"marshmallow_field": TransactionTypeField()},
        default=TransactionType.DECLARE,
    )

    @marshmallow.post_dump
    def post_dump(self, data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        # Allowing **kwargs is needed here because marshmallow is passing additional parameters here
        # along with data, which we don't handle.
        # pylint: disable=unused-argument, no-self-use
        return compress_program(data)

    @marshmallow.pre_load
    def pre_load(self, data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        # pylint: disable=unused-argument, no-self-use
        return decompress_program(data)

    def calculate_hash(self, chain_id: int) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        return compute_declare_transaction_hash(
            contract_class=self.contract_class,
            chain_id=chain_id,
            sender_address=self.sender_address,
            max_fee=self.max_fee,
            version=self.version,
            nonce=self.nonce,
        )


@dataclass(frozen=True)
class DeployAccountV3(_AccountTransactionV3):
    """
    Represents a transaction in the Starknet network that is a version 3 deployment of a Starknet account
    contract.
    """

    class_hash: int
    contract_address_salt: int
    constructor_calldata: List[int]
    type: TransactionType = TransactionType.DEPLOY_ACCOUNT

    def calculate_hash(self, chain_id: int) -> int:
        contract_address = compute_address(
            salt=self.contract_address_salt,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            deployer_address=0,
        )
        return compute_deploy_account_v3_transaction_hash(
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            contract_address_salt=self.contract_address_salt,
            common_fields=self.get_common_fields(
                tx_prefix=TransactionHashPrefix.DEPLOY_ACCOUNT,
                address=contract_address,
                chain_id=chain_id,
            ),
        )


@dataclass(frozen=True)
class DeployAccountV1(_DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is a deployment of a Starknet account
    contract.
    """

    class_hash: int = field(metadata={"marshmallow_field": Felt()})
    contract_address_salt: int = field(metadata={"marshmallow_field": Felt()})
    constructor_calldata: List[int] = field(
        metadata={"marshmallow_field": fields.List(fields.String())}
    )
    type: TransactionType = field(
        metadata={"marshmallow_field": TransactionTypeField()},
        default=TransactionType.DEPLOY_ACCOUNT,
    )

    def calculate_hash(self, chain_id: int) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        contract_address = compute_address(
            salt=self.contract_address_salt,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            deployer_address=0,
        )
        return compute_deploy_account_transaction_hash(
            version=self.version,
            contract_address=contract_address,
            class_hash=self.class_hash,
            constructor_calldata=self.constructor_calldata,
            max_fee=self.max_fee,
            nonce=self.nonce,
            salt=self.contract_address_salt,
            chain_id=chain_id,
        )


@dataclass(frozen=True)
class InvokeV3(_AccountTransactionV3):
    """
    Represents a transaction in the Starknet network that is a version 3 invocation of a Cairo contract
    function.
    """

    calldata: List[int]
    sender_address: int
    account_deployment_data: List[int] = field(default_factory=list)
    type: TransactionType = TransactionType.INVOKE

    def calculate_hash(self, chain_id: int) -> int:
        return compute_invoke_v3_transaction_hash(
            account_deployment_data=self.account_deployment_data,
            calldata=self.calldata,
            common_fields=self.get_common_fields(
                tx_prefix=TransactionHashPrefix.INVOKE,
                address=self.sender_address,
                chain_id=chain_id,
            ),
        )


@dataclass(frozen=True)
class InvokeV1(_DeprecatedAccountTransaction):
    """
    Represents a transaction in the Starknet network that is an invocation of a Cairo contract
    function.
    """

    sender_address: int = field(metadata={"marshmallow_field": Felt()})
    calldata: List[int] = field(
        metadata={"marshmallow_field": fields.List(fields.String())}
    )
    type: TransactionType = field(
        metadata={"marshmallow_field": TransactionTypeField()},
        default=TransactionType.INVOKE,
    )

    def calculate_hash(self, chain_id: int) -> int:
        """
        Calculates the transaction hash in the Starknet network.
        """
        return compute_invoke_transaction_hash(
            version=self.version,
            sender_address=self.sender_address,
            calldata=self.calldata,
            max_fee=self.max_fee,
            chain_id=chain_id,
            nonce=self.nonce,
        )


Declare = Union[DeclareV1, DeclareV2, DeclareV3]
DeployAccount = Union[DeployAccountV1, DeployAccountV3]
Invoke = Union[InvokeV1, InvokeV3]

InvokeV1Schema = marshmallow_dataclass.class_schema(InvokeV1)
DeclareV1Schema = marshmallow_dataclass.class_schema(DeclareV1)
DeclareV2Schema = marshmallow_dataclass.class_schema(DeclareV2)
DeployAccountV1Schema = marshmallow_dataclass.class_schema(DeployAccountV1)


def compress_program(data: dict, program_name: str = "program") -> dict:
    program = data["contract_class"][program_name]
    compressed_program = json.dumps(program)
    compressed_program = gzip.compress(data=compressed_program.encode("ascii"))
    compressed_program = base64.b64encode(compressed_program)
    data["contract_class"][program_name] = compressed_program.decode("ascii")
    return data


def decompress_program(data: dict, program_name: str = "program") -> dict:
    compressed_program: str = data["contract_class"][program_name]
    program = base64.b64decode(compressed_program.encode("ascii"))
    program = gzip.decompress(data=program)
    program = json.loads(program.decode("ascii"))
    data["contract_class"][program_name] = program
    return data

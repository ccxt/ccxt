"""
Dataclasses representing responses from Starknet.
They need to stay backwards compatible for old transactions/blocks to be fetchable.

If you encounter a ValidationError in the context of an RPC response, it is possible to disable validation.
This can be achieved by setting the environment variable, STARKNET_PY_MARSHMALLOW_UKNOWN_EXCLUDE,
to true. Consequently, any unknown fields in response will be excluded.
"""

import json
from abc import ABC
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Iterable, List, Literal, Optional, Union, cast

from ...marshmallow import EXCLUDE

from ..abi.v0.shape import AbiDictList
from ..abi.v1.schemas import (
    ContractAbiEntrySchema as ContractAbiEntrySchemaV1,
)
from ..abi.v1.shape import AbiDictEntry as AbiDictEntryV1
from ..abi.v1.shape import AbiDictList as AbiDictListV1
from ..abi.v2.schemas import (
    ContractAbiEntrySchema as ContractAbiEntrySchemaV2,
)
from ..abi.v2.shape import AbiDictEntry as AbiDictEntryV2
from ..abi.v2.shape import AbiDictList as AbiDictListV2
from ..utils.constructor_args_translator import _is_abi_v2

# pylint: disable=too-many-lines

Hash = Union[int, str]
Tag = Literal["pending", "latest"]


@dataclass
class Call:
    """
    Dataclass representing a call to Starknet contract.
    """

    to_addr: int
    selector: int
    calldata: List[int]


Calls = Union[Call, Iterable[Call]]


@dataclass
class Event:
    """
    Dataclass representing a Starknet event.
    """

    from_address: int
    keys: List[int]
    data: List[int]


@dataclass
class EmittedEvent(Event):
    """
    Dataclass representing an event emitted by transaction.
    """

    transaction_hash: int
    block_hash: Optional[int] = None
    block_number: Optional[int] = None


@dataclass
class EventsChunk:
    """
    Dataclass representing events returned by FullNodeClient.get_events method.
    """

    events: List[EmittedEvent]
    continuation_token: Optional[str] = None


@dataclass
class L2toL1Message:
    """
    Dataclass representing a L2->L1 message.
    """

    payload: List[int]
    l2_address: int  # from_address in spec
    l1_address: int  # to_address in spec


@dataclass
class ResourcePrice:
    """
    Dataclass representing prices of L1 gas.
    """

    price_in_wei: int
    price_in_fri: int


@dataclass
class ResourceBounds:
    """
    Dataclass representing max amount and price of the resource that can be used in the transaction.
    """

    max_amount: int
    max_price_per_unit: int

    @staticmethod
    def init_with_zeros():
        return ResourceBounds(max_amount=0, max_price_per_unit=0)


@dataclass
class ResourceBoundsMapping:
    """
    Dataclass representing resource limits that can be used in the transaction.
    """

    l1_gas: ResourceBounds
    l2_gas: ResourceBounds

    @staticmethod
    def init_with_zeros():
        return ResourceBoundsMapping(
            l1_gas=ResourceBounds.init_with_zeros(),
            l2_gas=ResourceBounds.init_with_zeros(),
        )


class PriceUnit(Enum):
    """
    Enum representing price unit types.
    """

    WEI = "WEI"
    FRI = "FRI"


@dataclass
class FeePayment:
    """
    Dataclass representing fee payment info as it appears in receipts.
    """

    amount: int
    unit: PriceUnit


class DAMode(Enum):
    """
    Specifies a storage domain in Starknet. Each domain has different guarantees regarding availability.
    """

    L1 = 0
    L2 = 1


class L1DAMode(Enum):
    BLOB = "BLOB"
    CALLDATA = "CALLDATA"


class TransactionType(Enum):
    """
    Enum representing transaction types.
    """

    INVOKE = "INVOKE"
    DECLARE = "DECLARE"
    DEPLOY_ACCOUNT = "DEPLOY_ACCOUNT"
    DEPLOY = "DEPLOY"
    L1_HANDLER = "L1_HANDLER"


@dataclass
class Transaction(ABC):
    """
    Dataclass representing common attributes of all transactions.
    """

    # Technically, RPC specification moved 'transaction_hash' out of the TXN object, but since it is always returned
    # together with the rest of the data, it remains here (but is still Optional just in case as spec says)
    hash: Optional[int]
    signature: List[int]
    version: int

    def __post_init__(self):
        if self.__class__ == Transaction:
            raise TypeError("Cannot instantiate abstract Transaction class.")


@dataclass
class DeprecatedTransaction(Transaction):
    """
    Dataclass representing common attributes of transactions v1 and v2.
    """

    max_fee: int

    def __post_init__(self):
        if self.__class__ == DeprecatedTransaction:
            raise TypeError("Cannot instantiate abstract DeprecatedTransaction class.")


@dataclass
class TransactionV3(Transaction):
    """
    Dataclass representing common attributes of all transactions v3.
    """

    resource_bounds: ResourceBoundsMapping
    paymaster_data: List[int]
    tip: int
    nonce_data_availability_mode: DAMode
    fee_data_availability_mode: DAMode

    def __post_init__(self):
        if self.__class__ == TransactionV3:
            raise TypeError("Cannot instantiate abstract TransactionV3 class.")


@dataclass
class InvokeTransactionV0(DeprecatedTransaction):
    """
    Dataclass representing invoke transaction v0.
    """

    calldata: List[int]
    contract_address: int
    entry_point_selector: int


@dataclass
class InvokeTransactionV1(DeprecatedTransaction):
    """
    Dataclass representing invoke transaction v1.
    """

    calldata: List[int]
    sender_address: int
    nonce: int


@dataclass
class InvokeTransactionV3(TransactionV3):
    """
    Dataclass representing invoke transaction v3.
    """

    calldata: List[int]
    sender_address: int
    nonce: int
    account_deployment_data: List[int]


@dataclass
class DeclareTransactionV0(DeprecatedTransaction):
    """
    Dataclass representing declare transaction v0.
    """

    sender_address: int
    class_hash: int


@dataclass
class DeclareTransactionV1(DeprecatedTransaction):
    """
    Dataclass representing declare transaction v1.
    """

    sender_address: int
    class_hash: int
    nonce: int


@dataclass
class DeclareTransactionV2(DeprecatedTransaction):
    """
    Dataclass representing declare transaction v2.
    """

    sender_address: int
    class_hash: int
    compiled_class_hash: int
    nonce: int


@dataclass
class DeclareTransactionV3(TransactionV3):
    """
    Dataclass representing declare transaction v3.
    """

    sender_address: int
    class_hash: int
    compiled_class_hash: int
    nonce: int
    account_deployment_data: List[int]


@dataclass
class DeployTransaction(Transaction):
    """
    Dataclass representing deploy transaction.
    """

    contract_address_salt: int
    constructor_calldata: List[int]
    class_hash: int


@dataclass
class DeployAccountTransactionV1(DeprecatedTransaction):
    """
    Dataclass representing deploy account transaction v1.
    """

    nonce: int
    contract_address_salt: int
    constructor_calldata: List[int]
    class_hash: int


@dataclass
class DeployAccountTransactionV3(TransactionV3):
    """
    Dataclass representing deploy account transaction v3.
    """

    nonce: int
    contract_address_salt: int
    constructor_calldata: List[int]
    class_hash: int


@dataclass
class L1HandlerTransaction(Transaction):
    """
    Dataclass representing l1 handler transaction.
    """

    contract_address: int
    calldata: List[int]
    entry_point_selector: int
    nonce: int


class TransactionStatus(Enum):
    """
    Enum representing transaction statuses.
    """

    RECEIVED = "RECEIVED"
    REJECTED = "REJECTED"
    ACCEPTED_ON_L2 = "ACCEPTED_ON_L2"
    ACCEPTED_ON_L1 = "ACCEPTED_ON_L1"


class TransactionExecutionStatus(Enum):
    """
    Enum representing transaction execution statuses.
    """

    SUCCEEDED = "SUCCEEDED"
    REVERTED = "REVERTED"


class TransactionFinalityStatus(Enum):
    """
    Enum representing transaction finality statuses.
    """

    ACCEPTED_ON_L2 = "ACCEPTED_ON_L2"
    ACCEPTED_ON_L1 = "ACCEPTED_ON_L1"


@dataclass
class DataResources:
    """
    Dataclass representing the data-availability resources of the transaction
    """

    l1_gas: int
    l1_data_gas: int


@dataclass
class ComputationResources:
    """
    Dataclass representing the resources consumed by the VM.
    """

    # pylint: disable=too-many-instance-attributes

    steps: int
    memory_holes: Optional[int]
    range_check_builtin_applications: Optional[int]
    pedersen_builtin_applications: Optional[int]
    poseidon_builtin_applications: Optional[int]
    ec_op_builtin_applications: Optional[int]
    ecdsa_builtin_applications: Optional[int]
    bitwise_builtin_applications: Optional[int]
    keccak_builtin_applications: Optional[int]
    segment_arena_builtin: Optional[int]


@dataclass
class ExecutionResources(ComputationResources):
    """
    Dataclass representing the resources consumed by the transaction, includes both computation and data.
    """

    data_availability: DataResources


# TODO (#1219): split into PendingTransactionReceipt and TransactionReceipt
@dataclass
class TransactionReceipt:
    """
    Dataclass representing details of sent transaction.
    """

    # pylint: disable=too-many-instance-attributes

    transaction_hash: int
    execution_status: TransactionExecutionStatus
    finality_status: TransactionFinalityStatus
    execution_resources: ExecutionResources
    actual_fee: FeePayment
    type: TransactionType

    events: List[Event] = field(default_factory=list)
    messages_sent: List[L2toL1Message] = field(default_factory=list)

    block_number: Optional[int] = None
    block_hash: Optional[int] = None

    contract_address: Optional[int] = None  # DEPLOY_ACCOUNT_TXN_RECEIPT only
    message_hash: Optional[int] = None  # L1_HANDLER_TXN_RECEIPT only

    revert_reason: Optional[str] = None


@dataclass
class TransactionWithReceipt:
    transaction: Transaction
    receipt: TransactionReceipt


@dataclass
class SentTransactionResponse:
    """
    Dataclass representing a result of sending a transaction to Starknet.
    """

    transaction_hash: int
    code: Optional[str] = None


@dataclass
class DeclareTransactionResponse(SentTransactionResponse):
    """
    Dataclass representing a result of declaring a contract on Starknet.
    """

    class_hash: int = 0


@dataclass
class DeployAccountTransactionResponse(SentTransactionResponse):
    """
    Dataclass representing a result of deploying an account contract to Starknet.
    """

    address: int = 0


class BlockStatus(Enum):
    """
    Enum representing block status.
    """

    PENDING = "PENDING"
    REJECTED = "REJECTED"
    ACCEPTED_ON_L2 = "ACCEPTED_ON_L2"
    ACCEPTED_ON_L1 = "ACCEPTED_ON_L1"


@dataclass
class PendingBlockHeader:
    parent_hash: int
    timestamp: int
    sequencer_address: int
    l1_gas_price: ResourcePrice
    l1_data_gas_price: ResourcePrice
    l1_da_mode: L1DAMode
    starknet_version: str


@dataclass
class PendingStarknetBlock(PendingBlockHeader):
    """
    Dataclass representing a pending block on Starknet.
    """

    transactions: List[Transaction]


@dataclass
class PendingStarknetBlockWithTxHashes(PendingBlockHeader):
    """
    Dataclass representing a pending block on Starknet containing transaction hashes.
    """

    transactions: List[int]


@dataclass
class PendingStarknetBlockWithReceipts(PendingBlockHeader):
    """
    Dataclass representing a pending block on Starknet with txs and receipts result
    """

    transactions: List[TransactionWithReceipt]


@dataclass
class BlockHeader:
    """
    Dataclass representing a block header.
    """

    # pylint: disable=too-many-instance-attributes

    block_hash: int
    parent_hash: int
    block_number: int
    new_root: int
    timestamp: int
    sequencer_address: int
    l1_gas_price: ResourcePrice
    l1_data_gas_price: ResourcePrice
    l1_da_mode: L1DAMode
    starknet_version: str


@dataclass
class StarknetBlock(BlockHeader):
    """
    Dataclass representing a block on Starknet.
    """

    status: BlockStatus
    transactions: List[Transaction]


@dataclass
class StarknetBlockWithTxHashes(BlockHeader):
    """
    Dataclass representing a block on Starknet containing transaction hashes.
    """

    status: BlockStatus
    transactions: List[int]


@dataclass
class StarknetBlockWithReceipts(BlockHeader):
    """
    Dataclass representing a block on Starknet with txs and receipts result
    """

    status: BlockStatus
    transactions: List[TransactionWithReceipt]


@dataclass
class BlockHashAndNumber:
    block_hash: int
    block_number: int


@dataclass
class SyncStatus:
    starting_block_hash: int
    starting_block_num: int
    current_block_hash: int
    current_block_num: int
    highest_block_hash: int
    highest_block_num: int


@dataclass
class StorageEntry:
    """
    Dataclass representing single change in the storage.
    """

    key: int
    value: int


@dataclass
class StorageDiffItem:
    """
    Dataclass representing all storage changes for the contract.
    """

    address: int
    storage_entries: List[StorageEntry]


@dataclass
class EstimatedFee:
    """
    Dataclass representing estimated fee.
    """

    gas_consumed: int
    gas_price: int
    data_gas_consumed: int
    data_gas_price: int
    overall_fee: int
    unit: PriceUnit

    def to_resource_bounds(
        self, amount_multiplier=1.5, unit_price_multiplier=1.5
    ) -> ResourceBoundsMapping:
        """
        Converts estimated fee to resource bounds with applied multipliers.

        Calculates max amount as `max_amount` = `overall_fee` / `gas_price`, unless `gas_price` is 0,
        then `max_amount` is 0. Calculates max price per unit as `max_price_per_unit` = `gas_price`.

        Then multiplies `max_amount` by `amount_multiplier` and `max_price_per_unit` by `unit_price_multiplier`.

        :param amount_multiplier: Multiplier for max amount, defaults to 1.5.
        :param unit_price_multiplier: Multiplier for max price per unit, defaults to 1.5.
        :return: Resource bounds with applied multipliers.
        """

        if amount_multiplier <= 0 or unit_price_multiplier <= 0:
            raise ValueError(
                "Values of 'amount_multiplier' and 'unit_price_multiplier' must be greater than 0"
            )

        l1_resource_bounds = ResourceBounds(
            max_amount=int(
                (self.overall_fee / self.gas_price) * amount_multiplier
                if self.gas_price != 0
                else 0
            ),
            max_price_per_unit=int(self.gas_price * unit_price_multiplier),
        )

        return ResourceBoundsMapping(
            l1_gas=l1_resource_bounds, l2_gas=ResourceBounds.init_with_zeros()
        )


@dataclass
class DeployedContract:
    """
    Dataclass representing basic data of the deployed contract.
    """

    address: int
    class_hash: int


@dataclass
class ContractsNonce:
    """
    Dataclass representing nonce of the contract.
    """

    contract_address: int
    nonce: int


@dataclass
class DeclaredContractHash:
    """
    Dataclass containing hashes of the declared contract.
    """

    class_hash: int
    compiled_class_hash: int


@dataclass
class ReplacedClass:
    """
    Dataclass representing new class_hash of the contract.
    """

    contract_address: int
    class_hash: int


@dataclass
class StateDiff:
    """
    Dataclass representing state changes in the block.
    """

    storage_diffs: List[StorageDiffItem]
    deprecated_declared_classes: List[int]
    declared_classes: List[DeclaredContractHash]
    deployed_contracts: List[DeployedContract]
    replaced_classes: List[ReplacedClass]
    nonces: List[ContractsNonce]


@dataclass
class BlockStateUpdate:
    """
    Dataclass representing a change in state of a block.
    """

    block_hash: int
    new_root: int
    old_root: int
    state_diff: StateDiff


@dataclass
class PendingBlockStateUpdate:
    """
    Dataclass representing a pending change in state of a block.
    """

    old_root: int
    state_diff: StateDiff


@dataclass
class EntryPoint:
    """
    Dataclass representing contract entry point.
    """

    offset: int
    selector: int


@dataclass
class EntryPointsByType:
    """
    Dataclass representing contract class entrypoints by entry point type.
    """

    constructor: List[EntryPoint]
    external: List[EntryPoint]
    l1_handler: List[EntryPoint]


@dataclass
class ContractClass:
    """
    Dataclass representing contract declared to Starknet.
    """

    program: dict
    entry_points_by_type: EntryPointsByType
    abi: Optional[AbiDictList] = None


@dataclass
class CompiledContract(ContractClass):
    """
    Dataclass representing ContractClass with required abi.
    """

    # abi is a required key in CompiledContractSchema,
    # default_factory is used, since abi in ContractClass is Optional
    # and otherwise, non-keyword arguments would follow keyword arguments
    abi: AbiDictList = field(default_factory=list)


@dataclass
class SierraEntryPoint:
    """
    Dataclass representing contract entry point
    """

    function_idx: int
    selector: int


@dataclass
class SierraEntryPointsByType:
    """
    Dataclass representing contract class entrypoints by entry point type
    """

    constructor: List[SierraEntryPoint]
    external: List[SierraEntryPoint]
    l1_handler: List[SierraEntryPoint]


@dataclass
class SierraContractClass:
    """
    Dataclass representing Cairo1 contract declared to Starknet
    """

    contract_class_version: str
    sierra_program: List[str]
    entry_points_by_type: SierraEntryPointsByType
    abi: Optional[str] = None

    @property
    def parsed_abi(self) -> Union[AbiDictListV2, AbiDictListV1]:
        if self.abi is None:
            return []

        load_abi: List = json.loads(self.abi)

        if _is_abi_v2(load_abi):
            return [
                cast(
                    AbiDictEntryV2,
                    ContractAbiEntrySchemaV2(unknown=EXCLUDE).load(entry),
                )
                for entry in load_abi
            ]

        return [
            cast(AbiDictEntryV1, ContractAbiEntrySchemaV1(unknown=EXCLUDE).load(entry))
            for entry in load_abi
        ]


@dataclass
class SierraCompiledContract(SierraContractClass):
    """
    Dataclass representing SierraContractClass with required abi.
    """

    abi: str = field(default_factory=str)


@dataclass
class CasmClassEntryPoint:
    """
    Dataclass representing CasmClass entrypoint.
    """

    selector: int
    offset: int
    builtins: Optional[List[str]]


@dataclass
class CasmClassEntryPointsByType:
    """
    Dataclass representing CasmClass entrypoints by entry point type.
    """

    constructor: List[CasmClassEntryPoint]
    external: List[CasmClassEntryPoint]
    l1_handler: List[CasmClassEntryPoint]


@dataclass
class CasmClass:
    """
    Dataclass representing class compiled to Cairo assembly.
    """

    prime: int
    bytecode: List[int]
    hints: List[Any]
    pythonic_hints: List[Any]
    compiler_version: str
    entry_points_by_type: CasmClassEntryPointsByType
    bytecode_segment_lengths: Optional[List[int]]


@dataclass
class TransactionStatusResponse:
    """
    Dataclass representing transaction status for the FullNodeClient.
    """

    finality_status: TransactionStatus
    execution_status: Optional[TransactionExecutionStatus] = None


# ------------------------------- Trace API dataclasses -------------------------------


@dataclass
class OrderedEvent:
    """
    Dataclass representing an event alongside its order within the transaction.
    """

    keys: List[int]
    data: List[int]
    order: int


@dataclass
class OrderedMessage:
    """
    Dataclass representing a message alongside its order within the transaction.
    """

    payload: List[int]
    l2_address: int  # from_address in spec
    l1_address: int  # to_address in spec
    order: int


class SimulationFlag(str, Enum):
    """
    Enum class representing possible simulation flags for trace API.
    """

    SKIP_VALIDATE = "SKIP_VALIDATE"
    SKIP_FEE_CHARGE = "SKIP_FEE_CHARGE"


class EntryPointType(Enum):
    """
    Enum class representing entry point types.
    """

    EXTERNAL = "EXTERNAL"
    L1_HANDLER = "L1_HANDLER"
    CONSTRUCTOR = "CONSTRUCTOR"


class CallType(Enum):
    """
    Enum class representing call types.
    """

    DELEGATE = "DELEGATE"
    LIBRARY_CALL = "LIBRARY_CALL"
    CALL = "CALL"


@dataclass
class FunctionInvocation:
    """
    Dataclass representing an invocation of a function.
    """

    # pylint: disable=too-many-instance-attributes
    contract_address: int
    entry_point_selector: int
    calldata: List[int]
    caller_address: int
    class_hash: int
    entry_point_type: EntryPointType
    call_type: CallType
    result: List[int]
    calls: List["FunctionInvocation"]
    events: List[OrderedEvent]
    messages: List[OrderedMessage]
    computation_resources: ComputationResources


@dataclass
class RevertedFunctionInvocation:
    """
    Dataclass representing revert reason for the transaction.
    """

    revert_reason: str


@dataclass
class InvokeTransactionTrace:
    """
    Dataclass representing a transaction trace of an INVOKE transaction.
    """

    execute_invocation: Union[FunctionInvocation, RevertedFunctionInvocation]
    execution_resources: ExecutionResources
    validate_invocation: Optional[FunctionInvocation] = None
    fee_transfer_invocation: Optional[FunctionInvocation] = None
    state_diff: Optional[StateDiff] = None


@dataclass
class DeclareTransactionTrace:
    """
    Dataclass representing a transaction trace of an DECLARE transaction.
    """

    execution_resources: ExecutionResources
    validate_invocation: Optional[FunctionInvocation] = None
    fee_transfer_invocation: Optional[FunctionInvocation] = None
    state_diff: Optional[StateDiff] = None


@dataclass
class DeployAccountTransactionTrace:
    """
    Dataclass representing a transaction trace of an DEPLOY_ACCOUNT transaction.
    """

    constructor_invocation: FunctionInvocation
    execution_resources: ExecutionResources
    validate_invocation: Optional[FunctionInvocation] = None
    fee_transfer_invocation: Optional[FunctionInvocation] = None
    state_diff: Optional[StateDiff] = None


@dataclass
class L1HandlerTransactionTrace:
    """
    Dataclass representing a transaction trace of an L1_HANDLER transaction.
    """

    execution_resources: ExecutionResources
    function_invocation: FunctionInvocation
    state_diff: Optional[StateDiff] = None


TransactionTrace = Union[
    InvokeTransactionTrace,
    DeclareTransactionTrace,
    DeployAccountTransactionTrace,
    L1HandlerTransactionTrace,
]


@dataclass
class SimulatedTransaction:
    """
    Dataclass representing a simulated transaction returned by `starknet_simulateTransactions` method.
    """

    transaction_trace: TransactionTrace
    fee_estimation: EstimatedFee


@dataclass
class BlockTransactionTrace:
    """
    Dataclass representing a single transaction trace in a block.
    """

    transaction_hash: int
    trace_root: TransactionTrace

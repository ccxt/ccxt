from typing import List, Optional, Tuple, Union, cast

import aiohttp
from ..marshmallow import EXCLUDE

from constants import RPC_CONTRACT_ERROR
from hash.utils import keccak256
from net.client import Client
from net.client_errors import ClientError
from net.client_models import (
    BlockHashAndNumber,
    BlockStateUpdate,
    BlockTransactionTrace,
    Call,
    ContractClass,
    DeclareTransactionResponse,
    DeployAccountTransactionResponse,
    EstimatedFee,
    EventsChunk,
    Hash,
    L1HandlerTransaction,
    PendingBlockStateUpdate,
    PendingStarknetBlock,
    PendingStarknetBlockWithReceipts,
    PendingStarknetBlockWithTxHashes,
    SentTransactionResponse,
    SierraContractClass,
    SimulatedTransaction,
    SimulationFlag,
    StarknetBlock,
    StarknetBlockWithReceipts,
    StarknetBlockWithTxHashes,
    SyncStatus,
    Tag,
    Transaction,
    TransactionReceipt,
    TransactionStatusResponse,
    TransactionTrace,
)
from net.client_utils import (
    _create_broadcasted_txn,
    _is_valid_eth_address,
    _to_rpc_felt,
    _to_storage_key,
    encode_l1_message,
)
from net.http_client import RpcHttpClient
from net.models.transaction import (
    AccountTransaction,
    Declare,
    DeployAccount,
    Invoke,
)
from net.schemas.rpc import (
    BlockHashAndNumberSchema,
    BlockStateUpdateSchema,
    BlockTransactionTraceSchema,
    ContractClassSchema,
    DeclareTransactionResponseSchema,
    DeployAccountTransactionResponseSchema,
    EstimatedFeeSchema,
    EventsChunkSchema,
    PendingBlockStateUpdateSchema,
    PendingStarknetBlockSchema,
    PendingStarknetBlockWithReceiptsSchema,
    PendingStarknetBlockWithTxHashesSchema,
    SentTransactionSchema,
    SierraContractClassSchema,
    SimulatedTransactionSchema,
    StarknetBlockSchema,
    StarknetBlockWithReceiptsSchema,
    StarknetBlockWithTxHashesSchema,
    SyncStatusSchema,
    TransactionReceiptSchema,
    TransactionStatusResponseSchema,
    TransactionTraceSchema,
    TypesOfTransactionsSchema,
)
from transaction_errors import TransactionNotReceivedError
from utils.sync import add_sync_methods


@add_sync_methods
class FullNodeClient(Client):
    # pylint: disable=too-many-public-methods
    def __init__(
        self,
        node_url: str,
        session: Optional[aiohttp.ClientSession] = None,
    ):
        """
        Client for interacting with Starknet json-rpc interface.

        :param node_url: Url of the node providing rpc interface
        :param net: Starknet network identifier
        :param session: Aiohttp session to be used for request. If not provided, client will create a session for
                        every request. When using a custom session, user is responsible for closing it manually.
        """
        self.url = node_url
        self._client = RpcHttpClient(url=node_url, session=session)

    async def get_block(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[StarknetBlock, PendingStarknetBlock]:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getBlockWithTxs",
            params=block_identifier,
        )
        if block_identifier == {"block_id": "pending"}:
            return cast(
                PendingStarknetBlock,
                PendingStarknetBlockSchema().load(res, unknown=EXCLUDE),
            )
        return cast(StarknetBlock, StarknetBlockSchema().load(res, unknown=EXCLUDE))

    async def get_block_with_txs(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[StarknetBlock, PendingStarknetBlock]:
        return await self.get_block(block_hash=block_hash, block_number=block_number)

    # TODO (#1323): remove unknown=EXCLUDE after devnet response fix
    async def get_block_with_tx_hashes(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[StarknetBlockWithTxHashes, PendingStarknetBlockWithTxHashes]:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getBlockWithTxHashes",
            params=block_identifier,
        )

        if block_identifier == {"block_id": "pending"}:
            return cast(
                PendingStarknetBlockWithTxHashes,
                PendingStarknetBlockWithTxHashesSchema().load(res, unknown=EXCLUDE),
            )
        return cast(
            StarknetBlockWithTxHashes,
            StarknetBlockWithTxHashesSchema().load(res),
        )

    async def get_block_with_receipts(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ):
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getBlockWithReceipts",
            params=block_identifier,
        )

        if block_identifier == {"block_id": "pending"}:
            return cast(
                PendingStarknetBlockWithReceipts,
                PendingStarknetBlockWithReceiptsSchema().load(res),
            )
        return cast(
            StarknetBlockWithReceipts,
            StarknetBlockWithReceiptsSchema().load(res),
        )

    # TODO (#809): add tests with multiple emitted keys
    async def get_events(
        self,
        address: Optional[Hash] = None,
        keys: Optional[List[List[Hash]]] = None,
        *,
        from_block_number: Optional[Union[int, Tag]] = None,
        from_block_hash: Optional[Union[Hash, Tag]] = None,
        to_block_number: Optional[Union[int, Tag]] = None,
        to_block_hash: Optional[Union[Hash, Tag]] = None,
        follow_continuation_token: bool = False,
        continuation_token: Optional[str] = None,
        chunk_size: int = 1,
    ) -> EventsChunk:
        # pylint: disable=too-many-arguments
        """
        :param address: The address of the contract that emitted the event.
        :param keys: List consisting lists of keys by which the events are filtered. They match the keys *by position*,
            e.g. given an event with 3 keys, [[1,2],[],[3]] which should return events that have either 1 or 2 in
            the first key, any value for their second key and 3 for their third key.
        :param from_block_number: Number of the block from which events searched for **starts**
            or literals `"pending"` or `"latest"`. Mutually exclusive with ``from_block_hash`` parameter.
            If not provided, query starts from block 0.
        :param from_block_hash: Hash of the block from which events searched for **starts**
            or literals `"pending"` or `"latest"`. Mutually exclusive with ``from_block_number`` parameter.
            If not provided, query starts from block 0.
        :param to_block_number: Number of the block to which events searched for **end**
            or literals `"pending"` or `"latest"`. Mutually exclusive with ``to_block_hash`` parameter.
            If not provided, query ends at block `"pending"`.
        :param to_block_hash: Hash of the block to which events searched for **end**
            or literals `"pending"` or `"latest"`. Mutually exclusive with ``to_block_number`` parameter.
            If not provided, query ends at block `"pending"`.
        :param follow_continuation_token: Flag deciding whether all events should be collected during one function call,
            defaults to False.
        :param continuation_token: Continuation token from which the returned events start.
        :param chunk_size: Size of chunk of events returned by one ``get_events`` call, defaults to 1 (minimum).

        :return: ``EventsResponse`` dataclass containing events and optional continuation token.
        """

        if chunk_size <= 0:
            raise ValueError("Argument chunk_size must be greater than 0.")

        if keys is None:
            keys = []
        if address is not None:
            address = _to_rpc_felt(address)
        if from_block_number is None and from_block_hash is None:
            from_block_number = 0

        from_block = _get_raw_block_identifier(from_block_hash, from_block_number)
        to_block = _get_raw_block_identifier(to_block_hash, to_block_number)
        keys = [[_to_rpc_felt(key) for key in inner_list] for inner_list in keys]

        events_list = []
        while True:
            events, continuation_token = await self._get_events_chunk(
                from_block=from_block,
                to_block=to_block,
                address=address,
                keys=keys,
                chunk_size=chunk_size,
                continuation_token=continuation_token,
            )
            events_list.extend(events)
            if not follow_continuation_token or continuation_token is None:
                break

        events_response = cast(
            EventsChunk,
            EventsChunkSchema().load(
                {"events": events_list, "continuation_token": continuation_token}
            ),
        )

        return events_response

    async def _get_events_chunk(
        self,
        from_block: Union[dict, Hash, Tag, None],
        to_block: Union[dict, Hash, Tag, None],
        keys: List[List[Hash]],
        chunk_size: int,
        address: Optional[Hash] = None,
        continuation_token: Optional[str] = None,
    ) -> Tuple[list, Optional[str]]:
        # pylint: disable=too-many-arguments
        params = {
            "chunk_size": chunk_size,
            "from_block": from_block,
            "to_block": to_block,
            "keys": keys,
        }
        if continuation_token is not None:
            params["continuation_token"] = continuation_token
        if address is not None:
            params["address"] = address

        res = await self._client.call(
            method_name="getEvents",
            params={"filter": params},
        )

        if "continuation_token" in res:
            return res["events"], res["continuation_token"]
        return res["events"], None

    # TODO (#1323): remove unknown=EXCLUDE after devnet fix response
    async def get_state_update(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[BlockStateUpdate, PendingBlockStateUpdate]:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getStateUpdate",
            params=block_identifier,
        )

        if block_identifier == {"block_id": "pending"}:
            return cast(
                PendingBlockStateUpdate,
                PendingBlockStateUpdateSchema().load(res, unknown=EXCLUDE),
            )
        return cast(BlockStateUpdate, BlockStateUpdateSchema().load(res))

    async def get_storage_at(
        self,
        contract_address: Hash,
        key: int,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getStorageAt",
            params={
                "contract_address": _to_rpc_felt(contract_address),
                "key": _to_storage_key(key),
                **block_identifier,
            },
        )
        res = cast(str, res)
        return int(res, 16)

    async def get_transaction(
        self,
        tx_hash: Hash,
    ) -> Transaction:
        try:
            res = await self._client.call(
                method_name="getTransactionByHash",
                params={"transaction_hash": _to_rpc_felt(tx_hash)},
            )
        except ClientError as ex:
            raise TransactionNotReceivedError() from ex
        return cast(Transaction, TypesOfTransactionsSchema().load(res))

    async def get_l1_message_hash(self, tx_hash: Hash) -> Hash:
        """
        :param tx_hash: Transaction's hash
        :return: Message hash
        """
        tx = await self.get_transaction(tx_hash)
        if not isinstance(tx, L1HandlerTransaction):
            raise TypeError(
                f"Transaction {tx_hash} is not a result of L1->L2 interaction."
            )

        encoded_message = encode_l1_message(tx)
        return keccak256(encoded_message)

    async def get_transaction_receipt(self, tx_hash: Hash) -> TransactionReceipt:
        res = await self._client.call(
            method_name="getTransactionReceipt",
            params={"transaction_hash": _to_rpc_felt(tx_hash)},
        )
        return cast(TransactionReceipt, TransactionReceiptSchema().load(res))

    async def estimate_fee(
        self,
        tx: Union[AccountTransaction, List[AccountTransaction]],
        skip_validate: bool = False,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[EstimatedFee, List[EstimatedFee]]:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        if single_transaction := isinstance(tx, AccountTransaction):
            tx = [tx]

        res = await self._client.call(
            method_name="estimateFee",
            params={
                "request": [_create_broadcasted_txn(transaction=t) for t in tx],
                "simulation_flags": [SimulationFlag.SKIP_VALIDATE]
                if skip_validate
                else [],
                **block_identifier,
            },
        )

        if single_transaction:
            res = res[0]

        return cast(
            EstimatedFee,
            EstimatedFeeSchema().load(res, many=not single_transaction),
        )

    async def estimate_message_fee(
        self,
        from_address: str,
        to_address: Hash,
        entry_point_selector: Hash,
        payload: List[Hash],
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> EstimatedFee:
        # pylint: disable=too-many-arguments
        """
        :param from_address: The address of the L1 (Ethereum) contract sending the message.
        :param to_address: The target L2 (Starknet) address the message is sent to.
        :param entry_point_selector: The selector of the l1_handler in invoke in the target contract.
        :param payload: Payload of the message.
        :param block_hash: Hash of the requested block or literals `"pending"` or `"latest"`.
            Mutually exclusive with ``block_number`` parameter. If not provided, queries block `"pending"`.
        :param block_number: Number (height) of the requested block or literals `"pending"` or `"latest"`.
            Mutually exclusive with ``block_hash`` parameter. If not provided, queries block `"pending"`.
        """
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        assert _is_valid_eth_address(
            from_address
        ), f"Argument 'from_address': {from_address} is not a valid Ethereum address."

        message_body = {
            "from_address": from_address,
            "to_address": _to_rpc_felt(to_address),
            "entry_point_selector": _to_rpc_felt(entry_point_selector),
            "payload": [_to_rpc_felt(x) for x in payload],
        }

        try:
            res = await self._client.call(
                method_name="estimateMessageFee",
                params={
                    "message": message_body,
                    **block_identifier,
                },
            )
            return cast(EstimatedFee, EstimatedFeeSchema().load(res))
        except ClientError as err:
            if err.code == RPC_CONTRACT_ERROR:
                raise ClientError(
                    err.message
                    + f" Note that your ETH address ('from_address': {from_address}) might be invalid"
                ) from err
            raise err

    async def get_block_number(self) -> int:
        """Get the most recent accepted block number"""
        return await self._client.call(method_name="blockNumber", params={})

    async def get_block_hash_and_number(self) -> BlockHashAndNumber:
        """Get the most recent accepted block hash and number"""
        res = await self._client.call(method_name="blockHashAndNumber", params={})
        return cast(BlockHashAndNumber, BlockHashAndNumberSchema().load(res))

    async def get_chain_id(self) -> str:
        return await self._client.call(method_name="chainId", params={})

    async def get_syncing_status(self) -> Union[bool, SyncStatus]:
        """Returns an object about the sync status, or false if the node is not syncing"""
        sync_status = await self._client.call(method_name="syncing", params={})
        if isinstance(sync_status, bool):
            return sync_status
        return cast(SyncStatus, SyncStatusSchema().load(sync_status))

    async def call_contract(
        self,
        call: Call,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> List[int]:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )
        res = await self._client.call(
            method_name="call",
            params={
                "request": {
                    "contract_address": _to_rpc_felt(call.to_addr),
                    "entry_point_selector": _to_rpc_felt(call.selector),
                    "calldata": [_to_rpc_felt(i1) for i1 in call.calldata],
                },
                **block_identifier,
            },
        )
        return [int(i, 16) for i in res]

    async def send_transaction(self, transaction: Invoke) -> SentTransactionResponse:
        params = _create_broadcasted_txn(transaction=transaction)

        res = await self._client.call(
            method_name="addInvokeTransaction",
            params={"invoke_transaction": params},
        )

        return cast(SentTransactionResponse, SentTransactionSchema().load(res))

    async def deploy_account(
        self, transaction: DeployAccount
    ) -> DeployAccountTransactionResponse:
        params = _create_broadcasted_txn(transaction=transaction)

        res = await self._client.call(
            method_name="addDeployAccountTransaction",
            params={"deploy_account_transaction": params},
        )

        return cast(
            DeployAccountTransactionResponse,
            DeployAccountTransactionResponseSchema().load(res),
        )

    async def declare(self, transaction: Declare) -> DeclareTransactionResponse:
        params = _create_broadcasted_txn(transaction=transaction)

        res = await self._client.call(
            method_name="addDeclareTransaction",
            params={"declare_transaction": {**params}},
        )

        return cast(
            DeclareTransactionResponse,
            DeclareTransactionResponseSchema().load(res),
        )

    async def get_class_hash_at(
        self,
        contract_address: Hash,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )
        res = await self._client.call(
            method_name="getClassHashAt",
            params={
                "contract_address": _to_rpc_felt(contract_address),
                **block_identifier,
            },
        )
        res = cast(str, res)
        return int(res, 16)

    async def get_class_by_hash(
        self,
        class_hash: Hash,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[SierraContractClass, ContractClass]:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getClass",
            params={
                "class_hash": _to_rpc_felt(class_hash),
                **block_identifier,
            },
        )

        if "sierra_program" in res:
            return cast(
                SierraContractClass,
                SierraContractClassSchema().load(res),
            )
        return cast(ContractClass, ContractClassSchema().load(res))

    # Only RPC methods

    async def get_transaction_by_block_id(
        self,
        index: int,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Transaction:
        """
        Get the details of transaction in block identified by block_hash and transaction index.

        :param index: Index of the transaction
        :param block_hash: Hash of the block
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: Transaction object
        """
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getTransactionByBlockIdAndIndex",
            params={
                **block_identifier,
                "index": index,
            },
        )
        return cast(Transaction, TypesOfTransactionsSchema().load(res))

    async def get_block_transaction_count(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        """
        Get the number of transactions in a block given a block id

        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: Number of transactions in the designated block
        """
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getBlockTransactionCount",
            params=block_identifier,
        )
        res = cast(int, res)
        return res

    async def get_class_at(
        self,
        contract_address: Hash,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[SierraContractClass, ContractClass]:
        """
        Get the contract class definition in the given block at the given address

        :param contract_address: The address of the contract whose class definition will be returned
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: Contract declared to Starknet
        """
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="getClassAt",
            params={
                **block_identifier,
                "contract_address": _to_rpc_felt(contract_address),
            },
        )

        if "sierra_program" in res:
            return cast(
                SierraContractClass,
                SierraContractClassSchema().load(res),
            )
        return cast(ContractClass, ContractClassSchema().load(res))

    async def get_contract_nonce(
        self,
        contract_address: Hash,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )
        res = await self._client.call(
            method_name="getNonce",
            params={
                "contract_address": _to_rpc_felt(contract_address),
                **block_identifier,
            },
        )
        res = cast(str, res)
        return int(res, 16)

    async def spec_version(self) -> str:
        """
        Returns the version of the Starknet JSON-RPC specification being used.

        :return: String with version of the Starknet JSON-RPC specification.
        """
        res = await self._client.call(
            method_name="specVersion",
            params={},
        )
        return res

    async def get_transaction_status(self, tx_hash: Hash) -> TransactionStatusResponse:
        res = await self._client.call(
            method_name="getTransactionStatus",
            params={"transaction_hash": _to_rpc_felt(tx_hash)},
        )
        return cast(
            TransactionStatusResponse,
            TransactionStatusResponseSchema().load(res),
        )

    # ------------------------------- Trace API -------------------------------

    async def trace_transaction(
        self,
        tx_hash: Hash,
    ) -> TransactionTrace:
        """
        For a given executed transaction, returns the trace of its execution, including internal calls.

        :param tx_hash: Hash of the executed transaction.
        :return: Trace of the transaction.
        """
        res = await self._client.call(
            method_name="traceTransaction",
            params={
                "transaction_hash": _to_rpc_felt(tx_hash),
            },
        )
        return cast(TransactionTrace, TransactionTraceSchema().load(res))

    async def simulate_transactions(
        self,
        transactions: List[AccountTransaction],
        skip_validate: bool = False,
        skip_fee_charge: bool = False,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> List[SimulatedTransaction]:
        # pylint: disable=too-many-arguments
        """
        Simulates a given sequence of transactions on the requested state, and generates the execution traces.
        Note the following:

        - A transaction may revert. If this occurs, no error is thrown. Instead, revert details are visible
          in the returned trace object.
        - If a transaction reverts, this will be reflected by the revert_error property in the trace.
        - Other types of failures (e.g. unexpected error or failure in the validation phase) will result
          in TRANSACTION_EXECUTION_ERROR.

        :param transactions: Transactions to be traced.
        :param skip_validate: Flag checking whether the validation part of the transaction should be executed.
        :param skip_fee_charge: Flag deciding whether fee should be deducted from the balance before the simulation
            of the next transaction.
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: The execution trace and consumed resources for each transaction.
        """
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        simulation_flags = []
        if skip_validate:
            simulation_flags.append(SimulationFlag.SKIP_VALIDATE)
        if skip_fee_charge:
            simulation_flags.append(SimulationFlag.SKIP_FEE_CHARGE)

        res = await self._client.call(
            method_name="simulateTransactions",
            params={
                **block_identifier,
                "simulation_flags": simulation_flags,
                "transactions": [
                    _create_broadcasted_txn(transaction=t) for t in transactions
                ],
            },
        )
        return cast(
            List[SimulatedTransaction],
            SimulatedTransactionSchema().load(res, many=True),
        )

    async def trace_block_transactions(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> List[BlockTransactionTrace]:
        """
        Retrieve traces for all transactions in the given block.

        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: List of execution traces of all transactions included in the given block with transaction hashes.
        """
        block_identifier = get_block_identifier(
            block_hash=block_hash, block_number=block_number
        )

        res = await self._client.call(
            method_name="traceBlockTransactions",
            params={
                **block_identifier,
            },
        )
        return cast(
            List[BlockTransactionTrace],
            BlockTransactionTraceSchema().load(res, many=True),
        )


def get_block_identifier(
    block_hash: Optional[Union[Hash, Tag]] = None,
    block_number: Optional[Union[int, Tag]] = None,
) -> dict:
    return {"block_id": _get_raw_block_identifier(block_hash, block_number)}


def _get_raw_block_identifier(
    block_hash: Optional[Union[Hash, Tag]] = None,
    block_number: Optional[Union[int, Tag]] = None,
) -> Union[dict, Hash, Tag, None]:
    if block_hash is not None and block_number is not None:
        raise ValueError(
            "Arguments block_hash and block_number are mutually exclusive."
        )

    if block_hash in ("latest", "pending") or block_number in ("latest", "pending"):
        return block_hash or block_number

    if block_hash is not None:
        return {"block_hash": _to_rpc_felt(block_hash)}

    if block_number is not None:
        return {"block_number": block_number}

    return "pending"

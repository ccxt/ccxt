from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from typing import List, Optional, Union

from net.client_errors import ClientError
from net.client_models import (
    BlockStateUpdate,
    BlockTransactionTrace,
    Call,
    ContractClass,
    DeclareTransactionResponse,
    DeployAccountTransactionResponse,
    EstimatedFee,
    Hash,
    SentTransactionResponse,
    SierraContractClass,
    StarknetBlock,
    Tag,
    Transaction,
    TransactionExecutionStatus,
    TransactionReceipt,
    TransactionStatus,
    TransactionStatusResponse,
)
from net.models.transaction import (
    AccountTransaction,
    Declare,
    DeployAccount,
    Invoke,
)
from transaction_errors import (
    TransactionNotReceivedError,
    TransactionRejectedError,
    TransactionRevertedError,
)
from utils.sync import add_sync_methods


@add_sync_methods
class Client(ABC):
    @abstractmethod
    async def get_block(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> StarknetBlock:
        """
        Retrieve the block's data by its number or hash

        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: StarknetBlock object representing retrieved block
        """

    @abstractmethod
    async def trace_block_transactions(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> List[BlockTransactionTrace]:
        """
        Receive the traces of all the transactions within specified block

        :param block_hash: Block's hash
        :param block_number: Block's number or "pending" for pending block
        :return: BlockTransactionTraces object representing received traces
        """

    @abstractmethod
    async def get_state_update(
        self,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> BlockStateUpdate:
        """
        Get the information about the result of executing the requested block

        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: BlockStateUpdate object representing changes in the requested block
        """

    @abstractmethod
    async def get_storage_at(
        self,
        contract_address: Hash,
        key: int,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        """
        :param contract_address: Contract's address on Starknet
        :param key: An address of the storage variable inside the contract.
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: Storage value of given contract
        """

    @abstractmethod
    async def get_transaction(
        self,
        tx_hash: Hash,
    ) -> Transaction:
        """
        Get the details and status of a submitted transaction

        :param tx_hash: Transaction's hash
        :return: Transaction object
        """

    @abstractmethod
    async def get_transaction_receipt(
        self,
        tx_hash: Hash,
    ) -> TransactionReceipt:
        """
        Get the transaction receipt

        :param tx_hash: Transaction's hash
        :return: Transaction receipt object on Starknet
        """

    @abstractmethod
    async def get_transaction_status(self, tx_hash: Hash) -> TransactionStatusResponse:
        """
        Gets the transaction status (possibly reflecting that the transaction is still in the mempool,
        or dropped from it).

        :param tx_hash: Hash of the executed transaction.
        :return: Finality and execution status of a transaction.
        """

    # https://community.starknet.io/t/efficient-utilization-of-sequencer-capacity-in-starknet-v0-12-1/95607
    async def wait_for_tx(
        self,
        tx_hash: Hash,
        check_interval: float = 2,
        retries: int = 500,
    ) -> TransactionReceipt:
        # pylint: disable=too-many-branches
        """
        Awaits for transaction to get accepted or at least pending by polling its status.

        :param tx_hash: Transaction's hash.
        :param check_interval: Defines interval between checks.
        :param retries: Defines how many times the transaction is checked until an error is thrown.
        :return: Transaction receipt.
        """
        if check_interval <= 0:
            raise ValueError("Argument check_interval has to be greater than 0.")
        if retries <= 0:
            raise ValueError("Argument retries has to be greater than 0.")

        transaction_received = False
        while True:
            retries -= 1
            try:
                if not transaction_received:
                    tx_status = await self.get_transaction_status(tx_hash=tx_hash)

                    if tx_status.finality_status == TransactionStatus.REJECTED:
                        raise TransactionRejectedError()

                    transaction_received = True
                else:
                    tx_receipt = await self.get_transaction_receipt(tx_hash=tx_hash)

                    if (
                        tx_receipt.execution_status
                        == TransactionExecutionStatus.REVERTED
                    ):
                        raise TransactionRevertedError(message=tx_receipt.revert_reason)
                    return tx_receipt

                if retries == 0:
                    raise TransactionNotReceivedError()

                await asyncio.sleep(check_interval)

            except asyncio.CancelledError as exc:
                raise TransactionNotReceivedError from exc
            except ClientError as exc:
                if "Transaction hash not found" not in exc.message:
                    raise exc

                if retries == 0:
                    raise TransactionNotReceivedError from exc

                await asyncio.sleep(check_interval)

    @abstractmethod
    async def estimate_fee(
        self,
        tx: Union[AccountTransaction, List[AccountTransaction]],
        skip_validate: bool = False,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[EstimatedFee, List[EstimatedFee]]:
        """
        Estimates the resources required by a given sequence of transactions when applied on a given state.
        If one of the transactions reverts or fails due to any reason (e.g. validation failure or an internal error),
        a TRANSACTION_EXECUTION_ERROR is returned.
        For v0-2 transactions the estimate is given in Wei, and for v3 transactions it is given in Fri.

        :param tx: Transaction to estimate
        :param skip_validate: Flag checking whether the validation part of the transaction should be executed.
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`.
        :param block_number: Block's number or literals `"pending"` or `"latest"`.
        :return: Estimated amount of Wei executing specified transaction will cost.
        """

    @abstractmethod
    async def call_contract(
        self,
        call: Call,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> List[int]:
        """
        Call the contract with given instance of InvokeTransaction

        :param call: Call
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: List of integers representing contract's function output (structured like calldata)
        """

    @abstractmethod
    async def send_transaction(
        self,
        transaction: Invoke,
    ) -> SentTransactionResponse:
        """
        Send a transaction to the network

        :param transaction: Transaction object (i.e. Invoke).
        :return: SentTransactionResponse object
        """

    @abstractmethod
    async def deploy_account(
        self, transaction: DeployAccount
    ) -> DeployAccountTransactionResponse:
        """
        Deploy a pre-funded account contract to the network

        :param transaction: DeployAccount transaction
        :return: SentTransactionResponse object
        """

    @abstractmethod
    async def declare(self, transaction: Declare) -> DeclareTransactionResponse:
        """
        Send a declare transaction

        :param transaction: Declare transaction
        :return: SentTransactionResponse object
        """

    @abstractmethod
    async def get_class_hash_at(
        self,
        contract_address: Hash,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        """
        Get the contract class hash for the contract deployed at the given address

        :param contract_address: Address of the contract whose class hash is to be returned
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: Class hash
        """

    @abstractmethod
    async def get_class_by_hash(
        self, class_hash: Hash
    ) -> Union[ContractClass, SierraContractClass]:
        """
        Get the contract class for given class hash

        :param class_hash: Class hash
        :return: ContractClass object
        """

    @abstractmethod
    async def get_contract_nonce(
        self,
        contract_address: int,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        """
        Get the latest nonce associated with the given address

        :param contract_address: Get the latest nonce associated with the given address
        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: The last nonce used for the given contract
        """

    @abstractmethod
    async def get_chain_id(self) -> str:
        """Return the currently configured Starknet chain id"""

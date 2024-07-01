import contextlib
import distutils.spawn
import logging
import os
import pathlib
import random
import signal
import subprocess
import tempfile
import time
from typing import Any, Dict, List, Optional

import pytest
import web3.exceptions
from web3 import HTTPProvider
from web3 import logs as web3_logs
from web3 import types as web3_types
from web3.contract import Contract

from starkware.eth.web3_wrapper import Web3

# Max timeout for web3 requests in seconds.
TIMEOUT_FOR_WEB3_REQUESTS = 120  # Seconds.

# Max number of attempts to check web3.is_connected().
GANACHE_MAX_TRIES = 60
logger = logging.getLogger(__name__)

Abi = List[dict]


def get_ganache_bin_path() -> str:
    files = list(pathlib.Path().rglob(pattern="ganache.sh"))
    assert len(files) <= 1, f"Found multiple ganache.sh files: {files}"
    if len(files) == 1:
        return str(files[0])
    ganache_cli_bin = distutils.spawn.find_executable("ganache")
    assert ganache_cli_bin is not None, "Failed to find suitable ganache binary."
    return ganache_cli_bin


class EthTestUtils:
    """
    Allows testing Ethereum contracts.
    """

    def __init__(self):
        self.ganache = Ganache()
        self.w3 = self.ganache.w3
        self.accounts = [
            EthAccount(w3=self.w3, address=account) for account in self.ganache.w3.eth.accounts
        ]

    def stop(self):
        self.ganache.stop()

    @classmethod
    @contextlib.contextmanager
    def context_manager(cls):
        res = cls()
        try:
            yield res
        finally:
            res.stop()

    def advance_time(self, n_seconds: int):
        self.w3.provider.make_request(
            method=web3_types.RPCEndpoint("evm_increaseTime"), params=[n_seconds]
        )
        self.w3.provider.make_request(method=web3_types.RPCEndpoint("evm_mine"), params=[])

    def get_block_by_hash(self, block_hash: str) -> "EthBlock":
        return EthBlock(w3_block=self.w3.eth.get_block(web3_types.HexStr(block_hash)))

    def get_balance(self, address: str) -> int:
        return self.w3.eth.get_balance(address)

    def get_contract(
        self,
        contract_json,
        contract_address: str,
        default_from: "EthAccount",
    ) -> "EthContract":
        """
        Creates a "EthContract" object.
        """
        abi = contract_json["abi"]
        bytecode = contract_json["bytecode"]

        return EthContract(
            w3=self.w3,
            address=contract_address,
            w3_contract=self.w3.eth.contract(  # type: ignore
                abi=abi, bytecode=bytecode, address=contract_address
            ),
            abi=abi,
            default_from=default_from,
        )

    def set_account_balance(self, address: str, balance: int):
        assert balance >= 0, "Cannot set a negative balance."
        self.w3.provider.make_request(
            method=web3_types.RPCEndpoint("evm_setAccountBalance"), params=[address, balance]
        )


class Ganache:
    """
    Represents a running instance of ganache.
    """

    def __init__(self):
        """
        Runs ganache.
        Use stop() to ensure the process is killed at the end.
        """
        self.err_stream = tempfile.NamedTemporaryFile()
        self.port = random.randrange(1024, 8192)
        self.ganache_proc = subprocess.Popen(
            f"{get_ganache_bin_path()} \
                -p {self.port} \
                --chain.chainId 32 \
                --chain.networkId 32 \
                --miner.blockGasLimit 8000000 \
                --chain.allow-unlimited-contract-size",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=self.err_stream,
            # Open the process in a new process group.
            start_new_session=True,
        )
        request_kwargs = {"timeout": TIMEOUT_FOR_WEB3_REQUESTS}
        self.w3 = Web3(
            HTTPProvider(f"http://localhost:{self.port}/", request_kwargs=request_kwargs)
        )

        for _ in range(GANACHE_MAX_TRIES):
            time.sleep(1)
            if self.w3.is_connected():  # type: ignore
                break
        else:
            raise Exception("Could not connect to ganache.")

        self.is_alive = True

    def __del__(self):
        self.stop()

    def stop(self):
        if not self.is_alive:
            return

        # Kill the entire process group.
        os.killpg(self.ganache_proc.pid, signal.SIGINT)
        self.is_alive = False
        # Capture errors.
        self.err_stream.flush()
        self.err_stream.seek(0)
        stderr_data = self.err_stream.read().decode()
        if len(stderr_data) > 0:
            logger.error(f"Ganache stderr data:\n{str(stderr_data)}\n")
        self.err_stream.close()


class EthAccount:
    """
    Represents an account in the system.
    """

    def __init__(self, w3: Web3, address: str):
        self.address = address
        self.w3 = w3

    def __repr__(self):
        return f"{type(self).__name__}({self.address})"

    def deploy(self, contract_json, *constructor_args) -> "EthContract":
        """
        Deploys a contract.
        contract_json should be the compiled json, including the "abi" and "bytecode" keys.
        """
        abi = contract_json["abi"]
        bytecode = contract_json["bytecode"]
        contract = self.w3.eth.contract(abi=abi, bytecode=bytecode)

        # Get transaction hash from deployed contract.
        tx_hash = contract.constructor(*constructor_args).transact({"from": self.address})
        logger.info(f"Submitted {tx_hash.hex()}")

        # Get tx receipt to get contract address.
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

        contract_address = tx_receipt["contractAddress"]
        assert contract_address is not None
        assert (
            tx_receipt["status"] == 1
        ), f"Failed to deploy contract. Transaction hash: {tx_hash.hex()}"

        return EthContract(
            w3=self.w3,
            address=contract_address,
            w3_contract=self.w3.eth.contract(address=contract_address, abi=abi),
            abi=abi,
            default_from=self,
        )

    def transfer(self, to: "EthAccount", value: int):
        self.w3.eth.send_transaction(
            {"from": self.address, "to": to.address, "value": web3_types.Wei(value)}
        )

    @property
    def balance(self) -> int:
        return self.w3.eth.get_balance(self.address)


class EthContract:
    """
    Represents an Ethereum contract.
    """

    def __init__(
        self, w3: Web3, address: str, w3_contract: Contract, abi: Abi, default_from: EthAccount
    ):
        self.w3 = w3
        self.address = address
        self.w3_contract = w3_contract
        self.abi = abi
        self.default_from = default_from

    def __getattr__(self, name: str) -> "EthContractFunction":
        return EthContractFunction(contract=self, name=name)

    def replace_abi(self, abi: Abi) -> "EthContract":
        w3_contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.address), abi=abi  # type: ignore
        )

        return EthContract(
            w3=self.w3,
            address=self.address,
            w3_contract=w3_contract,  # type: ignore[arg-type]
            abi=abi,
            default_from=self.default_from,
        )

    def get_events(self, tx: "EthReceipt", name: str) -> List[dict]:
        event = getattr(self.w3_contract.events, name)
        return [
            {arg_name: handle_w3_value(arg_value) for arg_name, arg_value in event.args.items()}
            for event in event().processReceipt(tx.w3_tx_receipt, errors=web3_logs.DISCARD)
        ]

    def decode_transaction_data(self, data):
        """
        Given the data of a transaction that invokes a function from this contract,
        returns the function signature and arguments.
        """
        func_signature, args = self.w3_contract.decode_function_input(data)
        return func_signature, args

    @property
    def balance(self) -> int:
        return self.w3.eth.get_balance(self.address)


class EthContractFunction:
    def __init__(self, contract: EthContract, name: str):
        self.contract = contract
        self.name = name

    @property
    def _func(self):
        return getattr(self.contract.w3_contract.functions, self.name)

    def transact(self, *args, transact_args: Optional[Dict[str, Any]] = None) -> "EthReceipt":
        transact_args = prepare_transact_args(
            transact_args=transact_args, default_from=self.contract.default_from.address
        )
        args = fix_tx_args(args)

        try:
            tx_hash = self._func(*args).transact(transact_args)
            w3_tx_receipt = self.contract.w3.eth.wait_for_transaction_receipt(tx_hash)
            return EthReceipt(contract=self.contract, w3_tx_receipt=w3_tx_receipt)
        except (web3.exceptions.ContractLogicError, ValueError) as ex:
            raise EthRevertException(str(ex)) from None

    def call(self, *args, transact_args=None):
        transact_args = prepare_transact_args(
            transact_args, default_from=self.contract.default_from.address
        )
        args = fix_tx_args(args)
        try:
            return handle_w3_value(self._func(*args).call(transact_args))
        except (web3.exceptions.ContractLogicError, ValueError) as ex:
            raise EthRevertException(str(ex)) from None

    def __call__(self, *args, transact_args=None) -> "EthReceipt":
        return self.transact(*args, transact_args=transact_args)


class EthReceipt:
    def __init__(self, contract, w3_tx_receipt):
        self.contract = contract
        self.w3_tx_receipt = w3_tx_receipt

    def get_events(self, name: str) -> List[dict]:
        return self.contract.get_events(tx=self, name=name)

    def get_cost(self) -> int:
        tx = self.contract.w3.eth.get_transaction(self.w3_tx_receipt.transactionHash)
        gas_price = tx.get("effectiveGasPrice")
        if gas_price is None:
            gas_price = tx["gasPrice"]
        return self.w3_tx_receipt.gasUsed * gas_price

    @property
    def block_hash(self) -> str:
        return self.w3_tx_receipt.blockHash.hex()


class EthBlock:
    def __init__(self, w3_block):
        self.w3_block = w3_block

    @property
    def timestamp(self) -> int:
        return self.w3_block.timestamp


class EthRevertException(Exception):
    pass


def eth_reverts(match):
    """
    A context manager that expects the code to raise EthRevertException with a message
    that matches the given regex pattern.
    """
    return pytest.raises(EthRevertException, match=match)


def int_to_address(addr: int):
    """
    Converts the given integer to an Ethereum address.
    """
    return Web3.to_checksum_address(f"{addr:040x}")  # type: ignore


def prepare_transact_args(
    transact_args: Optional[Dict[str, Any]], default_from: str
) -> Dict[str, Any]:
    if transact_args is None:
        transact_args = {}
    if "from" not in transact_args:
        transact_args["from"] = default_from
    if isinstance(transact_args["from"], EthAccount):
        transact_args["from"] = transact_args["from"].address
    return transact_args


def fix_tx_arg(arg):
    if isinstance(arg, EthAccount):
        return arg.address
    return arg


def fix_tx_args(args):
    return list(map(fix_tx_arg, args))


def handle_w3_value(val):
    if isinstance(val, bytes):
        return f"0x{val.hex()}"
    return val

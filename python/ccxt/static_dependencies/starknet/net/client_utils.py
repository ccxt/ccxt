import re
from typing import Dict, Union, cast

from typing_extensions import get_args

from hash.utils import encode_uint, encode_uint_list
from net.client_models import Hash, L1HandlerTransaction, Tag
from net.models.transaction import AccountTransaction
from net.schemas.broadcasted_txn import BroadcastedTransactionSchema


def hash_to_felt(value: Hash) -> str:
    """
    Convert hash to hexadecimal string
    """
    if isinstance(value, str):
        return value

    return hex(value)


def is_block_identifier(value: Union[int, Hash, Tag]) -> bool:
    return isinstance(value, str) and value in get_args(Tag)


def encode_l1_message(tx: L1HandlerTransaction) -> bytes:
    from_address = tx.calldata[0]
    # Pop first element to have in calldata the actual payload
    tx.calldata.pop(0)

    return (
        encode_uint(from_address)
        + encode_uint(tx.contract_address)
        + encode_uint(tx.nonce)
        + encode_uint(tx.entry_point_selector)
        + encode_uint(len(tx.calldata))
        + encode_uint_list(tx.calldata)
    )


def _to_storage_key(key: int) -> str:
    """
    Convert a value to RPC storage key matching a ``^0x0[0-7]{1}[a-fA-F0-9]{0,62}$`` pattern.

    :param key: The key to convert.
    :return: RPC storage key representation of the key.
    """

    hashed_key = hex(key)[2:]

    if hashed_key[0] not in ("0", "1", "2", "3", "4", "5", "6", "7"):
        hashed_key = "0" + hashed_key

    hashed_key = "0x0" + hashed_key

    if not re.match(r"^0x0[0-7]{1}[a-fA-F0-9]{0,62}$", hashed_key):
        raise ValueError(f"Value {key} cannot be represented as RPC storage key.")

    return hashed_key


def _to_rpc_felt(value: Hash) -> str:
    """
    Convert the value to RPC felt matching a ``^0x(0|[a-fA-F1-9]{1}[a-fA-F0-9]{0,62})$`` pattern.

    :param value: The value to convert.
    :return: RPC felt representation of the value.
    """
    if isinstance(value, str):
        value = int(value, 16)

    rpc_felt = hex(value)
    assert re.match(r"^0x(0|[a-fA-F1-9]{1}[a-fA-F0-9]{0,62})$", rpc_felt)
    return rpc_felt


def _is_valid_eth_address(address: str) -> bool:
    """
    A function checking if an address matches Ethereum address regex. Note that it doesn't validate any checksums etc.
    """
    return bool(re.fullmatch("^0x[a-fA-F0-9]{40}$", address))


def _create_broadcasted_txn(transaction: AccountTransaction) -> dict:
    return cast(
        Dict,
        BroadcastedTransactionSchema().dump(obj=transaction),
    )

from typing import (
    Any,
    Dict,
    Sequence,
)

from toolz import (
    assoc,
    dissoc,
)

from .validation import (
    is_rlp_structured_access_list,
    is_rpc_structured_access_list,
)


def set_transaction_type_if_needed(transaction_dict: Dict[str, Any]) -> Dict[str, Any]:
    if "type" not in transaction_dict:
        if "gasPrice" in transaction_dict and "accessList" in transaction_dict:
            # access list txn - type 1
            transaction_dict = assoc(transaction_dict, "type", "0x1")
        elif (
            "maxFeePerGas" in transaction_dict
            and "maxPriorityFeePerGas" in transaction_dict
        ):
            # dynamic fee txn - type 2
            transaction_dict = assoc(transaction_dict, "type", "0x2")
    return transaction_dict


# JSON-RPC to rlp transaction structure
def transaction_rpc_to_rlp_structure(dictionary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert a JSON-RPC-structured transaction to an rlp-structured transaction.
    """
    access_list = dictionary.get("accessList")
    if access_list:
        dictionary = dissoc(dictionary, "accessList")
        rlp_structured_access_list = _access_list_rpc_to_rlp_structure(access_list)
        dictionary = assoc(dictionary, "accessList", rlp_structured_access_list)
    return dictionary


def _access_list_rpc_to_rlp_structure(access_list: Sequence) -> Sequence:
    if not is_rpc_structured_access_list(access_list):
        raise ValueError(
            "provided object not formatted as JSON-RPC-structured access list"
        )
    rlp_structured_access_list = []
    for d in access_list:
        # flatten each dict into a tuple of its values
        rlp_structured_access_list.append(
            (
                d["address"],  # value of address
                tuple(_ for _ in d["storageKeys"]),  # tuple of storage key values
            )
        )
    return tuple(rlp_structured_access_list)


# rlp to JSON-RPC transaction structure
def transaction_rlp_to_rpc_structure(dictionary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert an rlp-structured transaction to a JSON-RPC-structured transaction.
    """
    access_list = dictionary.get("accessList")
    if access_list:
        dictionary = dissoc(dictionary, "accessList")
        rpc_structured_access_list = _access_list_rlp_to_rpc_structure(access_list)
        dictionary = assoc(dictionary, "accessList", rpc_structured_access_list)
    return dictionary


def _access_list_rlp_to_rpc_structure(access_list: Sequence) -> Sequence:
    if not is_rlp_structured_access_list(access_list):
        raise ValueError("provided object not formatted as rlp-structured access list")
    rpc_structured_access_list = []
    for t in access_list:
        # build a dictionary with appropriate keys for each tuple
        rpc_structured_access_list.append({"address": t[0], "storageKeys": t[1]})
    return tuple(rpc_structured_access_list)

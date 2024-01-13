import itertools
from typing import (
    Dict,
)

from cytoolz import (
    curry,
    dissoc,
    merge,
    partial,
    pipe,
)
from eth_rlp import (
    HashableRLP,
)
from eth_utils.curried import (
    apply_formatters_to_dict,
)
import rlp
from rlp.sedes import (
    Binary,
    big_endian_int,
    binary,
)

from .transaction_utils import (
    set_transaction_type_if_needed,
)
from .typed_transactions import (
    TypedTransaction,
)
from .validation import (
    LEGACY_TRANSACTION_FORMATTERS,
    LEGACY_TRANSACTION_VALID_VALUES,
)


def serializable_unsigned_transaction_from_dict(transaction_dict):
    transaction_dict = set_transaction_type_if_needed(transaction_dict)
    if "type" in transaction_dict:
        # We delegate to TypedTransaction, which will carry out validation & formatting.
        return TypedTransaction.from_dict(transaction_dict)

    assert_valid_fields(transaction_dict)
    filled_transaction = pipe(
        transaction_dict,
        dict,
        partial(merge, TRANSACTION_DEFAULTS),
        chain_id_to_v,
        apply_formatters_to_dict(LEGACY_TRANSACTION_FORMATTERS),
    )
    if "v" in filled_transaction:
        serializer = Transaction
    else:
        serializer = UnsignedTransaction
    return serializer.from_dict(filled_transaction)


def encode_transaction(unsigned_transaction, vrs):
    (v, r, s) = vrs
    chain_naive_transaction = dissoc(unsigned_transaction.as_dict(), "v", "r", "s")
    if isinstance(unsigned_transaction, TypedTransaction):
        # Typed transaction have their own encoding format,
        # so we must delegate the encoding.
        chain_naive_transaction["v"] = v
        chain_naive_transaction["r"] = r
        chain_naive_transaction["s"] = s
        signed_typed_transaction = TypedTransaction.from_dict(chain_naive_transaction)
        return signed_typed_transaction.encode()
    signed_transaction = Transaction(v=v, r=r, s=s, **chain_naive_transaction)
    return rlp.encode(signed_transaction)


TRANSACTION_DEFAULTS = {
    "to": b"",
    "value": 0,
    "data": b"",
    "chainId": None,
}

ALLOWED_TRANSACTION_KEYS = {
    "nonce",
    "gasPrice",
    "gas",
    "to",
    "value",
    "data",
    # set chainId to None if you want a transaction that can be replayed across networks
    "chainId",
}

REQUIRED_TRANSACTION_KEYS = ALLOWED_TRANSACTION_KEYS.difference(
    TRANSACTION_DEFAULTS.keys()
)


def assert_valid_fields(transaction_dict):
    # check if any keys are missing
    missing_keys = REQUIRED_TRANSACTION_KEYS.difference(transaction_dict.keys())
    if missing_keys:
        raise TypeError(f"Transaction must include these fields: {repr(missing_keys)}")

    # check if any extra keys were specified
    superfluous_keys = set(transaction_dict.keys()).difference(ALLOWED_TRANSACTION_KEYS)
    if superfluous_keys:
        raise TypeError(
            "Transaction must not include unrecognized fields: "
            f"{repr(superfluous_keys)}"
        )

    # check for valid types in each field
    valid_fields: Dict[str, bool]
    valid_fields = apply_formatters_to_dict(
        LEGACY_TRANSACTION_VALID_VALUES, transaction_dict
    )
    if not all(valid_fields.values()):
        invalid = {
            key: transaction_dict[key]
            for key, valid in valid_fields.items()
            if not valid
        }
        raise TypeError(f"Transaction had invalid fields: {repr(invalid)}")


def chain_id_to_v(transaction_dict):
    # See EIP 155
    chain_id = transaction_dict.pop("chainId")
    if chain_id is None:
        return transaction_dict
    else:
        return dict(transaction_dict, v=chain_id, r=0, s=0)


@curry
def fill_transaction_defaults(transaction):
    return merge(TRANSACTION_DEFAULTS, transaction)


UNSIGNED_TRANSACTION_FIELDS = (
    ("nonce", big_endian_int),
    ("gasPrice", big_endian_int),
    ("gas", big_endian_int),
    ("to", Binary.fixed_length(20, allow_empty=True)),
    ("value", big_endian_int),
    ("data", binary),
)


class Transaction(HashableRLP):
    fields = UNSIGNED_TRANSACTION_FIELDS + (
        ("v", big_endian_int),
        ("r", big_endian_int),
        ("s", big_endian_int),
    )


class UnsignedTransaction(HashableRLP):
    fields = UNSIGNED_TRANSACTION_FIELDS


ChainAwareUnsignedTransaction = Transaction


def strip_signature(txn):
    unsigned_parts = itertools.islice(txn, len(UNSIGNED_TRANSACTION_FIELDS))
    return list(unsigned_parts)


def vrs_from(transaction):
    return (getattr(transaction, part) for part in "vrs")

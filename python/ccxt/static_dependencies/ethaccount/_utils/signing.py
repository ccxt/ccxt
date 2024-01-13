from cytoolz import (
    pipe,
)
from eth_utils import (
    to_bytes,
    to_int,
)

from .legacy_transactions import (
    ChainAwareUnsignedTransaction,
    Transaction,
    UnsignedTransaction,
    encode_transaction,
    serializable_unsigned_transaction_from_dict,
    strip_signature,
)
from .typed_transactions import (
    TypedTransaction,
)

CHAIN_ID_OFFSET = 35
V_OFFSET = 27

# signature versions
PERSONAL_SIGN_VERSION = b"E"  # Hex value 0x45
INTENDED_VALIDATOR_SIGN_VERSION = b"\x00"  # Hex value 0x00
STRUCTURED_DATA_SIGN_VERSION = b"\x01"  # Hex value 0x01


def sign_transaction_dict(eth_key, transaction_dict):
    # generate RLP-serializable transaction, with defaults filled
    unsigned_transaction = serializable_unsigned_transaction_from_dict(transaction_dict)

    transaction_hash = unsigned_transaction.hash()

    # detect chain
    if isinstance(unsigned_transaction, UnsignedTransaction):
        chain_id = None
        (v, r, s) = sign_transaction_hash(eth_key, transaction_hash, chain_id)
    elif isinstance(unsigned_transaction, Transaction):
        chain_id = unsigned_transaction.v
        (v, r, s) = sign_transaction_hash(eth_key, transaction_hash, chain_id)
    elif isinstance(unsigned_transaction, TypedTransaction):
        # Each transaction type dictates its payload, and consequently,
        # all the funky logic around the `v` signature field is both obsolete &&
        # incorrect. We want to obtain the raw `v` and delegate
        # to the transaction type itself.
        (v, r, s) = eth_key.sign_msg_hash(transaction_hash).vrs
    else:
        # Cannot happen, but better for code to be defensive + self-documenting.
        raise TypeError(f"unknown Transaction object: {type(unsigned_transaction)}")

    # serialize transaction with rlp
    encoded_transaction = encode_transaction(unsigned_transaction, vrs=(v, r, s))

    return (v, r, s, encoded_transaction)


def hash_of_signed_transaction(txn_obj):
    """
    Regenerate the hash of the signed transaction object.

    1. Infer the chain ID from the signature
    2. Strip out signature from transaction
    3. Annotate the transaction with that ID, if available
    4. Take the hash of the serialized, unsigned, chain-aware transaction

    Chain ID inference and annotation is according to EIP-155
    See details at https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md

    :return: the hash of the provided transaction, to be signed
    """
    (chain_id, _v) = extract_chain_id(txn_obj.v)
    unsigned_parts = strip_signature(txn_obj)
    if chain_id is None:
        signable_transaction = UnsignedTransaction(*unsigned_parts)
    else:
        extended_transaction = unsigned_parts + [chain_id, 0, 0]
        signable_transaction = ChainAwareUnsignedTransaction(*extended_transaction)
    return signable_transaction.hash()


def extract_chain_id(raw_v):
    """
    Extracts chain ID, according to EIP-155.

    @return (chain_id, v)
    """
    above_id_offset = raw_v - CHAIN_ID_OFFSET
    if above_id_offset < 0:
        if raw_v in {0, 1}:
            return (None, raw_v + V_OFFSET)
        elif raw_v in {27, 28}:
            return (None, raw_v)
        else:
            raise ValueError("v %r is invalid, must be one of: 0, 1, 27, 28, 35+")
    else:
        (chain_id, v_bit) = divmod(above_id_offset, 2)
        return (chain_id, v_bit + V_OFFSET)


def to_standard_signature_bytes(ethereum_signature_bytes):
    rs = ethereum_signature_bytes[:-1]
    v = to_int(ethereum_signature_bytes[-1])
    standard_v = to_standard_v(v)
    return rs + to_bytes(standard_v)


def to_standard_v(enhanced_v):
    (_chain, chain_naive_v) = extract_chain_id(enhanced_v)
    v_standard = chain_naive_v - V_OFFSET
    assert v_standard in {0, 1}
    return v_standard


def to_eth_v(v_raw, chain_id=None):
    if chain_id is None:
        v = v_raw + V_OFFSET
    else:
        v = v_raw + CHAIN_ID_OFFSET + 2 * chain_id
    return v


def sign_transaction_hash(account, transaction_hash, chain_id):
    signature = account.sign_msg_hash(transaction_hash)
    (v_raw, r, s) = signature.vrs
    v = to_eth_v(v_raw, chain_id)
    return (v, r, s)


def _pad_to_eth_word(bytes_val):
    return bytes_val.rjust(32, b"\0")


def to_bytes32(val):
    return pipe(
        val,
        to_bytes,
        _pad_to_eth_word,
    )


def sign_message_hash(key, msg_hash):
    signature = key.sign_msg_hash(msg_hash)
    (v_raw, r, s) = signature.vrs
    v = to_eth_v(v_raw)
    eth_signature_bytes = to_bytes32(r) + to_bytes32(s) + to_bytes(v)
    return (v, r, s, eth_signature_bytes)

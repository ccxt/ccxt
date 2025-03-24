import functools
from typing import List, Optional, Sequence

from ... import keccak

from ..common import int_from_bytes
from ..constants import EC_ORDER
from ...starkware.crypto.signature import (
    ECSignature,
    private_to_stark_key,
    sign
    # verify
)
from ...starkware.crypto.fast_pedersen_hash import (
    pedersen_hash
)

MASK_250 = 2**250 - 1
HEX_PREFIX = "0x"


def _starknet_keccak(data: bytes) -> int:
    """
    A variant of eth-keccak that computes a value that fits in a Starknet field element.
    """
    return int_from_bytes(keccak.SHA3(data)) & MASK_250


# def pedersen_hash(left: int, right: int) -> int:
#     """
#     One of two hash functions (along with _starknet_keccak) used throughout Starknet.
#     """
#     return cpp_hash(left, right)


def compute_hash_on_elements(data: Sequence) -> int:
    """
    Computes a hash chain over the data, in the following order:
        h(h(h(h(0, data[0]), data[1]), ...), data[n-1]), n).

    The hash is initialized with 0 and ends with the data length appended.
    The length is appended in order to avoid collisions of the following kind:
    H([x,y,z]) = h(h(x,y),z) = H([w, z]) where w = h(x,y).
    """
    return functools.reduce(pedersen_hash, [*data, len(data)], 0)


def message_signature(
    msg_hash: int, priv_key: int, seed: Optional[int] = 32
) -> ECSignature:
    """
    Signs the message with private key.
    """
    return sign(msg_hash, priv_key, seed)


# def verify_message_signature(
#     msg_hash: int, signature: List[int], public_key: int
# ) -> bool:
#     """
#     Verifies ECDSA signature of a given message hash with a given public key.
#     Returns true if public_key signs the message.
#     """
#     sig_r, sig_s = signature
#     # sig_w = pow(sig_s, -1, EC_ORDER)
#     return verify(msg_hash=msg_hash, r=sig_r, s=sig_s, public_key=public_key)


def encode_uint(value: int, bytes_length: int = 32) -> bytes:
    return value.to_bytes(bytes_length, byteorder="big")


def encode_uint_list(data: List[int]) -> bytes:
    return b"".join(encode_uint(x) for x in data)


def get_bytes_length(value: int) -> int:
    return (value.bit_length() + 7) // 8

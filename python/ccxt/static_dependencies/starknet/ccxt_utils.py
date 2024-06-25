# utils to use starknet library in ccxt
import hashlib
from .constants import EC_ORDER

def grind_key(key_seed: int, key_value_limit: int) -> int:
    max_allowed_value = 2**256 - (2**256 % key_value_limit)
    current_index = 0

    def indexed_sha256(seed: int, index: int) -> int:
        def padded_hex(x: int) -> str:
            hex_str = hex(x)[2:]
            return hex_str if len(hex_str) % 2 == 0 else "0" + hex_str

        digest = hashlib.sha256(bytes.fromhex(padded_hex(seed) + padded_hex(index))).hexdigest()
        return int(digest, 16)

    key = indexed_sha256(seed=key_seed, index=current_index)
    while key >= max_allowed_value:
        current_index += 1
        key = indexed_sha256(seed=key_seed, index=current_index)

    return key % key_value_limit

def get_private_key_from_eth_signature(eth_signature_hex: str) -> int:
    r = eth_signature_hex[2 : 64 + 2] if eth_signature_hex[0:2] == '0x' else eth_signature_hex[0 : 64]
    return grind_key(int(r, 16), EC_ORDER)
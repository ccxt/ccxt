# utils to use starknet library in ccxt
from .constants import EC_ORDER
from ..starkware.crypto.signature import grind_key

def get_private_key_from_eth_signature(eth_signature_hex: str) -> int:
    r = eth_signature_hex[2 : 64 + 2] if eth_signature_hex[0:2] == '0x' else eth_signature_hex[0 : 64]
    return grind_key(int(r, 16), EC_ORDER)
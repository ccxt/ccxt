import hashlib

from .keccak import SHA3 as _pure_python_sha3

try:
    # OpenSSL >= 3.2 exposes the original (pre-NIST padding) Keccak-256 under this exact name;
    # ~500x faster than the pure-Python sponge below. Probe once at import time.
    hashlib.new('KECCAK-256')

    def SHA3(_input):
        """Keccak-256 via OpenSSL; same bytearray result as the pure-Python fallback."""
        return bytearray(hashlib.new('KECCAK-256', bytes(_input)).digest())

except ValueError:
    SHA3 = _pure_python_sha3

__all__ = ['SHA3']

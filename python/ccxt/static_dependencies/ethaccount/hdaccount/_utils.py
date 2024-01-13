import hashlib
import hmac
from typing import (
    Union,
)
import unicodedata

from eth_keys import (
    keys,
)
from eth_utils import (
    ValidationError,
)
from hexbytes import (
    HexBytes,
)

PBKDF2_ROUNDS = 2048
SECP256K1_N = int(
    "FFFFFFFF_FFFFFFFF_FFFFFFFF_FFFFFFFE_BAAEDCE6_AF48A03B_BFD25E8C_D0364141", 16
)


def normalize_string(txt: Union[str, bytes]) -> str:
    if isinstance(txt, bytes):
        utxt = txt.decode("utf8")
    elif isinstance(txt, str):
        utxt = txt
    else:
        raise ValidationError("String value expected")

    return unicodedata.normalize("NFKD", utxt)


def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


def hmac_sha512(chain_code: bytes, data: bytes) -> bytes:
    """
    As specified by RFC4231 - https://tools.ietf.org/html/rfc4231 .
    """
    return hmac.new(chain_code, data, hashlib.sha512).digest()


def pbkdf2_hmac_sha512(passcode: str, salt: str) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha512",
        passcode.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ROUNDS,
    )


def ec_point(pkey: bytes) -> bytes:
    """
    Compute `point(p)`, where `point` is ecdsa point multiplication.

    Note: Result is ecdsa public key serialized to compressed form
    """
    return keys.PrivateKey(HexBytes(pkey)).public_key.to_compressed_bytes()  # type: ignore  # noqa: E501

from eth_utils import (
    ValidationError,
)

from .deterministic import (
    HDPath,
)
from .mnemonic import (
    Mnemonic,
)

ETHEREUM_DEFAULT_PATH = "m/44'/60'/0'/0/0"


def generate_mnemonic(num_words: int, lang: str) -> str:
    return Mnemonic(lang).generate(num_words)


def seed_from_mnemonic(words: str, passphrase: str) -> bytes:
    lang = Mnemonic.detect_language(words)
    expanded_words = Mnemonic(lang).expand(words)
    if not Mnemonic(lang).is_mnemonic_valid(expanded_words):
        raise ValidationError(
            f"Provided words: '{expanded_words}', are not a "
            "valid BIP39 mnemonic phrase!"
        )
    return Mnemonic.to_seed(expanded_words, passphrase)


def key_from_seed(seed: bytes, account_path: str) -> bytes:
    return HDPath(account_path).derive(seed)

#
# Copyright (c) 2013 Pavol Rusnak
# Copyright (c) 2017 mruddy
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
from __future__ import annotations

import hashlib
import hmac
import itertools
import os
import secrets
import typing as t
import unicodedata

PBKDF2_ROUNDS = 2048


class ConfigurationError(Exception):
    pass


# Refactored code segments from <https://github.com/keis/base58>
def b58encode(v: bytes) -> str:
    alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

    p, acc = 1, 0
    for c in reversed(v):
        acc += p * c
        p = p << 8

    string = ""
    while acc:
        acc, idx = divmod(acc, 58)
        string = alphabet[idx : idx + 1] + string
    return string


class Mnemonic(object):
    def __init__(self, language: str = "english", wordlist: list[str] | None = None):
        self.radix = 2048
        self.language = language

        if wordlist is None:
            d = os.path.join(os.path.dirname(__file__), f"wordlist/{language}.txt")
            if os.path.exists(d) and os.path.isfile(d):
                with open(d, "r", encoding="utf-8") as f:
                    wordlist = [w.strip() for w in f.readlines()]
            else:
                raise ConfigurationError("Language not detected")

        if len(wordlist) != self.radix:
            raise ConfigurationError(f"Wordlist must contain {self.radix} words.")

        self.wordlist = wordlist
        # Japanese must be joined by ideographic space
        self.delimiter = "\u3000" if language == "japanese" else " "

    @classmethod
    def list_languages(cls) -> list[str]:
        return [
            f.split(".")[0]
            for f in os.listdir(os.path.join(os.path.dirname(__file__), "wordlist"))
            if f.endswith(".txt")
        ]

    @staticmethod
    def normalize_string(txt: t.AnyStr) -> str:
        if isinstance(txt, bytes):
            utxt = txt.decode("utf8")
        elif isinstance(txt, str):
            utxt = txt
        else:
            raise TypeError("String value expected")

        return unicodedata.normalize("NFKD", utxt)

    @classmethod
    def detect_language(cls, code: str) -> str:
        """Scan the Mnemonic until the language becomes unambiguous, including as abbreviation prefixes.

        Unfortunately, there are valid words that are ambiguous between languages, which are complete words
        in one language and are prefixes in another:

            english: abandon ... about
            french:  abandon ... aboutir

        If prefixes remain ambiguous, require exactly one language where word(s) match exactly.
        """
        code = cls.normalize_string(code)
        possible = set(cls(lang) for lang in cls.list_languages())
        words = set(code.split())
        for word in words:
            # possible languages have candidate(s) starting with the word/prefix
            possible = set(
                p for p in possible if any(c.startswith(word) for c in p.wordlist)
            )
            if not possible:
                raise ConfigurationError(f"Language unrecognized for {word!r}")
        if len(possible) == 1:
            return possible.pop().language
        # Multiple languages match: A prefix in many, but an exact match in one determines language.
        complete = set()
        for word in words:
            exact = set(p for p in possible if word in p.wordlist)
            if len(exact) == 1:
                complete.update(exact)
        if len(complete) == 1:
            return complete.pop().language
        raise ConfigurationError(
            f"Language ambiguous between {', '.join(p.language for p in possible)}"
        )

    def generate(self, strength: int = 128) -> str:
        """
        Create a new mnemonic using a random generated number as entropy.

        As defined in BIP39, the entropy must be a multiple of 32 bits, and its size must be between 128 and 256 bits.
        Therefore the possible values for `strength` are 128, 160, 192, 224 and 256.

        If not provided, the default entropy length will be set to 128 bits.

        The return is a list of words that encodes the generated entropy.

        :param strength: Number of bytes used as entropy
        :type strength: int
        :return: A randomly generated mnemonic
        :rtype: str
        """
        if strength not in [128, 160, 192, 224, 256]:
            raise ValueError(
                "Invalid strength value. Allowed values are [128, 160, 192, 224, 256]."
            )
        return self.to_mnemonic(secrets.token_bytes(strength // 8))

    # Adapted from <http://tinyurl.com/oxmn476>
    def to_entropy(self, words: list[str] | str) -> bytearray:
        if not isinstance(words, list):
            words = words.split(" ")
        if len(words) not in [12, 15, 18, 21, 24]:
            raise ValueError(
                "Number of words must be one of the following: [12, 15, 18, 21, 24], but it is not (%d)."
                % len(words)
            )
        # Look up all the words in the list and construct the
        # concatenation of the original entropy and the checksum.
        concatLenBits = len(words) * 11
        concatBits = [False] * concatLenBits
        wordindex = 0
        for word in words:
            # Find the words index in the wordlist
            ndx = self.wordlist.index(self.normalize_string(word))
            if ndx < 0:
                raise LookupError('Unable to find "%s" in word list.' % word)
            # Set the next 11 bits to the value of the index.
            for ii in range(11):
                concatBits[(wordindex * 11) + ii] = (ndx & (1 << (10 - ii))) != 0
            wordindex += 1
        checksumLengthBits = concatLenBits // 33
        entropyLengthBits = concatLenBits - checksumLengthBits
        # Extract original entropy as bytes.
        entropy = bytearray(entropyLengthBits // 8)
        for ii in range(len(entropy)):
            for jj in range(8):
                if concatBits[(ii * 8) + jj]:
                    entropy[ii] |= 1 << (7 - jj)
        # Take the digest of the entropy.
        hashBytes = hashlib.sha256(entropy).digest()
        hashBits = list(
            itertools.chain.from_iterable(
                [c & (1 << (7 - i)) != 0 for i in range(8)] for c in hashBytes
            )
        )
        # Check all the checksum bits.
        for i in range(checksumLengthBits):
            if concatBits[entropyLengthBits + i] != hashBits[i]:
                raise ValueError("Failed checksum.")
        return entropy

    def to_mnemonic(self, data: bytes) -> str:
        if len(data) not in [16, 20, 24, 28, 32]:
            raise ValueError(
                f"Data length should be one of the following: [16, 20, 24, 28, 32], but it is not {len(data)}."
            )
        h = hashlib.sha256(data).hexdigest()
        b = (
            bin(int.from_bytes(data, byteorder="big"))[2:].zfill(len(data) * 8)
            + bin(int(h, 16))[2:].zfill(256)[: len(data) * 8 // 32]
        )
        result = []
        for i in range(len(b) // 11):
            idx = int(b[i * 11 : (i + 1) * 11], 2)
            result.append(self.wordlist[idx])
        return self.delimiter.join(result)

    def check(self, mnemonic: str) -> bool:
        mnemonic_list = self.normalize_string(mnemonic).split(" ")
        # list of valid mnemonic lengths
        if len(mnemonic_list) not in [12, 15, 18, 21, 24]:
            return False
        try:
            idx = map(
                lambda x: bin(self.wordlist.index(x))[2:].zfill(11), mnemonic_list
            )
            b = "".join(idx)
        except ValueError:
            return False
        l = len(b)  # noqa: E741
        d = b[: l // 33 * 32]
        h = b[-l // 33 :]
        nd = int(d, 2).to_bytes(l // 33 * 4, byteorder="big")
        nh = bin(int(hashlib.sha256(nd).hexdigest(), 16))[2:].zfill(256)[: l // 33]
        return h == nh

    def expand_word(self, prefix: str) -> str:
        if prefix in self.wordlist:
            return prefix
        else:
            matches = [word for word in self.wordlist if word.startswith(prefix)]
            if len(matches) == 1:  # matched exactly one word in the wordlist
                return matches[0]
            else:
                # exact match not found.
                # this is not a validation routine, just return the input
                return prefix

    def expand(self, mnemonic: str) -> str:
        return " ".join(map(self.expand_word, mnemonic.split(" ")))

    @classmethod
    def to_seed(cls, mnemonic: str, passphrase: str = "") -> bytes:
        mnemonic = cls.normalize_string(mnemonic)
        passphrase = cls.normalize_string(passphrase)
        passphrase = "mnemonic" + passphrase
        mnemonic_bytes = mnemonic.encode("utf-8")
        passphrase_bytes = passphrase.encode("utf-8")
        stretched = hashlib.pbkdf2_hmac(
            "sha512", mnemonic_bytes, passphrase_bytes, PBKDF2_ROUNDS
        )
        return stretched[:64]

    @staticmethod
    def to_hd_master_key(seed: bytes, testnet: bool = False) -> str:
        if len(seed) != 64:
            raise ValueError("Provided seed should have length of 64")

        # Compute HMAC-SHA512 of seed
        seed = hmac.new(b"Bitcoin seed", seed, digestmod=hashlib.sha512).digest()

        # Serialization format can be found at: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#serialization-format
        xprv = b"\x04\x88\xad\xe4"  # Version for private mainnet
        if testnet:
            xprv = b"\x04\x35\x83\x94"  # Version for private testnet
        xprv += b"\x00" * 9  # Depth, parent fingerprint, and child number
        xprv += seed[32:]  # Chain code
        xprv += b"\x00" + seed[:32]  # Master key

        # Double hash using SHA256
        hashed_xprv = hashlib.sha256(xprv).digest()
        hashed_xprv = hashlib.sha256(hashed_xprv).digest()

        # Append 4 bytes of checksum
        xprv += hashed_xprv[:4]

        # Return base58
        return b58encode(xprv)

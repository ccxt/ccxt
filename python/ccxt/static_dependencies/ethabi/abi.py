"""
Hand-rolled Ethereum ABI encoder.

Behaviour-compatible (byte-for-byte, for every encodable input) with the
previously vendored `eth-abi` v3.0.1 package for the subset of types that
ccxt uses:

- ``uintN`` / ``intN`` (bare ``uint`` / ``int`` alias to 256 bits)
- ``address``
- ``bool``
- ``bytesN`` (fixed size, 1..32) / ``byte`` (alias of ``bytes1``)
- ``bytes`` / ``string`` (dynamic)
- ``function`` (alias of ``bytes24``)
- arbitrarily nested fixed-size (``T[k]``) and dynamic (``T[]``) arrays

Values are encoded via the standard head/tail mechanism.
"""

import codecs
import collections.abc
import re

from ..keccak import SHA3 as keccak


class EncodingError(Exception):
    pass


class EncodingTypeError(EncodingError):
    pass


class ValueOutOfBounds(EncodingError):
    pass


class ABITypeError(ValueError):
    pass


_INT_RE = re.compile(r"^(u?int)([0-9]*)$")
_BYTES_RE = re.compile(r"^bytes([0-9]+)$")
_ARRAY_RE = re.compile(r"^(.*)\[([0-9]*)\]$")
_HEX_ADDRESS_RE = re.compile("(0x)?[0-9a-f]{40}", re.IGNORECASE | re.ASCII)


def _is_integer(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _is_bytes(value):
    return isinstance(value, (bytes, bytearray))


def _is_list_like(value):
    return not isinstance(value, (bytes, str, bytearray)) and isinstance(
        value, collections.abc.Sequence
    )


def _invalid_value(value, type_str, msg=None, exc=EncodingTypeError):
    raise exc(
        "Value `{}` of type {} cannot be encoded as ABI type {}{}".format(
            repr(value), type(value), type_str, "" if msg is None else (": " + msg)
        )
    )


def _to_checksum_address(lower_address):
    # `lower_address` is a lowercase, non-prefixed 40-char hex string
    address_hash = keccak(lower_address.encode("utf-8")).hex()
    return "".join(
        lower_address[i].upper() if int(address_hash[i], 16) > 7 else lower_address[i]
        for i in range(40)
    )


def _canonical_address(value, type_str):
    # accepts a 20-byte binary address or a 40-hex-char string with optional
    # `0x` prefix; mixed-case hex addresses must have a valid EIP-55 checksum
    if isinstance(value, str):
        if _HEX_ADDRESS_RE.fullmatch(value) is None:
            _invalid_value(value, type_str)
        unprefixed = value[2:] if value[:2] in ("0x", "0X") else value
        is_checksum_formatted = (
            not unprefixed.islower()
            and not unprefixed.isupper()
            and not unprefixed.isnumeric()
        )
        if is_checksum_formatted and unprefixed != _to_checksum_address(unprefixed.lower()):
            _invalid_value(value, type_str, msg="invalid EIP-55 checksum")
        return bytes.fromhex(unprefixed.lower())
    elif _is_bytes(value):
        if len(value) != 20:
            _invalid_value(value, type_str)
        return bytes(value)
    _invalid_value(value, type_str)


def _encode_uint(value, bits, type_str):
    if not _is_integer(value):
        _invalid_value(value, type_str)
    if value < 0 or value >= (1 << bits):
        _invalid_value(
            value,
            type_str,
            msg="Cannot be encoded in {} bits. Must be bounded between [0, {}].".format(
                bits, (1 << bits) - 1
            ),
            exc=ValueOutOfBounds,
        )
    return value.to_bytes(32, "big")


def _encode_int(value, bits, type_str):
    if not _is_integer(value):
        _invalid_value(value, type_str)
    lower_bound = -(1 << (bits - 1))
    upper_bound = (1 << (bits - 1)) - 1
    if value < lower_bound or value > upper_bound:
        _invalid_value(
            value,
            type_str,
            msg="Cannot be encoded in {} bits. Must be bounded between [{}, {}].".format(
                bits, lower_bound, upper_bound
            ),
            exc=ValueOutOfBounds,
        )
    # two's complement, sign-extended to 32 bytes
    return (value % (1 << 256)).to_bytes(32, "big")


def _encode_bool(value, type_str):
    if not isinstance(value, bool):
        _invalid_value(value, type_str)
    return (b"\x00" * 31) + (b"\x01" if value else b"\x00")


def _encode_fixed_bytes(value, size, type_str):
    if not _is_bytes(value):
        _invalid_value(value, type_str)
    if len(value) > size:
        _invalid_value(
            value,
            type_str,
            msg="exceeds total byte size for bytes{} encoding".format(size),
            exc=ValueOutOfBounds,
        )
    return bytes(value).ljust(32, b"\x00")


def _encode_dynamic_bytes(value_as_bytes):
    if not value_as_bytes:
        padded_value = b"\x00" * 32
    else:
        padded_length = (len(value_as_bytes) + 31) // 32 * 32
        padded_value = value_as_bytes.ljust(padded_length, b"\x00")
    return len(value_as_bytes).to_bytes(32, "big") + padded_value


class _Encoder:
    # base class: a callable encoder for a single ABI type
    is_dynamic = False

    def __init__(self, type_str):
        self.type_str = type_str

    def __call__(self, value):
        raise NotImplementedError()


class _UnsignedIntegerEncoder(_Encoder):
    def __init__(self, type_str, bits):
        super().__init__(type_str)
        self.bits = bits

    def __call__(self, value):
        return _encode_uint(value, self.bits, self.type_str)


class _SignedIntegerEncoder(_Encoder):
    def __init__(self, type_str, bits):
        super().__init__(type_str)
        self.bits = bits

    def __call__(self, value):
        return _encode_int(value, self.bits, self.type_str)


class _AddressEncoder(_Encoder):
    def __call__(self, value):
        return _canonical_address(value, self.type_str).rjust(32, b"\x00")


class _BooleanEncoder(_Encoder):
    def __call__(self, value):
        return _encode_bool(value, self.type_str)


class _FixedBytesEncoder(_Encoder):
    def __init__(self, type_str, size):
        super().__init__(type_str)
        self.size = size

    def __call__(self, value):
        return _encode_fixed_bytes(value, self.size, self.type_str)


class _ByteStringEncoder(_Encoder):
    is_dynamic = True

    def __call__(self, value):
        if not _is_bytes(value):
            _invalid_value(value, self.type_str)
        return _encode_dynamic_bytes(bytes(value))


class _TextStringEncoder(_Encoder):
    is_dynamic = True

    def __call__(self, value):
        if not isinstance(value, str):
            _invalid_value(value, self.type_str)
        return _encode_dynamic_bytes(codecs.encode(value, "utf8"))


class _ArrayEncoder(_Encoder):
    def __init__(self, type_str, item_encoder, array_size):
        super().__init__(type_str)
        self.item_encoder = item_encoder
        self.array_size = array_size  # None when dynamically sized
        self.is_dynamic = array_size is None or item_encoder.is_dynamic

    def _encode_elements(self, value):
        if not _is_list_like(value):
            _invalid_value(
                value, self.type_str, msg="must be list-like such as array or tuple"
            )
        tail_chunks = tuple(self.item_encoder(item) for item in value)
        if not self.item_encoder.is_dynamic:
            return b"".join(tail_chunks)
        head_length = 32 * len(value)
        # note: like eth-abi v3.0.1, this always produces at least one head
        # word, even for empty arrays of dynamically sized items
        tail_offsets = [0]
        for chunk in tail_chunks[:-1]:
            tail_offsets.append(tail_offsets[-1] + len(chunk))
        head_chunks = tuple(
            (head_length + offset).to_bytes(32, "big") for offset in tail_offsets
        )
        return b"".join(head_chunks + tail_chunks)

    def __call__(self, value):
        if self.array_size is None:
            if not _is_list_like(value):
                _invalid_value(
                    value, self.type_str, msg="must be list-like such as array or tuple"
                )
            return len(value).to_bytes(32, "big") + self._encode_elements(value)
        if _is_list_like(value) and len(value) != self.array_size:
            _invalid_value(
                value,
                self.type_str,
                msg="value has {} items when {} were expected".format(
                    len(value), self.array_size
                ),
                exc=ValueOutOfBounds,
            )
        return self._encode_elements(value)


_TYPE_ALIASES = {
    "int": "int256",
    "uint": "uint256",
    "byte": "bytes1",
    "function": "bytes24",
}


def get_encoder(type_str):
    if not isinstance(type_str, str):
        raise ABITypeError("ABI type must be a string, got {}".format(repr(type_str)))
    array_match = _ARRAY_RE.match(type_str)
    if array_match is not None:
        item_type, array_size = array_match.groups()
        item_encoder = get_encoder(item_type)
        return _ArrayEncoder(
            type_str, item_encoder, int(array_size) if array_size else None
        )
    normalized = _TYPE_ALIASES.get(type_str, type_str)
    if normalized == "address":
        return _AddressEncoder(type_str)
    if normalized == "bool":
        return _BooleanEncoder(type_str)
    if normalized == "string":
        return _TextStringEncoder(type_str)
    if normalized == "bytes":
        return _ByteStringEncoder(type_str)
    bytes_match = _BYTES_RE.match(normalized)
    if bytes_match is not None:
        size = int(bytes_match.group(1))
        if size < 1 or size > 32:
            raise ABITypeError("Invalid ABI type: {}".format(type_str))
        return _FixedBytesEncoder(type_str, size)
    int_match = _INT_RE.match(normalized)
    if int_match is not None:
        base, bits_str = int_match.groups()
        bits = int(bits_str)
        if bits < 8 or bits > 256 or bits % 8 != 0:
            raise ABITypeError("Invalid ABI type: {}".format(type_str))
        if base == "uint":
            return _UnsignedIntegerEncoder(type_str, bits)
        return _SignedIntegerEncoder(type_str, bits)
    raise ABITypeError("Unsupported or invalid ABI type: {}".format(type_str))


def encode(types, args):
    """
    Encode the python values in ``args``, given the respective ABI types in
    ``types``, via the standard head/tail mechanism. Equivalent to
    ``eth_abi.encode(types, args)``.
    """
    encoders = [get_encoder(type_str) for type_str in types]
    if not _is_list_like(args):
        raise EncodingTypeError(
            "Values to be encoded must be a list-like object such as array or tuple, "
            "got {}".format(type(args))
        )
    if len(args) != len(encoders):
        raise ValueOutOfBounds(
            "Value has {} items when {} were expected".format(len(args), len(encoders))
        )
    raw_head_chunks = []
    tail_chunks = []
    for value, encoder in zip(args, encoders):
        if encoder.is_dynamic:
            raw_head_chunks.append(None)
            tail_chunks.append(encoder(value))
        else:
            raw_head_chunks.append(encoder(value))
            tail_chunks.append(b"")
    head_length = sum(32 if chunk is None else len(chunk) for chunk in raw_head_chunks)
    head_chunks = []
    offset = 0
    for chunk, tail_chunk in zip(raw_head_chunks, tail_chunks):
        if chunk is None:
            head_chunks.append((head_length + offset).to_bytes(32, "big"))
        else:
            head_chunks.append(chunk)
        offset += len(tail_chunk)
    return b"".join(head_chunks + tail_chunks)

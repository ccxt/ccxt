import abc
import codecs
import decimal
from itertools import (
    accumulate,
)
from typing import (
    Any,
    Optional,
    Type,
)

from ..utils import (
    int_to_big_endian,
    is_address,
    is_boolean,
    is_bytes,
    is_integer,
    is_list_like,
    is_number,
    is_text,
    to_canonical_address,
)

from .base import (
    BaseCoder,
    parse_tuple_type_str,
    parse_type_str,
)
from .exceptions import (
    EncodingTypeError,
    IllegalValue,
    ValueOutOfBounds,
)
from .utils.numeric import (
    TEN,
    abi_decimal_context,
    ceil32,
    compute_signed_fixed_bounds,
    compute_signed_integer_bounds,
    compute_unsigned_fixed_bounds,
    compute_unsigned_integer_bounds,
)
from .utils.padding import (
    fpad,
    zpad,
    zpad_right,
)
from .utils.string import (
    abbr,
)


class BaseEncoder(BaseCoder, metaclass=abc.ABCMeta):
    """
    Base class for all encoder classes.  Subclass this if you want to define a
    custom encoder class.  Subclasses must also implement
    :any:`BaseCoder.from_type_str`.
    """

    @abc.abstractmethod
    def encode(self, value: Any) -> bytes:  # pragma: no cover
        """
        Encodes the given value as a sequence of bytes.  Should raise
        :any:`exceptions.EncodingError` if ``value`` cannot be encoded.
        """
        pass

    @abc.abstractmethod
    def validate_value(self, value: Any) -> None:  # pragma: no cover
        """
        Checks whether or not the given value can be encoded by this encoder.
        If the given value cannot be encoded, must raise
        :any:`exceptions.EncodingError`.
        """
        pass

    @classmethod
    def invalidate_value(
        cls,
        value: Any,
        exc: Type[Exception] = EncodingTypeError,
        msg: Optional[str] = None,
    ) -> None:
        """
        Throws a standard exception for when a value is not encodable by an
        encoder.
        """
        raise exc(
            "Value `{rep}` of type {typ} cannot be encoded by {cls}{msg}".format(
                rep=abbr(value),
                typ=type(value),
                cls=cls.__name__,
                msg="" if msg is None else (": " + msg),
            )
        )

    def __call__(self, value: Any) -> bytes:
        return self.encode(value)


class TupleEncoder(BaseEncoder):
    encoders = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.is_dynamic = any(getattr(e, "is_dynamic", False) for e in self.encoders)

    def validate(self):
        super().validate()

        if self.encoders is None:
            raise ValueError("`encoders` may not be none")

    def validate_value(self, value):
        if not is_list_like(value):
            self.invalidate_value(
                value,
                msg="must be list-like object such as array or tuple",
            )

        if len(value) != len(self.encoders):
            self.invalidate_value(
                value,
                exc=ValueOutOfBounds,
                msg="value has {} items when {} were expected".format(
                    len(value),
                    len(self.encoders),
                ),
            )

        for item, encoder in zip(value, self.encoders):
            try:
                encoder.validate_value(item)
            except AttributeError:
                encoder(item)

    def encode(self, values):
        self.validate_value(values)

        raw_head_chunks = []
        tail_chunks = []
        for value, encoder in zip(values, self.encoders):
            if getattr(encoder, "is_dynamic", False):
                raw_head_chunks.append(None)
                tail_chunks.append(encoder(value))
            else:
                raw_head_chunks.append(encoder(value))
                tail_chunks.append(b"")

        head_length = sum(32 if item is None else len(item) for item in raw_head_chunks)
        tail_offsets = (0,) + tuple(accumulate(map(len, tail_chunks[:-1])))
        head_chunks = tuple(
            encode_uint_256(head_length + offset) if chunk is None else chunk
            for chunk, offset in zip(raw_head_chunks, tail_offsets)
        )

        encoded_value = b"".join(head_chunks + tuple(tail_chunks))

        return encoded_value

    @parse_tuple_type_str
    def from_type_str(cls, abi_type, registry):
        encoders = tuple(
            registry.get_encoder(c.to_type_str()) for c in abi_type.components
        )

        return cls(encoders=encoders)


class FixedSizeEncoder(BaseEncoder):
    value_bit_size = None
    data_byte_size = None
    encode_fn = None
    type_check_fn = None
    is_big_endian = None

    def validate(self):
        super().validate()

        if self.value_bit_size is None:
            raise ValueError("`value_bit_size` may not be none")
        if self.data_byte_size is None:
            raise ValueError("`data_byte_size` may not be none")
        if self.encode_fn is None:
            raise ValueError("`encode_fn` may not be none")
        if self.is_big_endian is None:
            raise ValueError("`is_big_endian` may not be none")

        if self.value_bit_size % 8 != 0:
            raise ValueError(
                "Invalid value bit size: {0}.  Must be a multiple of 8".format(
                    self.value_bit_size,
                )
            )

        if self.value_bit_size > self.data_byte_size * 8:
            raise ValueError("Value byte size exceeds data size")

    def validate_value(self, value):
        raise NotImplementedError("Must be implemented by subclasses")

    def encode(self, value):
        self.validate_value(value)
        base_encoded_value = self.encode_fn(value)

        if self.is_big_endian:
            padded_encoded_value = zpad(base_encoded_value, self.data_byte_size)
        else:
            padded_encoded_value = zpad_right(base_encoded_value, self.data_byte_size)

        return padded_encoded_value


class Fixed32ByteSizeEncoder(FixedSizeEncoder):
    data_byte_size = 32


class BooleanEncoder(Fixed32ByteSizeEncoder):
    value_bit_size = 8
    is_big_endian = True

    @classmethod
    def validate_value(cls, value):
        if not is_boolean(value):
            cls.invalidate_value(value)

    @classmethod
    def encode_fn(cls, value):
        if value is True:
            return b"\x01"
        elif value is False:
            return b"\x00"
        else:
            raise ValueError("Invariant")

    @parse_type_str("bool")
    def from_type_str(cls, abi_type, registry):
        return cls()


class PackedBooleanEncoder(BooleanEncoder):
    data_byte_size = 1


class NumberEncoder(Fixed32ByteSizeEncoder):
    is_big_endian = True
    bounds_fn = None
    illegal_value_fn = None
    type_check_fn = None

    def validate(self):
        super().validate()

        if self.bounds_fn is None:
            raise ValueError("`bounds_fn` cannot be null")
        if self.type_check_fn is None:
            raise ValueError("`type_check_fn` cannot be null")

    def validate_value(self, value):
        if not self.type_check_fn(value):
            self.invalidate_value(value)

        illegal_value = self.illegal_value_fn is not None and self.illegal_value_fn(
            value
        )
        if illegal_value:
            self.invalidate_value(value, exc=IllegalValue)

        lower_bound, upper_bound = self.bounds_fn(self.value_bit_size)
        if value < lower_bound or value > upper_bound:
            self.invalidate_value(
                value,
                exc=ValueOutOfBounds,
                msg=(
                    "Cannot be encoded in {} bits.  Must be bounded "
                    "between [{}, {}].".format(
                        self.value_bit_size,
                        lower_bound,
                        upper_bound,
                    )
                ),
            )


class UnsignedIntegerEncoder(NumberEncoder):
    encode_fn = staticmethod(int_to_big_endian)
    bounds_fn = staticmethod(compute_unsigned_integer_bounds)
    type_check_fn = staticmethod(is_integer)

    @parse_type_str("uint")
    def from_type_str(cls, abi_type, registry):
        return cls(value_bit_size=abi_type.sub)


encode_uint_256 = UnsignedIntegerEncoder(value_bit_size=256, data_byte_size=32)


class PackedUnsignedIntegerEncoder(UnsignedIntegerEncoder):
    @parse_type_str("uint")
    def from_type_str(cls, abi_type, registry):
        return cls(
            value_bit_size=abi_type.sub,
            data_byte_size=abi_type.sub // 8,
        )


class SignedIntegerEncoder(NumberEncoder):
    bounds_fn = staticmethod(compute_signed_integer_bounds)
    type_check_fn = staticmethod(is_integer)

    def encode_fn(self, value):
        return int_to_big_endian(value % (2**self.value_bit_size))

    def encode(self, value):
        self.validate_value(value)
        base_encoded_value = self.encode_fn(value)

        if value >= 0:
            padded_encoded_value = zpad(base_encoded_value, self.data_byte_size)
        else:
            padded_encoded_value = fpad(base_encoded_value, self.data_byte_size)

        return padded_encoded_value

    @parse_type_str("int")
    def from_type_str(cls, abi_type, registry):
        return cls(value_bit_size=abi_type.sub)


class PackedSignedIntegerEncoder(SignedIntegerEncoder):
    @parse_type_str("int")
    def from_type_str(cls, abi_type, registry):
        return cls(
            value_bit_size=abi_type.sub,
            data_byte_size=abi_type.sub // 8,
        )


class BaseFixedEncoder(NumberEncoder):
    frac_places = None

    @staticmethod
    def type_check_fn(value):
        return is_number(value) and not isinstance(value, float)

    @staticmethod
    def illegal_value_fn(value):
        if isinstance(value, decimal.Decimal):
            return value.is_nan() or value.is_infinite()

        return False

    def validate_value(self, value):
        super().validate_value(value)

        with decimal.localcontext(abi_decimal_context):
            residue = value % (TEN**-self.frac_places)

        if residue > 0:
            self.invalidate_value(
                value,
                exc=IllegalValue,
                msg="residue {} outside allowed fractional precision of {}".format(
                    repr(residue),
                    self.frac_places,
                ),
            )

    def validate(self):
        super().validate()

        if self.frac_places is None:
            raise ValueError("must specify `frac_places`")

        if self.frac_places <= 0 or self.frac_places > 80:
            raise ValueError("`frac_places` must be in range (0, 80]")


class UnsignedFixedEncoder(BaseFixedEncoder):
    def bounds_fn(self, value_bit_size):
        return compute_unsigned_fixed_bounds(self.value_bit_size, self.frac_places)

    def encode_fn(self, value):
        with decimal.localcontext(abi_decimal_context):
            scaled_value = value * TEN**self.frac_places
            integer_value = int(scaled_value)

        return int_to_big_endian(integer_value)

    @parse_type_str("ufixed")
    def from_type_str(cls, abi_type, registry):
        value_bit_size, frac_places = abi_type.sub

        return cls(
            value_bit_size=value_bit_size,
            frac_places=frac_places,
        )


class PackedUnsignedFixedEncoder(UnsignedFixedEncoder):
    @parse_type_str("ufixed")
    def from_type_str(cls, abi_type, registry):
        value_bit_size, frac_places = abi_type.sub

        return cls(
            value_bit_size=value_bit_size,
            data_byte_size=value_bit_size // 8,
            frac_places=frac_places,
        )


class SignedFixedEncoder(BaseFixedEncoder):
    def bounds_fn(self, value_bit_size):
        return compute_signed_fixed_bounds(self.value_bit_size, self.frac_places)

    def encode_fn(self, value):
        with decimal.localcontext(abi_decimal_context):
            scaled_value = value * TEN**self.frac_places
            integer_value = int(scaled_value)

        unsigned_integer_value = integer_value % (2**self.value_bit_size)

        return int_to_big_endian(unsigned_integer_value)

    def encode(self, value):
        self.validate_value(value)
        base_encoded_value = self.encode_fn(value)

        if value >= 0:
            padded_encoded_value = zpad(base_encoded_value, self.data_byte_size)
        else:
            padded_encoded_value = fpad(base_encoded_value, self.data_byte_size)

        return padded_encoded_value

    @parse_type_str("fixed")
    def from_type_str(cls, abi_type, registry):
        value_bit_size, frac_places = abi_type.sub

        return cls(
            value_bit_size=value_bit_size,
            frac_places=frac_places,
        )


class PackedSignedFixedEncoder(SignedFixedEncoder):
    @parse_type_str("fixed")
    def from_type_str(cls, abi_type, registry):
        value_bit_size, frac_places = abi_type.sub

        return cls(
            value_bit_size=value_bit_size,
            data_byte_size=value_bit_size // 8,
            frac_places=frac_places,
        )


class AddressEncoder(Fixed32ByteSizeEncoder):
    value_bit_size = 20 * 8
    encode_fn = staticmethod(to_canonical_address)
    is_big_endian = True

    @classmethod
    def validate_value(cls, value):
        if not is_address(value):
            cls.invalidate_value(value)

    def validate(self):
        super().validate()

        if self.value_bit_size != 20 * 8:
            raise ValueError("Addresses must be 160 bits in length")

    @parse_type_str("address")
    def from_type_str(cls, abi_type, registry):
        return cls()


class PackedAddressEncoder(AddressEncoder):
    data_byte_size = 20


class BytesEncoder(Fixed32ByteSizeEncoder):
    is_big_endian = False

    def validate_value(self, value):
        if not is_bytes(value):
            self.invalidate_value(value)

        byte_size = self.value_bit_size // 8
        if len(value) > byte_size:
            self.invalidate_value(
                value,
                exc=ValueOutOfBounds,
                msg="exceeds total byte size for bytes{} encoding".format(byte_size),
            )

    @staticmethod
    def encode_fn(value):
        return value

    @parse_type_str("bytes")
    def from_type_str(cls, abi_type, registry):
        return cls(value_bit_size=abi_type.sub * 8)


class PackedBytesEncoder(BytesEncoder):
    @parse_type_str("bytes")
    def from_type_str(cls, abi_type, registry):
        return cls(
            value_bit_size=abi_type.sub * 8,
            data_byte_size=abi_type.sub,
        )


class ByteStringEncoder(BaseEncoder):
    is_dynamic = True

    @classmethod
    def validate_value(cls, value):
        if not is_bytes(value):
            cls.invalidate_value(value)

    @classmethod
    def encode(cls, value):
        cls.validate_value(value)

        if not value:
            padded_value = b"\x00" * 32
        else:
            padded_value = zpad_right(value, ceil32(len(value)))

        encoded_size = encode_uint_256(len(value))
        encoded_value = encoded_size + padded_value

        return encoded_value

    @parse_type_str("bytes")
    def from_type_str(cls, abi_type, registry):
        return cls()


class PackedByteStringEncoder(ByteStringEncoder):
    is_dynamic = False

    @classmethod
    def encode(cls, value):
        cls.validate_value(value)
        return value


class TextStringEncoder(BaseEncoder):
    is_dynamic = True

    @classmethod
    def validate_value(cls, value):
        if not is_text(value):
            cls.invalidate_value(value)

    @classmethod
    def encode(cls, value):
        cls.validate_value(value)

        value_as_bytes = codecs.encode(value, "utf8")

        if not value_as_bytes:
            padded_value = b"\x00" * 32
        else:
            padded_value = zpad_right(value_as_bytes, ceil32(len(value_as_bytes)))

        encoded_size = encode_uint_256(len(value_as_bytes))
        encoded_value = encoded_size + padded_value

        return encoded_value

    @parse_type_str("string")
    def from_type_str(cls, abi_type, registry):
        return cls()


class PackedTextStringEncoder(TextStringEncoder):
    is_dynamic = False

    @classmethod
    def encode(cls, value):
        cls.validate_value(value)
        return codecs.encode(value, "utf8")


class BaseArrayEncoder(BaseEncoder):
    item_encoder = None

    def validate(self):
        super().validate()

        if self.item_encoder is None:
            raise ValueError("`item_encoder` may not be none")

    def validate_value(self, value):
        if not is_list_like(value):
            self.invalidate_value(
                value,
                msg="must be list-like such as array or tuple",
            )

        for item in value:
            self.item_encoder.validate_value(item)

    def encode_elements(self, value):
        self.validate_value(value)

        item_encoder = self.item_encoder
        tail_chunks = tuple(item_encoder(i) for i in value)

        items_are_dynamic = getattr(item_encoder, "is_dynamic", False)
        if not items_are_dynamic:
            return b"".join(tail_chunks)

        head_length = 32 * len(value)
        tail_offsets = (0,) + tuple(accumulate(map(len, tail_chunks[:-1])))
        head_chunks = tuple(
            encode_uint_256(head_length + offset) for offset in tail_offsets
        )
        return b"".join(head_chunks + tail_chunks)

    @parse_type_str(with_arrlist=True)
    def from_type_str(cls, abi_type, registry):
        item_encoder = registry.get_encoder(abi_type.item_type.to_type_str())

        array_spec = abi_type.arrlist[-1]
        if len(array_spec) == 1:
            # If array dimension is fixed
            return SizedArrayEncoder(
                array_size=array_spec[0],
                item_encoder=item_encoder,
            )
        else:
            # If array dimension is dynamic
            return DynamicArrayEncoder(item_encoder=item_encoder)


class PackedArrayEncoder(BaseArrayEncoder):
    array_size = None

    def validate_value(self, value):
        super().validate_value(value)

        if self.array_size is not None and len(value) != self.array_size:
            self.invalidate_value(
                value,
                exc=ValueOutOfBounds,
                msg="value has {} items when {} were expected".format(
                    len(value),
                    self.array_size,
                ),
            )

    def encode(self, value):
        encoded_elements = self.encode_elements(value)

        return encoded_elements

    @parse_type_str(with_arrlist=True)
    def from_type_str(cls, abi_type, registry):
        item_encoder = registry.get_encoder(abi_type.item_type.to_type_str())

        array_spec = abi_type.arrlist[-1]
        if len(array_spec) == 1:
            return cls(
                array_size=array_spec[0],
                item_encoder=item_encoder,
            )
        else:
            return cls(item_encoder=item_encoder)


class SizedArrayEncoder(BaseArrayEncoder):
    array_size = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.is_dynamic = self.item_encoder.is_dynamic

    def validate(self):
        super().validate()

        if self.array_size is None:
            raise ValueError("`array_size` may not be none")

    def validate_value(self, value):
        super().validate_value(value)

        if len(value) != self.array_size:
            self.invalidate_value(
                value,
                exc=ValueOutOfBounds,
                msg="value has {} items when {} were expected".format(
                    len(value),
                    self.array_size,
                ),
            )

    def encode(self, value):
        encoded_elements = self.encode_elements(value)

        return encoded_elements


class DynamicArrayEncoder(BaseArrayEncoder):
    is_dynamic = True

    def encode(self, value):
        encoded_size = encode_uint_256(len(value))
        encoded_elements = self.encode_elements(value)
        encoded_value = encoded_size + encoded_elements

        return encoded_value

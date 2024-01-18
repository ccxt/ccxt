import abc
import decimal
import io
from typing import (
    Any,
)

from ..utils import (
    big_endian_to_int,
    to_normalized_address,
    to_tuple,
)

from .base import (
    BaseCoder,
    parse_tuple_type_str,
    parse_type_str,
)
from .exceptions import (
    DecodingError,
    InsufficientDataBytes,
    NonEmptyPaddingBytes,
)
from .utils.numeric import (
    TEN,
    abi_decimal_context,
    ceil32,
)


class ContextFramesBytesIO(io.BytesIO):
    """
    A byte stream which can track a series of contextual frames in a stack. This
    data structure is necessary to perform nested decodings using the
    :py:class:``HeadTailDecoder`` since offsets present in head sections are
    relative only to a particular encoded object.  These offsets can only be
    used to locate a position in a decoding stream if they are paired with a
    contextual offset that establishes the position of the object in which they
    are found.

    For example, consider the encoding of a value for the following type::

        type: (int,(int,int[]))
        value: (1,(2,[3,3]))

    There are two tuples in this type: one inner and one outer.  The inner tuple
    type contains a dynamic type ``int[]`` and, therefore, is itself dynamic.
    This means that its value encoding will be placed in the tail section of the
    outer tuple's encoding.  Furthermore, the inner tuple's encoding will,
    itself, contain a tail section with the encoding for ``[3,3]``.  All
    together, the encoded value of ``(1,(2,[3,3]))`` would look like this (the
    data values are normally 32 bytes wide but have been truncated to remove the
    redundant zeros at the beginnings of their encodings)::

                       offset data
        --------------------------
             ^              0 0x01
             |             32 0x40 <-- Offset of object A in global frame (64)
        -----|--------------------
        Global frame ^     64 0x02 <-- Beginning of object A (64 w/offset 0 = 64)
             |       |     96 0x40 <-- Offset of object B in frame of object A (64)
        -----|-Object A's frame---
             |       |    128 0x02 <-- Beginning of object B (64 w/offset 64 = 128)
             |       |    160 0x03
             v       v    192 0x03
        --------------------------

    Note that the offset of object B is encoded as 64 which only specifies the
    beginning of its encoded value relative to the beginning of object A's
    encoding.  Globally, object B is located at offset 128.  In order to make
    sense out of object B's offset, it needs to be positioned in the context of
    its enclosing object's frame (object A).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._frames = []
        self._total_offset = 0

    def seek_in_frame(self, pos, *args, **kwargs):
        """
        Seeks relative to the total offset of the current contextual frames.
        """
        self.seek(self._total_offset + pos, *args, **kwargs)

    def push_frame(self, offset):
        """
        Pushes a new contextual frame onto the stack with the given offset and a
        return position at the current cursor position then seeks to the new
        total offset.
        """
        self._frames.append((offset, self.tell()))
        self._total_offset += offset

        self.seek_in_frame(0)

    def pop_frame(self):
        """
        Pops the current contextual frame off of the stack and returns the
        cursor to the frame's return position.
        """
        try:
            offset, return_pos = self._frames.pop()
        except IndexError:
            raise IndexError("no frames to pop")
        self._total_offset -= offset

        self.seek(return_pos)


class BaseDecoder(BaseCoder, metaclass=abc.ABCMeta):
    """
    Base class for all decoder classes.  Subclass this if you want to define a
    custom decoder class.  Subclasses must also implement
    :any:`BaseCoder.from_type_str`.
    """

    @abc.abstractmethod
    def decode(self, stream: ContextFramesBytesIO) -> Any:  # pragma: no cover
        """
        Decodes the given stream of bytes into a python value.  Should raise
        :any:`exceptions.DecodingError` if a python value cannot be decoded
        from the given byte stream.
        """
        pass

    def __call__(self, stream: ContextFramesBytesIO) -> Any:
        return self.decode(stream)


class HeadTailDecoder(BaseDecoder):
    is_dynamic = True

    tail_decoder = None

    def validate(self):
        super().validate()

        if self.tail_decoder is None:
            raise ValueError("No `tail_decoder` set")

    def decode(self, stream):
        start_pos = decode_uint_256(stream)

        stream.push_frame(start_pos)
        value = self.tail_decoder(stream)
        stream.pop_frame()

        return value


class TupleDecoder(BaseDecoder):
    decoders = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.decoders = tuple(
            HeadTailDecoder(tail_decoder=d) if getattr(d, "is_dynamic", False) else d
            for d in self.decoders
        )

        self.is_dynamic = any(getattr(d, "is_dynamic", False) for d in self.decoders)

    def validate(self):
        super().validate()

        if self.decoders is None:
            raise ValueError("No `decoders` set")

    @to_tuple
    def decode(self, stream):
        for decoder in self.decoders:
            yield decoder(stream)

    @parse_tuple_type_str
    def from_type_str(cls, abi_type, registry):
        decoders = tuple(
            registry.get_decoder(c.to_type_str()) for c in abi_type.components
        )

        return cls(decoders=decoders)


class SingleDecoder(BaseDecoder):
    decoder_fn = None

    def validate(self):
        super().validate()

        if self.decoder_fn is None:
            raise ValueError("No `decoder_fn` set")

    def validate_padding_bytes(self, value, padding_bytes):
        raise NotImplementedError("Must be implemented by subclasses")

    def decode(self, stream):
        raw_data = self.read_data_from_stream(stream)
        data, padding_bytes = self.split_data_and_padding(raw_data)
        value = self.decoder_fn(data)
        self.validate_padding_bytes(value, padding_bytes)

        return value

    def read_data_from_stream(self, stream):
        raise NotImplementedError("Must be implemented by subclasses")

    def split_data_and_padding(self, raw_data):
        return raw_data, b""


class BaseArrayDecoder(BaseDecoder):
    item_decoder = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Use a head-tail decoder to decode dynamic elements
        if self.item_decoder.is_dynamic:
            self.item_decoder = HeadTailDecoder(
                tail_decoder=self.item_decoder,
            )

    def validate(self):
        super().validate()

        if self.item_decoder is None:
            raise ValueError("No `item_decoder` set")

    @parse_type_str(with_arrlist=True)
    def from_type_str(cls, abi_type, registry):
        item_decoder = registry.get_decoder(abi_type.item_type.to_type_str())

        array_spec = abi_type.arrlist[-1]
        if len(array_spec) == 1:
            # If array dimension is fixed
            return SizedArrayDecoder(
                array_size=array_spec[0],
                item_decoder=item_decoder,
            )
        else:
            # If array dimension is dynamic
            return DynamicArrayDecoder(item_decoder=item_decoder)


class SizedArrayDecoder(BaseArrayDecoder):
    array_size = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.is_dynamic = self.item_decoder.is_dynamic

    @to_tuple
    def decode(self, stream):
        for _ in range(self.array_size):
            yield self.item_decoder(stream)


class DynamicArrayDecoder(BaseArrayDecoder):
    # Dynamic arrays are always dynamic, regardless of their elements
    is_dynamic = True

    @to_tuple
    def decode(self, stream):
        array_size = decode_uint_256(stream)
        stream.push_frame(32)
        for _ in range(array_size):
            yield self.item_decoder(stream)
        stream.pop_frame()


class FixedByteSizeDecoder(SingleDecoder):
    decoder_fn = None
    value_bit_size = None
    data_byte_size = None
    is_big_endian = None

    def validate(self):
        super().validate()

        if self.value_bit_size is None:
            raise ValueError("`value_bit_size` may not be None")
        if self.data_byte_size is None:
            raise ValueError("`data_byte_size` may not be None")
        if self.decoder_fn is None:
            raise ValueError("`decoder_fn` may not be None")
        if self.is_big_endian is None:
            raise ValueError("`is_big_endian` may not be None")

        if self.value_bit_size % 8 != 0:
            raise ValueError(
                "Invalid value bit size: {0}.  Must be a multiple of 8".format(
                    self.value_bit_size,
                )
            )

        if self.value_bit_size > self.data_byte_size * 8:
            raise ValueError("Value byte size exceeds data size")

    def read_data_from_stream(self, stream):
        data = stream.read(self.data_byte_size)

        if len(data) != self.data_byte_size:
            raise InsufficientDataBytes(
                "Tried to read {0} bytes.  Only got {1} bytes".format(
                    self.data_byte_size,
                    len(data),
                )
            )

        return data

    def split_data_and_padding(self, raw_data):
        value_byte_size = self._get_value_byte_size()
        padding_size = self.data_byte_size - value_byte_size

        if self.is_big_endian:
            padding_bytes = raw_data[:padding_size]
            data = raw_data[padding_size:]
        else:
            data = raw_data[:value_byte_size]
            padding_bytes = raw_data[value_byte_size:]

        return data, padding_bytes

    def validate_padding_bytes(self, value, padding_bytes):
        value_byte_size = self._get_value_byte_size()
        padding_size = self.data_byte_size - value_byte_size

        if padding_bytes != b"\x00" * padding_size:
            raise NonEmptyPaddingBytes(
                "Padding bytes were not empty: {0}".format(repr(padding_bytes))
            )

    def _get_value_byte_size(self):
        value_byte_size = self.value_bit_size // 8
        return value_byte_size


class Fixed32ByteSizeDecoder(FixedByteSizeDecoder):
    data_byte_size = 32


class BooleanDecoder(Fixed32ByteSizeDecoder):
    value_bit_size = 8
    is_big_endian = True

    @staticmethod
    def decoder_fn(data):
        if data == b"\x00":
            return False
        elif data == b"\x01":
            return True
        else:
            raise NonEmptyPaddingBytes(
                "Boolean must be either 0x0 or 0x1.  Got: {0}".format(repr(data))
            )

    @parse_type_str("bool")
    def from_type_str(cls, abi_type, registry):
        return cls()


class AddressDecoder(Fixed32ByteSizeDecoder):
    value_bit_size = 20 * 8
    is_big_endian = True
    decoder_fn = staticmethod(to_normalized_address)

    @parse_type_str("address")
    def from_type_str(cls, abi_type, registry):
        return cls()


#
# Unsigned Integer Decoders
#
class UnsignedIntegerDecoder(Fixed32ByteSizeDecoder):
    decoder_fn = staticmethod(big_endian_to_int)
    is_big_endian = True

    @parse_type_str("uint")
    def from_type_str(cls, abi_type, registry):
        return cls(value_bit_size=abi_type.sub)


decode_uint_256 = UnsignedIntegerDecoder(value_bit_size=256)


#
# Signed Integer Decoders
#
class SignedIntegerDecoder(Fixed32ByteSizeDecoder):
    is_big_endian = True

    def decoder_fn(self, data):
        value = big_endian_to_int(data)
        if value >= 2 ** (self.value_bit_size - 1):
            return value - 2**self.value_bit_size
        else:
            return value

    def validate_padding_bytes(self, value, padding_bytes):
        value_byte_size = self._get_value_byte_size()
        padding_size = self.data_byte_size - value_byte_size

        if value >= 0:
            expected_padding_bytes = b"\x00" * padding_size
        else:
            expected_padding_bytes = b"\xff" * padding_size

        if padding_bytes != expected_padding_bytes:
            raise NonEmptyPaddingBytes(
                "Padding bytes were not empty: {0}".format(repr(padding_bytes))
            )

    @parse_type_str("int")
    def from_type_str(cls, abi_type, registry):
        return cls(value_bit_size=abi_type.sub)


#
# Bytes1..32
#
class BytesDecoder(Fixed32ByteSizeDecoder):
    is_big_endian = False

    @staticmethod
    def decoder_fn(data):
        return data

    @parse_type_str("bytes")
    def from_type_str(cls, abi_type, registry):
        return cls(value_bit_size=abi_type.sub * 8)


class BaseFixedDecoder(Fixed32ByteSizeDecoder):
    frac_places = None
    is_big_endian = True

    def validate(self):
        super().validate()

        if self.frac_places is None:
            raise ValueError("must specify `frac_places`")

        if self.frac_places <= 0 or self.frac_places > 80:
            raise ValueError("`frac_places` must be in range (0, 80]")


class UnsignedFixedDecoder(BaseFixedDecoder):
    def decoder_fn(self, data):
        value = big_endian_to_int(data)

        with decimal.localcontext(abi_decimal_context):
            decimal_value = decimal.Decimal(value) / TEN**self.frac_places

        return decimal_value

    @parse_type_str("ufixed")
    def from_type_str(cls, abi_type, registry):
        value_bit_size, frac_places = abi_type.sub

        return cls(value_bit_size=value_bit_size, frac_places=frac_places)


class SignedFixedDecoder(BaseFixedDecoder):
    def decoder_fn(self, data):
        value = big_endian_to_int(data)
        if value >= 2 ** (self.value_bit_size - 1):
            signed_value = value - 2**self.value_bit_size
        else:
            signed_value = value

        with decimal.localcontext(abi_decimal_context):
            decimal_value = decimal.Decimal(signed_value) / TEN**self.frac_places

        return decimal_value

    def validate_padding_bytes(self, value, padding_bytes):
        value_byte_size = self._get_value_byte_size()
        padding_size = self.data_byte_size - value_byte_size

        if value >= 0:
            expected_padding_bytes = b"\x00" * padding_size
        else:
            expected_padding_bytes = b"\xff" * padding_size

        if padding_bytes != expected_padding_bytes:
            raise NonEmptyPaddingBytes(
                "Padding bytes were not empty: {0}".format(repr(padding_bytes))
            )

    @parse_type_str("fixed")
    def from_type_str(cls, abi_type, registry):
        value_bit_size, frac_places = abi_type.sub

        return cls(value_bit_size=value_bit_size, frac_places=frac_places)


#
# String and Bytes
#
class ByteStringDecoder(SingleDecoder):
    is_dynamic = True

    @staticmethod
    def decoder_fn(data):
        return data

    @staticmethod
    def read_data_from_stream(stream):
        data_length = decode_uint_256(stream)
        padded_length = ceil32(data_length)

        data = stream.read(padded_length)

        if len(data) < padded_length:
            raise InsufficientDataBytes(
                "Tried to read {0} bytes.  Only got {1} bytes".format(
                    padded_length,
                    len(data),
                )
            )

        padding_bytes = data[data_length:]

        if padding_bytes != b"\x00" * (padded_length - data_length):
            raise NonEmptyPaddingBytes(
                "Padding bytes were not empty: {0}".format(repr(padding_bytes))
            )

        return data[:data_length]

    def validate_padding_bytes(self, value, padding_bytes):
        pass

    @parse_type_str("bytes")
    def from_type_str(cls, abi_type, registry):
        return cls()


class StringDecoder(ByteStringDecoder):
    @parse_type_str("string")
    def from_type_str(cls, abi_type, registry):
        return cls()

    @staticmethod
    def decoder_fn(data):
        try:
            value = data.decode("utf-8")
        except UnicodeDecodeError as e:
            raise DecodingError(
                e.encoding,
                e.object,
                e.start,
                e.end,
                "The returned type for this function is string which is "
                "expected to be a UTF8 encoded string of text. The returned "
                "value could not be decoded as valid UTF8. This is indicative "
                "of a broken application which is using incorrect return types for "
                "binary data.",
            ) from e
        return value

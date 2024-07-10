from typing import (
    Any,
    Iterable,
    Tuple,
)
import warnings

from ..typing.abi import (
    Decodable,
    TypeStr,
)
from ..utils import (
    is_bytes,
)

from .decoding import (
    ContextFramesBytesIO,
    TupleDecoder,
)
from .encoding import (
    TupleEncoder,
)
from .exceptions import (
    EncodingError,
)
from .registry import (
    ABIRegistry,
)


class BaseABICoder:
    """
    Base class for porcelain coding APIs.  These are classes which wrap
    instances of :class:`~.registry.ABIRegistry` to provide last-mile
    coding functionality.
    """

    def __init__(self, registry: ABIRegistry):
        """
        Constructor.

        :param registry: The registry providing the encoders to be used when
            encoding values.
        """
        self._registry = registry


class ABIEncoder(BaseABICoder):
    """
    Wraps a registry to provide last-mile encoding functionality.
    """

    def encode_single(self, typ: TypeStr, arg: Any) -> bytes:
        """
        Encodes the python value ``arg`` as a binary value of the ABI type
        ``typ``.

        :param typ: The string representation of the ABI type that will be used
            for encoding e.g. ``'uint256'``, ``'bytes[]'``, ``'(int,int)'``,
            etc.
        :param arg: The python value to be encoded.

        :returns: The binary representation of the python value ``arg`` as a
            value of the ABI type ``typ``.
        """
        warnings.warn(
            "abi.encode_single() and abi.encode_single_packed() are deprecated "
            "and will be removed in version 4.0.0 in favor of abi.encode() and "
            "abi.encode_packed(), respectively",
            category=DeprecationWarning,
        )

        encoder = self._registry.get_encoder(typ)

        return encoder(arg)

    def encode_abi(self, types: Iterable[TypeStr], args: Iterable[Any]) -> bytes:
        """
        Encodes the python values in ``args`` as a sequence of binary values of
        the ABI types in ``types`` via the head-tail mechanism.

        :param types: An iterable of string representations of the ABI types
            that will be used for encoding e.g.  ``('uint256', 'bytes[]',
            '(int,int)')``
        :param args: An iterable of python values to be encoded.

        :returns: The head-tail encoded binary representation of the python
            values in ``args`` as values of the ABI types in ``types``.
        """
        warnings.warn(
            "abi.encode_abi() and abi.encode_abi_packed() are deprecated and will be "
            "removed in version 4.0.0 in favor of abi.encode() and "
            "abi.encode_packed(), respectively",
            category=DeprecationWarning,
        )
        return self.encode(types, args)

    def encode(self, types, args):
        encoders = [self._registry.get_encoder(type_str) for type_str in types]

        encoder = TupleEncoder(encoders=encoders)

        return encoder(args)

    def is_encodable(self, typ: TypeStr, arg: Any) -> bool:
        """
        Determines if the python value ``arg`` is encodable as a value of the
        ABI type ``typ``.

        :param typ: A string representation for the ABI type against which the
            python value ``arg`` will be checked e.g. ``'uint256'``,
            ``'bytes[]'``, ``'(int,int)'``, etc.
        :param arg: The python value whose encodability should be checked.

        :returns: ``True`` if ``arg`` is encodable as a value of the ABI type
            ``typ``.  Otherwise, ``False``.
        """
        encoder = self._registry.get_encoder(typ)

        try:
            encoder.validate_value(arg)
        except EncodingError:
            return False
        except AttributeError:
            try:
                encoder(arg)
            except EncodingError:
                return False

        return True

    def is_encodable_type(self, typ: TypeStr) -> bool:
        """
        Returns ``True`` if values for the ABI type ``typ`` can be encoded by
        this codec.

        :param typ: A string representation for the ABI type that will be
            checked for encodability e.g. ``'uint256'``, ``'bytes[]'``,
            ``'(int,int)'``, etc.

        :returns: ``True`` if values for ``typ`` can be encoded by this codec.
            Otherwise, ``False``.
        """
        return self._registry.has_encoder(typ)


class ABIDecoder(BaseABICoder):
    """
    Wraps a registry to provide last-mile decoding functionality.
    """

    stream_class = ContextFramesBytesIO

    def decode_single(self, typ: TypeStr, data: Decodable) -> Any:
        """
        Decodes the binary value ``data`` of the ABI type ``typ`` into its
        equivalent python value.

        :param typ: The string representation of the ABI type that will be used for
            decoding e.g. ``'uint256'``, ``'bytes[]'``, ``'(int,int)'``, etc.
        :param data: The binary value to be decoded.

        :returns: The equivalent python value of the ABI value represented in
            ``data``.
        """
        warnings.warn(
            "abi.decode_single() is deprecated and will be removed in version 4.0.0 "
            "in favor of abi.decode()",
            category=DeprecationWarning,
        )

        if not is_bytes(data):
            raise TypeError(
                "The `data` value must be of bytes type.  Got {0}".format(type(data))
            )

        decoder = self._registry.get_decoder(typ)
        stream = self.stream_class(data)

        return decoder(stream)

    def decode_abi(self, types: Iterable[TypeStr], data: Decodable) -> Tuple[Any, ...]:
        """
        Decodes the binary value ``data`` as a sequence of values of the ABI types
        in ``types`` via the head-tail mechanism into a tuple of equivalent python
        values.

        :param types: An iterable of string representations of the ABI types that
            will be used for decoding e.g. ``('uint256', 'bytes[]', '(int,int)')``
        :param data: The binary value to be decoded.

        :returns: A tuple of equivalent python values for the ABI values
            represented in ``data``.
        """
        warnings.warn(
            "abi.decode_abi() is deprecated and will be removed in version 4.0.0 in "
            "favor of abi.decode()",
            category=DeprecationWarning,
        )
        return self.decode(types, data)

    def decode(self, types, data):
        if not is_bytes(data):
            raise TypeError(
                f"The `data` value must be of bytes type.  Got {type(data)}"
            )

        decoders = [self._registry.get_decoder(type_str) for type_str in types]

        decoder = TupleDecoder(decoders=decoders)
        stream = self.stream_class(data)

        return decoder(stream)


class ABICodec(ABIEncoder, ABIDecoder):
    pass

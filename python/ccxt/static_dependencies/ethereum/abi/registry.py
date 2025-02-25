import abc
import copy
import functools
from typing import (
    Any,
    Callable,
    Type,
    Union,
)

from ..typing import (
    abi,
)

from . import (
    decoding,
    encoding,
    exceptions,
    grammar,
)
from .base import (
    BaseCoder,
)
from .exceptions import (
    ABITypeError,
    MultipleEntriesFound,
    NoEntriesFound,
)

Lookup = Union[abi.TypeStr, Callable[[abi.TypeStr], bool]]

EncoderCallable = Callable[[Any], bytes]
DecoderCallable = Callable[[decoding.ContextFramesBytesIO], Any]

Encoder = Union[EncoderCallable, Type[encoding.BaseEncoder]]
Decoder = Union[DecoderCallable, Type[decoding.BaseDecoder]]


class Copyable(abc.ABC):
    @abc.abstractmethod
    def copy(self):
        pass

    def __copy__(self):
        return self.copy()

    def __deepcopy__(self, *args):
        return self.copy()


class PredicateMapping(Copyable):
    """
    Acts as a mapping from predicate functions to values.  Values are retrieved
    when their corresponding predicate matches a given input.  Predicates can
    also be labeled to facilitate removal from the mapping.
    """

    def __init__(self, name):
        self._name = name
        self._values = {}
        self._labeled_predicates = {}

    def add(self, predicate, value, label=None):
        if predicate in self._values:
            raise ValueError(
                "Matcher {} already exists in {}".format(
                    repr(predicate),
                    self._name,
                )
            )

        if label is not None:
            if label in self._labeled_predicates:
                raise ValueError(
                    "Matcher {} with label '{}' already exists in {}".format(
                        repr(predicate),
                        label,
                        self._name,
                    ),
                )

            self._labeled_predicates[label] = predicate

        self._values[predicate] = value

    def find(self, type_str):
        results = tuple(
            (predicate, value)
            for predicate, value in self._values.items()
            if predicate(type_str)
        )

        if len(results) == 0:
            raise NoEntriesFound(
                "No matching entries for '{}' in {}".format(
                    type_str,
                    self._name,
                )
            )

        predicates, values = tuple(zip(*results))

        if len(results) > 1:
            predicate_reprs = ", ".join(map(repr, predicates))
            raise MultipleEntriesFound(
                f"Multiple matching entries for '{type_str}' in {self._name}: "
                f"{predicate_reprs}. This occurs when two registrations match the "
                "same type string. You may need to delete one of the "
                "registrations or modify its matching behavior to ensure it "
                'doesn\'t collide with other registrations. See the "Registry" '
                "documentation for more information."
            )

        return values[0]

    def remove_by_equality(self, predicate):
        # Delete the predicate mapping to the previously stored value
        try:
            del self._values[predicate]
        except KeyError:
            raise KeyError(
                "Matcher {} not found in {}".format(
                    repr(predicate),
                    self._name,
                )
            )

        # Delete any label which refers to this predicate
        try:
            label = self._label_for_predicate(predicate)
        except ValueError:
            pass
        else:
            del self._labeled_predicates[label]

    def _label_for_predicate(self, predicate):
        # Both keys and values in `_labeled_predicates` are unique since the
        # `add` method enforces this
        for key, value in self._labeled_predicates.items():
            if value is predicate:
                return key

        raise ValueError(
            "Matcher {} not referred to by any label in {}".format(
                repr(predicate),
                self._name,
            )
        )

    def remove_by_label(self, label):
        try:
            predicate = self._labeled_predicates[label]
        except KeyError:
            raise KeyError("Label '{}' not found in {}".format(label, self._name))

        del self._labeled_predicates[label]
        del self._values[predicate]

    def remove(self, predicate_or_label):
        if callable(predicate_or_label):
            self.remove_by_equality(predicate_or_label)
        elif isinstance(predicate_or_label, str):
            self.remove_by_label(predicate_or_label)
        else:
            raise TypeError(
                "Key to be removed must be callable or string: got {}".format(
                    type(predicate_or_label),
                )
            )

    def copy(self):
        cpy = type(self)(self._name)

        cpy._values = copy.copy(self._values)
        cpy._labeled_predicates = copy.copy(self._labeled_predicates)

        return cpy


class Predicate:
    """
    Represents a predicate function to be used for type matching in
    ``ABIRegistry``.
    """

    __slots__ = tuple()

    def __call__(self, *args, **kwargs):  # pragma: no cover
        raise NotImplementedError("Must implement `__call__`")

    def __str__(self):  # pragma: no cover
        raise NotImplementedError("Must implement `__str__`")

    def __repr__(self):
        return "<{} {}>".format(type(self).__name__, self)

    def __iter__(self):
        for attr in self.__slots__:
            yield getattr(self, attr)

    def __hash__(self):
        return hash(tuple(self))

    def __eq__(self, other):
        return type(self) is type(other) and tuple(self) == tuple(other)


class Equals(Predicate):
    """
    A predicate that matches any input equal to `value`.
    """

    __slots__ = ("value",)

    def __init__(self, value):
        self.value = value

    def __call__(self, other):
        return self.value == other

    def __str__(self):
        return "(== {})".format(repr(self.value))


class BaseEquals(Predicate):
    """
    A predicate that matches a basic type string with a base component equal to
    `value` and no array component.  If `with_sub` is `True`, the type string
    must have a sub component to match.  If `with_sub` is `False`, the type
    string must *not* have a sub component to match.  If `with_sub` is None,
    the type string's sub component is ignored.
    """

    __slots__ = ("base", "with_sub")

    def __init__(self, base, *, with_sub=None):
        self.base = base
        self.with_sub = with_sub

    def __call__(self, type_str):
        try:
            abi_type = grammar.parse(type_str)
        except exceptions.ParseError:
            return False

        if isinstance(abi_type, grammar.BasicType):
            if abi_type.arrlist is not None:
                return False

            if self.with_sub is not None:
                if self.with_sub and abi_type.sub is None:
                    return False
                if not self.with_sub and abi_type.sub is not None:
                    return False

            return abi_type.base == self.base

        # We'd reach this point if `type_str` did not contain a basic type
        # e.g. if it contained a tuple type
        return False

    def __str__(self):
        return "(base == {}{})".format(
            repr(self.base),
            ""
            if self.with_sub is None
            else (" and sub is not None" if self.with_sub else " and sub is None"),
        )


def has_arrlist(type_str):
    """
    A predicate that matches a type string with an array dimension list.
    """
    try:
        abi_type = grammar.parse(type_str)
    except exceptions.ParseError:
        return False

    return abi_type.arrlist is not None


def is_base_tuple(type_str):
    """
    A predicate that matches a tuple type with no array dimension list.
    """
    try:
        abi_type = grammar.parse(type_str)
    except exceptions.ParseError:
        return False

    return isinstance(abi_type, grammar.TupleType) and abi_type.arrlist is None


def _clear_encoder_cache(old_method):
    @functools.wraps(old_method)
    def new_method(self, *args, **kwargs):
        self.get_encoder.cache_clear()
        return old_method(self, *args, **kwargs)

    return new_method


def _clear_decoder_cache(old_method):
    @functools.wraps(old_method)
    def new_method(self, *args, **kwargs):
        self.get_decoder.cache_clear()
        return old_method(self, *args, **kwargs)

    return new_method


class BaseRegistry:
    @staticmethod
    def _register(mapping, lookup, value, label=None):
        if callable(lookup):
            mapping.add(lookup, value, label)
            return

        if isinstance(lookup, str):
            mapping.add(Equals(lookup), value, lookup)
            return

        raise TypeError(
            "Lookup must be a callable or a value of type `str`: got {}".format(
                repr(lookup),
            )
        )

    @staticmethod
    def _unregister(mapping, lookup_or_label):
        if callable(lookup_or_label):
            mapping.remove_by_equality(lookup_or_label)
            return

        if isinstance(lookup_or_label, str):
            mapping.remove_by_label(lookup_or_label)
            return

        raise TypeError(
            "Lookup/label must be a callable or a value of type `str`: got {}".format(
                repr(lookup_or_label),
            )
        )

    @staticmethod
    def _get_registration(mapping, type_str):
        try:
            value = mapping.find(type_str)
        except ValueError as e:
            if "No matching" in e.args[0]:
                # If no matches found, attempt to parse in case lack of matches
                # was due to unparsability
                grammar.parse(type_str)

            raise

        return value


class ABIRegistry(Copyable, BaseRegistry):
    def __init__(self):
        self._encoders = PredicateMapping("encoder registry")
        self._decoders = PredicateMapping("decoder registry")

    def _get_registration(self, mapping, type_str):
        coder = super()._get_registration(mapping, type_str)

        if isinstance(coder, type) and issubclass(coder, BaseCoder):
            return coder.from_type_str(type_str, self)

        return coder

    @_clear_encoder_cache
    def register_encoder(
        self, lookup: Lookup, encoder: Encoder, label: str = None
    ) -> None:
        """
        Registers the given ``encoder`` under the given ``lookup``.  A unique
        string label may be optionally provided that can be used to refer to
        the registration by name.  For more information about arguments, refer
        to :any:`register`.
        """
        self._register(self._encoders, lookup, encoder, label=label)

    @_clear_encoder_cache
    def unregister_encoder(self, lookup_or_label: Lookup) -> None:
        """
        Unregisters an encoder in the registry with the given lookup or label.
        If ``lookup_or_label`` is a string, the encoder with the label
        ``lookup_or_label`` will be unregistered.  If it is an function, the
        encoder with the lookup function ``lookup_or_label`` will be
        unregistered.
        """
        self._unregister(self._encoders, lookup_or_label)

    @_clear_decoder_cache
    def register_decoder(
        self, lookup: Lookup, decoder: Decoder, label: str = None
    ) -> None:
        """
        Registers the given ``decoder`` under the given ``lookup``.  A unique
        string label may be optionally provided that can be used to refer to
        the registration by name.  For more information about arguments, refer
        to :any:`register`.
        """
        self._register(self._decoders, lookup, decoder, label=label)

    @_clear_decoder_cache
    def unregister_decoder(self, lookup_or_label: Lookup) -> None:
        """
        Unregisters a decoder in the registry with the given lookup or label.
        If ``lookup_or_label`` is a string, the decoder with the label
        ``lookup_or_label`` will be unregistered.  If it is an function, the
        decoder with the lookup function ``lookup_or_label`` will be
        unregistered.
        """
        self._unregister(self._decoders, lookup_or_label)

    def register(
        self, lookup: Lookup, encoder: Encoder, decoder: Decoder, label: str = None
    ) -> None:
        """
        Registers the given ``encoder`` and ``decoder`` under the given
        ``lookup``.  A unique string label may be optionally provided that can
        be used to refer to the registration by name.

        :param lookup: A type string or type string matcher function
            (predicate).  When the registry is queried with a type string
            ``query`` to determine which encoder or decoder to use, ``query``
            will be checked against every registration in the registry.  If a
            registration was created with a type string for ``lookup``, it will
            be considered a match if ``lookup == query``.  If a registration
            was created with a matcher function for ``lookup``, it will be
            considered a match if ``lookup(query) is True``.  If more than one
            registration is found to be a match, then an exception is raised.

        :param encoder: An encoder callable or class to use if ``lookup``
            matches a query.  If ``encoder`` is a callable, it must accept a
            python value and return a ``bytes`` value.  If ``encoder`` is a
            class, it must be a valid subclass of :any:`encoding.BaseEncoder`
            and must also implement the :any:`from_type_str` method on
            :any:`base.BaseCoder`.

        :param decoder: A decoder callable or class to use if ``lookup``
            matches a query.  If ``decoder`` is a callable, it must accept a
            stream-like object of bytes and return a python value.  If
            ``decoder`` is a class, it must be a valid subclass of
            :any:`decoding.BaseDecoder` and must also implement the
            :any:`from_type_str` method on :any:`base.BaseCoder`.

        :param label: An optional label that can be used to refer to this
            registration by name.  This label can be used to unregister an
            entry in the registry via the :any:`unregister` method and its
            variants.
        """
        self.register_encoder(lookup, encoder, label=label)
        self.register_decoder(lookup, decoder, label=label)

    def unregister(self, label: str) -> None:
        """
        Unregisters the entries in the encoder and decoder registries which
        have the label ``label``.
        """
        self.unregister_encoder(label)
        self.unregister_decoder(label)

    @functools.lru_cache(maxsize=None)
    def get_encoder(self, type_str):
        return self._get_registration(self._encoders, type_str)

    def has_encoder(self, type_str: abi.TypeStr) -> bool:
        """
        Returns ``True`` if an encoder is found for the given type string
        ``type_str``.  Otherwise, returns ``False``.  Raises
        :class:`~eth_abi.exceptions.MultipleEntriesFound` if multiple encoders
        are found.
        """
        try:
            self.get_encoder(type_str)
        except (ABITypeError, NoEntriesFound):
            return False
        else:
            return True

    @functools.lru_cache(maxsize=None)
    def get_decoder(self, type_str):
        return self._get_registration(self._decoders, type_str)

    def copy(self):
        """
        Copies a registry such that new registrations can be made or existing
        registrations can be unregistered without affecting any instance from
        which a copy was obtained.  This is useful if an existing registry
        fulfills most of a user's needs but requires one or two modifications.
        In that case, a copy of that registry can be obtained and the necessary
        changes made without affecting the original registry.
        """
        cpy = type(self)()

        cpy._encoders = copy.copy(self._encoders)
        cpy._decoders = copy.copy(self._decoders)

        return cpy


registry = ABIRegistry()

registry.register(
    BaseEquals("uint"),
    encoding.UnsignedIntegerEncoder,
    decoding.UnsignedIntegerDecoder,
    label="uint",
)
registry.register(
    BaseEquals("int"),
    encoding.SignedIntegerEncoder,
    decoding.SignedIntegerDecoder,
    label="int",
)
registry.register(
    BaseEquals("address"),
    encoding.AddressEncoder,
    decoding.AddressDecoder,
    label="address",
)
registry.register(
    BaseEquals("bool"),
    encoding.BooleanEncoder,
    decoding.BooleanDecoder,
    label="bool",
)
registry.register(
    BaseEquals("ufixed"),
    encoding.UnsignedFixedEncoder,
    decoding.UnsignedFixedDecoder,
    label="ufixed",
)
registry.register(
    BaseEquals("fixed"),
    encoding.SignedFixedEncoder,
    decoding.SignedFixedDecoder,
    label="fixed",
)
registry.register(
    BaseEquals("bytes", with_sub=True),
    encoding.BytesEncoder,
    decoding.BytesDecoder,
    label="bytes<M>",
)
registry.register(
    BaseEquals("bytes", with_sub=False),
    encoding.ByteStringEncoder,
    decoding.ByteStringDecoder,
    label="bytes",
)
registry.register(
    BaseEquals("function"),
    encoding.BytesEncoder,
    decoding.BytesDecoder,
    label="function",
)
registry.register(
    BaseEquals("string"),
    encoding.TextStringEncoder,
    decoding.StringDecoder,
    label="string",
)
registry.register(
    has_arrlist,
    encoding.BaseArrayEncoder,
    decoding.BaseArrayDecoder,
    label="has_arrlist",
)
registry.register(
    is_base_tuple,
    encoding.TupleEncoder,
    decoding.TupleDecoder,
    label="is_base_tuple",
)

registry_packed = ABIRegistry()

registry_packed.register_encoder(
    BaseEquals("uint"),
    encoding.PackedUnsignedIntegerEncoder,
    label="uint",
)
registry_packed.register_encoder(
    BaseEquals("int"),
    encoding.PackedSignedIntegerEncoder,
    label="int",
)
registry_packed.register_encoder(
    BaseEquals("address"),
    encoding.PackedAddressEncoder,
    label="address",
)
registry_packed.register_encoder(
    BaseEquals("bool"),
    encoding.PackedBooleanEncoder,
    label="bool",
)
registry_packed.register_encoder(
    BaseEquals("ufixed"),
    encoding.PackedUnsignedFixedEncoder,
    label="ufixed",
)
registry_packed.register_encoder(
    BaseEquals("fixed"),
    encoding.PackedSignedFixedEncoder,
    label="fixed",
)
registry_packed.register_encoder(
    BaseEquals("bytes", with_sub=True),
    encoding.PackedBytesEncoder,
    label="bytes<M>",
)
registry_packed.register_encoder(
    BaseEquals("bytes", with_sub=False),
    encoding.PackedByteStringEncoder,
    label="bytes",
)
registry_packed.register_encoder(
    BaseEquals("function"),
    encoding.PackedBytesEncoder,
    label="function",
)
registry_packed.register_encoder(
    BaseEquals("string"),
    encoding.PackedTextStringEncoder,
    label="string",
)
registry_packed.register_encoder(
    has_arrlist,
    encoding.PackedArrayEncoder,
    label="has_arrlist",
)
registry_packed.register_encoder(
    is_base_tuple,
    encoding.TupleEncoder,
    label="is_base_tuple",
)

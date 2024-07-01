import base64
import functools
import re
from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Callable, Dict, Optional, Type

import marshmallow
import marshmallow.exceptions
import marshmallow.fields as mfields
import marshmallow.utils
from frozendict import frozendict
from marshmallow.base import FieldABC
from mypy_extensions import KwArg, VarArg

from starkware.python.utils import from_bytes
from starkware.starkware_utils.custom_raising_dict import CustomRaisingDict, CustomRaisingFrozenDict

FieldMetadata = Dict[str, Any]

OptionalFloat: Callable[[VarArg(), KwArg()], mfields.Float] = functools.partial(
    mfields.Float, allow_none=True
)
RequiredBoolean: Callable[[VarArg(), KwArg()], mfields.Boolean] = functools.partial(
    mfields.Boolean, truthy={True}, falsy={False}, required=True
)
RequiredFloat: Callable[[VarArg(), KwArg()], mfields.Float] = functools.partial(
    mfields.Float, required=True
)
StrictRequiredInteger: Callable[[VarArg(), KwArg()], mfields.Integer] = functools.partial(
    mfields.Integer, strict=True, required=True
)
StrictOptionalInteger: Callable[[VarArg(), KwArg()], mfields.Integer] = functools.partial(
    mfields.Integer, strict=True, allow_none=True
)

# Class definitions.


class IntAsStr(mfields.Field):
    """
    A field that behaves like an integer, but serializes to a string. Some amount fields are
    serialized to strings in the JSONs, so that JavaSscript can handle them (JavaScript cannot
    handle uint64 numbers).
    """

    default_error_messages = {"invalid": 'Expected int string, got: "{input}".'}

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        return str(value)

    def _deserialize(self, value, attr, data, **kwargs):
        if re.match("^-?[0-9]+$", value) is None:
            raise self.make_error("invalid", input=value)

        return int(value)


class EnumField(mfields.Field):
    """
    A field that behaves like an enum, but serializes to a string.
    """

    def __init__(
        self,
        enum_cls: Type[Enum],
        required: Optional[bool] = None,
        allow_none: Optional[bool] = None,
        load_default: Optional[Enum] = None,
        **kwargs,
    ):
        self.enum_cls = enum_cls
        super().__init__(
            required=True if required is None else required,
            # If `load_default` is None, `allow_none` will default to True; otherwise, False.
            allow_none=allow_none,
            load_default=marshmallow.utils.missing if load_default is None else load_default,
            **kwargs,
        )

    def _serialize(self, value, attr, obj, **kwargs):
        if value is not None:
            return value.name

        if self.allow_none:
            # value is None and None is allowed.
            return None

        raise marshmallow.exceptions.ValidationError(
            message=f"Field of type {type(self).__name__} is None, but allow_none=False"
        )

    def _deserialize(self, value, attr, data, **kwargs):
        # No need to handle the case in which value is None, since public deserialize() method
        # takes care of that.
        return self.enum_cls[value]


class IntAsHex(mfields.Field):
    """
    A field that behaves like an integer, but serializes to a hex string. Usually, this applies to
    field elements.
    """

    default_error_messages = {"invalid": 'Expected all-lowercase hex string, got: "{input}".'}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def _serialize(self, value, attr, obj, **kwargs):
        """
        Used during dump.
        """
        if value is None:
            return None
        assert isinstance(value, int)
        assert value >= 0, "IntAsHex does not support negative values."
        return hex(value)

    def _deserialize(self, value, attr, data, **kwargs):
        """
        Used during load.
        """
        if re.match("^0x[0-9a-f]+$", value) is not None:
            return int(value, 16)

        raise self.make_error("invalid", input=value)


class BackwardCompatibleIntAsHex(IntAsHex):
    """
    Extends IntAsHex functionality by allowing the deserialization of bytes-hex (i.e., without
    the '0x' prefix) or int strings.
    """

    def __init__(
        self,
        allow_decimal_loading: bool = False,
        allow_bytes_hex_loading: bool = False,
        allow_int_loading: bool = False,
        **kwargs,
    ):
        super().__init__(**kwargs)
        assert not (allow_decimal_loading and allow_bytes_hex_loading), (
            "At most one of {allow_decimal_loading, allow_bytes_hex_loading} "
            "can be supported at a time."
        )
        self._allow_decimal_loading = allow_decimal_loading
        self._allow_bytes_hex_loading = allow_bytes_hex_loading
        self._allow_int_loading = allow_int_loading

    def _deserialize(self, value, attr, data, **kwargs):
        if self._allow_int_loading and isinstance(value, int):
            return value

        if self._allow_decimal_loading and re.match("^[0-9]+$", value) is not None:
            # Load non-negative int string.
            return int(value)

        if self._allow_bytes_hex_loading and re.match("^[0-9a-f]*$", value) is not None:
            # Load hex-bytes string.
            return from_bytes(bytes.fromhex(value))

        # Try loading the value as hex.
        return super()._deserialize(value=value, attr=attr, data=data, **kwargs)


class BytesAsHex(mfields.Field):
    """
    A field that behaves like bytes, but serializes to a hex string.
    """

    default_error_messages = {"invalid": 'Expected all-lowercase hex string, got: "{input}".'}

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        assert isinstance(value, bytes)
        return value.hex()

    def _deserialize(self, value, attr, data, **kwargs):
        if re.match("^[0-9a-f]*$", value) is None:
            raise self.make_error("invalid", input=value)

        return bytes.fromhex(value)


class BytesAsBase64Str(mfields.Field):
    """
    A field that behaves like bytes, but serializes to base64.
    """

    default_error_messages = {"invalid": 'Expected Base64 bytes, got: "{input}".'}

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        assert isinstance(value, bytes)
        return base64.b64encode(value).decode("ascii")

    def _deserialize(self, value, attr, data, **kwargs):
        return base64.b64decode(value.encode("ascii"))


class CustomField(ABC):
    """
    A class representing a field deserialized into a variable of a specific type.
    """

    @property
    @classmethod
    @abstractmethod
    def _type(cls) -> type:
        pass

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)  # type: ignore[call-arg]

        assert issubclass(
            cls, FieldABC
        ), "CustomField must be used along with inheritance from a marshmallow field."

    def _deserialize(self, *args, **kwargs):
        return self._type(super()._deserialize(*args, **kwargs))  # type: ignore


class SetField(CustomField, mfields.List):
    _type = set


class VariadicLengthTupleField(CustomField, mfields.List):
    _type = tuple


class FrozenDictField(CustomField, mfields.Mapping):
    _type = frozendict


class CustomRaisingDictField(CustomField, mfields.Mapping):
    _type = CustomRaisingDict


class CustomRaisingFrozenDictField(CustomField, mfields.Mapping):
    _type = CustomRaisingFrozenDict


# Utilities.


def load_int_value(field_metadata: FieldMetadata, value: str) -> int:
    return field_metadata["marshmallow_field"]._deserialize(value=value, attr=None, data=None)


allowed_marshmallow_dataclass_keywords = {"marshmallow_field"}
allowed_marshmallow_keywords = {
    "load_default",
    "dump_default",
    "data_key",
    "attribute",
    "validate",
    "required",
    "allow_none",
    "load_only",
    "dump_only",
    "error_messages",
    "metadata",
    *allowed_marshmallow_dataclass_keywords,
}


def additional_metadata(**kwargs) -> FieldMetadata:
    """
    Returns additional metadata for marshmallow field constructor.
    All keywords that do not appear in allowed_marshmallow_keywords are moved to "metadata"
    dictionary.
    """
    disallowed_keywords = kwargs.keys() - allowed_marshmallow_keywords
    disallowed_kwargs = {keyword: kwargs.pop(keyword) for keyword in disallowed_keywords}

    metadata: FieldMetadata = kwargs.setdefault("metadata", {})
    metadata.update(disallowed_kwargs)

    return kwargs


# Field metadata for general use in marshmallow dataclasses.


def enum_field_metadata(
    *,
    enum_class: type,
    required: Optional[bool] = None,
    allow_none: Optional[bool] = None,
    load_default: Optional[Enum] = None,
) -> FieldMetadata:
    return additional_metadata(
        marshmallow_field=EnumField(
            enum_cls=enum_class, required=required, allow_none=allow_none, load_default=load_default
        ),
    )


boolean_field_metadata: FieldMetadata = additional_metadata(marshmallow_field=RequiredBoolean())
optional_field_metadata: FieldMetadata = additional_metadata(allow_none=True, load_default=None)

nonrequired_optional_metadata: FieldMetadata = additional_metadata(
    load_default=None, required=False
)
nonrequired_list_metadata: FieldMetadata = additional_metadata(load_default=list, required=False)

bytes_as_hex_list_metadata = additional_metadata(
    marshmallow_field=mfields.List(BytesAsHex(required=True))
)

optional_bytes_as_hex_list_metadata = additional_metadata(
    marshmallow_field=mfields.List(BytesAsHex, required=False, allow_none=True, load_default=None),
)

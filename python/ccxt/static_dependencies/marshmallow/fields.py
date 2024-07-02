"""Field classes for various types of data."""

from __future__ import annotations

import collections
import copy
import datetime as dt
import decimal
import ipaddress
import math
import numbers
import typing
import uuid
import warnings
from collections.abc import Mapping as _Mapping
from enum import Enum as EnumType

from . import class_registry, types, utils, validate
from .base import FieldABC, SchemaABC
from .exceptions import (
    FieldInstanceResolutionError,
    StringNotCollectionError,
    ValidationError,
)
from .utils import (
    is_aware,
    is_collection,
    resolve_field_instance,
)
from .utils import (
    missing as missing_,
)
from .validate import And, Length
from .warnings import RemovedInMarshmallow4Warning

__all__ = [
    "Field",
    "Raw",
    "Nested",
    "Mapping",
    "Dict",
    "List",
    "Tuple",
    "String",
    "UUID",
    "Number",
    "Integer",
    "Decimal",
    "Boolean",
    "Float",
    "DateTime",
    "NaiveDateTime",
    "AwareDateTime",
    "Time",
    "Date",
    "TimeDelta",
    "Url",
    "URL",
    "Email",
    "IP",
    "IPv4",
    "IPv6",
    "IPInterface",
    "IPv4Interface",
    "IPv6Interface",
    "Enum",
    "Method",
    "Function",
    "Str",
    "Bool",
    "Int",
    "Constant",
    "Pluck",
]

_T = typing.TypeVar("_T")


class Field(FieldABC):
    """Basic field from which other fields should extend. It applies no
    formatting by default, and should only be used in cases where
    data does not need to be formatted before being serialized or deserialized.
    On error, the name of the field will be returned.

    :param dump_default: If set, this value will be used during serialization if the
        input value is missing. If not set, the field will be excluded from the
        serialized output if the input value is missing. May be a value or a callable.
    :param load_default: Default deserialization value for the field if the field is not
        found in the input data. May be a value or a callable.
    :param data_key: The name of the dict key in the external representation, i.e.
        the input of `load` and the output of `dump`.
        If `None`, the key will match the name of the field.
    :param attribute: The name of the key/attribute in the internal representation, i.e.
        the output of `load` and the input of `dump`.
        If `None`, the key/attribute will match the name of the field.
        Note: This should only be used for very specific use cases such as
        outputting multiple fields for a single attribute, or using keys/attributes
        that are invalid variable names, unsuitable for field names. In most cases,
        you should use ``data_key`` instead.
    :param validate: Validator or collection of validators that are called
        during deserialization. Validator takes a field's input value as
        its only parameter and returns a boolean.
        If it returns `False`, an :exc:`ValidationError` is raised.
    :param required: Raise a :exc:`ValidationError` if the field value
        is not supplied during deserialization.
    :param allow_none: Set this to `True` if `None` should be considered a valid value during
        validation/deserialization. If ``load_default=None`` and ``allow_none`` is unset,
        will default to ``True``. Otherwise, the default is ``False``.
    :param load_only: If `True` skip this field during serialization, otherwise
        its value will be present in the serialized data.
    :param dump_only: If `True` skip this field during deserialization, otherwise
        its value will be present in the deserialized object. In the context of an
        HTTP API, this effectively marks the field as "read-only".
    :param dict error_messages: Overrides for `Field.default_error_messages`.
    :param metadata: Extra information to be stored as field metadata.

    .. versionchanged:: 2.0.0
        Removed `error` parameter. Use ``error_messages`` instead.

    .. versionchanged:: 2.0.0
        Added `allow_none` parameter, which makes validation/deserialization of `None`
        consistent across fields.

    .. versionchanged:: 2.0.0
        Added `load_only` and `dump_only` parameters, which allow field skipping
        during the (de)serialization process.

    .. versionchanged:: 2.0.0
        Added `missing` parameter, which indicates the value for a field if the field
        is not found during deserialization.

    .. versionchanged:: 2.0.0
        ``default`` value is only used if explicitly set. Otherwise, missing values
        inputs are excluded from serialized output.

    .. versionchanged:: 3.0.0b8
        Add ``data_key`` parameter for the specifying the key in the input and
        output data. This parameter replaced both ``load_from`` and ``dump_to``.
    """

    # Some fields, such as Method fields and Function fields, are not expected
    #  to exist as attributes on the objects to serialize. Set this to False
    #  for those fields
    _CHECK_ATTRIBUTE = True

    #: Default error messages for various kinds of errors. The keys in this dictionary
    #: are passed to `Field.make_error`. The values are error messages passed to
    #: :exc:`marshmallow.exceptions.ValidationError`.
    default_error_messages = {
        "required": "Missing data for required field.",
        "null": "Field may not be null.",
        "validator_failed": "Invalid value.",
    }

    def __init__(
        self,
        *,
        load_default: typing.Any = missing_,
        missing: typing.Any = missing_,
        dump_default: typing.Any = missing_,
        default: typing.Any = missing_,
        data_key: str | None = None,
        attribute: str | None = None,
        validate: (
            None
            | typing.Callable[[typing.Any], typing.Any]
            | typing.Iterable[typing.Callable[[typing.Any], typing.Any]]
        ) = None,
        required: bool = False,
        allow_none: bool | None = None,
        load_only: bool = False,
        dump_only: bool = False,
        error_messages: dict[str, str] | None = None,
        metadata: typing.Mapping[str, typing.Any] | None = None,
        **additional_metadata,
    ) -> None:
        # handle deprecated `default` and `missing` parameters
        if default is not missing_:
            warnings.warn(
                "The 'default' argument to fields is deprecated. "
                "Use 'dump_default' instead.",
                RemovedInMarshmallow4Warning,
                stacklevel=2,
            )
            if dump_default is missing_:
                dump_default = default
        if missing is not missing_:
            warnings.warn(
                "The 'missing' argument to fields is deprecated. "
                "Use 'load_default' instead.",
                RemovedInMarshmallow4Warning,
                stacklevel=2,
            )
            if load_default is missing_:
                load_default = missing
        self.dump_default = dump_default
        self.load_default = load_default

        self.attribute = attribute
        self.data_key = data_key
        self.validate = validate
        if validate is None:
            self.validators = []
        elif callable(validate):
            self.validators = [validate]
        elif utils.is_iterable_but_not_string(validate):
            self.validators = list(validate)
        else:
            raise ValueError(
                "The 'validate' parameter must be a callable "
                "or a collection of callables."
            )

        # If allow_none is None and load_default is None
        # None should be considered valid by default
        self.allow_none = load_default is None if allow_none is None else allow_none
        self.load_only = load_only
        self.dump_only = dump_only
        if required is True and load_default is not missing_:
            raise ValueError("'load_default' must not be set for required fields.")
        self.required = required

        metadata = metadata or {}
        self.metadata = {**metadata, **additional_metadata}
        if additional_metadata:
            warnings.warn(
                "Passing field metadata as keyword arguments is deprecated. Use the "
                "explicit `metadata=...` argument instead. "
                f"Additional metadata: {additional_metadata}",
                RemovedInMarshmallow4Warning,
                stacklevel=2,
            )

        # Collect default error message from self and parent classes
        messages = {}  # type: dict[str, str]
        for cls in reversed(self.__class__.__mro__):
            messages.update(getattr(cls, "default_error_messages", {}))
        messages.update(error_messages or {})
        self.error_messages = messages

    def __repr__(self) -> str:
        return (
            f"<fields.{self.__class__.__name__}(dump_default={self.dump_default!r}, "
            f"attribute={self.attribute!r}, "
            f"validate={self.validate}, required={self.required}, "
            f"load_only={self.load_only}, dump_only={self.dump_only}, "
            f"load_default={self.load_default}, allow_none={self.allow_none}, "
            f"error_messages={self.error_messages})>"
        )

    def __deepcopy__(self, memo):
        return copy.copy(self)

    def get_value(self, obj, attr, accessor=None, default=missing_):
        """Return the value for a given key from an object.

        :param object obj: The object to get the value from.
        :param str attr: The attribute/key in `obj` to get the value from.
        :param callable accessor: A callable used to retrieve the value of `attr` from
            the object `obj`. Defaults to `marshmallow.utils.get_value`.
        """
        accessor_func = accessor or utils.get_value
        check_key = attr if self.attribute is None else self.attribute
        return accessor_func(obj, check_key, default)

    def _validate(self, value):
        """Perform validation on ``value``. Raise a :exc:`ValidationError` if validation
        does not succeed.
        """
        self._validate_all(value)

    @property
    def _validate_all(self):
        return And(*self.validators, error=self.error_messages["validator_failed"])

    def make_error(self, key: str, **kwargs) -> ValidationError:
        """Helper method to make a `ValidationError` with an error message
        from ``self.error_messages``.
        """
        try:
            msg = self.error_messages[key]
        except KeyError as error:
            class_name = self.__class__.__name__
            message = (
                f"ValidationError raised by `{class_name}`, but error key `{key}` does "
                "not exist in the `error_messages` dictionary."
            )
            raise AssertionError(message) from error
        if isinstance(msg, (str, bytes)):
            msg = msg.format(**kwargs)
        return ValidationError(msg)

    def fail(self, key: str, **kwargs):
        """Helper method that raises a `ValidationError` with an error message
        from ``self.error_messages``.

        .. deprecated:: 3.0.0
            Use `make_error <marshmallow.fields.Field.make_error>` instead.
        """
        warnings.warn(
            f'`Field.fail` is deprecated. Use `raise self.make_error("{key}", ...)` instead.',
            RemovedInMarshmallow4Warning,
            stacklevel=2,
        )
        raise self.make_error(key=key, **kwargs)

    def _validate_missing(self, value):
        """Validate missing values. Raise a :exc:`ValidationError` if
        `value` should be considered missing.
        """
        if value is missing_ and self.required:
            raise self.make_error("required")
        if value is None and not self.allow_none:
            raise self.make_error("null")

    def serialize(
        self,
        attr: str,
        obj: typing.Any,
        accessor: typing.Callable[[typing.Any, str, typing.Any], typing.Any]
        | None = None,
        **kwargs,
    ):
        """Pulls the value for the given key from the object, applies the
        field's formatting and returns the result.

        :param attr: The attribute/key to get from the object.
        :param obj: The object to access the attribute/key from.
        :param accessor: Function used to access values from ``obj``.
        :param kwargs: Field-specific keyword arguments.
        """
        if self._CHECK_ATTRIBUTE:
            value = self.get_value(obj, attr, accessor=accessor)
            if value is missing_:
                default = self.dump_default
                value = default() if callable(default) else default
            if value is missing_:
                return value
        else:
            value = None
        return self._serialize(value, attr, obj, **kwargs)

    def deserialize(
        self,
        value: typing.Any,
        attr: str | None = None,
        data: typing.Mapping[str, typing.Any] | None = None,
        **kwargs,
    ):
        """Deserialize ``value``.

        :param value: The value to deserialize.
        :param attr: The attribute/key in `data` to deserialize.
        :param data: The raw input data passed to `Schema.load`.
        :param kwargs: Field-specific keyword arguments.
        :raise ValidationError: If an invalid value is passed or if a required value
            is missing.
        """
        # Validate required fields, deserialize, then validate
        # deserialized value
        self._validate_missing(value)
        if value is missing_:
            _miss = self.load_default
            return _miss() if callable(_miss) else _miss
        if self.allow_none and value is None:
            return None
        output = self._deserialize(value, attr, data, **kwargs)
        self._validate(output)
        return output

    # Methods for concrete classes to override.

    def _bind_to_schema(self, field_name, schema):
        """Update field with values from its parent schema. Called by
        :meth:`Schema._bind_field <marshmallow.Schema._bind_field>`.

        :param str field_name: Field name set in schema.
        :param Schema|Field schema: Parent object.
        """
        self.parent = self.parent or schema
        self.name = self.name or field_name
        self.root = self.root or (
            self.parent.root if isinstance(self.parent, FieldABC) else self.parent
        )

    def _serialize(
        self, value: typing.Any, attr: str | None, obj: typing.Any, **kwargs
    ):
        """Serializes ``value`` to a basic Python datatype. Noop by default.
        Concrete :class:`Field` classes should implement this method.

        Example: ::

            class TitleCase(Field):
                def _serialize(self, value, attr, obj, **kwargs):
                    if not value:
                        return ""
                    return str(value).title()

        :param value: The value to be serialized.
        :param str attr: The attribute or key on the object to be serialized.
        :param object obj: The object the value was pulled from.
        :param dict kwargs: Field-specific keyword arguments.
        :return: The serialized value
        """
        return value

    def _deserialize(
        self,
        value: typing.Any,
        attr: str | None,
        data: typing.Mapping[str, typing.Any] | None,
        **kwargs,
    ):
        """Deserialize value. Concrete :class:`Field` classes should implement this method.

        :param value: The value to be deserialized.
        :param attr: The attribute/key in `data` to be deserialized.
        :param data: The raw input data passed to the `Schema.load`.
        :param kwargs: Field-specific keyword arguments.
        :raise ValidationError: In case of formatting or validation failure.
        :return: The deserialized value.

        .. versionchanged:: 2.0.0
            Added ``attr`` and ``data`` parameters.

        .. versionchanged:: 3.0.0
            Added ``**kwargs`` to signature.
        """
        return value

    # Properties

    @property
    def context(self):
        """The context dictionary for the parent :class:`Schema`."""
        return self.parent.context

    # the default and missing properties are provided for compatibility and
    # emit warnings when they are accessed and set
    @property
    def default(self):
        warnings.warn(
            "The 'default' attribute of fields is deprecated. "
            "Use 'dump_default' instead.",
            RemovedInMarshmallow4Warning,
            stacklevel=2,
        )
        return self.dump_default

    @default.setter
    def default(self, value):
        warnings.warn(
            "The 'default' attribute of fields is deprecated. "
            "Use 'dump_default' instead.",
            RemovedInMarshmallow4Warning,
            stacklevel=2,
        )
        self.dump_default = value

    @property
    def missing(self):
        warnings.warn(
            "The 'missing' attribute of fields is deprecated. "
            "Use 'load_default' instead.",
            RemovedInMarshmallow4Warning,
            stacklevel=2,
        )
        return self.load_default

    @missing.setter
    def missing(self, value):
        warnings.warn(
            "The 'missing' attribute of fields is deprecated. "
            "Use 'load_default' instead.",
            RemovedInMarshmallow4Warning,
            stacklevel=2,
        )
        self.load_default = value


class Raw(Field):
    """Field that applies no formatting."""


class Nested(Field):
    """Allows you to nest a :class:`Schema <marshmallow.Schema>`
    inside a field.

    Examples: ::

        class ChildSchema(Schema):
            id = fields.Str()
            name = fields.Str()
            # Use lambda functions when you need two-way nesting or self-nesting
            parent = fields.Nested(lambda: ParentSchema(only=("id",)), dump_only=True)
            siblings = fields.List(fields.Nested(lambda: ChildSchema(only=("id", "name"))))


        class ParentSchema(Schema):
            id = fields.Str()
            children = fields.List(
                fields.Nested(ChildSchema(only=("id", "parent", "siblings")))
            )
            spouse = fields.Nested(lambda: ParentSchema(only=("id",)))

    When passing a `Schema <marshmallow.Schema>` instance as the first argument,
    the instance's ``exclude``, ``only``, and ``many`` attributes will be respected.

    Therefore, when passing the ``exclude``, ``only``, or ``many`` arguments to `fields.Nested`,
    you should pass a `Schema <marshmallow.Schema>` class (not an instance) as the first argument.

    ::

        # Yes
        author = fields.Nested(UserSchema, only=("id", "name"))

        # No
        author = fields.Nested(UserSchema(), only=("id", "name"))

    :param nested: `Schema` instance, class, class name (string), dictionary, or callable that
        returns a `Schema` or dictionary. Dictionaries are converted with `Schema.from_dict`.
    :param exclude: A list or tuple of fields to exclude.
    :param only: A list or tuple of fields to marshal. If `None`, all fields are marshalled.
        This parameter takes precedence over ``exclude``.
    :param many: Whether the field is a collection of objects.
    :param unknown: Whether to exclude, include, or raise an error for unknown
        fields in the data. Use `EXCLUDE`, `INCLUDE` or `RAISE`.
    :param kwargs: The same keyword arguments that :class:`Field` receives.
    """

    #: Default error messages.
    default_error_messages = {"type": "Invalid type."}

    def __init__(
        self,
        nested: SchemaABC
        | type
        | str
        | dict[str, Field | type]
        | typing.Callable[[], SchemaABC | type | dict[str, Field | type]],
        *,
        dump_default: typing.Any = missing_,
        default: typing.Any = missing_,
        only: types.StrSequenceOrSet | None = None,
        exclude: types.StrSequenceOrSet = (),
        many: bool = False,
        unknown: str | None = None,
        **kwargs,
    ):
        # Raise error if only or exclude is passed as string, not list of strings
        if only is not None and not is_collection(only):
            raise StringNotCollectionError('"only" should be a collection of strings.')
        if not is_collection(exclude):
            raise StringNotCollectionError(
                '"exclude" should be a collection of strings.'
            )
        if nested == "self":
            warnings.warn(
                "Passing 'self' to `Nested` is deprecated. "
                "Use `Nested(lambda: MySchema(...))` instead.",
                RemovedInMarshmallow4Warning,
                stacklevel=2,
            )
        self.nested = nested
        self.only = only
        self.exclude = exclude
        self.many = many
        self.unknown = unknown
        self._schema = None  # Cached Schema instance
        super().__init__(default=default, dump_default=dump_default, **kwargs)

    @property
    def schema(self):
        """The nested Schema object.

        .. versionchanged:: 1.0.0
            Renamed from `serializer` to `schema`.
        """
        if not self._schema:
            # Inherit context from parent.
            context = getattr(self.parent, "context", {})
            if callable(self.nested) and not isinstance(self.nested, type):
                nested = self.nested()
            else:
                nested = self.nested
            if isinstance(nested, dict):
                # defer the import of `marshmallow.schema` to avoid circular imports
                from .schema import Schema

                nested = Schema.from_dict(nested)

            if isinstance(nested, SchemaABC):
                self._schema = copy.copy(nested)
                self._schema.context.update(context)
                # Respect only and exclude passed from parent and re-initialize fields
                set_class = self._schema.set_class
                if self.only is not None:
                    if self._schema.only is not None:
                        original = self._schema.only
                    else:  # only=None -> all fields
                        original = self._schema.fields.keys()
                    self._schema.only = set_class(self.only) & set_class(original)
                if self.exclude:
                    original = self._schema.exclude
                    self._schema.exclude = set_class(self.exclude) | set_class(original)
                self._schema._init_fields()
            else:
                if isinstance(nested, type) and issubclass(nested, SchemaABC):
                    schema_class = nested
                elif not isinstance(nested, (str, bytes)):
                    raise ValueError(
                        "`Nested` fields must be passed a "
                        f"`Schema`, not {nested.__class__}."
                    )
                elif nested == "self":
                    schema_class = self.root.__class__
                else:
                    schema_class = class_registry.get_class(nested)
                self._schema = schema_class(
                    many=self.many,
                    only=self.only,
                    exclude=self.exclude,
                    context=context,
                    load_only=self._nested_normalized_option("load_only"),
                    dump_only=self._nested_normalized_option("dump_only"),
                )
        return self._schema

    def _nested_normalized_option(self, option_name: str) -> list[str]:
        nested_field = f"{self.name}."
        return [
            field.split(nested_field, 1)[1]
            for field in getattr(self.root, option_name, set())
            if field.startswith(nested_field)
        ]

    def _serialize(self, nested_obj, attr, obj, **kwargs):
        # Load up the schema first. This allows a RegistryError to be raised
        # if an invalid schema name was passed
        schema = self.schema
        if nested_obj is None:
            return None
        many = schema.many or self.many
        return schema.dump(nested_obj, many=many)

    def _test_collection(self, value):
        many = self.schema.many or self.many
        if many and not utils.is_collection(value):
            raise self.make_error("type", input=value, type=value.__class__.__name__)

    def _load(self, value, data, partial=None):
        try:
            valid_data = self.schema.load(value, unknown=self.unknown, partial=partial)
        except ValidationError as error:
            raise ValidationError(
                error.messages, valid_data=error.valid_data
            ) from error
        return valid_data

    def _deserialize(self, value, attr, data, partial=None, **kwargs):
        """Same as :meth:`Field._deserialize` with additional ``partial`` argument.

        :param bool|tuple partial: For nested schemas, the ``partial``
            parameter passed to `Schema.load`.

        .. versionchanged:: 3.0.0
            Add ``partial`` parameter.
        """
        self._test_collection(value)
        return self._load(value, data, partial=partial)


class Pluck(Nested):
    """Allows you to replace nested data with one of the data's fields.

    Example: ::

        from . import Schema, fields


        class ArtistSchema(Schema):
            id = fields.Int()
            name = fields.Str()


        class AlbumSchema(Schema):
            artist = fields.Pluck(ArtistSchema, "id")


        in_data = {"artist": 42}
        loaded = AlbumSchema().load(in_data)  # => {'artist': {'id': 42}}
        dumped = AlbumSchema().dump(loaded)  # => {'artist': 42}

    :param Schema nested: The Schema class or class name (string)
        to nest, or ``"self"`` to nest the :class:`Schema` within itself.
    :param str field_name: The key to pluck a value from.
    :param kwargs: The same keyword arguments that :class:`Nested` receives.
    """

    def __init__(
        self,
        nested: SchemaABC | type | str | typing.Callable[[], SchemaABC],
        field_name: str,
        **kwargs,
    ):
        super().__init__(nested, only=(field_name,), **kwargs)
        self.field_name = field_name

    @property
    def _field_data_key(self):
        only_field = self.schema.fields[self.field_name]
        return only_field.data_key or self.field_name

    def _serialize(self, nested_obj, attr, obj, **kwargs):
        ret = super()._serialize(nested_obj, attr, obj, **kwargs)
        if ret is None:
            return None
        if self.many:
            return utils.pluck(ret, key=self._field_data_key)
        return ret[self._field_data_key]

    def _deserialize(self, value, attr, data, partial=None, **kwargs):
        self._test_collection(value)
        if self.many:
            value = [{self._field_data_key: v} for v in value]
        else:
            value = {self._field_data_key: value}
        return self._load(value, data, partial=partial)


class List(Field):
    """A list field, composed with another `Field` class or
    instance.

    Example: ::

        numbers = fields.List(fields.Float())

    :param cls_or_instance: A field class or instance.
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    .. versionchanged:: 2.0.0
        The ``allow_none`` parameter now applies to deserialization and
        has the same semantics as the other fields.

    .. versionchanged:: 3.0.0rc9
        Does not serialize scalar values to single-item lists.
    """

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid list."}

    def __init__(self, cls_or_instance: Field | type, **kwargs):
        super().__init__(**kwargs)
        try:
            self.inner = resolve_field_instance(cls_or_instance)
        except FieldInstanceResolutionError as error:
            raise ValueError(
                "The list elements must be a subclass or instance of "
                "marshmallow.base.FieldABC."
            ) from error
        if isinstance(self.inner, Nested):
            self.only = self.inner.only
            self.exclude = self.inner.exclude

    def _bind_to_schema(self, field_name, schema):
        super()._bind_to_schema(field_name, schema)
        self.inner = copy.deepcopy(self.inner)
        self.inner._bind_to_schema(field_name, self)
        if isinstance(self.inner, Nested):
            self.inner.only = self.only
            self.inner.exclude = self.exclude

    def _serialize(self, value, attr, obj, **kwargs) -> list[typing.Any] | None:
        if value is None:
            return None
        return [self.inner._serialize(each, attr, obj, **kwargs) for each in value]

    def _deserialize(self, value, attr, data, **kwargs) -> list[typing.Any]:
        if not utils.is_collection(value):
            raise self.make_error("invalid")

        result = []
        errors = {}
        for idx, each in enumerate(value):
            try:
                result.append(self.inner.deserialize(each, **kwargs))
            except ValidationError as error:
                if error.valid_data is not None:
                    result.append(error.valid_data)
                errors.update({idx: error.messages})
        if errors:
            raise ValidationError(errors, valid_data=result)
        return result


class Tuple(Field):
    """A tuple field, composed of a fixed number of other `Field` classes or
    instances

    Example: ::

        row = Tuple((fields.String(), fields.Integer(), fields.Float()))

    .. note::
        Because of the structured nature of `collections.namedtuple` and
        `typing.NamedTuple`, using a Schema within a Nested field for them is
        more appropriate than using a `Tuple` field.

    :param Iterable[Field] tuple_fields: An iterable of field classes or
        instances.
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    .. versionadded:: 3.0.0rc4
    """

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid tuple."}

    def __init__(self, tuple_fields, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not utils.is_collection(tuple_fields):
            raise ValueError(
                "tuple_fields must be an iterable of Field classes or " "instances."
            )

        try:
            self.tuple_fields = [
                resolve_field_instance(cls_or_instance)
                for cls_or_instance in tuple_fields
            ]
        except FieldInstanceResolutionError as error:
            raise ValueError(
                'Elements of "tuple_fields" must be subclasses or '
                "instances of marshmallow.base.FieldABC."
            ) from error

        self.validate_length = Length(equal=len(self.tuple_fields))

    def _bind_to_schema(self, field_name, schema):
        super()._bind_to_schema(field_name, schema)
        new_tuple_fields = []
        for field in self.tuple_fields:
            field = copy.deepcopy(field)
            field._bind_to_schema(field_name, self)
            new_tuple_fields.append(field)

        self.tuple_fields = new_tuple_fields

    def _serialize(self, value, attr, obj, **kwargs) -> tuple | None:
        if value is None:
            return None

        return tuple(
            field._serialize(each, attr, obj, **kwargs)
            for field, each in zip(self.tuple_fields, value)
        )

    def _deserialize(self, value, attr, data, **kwargs) -> tuple:
        if not utils.is_collection(value):
            raise self.make_error("invalid")

        self.validate_length(value)

        result = []
        errors = {}

        for idx, (field, each) in enumerate(zip(self.tuple_fields, value)):
            try:
                result.append(field.deserialize(each, **kwargs))
            except ValidationError as error:
                if error.valid_data is not None:
                    result.append(error.valid_data)
                errors.update({idx: error.messages})
        if errors:
            raise ValidationError(errors, valid_data=result)

        return tuple(result)


class String(Field):
    """A string field.

    :param kwargs: The same keyword arguments that :class:`Field` receives.
    """

    #: Default error messages.
    default_error_messages = {
        "invalid": "Not a valid string.",
        "invalid_utf8": "Not a valid utf-8 string.",
    }

    def _serialize(self, value, attr, obj, **kwargs) -> str | None:
        if value is None:
            return None
        return utils.ensure_text_type(value)

    def _deserialize(self, value, attr, data, **kwargs) -> typing.Any:
        if not isinstance(value, (str, bytes)):
            raise self.make_error("invalid")
        try:
            return utils.ensure_text_type(value)
        except UnicodeDecodeError as error:
            raise self.make_error("invalid_utf8") from error


class UUID(String):
    """A UUID field."""

    #: Default error messages.
    default_error_messages = {"invalid_uuid": "Not a valid UUID."}

    def _validated(self, value) -> uuid.UUID | None:
        """Format the value or raise a :exc:`ValidationError` if an error occurs."""
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        try:
            if isinstance(value, bytes) and len(value) == 16:
                return uuid.UUID(bytes=value)
            return uuid.UUID(value)
        except (ValueError, AttributeError, TypeError) as error:
            raise self.make_error("invalid_uuid") from error

    def _deserialize(self, value, attr, data, **kwargs) -> uuid.UUID | None:
        return self._validated(value)


class Number(Field):
    """Base class for number fields.

    :param bool as_string: If `True`, format the serialized value as a string.
    :param kwargs: The same keyword arguments that :class:`Field` receives.
    """

    num_type = float  # type: typing.Type

    #: Default error messages.
    default_error_messages = {
        "invalid": "Not a valid number.",
        "too_large": "Number too large.",
    }

    def __init__(self, *, as_string: bool = False, **kwargs):
        self.as_string = as_string
        super().__init__(**kwargs)

    def _format_num(self, value) -> typing.Any:
        """Return the number value for value, given this field's `num_type`."""
        return self.num_type(value)

    def _validated(self, value) -> _T | None:
        """Format the value or raise a :exc:`ValidationError` if an error occurs."""
        if value is None:
            return None
        # (value is True or value is False) is ~5x faster than isinstance(value, bool)
        if value is True or value is False:
            raise self.make_error("invalid", input=value)
        try:
            return self._format_num(value)
        except (TypeError, ValueError) as error:
            raise self.make_error("invalid", input=value) from error
        except OverflowError as error:
            raise self.make_error("too_large", input=value) from error

    def _to_string(self, value) -> str:
        return str(value)

    def _serialize(self, value, attr, obj, **kwargs) -> str | _T | None:
        """Return a string if `self.as_string=True`, otherwise return this field's `num_type`."""
        if value is None:
            return None
        ret = self._format_num(value)  # type: _T
        return self._to_string(ret) if self.as_string else ret

    def _deserialize(self, value, attr, data, **kwargs) -> _T | None:
        return self._validated(value)


class Integer(Number):
    """An integer field.

    :param strict: If `True`, only integer types are valid.
        Otherwise, any value castable to `int` is valid.
    :param kwargs: The same keyword arguments that :class:`Number` receives.
    """

    num_type = int

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid integer."}

    def __init__(self, *, strict: bool = False, **kwargs):
        self.strict = strict
        super().__init__(**kwargs)

    # override Number
    def _validated(self, value):
        if self.strict and not isinstance(value, numbers.Integral):
            raise self.make_error("invalid", input=value)
        return super()._validated(value)


class Float(Number):
    """A double as an IEEE-754 double precision string.

    :param bool allow_nan: If `True`, `NaN`, `Infinity` and `-Infinity` are allowed,
        even though they are illegal according to the JSON specification.
    :param bool as_string: If `True`, format the value as a string.
    :param kwargs: The same keyword arguments that :class:`Number` receives.
    """

    num_type = float

    #: Default error messages.
    default_error_messages = {
        "special": "Special numeric values (nan or infinity) are not permitted."
    }

    def __init__(self, *, allow_nan: bool = False, as_string: bool = False, **kwargs):
        self.allow_nan = allow_nan
        super().__init__(as_string=as_string, **kwargs)

    def _validated(self, value):
        num = super()._validated(value)
        if self.allow_nan is False:
            if math.isnan(num) or num == float("inf") or num == float("-inf"):
                raise self.make_error("special")
        return num


class Decimal(Number):
    """A field that (de)serializes to the Python ``decimal.Decimal`` type.
    It's safe to use when dealing with money values, percentages, ratios
    or other numbers where precision is critical.

    .. warning::

        This field serializes to a `decimal.Decimal` object by default. If you need
        to render your data as JSON, keep in mind that the `json` module from the
        standard library does not encode `decimal.Decimal`. Therefore, you must use
        a JSON library that can handle decimals, such as `simplejson`, or serialize
        to a string by passing ``as_string=True``.

    .. warning::

        If a JSON `float` value is passed to this field for deserialization it will
        first be cast to its corresponding `string` value before being deserialized
        to a `decimal.Decimal` object. The default `__str__` implementation of the
        built-in Python `float` type may apply a destructive transformation upon
        its input data and therefore cannot be relied upon to preserve precision.
        To avoid this, you can instead pass a JSON `string` to be deserialized
        directly.

    :param places: How many decimal places to quantize the value. If `None`, does
        not quantize the value.
    :param rounding: How to round the value during quantize, for example
        `decimal.ROUND_UP`. If `None`, uses the rounding value from
        the current thread's context.
    :param allow_nan: If `True`, `NaN`, `Infinity` and `-Infinity` are allowed,
        even though they are illegal according to the JSON specification.
    :param as_string: If `True`, serialize to a string instead of a Python
        `decimal.Decimal` type.
    :param kwargs: The same keyword arguments that :class:`Number` receives.

    .. versionadded:: 1.2.0
    """

    num_type = decimal.Decimal

    #: Default error messages.
    default_error_messages = {
        "special": "Special numeric values (nan or infinity) are not permitted."
    }

    def __init__(
        self,
        places: int | None = None,
        rounding: str | None = None,
        *,
        allow_nan: bool = False,
        as_string: bool = False,
        **kwargs,
    ):
        self.places = (
            decimal.Decimal((0, (1,), -places)) if places is not None else None
        )
        self.rounding = rounding
        self.allow_nan = allow_nan
        super().__init__(as_string=as_string, **kwargs)

    # override Number
    def _format_num(self, value):
        num = decimal.Decimal(str(value))
        if self.allow_nan:
            if num.is_nan():
                return decimal.Decimal("NaN")  # avoid sNaN, -sNaN and -NaN
        if self.places is not None and num.is_finite():
            num = num.quantize(self.places, rounding=self.rounding)
        return num

    # override Number
    def _validated(self, value):
        try:
            num = super()._validated(value)
        except decimal.InvalidOperation as error:
            raise self.make_error("invalid") from error
        if not self.allow_nan and (num.is_nan() or num.is_infinite()):
            raise self.make_error("special")
        return num

    # override Number
    def _to_string(self, value):
        return format(value, "f")


class Boolean(Field):
    """A boolean field.

    :param truthy: Values that will (de)serialize to `True`. If an empty
        set, any non-falsy value will deserialize to `True`. If `None`,
        `marshmallow.fields.Boolean.truthy` will be used.
    :param falsy: Values that will (de)serialize to `False`. If `None`,
        `marshmallow.fields.Boolean.falsy` will be used.
    :param kwargs: The same keyword arguments that :class:`Field` receives.
    """

    #: Default truthy values.
    truthy = {
        "t",
        "T",
        "true",
        "True",
        "TRUE",
        "on",
        "On",
        "ON",
        "y",
        "Y",
        "yes",
        "Yes",
        "YES",
        "1",
        1,
        # Equal to 1
        # True,
    }
    #: Default falsy values.
    falsy = {
        "f",
        "F",
        "false",
        "False",
        "FALSE",
        "off",
        "Off",
        "OFF",
        "n",
        "N",
        "no",
        "No",
        "NO",
        "0",
        0,
        # Equal to 0
        # 0.0,
        # False,
    }

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid boolean."}

    def __init__(
        self,
        *,
        truthy: set | None = None,
        falsy: set | None = None,
        **kwargs,
    ):
        super().__init__(**kwargs)

        if truthy is not None:
            self.truthy = set(truthy)
        if falsy is not None:
            self.falsy = set(falsy)

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None

        try:
            if value in self.truthy:
                return True
            if value in self.falsy:
                return False
        except TypeError:
            pass

        return bool(value)

    def _deserialize(self, value, attr, data, **kwargs):
        if not self.truthy:
            return bool(value)
        try:
            if value in self.truthy:
                return True
            if value in self.falsy:
                return False
        except TypeError as error:
            raise self.make_error("invalid", input=value) from error
        raise self.make_error("invalid", input=value)


class DateTime(Field):
    """A formatted datetime string.

    Example: ``'2014-12-22T03:12:58.019077+00:00'``

    :param format: Either ``"rfc"`` (for RFC822), ``"iso"`` (for ISO8601),
        ``"timestamp"``, ``"timestamp_ms"`` (for a POSIX timestamp) or a date format string.
        If `None`, defaults to "iso".
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    .. versionchanged:: 3.0.0rc9
        Does not modify timezone information on (de)serialization.
    .. versionchanged:: 3.19
        Add timestamp as a format.
    """

    SERIALIZATION_FUNCS = {
        "iso": utils.isoformat,
        "iso8601": utils.isoformat,
        "rfc": utils.rfcformat,
        "rfc822": utils.rfcformat,
        "timestamp": utils.timestamp,
        "timestamp_ms": utils.timestamp_ms,
    }  # type: typing.Dict[str, typing.Callable[[typing.Any], str | float]]

    DESERIALIZATION_FUNCS = {
        "iso": utils.from_iso_datetime,
        "iso8601": utils.from_iso_datetime,
        "rfc": utils.from_rfc,
        "rfc822": utils.from_rfc,
        "timestamp": utils.from_timestamp,
        "timestamp_ms": utils.from_timestamp_ms,
    }  # type: typing.Dict[str, typing.Callable[[str], typing.Any]]

    DEFAULT_FORMAT = "iso"

    OBJ_TYPE = "datetime"

    SCHEMA_OPTS_VAR_NAME = "datetimeformat"

    #: Default error messages.
    default_error_messages = {
        "invalid": "Not a valid {obj_type}.",
        "invalid_awareness": "Not a valid {awareness} {obj_type}.",
        "format": '"{input}" cannot be formatted as a {obj_type}.',
    }

    def __init__(self, format: str | None = None, **kwargs) -> None:
        super().__init__(**kwargs)
        # Allow this to be None. It may be set later in the ``_serialize``
        # or ``_deserialize`` methods. This allows a Schema to dynamically set the
        # format, e.g. from a Meta option
        self.format = format

    def _bind_to_schema(self, field_name, schema):
        super()._bind_to_schema(field_name, schema)
        self.format = (
            self.format
            or getattr(self.root.opts, self.SCHEMA_OPTS_VAR_NAME)
            or self.DEFAULT_FORMAT
        )

    def _serialize(self, value, attr, obj, **kwargs) -> str | float | None:
        if value is None:
            return None
        data_format = self.format or self.DEFAULT_FORMAT
        format_func = self.SERIALIZATION_FUNCS.get(data_format)
        if format_func:
            return format_func(value)
        return value.strftime(data_format)

    def _deserialize(self, value, attr, data, **kwargs) -> dt.datetime:
        data_format = self.format or self.DEFAULT_FORMAT
        func = self.DESERIALIZATION_FUNCS.get(data_format)
        try:
            if func:
                return func(value)
            return self._make_object_from_format(value, data_format)
        except (TypeError, AttributeError, ValueError) as error:
            raise self.make_error(
                "invalid", input=value, obj_type=self.OBJ_TYPE
            ) from error

    @staticmethod
    def _make_object_from_format(value, data_format) -> dt.datetime:
        return dt.datetime.strptime(value, data_format)


class NaiveDateTime(DateTime):
    """A formatted naive datetime string.

    :param format: See :class:`DateTime`.
    :param timezone: Used on deserialization. If `None`,
        aware datetimes are rejected. If not `None`, aware datetimes are
        converted to this timezone before their timezone information is
        removed.
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    .. versionadded:: 3.0.0rc9
    """

    AWARENESS = "naive"

    def __init__(
        self,
        format: str | None = None,
        *,
        timezone: dt.timezone | None = None,
        **kwargs,
    ) -> None:
        super().__init__(format=format, **kwargs)
        self.timezone = timezone

    def _deserialize(self, value, attr, data, **kwargs) -> dt.datetime:
        ret = super()._deserialize(value, attr, data, **kwargs)
        if is_aware(ret):
            if self.timezone is None:
                raise self.make_error(
                    "invalid_awareness",
                    awareness=self.AWARENESS,
                    obj_type=self.OBJ_TYPE,
                )
            ret = ret.astimezone(self.timezone).replace(tzinfo=None)
        return ret


class AwareDateTime(DateTime):
    """A formatted aware datetime string.

    :param format: See :class:`DateTime`.
    :param default_timezone: Used on deserialization. If `None`, naive
        datetimes are rejected. If not `None`, naive datetimes are set this
        timezone.
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    .. versionadded:: 3.0.0rc9
    """

    AWARENESS = "aware"

    def __init__(
        self,
        format: str | None = None,
        *,
        default_timezone: dt.tzinfo | None = None,
        **kwargs,
    ) -> None:
        super().__init__(format=format, **kwargs)
        self.default_timezone = default_timezone

    def _deserialize(self, value, attr, data, **kwargs) -> dt.datetime:
        ret = super()._deserialize(value, attr, data, **kwargs)
        if not is_aware(ret):
            if self.default_timezone is None:
                raise self.make_error(
                    "invalid_awareness",
                    awareness=self.AWARENESS,
                    obj_type=self.OBJ_TYPE,
                )
            ret = ret.replace(tzinfo=self.default_timezone)
        return ret


class Time(DateTime):
    """A formatted time string.

    Example: ``'03:12:58.019077'``

    :param format: Either ``"iso"`` (for ISO8601) or a date format string.
        If `None`, defaults to "iso".
    :param kwargs: The same keyword arguments that :class:`Field` receives.
    """

    SERIALIZATION_FUNCS = {"iso": utils.to_iso_time, "iso8601": utils.to_iso_time}

    DESERIALIZATION_FUNCS = {"iso": utils.from_iso_time, "iso8601": utils.from_iso_time}

    DEFAULT_FORMAT = "iso"

    OBJ_TYPE = "time"

    SCHEMA_OPTS_VAR_NAME = "timeformat"

    @staticmethod
    def _make_object_from_format(value, data_format):
        return dt.datetime.strptime(value, data_format).time()


class Date(DateTime):
    """ISO8601-formatted date string.

    :param format: Either ``"iso"`` (for ISO8601) or a date format string.
        If `None`, defaults to "iso".
    :param kwargs: The same keyword arguments that :class:`Field` receives.
    """

    #: Default error messages.
    default_error_messages = {
        "invalid": "Not a valid date.",
        "format": '"{input}" cannot be formatted as a date.',
    }

    SERIALIZATION_FUNCS = {"iso": utils.to_iso_date, "iso8601": utils.to_iso_date}

    DESERIALIZATION_FUNCS = {"iso": utils.from_iso_date, "iso8601": utils.from_iso_date}

    DEFAULT_FORMAT = "iso"

    OBJ_TYPE = "date"

    SCHEMA_OPTS_VAR_NAME = "dateformat"

    @staticmethod
    def _make_object_from_format(value, data_format):
        return dt.datetime.strptime(value, data_format).date()


class TimeDelta(Field):
    """A field that (de)serializes a :class:`datetime.timedelta` object to an
    integer or float and vice versa. The integer or float can represent the
    number of days, seconds or microseconds.

    :param precision: Influences how the integer or float is interpreted during
        (de)serialization. Must be 'days', 'seconds', 'microseconds',
        'milliseconds', 'minutes', 'hours' or 'weeks'.
    :param serialization_type: Whether to (de)serialize to a `int` or `float`.
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    Integer Caveats
    ---------------
    Any fractional parts (which depends on the precision used) will be truncated
    when serializing using `int`.

    Float Caveats
    -------------
    Use of `float` when (de)serializing may result in data precision loss due
    to the way machines handle floating point values.

    Regardless of the precision chosen, the fractional part when using `float`
    will always be truncated to microseconds.
    For example, `1.12345` interpreted as microseconds will result in `timedelta(microseconds=1)`.

    .. versionchanged:: 2.0.0
        Always serializes to an integer value to avoid rounding errors.
        Add `precision` parameter.
    .. versionchanged:: 3.17.0
        Allow (de)serialization to `float` through use of a new `serialization_type` parameter.
        `int` is the default to retain previous behaviour.
    """

    DAYS = "days"
    SECONDS = "seconds"
    MICROSECONDS = "microseconds"
    MILLISECONDS = "milliseconds"
    MINUTES = "minutes"
    HOURS = "hours"
    WEEKS = "weeks"

    #: Default error messages.
    default_error_messages = {
        "invalid": "Not a valid period of time.",
        "format": "{input!r} cannot be formatted as a timedelta.",
    }

    def __init__(
        self,
        precision: str = SECONDS,
        serialization_type: type[int | float] = int,
        **kwargs,
    ):
        precision = precision.lower()
        units = (
            self.DAYS,
            self.SECONDS,
            self.MICROSECONDS,
            self.MILLISECONDS,
            self.MINUTES,
            self.HOURS,
            self.WEEKS,
        )

        if precision not in units:
            msg = 'The precision must be {} or "{}".'.format(
                ", ".join([f'"{each}"' for each in units[:-1]]), units[-1]
            )
            raise ValueError(msg)

        if serialization_type not in (int, float):
            raise ValueError("The serialization type must be one of int or float")

        self.precision = precision
        self.serialization_type = serialization_type
        super().__init__(**kwargs)

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None

        base_unit = dt.timedelta(**{self.precision: 1})

        if self.serialization_type is int:
            delta = utils.timedelta_to_microseconds(value)
            unit = utils.timedelta_to_microseconds(base_unit)
            return delta // unit
        assert self.serialization_type is float
        return value.total_seconds() / base_unit.total_seconds()

    def _deserialize(self, value, attr, data, **kwargs):
        try:
            value = self.serialization_type(value)
        except (TypeError, ValueError) as error:
            raise self.make_error("invalid") from error

        kwargs = {self.precision: value}

        try:
            return dt.timedelta(**kwargs)
        except OverflowError as error:
            raise self.make_error("invalid") from error


class Mapping(Field):
    """An abstract class for objects with key-value pairs.

    :param keys: A field class or instance for dict keys.
    :param values: A field class or instance for dict values.
    :param kwargs: The same keyword arguments that :class:`Field` receives.

    .. note::
        When the structure of nested data is not known, you may omit the
        `keys` and `values` arguments to prevent content validation.

    .. versionadded:: 3.0.0rc4
    """

    mapping_type = dict

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid mapping type."}

    def __init__(
        self,
        keys: Field | type | None = None,
        values: Field | type | None = None,
        **kwargs,
    ):
        super().__init__(**kwargs)
        if keys is None:
            self.key_field = None
        else:
            try:
                self.key_field = resolve_field_instance(keys)
            except FieldInstanceResolutionError as error:
                raise ValueError(
                    '"keys" must be a subclass or instance of '
                    "marshmallow.base.FieldABC."
                ) from error

        if values is None:
            self.value_field = None
        else:
            try:
                self.value_field = resolve_field_instance(values)
            except FieldInstanceResolutionError as error:
                raise ValueError(
                    '"values" must be a subclass or instance of '
                    "marshmallow.base.FieldABC."
                ) from error
            if isinstance(self.value_field, Nested):
                self.only = self.value_field.only
                self.exclude = self.value_field.exclude

    def _bind_to_schema(self, field_name, schema):
        super()._bind_to_schema(field_name, schema)
        if self.value_field:
            self.value_field = copy.deepcopy(self.value_field)
            self.value_field._bind_to_schema(field_name, self)
        if isinstance(self.value_field, Nested):
            self.value_field.only = self.only
            self.value_field.exclude = self.exclude
        if self.key_field:
            self.key_field = copy.deepcopy(self.key_field)
            self.key_field._bind_to_schema(field_name, self)

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        if not self.value_field and not self.key_field:
            return self.mapping_type(value)

        #  Serialize keys
        if self.key_field is None:
            keys = {k: k for k in value.keys()}
        else:
            keys = {
                k: self.key_field._serialize(k, None, None, **kwargs)
                for k in value.keys()
            }

        #  Serialize values
        result = self.mapping_type()
        if self.value_field is None:
            for k, v in value.items():
                if k in keys:
                    result[keys[k]] = v
        else:
            for k, v in value.items():
                result[keys[k]] = self.value_field._serialize(v, None, None, **kwargs)

        return result

    def _deserialize(self, value, attr, data, **kwargs):
        if not isinstance(value, _Mapping):
            raise self.make_error("invalid")
        if not self.value_field and not self.key_field:
            return self.mapping_type(value)

        errors = collections.defaultdict(dict)

        #  Deserialize keys
        if self.key_field is None:
            keys = {k: k for k in value.keys()}
        else:
            keys = {}
            for key in value.keys():
                try:
                    keys[key] = self.key_field.deserialize(key, **kwargs)
                except ValidationError as error:
                    errors[key]["key"] = error.messages

        #  Deserialize values
        result = self.mapping_type()
        if self.value_field is None:
            for k, v in value.items():
                if k in keys:
                    result[keys[k]] = v
        else:
            for key, val in value.items():
                try:
                    deser_val = self.value_field.deserialize(val, **kwargs)
                except ValidationError as error:
                    errors[key]["value"] = error.messages
                    if error.valid_data is not None and key in keys:
                        result[keys[key]] = error.valid_data
                else:
                    if key in keys:
                        result[keys[key]] = deser_val

        if errors:
            raise ValidationError(errors, valid_data=result)

        return result


class Dict(Mapping):
    """A dict field. Supports dicts and dict-like objects. Extends
    Mapping with dict as the mapping_type.

    Example: ::

        numbers = fields.Dict(keys=fields.Str(), values=fields.Float())

    :param kwargs: The same keyword arguments that :class:`Mapping` receives.

    .. versionadded:: 2.1.0
    """

    mapping_type = dict


class Url(String):
    """An URL field.

    :param default: Default value for the field if the attribute is not set.
    :param relative: Whether to allow relative URLs.
    :param require_tld: Whether to reject non-FQDN hostnames.
    :param schemes: Valid schemes. By default, ``http``, ``https``,
        ``ftp``, and ``ftps`` are allowed.
    :param kwargs: The same keyword arguments that :class:`String` receives.
    """

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid URL."}

    def __init__(
        self,
        *,
        relative: bool = False,
        absolute: bool = True,
        schemes: types.StrSequenceOrSet | None = None,
        require_tld: bool = True,
        **kwargs,
    ):
        super().__init__(**kwargs)

        self.relative = relative
        self.absolute = absolute
        self.require_tld = require_tld
        # Insert validation into self.validators so that multiple errors can be stored.
        validator = validate.URL(
            relative=self.relative,
            absolute=self.absolute,
            schemes=schemes,
            require_tld=self.require_tld,
            error=self.error_messages["invalid"],
        )
        self.validators.insert(0, validator)


class Email(String):
    """An email field.

    :param args: The same positional arguments that :class:`String` receives.
    :param kwargs: The same keyword arguments that :class:`String` receives.
    """

    #: Default error messages.
    default_error_messages = {"invalid": "Not a valid email address."}

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        # Insert validation into self.validators so that multiple errors can be stored.
        validator = validate.Email(error=self.error_messages["invalid"])
        self.validators.insert(0, validator)


class IP(Field):
    """A IP address field.

    :param bool exploded: If `True`, serialize ipv6 address in long form, ie. with groups
        consisting entirely of zeros included.

    .. versionadded:: 3.8.0
    """

    default_error_messages = {"invalid_ip": "Not a valid IP address."}

    DESERIALIZATION_CLASS = None  # type: typing.Optional[typing.Type]

    def __init__(self, *args, exploded=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.exploded = exploded

    def _serialize(self, value, attr, obj, **kwargs) -> str | None:
        if value is None:
            return None
        if self.exploded:
            return value.exploded
        return value.compressed

    def _deserialize(
        self, value, attr, data, **kwargs
    ) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
        if value is None:
            return None
        try:
            return (self.DESERIALIZATION_CLASS or ipaddress.ip_address)(
                utils.ensure_text_type(value)
            )
        except (ValueError, TypeError) as error:
            raise self.make_error("invalid_ip") from error


class IPv4(IP):
    """A IPv4 address field.

    .. versionadded:: 3.8.0
    """

    default_error_messages = {"invalid_ip": "Not a valid IPv4 address."}

    DESERIALIZATION_CLASS = ipaddress.IPv4Address


class IPv6(IP):
    """A IPv6 address field.

    .. versionadded:: 3.8.0
    """

    default_error_messages = {"invalid_ip": "Not a valid IPv6 address."}

    DESERIALIZATION_CLASS = ipaddress.IPv6Address


class IPInterface(Field):
    """A IPInterface field.

    IP interface is the non-strict form of the IPNetwork type where arbitrary host
    addresses are always accepted.

    IPAddress and mask e.g. '192.168.0.2/24' or '192.168.0.2/255.255.255.0'

    see https://python.readthedocs.io/en/latest/library/ipaddress.html#interface-objects

    :param bool exploded: If `True`, serialize ipv6 interface in long form, ie. with groups
        consisting entirely of zeros included.
    """

    default_error_messages = {"invalid_ip_interface": "Not a valid IP interface."}

    DESERIALIZATION_CLASS = None  # type: typing.Optional[typing.Type]

    def __init__(self, *args, exploded: bool = False, **kwargs):
        super().__init__(*args, **kwargs)
        self.exploded = exploded

    def _serialize(self, value, attr, obj, **kwargs) -> str | None:
        if value is None:
            return None
        if self.exploded:
            return value.exploded
        return value.compressed

    def _deserialize(self, value, attr, data, **kwargs) -> None | (
        ipaddress.IPv4Interface | ipaddress.IPv6Interface
    ):
        if value is None:
            return None
        try:
            return (self.DESERIALIZATION_CLASS or ipaddress.ip_interface)(
                utils.ensure_text_type(value)
            )
        except (ValueError, TypeError) as error:
            raise self.make_error("invalid_ip_interface") from error


class IPv4Interface(IPInterface):
    """A IPv4 Network Interface field."""

    default_error_messages = {"invalid_ip_interface": "Not a valid IPv4 interface."}

    DESERIALIZATION_CLASS = ipaddress.IPv4Interface


class IPv6Interface(IPInterface):
    """A IPv6 Network Interface field."""

    default_error_messages = {"invalid_ip_interface": "Not a valid IPv6 interface."}

    DESERIALIZATION_CLASS = ipaddress.IPv6Interface


class Enum(Field):
    """An Enum field (de)serializing enum members by symbol (name) or by value.

    :param enum Enum: Enum class
    :param boolean|Schema|Field by_value: Whether to (de)serialize by value or by name,
        or Field class or instance to use to (de)serialize by value. Defaults to False.

    If `by_value` is `False` (default), enum members are (de)serialized by symbol (name).
    If it is `True`, they are (de)serialized by value using :class:`Field`.
    If it is a field instance or class, they are (de)serialized by value using this field.

    .. versionadded:: 3.18.0
    """

    default_error_messages = {
        "unknown": "Must be one of: {choices}.",
    }

    def __init__(
        self,
        enum: type[EnumType],
        *,
        by_value: bool | Field | type = False,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.enum = enum
        self.by_value = by_value

        # Serialization by name
        if by_value is False:
            self.field: Field = String()
            self.choices_text = ", ".join(
                str(self.field._serialize(m, None, None)) for m in enum.__members__
            )
        # Serialization by value
        else:
            if by_value is True:
                self.field = Field()
            else:
                try:
                    self.field = resolve_field_instance(by_value)
                except FieldInstanceResolutionError as error:
                    raise ValueError(
                        '"by_value" must be either a bool or a subclass or instance of '
                        "marshmallow.base.FieldABC."
                    ) from error
            self.choices_text = ", ".join(
                str(self.field._serialize(m.value, None, None)) for m in enum
            )

    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        if self.by_value:
            val = value.value
        else:
            val = value.name
        return self.field._serialize(val, attr, obj, **kwargs)

    def _deserialize(self, value, attr, data, **kwargs):
        val = self.field._deserialize(value, attr, data, **kwargs)
        if self.by_value:
            try:
                return self.enum(val)
            except ValueError as error:
                raise self.make_error("unknown", choices=self.choices_text) from error
        try:
            return getattr(self.enum, val)
        except AttributeError as error:
            raise self.make_error("unknown", choices=self.choices_text) from error


class Method(Field):
    """A field that takes the value returned by a `Schema` method.

    :param str serialize: The name of the Schema method from which
        to retrieve the value. The method must take an argument ``obj``
        (in addition to self) that is the object to be serialized.
    :param str deserialize: Optional name of the Schema method for deserializing
        a value The method must take a single argument ``value``, which is the
        value to deserialize.

    .. versionchanged:: 2.0.0
        Removed optional ``context`` parameter on methods. Use ``self.context`` instead.

    .. versionchanged:: 2.3.0
        Deprecated ``method_name`` parameter in favor of ``serialize`` and allow
        ``serialize`` to not be passed at all.

    .. versionchanged:: 3.0.0
        Removed ``method_name`` parameter.
    """

    _CHECK_ATTRIBUTE = False

    def __init__(
        self,
        serialize: str | None = None,
        deserialize: str | None = None,
        **kwargs,
    ):
        # Set dump_only and load_only based on arguments
        kwargs["dump_only"] = bool(serialize) and not bool(deserialize)
        kwargs["load_only"] = bool(deserialize) and not bool(serialize)
        super().__init__(**kwargs)
        self.serialize_method_name = serialize
        self.deserialize_method_name = deserialize
        self._serialize_method = None
        self._deserialize_method = None

    def _bind_to_schema(self, field_name, schema):
        if self.serialize_method_name:
            self._serialize_method = utils.callable_or_raise(
                getattr(schema, self.serialize_method_name)
            )

        if self.deserialize_method_name:
            self._deserialize_method = utils.callable_or_raise(
                getattr(schema, self.deserialize_method_name)
            )

        super()._bind_to_schema(field_name, schema)

    def _serialize(self, value, attr, obj, **kwargs):
        if self._serialize_method is not None:
            return self._serialize_method(obj)
        return missing_

    def _deserialize(self, value, attr, data, **kwargs):
        if self._deserialize_method is not None:
            return self._deserialize_method(value)
        return value


class Function(Field):
    """A field that takes the value returned by a function.

    :param serialize: A callable from which to retrieve the value.
        The function must take a single argument ``obj`` which is the object
        to be serialized. It can also optionally take a ``context`` argument,
        which is a dictionary of context variables passed to the serializer.
        If no callable is provided then the ```load_only``` flag will be set
        to True.
    :param deserialize: A callable from which to retrieve the value.
        The function must take a single argument ``value`` which is the value
        to be deserialized. It can also optionally take a ``context`` argument,
        which is a dictionary of context variables passed to the deserializer.
        If no callable is provided then ```value``` will be passed through
        unchanged.

    .. versionchanged:: 2.3.0
        Deprecated ``func`` parameter in favor of ``serialize``.

    .. versionchanged:: 3.0.0a1
        Removed ``func`` parameter.
    """

    _CHECK_ATTRIBUTE = False

    def __init__(
        self,
        serialize: (
            None
            | typing.Callable[[typing.Any], typing.Any]
            | typing.Callable[[typing.Any, dict], typing.Any]
        ) = None,
        deserialize: (
            None
            | typing.Callable[[typing.Any], typing.Any]
            | typing.Callable[[typing.Any, dict], typing.Any]
        ) = None,
        **kwargs,
    ):
        # Set dump_only and load_only based on arguments
        kwargs["dump_only"] = bool(serialize) and not bool(deserialize)
        kwargs["load_only"] = bool(deserialize) and not bool(serialize)
        super().__init__(**kwargs)
        self.serialize_func = serialize and utils.callable_or_raise(serialize)
        self.deserialize_func = deserialize and utils.callable_or_raise(deserialize)

    def _serialize(self, value, attr, obj, **kwargs):
        return self._call_or_raise(self.serialize_func, obj, attr)

    def _deserialize(self, value, attr, data, **kwargs):
        if self.deserialize_func:
            return self._call_or_raise(self.deserialize_func, value, attr)
        return value

    def _call_or_raise(self, func, value, attr):
        if len(utils.get_func_args(func)) > 1:
            if self.parent.context is None:
                msg = f"No context available for Function field {attr!r}"
                raise ValidationError(msg)
            return func(value, self.parent.context)
        return func(value)


class Constant(Field):
    """A field that (de)serializes to a preset constant.  If you only want the
    constant added for serialization or deserialization, you should use
    ``dump_only=True`` or ``load_only=True`` respectively.

    :param constant: The constant to return for the field attribute.

    .. versionadded:: 2.0.0
    """

    _CHECK_ATTRIBUTE = False

    def __init__(self, constant: typing.Any, **kwargs):
        super().__init__(**kwargs)
        self.constant = constant
        self.load_default = constant
        self.dump_default = constant

    def _serialize(self, value, *args, **kwargs):
        return self.constant

    def _deserialize(self, value, *args, **kwargs):
        return self.constant


class Inferred(Field):
    """A field that infers how to serialize, based on the value type.

    .. warning::

        This class is treated as private API.
        Users should not need to use this class directly.
    """

    def __init__(self):
        super().__init__()
        # We memoize the fields to avoid creating and binding new fields
        # every time on serialization.
        self._field_cache = {}

    def _serialize(self, value, attr, obj, **kwargs):
        field_cls = self.root.TYPE_MAPPING.get(type(value))
        if field_cls is None:
            field = super()
        else:
            field = self._field_cache.get(field_cls)
            if field is None:
                field = field_cls()
                field._bind_to_schema(self.name, self.parent)
                self._field_cache[field_cls] = field
        return field._serialize(value, attr, obj, **kwargs)


# Aliases
URL = Url
Str = String
Bool = Boolean
Int = Integer

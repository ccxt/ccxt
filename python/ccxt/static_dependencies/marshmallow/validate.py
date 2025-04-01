"""Validation classes for various types of data."""

from __future__ import annotations

import re
import typing
from abc import ABC, abstractmethod
from itertools import zip_longest
from operator import attrgetter

from . import types
from .exceptions import ValidationError

_T = typing.TypeVar("_T")


class Validator(ABC):
    """Abstract base class for validators.

    .. note::
        This class does not provide any validation behavior. It is only used to
        add a useful `__repr__` implementation for validators.
    """

    error = None  # type: str | None

    def __repr__(self) -> str:
        args = self._repr_args()
        args = f"{args}, " if args else ""

        return f"<{self.__class__.__name__}({args}error={self.error!r})>"

    def _repr_args(self) -> str:
        """A string representation of the args passed to this validator. Used by
        `__repr__`.
        """
        return ""

    @abstractmethod
    def __call__(self, value: typing.Any) -> typing.Any: ...


class And(Validator):
    """Compose multiple validators and combine their error messages.

    Example: ::

        from . import validate, ValidationError


        def is_even(value):
            if value % 2 != 0:
                raise ValidationError("Not an even value.")


        validator = validate.And(validate.Range(min=0), is_even)
        validator(-1)
        # ValidationError: ['Must be greater than or equal to 0.', 'Not an even value.']

    :param validators: Validators to combine.
    :param error: Error message to use when a validator returns ``False``.
    """

    default_error_message = "Invalid value."

    def __init__(self, *validators: types.Validator, error: str | None = None):
        self.validators = tuple(validators)
        self.error = error or self.default_error_message  # type: str

    def _repr_args(self) -> str:
        return f"validators={self.validators!r}"

    def __call__(self, value: typing.Any) -> typing.Any:
        errors = []
        kwargs = {}
        for validator in self.validators:
            try:
                r = validator(value)
                if not isinstance(validator, Validator) and r is False:
                    raise ValidationError(self.error)
            except ValidationError as err:
                kwargs.update(err.kwargs)
                if isinstance(err.messages, dict):
                    errors.append(err.messages)
                else:
                    # FIXME : Get rid of cast
                    errors.extend(typing.cast(list, err.messages))
        if errors:
            raise ValidationError(errors, **kwargs)
        return value


class URL(Validator):
    """Validate a URL.

    :param relative: Whether to allow relative URLs.
    :param absolute: Whether to allow absolute URLs.
    :param error: Error message to raise in case of a validation error.
        Can be interpolated with `{input}`.
    :param schemes: Valid schemes. By default, ``http``, ``https``,
        ``ftp``, and ``ftps`` are allowed.
    :param require_tld: Whether to reject non-FQDN hostnames.
    """

    class RegexMemoizer:
        def __init__(self):
            self._memoized = {}

        def _regex_generator(
            self, relative: bool, absolute: bool, require_tld: bool
        ) -> typing.Pattern:
            hostname_variants = [
                # a normal domain name, expressed in [A-Z0-9] chars with hyphens allowed only in the middle
                # note that the regex will be compiled with IGNORECASE, so these are upper and lowercase chars
                (
                    r"(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+"
                    r"(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)"
                ),
                # or the special string 'localhost'
                r"localhost",
                # or IPv4
                r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",
                # or IPv6
                r"\[[A-F0-9]*:[A-F0-9:]+\]",
            ]
            if not require_tld:
                # allow dotless hostnames
                hostname_variants.append(r"(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.?)")

            absolute_part = "".join(
                (
                    # scheme (e.g. 'https://', 'ftp://', etc)
                    # this is validated separately against allowed schemes, so in the regex
                    # we simply want to capture its existence
                    r"(?:[a-z0-9\.\-\+]*)://",
                    # userinfo, for URLs encoding authentication
                    # e.g. 'ftp://foo:bar@ftp.example.org/'
                    r"(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?",
                    # netloc, the hostname/domain part of the URL plus the optional port
                    r"(?:",
                    "|".join(hostname_variants),
                    r")",
                    r"(?::\d+)?",
                )
            )
            relative_part = r"(?:/?|[/?]\S+)\Z"

            if relative:
                if absolute:
                    parts: tuple[str, ...] = (
                        r"^(",
                        absolute_part,
                        r")?",
                        relative_part,
                    )
                else:
                    parts = (r"^", relative_part)
            else:
                parts = (r"^", absolute_part, relative_part)

            return re.compile("".join(parts), re.IGNORECASE)

        def __call__(
            self, relative: bool, absolute: bool, require_tld: bool
        ) -> typing.Pattern:
            key = (relative, absolute, require_tld)
            if key not in self._memoized:
                self._memoized[key] = self._regex_generator(
                    relative, absolute, require_tld
                )

            return self._memoized[key]

    _regex = RegexMemoizer()

    default_message = "Not a valid URL."
    default_schemes = {"http", "https", "ftp", "ftps"}

    def __init__(
        self,
        *,
        relative: bool = False,
        absolute: bool = True,
        schemes: types.StrSequenceOrSet | None = None,
        require_tld: bool = True,
        error: str | None = None,
    ):
        if not relative and not absolute:
            raise ValueError(
                "URL validation cannot set both relative and absolute to False."
            )
        self.relative = relative
        self.absolute = absolute
        self.error = error or self.default_message  # type: str
        self.schemes = schemes or self.default_schemes
        self.require_tld = require_tld

    def _repr_args(self) -> str:
        return f"relative={self.relative!r}, absolute={self.absolute!r}"

    def _format_error(self, value) -> str:
        return self.error.format(input=value)

    def __call__(self, value: str) -> str:
        message = self._format_error(value)
        if not value:
            raise ValidationError(message)

        # Check first if the scheme is valid
        if "://" in value:
            scheme = value.split("://")[0].lower()
            if scheme not in self.schemes:
                raise ValidationError(message)

        regex = self._regex(self.relative, self.absolute, self.require_tld)

        if not regex.search(value):
            raise ValidationError(message)

        return value


class Email(Validator):
    """Validate an email address.

    :param error: Error message to raise in case of a validation error. Can be
        interpolated with `{input}`.
    """

    USER_REGEX = re.compile(
        r"(^[-!#$%&'*+/=?^`{}|~\w]+(\.[-!#$%&'*+/=?^`{}|~\w]+)*\Z"  # dot-atom
        # quoted-string
        r'|^"([\001-\010\013\014\016-\037!#-\[\]-\177]'
        r'|\\[\001-\011\013\014\016-\177])*"\Z)',
        re.IGNORECASE | re.UNICODE,
    )

    DOMAIN_REGEX = re.compile(
        # domain
        r"(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+"
        r"(?:[A-Z]{2,6}|[A-Z0-9-]{2,})\Z"
        # literal form, ipv4 address (SMTP 4.1.3)
        r"|^\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)"
        r"(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]\Z",
        re.IGNORECASE | re.UNICODE,
    )

    DOMAIN_WHITELIST = ("localhost",)

    default_message = "Not a valid email address."

    def __init__(self, *, error: str | None = None):
        self.error = error or self.default_message  # type: str

    def _format_error(self, value: str) -> str:
        return self.error.format(input=value)

    def __call__(self, value: str) -> str:
        message = self._format_error(value)

        if not value or "@" not in value:
            raise ValidationError(message)

        user_part, domain_part = value.rsplit("@", 1)

        if not self.USER_REGEX.match(user_part):
            raise ValidationError(message)

        if domain_part not in self.DOMAIN_WHITELIST:
            if not self.DOMAIN_REGEX.match(domain_part):
                try:
                    domain_part = domain_part.encode("idna").decode("ascii")
                except UnicodeError:
                    pass
                else:
                    if self.DOMAIN_REGEX.match(domain_part):
                        return value
                raise ValidationError(message)

        return value


class Range(Validator):
    """Validator which succeeds if the value passed to it is within the specified
    range. If ``min`` is not specified, or is specified as `None`,
    no lower bound exists. If ``max`` is not specified, or is specified as `None`,
    no upper bound exists. The inclusivity of the bounds (if they exist) is configurable.
    If ``min_inclusive`` is not specified, or is specified as `True`, then
    the ``min`` bound is included in the range. If ``max_inclusive`` is not specified,
    or is specified as `True`, then the ``max`` bound is included in the range.

    :param min: The minimum value (lower bound). If not provided, minimum
        value will not be checked.
    :param max: The maximum value (upper bound). If not provided, maximum
        value will not be checked.
    :param min_inclusive: Whether the `min` bound is included in the range.
    :param max_inclusive: Whether the `max` bound is included in the range.
    :param error: Error message to raise in case of a validation error.
        Can be interpolated with `{input}`, `{min}` and `{max}`.
    """

    message_min = "Must be {min_op} {{min}}."
    message_max = "Must be {max_op} {{max}}."
    message_all = "Must be {min_op} {{min}} and {max_op} {{max}}."

    message_gte = "greater than or equal to"
    message_gt = "greater than"
    message_lte = "less than or equal to"
    message_lt = "less than"

    def __init__(
        self,
        min=None,
        max=None,
        *,
        min_inclusive: bool = True,
        max_inclusive: bool = True,
        error: str | None = None,
    ):
        self.min = min
        self.max = max
        self.error = error
        self.min_inclusive = min_inclusive
        self.max_inclusive = max_inclusive

        # interpolate messages based on bound inclusivity
        self.message_min = self.message_min.format(
            min_op=self.message_gte if self.min_inclusive else self.message_gt
        )
        self.message_max = self.message_max.format(
            max_op=self.message_lte if self.max_inclusive else self.message_lt
        )
        self.message_all = self.message_all.format(
            min_op=self.message_gte if self.min_inclusive else self.message_gt,
            max_op=self.message_lte if self.max_inclusive else self.message_lt,
        )

    def _repr_args(self) -> str:
        return f"min={self.min!r}, max={self.max!r}, min_inclusive={self.min_inclusive!r}, max_inclusive={self.max_inclusive!r}"

    def _format_error(self, value: _T, message: str) -> str:
        return (self.error or message).format(input=value, min=self.min, max=self.max)

    def __call__(self, value: _T) -> _T:
        if self.min is not None and (
            value < self.min if self.min_inclusive else value <= self.min
        ):
            message = self.message_min if self.max is None else self.message_all
            raise ValidationError(self._format_error(value, message))

        if self.max is not None and (
            value > self.max if self.max_inclusive else value >= self.max
        ):
            message = self.message_max if self.min is None else self.message_all
            raise ValidationError(self._format_error(value, message))

        return value


class Length(Validator):
    """Validator which succeeds if the value passed to it has a
    length between a minimum and maximum. Uses len(), so it
    can work for strings, lists, or anything with length.

    :param min: The minimum length. If not provided, minimum length
        will not be checked.
    :param max: The maximum length. If not provided, maximum length
        will not be checked.
    :param equal: The exact length. If provided, maximum and minimum
        length will not be checked.
    :param error: Error message to raise in case of a validation error.
        Can be interpolated with `{input}`, `{min}` and `{max}`.
    """

    message_min = "Shorter than minimum length {min}."
    message_max = "Longer than maximum length {max}."
    message_all = "Length must be between {min} and {max}."
    message_equal = "Length must be {equal}."

    def __init__(
        self,
        min: int | None = None,
        max: int | None = None,
        *,
        equal: int | None = None,
        error: str | None = None,
    ):
        if equal is not None and any([min, max]):
            raise ValueError(
                "The `equal` parameter was provided, maximum or "
                "minimum parameter must not be provided."
            )

        self.min = min
        self.max = max
        self.error = error
        self.equal = equal

    def _repr_args(self) -> str:
        return f"min={self.min!r}, max={self.max!r}, equal={self.equal!r}"

    def _format_error(self, value: typing.Sized, message: str) -> str:
        return (self.error or message).format(
            input=value, min=self.min, max=self.max, equal=self.equal
        )

    def __call__(self, value: typing.Sized) -> typing.Sized:
        length = len(value)

        if self.equal is not None:
            if length != self.equal:
                raise ValidationError(self._format_error(value, self.message_equal))
            return value

        if self.min is not None and length < self.min:
            message = self.message_min if self.max is None else self.message_all
            raise ValidationError(self._format_error(value, message))

        if self.max is not None and length > self.max:
            message = self.message_max if self.min is None else self.message_all
            raise ValidationError(self._format_error(value, message))

        return value


class Equal(Validator):
    """Validator which succeeds if the ``value`` passed to it is
    equal to ``comparable``.

    :param comparable: The object to compare to.
    :param error: Error message to raise in case of a validation error.
        Can be interpolated with `{input}` and `{other}`.
    """

    default_message = "Must be equal to {other}."

    def __init__(self, comparable, *, error: str | None = None):
        self.comparable = comparable
        self.error = error or self.default_message  # type: str

    def _repr_args(self) -> str:
        return f"comparable={self.comparable!r}"

    def _format_error(self, value: _T) -> str:
        return self.error.format(input=value, other=self.comparable)

    def __call__(self, value: _T) -> _T:
        if value != self.comparable:
            raise ValidationError(self._format_error(value))
        return value


class Regexp(Validator):
    """Validator which succeeds if the ``value`` matches ``regex``.

    .. note::

        Uses `re.match`, which searches for a match at the beginning of a string.

    :param regex: The regular expression string to use. Can also be a compiled
        regular expression pattern.
    :param flags: The regexp flags to use, for example re.IGNORECASE. Ignored
        if ``regex`` is not a string.
    :param error: Error message to raise in case of a validation error.
        Can be interpolated with `{input}` and `{regex}`.
    """

    default_message = "String does not match expected pattern."

    def __init__(
        self,
        regex: str | bytes | typing.Pattern,
        flags: int = 0,
        *,
        error: str | None = None,
    ):
        self.regex = (
            re.compile(regex, flags) if isinstance(regex, (str, bytes)) else regex
        )
        self.error = error or self.default_message  # type: str

    def _repr_args(self) -> str:
        return f"regex={self.regex!r}"

    def _format_error(self, value: str | bytes) -> str:
        return self.error.format(input=value, regex=self.regex.pattern)

    @typing.overload
    def __call__(self, value: str) -> str: ...

    @typing.overload
    def __call__(self, value: bytes) -> bytes: ...

    def __call__(self, value):
        if self.regex.match(value) is None:
            raise ValidationError(self._format_error(value))

        return value


class Predicate(Validator):
    """Call the specified ``method`` of the ``value`` object. The
    validator succeeds if the invoked method returns an object that
    evaluates to True in a Boolean context. Any additional keyword
    argument will be passed to the method.

    :param method: The name of the method to invoke.
    :param error: Error message to raise in case of a validation error.
        Can be interpolated with `{input}` and `{method}`.
    :param kwargs: Additional keyword arguments to pass to the method.
    """

    default_message = "Invalid input."

    def __init__(self, method: str, *, error: str | None = None, **kwargs):
        self.method = method
        self.error = error or self.default_message  # type: str
        self.kwargs = kwargs

    def _repr_args(self) -> str:
        return f"method={self.method!r}, kwargs={self.kwargs!r}"

    def _format_error(self, value: typing.Any) -> str:
        return self.error.format(input=value, method=self.method)

    def __call__(self, value: typing.Any) -> typing.Any:
        method = getattr(value, self.method)

        if not method(**self.kwargs):
            raise ValidationError(self._format_error(value))

        return value


class NoneOf(Validator):
    """Validator which fails if ``value`` is a member of ``iterable``.

    :param iterable: A sequence of invalid values.
    :param error: Error message to raise in case of a validation error. Can be
        interpolated using `{input}` and `{values}`.
    """

    default_message = "Invalid input."

    def __init__(self, iterable: typing.Iterable, *, error: str | None = None):
        self.iterable = iterable
        self.values_text = ", ".join(str(each) for each in self.iterable)
        self.error = error or self.default_message  # type: str

    def _repr_args(self) -> str:
        return f"iterable={self.iterable!r}"

    def _format_error(self, value) -> str:
        return self.error.format(input=value, values=self.values_text)

    def __call__(self, value: typing.Any) -> typing.Any:
        try:
            if value in self.iterable:
                raise ValidationError(self._format_error(value))
        except TypeError:
            pass

        return value


class OneOf(Validator):
    """Validator which succeeds if ``value`` is a member of ``choices``.

    :param choices: A sequence of valid values.
    :param labels: Optional sequence of labels to pair with the choices.
    :param error: Error message to raise in case of a validation error. Can be
        interpolated with `{input}`, `{choices}` and `{labels}`.
    """

    default_message = "Must be one of: {choices}."

    def __init__(
        self,
        choices: typing.Iterable,
        labels: typing.Iterable[str] | None = None,
        *,
        error: str | None = None,
    ):
        self.choices = choices
        self.choices_text = ", ".join(str(choice) for choice in self.choices)
        self.labels = labels if labels is not None else []
        self.labels_text = ", ".join(str(label) for label in self.labels)
        self.error = error or self.default_message  # type: str

    def _repr_args(self) -> str:
        return f"choices={self.choices!r}, labels={self.labels!r}"

    def _format_error(self, value) -> str:
        return self.error.format(
            input=value, choices=self.choices_text, labels=self.labels_text
        )

    def __call__(self, value: typing.Any) -> typing.Any:
        try:
            if value not in self.choices:
                raise ValidationError(self._format_error(value))
        except TypeError as error:
            raise ValidationError(self._format_error(value)) from error

        return value

    def options(
        self,
        valuegetter: str | typing.Callable[[typing.Any], typing.Any] = str,
    ) -> typing.Iterable[tuple[typing.Any, str]]:
        """Return a generator over the (value, label) pairs, where value
        is a string associated with each choice. This convenience method
        is useful to populate, for instance, a form select field.

        :param valuegetter: Can be a callable or a string. In the former case, it must
            be a one-argument callable which returns the value of a
            choice. In the latter case, the string specifies the name
            of an attribute of the choice objects. Defaults to `str()`
            or `str()`.
        """
        valuegetter = valuegetter if callable(valuegetter) else attrgetter(valuegetter)
        pairs = zip_longest(self.choices, self.labels, fillvalue="")

        return ((valuegetter(choice), label) for choice, label in pairs)


class ContainsOnly(OneOf):
    """Validator which succeeds if ``value`` is a sequence and each element
    in the sequence is also in the sequence passed as ``choices``. Empty input
    is considered valid.

    :param iterable choices: Same as :class:`OneOf`.
    :param iterable labels: Same as :class:`OneOf`.
    :param str error: Same as :class:`OneOf`.

    .. versionchanged:: 3.0.0b2
        Duplicate values are considered valid.
    .. versionchanged:: 3.0.0b2
        Empty input is considered valid. Use `validate.Length(min=1) <marshmallow.validate.Length>`
        to validate against empty inputs.
    """

    default_message = "One or more of the choices you made was not in: {choices}."

    def _format_error(self, value) -> str:
        value_text = ", ".join(str(val) for val in value)
        return super()._format_error(value_text)

    def __call__(self, value: typing.Sequence[_T]) -> typing.Sequence[_T]:
        # We can't use set.issubset because does not handle unhashable types
        for val in value:
            if val not in self.choices:
                raise ValidationError(self._format_error(value))
        return value


class ContainsNoneOf(NoneOf):
    """Validator which fails if ``value`` is a sequence and any element
    in the sequence is a member of the sequence passed as ``iterable``. Empty input
    is considered valid.

    :param iterable iterable: Same as :class:`NoneOf`.
    :param str error: Same as :class:`NoneOf`.

    .. versionadded:: 3.6.0
    """

    default_message = "One or more of the choices you made was in: {values}."

    def _format_error(self, value) -> str:
        value_text = ", ".join(str(val) for val in value)
        return super()._format_error(value_text)

    def __call__(self, value: typing.Sequence[_T]) -> typing.Sequence[_T]:
        for val in value:
            if val in self.iterable:
                raise ValidationError(self._format_error(value))
        return value

import dataclasses
import random
from abc import ABC, abstractmethod
from dataclasses import field
from typing import Any, Callable, Dict, Generic, List, Optional, Type, TypeVar

import marshmallow.fields as mfields
import marshmallow.utils

from starkware.python.utils import get_random_bytes, initialize_random
from starkware.starkware_utils.error_handling import ErrorCode, stark_assert
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    BytesAsHex,
    FieldMetadata,
    IntAsHex,
    IntAsStr,
)

T = TypeVar("T")



# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore
class Field(ABC, Generic[T]):
    """
    A class representing data types for fields in ValidatedMarshmallowDataclass.
    A dataclass field using this should have the following in its metadata:
    1.  Data needed for @dataclasses.dataclass fields: 'description', 'default',
        'default_factory', etc. ,
    2.  Data needed for marshmallow: in 'marshmallow_field',
    3.  An object implementing this Field class: in 'validated_field',
    """

    # Randomization.

    @abstractmethod
    def get_random_value(self, random_object: Optional[random.Random] = None) -> T:
        """
        Returns a random valid value for this field.
        """

    # Serialization.

    @abstractmethod
    def get_marshmallow_type(self) -> Type[mfields.Field]:
        """
        Returns the marshmallow field type related to this field.
        """

    def get_marshmallow_field(self, required: bool = True, **kwargs) -> mfields.Field:
        """
        Returns a marshmallow field that serializes and deserializes values of this field.
        """
        return self.get_marshmallow_type()(required=required, **kwargs)

    # Deserialization.

    def load_value(self, value: str) -> T:
        """
        Loads a field instance from the given string.
        """
        marshmallow_field = self.get_marshmallow_field(
            required=True, load_default=marshmallow.utils.missing
        )
        return marshmallow_field.deserialize(value=value)

    # Metadata.

    def metadata(
        self,
        required: bool = True,
        load_default: Any = marshmallow.utils.missing,
        nested_metadata: Optional[FieldMetadata] = None,
    ) -> FieldMetadata:
        """
        Creates the metadata associated with this field. If provided, uses the given validated_field
        in the metadata, and otherwise uses `self`.
        """
        nested_metadata = {} if nested_metadata is None else nested_metadata
        return dict(
            marshmallow_field=self.get_marshmallow_field(
                required=required, load_default=load_default
            ),
            metadata=dict(validated_field=self) | nested_metadata,
        )


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class BooleanField(Field[bool]):
    """
    A class that represents a boolean field.
    """

    def get_marshmallow_type(self) -> Type[mfields.Field]:
        return mfields.Boolean

    def get_random_value(self, random_object: Optional[random.Random] = None) -> bool:
        r = initialize_random(random_object=random_object)
        return bool(r.getrandbits(1))


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore
class ValidatedField(Field[T]):
    """
    A class representing data types for validated fields in ValidatedDataclass.
    This class adds on top of Field[T]
    - an error-code in 'error_code', to be used when the field validation fails.
    - a name for messages: in 'name'.
    """

    name: str
    error_code: ErrorCode

    # Validation.
    @abstractmethod
    def error_message(self, value: T) -> str:
        """
        The default error message that appears when the value is invalid.
        """

    @abstractmethod
    def is_valid(self, value: T) -> bool:
        """
        Checks and returns if the given value is valid.
        """

    def validate(self, value: T):
        """
        Raises an exception if the value is not valid.
        """
        stark_assert(
            expr=self.is_valid(value=value),
            code=self.error_code,
            message=self.error_message(value=value),
        )

    @abstractmethod
    def get_invalid_values(self) -> List[T]:
        """
        Returns a list of invalid values for this field.
        """

    # Serialization.

    def get_validated_marshmallow_field(self, required: bool = True, **kwargs) -> mfields.Field:
        """
        Returns a marshmallow field that contains the validation of this field.
        """
        assert "validate" not in kwargs
        return self.get_marshmallow_field(required=required, validate=self.validate, **kwargs)

    # Metadata.

    def metadata(
        self,
        required: bool = True,
        load_default: Any = marshmallow.utils.missing,
        nested_metadata: Optional[FieldMetadata] = None,
        field_name: Optional[str] = None,
    ) -> FieldMetadata:
        """
        Creates the metadata associated with this field. If provided, uses the given field_name for
        messages, and otherwise (if it is None), uses the default name.
        """
        nested_metadata = {} if nested_metadata is None else nested_metadata
        if field_name is not None:
            nested_metadata |= dict(validated_field=dataclasses.replace(self, name=field_name))

        return super().metadata(
            required=required,
            load_default=load_default,
            nested_metadata=nested_metadata,
        )


class OptionalField(ValidatedField[Optional[T]]):
    """
    A wrapper class for a field, allowing it to be None.
    Loading a class with an optional field, where the serialized data for that class doesn't contain
    a value for this field, will load the class with a None value in this field.
    """

    def __init__(self, field: ValidatedField[T], none_probability: float):
        """
        Wraps the given field as an optional field. The probability to get None in
        get_random_value is going to be none_probability. Otherwise, it returns a random value from
        the wrapped field.
        """
        super().__init__(name=field.name, error_code=field.error_code)
        self.field = field
        self.none_probability = max(0, min(1, none_probability))

    def error_message(self, value: Optional[T]) -> str:
        if value is None:
            return "None"
        return f"Invalid OptionalField: {self.field.error_message(value=value)}"

    # Randomization.
    def get_random_value(self, random_object: Optional[random.Random] = None) -> Optional[T]:
        r = initialize_random(random_object=random_object)
        if r.random() < self.none_probability:
            return None
        return self.field.get_random_value(random_object=r)

    # Validation.
    def is_valid(self, value: Optional[T]) -> bool:
        return value is None or self.field.is_valid(value=value)

    def get_invalid_values(self) -> List[Optional[T]]:
        return [value for value in self.field.get_invalid_values() if value is not None]

    # Metadata.

    def metadata(
        self,
        required: bool = False,
        load_default: Any = None,
        nested_metadata: Optional[FieldMetadata] = None,
        field_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Creates the metadata associated with this optional field.
        """
        assert not required, "Optional field must not be required."
        assert load_default is None, "Optional field must have default value None."
        return super().metadata(
            field_name=field_name,
            required=required,
            load_default=load_default,
            nested_metadata=nested_metadata,
        )

    def get_marshmallow_type(self) -> Type[mfields.Field]:
        return self.field.get_marshmallow_type()

    def get_marshmallow_field(
        self, required: bool = False, load_default: Any = None, **kwargs
    ) -> mfields.Field:
        assert not required, "Optional field must not be required."
        assert load_default is None, "Optional field must have default value None."
        # ValidatedField is created with allow_none=True if load_default is None.
        return self.field.get_marshmallow_field(
            required=required, load_default=load_default, **kwargs
        )

    def get_validated_marshmallow_field(self, required: bool = False, **kwargs) -> mfields.Field:
        return super().get_validated_marshmallow_field(required=required, **kwargs)


# Mypy has a problem with dataclasses that contain unimplemented abstract methods.
# See https://github.com/python/mypy/issues/5374 for details on this problem.
@dataclasses.dataclass(frozen=True)  # type: ignore[misc]
class BaseRangeValidatedField(ValidatedField[int]):
    """
    Abstract class that represents a range-validated integer field.
    """

    formatter: Optional[Callable[[int], str]]

    def __post_init__(self):
        assert self.formatter in {hex, str, None}

    def format(self, value: int) -> str:
        if self.formatter is hex:
            return hex(value)
        return str(value)

    def error_message(self, value: int) -> str:
        return f"{self.name} {self.format(value=value)} is out of range"

    def get_marshmallow_type(self) -> Type[mfields.Field]:
        if self.formatter == hex:
            return IntAsHex
        if self.formatter == str:
            return IntAsStr
        if self.formatter is None:
            return mfields.Integer
        raise NotImplementedError(
            f"{self.name}: The given formatter {self.formatter.__name__} "
            "does not have a suitable metadata."
        )

    def get_marshmallow_field(self, required: bool = True, **kwargs) -> mfields.Field:
        if self.formatter is None and "strict" not in kwargs:
            kwargs["strict"] = True
        return super().get_marshmallow_field(required=required, **kwargs)


@dataclasses.dataclass(frozen=True)
class RangeValidatedField(BaseRangeValidatedField):
    """
    Represents a range-validated integer field.
    The valid range of the field is continuous.
    """

    lower_bound: int  # Inclusive.
    upper_bound: int  # Non-inclusive.

    def get_random_value(self, random_object: Optional[random.Random] = None) -> int:
        r = initialize_random(random_object=random_object)
        return r.randrange(start=self.lower_bound, stop=self.upper_bound)

    def is_valid(self, value: int) -> bool:
        return self.lower_bound <= value < self.upper_bound

    def get_invalid_values(self) -> List[int]:
        return [self.lower_bound - 1, self.upper_bound]


@dataclasses.dataclass(frozen=True)
class MultiRangeValidatedField(BaseRangeValidatedField):
    """
    Represents a range-validated integer field.
    The valid range of the field is fragmented.
    """

    valid_ranges: List[RangeValidatedField] = field(default_factory=list)

    def get_random_value(self, random_object: Optional[random.Random] = None) -> int:
        r = initialize_random(random_object=random_object)
        random_range = r.choice(seq=self.valid_ranges)
        return random_range.get_random_value(random_object=random_object)

    def is_valid(self, value: int) -> bool:
        return any(single_range.is_valid(value) for single_range in self.valid_ranges)

    def get_invalid_values(self) -> List[int]:
        multirange_min_values: List[int] = []
        multirange_max_values: List[int] = []
        for single_range in self.valid_ranges:
            multirange_min_values.append(single_range.lower_bound)
            multirange_max_values.append(single_range.upper_bound)
        return [min(multirange_min_values) - 1, max(multirange_max_values) + 1]


@dataclasses.dataclass(frozen=True)
class BytesLengthField(ValidatedField[bytes]):
    """
    Represents a field with value of type bytes, of a given length.
    """

    length: int

    def __post_init__(self):
        assert self.length > 0, "Bytes length must be at least 1."

    def format(self, value: bytes) -> str:
        return value.hex()

    def error_message(self, value: bytes) -> str:
        return (
            f"{self.name} {self.format(value=value)} length is not {self.length} bytes, "
            f"instead it is {len(value)}"
        )

    # Randomization.
    def get_random_value(self, random_object: Optional[random.Random] = None) -> bytes:
        return get_random_bytes(random_object, n=self.length)

    # Validation.
    def is_valid(self, value: bytes) -> bool:
        return len(value) == self.length

    def get_invalid_values(self) -> List[bytes]:
        return [bytes(self.length - 1), bytes(self.length + 1)]

    # Serialization.
    def get_marshmallow_type(self) -> Type[mfields.Field]:
        return BytesAsHex

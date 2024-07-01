import dataclasses
import hashlib
import inspect
import random
from typing import Any, Dict, Mapping, Optional, Sequence, Tuple, Type, TypeVar

import marshmallow
import marshmallow.fields as mfields
import marshmallow_dataclass
import typeguard

from starkware.starkware_utils.error_handling import StarkErrorCode, stark_assert
from starkware.starkware_utils.serializable_dataclass import SerializableMarshmallowDataclass
from starkware.starkware_utils.validated_fields import Field, ValidatedField

TValidatedDataclass = TypeVar("TValidatedDataclass", bound="ValidatedDataclass")
T = TypeVar("T")


def rename_old_field_in_pre_load(
    data: Dict[str, Any], old_field_name: str, new_field_name: str
) -> Dict[str, Any]:
    if old_field_name in data:
        stark_assert(
            new_field_name not in data,
            code=StarkErrorCode.MALFORMED_REQUEST,
            message=(
                f"Error while renaming {old_field_name} to {new_field_name}. "
                "It is unexpected to have both fields in the data."
            ),
        )
        data[new_field_name] = data.pop(old_field_name)
    return data


def get_from_nested_metadata(metadata: Mapping[str, Any], key: str) -> Any:
    """
    Returns the value for the given key in the metadata dict, or in an additional metadata dict
    nested inside.
    """
    for meta in (metadata, metadata.get("metadata", None)):
        if meta is None:
            return None
        if (value := meta.get(key, None)) is not None:
            return value
    return None


class ValidatedDataclass:
    """
    A class containing a type- and value-level validation.
    """

    def __post_init__(self):
        self.validate_dataclass()

    def validate_dataclass(self):
        self.validate_types()
        self.validate_values()

    @classmethod
    def get_random_element(
        cls: Type[TValidatedDataclass], random_object: Optional[random.Random] = None, **data
    ) -> TValidatedDataclass:
        """
        Generates a random object of the given class restricted by the given data.
        Any field can be either passed as an argument (field_name=field_value), and if not,
        it is generated randomly.
        The random generation is done via the validated_field inside the metadata, or if there
        is no such and the field is a ValidatedMarshmallow class, it recursively uses
        get_random_element.

        Example usage:
            @marshmallow_dataclass.dataclass
            class Inner(ValidatedMarshmallowDataclass):
                a: int = field(validated_field=...)
                b: int = field(validated_field=...)

            @marshmallow_dataclass.dataclass
            class Outer(ValidatedMarshmallowDataclass):
                c: int = field(validated_field=...)
                d: int = field(validated_field=...)
                inner: Inner

            Outer.get_random_element(c=5)    # Randomize a, b and d.
        """
        new_object_data = {}
        for field in dataclasses.fields(cls):
            if not field.init:
                continue

            # Fields with a value from the arguments.
            if field.name in data.keys():
                new_object_data[field.name] = data[field.name]
                continue

            # Fields without a value from the arguments.
            validated_field = get_validated_field(field=field)
            if validated_field is not None:
                new_object_data[field.name] = validated_field.get_random_value(
                    random_object=random_object
                )
                continue

            # The field is a validated class object.
            is_validated_dataclass = inspect.isclass(field.type) and issubclass(
                field.type, ValidatedMarshmallowDataclass
            )
            if is_validated_dataclass:
                new_object_data[field.name] = field.type.get_random_element(
                    random_object=random_object
                )
                continue

            # If the field was not supplied but there is a default value, use the default value.
            if has_default_value(attr_value=field):
                new_object_data[field.name] = get_default_value(field=field)
                continue

            raise Exception(
                f"Could not randomize the field {field.name} in an object of type {cls}."
            )

        return cls(**new_object_data)  # type: ignore

    def validate_values(self):
        for field in dataclasses.fields(self):
            # init=False fields are ignored as they are not yet defined.
            if non_init_with_default(field=field):
                continue

            if getattr(field, "metadata", None) is None:
                continue

            value = getattr(self, field.name)
            # First use the field_validated argument, and only if it does not exist,
            # use the validation inside the marshmallow field argument.
            if isinstance(validated_field := get_validated_field(field=field), ValidatedField):
                validated_field.validate(value=value)
            elif (marshmallow_field := field.metadata.get("marshmallow_field")) is not None:
                validate_field(field=marshmallow_field, value=value)

    def validate_types(self):
        for field in dataclasses.fields(self):
            # init=False fields are ignored as they are not yet defined.
            if non_init_with_default(field=field):
                continue

            typeguard.check_type(
                argname=field.name, value=getattr(self, field.name), expected_type=field.type
            )


class ValidatedMarshmallowDataclass(ValidatedDataclass, SerializableMarshmallowDataclass):
    """
    Base class to classes decorated with marshmallow_dataclass.dataclass, containing validations.
    """


class HashableMarshmallowDataclass(ValidatedMarshmallowDataclass):
    """
    Represents a Serializable object that could be hashed.
    """

    def calculate_hash(self) -> bytes:
        """
        Calculates the hash of the object. This value is used in order to distinguish between
        different objects (for example, to avoid duplicating identical objects in the storage).
        """
        return hashlib.sha256(self.serialize()).digest()


def get_validated_field(field: dataclasses.Field) -> Optional[Field]:
    """
    Checks if the dataclass field has a validated_field attribute in its metadata.
    If so returns it, otherwise returns None.
    """
    return get_from_nested_metadata(metadata=field.metadata, key="validated_field")


def late_marshmallow_dataclass(cls: Optional[type] = None, **kwargs):
    """
    A helper function for creating marshmallow dataclasses while inheriting fields from base class.

    Example usage:
        class Base:
            x: T
            y: int = 5

        @marshmallow_dataclass.dataclass
        class Child(Base):
            x: str
            # y: int = 5 will be inherited from parent, due to late_marshmallow_dataclass.

    Note that no parent class of the annotated class should be a dataclass.
    In case that a nondefault attribute follows a default attribute, it is not guaranteed that the
    derived class construction will work as expected.
    """
    if cls is None:  # Arguments passed directly to decorator.

        def inner(cls):
            prepare_class_annotations_and_attribute_values(cls)
            return marshmallow_dataclass.dataclass(cls, **kwargs)

        return inner

    prepare_class_annotations_and_attribute_values(cls)
    return marshmallow_dataclass.dataclass(cls)


def prepare_class_annotations_and_attribute_values(cls):
    """
    Prepares class annotations in the following manner:
    Annotations are added to __annotations__ dictionary in the reverse MRO order. Members with
    default values are added last, in order for them to appear last in the auto-generated __init__
    signature.
    In addition, sets values for attributes in cls.__dict__.
    """
    annotations, attr_values = process_class_annotations_and_attribute_values(cls=cls)
    set_class_annotations_and_attribute_values(
        cls=cls, annotations=annotations, attr_values=attr_values
    )


def process_class_annotations_and_attribute_values(cls) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Returns class attributes annotations and values.
    The annotations and values are taken from the first class the attribute appears in its
    annotations, in the cls' MRO order.
    """
    annotations: Dict[str, Any] = {}
    attr_values: Dict[str, Any] = {}

    for base_cls in inspect.getmro(cls):
        if "__annotations__" not in base_cls.__dict__:
            continue

        for name in base_cls.__annotations__:
            if name in annotations:
                # Attribute already seen in a derived class.
                continue

            if name in base_cls.__dict__:
                attr_values[name] = base_cls.__dict__[name]
                continue

            if (
                "__dataclass_fields__" in base_cls.__dict__
                and name in base_cls.__dict__["__dataclass_fields__"]
            ):
                # cls is a dataclass, in which all fields appear in cls.__dataclass_fields__,
                # rather than directly in cls.__dict__.
                attr_values[name] = base_cls.__dict__["__dataclass_fields__"][name]
                continue

        # Prepand annotations, so that they appear in reverse MRO order.
        annotations = {**base_cls.__annotations__, **annotations}

    return annotations, attr_values


def set_class_annotations_and_attribute_values(
    cls, annotations: Dict[str, Any], attr_values: Dict[str, Any]
):
    """
    Sets given attributes to cls.__dict__ and its annotations.
    The annotations will contain the given annotations, where the attributes with default values
    will appear last.
    """
    # Make sure the attributes appear directly in cls.__dict__ as well.
    default_value_annotations: Dict[str, Any] = {}
    for name, attr_value in attr_values.items():
        setattr(cls, name, attr_value)

        if has_default_value(attr_value=attr_value):
            default_value_annotations[name] = annotations[name]

    # Locate members with default values in the end of the annotations dictionary.
    cls.__annotations__ = {
        name: annotation
        for name, annotation in annotations.items()
        if name not in default_value_annotations
    }
    cls.__annotations__.update(default_value_annotations)


def has_default_value(attr_value: Any) -> bool:
    """
    Returns whether the class member has a default value or not.
    """
    if not isinstance(attr_value, dataclasses.Field):
        """
        Plain default value assignment:
            class A:
                x: int = 1
        """
        return True

    return (
        attr_value.default is not dataclasses.MISSING
        # Mypy has a problem with object members that are callables (it sees access to them as
        # passing self). This is actually originated in dataclasses' annotations in typeshed, since
        # the source code has no annotations.
        # See https://github.com/python/mypy/issues/6910 for details on this problem.
        or attr_value.default_factory is not dataclasses.MISSING  # type: ignore
    )


def non_init_with_default(field: dataclasses.Field) -> bool:
    # A field that that does not appear in the c-tor's signature but does have a default value is
    # initialized with this value in the dataclass' c-tor.
    return not field.init and not has_default_value(attr_value=field)


def get_default_value(field: dataclasses.Field) -> Any:
    """
    Returns the default value for the given field if exists or dataclasses.MISSING otherwise.
    In case of a default_factory function, returns the output of its call.
    """
    if field.default is not dataclasses.MISSING:
        return field.default

    # See https://github.com/python/mypy/issues/6910 for the mypy type-ignore cause.
    if field.default_factory is not dataclasses.MISSING:  # type: ignore
        return field.default_factory()  # type: ignore

    return dataclasses.MISSING


# Validators for private use in this file.


def validate_value(*, field: mfields.Field, value: Any):
    """
    Invokes the field's validator, if exists and it is callable.
    Note: multiple validators are not currently supported as an iterable, but rather as a single
    validation function that and-s between the validators' results.
    """
    if field.validate is not None and callable(field.validate):
        field.validate(value)


def validate_field(field: mfields.Field, value: Any):
    validate_value(field=field, value=value)

    # Validate inner elements, if field is a container.
    if isinstance(field, mfields.List):
        validate_list(field, value)
    elif isinstance(field, mfields.Mapping):
        if field.key_field is not None:
            validate_list(mfields.List(field.key_field), value.keys())
        if field.value_field is not None:
            validate_list(mfields.List(field.value_field), value.values())
    # Validate inner fields recursively, if field is nested (contains fields).
    elif isinstance(field, mfields.Nested):
        # The is_dataclass is done for cases where the field's type is not a dataclass, but has
        # a separate schema.
        if value is not None and dataclasses.is_dataclass(value):
            ValidatedDataclass.validate_values(value)


def validate_list(list_field: mfields.List, list_value: Sequence):
    if not isinstance(list_field.inner, mfields.Field):
        # Nothing to check further, since it is not a marshmallow field.
        return

    if list_value is None:
        if list_field.allow_none:
            return

        raise marshmallow.ValidationError("Field may not be None.")

    for inner_element in list_value:
        validate_field(field=list_field.inner, value=inner_element)

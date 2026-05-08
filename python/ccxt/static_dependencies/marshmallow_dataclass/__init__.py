"""
This library allows the conversion of python 3.7's :mod:`dataclasses`
to :mod:`marshmallow` schemas.

It takes a python class, and generates a marshmallow schema for it.

Simple example::

    from marshmallow import Schema
    from marshmallow_dataclass import dataclass

    @dataclass
    class Point:
      x:float
      y:float

    point = Point(x=0, y=0)
    point_json = Point.Schema().dumps(point)

Full example::

    from marshmallow import Schema
    from dataclasses import field
    from marshmallow_dataclass import dataclass
    import datetime

    @dataclass
    class User:
      birth: datetime.date = field(metadata= {
        "required": True # A parameter to pass to marshmallow's field
      })
      website:str = field(metadata = {
        "marshmallow_field": marshmallow.fields.Url() # Custom marshmallow field
      })
      Schema: ClassVar[Type[Schema]] = Schema # For the type checker
"""

import collections.abc
import dataclasses
import inspect
import sys
import threading
import types
import warnings
from enum import Enum
from functools import lru_cache, partial
from typing import (
    Any,
    Callable,
    Dict,
    FrozenSet,
    Generic,
    List,
    Mapping,
    NewType as typing_NewType,
    Optional,
    Sequence,
    Set,
    Tuple,
    Type,
    TypeVar,
    Union,
    cast,
    get_type_hints,
    overload,
)

from .. import marshmallow
from ..typing_extensions import *
from ..typing_inspect import *

from .lazy_class_attribute import lazy_class_attribute

if sys.version_info >= (3, 9):
    from typing import Annotated
else:
    from ..typing_extensions import Annotated

if sys.version_info >= (3, 11):
    from typing import dataclass_transform
else:
    from ..typing_extensions import dataclass_transform


__all__ = ["dataclass", "add_schema", "class_schema", "field_for_schema", "NewType"]

NoneType = type(None)
_U = TypeVar("_U")

# Whitelist of dataclass members that will be copied to generated schema.
MEMBERS_WHITELIST: Set[str] = {"Meta"}

# Max number of generated schemas that class_schema keeps of generated schemas. Removes duplicates.
MAX_CLASS_SCHEMA_CACHE_SIZE = 1024


def _maybe_get_callers_frame(
    cls: type, stacklevel: int = 1
) -> Optional[types.FrameType]:
    """Return the caller's frame, but only if it will help resolve forward type references.

    We sometimes need the caller's frame to get access to the caller's
    local namespace in order to be able to resolve forward type
    references in dataclasses.

    Notes
    -----

    If the caller's locals are the same as the dataclass' module
    globals — this is the case for the common case of dataclasses
    defined at the module top-level — we don't need the locals.
    (Typing.get_type_hints() knows how to check the class module
    globals on its own.)

    In that case, we don't need the caller's frame.  Not holding a
    reference to the frame in our our lazy ``.Scheme`` class attribute
    is a significant win, memory-wise.

    """
    try:
        frame = inspect.currentframe()
        for _ in range(stacklevel + 1):
            if frame is None:
                return None
            frame = frame.f_back

        if frame is None:
            return None

        globalns = getattr(sys.modules.get(cls.__module__), "__dict__", None)
        if frame.f_locals is globalns:
            # Locals are the globals
            return None

        return frame

    finally:
        # Paranoia, per https://docs.python.org/3/library/inspect.html#the-interpreter-stack
        del frame


@overload
def dataclass(
    _cls: Type[_U],
    *,
    repr: bool = True,
    eq: bool = True,
    order: bool = False,
    unsafe_hash: bool = False,
    frozen: bool = False,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    cls_frame: Optional[types.FrameType] = None,
) -> Type[_U]:
    ...


@overload
def dataclass(
    *,
    repr: bool = True,
    eq: bool = True,
    order: bool = False,
    unsafe_hash: bool = False,
    frozen: bool = False,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    cls_frame: Optional[types.FrameType] = None,
) -> Callable[[Type[_U]], Type[_U]]:
    ...


# _cls should never be specified by keyword, so start it with an
# underscore.  The presence of _cls is used to detect if this
# decorator is being called with parameters or not.
@dataclass_transform(field_specifiers=(dataclasses.Field, dataclasses.field))
def dataclass(
    _cls: Optional[Type[_U]] = None,
    *,
    repr: bool = True,
    eq: bool = True,
    order: bool = False,
    unsafe_hash: bool = False,
    frozen: bool = False,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    cls_frame: Optional[types.FrameType] = None,
    stacklevel: int = 1,
) -> Union[Type[_U], Callable[[Type[_U]], Type[_U]]]:
    """
    This decorator does the same as dataclasses.dataclass, but also applies :func:`add_schema`.
    It adds a `.Schema` attribute to the class object

    :param base_schema: marshmallow schema used as a base class when deriving dataclass schema
    :param cls_frame: frame of cls definition, used to obtain locals with other classes definitions.
        If None is passed the caller frame will be treated as cls_frame

    >>> @dataclass
    ... class Artist:
    ...    name: str
    >>> Artist.Schema
    <class 'marshmallow.schema.Artist'>

    >>> from typing import ClassVar
    >>> from marshmallow import Schema
    >>> @dataclass(order=True) # preserve field order
    ... class Point:
    ...   x:float
    ...   y:float
    ...   Schema: ClassVar[Type[Schema]] = Schema # For the type checker
    ...
    >>> Point.Schema().load({'x':0, 'y':0}) # This line can be statically type checked
    Point(x=0.0, y=0.0)
    """
    dc = dataclasses.dataclass(
        repr=repr, eq=eq, order=order, unsafe_hash=unsafe_hash, frozen=frozen
    )

    def decorator(cls: Type[_U], stacklevel: int = 1) -> Type[_U]:
        return add_schema(
            dc(cls), base_schema, cls_frame=cls_frame, stacklevel=stacklevel + 1
        )

    if _cls is None:
        return decorator
    return decorator(_cls, stacklevel=stacklevel + 1)


@overload
def add_schema(_cls: Type[_U]) -> Type[_U]:
    ...


@overload
def add_schema(
    base_schema: Optional[Type[marshmallow.Schema]] = None,
) -> Callable[[Type[_U]], Type[_U]]:
    ...


@overload
def add_schema(
    _cls: Type[_U],
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    cls_frame: Optional[types.FrameType] = None,
    stacklevel: int = 1,
) -> Type[_U]:
    ...


def add_schema(_cls=None, base_schema=None, cls_frame=None, stacklevel=1):
    """
    This decorator adds a marshmallow schema as the 'Schema' attribute in a dataclass.
    It uses :func:`class_schema` internally.

    :param type _cls: The dataclass to which a Schema should be added
    :param base_schema: marshmallow schema used as a base class when deriving dataclass schema
    :param cls_frame: frame of cls definition

    >>> class BaseSchema(marshmallow.Schema):
    ...   def on_bind_field(self, field_name, field_obj):
    ...     field_obj.data_key = (field_obj.data_key or field_name).upper()

    >>> @add_schema(base_schema=BaseSchema)
    ... @dataclasses.dataclass
    ... class Artist:
    ...    names: Tuple[str, str]
    >>> artist = Artist.Schema().loads('{"NAMES": ["Martin", "Ramirez"]}')
    >>> artist
    Artist(names=('Martin', 'Ramirez'))
    """

    def decorator(clazz: Type[_U], stacklevel: int = stacklevel) -> Type[_U]:
        if cls_frame is not None:
            frame = cls_frame
        else:
            frame = _maybe_get_callers_frame(clazz, stacklevel=stacklevel)

        # noinspection PyTypeHints
        clazz.Schema = lazy_class_attribute(  # type: ignore
            partial(class_schema, clazz, base_schema, frame),
            "Schema",
            clazz.__name__,
        )
        return clazz

    if _cls is None:
        return decorator
    return decorator(_cls, stacklevel=stacklevel + 1)


@overload
def class_schema(
    clazz: type,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    *,
    globalns: Optional[Dict[str, Any]] = None,
    localns: Optional[Dict[str, Any]] = None,
) -> Type[marshmallow.Schema]:
    ...


@overload
def class_schema(
    clazz: type,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    clazz_frame: Optional[types.FrameType] = None,
    *,
    globalns: Optional[Dict[str, Any]] = None,
) -> Type[marshmallow.Schema]:
    ...


def class_schema(
    clazz: type,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    # FIXME: delete clazz_frame from API?
    clazz_frame: Optional[types.FrameType] = None,
    *,
    globalns: Optional[Dict[str, Any]] = None,
    localns: Optional[Dict[str, Any]] = None,
) -> Type[marshmallow.Schema]:
    """
    Convert a class to a marshmallow schema

    :param clazz: A python class (may be a dataclass)
    :param base_schema: marshmallow schema used as a base class when deriving dataclass schema
    :param clazz_frame: frame of cls definition
    :return: A marshmallow Schema corresponding to the dataclass

    .. note::
        All the arguments supported by marshmallow field classes can
        be passed in the `metadata` dictionary of a field.


    If you want to use a custom marshmallow field
    (one that has no equivalent python type), you can pass it as the
    ``marshmallow_field`` key in the metadata dictionary.

    >>> import typing
    >>> Meters = typing.NewType('Meters', float)
    >>> @dataclasses.dataclass()
    ... class Building:
    ...   height: Optional[Meters]
    ...   name: str = dataclasses.field(default="anonymous")
    ...   class Meta:
    ...     ordered = True
    ...
    >>> class_schema(Building) # Returns a marshmallow schema class (not an instance)
    <class 'marshmallow.schema.Building'>
    >>> @dataclasses.dataclass()
    ... class City:
    ...   name: str = dataclasses.field(metadata={'required':True})
    ...   best_building: Building # Reference to another dataclass. A schema will be created for it too.
    ...   other_buildings: List[Building] = dataclasses.field(default_factory=lambda: [])
    ...
    >>> citySchema = class_schema(City)()
    >>> city = citySchema.load({"name":"Paris", "best_building": {"name": "Eiffel Tower"}})
    >>> city
    City(name='Paris', best_building=Building(height=None, name='Eiffel Tower'), other_buildings=[])

    >>> citySchema.load({"name":"Paris"})
    Traceback (most recent call last):
        ...
    marshmallow.exceptions.ValidationError: {'best_building': ['Missing data for required field.']}

    >>> city_json = citySchema.dump(city)
    >>> city_json['best_building'] # We get an OrderedDict because we specified order = True in the Meta class
    OrderedDict([('height', None), ('name', 'Eiffel Tower')])

    >>> @dataclasses.dataclass()
    ... class Person:
    ...   name: str = dataclasses.field(default="Anonymous")
    ...   friends: List['Person'] = dataclasses.field(default_factory=lambda:[]) # Recursive field
    ...
    >>> person = class_schema(Person)().load({
    ...     "friends": [{"name": "Roger Boucher"}]
    ... })
    >>> person
    Person(name='Anonymous', friends=[Person(name='Roger Boucher', friends=[])])

    Marking dataclass fields as non-initialized (``init=False``), by default, will result in those
    fields from being exluded in the schema. To override this behaviour, set the ``Meta`` option
    ``include_non_init=True``.

    >>> @dataclasses.dataclass()
    ... class C:
    ...   important: int = dataclasses.field(init=True, default=0)
    ...    # Only fields that are in the __init__ method will be added:
    ...   unimportant: int = dataclasses.field(init=False, default=0)
    ...
    >>> c = class_schema(C)().load({
    ...     "important": 9, # This field will be imported
    ...     "unimportant": 9 # This field will NOT be imported
    ... }, unknown=marshmallow.EXCLUDE)
    >>> c
    C(important=9, unimportant=0)

    >>> @dataclasses.dataclass()
    ... class C:
    ...   class Meta:
    ...     include_non_init = True
    ...   important: int = dataclasses.field(init=True, default=0)
    ...   unimportant: int = dataclasses.field(init=False, default=0)
    ...
    >>> c = class_schema(C)().load({
    ...     "important": 9, # This field will be imported
    ...     "unimportant": 9 # This field will be imported
    ... }, unknown=marshmallow.EXCLUDE)
    >>> c
    C(important=9, unimportant=9)

    >>> @dataclasses.dataclass
    ... class Website:
    ...  url:str = dataclasses.field(metadata = {
    ...    "marshmallow_field": marshmallow.fields.Url() # Custom marshmallow field
    ...  })
    ...
    >>> class_schema(Website)().load({"url": "I am not a good URL !"})
    Traceback (most recent call last):
        ...
    marshmallow.exceptions.ValidationError: {'url': ['Not a valid URL.']}

    >>> @dataclasses.dataclass
    ... class NeverValid:
    ...     @marshmallow.validates_schema
    ...     def validate(self, data, **_):
    ...         raise marshmallow.ValidationError('never valid')
    ...
    >>> class_schema(NeverValid)().load({})
    Traceback (most recent call last):
        ...
    marshmallow.exceptions.ValidationError: {'_schema': ['never valid']}

    >>> @dataclasses.dataclass
    ... class Anything:
    ...     name: str
    ...     @marshmallow.validates('name')
    ...     def validates(self, value):
    ...         if len(value) > 5: raise marshmallow.ValidationError("Name too long")
    >>> class_schema(Anything)().load({"name": "aaaaaargh"})
    Traceback (most recent call last):
    ...
    marshmallow.exceptions.ValidationError: {'name': ['Name too long']}

    You can use the ``metadata`` argument to override default field behaviour, e.g. the fact that
    ``Optional`` fields allow ``None`` values:

    >>> @dataclasses.dataclass
    ... class Custom:
    ...     name: Optional[str] = dataclasses.field(metadata={"allow_none": False})
    >>> class_schema(Custom)().load({"name": None})
    Traceback (most recent call last):
        ...
    marshmallow.exceptions.ValidationError: {'name': ['Field may not be null.']}
    >>> class_schema(Custom)().load({})
    Custom(name=None)
    """
    if not dataclasses.is_dataclass(clazz):
        clazz = dataclasses.dataclass(clazz)
    if localns is None:
        if clazz_frame is None:
            clazz_frame = _maybe_get_callers_frame(clazz)
        if clazz_frame is not None:
            localns = clazz_frame.f_locals
    with _SchemaContext(globalns, localns):
        return _internal_class_schema(clazz, base_schema)


class _SchemaContext:
    """Global context for an invocation of class_schema."""

    def __init__(
        self,
        globalns: Optional[Dict[str, Any]] = None,
        localns: Optional[Dict[str, Any]] = None,
    ):
        self.seen_classes: Dict[type, str] = {}
        self.globalns = globalns
        self.localns = localns

    def __enter__(self) -> "_SchemaContext":
        _schema_ctx_stack.push(self)
        return self

    def __exit__(
        self,
        _typ: Optional[Type[BaseException]],
        _value: Optional[BaseException],
        _tb: Optional[types.TracebackType],
    ) -> None:
        _schema_ctx_stack.pop()


class _LocalStack(threading.local, Generic[_U]):
    def __init__(self) -> None:
        self.stack: List[_U] = []

    def push(self, value: _U) -> None:
        self.stack.append(value)

    def pop(self) -> None:
        self.stack.pop()

    @property
    def top(self) -> _U:
        return self.stack[-1]


_schema_ctx_stack = _LocalStack[_SchemaContext]()


@lru_cache(maxsize=MAX_CLASS_SCHEMA_CACHE_SIZE)
def _internal_class_schema(
    clazz: type,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
) -> Type[marshmallow.Schema]:
    schema_ctx = _schema_ctx_stack.top

    if typing_extensions.get_origin(clazz) is Annotated and sys.version_info < (3, 10):
        # https://github.com/python/cpython/blob/3.10/Lib/typing.py#L977
        class_name = clazz._name or clazz.__origin__.__name__  # type: ignore[attr-defined]
    else:
        class_name = clazz.__name__

    schema_ctx.seen_classes[clazz] = class_name

    try:
        # noinspection PyDataclass
        fields: Tuple[dataclasses.Field, ...] = dataclasses.fields(clazz)
    except TypeError:  # Not a dataclass
        try:
            warnings.warn(
                "****** WARNING ****** "
                f"marshmallow_dataclass was called on the class {clazz}, which is not a dataclass. "
                "It is going to try and convert the class into a dataclass, which may have "
                "undesirable side effects. To avoid this message, make sure all your classes and "
                "all the classes of their fields are either explicitly supported by "
                "marshmallow_dataclass, or define the schema explicitly using "
                "field(metadata=dict(marshmallow_field=...)). For more information, see "
                "https://github.com/lovasoa/marshmallow_dataclass/issues/51 "
                "****** WARNING ******"
            )
            created_dataclass: type = dataclasses.dataclass(clazz)
            return _internal_class_schema(created_dataclass, base_schema)
        except Exception as exc:
            raise TypeError(
                f"{getattr(clazz, '__name__', repr(clazz))} is not a dataclass and cannot be turned into one."
            ) from exc

    # Copy all marshmallow hooks and whitelisted members of the dataclass to the schema.
    attributes = {
        k: v
        for k, v in inspect.getmembers(clazz)
        if hasattr(v, "__marshmallow_hook__") or k in MEMBERS_WHITELIST
    }

    # Determine whether we should include non-init fields
    include_non_init = getattr(getattr(clazz, "Meta", None), "include_non_init", False)

    # Update the schema members to contain marshmallow fields instead of dataclass fields

    if sys.version_info >= (3, 9):
        type_hints = get_type_hints(
            clazz,
            globalns=schema_ctx.globalns,
            localns=schema_ctx.localns,
            include_extras=True,
        )
    else:
        type_hints = get_type_hints(
            clazz, globalns=schema_ctx.globalns, localns=schema_ctx.localns
        )
    attributes.update(
        (
            field.name,
            _field_for_schema(
                type_hints[field.name],
                _get_field_default(field),
                field.metadata,
                base_schema,
            ),
        )
        for field in fields
        if field.init or include_non_init
    )

    schema_class = type(clazz.__name__, (_base_schema(clazz, base_schema),), attributes)
    return cast(Type[marshmallow.Schema], schema_class)


def _field_by_type(
    typ: Union[type, Any], base_schema: Optional[Type[marshmallow.Schema]]
) -> Optional[Type[marshmallow.fields.Field]]:
    return (
        base_schema and base_schema.TYPE_MAPPING.get(typ)
    ) or marshmallow.Schema.TYPE_MAPPING.get(typ)


def _field_by_supertype(
    typ: Type,
    default: Any,
    newtype_supertype: Type,
    metadata: dict,
    base_schema: Optional[Type[marshmallow.Schema]],
) -> marshmallow.fields.Field:
    """
    Return a new field for fields based on a super field. (Usually spawned from NewType)
    """
    # Add the information coming our custom NewType implementation

    typ_args = getattr(typ, "_marshmallow_args", {})

    # Handle multiple validators from both `typ` and `metadata`.
    # See https://github.com/lovasoa/marshmallow_dataclass/issues/91
    new_validators: List[Callable] = []
    for meta_dict in (typ_args, metadata):
        if "validate" in meta_dict:
            if marshmallow.utils.is_iterable_but_not_string(meta_dict["validate"]):
                new_validators.extend(meta_dict["validate"])
            elif callable(meta_dict["validate"]):
                new_validators.append(meta_dict["validate"])
    metadata["validate"] = new_validators if new_validators else None

    metadata = {**typ_args, **metadata}
    metadata.setdefault("metadata", {}).setdefault("description", typ.__name__)
    field = getattr(typ, "_marshmallow_field", None)
    if field:
        return field(**metadata)
    else:
        return _field_for_schema(
            newtype_supertype,
            metadata=metadata,
            default=default,
            base_schema=base_schema,
        )


def _generic_type_add_any(typ: type) -> type:
    """if typ is generic type without arguments, replace them by Any."""
    if typ is list or typ is List:
        typ = List[Any]
    elif typ is dict or typ is Dict:
        typ = Dict[Any, Any]
    elif typ is Mapping:
        typ = Mapping[Any, Any]
    elif typ is Sequence:
        typ = Sequence[Any]
    elif typ is set or typ is Set:
        typ = Set[Any]
    elif typ is frozenset or typ is FrozenSet:
        typ = FrozenSet[Any]
    return typ


def _field_for_generic_type(
    typ: type,
    base_schema: Optional[Type[marshmallow.Schema]],
    **metadata: Any,
) -> Optional[marshmallow.fields.Field]:
    """
    If the type is a generic interface, resolve the arguments and construct the appropriate Field.
    """
    origin = typing_extensions.get_origin(typ)
    arguments = typing_extensions.get_args(typ)
    if origin:
        # Override base_schema.TYPE_MAPPING to change the class used for generic types below
        type_mapping = base_schema.TYPE_MAPPING if base_schema else {}

        if origin in (list, List):
            child_type = _field_for_schema(arguments[0], base_schema=base_schema)
            list_type = cast(
                Type[marshmallow.fields.List],
                type_mapping.get(List, marshmallow.fields.List),
            )
            return list_type(child_type, **metadata)
        if origin in (collections.abc.Sequence, Sequence) or (
            origin in (tuple, Tuple)
            and len(arguments) == 2
            and arguments[1] is Ellipsis
        ):
            from . import collection_field

            child_type = _field_for_schema(arguments[0], base_schema=base_schema)
            return collection_field.Sequence(cls_or_instance=child_type, **metadata)
        if origin in (set, Set):
            from . import collection_field

            child_type = _field_for_schema(arguments[0], base_schema=base_schema)
            return collection_field.Set(
                cls_or_instance=child_type, frozen=False, **metadata
            )
        if origin in (frozenset, FrozenSet):
            from . import collection_field

            child_type = _field_for_schema(arguments[0], base_schema=base_schema)
            return collection_field.Set(
                cls_or_instance=child_type, frozen=True, **metadata
            )
        if origin in (tuple, Tuple):
            children = tuple(
                _field_for_schema(arg, base_schema=base_schema) for arg in arguments
            )
            tuple_type = cast(
                Type[marshmallow.fields.Tuple],
                type_mapping.get(  # type:ignore[call-overload]
                    Tuple, marshmallow.fields.Tuple
                ),
            )
            return tuple_type(children, **metadata)
        elif origin in (dict, Dict, collections.abc.Mapping, Mapping):
            dict_type = type_mapping.get(Dict, marshmallow.fields.Dict)
            return dict_type(
                keys=_field_for_schema(arguments[0], base_schema=base_schema),
                values=_field_for_schema(arguments[1], base_schema=base_schema),
                **metadata,
            )

    return None


def _field_for_annotated_type(
    typ: type,
    **metadata: Any,
) -> Optional[marshmallow.fields.Field]:
    """
    If the type is an Annotated interface, resolve the arguments and construct the appropriate Field.
    """
    origin = typing_extensions.get_origin(typ)
    arguments = typing_extensions.get_args(typ)
    if origin and origin is Annotated:
        marshmallow_annotations = [
            arg
            for arg in arguments[1:]
            if (inspect.isclass(arg) and issubclass(arg, marshmallow.fields.Field))
            or isinstance(arg, marshmallow.fields.Field)
        ]
        if marshmallow_annotations:
            if len(marshmallow_annotations) > 1:
                warnings.warn(
                    "Multiple marshmallow Field annotations found. Using the last one."
                )

            field = marshmallow_annotations[-1]
            # Got a field instance, return as is. User must know what they're doing
            if isinstance(field, marshmallow.fields.Field):
                return field

            return field(**metadata)
    return None


def _field_for_union_type(
    typ: type,
    base_schema: Optional[Type[marshmallow.Schema]],
    **metadata: Any,
) -> Optional[marshmallow.fields.Field]:
    arguments = typing_extensions.get_args(typ)
    if typing_inspect.is_union_type(typ):
        if typing_inspect.is_optional_type(typ):
            metadata["allow_none"] = metadata.get("allow_none", True)
            metadata["dump_default"] = metadata.get("dump_default", None)
            if not metadata.get("required"):
                metadata["load_default"] = metadata.get("load_default", None)
            metadata.setdefault("required", False)
        subtypes = [t for t in arguments if t is not NoneType]  # type: ignore
        if len(subtypes) == 1:
            return _field_for_schema(
                subtypes[0],
                metadata=metadata,
                base_schema=base_schema,
            )
        from . import union_field

        return union_field.Union(
            [
                (
                    subtyp,
                    _field_for_schema(
                        subtyp,
                        metadata={"required": True},
                        base_schema=base_schema,
                    ),
                )
                for subtyp in subtypes
            ],
            **metadata,
        )
    return None


def field_for_schema(
    typ: type,
    default: Any = marshmallow.missing,
    metadata: Optional[Mapping[str, Any]] = None,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
    # FIXME: delete typ_frame from API?
    typ_frame: Optional[types.FrameType] = None,
) -> marshmallow.fields.Field:
    """
    Get a marshmallow Field corresponding to the given python type.
    The metadata of the dataclass field is used as arguments to the marshmallow Field.

    :param typ: The type for which a field should be generated
    :param default: value to use for (de)serialization when the field is missing
    :param metadata: Additional parameters to pass to the marshmallow field constructor
    :param base_schema: marshmallow schema used as a base class when deriving dataclass schema
    :param typ_frame: frame of type definition

    >>> int_field = field_for_schema(int, default=9, metadata=dict(required=True))
    >>> int_field.__class__
    <class 'marshmallow.fields.Integer'>

    >>> int_field.dump_default
    9

    >>> field_for_schema(str, metadata={"marshmallow_field": marshmallow.fields.Url()}).__class__
    <class 'marshmallow.fields.Url'>
    """
    with _SchemaContext(localns=typ_frame.f_locals if typ_frame is not None else None):
        return _field_for_schema(typ, default, metadata, base_schema)


def _field_for_schema(
    typ: type,
    default: Any = marshmallow.missing,
    metadata: Optional[Mapping[str, Any]] = None,
    base_schema: Optional[Type[marshmallow.Schema]] = None,
) -> marshmallow.fields.Field:
    """
    Get a marshmallow Field corresponding to the given python type.
    The metadata of the dataclass field is used as arguments to the marshmallow Field.

    This is an internal version of field_for_schema. It assumes a _SchemaContext
    has been pushed onto the local stack.

    :param typ: The type for which a field should be generated
    :param default: value to use for (de)serialization when the field is missing
    :param metadata: Additional parameters to pass to the marshmallow field constructor
    :param base_schema: marshmallow schema used as a base class when deriving dataclass schema

    """

    metadata = {} if metadata is None else dict(metadata)

    if default is not marshmallow.missing:
        metadata.setdefault("dump_default", default)
        # 'missing' must not be set for required fields.
        if not metadata.get("required"):
            metadata.setdefault("load_default", default)
    else:
        metadata.setdefault("required", not typing_inspect.is_optional_type(typ))

    # If the field was already defined by the user
    predefined_field = metadata.get("marshmallow_field")
    if predefined_field:
        return predefined_field

    # Generic types specified without type arguments
    typ = _generic_type_add_any(typ)

    # Base types
    field = _field_by_type(typ, base_schema)
    if field:
        return field(**metadata)

    if typ is Any:
        metadata.setdefault("allow_none", True)
        return marshmallow.fields.Raw(**metadata)

    # i.e.: Literal['abc']
    if typing_inspect.is_literal_type(typ):
        arguments = typing_inspect.get_args(typ)
        return marshmallow.fields.Raw(
            validate=(
                marshmallow.validate.Equal(arguments[0])
                if len(arguments) == 1
                else marshmallow.validate.OneOf(arguments)
            ),
            **metadata,
        )

    # i.e.: Final[str] = 'abc'
    if typing_inspect.is_final_type(typ):
        arguments = typing_inspect.get_args(typ)
        if arguments:
            subtyp = arguments[0]
        elif default is not marshmallow.missing:
            if callable(default):
                subtyp = Any
                warnings.warn(
                    "****** WARNING ****** "
                    "marshmallow_dataclass was called on a dataclass with an "
                    'attribute that is type-annotated with "Final" and uses '
                    "dataclasses.field for specifying a default value using a "
                    "factory. The Marshmallow field type cannot be inferred from the "
                    "factory and will fall back to a raw field which is equivalent to "
                    'the type annotation "Any" and will result in no validation. '
                    "Provide a type to Final[...] to ensure accurate validation. "
                    "****** WARNING ******"
                )
            else:
                subtyp = type(default)
                warnings.warn(
                    "****** WARNING ****** "
                    "marshmallow_dataclass was called on a dataclass with an "
                    'attribute that is type-annotated with "Final" with a default '
                    "value from which the Marshmallow field type is inferred. "
                    "Support for type inference from a default value is limited and "
                    "may result in inaccurate validation. Provide a type to "
                    "Final[...] to ensure accurate validation. "
                    "****** WARNING ******"
                )
        else:
            subtyp = Any
        return _field_for_schema(subtyp, default, metadata, base_schema)

    annotated_field = _field_for_annotated_type(typ, **metadata)
    if annotated_field:
        return annotated_field

    union_field = _field_for_union_type(typ, base_schema, **metadata)
    if union_field:
        return union_field

    # Generic types
    generic_field = _field_for_generic_type(typ, base_schema, **metadata)
    if generic_field:
        return generic_field

    # typing.NewType returns a function (in python <= 3.9) or a class (python >= 3.10) with a
    # __supertype__ attribute
    newtype_supertype = getattr(typ, "__supertype__", None)
    if typing_inspect.is_new_type(typ) and newtype_supertype is not None:
        return _field_by_supertype(
            typ=typ,
            default=default,
            newtype_supertype=newtype_supertype,
            metadata=metadata,
            base_schema=base_schema,
        )

    # enumerations
    if inspect.isclass(typ) and issubclass(typ, Enum):
        return marshmallow.fields.Enum(typ, **metadata)

    # Nested marshmallow dataclass
    # it would be just a class name instead of actual schema util the schema is not ready yet
    nested_schema = getattr(typ, "Schema", None)

    # Nested dataclasses
    forward_reference = getattr(typ, "__forward_arg__", None)

    nested = (
        nested_schema
        or forward_reference
        or _schema_ctx_stack.top.seen_classes.get(typ)
        or _internal_class_schema(typ, base_schema)  # type: ignore[arg-type] # FIXME
    )

    return marshmallow.fields.Nested(nested, **metadata)


def _base_schema(
    clazz: type, base_schema: Optional[Type[marshmallow.Schema]] = None
) -> Type[marshmallow.Schema]:
    """
    Base schema factory that creates a schema for `clazz` derived either from `base_schema`
    or `BaseSchema`
    """

    # Remove `type: ignore` when mypy handles dynamic base classes
    # https://github.com/python/mypy/issues/2813
    class BaseSchema(base_schema or marshmallow.Schema):  # type: ignore
        def load(self, data: Mapping, *, many: Optional[bool] = None, **kwargs):
            all_loaded = super().load(data, many=many, **kwargs)
            many = self.many if many is None else bool(many)
            if many:
                return [clazz(**loaded) for loaded in all_loaded]
            else:
                return clazz(**all_loaded)

    return BaseSchema


def _get_field_default(field: dataclasses.Field):
    """
    Return a marshmallow default value given a dataclass default value

    >>> _get_field_default(dataclasses.field())
    <marshmallow.missing>
    """
    # Remove `type: ignore` when https://github.com/python/mypy/issues/6910 is fixed
    default_factory = field.default_factory  # type: ignore
    if default_factory is not dataclasses.MISSING:
        return default_factory
    elif field.default is dataclasses.MISSING:
        return marshmallow.missing
    return field.default


def NewType(
    name: str,
    typ: Type[_U],
    field: Optional[Type[marshmallow.fields.Field]] = None,
    **kwargs,
) -> Callable[[_U], _U]:
    """DEPRECATED: Use typing.Annotated instead.
    NewType creates simple unique types
    to which you can attach custom marshmallow attributes.
    All the keyword arguments passed to this function will be transmitted
    to the marshmallow field constructor.

    >>> import marshmallow.validate
    >>> IPv4 = NewType('IPv4', str, validate=marshmallow.validate.Regexp(r'^([0-9]{1,3}\\.){3}[0-9]{1,3}$'))
    >>> @dataclass
    ... class MyIps:
    ...   ips: List[IPv4]
    >>> MyIps.Schema().load({"ips": ["0.0.0.0", "grumble grumble"]})
    Traceback (most recent call last):
    ...
    marshmallow.exceptions.ValidationError: {'ips': {1: ['String does not match expected pattern.']}}
    >>> MyIps.Schema().load({"ips": ["127.0.0.1"]})
    MyIps(ips=['127.0.0.1'])

    >>> Email = NewType('Email', str, field=marshmallow.fields.Email)
    >>> @dataclass
    ... class ContactInfo:
    ...   mail: Email = dataclasses.field(default="anonymous@example.org")
    >>> ContactInfo.Schema().load({})
    ContactInfo(mail='anonymous@example.org')
    >>> ContactInfo.Schema().load({"mail": "grumble grumble"})
    Traceback (most recent call last):
    ...
    marshmallow.exceptions.ValidationError: {'mail': ['Not a valid email address.']}
    """

    # noinspection PyTypeHints
    new_type = typing_NewType(name, typ)  # type: ignore
    # noinspection PyTypeHints
    new_type._marshmallow_field = field  # type: ignore
    # noinspection PyTypeHints
    new_type._marshmallow_args = kwargs  # type: ignore
    return new_type


if __name__ == "__main__":
    import doctest

    doctest.testmod(verbose=True)

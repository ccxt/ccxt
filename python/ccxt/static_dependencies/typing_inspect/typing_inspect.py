"""Defines experimental API for runtime inspection of types defined
in the standard "typing" module.

Example usage::
    from typing_inspect import is_generic_type
"""

# NOTE: This module must support Python 2.7 in addition to Python 3.x

import sys
import types
import typing
import typing_extensions

from mypy_extensions import _TypedDictMeta as _TypedDictMeta_Mypy

# See comments in typing_extensions source on why the switch is at 3.9.2
if (3, 4, 0) <= sys.version_info[:3] < (3, 9, 2):
    from typing_extensions import _TypedDictMeta as _TypedDictMeta_TE
elif sys.version_info[:3] >= (3, 9, 2):
    # Situation with typing_extensions.TypedDict is complicated.
    # Use the one defined in typing_extentions, and if there is none,
    # fall back to typing.
    try:
        from typing_extensions import _TypedDictMeta as _TypedDictMeta_TE
    except ImportError:
        from typing import _TypedDictMeta as _TypedDictMeta_TE
else:
    # typing_extensions.TypedDict is a re-export from typing.
    from typing import TypedDict
    _TypedDictMeta_TE = type(TypedDict)

NEW_TYPING = sys.version_info[:3] >= (3, 7, 0)  # PEP 560
if NEW_TYPING:
    import collections.abc

WITH_FINAL = True
WITH_LITERAL = True
WITH_CLASSVAR = True
WITH_NEWTYPE = True
LEGACY_TYPING = False

if NEW_TYPING:
    from typing import (
        Generic, Callable, Union, TypeVar, ClassVar, Tuple, _GenericAlias,
        ForwardRef, NewType,
    )
    from typing_extensions import Final, Literal
    if sys.version_info[:3] >= (3, 9, 0):
        from typing import _SpecialGenericAlias
        typingGenericAlias = (_GenericAlias, _SpecialGenericAlias, types.GenericAlias)
    else:
        typingGenericAlias = (_GenericAlias,)
else:
    from typing import (
        Callable, CallableMeta, Union, Tuple, TupleMeta, TypeVar, GenericMeta,
        _ForwardRef,
    )
    try:
        from typing import _Union, _ClassVar
    except ImportError:
        # support for very old typing module <=3.5.3
        _Union = type(Union)
        WITH_CLASSVAR = False
        LEGACY_TYPING = True

    try:  # python 3.6
        from typing_extensions import _Final
    except ImportError:  # python 2.7
        try:
            from typing import _Final
        except ImportError:
            WITH_FINAL = False

    try:  # python 3.6
        from typing_extensions import Literal
    except ImportError:  # python 2.7
        try:
            from typing import Literal
        except ImportError:
            WITH_LITERAL = False

    try:  # python < 3.5.2
        from typing_extensions import NewType
    except ImportError:
        try:
            from typing import NewType
        except ImportError:
            WITH_NEWTYPE = False


def _gorg(cls):
    """This function exists for compatibility with old typing versions."""
    assert isinstance(cls, GenericMeta)
    if hasattr(cls, '_gorg'):
        return cls._gorg
    while cls.__origin__ is not None:
        cls = cls.__origin__
    return cls


def is_generic_type(tp):
    """Test if the given type is a generic type. This includes Generic itself, but
    excludes special typing constructs such as Union, Tuple, Callable, ClassVar.
    Examples::

        is_generic_type(int) == False
        is_generic_type(Union[int, str]) == False
        is_generic_type(Union[int, T]) == False
        is_generic_type(ClassVar[List[int]]) == False
        is_generic_type(Callable[..., T]) == False

        is_generic_type(Generic) == True
        is_generic_type(Generic[T]) == True
        is_generic_type(Iterable[int]) == True
        is_generic_type(Mapping) == True
        is_generic_type(MutableMapping[T, List[int]]) == True
        is_generic_type(Sequence[Union[str, bytes]]) == True
    """
    if NEW_TYPING:
        return (isinstance(tp, type) and issubclass(tp, Generic) or
                isinstance(tp, typingGenericAlias) and
                tp.__origin__ not in (Union, tuple, ClassVar, collections.abc.Callable))
    return (isinstance(tp, GenericMeta) and not
            isinstance(tp, (CallableMeta, TupleMeta)))


def is_callable_type(tp):
    """Test if the type is a generic callable type, including subclasses
    excluding non-generic types and callables.
    Examples::

        is_callable_type(int) == False
        is_callable_type(type) == False
        is_callable_type(Callable) == True
        is_callable_type(Callable[..., int]) == True
        is_callable_type(Callable[[int, int], Iterable[str]]) == True
        class MyClass(Callable[[int], int]):
            ...
        is_callable_type(MyClass) == True

    For more general tests use callable(), for more precise test
    (excluding subclasses) use::

        get_origin(tp) is collections.abc.Callable  # Callable prior to Python 3.7
    """
    if NEW_TYPING:
        return (tp is Callable or isinstance(tp, typingGenericAlias) and
                tp.__origin__ is collections.abc.Callable or
                isinstance(tp, type) and issubclass(tp, Generic) and
                issubclass(tp, collections.abc.Callable))
    return type(tp) is CallableMeta


def is_tuple_type(tp):
    """Test if the type is a generic tuple type, including subclasses excluding
    non-generic classes.
    Examples::

        is_tuple_type(int) == False
        is_tuple_type(tuple) == False
        is_tuple_type(Tuple) == True
        is_tuple_type(Tuple[str, int]) == True
        class MyClass(Tuple[str, int]):
            ...
        is_tuple_type(MyClass) == True

    For more general tests use issubclass(..., tuple), for more precise test
    (excluding subclasses) use::

        get_origin(tp) is tuple  # Tuple prior to Python 3.7
    """
    if NEW_TYPING:
        return (tp is Tuple or isinstance(tp, typingGenericAlias) and
                tp.__origin__ is tuple or
                isinstance(tp, type) and issubclass(tp, Generic) and
                issubclass(tp, tuple))
    return type(tp) is TupleMeta


def is_optional_type(tp):
    """Test if the type is type(None), or is a direct union with it, such as Optional[T].

    NOTE: this method inspects nested `Union` arguments but not `TypeVar` definition
    bounds and constraints. So it will return `False` if
     - `tp` is a `TypeVar` bound, or constrained to, an optional type
     - `tp` is a `Union` to a `TypeVar` bound or constrained to an optional type,
     - `tp` refers to a *nested* `Union` containing an optional type or one of the above.

    Users wishing to check for optionality in types relying on type variables might wish
    to use this method in combination with `get_constraints` and `get_bound`
    """

    if tp is type(None):  # noqa
        return True
    elif is_union_type(tp):
        return any(is_optional_type(tt) for tt in get_args(tp, evaluate=True))
    else:
        return False


def is_final_type(tp):
    """Test if the type is a final type. Examples::

        is_final_type(int) == False
        is_final_type(Final) == True
        is_final_type(Final[int]) == True
    """
    if NEW_TYPING:
        return (tp is Final or
                isinstance(tp, typingGenericAlias) and tp.__origin__ is Final)
    return WITH_FINAL and type(tp) is _Final


try:
    MaybeUnionType = types.UnionType
except AttributeError:
    MaybeUnionType = None


def is_union_type(tp):
    """Test if the type is a union type. Examples::

        is_union_type(int) == False
        is_union_type(Union) == True
        is_union_type(Union[int, int]) == False
        is_union_type(Union[T, int]) == True
        is_union_type(int | int) == False
        is_union_type(T | int) == True
    """
    if NEW_TYPING:
        return (tp is Union or
                (isinstance(tp, typingGenericAlias) and tp.__origin__ is Union) or
                (MaybeUnionType and isinstance(tp, MaybeUnionType)))
    return type(tp) is _Union


LITERALS = {Literal}
if hasattr(typing, "Literal"):
    LITERALS.add(typing.Literal)


def is_literal_type(tp):
    if NEW_TYPING:
        return (tp in LITERALS or
                isinstance(tp, typingGenericAlias) and tp.__origin__ in LITERALS)
    return WITH_LITERAL and type(tp) is type(Literal)


def is_typevar(tp):
    """Test if the type represents a type variable. Examples::

        is_typevar(int) == False
        is_typevar(T) == True
        is_typevar(Union[T, int]) == False
    """

    return type(tp) is TypeVar


def is_classvar(tp):
    """Test if the type represents a class variable. Examples::

        is_classvar(int) == False
        is_classvar(ClassVar) == True
        is_classvar(ClassVar[int]) == True
        is_classvar(ClassVar[List[T]]) == True
    """
    if NEW_TYPING:
        return (tp is ClassVar or
                isinstance(tp, typingGenericAlias) and tp.__origin__ is ClassVar)
    elif WITH_CLASSVAR:
        return type(tp) is _ClassVar
    else:
        return False


def is_new_type(tp):
    """Tests if the type represents a distinct type. Examples::

        is_new_type(int) == False
        is_new_type(NewType) == True
        is_new_type(NewType('Age', int)) == True
        is_new_type(NewType('Scores', List[Dict[str, float]])) == True
    """
    if not WITH_NEWTYPE:
        return False
    elif sys.version_info[:3] >= (3, 10, 0) and sys.version_info.releaselevel != 'beta':
        return (tp in (NewType, typing_extensions.NewType) or
                isinstance(tp, (NewType, typing_extensions.NewType)))
    elif sys.version_info[:3] >= (3, 0, 0):
        try:
            res = isinstance(tp, typing_extensions.NewType)
        except TypeError:
            pass
        else:
            if res:
                return res
        return (tp in (NewType, typing_extensions.NewType) or
                (getattr(tp, '__supertype__', None) is not None and
                 getattr(tp, '__qualname__', '') == 'NewType.<locals>.new_type' and
                 tp.__module__ in ('typing', 'typing_extensions')))
    else:  # python 2
        # __qualname__ is not available in python 2, so we simplify the test here
        return (tp is NewType or
                (getattr(tp, '__supertype__', None) is not None and
                 tp.__module__ in ('typing', 'typing_extensions')))


def is_forward_ref(tp):
    """Tests if the type is a :class:`typing.ForwardRef`. Examples::

        u = Union["Milk", Way]
        args = get_args(u)
        is_forward_ref(args[0]) == True
        is_forward_ref(args[1]) == False
    """
    if not NEW_TYPING:
        return isinstance(tp, _ForwardRef)
    return isinstance(tp, ForwardRef)


def get_last_origin(tp):
    """Get the last base of (multiply) subscripted type. Supports generic types,
    Union, Callable, and Tuple. Returns None for unsupported types.
    Examples::

        get_last_origin(int) == None
        get_last_origin(ClassVar[int]) == None
        get_last_origin(Generic[T]) == Generic
        get_last_origin(Union[T, int][str]) == Union[T, int]
        get_last_origin(List[Tuple[T, T]][int]) == List[Tuple[T, T]]
        get_last_origin(List) == List
    """
    if NEW_TYPING:
        raise ValueError('This function is only supported in Python 3.6,'
                         ' use get_origin instead')
    sentinel = object()
    origin = getattr(tp, '__origin__', sentinel)
    if origin is sentinel:
        return None
    if origin is None:
        return tp
    return origin


def get_origin(tp):
    """Get the unsubscripted version of a type. Supports generic types, Union,
    Callable, and Tuple. Returns None for unsupported types. Examples::

        get_origin(int) == None
        get_origin(ClassVar[int]) == None
        get_origin(Generic) == Generic
        get_origin(Generic[T]) == Generic
        get_origin(Union[T, int]) == Union
        get_origin(List[Tuple[T, T]][int]) == list  # List prior to Python 3.7
    """
    if NEW_TYPING:
        if isinstance(tp, typingGenericAlias):
            return tp.__origin__ if tp.__origin__ is not ClassVar else None
        if tp is Generic:
            return Generic
        return None
    if isinstance(tp, GenericMeta):
        return _gorg(tp)
    if is_union_type(tp):
        return Union
    if is_tuple_type(tp):
        return Tuple
    if is_literal_type(tp):
        if NEW_TYPING:
            return tp.__origin__ or tp
        return Literal

    return None


def get_parameters(tp):
    """Return type parameters of a parameterizable type as a tuple
    in lexicographic order. Parameterizable types are generic types,
    unions, tuple types and callable types. Examples::

        get_parameters(int) == ()
        get_parameters(Generic) == ()
        get_parameters(Union) == ()
        get_parameters(List[int]) == ()

        get_parameters(Generic[T]) == (T,)
        get_parameters(Tuple[List[T], List[S_co]]) == (T, S_co)
        get_parameters(Union[S_co, Tuple[T, T]][int, U]) == (U,)
        get_parameters(Mapping[T, Tuple[S_co, T]]) == (T, S_co)
    """
    if LEGACY_TYPING:
        # python <= 3.5.2
        if is_union_type(tp):
            params = []
            for arg in (tp.__union_params__ if tp.__union_params__ is not None else ()):
                params += get_parameters(arg)
            return tuple(params)
        elif is_tuple_type(tp):
            params = []
            for arg in (tp.__tuple_params__ if tp.__tuple_params__ is not None else ()):
                params += get_parameters(arg)
            return tuple(params)
        elif is_generic_type(tp):
            params = []
            base_params = tp.__parameters__
            if base_params is None:
                return ()
            for bp_ in base_params:
                for bp in (get_args(bp_) if is_tuple_type(bp_) else (bp_,)):
                    if _has_type_var(bp) and not isinstance(bp, TypeVar):
                        raise TypeError(
                            "Cannot inherit from a generic class "
                            "parameterized with "
                            "non-type-variable %s" % bp)
                    if params is None:
                        params = []
                    if bp not in params:
                        params.append(bp)
            if params is not None:
                return tuple(params)
            else:
                return ()
        else:
            return ()
    elif NEW_TYPING:
        if (
                (
                    isinstance(tp, typingGenericAlias) and
                    hasattr(tp, '__parameters__')
                ) or
                isinstance(tp, type) and issubclass(tp, Generic) and
                tp is not Generic):
            return tp.__parameters__
        else:
            return ()
    elif (
        is_generic_type(tp) or is_union_type(tp) or
        is_callable_type(tp) or is_tuple_type(tp)
    ):
        return tp.__parameters__ if tp.__parameters__ is not None else ()
    else:
        return ()


def get_last_args(tp):
    """Get last arguments of (multiply) subscripted type.
       Parameters for Callable are flattened. Examples::

        get_last_args(int) == ()
        get_last_args(Union) == ()
        get_last_args(ClassVar[int]) == (int,)
        get_last_args(Union[T, int]) == (T, int)
        get_last_args(Iterable[Tuple[T, S]][int, T]) == (int, T)
        get_last_args(Callable[[T], int]) == (T, int)
        get_last_args(Callable[[], int]) == (int,)
    """
    if NEW_TYPING:
        raise ValueError('This function is only supported in Python 3.6,'
                         ' use get_args instead')
    elif is_classvar(tp):
        return (tp.__type__,) if tp.__type__ is not None else ()
    elif is_generic_type(tp):
        try:
            if tp.__args__ is not None and len(tp.__args__) > 0:
                return tp.__args__
        except AttributeError:
            # python 3.5.1
            pass
        return tp.__parameters__ if tp.__parameters__ is not None else ()
    elif is_union_type(tp):
        try:
            return tp.__args__ if tp.__args__ is not None else ()
        except AttributeError:
            # python 3.5.2
            return tp.__union_params__ if tp.__union_params__ is not None else ()
    elif is_callable_type(tp):
        return tp.__args__ if tp.__args__ is not None else ()
    elif is_tuple_type(tp):
        try:
            return tp.__args__ if tp.__args__ is not None else ()
        except AttributeError:
            # python 3.5.2
            return tp.__tuple_params__ if tp.__tuple_params__ is not None else ()
    else:
        return ()


def _eval_args(args):
    """Internal helper for get_args."""
    res = []
    for arg in args:
        if not isinstance(arg, tuple):
            res.append(arg)
        elif is_callable_type(arg[0]):
            callable_args = _eval_args(arg[1:])
            if len(arg) == 2:
                res.append(Callable[[], callable_args[0]])
            elif arg[1] is Ellipsis:
                res.append(Callable[..., callable_args[1]])
            else:
                res.append(Callable[list(callable_args[:-1]), callable_args[-1]])
        else:
            res.append(type(arg[0]).__getitem__(arg[0], _eval_args(arg[1:])))
    return tuple(res)


def get_args(tp, evaluate=None):
    """Get type arguments with all substitutions performed. For unions,
    basic simplifications used by Union constructor are performed.
    On versions prior to 3.7 if `evaluate` is False (default),
    report result as nested tuple, this matches
    the internal representation of types. If `evaluate` is True
    (or if Python version is 3.7 or greater), then all
    type parameters are applied (this could be time and memory expensive).
    Examples::

        get_args(int) == ()
        get_args(Union[int, Union[T, int], str][int]) == (int, str)
        get_args(Union[int, Tuple[T, int]][str]) == (int, (Tuple, str, int))

        get_args(Union[int, Tuple[T, int]][str], evaluate=True) == \
                 (int, Tuple[str, int])
        get_args(Dict[int, Tuple[T, T]][Optional[int]], evaluate=True) == \
                 (int, Tuple[Optional[int], Optional[int]])
        get_args(Callable[[], T][int], evaluate=True) == ([], int,)
    """
    if NEW_TYPING:
        if evaluate is not None and not evaluate:
            raise ValueError('evaluate can only be True in Python >= 3.7')
        # Note special aliases on Python 3.9 don't have __args__.
        if isinstance(tp, typingGenericAlias) and hasattr(tp, '__args__'):
            res = tp.__args__
            if get_origin(tp) is collections.abc.Callable and res[0] is not Ellipsis:
                res = (list(res[:-1]), res[-1])
            return res
        if MaybeUnionType and isinstance(tp, MaybeUnionType):
            return tp.__args__
        return ()
    if is_classvar(tp) or is_final_type(tp):
        return (tp.__type__,) if tp.__type__ is not None else ()
    if is_literal_type(tp):
        return tp.__values__ or ()
    if (
        is_generic_type(tp) or is_union_type(tp) or
        is_callable_type(tp) or is_tuple_type(tp)
    ):
        try:
            tree = tp._subs_tree()
        except AttributeError:
            # Old python typing module <= 3.5.3
            if is_union_type(tp):
                # backport of union's subs_tree
                tree = _union_subs_tree(tp)
            elif is_generic_type(tp):
                # backport of GenericMeta's subs_tree
                tree = _generic_subs_tree(tp)
            elif is_tuple_type(tp):
                # ad-hoc (inspired by union)
                tree = _tuple_subs_tree(tp)
            else:
                # tree = _subs_tree(tp)
                return ()

        if isinstance(tree, tuple) and len(tree) > 1:
            if not evaluate:
                return tree[1:]
            res = _eval_args(tree[1:])
            if get_origin(tp) is Callable and res[0] is not Ellipsis:
                res = (list(res[:-1]), res[-1])
            return res

    return ()


def get_bound(tp):
    """Return the type bound to a `TypeVar` if any.

    It the type is not a `TypeVar`, a `TypeError` is raised.
    Examples::

        get_bound(TypeVar('T')) == None
        get_bound(TypeVar('T', bound=int)) == int
    """

    if is_typevar(tp):
        return getattr(tp, '__bound__', None)
    else:
        raise TypeError("type is not a `TypeVar`: " + str(tp))


def get_constraints(tp):
    """Returns the constraints of a `TypeVar` if any.

    It the type is not a `TypeVar`, a `TypeError` is raised
    Examples::

        get_constraints(TypeVar('T')) == ()
        get_constraints(TypeVar('T', int, str)) == (int, str)
    """

    if is_typevar(tp):
        return getattr(tp, '__constraints__', ())
    else:
        raise TypeError("type is not a `TypeVar`: " + str(tp))


def get_generic_type(obj):
    """Get the generic type of an object if possible, or runtime class otherwise.
    Examples::

        class Node(Generic[T]):
            ...
        type(Node[int]()) == Node
        get_generic_type(Node[int]()) == Node[int]
        get_generic_type(Node[T]()) == Node[T]
        get_generic_type(1) == int
    """

    gen_type = getattr(obj, '__orig_class__', None)
    return gen_type if gen_type is not None else type(obj)


def get_generic_bases(tp):
    """Get generic base types of a type or empty tuple if not possible.
    Example::

        class MyClass(List[int], Mapping[str, List[int]]):
            ...
        MyClass.__bases__ == (List, Mapping)
        get_generic_bases(MyClass) == (List[int], Mapping[str, List[int]])
    """
    if LEGACY_TYPING:
        return tuple(t for t in tp.__bases__ if isinstance(t, GenericMeta))
    else:
        return getattr(tp, '__orig_bases__', ())


def typed_dict_keys(td):
    """If td is a TypedDict class, return a dictionary mapping the typed keys to types.
    Otherwise, return None. Examples::

        class TD(TypedDict):
            x: int
            y: int
        class Other(dict):
            x: int
            y: int

        typed_dict_keys(TD) == {'x': int, 'y': int}
        typed_dict_keys(dict) == None
        typed_dict_keys(Other) == None
    """
    if isinstance(td, (_TypedDictMeta_Mypy, _TypedDictMeta_TE)):
        return td.__annotations__.copy()
    return None


def get_forward_arg(fr):
    """
    If fr is a ForwardRef, return the string representation of the forward reference.
    Otherwise return None. Examples::

        tp = List["FRef"]
        fr = get_args(tp)[0]
        get_forward_arg(fr) == "FRef"
        get_forward_arg(tp) == None
    """
    return fr.__forward_arg__ if is_forward_ref(fr) else None


# A few functions backported and adapted for the LEGACY_TYPING context, and used above

def _replace_arg(arg, tvars, args):
    """backport of _replace_arg"""
    if tvars is None:
        tvars = []
    # if hasattr(arg, '_subs_tree') and isinstance(arg, (GenericMeta, _TypingBase)):
    #     return arg._subs_tree(tvars, args)
    if is_union_type(arg):
        return _union_subs_tree(arg, tvars, args)
    if is_tuple_type(arg):
        return _tuple_subs_tree(arg, tvars, args)
    if is_generic_type(arg):
        return _generic_subs_tree(arg, tvars, args)
    if isinstance(arg, TypeVar):
        for i, tvar in enumerate(tvars):
            if arg == tvar:
                return args[i]
    return arg


def _remove_dups_flatten(parameters):
    """backport of _remove_dups_flatten"""

    # Flatten out Union[Union[...], ...].
    params = []
    for p in parameters:
        if isinstance(p, _Union):  # and p.__origin__ is Union:
            params.extend(p.__union_params__)  # p.__args__)
        elif isinstance(p, tuple) and len(p) > 0 and p[0] is Union:
            params.extend(p[1:])
        else:
            params.append(p)
    # Weed out strict duplicates, preserving the first of each occurrence.
    all_params = set(params)
    if len(all_params) < len(params):
        new_params = []
        for t in params:
            if t in all_params:
                new_params.append(t)
                all_params.remove(t)
        params = new_params
        assert not all_params, all_params
    # Weed out subclasses.
    # E.g. Union[int, Employee, Manager] == Union[int, Employee].
    # If object is present it will be sole survivor among proper classes.
    # Never discard type variables.
    # (In particular, Union[str, AnyStr] != AnyStr.)
    all_params = set(params)
    for t1 in params:
        if not isinstance(t1, type):
            continue
        if any(isinstance(t2, type) and issubclass(t1, t2)
               for t2 in all_params - {t1}
               if (not (isinstance(t2, GenericMeta) and
                        get_origin(t2) is not None) and
                   not isinstance(t2, TypeVar))):
            all_params.remove(t1)
    return tuple(t for t in params if t in all_params)


def _subs_tree(cls, tvars=None, args=None):
    """backport of typing._subs_tree, adapted for legacy versions """
    def _get_origin(cls):
        try:
            return cls.__origin__
        except AttributeError:
            return None

    current = _get_origin(cls)
    if current is None:
        if not is_union_type(cls) and not is_tuple_type(cls):
            return cls

    # Make of chain of origins (i.e. cls -> cls.__origin__)
    orig_chain = []
    while _get_origin(current) is not None:
        orig_chain.append(current)
        current = _get_origin(current)

    # Replace type variables in __args__ if asked ...
    tree_args = []

    def _get_args(cls):
        if is_union_type(cls):
            cls_args = cls.__union_params__
        elif is_tuple_type(cls):
            cls_args = cls.__tuple_params__
        else:
            try:
                cls_args = cls.__args__
            except AttributeError:
                cls_args = ()
        return cls_args if cls_args is not None else ()

    for arg in _get_args(cls):
        tree_args.append(_replace_arg(arg, tvars, args))
    # ... then continue replacing down the origin chain.
    for ocls in orig_chain:
        new_tree_args = []
        for arg in _get_args(ocls):
            new_tree_args.append(_replace_arg(arg, get_parameters(ocls), tree_args))
        tree_args = new_tree_args
    return tree_args


def _union_subs_tree(tp, tvars=None, args=None):
    """ backport of Union._subs_tree """
    if tp is Union:
        return Union  # Nothing to substitute
    tree_args = _subs_tree(tp, tvars, args)
    # tree_args = tp.__union_params__ if tp.__union_params__ is not None else ()
    tree_args = _remove_dups_flatten(tree_args)
    if len(tree_args) == 1:
        return tree_args[0]  # Union of a single type is that type
    return (Union,) + tree_args


def _generic_subs_tree(tp, tvars=None, args=None):
    """ backport of GenericMeta._subs_tree """
    if tp.__origin__ is None:
        return tp
    tree_args = _subs_tree(tp, tvars, args)
    return (_gorg(tp),) + tuple(tree_args)


def _tuple_subs_tree(tp, tvars=None, args=None):
    """ ad-hoc function (inspired by union) for legacy typing """
    if tp is Tuple:
        return Tuple  # Nothing to substitute
    tree_args = _subs_tree(tp, tvars, args)
    return (Tuple,) + tuple(tree_args)


def _has_type_var(t):
    if t is None:
        return False
    elif is_union_type(t):
        return _union_has_type_var(t)
    elif is_tuple_type(t):
        return _tuple_has_type_var(t)
    elif is_generic_type(t):
        return _generic_has_type_var(t)
    elif is_callable_type(t):
        return _callable_has_type_var(t)
    else:
        return False


def _union_has_type_var(tp):
    if tp.__union_params__:
        for t in tp.__union_params__:
            if _has_type_var(t):
                return True
    return False


def _tuple_has_type_var(tp):
    if tp.__tuple_params__:
        for t in tp.__tuple_params__:
            if _has_type_var(t):
                return True
    return False


def _callable_has_type_var(tp):
    if tp.__args__:
        for t in tp.__args__:
            if _has_type_var(t):
                return True
    return _has_type_var(tp.__result__)


def _generic_has_type_var(tp):
    if tp.__parameters__:
        for t in tp.__parameters__:
            if _has_type_var(t):
                return True
    return False
